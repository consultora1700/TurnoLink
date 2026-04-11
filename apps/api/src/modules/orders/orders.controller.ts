import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,

} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireAnyFeature } from '../../common/decorators/require-feature.decorator';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('orders')
@Controller('orders')
@ApiBearerAuth()
@RequireAnyFeature('online_payments', 'mercadopago', 'whatsapp_catalog')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar pedidos del tenant' })
  async findAll(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('date') date?: string,
  ) {
    return this.ordersService.getOrders(user.tenantId, {
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      date,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Crear venta desde Punto de Venta (POS)' })
  async createPosOrder(
    @CurrentUser() user: any,
    @Body()
    body: {
      items: { productId: string; variantId?: string; quantity: number }[];
      customerName: string;
      customerPhone: string;
      customerEmail?: string;
      paymentMethod: 'efectivo' | 'transferencia' | 'mercadopago';
      notes?: string;
    },
  ) {
    return this.ordersService.createOrder(user.tenantId, {
      items: body.items,
      customer: {
        name: body.customerName,
        email: body.customerEmail || `pos-${Date.now()}@turnolink.local`,
        phone: body.customerPhone,
      },
      shipping: { method: 'retiro' },
      paymentMethod: body.paymentMethod,
      notes: body.notes ? `[POS] ${body.notes}` : '[POS] Venta presencial',
    }, { initialStatus: 'DELIVERED' });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estadísticas de pedidos para dashboard' })
  async getStats(@CurrentUser() user: any) {
    return this.ordersService.getOrderStats(user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de pedido' })
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ordersService.getOrder(user.tenantId, id);
  }

  @Put(':id/assign-delivery')
  @ApiOperation({ summary: 'Asignar (o desasignar) un repartidor a un pedido' })
  async assignDelivery(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { deliveryEmployeeId: string | null },
  ) {
    return this.ordersService.assignDeliveryEmployee(
      user.tenantId,
      id,
      body.deliveryEmployeeId,
    );
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Actualizar estado de pedido' })
  async updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(
      user.tenantId,
      id,
      dto.status,
      dto.note,
      user.id,
    );
  }
}
