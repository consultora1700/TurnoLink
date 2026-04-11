import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../common/cache';
import { UpdateBrandingDto } from './dto/update-branding.dto';

// Fields gated behind ecommerce-only mode. Catalog tenants cannot configure
// or render these through the public API, regardless of any stale DB state.
const ECOMMERCE_ONLY_BRANDING_FIELDS = [
  'announcementEnabled',
  'announcementText',
  'announcementBgColor',
  'announcementTextColor',
  'announcementSpeed',
] as const;

/**
 * Determines whether a tenant operates in full ecommerce mode.
 * Ecommerce = rubro 'mercado' AND settings.storeType === 'ecommerce'.
 * Everything else (catálogo, inmobiliarias, gastro, etc.) is not ecommerce.
 */
function isTenantEcommerce(settingsRaw: unknown): boolean {
  if (!settingsRaw) return false;
  let settings: Record<string, unknown>;
  try {
    settings = typeof settingsRaw === 'string'
      ? JSON.parse(settingsRaw)
      : (settingsRaw as Record<string, unknown>);
  } catch {
    return false;
  }
  return settings?.rubro === 'mercado' && settings?.storeType === 'ecommerce';
}

@Injectable()
export class BrandingService {
  private readonly logger = new Logger(BrandingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async findByTenantId(tenantId: string) {
    let branding = await this.prisma.tenantBranding.findUnique({
      where: { tenantId },
    });

    // Auto-create with defaults if not exists
    if (!branding) {
      branding = await this.prisma.tenantBranding.create({
        data: { tenantId },
      });
    }

    return branding;
  }

  async update(tenantId: string, dto: UpdateBrandingDto, planFeatures?: string[]) {
    // Convert DTO to plain data for Prisma (CarouselImageDto[] -> Json)
    const data: any = { ...dto };

    // SEO fields require seo_custom feature — strip if plan doesn't include it
    if (!planFeatures?.includes('seo_custom')) {
      delete data.metaTitle;
      delete data.metaDescription;
    }

    // Ecommerce-only fields: only mercado+ecommerce tenants may write these.
    // Prevents catálogo tenants (which have no UI for this) from accumulating
    // orphan state via direct API calls or legacy clients.
    const tenantRow = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });
    if (!isTenantEcommerce(tenantRow?.settings)) {
      for (const field of ECOMMERCE_ONLY_BRANDING_FIELDS) {
        delete data[field];
      }
    }

    if (dto.carouselImages) {
      data.carouselImages = dto.carouselImages.map(img => ({
        url: img.url,
        linkUrl: img.linkUrl || '',
        order: img.order,
      }));
    }
    // Upsert: create if not exists, update if exists
    const result = await this.prisma.tenantBranding.upsert({
      where: { tenantId },
      create: { tenantId, ...data },
      update: data,
    });

    // Invalidate tenant public page cache so changes reflect immediately
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { slug: true },
    });
    if (tenant?.slug) {
      this.cacheService.invalidateTenantBySlug(tenant.slug).catch((err) => {
        this.logger.warn(`Redis invalidation failed for tenant-slug:${tenant.slug}: ${err.message}`);
      });
    }

    return result;
  }

  async findPublicBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, status: true, settings: true },
    });
    if (!tenant || tenant.status !== 'ACTIVE') throw new NotFoundException('Negocio no encontrado');

    const isEcommerce = isTenantEcommerce(tenant.settings);

    const branding = await this.prisma.tenantBranding.findUnique({
      where: { tenantId: tenant.id },
    });

    // Return defaults if no branding configured
    if (!branding) {
      return {
        primaryColor: '#6366f1',
        secondaryColor: '#8b5cf6',
        accentColor: '#f59e0b',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        fontFamily: 'Inter',
        headingFontFamily: 'Inter',
        logoUrl: null,
        coverImageUrl: null,
        bannerImageUrl: null,
        welcomeTitle: null,
        welcomeSubtitle: null,
        footerText: null,
        showPrices: true,
        showStock: true,
        enableWishlist: true,
        enableReviews: false,
        storeEnabled: false,
        backgroundStyle: 'modern',
        storeHeroStyle: 'classic',
        storeCardStyle: 'standard',
        profilePhotoStyle: 'round',
        announcementEnabled: false,
        announcementText: null,
        announcementBgColor: '#000000',
        announcementTextColor: '#FFFFFF',
        announcementSpeed: 'normal',
        showCategoryFilter: true,
        showSearchBar: true,
        showWhatsappButton: true,
        buttonStyle: 'pill',
        buttonText: 'Consultar',
        cardBorderRadius: 'lg',
        imageAspectRatio: 'square',
        heroHeight: 'medium',
        heroOverlay: 'gradient',
        mobileColumns: 2,
        priceStyle: 'default',
        categoryStyle: 'pills',
        logoGlowEnabled: false,
        logoGlowColor: '#6366f1',
        logoGlowIntensity: 'medium',
        backgroundEffect: 'none',
        backgroundEffectColor: '#6366f1',
        backgroundEffectOpacity: 0.15,
        gradientEnabled: false,
        gradientStyle: 'fade',
        gradientFrom: '#ffffff',
        gradientTo: '#111827',
        carouselImages: [],
        logoScale: 1.0,
        logoOffsetX: 0,
        logoOffsetY: 0,
      };
    }

    // Exclude internal fields from public response
    const { id, tenantId: _, faviconUrl, createdAt, updatedAt, ...publicBranding } = branding;

    // Ecommerce-only fields: force-disable for catalog tenants so stale DB data
    // from a previous ecommerce period (or direct API writes) cannot leak to
    // the storefront. Values remain preserved in DB and reactivate automatically
    // if the tenant switches back to ecommerce mode.
    if (!isEcommerce) {
      return {
        ...publicBranding,
        announcementEnabled: false,
        announcementText: null,
      };
    }

    return publicBranding;
  }
}
