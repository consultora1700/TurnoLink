import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PromoCodesService {
  private readonly logger = new Logger(PromoCodesService.name);

  constructor(private prisma: PrismaService) {}

  // ============ ADMIN METHODS ============

  async getAllPromoCodes() {
    return this.prisma.promoCode.findMany({
      include: {
        plan: {
          select: { id: true, name: true, slug: true, priceMonthly: true, industryGroup: { select: { name: true } } },
        },
        redemptions: {
          include: {
            tenant: { select: { id: true, name: true, slug: true } },
          },
          orderBy: { redeemedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPromoCode(data: {
    code: string;
    description?: string;
    discountPercent: number;
    planId: string;
    maxUses?: number;
    expiresAt?: string;
  }) {
    if (data.discountPercent < 0 || data.discountPercent > 100) {
      throw new BadRequestException('El porcentaje de descuento debe estar entre 0 y 100');
    }

    // Verify plan exists
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: data.planId },
    });
    if (!plan) {
      throw new NotFoundException('Plan no encontrado');
    }

    const code = data.code.toUpperCase().trim();

    // Check uniqueness
    const existing = await this.prisma.promoCode.findUnique({ where: { code } });
    if (existing) {
      throw new BadRequestException(`El código "${code}" ya existe`);
    }

    return this.prisma.promoCode.create({
      data: {
        code,
        description: data.description,
        discountPercent: data.discountPercent,
        planId: data.planId,
        maxUses: data.maxUses ?? 1,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
      include: {
        plan: { select: { id: true, name: true, slug: true, priceMonthly: true } },
      },
    });
  }

  async updatePromoCode(
    id: string,
    data: {
      description?: string;
      discountPercent?: number;
      planId?: string;
      maxUses?: number;
      isActive?: boolean;
      expiresAt?: string | null;
    },
  ) {
    if (data.discountPercent !== undefined && (data.discountPercent < 0 || data.discountPercent > 100)) {
      throw new BadRequestException('El porcentaje de descuento debe estar entre 0 y 100');
    }

    const updateData: any = {};
    if (data.description !== undefined) updateData.description = data.description;
    if (data.discountPercent !== undefined) updateData.discountPercent = data.discountPercent;
    if (data.planId !== undefined) updateData.planId = data.planId;
    if (data.maxUses !== undefined) updateData.maxUses = data.maxUses;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

    return this.prisma.promoCode.update({
      where: { id },
      data: updateData,
      include: {
        plan: { select: { id: true, name: true, slug: true, priceMonthly: true } },
      },
    });
  }

  async deactivatePromoCode(id: string) {
    return this.prisma.promoCode.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ============ USER METHODS ============

  async validatePromoCode(code: string, tenantId: string) {
    const promo = await this.prisma.promoCode.findUnique({
      where: { code: code.toUpperCase().trim() },
      include: {
        plan: {
          select: { id: true, name: true, slug: true, priceMonthly: true, industryGroup: { select: { name: true } } },
        },
      },
    });

    if (!promo) {
      throw new BadRequestException('Código promocional no válido');
    }

    if (!promo.isActive) {
      throw new BadRequestException('Este código promocional ya no está activo');
    }

    if (promo.expiresAt && new Date() > promo.expiresAt) {
      throw new BadRequestException('Este código promocional ha expirado');
    }

    if (promo.usedCount >= promo.maxUses) {
      throw new BadRequestException('Este código promocional ya alcanzó el límite de usos');
    }

    // Check if tenant already used this code
    const existingRedemption = await this.prisma.promoCodeRedemption.findUnique({
      where: {
        promoCodeId_tenantId: {
          promoCodeId: promo.id,
          tenantId,
        },
      },
    });

    if (existingRedemption) {
      throw new BadRequestException('Ya utilizaste este código promocional');
    }

    const originalPrice = Number(promo.plan.priceMonthly);
    const discountAmount = (originalPrice * promo.discountPercent) / 100;
    const finalPrice = originalPrice - discountAmount;

    return {
      valid: true,
      code: promo.code,
      discountPercent: promo.discountPercent,
      plan: promo.plan,
      originalPrice,
      discountAmount,
      finalPrice,
      requiresPayment: finalPrice > 0,
    };
  }

  async redeemPromoCode(code: string, tenantId: string) {
    // First validate
    const validation = await this.validatePromoCode(code, tenantId);

    const promo = await this.prisma.promoCode.findUnique({
      where: { code: code.toUpperCase().trim() },
      include: { plan: true },
    });

    if (!promo) {
      throw new BadRequestException('Código promocional no válido');
    }

    const originalPrice = Number(promo.plan.priceMonthly);
    const discountedPrice = validation.finalPrice;

    // If 100% discount, activate subscription directly
    if (promo.discountPercent === 100) {
      // Create/update subscription with the promo plan, status ACTIVE
      const result = await this.prisma.$transaction(async (tx) => {
        // Increment usage
        await tx.promoCode.update({
          where: { id: promo.id },
          data: { usedCount: { increment: 1 } },
        });

        // Record redemption
        const redemption = await tx.promoCodeRedemption.create({
          data: {
            promoCodeId: promo.id,
            tenantId,
            discountPercent: promo.discountPercent,
            originalPrice,
            discountedPrice,
          },
        });

        // Upsert subscription to ACTIVE with this plan
        const subscription = await tx.subscription.upsert({
          where: { tenantId },
          create: {
            tenantId,
            planId: promo.planId,
            status: 'ACTIVE',
            billingPeriod: 'MONTHLY',
            currentPeriodStart: new Date(),
            currentPeriodEnd: this.addMonths(new Date(), 1),
          },
          update: {
            planId: promo.planId,
            status: 'ACTIVE',
            currentPeriodStart: new Date(),
            currentPeriodEnd: this.addMonths(new Date(), 1),
            cancelledAt: null,
            cancelReason: null,
          },
        });

        // Update redemption with subscription ID
        await tx.promoCodeRedemption.update({
          where: { id: redemption.id },
          data: { subscriptionId: subscription.id },
        });

        return subscription;
      });

      this.logger.log(
        `Promo code ${promo.code} redeemed by tenant ${tenantId} — 100% discount, subscription activated`,
      );

      return {
        success: true,
        message: `¡Código aplicado! Tu plan ${promo.plan.name} está activo con 100% de descuento.`,
        subscription: result,
        requiresPayment: false,
      };
    }

    // Partial discount — record redemption but require payment for remainder
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.promoCode.update({
        where: { id: promo.id },
        data: { usedCount: { increment: 1 } },
      });

      // Change plan (this handles subscription creation/update)
      const subscription = await tx.subscription.upsert({
        where: { tenantId },
        create: {
          tenantId,
          planId: promo.planId,
          status: 'PAST_DUE', // Needs payment for the remainder
          billingPeriod: 'MONTHLY',
          currentPeriodStart: new Date(),
          currentPeriodEnd: this.addMonths(new Date(), 1),
        },
        update: {
          planId: promo.planId,
          status: 'PAST_DUE', // Needs payment for the remainder
          currentPeriodStart: new Date(),
          currentPeriodEnd: this.addMonths(new Date(), 1),
        },
      });

      const redemption = await tx.promoCodeRedemption.create({
        data: {
          promoCodeId: promo.id,
          tenantId,
          subscriptionId: subscription.id,
          discountPercent: promo.discountPercent,
          originalPrice,
          discountedPrice,
        },
      });

      return { subscription, redemption };
    });

    this.logger.log(
      `Promo code ${promo.code} redeemed by tenant ${tenantId} — ${promo.discountPercent}% discount, payment needed for $${discountedPrice}`,
    );

    return {
      success: true,
      message: `¡Código aplicado! Descuento del ${promo.discountPercent}%. Debes abonar $${discountedPrice.toLocaleString('es-AR')} para activar tu plan ${promo.plan.name}.`,
      subscription: result.subscription,
      requiresPayment: true,
      amountDue: discountedPrice,
      planSlug: promo.plan.slug,
    };
  }

  private addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }
}
