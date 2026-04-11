import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import {
  CreatePropertyOwnerDto,
  CreateRentalPropertyDto,
  CreateRentalTenantDto,
  CreateRentalContractDto,
  CreateRentalPaymentDto,
  MarkPaymentDto,
  CreateContractAdjustmentDto,
  CreatePropertyExpenseDto,
  CreateOwnerLiquidationDto,
  MarkLiquidationPaidDto,
} from './dto';

function toNumber(v: any): number {
  return v instanceof Decimal ? v.toNumber() : Number(v ?? 0);
}

@Injectable()
export class RentalsService {
  constructor(private readonly prisma: PrismaService) {}

  // ================== PROPERTY OWNERS ==================

  async findAllOwners(tenantId: string) {
    const owners = await this.prisma.propertyOwner.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
      include: { properties: { select: { id: true, name: true, status: true } } },
    });
    return owners;
  }

  async findOwnerById(tenantId: string, id: string) {
    const owner = await this.prisma.propertyOwner.findFirst({
      where: { tenantId, id },
      include: {
        properties: { include: { contracts: { where: { status: 'active' }, select: { id: true, monthlyRent: true, rentalTenant: { select: { name: true } } } } } },
        liquidations: { orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }], take: 12 },
      },
    });
    if (!owner) throw new NotFoundException('Propietario no encontrado');
    return owner;
  }

  async createOwner(tenantId: string, dto: CreatePropertyOwnerDto) {
    return this.prisma.propertyOwner.create({ data: { tenantId, ...dto } });
  }

  async updateOwner(tenantId: string, id: string, dto: Partial<CreatePropertyOwnerDto>) {
    await this.findOwnerById(tenantId, id);
    return this.prisma.propertyOwner.update({ where: { id }, data: dto });
  }

  async deleteOwner(tenantId: string, id: string) {
    const owner = await this.prisma.propertyOwner.findFirst({
      where: { tenantId, id },
      include: { properties: { select: { id: true } } },
    });
    if (!owner) throw new NotFoundException('Propietario no encontrado');
    if (owner.properties.length > 0) {
      throw new BadRequestException('No se puede eliminar un propietario con propiedades asociadas');
    }
    return this.prisma.propertyOwner.delete({ where: { id } });
  }

  // ================== RENTAL PROPERTIES ==================

  async findAllProperties(tenantId: string, filters?: { ownerId?: string; status?: string }) {
    const where: any = { tenantId };
    if (filters?.ownerId) where.ownerId = filters.ownerId;
    if (filters?.status) where.status = filters.status;

    return this.prisma.rentalProperty.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        owner: { select: { id: true, name: true } },
        contracts: {
          where: { status: 'active' },
          select: { id: true, monthlyRent: true, endDate: true, rentalTenant: { select: { name: true } } },
        },
      },
    });
  }

  async findPropertyById(tenantId: string, id: string) {
    const prop = await this.prisma.rentalProperty.findFirst({
      where: { tenantId, id },
      include: {
        owner: true,
        contracts: {
          orderBy: { startDate: 'desc' },
          include: { rentalTenant: { select: { id: true, name: true, phone: true } } },
        },
        expenses: { orderBy: { date: 'desc' }, take: 20 },
      },
    });
    if (!prop) throw new NotFoundException('Propiedad no encontrada');
    return prop;
  }

  async createProperty(tenantId: string, dto: CreateRentalPropertyDto) {
    // Validate owner belongs to tenant
    const owner = await this.prisma.propertyOwner.findFirst({ where: { tenantId, id: dto.ownerId } });
    if (!owner) throw new BadRequestException('Propietario no encontrado');
    return this.prisma.rentalProperty.create({ data: { tenantId, ...dto } });
  }

  async updateProperty(tenantId: string, id: string, dto: Partial<CreateRentalPropertyDto>) {
    await this.findPropertyById(tenantId, id);
    if (dto.ownerId) {
      const owner = await this.prisma.propertyOwner.findFirst({ where: { tenantId, id: dto.ownerId } });
      if (!owner) throw new BadRequestException('Propietario no encontrado');
    }
    return this.prisma.rentalProperty.update({ where: { id }, data: dto });
  }

  async deleteProperty(tenantId: string, id: string) {
    const prop = await this.prisma.rentalProperty.findFirst({
      where: { tenantId, id },
      include: { contracts: { select: { id: true } } },
    });
    if (!prop) throw new NotFoundException('Propiedad no encontrada');
    if (prop.contracts.length > 0) {
      throw new BadRequestException('No se puede eliminar una propiedad con contratos asociados');
    }
    return this.prisma.rentalProperty.delete({ where: { id } });
  }

  // ================== RENTAL TENANTS (INQUILINOS) ==================

  async findAllTenants(tenantId: string) {
    return this.prisma.rentalTenant.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
      include: {
        contracts: {
          where: { status: 'active' },
          select: { id: true, property: { select: { name: true, address: true } } },
        },
      },
    });
  }

  async findTenantById(tenantId: string, id: string) {
    const t = await this.prisma.rentalTenant.findFirst({
      where: { tenantId, id },
      include: {
        contracts: {
          orderBy: { startDate: 'desc' },
          include: { property: { select: { id: true, name: true, address: true } } },
        },
      },
    });
    if (!t) throw new NotFoundException('Inquilino no encontrado');
    return t;
  }

  async createTenant(tenantId: string, dto: CreateRentalTenantDto) {
    return this.prisma.rentalTenant.create({ data: { tenantId, ...dto } });
  }

  async updateTenant(tenantId: string, id: string, dto: Partial<CreateRentalTenantDto>) {
    await this.findTenantById(tenantId, id);
    return this.prisma.rentalTenant.update({ where: { id }, data: dto });
  }

  async deleteTenant(tenantId: string, id: string) {
    const t = await this.prisma.rentalTenant.findFirst({
      where: { tenantId, id },
      include: { contracts: { select: { id: true } } },
    });
    if (!t) throw new NotFoundException('Inquilino no encontrado');
    if (t.contracts.length > 0) {
      throw new BadRequestException('No se puede eliminar un inquilino con contratos asociados');
    }
    return this.prisma.rentalTenant.delete({ where: { id } });
  }

  // ================== RENTAL CONTRACTS ==================

  async findAllContracts(tenantId: string, filters?: { status?: string; propertyId?: string }) {
    const where: any = { tenantId };
    if (filters?.status) where.status = filters.status;
    if (filters?.propertyId) where.propertyId = filters.propertyId;

    return this.prisma.rentalContract.findMany({
      where,
      orderBy: { startDate: 'desc' },
      include: {
        property: { select: { id: true, name: true, address: true } },
        rentalTenant: { select: { id: true, name: true, phone: true } },
      },
    });
  }

  async findContractById(tenantId: string, id: string) {
    const c = await this.prisma.rentalContract.findFirst({
      where: { tenantId, id },
      include: {
        property: { include: { owner: { select: { id: true, name: true, phone: true, cbu: true, alias: true } } } },
        rentalTenant: true,
        payments: { orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }] },
        adjustments: { orderBy: { effectiveDate: 'desc' } },
      },
    });
    if (!c) throw new NotFoundException('Contrato no encontrado');
    return c;
  }

  async createContract(tenantId: string, dto: CreateRentalContractDto) {
    // Validate property and tenant belong to this tenant
    const prop = await this.prisma.rentalProperty.findFirst({ where: { tenantId, id: dto.propertyId } });
    if (!prop) throw new BadRequestException('Propiedad no encontrada');

    const rt = await this.prisma.rentalTenant.findFirst({ where: { tenantId, id: dto.rentalTenantId } });
    if (!rt) throw new BadRequestException('Inquilino no encontrado');

    const contract = await this.prisma.rentalContract.create({
      data: { tenantId, ...dto },
    });

    // Update property status to rented
    await this.prisma.rentalProperty.update({
      where: { id: dto.propertyId },
      data: { status: 'rented' },
    });

    // Auto-generate payment periods
    await this.generatePaymentPeriods(tenantId, contract.id);

    return contract;
  }

  async updateContract(tenantId: string, id: string, dto: Partial<CreateRentalContractDto>) {
    await this.findContractById(tenantId, id);
    return this.prisma.rentalContract.update({ where: { id }, data: dto });
  }

  async terminateContract(tenantId: string, id: string) {
    const contract = await this.findContractById(tenantId, id);
    await this.prisma.$transaction([
      this.prisma.rentalContract.update({ where: { id }, data: { status: 'terminated' } }),
      this.prisma.rentalProperty.update({ where: { id: contract.propertyId }, data: { status: 'available' } }),
      // Remove future unpaid periods
      this.prisma.rentalPayment.deleteMany({
        where: { contractId: id, status: 'pending', paymentDate: null },
      }),
    ]);
    return { message: 'Contrato terminado' };
  }

  private async generatePaymentPeriods(tenantId: string, contractId: string) {
    const contract = await this.prisma.rentalContract.findUnique({ where: { id: contractId } });
    if (!contract) return;

    const start = new Date(contract.startDate);
    const end = new Date(contract.endDate);
    const payments: any[] = [];

    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    while (current <= end) {
      payments.push({
        tenantId,
        contractId,
        periodMonth: current.getMonth() + 1,
        periodYear: current.getFullYear(),
        expectedAmount: contract.monthlyRent,
        paidAmount: 0,
        coveragePercent: 0,
        status: 'pending',
      });
      current.setMonth(current.getMonth() + 1);
    }

    if (payments.length > 0) {
      await this.prisma.rentalPayment.createMany({ data: payments, skipDuplicates: true });
    }
  }

  // ================== RENTAL PAYMENTS ==================

  async findPaymentsByContract(tenantId: string, contractId: string) {
    return this.prisma.rentalPayment.findMany({
      where: { tenantId, contractId },
      orderBy: [{ periodYear: 'asc' }, { periodMonth: 'asc' }],
    });
  }

  async markPayment(tenantId: string, paymentId: string, dto: MarkPaymentDto) {
    const payment = await this.prisma.rentalPayment.findFirst({ where: { tenantId, id: paymentId } });
    if (!payment) throw new NotFoundException('Pago no encontrado');

    const newPaid = toNumber(payment.paidAmount) + dto.paidAmount;
    const expected = toNumber(payment.expectedAmount);
    const coverage = expected > 0 ? Math.min((newPaid / expected) * 100, 100) : 100;
    const status = coverage >= 100 ? 'paid' : newPaid > 0 ? 'partial' : 'pending';

    return this.prisma.rentalPayment.update({
      where: { id: paymentId },
      data: {
        paidAmount: newPaid,
        coveragePercent: coverage,
        paymentMethod: dto.paymentMethod,
        paymentDate: dto.paymentDate || new Date().toISOString(),
        receiptNumber: dto.receiptNumber,
        status,
        notes: dto.notes || payment.notes,
      },
    });
  }

  async createPayment(tenantId: string, dto: CreateRentalPaymentDto) {
    // Validate contract
    const contract = await this.prisma.rentalContract.findFirst({ where: { tenantId, id: dto.contractId } });
    if (!contract) throw new BadRequestException('Contrato no encontrado');

    const paidAmount = dto.paidAmount || 0;
    const expected = dto.expectedAmount;
    const coverage = expected > 0 ? Math.min((paidAmount / expected) * 100, 100) : 0;
    const status = coverage >= 100 ? 'paid' : paidAmount > 0 ? 'partial' : 'pending';

    return this.prisma.rentalPayment.create({
      data: {
        tenantId,
        contractId: dto.contractId,
        periodMonth: dto.periodMonth,
        periodYear: dto.periodYear,
        expectedAmount: expected,
        paidAmount,
        coveragePercent: coverage,
        paymentMethod: dto.paymentMethod,
        paymentDate: dto.paymentDate,
        receiptNumber: dto.receiptNumber,
        status,
        notes: dto.notes,
      },
    });
  }

  async getPaymentDashboard(tenantId: string, year: number, month: number) {
    const payments = await this.prisma.rentalPayment.findMany({
      where: { tenantId, periodYear: year, periodMonth: month },
      include: {
        contract: {
          select: {
            property: { select: { name: true, address: true } },
            rentalTenant: { select: { name: true } },
          },
        },
      },
      orderBy: { status: 'asc' },
    });

    const total = payments.length;
    const paid = payments.filter(p => p.status === 'paid').length;
    const partial = payments.filter(p => p.status === 'partial').length;
    const pending = payments.filter(p => p.status === 'pending').length;
    const overdue = payments.filter(p => p.status === 'overdue').length;
    const totalExpected = payments.reduce((sum, p) => sum + toNumber(p.expectedAmount), 0);
    const totalCollected = payments.reduce((sum, p) => sum + toNumber(p.paidAmount), 0);

    return {
      summary: { total, paid, partial, pending, overdue, totalExpected, totalCollected, collectionRate: totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0 },
      payments,
    };
  }

  // ================== CONTRACT ADJUSTMENTS ==================

  async createAdjustment(tenantId: string, dto: CreateContractAdjustmentDto) {
    const contract = await this.prisma.rentalContract.findFirst({ where: { tenantId, id: dto.contractId } });
    if (!contract) throw new BadRequestException('Contrato no encontrado');

    const previousAmount = toNumber(contract.monthlyRent);
    const adjustmentPercent = dto.adjustmentPercent ?? ((dto.newAmount - previousAmount) / previousAmount) * 100;

    const [adjustment] = await this.prisma.$transaction([
      this.prisma.contractAdjustment.create({
        data: {
          tenantId,
          contractId: dto.contractId,
          effectiveDate: dto.effectiveDate,
          previousAmount,
          newAmount: dto.newAmount,
          adjustmentPercent,
          indexUsed: dto.indexUsed,
          indexValue: dto.indexValue,
          isAutomatic: dto.isAutomatic || false,
          notes: dto.notes,
        },
      }),
      // Update contract monthly rent
      this.prisma.rentalContract.update({
        where: { id: dto.contractId },
        data: { monthlyRent: dto.newAmount },
      }),
      // Update future pending payments
      this.prisma.rentalPayment.updateMany({
        where: {
          contractId: dto.contractId,
          status: 'pending',
          OR: [
            { periodYear: { gt: new Date(dto.effectiveDate).getFullYear() } },
            {
              periodYear: new Date(dto.effectiveDate).getFullYear(),
              periodMonth: { gte: new Date(dto.effectiveDate).getMonth() + 1 },
            },
          ],
        },
        data: { expectedAmount: dto.newAmount },
      }),
    ]);

    return adjustment;
  }

  async findAdjustmentsByContract(tenantId: string, contractId: string) {
    return this.prisma.contractAdjustment.findMany({
      where: { tenantId, contractId },
      orderBy: { effectiveDate: 'desc' },
    });
  }

  // ================== PROPERTY EXPENSES ==================

  async findAllExpenses(tenantId: string, filters?: { propertyId?: string; contractId?: string }) {
    const where: any = { tenantId };
    if (filters?.propertyId) where.propertyId = filters.propertyId;
    if (filters?.contractId) where.contractId = filters.contractId;

    return this.prisma.propertyExpenseRecord.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        property: { select: { id: true, name: true } },
        contract: { select: { id: true, contractNumber: true } },
      },
    });
  }

  async createExpense(tenantId: string, dto: CreatePropertyExpenseDto) {
    if (dto.propertyId) {
      const prop = await this.prisma.rentalProperty.findFirst({ where: { tenantId, id: dto.propertyId } });
      if (!prop) throw new BadRequestException('Propiedad no encontrada');
    }
    return this.prisma.propertyExpenseRecord.create({ data: { tenantId, ...dto } });
  }

  async updateExpense(tenantId: string, id: string, dto: Partial<CreatePropertyExpenseDto>) {
    const exp = await this.prisma.propertyExpenseRecord.findFirst({ where: { tenantId, id } });
    if (!exp) throw new NotFoundException('Gasto no encontrado');
    return this.prisma.propertyExpenseRecord.update({ where: { id }, data: dto });
  }

  async deleteExpense(tenantId: string, id: string) {
    const exp = await this.prisma.propertyExpenseRecord.findFirst({ where: { tenantId, id } });
    if (!exp) throw new NotFoundException('Gasto no encontrado');
    if (exp.liquidationId) throw new BadRequestException('No se puede eliminar un gasto ya liquidado');
    return this.prisma.propertyExpenseRecord.delete({ where: { id } });
  }

  // ================== OWNER LIQUIDATIONS ==================

  async generateLiquidation(tenantId: string, dto: CreateOwnerLiquidationDto) {
    const owner = await this.prisma.propertyOwner.findFirst({ where: { tenantId, id: dto.ownerId } });
    if (!owner) throw new BadRequestException('Propietario no encontrado');

    // Get all active contracts for this owner's properties
    const properties = await this.prisma.rentalProperty.findMany({
      where: { tenantId, ownerId: dto.ownerId, isActive: true },
      select: { id: true, commissionType: true, commissionValue: true },
    });
    const propertyIds = properties.map(p => p.id);

    // Get payments for the period
    const payments = await this.prisma.rentalPayment.findMany({
      where: {
        tenantId,
        periodMonth: dto.periodMonth,
        periodYear: dto.periodYear,
        contract: { propertyId: { in: propertyIds } },
        status: { in: ['paid', 'partial'] },
      },
      include: { contract: { select: { propertyId: true, commissionType: true, commissionValue: true } } },
    });

    const grossCollected = payments.reduce((sum, p) => sum + toNumber(p.paidAmount), 0);

    // Calculate commission per contract
    let totalCommission = 0;
    for (const payment of payments) {
      const c = payment.contract;
      const paid = toNumber(payment.paidAmount);
      if (c.commissionType === 'percentage') {
        totalCommission += paid * (toNumber(c.commissionValue) / 100);
      } else {
        totalCommission += toNumber(c.commissionValue);
      }
    }

    // Get deductible expenses for the period
    const expenses = await this.prisma.propertyExpenseRecord.findMany({
      where: {
        tenantId,
        propertyId: { in: propertyIds },
        deductFromLiquidation: true,
        liquidationId: null,
        date: {
          gte: new Date(dto.periodYear, dto.periodMonth - 1, 1),
          lt: new Date(dto.periodYear, dto.periodMonth, 1),
        },
      },
    });
    const expensesAmount = expenses.reduce((sum, e) => sum + toNumber(e.amount), 0);

    const netToPay = grossCollected - totalCommission - expensesAmount;

    // Upsert liquidation
    const liquidation = await this.prisma.ownerLiquidation.upsert({
      where: {
        tenantId_ownerId_periodMonth_periodYear: {
          tenantId,
          ownerId: dto.ownerId,
          periodMonth: dto.periodMonth,
          periodYear: dto.periodYear,
        },
      },
      create: {
        tenantId,
        ownerId: dto.ownerId,
        periodMonth: dto.periodMonth,
        periodYear: dto.periodYear,
        grossCollected,
        commissionAmount: totalCommission,
        expensesAmount,
        netToPay,
        notes: dto.notes,
      },
      update: {
        grossCollected,
        commissionAmount: totalCommission,
        expensesAmount,
        netToPay,
        status: 'draft',
        notes: dto.notes,
      },
    });

    // Link expenses to this liquidation
    if (expenses.length > 0) {
      await this.prisma.propertyExpenseRecord.updateMany({
        where: { id: { in: expenses.map(e => e.id) } },
        data: { liquidationId: liquidation.id },
      });
    }

    return liquidation;
  }

  async findLiquidationsByOwner(tenantId: string, ownerId: string) {
    return this.prisma.ownerLiquidation.findMany({
      where: { tenantId, ownerId },
      orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
      include: { expenses: true },
    });
  }

  async findLiquidationById(tenantId: string, id: string) {
    const liq = await this.prisma.ownerLiquidation.findFirst({
      where: { tenantId, id },
      include: {
        owner: true,
        expenses: { include: { property: { select: { name: true } } } },
      },
    });
    if (!liq) throw new NotFoundException('Liquidación no encontrada');
    return liq;
  }

  async markLiquidationPaid(tenantId: string, id: string, dto: MarkLiquidationPaidDto) {
    const liq = await this.prisma.ownerLiquidation.findFirst({ where: { tenantId, id } });
    if (!liq) throw new NotFoundException('Liquidación no encontrada');
    return this.prisma.ownerLiquidation.update({
      where: { id },
      data: { status: 'paid', paidAt: new Date(), notes: dto.notes || liq.notes },
    });
  }

  // ================== STATS ==================

  async getStats(tenantId: string) {
    const [owners, properties, activeContracts, tenants] = await Promise.all([
      this.prisma.propertyOwner.count({ where: { tenantId, isActive: true } }),
      this.prisma.rentalProperty.count({ where: { tenantId, isActive: true } }),
      this.prisma.rentalContract.count({ where: { tenantId, status: 'active' } }),
      this.prisma.rentalTenant.count({ where: { tenantId, isActive: true } }),
    ]);

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const monthPayments = await this.prisma.rentalPayment.findMany({
      where: { tenantId, periodMonth: currentMonth, periodYear: currentYear },
    });

    const totalExpected = monthPayments.reduce((s, p) => s + toNumber(p.expectedAmount), 0);
    const totalCollected = monthPayments.reduce((s, p) => s + toNumber(p.paidAmount), 0);
    const pendingPayments = monthPayments.filter(p => p.status === 'pending' || p.status === 'overdue').length;

    // Contracts expiring in next 60 days
    const in60Days = new Date();
    in60Days.setDate(in60Days.getDate() + 60);
    const expiringContracts = await this.prisma.rentalContract.count({
      where: { tenantId, status: 'active', endDate: { lte: in60Days } },
    });

    return {
      owners,
      properties,
      activeContracts,
      tenants,
      currentMonth: {
        expected: totalExpected,
        collected: totalCollected,
        collectionRate: totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0,
        pending: pendingPayments,
      },
      expiringContracts,
    };
  }

  // ================== UPCOMING ADJUSTMENTS ==================

  async getUpcomingAdjustments(tenantId: string) {
    const contracts = await this.prisma.rentalContract.findMany({
      where: {
        tenantId,
        status: 'active',
        adjustmentIndex: { notIn: ['none'] },
      },
      include: {
        adjustments: { orderBy: { effectiveDate: 'desc' }, take: 1 },
        property: { select: { name: true, address: true } },
        rentalTenant: { select: { name: true } },
      },
    });

    const today = new Date();
    const results: any[] = [];

    for (const c of contracts) {
      if (!c.adjustmentIndex) continue;
      const freq = c.adjustmentFrequency || 12;
      const lastAdj = c.adjustments[0];
      const refDate = lastAdj ? new Date(lastAdj.effectiveDate) : new Date(c.startDate);
      const nextDate = new Date(refDate);
      nextDate.setMonth(nextDate.getMonth() + freq);

      const daysUntil = Math.ceil((nextDate.getTime() - today.getTime()) / 86400000);

      results.push({
        contractId: c.id,
        contractNumber: c.contractNumber,
        property: c.property?.address || c.property?.name || '-',
        tenant: c.rentalTenant?.name || '-',
        currentRent: toNumber(c.monthlyRent),
        currency: c.currency,
        adjustmentIndex: c.adjustmentIndex,
        frequency: freq,
        lastAdjustmentDate: lastAdj ? lastAdj.effectiveDate : null,
        nextAdjustmentDate: nextDate,
        daysUntilAdjustment: daysUntil,
        lastAmount: lastAdj ? toNumber(lastAdj.newAmount) : toNumber(c.monthlyRent),
      });
    }

    return results.sort((a, b) => a.daysUntilAdjustment - b.daysUntilAdjustment);
  }
}
