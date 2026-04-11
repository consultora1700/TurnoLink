import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { BrandingService } from './branding.service';
import { UpdateBrandingDto } from './dto/update-branding.dto';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('branding')
@Controller()
export class BrandingController {
  constructor(
    private readonly brandingService: BrandingService,
    private readonly prisma: PrismaService,
  ) {}

  // ============ AUTHENTICATED ============

  @Get('branding')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener branding del tenant' })
  async getBranding(@CurrentUser() user: any) {
    return this.brandingService.findByTenantId(user.tenantId);
  }

  @Put('branding')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar branding del tenant' })
  async updateBranding(@CurrentUser() user: any, @Body() dto: UpdateBrandingDto) {
    // Get plan features to gate SEO-only fields
    const sub = await this.prisma.subscription.findFirst({
      where: { tenantId: user.tenantId, status: { in: ['active', 'trialing', 'ACTIVE', 'TRIALING'] } },
      include: { plan: { select: { features: true } } },
    });
    const features = Array.isArray(sub?.plan?.features) ? sub.plan.features as string[] : [];
    return this.brandingService.update(user.tenantId, dto, features);
  }

  // ============ PUBLIC ============

  @Public()
  @Get('public/tenants/:slug/branding')
  @ApiOperation({ summary: 'Branding público del tenant' })
  async getPublicBranding(@Param('slug') slug: string) {
    return this.brandingService.findPublicBySlug(slug);
  }
}
