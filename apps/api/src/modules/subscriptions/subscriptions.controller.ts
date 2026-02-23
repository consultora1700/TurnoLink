import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';
import { PlatformService } from '../platform/platform.service';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
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
  async startFree(@Request() req: any) {
    return this.subscriptionsService.createFreeSubscription(req.user.tenantId);
  }

  @Post('upgrade')
  async upgradePlan(@Request() req: any, @Body('planSlug') planSlug: string) {
    return this.subscriptionsService.upgradePlan(req.user.tenantId, planSlug);
  }

  @Post('activate')
  async activate(
    @Request() req: any,
    @Body('billingPeriod') billingPeriod?: 'MONTHLY' | 'YEARLY',
  ) {
    return this.subscriptionsService.activateSubscription(
      req.user.tenantId,
      billingPeriod,
    );
  }

  @Patch('cancel')
  async cancel(@Request() req: any, @Body('reason') reason?: string) {
    return this.subscriptionsService.cancelSubscription(req.user.tenantId, reason);
  }

  /**
   * Create payment preference for plan upgrade
   * This creates a MercadoPago checkout for the user to pay
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

    // Create payment preference
    const result = await this.platformService.createSubscriptionPreference(
      req.user.tenantId,
      planSlug,
      billingPeriod,
      userEmail,
    );

    return {
      success: true,
      preferenceId: result.preferenceId,
      initPoint: result.initPoint,
      message: 'Redirigiendo al pago...',
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
