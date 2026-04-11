import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,

} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { SkipSubscriptionCheck } from '../../common/decorators/skip-subscription-check.decorator';

@ApiTags('bookings')
@Controller('bookings')
@ApiBearerAuth()
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking (from dashboard)' })
  async create(
    @CurrentUser() user: User,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    const { hasReachedLimit, current, limit } = await this.subscriptionsService.checkLimit(user.tenantId!, 'bookings');
    if (hasReachedLimit) {
      throw new ForbiddenException(`Límite de ${limit} reservas/mes alcanzado (tenés ${current}). Mejorá tu plan para agregar más.`);
    }
    // skipAdvanceCheck=true: dashboard users can create bookings at any time (no min advance hours)
    return this.bookingsService.create(user.tenantId!, createBookingDto, undefined, true);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings' })
  async findAll(
    @CurrentUser() user: User,
    @Query('date') date?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.bookingsService.findAll(user.tenantId!, {
      date,
      startDate,
      endDate,
      status,
      page,
      limit,
    });
  }

  @Get('today')
  @ApiOperation({ summary: 'Get today\'s bookings' })
  async getToday(@CurrentUser() user: User) {
    return this.bookingsService.getTodayBookings(user.tenantId!);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent bookings for notifications' })
  async getRecent(@CurrentUser() user: User) {
    return this.bookingsService.getRecentBookings(user.tenantId!);
  }

  @Get('activity-feed')
  @SkipSubscriptionCheck()
  @ApiOperation({ summary: 'Get unified activity feed for notification bell' })
  async getActivityFeed(@CurrentUser() user: User, @Req() req: any) {
    const tenantType = req.user?.tenantType || 'BUSINESS';
    return this.bookingsService.getActivityFeed(user.tenantId!, user.id, tenantType);
  }

  @Get('availability')
  @ApiOperation({ summary: 'Get availability for a date' })
  async getAvailability(
    @CurrentUser() user: User,
    @Query('date') date: string,
    @Query('serviceId') serviceId?: string,
  ) {
    return this.bookingsService.getAvailability(user.tenantId!, date, serviceId);
  }

  @Get('daily-availability')
  @ApiOperation({ summary: 'Get daily availability for a date range' })
  async getDailyAvailability(
    @CurrentUser() user: User,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.bookingsService.getDailyAvailability(user.tenantId!, startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a booking by ID' })
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.bookingsService.findById(user.tenantId!, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a booking' })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(user.tenantId!, id, updateBookingDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update booking status' })
  async updateStatus(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Estado inválido: ${status}. Valores válidos: ${validStatuses.join(', ')}`);
    }
    return this.bookingsService.updateStatus(user.tenantId!, id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel a booking' })
  async cancel(@CurrentUser() user: User, @Param('id') id: string) {
    return this.bookingsService.cancel(user.tenantId!, id);
  }
}
