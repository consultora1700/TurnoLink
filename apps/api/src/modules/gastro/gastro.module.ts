import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GastroController } from './gastro.controller';
import { GastroService } from './gastro.service';
import { KitchenService } from './kitchen.service';
import { GastroGateway } from './gastro.gateway';
import { SessionCleanupService } from './session-cleanup.service';
import { MercadoPagoModule } from '../mercadopago/mercadopago.module';
import { FinanceModule } from '../finance/finance.module';

@Module({
  imports: [ConfigModule, MercadoPagoModule, FinanceModule],
  controllers: [GastroController],
  providers: [GastroService, KitchenService, GastroGateway, SessionCleanupService],
  exports: [GastroService, KitchenService],
})
export class GastroModule {}
