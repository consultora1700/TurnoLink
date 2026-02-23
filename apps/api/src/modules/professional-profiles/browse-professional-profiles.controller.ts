import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ProfessionalProfilesService } from './professional-profiles.service';
import { BrowseProfilesDto } from './dto/browse-profiles.dto';
import { CreateProposalDto } from './dto/create-proposal.dto';

@ApiTags('professional-profiles - browse')
@ApiBearerAuth()
@Controller('professional-profiles')
@UseGuards(JwtAuthGuard, TenantGuard)
export class BrowseProfessionalProfilesController {
  constructor(
    private readonly profilesService: ProfessionalProfilesService,
  ) {}

  @Get('browse')
  @ApiOperation({ summary: 'Explorar perfiles profesionales visibles' })
  async browseProfiles(
    @CurrentTenant('id') tenantId: string,
    @Query() filters: BrowseProfilesDto,
  ) {
    return this.profilesService.browseProfiles(tenantId, filters);
  }

  @Get('browse/:id')
  @ApiOperation({ summary: 'Ver detalle de un perfil profesional' })
  async getProfile(
    @CurrentTenant('id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.profilesService.getPublicProfile(id, tenantId);
  }

  @Post('browse/:id/proposal')
  @ApiOperation({ summary: 'Enviar propuesta a un profesional' })
  async sendProposal(
    @CurrentTenant('id') tenantId: string,
    @Param('id') profileId: string,
    @Body() dto: CreateProposalDto,
  ) {
    return this.profilesService.sendProposal(tenantId, profileId, dto);
  }

  @Get('proposals/sent')
  @ApiOperation({ summary: 'Ver propuestas enviadas por mi negocio' })
  async getProposalsSent(
    @CurrentTenant('id') tenantId: string,
  ) {
    return this.profilesService.getProposalsSent(tenantId);
  }
}
