import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { LoyaltyService } from './loyalty.service';
import * as crypto from 'crypto';

@Injectable()
export class LoyaltyRewardsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loyaltyService: LoyaltyService,
  ) {}

  async getRewards(tenantId: string) {
    const program = await this.prisma.loyaltyProgram.findUnique({ where: { tenantId } });
    if (!program) return [];
    return this.prisma.loyaltyReward.findMany({
      where: { programId: program.id },
      orderBy: { pointsCost: 'asc' },
    });
  }

  async createReward(tenantId: string, dto: CreateRewardDto) {
    const program = await this.prisma.loyaltyProgram.findUnique({ where: { tenantId } });
    if (!program) throw new NotFoundException('Programa de fidelización no encontrado');
    return this.prisma.loyaltyReward.create({
      data: { tenantId, programId: program.id, ...dto },
    });
  }

  async updateReward(tenantId: string, id: string, dto: Partial<CreateRewardDto>) {
    const reward = await this.prisma.loyaltyReward.findFirst({ where: { id, tenantId } });
    if (!reward) throw new NotFoundException('Recompensa no encontrada');
    return this.prisma.loyaltyReward.update({ where: { id }, data: dto });
  }

  async deleteReward(tenantId: string, id: string) {
    const reward = await this.prisma.loyaltyReward.findFirst({ where: { id, tenantId } });
    if (!reward) throw new NotFoundException('Recompensa no encontrada');
    await this.prisma.loyaltyReward.delete({ where: { id } });
    return { deleted: true };
  }

  async redeemReward(tenantId: string, rewardId: string, phone: string, email: string) {
    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { tenantId_phone: { tenantId, phone } },
      });
      if (!customer) throw new NotFoundException('Cliente no encontrado');
      if (customer.email && customer.email.toLowerCase() !== email.toLowerCase()) {
        throw new BadRequestException('Email no coincide con el registrado');
      }

      const reward = await tx.loyaltyReward.findFirst({
        where: { id: rewardId, tenantId, isActive: true },
      });
      if (!reward) throw new NotFoundException('Recompensa no encontrada');
      if (reward.maxRedemptions && reward.redemptionCount >= reward.maxRedemptions) {
        throw new BadRequestException('Esta recompensa ya no está disponible');
      }

      const balance = await tx.loyaltyBalance.findUnique({
        where: { tenantId_customerId: { tenantId, customerId: customer.id } },
      });
      if (!balance || balance.currentBalance < reward.pointsCost) {
        throw new BadRequestException('Puntos insuficientes');
      }

      if (reward.minTierSlug && balance.currentTierSlug !== reward.minTierSlug) {
        // Check if customer tier is high enough
        const program = await tx.loyaltyProgram.findUnique({ where: { tenantId } });
        if (program) {
          const requiredTier = await tx.loyaltyTier.findFirst({
            where: { programId: program.id, slug: reward.minTierSlug },
          });
          const currentTier = balance.currentTierSlug
            ? await tx.loyaltyTier.findFirst({ where: { programId: program.id, slug: balance.currentTierSlug } })
            : null;
          if (requiredTier && (!currentTier || currentTier.minPoints < requiredTier.minPoints)) {
            throw new BadRequestException(`Necesitás nivel ${requiredTier.name} para canjear esta recompensa`);
          }
        }
      }

      // Generate coupon code
      const couponCode = `PREMIO-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      // Deduct points
      await tx.loyaltyBalance.update({
        where: { tenantId_customerId: { tenantId, customerId: customer.id } },
        data: {
          totalRedeemed: { increment: reward.pointsCost },
          currentBalance: { decrement: reward.pointsCost },
        },
      });

      const newBalance = balance.currentBalance - reward.pointsCost;

      await tx.loyaltyTransaction.create({
        data: {
          tenantId,
          customerId: customer.id,
          type: 'REDEEM',
          points: -reward.pointsCost,
          description: `Canje: ${reward.name}`,
          referenceType: 'REWARD',
          referenceId: reward.id,
          balanceAfter: newBalance,
        },
      });

      // Increment redemption count
      await tx.loyaltyReward.update({
        where: { id: reward.id },
        data: { redemptionCount: { increment: 1 } },
      });

      // Create redemption record
      const redemption = await tx.rewardRedemption.create({
        data: {
          tenantId,
          customerId: customer.id,
          rewardId: reward.id,
          pointsSpent: reward.pointsCost,
          couponCode,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      return { redemption, couponCode, reward };
    });
  }

  async getRedemptions(tenantId: string, page = 1, limit = 20) {
    const where = { tenantId };
    const [data, total] = await Promise.all([
      this.prisma.rewardRedemption.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          reward: { select: { id: true, name: true, pointsCost: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.rewardRedemption.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getPublicRewards(tenantId: string) {
    const program = await this.prisma.loyaltyProgram.findUnique({ where: { tenantId } });
    if (!program || !program.isActive) return [];
    return this.prisma.loyaltyReward.findMany({
      where: { programId: program.id, isActive: true },
      select: { id: true, name: true, description: true, pointsCost: true, rewardType: true, minTierSlug: true },
      orderBy: { pointsCost: 'asc' },
    });
  }
}
