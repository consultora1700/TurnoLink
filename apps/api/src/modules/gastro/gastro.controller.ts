import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Request,
  Req,
  BadRequestException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { GastroService } from './gastro.service';
import { KitchenService } from './kitchen.service';
import { PrintAgentGuard } from './guards/print-agent.guard';
import { CreateTableSessionDto } from './dto/create-table-session.dto';
import { CreateSessionOrderDto } from './dto/create-session-order.dto';
import { UpdateSessionStatusDto } from './dto/update-session-status.dto';
import { TipPaymentDto } from './dto/tip-payment.dto';
import {
  CreateKitchenStationDto,
  UpdateKitchenStationDto,
  UpdateComandaStatusDto,
  BulkAssignStationDto,
} from './dto/kitchen-station.dto';

@ApiTags('gastro')
@Controller('gastro')
export class GastroController {
  constructor(
    private readonly gastroService: GastroService,
    private readonly kitchenService: KitchenService,
  ) {}

  // ========== PUBLIC ENDPOINTS (Comensal) ==========

  @Public()
  @Post('session/open')
  @ApiOperation({ summary: 'Abrir sesión de mesa (al escanear QR)' })
  async openSession(@Body() dto: CreateTableSessionDto) {
    return this.gastroService.openSession(dto);
  }

  @Public()
  @Post('session/:id/join')
  @ApiOperation({ summary: 'Unirse a sesión existente con palabra clave' })
  async joinSession(@Param('id') id: string, @Body() body: { word: string }) {
    return this.gastroService.joinSession(id, body?.word || '');
  }

  @Public()
  @Get('session/:id')
  @ApiOperation({ summary: 'Obtener estado de sesión' })
  async getSession(@Param('id') id: string) {
    return this.gastroService.getSession(id);
  }

  @Public()
  @Post('session/:id/order')
  @ApiOperation({ summary: 'Agregar pedido a sesión' })
  async addOrder(
    @Param('id') id: string,
    @Body() dto: CreateSessionOrderDto,
  ) {
    return this.gastroService.addOrder(id, dto);
  }

  @Public()
  @Post('session/:id/request-bill')
  @ApiOperation({ summary: 'Solicitar la cuenta' })
  async requestBill(@Param('id') id: string) {
    return this.gastroService.requestBill(id);
  }

  @Public()
  @Get('session/:id/bill')
  @ApiOperation({ summary: 'Ver cuenta con opciones de propina' })
  async getBill(@Param('id') id: string) {
    return this.gastroService.getBill(id);
  }

  @Public()
  @Post('session/:id/pay')
  @ApiOperation({ summary: 'Procesar pago con propina' })
  async processPayment(
    @Param('id') id: string,
    @Body() dto: TipPaymentDto,
  ) {
    return this.gastroService.processPayment(id, dto);
  }

  @Public()
  @Post('session/:id/review')
  @ApiOperation({ summary: 'Enviar reseña del comensal' })
  async submitReview(
    @Param('id') id: string,
    @Body() body: { review: string },
  ) {
    return this.gastroService.submitReview(id, body.review);
  }

  @Public()
  @Post('session/:id/collect-email')
  @ApiOperation({ summary: 'Comensal deja su email para recibir beneficios' })
  async collectEmail(
    @Param('id') id: string,
    @Body() body: { email: string; name?: string },
  ) {
    return this.gastroService.collectEmail(id, body.email, body.name);
  }

  @Public()
  @Get('menu/:tenantId')
  @ApiOperation({ summary: 'Obtener carta con precios según modo' })
  async getMenu(
    @Param('tenantId') tenantId: string,
    @Query('mode') mode: string = 'dine_in',
  ) {
    return this.gastroService.getMenu(tenantId, mode);
  }

  // ========== PRIVATE ENDPOINTS (Dashboard / Mozo) ==========

  @Get('dashboard/tables')
  @ApiOperation({ summary: 'Estado de todas las mesas' })
  async getDashboardTables(@Request() req: any) {
    return this.gastroService.getDashboardTables(req.user.tenantId);
  }

  @Get('dashboard/reviews')
  @ApiOperation({ summary: 'Reseñas de comensales del salón' })
  async getReviews(@Request() req: any) {
    return this.gastroService.getGastroReviews(req.user.tenantId);
  }

  @Patch('session/:id/enable-payment')
  @ApiOperation({ summary: 'Mozo habilita pago' })
  async enablePayment(@Param('id') id: string) {
    return this.gastroService.enablePayment(id);
  }

