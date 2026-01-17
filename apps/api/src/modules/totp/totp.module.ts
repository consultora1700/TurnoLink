import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TotpService } from './totp.service';
import { TotpController } from './totp.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [TotpController],
  providers: [TotpService],
  exports: [TotpService],
})
export class TotpModule {}
