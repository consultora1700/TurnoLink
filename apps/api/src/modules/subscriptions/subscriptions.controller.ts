import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,

  Request,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { PlatformService } from '../platform/platform.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly platformService: PlatformService,
  ) {}

  @Get()
  async getSubscription(@Request() req: any) {
    return this.subscriptionsService.getSubscription(req.user.tenantId);
  }

  @Get('status')
  async getStatus(@Request() req: any) {
    return this.subscriptionsService.checkTrialStatus(req.user.tenantId);
  }

  @Get('limits/:resource')
  async checkLimit(@Request() req: any, @Param('resource') resource: string) {
    return this.subscriptionsService.checkLimit(
      req.user.tenantId,
      resource as 'branches' | 'employees' | 'services' | 'bookings' | 'customers',
    );
  }

  @Post('trial')
  async startTrial(@Request() req: any, @Body('planSlug') planSlug?: string) {
    return this.subscriptionsService.createTrialSubscription(
      req.user.tenantId,
      planSlug,
    );
  }

  @Post('free')
  async startFree(@Request() req: any, @Body('planSlug') planSlug?: string) {
    // Legacy endpoint — prefer POST /subscriptions/change-plan
    return this.subscriptionsService.createFreeSubscription(req.user.tenantId, true);
  }

  @Post('upgrade')
  async upgradePlan(@Request() req: any, @Body('planSlug') planSlug: string) {
    return this.subscriptionsService.upgradePlan(req.user.tenantId, planSlug);
  }

  /**
   * Unified plan change endpoint.
   * Handles: new subscription, V1 migration, upgrade, downgrade, free↔paid.
   * Returns { subscription, action, message }
   */
  @Post('change-plan')
  async changePlan(
    @Request() req: any,
    @Body('planSlug') planSlug: string,
  ) {
    if (!planSlug) {
      throw new BadRequestException('planSlug es requerido');
    }
    return this.subscriptionsService.changePlan(req.user.tenantId, planSlug);
  }

  @Post('activate')
  async activate(
    @Request() req: any,
    @Body('billingPeriod') billingPeriod?: 'MONTHLY' | 'YEARLY',
  ) {
    // Solo SUPER_ADMIN puede activar manualmente (la activación normal es vía webhook de pago)
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException(
        'La activación se realiza automáticamente al confirmar el pago.',
      );
    }
    return this.subscriptionsService.activateSubscription(
      req.user.tenantId,
      billingPeriod,
    );
  }

  @Patch('cancel')
  async cancel(@Request() req: any, @Body('reason') reason?: string) {
    // Cancel in MercadoPago first (stops recurring charges)
    await this.platformService.cancelRecurringSubscription(req.user.tenantId);
    return this.subscriptionsService.cancelSubscription(req.user.tenantId, reason);
  }

  /**
   * Create recurring subscription via MercadoPago Preapproval
   * The user authorizes once and gets charged automatically every billing period
   */
  @Post('create-payment')
  async createPayment(
    @Request() req: any,
    @Body('planSlug') planSlug: string,
    @Body('billingPeriod') billingPeriod: 'MONTHLY' | 'YEARLY' = 'MONTHLY',
  ) {
    if (!planSlug) {
      throw new BadRequestException('Plan slug is required');
    }

    // Check if platform MP is connected
    const isConnected = await this.platformService.isConnected();
    if (!isConnected) {
      throw new BadRequestException('El sistema de pagos no está disponible en este momento');
    }

    // Get user email
    const userEmail = req.user.email;
    if (!userEmail) {
      throw new BadRequestException('Email del usuario no disponible');
    }

    // Create recurring subscription (MercadoPago Preapproval)
    const result = await this.platformService.createRecurringSubscription(
      req.user.tenantId,
      planSlug,
      billingPeriod,
      userEmail,
    );

    return {
      success: true,
      preapprovalId: result.preapprovalId,
      initPoint: result.initPoint,
      message: 'Redirigiendo a MercadoPago para autorizar el débito automático...',
    };
  }

  /**
   * Get payment history for current tenant
   */
  @Get('payments')
  async getPayments(@Request() req: any) {
    return this.subscriptionsService.getPaymentHistory(req.user.tenantId);
  }
}
