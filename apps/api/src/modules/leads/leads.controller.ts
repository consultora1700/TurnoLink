import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireAnyFeature } from '../../common/decorators/require-feature.decorator';
import { LeadsService } from './leads.service';
import { CreateLeadDto, CreatePropertyDepositDto, CreateGuaranteeRecordDto } from './dto';

class UpdateLeadDto extends PartialType(CreateLeadDto) {}
class UpdatePropertyDepositDto extends PartialType(CreatePropertyDepositDto) {}
class UpdateGuaranteeRecordDto extends PartialType(CreateGuaranteeRecordDto) {}

@ApiTags('leads')
@ApiBearerAuth()
@RequireAnyFeature('rental_management')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  // ============ LEAD STATS ============

  @Get('stats')
  @ApiOperation({ summary: 'Lead pipeline stats' })
  getStats(@CurrentUser() user: any) {
    return this.leadsService.getLeadStats(user.tenantId);
  }

  // ============ LEADS CRUD ============

  @Get()
  @ApiOperation({ summary: 'Listar leads' })
  findAll(
    @CurrentUser() user: any,
    @Query('stage') stage?: string,
    @Query('source') source?: string,
    @Query('assignedTo') assignedTo?: string,
  ) {
    return this.leadsService.findAllLeads(user.tenantId, { stage, source, assignedTo });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de lead' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.leadsService.findLeadById(user.tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear lead' })
  create(@CurrentUser() user: any, @Body() dto: CreateLeadDto) {
    return this.leadsService.createLead(user.tenantId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar lead' })
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leadsService.updateLead(user.tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar lead' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.leadsService.deleteLead(user.tenantId, id);
  }

  // ============ PROPERTY DEPOSITS / SEÑAS ============

  @Get('deposits/all')
  @ApiOperation({ summary: 'Listar señas' })
  findAllDeposits(@CurrentUser() user: any, @Query('status') status?: string) {
    return this.leadsService.findAllDeposits(user.tenantId, status);
  }

  @Get('deposits/:id')
  @ApiOperation({ summary: 'Detalle de seña' })
  findDeposit(@CurrentUser() user: any, @Param('id') id: string) {
    return this.leadsService.findDepositById(user.tenantId, id);
  }

  @Post('deposits')
  @ApiOperation({ summary: 'Crear seña' })
  createDeposit(@CurrentUser() user: any, @Body() dto: CreatePropertyDepositDto) {
    return this.leadsService.createDeposit(user.tenantId, dto);
  }

  @Put('deposits/:id')
  @ApiOperation({ summary: 'Actualizar seña' })
  updateDeposit(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdatePropertyDepositDto) {
    return this.leadsService.updateDeposit(user.tenantId, id, dto);
  }

  @Delete('deposits/:id')
  @ApiOperation({ summary: 'Eliminar seña' })
  removeDeposit(@CurrentUser() user: any, @Param('id') id: string) {
    return this.leadsService.deleteDeposit(user.tenantId, id);
  }

  // ============ GUARANTEE RECORDS ============

  @Get('guarantees/all')
  @ApiOperation({ summary: 'Listar garantías' })
  findAllGuarantees(@CurrentUser() user: any, @Query('status') status?: string) {
    return this.leadsService.findAllGuarantees(user.tenantId, status);
  }

  @Get('guarantees/expiring')
  @ApiOperation({ summary: 'Garantías próximas a vencer' })
  getExpiringGuarantees(@CurrentUser() user: any, @Query('days') days?: string) {
    return this.leadsService.getExpiringGuarantees(user.tenantId, days ? parseInt(days) : 30);
  }

  @Get('guarantees/contract/:contractId')
  @ApiOperation({ summary: 'Garantías de un contrato' })
  findGuaranteesByContract(@CurrentUser() user: any, @Param('contractId') contractId: string) {
    return this.leadsService.findGuaranteesByContract(user.tenantId, contractId);
  }

  @Get('guarantees/:id')
  @ApiOperation({ summary: 'Detalle de garantía' })
  findGuarantee(@CurrentUser() user: any, @Param('id') id: string) {
    return this.leadsService.findGuaranteeById(user.tenantId, id);
  }

  @Post('guarantees')
  @ApiOperation({ summary: 'Crear garantía' })
  createGuarantee(@CurrentUser() user: any, @Body() dto: CreateGuaranteeRecordDto) {
    return this.leadsService.createGuarantee(user.tenantId, dto);
  }

  @Put('guarantees/:id')
  @ApiOperation({ summary: 'Actualizar garantía' })
  updateGuarantee(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateGuaranteeRecordDto) {
    return this.leadsService.updateGuarantee(user.tenantId, id, dto);
  }

  @Delete('guarantees/:id')
  @ApiOperation({ summary: 'Eliminar garantía' })
  removeGuarantee(@CurrentUser() user: any, @Param('id') id: string) {
    return this.leadsService.deleteGuarantee(user.tenantId, id);
  }
}
