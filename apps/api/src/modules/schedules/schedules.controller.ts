import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CreateBlockedDateDto } from './dto/create-blocked-date.dto';

@ApiTags('schedules')
@Controller('schedules')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all schedules' })
  async findAll(@CurrentUser() user: User) {
    return this.schedulesService.findAll(user.tenantId!);
  }

  @Put()
  @ApiOperation({ summary: 'Update schedules' })
  async update(
    @CurrentUser() user: User,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(user.tenantId!, updateScheduleDto);
  }

  // Blocked dates
  @Get('blocked')
  @ApiOperation({ summary: 'Get blocked dates' })
  async getBlockedDates(
    @CurrentUser() user: User,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.schedulesService.findBlockedDates(
      user.tenantId!,
      startDate,
      endDate,
    );
  }

  @Post('blocked')
  @ApiOperation({ summary: 'Block a date' })
  async createBlockedDate(
    @CurrentUser() user: User,
    @Body() createBlockedDateDto: CreateBlockedDateDto,
  ) {
    return this.schedulesService.createBlockedDate(
      user.tenantId!,
      createBlockedDateDto,
    );
  }

  @Delete('blocked/:id')
  @ApiOperation({ summary: 'Unblock a date' })
  async deleteBlockedDate(@CurrentUser() user: User, @Param('id') id: string) {
    return this.schedulesService.deleteBlockedDate(user.tenantId!, id);
  }
}
