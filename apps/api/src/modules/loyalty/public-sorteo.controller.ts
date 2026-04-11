import { Controller, Get, Post, Param, Body, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { SorteoService } from './sorteo.service';
import { RegisterSorteoDto } from './dto/register-sorteo.dto';

@ApiTags('public-sorteos')
@Controller('public/tenants/:slug')
export class PublicSorteoController {
  constructor(
    private readonly sorteoService: SorteoService,
    private readonly prisma: PrismaService,
  ) {}

  private async getTenantId(slug: string): Promise<string> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, status: true },
    });
    if (!tenant || tenant.status !== 'ACTIVE') throw new NotFoundException('Negocio no encontrado');
    return tenant.id;
  }

  @Public()
  @Get('sorteos')
  @ApiOperation({ summary: 'Public active sorteos' })
  async getSorteos(@Param('slug') slug: string) {
    const tenantId = await this.getTenantId(slug);
    return this.sorteoService.getPublicSorteos(tenantId);
  }

  @Public()
  @Post('sorteos/:id/register')
  @ApiOperation({ summary: 'Register for sorteo' })
  async register(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Body() dto: RegisterSorteoDto,
  ) {
    const tenantId = await this.getTenantId(slug);
    return this.sorteoService.registerParticipant(tenantId, id, dto);
  }
}
