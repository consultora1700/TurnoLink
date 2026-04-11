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
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { SchedulesService } from '../schedules/schedules.service';
import { UpdateEmployeeScheduleDto } from '../schedules/dto/update-employee-schedule.dto';
import { CreateEmployeeBlockedDateDto } from '../schedules/dto/create-employee-blocked-date.dto';
import { ForbiddenException } from '@nestjs/common';

@ApiTags('employees')
@ApiBearerAuth()
@Controller('employees')
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly schedulesService: SchedulesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los empleados' })
  findAll(
    @CurrentTenant('id') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.employeesService.findAll(tenantId, page ? parseInt(page, 10) : undefined, limit ? parseInt(limit, 10) : undefined);
  }

  @Get('delivery-staff')
  @ApiOperation({ summary: 'Listar repartidores activos del tenant' })
  findDeliveryStaff(@CurrentTenant('id') tenantId: string) {
    return this.employeesService.findDeliveryStaff(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un empleado por ID' })
  findOne(@CurrentTenant('id') tenantId: string, @Param('id') id: string) {
    return this.employeesService.findById(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo empleado' })
  async create(
    @CurrentTenant('id') tenantId: string,
    @Body() dto: CreateEmployeeDto,
  ) {
    const { hasReachedLimit, current, limit } = await this.subscriptionsService.checkLimit(tenantId, 'employees');
    if (hasReachedLimit) {
      throw new ForbiddenException(`Límite de ${limit} empleados alcanzado (tenés ${current}). Mejorá tu plan para agregar más.`);
    }
    return this.employeesService.create(tenantId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un empleado' })
  update(
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un empleado' })
  delete(@CurrentTenant('id') tenantId: string, @Param('id') id: string) {
    return this.employeesService.delete(tenantId, id);
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reordenar empleados' })
  reorder(
    @CurrentTenant('id') tenantId: string,
    @Body() body: { employeeIds: string[] },
  ) {
    return this.employeesService.reorder(tenantId, body.employeeIds);
  }

  @Get(':id/services')
  @ApiOperation({ summary: 'Obtener servicios de un empleado con precios custom' })
  getEmployeeServices(
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.employeesService.getEmployeeServices(tenantId, id);
  }

  @Put(':id/services')
  @ApiOperation({ summary: 'Actualizar servicios de un empleado (bulk, con precio/duración custom)' })
  updateEmployeeServices(
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
    @Body()
    body: {
      serviceIds?: string[];
      services?: { serviceId: string; customPrice?: number; customDuration?: number }[];
    },
  ) {
    // Backwards-compatible: accept either serviceIds (simple) or services (rich)
    const data = body.services || body.serviceIds || [];
    return this.employeesService.updateEmployeeServices(tenantId, id, data);
  }

  @Get(':id/specialties')
  @ApiOperation({ summary: 'Obtener especialidades de un empleado' })
  getEmployeeSpecialties(
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.employeesService.getEmployeeSpecialties(tenantId, id);
  }

  @Put(':id/specialties')
  @ApiOperation({ summary: 'Asignar especialidades a un empleado (bulk)' })
  updateEmployeeSpecialties(
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
    @Body()
    body: {
      specialties: { specialtyId: string; seniorityLevel?: string; customRate?: number }[];
    },
  ) {
    return this.employeesService.updateEmployeeSpecialties(tenantId, id, body.specialties);
  }

  // ===== EMPLOYEE SCHEDULES =====

  @Get(':id/schedules')
  @ApiOperation({ summary: 'Obtener horario custom del empleado (vacío si hereda)' })
  async getEmployeeSchedules(
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
  ) {
    await this.employeesService.findById(tenantId, id);
    return this.schedulesService.findEmployeeSchedules(id);
  }

  @Put(':id/schedules')
  @ApiOperation({ summary: 'Guardar horario custom del empleado' })
  async updateEmployeeSchedules(
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeScheduleDto,
  ) {
    await this.employeesService.findById(tenantId, id);
    return this.schedulesService.updateEmployeeSchedules(id, dto);
  }

  @Delete(':id/schedules')
  @ApiOperation({ summary: 'Eliminar horario custom (volver a heredar del negocio)' })
  async deleteEmployeeSchedules(
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
  ) {
    await this.employeesService.findById(tenantId, id);
    await this.schedulesService.deleteEmployeeSchedules(id);
    return { message: 'Employee schedule reset to inherit from business' };
  }

  @Get(':id/effective-schedule')
  @ApiOperation({ summary: 'Obtener horario resuelto (7 días con jerarquía)' })
  async getEffectiveSchedule(
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
  ) {
    await this.employeesService.findById(tenantId, id);
    return this.schedulesService.getFullEffectiveSchedule(id, null, tenantId);
  }

  // ===== EMPLOYEE BLOCKED DATES =====

  @Get(':id/blocked-dates')
  @ApiOperation({ summary: 'Listar días bloqueados del empleado' })
  async getEmployeeBlockedDates(
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    await this.employeesService.findById(tenantId, id);
    return this.schedulesService.findEmployeeBlockedDates(id, startDate, endDate);
  }

  @Post(':id/blocked-dates')
  @ApiOperation({ summary: 'Crear día bloqueado para el empleado' })
  async createEmployeeBlockedDate(
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: CreateEmployeeBlockedDateDto,
  ) {
    await this.employeesService.findById(tenantId, id);
    return this.schedulesService.createEmployeeBlockedDate(id, dto);
  }

  @Delete(':id/blocked-dates/:blockedDateId')
  @ApiOperation({ summary: 'Eliminar día bloqueado del empleado' })
  async deleteEmployeeBlockedDate(
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
    @Param('blockedDateId') blockedDateId: string,
  ) {
    await this.employeesService.findById(tenantId, id);
    return this.schedulesService.deleteEmployeeBlockedDate(id, blockedDateId);
  }
}
