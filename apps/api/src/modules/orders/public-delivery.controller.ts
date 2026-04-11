import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { OrdersService } from './orders.service';

/**
 * Public endpoints accessed by the delivery person via a token URL.
 * No JWT auth — the token itself is the credential.
 * The merchant shares the link via WhatsApp with whoever performs the delivery.
 */
@Public()
@Controller('public/delivery')
export class PublicDeliveryController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get(':token')
  getOrder(@Param('token') token: string) {
    return this.ordersService.getDeliveryByToken(token);
  }

  @Post(':token/advance')
  advance(@Param('token') token: string) {
    return this.ordersService.advanceDeliveryByToken(token);
  }

  @Post(':token/confirm-delivery')
  confirmDelivery(@Param('token') token: string, @Body() body: { word: string }) {
    return this.ordersService.confirmDeliveryWithWord(token, body?.word || '');
  }
}
