import {
  Controller,
  Post,
  Body,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PlatformService } from './platform.service';
import { verifyMercadoPagoSignature } from '../../common/utils/webhook-signature';
import { Public } from '../../common/decorators/public.decorator';

interface WebhookPayload {
  id?: number;
  live_mode?: boolean;
  type?: string;
  date_created?: string;
  user_id?: number;
  api_version?: string;
  action?: string;
  data?: {
    id?: string;
  };
}

@Controller('platform/webhook')
@Public()
export class PlatformWebhookController {
  private readonly logger = new Logger(PlatformWebhookController.name);

  constructor(
    private readonly platformService: PlatformService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Handle MercadoPago webhook notifications for subscription payments
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() payload: WebhookPayload,
    @Query('type') queryType: string,
    @Query('data.id') queryDataId: string,
    @Headers('x-signature') signature: string,
    @Headers('x-request-id') requestId: string,
  ) {
    this.logger.log(`Platform webhook received: type=${payload.type || queryType}`);

    try {
      // MercadoPago can send data in body or query params
      const type = payload.type || queryType;
      const dataId = payload.data?.id || queryDataId;

      // Verify webhook signature
      const webhookSecret = this.configService.get<string>('PLATFORM_WEBHOOK_SECRET');
      if (dataId && !verifyMercadoPagoSignature(signature, requestId, dataId, webhookSecret)) {
        this.logger.warn('Invalid platform webhook signature');
        throw new UnauthorizedException('Invalid webhook signature');
      }

      if (!type || !dataId) {
        this.logger.warn('Webhook missing type or data.id');
        return { received: true };
      }

      // Process notifications by type
      switch (type) {
        case 'payment':
          // One-time payment (legacy or first payment)
          await this.platformService.processPaymentNotification(dataId);
          break;

        case 'subscription_preapproval':
          // Recurring subscription status change (authorized, paused, cancelled)
          await this.platformService.processPreapprovalNotification(dataId);
          break;

        case 'subscription_authorized_payment':
          // Recurring payment charged successfully
          await this.platformService.processAuthorizedPaymentNotification(dataId);
          break;

        default:
          this.logger.debug(`Ignoring webhook type: ${type}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error('Error processing webhook', error);
      // Always return 200 to prevent MercadoPago retries
      return { received: true, error: true };
    }
  }

  /**
   * Test endpoint to verify webhook is accessible
   */
  @Post('test')
  @HttpCode(HttpStatus.OK)
  async testWebhook(@Body() body: any) {
    this.logger.log('Platform webhook test received');
    return {
      received: true,
      timestamp: new Date().toISOString(),
      body,
    };
  }
}
