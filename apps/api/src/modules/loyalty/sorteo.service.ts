import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSorteoDto } from './dto/create-sorteo.dto';
import { RegisterSorteoDto } from './dto/register-sorteo.dto';
import { LoyaltyEvent } from '../../common/events/loyalty.events';

@Injectable()
export class SorteoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getSorteos(tenantId: string) {
    return this.prisma.sorteo.findMany({
      where: { tenantId },
      include: { _count: { select: { participants: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSorteo(tenantId: string, id: string) {
    const sorteo = await this.prisma.sorteo.findFirst({
      where: { id, tenantId },
      include: { _count: { select: { participants: true } } },
    });
    if (!sorteo) throw new NotFoundException('Sorteo no encontrado');
    return sorteo;
  }

  async createSorteo(tenantId: string, dto: CreateSorteoDto) {
    return this.prisma.sorteo.create({
      data: {
        tenantId,
        title: dto.title,
        description: dto.description,
        image: dto.image,
        allowPublicRegistration: dto.allowPublicRegistration ?? true,
        prizes: dto.prizes || '[]',
        drawDate: dto.drawDate ? new Date(dto.drawDate) : null,
      },
    });
  }

  async updateSorteo(tenantId: string, id: string, dto: Partial<CreateSorteoDto>) {
    const sorteo = await this.prisma.sorteo.findFirst({ where: { id, tenantId } });
    if (!sorteo) throw new NotFoundException('Sorteo no encontrado');
    const data: any = { ...dto };
    if (dto.drawDate) data.drawDate = new Date(dto.drawDate);
    return this.prisma.sorteo.update({ where: { id }, data });
  }

  async deleteSorteo(tenantId: string, id: string) {
    const sorteo = await this.prisma.sorteo.findFirst({ where: { id, tenantId } });
    if (!sorteo) throw new NotFoundException('Sorteo no encontrado');
    if (sorteo.status !== 'DRAFT') throw new BadRequestException('Solo se pueden eliminar sorteos en borrador');
    await this.prisma.sorteo.delete({ where: { id } });
    return { deleted: true };
  }

  async activateSorteo(tenantId: string, id: string) {
    const sorteo = await this.prisma.sorteo.findFirst({ where: { id, tenantId } });
    if (!sorteo) throw new NotFoundException('Sorteo no encontrado');
    if (sorteo.status !== 'DRAFT') throw new BadRequestException('Solo se pueden activar sorteos en borrador');
    return this.prisma.sorteo.update({ where: { id }, data: { status: 'ACTIVE' } });
  }

  async getParticipants(tenantId: string, sorteoId: string) {
    const sorteo = await this.prisma.sorteo.findFirst({ where: { id: sorteoId, tenantId } });
    if (!sorteo) throw new NotFoundException('Sorteo no encontrado');
    return this.prisma.sorteoParticipant.findMany({
      where: { sorteoId },
      orderBy: { registeredAt: 'desc' },
    });
  }

  async registerParticipant(tenantId: string, sorteoId: string, dto: RegisterSorteoDto) {
    const sorteo = await this.prisma.sorteo.findFirst({ where: { id: sorteoId, tenantId } });
    if (!sorteo) throw new NotFoundException('Sorteo no encontrado');
    if (sorteo.status !== 'ACTIVE') throw new BadRequestException('Este sorteo no está activo');
    if (!sorteo.allowPublicRegistration) throw new BadRequestException('El registro público no está habilitado');

    const customer = await this.prisma.customer.upsert({
      where: { tenantId_phone: { tenantId, phone: dto.phone } },
      create: { tenantId, name: dto.name, phone: dto.phone, email: dto.email },
      update: { name: dto.name, ...(dto.email ? { email: dto.email } : {}) },
    });

    const existing = await this.prisma.sorteoParticipant.findUnique({
      where: { sorteoId_phone: { sorteoId, phone: dto.phone } },
    });
    if (existing) throw new BadRequestException('Ya estás participando en este sorteo');

    const participant = await this.prisma.sorteoParticipant.create({
      data: {
        sorteoId,
        customerId: customer.id,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
      },
    });

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } });
    this.eventEmitter.emit(LoyaltyEvent.SORTEO_REGISTRATION, {
      tenantId,
      participantName: dto.name,
      participantEmail: dto.email,
      sorteoTitle: sorteo.title,
      tenantName: tenant?.name || '',
    });

    return participant;
  }

  /**
   * Draw winner for a specific prize index.
   * If prizeIndex is provided, draws for that specific prize.
   * The sorteo only completes when ALL prizes have been drawn.
   */
  async drawWinner(tenantId: string, sorteoId: string, prizeIndex?: number) {
    const sorteo = await this.prisma.sorteo.findFirst({
      where: { id: sorteoId, tenantId },
      include: { participants: true },
    });
    if (!sorteo) throw new NotFoundException('Sorteo no encontrado');
    if (sorteo.status !== 'ACTIVE') throw new BadRequestException('El sorteo debe estar activo para sortear');
    if (sorteo.participants.length === 0) throw new BadRequestException('No hay participantes');

    let prizes: Array<{ name: string; color?: string; weight?: number }> = [];
    try { prizes = JSON.parse(sorteo.prizes); } catch { prizes = []; }

    // Determine which prize we're drawing for
    const targetPrizeIndex = prizeIndex ?? 0;
    if (targetPrizeIndex < 0 || targetPrizeIndex >= prizes.length) {
      throw new BadRequestException('Índice de premio inválido');
    }

    const targetPrize = prizes[targetPrizeIndex];

    // Check if this prize was already drawn
    const alreadyDrawnForPrize = sorteo.participants.find(
      p => p.isWinner && p.wonPrize === targetPrize.name,
    );
    if (alreadyDrawnForPrize) {
      throw new BadRequestException(`El premio "${targetPrize.name}" ya fue sorteado`);
    }

    // Get eligible participants (not already winners)
    const eligible = sorteo.participants.filter(p => !p.isWinner);
    if (eligible.length === 0) {
      throw new BadRequestException('No quedan participantes disponibles');
    }

    // Random selection
    const randomIndex = Math.floor(Math.random() * eligible.length);
    const winner = eligible[randomIndex];

    // Count how many prizes have been drawn (including this one)
    const drawnCount = sorteo.participants.filter(p => p.isWinner).length + 1;
    const allPrizesDrawn = drawnCount >= prizes.length;

    // Update participant as winner
    await this.prisma.sorteoParticipant.update({
      where: { id: winner.id },
      data: { isWinner: true, wonPrize: targetPrize.name },
    });

    // Update sorteo — complete only if all prizes drawn
    if (allPrizesDrawn) {
      await this.prisma.sorteo.update({
        where: { id: sorteoId },
        data: {
          status: 'COMPLETED',
          drawnAt: new Date(),
          winnerId: winner.id,
          winnerName: winner.name,
          winnerEmail: winner.email,
          winnerPhone: winner.phone,
          winnerPrize: targetPrize.name,
        },
      });
    } else {
      // Update last winner info but keep ACTIVE
      await this.prisma.sorteo.update({
        where: { id: sorteoId },
        data: {
          winnerId: winner.id,
          winnerName: winner.name,
          winnerEmail: winner.email,
          winnerPhone: winner.phone,
          winnerPrize: targetPrize.name,
        },
      });
    }

    // Emit winner event for email
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } });
    this.eventEmitter.emit(LoyaltyEvent.SORTEO_WINNER, {
      tenantId,
      winnerName: winner.name,
      winnerEmail: winner.email,
      sorteoTitle: sorteo.title,
      prizeName: targetPrize.name,
      tenantName: tenant?.name || '',
    });

