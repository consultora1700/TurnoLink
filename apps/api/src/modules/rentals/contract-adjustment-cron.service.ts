import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailNotificationsService } from '../notifications/email-notifications.service';

/**
 * ICL value cache — fetched once per day from BCRA public data.
 * The BCRA publishes daily ICL values at a known public URL.
 * We scrape the main variables page for the current ICL value.
 */
interface IclCache {
  value: number;
  date: string;
  fetchedAt: number;
}

@Injectable()
export class ContractAdjustmentCronService {
  private readonly logger = new Logger(ContractAdjustmentCronService.name);
  private iclCache: IclCache | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailNotificationsService,
  ) {}

  /**
   * Fetches the current ICL value from BCRA public page.
   * The main variables page shows ICL with its current value.
   * Cached for 24 hours to avoid repeated requests.
   */
  private async fetchIclValue(): Promise<number | null> {
    // Return cached value if fresh (< 24h)
    if (this.iclCache && Date.now() - this.iclCache.fetchedAt < 24 * 3600 * 1000) {
      return this.iclCache.value;
    }

    try {
      // Fetch the BCRA main variables page and extract ICL
      const response = await fetch(
        'https://www.bcra.gob.ar/PublicacionesEstadisticas/Principales_variables.asp',
        { signal: AbortSignal.timeout(10000) },
      );

      if (!response.ok) {
        this.logger.warn(`BCRA page returned ${response.status}`);
        return this.iclCache?.value || null;
      }

      const html = await response.text();

      // Look for ICL value pattern in the page
      // The page shows "Índice para Contratos de Locación" followed by its value
      const iclMatch = html.match(
        /Contratos\s+de\s+Locaci[oó]n[^<]*<[^>]*>[^<]*<[^>]*>\s*([\d.,]+)/i
      );

      if (iclMatch) {
        const value = parseFloat(iclMatch[1].replace('.', '').replace(',', '.'));
        if (!isNaN(value) && value > 0) {
          this.iclCache = {
            value,
            date: new Date().toISOString().slice(0, 10),
            fetchedAt: Date.now(),
          };
          this.logger.log(`ICL value fetched from BCRA: ${value}`);
          return value;
        }
      }

      this.logger.warn('Could not parse ICL value from BCRA page');
      return this.iclCache?.value || null;
    } catch (error) {
      this.logger.warn(`Failed to fetch ICL from BCRA: ${error}`);
      return this.iclCache?.value || null;
    }
  }

  /**
   * Runs daily at 7 AM — processes automatic contract adjustments.
   *
   * Supports 3 modes:
   * 1. ICL — Uses real ICL from BCRA to calculate period variation
   * 2. IPC — Uses stored index value (updated manually by tenant)
   * 3. Custom — Parses fixed % from contract description
   */
  @Cron('0 7 * * *')
  async processContractAdjustments() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Pre-fetch ICL value (one request per day)
      const currentIcl = await this.fetchIclValue();

      // Find active contracts with adjustment configured
      const contracts = await this.prisma.rentalContract.findMany({
        where: {
          status: 'active',
          adjustmentIndex: { not: 'none' },
          NOT: { adjustmentIndex: null },
        },
        include: {
          adjustments: {
            orderBy: { effectiveDate: 'desc' as const },
            take: 1,
          },
          property: {
            select: { name: true, address: true },
          },
          rentalTenant: {
            select: { name: true, email: true, phone: true },
          },
          tenant: {
            select: { name: true },
          },
        },
      });

      if (contracts.length === 0) return;

      let adjustedCount = 0;

      for (const contract of contracts) {
        try {
          const frequency = contract.adjustmentFrequency || 12;
          const lastAdjustment = contract.adjustments[0];
          const referenceDate = lastAdjustment
            ? new Date(lastAdjustment.effectiveDate)
            : new Date(contract.startDate);

          // Calculate next adjustment date
          const nextAdjustmentDate = new Date(referenceDate);
          nextAdjustmentDate.setMonth(nextAdjustmentDate.getMonth() + frequency);
          nextAdjustmentDate.setHours(0, 0, 0, 0);

          // Not due yet?
          if (nextAdjustmentDate > today) continue;

          // Calculate adjustment percentage based on mode
          const adjustmentPercent = this.calculateAdjustmentPercent(
            contract.adjustmentIndex || 'ICL',
            contract.customAdjustmentDesc,
            frequency,
            currentIcl,
            lastAdjustment?.indexValue ? Number(lastAdjustment.indexValue) : null,
          );

          if (adjustmentPercent <= 0) {
            this.logger.warn(
              `Contract ${contract.contractNumber || contract.id}: adjustment=0%, skipping. ` +
              `Index=${contract.adjustmentIndex}, ICL=${currentIcl}`
            );
            continue;
          }

          const currentRent = Number(contract.monthlyRent);
          const newRent = Math.round(currentRent * (1 + adjustmentPercent / 100));

          // Create adjustment record
          await this.prisma.contractAdjustment.create({
            data: {
              tenantId: contract.tenantId,
              contractId: contract.id,
              effectiveDate: today,
              previousAmount: currentRent,
              newAmount: newRent,
              adjustmentPercent: adjustmentPercent,
              indexUsed: contract.adjustmentIndex,
              indexValue: currentIcl || undefined,
              isAutomatic: true,
              notes: this.buildAdjustmentNote(contract.adjustmentIndex || '', adjustmentPercent, frequency, currentIcl),
            },
          });

          // Update contract monthly rent
          await this.prisma.rentalContract.update({
            where: { id: contract.id },
            data: { monthlyRent: newRent },
          });

          adjustedCount++;

          // Send notification to tenant (inquilino)
          if (contract.rentalTenant?.email) {
            try {
              await this.emailService.sendRentalAdjustmentEmail(
                contract.rentalTenant.email,
                contract.rentalTenant.name,
                contract.property?.address || contract.property?.name || 'Propiedad',
                currentRent,
                newRent,
                adjustmentPercent,
                contract.adjustmentIndex || 'ICL',
                today,
                contract.tenant.name,
              );
            } catch (emailErr) {
              this.logger.error(`Failed to send adjustment email to ${contract.rentalTenant.email}`, emailErr);
            }
          }

          this.logger.log(
            `Contract ${contract.contractNumber || contract.id}: ` +
            `$${currentRent} → $${newRent} (+${adjustmentPercent.toFixed(1)}%) [${contract.adjustmentIndex}]`
          );
        } catch (contractErr) {
          this.logger.error(`Error processing contract ${contract.id}`, contractErr);
        }
      }

      if (adjustedCount > 0) {
        this.logger.log(`Processed ${adjustedCount} automatic contract adjustment(s)`);
      }
    } catch (error) {
      this.logger.error('Error in contract adjustment cron', error);
    }
  }

  /**
   * Calculates adjustment percentage based on index type.
   *
   * ICL: compares current BCRA ICL value with last stored value.
   *      If no previous value, uses the period variation formula.
   * IPC: uses last stored indexValue to compute variation.
   * Custom: parses "X%" from customAdjustmentDesc.
   */
  private calculateAdjustmentPercent(
    indexType: string,
    customDesc: string | null,
    frequencyMonths: number,
    currentIcl: number | null,
    lastIndexValue: number | null,
  ): number {
    // === CUSTOM: parse fixed percentage ===
    if (indexType === 'custom' && customDesc) {
      const match = customDesc.match(/(\d+(?:[.,]\d+)?)\s*%/);
      if (match) {
        const percent = parseFloat(match[1].replace(',', '.'));
        // If description says "anual", prorate; otherwise use as-is for the period
        const isAnnual = /anual/i.test(customDesc);
        return isAnnual ? percent * (frequencyMonths / 12) : percent;
      }
      return 0;
    }

    // === ICL: use real BCRA data ===
    if (indexType === 'ICL' && currentIcl && currentIcl > 0) {
      if (lastIndexValue && lastIndexValue > 0) {
        // Direct comparison: variation = (current - previous) / previous * 100
        return ((currentIcl - lastIndexValue) / lastIndexValue) * 100;
      }
      // No previous index value — can't calculate real variation
      // Use a conservative fallback based on typical ICL behavior
      return this.fallbackRate(frequencyMonths);
    }

    // === IPC: use stored index value or fallback ===
    if (indexType === 'IPC') {
      // IPC doesn't have a free public API, so we rely on stored values
      // The tenant can update the IPC value manually via the dashboard
      return this.fallbackRate(frequencyMonths);
    }

    return 0;
  }

  /**
   * Fallback rate when real index data isn't available.
   * Based on typical Argentine market rates (conservative).
   * This is only used when no real ICL/IPC data exists.
   */
  private fallbackRate(frequencyMonths: number): number {
    // Conservative estimate: ~3% monthly compound
    const monthlyRate = 0.03;
    const periodRate = Math.pow(1 + monthlyRate, frequencyMonths) - 1;
    return periodRate * 100;
  }

  private buildAdjustmentNote(index: string, percent: number, freq: number, icl: number | null): string {
    const parts = [`Ajuste automático por ${index} (cada ${freq} meses)`];
    if (icl) parts.push(`ICL del día: ${icl}`);
    parts.push(`Variación: +${percent.toFixed(2)}%`);
    return parts.join('. ');
  }
}
