import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { ReviewsService, TenantStats } from './reviews.service';

// ============ PUBLIC ENDPOINTS ============

@Controller('public/reviews')
@Public()
export class PublicReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get(':slug')
  async getPublicReviews(
    @Param('slug') slug: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.reviewsService.getPublicReviews(slug, {
      limit: limit ? parseInt(limit, 10) : 10,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  @Get(':slug/stats')
  async getPublicStats(@Param('slug') slug: string) {
    return this.reviewsService.getPublicStats(slug);
  }

  @Get(':slug/booking-info')
  async getBookingInfo(
    @Param('slug') slug: string,
    @Query('bookingId') bookingId: string,
    @Query('token') token: string,
  ) {
    return this.reviewsService.getBookingInfoForReview(slug, bookingId, token);
  }

  @Post(':slug/submit')
  async submitReview(
    @Param('slug') slug: string,
    @Body() dto: { bookingId: string; token: string; rating: number; comment?: string },
  ) {
    return this.reviewsService.submitPublicReview(slug, dto);
  }
}

// ============ AUTHENTICATED ENDPOINTS ============

@Controller('reviews')
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

  @Get('hide-quota')
  async getHideQuota(@Request() req: any) {
    return this.reviewsService.getHideQuota(req.user.tenantId);
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

  @Patch(':id/response')
  async respondToReview(
    @Request() req: any,
    @Param('id') id: string,
    @Body('response') response: string | null,
  ) {
    return this.reviewsService.respondToReview(id, req.user.tenantId, response);
  }

  @Patch(':id/flag')
  async flagReview(
    @Request() req: any,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.reviewsService.flagReview(id, req.user.tenantId, reason);
  }
}
