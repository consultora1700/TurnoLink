import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PushService } from './push.service';
import { PushSubscriptionDto } from './dto/push-subscription.dto';

@Controller('push')
@UseGuards(JwtAuthGuard)
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Get('vapid-key')
  getVapidKey() {
    return { key: this.pushService.getVapidPublicKey() };
  }

  @Post('subscribe')
  async subscribe(@Request() req: any, @Body() dto: PushSubscriptionDto) {
    await this.pushService.subscribe(
      req.user.tenantId,
      req.user.id,
      dto.endpoint,
      dto.p256dh,
      dto.auth,
    );
    return { success: true };
  }

  @Delete('unsubscribe')
  async unsubscribe(@Body() body: { endpoint: string }) {
    await this.pushService.unsubscribe(body.endpoint);
    return { success: true };
  }
}
