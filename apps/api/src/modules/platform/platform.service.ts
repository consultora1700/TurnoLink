import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailNotificationsService } from '../notifications/email-notifications.service';
import * as crypto from 'crypto';

interface PlatformCredentials {
  accessToken: string;
  publicKey: string;
  userId: string;
  isConnected: boolean;
  isSandbox: boolean;
}

interface PaymentPreference {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

@Injectable()
export class PlatformService {
  private readonly logger = new Logger(PlatformService.name);
  private readonly encryptionKey: Buffer;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly emailNotifications: EmailNotificationsService,
  ) {
    const key = this.configService.get<string>('MP_ENCRYPTION_KEY');
    if (!key) {
      throw new Error('MP_ENCRYPTION_KEY is required');
    }
    this.encryptionKey = Buffer.from(key, 'hex');
  }

  // ============ ENCRYPTION ============

  private encrypt(text: string): { encrypted: string; iv: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return {
      encrypted: encrypted + ':' + authTag,
      iv: iv.toString('hex'),
    };
  }

  private decrypt(encryptedData: string, ivHex: string): string {
    const [encrypted, authTag] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // ============ OAUTH FLOW ============

  /**
   * Get the OAuth URL for platform owner to connect their MercadoPago
   */
  async getOAuthUrl(): Promise<string> {
    const clientId = this.configService.get<string>('PLATFORM_MP_CLIENT_ID') ||
                     this.configService.get<string>('MP_CLIENT_ID');
    const redirectUri = this.configService.get<string>('PLATFORM_MP_REDIRECT_URI') ||
                        `${this.configService.get<string>('API_URL')}/api/platform/oauth/callback`;

    if (!clientId) {
      throw new BadRequestException('MercadoPago client ID not configured');
    }

    const state = crypto.randomBytes(16).toString('hex');

    // Store state temporarily (in production, use Redis or similar)
    await this.prisma.platformConfig.upsert({
      where: { key: 'oauth_state' },
      update: { value: state, updatedAt: new Date() },
      create: { key: 'oauth_state', value: state },
    });

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      platform_id: 'mp',
      redirect_uri: redirectUri,
      state,
    });

