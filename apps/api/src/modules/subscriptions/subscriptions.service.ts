import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmailNotificationsService } from '../notifications/email-notifications.service';
import { SubscriptionEvent, PlanPriceUpdatedPayload } from '../../common/events';

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
    private eventEmitter: EventEmitter2,
  ) {}

  // ============ PLANS ============

  async getPlans(industryGroupSlug?: string) {
    const where: any = { isActive: true };

    if (industryGroupSlug) {
      const group = await this.prisma.industryGroup.findUnique({
        where: { slug: industryGroupSlug },
      });
      if (!group) {
        return []; // Group not found — return empty instead of all plans
      }
      where.industryGroupId = group.id;
    }

    const plans = await this.prisma.subscriptionPlan.findMany({
      where,
      orderBy: { order: 'asc' },
      include: { industryGroup: true },
    });

    // Parse features JSON string to array
    return plans.map(plan => ({
      ...plan,
      features: this.parseFeatures(plan.features),
      industryGroup: plan.industryGroup ? {
        ...plan.industryGroup,
        industries: this.parseJson(plan.industryGroup.industries),
        limitLabels: this.parseJson(plan.industryGroup.limitLabels),
      } : null,
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

    if (!plan || !plan.isActive) {
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
        plan: {
          include: { industryGroup: true },
        },
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
        industryGroup: (subscription.plan as any).industryGroup ? {
          ...(subscription.plan as any).industryGroup,
          industries: this.parseJson((subscription.plan as any).industryGroup.industries),
          limitLabels: this.parseJson((subscription.plan as any).industryGroup.limitLabels),
        } : null,
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
        include: { plan: { include: { industryGroup: true } }, payments: { orderBy: { createdAt: 'desc' }, take: 5 } },
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
        plan: { include: { industryGroup: true } },
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
      // Si ya usó trial, no puede iniciar otro
      if (existing.hasUsedTrial) {
        throw new BadRequestException('Ya utilizaste tu período de prueba. Elegí un plan pago para continuar.');
      }
      throw new BadRequestException('Subscription already exists for this tenant');
    }

    // Get the plan
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { slug: planSlug },
    });

    if (!plan || !plan.isActive) {
      throw new NotFoundException('Plan not found');
    }

    // Calculate trial dates
    const now = new Date();
    const isFree = Number(plan.priceMonthly) === 0 && Number(plan.priceYearly) === 0;

    // Free plans → ACTIVE immediately, no trial needed
    if (isFree) {
      const farFuture = new Date('2099-12-31T23:59:59.999Z');
      const subscription = await this.prisma.subscription.create({
        data: {
          tenantId,
          planId: plan.id,
          status: 'ACTIVE',
          billingPeriod: 'MONTHLY',
          currentPeriodStart: now,
          currentPeriodEnd: farFuture,
          hasUsedTrial: false,
        },
        include: { plan: true },
      });

      this.logger.log(`Free subscription created for tenant ${tenantId}`);
      return {
        ...subscription,
        plan: { ...subscription.plan, features: this.parseFeatures(subscription.plan.features) },
      };
    }

    // Paid plans → TRIALING
    const trialStartAt = now;
    const trialEndAt = new Date(now);
    trialEndAt.setDate(trialEndAt.getDate() + plan.trialDays);

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
        hasUsedTrial: true,
      },
      include: { plan: true },
    });

    this.logger.log(`Trial subscription created for tenant ${tenantId}`);
    return {
      ...subscription,
      plan: { ...subscription.plan, features: this.parseFeatures(subscription.plan.features) },
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

    // Send cancellation email (fire-and-forget)
    this.sendCancellationEmail(tenantId, updated.plan.name, updated.currentPeriodEnd).catch(err => {
      this.logger.error(`Failed to send cancellation email for tenant ${tenantId}: ${err.message}`);
    });

    // Parse features JSON string to array
    return {
      ...updated,
      plan: {
        ...updated.plan,
        features: this.parseFeatures(updated.plan.features),
      },
    };
  }

  private async sendCancellationEmail(tenantId: string, planName: string, accessUntil: Date | null): Promise<void> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { users: { where: { role: 'OWNER' }, take: 1 } },
    });

    if (!tenant?.users[0]) return;

    const owner = tenant.users[0];

    await this.emailNotifications.sendSubscriptionCancelledEmail(
      owner.email,
      owner.name,
      planName,
      accessUntil || new Date(),
    );
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

    // Send trial expiring warning (at 3 days and 1 day remaining)
    if (subscription.status === 'TRIALING' && (daysRemaining === 3 || daysRemaining === 1)) {
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

  async checkLimit(tenantId: string, resource: 'branches' | 'employees' | 'services' | 'bookings' | 'customers' | 'photos'): Promise<{
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
      case 'photos':
        // Count unique images: media records + product_images linked to tenant's products
        const [mediaCount, productImageCount] = await Promise.all([
          this.prisma.media.count({ where: { tenantId } }),
          this.prisma.productImage.count({
            where: { product: { tenantId } },
          }),
        ]);
        current = mediaCount + productImageCount;
        limit = subscription.plan.maxPhotos;
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
        maxPhotos: 500,
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
        maxPhotos: 3000,
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
        maxPhotos: null as number | null,
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

  // ============ INDUSTRY GROUPS SEED ============

  async seedIndustryPlans() {
    // Deactivate old generic plans (keep them for existing subscriptions)
    await this.prisma.subscriptionPlan.updateMany({
      where: { slug: { in: ['gratis', 'profesional', 'negocio'] } },
      data: { isActive: false },
    });

    const groups = [
      {
        slug: 'belleza',
        name: 'Belleza & Bienestar',
        description: 'Peluquerías, barberías, centros de estética, spas y más',
        industries: JSON.stringify([
          'peluquerias', 'barberias', 'centros-de-estetica', 'unas-nail-bars',
          'pestanas-y-cejas', 'depilacion', 'spa-y-relax', 'masajes',
          'bronceado', 'cosmetologia',
        ]),
        limitLabels: JSON.stringify({
          maxEmployees: 'estilistas',
          maxBranches: 'sucursales',
          maxBookingsMonth: 'turnos/mes',
          maxCustomers: 'clientes',
          maxServices: 'servicios',
          maxPhotos: 'fotos',
        }),
        order: 0,
        plans: [
          {
            name: 'Gratis',
            slug: 'belleza-gratis',
            description: 'Ideal para empezar con tu salón',
            priceMonthly: 0,
            priceYearly: 0,
            trialDays: 0,
            maxBranches: 1, maxEmployees: 2, maxServices: 5,
            maxBookingsMonth: 30, maxCustomers: 50, maxPhotos: 500,
            features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'basic_reports'],
            isPopular: false, order: 0,
          },
          {
            name: 'Profesional',
            slug: 'belleza-profesional',
            description: 'Para salones en crecimiento',
            priceMonthly: 14999,
            priceYearly: 149990,
            trialDays: 14,
            maxBranches: 1, maxEmployees: 5, maxServices: 20,
            maxBookingsMonth: null, maxCustomers: 500, maxPhotos: 3000,
            features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'advanced_reports', 'mercadopago', 'whatsapp_support'],
            isPopular: true, order: 1,
          },
          {
            name: 'Business',
            slug: 'belleza-business',
            description: 'Para cadenas y franquicias',
            priceMonthly: 29999,
            priceYearly: 299990,
            trialDays: 14,
            maxBranches: 5, maxEmployees: 15, maxServices: null,
            maxBookingsMonth: null, maxCustomers: null, maxPhotos: null,
            features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'complete_reports', 'mercadopago', 'priority_support', 'multi_branch', 'api_access'],
            isPopular: false, order: 2,
          },
        ],
      },
      {
        slug: 'salud',
        name: 'Salud & Profesionales',
        description: 'Consultorios, clínicas, profesionales de salud',
        industries: JSON.stringify([
          'consultorios-medicos', 'odontologos', 'nutricionistas',
          'kinesiologos', 'fonoaudiologos', 'psicologos',
          'abogados', 'contadores', 'escribanos',
        ]),
        limitLabels: JSON.stringify({
          maxEmployees: 'profesionales',
          maxBranches: 'consultorios',
          maxBookingsMonth: 'sesiones/mes',
          maxCustomers: 'pacientes',
          maxServices: 'servicios',
          maxPhotos: 'fotos',
        }),
        order: 1,
        plans: [
          {
            name: 'Starter',
            slug: 'salud-starter',
            description: 'Para profesionales independientes',
            priceMonthly: 16990,
            priceYearly: 169900,
            trialDays: 14,
            maxBranches: 1, maxEmployees: 1, maxServices: null,
            maxBookingsMonth: null, maxCustomers: null, maxPhotos: 500,
            features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'basic_reports', 'ficha_paciente'],
            isPopular: false, order: 0,
          },
          {
            name: 'Profesional',
            slug: 'salud-profesional',
            description: 'Para consultorios con equipo',
            priceMonthly: 29990,
            priceYearly: 299900,
            trialDays: 14,
            maxBranches: 2, maxEmployees: 5, maxServices: null,
            maxBookingsMonth: null, maxCustomers: null, maxPhotos: 3000,
            features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'advanced_reports', 'mercadopago', 'whatsapp_support', 'ficha_paciente', 'videollamada'],
            isPopular: true, order: 1,
          },
          {
            name: 'Clínica',
            slug: 'salud-clinica',
            description: 'Para clínicas y centros médicos',
            priceMonthly: 49990,
            priceYearly: 499900,
            trialDays: 14,
            maxBranches: null, maxEmployees: null, maxServices: null,
            maxBookingsMonth: null, maxCustomers: null, maxPhotos: null,
            features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'complete_reports', 'mercadopago', 'priority_support', 'multi_branch', 'api_access', 'ficha_paciente', 'videollamada'],
            isPopular: false, order: 2,
          },
        ],
      },
      {
        slug: 'deportes',
        name: 'Deportes & Recreación',
        description: 'Canchas, gimnasios, estudios de danza y más',
        industries: JSON.stringify([
          'canchas-de-futbol', 'canchas-de-padel', 'canchas-de-tenis',
          'canchas-de-basquet', 'estudios-de-danza', 'gimnasios',
          'entrenadores-personales', 'salas-de-ensayo', 'estudios-de-grabacion',
        ]),
        limitLabels: JSON.stringify({
          maxEmployees: null,
          maxBranches: 'espacios',
          maxBookingsMonth: 'reservas/mes',
          maxCustomers: 'socios',
          maxServices: 'servicios',
          maxPhotos: 'fotos',
        }),
        order: 2,
        plans: [
          {
            name: 'Gratis',
            slug: 'deportes-gratis',
            description: 'Ideal para empezar con tu espacio',
            priceMonthly: 0,
            priceYearly: 0,
            trialDays: 0,
            maxBranches: 1, maxEmployees: 1, maxServices: 5,
            maxBookingsMonth: 30, maxCustomers: 50, maxPhotos: 500,
            features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'basic_reports'],
            isPopular: false, order: 0,
          },
          {
            name: 'Profesional',
            slug: 'deportes-profesional',
            description: 'Para centros deportivos en crecimiento',
            priceMonthly: 14999,
            priceYearly: 149990,
            trialDays: 14,
            maxBranches: 5, maxEmployees: 5, maxServices: null,
            maxBookingsMonth: null, maxCustomers: 500, maxPhotos: 3000,
            features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'advanced_reports', 'mercadopago', 'whatsapp_support'],
            isPopular: true, order: 1,
          },
          {
            name: 'Business',
            slug: 'deportes-business',
            description: 'Para complejos deportivos',
            priceMonthly: 29999,
            priceYearly: 299990,
            trialDays: 14,
            maxBranches: null, maxEmployees: null, maxServices: null,
            maxBookingsMonth: null, maxCustomers: null, maxPhotos: null,
            features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'complete_reports', 'mercadopago', 'priority_support', 'multi_branch', 'api_access'],
            isPopular: false, order: 2,
          },
        ],
      },
      {
        slug: 'hospedaje-por-horas',
        name: 'Hospedaje por Horas',
        description: 'Albergues transitorios, hoteles por turno, hostels',
        industries: JSON.stringify([
          'albergues-transitorios', 'hoteles-por-turno', 'hostels',
          'habitaciones-12hs', 'boxes-privados',
        ]),
        limitLabels: JSON.stringify({
          maxEmployees: null,
          maxBranches: 'sucursales',
          maxBookingsMonth: 'reservas/mes',
          maxCustomers: 'clientes',
          maxServices: 'habitaciones',
          maxPhotos: 'fotos',
        }),
        order: 3,
        plans: [
          {
            name: 'Gratis',
            slug: 'hospedaje-gratis',
            description: 'Ideal para empezar',
            priceMonthly: 0,
            priceYearly: 0,
            trialDays: 0,
            maxBranches: 1, maxEmployees: 1, maxServices: 5,
            maxBookingsMonth: 30, maxCustomers: 50, maxPhotos: 500,
            features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'basic_reports'],
            isPopular: false, order: 0,
          },
          {
            name: 'Profesional',
            slug: 'hospedaje-profesional',
            description: 'Para hoteles en crecimiento',
            priceMonthly: 14999,
            priceYearly: 149990,
            trialDays: 14,
            maxBranches: 1, maxEmployees: 5, maxServices: 10,
            maxBookingsMonth: null, maxCustomers: 500, maxPhotos: 3000,
            features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'advanced_reports', 'mercadopago', 'whatsapp_support'],
            isPopular: true, order: 1,
          },
          {
            name: 'Business',
            slug: 'hospedaje-business',
            description: 'Para cadenas de hospedaje',
            priceMonthly: 29999,
            priceYearly: 299990,
            trialDays: 14,
            maxBranches: null, maxEmployees: null, maxServices: null,
            maxBookingsMonth: null, maxCustomers: null, maxPhotos: null,
            features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'complete_reports', 'mercadopago', 'priority_support', 'multi_branch', 'api_access'],
            isPopular: false, order: 2,
          },
        ],
      },
      {
        slug: 'alquiler-temporario',
        name: 'Alquiler Temporario',
        description: 'Casas quinta, cabañas, departamentos temporarios',
        industries: JSON.stringify([
          'casas-quinta', 'cabanas', 'departamentos-temporarios',
          'campos-y-estancias', 'salones-de-eventos', 'quinchos',
          'espacios-para-eventos',
        ]),
        limitLabels: JSON.stringify({
          maxEmployees: null,
          maxBranches: 'propiedades',
          maxBookingsMonth: 'reservas/mes',
          maxCustomers: 'huéspedes',
          maxServices: 'servicios',
          maxPhotos: 'fotos',
        }),
        order: 4,
        plans: [
          {
            name: 'Gratis',
            slug: 'alquiler-gratis',
            description: 'Ideal para empezar con tu propiedad',
            priceMonthly: 0,
            priceYearly: 0,
            trialDays: 0,
            maxBranches: 1, maxEmployees: 1, maxServices: 5,
            maxBookingsMonth: 30, maxCustomers: 50, maxPhotos: 500,
            features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'basic_reports'],
            isPopular: false, order: 0,
          },
          {
            name: 'Profesional',
            slug: 'alquiler-profesional',
            description: 'Para administradores de propiedades',
            priceMonthly: 14999,
            priceYearly: 149990,
            trialDays: 14,
            maxBranches: 5, maxEmployees: 5, maxServices: null,
            maxBookingsMonth: null, maxCustomers: 500, maxPhotos: 3000,
            features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'advanced_reports', 'mercadopago', 'whatsapp_support'],
            isPopular: true, order: 1,
          },
          {
            name: 'Business',
            slug: 'alquiler-business',
            description: 'Para empresas de alquiler',
            priceMonthly: 29999,
            priceYearly: 299990,
            trialDays: 14,
            maxBranches: null, maxEmployees: null, maxServices: null,
            maxBookingsMonth: null, maxCustomers: null, maxPhotos: null,
            features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'complete_reports', 'mercadopago', 'priority_support', 'multi_branch', 'api_access'],
            isPopular: false, order: 2,
          },
        ],
      },
      {
        slug: 'espacios-flexibles',
        name: 'Espacios Flexibles',
        description: 'Coworking, oficinas por hora, salas de reuniones',
        industries: JSON.stringify([
          'coworking', 'oficinas-por-hora', 'salas-de-reuniones',
          'boxes-profesionales', 'estudios-compartidos',
        ]),
        limitLabels: JSON.stringify({
          maxEmployees: null,
          maxBranches: 'ubicaciones',
          maxBookingsMonth: 'reservas/mes',
          maxCustomers: 'miembros',
          maxServices: 'tipos de espacio',
          maxPhotos: 'fotos',
        }),
        order: 5,
        plans: [
          {
            name: 'Gratis',
            slug: 'espacios-gratis',
            description: 'Ideal para empezar con tu espacio',
            priceMonthly: 0,
            priceYearly: 0,
            trialDays: 0,
            maxBranches: 1, maxEmployees: 1, maxServices: 5,
            maxBookingsMonth: 30, maxCustomers: 50, maxPhotos: 500,
            features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'basic_reports'],
            isPopular: false, order: 0,
          },
          {
            name: 'Profesional',
            slug: 'espacios-profesional',
            description: 'Para espacios en crecimiento',
            priceMonthly: 14999,
            priceYearly: 149990,
            trialDays: 14,
            maxBranches: 1, maxEmployees: 5, maxServices: null,
            maxBookingsMonth: null, maxCustomers: 500, maxPhotos: 3000,
            features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'advanced_reports', 'mercadopago', 'whatsapp_support'],
            isPopular: true, order: 1,
          },
          {
            name: 'Business',
            slug: 'espacios-business',
            description: 'Para redes de espacios',
            priceMonthly: 29999,
            priceYearly: 299990,
            trialDays: 14,
            maxBranches: null, maxEmployees: null, maxServices: null,
            maxBookingsMonth: null, maxCustomers: null, maxPhotos: null,
            features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'complete_reports', 'mercadopago', 'priority_support', 'multi_branch', 'api_access'],
            isPopular: false, order: 2,
          },
        ],
      },
      // ── Gastronomía ──
      {
        slug: 'gastronomia',
        name: 'Gastronomía',
        description: 'Restaurantes, bares, cafeterías, delivery y catering',
        industries: JSON.stringify([
          'restaurantes', 'bares', 'cafeterias', 'pizzerias',
          'hamburgueserias', 'heladerias', 'panaderias', 'food-trucks',
          'catering', 'delivery', 'rotiserias', 'cervecerías',
        ]),
        limitLabels: JSON.stringify({
          maxEmployees: 'personal',
          maxBranches: 'sucursales',
          maxBookingsMonth: 'reservas/mes',
          maxCustomers: 'comensales',
          maxServices: 'mesas',
          maxPhotos: 'fotos',
        }),
        order: 8,
        plans: [
          {
            name: 'Gratis',
            slug: 'gastronomia-gratis',
            description: 'Ideal para empezar con tu local',
            priceMonthly: 0,
            priceYearly: 0,
            trialDays: 0,
            maxBranches: 1, maxEmployees: 2, maxServices: 10,
            maxBookingsMonth: 30, maxCustomers: 50, maxPhotos: 500,
            features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'basic_reports', 'whatsapp_catalog'],
            isPopular: false, order: 0,
          },
          {
            name: 'Profesional',
            slug: 'gastronomia-profesional',
            description: 'Para locales en crecimiento',
            priceMonthly: 14999,
            priceYearly: 149990,
            trialDays: 14,
            maxBranches: 1, maxEmployees: 10, maxServices: null,
            maxBookingsMonth: null, maxCustomers: 500, maxPhotos: 3000,
            features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'advanced_reports', 'mercadopago', 'whatsapp_support', 'whatsapp_catalog', 'stock_management'],
            isPopular: true, order: 1,
          },
          {
            name: 'Business',
            slug: 'gastronomia-business',
            description: 'Para cadenas y franquicias gastronómicas',
            priceMonthly: 29999,
            priceYearly: 299990,
            trialDays: 14,
            maxBranches: null, maxEmployees: null, maxServices: null,
            maxBookingsMonth: null, maxCustomers: null, maxPhotos: null,
            features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'complete_reports', 'mercadopago', 'priority_support', 'multi_branch', 'api_access', 'whatsapp_catalog', 'stock_management', 'finance_module'],
            isPopular: false, order: 2,
          },
        ],
      },
    ];

    for (const groupData of groups) {
      const { plans, ...groupFields } = groupData;

      // Upsert the industry group
      const group = await this.prisma.industryGroup.upsert({
        where: { slug: groupFields.slug },
        create: { ...groupFields, isActive: true },
        update: { ...groupFields },
      });

      // Upsert plans for this group
      for (const planData of plans) {
        await this.prisma.subscriptionPlan.upsert({
          where: { slug: planData.slug },
          create: {
            name: planData.name,
            slug: planData.slug,
            description: planData.description,
            priceMonthly: new Prisma.Decimal(planData.priceMonthly),
            priceYearly: new Prisma.Decimal(planData.priceYearly),
            currency: 'ARS',
            trialDays: planData.trialDays,
            maxBranches: planData.maxBranches,
            maxEmployees: planData.maxEmployees,
            maxServices: planData.maxServices,
            maxBookingsMonth: planData.maxBookingsMonth,
            maxCustomers: planData.maxCustomers,
            maxPhotos: (planData as any).maxPhotos ?? null,
            features: JSON.stringify(planData.features),
            isPopular: planData.isPopular,
            isActive: true,
            order: planData.order,
            industryGroupId: group.id,
          },
          update: {
            name: planData.name,
            description: planData.description,
            priceMonthly: new Prisma.Decimal(planData.priceMonthly),
            priceYearly: new Prisma.Decimal(planData.priceYearly),
            trialDays: planData.trialDays,
            maxBranches: planData.maxBranches,
            maxEmployees: planData.maxEmployees,
            maxServices: planData.maxServices,
            maxBookingsMonth: planData.maxBookingsMonth,
            maxCustomers: planData.maxCustomers,
            maxPhotos: (planData as any).maxPhotos ?? null,
            features: JSON.stringify(planData.features),
            isPopular: planData.isPopular,
            isActive: true,
            order: planData.order,
            industryGroupId: group.id,
          },
        });
      }

      this.logger.log(`Industry group "${groupFields.name}" seeded with ${plans.length} plans`);
    }

    this.logger.log('All industry groups and plans seeded (18 plans across 6 groups)');
  }

  // ============ INDUSTRY GROUPS QUERIES ============

  async getIndustryGroups() {
    return this.prisma.industryGroup.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { plans: { where: { isActive: true } } } },
      },
    });
  }

  async getPlansByIndustryGroup(groupSlug: string) {
    const group = await this.prisma.industryGroup.findUnique({
      where: { slug: groupSlug },
    });

    if (!group) {
      throw new NotFoundException(`Industry group "${groupSlug}" not found`);
    }

    const plans = await this.prisma.subscriptionPlan.findMany({
      where: { industryGroupId: group.id, isActive: true },
      orderBy: { order: 'asc' },
      include: { industryGroup: true },
    });

    return plans.map(plan => ({
      ...plan,
      features: this.parseFeatures(plan.features),
      industryGroup: plan.industryGroup ? {
        ...plan.industryGroup,
        industries: this.parseJson(plan.industryGroup.industries),
        limitLabels: this.parseJson(plan.industryGroup.limitLabels),
      } : null,
    }));
  }

  private parseJson(value: any): any {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  }

  // ============ ADMIN INDUSTRY GROUPS CRUD ============

  async getAllIndustryGroups() {
    const groups = await this.prisma.industryGroup.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { plans: true } },
      },
    });

    return groups.map(g => ({
      ...g,
      industries: this.parseJson(g.industries),
      limitLabels: this.parseJson(g.limitLabels),
    }));
  }

  async createIndustryGroup(data: {
    slug: string;
    name: string;
    description?: string;
    industries?: string[];
    limitLabels?: Record<string, string | null>;
    order?: number;
  }) {
    return this.prisma.industryGroup.create({
      data: {
        slug: data.slug,
        name: data.name,
        description: data.description,
        industries: JSON.stringify(data.industries || []),
        limitLabels: JSON.stringify(data.limitLabels || {}),
        order: data.order ?? 0,
      },
    });
  }

  async updateIndustryGroup(id: string, data: {
    name?: string;
    description?: string;
    industries?: string[];
    limitLabels?: Record<string, string | null>;
    order?: number;
    isActive?: boolean;
  }) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.industries !== undefined) updateData.industries = JSON.stringify(data.industries);
    if (data.limitLabels !== undefined) updateData.limitLabels = JSON.stringify(data.limitLabels);
    if (data.order !== undefined) updateData.order = data.order;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return this.prisma.industryGroup.update({
      where: { id },
      data: updateData,
    });
  }

  // ============ ADMIN PLANS CRUD ============

  async getAllPlans() {
    const plans = await this.prisma.subscriptionPlan.findMany({
      orderBy: [{ order: 'asc' }],
      include: { industryGroup: true },
    });

    return plans.map(plan => ({
      ...plan,
      features: this.parseFeatures(plan.features),
      industryGroup: plan.industryGroup ? {
        ...plan.industryGroup,
        industries: this.parseJson(plan.industryGroup.industries),
        limitLabels: this.parseJson(plan.industryGroup.limitLabels),
      } : null,
    }));
  }

  async createPlan(data: {
    name: string;
    slug: string;
    description?: string;
    priceMonthly: number;
    priceYearly: number;
    trialDays?: number;
    maxBranches?: number;
    maxEmployees?: number;
    maxServices?: number | null;
    maxBookingsMonth?: number | null;
    maxCustomers?: number | null;
    features?: string[];
    isPopular?: boolean;
    order?: number;
    industryGroupId?: string;
  }) {
    return this.prisma.subscriptionPlan.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        priceMonthly: new Prisma.Decimal(data.priceMonthly),
        priceYearly: new Prisma.Decimal(data.priceYearly),
        currency: 'ARS',
        trialDays: data.trialDays ?? 14,
        maxBranches: data.maxBranches ?? 1,
        maxEmployees: data.maxEmployees ?? 1,
        maxServices: data.maxServices ?? null,
        maxBookingsMonth: data.maxBookingsMonth ?? null,
        maxCustomers: data.maxCustomers ?? null,
        features: JSON.stringify(data.features || []),
        isPopular: data.isPopular ?? false,
        isActive: true,
        order: data.order ?? 0,
        industryGroupId: data.industryGroupId || null,
      },
      include: { industryGroup: true },
    });
  }

  async updatePlan(id: string, data: {
    name?: string;
    description?: string;
    priceMonthly?: number;
    priceYearly?: number;
    trialDays?: number;
    maxBranches?: number;
    maxEmployees?: number;
    maxServices?: number | null;
    maxBookingsMonth?: number | null;
    maxCustomers?: number | null;
    features?: string[];
    isPopular?: boolean;
    isActive?: boolean;
    order?: number;
    industryGroupId?: string | null;
  }) {
    // Fetch current plan BEFORE updating (to detect price/name changes)
    const currentPlan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priceMonthly !== undefined) updateData.priceMonthly = new Prisma.Decimal(data.priceMonthly);
    if (data.priceYearly !== undefined) updateData.priceYearly = data.priceYearly !== null ? new Prisma.Decimal(data.priceYearly) : null;
    if (data.trialDays !== undefined) updateData.trialDays = data.trialDays;
    if (data.maxBranches !== undefined) updateData.maxBranches = data.maxBranches;
    if (data.maxEmployees !== undefined) updateData.maxEmployees = data.maxEmployees;
    if (data.maxServices !== undefined) updateData.maxServices = data.maxServices;
    if (data.maxBookingsMonth !== undefined) updateData.maxBookingsMonth = data.maxBookingsMonth;
    if (data.maxCustomers !== undefined) updateData.maxCustomers = data.maxCustomers;
    if (data.features !== undefined) updateData.features = JSON.stringify(data.features);
    if (data.isPopular !== undefined) updateData.isPopular = data.isPopular;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.industryGroupId !== undefined) updateData.industryGroupId = data.industryGroupId;

    const updatedPlan = await this.prisma.subscriptionPlan.update({
      where: { id },
      data: updateData,
      include: { industryGroup: true },
    });

    // Detect price/name changes and emit event (async, non-blocking)
    if (currentPlan) {
      const changes: PlanPriceUpdatedPayload['changes'] = {};

      if (data.priceMonthly !== undefined) {
        const oldMonthly = Number(Number(currentPlan.priceMonthly).toFixed(2));
        const newMonthly = Number(Number(data.priceMonthly).toFixed(2));
        if (oldMonthly !== newMonthly) {
          changes.priceMonthly = { old: oldMonthly, new: newMonthly };
        }
      }
      if (data.priceYearly !== undefined) {
        const oldYearly = currentPlan.priceYearly ? Number(Number(currentPlan.priceYearly).toFixed(2)) : null;
        const newYearly = data.priceYearly !== null && data.priceYearly !== undefined
          ? Number(Number(data.priceYearly).toFixed(2))
          : null;
        if (oldYearly !== newYearly) {
          changes.priceYearly = { old: oldYearly, new: newYearly };
        }
      }
      if (data.name !== undefined && currentPlan.name !== data.name) {
        changes.name = { old: currentPlan.name, new: data.name };
      }

      if (Object.keys(changes).length > 0) {
        const payload: PlanPriceUpdatedPayload = {
          planId: id,
          planName: updatedPlan.name,
          planSlug: updatedPlan.slug,
          changes,
          currency: updatedPlan.currency,
        };
        this.logger.log(`Plan "${updatedPlan.name}" updated with changes: ${JSON.stringify(changes)}`);
        this.eventEmitter.emit(SubscriptionEvent.PLAN_PRICE_UPDATED, payload);
      }
    }

    return updatedPlan;
  }

  async deactivatePlan(id: string) {
    // Check if any active subscriptions use this plan
    const activeCount = await this.prisma.subscription.count({
      where: { planId: id, status: { in: ['ACTIVE', 'TRIALING'] } },
    });

    if (activeCount > 0) {
      // Soft deactivate only — don't delete
      return this.prisma.subscriptionPlan.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive: false },
    });
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

    if (!newPlan || !newPlan.isActive) {
      throw new NotFoundException('Plan not found');
    }

    // Si ya usó trial, no otorgar otro trial — requiere pago
    const canTrial = newPlan.trialDays > 0 && !subscription.hasUsedTrial;

    const now = new Date();
    let periodEnd: Date;
    if (canTrial) {
      periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() + newPlan.trialDays);
    } else {
      // Sin trial: el plan queda pendiente de pago, no se activa
      // Se cambia el plan pero queda en estado que requiere pago
      periodEnd = now;
    }

    const updated = await this.prisma.subscription.update({
      where: { tenantId },
      data: {
        planId: newPlan.id,
        status: canTrial ? 'TRIALING' : 'PAST_DUE',
        trialStartAt: canTrial ? now : null,
        trialEndAt: canTrial ? periodEnd : null,
        currentPeriodStart: now,
        currentPeriodEnd: canTrial ? periodEnd : subscription.currentPeriodEnd,
        hasUsedTrial: canTrial ? true : subscription.hasUsedTrial,
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

  /**
   * Unified plan change handler.
   * Covers ALL scenarios: new user, V1 legacy migration, upgrade, downgrade, free↔paid.
   *
   * Returns: { subscription, action }
   *   action: 'created_free' | 'created_trial' | 'switched_free' | 'started_trial' | 'needs_payment' | 'already_on_plan'
   */
  async changePlan(tenantId: string, planSlug: string): Promise<{
    subscription: any;
    action: string;
    message: string;
  }> {
    // 1. Validate target plan exists and is active
    const targetPlan = await this.prisma.subscriptionPlan.findUnique({
      where: { slug: planSlug },
      include: { industryGroup: true },
    });

    if (!targetPlan || !targetPlan.isActive) {
      throw new NotFoundException('El plan seleccionado no existe o no esta disponible.');
    }

    const isTargetFree = Number(targetPlan.priceMonthly) === 0;

    // 2. Get current subscription (if any)
    const existing = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: { include: { industryGroup: true } } },
    });

    // ─── CASE A: No subscription exists → create new ───
    if (!existing) {
      if (isTargetFree) {
        const sub = await this.prisma.subscription.create({
          data: {
            tenantId,
            planId: targetPlan.id,
            status: 'ACTIVE',
            billingPeriod: 'MONTHLY',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 100),
          },
          include: { plan: { include: { industryGroup: true } } },
        });
        this.logger.log(`Free subscription created for tenant ${tenantId} on plan ${planSlug}`);
        return {
          subscription: { ...sub, plan: { ...sub.plan, features: this.parseFeatures(sub.plan.features) } },
          action: 'created_free',
          message: 'Plan gratuito activado exitosamente.',
        };
      }

      if (targetPlan.trialDays > 0) {
        const now = new Date();
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + targetPlan.trialDays);
        const sub = await this.prisma.subscription.create({
          data: {
            tenantId,
            planId: targetPlan.id,
            status: 'TRIALING',
            billingPeriod: 'MONTHLY',
            trialStartAt: now,
            trialEndAt: trialEnd,
            currentPeriodStart: now,
            currentPeriodEnd: trialEnd,
            hasUsedTrial: true,
          },
          include: { plan: { include: { industryGroup: true } } },
        });
        this.logger.log(`Trial subscription created for tenant ${tenantId} on plan ${planSlug}`);
        return {
          subscription: { ...sub, plan: { ...sub.plan, features: this.parseFeatures(sub.plan.features) } },
          action: 'created_trial',
          message: `Prueba gratuita de ${targetPlan.trialDays} dias activada.`,
        };
      }

      // Paid plan, no trial → create as PAST_DUE (needs payment)
      const sub = await this.prisma.subscription.create({
        data: {
          tenantId,
          planId: targetPlan.id,
          status: 'PAST_DUE',
          billingPeriod: 'MONTHLY',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(),
        },
        include: { plan: { include: { industryGroup: true } } },
      });
      this.logger.log(`Subscription created (needs payment) for tenant ${tenantId} on plan ${planSlug}`);
      return {
        subscription: { ...sub, plan: { ...sub.plan, features: this.parseFeatures(sub.plan.features) } },
        action: 'needs_payment',
        message: 'Plan seleccionado. Completa el pago para activarlo.',
      };
    }

    // ─── CASE B: Subscription exists ───

    // Same plan? No-op
    if (existing.planId === targetPlan.id) {
      return {
        subscription: { ...existing, plan: { ...existing.plan, features: this.parseFeatures(existing.plan.features) } },
        action: 'already_on_plan',
        message: 'Ya estas en este plan.',
      };
    }

    const now = new Date();

    // Target is free → switch immediately, status ACTIVE
    if (isTargetFree) {
      const updated = await this.prisma.subscription.update({
        where: { tenantId },
        data: {
          planId: targetPlan.id,
          status: 'ACTIVE',
          billingPeriod: 'MONTHLY',
          currentPeriodStart: now,
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 100),
          trialStartAt: null,
          trialEndAt: null,
          cancelledAt: null,
          cancelReason: null,
        },
        include: { plan: { include: { industryGroup: true } } },
      });
      this.logger.log(`Subscription switched to free plan ${planSlug} for tenant ${tenantId}`);
      return {
        subscription: { ...updated, plan: { ...updated.plan, features: this.parseFeatures(updated.plan.features) } },
        action: 'switched_free',
        message: 'Cambiaste al plan gratuito exitosamente.',
      };
    }

    // Target is paid plan
    const canTrial = targetPlan.trialDays > 0 && !existing.hasUsedTrial;

    if (canTrial) {
      // Start trial on new plan
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + targetPlan.trialDays);

      const updated = await this.prisma.subscription.update({
        where: { tenantId },
        data: {
          planId: targetPlan.id,
          status: 'TRIALING',
          trialStartAt: now,
          trialEndAt: trialEnd,
          currentPeriodStart: now,
          currentPeriodEnd: trialEnd,
          hasUsedTrial: true,
          cancelledAt: null,
          cancelReason: null,
        },
        include: { plan: { include: { industryGroup: true } } },
      });
      this.logger.log(`Trial started on plan ${planSlug} for tenant ${tenantId}`);
      return {
        subscription: { ...updated, plan: { ...updated.plan, features: this.parseFeatures(updated.plan.features) } },
        action: 'started_trial',
        message: `Prueba gratuita de ${targetPlan.trialDays} dias activada en ${targetPlan.name}.`,
      };
    }

    // Already used trial → switch plan but needs payment
    const updated = await this.prisma.subscription.update({
      where: { tenantId },
      data: {
        planId: targetPlan.id,
        status: 'PAST_DUE',
        currentPeriodStart: now,
        // Keep existing end date if it's still valid, otherwise set to now
        currentPeriodEnd: existing.currentPeriodEnd && existing.currentPeriodEnd > now
          ? existing.currentPeriodEnd
          : now,
        trialStartAt: null,
        trialEndAt: null,
        cancelledAt: null,
        cancelReason: null,
      },
      include: { plan: { include: { industryGroup: true } } },
    });
    this.logger.log(`Subscription changed to ${planSlug} (needs payment) for tenant ${tenantId}`);
    return {
      subscription: { ...updated, plan: { ...updated.plan, features: this.parseFeatures(updated.plan.features) } },
      action: 'needs_payment',
      message: `Plan cambiado a ${targetPlan.name}. Completa el pago para activarlo.`,
    };
  }
}
