import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('public')
@Controller('public/tenants')
export class PublicTenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get public tenant info by slug' })
  async getBySlug(@Param('slug') slug: string) {
    return this.tenantsService.findBySlugPublic(slug);
  }
}
