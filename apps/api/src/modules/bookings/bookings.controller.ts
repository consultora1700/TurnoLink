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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking (from dashboard)' })
  async create(
    @CurrentUser() user: User,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingsService.create(user.tenantId!, createBookingDto);
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

  @Get('availability')
  @ApiOperation({ summary: 'Get availability for a date' })
  async getAvailability(
    @CurrentUser() user: User,
    @Query('date') date: string,
    @Query('serviceId') serviceId?: string,
  ) {
    return this.bookingsService.getAvailability(user.tenantId!, date, serviceId);
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
    return this.bookingsService.updateStatus(user.tenantId!, id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel a booking' })
  async cancel(@CurrentUser() user: User, @Param('id') id: string) {
    return this.bookingsService.cancel(user.tenantId!, id);
  }
}
