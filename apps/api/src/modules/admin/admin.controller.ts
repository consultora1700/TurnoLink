import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  Req,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { AdminService } from './admin.service';
import { AdminKeyGuard } from './guards/admin-key.guard';
import { AuditLogInterceptor } from './interceptors/audit-log.interceptor';
import {
  TenantFilterDto,
  UpdateTenantStatusDto,
  AuditLogFilterDto,
  SecurityAlertFilterDto,
  ResolveAlertDto,
  SubscriptionFilterDto,
  UpdateSubscriptionDto,
  ExtendTrialDto,
  PaymentFilterDto,
  UserFilterDto,
} from './dto';

@Controller('admin')
@UseGuards(AdminKeyGuard)
@UseInterceptors(AuditLogInterceptor)
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly adminService: AdminService) {}

  private getClientIp(request: Request): string {
    const xForwardedFor = request.headers['x-forwarded-for'];
    if (xForwardedFor) {
      const ips = (xForwardedFor as string).split(',');
      return ips[0].trim();
    }
    return request.ip || request.socket.remoteAddress || 'unknown';
  }

  // ==================== DASHBOARD & STATS ====================

  @Get('stats/overview')
  async getOverviewStats() {
    return this.adminService.getOverviewStats();
  }

  @Get('stats/revenue')
  async getRevenueStats(@Query('period') period?: string) {
    return this.adminService.getRevenueStats(period);
  }

  @Get('stats/growth')
  async getGrowthStats() {
    return this.adminService.getGrowthStats();
  }

  @Get('stats/churn')
  async getChurnStats() {
    return this.adminService.getChurnStats();
  }

  @Get('stats/subscription-distribution')
  async getSubscriptionDistribution() {
    return this.adminService.getSubscriptionDistribution();
  }

  @Get('dashboard/recent-tenants')
  async getRecentTenants(@Query('limit') limit?: string) {
    return this.adminService.getRecentTenants(limit ? parseInt(limit) : 5);
  }

  @Get('dashboard/recent-alerts')
  async getRecentAlerts(@Query('limit') limit?: string) {
    return this.adminService.getRecentAlerts(limit ? parseInt(limit) : 5);
  }

  // ==================== TENANTS ====================

  @Get('tenants')
  async getTenants(@Query() filter: TenantFilterDto) {
    return this.adminService.getTenants(filter);
  }

  @Get('tenants/:id')
  async getTenantById(@Param('id') id: string) {
    return this.adminService.getTenantById(id);
  }

  @Patch('tenants/:id/status')
  async updateTenantStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTenantStatusDto,
    @Req() req: Request,
  ) {
    return this.adminService.updateTenantStatus(id, dto, this.getClientIp(req));
  }

  @Get('tenants/:id/activity')
  async getTenantActivity(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getTenantActivity(
      id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  // ==================== SUBSCRIPTIONS ====================

  @Get('subscriptions')
  async getSubscriptions(@Query() filter: SubscriptionFilterDto) {
    return this.adminService.getSubscriptions(filter);
  }

  @Get('subscriptions/expiring')
  async getExpiringSubscriptions(@Query('days') days?: string) {
    return this.adminService.getExpiringSubscriptions(days ? parseInt(days) : 7);
  }

  @Get('subscriptions/trials')
  async getTrialSubscriptions() {
    return this.adminService.getTrialSubscriptions();
  }

  @Patch('subscriptions/:id')
  async updateSubscription(
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionDto,
    @Req() req: Request,
  ) {
    return this.adminService.updateSubscription(id, dto, this.getClientIp(req));
  }

  @Post('subscriptions/:id/extend-trial')
  async extendTrial(
    @Param('id') id: string,
    @Body() dto: ExtendTrialDto,
    @Req() req: Request,
  ) {
    return this.adminService.extendTrial(id, dto, this.getClientIp(req));
  }

  @Get('subscription-plans')
  async getSubscriptionPlans() {
    return this.adminService.getSubscriptionPlans();
  }

  // ==================== PAYMENTS ====================

  @Get('payments')
  async getPayments(@Query() filter: PaymentFilterDto) {
    return this.adminService.getPayments(filter);
  }

  @Get('payments/stats')
  async getPaymentStats() {
    return this.adminService.getPaymentStats();
  }

  @Get('payments/failed')
  async getFailedPayments() {
    return this.adminService.getFailedPayments();
  }

  // ==================== USERS ====================

  @Get('users')
  async getUsers(@Query() filter: UserFilterDto) {
    return this.adminService.getUsers(filter);
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  // ==================== SECURITY ====================

  @Get('security/audit-logs')
  async getAuditLogs(@Query() filter: AuditLogFilterDto) {
    return this.adminService.getAuditLogs(filter);
  }

  @Get('security/alerts')
  async getSecurityAlerts(@Query() filter: SecurityAlertFilterDto) {
    return this.adminService.getSecurityAlerts(filter);
  }

  @Get('security/login-attempts')
  async getLoginAttempts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getLoginAttempts(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }

  @Post('security/alerts/:id/resolve')
  async resolveSecurityAlert(
    @Param('id') id: string,
    @Body() dto: ResolveAlertDto,
    @Req() req: Request,
  ) {
    return this.adminService.resolveSecurityAlert(id, dto, this.getClientIp(req));
  }

  @Get('security/metrics')
  async getSecurityMetrics() {
    return this.adminService.getSecurityMetrics();
  }
}
