import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { SchedulesService } from '../schedules/schedules.service';
import { AppLoggerService } from '../../common/logger';
import { TimeUtilsService, TimeRange } from '../../common/utils';
import {
  BookingEvent,
  BookingCreatedPayload,
  BookingCancelledPayload,
} from '../../common/events';

// Booking status constants
const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
} as const;
import { CustomersService } from '../customers/customers.service';
import { ServicesService } from '../services/services.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateDailyBookingDto } from './dto/create-daily-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly schedulesService: SchedulesService,
    private readonly customersService: CustomersService,
    private readonly servicesService: ServicesService,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: AppLoggerService,
    private readonly timeUtils: TimeUtilsService,
  ) {
    this.logger.setContext('BookingsService');
  }

  async create(tenantId: string, createBookingDto: CreateBookingDto, depositAmount?: number, skipAdvanceCheck = false) {
    // Temporal validation: reject past dates/times (skip advance check for dashboard bookings)
    await this.validateBookingTime(tenantId, createBookingDto.date, createBookingDto.startTime, skipAdvanceCheck);

    // Validate service exists
    const service = await this.servicesService.findById(
      tenantId,
      createBookingDto.serviceId,
    );

    // Check if slot is available (skip schedule bounds check for dashboard bookings)
    const isAvailable = await this.isSlotAvailable(
      tenantId,
      createBookingDto.date,
      createBookingDto.startTime,
      service.duration,
      skipAdvanceCheck,
    );

    if (!isAvailable) {
      throw new ConflictException('This time slot is not available');
    }

    // Calculate end time
    const endTime = this.timeUtils.calculateEndTime(
      createBookingDto.startTime,
      service.duration,
    );

    // Find or create customer
    let customer = await this.customersService.findByPhone(
      tenantId,
      createBookingDto.customerPhone,
    );

    if (!customer) {
      customer = await this.customersService.create(tenantId, {
        name: createBookingDto.customerName,
        phone: createBookingDto.customerPhone,
        email: createBookingDto.customerEmail,
      });
    }

    // Create booking
    const booking = await this.prisma.booking.create({
      data: {
        tenantId,
        branchId: createBookingDto.branchId || null,
        serviceId: createBookingDto.serviceId,
        customerId: customer.id,
        employeeId: createBookingDto.employeeId || null,
        date: new Date(createBookingDto.date + 'T12:00:00Z'),
        startTime: createBookingDto.startTime,
        endTime,
        notes: createBookingDto.notes,
        status: skipAdvanceCheck ? BookingStatus.CONFIRMED : BookingStatus.PENDING,
        depositAmount: depositAmount || null,
        depositPaid: false,
      },
      include: {
        service: true,
        customer: true,
        employee: true,
        branch: true,
      },
    });

    // Update customer stats
    await this.customersService.incrementBookings(customer.id);

    // Emit booking created event (notifications handled by listener)
    const eventPayload: BookingCreatedPayload = {
      booking,
      tenantId,
      depositRequired: !!depositAmount,
    };
    this.eventEmitter.emit(BookingEvent.CREATED, eventPayload);

    this.logger.log('Booking created', {
      tenantId,
      bookingId: booking.id,
      serviceId: createBookingDto.serviceId,
      customerId: customer.id,
      action: 'booking.create',
    });

    return booking;
  }

  async findAll(
    tenantId: string,
    options: {
      date?: string;
      startDate?: string;
      endDate?: string;
      status?: string;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const { date, startDate, endDate, status, page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId };

    if (date) {
      // For a single date, also include daily bookings whose stay covers this date
      const dateStart = new Date(date + 'T00:00:00Z');
      const dateEnd = new Date(date + 'T23:59:59.999Z');
      where.OR = [
        // Hourly bookings on this date
        { date: { gte: dateStart, lte: dateEnd }, checkOutDate: null },
        // Daily bookings: check-in date is this date
        { date: { gte: dateStart, lte: dateEnd }, checkOutDate: { not: null } },
        // Daily bookings: this date falls within stay (date < queryDate < checkOutDate)
        { date: { lt: dateEnd }, checkOutDate: { gt: dateStart } },
      ];
    } else if (startDate && endDate) {
      const rangeStart = new Date(startDate + 'T00:00:00Z');
      const rangeEnd = new Date(endDate + 'T23:59:59.999Z');
      where.OR = [
        // Hourly bookings in range
        { date: { gte: rangeStart, lte: rangeEnd }, checkOutDate: null },
        // Daily bookings: check-in in range
        { date: { gte: rangeStart, lte: rangeEnd }, checkOutDate: { not: null } },
        // Daily bookings: stay overlaps with range
        { date: { lt: rangeEnd }, checkOutDate: { gt: rangeStart } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where: where as any,
        include: {
          service: true,
          customer: true,
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where: where as any }),
    ]);

    return {
      data: bookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(tenantId: string, id: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, tenantId },
      include: {
        service: true,
        customer: true,
        employee: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async update(tenantId: string, id: string, updateBookingDto: UpdateBookingDto) {
    await this.findById(tenantId, id);

    return this.prisma.booking.update({
      where: { id },
      data: updateBookingDto,
      include: {
        service: true,
        customer: true,
        employee: true,
      },
    });
  }

  async updateStatus(tenantId: string, id: string, status: string) {
    const booking = await this.findById(tenantId, id);

    // Validate status transitions
    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Cannot change status of completed booking');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Cannot change status of cancelled booking');
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        service: true,
        customer: true,
        employee: true,
      },
    });
  }

  async cancel(tenantId: string, id: string) {
    const booking = await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      include: {
        service: true,
        customer: true,
        employee: true,
      },
    });

    // Emit booking cancelled event (notifications handled by listener)
    const eventPayload: BookingCancelledPayload = {
      booking,
      tenantId,
      cancelledBy: 'business',
    };
    this.eventEmitter.emit(BookingEvent.CANCELLED, eventPayload);

    this.logger.log('Booking cancelled', {
      tenantId,
      bookingId: id,
      action: 'booking.cancel',
    });

    return booking;
  }

  async getAvailability(
    tenantId: string,
    date: string,
    serviceId?: string,
    branchId?: string,
  ): Promise<{ time: string; available: boolean }[]> {
    // Get schedule for this day (use noon UTC for correct day-of-week calculation)
    const dayDate = new Date(date + 'T12:00:00Z');
    const dayOfWeek = dayDate.getUTCDay() === 0 ? 6 : dayDate.getUTCDay() - 1;

    // Full-day range for date queries (handles both midnight and noon stored dates)
    const dayRange = {
      gte: new Date(date + 'T00:00:00Z'),
      lte: new Date(date + 'T23:59:59.999Z'),
    };

    let schedule: { startTime: string; endTime: string; isActive: boolean } | null = null;

    // If branchId provided, use branch schedule
    if (branchId) {
      const branchSchedule = await this.prisma.branchSchedule.findUnique({
        where: { branchId_dayOfWeek: { branchId, dayOfWeek } },
      });
      if (branchSchedule) {
        schedule = branchSchedule;
      }
    }

    // Fallback to tenant schedule if no branch schedule
    if (!schedule) {
      schedule = await this.schedulesService.findByDay(tenantId, dayOfWeek);
    }

    if (!schedule || !schedule.isActive) {
      return [];
    }

    // Check if date is blocked (branch or tenant level)
    if (branchId) {
      const branchBlocked = await this.prisma.branchBlockedDate.findFirst({
        where: { branchId, date: { gte: dayRange.gte, lte: dayRange.lte } },
      });
      if (branchBlocked) {
        return [];
      }
    }
    const isBlocked = await this.schedulesService.isDateBlocked(tenantId, date);
    if (isBlocked) {
      return [];
    }

    // Get service duration (default 30 min)
    let duration = 30;
    if (serviceId) {
      try {
        const service = await this.servicesService.findById(tenantId, serviceId);
        duration = service.duration;
      } catch {
        // Use default duration
      }
    }

    // Get existing bookings for this date (filter by branch if provided)
    const bookingWhere: any = {
      tenantId,
      date: { gte: dayRange.gte, lte: dayRange.lte },
      status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
    };
    if (branchId) {
      bookingWhere.branchId = branchId;
    }

    const existingBookings = await this.prisma.booking.findMany({
      where: bookingWhere,
      select: { startTime: true, endTime: true },
    });

    // Get booking constraints (buffer, advance hours, etc.)
    const constraints = await this.getBookingConstraints(tenantId);

    // Detect full-day schedule (23+ hours, e.g. 00:00-23:59)
    const startMinutes = this.timeUtils.toMinutes(schedule.startTime);
    const endMinutes = this.timeUtils.toMinutes(schedule.endTime);
    const isFullDay = (endMinutes - startMinutes) >= 23 * 60;

    // For full-day schedules, fetch next-day early morning bookings
    // to detect cross-midnight conflicts (e.g. booking at 22:00 today
    // ending at 01:00 should not overlap with a 00:30 booking tomorrow)
    let nextDayBookings: { startTime: string; endTime: string }[] = [];
    if (isFullDay && duration > 30) {
      const nextDate = new Date(dayDate);
      nextDate.setUTCDate(nextDate.getUTCDate() + 1);
      const nextDateStr = nextDate.toISOString().split('T')[0];
      const nextDayWhere: any = {
        tenantId,
        date: {
          gte: new Date(nextDateStr + 'T00:00:00Z'),
          lte: new Date(nextDateStr + 'T23:59:59.999Z'),
        },
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      };
      if (branchId) nextDayWhere.branchId = branchId;
      nextDayBookings = await this.prisma.booking.findMany({
        where: nextDayWhere,
        select: { startTime: true, endTime: true },
      });
    }

    // Generate time slots (with buffer between bookings)
    const slots = this.generateTimeSlots(
      schedule.startTime,
      schedule.endTime,
      duration,
      existingBookings,
      constraints.bookingBuffer,
      isFullDay,
      nextDayBookings,
    );

    // Filter past slots for today
    const nowUtc = new Date();
    const argentinaOffset = -3 * 60; // UTC-3
    const nowArgMs = nowUtc.getTime() + (nowUtc.getTimezoneOffset() + argentinaOffset) * 60000;
    const nowArg = new Date(nowArgMs);
    const todayStr = `${nowArg.getFullYear()}-${String(nowArg.getMonth() + 1).padStart(2, '0')}-${String(nowArg.getDate()).padStart(2, '0')}`;

    if (date === todayStr) {
      const nowTotalMinutes = nowArg.getHours() * 60 + nowArg.getMinutes();
      const minAllowedMinutes = nowTotalMinutes + constraints.minAdvanceBookingHours * 60;

      for (const slot of slots) {
        const slotMinutes = this.timeUtils.toMinutes(slot.time);
        if (slotMinutes < minAllowedMinutes) {
          slot.available = false;
        }
      }
    }

    return slots;
  }

  /**
   * Gets tenant settings with defaults for booking constraints
   */
  private async getBookingConstraints(tenantId: string): Promise<{
    minAdvanceBookingHours: number;
    maxAdvanceBookingDays: number;
    bookingBuffer: number;
  }> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });

    let settings: Record<string, unknown> = {};
    if (tenant?.settings) {
      settings = typeof tenant.settings === 'string'
        ? JSON.parse(tenant.settings)
        : (tenant.settings as Record<string, unknown>);
    }

    return {
      minAdvanceBookingHours: settings.minAdvanceBookingHours != null ? Number(settings.minAdvanceBookingHours) : 1,
      maxAdvanceBookingDays: settings.maxAdvanceBookingDays != null ? Number(settings.maxAdvanceBookingDays) : 30,
      bookingBuffer: settings.bookingBuffer != null ? Number(settings.bookingBuffer) : 0,
    };
  }

  /**
   * Validates that a booking date/time is not in the past and respects advance booking limits.
   * Uses America/Argentina/Buenos_Aires timezone.
   */
  private async validateBookingTime(
    tenantId: string,
    dateStr: string,
    startTime: string,
    skipAdvanceCheck = false,
  ): Promise<void> {
    const constraints = await this.getBookingConstraints(tenantId);

    // Current time in Argentina timezone
    const nowUtc = new Date();
    const argentinaOffset = -3 * 60; // UTC-3
    const nowArgMs = nowUtc.getTime() + (nowUtc.getTimezoneOffset() + argentinaOffset) * 60000;
    const nowArg = new Date(nowArgMs);

    const todayStr = `${nowArg.getFullYear()}-${String(nowArg.getMonth() + 1).padStart(2, '0')}-${String(nowArg.getDate()).padStart(2, '0')}`;
    const nowHours = nowArg.getHours();
    const nowMinutes = nowArg.getMinutes();
    const nowTotalMinutes = nowHours * 60 + nowMinutes;

    const bookingDate = new Date(dateStr + 'T12:00:00'); // noon to avoid TZ issues
    const todayDate = new Date(todayStr + 'T12:00:00');

    // Reject past dates
    if (bookingDate < todayDate) {
      throw new BadRequestException('No se pueden reservar turnos en fechas pasadas');
    }

    // Reject dates beyond maxAdvanceBookingDays
    const maxDate = new Date(todayDate);
    maxDate.setDate(maxDate.getDate() + constraints.maxAdvanceBookingDays);
    if (bookingDate > maxDate) {
      throw new BadRequestException(
        `No se pueden reservar turnos con más de ${constraints.maxAdvanceBookingDays} días de anticipación`,
      );
    }

    // For today: reject past times and enforce minAdvanceBookingHours
    // Skip these checks for dashboard bookings (skipAdvanceCheck = true)
    if (dateStr === todayStr && !skipAdvanceCheck) {
      const slotMinutes = this.timeUtils.toMinutes(startTime);
      const minAllowedMinutes = nowTotalMinutes + constraints.minAdvanceBookingHours * 60;

      if (slotMinutes < nowTotalMinutes) {
        throw new BadRequestException('No se pueden reservar turnos en horarios que ya pasaron');
      }

      if (slotMinutes < minAllowedMinutes) {
        throw new BadRequestException(
          `Se requiere al menos ${constraints.minAdvanceBookingHours} hora(s) de anticipación para reservar`,
        );
      }
    }
  }

  private async isSlotAvailable(
    tenantId: string,
    date: string,
    startTime: string,
    duration: number,
    skipScheduleCheck = false,
  ): Promise<boolean> {
    const dayDate = new Date(date + 'T12:00:00Z');
    const endTime = this.timeUtils.calculateEndTime(startTime, duration);

    // Skip schedule and blocked date checks for dashboard bookings
    if (!skipScheduleCheck) {
      // Check if within schedule
      const dayOfWeek = dayDate.getUTCDay() === 0 ? 6 : dayDate.getUTCDay() - 1;
      const schedule = await this.schedulesService.findByDay(tenantId, dayOfWeek);

      if (!schedule || !schedule.isActive) {
        return false;
      }

      // Check if start time is within schedule bounds
      const schedStartMin = this.timeUtils.toMinutes(schedule.startTime);
      const schedEndMin = this.timeUtils.toMinutes(schedule.endTime);
      const isFullDay = (schedEndMin - schedStartMin) >= 23 * 60;
      const startMin = this.timeUtils.toMinutes(startTime);
      const endMin = this.timeUtils.toMinutes(endTime);

      // For full-day schedules, allow cross-midnight services (endTime wraps past 00:00)
      // For normal schedules, require the full service to fit within schedule bounds
      if (isFullDay) {
        if (startMin < schedStartMin || startMin > schedEndMin) {
          return false;
        }
      } else if (
        this.timeUtils.isBefore(startTime, schedule.startTime) ||
        this.timeUtils.isAfter(endTime, schedule.endTime)
      ) {
        return false;
      }

      // Check if date is blocked
      const isBlocked = await this.schedulesService.isDateBlocked(tenantId, date);
      if (isBlocked) {
        return false;
      }
    }

    // Check for overlapping bookings
    const overlapping = await this.prisma.booking.findFirst({
      where: {
        tenantId,
        date: {
          gte: new Date(date + 'T00:00:00Z'),
          lte: new Date(date + 'T23:59:59.999Z'),
        },
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });

    return !overlapping;
  }

  private generateTimeSlots(
    startTime: string,
    endTime: string,
    duration: number,
    existingBookings: { startTime: string; endTime: string }[],
    bookingBuffer = 0,
    isFullDay = false,
    nextDayBookings: { startTime: string; endTime: string }[] = [],
  ): { time: string; available: boolean }[] {
    const slots: { time: string; available: boolean }[] = [];
    let currentMinutes = this.timeUtils.toMinutes(startTime);
    const endMinutes = this.timeUtils.toMinutes(endTime);

    // Always use 30-min intervals for maximum granularity.
    const slotInterval = 30;

    // For full-day schedules (e.g. 00:00-23:59), generate ALL start times
    // even if the service extends past midnight (hotel check-in at 22:00
    // ending at 01:00 next day is valid when the business is 24h).
    // For normal schedules, require the full service to fit within the day.
    while (isFullDay
      ? currentMinutes <= endMinutes
      : currentMinutes + duration <= endMinutes
    ) {
      const time = this.timeUtils.fromMinutes(currentMinutes);
      const slotEndMinutes = currentMinutes + duration;
      const crossesMidnight = slotEndMinutes > 24 * 60;

      // Check if this slot overlaps with any existing booking (including buffer)
      const isOccupied = existingBookings.some((booking) => {
        const bufferedEnd = bookingBuffer > 0
          ? this.timeUtils.calculateEndTime(booking.endTime, bookingBuffer)
          : booking.endTime;

        let bStart = this.timeUtils.toMinutes(booking.startTime);
        let bEnd = this.timeUtils.toMinutes(bufferedEnd);

        // Normalize cross-midnight bookings (endTime wraps past 00:00)
        if (bEnd <= bStart) bEnd += 24 * 60;

        return currentMinutes < bEnd && bStart < slotEndMinutes;
      });

      // For cross-midnight slots, also check next-day bookings
      let nextDayConflict = false;
      if (crossesMidnight && nextDayBookings.length > 0) {
        const overflowEnd = slotEndMinutes - 24 * 60; // minutes into next day
        nextDayConflict = nextDayBookings.some((booking) => {
          const bufferedEnd = bookingBuffer > 0
            ? this.timeUtils.calculateEndTime(booking.endTime, bookingBuffer)
            : booking.endTime;
          const bStart = this.timeUtils.toMinutes(booking.startTime);
          const bEnd = this.timeUtils.toMinutes(bufferedEnd);
          // Check if next-day booking overlaps with the overflow portion (00:00 to overflowEnd)
          return bStart < overflowEnd && bEnd > 0;
        });
      }

      slots.push({ time, available: !isOccupied && !nextDayConflict });
      currentMinutes += slotInterval;
    }

    return slots;
  }

  // ===== DAILY BOOKING METHODS =====

  /**
   * Gets tenant settings for daily bookings
   */
  private async getDailySettings(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });

    let settings: Record<string, unknown> = {};
    if (tenant?.settings) {
      settings = typeof tenant.settings === 'string'
        ? JSON.parse(tenant.settings)
        : (tenant.settings as Record<string, unknown>);
    }

    return {
      bookingMode: (settings.bookingMode as string) || 'HOURLY',
      dailyCheckInTime: (settings.dailyCheckInTime as string) || '14:00',
      dailyCheckOutTime: (settings.dailyCheckOutTime as string) || '10:00',
      dailyMinNights: settings.dailyMinNights != null ? Number(settings.dailyMinNights) : 1,
      dailyMaxNights: settings.dailyMaxNights != null ? Number(settings.dailyMaxNights) : 30,
      dailyClosedDays: Array.isArray(settings.dailyClosedDays) ? (settings.dailyClosedDays as number[]) : [],
      maxAdvanceBookingDays: settings.maxAdvanceBookingDays != null ? Number(settings.maxAdvanceBookingDays) : 30,
    };
  }

  /**
   * Get daily availability for a date range.
   * Returns an array of { date, available } for each date in the range.
   */
  async getDailyAvailability(
    tenantId: string,
    startDate: string,
    endDate: string,
    branchId?: string,
  ): Promise<{ date: string; available: boolean }[]> {
    const settings = await this.getDailySettings(tenantId);

    const start = new Date(startDate + 'T12:00:00Z');
    const end = new Date(endDate + 'T12:00:00Z');

    // Current date in Argentina timezone
    const nowUtc = new Date();
    const argentinaOffset = -3 * 60;
    const nowArgMs = nowUtc.getTime() + (nowUtc.getTimezoneOffset() + argentinaOffset) * 60000;
    const nowArg = new Date(nowArgMs);
    const todayStr = `${nowArg.getFullYear()}-${String(nowArg.getMonth() + 1).padStart(2, '0')}-${String(nowArg.getDate()).padStart(2, '0')}`;
    const todayDate = new Date(todayStr + 'T12:00:00Z');

    // Max advance date
    const maxDate = new Date(todayDate);
    maxDate.setUTCDate(maxDate.getUTCDate() + settings.maxAdvanceBookingDays);

    // Get existing daily bookings that overlap with the range
    const bookingWhere: Record<string, unknown> = {
      tenantId,
      checkOutDate: { not: null },
      status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      // Overlap condition: booking.date < endDate AND booking.checkOutDate > startDate
      date: { lte: new Date(endDate + 'T23:59:59.999Z') },
    };
    if (branchId) {
      bookingWhere.branchId = branchId;
    }

    const existingBookings = await this.prisma.booking.findMany({
      where: bookingWhere as any,
      select: { date: true, checkOutDate: true },
    });

    // Filter to only overlapping bookings
    const startMs = start.getTime();
    const endMs = end.getTime();
    const occupiedBookings = existingBookings.filter(b => {
      if (!b.checkOutDate) return false;
      const bStart = b.date.getTime();
      const bEnd = b.checkOutDate.getTime();
      return bStart < endMs + 24 * 3600000 && bEnd > startMs;
    });

    // Get blocked dates in range
    const blockedDatesWhere: Record<string, unknown> = {
      tenantId,
      date: {
        gte: new Date(startDate + 'T00:00:00Z'),
        lte: new Date(endDate + 'T23:59:59.999Z'),
      },
    };
    const blockedDates = await this.prisma.blockedDate.findMany({
      where: blockedDatesWhere as any,
      select: { date: true },
    });
    const blockedSet = new Set(
      blockedDates.map(bd => bd.date.toISOString().split('T')[0])
    );

    // Branch blocked dates
    let branchBlockedSet = new Set<string>();
    if (branchId) {
      const branchBlocked = await this.prisma.branchBlockedDate.findMany({
        where: {
          branchId,
          date: {
            gte: new Date(startDate + 'T00:00:00Z'),
            lte: new Date(endDate + 'T23:59:59.999Z'),
          },
        },
        select: { date: true },
      });
      branchBlockedSet = new Set(
        branchBlocked.map(bd => bd.date.toISOString().split('T')[0])
      );
    }

    // Generate result for each date
    const result: { date: string; available: boolean }[] = [];
    const current = new Date(start);

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      const dayOfWeek = current.getUTCDay(); // 0=Sunday

      let available = true;

      // Past dates
      if (current < todayDate) {
        available = false;
      }
      // Beyond max advance
      else if (current > maxDate) {
        available = false;
      }
      // Blocked dates
      else if (blockedSet.has(dateStr) || branchBlockedSet.has(dateStr)) {
        available = false;
      }
      // Closed days (no check-in on these days)
      else if (settings.dailyClosedDays.includes(dayOfWeek)) {
        available = false;
      }
      // Check if occupied by an existing booking
      // A date is occupied if any booking covers it as a stay night
      // (check-in date through check-out date - 1). Checkout date is free.
      else {
        const currentMs = current.getTime();
        const isOccupied = occupiedBookings.some(b => {
          const bStartMs = b.date.getTime();
          // checkOutDate is the day guest leaves — that day is available for new check-in
          const bEndMs = b.checkOutDate!.getTime();
          return currentMs >= bStartMs && currentMs < bEndMs;
        });
        if (isOccupied) {
          available = false;
        }
      }

      result.push({ date: dateStr, available });
      current.setUTCDate(current.getUTCDate() + 1);
    }

    return result;
  }

  /**
   * Create a daily booking (check-in → check-out).
   * One booking = one stay.
   */
  async createDailyBooking(
    tenantId: string,
    dto: CreateDailyBookingDto,
    depositAmount?: number,
  ) {
    const settings = await this.getDailySettings(tenantId);

    const checkIn = new Date(dto.checkInDate + 'T12:00:00Z');
    const checkOut = new Date(dto.checkOutDate + 'T12:00:00Z');

    // Validate checkout > checkin
    if (checkOut <= checkIn) {
      throw new BadRequestException('La fecha de check-out debe ser posterior al check-in');
    }

    // Calculate nights
    const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (24 * 3600000));

    if (nights < settings.dailyMinNights) {
      throw new BadRequestException(
        `La estadía mínima es de ${settings.dailyMinNights} noche(s)`,
      );
    }

    if (nights > settings.dailyMaxNights) {
      throw new BadRequestException(
        `La estadía máxima es de ${settings.dailyMaxNights} noches`,
      );
    }

    // Validate check-in date is not in the past
    const nowUtc = new Date();
    const argentinaOffset = -3 * 60;
    const nowArgMs = nowUtc.getTime() + (nowUtc.getTimezoneOffset() + argentinaOffset) * 60000;
    const nowArg = new Date(nowArgMs);
    const todayStr = `${nowArg.getFullYear()}-${String(nowArg.getMonth() + 1).padStart(2, '0')}-${String(nowArg.getDate()).padStart(2, '0')}`;
    const todayDate = new Date(todayStr + 'T12:00:00Z');

    if (checkIn < todayDate) {
      throw new BadRequestException('No se pueden hacer reservas en fechas pasadas');
    }

    // Validate max advance
    const maxDate = new Date(todayDate);
    maxDate.setUTCDate(maxDate.getUTCDate() + settings.maxAdvanceBookingDays);
    if (checkIn > maxDate) {
      throw new BadRequestException(
        `No se pueden hacer reservas con más de ${settings.maxAdvanceBookingDays} días de anticipación`,
      );
    }

    // Validate closed days
    const checkInDow = checkIn.getUTCDay();
    if (settings.dailyClosedDays.includes(checkInDow)) {
      throw new BadRequestException('No se permiten check-ins en este día de la semana');
    }

    // Check availability for entire range
    const availability = await this.getDailyAvailability(
      tenantId,
      dto.checkInDate,
      // Check up to checkout-1 (checkout day itself doesn't need to be free)
      new Date(checkOut.getTime() - 24 * 3600000).toISOString().split('T')[0],
      dto.branchId,
    );

    const unavailableDates = availability.filter(d => !d.available);
    if (unavailableDates.length > 0) {
      throw new ConflictException(
        `Las siguientes fechas no están disponibles: ${unavailableDates.map(d => d.date).join(', ')}`,
      );
    }

    // Get service for pricing
    const service = await this.servicesService.findById(tenantId, dto.serviceId);
    const pricePerNight = Number(service.price);
    const totalPrice = pricePerNight * nights;

    // Find or create customer
    let customer = await this.customersService.findByPhone(tenantId, dto.customerPhone);
    if (!customer) {
      customer = await this.customersService.create(tenantId, {
        name: dto.customerName,
        phone: dto.customerPhone,
        email: dto.customerEmail,
      });
    }

    // Create booking
    const booking = await this.prisma.booking.create({
      data: {
        tenantId,
        branchId: dto.branchId || null,
        serviceId: dto.serviceId,
        customerId: customer.id,
        date: checkIn,
        startTime: settings.dailyCheckInTime,
        endTime: settings.dailyCheckOutTime,
        checkOutDate: checkOut,
        totalNights: nights,
        totalPrice,
        notes: dto.notes,
        status: BookingStatus.PENDING,
        depositAmount: depositAmount || null,
        depositPaid: false,
      },
      include: {
        service: true,
        customer: true,
        employee: true,
        branch: true,
      },
    });

    // Update customer stats
    await this.customersService.incrementBookings(customer.id);

    // Emit booking created event
    const eventPayload: BookingCreatedPayload = {
      booking,
      tenantId,
      depositRequired: !!depositAmount,
    };
    this.eventEmitter.emit(BookingEvent.CREATED, eventPayload);

    this.logger.log('Daily booking created', {
      tenantId,
      bookingId: booking.id,
      checkIn: dto.checkInDate,
      checkOut: dto.checkOutDate,
      nights,
      totalPrice,
      action: 'booking.create_daily',
    });

    return booking;
  }

  async getTodayBookings(tenantId: string) {
    // Use Argentina timezone (UTC-3) to determine "today"
    const nowUtc = new Date();
    const argentinaOffset = -3 * 60;
    const nowArgMs = nowUtc.getTime() + (nowUtc.getTimezoneOffset() + argentinaOffset) * 60000;
    const nowArg = new Date(nowArgMs);
    const todayStr = `${nowArg.getFullYear()}-${String(nowArg.getMonth() + 1).padStart(2, '0')}-${String(nowArg.getDate()).padStart(2, '0')}`;

    return this.prisma.booking.findMany({
      where: {
        tenantId,
        date: {
          gte: new Date(todayStr + 'T00:00:00Z'),
          lte: new Date(todayStr + 'T23:59:59.999Z'),
        },
      },
      include: {
        service: true,
        customer: true,
        employee: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async getRecentBookings(tenantId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        tenantId,
      },
      include: {
        service: true,
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return bookings.map((booking) => ({
      id: booking.id,
      customerName: booking.customer?.name || 'Cliente',
      serviceName: booking.service?.name || 'Servicio',
      date: booking.date.toISOString(),
      startTime: booking.startTime,
      createdAt: booking.createdAt.toISOString(),
      status: booking.status,
    }));
  }
}
