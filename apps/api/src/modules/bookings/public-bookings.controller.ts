import { Controller, Get, Post, Body, Param, Query, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { BookingsService } from './bookings.service';
import { Public } from '../../common/decorators/public.decorator';
import { CreatePublicBookingDto } from './dto/create-public-booking.dto';
import { CreateDailyBookingDto } from './dto/create-daily-booking.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ServicesService } from '../services/services.service';
import { MercadoPagoService } from '../mercadopago/mercadopago.service';
import { BookingEvent, BookingEventPayload } from '../../common/events';

@ApiTags('public')
@Controller('public/bookings')
export class PublicBookingsController {
  private readonly logger = new Logger(PublicBookingsController.name);

  constructor(
    private readonly bookingsService: BookingsService,
    private readonly prisma: PrismaService,
    private readonly servicesService: ServicesService,
    private readonly eventEmitter: EventEmitter2,
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly configService: ConfigService,
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
    const priceAsNumber = Number(service.price);
    const depositAmount = (priceAsNumber * settings.depositPercentage) / 100;

    return {
      required: true,
      percentage: settings.depositPercentage,
      servicePrice: priceAsNumber,
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
      const priceAsNumber = Number(service.price);
      depositAmount = Math.round((priceAsNumber * settings.depositPercentage) / 100 * 100) / 100;
    }

    const booking = await this.bookingsService.create(tenant.id, createBookingDto, depositAmount);

    return {
      ...booking,
      // Convert Decimal to number for JSON serialization
      depositAmount: booking.depositAmount ? Number(booking.depositAmount) : null,
      service: booking.service ? {
        ...booking.service,
        price: Number(booking.service.price),
      } : null,
      requiresPayment: settings.requireDeposit && !booking.depositPaid,
      depositMode: settings.depositMode || 'simulated',
    };
  }

  @Public()
  @Get(':slug/daily-availability')
  @ApiOperation({ summary: 'Get daily availability for a business (date range)' })
  async getDailyAvailability(
    @Param('slug') slug: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('branchId') branchId?: string,
  ) {
    const tenant = await this.getTenantBySlug(slug);
    return this.bookingsService.getDailyAvailability(tenant.id, startDate, endDate, branchId);
  }

  @Public()
  @Post(':slug/daily')
  @ApiOperation({ summary: 'Create a daily booking (check-in → check-out)' })
  async createDailyBooking(
    @Param('slug') slug: string,
    @Body() dto: CreateDailyBookingDto,
  ) {
    const tenant = await this.getTenantBySlug(slug);
    const settings = this.parseSettings(tenant.settings);

    // Calculate deposit if required
    let depositAmount: number | undefined;
    if (settings.requireDeposit) {
      const service = await this.servicesService.findById(tenant.id, dto.serviceId);
      const pricePerNight = Number(service.price);

      const checkIn = new Date(dto.checkInDate + 'T12:00:00Z');
      const checkOut = new Date(dto.checkOutDate + 'T12:00:00Z');
      const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (24 * 3600000));
      const totalPrice = pricePerNight * nights;

      depositAmount = Math.round((totalPrice * settings.depositPercentage) / 100 * 100) / 100;
    }

    const booking = await this.bookingsService.createDailyBooking(tenant.id, dto, depositAmount);

    return {
      ...booking,
      depositAmount: booking.depositAmount ? Number(booking.depositAmount) : null,
      totalPrice: booking.totalPrice ? Number(booking.totalPrice) : null,
      service: booking.service ? {
        ...booking.service,
        price: Number(booking.service.price),
      } : null,
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
    const settings = this.parseSettings(tenant.settings);

    // Block simulated payments when MercadoPago is the active payment mode
    if (settings.depositMode === 'mercadopago') {
      const mpStatus = await this.mercadoPagoService.getStatus(tenant.id);
      if (mpStatus.isConnected) {
        throw new BadRequestException(
          'Simulated payments are not allowed. Please use Mercado Pago.',
        );
      }
    }

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
      include: { service: true, customer: true, employee: true },
    });

    // Emit event for notification (handled by BookingEventsListener)
    const eventPayload: BookingEventPayload = {
      booking: updatedBooking,
      tenantId: tenant.id,
    };
    this.eventEmitter.emit(BookingEvent.CONFIRMED, eventPayload);

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

  @Public()
  @Post(':slug/create-preference/:bookingId')
  @ApiOperation({ summary: 'Create Mercado Pago payment preference for a booking deposit' })
  @ApiResponse({ status: 200, description: 'Payment preference created' })
  @ApiResponse({ status: 400, description: 'Invalid booking or payment not required' })
  async createPaymentPreference(
    @Param('slug') slug: string,
    @Param('bookingId') bookingId: string,
    @Body() body: { successUrl?: string; failureUrl?: string; pendingUrl?: string },
  ) {
    const tenant = await this.getTenantBySlug(slug);
    const settings = this.parseSettings(tenant.settings);

    // Check if MP is enabled
    if (settings.depositMode !== 'mercadopago') {
      throw new BadRequestException('Mercado Pago payments are not enabled for this business');
    }

    // Verify MP is connected
    const mpStatus = await this.mercadoPagoService.getStatus(tenant.id);
    if (!mpStatus.isConnected) {
      throw new BadRequestException('Mercado Pago is not connected for this business');
    }

    // Get booking
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

    if (!booking.depositAmount) {
      throw new BadRequestException('No deposit amount set for this booking');
    }

    // Build URLs
    const frontendUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    const backUrls = {
      success: body.successUrl || `${frontendUrl}/${tenant.slug}/booking/${bookingId}?payment=success`,
      failure: body.failureUrl || `${frontendUrl}/${tenant.slug}/booking/${bookingId}?payment=failure`,
      pending: body.pendingUrl || `${frontendUrl}/${tenant.slug}/booking/${bookingId}?payment=pending`,
    };

    // Create preference description
    const description = `Seña para ${booking.service.name} - ${tenant.name}`;

    try {
      const preference = await this.mercadoPagoService.createDepositPreference(
        tenant.id,
        bookingId,
        Number(booking.depositAmount),
        description,
        backUrls,
      );

      this.logger.log(`Payment preference created for booking ${bookingId}`);

      return {
        success: true,
        preferenceId: preference.preferenceId,
        initPoint: preference.initPoint,
        sandboxInitPoint: preference.sandboxInitPoint,
      };
    } catch (error) {
      this.logger.error(`Failed to create preference for booking ${bookingId}: ${error.message}`);
      throw new BadRequestException('Failed to create payment. Please try again.');
    }
  }

  @Public()
  @Get(':slug/payment-status/:bookingId')
  @ApiOperation({ summary: 'Get payment status for a booking' })
  @ApiResponse({ status: 200, description: 'Payment status' })
  async getPaymentStatus(
    @Param('slug') slug: string,
    @Param('bookingId') bookingId: string,
  ) {
    const tenant = await this.getTenantBySlug(slug);

    // Verify booking belongs to this tenant
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, tenantId: tenant.id },
      select: {
        id: true,
        depositPaid: true,
        depositPaidAt: true,
        depositAmount: true,
        depositReference: true,
        status: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Get detailed payment status from DepositPayment if exists
    const paymentStatus = await this.mercadoPagoService.getPaymentStatus(bookingId);

    return {
      bookingId: booking.id,
      bookingStatus: booking.status,
      depositRequired: booking.depositAmount !== null,
      depositAmount: booking.depositAmount ? Number(booking.depositAmount) : null,
      depositPaid: booking.depositPaid,
      depositPaidAt: booking.depositPaidAt,
      paymentReference: booking.depositReference,
      payment: paymentStatus,
    };
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
