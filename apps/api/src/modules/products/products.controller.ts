import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,

  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ProductsService } from './products.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { CreateProductVariantDto, UpdateProductVariantDto } from './dto/create-product-variant.dto';

@ApiTags('products')
@Controller('products')
@ApiBearerAuth()
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  // ============ PRODUCTS ============

  @Post()
  @ApiOperation({ summary: 'Crear producto' })
  async create(@CurrentUser() user: any, @Body() dto: CreateProductDto) {
    const { hasReachedLimit, limit, current } = await this.subscriptionsService.checkLimit(
      user.tenantId,
      'services', // Products share the services limit
    );
    if (hasReachedLimit) {
      throw new ForbiddenException(
        `Límite de ${limit} productos alcanzado (tenés ${current}). Mejorá tu plan para agregar más.`,
      );
    }
    return this.productsService.create(user.tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar productos del tenant' })
  async findAll(
    @CurrentUser() user: any,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.productsService.findAll(user.tenantId, includeInactive === 'true');
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estadísticas de productos' })
  async getStats(@CurrentUser() user: any) {
    return this.productsService.getStats(user.tenantId);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Productos con stock bajo' })
  async getLowStock(@CurrentUser() user: any) {
    return this.productsService.getLowStockProducts(user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de producto' })
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.productsService.findById(user.tenantId, id);
  }

  @Put('reorder')
  @ApiOperation({ summary: 'Reordenar productos' })
  async reorder(@CurrentUser() user: any, @Body() body: { productIds: string[] }) {
    return this.productsService.reorder(user.tenantId, body.productIds);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar producto' })
  async update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar producto' })
  async delete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.productsService.delete(user.tenantId, id);
  }

  // ============ PRODUCT IMAGES ============

  @Post(':id/images')
  @ApiOperation({ summary: 'Agregar imagen a producto' })
  async addImage(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { url: string; alt?: string },
  ) {
    return this.productsService.addImage(user.tenantId, id, body.url, body.alt);
  }

  @Delete(':id/images/:imageId')
  @ApiOperation({ summary: 'Eliminar imagen de producto' })
  async deleteImage(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    return this.productsService.deleteImage(user.tenantId, id, imageId);
  }

  @Put(':id/images/reorder')
  @ApiOperation({ summary: 'Reordenar imágenes de producto' })
  async reorderImages(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { imageIds: string[] },
  ) {
    return this.productsService.reorderImages(user.tenantId, id, body.imageIds);
  }

  @Put(':id/images/:imageId/primary')
  @ApiOperation({ summary: 'Establecer imagen principal' })
  async setPrimaryImage(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    return this.productsService.setPrimaryImage(user.tenantId, id, imageId);
  }

  // ============ PRODUCT VARIANTS ============

  @Post(':id/variants')
  @ApiOperation({ summary: 'Crear variante de producto' })
  async createVariant(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: CreateProductVariantDto,
  ) {
    return this.productsService.createVariant(user.tenantId, id, dto);
  }

  @Put(':id/variants/:variantId')
  @ApiOperation({ summary: 'Actualizar variante' })
  async updateVariant(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateProductVariantDto,
  ) {
    return this.productsService.updateVariant(user.tenantId, id, variantId, dto);
  }

  @Delete(':id/variants/:variantId')
  @ApiOperation({ summary: 'Eliminar variante' })
  async deleteVariant(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('variantId') variantId: string,
  ) {
    return this.productsService.deleteVariant(user.tenantId, id, variantId);
  }

  // ============ STOCK ============

  @Put(':id/stock')
  @ApiOperation({ summary: 'Ajustar stock de producto' })
  async adjustStock(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { adjustment: number; variantId?: string },
  ) {
    return this.productsService.adjustStock(user.tenantId, id, body.adjustment, body.variantId);
  }

  // ============ CATEGORIES ============

  @Post('categories')
  @ApiOperation({ summary: 'Crear categoría de productos' })
  async createCategory(@CurrentUser() user: any, @Body() dto: CreateProductCategoryDto) {
    return this.productsService.createCategory(user.tenantId, dto);
  }

  @Get('categories/all')
  @ApiOperation({ summary: 'Listar categorías de productos' })
  async findAllCategories(@CurrentUser() user: any) {
    return this.productsService.findAllCategories(user.tenantId);
  }

  @Put('categories/:id')
  @ApiOperation({ summary: 'Actualizar categoría' })
  async updateCategory(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: Partial<CreateProductCategoryDto>,
  ) {
    return this.productsService.updateCategory(user.tenantId, id, dto);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Eliminar categoría' })
  async deleteCategory(@CurrentUser() user: any, @Param('id') id: string) {
    return this.productsService.deleteCategory(user.tenantId, id);
  }

  @Put('categories/reorder')
  @ApiOperation({ summary: 'Reordenar categorías' })
  async reorderCategories(@CurrentUser() user: any, @Body() body: { categoryIds: string[] }) {
    return this.productsService.reorderCategories(user.tenantId, body.categoryIds);
  }
}
