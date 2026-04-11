import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequireAnyFeature } from '../../common/decorators/require-feature.decorator';
import { DocumentsService } from './documents.service';
import { CreateDocumentTemplateDto, RenderDocumentDto } from './dto/create-document-template.dto';

class UpdateDocumentTemplateDto extends PartialType(CreateDocumentTemplateDto) {}

@ApiTags('documents')
@ApiBearerAuth()
@RequireAnyFeature('rental_management')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  // ============ TEMPLATES ============

  @Get('templates')
  @ApiOperation({ summary: 'Listar plantillas de documentos' })
  findAll(@CurrentUser() user: any, @Query('category') category?: string) {
    return this.documentsService.findAllTemplates(user.tenantId, category);
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Detalle de plantilla' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.documentsService.findTemplateById(user.tenantId, id);
  }

  @Post('templates')
  @ApiOperation({ summary: 'Crear plantilla' })
  create(@CurrentUser() user: any, @Body() dto: CreateDocumentTemplateDto) {
    return this.documentsService.createTemplate(user.tenantId, dto);
  }

  @Put('templates/:id')
  @ApiOperation({ summary: 'Actualizar plantilla' })
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateDocumentTemplateDto) {
    return this.documentsService.updateTemplate(user.tenantId, id, dto);
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Eliminar plantilla' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.documentsService.deleteTemplate(user.tenantId, id);
  }

  // ============ RENDER ============

  @Post('templates/:id/render')
  @ApiOperation({ summary: 'Generar documento desde plantilla' })
  render(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: RenderDocumentDto) {
    return this.documentsService.renderDocument(user.tenantId, id, dto);
  }

  // ============ VARIABLE DEFINITIONS ============

  @Get('variables/:category')
  @ApiOperation({ summary: 'Variables disponibles por categoría' })
  getVariables(@Param('category') category: string) {
    return this.documentsService.getVariableDefinitions(category);
  }
}
