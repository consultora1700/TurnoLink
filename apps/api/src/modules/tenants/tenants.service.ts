import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CacheService } from '../../common/cache';

const DEFAULT_SETTINGS = {
  timezone: 'America/Argentina/Buenos_Aires',
  currency: 'ARS',
  language: 'es',
  bookingBuffer: 0,
  maxAdvanceBookingDays: 30,
  minAdvanceBookingHours: 1,
  allowCancellation: true,
  cancellationHoursLimit: 24,
  showPrices: true,
  requirePhone: true,
  requireEmail: false,
  primaryColor: '#000000',
  secondaryColor: '#ffffff',
  // Deposit/Seña settings
  requireDeposit: false,
  depositPercentage: 30, // % del precio del servicio
  depositMode: 'simulated', // 'simulated' | 'mercadopago'
  // Daily booking settings
  bookingMode: 'HOURLY', // 'HOURLY' | 'DAILY'
  dailyCheckInTime: '14:00',
  dailyCheckOutTime: '10:00',
  dailyMinNights: 1,
  dailyMaxNights: 30,
  dailyClosedDays: [] as number[], // Days of week with no check-in (0=Sunday)
  // Notification settings
  notifyOwnerByEmail: true,
  notificationEmail: '', // Populated from tenant.email at creation
  pushNewBooking: true,
  pushCancellation: true,
  pushReminder: true,
  // Tenant config: rubro, terminologia, fichas
  rubro: '',
  clientLabelSingular: 'Cliente',
  clientLabelPlural: 'Clientes',
  enabledFichas: ['datosPersonales', 'notasSeguimiento'],
  hiddenSections: [] as string[],
  // Store type: 'catalogo' (view only) or 'ecommerce' (cart + checkout)
  storeType: 'catalogo',
};

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async create(createTenantDto: CreateTenantDto, type: string = 'BUSINESS', extraSettings?: Record<string, unknown>) {
    const settings = {
      ...DEFAULT_SETTINGS,
      notificationEmail: createTenantDto.email || '',
      ...extraSettings,
    };
    return this.prisma.tenant.create({
      data: {
        ...createTenantDto,
        type,
        settings: JSON.stringify(settings),
      },
    });
  }

  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException('Business not found');
    }

    return tenant;
  }

  async findBySlug(slug: string) {
    return this.prisma.tenant.findUnique({
      where: { slug },
    });
  }

  async findBySlugPublic(slug: string) {
    // Check cache first
    try {
      const cached = await this.cacheService.getTenantBySlug(slug);
      if (cached) return cached;
    } catch (err) {
      this.logger.warn(`Redis cache read failed for tenant-slug:${slug}: ${err.message}`);
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { slug, status: 'ACTIVE' },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: { specialty: { select: { id: true, name: true, slug: true } } },
        },
        categories: {
          orderBy: { order: 'asc' },
        },
        specialties: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            _count: { select: { services: true, employeeSpecialties: true } },
          },
        },
        branding: {
          select: { logoScale: true, logoOffsetX: true, logoOffsetY: true },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Business not found');
    }

    // Check if tenant plan has show_ads feature
    const subscription = await this.prisma.subscription.findFirst({
      where: { tenantId: tenant.id, status: { in: ['active', 'trialing', 'ACTIVE', 'TRIALING'] } },
      include: { plan: { select: { features: true } } },
    });
    const planFeatures: string[] = (() => {
      const raw = subscription?.plan?.features;
      if (!raw) return [];
      if (Array.isArray(raw)) return raw;
      if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return []; } }
      return [];
    })();
    const showAds = planFeatures.includes('show_ads');

    // Transform for public view
    const settings = typeof tenant.settings === 'string'
      ? JSON.parse(tenant.settings)
      : tenant.settings as Record<string, unknown>;
    const result = {
      id: tenant.id,
      showAds,
      slug: tenant.slug,
      name: tenant.name,
      description: tenant.description,
      logo: tenant.logo,
      coverImage: tenant.coverImage,
      phone: tenant.phone,
      address: tenant.address,
      city: tenant.city,
      instagram: tenant.instagram,
      facebook: tenant.facebook,
      website: tenant.website,
      settings: {
        showPrices: settings.showPrices,
        requirePhone: settings.requirePhone,
        requireEmail: settings.requireEmail,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        accentColor: settings.accentColor,
        enableDarkMode: settings.enableDarkMode ?? true,
        themeMode: settings.themeMode,
        backgroundStyle: settings.backgroundStyle ?? 'modern',
        heroStyle: settings.heroStyle ?? 'classic',
        cardStyle: settings.cardStyle,
        maxAdvanceBookingDays: settings.maxAdvanceBookingDays,
        minAdvanceBookingHours: settings.minAdvanceBookingHours,
        requireDeposit: settings.requireDeposit ?? false,
        depositPercentage: settings.depositPercentage ?? 30,
        depositMode: settings.depositMode ?? 'simulated',
        smartTimeSlots: settings.smartTimeSlots ?? true,
        bookingMode: settings.bookingMode ?? 'HOURLY',
        dailyCheckInTime: settings.dailyCheckInTime ?? '14:00',
        dailyCheckOutTime: settings.dailyCheckOutTime ?? '10:00',
        dailyMinNights: settings.dailyMinNights ?? 1,
        dailyMaxNights: settings.dailyMaxNights ?? 30,
        showProfilePhoto: settings.showProfilePhoto,
        coverOverlayColor: settings.coverOverlayColor,
        coverOverlayOpacity: settings.coverOverlayOpacity,
        coverFadeEnabled: settings.coverFadeEnabled,
        coverFadeColor: settings.coverFadeColor,
        heroTextTone: settings.heroTextTone,
        heroTrustTone: settings.heroTrustTone,
        heroButtons: settings.heroButtons,
        rubro: settings.rubro ?? null,
        currency: settings.currency ?? 'ARS',
        youtubeVideoUrl: settings.youtubeVideoUrl ?? null,
        amenities: settings.amenities ?? [],
        storeType: (['mercado', 'inmobiliarias'].includes(settings.rubro as string)) ? (settings.storeType ?? 'catalogo') : undefined,
        shipping: settings.shipping ?? null,
        gastroConfig: settings.gastroConfig ?? null,
        logoScale: settings.logoScale ?? 100,
        logoOffsetX: tenant.branding?.logoOffsetX ?? 0,
        logoOffsetY: tenant.branding?.logoOffsetY ?? 0,
      },
      publicPageLayout: tenant.publicPageLayout || 'service_first',
      publicPageConfig: typeof tenant.publicPageConfig === 'string'
        ? JSON.parse(tenant.publicPageConfig || '{}')
        : (tenant.publicPageConfig || {}),
      services: (() => {
        const now = new Date(); // Single Date object for all services
        return tenant.services.map((service) => {
          let parsedImages: string[] = [];
          try { parsedImages = service.images ? JSON.parse(service.images) : []; } catch { parsedImages = []; }
          let parsedVariations = [];
          try { parsedVariations = service.variations ? JSON.parse(service.variations) : []; } catch { parsedVariations = []; }
          // Promo active check (server-side)
          const promoActive = service.promoPrice != null
            && (!service.promoStartDate || service.promoStartDate <= now)
            && (!service.promoEndDate || service.promoEndDate >= now)
            && (service.promoMaxBookings == null || service.promoBookingCount < service.promoMaxBookings);

          // Filter out packs with past checkout dates
          const isPack = service.isPack || false;
          if (isPack && service.packCheckOut && service.packCheckOut < now) {
            return null; // Will be filtered out below
          }

          return {
            id: service.id,
            name: service.name,
            description: service.description,
            price: settings.showPrices ? Number(service.price) : null,
            duration: service.duration,
            image: service.image,
            images: parsedImages,
            imageDisplayMode: service.imageDisplayMode || 'cover',
            includes: service.includes,
            categoryId: service.categoryId,
            specialtyId: service.specialtyId,
            assignmentMode: service.assignmentMode || 'client_chooses',
            specialty: service.specialty || null,
            variations: parsedVariations,
            mode: service.mode || 'presencial',
            intakeFormId: service.intakeFormId || null,
            // Per-service check-in/out times
            checkInTime: service.checkInTime ?? null,
            checkOutTime: service.checkOutTime ?? null,
            // Rich content
            youtubeVideoUrl: service.youtubeVideoUrl ?? null,
            amenities: (() => { try { return service.amenities ? JSON.parse(service.amenities) : []; } catch { return []; } })(),
            // Pack fields
            isPack,
            packCheckIn: service.packCheckIn?.toISOString() ?? null,
            packCheckOut: service.packCheckOut?.toISOString() ?? null,
            packNights: service.packNights ?? null,
            packOriginalPrice: service.packOriginalPrice != null ? Number(service.packOriginalPrice) : null,
            // Promo fields (only if active)
            promoPrice: promoActive && settings.showPrices ? Number(service.promoPrice) : null,
            promoLabel: promoActive ? (service.promoLabel ?? null) : null,
          };
        }).filter(Boolean);
      })(),
      categories: tenant.categories,
      specialties: tenant.specialties.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        description: s.description,
        icon: s.icon,
        _count: (s as any)._count || { services: 0, employeeSpecialties: 0 },
      })),
    };

    // Cache the result (fire-and-forget, don't block response)
    this.cacheService.setTenantBySlug(slug, result).catch((err) => {
      this.logger.warn(`Redis cache write failed for tenant-slug:${slug}: ${err.message}`);
    });

    return result;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    const currentTenantForCache = await this.findById(id);

    // Validate slug uniqueness if changing
    if (updateTenantDto.slug) {
      const existing = await this.prisma.tenant.findUnique({
        where: { slug: updateTenantDto.slug },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Esa URL ya está en uso. Elegí otra.');
      }
    }

    const { settings, ...rest } = updateTenantDto;
    const data: Prisma.TenantUpdateInput = { ...rest };

    // Handle settings update
    if (settings) {
      const currentTenant = await this.prisma.tenant.findUnique({
        where: { id },
      });
      const currentSettings = currentTenant?.settings
        ? (typeof currentTenant.settings === 'string'
            ? JSON.parse(currentTenant.settings)
            : currentTenant.settings)
        : DEFAULT_SETTINGS;
      // Parse settings if it's a string (from frontend JSON.stringify)
      const newSettings = typeof settings === 'string' ? JSON.parse(settings) : settings;

      // Guard: storeType only allowed for rubro 'mercado'
      const mergedRubro = newSettings.rubro || currentSettings.rubro;
      if (mergedRubro !== 'mercado' && newSettings.storeType) {
        delete newSettings.storeType;
      }

      // Guard: ecommerce storeType requires paid plan with online_payments
      if (newSettings.storeType === 'ecommerce') {
        const sub = await this.prisma.subscription.findFirst({
          where: { tenantId: id, status: { in: ['active', 'trialing', 'ACTIVE', 'TRIALING'] } },
          include: { plan: { select: { features: true } } },
        });
        const feats: string[] = (() => {
          const raw = sub?.plan?.features;
          if (!raw) return [];
          if (Array.isArray(raw)) return raw;
          if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return []; } }
          return [];
        })();
        if (!feats.includes('online_payments') && !feats.includes('mercadopago')) {
          delete newSettings.storeType; // silently keep catalogo mode
        }
      }
      // Guard: if rubro is changing away from 'mercado', reset storeType to default
      if (newSettings.rubro && newSettings.rubro !== 'mercado' && currentSettings.storeType) {
        newSettings.storeType = 'catalogo';
      }

      data.settings = JSON.stringify({
        ...currentSettings,
        ...newSettings,
      });
    }

    const updated = await this.prisma.tenant.update({
      where: { id },
      data,
    });

    // Invalidate cache for old slug (and new slug if changed)
    this.invalidateTenantCache(currentTenantForCache.slug, updateTenantDto.slug);

    return updated;
  }

  async updateLogo(id: string, logoUrl: string) {
    const tenant = await this.findById(id);
    const result = await this.prisma.tenant.update({
      where: { id },
      data: { logo: logoUrl },
    });
    this.invalidateTenantCache(tenant.slug);
    return result;
  }

  async updateCover(id: string, coverUrl: string) {
    const tenant = await this.findById(id);
    const result = await this.prisma.tenant.update({
      where: { id },
      data: { coverImage: coverUrl },
    });
    this.invalidateTenantCache(tenant.slug);
    return result;
  }

  /** Invalidate tenant public page cache. Safe if Redis is down. */
  private invalidateTenantCache(slug: string, newSlug?: string): void {
    this.cacheService.invalidateTenantBySlug(slug).catch((err) => {
      this.logger.warn(`Redis invalidation failed for tenant-slug:${slug}: ${err.message}`);
    });
    if (newSlug && newSlug !== slug) {
      this.cacheService.invalidateTenantBySlug(newSlug).catch((err) => {
        this.logger.warn(`Redis invalidation failed for tenant-slug:${newSlug}: ${err.message}`);
      });
    }
  }

  // Admin methods
  async findAll(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.TenantWhereInput = status ? { status } : {};

    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              users: true,
              bookings: true,
              services: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return {
      data: tenants,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateStatus(id: string, status: string) {
    const tenant = await this.findById(id);
    const result = await this.prisma.tenant.update({
      where: { id },
      data: { status },
    });
    this.invalidateTenantCache(tenant.slug);
    return result;
  }

  async getStats(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayBookings, weekBookings, monthBookings, totalCustomers] =
      await Promise.all([
        this.prisma.booking.count({
          where: { tenantId, date: today },
        }),
        this.prisma.booking.count({
          where: { tenantId, date: { gte: startOfWeek } },
        }),
        this.prisma.booking.count({
          where: { tenantId, date: { gte: startOfMonth } },
        }),
        this.prisma.customer.count({
          where: { tenantId },
        }),
      ]);

    const upcomingBookings = await this.prisma.booking.findMany({
      where: {
        tenantId,
        date: { gte: today },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      include: {
        service: true,
        customer: true,
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      take: 10,
    });

    const recentCustomers = await this.prisma.customer.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      todayBookings,
      weekBookings,
      monthBookings,
      totalCustomers,
      upcomingBookings,
      recentCustomers,
    };
  }
}
