import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,

} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { UpdateExtraInfoDto } from './dto/update-extra-info.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { ForbiddenException } from '@nestjs/common';

@ApiTags('customers')
@Controller('customers')
@ApiBearerAuth()
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  async create(
    @CurrentUser() user: User,
    @Body() createCustomerDto: CreateCustomerDto,
  ) {
    const { hasReachedLimit, current, limit } = await this.subscriptionsService.checkLimit(user.tenantId!, 'customers');
    if (hasReachedLimit) {
      throw new ForbiddenException(`Límite de ${limit} clientes alcanzado (tenés ${current}). Mejorá tu plan para agregar más.`);
    }
    return this.customersService.create(user.tenantId!, createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  async findAll(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.customersService.findAll(user.tenantId!, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a customer by ID' })
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.customersService.findById(user.tenantId!, id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get customer booking history' })
  async getHistory(@CurrentUser() user: User, @Param('id') id: string) {
    return this.customersService.getHistory(user.tenantId!, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a customer' })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(user.tenantId!, id, updateCustomerDto);
  }

  @Patch(':id/extra-info')
  @ApiOperation({ summary: 'Update customer extra info section' })
  async updateExtraInfo(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateExtraInfoDto,
  ) {
    return this.customersService.updateExtraInfo(user.tenantId!, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a customer' })
  async delete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.customersService.delete(user.tenantId!, id);
  }
}
