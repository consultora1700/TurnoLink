import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

interface CreateReviewDto {
  bookingId: string;
  rating: number;
  comment?: string;
}

interface SubmitPublicReviewDto {
  bookingId: string;
  token: string;
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
  private readonly reviewSecret: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET environment variable is required');
    this.reviewSecret = secret;
  }

  // ============ REVIEW TOKEN ============

  /**
   * Generate an HMAC token for review submission.
   * Token = HMAC-SHA256(bookingId:customerId:tenantId, secret) — valid indefinitely (30 day window enforced at submit).
   */
  generateReviewToken(bookingId: string, customerId: string, tenantId: string): string {
    const payload = `${bookingId}:${customerId}:${tenantId}`;
    return crypto.createHmac('sha256', this.reviewSecret).update(payload).digest('hex');
  }

  /**
   * Validate a review token against booking data.
   */
  private validateReviewToken(token: string, bookingId: string, customerId: string, tenantId: string): boolean {
    const expected = this.generateReviewToken(bookingId, customerId, tenantId);
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  }

  // ============ PUBLIC SUBMIT ============

  async submitPublicReview(slug: string, dto: SubmitPublicReviewDto) {
    // Validate rating
    if (!dto.rating || dto.rating < 1 || dto.rating > 5) {
      throw new BadRequestException('La calificación debe ser entre 1 y 5');
    }

    // Find tenant by slug
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });
    if (!tenant) {
      throw new NotFoundException('Negocio no encontrado');
    }

    // Find booking
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: dto.bookingId,
        tenantId: tenant.id,
        status: 'COMPLETED',
      },
      include: { customer: true },
    });
    if (!booking) {
      throw new NotFoundException('Reserva no encontrada o no completada');
    }

    // Validate token
    if (!this.validateReviewToken(dto.token, booking.id, booking.customerId, tenant.id)) {
      throw new ForbiddenException('Token de reseña inválido');
    }

    // Enforce 30-day review window after booking date
    const bookingDate = new Date(booking.date);
    const daysSinceBooking = (Date.now() - bookingDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceBooking > 30) {
      throw new BadRequestException('El plazo para dejar una reseña ha expirado (30 días)');
    }

    // Check if review already exists
    const existingReview = await this.prisma.review.findUnique({
      where: { bookingId: dto.bookingId },
    });
    if (existingReview) {
      throw new BadRequestException('Ya dejaste una reseña para esta reserva');
    }

    // Create review (approved by default)
    const review = await this.prisma.review.create({
      data: {
        tenantId: tenant.id,
        customerId: booking.customerId,
        bookingId: dto.bookingId,
        rating: dto.rating,
        comment: dto.comment?.trim() || null,
        isApproved: true,
        isVisible: true,
      },
      include: {
        customer: { select: { name: true } },
      },
    });

    this.logger.log(`Public review submitted for booking ${dto.bookingId} in tenant ${slug}`);

    return review;
  }

  // ============ PUBLIC REVIEWS LIST ============

  async getPublicReviews(slug: string, options?: { limit?: number; offset?: number }) {
    const { limit = 10, offset = 0 } = options || {};

    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!tenant) {
      throw new NotFoundException('Negocio no encontrado');
    }

    const where = {
      tenantId: tenant.id,
      isVisible: true,
      isApproved: true,
    };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          customer: { select: { name: true } },
          booking: { select: { service: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        customerName: r.customer.name,
        serviceName: (r as any).booking?.service?.name || null,
        createdAt: r.createdAt,
        ownerResponse: r.ownerResponse || null,
        ownerRespondedAt: r.ownerRespondedAt || null,
      })),
      total,
      hasMore: offset + reviews.length < total,
    };
  }

  // ============ BOOKING INFO FOR REVIEW PAGE ============

  async getBookingInfoForReview(slug: string, bookingId: string, token: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, name: true, logo: true },
    });
    if (!tenant) {
      throw new NotFoundException('Negocio no encontrado');
    }

    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, tenantId: tenant.id },
      include: {
        customer: { select: { name: true, id: true } },
        service: { select: { name: true } },
        product: { select: { name: true, price: true } },
      },
    });
    if (!booking) {
      throw new NotFoundException('Reserva no encontrada');
    }

    // Validate token
    if (!this.validateReviewToken(token, booking.id, booking.customerId, tenant.id)) {
      throw new ForbiddenException('Token inválido');
    }

    // Check if already reviewed
    const existingReview = await this.prisma.review.findUnique({
      where: { bookingId },
    });

    return {
      businessName: tenant.name,
      businessLogo: tenant.logo,
      serviceName: (booking.service?.name ?? booking.product?.name ?? 'Sin detalle'),
      customerName: booking.customer.name,
      date: booking.date,
      alreadyReviewed: !!existingReview,
    };
  }

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
            email: true,
          },
        },
        booking: {
          select: {
            service: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateReviewVisibility(id: string, tenantId: string, isVisible: boolean) {
    // Use transaction to prevent race conditions on hide quota
    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.findFirst({
        where: { id, tenantId },
      });

      if (!review) {
        throw new NotFoundException('Review not found');
      }

      // If trying to hide, enforce quota
      if (!isVisible && review.isVisible) {
        const total = await tx.review.count({ where: { tenantId } });
        const hidden = await tx.review.count({ where: { tenantId, isVisible: false } });
        const maxHideable = total < 5 ? 1 : Math.floor(total * 0.2);

        if (hidden >= maxHideable) {
          throw new BadRequestException(
            `No puedes ocultar mas resenas. Limite: ${maxHideable} de ${total} (${total < 5 ? 'maximo 1 si hay menos de 5' : 'maximo 20%'})`
          );
        }
      }

      return tx.review.update({
        where: { id },
        data: { isVisible },
      });
    });
  }

  // ============ HIDE QUOTA ============

  async getHideQuota(tenantId: string) {
    const [total, hidden] = await Promise.all([
      this.prisma.review.count({ where: { tenantId } }),
      this.prisma.review.count({ where: { tenantId, isVisible: false } }),
    ]);

    const maxHideable = total < 5 ? 1 : Math.floor(total * 0.2);

    return {
      total,
      hidden,
      maxHideable,
      remaining: Math.max(0, maxHideable - hidden),
    };
  }

  // ============ OWNER RESPONSE ============

  async respondToReview(id: string, tenantId: string, response: string | null) {
    const review = await this.prisma.review.findFirst({
      where: { id, tenantId },
    });

    if (!review) {
      throw new NotFoundException('Resena no encontrada');
    }

    const trimmed = response?.trim() || null;

    return this.prisma.review.update({
      where: { id },
      data: {
        ownerResponse: trimmed,
        ownerRespondedAt: trimmed ? new Date() : null,
      },
    });
  }

  // ============ FLAG REVIEW ============

  async flagReview(id: string, tenantId: string, reason: string) {
    const validReasons = ['spam', 'fake', 'inappropriate', 'other'];
    if (!validReasons.includes(reason)) {
      throw new BadRequestException(`Motivo invalido. Opciones: ${validReasons.join(', ')}`);
    }

    const review = await this.prisma.review.findFirst({
      where: { id, tenantId },
    });

    if (!review) {
      throw new NotFoundException('Resena no encontrada');
    }

    if (review.flaggedByOwner) {
      throw new BadRequestException('Esta resena ya fue reportada');
    }

    return this.prisma.review.update({
      where: { id },
      data: {
        flaggedByOwner: true,
        flagReason: reason,
      },
    });
  }
}
