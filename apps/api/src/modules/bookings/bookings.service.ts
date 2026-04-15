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
  BookingVideoNeededPayload,
} from '../../common/events';
import { Prisma } from '@prisma/client';

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
import { VideoIntegrationService } from '../video-integration/video-integration.service';
import { CacheService } from '../../common/cache';

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
    private readonly videoIntegrationService: VideoIntegrationService,
    private readonly cacheService: CacheService,
  ) {
    this.logger.setContext('BookingsService');
  }

  async create(tenantId: string, createBookingDto: CreateBookingDto, depositAmount?: number, skipAdvanceCheck = false) {
    // Temporal validation: reject past dates/times (skip advance check for dashboard bookings)
    await this.validateBookingTime(tenantId, createBookingDto.date, createBookingDto.startTime, skipAdvanceCheck);

    // Auto-resolve branchId: if not provided, use the tenant's first (or only) branch
    if (!createBookingDto.branchId) {
      const defaultBranch = await this.prisma.branch.findFirst({
        where: { tenantId, isActive: true },
        select: { id: true },
        orderBy: { order: 'asc' },
      });
      if (defaultBranch) {
        createBookingDto.branchId = defaultBranch.id;
        this.logger.warn(`[AutoBranch] Resolved branchId=${defaultBranch.id} for tenant=${tenantId}`);
      } else {
        this.logger.warn(`[AutoBranch] No active branch found for tenant=${tenantId}`);
      }
    }

    // Resolve service or product (outside tx — read-only, needed for duration/price)
    const DEFAULT_PRODUCT_BOOKING_DURATION = 15; // minutes
    let service: any = null;
    let product: any = null;
    let endTime: string;

    if (createBookingDto.serviceId) {
      service = await this.servicesService.findById(tenantId, createBookingDto.serviceId);
      endTime = this.timeUtils.calculateEndTime(createBookingDto.startTime, service.duration);
    } else if (createBookingDto.productId) {
      product = await this.prisma.product.findFirst({
        where: { id: createBookingDto.productId, tenantId, isActive: true },
      });
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      endTime = this.timeUtils.calculateEndTime(createBookingDto.startTime, DEFAULT_PRODUCT_BOOKING_DURATION);
    } else {
      throw new BadRequestException('serviceId or productId is required');
    }

    // Serializable transaction with retry: handles concurrent slot conflicts gracefully
    const MAX_TX_RETRIES = 3;
    let txAttempt = 0;
    let booking: any;

    while (txAttempt < MAX_TX_RETRIES) {
      try {
        booking = await this.prisma.$transaction(async (tx) => {
      let hourlyPromoActive = false;

      if (service) {
        // Re-read service inside tx for atomic promo check (prevents race condition on promoBookingCount)
        const freshSvc = await tx.service.findUniqueOrThrow({ where: { id: createBookingDto.serviceId! } });
        const now = new Date();
        hourlyPromoActive = freshSvc.promoPrice != null
          && (!freshSvc.promoStartDate || freshSvc.promoStartDate <= now)
          && (!freshSvc.promoEndDate || freshSvc.promoEndDate >= now)
          && (freshSvc.promoMaxBookings == null || freshSvc.promoBookingCount < freshSvc.promoMaxBookings);

        // Check slot availability inside transaction
        const isAvailable = await this.isSlotAvailableTx(
          tx,
          tenantId,
          createBookingDto.date,
          createBookingDto.startTime,
          service.duration,
          skipAdvanceCheck,
          service.capacity || 1,
          createBookingDto.branchId,
        );

        if (!isAvailable) {
          throw new ConflictException('This time slot is not available');
        }
      }
      // Product bookings: no slot availability check (sales don't block time slots)

      // Find or create customer inside transaction
      let customer = await tx.customer.findFirst({
        where: { tenantId, phone: createBookingDto.customerPhone },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            tenantId,
            name: createBookingDto.customerName,
            phone: createBookingDto.customerPhone,
            email: createBookingDto.customerEmail,
          },
        });
      } else if (!customer.email && createBookingDto.customerEmail) {
        // Enrich: fill empty email, never overwrite existing
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: { email: createBookingDto.customerEmail },
        });
      }

      // The email for THIS booking's notifications: use what was provided at booking time,
      // fallback to customer record email
      const bookingEmail = createBookingDto.customerEmail || customer.email || null;

      // Calculate totalPrice for product bookings
      const quantity = createBookingDto.quantity || 1;
      const totalPrice = product ? Number(product.price) * quantity : null;

      // Create booking
      const newBooking = await tx.booking.create({
        data: {
          tenantId,
          branchId: createBookingDto.branchId || null,
          serviceId: createBookingDto.serviceId || null,
          productId: createBookingDto.productId || null,
          quantity,
          customerId: customer.id,
          employeeId: createBookingDto.employeeId || null,
          date: new Date(createBookingDto.date + 'T12:00:00Z'),
          startTime: createBookingDto.startTime,
          endTime,
          notes: createBookingDto.notes,
          status: skipAdvanceCheck ? BookingStatus.CONFIRMED : BookingStatus.PENDING,
          depositAmount: depositAmount || null,
          depositPaid: false,
          bookingMode: createBookingDto.bookingMode || null,
          customerEmail: bookingEmail,
          assignedBy: (createBookingDto as any).assignedBy || 'client',
          assignmentReason: (createBookingDto as any).assignmentReason || null,
          ...(totalPrice != null ? { totalPrice } : {}),
        },
        include: {
          service: true,
          product: true,
          customer: true,
          employee: true,
          branch: true,
        },
      });

      // Increment customer bookings inside transaction
      await tx.customer.update({
        where: { id: customer.id },
        data: { totalBookings: { increment: 1 }, lastBookingAt: new Date() },
      });

      // Increment promo booking counter if promo was used (service bookings only)
      if (hourlyPromoActive && createBookingDto.serviceId) {
        await tx.service.update({
          where: { id: createBookingDto.serviceId },
          data: { promoBookingCount: { increment: 1 } },
        });
      }

      return newBooking;
        }, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          timeout: 10000,
        });
        break; // Transaction succeeded, exit retry loop
      } catch (error: any) {
        txAttempt++;
        // Retry on serialization failures (P2034) or write conflicts
        const isSerializationError = error?.code === 'P2034' ||
          error?.message?.includes('could not serialize') ||
          error?.message?.includes('deadlock');

        if (isSerializationError && txAttempt < MAX_TX_RETRIES) {
          this.logger.warn(`Booking tx serialization conflict, retry ${txAttempt}/${MAX_TX_RETRIES}`, { tenantId });
          // Exponential backoff with jitter: 100-300ms, 200-600ms, 400-1200ms
          const delay = Math.min(100 * Math.pow(2, txAttempt) + Math.random() * 200, 2000);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        // ConflictException (slot taken) or non-retriable error: throw immediately
        throw error;
      }
    }

    // Video meeting creation — sync before notifications so email includes the link (service bookings only)
    const isOnlineBooking = service && (createBookingDto.bookingMode === 'online' || service.mode === 'online');
    if (isOnlineBooking) {
      try {
        const videoData = await this.videoIntegrationService.createMeeting(tenantId, {
          topic: `${service.name} - ${createBookingDto.customerName}`,
          startTime: `${createBookingDto.date}T${createBookingDto.startTime}:00`,
          duration: service.duration,
          customerEmail: createBookingDto.customerEmail || undefined,
        });

        if (videoData) {
          await this.prisma.booking.update({
            where: { id: booking.id },
            data: {
              bookingMode: createBookingDto.bookingMode || 'online',
              videoProvider: videoData.provider,
              videoMeetingId: videoData.meetingId,
              videoJoinUrl: videoData.joinUrl,
            },
          });
          // Attach video data to booking object for notifications
          (booking as any).videoJoinUrl = videoData.joinUrl;
          (booking as any).videoProvider = videoData.provider;
          (booking as any).videoMeetingId = videoData.meetingId;

          this.logger.log('Video meeting created', {
            bookingId: booking.id, tenantId, provider: videoData.provider,
          });
        }
      } catch (error: any) {
        this.logger.error(`Failed to create video meeting for booking=${booking.id}: ${error?.message}`);
        // Non-blocking: booking still created, just without video link
      }
    }

    // Invalidate availability cache for this date
    await this.cacheService.invalidateAvailability(tenantId, createBookingDto.date);

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
      customerId: booking.customerId,
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
          product: true,
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
        product: true,
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
        product: true,
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

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        service: true,
        product: true,
        customer: true,
        employee: true,
      },
    });

    // Emit CONFIRMED event so notifications are sent to the customer
    if (status === BookingStatus.CONFIRMED) {
      this.eventEmitter.emit(BookingEvent.CONFIRMED, {
        booking: updatedBooking,
        tenantId,
      });
    }

    return updatedBooking;
  }

  async cancel(tenantId: string, id: string) {
    // Verify booking belongs to this tenant before cancelling
    await this.findById(tenantId, id);

    const booking = await this.prisma.booking.update({
      where: { id, tenantId },
      data: { status: BookingStatus.CANCELLED },
      include: {
        service: true,
        product: true,
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
    employeeId?: string,
  ): Promise<{ time: string; available: boolean }[]> {
    // Check cache first (include employeeId in cache key)
    const cacheKey = employeeId ? `${serviceId}:emp:${employeeId}` : serviceId;
    const cached = await this.cacheService.getAvailability(tenantId, date, cacheKey);
    if (cached) return cached;

    // Get schedule for this day (use noon UTC for correct day-of-week calculation)
    const dayDate = new Date(date + 'T12:00:00Z');
    const dayOfWeek = dayDate.getUTCDay() === 0 ? 6 : dayDate.getUTCDay() - 1;

    // Full-day range for date queries (handles both midnight and noon stored dates)
    const dayRange = {
      gte: new Date(date + 'T00:00:00Z'),
      lte: new Date(date + 'T23:59:59.999Z'),
    };

    // Check if date is blocked at tenant level
    const isBlocked = await this.schedulesService.isDateBlocked(tenantId, date);
    if (isBlocked) {
      return [];
    }

    // Check if date is blocked at branch level
    if (branchId) {
      const branchBlocked = await this.prisma.branchBlockedDate.findFirst({
        where: { branchId, date: { gte: dayRange.gte, lte: dayRange.lte } },
      });
      if (branchBlocked) {
        return [];
      }
    }

    // Get service duration and capacity (default 30 min, capacity 1)
    let duration = 30;
    let capacity = 1;
    if (serviceId) {
      try {
        const service = await this.servicesService.findById(tenantId, serviceId);
        duration = service.duration;
        capacity = service.capacity || 1;
      } catch {
        // Use default duration and capacity
      }
    }

    // Get booking constraints (buffer, advance hours, etc.)
    const constraints = await this.getBookingConstraints(tenantId);

    // Determine eligible employees for per-employee availability
    const eligibleEmployees = await this.getEligibleEmployeesForAvailability(
      tenantId, serviceId, branchId, employeeId,
    );

    let slots: { time: string; available: boolean }[];

    if (eligibleEmployees.length === 0) {
      // No employees → fallback to capacity-based system (retrocompatible)
      slots = await this.getCapacityBasedAvailability(
        tenantId, date, dayOfWeek, dayRange, branchId, duration, capacity, constraints,
      );
    } else {
      // Per-employee availability
      slots = await this.getEmployeeBasedAvailability(
        tenantId, date, dayOfWeek, dayRange, branchId, duration, constraints, eligibleEmployees,
      );
    }

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

    // Cache the result
    await this.cacheService.setAvailability(tenantId, date, slots, cacheKey);

    return slots;
  }

  /**
   * Get eligible employee IDs for availability calculation.
   * Returns empty array if no employees exist (fallback to capacity-based).
   */
  private async getEligibleEmployeesForAvailability(
    tenantId: string,
    serviceId?: string,
    branchId?: string,
    employeeId?: string,
  ): Promise<string[]> {
    // If a specific employee is requested, return just that one
    if (employeeId) {
      const emp = await this.prisma.employee.findFirst({
        where: { id: employeeId, tenantId, isActive: true },
        select: { id: true },
      });
      return emp ? [emp.id] : [];
    }

    // Check if the service has explicit employee assignments
    if (serviceId) {
      const assignments = await this.prisma.employeeService.findMany({
        where: {
          serviceId,
          isActive: true,
          employee: { tenantId, isActive: true, isPubliclyVisible: true },
        },
        select: { employeeId: true },
      });

      if (assignments.length > 0) {
        let employeeIds = assignments.map((a) => a.employeeId);

        // Filter by branch if specified
        if (branchId) {
          const branchEmployees = await this.prisma.branchEmployee.findMany({
            where: { branchId, isActive: true, employeeId: { in: employeeIds } },
            select: { employeeId: true },
          });
          if (branchEmployees.length > 0) {
            const branchSet = new Set(branchEmployees.map((be) => be.employeeId));
            employeeIds = employeeIds.filter((id) => branchSet.has(id));
          }
        }

        return employeeIds;
      }
    }

    // Check if tenant has any active employees at all
    const allEmployees = await this.prisma.employee.findMany({
      where: { tenantId, isActive: true, isPubliclyVisible: true },
      select: { id: true },
    });

    if (allEmployees.length === 0) {
      return []; // No employees → capacity-based fallback
    }

    let employeeIds = allEmployees.map((e) => e.id);

    // Filter by branch if specified
    if (branchId) {
      const branchEmployees = await this.prisma.branchEmployee.findMany({
        where: { branchId, isActive: true, employeeId: { in: employeeIds } },
        select: { employeeId: true },
      });
      if (branchEmployees.length > 0) {
        const branchSet = new Set(branchEmployees.map((be) => be.employeeId));
        employeeIds = employeeIds.filter((id) => branchSet.has(id));
      }
    }

    return employeeIds;
  }

  /**
   * Original capacity-based availability (for tenants without employees).
   */
  private async getCapacityBasedAvailability(
    tenantId: string,
    date: string,
    dayOfWeek: number,
    dayRange: { gte: Date; lte: Date },
    branchId: string | undefined,
    duration: number,
    capacity: number,
    constraints: { bookingBuffer: number },
  ): Promise<{ time: string; available: boolean }[]> {
    let schedule: { startTime: string; endTime: string; isActive: boolean } | null = null;

    if (branchId) {
      const branchSchedule = await this.prisma.branchSchedule.findUnique({
        where: { branchId_dayOfWeek: { branchId, dayOfWeek } },
      });
      if (branchSchedule) schedule = branchSchedule;
    }
    if (!schedule) {
      schedule = await this.schedulesService.findByDay(tenantId, dayOfWeek);
    }
    if (!schedule || !schedule.isActive) return [];

    const bookingWhere: any = {
      tenantId,
      date: { gte: dayRange.gte, lte: dayRange.lte },
      status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
    };
    if (branchId) bookingWhere.branchId = branchId;

    const existingBookings = await this.prisma.booking.findMany({
      where: bookingWhere,
      select: { startTime: true, endTime: true },
    });

    const startMinutes = this.timeUtils.toMinutes(schedule.startTime);
    let endMinutes = this.timeUtils.toMinutes(schedule.endTime);
    // Handle "00:00" meaning midnight end-of-day when start is later (e.g. 12:00-00:00)
    if (endMinutes <= startMinutes) endMinutes += 24 * 60;
    const isFullDay = (endMinutes - startMinutes) >= 23 * 60;

    let nextDayBookings: { startTime: string; endTime: string }[] = [];
    if (isFullDay && duration > 30) {
      const dayDate = new Date(date + 'T12:00:00Z');
      const nextDate = new Date(dayDate);
      nextDate.setUTCDate(nextDate.getUTCDate() + 1);
      const nextDateStr = nextDate.toISOString().split('T')[0];
      const nextDayWhere: any = {
        tenantId,
        date: { gte: new Date(nextDateStr + 'T00:00:00Z'), lte: new Date(nextDateStr + 'T23:59:59.999Z') },
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      };
      if (branchId) nextDayWhere.branchId = branchId;
      nextDayBookings = await this.prisma.booking.findMany({
        where: nextDayWhere,
        select: { startTime: true, endTime: true },
      });
    }

    return this.generateTimeSlots(
      schedule.startTime, schedule.endTime, duration,
      existingBookings, constraints.bookingBuffer, isFullDay, nextDayBookings, capacity,
    );
  }

  /**
   * Per-employee availability: union of all employee time windows.
   * A slot is available if at least 1 employee can take it.
   */
  private async getEmployeeBasedAvailability(
    tenantId: string,
    date: string,
    dayOfWeek: number,
    dayRange: { gte: Date; lte: Date },
    branchId: string | undefined,
    duration: number,
    constraints: { bookingBuffer: number },
    employeeIds: string[],
  ): Promise<{ time: string; available: boolean }[]> {
    // Batch fetch: all employee schedules for this day
    const empSchedules = await this.prisma.employeeSchedule.findMany({
      where: { employeeId: { in: employeeIds }, dayOfWeek },
    });
    const empScheduleMap = new Map(empSchedules.map((s) => [s.employeeId, s]));

    // Batch fetch: employee blocked dates
    const empBlockedDates = await this.prisma.employeeBlockedDate.findMany({
      where: { employeeId: { in: employeeIds }, date: { gte: dayRange.gte, lte: dayRange.lte } },
    });
    const blockedEmployeeIds = new Set(empBlockedDates.map((b) => b.employeeId));

    // Batch fetch: all bookings for these employees on this date
    const empBookings = await this.prisma.booking.findMany({
      where: {
        tenantId,
        employeeId: { in: employeeIds },
        date: { gte: dayRange.gte, lte: dayRange.lte },
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      },
      select: { employeeId: true, startTime: true, endTime: true },
    });
    const bookingsByEmployee = new Map<string, { startTime: string; endTime: string }[]>();
    for (const b of empBookings) {
      if (!b.employeeId) continue;
      if (!bookingsByEmployee.has(b.employeeId)) bookingsByEmployee.set(b.employeeId, []);
      bookingsByEmployee.get(b.employeeId)!.push({ startTime: b.startTime, endTime: b.endTime });
    }

    // Get fallback schedules (branch → tenant)
    let fallbackSchedule: { startTime: string; endTime: string; isActive: boolean } | null = null;
    if (branchId) {
      const branchSched = await this.prisma.branchSchedule.findUnique({
        where: { branchId_dayOfWeek: { branchId, dayOfWeek } },
      });
      if (branchSched) fallbackSchedule = branchSched;
    }
    if (!fallbackSchedule) {
      fallbackSchedule = await this.schedulesService.findByDay(tenantId, dayOfWeek);
    }

    // Resolve effective schedule per employee and determine global time window
    let globalStartMin = Infinity;
    let globalEndMin = -Infinity;

    interface EmployeeWindow {
      employeeId: string;
      startMin: number;
      endMin: number;
      bookings: { startTime: string; endTime: string }[];
    }

    const activeWindows: EmployeeWindow[] = [];

    for (const empId of employeeIds) {
      // Skip blocked employees
      if (blockedEmployeeIds.has(empId)) continue;

      // Resolve schedule: employee → fallback
      const empSched = empScheduleMap.get(empId);
      const effectiveSchedule = empSched || fallbackSchedule;
      if (!effectiveSchedule || !effectiveSchedule.isActive) continue;

      const startMin = this.timeUtils.toMinutes(effectiveSchedule.startTime);
      let endMin = this.timeUtils.toMinutes(effectiveSchedule.endTime);
      // Handle "00:00" meaning midnight end-of-day
      if (endMin <= startMin) endMin += 24 * 60;

      if (startMin < globalStartMin) globalStartMin = startMin;
      if (endMin > globalEndMin) globalEndMin = endMin;

      activeWindows.push({
        employeeId: empId,
        startMin,
        endMin,
        bookings: bookingsByEmployee.get(empId) || [],
      });
    }

    if (activeWindows.length === 0) return [];

    // Generate slots across the union of all employee windows
    const slots: { time: string; available: boolean }[] = [];
    const slotInterval = 30;
    let currentMinutes = globalStartMin;

    const isFullDay = (globalEndMin - globalStartMin) >= 23 * 60;

    while (isFullDay
      ? currentMinutes <= globalEndMin
      : currentMinutes + duration <= globalEndMin
    ) {
      const time = this.timeUtils.fromMinutes(currentMinutes);
      const slotEndMinutes = currentMinutes + duration;

      // Check if at least 1 employee can take this slot
      let anyAvailable = false;
      for (const win of activeWindows) {
        // Check slot fits within this employee's window
        if (isFullDay) {
          if (currentMinutes < win.startMin || currentMinutes > win.endMin) continue;
        } else {
          if (currentMinutes < win.startMin || slotEndMinutes > win.endMin) continue;
        }

        // Check no conflicting booking for this employee
        const hasConflict = win.bookings.some((booking) => {
          const bufferedEnd = constraints.bookingBuffer > 0
            ? this.timeUtils.calculateEndTime(booking.endTime, constraints.bookingBuffer)
            : booking.endTime;

          let bStart = this.timeUtils.toMinutes(booking.startTime);
          let bEnd = this.timeUtils.toMinutes(bufferedEnd);
          if (bEnd <= bStart) bEnd += 24 * 60;

          return currentMinutes < bEnd && bStart < slotEndMinutes;
        });

        if (!hasConflict) {
          anyAvailable = true;
          break;
        }
      }

      slots.push({ time, available: anyAvailable });
      currentMinutes += slotInterval;
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
    // Check cache first
    const cached = await this.cacheService.getTenantSettings(tenantId);
    if (cached?.bookingConstraints) return cached.bookingConstraints;

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

    const constraints = {
      minAdvanceBookingHours: settings.minAdvanceBookingHours != null ? Number(settings.minAdvanceBookingHours) : 1,
      maxAdvanceBookingDays: settings.maxAdvanceBookingDays != null ? Number(settings.maxAdvanceBookingDays) : 30,
      bookingBuffer: settings.bookingBuffer != null ? Number(settings.bookingBuffer) : 0,
    };

    // Cache with all parsed settings
    await this.cacheService.setTenantSettings(tenantId, { bookingConstraints: constraints, dailySettings: null, raw: settings });

    return constraints;
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
    serviceId?: string,
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

    // Get service capacity
    let capacity = 1;
    if (serviceId) {
      try {
        const service = await this.servicesService.findById(tenantId, serviceId);
        capacity = service.capacity || 1;
      } catch {
        // Use default capacity
      }
    }

    // Count overlapping bookings and compare against capacity
    const overlappingCount = await this.prisma.booking.count({
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

    return overlappingCount < capacity;
  }

  /**
   * Transaction-safe slot availability check.
   * Uses the transaction client to ensure serializable isolation.
   * Supports employee-aware checking when employeeId is provided.
   */
  private async isSlotAvailableTx(
    tx: Prisma.TransactionClient,
    tenantId: string,
    date: string,
    startTime: string,
    duration: number,
    skipScheduleCheck = false,
    capacity = 1,
    branchId?: string | null,
    employeeId?: string | null,
  ): Promise<boolean> {
    const dayDate = new Date(date + 'T12:00:00Z');
    const endTime = this.timeUtils.calculateEndTime(startTime, duration);

    if (!skipScheduleCheck) {
      const dayOfWeek = dayDate.getUTCDay() === 0 ? 6 : dayDate.getUTCDay() - 1;

      let schedule: { startTime: string; endTime: string; isActive: boolean } | null = null;

      // If employeeId provided, check employee schedule first
      if (employeeId) {
        const empSchedule = await tx.employeeSchedule.findUnique({
          where: { employeeId_dayOfWeek: { employeeId, dayOfWeek } },
        });
        if (empSchedule) schedule = empSchedule;
      }

      // Fallback: branch schedule, then tenant schedule
      if (!schedule && branchId) {
        schedule = await tx.branchSchedule.findUnique({
          where: { branchId_dayOfWeek: { branchId, dayOfWeek } },
        });
      }
      if (!schedule) {
        schedule = await this.schedulesService.findByDay(tenantId, dayOfWeek);
      }

      if (!schedule || !schedule.isActive) {
        return false;
      }

      const schedStartMin = this.timeUtils.toMinutes(schedule.startTime);
      let schedEndMin = this.timeUtils.toMinutes(schedule.endTime);
      // Handle "00:00" meaning midnight end-of-day
      if (schedEndMin <= schedStartMin) schedEndMin += 24 * 60;
      const isFullDay = (schedEndMin - schedStartMin) >= 23 * 60;
      const startMin = this.timeUtils.toMinutes(startTime);
      const endMin = this.timeUtils.toMinutes(endTime);
      const adjustedEndMin = endMin <= startMin ? endMin + 24 * 60 : endMin;

      if (isFullDay) {
        if (startMin < schedStartMin || startMin > schedEndMin) return false;
      } else if (startMin < schedStartMin || adjustedEndMin > schedEndMin) {
        return false;
      }

      // Check blocked dates (employee level, branch level, tenant level)
      if (employeeId) {
        const empBlocked = await this.schedulesService.isEmployeeDateBlocked(employeeId, date);
        if (empBlocked) return false;
      }
      if (branchId) {
        const branchBlocked = await tx.branchBlockedDate.findFirst({
          where: { branchId, date: { gte: new Date(date + 'T00:00:00Z'), lte: new Date(date + 'T23:59:59.999Z') } },
        });
        if (branchBlocked) return false;
      }
      const isBlocked = await this.schedulesService.isDateBlocked(tenantId, date);
      if (isBlocked) return false;
    }

    // Count overlapping bookings
    const overlappingWhere: any = {
      tenantId,
      date: {
        gte: new Date(date + 'T00:00:00Z'),
        lte: new Date(date + 'T23:59:59.999Z'),
      },
      status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      OR: [
        { AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }] },
        { AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }] },
        { AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }] },
      ],
    };

    if (employeeId) {
      // When checking for a specific employee, only count their bookings
      overlappingWhere.employeeId = employeeId;
    } else if (branchId) {
      overlappingWhere.branchId = branchId;
    }

    const overlappingCount = await tx.booking.count({ where: overlappingWhere });

    return overlappingCount < capacity;
  }

  private generateTimeSlots(
    startTime: string,
    endTime: string,
    duration: number,
    existingBookings: { startTime: string; endTime: string }[],
    bookingBuffer = 0,
    isFullDay = false,
    nextDayBookings: { startTime: string; endTime: string }[] = [],
    capacity = 1,
  ): { time: string; available: boolean }[] {
    const slots: { time: string; available: boolean }[] = [];
    let currentMinutes = this.timeUtils.toMinutes(startTime);
    let endMinutes = this.timeUtils.toMinutes(endTime);
    // Handle "00:00" meaning midnight end-of-day when start is later (e.g. 12:00-00:00)
    if (endMinutes <= currentMinutes) endMinutes += 24 * 60;

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

      // Check how many existing bookings overlap with this slot (including buffer)
      const overlappingCount = existingBookings.filter((booking) => {
        const bufferedEnd = bookingBuffer > 0
          ? this.timeUtils.calculateEndTime(booking.endTime, bookingBuffer)
          : booking.endTime;

        let bStart = this.timeUtils.toMinutes(booking.startTime);
        let bEnd = this.timeUtils.toMinutes(bufferedEnd);

        // Normalize cross-midnight bookings (endTime wraps past 00:00)
        if (bEnd <= bStart) bEnd += 24 * 60;

        return currentMinutes < bEnd && bStart < slotEndMinutes;
      }).length;
      const isOccupied = overlappingCount >= capacity;

      // For cross-midnight slots, also check next-day bookings
      let nextDayConflict = false;
      if (crossesMidnight && nextDayBookings.length > 0) {
        const overflowEnd = slotEndMinutes - 24 * 60; // minutes into next day
        const nextDayOverlapping = nextDayBookings.filter((booking) => {
          const bufferedEnd = bookingBuffer > 0
            ? this.timeUtils.calculateEndTime(booking.endTime, bookingBuffer)
            : booking.endTime;
          const bStart = this.timeUtils.toMinutes(booking.startTime);
          const bEnd = this.timeUtils.toMinutes(bufferedEnd);
          // Check if next-day booking overlaps with the overflow portion (00:00 to overflowEnd)
          return bStart < overflowEnd && bEnd > 0;
        }).length;
        nextDayConflict = (overlappingCount + nextDayOverlapping) >= capacity;
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
   * Get monthly availability for calendar visual indicators (HOURLY mode).
   * Returns a map of date → hasAvailability for each valid day in the month.
   */
  async getMonthlyAvailability(
    tenantId: string,
    year: number,
    month: number, // 1-based
    serviceId?: string,
    branchId?: string,
  ): Promise<Record<string, boolean>> {
    // Current date in Argentina timezone (UTC-3)
    const nowUtc = new Date();
    const argentinaOffset = -3 * 60;
    const nowArgMs = nowUtc.getTime() + (nowUtc.getTimezoneOffset() + argentinaOffset) * 60000;
    const nowArg = new Date(nowArgMs);
    const todayStr = `${nowArg.getFullYear()}-${String(nowArg.getMonth() + 1).padStart(2, '0')}-${String(nowArg.getDate()).padStart(2, '0')}`;
    const todayDate = new Date(todayStr + 'T12:00:00Z');

    const constraints = await this.getBookingConstraints(tenantId);
    const maxDate = new Date(todayDate);
    maxDate.setUTCDate(maxDate.getUTCDate() + constraints.maxAdvanceBookingDays);

    const firstDay = new Date(Date.UTC(year, month - 1, 1, 12));
    const lastDay = new Date(Date.UTC(year, month, 0, 12));

    const result: Record<string, boolean> = {};
    const tasks: Promise<void>[] = [];

    const current = new Date(firstDay);
    while (current <= lastDay) {
      const dateStr = current.toISOString().split('T')[0];
      if (current >= todayDate && current <= maxDate) {
        const d = dateStr;
        tasks.push(
          this.getAvailability(tenantId, d, serviceId, branchId).then(slots => {
            result[d] = slots.some(s => s.available);
          }),
        );
      }
      current.setUTCDate(current.getUTCDate() + 1);
    }

    await Promise.all(tasks);
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

    // Get service for base info (outside tx — read-only, needed for isPack check)
    const service = await this.servicesService.findById(tenantId, dto.serviceId);
    const isPack = (service as any).isPack || false;

    // Serializable transaction: availability re-check + pricing + customer + booking
    const booking = await this.prisma.$transaction(async (tx) => {
      // Re-read service inside tx for atomic promo check (prevents race condition on promoBookingCount)
      const freshService = await tx.service.findUniqueOrThrow({ where: { id: dto.serviceId } });

      // Determine pricing: pack fixed price > promo price > normal price
      let totalPrice: number;
      let promoUsed = false;

      if (isPack) {
        totalPrice = Number(freshService.price);
      } else {
        const now = new Date();
        const promoActive = freshService.promoPrice != null
          && (!freshService.promoStartDate || freshService.promoStartDate <= now)
          && (!freshService.promoEndDate || freshService.promoEndDate >= now)
          && (freshService.promoMaxBookings == null || freshService.promoBookingCount < freshService.promoMaxBookings);

        const pricePerNight = promoActive ? Number(freshService.promoPrice) : Number(freshService.price);
        totalPrice = pricePerNight * nights;
        promoUsed = promoActive;
      }

      // Re-check overlap inside transaction to prevent double booking
      const overlapping = await tx.booking.count({
        where: {
          tenantId,
          status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
          AND: [
            { checkOutDate: { not: null } },
            { date: { lt: checkOut } },
            { checkOutDate: { gt: checkIn } },
          ],
          ...(dto.branchId ? { branchId: dto.branchId } : {}),
        },
      });

      if (overlapping > 0) {
        throw new ConflictException('Las fechas seleccionadas ya no están disponibles');
      }

      // Find or create customer inside transaction
      let customer = await tx.customer.findFirst({
        where: { tenantId, phone: dto.customerPhone },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            tenantId,
            name: dto.customerName,
            phone: dto.customerPhone,
            email: dto.customerEmail,
          },
        });
      }

      const newBooking = await tx.booking.create({
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
          product: true,
          customer: true,
          employee: true,
          branch: true,
        },
      });

      // Increment customer bookings inside transaction
      await tx.customer.update({
        where: { id: customer.id },
        data: { totalBookings: { increment: 1 }, lastBookingAt: new Date() },
      });

      // Increment promo booking counter if promo was used
      if (promoUsed) {
        await tx.service.update({
          where: { id: dto.serviceId },
          data: { promoBookingCount: { increment: 1 } },
        });
      }

      return newBooking;
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      timeout: 10000,
    });

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
      totalPrice: booking.totalPrice != null ? Number(booking.totalPrice) : null,
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
        product: true,
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
        product: true,
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return bookings.map((booking) => ({
      id: booking.id,
      customerName: booking.customer?.name || 'Cliente',
      serviceName: booking.service?.name || booking.product?.name || 'Sin detalle',
      date: booking.date.toISOString(),
      startTime: booking.startTime,
      createdAt: booking.createdAt.toISOString(),
      status: booking.status,
    }));
  }

  /**
   * Unified activity feed for the notification bell.
   * Aggregates: recent bookings, job applications, reviews, and talent proposals.
   */
  async getActivityFeed(tenantId: string, userId: string, tenantType: string = 'BUSINESS') {
    const items: Array<{
      id: string;
      type: 'booking' | 'application' | 'review' | 'proposal_response';
      title: string;
      description: string;
      createdAt: string;
      link: string;
      meta?: Record<string, unknown>;
    }> = [];

    if (tenantType === 'PROFESSIONAL') {
      // Professional feed: application status updates + proposals received

      // 1. My application status changes (accepted/rejected by businesses)
      try {
        const myApps = await this.prisma.jobApplication.findMany({
          where: { profile: { userId } },
          include: {
            posting: { select: { title: true, id: true, tenant: { select: { name: true } } } },
          },
          orderBy: { updatedAt: 'desc' },
          take: 10,
        });

        for (const app of myApps) {
          const statusLabels: Record<string, string> = {
            PENDING: 'pendiente',
            REVIEWED: 'vista por',
            ACCEPTED: 'aceptada por',
            REJECTED: 'rechazada por',
          };
          const label = statusLabels[app.status] || app.status.toLowerCase();
          items.push({
            id: app.id,
            type: 'application',
            title: app.status === 'PENDING'
              ? `Postulación enviada`
              : `Postulación ${label} ${app.posting.tenant.name}`,
            description: app.posting.title,
            createdAt: (app.updatedAt || app.createdAt).toISOString(),
            link: '/mi-perfil/postulaciones',
            meta: { status: app.status, postingId: app.posting.id },
          });
        }
      } catch { /* Job applications may not exist */ }

      // 2. Proposals received from businesses
      try {
        const proposals = await this.prisma.talentProposal.findMany({
          where: { profile: { userId } },
          include: { senderTenant: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        });

        for (const p of proposals) {
          items.push({
            id: p.id,
            type: 'proposal_response',
            title: `${p.senderTenant.name} te envió una propuesta`,
            description: p.role,
            createdAt: p.createdAt.toISOString(),
            link: '/mi-perfil/propuestas',
            meta: { status: p.status },
          });
        }
      } catch { /* Proposals may not exist */ }

    } else {
      // Business feed: bookings, applications received, reviews, proposal responses

      // 1. Recent bookings (last 5)
      const bookings = await this.prisma.booking.findMany({
        where: { tenantId },
        include: { service: true, customer: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      for (const b of bookings) {
        items.push({
          id: b.id,
          type: 'booking',
          title: `Nueva reserva de ${b.customer?.name || 'Cliente'}`,
          description: `${b.service?.name || 'Servicio'} — ${b.startTime}`,
          createdAt: b.createdAt.toISOString(),
          link: '/turnos',
          meta: { status: b.status, date: b.date.toISOString(), startTime: b.startTime },
        });
      }

      // 2. Job applications received (last 5 across all postings)
      try {
        const applications = await this.prisma.jobApplication.findMany({
          where: { posting: { tenantId } },
          include: {
            posting: { select: { title: true, id: true } },
            profile: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        });

        for (const app of applications) {
          items.push({
            id: app.id,
            type: 'application',
            title: `${app.profile.name} se postuló`,
            description: app.posting.title,
            createdAt: app.createdAt.toISOString(),
            link: `/talento/ofertas/${app.posting.id}`,
            meta: { status: app.status, postingId: app.posting.id },
          });
        }
      } catch { /* Job postings module may not exist */ }

      // 3. Recent reviews (last 5)
      try {
        const reviews = await this.prisma.review.findMany({
          where: { tenantId },
          include: {
            customer: { select: { name: true } },
            booking: { include: { service: { select: { name: true } } } },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        });

        for (const r of reviews) {
          const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
          items.push({
            id: r.id,
            type: 'review',
            title: `${r.customer.name} dejó una reseña`,
            description: `${stars} — ${r.booking?.service?.name || 'Servicio'}`,
            createdAt: r.createdAt.toISOString(),
            link: '/resenas',
            meta: { rating: r.rating, comment: r.comment },
          });
        }
      } catch { /* Reviews module may not exist */ }

      // 4. Talent proposal responses (last 5 — proposals we sent that got a response)
      try {
        const proposals = await this.prisma.talentProposal.findMany({
          where: { senderTenantId: tenantId, respondedAt: { not: null } },
          include: { profile: { select: { name: true } } },
          orderBy: { respondedAt: 'desc' },
          take: 5,
        });

        for (const p of proposals) {
          const accepted = p.status === 'ACCEPTED';
          items.push({
            id: p.id,
            type: 'proposal_response',
            title: `${p.profile.name} ${accepted ? 'aceptó' : 'rechazó'} tu propuesta`,
            description: p.role,
            createdAt: (p.respondedAt || p.createdAt).toISOString(),
            link: '/talento/propuestas',
            meta: { status: p.status },
          });
        }
      } catch { /* Proposals may not exist */ }
    }

    // Sort all items by date descending, take top 15
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return items.slice(0, 15);
  }
}