    return `https://auth.mercadopago.com/authorization?${params.toString()}`;
  }

  /**
   * Handle OAuth callback and store platform credentials
   */
  async handleOAuthCallback(code: string, state: string): Promise<{ success: boolean; message: string }> {
    // Verify state
    const storedState = await this.prisma.platformConfig.findUnique({
      where: { key: 'oauth_state' },
    });

    if (!storedState || storedState.value !== state) {
      throw new BadRequestException('Invalid OAuth state');
    }

    const clientId = this.configService.get<string>('PLATFORM_MP_CLIENT_ID') ||
                     this.configService.get<string>('MP_CLIENT_ID') || '';
    const clientSecret = this.configService.get<string>('PLATFORM_MP_CLIENT_SECRET') ||
                         this.configService.get<string>('MP_CLIENT_SECRET') || '';
    const redirectUri = this.configService.get<string>('PLATFORM_MP_REDIRECT_URI') ||
                        `${this.configService.get<string>('API_URL')}/api/platform/oauth/callback`;

    try {
      // Exchange code for tokens
      const response = await fetch('https://api.mercadopago.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
        } as Record<string, string>),
      });

      if (!response.ok) {
        const error = await response.json();
        this.logger.error('OAuth token exchange failed', error);
        throw new BadRequestException('Failed to exchange OAuth code');
      }

      const tokens = await response.json();

      // Get public key
      const publicKeyResponse = await fetch('https://api.mercadopago.com/v1/account/credentials', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      let publicKey = '';
      if (publicKeyResponse.ok) {
        const credentials = await publicKeyResponse.json();
        publicKey = credentials.public_key || '';
      }

      // Encrypt and store credentials
      const encryptedAccessToken = this.encrypt(tokens.access_token);
      const encryptedRefreshToken = tokens.refresh_token ? this.encrypt(tokens.refresh_token) : null;
      const encryptedPublicKey = publicKey ? this.encrypt(publicKey) : null;

      // Store as platform config
      const credentialsData = {
        accessToken: encryptedAccessToken.encrypted,
        refreshToken: encryptedRefreshToken?.encrypted || null,
        publicKey: encryptedPublicKey?.encrypted || null,
        iv: encryptedAccessToken.iv,
        userId: tokens.user_id?.toString() || null,
        expiresAt: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
          : null,
        isConnected: true,
        connectedAt: new Date().toISOString(),
      };

      await this.prisma.platformConfig.upsert({
        where: { key: 'mercadopago_credentials' },
        update: { value: JSON.stringify(credentialsData), updatedAt: new Date() },
        create: { key: 'mercadopago_credentials', value: JSON.stringify(credentialsData) },
      });

      // Clean up state
      await this.prisma.platformConfig.delete({ where: { key: 'oauth_state' } }).catch(() => {});

      this.logger.log('Platform MercadoPago connected successfully');
      return { success: true, message: 'MercadoPago conectado exitosamente' };

    } catch (error) {
      this.logger.error('OAuth callback error', error);
      throw new InternalServerErrorException('Error connecting to MercadoPago');
    }
  }

  /**
   * Get platform MercadoPago credentials
   */
  async getCredentials(): Promise<PlatformCredentials | null> {
    const config = await this.prisma.platformConfig.findUnique({
      where: { key: 'mercadopago_credentials' },
    });

    if (!config) {
      return null;
    }

    try {
      const data = JSON.parse(config.value);

      if (!data.isConnected) {
        return null;
      }

      // Check if token needs refresh
      if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
        await this.refreshAccessToken();
        return this.getCredentials(); // Recursive call after refresh
      }

      return {
        accessToken: this.decrypt(data.accessToken, data.iv),
        publicKey: data.publicKey ? this.decrypt(data.publicKey, data.iv) : '',
        userId: data.userId || '',
        isConnected: data.isConnected,
        isSandbox: data.isSandbox || false,
      };
    } catch (error) {
      this.logger.error('Error decrypting credentials', error);
      return null;
    }
  }

  /**
   * Check if platform MercadoPago is connected
   */
  async isConnected(): Promise<boolean> {
    const credentials = await this.getCredentials();
    return credentials?.isConnected || false;
  }

  /**
   * Refresh access token
   */
  private async refreshAccessToken(): Promise<void> {
    const config = await this.prisma.platformConfig.findUnique({
      where: { key: 'mercadopago_credentials' },
    });

    if (!config) {
      throw new BadRequestException('No credentials found');
    }

    const data = JSON.parse(config.value);
    if (!data.refreshToken) {
      this.logger.warn('No refresh token available, reconnection required');
      return;
    }

    const clientId = this.configService.get<string>('PLATFORM_MP_CLIENT_ID') ||
                     this.configService.get<string>('MP_CLIENT_ID') || '';
    const clientSecret = this.configService.get<string>('PLATFORM_MP_CLIENT_SECRET') ||
                         this.configService.get<string>('MP_CLIENT_SECRET') || '';

    const refreshToken = this.decrypt(data.refreshToken, data.iv);

    const response = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      } as Record<string, string>),
    });

    if (!response.ok) {
      this.logger.error('Token refresh failed');
      // Mark as disconnected
      data.isConnected = false;
      await this.prisma.platformConfig.update({
        where: { key: 'mercadopago_credentials' },
        data: { value: JSON.stringify(data) },
      });
      return;
    }

    const tokens = await response.json();
    const encryptedAccessToken = this.encrypt(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token ? this.encrypt(tokens.refresh_token) : null;

    data.accessToken = encryptedAccessToken.encrypted;
    data.iv = encryptedAccessToken.iv;
    if (encryptedRefreshToken) {
      data.refreshToken = encryptedRefreshToken.encrypted;
    }
    data.expiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      : null;

    await this.prisma.platformConfig.update({
      where: { key: 'mercadopago_credentials' },
      data: { value: JSON.stringify(data) },
    });

    this.logger.log('Platform access token refreshed');
  }

  /**
   * Disconnect platform MercadoPago
   */
  async disconnect(): Promise<void> {
    await this.prisma.platformConfig.delete({
      where: { key: 'mercadopago_credentials' },
    }).catch(() => {});

    this.logger.log('Platform MercadoPago disconnected');
  }

  // ============ SUBSCRIPTION PAYMENTS ============

  /**
   * Create payment preference for subscription upgrade
   */
  async createSubscriptionPreference(
    tenantId: string,
    planSlug: string,
    billingPeriod: 'MONTHLY' | 'YEARLY',
    payerEmail: string,
  ): Promise<{ preferenceId: string; initPoint: string }> {
    const credentials = await this.getCredentials();
    if (!credentials) {
      throw new BadRequestException('La plataforma no tiene MercadoPago configurado');
    }

    // Get plan details
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { slug: planSlug },
    });

    if (!plan) {
      throw new BadRequestException('Plan no encontrado');
    }

    const price = billingPeriod === 'YEARLY' && plan.priceYearly
      ? plan.priceYearly
      : plan.priceMonthly;

    // Get tenant info
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new BadRequestException('Tenant no encontrado');
    }

    const externalReference = `sub_${tenantId}_${planSlug}_${Date.now()}`;
    const apiUrl = this.configService.get<string>('API_URL');
    const webUrl = this.configService.get<string>('WEB_URL') || 'https://turnolink.com.ar';

    const preference = {
      items: [
        {
          id: plan.id,
          title: `TurnoLink ${plan.name} - ${billingPeriod === 'YEARLY' ? 'Anual' : 'Mensual'}`,
          description: plan.description || `Suscripción ${plan.name} de TurnoLink`,
          quantity: 1,
          currency_id: plan.currency || 'ARS',
          unit_price: Number(price),
        },
      ],
      payer: {
        email: payerEmail,
      },
      external_reference: externalReference,
      notification_url: `${apiUrl}/api/platform/webhook`,
      back_urls: {
        success: `${webUrl}/mi-suscripcion?payment=success`,
        failure: `${webUrl}/mi-suscripcion?payment=failure`,
        pending: `${webUrl}/mi-suscripcion?payment=pending`,
      },
      auto_return: 'approved',
      statement_descriptor: 'TURNOLINK',
      metadata: {
        tenant_id: tenantId,
        plan_id: plan.id,
        plan_slug: planSlug,
        billing_period: billingPeriod,
      },
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${credentials.accessToken}`,
      },
      body: JSON.stringify(preference),
    });

    if (!response.ok) {
      const error = await response.json();
      this.logger.error('Failed to create preference', error);
      throw new InternalServerErrorException('Error al crear la preferencia de pago');
    }

    const result: PaymentPreference = await response.json();

    // Store pending payment
    await this.prisma.subscriptionPayment.create({
      data: {
        id: crypto.randomUUID(),
        subscriptionId: (await this.prisma.subscription.findUnique({ where: { tenantId } }))?.id || '',
        amount: price,
        currency: plan.currency || 'ARS',
        status: 'PENDING',
        periodStart: new Date(),
        periodEnd: billingPeriod === 'YEARLY'
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        rawResponse: JSON.stringify({ preferenceId: result.id, externalReference }),
      },
    });

    this.logger.log(`Created subscription preference for tenant ${tenantId}, plan ${planSlug}`);

    return {
      preferenceId: result.id,
      initPoint: credentials.isSandbox ? result.sandbox_init_point : result.init_point,
    };
  }

  /**
   * Process payment webhook notification
   */
  async processPaymentNotification(paymentId: string): Promise<void> {
    const credentials = await this.getCredentials();
    if (!credentials) {
      this.logger.error('No platform credentials for webhook processing');
      return;
    }

    // Get payment details from MercadoPago
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${credentials.accessToken}` },
    });

    if (!response.ok) {
      this.logger.error(`Failed to get payment ${paymentId}`);
      return;
    }

    const payment = await response.json();

    // Check if this is a subscription payment
    if (!payment.external_reference?.startsWith('sub_')) {
      this.logger.debug(`Payment ${paymentId} is not a subscription payment`);
      return;
    }

    const metadata = payment.metadata || {};
    const tenantId = metadata.tenant_id;
    const planSlug = metadata.plan_slug;
    const billingPeriod = metadata.billing_period || 'MONTHLY';

    if (!tenantId || !planSlug) {
      this.logger.error('Missing metadata in payment', payment.external_reference);
      return;
    }

    // Handle based on payment status
    if (payment.status === 'approved') {
      await this.activateSubscription(tenantId, planSlug, billingPeriod, paymentId, payment);
    } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
      this.logger.log(`Payment ${paymentId} was ${payment.status} for tenant ${tenantId}`);
      // Update payment record
      await this.prisma.subscriptionPayment.updateMany({
        where: {
          rawResponse: { contains: payment.external_reference },
        },
        data: {
          status: payment.status === 'rejected' ? 'REJECTED' : 'PENDING',
          mpPaymentId: paymentId,
          rawResponse: JSON.stringify(payment),
        },
      });
    }
  }

  /**
   * Activate subscription after successful payment
   */
  private async activateSubscription(
    tenantId: string,
    planSlug: string,
    billingPeriod: string,
    paymentId: string,
    paymentData: any,
  ): Promise<void> {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { slug: planSlug },
    });

    if (!plan) {
      this.logger.error(`Plan ${planSlug} not found`);
      return;
    }

    const periodEnd = billingPeriod === 'YEARLY'
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Update or create subscription
    await this.prisma.subscription.upsert({
      where: { tenantId },
      update: {
        planId: plan.id,
        status: 'ACTIVE',
        billingPeriod: billingPeriod as any,
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
        trialEndAt: null, // Clear trial
      },
      create: {
        id: crypto.randomUUID(),
        tenantId,
        planId: plan.id,
        status: 'ACTIVE',
        billingPeriod: billingPeriod as any,
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
      },
    });

    // Record payment
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (subscription) {
      await this.prisma.subscriptionPayment.create({
        data: {
          id: crypto.randomUUID(),
          subscriptionId: subscription.id,
          mpPaymentId: paymentId,
          amount: paymentData.transaction_amount,
          currency: paymentData.currency_id || 'ARS',
          status: 'APPROVED',
          periodStart: new Date(),
          periodEnd,
          paidAt: new Date(),
          rawResponse: JSON.stringify(paymentData),
        },
      });
    }

    this.logger.log(`Subscription activated for tenant ${tenantId}, plan ${planSlug}, period ${billingPeriod}`);

    // Send payment success email
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        include: {
          users: {
            where: { role: 'OWNER' },
            take: 1,
          },
        },
      });

      if (tenant?.users[0]) {
        const owner = tenant.users[0];
        await this.emailNotifications.sendPaymentSuccessEmail(
          owner.email,
          owner.name,
          plan.name,
          paymentData.transaction_amount,
          billingPeriod as 'MONTHLY' | 'YEARLY',
          periodEnd,
        );
      }
    } catch (emailError) {
      this.logger.error('Failed to send payment success email', emailError);
    }
  }

  // ============ RECURRING SUBSCRIPTIONS (PREAPPROVAL) ============

  /**
   * Create a MercadoPago preapproval (recurring subscription)
   * The user authorizes once and gets charged automatically every month/year
   */
  async createRecurringSubscription(
    tenantId: string,
    planSlug: string,
    billingPeriod: 'MONTHLY' | 'YEARLY',
    payerEmail: string,
  ): Promise<{ initPoint: string; preapprovalId: string }> {
    const credentials = await this.getCredentials();
    if (!credentials) {
      throw new BadRequestException('La plataforma no tiene MercadoPago configurado');
    }

    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { slug: planSlug },
    });

    if (!plan) {
      throw new BadRequestException('Plan no encontrado');
    }

    if (Number(plan.priceMonthly) === 0) {
      throw new BadRequestException('El plan gratuito no requiere suscripción de pago');
    }

    const amount = billingPeriod === 'YEARLY' && plan.priceYearly
      ? Number(plan.priceYearly)
      : Number(plan.priceMonthly);

    const frequency = billingPeriod === 'YEARLY' ? 12 : 1;
    const frequencyType = 'months';
    const webUrl = this.configService.get<string>('WEB_URL') || 'https://turnolink.com.ar';
    const apiUrl = this.configService.get<string>('API_URL');

    const preapprovalData = {
      reason: `TurnoLink ${plan.name} - ${billingPeriod === 'YEARLY' ? 'Anual' : 'Mensual'}`,
      external_reference: `sub_${tenantId}_${planSlug}_${billingPeriod}`,
      payer_email: payerEmail,
      auto_recurring: {
        frequency,
        frequency_type: frequencyType,
        transaction_amount: amount,
        currency_id: plan.currency || 'ARS',
      },
      back_url: `${webUrl}/mi-suscripcion?subscription=success`,
      notification_url: `${apiUrl}/api/platform/webhook`,
    };

    const response = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${credentials.accessToken}`,
      },
      body: JSON.stringify(preapprovalData),
    });

    if (!response.ok) {
      const error = await response.json();
      this.logger.error('Failed to create preapproval', error);
      throw new InternalServerErrorException('Error al crear la suscripción recurrente');
    }

    const result = await response.json();

    // Store the preapproval ID on the subscription
    await this.prisma.subscription.update({
      where: { tenantId },
      data: {
        mpSubscriptionId: result.id,
      },
    });

    this.logger.log(`Recurring subscription created for tenant ${tenantId}: preapproval ${result.id}`);

    const initPoint = credentials.isSandbox
      ? result.sandbox_init_point
      : result.init_point;

    return {
      initPoint,
      preapprovalId: result.id,
    };
  }

  /**
   * Process preapproval status change (subscription_preapproval webhook)
   * Called when the user authorizes, pauses, or cancels their recurring subscription
   */
  async processPreapprovalNotification(preapprovalId: string): Promise<void> {
    const credentials = await this.getCredentials();
    if (!credentials) {
      this.logger.error('No platform credentials for preapproval webhook');
      return;
    }

    const response = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
      headers: { Authorization: `Bearer ${credentials.accessToken}` },
    });

    if (!response.ok) {
      this.logger.error(`Failed to get preapproval ${preapprovalId}`);
      return;
    }

    const preapproval = await response.json();

    // Find subscription by mpSubscriptionId
    const subscription = await this.prisma.subscription.findFirst({
      where: { mpSubscriptionId: preapprovalId },
      include: { plan: true },
    });

    if (!subscription) {
      // Try to find by external_reference
      const ref = preapproval.external_reference;
      if (ref?.startsWith('sub_')) {
        const parts = ref.split('_');
        const tenantId = parts[1];
        const sub = await this.prisma.subscription.findUnique({ where: { tenantId } });
        if (sub) {
          await this.prisma.subscription.update({
            where: { tenantId },
            data: { mpSubscriptionId: preapprovalId },
          });
        }
      }
      this.logger.warn(`No subscription found for preapproval ${preapprovalId}`);
      return;
    }

    this.logger.log(`Preapproval ${preapprovalId} status: ${preapproval.status}`);

    switch (preapproval.status) {
      case 'authorized':
        // User authorized the recurring charge — subscription is active
        if (subscription.status !== 'ACTIVE') {
          await this.prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: 'ACTIVE',
              currentPeriodStart: new Date(),
              currentPeriodEnd: subscription.billingPeriod === 'YEARLY'
                ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              trialEndAt: null,
            },
          });
          this.logger.log(`Subscription activated via preapproval for tenant ${subscription.tenantId}`);
        }
        break;

      case 'paused':
        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'PAST_DUE' },
        });
        this.logger.log(`Subscription paused for tenant ${subscription.tenantId}`);
        break;

      case 'cancelled':
        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
            cancelReason: 'Cancelado desde MercadoPago',
          },
        });
        this.logger.log(`Subscription cancelled via MP for tenant ${subscription.tenantId}`);
        break;

      default:
        this.logger.debug(`Unhandled preapproval status: ${preapproval.status}`);
    }
  }

  /**
   * Process authorized payment notification (subscription_authorized_payment webhook)
   * Called each time MercadoPago successfully charges a recurring payment
   */
  async processAuthorizedPaymentNotification(authorizedPaymentId: string): Promise<void> {
    const credentials = await this.getCredentials();
    if (!credentials) {
      this.logger.error('No platform credentials for authorized payment webhook');
      return;
    }

    // Get the authorized payment details
    const response = await fetch(
      `https://api.mercadopago.com/authorized_payments/${authorizedPaymentId}`,
      { headers: { Authorization: `Bearer ${credentials.accessToken}` } },
    );

    if (!response.ok) {
      this.logger.error(`Failed to get authorized payment ${authorizedPaymentId}`);
      return;
    }

    const authorizedPayment = await response.json();
    const preapprovalId = authorizedPayment.preapproval_id;

    if (!preapprovalId) {
      this.logger.error(`No preapproval_id in authorized payment ${authorizedPaymentId}`);
      return;
    }

    // Find the subscription
    const subscription = await this.prisma.subscription.findFirst({
      where: { mpSubscriptionId: preapprovalId },
      include: { plan: true },
    });

    if (!subscription) {
      this.logger.error(`No subscription found for preapproval ${preapprovalId}`);
      return;
    }

    if (authorizedPayment.status !== 'approved') {
      this.logger.log(`Authorized payment ${authorizedPaymentId} status: ${authorizedPayment.status} (not approved)`);

      if (authorizedPayment.status === 'rejected') {
        // Payment failed — mark as past due
        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'PAST_DUE' },
        });
        this.logger.warn(`Recurring payment rejected for tenant ${subscription.tenantId}`);
      }
      return;
    }

    // Payment approved — renew subscription period
    const now = new Date();
    const periodEnd = subscription.billingPeriod === 'YEARLY'
      ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    // Record the payment
    await this.prisma.subscriptionPayment.create({
      data: {
        id: crypto.randomUUID(),
        subscriptionId: subscription.id,
        mpPaymentId: authorizedPaymentId,
        amount: authorizedPayment.transaction_amount || 0,
        currency: authorizedPayment.currency_id || 'ARS',
        status: 'APPROVED',
        periodStart: now,
        periodEnd,
        paidAt: new Date(authorizedPayment.date_approved || now),
        rawResponse: JSON.stringify(authorizedPayment),
      },
    });

    this.logger.log(
      `Recurring payment ${authorizedPaymentId} processed: tenant ${subscription.tenantId}, ` +
      `plan ${subscription.plan.name}, next period ends ${periodEnd.toISOString()}`,
    );

    // Send payment success email
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: subscription.tenantId },
        include: { users: { where: { role: 'OWNER' }, take: 1 } },
      });

      if (tenant?.users[0]) {
        const owner = tenant.users[0];
        await this.emailNotifications.sendPaymentSuccessEmail(
          owner.email,
          owner.name,
          subscription.plan.name,
          authorizedPayment.transaction_amount,
          subscription.billingPeriod as 'MONTHLY' | 'YEARLY',
          periodEnd,
        );
      }
    } catch (emailError) {
      this.logger.error('Failed to send recurring payment email', emailError);
    }
  }

  /**
   * Cancel a MercadoPago preapproval (recurring subscription)
   */
  async cancelRecurringSubscription(tenantId: string): Promise<void> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (!subscription?.mpSubscriptionId) {
      return; // No MP subscription to cancel
    }

    const credentials = await this.getCredentials();
    if (!credentials) return;

    try {
      const response = await fetch(
        `https://api.mercadopago.com/preapproval/${subscription.mpSubscriptionId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${credentials.accessToken}`,
          },
          body: JSON.stringify({ status: 'cancelled' }),
        },
      );

      if (response.ok) {
        this.logger.log(`MP preapproval cancelled for tenant ${tenantId}`);
      } else {
        this.logger.error(`Failed to cancel MP preapproval for tenant ${tenantId}`);
      }
    } catch (error) {
      this.logger.error(`Error cancelling MP preapproval: ${error}`);
    }
  }

  /**
   * Update a MercadoPago preapproval (recurring subscription) amount
   */
  async updatePreapprovalAmount(
    mpSubscriptionId: string,
    updates: { transactionAmount?: number; reason?: string },
  ): Promise<{ success: boolean; statusCode: number; response: any }> {
    const credentials = await this.getCredentials();
    if (!credentials) {
      return { success: false, statusCode: 0, response: 'No MP credentials configured' };
    }

    try {
      const body: any = {};
      if (updates.transactionAmount !== undefined) {
        body.auto_recurring = { transaction_amount: updates.transactionAmount };
      }
      if (updates.reason) {
        body.reason = updates.reason;
      }

      const response = await fetch(
        `https://api.mercadopago.com/preapproval/${mpSubscriptionId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${credentials.accessToken}`,
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(10000),
        },
      );

      const responseData = await response.json().catch(() => null);

      if (response.ok) {
        this.logger.log(`MP preapproval ${mpSubscriptionId} amount updated to ${updates.transactionAmount}`);
      } else {
        this.logger.error(`Failed to update MP preapproval ${mpSubscriptionId}: ${response.status}`);
      }

      return {
        success: response.ok,
        statusCode: response.status,
        response: responseData,
      };
    } catch (error) {
      this.logger.error(`Error updating MP preapproval ${mpSubscriptionId}: ${error}`);
      return { success: false, statusCode: 0, response: String(error) };
    }
  }

  /**
   * Get connection status for admin dashboard
   */
  async getStatus(): Promise<{
    isConnected: boolean;
    userId?: string;
    connectedAt?: string;
    isSandbox?: boolean;
  }> {
    const config = await this.prisma.platformConfig.findUnique({
      where: { key: 'mercadopago_credentials' },
    });

    if (!config) {
      return { isConnected: false };
    }

    try {
      const data = JSON.parse(config.value);
      return {
        isConnected: data.isConnected || false,
        userId: data.userId,
        connectedAt: data.connectedAt,
        isSandbox: data.isSandbox,
      };
    } catch {
      return { isConnected: false };
    }
  }
}
