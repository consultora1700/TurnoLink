import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { PublicTenantsController } from './public-tenants.controller';
import { TotpModule } from '../totp/totp.module';

@Module({
  imports: [TotpModule],
  controllers: [TenantsController, PublicTenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
