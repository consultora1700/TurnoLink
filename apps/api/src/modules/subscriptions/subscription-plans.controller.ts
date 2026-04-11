import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { SubscriptionsService } from './subscriptions.service';

@Controller('plans')
@Public()
export class SubscriptionPlansController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  async getPlans(@Query('industryGroup') industryGroup?: string) {
    return this.subscriptionsService.getPlans(industryGroup);
  }

  @Get(':slug')
  async getPlan(@Param('slug') slug: string) {
    return this.subscriptionsService.getPlanBySlug(slug);
  }
}

@Controller('industry-groups')
@Public()
export class IndustryGroupsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  async getGroups() {
    return this.subscriptionsService.getIndustryGroups();
  }
}
