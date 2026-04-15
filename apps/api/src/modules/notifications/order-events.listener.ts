import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLoggerService } from '../../common/logger';
import { EmailNotificationsService } from './email-notifications.service';

interface OrderCreatedPayload {
  order: any;
  tenantId: string;
  paymentMethod: string;
  customer: {
    name: string;
    email?: string;
    phone: string;
  };
}

interface OrderPaidPayload {
  orderId: string;
  tenantId: string;
  paymentId: string;
}

@Injectable()
export class OrderEventsListener {
  private readonly webUrl: string;

  constructor(
    private readonly emailService: EmailNotificationsService,
    private readonly prisma: PrismaService,
    private readonly logger: AppLoggerService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext('OrderEventsListener');
    this.webUrl = this.configService.get<string>('WEB_URL') || 'https://turnolink.com.ar';
  }

  @OnEvent('order.created')
  async handleOrderCreated(payload: OrderCreatedPayload) {
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: payload.tenantId },
        select: { name: true, email: true, slug: true, phone: true, settings: true },
      });

      if (!tenant) return;

      const settings = typeof tenant.settings === 'string'
        ? JSON.parse(tenant.settings)
        : tenant.settings || {};

      const order = payload.order;
      const items = order.items?.map((i: any) => ({
        name: i.productName,
        quantity: i.quantity,
        price: Number(i.totalPrice),
        options: i.options,
        itemNotes: i.itemNotes,
      })) || [];

      const total = Number(order.total);

      // For MercadoPago, don't send customer confirmation yet — wait for order.paid
      // For transferencia/efectivo, send immediately since there's no async payment
      if (payload.paymentMethod !== 'mercadopago' && payload.customer.email) {
        await this.emailService.sendOrderConfirmationEmail(
          payload.customer.email,
          payload.customer.name,
          tenant.name,
          order.orderNumber,
          items,
          total,
          `${this.webUrl}/${tenant.slug}/pedido/${encodeURIComponent(order.orderNumber)}`,
        );
      }

      // Always notify business owner about new orders
      const ownerEmail = settings.notificationEmail || tenant.email;
      if (ownerEmail && settings.notifyOwnerByEmail !== false) {
        await this.emailService.sendNewOrderOwnerEmail(
          ownerEmail,
          tenant.name,
          payload.customer.name,
          order.orderNumber,
          total,
          `${this.webUrl}/pedidos`,
        );
      }

      // WhatsApp notification to business owner (gastro orders)
      if (tenant.phone && order.orderType) {
        const orderTypeLabel = order.orderType === 'DINE_IN' ? 'En el local' :
          order.orderType === 'TAKE_AWAY' ? 'Retira en local' : 'Delivery';
        const tableInfo = order.tableNumber ? ` - Mesa ${order.tableNumber}` : '';
        const itemsList = items.map((i: any) =>
          `• ${i.quantity}x ${i.name}${i.itemNotes ? ` (${i.itemNotes})` : ''}`
        ).join('\n');

        const waMessage = `🔔 *Nuevo pedido ${order.orderNumber}*\n` +
          `📋 ${orderTypeLabel}${tableInfo}\n` +
          `👤 ${payload.customer.name} - ${payload.customer.phone}\n\n` +
          `${itemsList}\n\n` +
          `💰 *Total: $${total.toLocaleString('es-AR')}*\n` +
          `💳 ${payload.paymentMethod === 'efectivo' ? 'Efectivo' : payload.paymentMethod === 'transferencia' ? 'Transferencia' : 'MercadoPago'}\n\n` +
          `Ver pedido: ${this.webUrl}/pedidos`;

        // Store notification for dashboard display
        this.logger.log(`WhatsApp notification for ${order.orderNumber}: ${orderTypeLabel}${tableInfo}`);

        // Note: actual WhatsApp sending requires Twilio/WhatsApp Business API integration
        // For now, we log and the dashboard shows the notification
      }

      this.logger.log(`Order created notifications sent for ${order.orderNumber}`);
    } catch (error) {
      this.logger.error(`Failed to send order created notifications: ${error}`);
    }
  }

  @OnEvent('order.paid')
  async handleOrderPaid(payload: OrderPaidPayload) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: payload.orderId },
        include: {
          items: true,
          tenant: { select: { name: true, slug: true } },
        },
      });

      if (!order || !order.customerEmail) return;

      const items = order.items.map((i) => ({
        name: i.productName,
        quantity: i.quantity,
        price: Number(i.totalPrice),
      }));

      await this.emailService.sendOrderPaymentApprovedEmail(
        order.customerEmail,
        order.customerName || 'Cliente',
        order.tenant.name,
        order.orderNumber,
        items,
        Number(order.total),
        `${this.webUrl}/${order.tenant.slug}/pedido/${encodeURIComponent(order.orderNumber)}`,
      );

      this.logger.log(`Order paid notification sent for ${order.orderNumber}`);
    } catch (error) {
      this.logger.error(`Failed to send order paid notification: ${error}`);
    }
  }
}
