import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('customers')
@Controller('customers')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  async create(
    @CurrentUser() user: User,
    @Body() createCustomerDto: CreateCustomerDto,
  ) {
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

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a customer' })
  async delete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.customersService.delete(user.tenantId!, id);
  }
}
