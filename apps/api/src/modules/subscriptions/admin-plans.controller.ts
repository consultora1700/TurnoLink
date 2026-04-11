import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { AdminKeyGuard } from '../admin/guards/admin-key.guard';
import { Public } from '../../common/decorators/public.decorator';

@Controller('admin/industry-groups')
@Public()
@UseGuards(AdminKeyGuard)
export class AdminIndustryGroupsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  async getAll() {
    return this.subscriptionsService.getAllIndustryGroups();
  }

  @Post()
  async create(
    @Body() body: {
      slug: string;
      name: string;
      description?: string;
      industries?: string[];
      limitLabels?: Record<string, string | null>;
      order?: number;
    },
  ) {
    return this.subscriptionsService.createIndustryGroup(body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: {
      name?: string;
      description?: string;
      industries?: string[];
      limitLabels?: Record<string, string | null>;
      order?: number;
      isActive?: boolean;
    },
  ) {
    return this.subscriptionsService.updateIndustryGroup(id, body);
  }
}

@Controller('admin/plans')
@Public()
@UseGuards(AdminKeyGuard)
export class AdminPlansController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  async getAll() {
    return this.subscriptionsService.getAllPlans();
  }

  @Post()
  async create(
    @Body() body: {
      name: string;
      slug: string;
      description?: string;
      priceMonthly: number;
      priceYearly: number;
      trialDays?: number;
      maxBranches?: number;
      maxEmployees?: number;
      maxServices?: number | null;
      maxBookingsMonth?: number | null;
      maxCustomers?: number | null;
      maxPhotos?: number | null;
      features?: string[];
      isPopular?: boolean;
      order?: number;
      industryGroupId?: string;
    },
  ) {
    return this.subscriptionsService.createPlan(body);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: {
      name?: string;
      description?: string;
      priceMonthly?: number;
      priceYearly?: number;
      trialDays?: number;
      maxBranches?: number;
      maxEmployees?: number;
      maxServices?: number | null;
      maxBookingsMonth?: number | null;
      maxCustomers?: number | null;
      maxPhotos?: number | null;
      features?: string[];
      isPopular?: boolean;
      isActive?: boolean;
      order?: number;
      industryGroupId?: string | null;
    },
  ) {
    return this.subscriptionsService.updatePlan(id, body);
  }

  @Delete(':id')
  async deactivate(@Param('id') id: string) {
    return this.subscriptionsService.deactivatePlan(id);
  }

  @Post('seed')
  async seed() {
    await this.subscriptionsService.seedIndustryPlans();
    return { message: 'Industry plans seeded successfully' };
  }
}
