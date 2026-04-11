import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PublicOrdersController } from './public-orders.controller';
import { PublicDeliveryController } from './public-delivery.controller';
import { MercadoPagoModule } from '../mercadopago/mercadopago.module';

@Module({
  imports: [MercadoPagoModule, ConfigModule],
  controllers: [OrdersController, PublicOrdersController, PublicDeliveryController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