    return {
      winner: { id: winner.id, name: winner.name, phone: winner.phone, email: winner.email },
      prizeName: targetPrize.name,
      prizeIndex: targetPrizeIndex,
      totalParticipants: sorteo.participants.length,
      allPrizesDrawn,
      drawnCount,
      totalPrizes: prizes.length,
    };
  }

  /** Get draw status — which prizes have been drawn and their winners */
  async getDrawStatus(tenantId: string, sorteoId: string) {
    const sorteo = await this.prisma.sorteo.findFirst({
      where: { id: sorteoId, tenantId },
      include: { participants: { where: { isWinner: true } } },
    });
    if (!sorteo) throw new NotFoundException('Sorteo no encontrado');

    let prizes: Array<{ name: string; color?: string }> = [];
    try { prizes = JSON.parse(sorteo.prizes); } catch { prizes = []; }

    const drawnPrizes = prizes.map((prize, index) => {
      const winner = sorteo.participants.find(p => p.wonPrize === prize.name);
      return {
        index,
        name: prize.name,
        color: prize.color,
        drawn: !!winner,
        winner: winner ? { id: winner.id, name: winner.name, phone: winner.phone, email: winner.email } : null,
      };
    });

    return {
      drawnPrizes,
      allDrawn: drawnPrizes.every(p => p.drawn),
      nextPrizeIndex: drawnPrizes.findIndex(p => !p.drawn),
    };
  }

  async getPublicSorteos(tenantId: string) {
    return this.prisma.sorteo.findMany({
      where: { tenantId, status: 'ACTIVE' },
      select: {
        id: true, title: true, description: true, image: true, prizes: true, drawDate: true,
        _count: { select: { participants: true } },
      },
    });
  }
}
