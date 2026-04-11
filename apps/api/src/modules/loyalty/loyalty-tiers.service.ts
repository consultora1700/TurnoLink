import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTierDto } from './dto/create-tier.dto';

@Injectable()
export class LoyaltyTiersService {
  constructor(private readonly prisma: PrismaService) {}

  private generateSlug(name: string): string {
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  async getTiers(tenantId: string) {
    const program = await this.prisma.loyaltyProgram.findUnique({ where: { tenantId } });
    if (!program) return [];
    return this.prisma.loyaltyTier.findMany({
      where: { programId: program.id },
      orderBy: { minPoints: 'asc' },
    });
  }

  async createTier(tenantId: string, dto: CreateTierDto) {
    const program = await this.prisma.loyaltyProgram.findUnique({ where: { tenantId } });
    if (!program) throw new NotFoundException('Programa de fidelización no encontrado');
    const slug = this.generateSlug(dto.name);
    return this.prisma.loyaltyTier.create({
      data: {
        tenantId,
        programId: program.id,
        name: dto.name,
        slug,
        minPoints: dto.minPoints,
        color: dto.color || '#CD7F32',
        icon: dto.icon,
        benefitDescription: dto.benefitDescription,
        pointsMultiplier: dto.pointsMultiplier || 1.0,
        displayOrder: dto.displayOrder || 0,
      },
    });
  }

  async updateTier(tenantId: string, id: string, dto: Partial<CreateTierDto>) {
    const tier = await this.prisma.loyaltyTier.findFirst({ where: { id, tenantId } });
    if (!tier) throw new NotFoundException('Nivel no encontrado');
    const data: any = { ...dto };
    if (dto.name) data.slug = this.generateSlug(dto.name);
    return this.prisma.loyaltyTier.update({ where: { id }, data });
  }

  async deleteTier(tenantId: string, id: string) {
    const tier = await this.prisma.loyaltyTier.findFirst({ where: { id, tenantId } });
    if (!tier) throw new NotFoundException('Nivel no encontrado');
    await this.prisma.loyaltyTier.delete({ where: { id } });
    return { deleted: true };
  }

  async getCurrentTier(tenantId: string, points: number) {
    const program = await this.prisma.loyaltyProgram.findUnique({ where: { tenantId } });
    if (!program) return null;
    return this.prisma.loyaltyTier.findFirst({
      where: { programId: program.id, minPoints: { lte: points } },
      orderBy: { minPoints: 'desc' },
    });
  }
}
