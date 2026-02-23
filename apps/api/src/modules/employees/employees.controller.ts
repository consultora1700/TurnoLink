import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@ApiTags('employees')
@ApiBearerAuth()
@Controller('employees')
@UseGuards(JwtAuthGuard, TenantGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los empleados' })
  findAll(@CurrentTenant('id') tenantId: string) {
    return this.employeesService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un empleado por ID' })
  findOne(@CurrentTenant('id') tenantId: string, @Param('id') id: string) {
    return this.employeesService.findById(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo empleado' })
  create(
    @CurrentTenant('id') tenantId: string,
    @Body() dto: CreateEmployeeDto,
  ) {
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
  @ApiOperation({ summary: 'Obtener servicios de un empleado' })
  getEmployeeServices(
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.employeesService.getEmployeeServices(tenantId, id);
  }

  @Put(':id/services')
  @ApiOperation({ summary: 'Actualizar servicios de un empleado (bulk)' })
  updateEmployeeServices(
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
    @Body() body: { serviceIds: string[] },
  ) {
    return this.employeesService.updateEmployeeServices(tenantId, id, body.serviceIds);
  }
}