  @Patch('session/:id/status')
  @ApiOperation({ summary: 'Cambiar estado de sesión' })
  async updateSessionStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSessionStatusDto,
  ) {
    return this.gastroService.updateSessionStatus(id, dto.status);
  }

  @Patch('session/:id/order/:orderId/deliver')
  @ApiOperation({ summary: 'Mozo marca pedido como entregado' })
  async markOrderDelivered(
    @Param('id') id: string,
    @Param('orderId') orderId: string,
  ) {
    return this.gastroService.markOrderDelivered(id, orderId);
  }

  @Patch('session/:id/order/:orderId/status')
  @ApiOperation({ summary: 'Mozo cambia estado de pedido' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Param('orderId') orderId: string,
    @Body('status') status: string,
  ) {
    return this.gastroService.updateOrderStatus(id, orderId, status);
  }

  @Post('session/:id/add-item')
  @ApiOperation({ summary: 'Mozo agrega item manualmente' })
  async addItemManually(
    @Param('id') id: string,
    @Body() dto: CreateSessionOrderDto,
  ) {
    return this.gastroService.addItemManually(id, dto);
  }

  @Patch('session/:id/assign-waiter')
  @ApiOperation({ summary: 'Asignar mozo a mesa' })
  async assignWaiter(
    @Param('id') id: string,
    @Body('waiterId') waiterId: string,
  ) {
    return this.gastroService.assignWaiter(id, waiterId);
  }

  @Post('dashboard/close-table/:tableNumber')
  @ApiOperation({ summary: 'Liberar mesa' })
  async closeTable(
    @Request() req: any,
    @Param('tableNumber') tableNumber: string,
  ) {
    return this.gastroService.closeTable(req.user.tenantId, parseInt(tableNumber, 10));
  }

  @Get('dashboard/tips')
  @ApiOperation({ summary: 'Resumen de propinas' })
  async getTips(
    @Request() req: any,
    @Query('period') period: string = 'today',
  ) {
    return this.gastroService.getTipsReport(req.user.tenantId, period);
  }

  @Get('dashboard/salon-report')
  @ApiOperation({ summary: 'Reporte completo de salón gastronómico' })
  async getSalonReport(
    @Request() req: any,
    @Query('period') period: string = '30d',
  ) {
    return this.gastroService.getGastroSalonReport(req.user.tenantId, period);
  }

  @Get('dashboard/qr-codes')
  @ApiOperation({ summary: 'Obtener datos para generar QRs' })
  async getQrData(@Request() req: any) {
    return this.gastroService.getQrData(req.user.tenantId);
  }

  // ========== KITCHEN STATION ENDPOINTS ==========

  @Get('kitchen/stations')
  @ApiOperation({ summary: 'Listar estaciones de cocina' })
  async getStations(@Request() req: any) {
    return this.kitchenService.getStations(req.user.tenantId);
  }

  @Post('kitchen/stations')
  @ApiOperation({ summary: 'Crear estación de cocina' })
  async createStation(
    @Request() req: any,
    @Body() dto: CreateKitchenStationDto,
  ) {
    return this.kitchenService.createStation(req.user.tenantId, dto);
  }

  @Patch('kitchen/stations/:id')
  @ApiOperation({ summary: 'Actualizar estación de cocina' })
  async updateStation(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateKitchenStationDto,
  ) {
    return this.kitchenService.updateStation(req.user.tenantId, id, dto);
  }

  @Post('kitchen/stations/:id/delete')
  @ApiOperation({ summary: 'Eliminar estación de cocina' })
  async deleteStation(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    return this.kitchenService.deleteStation(req.user.tenantId, id);
  }

  // ========== KITCHEN COMANDA ENDPOINTS ==========

  @Get('kitchen/comandas')
  @ApiOperation({ summary: 'Listar comandas pendientes' })
  async getPendingComandas(
    @Request() req: any,
    @Query('stationId') stationId?: string,
  ) {
    return this.kitchenService.getPendingComandas(req.user.tenantId, stationId);
  }

  @Patch('kitchen/comandas/:id/status')
  @ApiOperation({ summary: 'Cambiar estado de comanda' })
  async updateComandaStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateComandaStatusDto,
  ) {
    return this.kitchenService.updateComandaStatus(req.user.tenantId, id, dto.status);
  }

  @Post('kitchen/comandas/:id/reprint')
  @ApiOperation({ summary: 'Reimprimir comanda' })
  async reprintComanda(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    return this.kitchenService.reprintComanda(req.user.tenantId, id);
  }

  @Get('kitchen/session/:sessionId/comandas')
  @ApiOperation({ summary: 'Comandas de una sesión de mesa' })
  async getSessionComandas(
    @Request() req: any,
    @Param('sessionId') sessionId: string,
  ) {
    return this.kitchenService.getComandasBySession(req.user.tenantId, sessionId);
  }

  @Get('kitchen/stats')
  @ApiOperation({ summary: 'Estadísticas de cocina del día' })
  async getKitchenStats(@Request() req: any) {
    return this.kitchenService.getKitchenStats(req.user.tenantId);
  }

  @Get('kitchen/available-printers')
  @ApiOperation({ summary: 'Impresoras detectadas por los agentes del tenant' })
  async getAvailablePrinters(@Request() req: any) {
    return this.kitchenService.getAvailablePrinters(req.user.tenantId);
  }

  @Post('kitchen/stations/:id/test-print')
  @ApiOperation({ summary: 'Enviar ticket de prueba a la impresora de la estación' })
  async testPrint(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    return this.kitchenService.sendTestPrint(req.user.tenantId, id);
  }

  // ========== PRODUCT-STATION MAPPING ==========

  @Get('kitchen/product-map')
  @ApiOperation({ summary: 'Mapa de productos a estaciones' })
  async getProductStationMap(@Request() req: any) {
    return this.kitchenService.getProductStationMap(req.user.tenantId);
  }

  @Post('kitchen/product-map')
  @ApiOperation({ summary: 'Asignar productos a estaciones masivamente' })
  async bulkAssignProducts(
    @Request() req: any,
    @Body() dto: BulkAssignStationDto,
  ) {
    return this.kitchenService.bulkAssignProducts(req.user.tenantId, dto);
  }

  // ========== PRINT AGENT ==========

  @Post('kitchen/generate-token')
  @ApiOperation({ summary: 'Generar token de vinculación para agente de impresión' })
  async generateAgentToken(@Request() req: any, @Body() body: { name?: string } = {}) {
    const result = await this.kitchenService.generateAgentToken(
      req.user.tenantId,
      body?.name,
    );
    // Backward compat: legacy clients read `.token`. New clients can also
    // read `.agentId` to reference the PrintAgent row.
    return { token: result.token, agentId: result.agentId };
  }

  @Get('kitchen/agents')
  @ApiOperation({ summary: 'Listar agentes de impresión vinculados' })
  async listAgents(@Request() req: any) {
    return this.kitchenService.listAgents(req.user.tenantId);
  }

  @Post('kitchen/agents/:id/revoke')
  @ApiOperation({ summary: 'Revocar un agente de impresión' })
  async revokeAgent(@Request() req: any, @Param('id') id: string) {
    return this.kitchenService.revokeAgent(req.user.tenantId, id);
  }

  /**
   * Pairing endpoint for print agents. The agent sends its one-time pairing
   * token (agentToken) and receives a long-lived JWT to use from now on.
   *
   * Rate-limited (5 attempts / minute) to block brute-forcing of 48-char
   * tokens. @Public() bypasses the global JwtAuthGuard — no user session.
   */
  @Public()
  @Throttle({ short: { limit: 5, ttl: 60_000 } })
  @Post('printer-agent/auth')
  @ApiOperation({ summary: 'Autenticar agente de impresión y obtener JWT' })
  async authPrintAgent(
    @Body() body: { agentToken?: string; version?: string },
    @Req() req: any,
  ) {
    const agentToken = body?.agentToken;
    if (!agentToken) {
      throw new BadRequestException('agentToken requerido');
    }
    const xff = req.headers?.['x-forwarded-for'];
    const ip =
      (typeof xff === 'string' && xff.split(',')[0].trim()) ||
      req.ip ||
      req.socket?.remoteAddress ||
      null;

    const result = await this.kitchenService.validateAgentToken(agentToken, {
      ip,
      version: body?.version || null,
    });
    if (!result) {
      throw new NotFoundException('Token inválido');
    }
    return result; // { agentId, tenantId, tenantName, slug, jwt }
  }

  /**
   * Pending comandas for a print agent. Auth via PrintAgentGuard (Bearer
   * JWT). tenantId is read from the JWT, never trusted from the client.
   *
   * Response shape matches the Tauri agent's `ComandaPayload` contract
   * (flat, camelCase). Mirrors exactly what the WebSocket gateway emits on
   * `comanda:new` so the agent uses ONE type regardless of transport.
   */
  @Public()
  @UseGuards(PrintAgentGuard)
  @Get('printer-agent/pending')
  @ApiOperation({ summary: 'Comandas pendientes de impresión (HTTP poll)' })
  async getPendingForAgent(@Req() req: any) {
    const tenantId = req.printAgent?.tenantId;
    if (!tenantId) throw new BadRequestException('tenantId requerido');
    const raw = await this.kitchenService.getPendingComandas(tenantId);

    // Increment printAttempts for each comanda being dispatched to the agent.
    // Non-blocking — don't slow down the poll response.
    if (raw.length > 0) {
      this.kitchenService.incrementPrintAttempts(raw.map((c: any) => c.id)).catch(() => {});
    }

    // Build fullOrderItems for each comanda by collecting sibling comandas
    // (same tableSessionOrderId = same order, different stations)
    const orderIdSet = new Set(raw.map((c: any) => c.tableSessionOrderId));
    const allSiblings = orderIdSet.size > 0
      ? await this.kitchenService.getComandasByOrderIds(tenantId, [...orderIdSet])
      : [];
    const siblingsByOrder = new Map<string, any[]>();
    for (const s of allSiblings) {
      const key = s.tableSessionOrderId;
      if (!siblingsByOrder.has(key)) siblingsByOrder.set(key, []);
      siblingsByOrder.get(key)!.push(s);
    }

    const dbComandas = raw.map((c: any) => {
      // Build full order items from all sibling comandas
      const siblings = siblingsByOrder.get(c.tableSessionOrderId) || [];
      const fullOrderItems = siblings.flatMap((sib: any) => {
        const sitems = Array.isArray(sib.items) ? sib.items : [];
        const stName = sib.station?.displayName || sib.station?.name || '';
        return sitems.map((item: any) => ({
          ...item,
          stationName: stName,
        }));
      });

      return {
        comandaId: c.id,
        stationId: c.stationId,
        stationName: c.station?.displayName || c.station?.name || '',
        printerId: c.station?.printerId ?? null,
        tableNumber: c.tableNumber,
        orderNumber: c.orderNumber,
        items: Array.isArray(c.items) ? c.items : [],
        fullOrderItems,
        waiterName: null,
        timestamp: (c.createdAt instanceof Date
          ? c.createdAt
          : new Date(c.createdAt)
        ).toISOString(),
      };
    });

    // Append any queued test prints (ephemeral, not in DB)
    const testPrints = this.kitchenService.drainTestPrints(tenantId);

    return [...dbComandas, ...testPrints];
  }

  /**
   * Agent reports the printers it has discovered locally. Best-effort — we
   * persist the list on the PrintAgent row as metadata so the dashboard can
   * surface it, but failures are swallowed so the agent's polling loop
   * stays healthy.
   */
  @Public()
  @UseGuards(PrintAgentGuard)
  @Post('printer-agent/printers')
  @ApiOperation({ summary: 'Registrar impresoras detectadas por el agente' })
  async registerAgentPrinters(
    @Req() req: any,
    @Body() body: { printers?: any[] },
  ) {
    const agentId = req.printAgent?.id;
    const printers = Array.isArray(body?.printers) ? body.printers : [];
    await this.kitchenService
      .updateAgentPrinters(agentId, printers)
      .catch(() => {});
    return { received: printers.length };
  }

  /**
   * Agent confirms successful prints. Accepts either `comandaId` (single)
   * or `comandaIds` (batch) for client flexibility.
   */
  @Public()
  @UseGuards(PrintAgentGuard)
  @Post('printer-agent/confirm')
  @ApiOperation({ summary: 'Confirmar impresión de comandas' })
  async confirmPrintedComandas(
    @Req() req: any,
    @Body() body: { comandaId?: string; comandaIds?: string[] },
  ) {
    const tenantId = req.printAgent?.tenantId;
    if (!tenantId) throw new BadRequestException('tenantId requerido');

    const ids = body?.comandaIds?.length
      ? body.comandaIds
      : body?.comandaId
        ? [body.comandaId]
        : [];
    if (!ids.length) {
      throw new BadRequestException('comandaId o comandaIds requerido');
    }

    for (const id of ids) {
      await this.kitchenService
        .updateComandaStatus(tenantId, id, 'PRINTED')
        .catch(() => {});
    }
    return { confirmed: ids.length };
  }

  /**
   * Agent reports a failed print attempt (paper out, offline, etc).
   */
  @Public()
  @UseGuards(PrintAgentGuard)
  @Post('printer-agent/fail')
  @ApiOperation({ summary: 'Reportar fallo de impresión' })
  async reportPrintFailure(
    @Req() req: any,
    @Body() body: { comandaId?: string; error?: string },
  ) {
    const tenantId = req.printAgent?.tenantId;
    if (!tenantId || !body?.comandaId) {
      throw new BadRequestException('comandaId requerido');
    }
    await this.kitchenService
      .updateComandaStatus(tenantId, body.comandaId, 'PRINT_FAILED')
      .catch(() => {});
    return { reported: true };
  }
}
