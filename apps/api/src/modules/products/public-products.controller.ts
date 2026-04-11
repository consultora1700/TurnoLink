import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductsService } from './products.service';

@ApiTags('public-products')
@Controller('public/tenants/:slug')
export class PublicProductsController {
  constructor(
    private readonly productsService: ProductsService,
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
  @Get('products')
  @ApiOperation({ summary: 'Catálogo público de productos' })
  async getProducts(
    @Param('slug') slug: string,
    @Query('category') categorySlug?: string,
  ) {
    const tenantId = await this.getTenantId(slug);
    return this.productsService.findPublicProducts(tenantId, categorySlug);
  }

  @Public()
  @Get('products/:productSlug')
  @ApiOperation({ summary: 'Detalle público de producto' })
  async getProduct(
    @Param('slug') slug: string,
    @Param('productSlug') productSlug: string,
  ) {
    const tenantId = await this.getTenantId(slug);
    return this.productsService.findPublicProductBySlug(tenantId, productSlug);
  }

  @Public()
  @Get('product-categories')
  @ApiOperation({ summary: 'Categorías públicas de productos' })
  async getCategories(@Param('slug') slug: string) {
    const tenantId = await this.getTenantId(slug);
    return this.productsService.findPublicCategories(tenantId);
  }
}
