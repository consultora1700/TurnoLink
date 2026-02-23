import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantsService } from '../tenants/tenants.service';
import { BookingEvent, BookingEventPayload } from '../../common/events';
import * as crypto from 'crypto';

interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  user_id: number;
  refresh_token: string;
  public_key: string;
}

interface MPPreferenceItem {
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
}

interface MPPreferenceBackUrls {
  success: string;
  failure: string;
  pending: string;
}

interface MPPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

interface MPPaymentNotification {
  id: number;
  status: string;
  status_detail: string;
  transaction_amount: number;
  currency_id: string;
  payer: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
  payment_method_id: string;
  payment_type_id: string;
  external_reference: string;
}

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private tenantsService: TenantsService,
    private eventEmitter: EventEmitter2,
  ) {}

  private getEncryptionKey(): Buffer {
    const key = this.configService.get<string>('MP_ENCRYPTION_KEY');
    if (!key) {
      throw new Error('MP_ENCRYPTION_KEY is not configured');
    }
    return Buffer.from(key, 'hex');
  }

  private encrypt(text: string): { encrypted: string; iv: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.getEncryptionKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return {
      encrypted: encrypted + ':' + authTag.toString('hex'),
      iv: iv.toString('hex'),
    };
  }

  private decrypt(encrypted: string, iv: string): string {
    const [encryptedText, authTag] = encrypted.split(':');
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.getEncryptionKey(),
      Buffer.from(iv, 'hex'),
    );
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Get the OAuth authorization URL for Mercado Pago
   */
  async getOAuthUrl(tenantId: string, isSandbox: boolean = false): Promise<string> {
    const clientId = isSandbox
      ? this.configService.get<string>('MP_CLIENT_ID')
      : this.configService.get<string>('MP_PROD_CLIENT_ID');

    const redirectUri = this.configService.get<string>('MP_REDIRECT_URI');

    this.logger.log(`OAuth URL request - isSandbox: ${isSandbox}, clientId: ${clientId ? 'SET' : 'NOT SET'}, redirectUri: ${redirectUri ? 'SET' : 'NOT SET'}`);

    if (!clientId || !redirectUri) {
      this.logger.error(`Missing config - MP_CLIENT_ID: ${this.configService.get('MP_CLIENT_ID')}, MP_PROD_CLIENT_ID: ${this.configService.get('MP_PROD_CLIENT_ID')}, MP_REDIRECT_URI: ${this.configService.get('MP_REDIRECT_URI')}`);
      throw new InternalServerErrorException(
        'Mercado Pago OAuth is not configured. Please contact support.',
      );
    }

    // Create state with tenantId and sandbox flag for callback validation
    const state = Buffer.from(
      JSON.stringify({ tenantId, isSandbox, timestamp: Date.now() }),
    ).toString('base64');

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
   * Exchange OAuth code for tokens and store credentials
   */
  async handleOAuthCallback(code: string, state: string): Promise<{ tenantId: string; success: boolean }> {
    // Decode and validate state
    let stateData: { tenantId: string; isSandbox: boolean; timestamp: number };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
    } catch {
      throw new BadRequestException('Invalid OAuth state');
    }

    // Check state is not too old (max 10 minutes)
    if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
      throw new BadRequestException('OAuth session expired. Please try again.');
    }

    const { tenantId, isSandbox } = stateData;

    // Get client credentials based on mode
    const clientId = isSandbox
      ? this.configService.get<string>('MP_CLIENT_ID')
      : this.configService.get<string>('MP_PROD_CLIENT_ID');

    const clientSecret = isSandbox
      ? this.configService.get<string>('MP_CLIENT_SECRET')
      : this.configService.get<string>('MP_PROD_CLIENT_SECRET');

    const redirectUri = this.configService.get<string>('MP_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      throw new InternalServerErrorException('Mercado Pago OAuth is not configured');
    }

    // Exchange code for tokens
    const tokenResponse = await this.exchangeCodeForTokens(
      code,
      clientId,
      clientSecret,
      redirectUri,
    );

    // Encrypt and store credentials
    await this.storeCredentials(tenantId, tokenResponse, isSandbox);

    // Auto-update depositMode to 'mercadopago' so real payments are used
    try {
      await this.tenantsService.update(tenantId, {
        settings: JSON.stringify({ depositMode: 'mercadopago' }),
      });
      this.logger.log(`depositMode updated to 'mercadopago' for tenant ${tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to update depositMode for tenant ${tenantId}: ${error.message}`);
    }

    this.logger.log(`Mercado Pago OAuth completed for tenant ${tenantId}`);

    return { tenantId, success: true };
  }

  private async exchangeCodeForTokens(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string,
  ): Promise<OAuthTokenResponse> {
    const response = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`OAuth token exchange failed: ${error}`);
      throw new BadRequestException('Failed to connect to Mercado Pago. Please try again.');
    }

    return response.json();
  }

  private async storeCredentials(
    tenantId: string,
    tokens: OAuthTokenResponse,
    isSandbox: boolean,
  ): Promise<void> {
    // Encrypt tokens
    const { encrypted: encryptedAccessToken, iv } = this.encrypt(tokens.access_token);
    const { encrypted: encryptedRefreshToken } = this.encrypt(tokens.refresh_token);
    const { encrypted: encryptedPublicKey } = this.encrypt(tokens.public_key);

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Upsert credentials
    await this.prisma.mercadoPagoCredential.upsert({
      where: { tenantId },
      create: {
        tenantId,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        publicKey: encryptedPublicKey,
        userId: String(tokens.user_id),
        iv,
        expiresAt,
        isSandbox,
        isConnected: true,
        connectedAt: new Date(),
      },
      update: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        publicKey: encryptedPublicKey,
        userId: String(tokens.user_id),
        iv,
        expiresAt,
        isSandbox,
        isConnected: true,
        connectedAt: new Date(),
        disconnectedAt: null,
      },
    });
  }

  /**
   * Get connection status for a tenant
   */
  async getStatus(tenantId: string): Promise<{
    isConnected: boolean;
    isSandbox: boolean;
    connectedAt: Date | null;
    userId: string | null;
  }> {
    const credential = await this.prisma.mercadoPagoCredential.findUnique({
      where: { tenantId },
      select: {
        isConnected: true,
        isSandbox: true,
        connectedAt: true,
        userId: true,
      },
    });

    if (!credential) {
      return {
        isConnected: false,
        isSandbox: false,
        connectedAt: null,
        userId: null,
      };
    }

    return {
      isConnected: credential.isConnected,
      isSandbox: credential.isSandbox,
      connectedAt: credential.connectedAt,
      userId: credential.userId,
    };
  }

  /**
   * Disconnect Mercado Pago account
   */
  async disconnect(tenantId: string): Promise<void> {
    const credential = await this.prisma.mercadoPagoCredential.findUnique({
      where: { tenantId },
    });

    if (!credential) {
      throw new NotFoundException('Mercado Pago is not connected');
    }

    // Mark as disconnected but keep the record for audit
    await this.prisma.mercadoPagoCredential.update({
      where: { tenantId },
      data: {
        isConnected: false,
        disconnectedAt: new Date(),
        // Clear sensitive tokens
        accessToken: '',
        refreshToken: null,
        publicKey: '',
      },
    });

    // Revert depositMode to 'simulated' since MP is no longer available
    try {
      await this.tenantsService.update(tenantId, {
        settings: JSON.stringify({ depositMode: 'simulated' }),
      });
      this.logger.log(`depositMode reverted to 'simulated' for tenant ${tenantId}`);
    } catch (error) {
      this.logger.error(`Failed to revert depositMode for tenant ${tenantId}: ${error.message}`);
    }

    this.logger.log(`Mercado Pago disconnected for tenant ${tenantId}`);
  }

  /**
   * Get decrypted access token (with auto-refresh if needed)
   */
  async getAccessToken(tenantId: string): Promise<string> {
    const credential = await this.prisma.mercadoPagoCredential.findUnique({
      where: { tenantId },
    });

    if (!credential || !credential.isConnected) {
      throw new BadRequestException('Mercado Pago is not connected');
    }

    // Check if token is expired or about to expire (5 min buffer)
    const now = new Date();
    const bufferTime = 5 * 60 * 1000; // 5 minutes

    if (credential.expiresAt && credential.expiresAt.getTime() - bufferTime < now.getTime()) {
      // Token expired or about to expire, refresh it
      await this.refreshAccessToken(tenantId, credential);
      // Fetch updated credential
      const updatedCredential = await this.prisma.mercadoPagoCredential.findUnique({
        where: { tenantId },
      });
      if (!updatedCredential) {
        throw new BadRequestException('Failed to refresh Mercado Pago credentials');
      }
      return this.decrypt(updatedCredential.accessToken, updatedCredential.iv);
    }

    return this.decrypt(credential.accessToken, credential.iv);
  }

  private async refreshAccessToken(
    tenantId: string,
    credential: { refreshToken: string | null; iv: string; isSandbox: boolean },
  ): Promise<void> {
    if (!credential.refreshToken) {
      throw new BadRequestException('No refresh token available. Please reconnect Mercado Pago.');
    }

    const refreshToken = this.decrypt(credential.refreshToken, credential.iv);

    const clientId = credential.isSandbox
      ? this.configService.get<string>('MP_CLIENT_ID')
      : this.configService.get<string>('MP_PROD_CLIENT_ID');

    const clientSecret = credential.isSandbox
      ? this.configService.get<string>('MP_CLIENT_SECRET')
      : this.configService.get<string>('MP_PROD_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException('Mercado Pago is not configured');
    }

    const response = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Token refresh failed for tenant ${tenantId}: ${error}`);
      // Mark as disconnected if refresh fails
      await this.prisma.mercadoPagoCredential.update({
        where: { tenantId },
        data: {
          isConnected: false,
          disconnectedAt: new Date(),
        },
      });
      throw new BadRequestException('Mercado Pago session expired. Please reconnect.');
    }

    const tokens: OAuthTokenResponse = await response.json();

    // Update stored credentials
    const { encrypted: encryptedAccessToken, iv } = this.encrypt(tokens.access_token);
    const { encrypted: encryptedRefreshToken } = this.encrypt(tokens.refresh_token);
    const { encrypted: encryptedPublicKey } = this.encrypt(tokens.public_key);
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    await this.prisma.mercadoPagoCredential.update({
      where: { tenantId },
      data: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        publicKey: encryptedPublicKey,
        iv,
        expiresAt,
      },
    });

    this.logger.log(`Access token refreshed for tenant ${tenantId}`);
  }

  /**
   * Create a payment preference for a booking deposit
   */
  async createDepositPreference(
    tenantId: string,
    bookingId: string,
    amount: number,
    description: string,
    backUrls: MPPreferenceBackUrls,
  ): Promise<{ preferenceId: string; initPoint: string; sandboxInitPoint: string }> {
    const accessToken = await this.getAccessToken(tenantId);

    // Check if preference already exists for this booking
    const existingPayment = await this.prisma.depositPayment.findUnique({
      where: { bookingId },
    });

    if (existingPayment && existingPayment.status === 'APPROVED') {
      throw new BadRequestException('This booking already has an approved payment');
    }

    // Generate unique external reference
    const externalReference = `booking_${bookingId}_${Date.now()}`;

    const credential = await this.prisma.mercadoPagoCredential.findUnique({
      where: { tenantId },
      select: { isSandbox: true },
    });

    const items: MPPreferenceItem[] = [
      {
        title: description,
        quantity: 1,
        unit_price: amount,
        currency_id: 'ARS',
      },
    ];

    const preferenceData = {
      items,
      back_urls: backUrls,
      auto_return: 'approved',
      external_reference: externalReference,
      notification_url: `${this.configService.get<string>('API_URL')}/api/mercadopago/webhook`,
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preferenceData),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Failed to create preference: ${error}`);
      throw new InternalServerErrorException('Failed to create payment. Please try again.');
    }

    const preference: MPPreferenceResponse = await response.json();

    // Store or update deposit payment record
    if (existingPayment) {
      await this.prisma.depositPayment.update({
        where: { bookingId },
        data: {
          preferenceId: preference.id,
          externalReference,
          amount,
          rawPreference: JSON.stringify(preference),
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
    } else {
      await this.prisma.depositPayment.create({
        data: {
          tenantId,
          bookingId,
          preferenceId: preference.id,
          externalReference,
          amount,
          currency: 'ARS',
          status: 'PENDING',
          rawPreference: JSON.stringify(preference),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
    }

    return {
      preferenceId: preference.id,
      initPoint: credential?.isSandbox ? preference.sandbox_init_point : preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
    };
  }

  /**
   * Process payment webhook notification
   */
  async processPaymentNotification(paymentId: string): Promise<void> {
    // First, find the deposit payment by checking all tenants
    // We need to get the payment details from MP to find the external_reference
    const depositPayments = await this.prisma.depositPayment.findMany({
      where: { paymentId: null, status: 'PENDING' },
      include: {
        tenant: {
          include: {
            mercadoPagoCredential: true,
          },
        },
      },
    });

    // Try to find the payment in each connected tenant
    for (const deposit of depositPayments) {
      if (!deposit.tenant?.mercadoPagoCredential?.isConnected) continue;

      try {
        const accessToken = await this.getAccessToken(deposit.tenantId);
        const payment = await this.getPaymentDetails(accessToken, paymentId);

        if (payment && payment.external_reference === deposit.externalReference) {
          await this.updateDepositPaymentFromNotification(deposit.id, payment, paymentId);
          return;
        }
      } catch (error) {
        this.logger.debug(`Payment ${paymentId} not found for tenant ${deposit.tenantId}`);
      }
    }

    this.logger.warn(`Payment ${paymentId} not matched to any deposit`);
  }

  private async getPaymentDetails(
    accessToken: string,
    paymentId: string,
  ): Promise<MPPaymentNotification | null> {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  }

  private async updateDepositPaymentFromNotification(
    depositId: string,
    payment: MPPaymentNotification,
    paymentId: string,
  ): Promise<void> {
    const statusMap: Record<string, string> = {
      approved: 'APPROVED',
      pending: 'PENDING',
      authorized: 'PENDING',
      in_process: 'PENDING',
      in_mediation: 'PENDING',
      rejected: 'REJECTED',
      cancelled: 'CANCELLED',
      refunded: 'CANCELLED',
      charged_back: 'CANCELLED',
    };

    const newStatus = statusMap[payment.status] || 'PENDING';
    const isApproved = newStatus === 'APPROVED';

    await this.prisma.$transaction(async (tx) => {
      // Update deposit payment
      const depositPayment = await tx.depositPayment.update({
        where: { id: depositId },
        data: {
          paymentId,
          status: newStatus,
          payerEmail: payment.payer?.email,
          payerName: payment.payer?.first_name
            ? `${payment.payer.first_name} ${payment.payer.last_name || ''}`.trim()
            : null,
          paymentMethod: payment.payment_method_id,
          paidAt: isApproved ? new Date() : null,
          rawPayment: JSON.stringify(payment),
        },
      });

      // If approved, update booking and auto-capture payer email
      if (isApproved) {
        const booking = await tx.booking.update({
          where: { id: depositPayment.bookingId },
          data: {
            depositPaid: true,
            depositPaidAt: new Date(),
            depositReference: paymentId,
            status: 'CONFIRMED',
          },
          include: { customer: true, service: true, employee: true },
        });

        // Auto-capture: if customer has no email, save payer email from MP
        if (payment.payer?.email && booking.customer && !booking.customer.email) {
          await tx.customer.update({
            where: { id: booking.customer.id },
            data: { email: payment.payer.email },
          });
          this.logger.log(`Auto-captured email ${payment.payer.email} for customer ${booking.customer.id}`);
        }

        this.logger.log(`Deposit payment ${depositId} approved, booking ${depositPayment.bookingId} confirmed`);

        // Emit confirmed event so notifications (email, push, WhatsApp) are sent
        this.eventEmitter.emit(BookingEvent.CONFIRMED, {
          booking,
          tenantId: booking.tenantId,
        } as BookingEventPayload);
      }
    });
  }

  /**
   * Verify webhook signature (HMAC)
   */
  verifyWebhookSignature(
    xSignature: string,
    xRequestId: string,
    dataId: string,
    webhookSecret: string,
  ): boolean {
    // Parse x-signature header
    const signatureParts = xSignature.split(',').reduce(
      (acc, part) => {
        const [key, value] = part.split('=');
        acc[key.trim()] = value;
        return acc;
      },
      {} as Record<string, string>,
    );

    const ts = signatureParts['ts'];
    const receivedSignature = signatureParts['v1'];

    if (!ts || !receivedSignature) {
      return false;
    }

    // Create signature template
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

    // Calculate HMAC
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(manifest);
    const calculatedSignature = hmac.digest('hex');

    return calculatedSignature === receivedSignature;
  }

  /**
   * Get payment status for a booking
   */
  async getPaymentStatus(bookingId: string): Promise<{
    status: string;
    paymentId: string | null;
    paidAt: Date | null;
    amount: number;
  } | null> {
    const depositPayment = await this.prisma.depositPayment.findUnique({
      where: { bookingId },
      select: {
        status: true,
        paymentId: true,
        paidAt: true,
        amount: true,
      },
    });

    if (!depositPayment) {
      return null;
    }

    return {
      status: depositPayment.status,
      paymentId: depositPayment.paymentId,
      paidAt: depositPayment.paidAt,
      amount: Number(depositPayment.amount),
    };
  }
}
