import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,

  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { JobPostingsService } from './job-postings.service';
import { CreateJobPostingDto } from './dto/create-job-posting.dto';
import { UpdateJobPostingDto } from './dto/update-job-posting.dto';
import { RespondJobApplicationDto } from './dto/respond-job-application.dto';

@ApiTags('job-postings - business')
@ApiBearerAuth()
@Controller('job-postings')
export class JobPostingsBusinessController {
  constructor(private readonly jobPostingsService: JobPostingsService) {}

  private ensureBusiness(req: any) {
    const type = req.user?.tenantType;
    if (type !== 'BUSINESS' && type !== 'TALENT_SEEKER') {
      throw new ForbiddenException('Solo comercios pueden gestionar ofertas laborales');
    }
  }

  @Post()
  @ApiOperation({ summary: 'Crear oferta laboral' })
  async createPosting(
    @Req() req: any,
    @CurrentTenant('id') tenantId: string,
    @Body() dto: CreateJobPostingDto,
  ) {
    this.ensureBusiness(req);
    return this.jobPostingsService.createPosting(tenantId, req.user.id, dto);
  }

  @Get('my-postings')
  @ApiOperation({ summary: 'Listar mis ofertas laborales' })
  async getMyPostings(
    @Req() req: any,
    @CurrentTenant('id') tenantId: string,
  ) {
    this.ensureBusiness(req);
    return this.jobPostingsService.getMyPostings(tenantId);
  }

  @Get('my-postings/:id')
  @ApiOperation({ summary: 'Detalle de una oferta + estadísticas' })
  async getMyPosting(
    @Req() req: any,
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
  ) {
    this.ensureBusiness(req);
    return this.jobPostingsService.getMyPosting(tenantId, id);
  }

  @Put('my-postings/:id')
  @ApiOperation({ summary: 'Actualizar oferta laboral' })
  async updatePosting(
    @Req() req: any,
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateJobPostingDto,
  ) {
    this.ensureBusiness(req);
    return this.jobPostingsService.updatePosting(tenantId, id, dto);
  }

  @Delete('my-postings/:id')
  @ApiOperation({ summary: 'Cerrar oferta laboral' })
  async deletePosting(
    @Req() req: any,
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
  ) {
    this.ensureBusiness(req);
    return this.jobPostingsService.deletePosting(tenantId, id);
  }

  @Get('my-postings/:id/applications')
  @ApiOperation({ summary: 'Listar postulaciones de una oferta' })
  async getApplications(
    @Req() req: any,
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
  ) {
    this.ensureBusiness(req);
    return this.jobPostingsService.getApplications(tenantId, id);
  }

  @Post('my-postings/:id/applications/:appId/respond')
  @ApiOperation({ summary: 'Aceptar o rechazar postulante' })
  async respondToApplication(
    @Req() req: any,
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
    @Param('appId') appId: string,
    @Body() dto: RespondJobApplicationDto,
  ) {
    this.ensureBusiness(req);
    return this.jobPostingsService.respondToApplication(tenantId, id, appId, dto);
  }

  @Post('my-postings/:id/applications/:appId/viewed')
  @ApiOperation({ summary: 'Marcar postulación como vista' })
  async markViewed(
    @Req() req: any,
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
    @Param('appId') appId: string,
  ) {
    this.ensureBusiness(req);
    return this.jobPostingsService.markApplicationViewed(tenantId, id, appId);
  }
}
