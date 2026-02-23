import {
  Controller,
  Post,
  Body,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PlatformService } from './platform.service';

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
export class PlatformWebhookController {
  private readonly logger = new Logger(PlatformWebhookController.name);

  constructor(private readonly platformService: PlatformService) {}

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

      if (!type || !dataId) {
        this.logger.warn('Webhook missing type or data.id');
        return { received: true };
      }

      // Process payment notifications
      if (type === 'payment') {
        await this.platformService.processPaymentNotification(dataId);
      } else {
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
