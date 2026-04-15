import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CreateKitchenStationDto,
  UpdateKitchenStationDto,
  BulkAssignStationDto,
} from './dto/kitchen-station.dto';

export interface PrintAgentAuthResult {
  agentId: string;
  tenantId: string;
  tenantName: string;
  slug: string;
  jwt: string;
}

@Injectable()
export class KitchenService {
  private readonly logger = new Logger(KitchenService.name);
  private readonly agentJwtExpiresIn: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // Long-lived JWT for service-style auth. Env override allowed.
    this.agentJwtExpiresIn =
      this.configService.get<string>('PRINT_AGENT_JWT_EXPIRES_IN') || '30d';
  }

  // ========== SETTINGS HELPERS ==========
  // Tenant.settings is a String column storing JSON. Centralize parsing so
  // future migration to a Json column only touches these two helpers.
  private parseTenantSettings(raw: unknown): Record<string, any> {
    if (!raw) return {};
    if (typeof raw === 'object') return raw as Record<string, any>;
    try {
      return JSON.parse(raw as string) || {};
    } catch {
      return {};
    }
  }

  private serializeTenantSettings(settings: Record<string, any>): string {
    return JSON.stringify(settings);
  }

  // ========== STATION MANAGEMENT ==========

  async getStations(tenantId: string) {
    return this.prisma.kitchenStation.findMany({
      where: { tenantId },
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { products: true, comandas: true } },
      },
    });
  }

  async createStation(tenantId: string, dto: CreateKitchenStationDto) {
    const count = await this.prisma.kitchenStation.count({ where: { tenantId } });

    return this.prisma.kitchenStation.create({
      data: {
        tenantId,
        name: dto.name,
        displayName: dto.displayName,
        printerId: dto.printerId,
        printerName: dto.printerName,
        order: count,
      },
    });
  }

  async updateStation(tenantId: string, stationId: string, dto: UpdateKitchenStationDto) {
    const station = await this.prisma.kitchenStation.findFirst({
      where: { id: stationId, tenantId },
    });
    if (!station) throw new NotFoundException('Estación no encontrada');

    return this.prisma.kitchenStation.update({
      where: { id: stationId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.displayName !== undefined && { displayName: dto.displayName }),
        ...(dto.printerId !== undefined && { printerId: dto.printerId }),
        ...(dto.printerName !== undefined && { printerName: dto.printerName }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
    });
  }

  async deleteStation(tenantId: string, stationId: string) {
    const station = await this.prisma.kitchenStation.findFirst({
      where: { id: stationId, tenantId },
    });
    if (!station) throw new NotFoundException('Estación no encontrada');

    // Unassign products from this station
    await this.prisma.product.updateMany({
      where: { kitchenStationId: stationId },
      data: { kitchenStationId: null },
    });

    await this.prisma.kitchenStation.delete({ where: { id: stationId } });
    return { deleted: true };
  }

  // ========== PRODUCT-STATION ASSIGNMENT ==========

  async bulkAssignProducts(tenantId: string, dto: BulkAssignStationDto) {
    const ops = dto.assignments.map((a) =>
      this.prisma.product.updateMany({
        where: { id: a.productId, tenantId },
        data: { kitchenStationId: a.kitchenStationId },
      }),
    );
    await this.prisma.$transaction(ops);
    return { updated: dto.assignments.length };
  }

  async getProductStationMap(tenantId: string) {
    const products = await this.prisma.product.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, name: true, kitchenStationId: true, categoryId: true },
    });
    return products;
  }

  // ========== COMANDA CREATION (called from GastroService.addOrder) ==========

  async createComandasForOrder(
    tenantId: string,
    tableSessionId: string,
    tableNumber: number,
    orderId: string,
    orderNumber: number,
    items: { productId: string; name: string; quantity: number; price: number; options?: any; notes?: string }[],
    waiterName?: string,
  ) {
    // Check if tenant has kitchen stations configured
    const stations = await this.prisma.kitchenStation.findMany({
      where: { tenantId, isActive: true },
    });

    if (stations.length === 0) {
      // No stations = no comandas, system works as before
      return [];
    }

    // Get product-to-station mapping
    const productIds = items.map((i) => i.productId).filter(Boolean);
    const products = productIds.length > 0
      ? await this.prisma.product.findMany({
          where: { id: { in: productIds }, tenantId },
          select: { id: true, kitchenStationId: true },
        })
      : [];

    const productStationMap = new Map(products.map((p) => [p.id, p.kitchenStationId]));

    // Default station = first active station (fallback for unassigned products)
    const defaultStation = stations[0];

    // Group items by station
    const stationItems = new Map<string, typeof items>();

    for (const item of items) {
      const stationId = productStationMap.get(item.productId) || defaultStation.id;
      if (!stationItems.has(stationId)) {
        stationItems.set(stationId, []);
      }
      stationItems.get(stationId)!.push(item);
    }

    // Build full order context: all items with their station name, for cross-station visibility
    const fullOrderItems = items.map((i) => {
      const sid = productStationMap.get(i.productId) || defaultStation.id;
      const st = stations.find((s) => s.id === sid) || defaultStation;
      return {
        name: i.name,
        quantity: i.quantity,
        notes: i.notes || null,
        options: i.options || null,
        stationName: st.displayName || st.name,
      };
    });

    // Create one comanda per station
    const comandas = [];
    for (const [stationId, stationItemList] of stationItems) {
      const station = stations.find((s) => s.id === stationId) || defaultStation;

      const comanda = await this.prisma.kitchenComanda.create({
        data: {
          tenantId,
          stationId,
          tableSessionId,
          tableSessionOrderId: orderId,
          tableNumber,
          orderNumber,
          items: stationItemList.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            notes: i.notes || null,
            options: i.options || null,
          })),
          status: 'PENDING',
        },
      });

      comandas.push(comanda);

      // Emit event for WebSocket → print agent
      // `items` = what THIS station must prepare (highlighted on ticket)
      // `fullOrderItems` = entire order for context (other stations' items shown smaller)
      this.eventEmitter.emit('gastro.comanda.created', {
        tenantId,
        comandaId: comanda.id,
        stationId,
        stationName: station.displayName || station.name,
        printerId: station.printerId,
        tableNumber,
        orderNumber,
        items: stationItemList.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          notes: i.notes || null,
          options: i.options || null,
        })),
        fullOrderItems,
        waiterName: waiterName || null,
        timestamp: comanda.createdAt.toISOString(),
      });

      this.logger.log(
        `Comanda created: ${comanda.id} → station "${station.name}" (${stationItemList.length} items) mesa=${tableNumber}`,
      );

      if (!station.printerId) {
        this.logger.warn(
          `Station "${station.name}" (${station.id}) has no printerId linked — print agent will fall back to its first available printer. Link a printer in the dashboard to make routing deterministic.`,
        );
      }
    }

    return comandas;
  }

  // ========== COMANDA STATUS MANAGEMENT ==========

  async updateComandaStatus(tenantId: string, comandaId: string, status: string) {
    const comanda = await this.prisma.kitchenComanda.findFirst({
      where: { id: comandaId, tenantId },
      include: { station: true },
    });
    if (!comanda) throw new NotFoundException('Comanda no encontrada');

    const validTransitions: Record<string, string[]> = {
      PENDING: ['PRINTED', 'PRINT_FAILED', 'ACCEPTED', 'CANCELLED'],
      PRINTED: ['ACCEPTED', 'CANCELLED'],
      PRINT_FAILED: ['PENDING', 'PRINTED', 'CANCELLED'],
      ACCEPTED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY', 'CANCELLED'],
      READY: [],
      CANCELLED: [],
    };

    const allowed = validTransitions[comanda.status] || [];
    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `No se puede cambiar de ${comanda.status} a ${status}`,
      );
    }

    const updateData: any = { status };

    switch (status) {
      case 'PRINTED':
        updateData.printedAt = new Date();
        updateData.printAttempts = comanda.printAttempts + 1;
        break;
      case 'PRINT_FAILED':
        updateData.printAttempts = comanda.printAttempts + 1;
        break;
      case 'ACCEPTED':
        updateData.acceptedAt = new Date();
        break;
      case 'PREPARING':
        updateData.startedAt = new Date();
        break;
      case 'READY':
        updateData.readyAt = new Date();
        break;
      case 'CANCELLED':
        updateData.cancelledAt = new Date();
        break;
    }

    const updated = await this.prisma.kitchenComanda.update({
      where: { id: comandaId },
      data: updateData,
      include: { station: true },
    });

    // Emit events for dashboard + print agent
    if (status === 'READY') {
      this.eventEmitter.emit('gastro.comanda.ready', {
        tenantId,
        comandaId,
        tableNumber: comanda.tableNumber,
        stationName: comanda.station.displayName || comanda.station.name,
        items: comanda.items,
      });
    }

    if (status === 'PRINT_FAILED') {
      this.eventEmitter.emit('gastro.comanda.printFailed', {
        tenantId,
        comandaId,
        stationName: comanda.station.displayName || comanda.station.name,
        printerId: comanda.station.printerId,
        error: 'Print failed',
      });
    }

    return updated;
  }

  async getComandasByOrderIds(tenantId: string, orderIds: string[]) {
    if (orderIds.length === 0) return [];
    return this.prisma.kitchenComanda.findMany({
      where: { tenantId, tableSessionOrderId: { in: orderIds } },
      include: {
        station: { select: { id: true, name: true, displayName: true } },
      },
    });
  }

  async getComandasBySession(tenantId: string, tableSessionId: string) {
    return this.prisma.kitchenComanda.findMany({
      where: { tenantId, tableSessionId },
      include: { station: { select: { id: true, name: true, displayName: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Persist the printers the agent discovered locally. The dashboard reads
   * this list to populate the printer-per-station dropdown.
   */
  async updateAgentPrinters(
    agentId: string | undefined,
    printers: any[],
  ): Promise<void> {
    if (!agentId) return;

    // Normalize to a stable shape regardless of what the agent sends
    const normalized = printers
      .map((p) => {
        if (typeof p === 'string') return { id: p, name: p, type: 'unknown', online: true };
        return {
          id: p?.id || p?.name || '',
          name: p?.name || p?.id || '',
          type: p?.type || 'unknown',
          address: p?.address || null,
          online: p?.online !== false,
        };
      })
      .filter((p) => p.id);

    await this.prisma.printAgent.update({
      where: { id: agentId },
      data: {
        detectedPrinters: normalized as any,
        printersUpdatedAt: new Date(),
      },
    });

    this.logger.log(
      `PrintAgent ${agentId} persisted ${normalized.length} printer(s): ${normalized.map((p) => p.name).join(', ') || '(none)'}`,
    );
  }

  /**
   * Returns all printers detected by active agents for a tenant.
   * Merges printer lists from all agents (multi-PC support ready).
   */
  async getAvailablePrinters(tenantId: string) {
    const agents = await this.prisma.printAgent.findMany({
      where: { tenantId, isActive: true },
      select: {
        id: true,
        name: true,
        detectedPrinters: true,
        printersUpdatedAt: true,
        lastSeenAt: true,
      },
    });

    const printers: {
      id: string;
      name: string;
      type: string;
      address: string | null;
      online: boolean;
      agentId: string;
      agentName: string;
      lastReported: string | null;
    }[] = [];

    for (const agent of agents) {
      const detected = Array.isArray(agent.detectedPrinters)
        ? (agent.detectedPrinters as any[])
        : [];
      for (const p of detected) {
        printers.push({
          id: p.id,
          name: p.name,
          type: p.type || 'unknown',
          address: p.address || null,
          online: p.online !== false,
          agentId: agent.id,
          agentName: agent.name,
          lastReported: agent.printersUpdatedAt?.toISOString() || null,
        });
      }
    }

    return printers;
  }

  // In-memory queue for test prints (ephemeral, no DB row needed).
  // Key: tenantId, Value: array of test print payloads waiting for agent poll.
  private testPrintQueue = new Map<string, any[]>();

  /**
   * Queues a test print for the next agent poll. Also emits via WebSocket
   * in case the agent is connected that way.
   */
  async sendTestPrint(tenantId: string, stationId: string) {
    const station = await this.prisma.kitchenStation.findFirst({
      where: { id: stationId, tenantId },
    });
    if (!station) throw new NotFoundException('Estación no encontrada');
    if (!station.printerId) {
      throw new BadRequestException(
        'Esta estación no tiene impresora asignada. Asigná una impresora primero.',
      );
    }

    const payload = {
      comandaId: `test-${Date.now()}`,
      stationId: station.id,
      stationName: station.displayName || station.name,
      printerId: station.printerId,
      tableNumber: 0,
      orderNumber: 0,
      items: [
        { name: '*** TICKET DE PRUEBA ***', quantity: 1, notes: `Estación: ${station.name}` },
        { name: `Impresora: ${station.printerName || station.printerId}`, quantity: 1, notes: null },
      ],
      waiterName: 'Sistema',
      timestamp: new Date().toISOString(),
    };

    // Queue for HTTP polling pickup
    if (!this.testPrintQueue.has(tenantId)) {
      this.testPrintQueue.set(tenantId, []);
    }
    this.testPrintQueue.get(tenantId)!.push(payload);

    // Auto-expire after 60s to avoid memory leak
    setTimeout(() => {
      const queue = this.testPrintQueue.get(tenantId);
      if (queue) {
        const idx = queue.indexOf(payload);
        if (idx !== -1) queue.splice(idx, 1);
        if (queue.length === 0) this.testPrintQueue.delete(tenantId);
      }
    }, 60_000);

    // Also emit via WebSocket (in case agent is connected that way)
    this.eventEmitter.emit('gastro.comanda.created', {
      tenantId,
      ...payload,
      isTestPrint: true,
    });

    this.logger.log(`Test print queued for station "${station.name}" → printer ${station.printerId}`);

    return { sent: true, stationName: station.name, printerId: station.printerId };
  }

  /**
   * Drains and returns any pending test prints for a tenant.
   * Called by the /printer-agent/pending endpoint.
   */
  drainTestPrints(tenantId: string): any[] {
    const queue = this.testPrintQueue.get(tenantId);
    if (!queue || queue.length === 0) return [];
    const items = [...queue];
    queue.length = 0;
    this.testPrintQueue.delete(tenantId);
    return items;
  }

  private static readonly MAX_PRINT_ATTEMPTS = 5;

  async getPendingComandas(tenantId: string, stationId?: string) {
    const comandas = await this.prisma.kitchenComanda.findMany({
      where: {
        tenantId,
        status: { in: ['PENDING', 'PRINT_FAILED'] },
        ...(stationId && { stationId }),
      },
      include: {
        station: { select: { id: true, name: true, displayName: true, printerId: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Auto-fail comandas that exceeded max print attempts
    const failed: string[] = [];
    const pending = comandas.filter((c) => {
      if (c.printAttempts >= KitchenService.MAX_PRINT_ATTEMPTS) {
        failed.push(c.id);
        return false;
      }
      return true;
    });

    if (failed.length > 0) {
      await this.prisma.kitchenComanda.updateMany({
        where: { id: { in: failed } },
        data: {
          status: 'PRINT_FAILED',
          printError: `Auto-failed after ${KitchenService.MAX_PRINT_ATTEMPTS} attempts`,
        },
      });
      for (const id of failed) {
        const c = comandas.find((x) => x.id === id);
        if (c) {
          this.eventEmitter.emit('gastro.comanda.printFailed', {
            tenantId,
            comandaId: id,
            stationName: c.station?.displayName || c.station?.name || '',
            printerId: c.station?.printerId,
            error: `Auto-failed after ${KitchenService.MAX_PRINT_ATTEMPTS} attempts`,
          });
        }
      }
      this.logger.warn(
        `Auto-failed ${failed.length} comanda(s) after ${KitchenService.MAX_PRINT_ATTEMPTS} print attempts`,
      );
    }

    return pending;
  }

  /**
   * Bump printAttempts for comandas being dispatched to the agent via HTTP poll.
   * After MAX_PRINT_ATTEMPTS the next getPendingComandas call will auto-fail them.
   */
  async incrementPrintAttempts(comandaIds: string[]): Promise<void> {
    if (comandaIds.length === 0) return;
    // Raw query for atomic increment without race conditions
    await this.prisma.$executeRawUnsafe(
      `UPDATE kitchen_comandas SET "printAttempts" = "printAttempts" + 1, "updatedAt" = NOW() WHERE id = ANY($1::uuid[])`,
      comandaIds,
    );
  }

  async reprintComanda(tenantId: string, comandaId: string) {
    const comanda = await this.prisma.kitchenComanda.findFirst({
      where: { id: comandaId, tenantId },
      include: { station: true },
    });
    if (!comanda) throw new NotFoundException('Comanda no encontrada');

    // Reset to PENDING for reprint
    await this.prisma.kitchenComanda.update({
      where: { id: comandaId },
      data: { status: 'PENDING', printError: null },
    });

    // Get full order context (all sibling comandas for the same order)
    const siblings = await this.getComandasByOrderIds(tenantId, [comanda.tableSessionOrderId]);
    const fullOrderItems = siblings.flatMap((sib) => {
      const sitems = Array.isArray(sib.items) ? (sib.items as any[]) : [];
      const stName = sib.station?.displayName || sib.station?.name || '';
      return sitems.map((item: any) => ({ ...item, stationName: stName }));
    });

    // Re-emit the comanda event
    this.eventEmitter.emit('gastro.comanda.created', {
      tenantId,
      comandaId: comanda.id,
      stationId: comanda.stationId,
      stationName: comanda.station.displayName || comanda.station.name,
      printerId: comanda.station.printerId,
      tableNumber: comanda.tableNumber,
      orderNumber: comanda.orderNumber,
      items: comanda.items,
      fullOrderItems,
      waiterName: null,
      timestamp: new Date().toISOString(),
      isReprint: true,
    });

    return { reprinted: true };
  }

  // ========== PRINT AGENT AUTH ==========

  /**
   * Mints a long-lived JWT for a print agent. The JWT is verified by
   * PrintAgentGuard (HTTP) and by the WebSocket gateway on `printer:join`.
   */
  async signAgentJwt(agentId: string, tenantId: string): Promise<string> {
    return this.jwtService.signAsync(
      { sub: agentId, tenantId, type: 'printer-agent' },
      { expiresIn: this.agentJwtExpiresIn },
    );
  }

  /**
   * Validates a pairing token from a Tauri print agent.
   *
   * Resolution order (scalable + backward compatible):
   *  1. Fast O(1) lookup on PrintAgent.token (unique index).
   *  2. Legacy fallback: scan Tenant.settings.gastroConfig.agentToken, and
   *     if found, auto-migrate the token into the PrintAgent table so the
   *     next call hits path (1).
   *
   * Returns a payload including a freshly minted JWT the agent will use
   * for subsequent HTTP / WebSocket auth.
   */
  async validateAgentToken(
    agentToken: string,
    meta?: { ip?: string | null; version?: string | null },
  ): Promise<PrintAgentAuthResult | null> {
    if (!agentToken || typeof agentToken !== 'string') return null;

    // Path 1: indexed lookup
    const agent = await this.prisma.printAgent.findUnique({
      where: { token: agentToken },
      include: {
        tenant: { select: { id: true, name: true, slug: true, status: true } },
      },
    });

    if (agent) {
      if (!agent.isActive || agent.tenant.status !== 'ACTIVE') return null;

      await this.prisma.printAgent.update({
        where: { id: agent.id },
        data: {
          lastSeenAt: new Date(),
          ...(meta?.ip && { lastIp: meta.ip }),
          ...(meta?.version && { version: meta.version }),
        },
      });

      const jwt = await this.signAgentJwt(agent.id, agent.tenantId);
      return {
        agentId: agent.id,
        tenantId: agent.tenantId,
        tenantName: agent.tenant.name,
        slug: agent.tenant.slug,
        jwt,
      };
    }

    // Path 2: legacy fallback — scan tenants with settings containing this token.
    // Uses Postgres string contains to avoid loading every tenant.
    const legacyTenants = await this.prisma.tenant.findMany({
      where: {
        status: 'ACTIVE',
        settings: { contains: agentToken },
      },
      select: { id: true, name: true, slug: true, settings: true },
      take: 5,
    });

    for (const tenant of legacyTenants) {
      const settings = this.parseTenantSettings(tenant.settings);
      if (settings?.gastroConfig?.agentToken !== agentToken) continue;

      // Auto-migrate: create PrintAgent row so next auth is indexed.
      const migrated = await this.prisma.printAgent.create({
        data: {
          tenantId: tenant.id,
          name: 'Print Agent (migrated)',
          token: agentToken,
          lastSeenAt: new Date(),
          ...(meta?.ip && { lastIp: meta.ip }),
          ...(meta?.version && { version: meta.version }),
        },
      });

      this.logger.log(
        `Migrated legacy print agent token for tenant ${tenant.id} → PrintAgent ${migrated.id}`,
      );

      const jwt = await this.signAgentJwt(migrated.id, tenant.id);
      return {
        agentId: migrated.id,
        tenantId: tenant.id,
        tenantName: tenant.name,
        slug: tenant.slug,
        jwt,
      };
    }

    return null;
  }

  /**
   * Generates a new PrintAgent pairing token for a tenant. Returns both the
   * raw token (shown once to the user for pairing) and the agentId.
   *
   * Also writes the token to tenant.settings.gastroConfig.agentToken for
   * backward compatibility with any already-running legacy agents that read
   * it out of band. New agents should not rely on this path.
   */
  async generateAgentToken(
    tenantId: string,
    name?: string,
  ): Promise<{ token: string; agentId: string }> {
    const crypto = await import('crypto');
    const token = crypto.randomBytes(24).toString('hex'); // 48 chars

    const agent = await this.prisma.printAgent.create({
      data: {
        tenantId,
        name: name || 'Print Agent',
        token,
      },
    });

    // Legacy write (backward compatible for agents that still read settings)
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });
    const settings = this.parseTenantSettings(tenant?.settings);
    if (!settings.gastroConfig) settings.gastroConfig = {};
    settings.gastroConfig.agentToken = token;
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { settings: this.serializeTenantSettings(settings) },
    });

    return { token, agentId: agent.id };
  }

  /**
   * Lists PrintAgents for a tenant (dashboard visibility: last seen, online, etc.)
   */
  async listAgents(tenantId: string) {
    return this.prisma.printAgent.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        isActive: true,
        lastSeenAt: true,
        lastIp: true,
        version: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Revoke (soft delete) a PrintAgent — immediately invalidates its JWT
   * because PrintAgentGuard checks isActive on every request.
   */
  async revokeAgent(tenantId: string, agentId: string) {
    const agent = await this.prisma.printAgent.findFirst({
      where: { id: agentId, tenantId },
    });
    if (!agent) throw new NotFoundException('Print agent no encontrado');

    await this.prisma.printAgent.update({
      where: { id: agentId },
      data: { isActive: false },
    });
    return { revoked: true };
  }

  // ========== PRINTER STATUS ==========

  async updatePrinterStatus(
    tenantId: string,
    printers: { id: string; name: string; type: string; address?: string; online: boolean }[],
  ) {
    // Update stations with matching printerIds
    for (const printer of printers) {
      await this.prisma.kitchenStation.updateMany({
        where: { tenantId, printerId: printer.id },
        data: { printerName: printer.name },
      });
    }

    // Emit to dashboard
    this.eventEmitter.emit('gastro.printer.status', {
      tenantId,
      printers,
    });
  }

  // ========== KITCHEN STATS ==========

  /**
   * Count of active products that are NOT assigned to any kitchen station.
   * These silently fall back to the first station in createComandasForOrder;
   * surfacing the number lets the dashboard warn the user.
   */
  async getOrphanProductsCount(tenantId: string): Promise<number> {
    const stationCount = await this.prisma.kitchenStation.count({
      where: { tenantId, isActive: true },
    });
    if (stationCount === 0) return 0; // feature not configured — no orphans

    return this.prisma.product.count({
      where: { tenantId, isActive: true, kitchenStationId: null },
    });
  }

  /**
   * Active kitchen stations that have no `printerId` linked. The print agent
   * handles this gracefully (falls back to its first available printer), but
   * we surface the list so the dashboard can prompt the user to link a
   * specific printer before they grow to 2+ printers and the fallback stops
   * being deterministic.
   */
  async getStationsWithoutPrinter(
    tenantId: string,
  ): Promise<{ id: string; name: string; displayName: string | null }[]> {
    return this.prisma.kitchenStation.findMany({
      where: { tenantId, isActive: true, printerId: null },
      select: { id: true, name: true, displayName: true },
      orderBy: { name: 'asc' },
    });
  }

  async getKitchenStats(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      pending,
      preparing,
      ready,
      total,
      avgTime,
      orphanProducts,
      stationsWithoutPrinter,
    ] = await Promise.all([
      this.prisma.kitchenComanda.count({
        where: { tenantId, status: { in: ['PENDING', 'PRINTED', 'ACCEPTED'] }, createdAt: { gte: today } },
      }),
      this.prisma.kitchenComanda.count({
        where: { tenantId, status: 'PREPARING', createdAt: { gte: today } },
      }),
      this.prisma.kitchenComanda.count({
        where: { tenantId, status: 'READY', createdAt: { gte: today } },
      }),
      this.prisma.kitchenComanda.count({
        where: { tenantId, createdAt: { gte: today } },
      }),
      // Average time from creation to ready (in minutes)
      this.prisma.kitchenComanda.findMany({
        where: { tenantId, status: 'READY', readyAt: { not: null }, createdAt: { gte: today } },
        select: { createdAt: true, readyAt: true },
        take: 100,
        orderBy: { createdAt: 'desc' },
      }),
      this.getOrphanProductsCount(tenantId),
      this.getStationsWithoutPrinter(tenantId),
    ]);

    let avgMinutes = 0;
    if (avgTime.length > 0) {
      const totalMs = avgTime.reduce((sum, c) => {
        return sum + ((c.readyAt?.getTime() || 0) - c.createdAt.getTime());
      }, 0);
      avgMinutes = Math.round(totalMs / avgTime.length / 60000);
    }

    return {
      pending,
      preparing,
      ready,
      total,
      avgMinutes,
      orphanProducts,
      stationsWithoutPrinter,
    };
  }
}
