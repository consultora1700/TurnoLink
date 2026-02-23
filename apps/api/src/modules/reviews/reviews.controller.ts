import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ReviewsService, TenantStats } from './reviews.service';

// ============ PUBLIC ENDPOINTS ============

@Controller('public/reviews')
export class PublicReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get(':slug')
  async getPublicReviews(
    @Param('slug') slug: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    // Get tenant by slug first
    const stats = await this.reviewsService.getPublicStats(slug);
    return stats;
  }

  @Get(':slug/stats')
  async getPublicStats(@Param('slug') slug: string) {
    return this.reviewsService.getPublicStats(slug);
  }
}

// ============ AUTHENTICATED ENDPOINTS ============

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  async getReviews(@Request() req: any) {
    return this.reviewsService.getReviewsForAdmin(req.user.tenantId);
  }

  @Get('stats')
  async getStats(@Request() req: any) {
    return this.reviewsService.getTenantStats(req.user.tenantId);
  }

  @Post()
  async createReview(
    @Request() req: any,
    @Body() dto: { bookingId: string; rating: number; comment?: string },
  ) {
    return this.reviewsService.createReview(req.user.tenantId, dto);
  }

  @Patch(':id/visibility')
  async updateVisibility(
    @Request() req: any,
    @Param('id') id: string,
    @Body('isVisible') isVisible: boolean,
  ) {
    return this.reviewsService.updateReviewVisibility(id, req.user.tenantId, isVisible);
  }
}
