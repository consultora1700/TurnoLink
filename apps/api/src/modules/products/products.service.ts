import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { CreateProductVariantDto, UpdateProductVariantDto } from './dto/create-product-variant.dto';
import { CacheService } from '../../common/cache';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  /** Invalidate public product cache for a tenant. Safe if Redis is down. */
  private invalidateProductsCache(tenantId: string): void {
    this.cacheService.invalidatePublicProducts(tenantId).catch((err) => {
      this.logger.warn(`Redis invalidation failed for products:${tenantId}: ${err.message}`);
    });
  }

  // ============ HELPERS ============

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private async ensureUniqueSlug(tenantId: string, baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 0;
    while (true) {
      const existing = await this.prisma.product.findUnique({
        where: { tenantId_slug: { tenantId, slug } },
      });
      if (!existing || existing.id === excludeId) return slug;
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
  }

  private async ensureUniqueCategorySlug(tenantId: string, baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 0;
    while (true) {
      const existing = await this.prisma.productCategory.findUnique({
        where: { tenantId_slug: { tenantId, slug } },
      });
      if (!existing || existing.id === excludeId) return slug;
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
  }

  private serializeProduct(product: any) {
    // Ensure attributes is always an array (or null), even if stored as JSON string
    let attributes = product.attributes;
    if (typeof attributes === 'string') {
      try { attributes = JSON.parse(attributes); } catch { attributes = null; }
    }

    return {
      ...product,
      price: product.price ? Number(product.price) : 0,
      priceDelivery: product.priceDelivery ? Number(product.priceDelivery) : null,
      priceTakeaway: product.priceTakeaway ? Number(product.priceTakeaway) : null,
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      costPrice: product.costPrice ? Number(product.costPrice) : null,
      attributes,
      variants: product.variants?.map((v: any) => ({
        ...v,
        price: v.price ? Number(v.price) : null,
      })),
    };
  }

  // ============ PRODUCTS ============

  async create(tenantId: string, dto: CreateProductDto) {
    const slug = await this.ensureUniqueSlug(tenantId, this.generateSlug(dto.name));

    const maxOrder = await this.prisma.product.aggregate({
      where: { tenantId },
      _max: { order: true },
    });

    const product = await this.prisma.product.create({
      data: {
        tenantId,
        name: dto.name,
        slug,
        description: dto.description,
        shortDescription: dto.shortDescription,
        price: dto.price,
        priceDelivery: dto.priceDelivery ?? null,
        priceTakeaway: dto.priceTakeaway ?? null,
        compareAtPrice: dto.compareAtPrice,
        costPrice: dto.costPrice,
        currency: dto.currency || null,
        sku: dto.sku,
        stock: dto.stock ?? 0,
        lowStockThreshold: dto.lowStockThreshold ?? 5,
        trackInventory: dto.trackInventory ?? true,
        type: dto.type ?? 'PHYSICAL',
        digitalFileUrl: dto.digitalFileUrl,
        attributes: dto.attributes ? (dto.attributes as any) : undefined,
        categoryId: dto.categoryId || null,
        isActive: dto.isActive ?? true,
        isFeatured: dto.isFeatured ?? false,
        order: (maxOrder._max.order || 0) + 1,
      },
      include: { category: true, images: { orderBy: { order: 'asc' } }, variants: true },
    });

    this.invalidateProductsCache(tenantId);
    return this.serializeProduct(product);
  }

  async findAll(tenantId: string, includeInactive = false) {
    const where: any = { tenantId };
    if (!includeInactive) where.isActive = true;

    const products = await this.prisma.product.findMany({
      where,
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        variants: { orderBy: { createdAt: 'asc' } },
        _count: { select: { orderItems: true, cartItems: true } },
      },
      orderBy: { order: 'asc' },
    });

    return products.map(p => this.serializeProduct(p));
  }

  async findById(tenantId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        variants: { orderBy: { createdAt: 'asc' } },
        _count: { select: { orderItems: true, cartItems: true, wishlistItems: true } },
      },
    });

    if (!product) throw new NotFoundException('Producto no encontrado');
    return this.serializeProduct(product);
  }

  async update(tenantId: string, id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Producto no encontrado');

    const data: any = { ...dto };

    // Update slug if name changes
    if (dto.name && dto.name !== existing.name) {
      data.slug = await this.ensureUniqueSlug(tenantId, this.generateSlug(dto.name), id);
    }

    // Handle null categoryId
    if (dto.categoryId === '') data.categoryId = null;

    const product = await this.prisma.product.update({
      where: { id },
      data,
      include: { category: true, images: { orderBy: { order: 'asc' } }, variants: true },
    });

    this.invalidateProductsCache(tenantId);
    return this.serializeProduct(product);
  }

  async delete(tenantId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, tenantId },
      include: { _count: { select: { orderItems: true } } },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    // Soft delete if has orders, hard delete otherwise
    if (product._count.orderItems > 0) {
      await this.prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
      this.invalidateProductsCache(tenantId);
      return { deleted: false, deactivated: true };
    }

    await this.prisma.product.delete({ where: { id } });
    this.invalidateProductsCache(tenantId);
    return { deleted: true, deactivated: false };
  }

  async reorder(tenantId: string, productIds: string[]) {
    await this.prisma.$transaction(
      productIds.map((id, index) =>
        this.prisma.product.updateMany({
          where: { id, tenantId },
          data: { order: index + 1 },
        }),
      ),
    );
    this.invalidateProductsCache(tenantId);
    return { success: true };
  }

  // ============ PRODUCT IMAGES ============

  async addImage(tenantId: string, productId: string, url: string, alt?: string) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, tenantId } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    const imageCount = await this.prisma.productImage.count({ where: { productId } });
    if (imageCount >= 10) throw new BadRequestException('Máximo 10 imágenes por producto');

    const isPrimary = imageCount === 0;

    await this.prisma.productImage.create({
      data: {
        productId,
        url,
        alt,
        order: imageCount,
        isPrimary,
      },
    });

    this.invalidateProductsCache(tenantId);
    return this.findById(tenantId, productId);
  }

  async deleteImage(tenantId: string, productId: string, imageId: string) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, tenantId } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    const image = await this.prisma.productImage.findFirst({ where: { id: imageId, productId } });
    if (!image) throw new NotFoundException('Imagen no encontrada');

    await this.prisma.productImage.delete({ where: { id: imageId } });

    // If deleted image was primary, set next one as primary
    if (image.isPrimary) {
      const nextImage = await this.prisma.productImage.findFirst({
        where: { productId },
        orderBy: { order: 'asc' },
      });
      if (nextImage) {
        await this.prisma.productImage.update({
          where: { id: nextImage.id },
          data: { isPrimary: true },
        });
      }
    }

    this.invalidateProductsCache(tenantId);
    return this.findById(tenantId, productId);
  }

  async reorderImages(tenantId: string, productId: string, imageIds: string[]) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, tenantId } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    await this.prisma.$transaction(
      imageIds.map((id, index) =>
        this.prisma.productImage.updateMany({
          where: { id, productId },
          data: { order: index, isPrimary: index === 0 },
        }),
      ),
    );

    this.invalidateProductsCache(tenantId);
    return this.findById(tenantId, productId);
  }

  async setPrimaryImage(tenantId: string, productId: string, imageId: string) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, tenantId } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    await this.prisma.$transaction([
      this.prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      }),
      this.prisma.productImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      }),
    ]);

    this.invalidateProductsCache(tenantId);
    return this.findById(tenantId, productId);
  }

  // ============ PRODUCT VARIANTS ============

  async createVariant(tenantId: string, productId: string, dto: CreateProductVariantDto) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, tenantId } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    const variant = await this.prisma.productVariant.create({
      data: {
        productId,
        name: dto.name,
        value: dto.value,
        sku: dto.sku,
        price: dto.price,
        stock: dto.stock ?? 0,
        isActive: dto.isActive ?? true,
      },
    });

    this.invalidateProductsCache(tenantId);
    return { ...variant, price: variant.price ? Number(variant.price) : null };
  }

  async updateVariant(tenantId: string, productId: string, variantId: string, dto: UpdateProductVariantDto) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, tenantId } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    const variant = await this.prisma.productVariant.findFirst({ where: { id: variantId, productId } });
    if (!variant) throw new NotFoundException('Variante no encontrada');

    const updated = await this.prisma.productVariant.update({
      where: { id: variantId },
      data: dto,
    });

    this.invalidateProductsCache(tenantId);
    return { ...updated, price: updated.price ? Number(updated.price) : null };
  }

  async deleteVariant(tenantId: string, productId: string, variantId: string) {
    const product = await this.prisma.product.findFirst({ where: { id: productId, tenantId } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    const variant = await this.prisma.productVariant.findFirst({ where: { id: variantId, productId } });
    if (!variant) throw new NotFoundException('Variante no encontrada');

    await this.prisma.productVariant.delete({ where: { id: variantId } });
    this.invalidateProductsCache(tenantId);
    return { success: true };
  }

  // ============ PRODUCT CATEGORIES ============

  async createCategory(tenantId: string, dto: CreateProductCategoryDto) {
    const slug = await this.ensureUniqueCategorySlug(tenantId, this.generateSlug(dto.name));

    const maxOrder = await this.prisma.productCategory.aggregate({
      where: { tenantId },
      _max: { order: true },
    });

    return this.prisma.productCategory.create({
      data: {
        tenantId,
        name: dto.name,
        slug,
        description: dto.description,
        image: dto.image,
        parentId: dto.parentId || null,
        order: (maxOrder._max.order || 0) + 1,
      },
      include: { _count: { select: { products: true } } },
    });
  }

  async findAllCategories(tenantId: string) {
    return this.prisma.productCategory.findMany({
      where: { tenantId },
      include: {
        _count: { select: { products: true } },
        children: {
          include: { _count: { select: { products: true } } },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async updateCategory(tenantId: string, id: string, dto: Partial<CreateProductCategoryDto>) {
    const existing = await this.prisma.productCategory.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Categoría no encontrada');

    const data: any = { ...dto };
    if (dto.name && dto.name !== existing.name) {
      data.slug = await this.ensureUniqueCategorySlug(tenantId, this.generateSlug(dto.name), id);
    }

    return this.prisma.productCategory.update({
      where: { id },
      data,
      include: { _count: { select: { products: true } } },
    });
  }

  async deleteCategory(tenantId: string, id: string) {
    const category = await this.prisma.productCategory.findFirst({
      where: { id, tenantId },
      include: { _count: { select: { products: true } } },
    });
    if (!category) throw new NotFoundException('Categoría no encontrada');

    if (category._count.products > 0) {
      throw new BadRequestException(
        `No se puede eliminar: hay ${category._count.products} producto(s) en esta categoría. Mové los productos primero.`,
      );
    }

    await this.prisma.productCategory.delete({ where: { id } });
    return { success: true };
  }

  async reorderCategories(tenantId: string, categoryIds: string[]) {
    await this.prisma.$transaction(
      categoryIds.map((id, index) =>
        this.prisma.productCategory.updateMany({
          where: { id, tenantId },
          data: { order: index + 1 },
        }),
      ),
    );
    return { success: true };
  }

  // ============ PUBLIC ENDPOINTS ============

  async findPublicProducts(tenantId: string, categorySlug?: string) {
    // Check cache first
    try {
      const cached = await this.cacheService.getPublicProducts(tenantId, categorySlug);
      if (cached) return cached;
    } catch (err) {
      this.logger.warn(`Redis cache read failed for products:${tenantId}: ${err.message}`);
    }

    const where: any = { tenantId, isActive: true };

    if (categorySlug) {
      const category = await this.prisma.productCategory.findUnique({
        where: { tenantId_slug: { tenantId, slug: categorySlug } },
      });
      if (category) where.categoryId = category.id;
    }

    const products = await this.prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { order: 'asc' }, select: { id: true, url: true, alt: true, isPrimary: true } },
        variants: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
          select: { id: true, name: true, value: true, price: true, stock: true },
        },
      },
      orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }],
    });

    const result = products.map(p => ({
      ...this.serializeProduct(p),
      // Hide cost price from public
      costPrice: undefined,
    }));

    // Cache the result (fire-and-forget)
    this.cacheService.setPublicProducts(tenantId, result, categorySlug).catch((err) => {
      this.logger.warn(`Redis cache write failed for products:${tenantId}: ${err.message}`);
    });

    return result;
  }

  async findPublicProductBySlug(tenantId: string, productSlug: string) {
    const product = await this.prisma.product.findUnique({
      where: { tenantId_slug: { tenantId, slug: productSlug } },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { order: 'asc' } },
        variants: { where: { isActive: true }, orderBy: { createdAt: 'asc' } },
      },
    });

    if (!product || !product.isActive) throw new NotFoundException('Producto no encontrado');

    return {
      ...this.serializeProduct(product),
      costPrice: undefined,
    };
  }

  async findPublicCategories(tenantId: string) {
    return this.prisma.productCategory.findMany({
      where: { tenantId, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
      orderBy: { order: 'asc' },
    });
  }

  // ============ STOCK MANAGEMENT ============

  async adjustStock(tenantId: string, productId: string, adjustment: number, variantId?: string) {
    if (variantId) {
      const variant = await this.prisma.productVariant.findFirst({
        where: { id: variantId, product: { id: productId, tenantId } },
      });
      if (!variant) throw new NotFoundException('Variante no encontrada');

      const newStock = variant.stock + adjustment;
      if (newStock < 0) throw new BadRequestException('Stock insuficiente');

      const result = await this.prisma.productVariant.update({
        where: { id: variantId },
        data: { stock: newStock },
      });
      this.invalidateProductsCache(tenantId);
      return result;
    }

    const product = await this.prisma.product.findFirst({ where: { id: productId, tenantId } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    const newStock = product.stock + adjustment;
    if (newStock < 0) throw new BadRequestException('Stock insuficiente');

    const result = await this.prisma.product.update({
      where: { id: productId },
      data: { stock: newStock },
    });
    this.invalidateProductsCache(tenantId);
    return result;
  }

  async getLowStockProducts(tenantId: string) {
    return this.prisma.product.findMany({
      where: {
        tenantId,
        isActive: true,
        trackInventory: true,
        stock: { lte: this.prisma.product.fields.lowStockThreshold as any },
      },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true } },
      },
      orderBy: { stock: 'asc' },
    });
  }

  // ============ STATS ============

  async getStats(tenantId: string) {
    const [total, active, featured, lowStock] = await Promise.all([
      this.prisma.product.count({ where: { tenantId } }),
      this.prisma.product.count({ where: { tenantId, isActive: true } }),
      this.prisma.product.count({ where: { tenantId, isFeatured: true, isActive: true } }),
      this.prisma.$queryRaw`
        SELECT COUNT(*) as count FROM products
        WHERE "tenantId" = ${tenantId}
        AND "isActive" = true
        AND "trackInventory" = true
        AND stock <= "lowStockThreshold"
      ` as Promise<any[]>,
    ]);

    return {
      total,
      active,
      featured,
      lowStock: Number(lowStock[0]?.count || 0),
    };
  }
}
