import {
  Controller,
  Post,
  Body,
  Headers,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MercadoPagoService } from './mercadopago.service';
import { Public } from '../../common/decorators';

interface WebhookPayload {
  id: number;
  live_mode: boolean;
  type: string;
  date_created: string;
  user_id: number;
  api_version: string;
  action: string;
  data: {
    id: string;
  };
}

@ApiTags('Mercado Pago Webhook')
@Controller('mercadopago')
export class MercadoPagoWebhookController {
  private readonly logger = new Logger(MercadoPagoWebhookController.name);

  constructor(
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post('webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mercado Pago payment webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(
    @Body() payload: WebhookPayload,
    @Headers('x-signature') xSignature: string,
    @Headers('x-request-id') xRequestId: string,
  ) {
    this.logger.log(`Received webhook: type=${payload.type}, action=${payload.action}, data_id=${payload.data?.id}`);

    // Handle payment notifications
    if (payload.type === 'payment' && payload.data?.id) {
      try {
        await this.mercadoPagoService.processPaymentNotification(payload.data.id);

        // Emit event for other modules (notifications, etc.)
        this.eventEmitter.emit('payment.received', {
          paymentId: payload.data.id,
          action: payload.action,
          liveMode: payload.live_mode,
        });

        this.logger.log(`Payment notification processed: ${payload.data.id}`);
      } catch (error) {
        this.logger.error(`Failed to process payment ${payload.data.id}: ${error.message}`);
        // Still return 200 to prevent retries for processing errors
      }
    }

    // Handle merchant order notifications (optional)
    if (payload.type === 'merchant_order') {
      this.logger.debug(`Merchant order notification: ${payload.data?.id}`);
    }

    // Always return 200 to acknowledge receipt
    return { received: true };
  }

  @Post('webhook/test')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test webhook endpoint (for development)' })
  @ApiResponse({ status: 200, description: 'Test webhook received' })
  async handleTestWebhook(@Body() payload: any) {
    this.logger.log(`Test webhook received: ${JSON.stringify(payload)}`);
    return { received: true, test: true };
  }
}
