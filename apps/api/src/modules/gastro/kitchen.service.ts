import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CreateKitchenStationDto,
  UpdateKitchenStationDto,
  BulkAssignStationDto,
} from './dto/kitchen-station.dto';

@Injectable()
export class KitchenService {
  private readonly logger = new Logger(KitchenService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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
        waiterName: waiterName || null,
        timestamp: comanda.createdAt.toISOString(),
      });

      this.logger.log(
        `Comanda created: ${comanda.id} → station "${station.name}" (${stationItemList.length} items) mesa=${tableNumber}`,
      );
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

  async getComandasBySession(tenantId: string, tableSessionId: string) {
    return this.prisma.kitchenComanda.findMany({
      where: { tenantId, tableSessionId },
      include: { station: { select: { id: true, name: true, displayName: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getPendingComandas(tenantId: string, stationId?: string) {
    return this.prisma.kitchenComanda.findMany({
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
      waiterName: null,
      timestamp: new Date().toISOString(),
      isReprint: true,
    });

    return { reprinted: true };
  }

  // ========== PRINT AGENT AUTH ==========

  async validateAgentToken(agentToken: string) {
    // Agent token is stored in tenant.settings.gastroConfig.agentToken
    const tenants = await this.prisma.tenant.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, slug: true, settings: true },
    });

    for (const tenant of tenants) {
      try {
        const settings = typeof tenant.settings === 'string'
          ? JSON.parse(tenant.settings)
          : tenant.settings;
        if (settings?.gastroConfig?.agentToken === agentToken) {
          return { tenantId: tenant.id, tenantName: tenant.name, slug: tenant.slug };
        }
      } catch {}
    }

    return null;
  }

  async generateAgentToken(tenantId: string): Promise<string> {
    const crypto = await import('crypto');
    const token = crypto.randomBytes(24).toString('hex'); // 48 chars

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });

    const settings = typeof tenant?.settings === 'string'
      ? JSON.parse(tenant.settings)
      : (tenant?.settings || {});

    if (!settings.gastroConfig) settings.gastroConfig = {};
    settings.gastroConfig.agentToken = token;

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { settings: JSON.stringify(settings) },
    });

    return token;
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

  async getKitchenStats(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pending, preparing, ready, total, avgTime] = await Promise.all([
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
    ]);

    let avgMinutes = 0;
    if (avgTime.length > 0) {
      const totalMs = avgTime.reduce((sum, c) => {
        return sum + ((c.readyAt?.getTime() || 0) - c.createdAt.getTime());
      }, 0);
      avgMinutes = Math.round(totalMs / avgTime.length / 60000);
    }

    return { pending, preparing, ready, total, avgMinutes };
  }
}
