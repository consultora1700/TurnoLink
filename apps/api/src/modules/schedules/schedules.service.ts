import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CreateBlockedDateDto } from './dto/create-blocked-date.dto';

const DEFAULT_SCHEDULES = [
  { dayOfWeek: 0, startTime: '09:00', endTime: '18:00', isActive: true },
  { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isActive: true },
  { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isActive: true },
  { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isActive: true },
  { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isActive: true },
  { dayOfWeek: 5, startTime: '09:00', endTime: '14:00', isActive: true },
  { dayOfWeek: 6, startTime: '09:00', endTime: '14:00', isActive: false },
];

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async initializeSchedules(tenantId: string): Promise<unknown[]> {
    const existing = await this.prisma.schedule.findMany({
      where: { tenantId },
    });

    if (existing.length > 0) {
      return existing;
    }

    await this.prisma.schedule.createMany({
      data: DEFAULT_SCHEDULES.map((schedule) => ({
        ...schedule,
        tenantId,
      })),
    });

    return this.findAll(tenantId);
  }

  async findAll(tenantId: string): Promise<unknown[]> {
    const schedules = await this.prisma.schedule.findMany({
      where: { tenantId },
      orderBy: { dayOfWeek: 'asc' },
    });

    // If no schedules exist, initialize them
    if (schedules.length === 0) {
      return this.initializeSchedules(tenantId);
    }

    return schedules;
  }

  async findByDay(tenantId: string, dayOfWeek: number) {
    return this.prisma.schedule.findUnique({
      where: {
        tenantId_dayOfWeek: {
          tenantId,
          dayOfWeek,
        },
      },
    });
  }

  async update(tenantId: string, updateScheduleDto: UpdateScheduleDto) {
    const updates = updateScheduleDto.schedules.map((schedule) =>
      this.prisma.schedule.upsert({
        where: {
          tenantId_dayOfWeek: {
            tenantId,
            dayOfWeek: schedule.dayOfWeek,
          },
        },
        update: {
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          isActive: schedule.isActive,
        },
        create: {
          tenantId,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          isActive: schedule.isActive,
        },
      }),
    );

    await this.prisma.$transaction(updates);
    return this.findAll(tenantId);
  }

  // Blocked dates
  async findBlockedDates(tenantId: string, startDate?: string, endDate?: string) {
    const where: Record<string, unknown> = { tenantId };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    return this.prisma.blockedDate.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }

  async createBlockedDate(
    tenantId: string,
    createBlockedDateDto: CreateBlockedDateDto,
  ) {
    return this.prisma.blockedDate.create({
      data: {
        tenantId,
        date: new Date(createBlockedDateDto.date),
        reason: createBlockedDateDto.reason,
      },
    });
  }

  async deleteBlockedDate(tenantId: string, id: string) {
    const blockedDate = await this.prisma.blockedDate.findFirst({
      where: { id, tenantId },
    });

    if (!blockedDate) {
      throw new NotFoundException('Blocked date not found');
    }

    return this.prisma.blockedDate.delete({ where: { id } });
  }

  async isDateBlocked(tenantId: string, date: string): Promise<boolean> {
    const blockedDate = await this.prisma.blockedDate.findUnique({
      where: {
        tenantId_date: {
          tenantId,
          date: new Date(date),
        },
      },
    });

    return !!blockedDate;
  }
}
