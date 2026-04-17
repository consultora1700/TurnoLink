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
import { AuthService } from '../auth/auth.service';
import { CrossPlatformService } from './cross-platform.service';
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
import { Public } from '../../common/decorators/public.decorator';

@Controller('admin')
@Public()
@UseGuards(AdminKeyGuard)
@UseInterceptors(AuditLogInterceptor)
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(
    private readonly adminService: AdminService,
    private readonly authService: AuthService,
    private readonly crossPlatform: CrossPlatformService,
  ) {}

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
    const local = await this.adminService.getOverviewStats();
    if (!this.crossPlatform.isEnabled) return local;

    const remote = await this.crossPlatform.forwardRead('/admin/stats/overview');
    if (!remote.success) return { ...local, _platforms: { turnolink: local } };

    return this.crossPlatform.mergeStats(local, remote.data);
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
    const l = limit ? parseInt(limit) : 5;
    const local = await this.adminService.getRecentTenants(l);
    if (!this.crossPlatform.isEnabled) return local;

    const remote = await this.crossPlatform.forwardRead<any[]>('/admin/dashboard/recent-tenants', { limit: String(l) });
    if (!remote.success || !Array.isArray(remote.data)) return this.crossPlatform.tagPlatform(local, 'turnolink');

    const merged = [
      ...this.crossPlatform.tagPlatform(local, 'turnolink'),
      ...this.crossPlatform.tagPlatform(remote.data, this.crossPlatform.platformName),
    ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, l);
    return merged;
  }

  @Get('dashboard/recent-alerts')
  async getRecentAlerts(@Query('limit') limit?: string) {
    return this.adminService.getRecentAlerts(limit ? parseInt(limit) : 5);
  }

  // ==================== TENANTS ====================

  @Get('tenants')
  async getTenants(@Query() filter: TenantFilterDto) {
    const local = await this.adminService.getTenants(filter);
    if (!this.crossPlatform.isEnabled) return local;

    const queryParams: Record<string, string> = {};
    if (filter.page) queryParams.page = String(filter.page);
    if (filter.limit) queryParams.limit = String(filter.limit);
    if ((filter as any).search) queryParams.search = (filter as any).search;
    if ((filter as any).status) queryParams.status = (filter as any).status;

    const remote = await this.crossPlatform.forwardRead<any>('/admin/tenants', queryParams);
    if (!remote.success || !remote.data?.data) return { ...local, data: this.crossPlatform.tagPlatform(local.data, 'turnolink') };

    return this.crossPlatform.mergePaginated(local, remote.data);
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
    const local = await this.adminService.getUsers(filter);
    if (!this.crossPlatform.isEnabled) return local;

    const queryParams: Record<string, string> = {};
    if (filter.page) queryParams.page = String(filter.page);
    if (filter.limit) queryParams.limit = String(filter.limit);
    if ((filter as any).search) queryParams.search = (filter as any).search;

    const remote = await this.crossPlatform.forwardRead<any>('/admin/users', queryParams);
    if (!remote.success || !remote.data?.data) return { ...local, data: this.crossPlatform.tagPlatform(local.data, 'turnolink') };

    return this.crossPlatform.mergePaginated(local, remote.data);
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

  // ==================== MAP ====================

  @Get('map/entities')
  async getMapEntities(@Query('type') type?: string) {
    return this.adminService.getMapEntities(type);
  }

  // ==================== PASSWORD RESET ====================

  /**
   * Send password reset emails to one or more users.
   * Useful for migrated accounts that need to set their own password.
   * POST /admin/send-password-reset
   * Body: { emails: string[] }  OR  { tenantId: string } (all owners of that tenant)
   */
  @Post('send-password-reset')
  async sendPasswordReset(
    @Body() body: { emails?: string[]; tenantId?: string },
  ) {
    const emails: string[] = [];

    if (body.emails?.length) {
      emails.push(...body.emails);
    }

    if (body.tenantId) {
      const owners = await this.adminService.getTenantOwnerEmails(body.tenantId);
      emails.push(...owners);
    }

    if (!emails.length) {
      return { sent: 0, message: 'No emails provided' };
    }

    const unique = [...new Set(emails)];
    const results: { email: string; status: string; platform: string }[] = [];

    // Send locally
    for (const email of unique) {
      try {
        await this.authService.forgotPassword(email);
        results.push({ email, status: 'sent', platform: 'turnolink' });
      } catch {
        results.push({ email, status: 'not_found_local', platform: 'turnolink' });
      }
    }

    // Forward to remote platform too (user might exist on colmen)
    if (this.crossPlatform.isEnabled) {
      const remote = await this.crossPlatform.forwardWrite('POST', '/admin/send-password-reset', body);
      if (remote.success && remote.data?.results) {
        for (const r of remote.data.results as any[]) {
          results.push({ email: r.email, status: r.status, platform: this.crossPlatform.platformName });
        }
      }
    }

    const sent = results.filter(r => r.status === 'sent').length;
    this.logger.log(`Password reset: ${sent} sent across platforms`);

    return { sent, total: unique.length, results };
  }
}
