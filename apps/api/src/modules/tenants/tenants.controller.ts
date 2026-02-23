import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Query,
  Param,
  Patch,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Require2FAGuard } from '../../common/guards/require-2fa.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Require2FA } from '../../common/decorators/require-2fa.decorator';
import { User } from '@prisma/client';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UpdateDepositSettingsDto } from './dto/update-deposit-settings.dto';

@ApiTags('tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TenantsController {
  private readonly logger = new Logger(TenantsController.name);

  constructor(private readonly tenantsService: TenantsService) {}

  @Get('current')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get current tenant details' })
  async getCurrent(@CurrentUser() user: User) {
    if (!user.tenantId) {
      return null;
    }
    return this.tenantsService.findById(user.tenantId);
  }

  @Get('current/stats')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get current tenant dashboard stats' })
  async getStats(@CurrentUser() user: User) {
    if (!user.tenantId) {
      return null;
    }
    return this.tenantsService.getStats(user.tenantId);
  }

  @Put('current')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Update current tenant' })
  async updateCurrent(
    @CurrentUser() user: User,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    if (!user.tenantId) {
      return null;
    }
    return this.tenantsService.update(user.tenantId, updateTenantDto);
  }

  @Put('current/deposit-settings')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Update deposit settings' })
  @ApiResponse({ status: 200, description: 'Deposit settings updated' })
  async updateDepositSettings(
    @CurrentUser() user: User,
    @Body() dto: UpdateDepositSettingsDto,
  ) {
    if (!user.tenantId) {
      return null;
    }

    // Extract only deposit-related settings (not the totpCode)
    const { totpCode, ...depositSettings } = dto;

    const result = await this.tenantsService.update(user.tenantId, {
      settings: JSON.stringify(depositSettings),
    });

    this.logger.log(`Deposit settings updated by user ${user.id} for tenant ${user.tenantId}`);

    return {
      success: true,
      message: 'Configuración de depósitos actualizada correctamente',
      data: result,
    };
  }

  // Admin endpoints
  @Get('admin')
  @Roles('SUPER_ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'List all tenants (admin only)' })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
  ) {
    return this.tenantsService.findAll(page, limit, status);
  }

  @Patch('admin/:id/status')
  @Roles('SUPER_ADMIN')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update tenant status (admin only)' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.tenantsService.updateStatus(id, status);
  }
}
