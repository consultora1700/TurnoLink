import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RequireAnyFeature } from '../../common/decorators/require-feature.decorator';
import { DevelopmentsService } from './developments.service';
import {
  CreateDevelopmentProjectDto,
  CreateMilestoneDto,
  CreateUnitDto,
  CreateInvestmentDto,
  MarkInvestmentPaymentDto,
  CreateReservationDto,
  CreatePaymentPlanDto,
  UpdatePaymentPlanDto,
  CreateDocumentDto,
} from './dto';
import { PartialType } from '@nestjs/swagger';

class UpdateProjectDto extends PartialType(CreateDevelopmentProjectDto) {}
class UpdateMilestoneDto extends PartialType(CreateMilestoneDto) {}
class UpdateUnitDto extends PartialType(CreateUnitDto) {}

@ApiTags('developments')
@ApiBearerAuth()
@RequireAnyFeature('development_projects')
@Controller('developments')
export class DevelopmentsController {
  constructor(private readonly developmentsService: DevelopmentsService) {}

  // ============ PROJECTS ============

  @Get('projects')
  @ApiOperation({ summary: 'Listar proyectos de desarrollo' })
  findAllProjects(@CurrentUser() user: any) {
    return this.developmentsService.findAllProjects(user.tenantId);
  }

  @Get('projects/:id')
  @ApiOperation({ summary: 'Detalle de proyecto' })
  findProject(@CurrentUser() user: any, @Param('id') id: string) {
    return this.developmentsService.findProjectById(user.tenantId, id);
  }

  @Post('projects')
  @ApiOperation({ summary: 'Crear proyecto' })
  createProject(@CurrentUser() user: any, @Body() dto: CreateDevelopmentProjectDto) {
    return this.developmentsService.createProject(user.tenantId, dto);
  }

  @Put('projects/:id')
  @ApiOperation({ summary: 'Actualizar proyecto' })
  updateProject(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.developmentsService.updateProject(user.tenantId, id, dto);
  }

  @Delete('projects/:id')
  @ApiOperation({ summary: 'Eliminar proyecto' })
  deleteProject(@CurrentUser() user: any, @Param('id') id: string) {
    return this.developmentsService.deleteProject(user.tenantId, id);
  }

  // ============ MILESTONES ============

  @Post('projects/:projectId/milestones')
  @ApiOperation({ summary: 'Crear hito de proyecto' })
  createMilestone(@CurrentUser() user: any, @Param('projectId') projectId: string, @Body() dto: CreateMilestoneDto) {
    return this.developmentsService.createMilestone(user.tenantId, projectId, dto);
  }

  @Put('projects/:projectId/milestones/:milestoneId')
  @ApiOperation({ summary: 'Actualizar hito' })
  updateMilestone(@CurrentUser() user: any, @Param('projectId') projectId: string, @Param('milestoneId') milestoneId: string, @Body() dto: UpdateMilestoneDto) {
    return this.developmentsService.updateMilestone(user.tenantId, projectId, milestoneId, dto);
  }

  @Delete('projects/:projectId/milestones/:milestoneId')
  @ApiOperation({ summary: 'Eliminar hito' })
  deleteMilestone(@CurrentUser() user: any, @Param('projectId') projectId: string, @Param('milestoneId') milestoneId: string) {
    return this.developmentsService.deleteMilestone(user.tenantId, projectId, milestoneId);
  }

  // ============ UNITS ============

  @Post('projects/:projectId/units')
  @ApiOperation({ summary: 'Crear unidad' })
  createUnit(@CurrentUser() user: any, @Param('projectId') projectId: string, @Body() dto: CreateUnitDto) {
    return this.developmentsService.createUnit(user.tenantId, projectId, dto);
  }

  @Put('projects/:projectId/units/:unitId')
  @ApiOperation({ summary: 'Actualizar unidad' })
  updateUnit(@CurrentUser() user: any, @Param('projectId') projectId: string, @Param('unitId') unitId: string, @Body() dto: UpdateUnitDto) {
    return this.developmentsService.updateUnit(user.tenantId, projectId, unitId, dto);
  }

  @Delete('projects/:projectId/units/:unitId')
  @ApiOperation({ summary: 'Eliminar unidad' })
  deleteUnit(@CurrentUser() user: any, @Param('projectId') projectId: string, @Param('unitId') unitId: string) {
    return this.developmentsService.deleteUnit(user.tenantId, projectId, unitId);
  }

  // ============ RESERVATIONS ============

  @Post('projects/:projectId/units/:unitId/reserve')
  @ApiOperation({ summary: 'Reservar unidad' })
  reserveUnit(@CurrentUser() user: any, @Param('projectId') projectId: string, @Param('unitId') unitId: string, @Body() dto: CreateReservationDto) {
    return this.developmentsService.reserveUnit(user.tenantId, projectId, unitId, dto);
  }

