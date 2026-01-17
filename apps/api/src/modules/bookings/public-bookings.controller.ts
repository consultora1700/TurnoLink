import { Controller, Get, Post, Body, Param, Query, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { Public } from '../../common/decorators/public.decorator';
import { CreatePublicBookingDto } from './dto/create-public-booking.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ServicesService } from '../services/services.service';
import { NotificationsService } from '../notifications/notifications.service';

@ApiTags('public')
@Controller('public/bookings')
export class PublicBookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly prisma: PrismaService,
    private readonly servicesService: ServicesService,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  @Public()
  @Get(':slug/availability')
  @ApiOperation({ summary: 'Get public availability for a business' })
  async getAvailability(
    @Param('slug') slug: string,
    @Query('date') date: string,
    @Query('serviceId') serviceId?: string,
  ) {
    const tenant = await this.getTenantBySlug(slug);
    return this.bookingsService.getAvailability(tenant.id, date, serviceId);
  }

  @Public()
  @Get(':slug/deposit-info')
  @ApiOperation({ summary: 'Get deposit info for a service' })
  async getDepositInfo(
    @Param('slug') slug: string,
    @Query('serviceId') serviceId: string,
  ) {
    const tenant = await this.getTenantBySlug(slug);
    const settings = this.parseSettings(tenant.settings);

    if (!settings.requireDeposit) {
      return { required: false, amount: 0 };
    }

    const service = await this.servicesService.findById(tenant.id, serviceId);
    const depositAmount = (service.price * settings.depositPercentage) / 100;

    return {
      required: true,
      percentage: settings.depositPercentage,
      servicePrice: service.price,
      amount: Math.round(depositAmount * 100) / 100,
      mode: settings.depositMode || 'simulated',
    };
  }

  @Public()
  @Post(':slug')
  @ApiOperation({ summary: 'Create a public booking' })
  async create(
    @Param('slug') slug: string,
    @Body() createBookingDto: CreatePublicBookingDto,
  ) {
    const tenant = await this.getTenantBySlug(slug);
    const settings = this.parseSettings(tenant.settings);

    // Calculate deposit if required
    let depositAmount: number | undefined;
    if (settings.requireDeposit) {
      const service = await this.servicesService.findById(tenant.id, createBookingDto.serviceId);
      depositAmount = Math.round((service.price * settings.depositPercentage) / 100 * 100) / 100;
    }

    const booking = await this.bookingsService.create(tenant.id, createBookingDto, depositAmount);

    return {
      ...booking,
      requiresPayment: settings.requireDeposit && !booking.depositPaid,
      depositMode: settings.depositMode || 'simulated',
    };
  }

  @Public()
  @Post(':slug/simulate-payment/:bookingId')
  @ApiOperation({ summary: 'Simulate payment for demo purposes' })
  async simulatePayment(
    @Param('slug') slug: string,
    @Param('bookingId') bookingId: string,
  ) {
    const tenant = await this.getTenantBySlug(slug);

    // Verify booking belongs to this tenant
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, tenantId: tenant.id },
      include: { service: true, customer: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.depositPaid) {
      throw new BadRequestException('Deposit already paid');
    }

    // Simulate payment - mark as paid
    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        depositPaid: true,
        depositPaidAt: new Date(),
        depositReference: `SIM-${Date.now()}`, // Simulated reference
        status: 'CONFIRMED', // Auto-confirm after payment
      },
      include: { service: true, customer: true },
    });

    // Send confirmation notification after payment
    this.notificationsService.sendBookingConfirmation(updatedBooking).catch((error) => {
      console.error('Error sending booking confirmation after payment:', error);
    });

    return {
      success: true,
      message: 'Payment simulated successfully',
      booking: updatedBooking,
      paymentReference: updatedBooking.depositReference,
    };
  }

  @Public()
  @Get(':slug/booking/:bookingId')
  @ApiOperation({ summary: 'Get booking details' })
  async getBooking(
    @Param('slug') slug: string,
    @Param('bookingId') bookingId: string,
  ) {
    const tenant = await this.getTenantBySlug(slug);

    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, tenantId: tenant.id },
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

  private async getTenantBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug, status: 'ACTIVE' },
    });

    if (!tenant) {
      throw new NotFoundException('Business not found');
    }

    return tenant;
  }

  private parseSettings(settings: string | Record<string, unknown>): TenantSettings {
    let parsed: Record<string, unknown> = {};
    if (typeof settings === 'string') {
      try {
        parsed = JSON.parse(settings);
      } catch {
        parsed = {};
      }
    } else {
      parsed = settings || {};
    }
    return {
      requireDeposit: Boolean(parsed.requireDeposit) || false,
      depositPercentage: Number(parsed.depositPercentage) || 30,
      depositMode: String(parsed.depositMode || 'simulated'),
    };
  }
}

interface TenantSettings {
  requireDeposit: boolean;
  depositPercentage: number;
  depositMode: string;
}
