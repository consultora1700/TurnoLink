import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { ProfessionalProfilesService } from './professional-profiles.service';
import { BrowseProfilesDto } from './dto/browse-profiles.dto';

@ApiTags('public - talent')
@Controller('public/talent')
export class PublicBrowseProfilesController {
  constructor(
    private readonly profilesService: ProfessionalProfilesService,
  ) {}

  @Public()
  @Get()
  @Throttle({ short: { ttl: 1000, limit: 5 }, medium: { ttl: 10000, limit: 30 } })
  @ApiOperation({ summary: 'Explorar perfiles profesionales (público)' })
  async browsePublicProfiles(@Query() filters: BrowseProfilesDto) {
    return this.profilesService.browsePublicProfiles(filters);
  }

  @Public()
  @Get(':id')
  @Throttle({ short: { ttl: 1000, limit: 5 }, medium: { ttl: 10000, limit: 30 } })
  @ApiOperation({ summary: 'Ver detalle teaser de un perfil profesional (público)' })
  async getPublicProfileDetail(@Param('id') id: string) {
    return this.profilesService.getPublicProfileDetail(id);
  }
}
