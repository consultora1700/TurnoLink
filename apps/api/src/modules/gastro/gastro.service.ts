import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TableSessionStatus, Prisma } from '@prisma/client';
import { CreateTableSessionDto } from './dto/create-table-session.dto';
import { CreateSessionOrderDto } from './dto/create-session-order.dto';
import { TipPaymentDto, TipType } from './dto/tip-payment.dto';
import { MercadoPagoService } from '../mercadopago/mercadopago.service';
import { pickRandomPickupWord } from '../orders/pickup-words';
import { FinanceService } from '../finance/finance.service';
import { KitchenService } from './kitchen.service';

@Injectable()
export class GastroService {
  private readonly logger = new Logger(GastroService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly configService: ConfigService,
    private readonly financeService: FinanceService,
    private readonly kitchenService: KitchenService,
  ) {}

  // ========== TABLE SESSION MANAGEMENT ==========

  async openSession(dto: CreateTableSessionDto) {
    // Check if table already has an active session
    const existing = await this.prisma.tableSession.findFirst({
      where: {
        tenantId: dto.tenantId,
        tableNumber: dto.tableNumber,
        status: { notIn: ['PAID', 'CLOSED'] },
      },
    });

    if (existing) {
      // Session exists — require the session word to join
      return {
        requiresWord: true,
        sessionId: existing.id,
        tableNumber: existing.tableNumber,
        status: existing.status,
      };
    }

    // Check if pre-assigned waiter mode — auto-assign waiter
    let waiterId: string | undefined;
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: dto.tenantId },
        select: { settings: true },
      });
      const settings = JSON.parse(tenant?.settings || '{}');
      const gc = settings.gastroConfig || {};
      if (gc.waiterAssignment === 'pre-assigned' && gc.tableAssignments) {
        // tableAssignments: { [tableNumber]: employeeId }
        const assignedWaiterId = gc.tableAssignments[String(dto.tableNumber)];
        if (assignedWaiterId) {
          // Verify employee exists and is active
          const emp = await this.prisma.employee.findFirst({
            where: { id: assignedWaiterId, tenantId: dto.tenantId, isActive: true, deletedAt: null },
          });
          if (emp) waiterId = assignedWaiterId;
        }
      }
    } catch {}

    const sessionWord = pickRandomPickupWord();
    const session = await this.prisma.tableSession.create({
      data: {
        tenantId: dto.tenantId,
        tableNumber: dto.tableNumber,
        status: 'OCCUPIED',
        sessionWord,
        ...(waiterId ? { waiterId } : {}),
      },
      include: { orders: true, waiter: { select: { id: true, name: true } } },
    });

    this.eventEmitter.emit('gastro.session.opened', {
      tenantId: dto.tenantId,
      sessionId: session.id,
      tableNumber: dto.tableNumber,
    });

    return session;
  }

  async joinSession(sessionId: string, word: string) {
    const session = await this.prisma.tableSession.findUnique({
      where: { id: sessionId },
    });
    if (!session || session.status === 'PAID' || session.status === 'CLOSED') {
      throw new NotFoundException('Sesión no encontrada');
    }
    if (!session.sessionWord || session.sessionWord !== word.trim().toUpperCase()) {
      throw new BadRequestException('Palabra incorrecta');
    }
    return this.getSessionWithOrders(sessionId);
  }

  async getSession(sessionId: string) {
    return this.getSessionWithOrders(sessionId);
  }

  async getSessionWithOrders(sessionId: string) {
    const session = await this.prisma.tableSession.findUnique({
      where: { id: sessionId },
      include: {
        orders: { orderBy: { orderNumber: 'asc' } },
        tenant: { select: { settings: true } },
      },
    });

    if (!session) {
      throw new NotFoundException('Sesión de mesa no encontrada');
    }

    // Extract farewell config from tenant settings
    let farewellConfig: any = null;
    try {
      const settings = JSON.parse(session.tenant?.settings || '{}');
      if (settings.gastroConfig) {
        farewellConfig = {
          farewellMessage: settings.gastroConfig.farewellMessage || null,
          farewellIncentive: settings.gastroConfig.farewellIncentive || null,
          collectEmail: settings.gastroConfig.collectEmail ?? true,
        };
      }
    } catch {}

    const { tenant, ...sessionData } = session;
    return { ...sessionData, farewellConfig };
  }

  // ========== ORDER MANAGEMENT ==========

  async addOrder(sessionId: string, dto: CreateSessionOrderDto) {
    const session = await this.prisma.tableSession.findUnique({
      where: { id: sessionId },
      include: { orders: true, waiter: { select: { name: true } } },
    });

    if (!session) {
      throw new NotFoundException('Sesión de mesa no encontrada');
    }

    if (['PAID', 'CLOSED'].includes(session.status)) {
      throw new BadRequestException('La mesa ya fue cerrada');
    }

    if (session.status === 'PAYMENT_ENABLED') {
      throw new BadRequestException('El pago ya fue habilitado, no se pueden agregar más pedidos');
    }

    const subtotal = dto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const nextOrderNumber = session.orders.length + 1;

    const [order] = await this.prisma.$transaction([
      this.prisma.tableSessionOrder.create({
        data: {
          tableSessionId: sessionId,
          orderNumber: nextOrderNumber,
          items: dto.items as any,
          subtotal: new Prisma.Decimal(subtotal),
          status: 'PENDING',
        },
      }),
      this.prisma.tableSession.update({
        where: { id: sessionId },
        data: { status: 'ORDERING' },
      }),
    ]);

    this.eventEmitter.emit('gastro.order.placed', {
      tenantId: session.tenantId,
      sessionId,
      tableNumber: session.tableNumber,
      orderId: order.id,
      orderNumber: nextOrderNumber,
      subtotal,
    });

    // Create kitchen comandas (non-blocking — if kitchen stations are configured)
    this.kitchenService
      .createComandasForOrder(
        session.tenantId,
        sessionId,
        session.tableNumber,
        order.id,
        nextOrderNumber,
        dto.items,
        (session as any).waiter?.name,
      )
      .catch((err) => {
        this.logger.error(`Failed to create kitchen comandas: ${err.message}`);
      });

    return order;
  }

  // ========== ORDER STATUS MANAGEMENT ==========

  async markOrderDelivered(sessionId: string, orderId: string) {
    const session = await this.prisma.tableSession.findUnique({
      where: { id: sessionId },
      include: { orders: true },
    });

    if (!session) {
      throw new NotFoundException('Sesión de mesa no encontrada');
    }

    const order = session.orders.find(o => o.id === orderId);
    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    await this.prisma.tableSessionOrder.update({
      where: { id: orderId },
      data: { status: 'DELIVERED' },
    });

    // Check if ALL orders are now delivered
    const allDelivered = session.orders.every(
      o => o.id === orderId || o.status === 'DELIVERED',
    );

    this.eventEmitter.emit('gastro.order.delivered', {
      tenantId: session.tenantId,
      sessionId,
      tableNumber: session.tableNumber,
      orderId,
      allDelivered,
    });

    return { orderId, allDelivered };
  }

  async updateOrderStatus(sessionId: string, orderId: string, status: string) {
    const session = await this.prisma.tableSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Sesión de mesa no encontrada');
    }

    const updated = await this.prisma.tableSessionOrder.update({
      where: { id: orderId },
      data: { status },
    });

    return updated;
  }

  // ========== BILL & PAYMENT FLOW ==========

  async requestBill(sessionId: string) {
    const session = await this.prisma.tableSession.findUnique({
      where: { id: sessionId },
      include: { orders: true },
    });

    if (!session) {
      throw new NotFoundException('Sesión de mesa no encontrada');
    }

    if (session.orders.length === 0) {
      throw new BadRequestException('No hay pedidos en esta mesa');
    }

    if (['BILL_REQUESTED', 'PAYMENT_ENABLED', 'PAID', 'CLOSED'].includes(session.status)) {
      throw new BadRequestException('La cuenta ya fue solicitada');
    }

    const totalAmount = session.orders.reduce(
      (sum, order) => sum + Number(order.subtotal),
      0,
    );

    const updated = await this.prisma.tableSession.update({
      where: { id: sessionId },
      data: {
        status: 'BILL_REQUESTED',
        totalAmount: new Prisma.Decimal(totalAmount),
      },
      include: { orders: { orderBy: { orderNumber: 'asc' } } },
    });

    this.eventEmitter.emit('gastro.bill.requested', {
      tenantId: session.tenantId,
      sessionId,
      tableNumber: session.tableNumber,
      totalAmount,
    });

    return updated;
  }

  async getBill(sessionId: string) {
    const session = await this.prisma.tableSession.findUnique({
      where: { id: sessionId },
      include: { orders: { orderBy: { orderNumber: 'asc' } } },
    });

    if (!session) {
      throw new NotFoundException('Sesión de mesa no encontrada');
    }

    const totalAmount = session.orders.reduce(
      (sum, order) => sum + Number(order.subtotal),
      0,
    );

    // Parse tenant gastroConfig for tip options
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: { settings: true },
    });

    let tipOptions = [10, 15, 20];
    try {
      const settings = JSON.parse(tenant?.settings || '{}');
      if (settings.gastroConfig?.tipOptions) {
        tipOptions = settings.gastroConfig.tipOptions;
      }
    } catch {}

    return {
      session,
      totalAmount,
      tipOptions,
      paymentEnabled: session.status === 'PAYMENT_ENABLED',
    };
  }

  async enablePayment(sessionId: string) {
    const session = await this.prisma.tableSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Sesión de mesa no encontrada');
    }

    if (session.status !== 'BILL_REQUESTED') {
      throw new BadRequestException(
        'Solo se puede habilitar el pago cuando la cuenta fue solicitada',
      );
    }

    const updated = await this.prisma.tableSession.update({
      where: { id: sessionId },
      data: { status: 'PAYMENT_ENABLED' },
      include: { orders: { orderBy: { orderNumber: 'asc' } } },
    });

    this.eventEmitter.emit('gastro.payment.enabled', {
      tenantId: session.tenantId,
      sessionId,
      tableNumber: session.tableNumber,
    });

    return updated;
  }

  async processPayment(sessionId: string, dto: TipPaymentDto) {
    const session = await this.prisma.tableSession.findUnique({
      where: { id: sessionId },
      include: { orders: true },
    });

    if (!session) {
      throw new NotFoundException('Sesión de mesa no encontrada');
    }

    if (session.status !== 'PAYMENT_ENABLED' && session.status !== 'WAITING_PAYMENT') {
      throw new BadRequestException('El pago aún no fue habilitado por el mozo');
    }

    const totalAmount = session.orders.reduce(
      (sum, order) => sum + Number(order.subtotal),
      0,
    );

    let tipAmount = 0;
    if (dto.tipType === TipType.PERCENTAGE && dto.tipValue) {
      tipAmount = totalAmount * (dto.tipValue / 100);
    } else if (dto.tipType === TipType.FIXED && dto.tipValue) {
      tipAmount = dto.tipValue;
    }

    const grandTotal = totalAmount + tipAmount;

    // Cash & Card: DON'T close the session — just save tip info and notify the dashboard.
    // The mozo will close the table after collecting payment in person.
    if (dto.paymentMethod === 'cash' || dto.paymentMethod === 'card') {
      const updated = await this.prisma.tableSession.update({
        where: { id: sessionId },
        data: {
          status: 'WAITING_PAYMENT',
          totalAmount: new Prisma.Decimal(totalAmount),
          tipAmount: new Prisma.Decimal(tipAmount),
          tipType: dto.tipType,
        },
        include: { orders: { orderBy: { orderNumber: 'asc' } } },
      });

      // Notify dashboard: customer chose cash/card — mozo needs to go collect
      this.eventEmitter.emit('gastro.payment.requested', {
        tenantId: session.tenantId,
        sessionId,
        tableNumber: session.tableNumber,
        totalAmount,
        tipAmount,
        grandTotal,
        paymentMethod: dto.paymentMethod,
      });

      return {
        ...updated,
        grandTotal,
        tipAmount,
        paymentMethod: dto.paymentMethod,
        waitingCollection: true,
      };
    }

    // Mercado Pago: create a real checkout preference so the comensal can pay from their phone
    if (dto.paymentMethod === 'mercadopago') {
      // Save tip info
      await this.prisma.tableSession.update({
        where: { id: sessionId },
        data: {
          totalAmount: new Prisma.Decimal(totalAmount),
          tipAmount: new Prisma.Decimal(tipAmount),
          tipType: dto.tipType,
        },
      });

      // Try to create MP preference — fall back to mozo-collection if tenant has no MP connected
      let paymentUrl: string | null = null;
      try {
        const accessToken = await this.mercadoPagoService.getAccessToken(session.tenantId);

        const tenant = await this.prisma.tenant.findUnique({
          where: { id: session.tenantId },
          select: { name: true, slug: true, logo: true },
        });

        const credential = await this.prisma.mercadoPagoCredential.findUnique({
          where: { tenantId: session.tenantId },
          select: { isSandbox: true },
        });

        const appUrl = this.configService.get<string>('APP_URL') || 'https://turnolink.com.ar';
        const apiUrl = this.configService.get<string>('API_URL') || 'https://api.turnolink.com.ar';
        const slug = tenant?.slug || '';

        // Single item with business name + photo — clean, warm checkout experience
        const businessName = tenant?.name || 'Restaurante';

        const mpItems = [
          {
            title: `${businessName}`,
            description: `Gracias por tu visita`,
            quantity: 1,
            unit_price: Math.round(grandTotal * 100) / 100,
            currency_id: 'ARS',
            ...(tenant?.logo ? { picture_url: tenant.logo } : {}),
          },
        ];

        const externalReference = `gastro_session_${sessionId}_${Date.now()}`;
        const mesaUrl = `${appUrl}/${slug}/mesa/${session.tableNumber}`;

        const preferenceData = {
          items: mpItems,
          back_urls: {
            success: `${mesaUrl}?payment=success`,
            failure: `${mesaUrl}?payment=failure`,
            pending: `${mesaUrl}?payment=pending`,
          },
          auto_return: 'approved',
          external_reference: externalReference,
          notification_url: `${apiUrl}/api/mercadopago/webhook`,
          expires: true,
          expiration_date_from: new Date().toISOString(),
          expiration_date_to: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
          ...(tenant?.name ? {
            statement_descriptor: tenant.name.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 22).trim(),
          } : {}),
        };

        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(preferenceData),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`MP API error: ${error}`);
        }

        const preference = await response.json();

        // Store the externalReference in the session paymentId field for webhook lookup
        await this.prisma.tableSession.update({
          where: { id: sessionId },
          data: { paymentId: externalReference },
        });

        paymentUrl = credential?.isSandbox ? preference.sandbox_init_point : preference.init_point;
        this.logger.log(`MP preference created for gastro session ${sessionId}: ${preference.id}`);
      } catch (err: any) {
        this.logger.warn(`MP preference failed for session ${sessionId}: ${err.message}. Falling back to mozo collection.`);
      }

      const updated = await this.prisma.tableSession.update({
        where: { id: sessionId },
        data: { status: 'WAITING_PAYMENT' },
        include: { orders: { orderBy: { orderNumber: 'asc' } } },
      });

      this.eventEmitter.emit('gastro.payment.requested', {
        tenantId: session.tenantId,
        sessionId,
        tableNumber: session.tableNumber,
        totalAmount,
        tipAmount,
        grandTotal,
        paymentMethod: 'mercadopago',
      });

      return {
        ...updated,
        grandTotal,
        tipAmount,
        paymentMethod: 'mercadopago',
        paymentUrl,
        waitingCollection: !paymentUrl,
      };
    }

    // Fallback: unknown method — treat as cash
    throw new BadRequestException('Método de pago no reconocido');
  }

  // ========== DASHBOARD (PRIVATE / MOZO) ==========

  async getDashboardTables(tenantId: string) {
    // Get tenant gastroConfig for table count
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });

    let tableCount = 0;
    try {
      const settings = JSON.parse(tenant?.settings || '{}');
      tableCount = settings.gastroConfig?.tableCount || 0;
    } catch {}

    // Get all active sessions
    const activeSessions = await this.prisma.tableSession.findMany({
      where: {
        tenantId,
        status: { notIn: ['CLOSED'] },
      },
      include: {
        orders: { orderBy: { orderNumber: 'asc' } },
        waiter: { select: { id: true, name: true } },
      },
      orderBy: { tableNumber: 'asc' },
    });

    // Get employees (mozos) for this tenant
    const employees = await this.prisma.employee.findMany({
      where: { tenantId, isActive: true, deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    // Parse waiter assignment mode + table assignments
    let waiterAssignment = 'dynamic'; // default
    let tableAssignments: Record<string, string> = {};
    try {
      const s = JSON.parse(tenant?.settings || '{}');
      waiterAssignment = s.gastroConfig?.waiterAssignment || 'dynamic';
      tableAssignments = s.gastroConfig?.tableAssignments || {};
    } catch {}

    // Build table map
    const sessionMap = new Map<number, any>();
    for (const session of activeSessions) {
      sessionMap.set(session.tableNumber, session);
    }

    // Generate full table list
    const tables = [];
    for (let i = 1; i <= Math.max(tableCount, ...Array.from(sessionMap.keys())); i++) {
      const session = sessionMap.get(i);
      if (session) {
        const totalAmount = session.orders.reduce(
          (sum: number, order: any) => sum + Number(order.subtotal),
          0,
        );
        tables.push({
          tableNumber: i,
          status: session.status,
          sessionId: session.id,
          orderCount: session.orders.length,
          totalAmount,
          openedAt: session.openedAt,
          orders: session.orders,
          review: session.review || null,
          tipAmount: session.tipAmount ? Number(session.tipAmount) : 0,
          waiterId: session.waiterId || null,
          waiterName: session.waiter?.name || null,
          sessionWord: session.sessionWord || null,
        });
      } else {
        tables.push({
          tableNumber: i,
          status: 'FREE',
          sessionId: null,
          orderCount: 0,
          totalAmount: 0,
          openedAt: null,
          orders: [],
        });
      }
    }

    // Calculate today's revenue from ALL sessions (including closed)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todaySessions = await this.prisma.tableSession.findMany({
      where: {
        tenantId,
        status: { in: ['PAID', 'CLOSED'] },
        updatedAt: { gte: todayStart, lte: todayEnd },
      },
      select: { totalAmount: true, tipAmount: true },
    });

    const todayRevenue = todaySessions.reduce(
      (sum, s) => sum + Number(s.totalAmount || 0) + Number(s.tipAmount || 0),
      0,
    );
    const todaySessionCount = todaySessions.length;

    // Week revenue
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekSessions = await this.prisma.tableSession.findMany({
      where: {
        tenantId,
        status: { in: ['PAID', 'CLOSED'] },
        updatedAt: { gte: weekStart, lte: todayEnd },
      },
      select: { totalAmount: true, tipAmount: true },
    });

    const weekRevenue = weekSessions.reduce(
      (sum, s) => sum + Number(s.totalAmount || 0) + Number(s.tipAmount || 0),
      0,
    );
    const weekSessionCount = weekSessions.length;

    // Month revenue
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthSessions = await this.prisma.tableSession.findMany({
      where: {
        tenantId,
        status: { in: ['PAID', 'CLOSED'] },
        updatedAt: { gte: monthStart, lte: todayEnd },
      },
      select: { totalAmount: true, tipAmount: true },
    });

    const monthRevenue = monthSessions.reduce(
      (sum, s) => sum + Number(s.totalAmount || 0) + Number(s.tipAmount || 0),
      0,
    );
    const monthSessionCount = monthSessions.length;

    // Recent reviews
    const recentReviews = await this.prisma.tableSession.findMany({
      where: {
        tenantId,
        review: { not: null },
      },
      select: { review: true, tableNumber: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    return {
      tables,
      tableCount,
      employees,
      waiterAssignment,
      tableAssignments,
      stats: {
        todayRevenue,
        todaySessionCount,
        weekRevenue,
        weekSessionCount,
        monthRevenue,
        monthSessionCount,
        recentReviews,
      },
    };
  }

  async updateSessionStatus(sessionId: string, status: TableSessionStatus) {
    const session = await this.prisma.tableSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Sesión de mesa no encontrada');
    }

    const data: any = { status };
    if (status === 'CLOSED') {
      data.closedAt = new Date();
    }

    const updated = await this.prisma.tableSession.update({
      where: { id: sessionId },
      data,
      include: { orders: { orderBy: { orderNumber: 'asc' } } },
    });

    this.eventEmitter.emit('gastro.session.statusChanged', {
      tenantId: session.tenantId,
      sessionId,
      tableNumber: session.tableNumber,
      status,
    });

    // When marked as PAID, emit the paid event and register income in finance system
    if (status === 'PAID') {
      this.eventEmitter.emit('gastro.session.paid', {
        tenantId: session.tenantId,
        sessionId,
        tableNumber: session.tableNumber,
        totalAmount: Number(session.totalAmount || 0),
        tipAmount: Number(session.tipAmount || 0),
      });

      // Register income in finance module
      await this.registerGastroIncome(session.tenantId, session.tableNumber, Number(session.totalAmount || 0), Number(session.tipAmount || 0));
    }

    return updated;
  }

  async closeTable(tenantId: string, tableNumber: number) {
    const session = await this.prisma.tableSession.findFirst({
      where: {
        tenantId,
        tableNumber,
        status: { notIn: ['CLOSED'] },
      },
    });

    if (!session) {
      throw new NotFoundException('No hay sesión activa en esta mesa');
    }

    // If session had a pending payment (cash/card), register income before closing
    if (session.totalAmount && Number(session.totalAmount) > 0 && session.status !== 'PAID') {
      await this.registerGastroIncome(
        tenantId,
        tableNumber,
        Number(session.totalAmount),
        Number(session.tipAmount || 0),
      );
    }

    const updated = await this.prisma.tableSession.update({
      where: { id: session.id },
      data: { status: 'CLOSED', closedAt: new Date() },
    });

    this.eventEmitter.emit('gastro.session.closed', {
      tenantId,
      sessionId: session.id,
      tableNumber,
    });

    return updated;
  }

  async addItemManually(sessionId: string, dto: CreateSessionOrderDto) {
    // Same as addOrder but bypasses status checks for mozo
    const session = await this.prisma.tableSession.findUnique({
      where: { id: sessionId },
      include: { orders: true },
    });

    if (!session) {
      throw new NotFoundException('Sesión de mesa no encontrada');
    }

    if (['PAID', 'CLOSED'].includes(session.status)) {
      throw new BadRequestException('La mesa ya fue cerrada');
    }

    const subtotal = dto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const nextOrderNumber = session.orders.length + 1;

    const order = await this.prisma.tableSessionOrder.create({
      data: {
        tableSessionId: sessionId,
        orderNumber: nextOrderNumber,
        items: dto.items as any,
        subtotal: new Prisma.Decimal(subtotal),
        status: 'CONFIRMED',
      },
    });

    // If bill was already requested, recalculate total
    if (session.status === 'BILL_REQUESTED' || session.status === 'PAYMENT_ENABLED') {
      const allOrders = await this.prisma.tableSessionOrder.findMany({
        where: { tableSessionId: sessionId },
      });
      const newTotal = allOrders.reduce(
        (sum, o) => sum + Number(o.subtotal),
        0,
      );
      await this.prisma.tableSession.update({
        where: { id: sessionId },
        data: { totalAmount: new Prisma.Decimal(newTotal) },
      });
    }

    this.eventEmitter.emit('gastro.order.placed', {
      tenantId: session.tenantId,
      sessionId,
      tableNumber: session.tableNumber,
      orderId: order.id,
      orderNumber: nextOrderNumber,
      subtotal,
      addedByStaff: true,
    });

    return order;
  }

  // ========== MENU ==========

  async getMenu(tenantId: string, mode: string = 'dine_in') {
    const products = await this.prisma.product.findMany({
      where: { tenantId, isActive: true },
      include: {
        images: { orderBy: { order: 'asc' } },
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });

    return products.map((product) => {
      let displayPrice = Number(product.price);

      if (mode === 'delivery' && product.priceDelivery) {
        displayPrice = Number(product.priceDelivery);
      } else if (mode === 'takeaway' && product.priceTakeaway) {
        displayPrice = Number(product.priceTakeaway);
      }

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        price: displayPrice,
        basePrice: Number(product.price),
        image: product.images[0]?.url || null,
        images: product.images.map((img) => img.url),
        attributes: product.attributes,
        category: product.category,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
      };
    });
  }

  // ========== QR CODES ==========

  async getQrData(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { slug: true, settings: true },
    });

    if (!tenant) {
      throw new NotFoundException('Negocio no encontrado');
    }

    let tableCount = 0;
    try {
      const settings = JSON.parse(tenant.settings || '{}');
      tableCount = settings.gastroConfig?.tableCount || 0;
    } catch {}

    const tables = [];
    for (let i = 1; i <= tableCount; i++) {
      tables.push({
        tableNumber: i,
        url: `https://turnolink.com.ar/${tenant.slug}/mesa/${i}`,
      });
    }

    return { slug: tenant.slug, tableCount, tables };
  }

  // ========== REVIEWS ==========

  async submitReview(sessionId: string, review: string) {
    const session = await this.prisma.tableSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Sesión de mesa no encontrada');
    }

    await this.prisma.tableSession.update({
      where: { id: sessionId },
      data: { review: review.trim().substring(0, 2000) },
    });

    this.logger.log(`Review submitted for session ${sessionId} (Mesa ${session.tableNumber})`);
    return { success: true };
  }

  async collectEmail(sessionId: string, email: string, name?: string) {
    const session = await this.prisma.tableSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Sesión de mesa no encontrada');
    }

    await this.prisma.tableSession.update({
      where: { id: sessionId },
      data: {
        comensalEmail: email.trim().toLowerCase().substring(0, 255),
        comensalName: name?.trim().substring(0, 255) || null,
      },
    });

    this.logger.log(`Email collected for session ${sessionId}: ${email}`);
    return { success: true };
  }

  async getGastroReviews(tenantId: string) {
    const reviews = await this.prisma.tableSession.findMany({
      where: {
        tenantId,
        review: { not: null },
      },
      select: {
        id: true,
        tableNumber: true,
        review: true,
        totalAmount: true,
        tipAmount: true,
        openedAt: true,
        closedAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    return reviews.map(r => ({
      ...r,
      totalAmount: Number(r.totalAmount || 0),
      tipAmount: Number(r.tipAmount || 0),
    }));
  }

  // ========== FINANCE INTEGRATION ==========

  async assignWaiter(sessionId: string, waiterId: string) {
    const session = await this.prisma.tableSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Sesión no encontrada');

    return this.prisma.tableSession.update({
      where: { id: sessionId },
      data: { waiterId },
      include: { waiter: { select: { id: true, name: true } } },
    });
  }

  async getTipsReport(tenantId: string, period: string) {
    const now = new Date();
    let dateFrom: Date;

    if (period === 'week') {
      dateFrom = new Date(now);
      dateFrom.setDate(dateFrom.getDate() - dateFrom.getDay());
      dateFrom.setHours(0, 0, 0, 0);
    } else if (period === 'month') {
      dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      // today
      dateFrom = new Date(now);
      dateFrom.setHours(0, 0, 0, 0);
    }

    const sessions = await this.prisma.tableSession.findMany({
      where: {
        tenantId,
        status: { in: ['PAID', 'CLOSED'] },
        tipAmount: { gt: 0 },
        updatedAt: { gte: dateFrom },
      },
      select: {
        id: true,
        tableNumber: true,
        tipAmount: true,
        tipType: true,
        totalAmount: true,
        waiterId: true,
        waiter: { select: { id: true, name: true } },
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Aggregate by waiter
    const byWaiter = new Map<string, { name: string; total: number; count: number }>();
    let totalTips = 0;
    let unassignedTips = 0;

    for (const s of sessions) {
      const tip = Number(s.tipAmount || 0);
      totalTips += tip;

      if (s.waiterId && s.waiter) {
        const existing = byWaiter.get(s.waiterId) || { name: s.waiter.name, total: 0, count: 0 };
        existing.total += tip;
        existing.count += 1;
        byWaiter.set(s.waiterId, existing);
      } else {
        unassignedTips += tip;
      }
    }

    return {
      period,
      totalTips,
      totalSessions: sessions.length,
      unassignedTips,
      byWaiter: Array.from(byWaiter.entries()).map(([id, data]) => ({
        waiterId: id,
        waiterName: data.name,
        totalTips: data.total,
        sessionCount: data.count,
      })).sort((a, b) => b.totalTips - a.totalTips),
      sessions: sessions.map(s => ({
        id: s.id,
        tableNumber: s.tableNumber,
        tipAmount: Number(s.tipAmount),
        totalAmount: Number(s.totalAmount || 0),
        tipType: s.tipType,
        waiterName: s.waiter?.name || null,
        date: s.updatedAt,
      })),
    };
  }

  private async registerGastroIncome(tenantId: string, tableNumber: number, totalAmount: number, tipAmount: number) {
    try {
      if (totalAmount <= 0) return;

      const description = `Salón — Mesa ${tableNumber}${tipAmount > 0 ? ` (propina $${tipAmount.toFixed(0)})` : ''}`;

      await this.financeService.createIncome(tenantId, {
        category: 'GASTRO_SALON',
        description,
        amount: totalAmount + tipAmount,
      });

      this.logger.log(`Income registered for tenant ${tenantId}: $${(totalAmount + tipAmount).toFixed(2)} (Mesa ${tableNumber})`);
    } catch (err: any) {
      // Don't fail the payment flow if income registration fails
      this.logger.error(`Failed to register gastro income: ${err.message}`);
    }
  }
}
