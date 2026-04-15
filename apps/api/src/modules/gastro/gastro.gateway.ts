import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

interface PrintAgentJwtPayload {
  sub: string;
  tenantId: string;
  type: 'printer-agent';
  exp?: number;
}

@WebSocketGateway({
  namespace: '/gastro',
  path: '/socket.io',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class GastroGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GastroGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  afterInit() {
    // Redis adapter is configured globally in main.ts via RedisIoAdapter
    this.logger.log('Gastro WebSocket Gateway initialized');
  }

  /**
   * Extracts and verifies a printer-agent JWT from the Socket.IO handshake
   * (`auth.token` or `query.token`). Returns the decoded payload on success
   * or null on failure.
   */
  private async verifyPrinterJwt(client: Socket): Promise<PrintAgentJwtPayload | null> {
    const auth = (client.handshake as any)?.auth || {};
    const query = client.handshake?.query || {};
    const raw =
      (typeof auth.token === 'string' && auth.token) ||
      (typeof auth.jwt === 'string' && auth.jwt) ||
      (typeof query.token === 'string' && query.token) ||
      null;
    if (!raw) return null;
    try {
      const payload = await this.jwtService.verifyAsync<PrintAgentJwtPayload>(raw);
      if (payload?.type !== 'printer-agent' || !payload.sub || !payload.tenantId) {
        return null;
      }
      // Cheap DB check so revoked agents can't linger on an old JWT.
      const agent = await this.prisma.printAgent.findUnique({
        where: { id: payload.sub },
        select: { isActive: true, tenantId: true },
      });
      if (!agent || !agent.isActive || agent.tenantId !== payload.tenantId) {
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id} (transport: ${client.conn?.transport?.name || 'unknown'})`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const agent = (client.data as any)?.printAgent;
    if (agent?.tenantId) {
      this.server
        ?.to(`dashboard:${agent.tenantId}`)
        .emit('kitchen:agent-connected', {
          connected: false,
          agentId: agent.id,
        });
    }
  }

  // ===== Client → Server events =====

  @SubscribeMessage('join-dashboard')
  handleJoinDashboard(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tenantId: string },
  ) {
    if (data?.tenantId) {
      client.join(`dashboard:${data.tenantId}`);
      this.logger.log(`Client ${client.id} joined dashboard:${data.tenantId}`);
    } else {
      this.logger.warn(`Client ${client.id} tried join-dashboard with no tenantId`);
    }
  }

  @SubscribeMessage('join-table')
  handleJoinTable(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string },
  ) {
    if (data?.sessionId) {
      client.join(`table:${data.sessionId}`);
      this.logger.log(`Client ${client.id} joined table:${data.sessionId}`);
    }
  }

  @SubscribeMessage('printer:join')
  async handlePrinterJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tenantId?: string },
  ) {
    // Require a valid printer-agent JWT on the handshake. The claimed
    // tenantId in the message body is ignored in favor of the JWT claim.
    const payload = await this.verifyPrinterJwt(client);
    if (!payload) {
      this.logger.warn(
        `Print agent ${client.id} rejected printer:join (invalid/missing JWT)`,
      );
      client.emit('printer:auth-error', { error: 'invalid-token' });
      client.disconnect(true);
      return;
    }

    const tenantId = payload.tenantId;
    client.join(`printer:${tenantId}`);
    (client.data as any).printAgent = { id: payload.sub, tenantId };
    this.logger.log(
      `Print agent ${client.id} (agent=${payload.sub}) joined printer:${tenantId}`,
    );

    // Heartbeat on connect
    this.prisma.printAgent
      .update({
        where: { id: payload.sub },
        data: { lastSeenAt: new Date() },
      })
      .catch(() => {});

    // Notify dashboard that print agent is connected
    this.server
      ?.to(`dashboard:${tenantId}`)
      .emit('kitchen:agent-connected', { connected: true, agentId: payload.sub });
  }

  private getAuthenticatedAgentTenant(client: Socket): string | null {
    const agent = (client.data as any)?.printAgent;
    return agent?.tenantId || null;
  }

  @SubscribeMessage('comanda:printed')
  handleComandaPrinted(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { comandaId: string },
  ) {
    const tenantId = this.getAuthenticatedAgentTenant(client);
    if (!tenantId || !data?.comandaId) return;

    this.logger.log(`Comanda ${data.comandaId} printed successfully`);
    this.server
      ?.to(`dashboard:${tenantId}`)
      .emit('kitchen:comanda-printed', { comandaId: data.comandaId });
  }

  @SubscribeMessage('comanda:print-failed')
  handleComandaPrintFailed(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { comandaId: string; error: string },
  ) {
    const tenantId = this.getAuthenticatedAgentTenant(client);
    if (!tenantId || !data?.comandaId) return;

    this.logger.warn(`Comanda ${data.comandaId} print failed: ${data.error}`);
    this.server
      ?.to(`dashboard:${tenantId}`)
      .emit('kitchen:print-failed', {
        comandaId: data.comandaId,
        error: data.error,
      });
  }

  @SubscribeMessage('printer:status')
  handlePrinterStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { printers: any[] },
  ) {
    const tenantId = this.getAuthenticatedAgentTenant(client);
    if (!tenantId || !Array.isArray(data?.printers)) return;

    this.server
      ?.to(`dashboard:${tenantId}`)
      .emit('kitchen:printer-status', { printers: data.printers });
  }

  // ===== Server → Client events (triggered by EventEmitter from GastroService) =====

  @OnEvent('gastro.session.opened')
  handleSessionOpened(payload: { tenantId: string; sessionId: string; tableNumber: number }) {
    const room = `dashboard:${payload.tenantId}`;
    const roomSize = this.server?.sockets?.adapter?.rooms?.get(room)?.size || 0;
    this.logger.log(`[EVENT] session.opened → room ${room} (${roomSize} clients) table=${payload.tableNumber}`);
    this.server
      ?.to(room)
      .emit('table:session-opened', payload);
  }

  @OnEvent('gastro.order.placed')
  handleOrderPlaced(payload: {
    tenantId: string;
    sessionId: string;
    tableNumber: number;
    orderId: string;
    orderNumber: number;
    subtotal: number;
    addedByStaff?: boolean;
  }) {
    const room = `dashboard:${payload.tenantId}`;
    const roomSize = this.server?.sockets?.adapter?.rooms?.get(room)?.size || 0;
    this.logger.log(`[EVENT] order.placed → room ${room} (${roomSize} clients) table=${payload.tableNumber} order=#${payload.orderNumber}`);
    this.server
      ?.to(room)
      .emit('table:order-placed', payload);
    this.server
      ?.to(`table:${payload.sessionId}`)
      .emit('table:order-placed', payload);
  }

  @OnEvent('gastro.bill.requested')
  handleBillRequested(payload: {
    tenantId: string;
    sessionId: string;
    tableNumber: number;
    totalAmount: number;
  }) {
    const room = `dashboard:${payload.tenantId}`;
    const roomSize = this.server?.sockets?.adapter?.rooms?.get(room)?.size || 0;
    this.logger.log(`[EVENT] bill.requested → room ${room} (${roomSize} clients) table=${payload.tableNumber}`);
    this.server
      ?.to(room)
      .emit('table:bill-requested', payload);
  }

  @OnEvent('gastro.payment.enabled')
  handlePaymentEnabled(payload: {
    tenantId: string;
    sessionId: string;
    tableNumber: number;
  }) {
    this.server
      ?.to(`dashboard:${payload.tenantId}`)
      .emit('table:payment-enabled', payload);
    this.server
      ?.to(`table:${payload.sessionId}`)
      .emit('table:payment-enabled', payload);
  }

  @OnEvent('gastro.payment.requested')
  handlePaymentRequested(payload: {
    tenantId: string;
    sessionId: string;
    tableNumber: number;
    totalAmount: number;
    tipAmount: number;
    grandTotal: number;
    paymentMethod: string;
  }) {
    this.server
      ?.to(`dashboard:${payload.tenantId}`)
      .emit('table:payment-requested', payload);
  }

  @OnEvent('gastro.session.paid')
  handleSessionPaid(payload: {
    tenantId: string;
    sessionId: string;
    tableNumber: number;
    totalAmount: number;
    tipAmount: number;
  }) {
    this.server
      ?.to(`dashboard:${payload.tenantId}`)
      .emit('table:paid', payload);
  }

  @OnEvent('gastro.session.closed')
  handleSessionClosed(payload: {
    tenantId: string;
    sessionId: string;
    tableNumber: number;
  }) {
    this.server
      ?.to(`dashboard:${payload.tenantId}`)
      .emit('table:closed', payload);
  }

  @OnEvent('gastro.order.delivered')
  handleOrderDelivered(payload: {
    tenantId: string;
    sessionId: string;
    tableNumber: number;
    orderId: string;
    allDelivered: boolean;
  }) {
    this.logger.log(`[EVENT] order.delivered → table=${payload.tableNumber} allDelivered=${payload.allDelivered}`);
    this.server
      ?.to(`dashboard:${payload.tenantId}`)
      .emit('table:order-delivered', payload);
    // Notify comensal so "Pedir la cuenta" can appear
    this.server
      ?.to(`table:${payload.sessionId}`)
      .emit('table:order-delivered', payload);
  }

  @OnEvent('order.created')
  handleNewOrder(payload: {
    order: any;
    tenantId: string;
    paymentMethod: string;
    customer: { name: string; email?: string; phone?: string };
  }) {
    const room = `dashboard:${payload.tenantId}`;
    const roomSize = this.server?.sockets?.adapter?.rooms?.get(room)?.size || 0;
    const orderType = payload.order?.orderType || 'UNKNOWN';
    this.logger.log(`[EVENT] order.created → room ${room} (${roomSize} clients) type=${orderType} #${payload.order?.orderNumber}`);
    this.server
      ?.to(room)
      .emit('order:new', {
        tenantId: payload.tenantId,
        orderId: payload.order?.id,
        orderNumber: payload.order?.orderNumber,
        orderType,
        customerName: payload.customer?.name,
        total: payload.order?.total,
        paymentMethod: payload.paymentMethod,
      });
  }

  // ===== Kitchen Comanda Events =====

  @OnEvent('gastro.comanda.created')
  handleComandaCreated(payload: {
    tenantId: string;
    comandaId: string;
    stationId: string;
    stationName: string;
    printerId: string | null;
    tableNumber: number;
    orderNumber: number;
    items: any[];
    waiterName: string | null;
    timestamp: string;
    isReprint?: boolean;
  }) {
    const printerRoom = `printer:${payload.tenantId}`;
    const printerRoomSize = this.server?.sockets?.adapter?.rooms?.get(printerRoom)?.size || 0;
    this.logger.log(
      `[EVENT] comanda.created → printer room ${printerRoom} (${printerRoomSize} clients) station="${payload.stationName}" mesa=${payload.tableNumber}`,
    );
    // Send to print agent
    this.server
      ?.to(printerRoom)
      .emit(payload.isReprint ? 'comanda:reprint' : 'comanda:new', payload);
    // Also notify dashboard
    this.server
      ?.to(`dashboard:${payload.tenantId}`)
      .emit('kitchen:comanda-created', {
        comandaId: payload.comandaId,
        stationName: payload.stationName,
        tableNumber: payload.tableNumber,
        orderNumber: payload.orderNumber,
        items: payload.items,
      });
  }

  @OnEvent('gastro.comanda.ready')
  handleComandaReady(payload: {
    tenantId: string;
    comandaId: string;
    tableNumber: number;
    stationName: string;
    items: any;
  }) {
    this.logger.log(`[EVENT] comanda.ready → mesa=${payload.tableNumber} station="${payload.stationName}"`);
    this.server
      ?.to(`dashboard:${payload.tenantId}`)
      .emit('kitchen:comanda-ready', payload);
  }

  @OnEvent('gastro.comanda.printFailed')
  handleComandaPrintFailedEvent(payload: {
    tenantId: string;
    comandaId: string;
    stationName: string;
    printerId: string | null;
    error: string;
  }) {
    this.logger.warn(`[EVENT] comanda.printFailed → station="${payload.stationName}" error="${payload.error}"`);
    this.server
      ?.to(`dashboard:${payload.tenantId}`)
      .emit('kitchen:print-failed', payload);
  }

  @OnEvent('gastro.printer.status')
  handlePrinterStatusEvent(payload: { tenantId: string; printers: any[] }) {
    this.server
      ?.to(`dashboard:${payload.tenantId}`)
      .emit('kitchen:printer-status', { printers: payload.printers });
  }

  @OnEvent('gastro.kitchen.creationFailed')
  handleKitchenCreationFailed(payload: {
    tenantId: string;
    sessionId: string;
    tableNumber: number;
    orderId: string;
    orderNumber: number;
    error: string;
  }) {
    this.logger.error(
      `[EVENT] kitchen.creationFailed → mesa=${payload.tableNumber} order=#${payload.orderNumber} error="${payload.error}"`,
    );
    this.server
      ?.to(`dashboard:${payload.tenantId}`)
      .emit('kitchen:creation-failed', payload);
  }

  @OnEvent('gastro.agent.offline')
  handleAgentOffline(payload: {
    tenantId: string;
    agents: { id: string; name: string; lastSeenAt: string | null }[];
    pendingComandas: number;
  }) {
    this.logger.warn(
      `[WATCHDOG] Agent(s) offline for tenant ${payload.tenantId}: ${payload.agents.map((a) => a.name).join(', ')} — ${payload.pendingComandas} pending comanda(s)`,
    );
    this.server
      ?.to(`dashboard:${payload.tenantId}`)
      .emit('kitchen:agent-offline', {
        agents: payload.agents,
        pendingComandas: payload.pendingComandas,
      });
  }

  @OnEvent('gastro.session.statusChanged')
  handleStatusChanged(payload: {
    tenantId: string;
    sessionId: string;
    tableNumber: number;
    status: string;
  }) {
    this.server
      ?.to(`dashboard:${payload.tenantId}`)
      .emit('table:status-changed', payload);
    this.server
      ?.to(`table:${payload.sessionId}`)
      .emit('table:status-changed', payload);
  }

  // ===== Booking Events (reservation requests for gastro) =====

  @OnEvent('booking.created')
  handleBookingCreated(payload: { booking: any; tenantId: string }) {
    const room = `dashboard:${payload.tenantId}`;
    this.logger.log(`[EVENT] booking.created → room ${room} customer=${payload.booking?.customer?.name}`);
    this.server?.to(room).emit('booking:new-request', {
      tenantId: payload.tenantId,
      bookingId: payload.booking?.id,
      customerName: payload.booking?.customer?.name,
      serviceName: payload.booking?.service?.name,
      status: payload.booking?.status,
    });
  }

  @OnEvent('booking.confirmed')
  handleBookingConfirmed(payload: { booking: any; tenantId: string }) {
    const room = `dashboard:${payload.tenantId}`;
    this.logger.log(`[EVENT] booking.confirmed → room ${room} bookingId=${payload.booking?.id}`);
    this.server?.to(room).emit('booking:confirmed', {
      tenantId: payload.tenantId,
      bookingId: payload.booking?.id,
    });
  }
}
