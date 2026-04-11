import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Req,

  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JobPostingsService } from './job-postings.service';
import { BrowseJobPostingsDto } from './dto/browse-job-postings.dto';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';

@ApiTags('job-postings - professional')
@ApiBearerAuth()
@Controller('job-postings')
export class JobPostingsProfessionalController {
  constructor(private readonly jobPostingsService: JobPostingsService) {}

  private ensureProfessional(req: any) {
    if (req.user?.tenantType !== 'PROFESSIONAL') {
      throw new ForbiddenException('Solo profesionales pueden acceder a este recurso');
    }
  }

  @Get('browse')
  @ApiOperation({ summary: 'Explorar ofertas laborales abiertas' })
  async browsePostings(
    @Req() req: any,
    @Query() filters: BrowseJobPostingsDto,
  ) {
    this.ensureProfessional(req);
    return this.jobPostingsService.browsePostings(req.user.id, filters);
  }

  @Get('browse/:id')
  @ApiOperation({ summary: 'Detalle de una oferta laboral' })
  async getPostingDetail(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    this.ensureProfessional(req);
    return this.jobPostingsService.getPostingDetail(req.user.id, id);
  }

  @Post('browse/:id/apply')
  @ApiOperation({ summary: 'Postularse a una oferta' })
  async applyToPosting(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: CreateJobApplicationDto,
  ) {
    this.ensureProfessional(req);
    return this.jobPostingsService.applyToPosting(req.user.id, id, dto);
  }

  @Get('my-applications')
  @ApiOperation({ summary: 'Mis postulaciones' })
  async getMyApplications(@Req() req: any) {
    this.ensureProfessional(req);
    return this.jobPostingsService.getMyApplications(req.user.id);
  }

  @Post('my-applications/:id/withdraw')
  @ApiOperation({ summary: 'Retirar postulación' })
  async withdrawApplication(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    this.ensureProfessional(req);
    return this.jobPostingsService.withdrawApplication(req.user.id, id);
  }
}
