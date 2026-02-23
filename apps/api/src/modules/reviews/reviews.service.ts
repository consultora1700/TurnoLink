import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface CreateReviewDto {
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface TenantStats {
  totalBookings: number;
  bookingsThisWeek: number;
  bookingsThisMonth: number;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { rating: number; count: number }[];
}

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(private prisma: PrismaService) {}

  // ============ PUBLIC REVIEWS ============

  async createReview(tenantId: string, dto: CreateReviewDto) {
    // Validate rating
    if (dto.rating < 1 || dto.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Check if booking exists and belongs to tenant
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: dto.bookingId,
        tenantId,
        status: 'COMPLETED',
      },
      include: {
        customer: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found or not completed');
    }

    // Check if review already exists for this booking
    const existingReview = await this.prisma.review.findUnique({
      where: { bookingId: dto.bookingId },
    });

    if (existingReview) {
      throw new BadRequestException('Review already exists for this booking');
    }

    // Create review
    const review = await this.prisma.review.create({
      data: {
        tenantId,
        customerId: booking.customerId,
        bookingId: dto.bookingId,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        customer: {
          select: {
            name: true,
          },
        },
      },
    });

    this.logger.log(`Review created for booking ${dto.bookingId}`);

    return review;
  }

  async getReviewsByTenant(
    tenantId: string,
    options?: {
      limit?: number;
      offset?: number;
      minRating?: number;
    },
  ) {
    const { limit = 10, offset = 0, minRating } = options || {};

    const where: any = {
      tenantId,
      isVisible: true,
      isApproved: true,
    };

    if (minRating) {
      where.rating = { gte: minRating };
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          customer: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      reviews,
      total,
      hasMore: offset + reviews.length < total,
    };
  }

  // ============ TENANT STATS (PUBLIC) ============

  async getTenantStats(tenantId: string): Promise<TenantStats> {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get booking counts
    const [totalBookings, bookingsThisWeek, bookingsThisMonth] = await Promise.all([
      this.prisma.booking.count({
        where: { tenantId, status: 'COMPLETED' },
      }),
      this.prisma.booking.count({
        where: {
          tenantId,
          status: 'COMPLETED',
          date: { gte: oneWeekAgo },
        },
      }),
      this.prisma.booking.count({
        where: {
          tenantId,
          status: 'COMPLETED',
          date: { gte: oneMonthAgo },
        },
      }),
    ]);

    // Get review stats
    const reviewStats = await this.prisma.review.aggregate({
      where: { tenantId, isVisible: true, isApproved: true },
      _avg: { rating: true },
      _count: { id: true },
    });

    // Get rating distribution
    const ratingDistribution = await this.prisma.review.groupBy({
      by: ['rating'],
      where: { tenantId, isVisible: true, isApproved: true },
      _count: { rating: true },
    });

    return {
      totalBookings,
      bookingsThisWeek,
      bookingsThisMonth,
      averageRating: reviewStats._avg.rating || 0,
      totalReviews: reviewStats._count.id,
      ratingDistribution: ratingDistribution.map((r) => ({
        rating: r.rating,
        count: r._count.rating,
      })),
    };
  }

  // ============ PUBLIC PAGE STATS ============

  async getPublicStats(slug: string): Promise<{
    averageRating: number;
    totalReviews: number;
    recentBookingsCount: number;
    recentBookingsText: string;
  }> {
    // Find tenant by slug
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });

    if (!tenant) {
      throw new NotFoundException('Business not found');
    }

    // Get stats
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [reviewStats, recentBookings] = await Promise.all([
      this.prisma.review.aggregate({
        where: {
          tenantId: tenant.id,
          isVisible: true,
          isApproved: true,
        },
        _avg: { rating: true },
        _count: { id: true },
      }),
      this.prisma.booking.count({
        where: {
          tenantId: tenant.id,
          createdAt: { gte: oneWeekAgo },
        },
      }),
    ]);

    // Format recent bookings text
    let recentBookingsText = '';
    if (recentBookings >= 50) {
      recentBookingsText = `+50 personas reservaron esta semana`;
    } else if (recentBookings >= 20) {
      recentBookingsText = `+${Math.floor(recentBookings / 10) * 10} personas reservaron esta semana`;
    } else if (recentBookings >= 10) {
      recentBookingsText = `+10 personas reservaron esta semana`;
    } else if (recentBookings >= 5) {
      recentBookingsText = `${recentBookings} personas reservaron esta semana`;
    } else if (recentBookings > 0) {
      recentBookingsText = `Reservas disponibles`;
    }

    return {
      averageRating: reviewStats._avg.rating || 0,
      totalReviews: reviewStats._count.id,
      recentBookingsCount: recentBookings,
      recentBookingsText,
    };
  }

  // ============ ADMIN REVIEWS ============

  async getReviewsForAdmin(tenantId: string) {
    return this.prisma.review.findMany({
      where: { tenantId },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateReviewVisibility(id: string, tenantId: string, isVisible: boolean) {
    const review = await this.prisma.review.findFirst({
      where: { id, tenantId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return this.prisma.review.update({
      where: { id },
      data: { isVisible },
    });
  }
}
