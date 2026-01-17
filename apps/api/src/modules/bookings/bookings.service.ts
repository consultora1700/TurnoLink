import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SchedulesService } from '../schedules/schedules.service';

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
import { NotificationsService } from '../notifications/notifications.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly schedulesService: SchedulesService,
    private readonly customersService: CustomersService,
    private readonly servicesService: ServicesService,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(tenantId: string, createBookingDto: CreateBookingDto, depositAmount?: number) {
    // Validate service exists
    const service = await this.servicesService.findById(
      tenantId,
      createBookingDto.serviceId,
    );

    // Check if slot is available
    const isAvailable = await this.isSlotAvailable(
      tenantId,
      createBookingDto.date,
      createBookingDto.startTime,
      service.duration,
    );

    if (!isAvailable) {
      throw new ConflictException('This time slot is not available');
    }

    // Calculate end time
    const endTime = this.calculateEndTime(
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
        serviceId: createBookingDto.serviceId,
        customerId: customer.id,
        date: new Date(createBookingDto.date),
        startTime: createBookingDto.startTime,
        endTime,
        notes: createBookingDto.notes,
        status: depositAmount ? BookingStatus.PENDING : BookingStatus.PENDING, // Stay pending until payment
        depositAmount: depositAmount || null,
        depositPaid: false,
      },
      include: {
        service: true,
        customer: true,
      },
    });

    // Update customer stats
    await this.customersService.incrementBookings(customer.id);

    // Only send notification if no deposit required (immediate confirmation)
    // If deposit is required, notification will be sent after payment
    if (!depositAmount) {
      this.notificationsService.sendBookingConfirmation(booking).catch((error) => {
        console.error('Error sending booking confirmation:', error);
      });
    }

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
      where.date = new Date(date);
    } else if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          service: true,
          customer: true,
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
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
      },
    });

    // Send cancellation notification (async)
    this.notificationsService.sendBookingCancellation(booking).catch((error) => {
      console.error('Error sending booking cancellation:', error);
    });

    return booking;
  }

  async getAvailability(
    tenantId: string,
    date: string,
    serviceId?: string,
  ): Promise<{ time: string; available: boolean }[]> {
    // Get schedule for this day
    const dayDate = new Date(date);
    const dayOfWeek = dayDate.getDay() === 0 ? 6 : dayDate.getDay() - 1;

    const schedule = await this.schedulesService.findByDay(tenantId, dayOfWeek);
    if (!schedule || !schedule.isActive) {
      return [];
    }

    // Check if date is blocked
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

    // Get existing bookings for this date
    const existingBookings = await this.prisma.booking.findMany({
      where: {
        tenantId,
        date: dayDate,
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      },
      select: { startTime: true, endTime: true },
    });

    // Generate time slots
    const slots = this.generateTimeSlots(
      schedule.startTime,
      schedule.endTime,
      duration,
      existingBookings,
    );

    return slots;
  }

  private async isSlotAvailable(
    tenantId: string,
    date: string,
    startTime: string,
    duration: number,
  ): Promise<boolean> {
    const dayDate = new Date(date);
    const endTime = this.calculateEndTime(startTime, duration);

    // Check if within schedule
    const dayOfWeek = dayDate.getDay() === 0 ? 6 : dayDate.getDay() - 1;
    const schedule = await this.schedulesService.findByDay(tenantId, dayOfWeek);

    if (!schedule || !schedule.isActive) {
      return false;
    }

    if (startTime < schedule.startTime || endTime > schedule.endTime) {
      return false;
    }

    // Check if date is blocked
    const isBlocked = await this.schedulesService.isDateBlocked(tenantId, date);
    if (isBlocked) {
      return false;
    }

    // Check for overlapping bookings
    const overlapping = await this.prisma.booking.findFirst({
      where: {
        tenantId,
        date: dayDate,
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

  private calculateEndTime(startTime: string, duration: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  private generateTimeSlots(
    startTime: string,
    endTime: string,
    duration: number,
    existingBookings: { startTime: string; endTime: string }[],
  ): { time: string; available: boolean }[] {
    const slots: { time: string; available: boolean }[] = [];

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    while (currentMinutes + duration <= endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const slotEnd = this.calculateEndTime(time, duration);

      // Check if this slot overlaps with any existing booking
      const isOccupied = existingBookings.some((booking) => {
        return (
          (time >= booking.startTime && time < booking.endTime) ||
          (slotEnd > booking.startTime && slotEnd <= booking.endTime) ||
          (time <= booking.startTime && slotEnd >= booking.endTime)
        );
      });

      slots.push({ time, available: !isOccupied });
      currentMinutes += duration;
    }

    return slots;
  }

  async getTodayBookings(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.booking.findMany({
      where: {
        tenantId,
        date: today,
      },
      include: {
        service: true,
        customer: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }
}
