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
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@ApiTags('branches')
@ApiBearerAuth()
@Controller('branches')
@UseGuards(JwtAuthGuard, TenantGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las sucursales' })
  findAll(@CurrentTenant('id') tenantId: string) {
    return this.branchesService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una sucursal por ID' })
  findOne(@CurrentTenant('id') tenantId: string, @Param('id') id: string) {
    return this.branchesService.findById(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva sucursal' })
  create(
    @CurrentTenant('id') tenantId: string,
    @Body() dto: CreateBranchDto,
  ) {
    return this.branchesService.create(tenantId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una sucursal' })
  update(
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBranchDto,
  ) {
    return this.branchesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una sucursal' })
  delete(@CurrentTenant('id') tenantId: string, @Param('id') id: string) {
    return this.branchesService.delete(tenantId, id);
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reordenar sucursales' })
  reorder(
    @CurrentTenant('id') tenantId: string,
    @Body() body: { branchIds: string[] },
  ) {
    return this.branchesService.reorder(tenantId, body.branchIds);
  }

  // ==================== BRANCH SERVICES ====================

  @Get(':id/services')
  @ApiOperation({ summary: 'Obtener servicios de una sucursal' })
  getBranchServices(
    @CurrentTenant('id') tenantId: string,
    @Param('id') branchId: string,
  ) {
    return this.branchesService.getBranchServices(tenantId, branchId);
  }

  @Post(':id/services')
  @ApiOperation({ summary: 'Asignar servicio a sucursal' })
  assignService(
    @CurrentTenant('id') tenantId: string,
    @Param('id') branchId: string,
    @Body() body: { serviceId: string; priceOverride?: number },
  ) {
    return this.branchesService.assignServiceToBranch(
      tenantId,
      branchId,
      body.serviceId,
      body.priceOverride,
    );
  }

  @Delete(':id/services/:serviceId')
  @ApiOperation({ summary: 'Quitar servicio de sucursal' })
  removeService(
    @CurrentTenant('id') tenantId: string,
    @Param('id') branchId: string,
    @Param('serviceId') serviceId: string,
  ) {
    return this.branchesService.removeServiceFromBranch(tenantId, branchId, serviceId);
  }

  @Put(':id/services')
  @ApiOperation({ summary: 'Asignar servicios en bulk a sucursal' })
  bulkAssignServices(
    @CurrentTenant('id') tenantId: string,
    @Param('id') branchId: string,
    @Body() body: { serviceIds: string[] },
  ) {
    return this.branchesService.bulkAssignServicesToBranch(
      tenantId,
      branchId,
      body.serviceIds,
    );
  }

  // ==================== BRANCH EMPLOYEES ====================

  @Get(':id/employees')
  @ApiOperation({ summary: 'Obtener empleados de una sucursal' })
  getBranchEmployees(
    @CurrentTenant('id') tenantId: string,
    @Param('id') branchId: string,
  ) {
    return this.branchesService.getBranchEmployees(tenantId, branchId);
  }

  @Post(':id/employees')
  @ApiOperation({ summary: 'Asignar empleado a sucursal' })
  assignEmployee(
    @CurrentTenant('id') tenantId: string,
    @Param('id') branchId: string,
    @Body() body: { employeeId: string },
  ) {
    return this.branchesService.assignEmployeeToBranch(
      tenantId,
      branchId,
      body.employeeId,
    );
  }

  @Delete(':id/employees/:employeeId')
  @ApiOperation({ summary: 'Quitar empleado de sucursal' })
  removeEmployee(
    @CurrentTenant('id') tenantId: string,
    @Param('id') branchId: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.branchesService.removeEmployeeFromBranch(tenantId, branchId, employeeId);
  }

  @Put(':id/employees')
  @ApiOperation({ summary: 'Asignar empleados en bulk a sucursal' })
  bulkAssignEmployees(
    @CurrentTenant('id') tenantId: string,
    @Param('id') branchId: string,
    @Body() body: { employeeIds: string[] },
  ) {
    return this.branchesService.bulkAssignEmployeesToBranch(
      tenantId,
      branchId,
      body.employeeIds,
    );
  }

  // ==================== BRANCH SCHEDULES ====================

  @Get(':id/schedules')
  @ApiOperation({ summary: 'Obtener horarios de una sucursal' })
  getBranchSchedules(
    @CurrentTenant('id') tenantId: string,
    @Param('id') branchId: string,
  ) {
    return this.branchesService.getBranchSchedules(tenantId, branchId);
  }

  @Put(':id/schedules')
  @ApiOperation({ summary: 'Actualizar horarios de sucursal' })
  updateBranchSchedules(
    @CurrentTenant('id') tenantId: string,
    @Param('id') branchId: string,
    @Body()
    body: {
      schedules: Array<{
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        isActive: boolean;
      }>;
    },
  ) {
    return this.branchesService.updateBranchSchedules(
      tenantId,
      branchId,
      body.schedules,
    );
  }

  // ==================== BRANCH BLOCKED DATES ====================

  @Get(':id/blocked-dates')
  @ApiOperation({ summary: 'Obtener fechas bloqueadas de una sucursal' })
  getBranchBlockedDates(
    @CurrentTenant('id') tenantId: string,
    @Param('id') branchId: string,
  ) {
    return this.branchesService.getBranchBlockedDates(tenantId, branchId);
  }

  @Post(':id/blocked-dates')
  @ApiOperation({ summary: 'Agregar fecha bloqueada a sucursal' })
  addBranchBlockedDate(
    @CurrentTenant('id') tenantId: string,
    @Param('id') branchId: string,
    @Body() body: { date: string; reason?: string },
  ) {
    return this.branchesService.addBranchBlockedDate(
      tenantId,
      branchId,
      new Date(body.date),
      body.reason,
    );
  }

  @Delete(':id/blocked-dates/:blockedDateId')
  @ApiOperation({ summary: 'Quitar fecha bloqueada de sucursal' })
  removeBranchBlockedDate(
    @CurrentTenant('id') tenantId: string,
    @Param('id') branchId: string,
    @Param('blockedDateId') blockedDateId: string,
  ) {
    return this.branchesService.removeBranchBlockedDate(tenantId, branchId, blockedDateId);
  }
}