  @Delete('projects/:projectId/units/:unitId/reserve')
  @ApiOperation({ summary: 'Cancelar reserva de unidad' })
  cancelReservation(@CurrentUser() user: any, @Param('projectId') projectId: string, @Param('unitId') unitId: string) {
    return this.developmentsService.cancelReservation(user.tenantId, projectId, unitId);
  }

  // ============ INVESTMENTS ============

  @Post('projects/:projectId/investments')
  @ApiOperation({ summary: 'Crear inversión' })
  createInvestment(@CurrentUser() user: any, @Param('projectId') projectId: string, @Body() dto: CreateInvestmentDto) {
    return this.developmentsService.createInvestment(user.tenantId, projectId, dto);
  }

  @Post('projects/:projectId/investments/payments/:paymentId/mark')
  @ApiOperation({ summary: 'Marcar pago de inversión como cobrado' })
  markPayment(@CurrentUser() user: any, @Param('projectId') projectId: string, @Param('paymentId') paymentId: string, @Body() dto: MarkInvestmentPaymentDto) {
    return this.developmentsService.markInvestmentPayment(user.tenantId, projectId, paymentId, dto);
  }

  // ============ PAYMENT PLANS ============

  @Get('projects/:projectId/payment-plans')
  @ApiOperation({ summary: 'Listar planes de pago' })
  findPaymentPlans(@CurrentUser() user: any, @Param('projectId') projectId: string) {
    return this.developmentsService.findPaymentPlans(user.tenantId, projectId);
  }

  @Post('projects/:projectId/payment-plans')
  @ApiOperation({ summary: 'Crear plan de pago' })
  createPaymentPlan(@CurrentUser() user: any, @Param('projectId') projectId: string, @Body() dto: CreatePaymentPlanDto) {
    return this.developmentsService.createPaymentPlan(user.tenantId, projectId, dto);
  }

  @Put('projects/:projectId/payment-plans/:planId')
  @ApiOperation({ summary: 'Actualizar plan de pago' })
  updatePaymentPlan(@CurrentUser() user: any, @Param('projectId') projectId: string, @Param('planId') planId: string, @Body() dto: UpdatePaymentPlanDto) {
    return this.developmentsService.updatePaymentPlan(user.tenantId, projectId, planId, dto);
  }

  @Delete('projects/:projectId/payment-plans/:planId')
  @ApiOperation({ summary: 'Eliminar plan de pago' })
  deletePaymentPlan(@CurrentUser() user: any, @Param('projectId') projectId: string, @Param('planId') planId: string) {
    return this.developmentsService.deletePaymentPlan(user.tenantId, projectId, planId);
  }

  // ============ DOCUMENTS ============

  @Get('projects/:projectId/documents')
  @ApiOperation({ summary: 'Listar documentos del proyecto' })
  findDocuments(
    @CurrentUser() user: any,
    @Param('projectId') projectId: string,
    @Query('unitId') unitId?: string,
    @Query('investmentId') investmentId?: string,
  ) {
    return this.developmentsService.findDocuments(user.tenantId, projectId, unitId, investmentId);
  }

  @Post('projects/:projectId/documents')
  @ApiOperation({ summary: 'Crear documento' })
  createDocument(@CurrentUser() user: any, @Param('projectId') projectId: string, @Body() dto: CreateDocumentDto) {
    return this.developmentsService.createDocument(user.tenantId, projectId, dto);
  }

  @Delete('projects/:projectId/documents/:documentId')
  @ApiOperation({ summary: 'Eliminar documento' })
  deleteDocument(@CurrentUser() user: any, @Param('projectId') projectId: string, @Param('documentId') documentId: string) {
    return this.developmentsService.deleteDocument(user.tenantId, projectId, documentId);
  }
}

// ============ PUBLIC CONTROLLER ============

@ApiTags('developments-public')
@Controller()
export class PublicDevelopmentsController {
  constructor(private readonly developmentsService: DevelopmentsService) {}

  @Public()
  @Get('public/tenants/:slug/developments')
  @ApiOperation({ summary: 'Proyectos públicos de un tenant' })
  findPublicProjects(@Param('slug') slug: string) {
    return this.developmentsService.findPublicProjects(slug);
  }

  @Public()
  @Get('public/tenants/:slug/developments/:projectSlug')
  @ApiOperation({ summary: 'Detalle público de proyecto' })
  findPublicProject(@Param('slug') slug: string, @Param('projectSlug') projectSlug: string) {
    return this.developmentsService.findPublicProject(slug, projectSlug);
  }

  @Public()
  @Get('public/tenants/:slug/developments/:projectSlug/payment-plans')
  @ApiOperation({ summary: 'Planes de pago públicos de un proyecto' })
  findPublicPaymentPlans(@Param('slug') slug: string, @Param('projectSlug') projectSlug: string) {
    return this.developmentsService.findPublicPaymentPlans(slug, projectSlug);
  }
}
