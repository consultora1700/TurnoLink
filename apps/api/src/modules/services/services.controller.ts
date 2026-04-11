import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,

} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { ForbiddenException } from '@nestjs/common';

@ApiTags('services')
@Controller('services')
@ApiBearerAuth()
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  // Services
  @Post()
  @ApiOperation({ summary: 'Create a new service' })
  async create(
    @CurrentUser() user: User,
    @Body() createServiceDto: CreateServiceDto,
  ) {
    const { hasReachedLimit, current, limit } = await this.subscriptionsService.checkLimit(user.tenantId!, 'services');
    if (hasReachedLimit) {
      throw new ForbiddenException(`Límite de ${limit} servicios alcanzado (tenés ${current}). Mejorá tu plan para agregar más.`);
    }
    return this.servicesService.create(user.tenantId!, createServiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all services' })
  async findAll(
    @CurrentUser() user: User,
    @Query('includeInactive') includeInactive = false,
  ) {
    // Admin panel always skips cache to avoid stale data across PM2 workers
    return this.servicesService.findAll(user.tenantId!, includeInactive, true);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service by ID' })
  async findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.servicesService.findById(user.tenantId!, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a service' })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.servicesService.update(user.tenantId!, id, updateServiceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a service' })
  async delete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.servicesService.delete(user.tenantId!, id);
  }

  @Put('reorder')
  @ApiOperation({ summary: 'Reorder services' })
  async reorder(
    @CurrentUser() user: User,
    @Body('serviceIds') serviceIds: string[],
  ) {
    return this.servicesService.reorder(user.tenantId!, serviceIds);
  }

  // Categories
  @Post('categories')
  @ApiOperation({ summary: 'Create a new category' })
  async createCategory(
    @CurrentUser() user: User,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return this.servicesService.createCategory(user.tenantId!, createCategoryDto);
  }

  @Get('categories/all')
  @ApiOperation({ summary: 'Get all categories with services' })
  async findAllCategories(@CurrentUser() user: User) {
    return this.servicesService.findAllCategories(user.tenantId!);
  }

  @Put('categories/:id')
  @ApiOperation({ summary: 'Update a category' })
  async updateCategory(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body('name') name: string,
  ) {
    return this.servicesService.updateCategory(user.tenantId!, id, name);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete a category' })
  async deleteCategory(@CurrentUser() user: User, @Param('id') id: string) {
    return this.servicesService.deleteCategory(user.tenantId!, id);
  }

  // Service-Employee management
  @Get(':id/employees')
  @ApiOperation({ summary: 'Obtener empleados asignados a un servicio' })
  async getServiceEmployees(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.servicesService.getServiceEmployees(user.tenantId!, id);
  }
}
