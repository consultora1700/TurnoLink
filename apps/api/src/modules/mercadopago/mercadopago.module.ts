import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { TotpModule } from '../totp/totp.module';
import { TenantsModule } from '../tenants/tenants.module';
import { MercadoPagoService } from './mercadopago.service';
import { MercadoPagoController } from './mercadopago.controller';
import { MercadoPagoWebhookController } from './mercadopago-webhook.controller';

@Module({
  imports: [PrismaModule, ConfigModule, TotpModule, TenantsModule],
  controllers: [MercadoPagoController, MercadoPagoWebhookController],
  providers: [MercadoPagoService],
  exports: [MercadoPagoService],
})
export class MercadoPagoModule {}
