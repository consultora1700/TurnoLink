import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { ProfessionalProfilesService } from './professional-profiles.service';
import { AcceptConsentDto } from './dto/accept-consent.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { RequestAccessDto } from './dto/request-access.dto';
import { RespondProposalDto } from './dto/respond-proposal.dto';
import { Request } from 'express';

@ApiTags('public - professional profiles')
@Controller('public/professional-profile')
export class PublicProfessionalProfilesController {
  constructor(
    private readonly profilesService: ProfessionalProfilesService,
  ) {}

  @Public()
  @Get(':token')
  @ApiOperation({ summary: 'Validar token y obtener datos del empleado + perfil' })
  async validateToken(@Param('token') token: string) {
    return this.profilesService.validateToken(token);
  }

  @Public()
  @Post(':token/consent')
  @HttpCode(200)
  @ApiOperation({ summary: 'Aceptar consentimiento y crear perfil' })
  async acceptConsent(
    @Param('token') token: string,
    @Body() dto: AcceptConsentDto,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
    return this.profilesService.acceptConsent(token, ip, dto.openToWork);
  }

  @Public()
  @Put(':token')
  @ApiOperation({ summary: 'Actualizar perfil profesional' })
  async updateProfile(
    @Param('token') token: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profilesService.updateProfile(token, dto);
  }

  @Public()
  @Post(':token/experience')
  @ApiOperation({ summary: 'Agregar experiencia laboral' })
  async addExperience(
    @Param('token') token: string,
    @Body() dto: CreateExperienceDto,
  ) {
    return this.profilesService.addExperience(token, dto);
  }

  @Public()
  @Put(':token/experience/:id')
  @ApiOperation({ summary: 'Editar experiencia laboral' })
  async updateExperience(
    @Param('token') token: string,
    @Param('id') id: string,
    @Body() dto: CreateExperienceDto,
  ) {
    return this.profilesService.updateExperience(token, id, dto);
  }

  @Public()
  @Delete(':token/experience/:id')
  @ApiOperation({ summary: 'Eliminar experiencia laboral' })
  async deleteExperience(
    @Param('token') token: string,
    @Param('id') id: string,
  ) {
    return this.profilesService.deleteExperience(token, id);
  }

  @Public()
  @Post('request-access')
  @HttpCode(200)
  @Throttle({ short: { ttl: 60000, limit: 3 } })
  @ApiOperation({ summary: 'Solicitar nuevo token de acceso por email' })
  async requestAccess(@Body() dto: RequestAccessDto) {
    return this.profilesService.requestNewToken(dto.email);
  }

  @Public()
  @Delete(':token')
  @ApiOperation({ summary: 'GDPR: Eliminar perfil y todos los datos' })
  async deleteProfile(@Param('token') token: string) {
    return this.profilesService.deleteProfile(token);
  }

  // ============ PROPOSALS (Fase 4) ============

  @Public()
  @Get(':token/proposals')
  @ApiOperation({ summary: 'Ver propuestas recibidas' })
  async getProposalsReceived(@Param('token') token: string) {
    return this.profilesService.getProposalsReceived(token);
  }

  @Public()
  @Put(':token/proposals/:id/respond')
  @ApiOperation({ summary: 'Aceptar o rechazar una propuesta' })
  async respondProposal(
    @Param('token') token: string,
    @Param('id') proposalId: string,
    @Body() dto: RespondProposalDto,
  ) {
    return this.profilesService.respondProposal(token, proposalId, dto);
  }

  @Public()
  @Put(':token/proposals/:id/viewed')
  @ApiOperation({ summary: 'Marcar propuesta como vista' })
  async markProposalViewed(
    @Param('token') token: string,
    @Param('id') proposalId: string,
  ) {
    return this.profilesService.markProposalViewed(token, proposalId);
  }
}
