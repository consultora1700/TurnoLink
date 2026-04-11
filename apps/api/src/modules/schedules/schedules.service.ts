import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CreateBlockedDateDto } from './dto/create-blocked-date.dto';
import { UpdateEmployeeScheduleDto } from './dto/update-employee-schedule.dto';
import { CreateEmployeeBlockedDateDto } from './dto/create-employee-blocked-date.dto';
import { CacheService } from '../../common/cache';

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
  private readonly logger = new Logger(SchedulesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  /** Invalidate schedule cache for a tenant. Safe if Redis is down. */
  private invalidateSchedulesCache(tenantId: string): void {
    this.cacheService.invalidateSchedules(tenantId).catch((err) => {
      this.logger.warn(`Redis invalidation failed for schedules:${tenantId}: ${err.message}`);
    });
  }

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
    // Check cache first
    try {
      const cached = await this.cacheService.getSchedules(tenantId);
      if (cached) return cached;
    } catch (err) {
      this.logger.warn(`Redis cache read failed for schedules:${tenantId}: ${err.message}`);
    }

    const schedules = await this.prisma.schedule.findMany({
      where: { tenantId },
      orderBy: { dayOfWeek: 'asc' },
    });

    // If no schedules exist, initialize them
    if (schedules.length === 0) {
      return this.initializeSchedules(tenantId);
    }

    // Cache the result (fire-and-forget)
    this.cacheService.setSchedules(tenantId, schedules).catch((err) => {
      this.logger.warn(`Redis cache write failed for schedules:${tenantId}: ${err.message}`);
    });

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
    this.invalidateSchedulesCache(tenantId);
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

  // ===== EMPLOYEE SCHEDULES =====

  async findEmployeeSchedules(employeeId: string) {
    return this.prisma.employeeSchedule.findMany({
      where: { employeeId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async updateEmployeeSchedules(
    employeeId: string,
    dto: UpdateEmployeeScheduleDto,
  ) {
    const updates = dto.schedules.map((schedule) =>
      this.prisma.employeeSchedule.upsert({
        where: {
          employeeId_dayOfWeek: {
            employeeId,
            dayOfWeek: schedule.dayOfWeek,
          },
        },
        update: {
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          isActive: schedule.isActive,
        },
        create: {
          employeeId,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          isActive: schedule.isActive,
        },
      }),
    );

    await this.prisma.$transaction(updates);
    return this.findEmployeeSchedules(employeeId);
  }

  async deleteEmployeeSchedules(employeeId: string) {
    await this.prisma.employeeSchedule.deleteMany({
      where: { employeeId },
    });
  }

  /**
   * Resolve the effective schedule for an employee on a given day.
   * Priority: EmployeeSchedule > BranchSchedule > Schedule (tenant)
   */
  async getEffectiveScheduleForEmployee(
    employeeId: string,
    dayOfWeek: number,
    branchId?: string | null,
    tenantId?: string,
  ): Promise<{ startTime: string; endTime: string; isActive: boolean; source: string } | null> {
    // 1. Check employee-level schedule
    const empSchedule = await this.prisma.employeeSchedule.findUnique({
      where: { employeeId_dayOfWeek: { employeeId, dayOfWeek } },
    });
    if (empSchedule) {
      return {
        startTime: empSchedule.startTime,
        endTime: empSchedule.endTime,
        isActive: empSchedule.isActive,
        source: 'employee',
      };
    }

    // 2. Check branch-level schedule
    if (branchId) {
      const branchSchedule = await this.prisma.branchSchedule.findUnique({
        where: { branchId_dayOfWeek: { branchId, dayOfWeek } },
      });
      if (branchSchedule) {
        return {
          startTime: branchSchedule.startTime,
          endTime: branchSchedule.endTime,
          isActive: branchSchedule.isActive,
          source: 'branch',
        };
      }
    }

    // 3. Fallback to tenant schedule
    if (tenantId) {
      const schedule = await this.findByDay(tenantId, dayOfWeek);
      if (schedule) {
        return {
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          isActive: schedule.isActive,
          source: 'tenant',
        };
      }
    }

    return null;
  }

  /**
   * Get effective schedule for all 7 days for an employee.
   */
  async getFullEffectiveSchedule(
    employeeId: string,
    branchId?: string | null,
    tenantId?: string,
  ) {
    const days = [];
    for (let day = 0; day < 7; day++) {
      const schedule = await this.getEffectiveScheduleForEmployee(
        employeeId,
        day,
        branchId,
        tenantId,
      );
      days.push({
        dayOfWeek: day,
        startTime: schedule?.startTime || '09:00',
        endTime: schedule?.endTime || '18:00',
        isActive: schedule?.isActive ?? false,
        source: schedule?.source || 'default',
      });
    }
    return days;
  }

  // ===== EMPLOYEE BLOCKED DATES =====

  async findEmployeeBlockedDates(
    employeeId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where: Record<string, unknown> = { employeeId };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    return this.prisma.employeeBlockedDate.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }

  async createEmployeeBlockedDate(
    employeeId: string,
    dto: CreateEmployeeBlockedDateDto,
  ) {
    return this.prisma.employeeBlockedDate.create({
      data: {
        employeeId,
        date: new Date(dto.date),
        reason: dto.reason,
      },
    });
  }

  async deleteEmployeeBlockedDate(employeeId: string, id: string) {
    const blocked = await this.prisma.employeeBlockedDate.findFirst({
      where: { id, employeeId },
    });

    if (!blocked) {
      throw new NotFoundException('Employee blocked date not found');
    }

    return this.prisma.employeeBlockedDate.delete({ where: { id } });
  }

  async isEmployeeDateBlocked(
    employeeId: string,
    date: string,
  ): Promise<boolean> {
    const blocked = await this.prisma.employeeBlockedDate.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: new Date(date),
        },
      },
    });

    return !!blocked;
  }
}
