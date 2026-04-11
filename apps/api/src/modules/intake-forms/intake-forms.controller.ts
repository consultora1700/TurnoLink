import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IntakeFormsService } from './intake-forms.service';
import { CreateIntakeFormDto } from './dto/create-intake-form.dto';
import { UpdateIntakeFormDto } from './dto/update-intake-form.dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@ApiTags('intake-forms')
@ApiBearerAuth()
@Controller('intake-forms')
export class IntakeFormsController {
  constructor(private readonly intakeFormsService: IntakeFormsService) {}

  @Post()
  @ApiOperation({ summary: 'Create intake form' })
  create(@CurrentTenant('id') tenantId: string, @Body() dto: CreateIntakeFormDto) {
    return this.intakeFormsService.create(tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List intake forms' })
  findAll(@CurrentTenant('id') tenantId: string) {
    return this.intakeFormsService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get intake form by id' })
  findById(@CurrentTenant('id') tenantId: string, @Param('id') id: string) {
    return this.intakeFormsService.findById(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update intake form' })
  update(@CurrentTenant('id') tenantId: string, @Param('id') id: string, @Body() dto: UpdateIntakeFormDto) {
    return this.intakeFormsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete intake form' })
  delete(@CurrentTenant('id') tenantId: string, @Param('id') id: string) {
    return this.intakeFormsService.delete(tenantId, id);
  }

  @Get(':id/submissions')
  @ApiOperation({ summary: 'Get submissions for a form' })
  getSubmissions(
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.intakeFormsService.getSubmissions(
      tenantId,
      id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }
}
