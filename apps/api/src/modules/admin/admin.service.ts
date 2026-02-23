import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import {
  PlatformOverviewStats,
  RevenueStats,
  GrowthStats,
  ChurnStats,
  SubscriptionDistribution,
  TenantDetails,
  PaymentStats,
  SecurityMetrics,
} from './interfaces/admin-stats.interface';
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

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  // ==================== DASHBOARD & STATS ====================

  async getOverviewStats(): Promise<PlatformOverviewStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get counts
    const [
      totalTenants,
      newTenantsThisMonth,
      tenantsLastMonth,
      totalUsers,
      newUsersThisMonth,
      totalBookings,
      bookingsThisMonth,
      activeSubscriptions,
      trialSubscriptions,
      paidSubscriptions,
      revenueThisMonth,
      revenueLastMonth,
    ] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      this.prisma.tenant.count({
        where: {
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      this.prisma.booking.count(),
      this.prisma.booking.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      this.prisma.subscription.count({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.subscription.count({
        where: { status: 'TRIALING' },
      }),
      this.prisma.subscription.count({
        where: { status: { in: ['ACTIVE', 'PAST_DUE'] } },
      }),
      this.prisma.subscriptionPayment.aggregate({
        where: {
          status: 'APPROVED',
          paidAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      this.prisma.subscriptionPayment.aggregate({
        where: {
          status: 'APPROVED',
          paidAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _sum: { amount: true },
      }),
    ]);

    const mrrCurrent = Number(revenueThisMonth._sum.amount || 0);
    const mrrLast = Number(revenueLastMonth._sum.amount || 0);
    const mrrGrowth = mrrLast > 0 ? ((mrrCurrent - mrrLast) / mrrLast) * 100 : 0;

    // Calculate conversion rate (trial to paid)
    const totalTrialsCompleted = await this.prisma.subscription.count({
      where: {
        trialEndAt: { lt: now },
      },
    });
    const conversions = await this.prisma.subscription.count({
      where: {
        trialEndAt: { lt: now },
        status: { in: ['ACTIVE', 'PAST_DUE'] },
      },
    });
    const conversionRate = totalTrialsCompleted > 0
      ? (conversions / totalTrialsCompleted) * 100
      : 0;

    return {
      mrr: mrrCurrent,
      mrrGrowth: Math.round(mrrGrowth * 10) / 10,
      totalTenants,
      newTenantsThisMonth,
      totalUsers,
      newUsersThisMonth,
      conversionRate: Math.round(conversionRate * 10) / 10,
      totalBookings,
      bookingsThisMonth,
    };
  }

  async getRevenueStats(period: string = '12months'): Promise<RevenueStats> {
    const now = new Date();
    let startDate: Date;
    let groupBy: 'day' | 'month';

    switch (period) {
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = 'day';
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        groupBy = 'day';
        break;
      case '12months':
      default:
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        groupBy = 'month';
        break;
    }

    const payments = await this.prisma.subscriptionPayment.findMany({
      where: {
        status: 'APPROVED',
        paidAt: { gte: startDate },
      },
      orderBy: { paidAt: 'asc' },
    });

    // Group by period
    const grouped = new Map<string, { revenue: number; payments: number }>();

    for (const payment of payments) {
      if (!payment.paidAt) continue;

      let key: string;
      if (groupBy === 'day') {
        key = payment.paidAt.toISOString().split('T')[0];
      } else {
        key = `${payment.paidAt.getFullYear()}-${String(payment.paidAt.getMonth() + 1).padStart(2, '0')}`;
      }

      const existing = grouped.get(key) || { revenue: 0, payments: 0 };
      existing.revenue += Number(payment.amount);
      existing.payments += 1;
      grouped.set(key, existing);
    }

    const data = Array.from(grouped.entries())
      .map(([date, { revenue, payments }]) => ({
        date,
        revenue,
        payments,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
    const totalPayments = data.reduce((sum, d) => sum + d.payments, 0);

    return {
      period,
      data,
      totalRevenue,
      averagePayment: totalPayments > 0 ? totalRevenue / totalPayments : 0,
    };
  }

  async getGrowthStats(): Promise<GrowthStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalTenants,
      tenantsThisMonth,
      tenantsLastMonth,
      totalUsers,
      usersThisMonth,
      usersLastMonth,
      totalBookings,
      bookingsThisMonth,
      bookingsLastMonth,
    ] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      this.prisma.tenant.count({
        where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
      this.prisma.booking.count(),
      this.prisma.booking.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      this.prisma.booking.count({
        where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
    ]);

    const calcGrowth = (current: number, last: number) =>
      last > 0 ? Math.round(((current - last) / last) * 100 * 10) / 10 : 0;

    return {
      tenants: {
        total: totalTenants,
        thisMonth: tenantsThisMonth,
        lastMonth: tenantsLastMonth,
        growthPercentage: calcGrowth(tenantsThisMonth, tenantsLastMonth),
      },
      users: {
        total: totalUsers,
        thisMonth: usersThisMonth,
        lastMonth: usersLastMonth,
        growthPercentage: calcGrowth(usersThisMonth, usersLastMonth),
      },
      bookings: {
        total: totalBookings,
        thisMonth: bookingsThisMonth,
        lastMonth: bookingsLastMonth,
        growthPercentage: calcGrowth(bookingsThisMonth, bookingsLastMonth),
      },
    };
  }

  async getChurnStats(): Promise<ChurnStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      cancelledThisMonth,
      cancelledLastMonth,
      totalActiveStart,
      cancelledSubscriptions,
    ] = await Promise.all([
      this.prisma.subscription.count({
        where: {
          status: 'CANCELLED',
          cancelledAt: { gte: startOfMonth },
        },
      }),
      this.prisma.subscription.count({
        where: {
          status: 'CANCELLED',
          cancelledAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
      this.prisma.subscription.count({
        where: {
          createdAt: { lt: startOfMonth },
          OR: [
            { status: { in: ['ACTIVE', 'PAST_DUE'] } },
            { cancelledAt: { gte: startOfMonth } },
          ],
        },
      }),
      this.prisma.subscription.findMany({
        where: {
          status: 'CANCELLED',
          cancelledAt: { gte: startOfLastMonth },
        },
        select: {
          cancelReason: true,
        },
      }),
    ]);

    // Calculate churn rate
    const churnRate = totalActiveStart > 0
      ? (cancelledThisMonth / totalActiveStart) * 100
      : 0;

    // Count reasons
    const reasonCounts = new Map<string, number>();
    for (const sub of cancelledSubscriptions) {
      const reason = sub.cancelReason || 'No especificado';
      reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
    }

    const totalCancelled = cancelledSubscriptions.length;
    const reasons = Array.from(reasonCounts.entries())
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: totalCancelled > 0 ? Math.round((count / totalCancelled) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Find at-risk tenants (inactive for 30+ days)
    const atRiskTenants = await this.prisma.tenant.findMany({
      where: {
        subscription: {
          status: { in: ['ACTIVE', 'TRIALING'] },
        },
        bookings: {
          none: {
            createdAt: { gte: thirtyDaysAgo },
          },
        },
      },
      include: {
        subscription: true,
      },
      take: 10,
    });

    return {
      churnRate: Math.round(churnRate * 10) / 10,
      cancelledThisMonth,
      cancelledLastMonth,
      reasons,
      atRiskTenants: atRiskTenants.map(t => ({
        id: t.id,
        name: t.name,
        lastActivity: t.updatedAt,
        subscriptionStatus: t.subscription?.status || 'NONE',
      })),
    };
  }

  async getSubscriptionDistribution(): Promise<SubscriptionDistribution[]> {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] },
      },
      include: {
        plan: true,
      },
    });

    const planCounts = new Map<string, { count: number; revenue: number; planName: string }>();

    for (const sub of subscriptions) {
      const planId = sub.planId;
      const planName = sub.plan?.name || 'Desconocido';
      const monthlyPrice = Number(sub.plan?.priceMonthly || 0);

      const existing = planCounts.get(planId) || { count: 0, revenue: 0, planName };
      existing.count += 1;
      existing.revenue += monthlyPrice;
      planCounts.set(planId, existing);
    }

    const total = subscriptions.length;

    return Array.from(planCounts.values())
      .map(({ planName, count, revenue }) => ({
        planName,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        revenue,
      }))
      .sort((a, b) => b.count - a.count);
  }

  // ==================== TENANTS ====================

  async getTenants(filter: TenantFilterDto) {
    const {
      search,
      status,
      subscriptionStatus,
      planId,
      createdFrom,
      createdTo,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (subscriptionStatus || planId) {
      where.subscription = {};
      if (subscriptionStatus) {
        where.subscription.status = subscriptionStatus;
      }
      if (planId) {
        where.subscription.planId = planId;
      }
    }

    if (createdFrom || createdTo) {
      where.createdAt = {};
      if (createdFrom) where.createdAt.gte = new Date(createdFrom);
      if (createdTo) where.createdAt.lte = new Date(createdTo);
    }

    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        include: {
          subscription: {
            include: { plan: true },
          },
          _count: {
            select: {
              bookings: true,
              customers: true,
              employees: true,
              services: true,
              branches: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return {
      data: tenants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTenantById(id: string): Promise<TenantDetails> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        subscription: {
          include: { plan: true, payments: { take: 10, orderBy: { createdAt: 'desc' } } },
        },
        users: { select: { id: true, email: true, name: true, role: true, isActive: true } },
        _count: {
          select: {
            bookings: true,
            customers: true,
            employees: true,
            services: true,
            branches: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Get recent activity
    const recentLogs = await this.prisma.auditLog.findMany({
      where: { tenantId: id },
      orderBy: { timestamp: 'desc' },
      take: 20,
    });

    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      email: tenant.email,
      phone: tenant.phone,
      status: tenant.status,
      createdAt: tenant.createdAt,
      subscription: tenant.subscription
        ? {
            plan: tenant.subscription.plan?.name || 'Unknown',
            status: tenant.subscription.status,
            trialEndAt: tenant.subscription.trialEndAt,
            currentPeriodEnd: tenant.subscription.currentPeriodEnd,
          }
        : null,
      stats: {
        totalBookings: tenant._count.bookings,
        totalCustomers: tenant._count.customers,
        totalEmployees: tenant._count.employees,
        totalServices: tenant._count.services,
        totalBranches: tenant._count.branches,
      },
      recentActivity: recentLogs.map(log => ({
        action: log.action,
        timestamp: log.timestamp,
        details: typeof log.details === 'string' ? log.details : JSON.stringify(log.details),
      })),
    };
  }

  async updateTenantStatus(id: string, dto: UpdateTenantStatusDto, adminIp: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const updated = await this.prisma.tenant.update({
      where: { id },
      data: { status: dto.status },
    });

    // Log the action
    await this.prisma.auditLog.create({
      data: {
        action: dto.status === 'SUSPENDED' ? 'SUSPEND' : 'REACTIVATE',
        entityType: 'Tenant',
        entityId: id,
        tenantId: id,
        ipAddress: adminIp,
        details: {
          previousStatus: tenant.status,
          newStatus: dto.status,
          reason: dto.reason,
        },
        severity: 'WARNING',
      },
    });

    return updated;
  }

  async getTenantActivity(id: string, page: number = 1, limit: number = 50) {
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId: id },
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where: { tenantId: id } }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ==================== SUBSCRIPTIONS ====================

  async getSubscriptions(filter: SubscriptionFilterDto) {
    const {
      search,
      status,
      planId,
      billingPeriod,
      expiringBefore,
      createdFrom,
      createdTo,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (planId) {
      where.planId = planId;
    }

    if (billingPeriod) {
      where.billingPeriod = billingPeriod;
    }

    if (expiringBefore) {
      where.OR = [
        { trialEndAt: { lte: new Date(expiringBefore) } },
        { currentPeriodEnd: { lte: new Date(expiringBefore) } },
      ];
    }

    if (createdFrom || createdTo) {
      where.createdAt = {};
      if (createdFrom) where.createdAt.gte = new Date(createdFrom);
      if (createdTo) where.createdAt.lte = new Date(createdTo);
    }

    if (search) {
      where.tenant = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        include: {
          tenant: { select: { id: true, name: true, slug: true, email: true } },
          plan: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return {
      data: subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getExpiringSubscriptions(days: number = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.subscription.findMany({
      where: {
        status: { in: ['ACTIVE', 'TRIALING'] },
        OR: [
          {
            status: 'TRIALING',
            trialEndAt: { lte: futureDate, gte: new Date() },
          },
          {
            status: 'ACTIVE',
            currentPeriodEnd: { lte: futureDate, gte: new Date() },
          },
        ],
      },
      include: {
        tenant: { select: { id: true, name: true, slug: true, email: true } },
        plan: true,
      },
      orderBy: { trialEndAt: 'asc' },
    });
  }

  async getTrialSubscriptions() {
    return this.prisma.subscription.findMany({
      where: { status: 'TRIALING' },
      include: {
        tenant: { select: { id: true, name: true, slug: true, email: true } },
        plan: true,
      },
      orderBy: { trialEndAt: 'asc' },
    });
  }

  async updateSubscription(id: string, dto: UpdateSubscriptionDto, adminIp: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const updateData: any = {};

    if (dto.planId) updateData.planId = dto.planId;
    if (dto.status) updateData.status = dto.status;
    if (dto.billingPeriod) updateData.billingPeriod = dto.billingPeriod;
    if (dto.trialEndAt) updateData.trialEndAt = new Date(dto.trialEndAt);
    if (dto.currentPeriodEnd) updateData.currentPeriodEnd = new Date(dto.currentPeriodEnd);

    const updated = await this.prisma.subscription.update({
      where: { id },
      data: updateData,
      include: { tenant: true, plan: true },
    });

    // Log the action
    await this.prisma.auditLog.create({
      data: {
        action: 'SUBSCRIPTION_CHANGE',
        entityType: 'Subscription',
        entityId: id,
        tenantId: subscription.tenantId,
        ipAddress: adminIp,
        details: {
          changes: JSON.parse(JSON.stringify(dto)),
          notes: dto.notes,
        },
        severity: 'INFO',
      },
    });

    return updated;
  }

  async extendTrial(id: string, dto: ExtendTrialDto, adminIp: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status !== 'TRIALING') {
      throw new BadRequestException('Subscription is not in trial period');
    }

    const currentEndDate = subscription.trialEndAt || new Date();
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(newEndDate.getDate() + dto.days);

    const updated = await this.prisma.subscription.update({
      where: { id },
      data: { trialEndAt: newEndDate },
      include: { tenant: true, plan: true },
    });

    // Log the action
    await this.prisma.auditLog.create({
      data: {
        action: 'EXTEND_TRIAL',
        entityType: 'Subscription',
        entityId: id,
        tenantId: subscription.tenantId,
        ipAddress: adminIp,
        details: {
          previousEndDate: currentEndDate,
          newEndDate,
          daysExtended: dto.days,
          reason: dto.reason,
        },
        severity: 'INFO',
      },
    });

    return updated;
  }

  // ==================== PAYMENTS ====================

  async getPayments(filter: PaymentFilterDto) {
    const {
      search,
      status,
      tenantId,
      from,
      to,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (tenantId) {
      where.subscription = { tenantId };
    }

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [payments, total] = await Promise.all([
      this.prisma.subscriptionPayment.findMany({
        where,
        include: {
          subscription: {
            include: {
              tenant: { select: { id: true, name: true, slug: true } },
              plan: { select: { name: true } },
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.subscriptionPayment.count({ where }),
    ]);

    return {
      data: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPaymentStats(): Promise<PaymentStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalThisMonth, successful, failed, pending] = await Promise.all([
      this.prisma.subscriptionPayment.aggregate({
        where: { createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.subscriptionPayment.count({
        where: { status: 'APPROVED', createdAt: { gte: startOfMonth } },
      }),
      this.prisma.subscriptionPayment.count({
        where: { status: 'REJECTED', createdAt: { gte: startOfMonth } },
      }),
      this.prisma.subscriptionPayment.count({
        where: { status: 'PENDING', createdAt: { gte: startOfMonth } },
      }),
    ]);

    return {
      totalThisMonth: Number(totalThisMonth._sum.amount || 0),
      successfulPayments: successful,
      failedPayments: failed,
      pendingPayments: pending,
      averagePaymentAmount:
        totalThisMonth._count > 0
          ? Number(totalThisMonth._sum.amount || 0) / totalThisMonth._count
          : 0,
    };
  }

  async getFailedPayments() {
    return this.prisma.subscriptionPayment.findMany({
      where: { status: 'REJECTED' },
      include: {
        subscription: {
          include: {
            tenant: { select: { id: true, name: true, slug: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // ==================== USERS ====================

  async getUsers(filter: UserFilterDto) {
    const {
      search,
      role,
      isActive,
      emailVerified,
      tenantId,
      createdFrom,
      createdTo,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (emailVerified !== undefined) where.emailVerified = emailVerified === 'true';
    if (tenantId) where.tenantId = tenantId;

    if (createdFrom || createdTo) {
      where.createdAt = {};
      if (createdFrom) where.createdAt.gte = new Date(createdFrom);
      if (createdTo) where.createdAt.lte = new Date(createdTo);
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          tenant: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            subscription: { include: { plan: true } },
          },
        },
        totpSecret: { select: { isEnabled: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // ==================== SECURITY ====================

  async getAuditLogs(filter: AuditLogFilterDto) {
    const {
      action,
      entityType,
      userId,
      tenantId,
      ipAddress,
      severity,
      from,
      to,
      page = 1,
      limit = 50,
    } = filter;

    const where: any = {};

    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (userId) where.userId = userId;
    if (tenantId) where.tenantId = tenantId;
    if (ipAddress) where.ipAddress = { contains: ipAddress };
    if (severity) where.severity = severity;

    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp.gte = new Date(from);
      if (to) where.timestamp.lte = new Date(to);
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSecurityAlerts(filter: SecurityAlertFilterDto) {
    const { type, severity, resolved, from, to, page = 1, limit = 20 } = filter;

    const where: any = {};

    if (type) where.type = type;
    if (severity) where.severity = severity;
    if (resolved !== undefined) where.resolved = resolved === 'true';

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [alerts, total] = await Promise.all([
      this.prisma.securityAlert.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.securityAlert.count({ where }),
    ]);

    return {
      data: alerts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getLoginAttempts(page: number = 1, limit: number = 50) {
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: {
          action: { in: ['LOGIN', 'LOGIN_FAILED', 'ADMIN_LOGIN', 'ADMIN_LOGIN_FAILED'] },
        },
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({
        where: {
          action: { in: ['LOGIN', 'LOGIN_FAILED', 'ADMIN_LOGIN', 'ADMIN_LOGIN_FAILED'] },
        },
      }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async resolveSecurityAlert(id: string, dto: ResolveAlertDto, adminIp: string) {
    const alert = await this.prisma.securityAlert.findUnique({
      where: { id },
    });

    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    if (alert.resolved) {
      throw new BadRequestException('Alert is already resolved');
    }

    const updated = await this.prisma.securityAlert.update({
      where: { id },
      data: {
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy: 'admin',
      },
    });

    // Log the action
    await this.prisma.auditLog.create({
      data: {
        action: 'RESOLVE_ALERT',
        entityType: 'SecurityAlert',
        entityId: id,
        ipAddress: adminIp,
        details: {
          alertType: alert.type,
          notes: dto.notes,
        },
        severity: 'INFO',
      },
    });

    return updated;
  }

  async getSecurityMetrics(): Promise<SecurityMetrics> {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      loginsLast24h,
      totalUsersWithTotp,
      enabledTotp,
      uniqueIPs,
      activeSessions,
      failedAttempts,
    ] = await Promise.all([
      this.prisma.auditLog.count({
        where: {
          action: 'LOGIN',
          timestamp: { gte: last24h },
        },
      }),
      this.prisma.user.count(),
      this.prisma.totpSecret.count({
        where: { isEnabled: true },
      }),
      this.prisma.auditLog.findMany({
        where: { timestamp: { gte: last24h } },
        select: { ipAddress: true },
        distinct: ['ipAddress'],
      }),
      this.prisma.adminSession.count({
        where: {
          isActive: true,
          expiresAt: { gt: now },
        },
      }),
      this.prisma.auditLog.count({
        where: {
          action: { in: ['LOGIN_FAILED', 'ADMIN_LOGIN_FAILED'] },
          timestamp: { gte: last24h },
        },
      }),
    ]);

    return {
      loginsLast24h,
      twoFactorEnabled: enabledTotp,
      twoFactorPercentage:
        totalUsersWithTotp > 0 ? Math.round((enabledTotp / totalUsersWithTotp) * 100) : 0,
      uniqueIPs: uniqueIPs.length,
      activeSessions,
      failedLoginAttempts: failedAttempts,
    };
  }

  // ==================== RECENT ITEMS ====================

  async getRecentTenants(limit: number = 5) {
    return this.prisma.tenant.findMany({
      include: {
        subscription: { include: { plan: true } },
        _count: {
          select: {
            bookings: true,
            customers: true,
            employees: true,
            services: true,
            branches: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getRecentAlerts(limit: number = 5) {
    return this.prisma.securityAlert.findMany({
      where: { resolved: false },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // ==================== SUBSCRIPTION PLANS ====================

  async getSubscriptionPlans() {
    return this.prisma.subscriptionPlan.findMany({
      orderBy: { order: 'asc' },
    });
  }
}
