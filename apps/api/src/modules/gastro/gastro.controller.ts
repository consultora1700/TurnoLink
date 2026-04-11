import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Request,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { GastroService } from './gastro.service';
import { KitchenService } from './kitchen.service';
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
  @ApiOperation({ summary: 'Generar token para agente de impresión' })
  async generateAgentToken(@Request() req: any) {
    const token = await this.kitchenService.generateAgentToken(req.user.tenantId);
    return { token };
  }

  @Public()
  @Post('printer-agent/auth')
  @ApiOperation({ summary: 'Autenticar agente de impresión' })
  async authPrintAgent(@Body('agentToken') agentToken: string) {
    const result = await this.kitchenService.validateAgentToken(agentToken);
    if (!result) {
      throw new NotFoundException('Token inválido');
    }
    return result;
  }

  @Public()
  @Get('printer-agent/pending')
  @ApiOperation({ summary: 'Comandas pendientes de impresión (fallback HTTP)' })
  async getPendingForAgent(@Query('tenantId') tenantId: string) {
    if (!tenantId) throw new BadRequestException('tenantId requerido');
    return this.kitchenService.getPendingComandas(tenantId);
  }

  @Public()
  @Post('printer-agent/confirm')
  @ApiOperation({ summary: 'Confirmar impresión de comandas (fallback HTTP)' })
  async confirmPrintedComandas(
    @Body('tenantId') tenantId: string,
    @Body('comandaIds') comandaIds: string[],
  ) {
    if (!tenantId || !comandaIds?.length) {
      throw new BadRequestException('tenantId y comandaIds requeridos');
    }
    for (const id of comandaIds) {
      await this.kitchenService.updateComandaStatus(tenantId, id, 'PRINTED').catch(() => {});
    }
    return { confirmed: comandaIds.length };
  }
}
