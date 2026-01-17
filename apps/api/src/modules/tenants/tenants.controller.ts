import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Query,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@ApiTags('tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TenantsController {
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
