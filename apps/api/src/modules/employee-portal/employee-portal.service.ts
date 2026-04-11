import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EmployeePortalService {
  private readonly logger = new Logger(EmployeePortalService.name);

  // Max employees with portal access on basic employee_portal plans (Profesional tier)
  private readonly PORTAL_BASIC_MAX_EMPLOYEES = 3;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Feature Gating ───

  private parseFeatures(features: any): string[] {
    if (Array.isArray(features)) return features;
    if (typeof features === 'string') {
      try {
        const parsed = JSON.parse(features);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  async getTenantPortalFeatures(tenantId: string): Promise<{
    hasPortal: boolean;
    hasAdvanced: boolean;
    maxPortalEmployees: number | null;
    features: string[];
  }> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });

    if (!subscription || !subscription.plan) {
      return { hasPortal: false, hasAdvanced: false, maxPortalEmployees: 0, features: [] };
    }

    const features = this.parseFeatures(subscription.plan.features);
    const hasPortal = features.includes('employee_portal');
    const hasAdvanced = features.includes('employee_portal_advanced');

    return {
      hasPortal,
      hasAdvanced,
      maxPortalEmployees: hasAdvanced ? null : (hasPortal ? this.PORTAL_BASIC_MAX_EMPLOYEES : 0),
      features,
    };
  }

  async assertPortalAccess(tenantId: string): Promise<{ hasAdvanced: boolean }> {
    const portalFeatures = await this.getTenantPortalFeatures(tenantId);
    if (!portalFeatures.hasPortal) {
      throw new ForbiddenException(
        'El portal de empleados no está disponible en tu plan actual. Actualizá al plan Profesional o superior.',
      );
    }
    return { hasAdvanced: portalFeatures.hasAdvanced };
  }

  async assertAdvancedPortalAccess(tenantId: string): Promise<void> {
    const portalFeatures = await this.getTenantPortalFeatures(tenantId);
    if (!portalFeatures.hasAdvanced) {
      throw new ForbiddenException(
        'Esta función requiere el plan Business o superior.',
      );
    }
  }

  async assertCanInviteMore(tenantId: string): Promise<void> {
    const portalFeatures = await this.getTenantPortalFeatures(tenantId);
    if (!portalFeatures.hasPortal) {
      throw new ForbiddenException(
        'El portal de empleados no está disponible en tu plan actual.',
      );
    }

    if (portalFeatures.maxPortalEmployees !== null) {
      // Count employees that already have portal access (userId linked)
      const linkedCount = await this.prisma.employee.count({
        where: { tenantId, userId: { not: null } },
      });
      if (linkedCount >= portalFeatures.maxPortalEmployees) {
        throw new ForbiddenException(
          `Tu plan permite hasta ${portalFeatures.maxPortalEmployees} empleados con acceso al portal. Actualizá al plan Business para acceso ilimitado.`,
        );
      }
    }
  }

  async assertRoleAllowed(tenantId: string, role: string): Promise<void> {
    const portalFeatures = await this.getTenantPortalFeatures(tenantId);
    if (!portalFeatures.hasAdvanced && (role === 'MANAGER' || role === 'VIEWER')) {
      throw new ForbiddenException(
        `El rol ${role} solo está disponible en el plan Business. Tu plan permite el rol STAFF.`,
      );
    }
  }

  // ─── Audit ───

  async createAuditLog(data: {
    tenantId: string;
    userId?: string;
    employeeId?: string;
    action: string;
    entity: string;
    entityId?: string;
    metadata?: object;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.employeeAuditLog.create({
      data: {
        tenantId: data.tenantId,
        userId: data.userId || null,
        employeeId: data.employeeId || null,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId || null,
        metadata: data.metadata ? (data.metadata as any) : undefined,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      },
    }).catch((err) => {
      this.logger.error(`Failed to create audit log: ${err.message}`);
    });
  }

  // ─── Profile ───

  async getMyProfile(employeeId: string, tenantId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
      include: {
        employeeServices: { include: { service: { select: { id: true, name: true, price: true, duration: true } } } },
        employeeSpecialties: { include: { specialty: { select: { id: true, name: true, slug: true } } } },
      },
    });
    if (!employee) throw new NotFoundException('Empleado no encontrado');
    return employee;
  }

  async updateMyProfile(
    employeeId: string,
    tenantId: string,
    data: { name?: string; phone?: string; bio?: string; image?: string; credentials?: string },
  ) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
    });
    if (!employee) throw new NotFoundException('Empleado no encontrado');

    return this.prisma.employee.update({
      where: { id: employeeId },
      data,
    });
  }

  // ─── Agenda ───

  async getMyAgenda(
    employeeId: string,
    tenantId: string,
    params: { from?: string; to?: string; status?: string },
  ) {
    const where: Record<string, unknown> = {
      tenantId,
      employeeId,
    };

    if (params.from || params.to) {
      where.date = {};
      if (params.from) (where.date as Record<string, unknown>).gte = new Date(params.from);
      if (params.to) (where.date as Record<string, unknown>).lte = new Date(params.to);
    }

    if (params.status) {
      where.status = params.status;
    }

    return this.prisma.booking.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        service: { select: { id: true, name: true, duration: true, price: true } },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  async getAgendaStats(employeeId: string, tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const [todayCount, weekCount, monthCount, completedMonth, nextBooking] = await Promise.all([
      this.prisma.booking.count({
        where: { employeeId, tenantId, date: { gte: today, lt: tomorrow }, status: { not: 'CANCELLED' } },
      }),
      this.prisma.booking.count({
        where: { employeeId, tenantId, date: { gte: weekStart, lt: weekEnd }, status: { not: 'CANCELLED' } },
      }),
      this.prisma.booking.count({
        where: { employeeId, tenantId, date: { gte: monthStart, lt: monthEnd }, status: { not: 'CANCELLED' } },
      }),
      this.prisma.booking.count({
        where: { employeeId, tenantId, date: { gte: monthStart, lt: monthEnd }, status: 'COMPLETED' },
      }),
      this.prisma.booking.findFirst({
        where: {
          employeeId,
          tenantId,
          date: { gte: today },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        select: { id: true, date: true, startTime: true, service: { select: { name: true } }, customer: { select: { name: true } } },
      }),
    ]);

    return {
      today: todayCount,
      week: weekCount,
      month: monthCount,
      completedRate: monthCount > 0 ? Math.round((completedMonth / monthCount) * 100) : 0,
      nextBooking,
    };
  }

  // ─── Availability ───

  async getMyAvailability(employeeId: string) {
    return this.prisma.employeeSchedule.findMany({
      where: { employeeId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async updateMyAvailability(
    employeeId: string,
    schedules: Array<{ dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }>,
  ) {
    // Delete all existing and recreate
    await this.prisma.$transaction([
      this.prisma.employeeSchedule.deleteMany({ where: { employeeId } }),
      ...schedules.map((s) =>
        this.prisma.employeeSchedule.create({
          data: { employeeId, ...s },
        }),
      ),
    ]);

    return this.prisma.employeeSchedule.findMany({
      where: { employeeId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  // ─── Blocked Dates ───

  async getBlockedDates(employeeId: string, params?: { from?: string; to?: string }) {
    const where: Record<string, unknown> = { employeeId };
    if (params?.from || params?.to) {
      where.date = {};
      if (params?.from) (where.date as Record<string, unknown>).gte = new Date(params.from);
      if (params?.to) (where.date as Record<string, unknown>).lte = new Date(params.to);
    }
    return this.prisma.employeeBlockedDate.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }

  async createBlockedDate(employeeId: string, data: { date: string; reason?: string }) {
    return this.prisma.employeeBlockedDate.create({
      data: {
        employeeId,
        date: new Date(data.date),
        reason: data.reason,
      },
    });
  }

  async deleteBlockedDate(employeeId: string, blockedDateId: string) {
    const bd = await this.prisma.employeeBlockedDate.findFirst({
      where: { id: blockedDateId, employeeId },
    });
    if (!bd) throw new NotFoundException('Fecha bloqueada no encontrada');
    return this.prisma.employeeBlockedDate.delete({ where: { id: blockedDateId } });
  }

  // ─── Clients ───

  async getMyClients(employeeId: string, tenantId: string) {
    // Get unique customer IDs from bookings assigned to this employee
    const bookings = await this.prisma.booking.findMany({
      where: { employeeId, tenantId },
      select: { customerId: true },
      distinct: ['customerId'],
    });

    const customerIds = bookings.map((b) => b.customerId).filter((id): id is string => id !== null);
    if (customerIds.length === 0) return [];

    return this.prisma.customer.findMany({
      where: { id: { in: customerIds }, tenantId },
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
        _count: { select: { bookings: { where: { employeeId } } } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getMyClient(employeeId: string, tenantId: string, clientId: string) {
    // Verify this client has booked with this employee
    const hasBooking = await this.prisma.booking.findFirst({
      where: { employeeId, tenantId, customerId: clientId },
    });
    if (!hasBooking) throw new ForbiddenException('No tenés acceso a este cliente');

    const customer = await this.prisma.customer.findFirst({
      where: { id: clientId, tenantId },
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
      },
    });
    if (!customer) throw new NotFoundException('Cliente no encontrado');

    const bookingHistory = await this.prisma.booking.findMany({
      where: { employeeId, tenantId, customerId: clientId },
      include: { service: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
      take: 20,
    });

    return { ...customer, bookings: bookingHistory };
  }

  // ─── Activity Feed ───

  async getActivity(employeeId: string, tenantId: string, limit = 20) {
    return this.prisma.employeeAuditLog.findMany({
      where: { employeeId, tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // ─── Team Management (OWNER/MANAGER) ───

  async getTeam(tenantId: string) {
    return this.prisma.employee.findMany({
      where: { tenantId, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        employeeRole: true,
        isActive: true,
        userId: true,
        user: { select: { lastLoginAt: true } },
        createdAt: true,
      },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
  }

  async inviteEmployee(
    tenantId: string,
    invitedByUserId: string,
    employeeId: string,
    email: string,
    role: 'OWNER' | 'MANAGER' | 'STAFF' | 'VIEWER',
  ) {
    // Check portal access and limits
    await this.assertCanInviteMore(tenantId);
    await this.assertRoleAllowed(tenantId, role);

    // Verify employee exists and belongs to tenant
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
    });
    if (!employee) throw new NotFoundException('Empleado no encontrado');

    if (employee.userId) {
      throw new BadRequestException('Este empleado ya tiene una cuenta vinculada');
    }

    // Cancel any pending invitations for this employee
    await this.prisma.employeeInvitation.updateMany({
      where: { employeeId, acceptedAt: null },
      data: { expiresAt: new Date() },
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const invitation = await this.prisma.employeeInvitation.create({
      data: {
        tenantId,
        employeeId,
        email,
        token,
        role,
        expiresAt,
      },
    });

    // Send invitation email async
    this.sendInvitationEmail(email, employee.name, token, tenantId).catch((err) => {
      this.logger.error(`Failed to send invitation email: ${err.message}`);
    });

    return invitation;
  }

  async getPendingInvitations(tenantId: string) {
    return this.prisma.employeeInvitation.findMany({
      where: { tenantId, acceptedAt: null, expiresAt: { gt: new Date() } },
      include: { employee: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async changeEmployeeRole(
    tenantId: string,
    employeeId: string,
    newRole: 'OWNER' | 'MANAGER' | 'STAFF' | 'VIEWER',
  ) {
    // Check role is allowed by plan
    await this.assertRoleAllowed(tenantId, newRole);

    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
    });
    if (!employee) throw new NotFoundException('Empleado no encontrado');

    return this.prisma.employee.update({
      where: { id: employeeId },
      data: { employeeRole: newRole },
    });
  }

  async revokeAccess(tenantId: string, employeeId: string, revokerRole: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
    });
    if (!employee) throw new NotFoundException('Empleado no encontrado');

    // MANAGER can only revoke STAFF/VIEWER
    if (revokerRole === 'MANAGER' && (employee.employeeRole === 'OWNER' || employee.employeeRole === 'MANAGER')) {
      throw new ForbiddenException('No podés revocar acceso a este rol');
    }

    // Unlink user from employee
    await this.prisma.employee.update({
      where: { id: employeeId },
      data: { userId: null, employeeRole: 'STAFF' },
    });

    // Deactivate user if they exist
    if (employee.userId) {
      await this.prisma.user.update({
        where: { id: employee.userId },
        data: { isActive: false },
      });
    }

    return { message: 'Acceso revocado exitosamente' };
  }

  // ─── Audit Log (OWNER/MANAGER) ───

  async getAuditLog(
    tenantId: string,
    params: { employeeId?: string; action?: string; from?: string; to?: string; page?: number; limit?: number },
  ) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const where: Record<string, unknown> = { tenantId };

    if (params.employeeId) where.employeeId = params.employeeId;
    if (params.action) where.action = params.action;
    if (params.from || params.to) {
      where.createdAt = {};
      if (params.from) (where.createdAt as Record<string, unknown>).gte = new Date(params.from);
      if (params.to) (where.createdAt as Record<string, unknown>).lte = new Date(params.to);
    }

    const [data, total] = await Promise.all([
      this.prisma.employeeAuditLog.findMany({
        where,
        include: {
          employee: { select: { id: true, name: true } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.employeeAuditLog.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── Invitation Validation (Public) ───

  async validateInvitation(token: string) {
    const invitation = await this.prisma.employeeInvitation.findUnique({
      where: { token },
      include: {
        tenant: { select: { id: true, name: true, slug: true, logo: true } },
        employee: { select: { id: true, name: true } },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitación no encontrada');
    }

    if (invitation.acceptedAt) {
      throw new BadRequestException('Esta invitación ya fue aceptada');
    }

    const expired = new Date() > invitation.expiresAt;

    return {
      valid: !expired,
      expired,
      email: invitation.email,
      role: invitation.role,
      tenant: invitation.tenant,
      employee: invitation.employee,
    };
  }

  // ─── Email ───

  private async sendInvitationEmail(to: string, employeeName: string, token: string, tenantId: string) {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    const fromEmail = this.configService.get<string>('EMAIL_FROM') || 'noreply@turnolink.com';
    const appUrl = this.configService.get<string>('APP_URL') || 'https://turnolink.com.ar';

    if (!resendApiKey) {
      this.logger.warn('RESEND_API_KEY not configured, skipping invitation email');
      return;
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true },
    });

    const inviteUrl = `${appUrl}/invitacion/${token}`;

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Invitación - TurnoLink</title>
</head>
<body style="margin: 0; padding: 0; width: 100%; -webkit-font-smoothing: antialiased; background-color: #f3f4f6;">
  <div style="display: none; max-height: 0; overflow: hidden;">
    Te invitaron a unirte a ${tenant?.name || 'un negocio'} en TurnoLink
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px;">
          <tr>
            <td style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <!-- Header with integrated logo -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #3F8697 0%, #346E7D 100%); padding: 32px 32px 36px;">
                    <!-- Logo -->
                    <img src="https://turnolink.com.ar/logo-email-white.png" alt="TurnoLink" width="120" style="display: block; height: auto; border: 0; margin: 0 auto 24px; opacity: 0.9;" />
                    <h1 style="margin: 0; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 21px; font-weight: 600;">
                      Te invitaron a unirte
                    </h1>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding: 40px 32px;">
                    <h2 style="margin: 0 0 8px 0; color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 20px;">
                      Hola ${employeeName}
                    </h2>
                    <p style="margin: 0 0 24px 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 15px; line-height: 1.6;">
                      <strong>${tenant?.name || 'Un negocio'}</strong> te invitó a unirte a su equipo en TurnoLink.
                      Vas a poder gestionar tu trabajo y clientes desde tu propio portal.
                    </p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" style="padding-bottom: 24px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td align="center" style="background: linear-gradient(135deg, #3F8697 0%, #346E7D 100%); border-radius: 12px;">
                                <a href="${inviteUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 15px; font-weight: 600; text-decoration: none;">
                                  Aceptar invitación
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 0; color: #9ca3af; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 13px;">
                      Esta invitación expira en 7 días.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 24px 16px;">
              <p style="margin: 0; color: #d1d5db; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 11px;">
                &copy; ${new Date().getFullYear()} TurnoLink
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: `TurnoLink <${fromEmail}>`,
          to: [to],
          subject: `Te invitaron a ${tenant?.name || 'un negocio'} en TurnoLink`,
          html,
        }),
      });
      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Failed to send invitation email: ${error}`);
      }
    } catch (error) {
      this.logger.error(`Error sending invitation email: ${error}`);
    }
  }
}
