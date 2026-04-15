import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { GastroController } from './gastro.controller';
import { GastroService } from './gastro.service';
import { KitchenService } from './kitchen.service';
import { GastroGateway } from './gastro.gateway';
import { SessionCleanupService } from './session-cleanup.service';
import { PrintAgentGuard } from './guards/print-agent.guard';
import { MercadoPagoModule } from '../mercadopago/mercadopago.module';
import { FinanceModule } from '../finance/finance.module';

@Module({
  imports: [
    ConfigModule,
    // JwtModule is also registered in AuthModule; we register it here with
    // the same secret so KitchenService can sign long-lived printer-agent
    // JWTs and PrintAgentGuard can verify them without cross-module coupling.
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    MercadoPagoModule,
    FinanceModule,
  ],
  controllers: [GastroController],
  providers: [
    GastroService,
    KitchenService,
    GastroGateway,
    SessionCleanupService,
    PrintAgentGuard,
  ],
  exports: [GastroService, KitchenService],
})
export class GastroModule {}
