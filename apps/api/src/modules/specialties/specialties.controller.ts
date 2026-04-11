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
import { SpecialtiesService } from './specialties.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';

@ApiTags('specialties')
@ApiBearerAuth()
@Controller('specialties')
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva especialidad' })
  create(
    @CurrentTenant('id') tenantId: string,
    @Body() dto: CreateSpecialtyDto,
  ) {
    return this.specialtiesService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las especialidades' })
  findAll(
    @CurrentTenant('id') tenantId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.specialtiesService.findAll(tenantId, includeInactive === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una especialidad con servicios y profesionales' })
  findOne(
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.specialtiesService.findById(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una especialidad' })
  update(
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSpecialtyDto,
  ) {
    return this.specialtiesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una especialidad' })
  delete(
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.specialtiesService.delete(tenantId, id);
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reordenar especialidades' })
  reorder(
    @CurrentTenant('id') tenantId: string,
    @Body() body: { specialtyIds: string[] },
  ) {
    return this.specialtiesService.reorder(tenantId, body.specialtyIds);
  }

  // Employee-Specialty management
  @Get(':id/employees')
  @ApiOperation({ summary: 'Obtener profesionales de una especialidad' })
  getEmployees(
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.specialtiesService.getEmployeesBySpecialty(tenantId, id);
  }

  @Put(':id/employees')
  @ApiOperation({ summary: 'Asignar profesionales a una especialidad (bulk)' })
  updateEmployees(
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
    @Body()
    body: {
      employees: {
        employeeId: string;
        seniorityLevel?: string;
        customRate?: number;
      }[];
    },
  ) {
    return this.specialtiesService.updateEmployeeSpecialties(
      tenantId,
      id,
      body.employees,
    );
  }
}
