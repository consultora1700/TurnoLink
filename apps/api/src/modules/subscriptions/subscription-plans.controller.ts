import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';

@Controller('plans')
export class SubscriptionPlansController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  async getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @Get(':slug')
  async getPlan(@Param('slug') slug: string) {
    return this.subscriptionsService.getPlanBySlug(slug);
  }
}
