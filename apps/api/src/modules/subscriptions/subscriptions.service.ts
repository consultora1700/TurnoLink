import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { EmailNotificationsService } from '../notifications/email-notifications.service';

interface MPPreapprovalResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
  status: string;
}

interface MPPreapprovalPlan {
  id: string;
  status: string;
  reason: string;
  auto_recurring: {
    frequency: number;
    frequency_type: string;
    transaction_amount: number;
    currency_id: string;
  };
}

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private emailNotifications: EmailNotificationsService,
  ) {}

  // ============ PLANS ============

  async getPlans() {
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    // Parse features JSON string to array
    return plans.map(plan => ({
      ...plan,
      features: this.parseFeatures(plan.features),
    }));
  }

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

  async getPlanById(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return {
      ...plan,
      features: this.parseFeatures(plan.features),
    };
  }

  async getPlanBySlug(slug: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { slug },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    return {
      ...plan,
      features: this.parseFeatures(plan.features),
    };
  }

  // ============ SUBSCRIPTIONS ============

  async getSubscription(tenantId: string) {
    let subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: {
        plan: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!subscription) return null;

    // Auto-downgrade expired trials to Free plan
    if (subscription.status === 'TRIALING' && subscription.trialEndAt) {
      const now = new Date();
      if (now > subscription.trialEndAt) {
        const downgraded = await this.autoDowngradeToFree(subscription.id, tenantId);
        if (downgraded) {
          subscription = downgraded;
        }
      }
    }

    // Parse features JSON string to array
    return {
      ...subscription,
      plan: {
        ...subscription.plan,
        features: this.parseFeatures(subscription.plan.features),
      },
    };
  }

  private async autoDowngradeToFree(subscriptionId: string, tenantId: string) {
    const freePlan = await this.prisma.subscriptionPlan.findUnique({
      where: { slug: 'gratis' },
    });

    if (!freePlan) {
      this.logger.error('Free plan not found for auto-downgrade');
      return this.prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: { plan: true, payments: { orderBy: { createdAt: 'desc' }, take: 5 } },
      });
    }

    this.logger.log(`Auto-downgrading tenant ${tenantId} to Free plan (trial expired)`);

    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        planId: freePlan.id,
        status: 'ACTIVE',
        trialStartAt: null,
        trialEndAt: null,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 100), // "Forever"
      },
      include: {
        plan: true,
        payments: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
  }

  async createTrialSubscription(tenantId: string, planSlug: string = 'profesional') {
    // Check if subscription already exists
    const existing = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (existing) {
      throw new BadRequestException('Subscription already exists for this tenant');
    }

    // Get the plan
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { slug: planSlug },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    // Calculate trial dates
    const trialStartAt = new Date();
    const trialEndAt = new Date();
    trialEndAt.setDate(trialEndAt.getDate() + plan.trialDays);

    // Create subscription in trial status
    const subscription = await this.prisma.subscription.create({
      data: {
        tenantId,
        planId: plan.id,
        status: 'TRIALING',
        billingPeriod: 'MONTHLY',
        trialStartAt,
        trialEndAt,
        currentPeriodStart: trialStartAt,
        currentPeriodEnd: trialEndAt,
      },
      include: {
        plan: true,
      },
    });

    this.logger.log(`Trial subscription created for tenant ${tenantId}`);

    // Parse features JSON string to array
    return {
      ...subscription,
      plan: {
        ...subscription.plan,
        features: this.parseFeatures(subscription.plan.features),
      },
    };
  }

  async activateSubscription(
    tenantId: string,
    billingPeriod: 'MONTHLY' | 'YEARLY' = 'MONTHLY',
  ) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Calculate period dates
    const now = new Date();
    const periodEnd = new Date();
    if (billingPeriod === 'MONTHLY') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    // Update subscription
    const updated = await this.prisma.subscription.update({
      where: { tenantId },
      data: {
        status: 'ACTIVE',
        billingPeriod,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      include: { plan: true },
    });

    this.logger.log(`Subscription activated for tenant ${tenantId}`);

    // Parse features JSON string to array
    return {
      ...updated,
      plan: {
        ...updated.plan,
        features: this.parseFeatures(updated.plan.features),
      },
    };
  }

  async cancelSubscription(tenantId: string, reason?: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Update to cancelled
    const updated = await this.prisma.subscription.update({
      where: { tenantId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: reason,
      },
      include: { plan: true },
    });

    this.logger.log(`Subscription cancelled for tenant ${tenantId}`);

    // Parse features JSON string to array
    return {
      ...updated,
      plan: {
        ...updated.plan,
        features: this.parseFeatures(updated.plan.features),
      },
    };
  }

  // ============ SUBSCRIPTION STATUS ============

  async checkTrialStatus(tenantId: string): Promise<{
    isTrialing: boolean;
    isActive: boolean;
    isExpired: boolean;
    daysRemaining: number;
    status: string;
  }> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });

    if (!subscription) {
      return {
        isTrialing: false,
        isActive: false,
        isExpired: true,
        daysRemaining: 0,
        status: 'NO_SUBSCRIPTION',
      };
    }

    const now = new Date();
    const endDate = subscription.trialEndAt || subscription.currentPeriodEnd;

    let daysRemaining = 0;
    if (endDate) {
      daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }

    const isExpired = subscription.status === 'EXPIRED' ||
      (endDate !== null && endDate !== undefined && now > endDate && !['ACTIVE'].includes(subscription.status));

    // Send trial expiring warning (only at 3 days remaining)
    if (subscription.status === 'TRIALING' && daysRemaining === 3) {
      this.sendTrialExpiringWarning(tenantId, subscription.plan.name, daysRemaining).catch(err => {
        this.logger.error('Failed to send trial warning', err);
      });
    }

    return {
      isTrialing: subscription.status === 'TRIALING',
      isActive: subscription.status === 'ACTIVE',
      isExpired,
      daysRemaining,
      status: subscription.status,
    };
  }

  private async sendTrialExpiringWarning(tenantId: string, planName: string, daysRemaining: number): Promise<void> {
    // Get tenant owner
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        users: {
          where: { role: 'OWNER' },
          take: 1,
        },
      },
    });

    if (!tenant?.users[0]) return;

    const owner = tenant.users[0];
    const slug = tenant.slug;

    // Check if we already sent a warning today (using a simple metadata approach)
    const today = new Date().toISOString().split('T')[0];
    const lastWarning = (tenant as any).lastTrialWarning;

    if (lastWarning === today) {
      return; // Already sent today
    }

    // Update last warning date (fire and forget)
    this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        // We'll use settings JSON to track this
        settings: JSON.stringify({
          ...JSON.parse((tenant.settings as string) || '{}'),
          lastTrialWarningDate: today,
        }),
      },
    }).catch(() => {}); // Ignore errors

    await this.emailNotifications.sendTrialExpiringEmail(
      owner.email,
      owner.name,
      planName,
      daysRemaining,
      slug,
    );

    this.logger.log(`Trial warning sent to ${owner.email} for tenant ${tenantId}`);
  }

  // ============ LIMITS CHECKING ============

  async checkLimit(tenantId: string, resource: 'branches' | 'employees' | 'services' | 'bookings' | 'customers'): Promise<{
    current: number;
    limit: number | null;
    hasReachedLimit: boolean;
  }> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });

    if (!subscription) {
      return { current: 0, limit: 1, hasReachedLimit: false };
    }

    let current = 0;
    let limit: number | null = null;

    switch (resource) {
      case 'branches':
        current = await this.prisma.branch.count({ where: { tenantId, isActive: true } });
        limit = subscription.plan.maxBranches;
        break;
      case 'employees':
        current = await this.prisma.employee.count({ where: { tenantId, isActive: true, deletedAt: null } });
        limit = subscription.plan.maxEmployees;
        break;
      case 'services':
        current = await this.prisma.service.count({ where: { tenantId, isActive: true, deletedAt: null } });
        limit = subscription.plan.maxServices;
        break;
      case 'bookings':
        // Count bookings in current month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        current = await this.prisma.booking.count({
          where: {
            tenantId,
            createdAt: { gte: startOfMonth },
          },
        });
        limit = subscription.plan.maxBookingsMonth;
        break;
      case 'customers':
        current = await this.prisma.customer.count({ where: { tenantId, deletedAt: null } });
        limit = subscription.plan.maxCustomers;
        break;
    }

    return {
      current,
      limit,
      hasReachedLimit: limit !== null && current >= limit,
    };
  }

  // ============ PAYMENTS ============

  async recordPayment(
    subscriptionId: string,
    amount: number,
    mpPaymentId?: string,
  ) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Calculate period
    const periodStart = new Date();
    const periodEnd = new Date();
    if (subscription.billingPeriod === 'MONTHLY') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    // Create payment record
    const payment = await this.prisma.subscriptionPayment.create({
      data: {
        subscriptionId,
        amount,
        currency: 'ARS',
        status: 'APPROVED',
        mpPaymentId,
        periodStart,
        periodEnd,
        paidAt: new Date(),
      },
    });

    // Update subscription period
    await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'ACTIVE',
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      },
    });

    this.logger.log(`Payment recorded for subscription ${subscriptionId}`);

    return payment;
  }

  // ============ MERCADO PAGO SUBSCRIPTIONS ============

  async createMPSubscription(
    tenantId: string,
    accessToken: string,
    payerEmail: string,
  ): Promise<{ initPoint: string; subscriptionId: string }> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const amount = subscription.billingPeriod === 'YEARLY'
      ? Number(subscription.plan.priceYearly || subscription.plan.priceMonthly)
      : Number(subscription.plan.priceMonthly);

    const frequencyType = subscription.billingPeriod === 'YEARLY' ? 'years' : 'months';
    const frequency = 1;

    // Create preapproval (subscription) in Mercado Pago
    const preapprovalData = {
      reason: `Suscripción ${subscription.plan.name} - TurnoLink`,
      auto_recurring: {
        frequency,
        frequency_type: frequencyType,
        transaction_amount: amount,
        currency_id: 'ARS',
      },
      back_url: `${this.configService.get('APP_URL')}/configuracion/pagos?subscription=success`,
      payer_email: payerEmail,
    };

    const response = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preapprovalData),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Failed to create MP subscription: ${error}`);
      throw new BadRequestException('Failed to create subscription. Please try again.');
    }

    const mpSubscription: MPPreapprovalResponse = await response.json();

    // Update subscription with MP ID
    await this.prisma.subscription.update({
      where: { tenantId },
      data: {
        mpSubscriptionId: mpSubscription.id,
      },
    });

    return {
      initPoint: mpSubscription.init_point,
      subscriptionId: mpSubscription.id,
    };
  }

  // ============ SEED PLANS ============

  async seedDefaultPlans() {
    // Precios de Lanzamiento - Después de 3 meses: Profesional $10,990, Negocio $16,990
    const plans = [
      {
        name: 'Gratis',
        slug: 'gratis',
        description: 'Perfecto para empezar y probar TurnoLink',
        priceMonthly: new Prisma.Decimal(0),
        priceYearly: new Prisma.Decimal(0),
        currency: 'ARS',
        trialDays: 0,
        maxBranches: 1,
        maxEmployees: 2,
        maxServices: 5,
        maxBookingsMonth: 30,
        maxCustomers: 50,
        features: JSON.stringify(['whatsapp_confirmation', 'email_reminder', 'calendar', 'basic_reports']),
        isPopular: false,
        isActive: true,
        order: 0,
      },
      {
        name: 'Profesional',
        slug: 'profesional',
        description: 'Ideal para profesionales independientes',
        priceMonthly: new Prisma.Decimal(8990),
        priceYearly: new Prisma.Decimal(89900),
        currency: 'ARS',
        trialDays: 14,
        maxBranches: 1,
        maxEmployees: 5,
        maxServices: 20,
        maxBookingsMonth: 150,
        maxCustomers: 500,
        features: JSON.stringify(['whatsapp_confirmation', 'email_reminder', 'calendar', 'advanced_reports', 'mercadopago', 'whatsapp_support']),
        isPopular: true,
        isActive: true,
        order: 1,
      },
      {
        name: 'Negocio',
        slug: 'negocio',
        description: 'Para negocios en crecimiento con equipo',
        priceMonthly: new Prisma.Decimal(14990),
        priceYearly: new Prisma.Decimal(149900),
        currency: 'ARS',
        trialDays: 14,
        maxBranches: 5,
        maxEmployees: 15,
        maxServices: null as number | null,
        maxBookingsMonth: null as number | null,
        maxCustomers: null as number | null,
        features: JSON.stringify(['whatsapp_confirmation', 'email_reminder', 'calendar', 'complete_reports', 'mercadopago', 'priority_support', 'multi_branch']),
        isPopular: false,
        isActive: true,
        order: 2,
      },
    ];

    for (const plan of plans) {
      await this.prisma.subscriptionPlan.upsert({
        where: { slug: plan.slug },
        create: plan,
        update: plan,
      });
    }

    this.logger.log('Default subscription plans seeded');
  }

  // ============ FREE PLAN HELPERS ============

  async createFreeSubscription(tenantId: string, throwIfExists: boolean = true) {
    // Check if subscription already exists
    const existing = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });

    if (existing) {
      if (throwIfExists) {
        throw new BadRequestException('Subscription already exists for this tenant');
      }
      // Return existing subscription silently (used during registration)
      return {
        ...existing,
        plan: {
          ...existing.plan,
          features: this.parseFeatures(existing.plan.features),
        },
      };
    }

    // Get the free plan
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { slug: 'gratis' },
    });

    if (!plan) {
      throw new NotFoundException('Free plan not found');
    }

    // Create subscription as active (free plan is always active)
    const subscription = await this.prisma.subscription.create({
      data: {
        tenantId,
        planId: plan.id,
        status: 'ACTIVE',
        billingPeriod: 'MONTHLY',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 100), // "Forever"
      },
      include: {
        plan: true,
      },
    });

    this.logger.log(`Free subscription created for tenant ${tenantId}`);

    return {
      ...subscription,
      plan: {
        ...subscription.plan,
        features: this.parseFeatures(subscription.plan.features),
      },
    };
  }

  async getPaymentHistory(tenantId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (!subscription) {
      return [];
    }

    const payments = await this.prisma.subscriptionPayment.findMany({
      where: { subscriptionId: subscription.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return payments.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      periodStart: payment.periodStart,
      periodEnd: payment.periodEnd,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
    }));
  }

  async upgradePlan(tenantId: string, newPlanSlug: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const newPlan = await this.prisma.subscriptionPlan.findUnique({
      where: { slug: newPlanSlug },
    });

    if (!newPlan) {
      throw new NotFoundException('Plan not found');
    }

    // Update to new plan with trial
    const trialStartAt = new Date();
    const trialEndAt = new Date();
    trialEndAt.setDate(trialEndAt.getDate() + newPlan.trialDays);

    const updated = await this.prisma.subscription.update({
      where: { tenantId },
      data: {
        planId: newPlan.id,
        status: newPlan.trialDays > 0 ? 'TRIALING' : 'ACTIVE',
        trialStartAt: newPlan.trialDays > 0 ? trialStartAt : null,
        trialEndAt: newPlan.trialDays > 0 ? trialEndAt : null,
        currentPeriodStart: trialStartAt,
        currentPeriodEnd: trialEndAt,
      },
      include: { plan: true },
    });

    this.logger.log(`Subscription upgraded to ${newPlanSlug} for tenant ${tenantId}`);

    return {
      ...updated,
      plan: {
        ...updated.plan,
        features: this.parseFeatures(updated.plan.features),
      },
    };
  }
}
