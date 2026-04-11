import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateLoyaltyProgramDto } from './dto/update-loyalty-program.dto';
import { AdjustPointsDto } from './dto/adjust-points.dto';

@Injectable()
export class LoyaltyService {
  constructor(private readonly prisma: PrismaService) {}

  async getProgram(tenantId: string) {
    return this.prisma.loyaltyProgram.findUnique({ where: { tenantId } });
  }

  async createProgram(tenantId: string) {
    return this.prisma.loyaltyProgram.upsert({
      where: { tenantId },
      create: { tenantId, isActive: true },
      update: {},
    });
  }

  async updateProgram(tenantId: string, dto: UpdateLoyaltyProgramDto) {
    const program = await this.prisma.loyaltyProgram.findUnique({ where: { tenantId } });
    if (!program) {
      return this.prisma.loyaltyProgram.create({
        data: { tenantId, ...dto },
      });
    }
    return this.prisma.loyaltyProgram.update({
      where: { tenantId },
      data: dto,
    });
  }

  async earnPoints(tenantId: string, customerId: string, points: number, description: string, referenceType?: string, referenceId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const balance = await tx.loyaltyBalance.upsert({
        where: { tenantId_customerId: { tenantId, customerId } },
        create: {
          tenantId,
          customerId,
          totalEarned: points,
          currentBalance: points,
        },
        update: {
          totalEarned: { increment: points },
          currentBalance: { increment: points },
        },
      });

      const transaction = await tx.loyaltyTransaction.create({
        data: {
          tenantId,
          customerId,
          type: 'EARN',
          points,
          description,
          referenceType,
          referenceId,
          balanceAfter: balance.currentBalance,
        },
      });

      return { balance, transaction };
    });
  }

  async redeemPoints(tenantId: string, customerId: string, points: number, description: string, referenceType?: string, referenceId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const balance = await tx.loyaltyBalance.findUnique({
        where: { tenantId_customerId: { tenantId, customerId } },
      });
      if (!balance || balance.currentBalance < points) {
        throw new BadRequestException('Saldo insuficiente de puntos');
      }

      const updated = await tx.loyaltyBalance.update({
        where: { tenantId_customerId: { tenantId, customerId } },
        data: {
          totalRedeemed: { increment: points },
          currentBalance: { decrement: points },
        },
      });

      const transaction = await tx.loyaltyTransaction.create({
        data: {
          tenantId,
          customerId,
          type: 'REDEEM',
          points: -points,
          description,
          referenceType,
          referenceId,
          balanceAfter: updated.currentBalance,
        },
      });

      return { balance: updated, transaction };
    });
  }

  async adjustPoints(tenantId: string, dto: AdjustPointsDto) {
    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findFirst({
        where: { id: dto.customerId, tenantId },
      });
      if (!customer) throw new NotFoundException('Cliente no encontrado');

      const balance = await tx.loyaltyBalance.upsert({
        where: { tenantId_customerId: { tenantId, customerId: dto.customerId } },
        create: {
          tenantId,
          customerId: dto.customerId,
          totalEarned: dto.points > 0 ? dto.points : 0,
          totalRedeemed: dto.points < 0 ? Math.abs(dto.points) : 0,
          currentBalance: dto.points,
        },
        update: {
          currentBalance: { increment: dto.points },
          ...(dto.points > 0 ? { totalEarned: { increment: dto.points } } : { totalRedeemed: { increment: Math.abs(dto.points) } }),
        },
      });

      await tx.loyaltyTransaction.create({
        data: {
          tenantId,
          customerId: dto.customerId,
          type: 'ADJUST',
          points: dto.points,
          description: dto.description,
          referenceType: 'MANUAL',
          balanceAfter: balance.currentBalance,
        },
      });

      return balance;
    });
  }

  async getBalance(tenantId: string, customerId: string) {
    return this.prisma.loyaltyBalance.findUnique({
      where: { tenantId_customerId: { tenantId, customerId } },
    });
  }

  async getBalances(tenantId: string, page = 1, limit = 20, search?: string) {
    const where: any = { tenantId };
    if (search) {
      where.customer = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }
    const [data, total] = await Promise.all([
      this.prisma.loyaltyBalance.findMany({
        where,
        include: { customer: { select: { id: true, name: true, phone: true, email: true } } },
        orderBy: { currentBalance: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.loyaltyBalance.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getTransactions(tenantId: string, page = 1, limit = 20, customerId?: string, type?: string) {
    const where: any = { tenantId };
    if (customerId) where.customerId = customerId;
    if (type) where.type = type;
    const [data, total] = await Promise.all([
      this.prisma.loyaltyTransaction.findMany({
        where,
        include: { customer: { select: { id: true, name: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.loyaltyTransaction.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getMetrics(tenantId: string) {
    const [totalCirculating, activeCustomers, thisMonthEarned, lastMonthEarned, program, topCustomers] = await Promise.all([
      this.prisma.loyaltyBalance.aggregate({
        where: { tenantId },
        _sum: { currentBalance: true },
      }),
      this.prisma.loyaltyBalance.count({
        where: { tenantId, currentBalance: { gt: 0 } },
      }),
      this.prisma.loyaltyTransaction.aggregate({
        where: {
          tenantId,
          type: 'EARN',
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
        _sum: { points: true },
      }),
      this.prisma.loyaltyTransaction.aggregate({
        where: {
          tenantId,
          type: 'EARN',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { points: true },
      }),
      this.prisma.loyaltyProgram.findUnique({ where: { tenantId } }),
      this.prisma.loyaltyBalance.findMany({
        where: { tenantId, currentBalance: { gt: 0 } },
        include: { customer: { select: { id: true, name: true, phone: true, email: true } } },
        orderBy: { currentBalance: 'desc' },
        take: 10,
      }),
    ]);

    const circulatingPoints = totalCirculating._sum.currentBalance || 0;
    const currencyPerPoint = program ? Number(program.currencyPerPoint) : 1;

    return {
      circulatingPoints,
      monetaryValue: circulatingPoints * currencyPerPoint,
      activeCustomers,
      thisMonthPoints: thisMonthEarned._sum.points || 0,
      lastMonthPoints: lastMonthEarned._sum.points || 0,
      topCustomers,
    };
  }
}
