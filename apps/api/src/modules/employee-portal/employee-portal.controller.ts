import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EmployeePortalService } from './employee-portal.service';
import { EmployeeRoleGuard } from '../../common/guards/employee-role.guard';
import { EmployeeRoles } from '../../common/decorators/employee-roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { SkipSubscriptionCheck } from '../../common/decorators/skip-subscription-check.decorator';
import { UpdateProfileDto, UpdateAvailabilityDto, CreateBlockedDateDto, InviteEmployeeDto, ChangeRoleDto } from './dto';

@ApiTags('employee-portal')
@Controller('employee-portal')
@SkipSubscriptionCheck()
@ApiBearerAuth()
export class EmployeePortalController {
  constructor(private readonly portalService: EmployeePortalService) {}

  private getEmployeeId(req: any): string {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      // For OWNER users, they might not have an employeeId — check if they're accessing as owner
      if (req.user?.role === 'OWNER') {
        return '__owner__';
      }
      throw new Error('Employee ID not found in token');
    }
    return employeeId;
  }

  private getTenantId(req: any): string {
    return req.tenantId || req.user?.tenantId;
  }

  private async auditAction(req: any, action: string, entity: string, entityId?: string, metadata?: object) {
    const tenantId = this.getTenantId(req);
    const employeeId = req.user?.employeeId;
    await this.portalService.createAuditLog({
      tenantId,
      userId: req.user?.id,
      employeeId: employeeId || undefined,
      action,
      entity,
      entityId,
      metadata,
      ipAddress: req.ip || req.headers?.['x-forwarded-for'],
      userAgent: req.headers?.['user-agent'],
    });
  }

  // ─── Portal Features ───

  @Get('features')
  @ApiOperation({ summary: 'Get portal features for current tenant plan' })
  async getPortalFeatures(@Req() req: any) {
    return this.portalService.getTenantPortalFeatures(this.getTenantId(req));
  }

  // ─── Profile ───

  @Get('me')
  @ApiOperation({ summary: 'Get current employee profile' })
  async getMyProfile(@Req() req: any) {
    await this.portalService.assertPortalAccess(this.getTenantId(req));
    const employeeId = this.getEmployeeId(req);
    return this.portalService.getMyProfile(employeeId, this.getTenantId(req));
  }

  @Patch('me')
  @UseGuards(EmployeeRoleGuard)
  @EmployeeRoles('OWNER', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'Update own profile' })
  async updateMyProfile(
    @Req() req: any,
    @Body() body: UpdateProfileDto,
  ) {
    const employeeId = this.getEmployeeId(req);
    const result = await this.portalService.updateMyProfile(employeeId, this.getTenantId(req), body);
    await this.auditAction(req, 'UPDATE_PROFILE', 'Employee', employeeId, body);
    return result;
  }

  // ─── Agenda ───

  @Get('agenda')
  @ApiOperation({ summary: 'Get my bookings' })
  async getMyAgenda(
    @Req() req: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('status') status?: string,
  ) {
    const employeeId = this.getEmployeeId(req);
    return this.portalService.getMyAgenda(employeeId, this.getTenantId(req), { from, to, status });
  }

  @Get('agenda/stats')
  @ApiOperation({ summary: 'Get agenda statistics' })
  async getAgendaStats(@Req() req: any) {
    const employeeId = this.getEmployeeId(req);
    return this.portalService.getAgendaStats(employeeId, this.getTenantId(req));
  }

  // ─── Availability ───

  @Get('availability')
  @ApiOperation({ summary: 'Get my availability schedule' })
  async getAvailability(@Req() req: any) {
    const employeeId = this.getEmployeeId(req);
    return this.portalService.getMyAvailability(employeeId);
  }

  @Put('availability')
  @UseGuards(EmployeeRoleGuard)
  @EmployeeRoles('OWNER', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'Update my availability schedule' })
  async updateAvailability(
    @Req() req: any,
    @Body() body: UpdateAvailabilityDto,
  ) {
    const employeeId = this.getEmployeeId(req);
    const result = await this.portalService.updateMyAvailability(employeeId, body.schedules);
    await this.auditAction(req, 'UPDATE_AVAILABILITY', 'Schedule', employeeId);
    return result;
  }

  // ─── Blocked Dates ───

  @Get('blocked-dates')
  @ApiOperation({ summary: 'Get my blocked dates' })
  async getBlockedDates(
    @Req() req: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const employeeId = this.getEmployeeId(req);
    return this.portalService.getBlockedDates(employeeId, { from, to });
  }

  @Post('blocked-dates')
  @UseGuards(EmployeeRoleGuard)
  @EmployeeRoles('OWNER', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'Block a date' })
  async createBlockedDate(
    @Req() req: any,
    @Body() body: CreateBlockedDateDto,
  ) {
    const employeeId = this.getEmployeeId(req);
    const result = await this.portalService.createBlockedDate(employeeId, body);
    await this.auditAction(req, 'BLOCK_DATE', 'BlockedDate', undefined, body);
    return result;
  }

  @Delete('blocked-dates/:id')
  @UseGuards(EmployeeRoleGuard)
  @EmployeeRoles('OWNER', 'MANAGER', 'STAFF')
  @ApiOperation({ summary: 'Delete a blocked date' })
  async deleteBlockedDate(@Req() req: any, @Param('id') id: string) {
    const employeeId = this.getEmployeeId(req);
    const result = await this.portalService.deleteBlockedDate(employeeId, id);
    await this.auditAction(req, 'UNBLOCK_DATE', 'BlockedDate', id);
    return result;
  }

  // ─── Clients ───

  @Get('clients')
  @ApiOperation({ summary: 'Get my clients (data minimized)' })
  async getMyClients(@Req() req: any) {
    const employeeId = this.getEmployeeId(req);
    return this.portalService.getMyClients(employeeId, this.getTenantId(req));
  }

  @Get('clients/:id')
  @ApiOperation({ summary: 'Get client detail with booking history' })
  async getMyClient(@Req() req: any, @Param('id') id: string) {
    const employeeId = this.getEmployeeId(req);
    await this.auditAction(req, 'VIEW_CLIENT', 'Client', id);
    return this.portalService.getMyClient(employeeId, this.getTenantId(req), id);
  }

  // ─── Activity ───

  @Get('activity')
  @ApiOperation({ summary: 'Get recent activity feed' })
  async getActivity(@Req() req: any, @Query('limit') limit?: string) {
    const employeeId = this.getEmployeeId(req);
    return this.portalService.getActivity(employeeId, this.getTenantId(req), limit ? parseInt(limit, 10) : 20);
  }

  // ─── Team (OWNER/MANAGER) ───

  @Get('team')
  @UseGuards(EmployeeRoleGuard)
  @EmployeeRoles('OWNER', 'MANAGER')
  @ApiOperation({ summary: 'Get team members' })
  async getTeam(@Req() req: any) {
    return this.portalService.getTeam(this.getTenantId(req));
  }

  @Post('invitations')
  @UseGuards(EmployeeRoleGuard)
  @EmployeeRoles('OWNER', 'MANAGER')
  @ApiOperation({ summary: 'Invite employee to portal' })
  async inviteEmployee(
    @Req() req: any,
    @Body() body: InviteEmployeeDto,
  ) {
    const result = await this.portalService.inviteEmployee(
      this.getTenantId(req),
      req.user.id,
      body.employeeId,
      body.email,
      body.role,
    );
    await this.auditAction(req, 'INVITE_EMPLOYEE', 'Invitation', result.id, { email: body.email, role: body.role });
    return result;
  }

  @Get('invitations')
  @UseGuards(EmployeeRoleGuard)
  @EmployeeRoles('OWNER', 'MANAGER')
  @ApiOperation({ summary: 'Get pending invitations' })
  async getPendingInvitations(@Req() req: any) {
    return this.portalService.getPendingInvitations(this.getTenantId(req));
  }

  @Patch('team/:id/role')
  @UseGuards(EmployeeRoleGuard)
  @EmployeeRoles('OWNER')
  @ApiOperation({ summary: 'Change employee role (OWNER only)' })
  async changeRole(
    @Req() req: any,
    @Param('id') employeeId: string,
    @Body() body: ChangeRoleDto,
  ) {
    const result = await this.portalService.changeEmployeeRole(this.getTenantId(req), employeeId, body.role);
    await this.auditAction(req, 'CHANGE_ROLE', 'Employee', employeeId, { newRole: body.role });
    return result;
  }

  @Delete('team/:id/access')
  @UseGuards(EmployeeRoleGuard)
  @EmployeeRoles('OWNER', 'MANAGER')
  @ApiOperation({ summary: 'Revoke employee access' })
  async revokeAccess(@Req() req: any, @Param('id') employeeId: string) {
    const revokerRole = req.user?.employeeRole || req.user?.role;
    const result = await this.portalService.revokeAccess(this.getTenantId(req), employeeId, revokerRole);
    await this.auditAction(req, 'REVOKE_ACCESS', 'Employee', employeeId);
    return result;
  }

  // ─── Audit Log (OWNER/MANAGER) ───

  @Get('audit-log')
  @UseGuards(EmployeeRoleGuard)
  @EmployeeRoles('OWNER', 'MANAGER')
  @ApiOperation({ summary: 'Get audit log (Business plan only)' })
  async getAuditLog(
    @Req() req: any,
    @Query('employeeId') employeeId?: string,
    @Query('action') action?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    await this.portalService.assertAdvancedPortalAccess(this.getTenantId(req));
    return this.portalService.getAuditLog(this.getTenantId(req), {
      employeeId,
      action,
      from,
      to,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  // ─── Public: Validate Invitation ───

  @Public()
  @Get('invitations/validate/:token')
  @ApiOperation({ summary: 'Validate invitation token (public)' })
  async validateInvitation(@Param('token') token: string) {
    return this.portalService.validateInvitation(token);
  }
}
