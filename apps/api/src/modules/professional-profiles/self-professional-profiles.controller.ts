import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { ProfessionalProfilesService } from './professional-profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { RespondProposalDto } from './dto/respond-proposal.dto';

/**
 * Controller for PROFESSIONAL tenant type users to manage their own profile.
 * Uses JWT auth + tenant guard, then verifies tenantType === 'PROFESSIONAL'.
 */
@ApiTags('professional-profiles - self')
@ApiBearerAuth()
@Controller('professional-profiles/my-profile')
@UseGuards(JwtAuthGuard, TenantGuard)
export class SelfProfessionalProfilesController {
  constructor(
    private readonly profilesService: ProfessionalProfilesService,
  ) {}

  private ensureProfessional(req: any) {
    if (req.user?.tenantType !== 'PROFESSIONAL') {
      throw new ForbiddenException('Solo usuarios PROFESSIONAL pueden acceder a este recurso');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener mi perfil profesional' })
  async getMyProfile(@Req() req: any) {
    this.ensureProfessional(req);
    return this.profilesService.getMyProfile(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear mi perfil profesional (primera vez)' })
  async createMyProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    this.ensureProfessional(req);
    return this.profilesService.createMyProfile(req.user.id, req.user.email, req.user.name, dto);
  }

  @Put()
  @ApiOperation({ summary: 'Actualizar mi perfil profesional' })
  async updateMyProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    this.ensureProfessional(req);
    return this.profilesService.updateMyProfile(req.user.id, dto);
  }

  @Post('experience')
  @ApiOperation({ summary: 'Agregar experiencia laboral' })
  async addExperienceToMyProfile(@Req() req: any, @Body() dto: CreateExperienceDto) {
    this.ensureProfessional(req);
    return this.profilesService.addExperienceToMyProfile(req.user.id, dto);
  }

  @Put('experience/:id')
  @ApiOperation({ summary: 'Editar experiencia laboral' })
  async updateExperienceOnMyProfile(
    @Req() req: any,
    @Param('id') experienceId: string,
    @Body() dto: CreateExperienceDto,
  ) {
    this.ensureProfessional(req);
    return this.profilesService.updateExperienceOnMyProfile(req.user.id, experienceId, dto);
  }

  @Delete('experience/:id')
  @ApiOperation({ summary: 'Eliminar experiencia laboral' })
  async deleteExperienceFromMyProfile(
    @Req() req: any,
    @Param('id') experienceId: string,
  ) {
    this.ensureProfessional(req);
    return this.profilesService.deleteExperienceFromMyProfile(req.user.id, experienceId);
  }

  @Get('proposals')
  @ApiOperation({ summary: 'Ver propuestas recibidas' })
  async getMyProposals(@Req() req: any) {
    this.ensureProfessional(req);
    return this.profilesService.getMyProposals(req.user.id);
  }

  @Post('proposals/:id/respond')
  @ApiOperation({ summary: 'Responder a una propuesta' })
  async respondToProposal(
    @Req() req: any,
    @Param('id') proposalId: string,
    @Body() dto: RespondProposalDto,
  ) {
    this.ensureProfessional(req);
    return this.profilesService.respondToMyProposal(req.user.id, proposalId, dto);
  }
}
