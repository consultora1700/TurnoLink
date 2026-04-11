import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  NotFoundException,
  BadRequestException,
  GoneException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersService } from './orders.service';
import { MercadoPagoService } from '../mercadopago/mercadopago.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ConfigService } from '@nestjs/config';

@ApiTags('public-orders')
@Controller('public/tenants/:slug')
export class PublicOrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly prisma: PrismaService,
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly configService: ConfigService,
  ) {}

  private async getTenantId(slug: string): Promise<string> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, status: true },
    });
    if (!tenant || tenant.status !== 'ACTIVE') {
      throw new NotFoundException('Negocio no encontrado');
    }
    return tenant.id;
  }

  private async getTenant(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, status: true, name: true, logo: true },
    });
    if (!tenant || tenant.status !== 'ACTIVE') {
      throw new NotFoundException('Negocio no encontrado');
    }
    return tenant;
  }

  @Public()
  @Post('orders')
  @ApiOperation({ summary: 'Crear pedido público' })
  async createOrder(
    @Param('slug') slug: string,
    @Body() dto: CreateOrderDto,
  ) {
    const tenant = await this.getTenant(slug);
    const order = await this.ordersService.createOrder(tenant.id, dto);

    let initPoint: string | undefined;

    // If MercadoPago, create payment preference
    if (dto.paymentMethod === 'mercadopago' && order.total > 0) {
      try {
        const webUrl = this.configService.get<string>('WEB_URL') || 'https://turnolink.com.ar';
        const resultBase = `${webUrl}/${slug}/pedido/${encodeURIComponent(order.orderNumber)}`;
        const backUrls = {
          success: resultBase,
          failure: resultBase,
          pending: resultBase,
        };

        const mpResult = await this.mercadoPagoService.createOrderPreference(
          tenant.id,
          order.id,
          order.total,
          order.items.map((item: any) => ({
            title: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
          backUrls,
          {
            businessName: tenant.name,
            businessLogo: tenant.logo,
          },
        );

        initPoint = mpResult.initPoint;
      } catch (error) {
        // If MP fails, order still created — user can pay later
        // The order is already in PENDING state
      }
    }

    return {
      order,
      initPoint,
    };
  }

  @Public()
  @Get('orders/:orderNumber')
  @ApiOperation({ summary: 'Estado público del pedido' })
  async getOrder(
    @Param('slug') slug: string,
    @Param('orderNumber') orderNumber: string,
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, status: true, name: true },
    });
    if (!tenant || tenant.status !== 'ACTIVE') {
      throw new NotFoundException('Negocio no encontrado');
    }

    const order = await this.ordersService.getOrderByNumber(tenant.id, orderNumber);

    // Expiration: DELIVERED/CANCELLED orders expire after 2 hours
    const EXPIRY_MS = 2 * 60 * 60 * 1000; // 2 hours
    if (['DELIVERED', 'CANCELLED'].includes(order.status)) {
      const lastStatusChange = order.statusHistory?.[0]?.createdAt;
      const closedAt = lastStatusChange ? new Date(lastStatusChange) : new Date(order.updatedAt);
      if (Date.now() - closedAt.getTime() > EXPIRY_MS) {
        throw new GoneException('Este seguimiento ha expirado');
      }
    }

    return { order, businessName: tenant.name };
  }

  @Public()
  @Post('orders/:orderNumber/pay')
  @ApiOperation({ summary: 'Seleccionar método de pago para pedido confirmado' })
  async payOrder(
    @Param('slug') slug: string,
    @Param('orderNumber') orderNumber: string,
    @Body() body: { paymentMethod: 'efectivo' | 'mercadopago' },
  ) {
    const tenant = await this.getTenant(slug);
    const order = await this.ordersService.getOrderByNumber(tenant.id, decodeURIComponent(orderNumber));

    // Only allow payment selection for confirmed+ orders with pending payment
    const payableStatuses = ['CONFIRMED', 'PROCESSING', 'SHIPPED'];
    if (!payableStatuses.includes(order.status)) {
      throw new BadRequestException('El pedido aún no fue confirmado por el comercio');
    }

    // Update payment method on the order
    await this.ordersService.updatePaymentMethod(order.id, body.paymentMethod);

    // Si el cliente eligió efectivo, marcamos el pedido como ya no esperando pago.
    // El comercio verá un botón para "Enviar a cocina" (PROCESSING).
    // Si eligió MP, awaitingPayment se limpia cuando llega el webhook de pago aprobado.
    if (body.paymentMethod === 'efectivo') {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { awaitingPayment: false },
      });
    }

    if (body.paymentMethod === 'mercadopago' && order.total > 0) {
      const webUrl = this.configService.get<string>('WEB_URL') || 'https://turnolink.com.ar';
      const resultBase = `${webUrl}/${slug}/pedido/${encodeURIComponent(order.orderNumber)}`;
      const backUrls = {
        success: resultBase,
        failure: resultBase,
        pending: resultBase,
      };

      const mpResult = await this.mercadoPagoService.createOrderPreference(
        tenant.id,
        order.id,
        order.total,
        order.items.map((item: any) => ({
          title: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        backUrls,
        { businessName: tenant.name, businessLogo: tenant.logo },
      );

      return { initPoint: mpResult.initPoint };
    }

    return { success: true };
  }

  @Public()
  @Get('payment-methods')
  @ApiOperation({ summary: 'Métodos de pago disponibles' })
  async getPaymentMethods(@Param('slug') slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, status: true },
    });
    if (!tenant || tenant.status !== 'ACTIVE') {
      throw new NotFoundException('Negocio no encontrado');
    }

    const mpCredential = await this.prisma.mercadoPagoCredential.findUnique({
      where: { tenantId: tenant.id },
      select: { isConnected: true },
    });

    return {
      mercadopago: mpCredential?.isConnected === true,
      transferencia: true,
      efectivo: true,
    };
  }

  @Public()
  @Post('orders/validate-coupon')
  @ApiOperation({ summary: 'Validar cupón sin crear orden' })
  async validateCoupon(
    @Param('slug') slug: string,
    @Body() body: { code: string; subtotal: number },
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, status: true },
    });
    if (!tenant || tenant.status !== 'ACTIVE') {
      throw new NotFoundException('Negocio no encontrado');
    }

    return this.ordersService.validateCoupon(tenant.id, body.code, body.subtotal);
  }
}
