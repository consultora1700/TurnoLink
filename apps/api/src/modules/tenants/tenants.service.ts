import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

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
};

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto) {
    return this.prisma.tenant.create({
      data: {
        ...createTenantDto,
        settings: JSON.stringify(DEFAULT_SETTINGS),
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
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug, status: 'ACTIVE' },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
        categories: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Business not found');
    }

    // Transform for public view
    const settings = typeof tenant.settings === 'string'
      ? JSON.parse(tenant.settings)
      : tenant.settings as Record<string, unknown>;
    return {
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
        backgroundStyle: settings.backgroundStyle ?? 'modern',
        maxAdvanceBookingDays: settings.maxAdvanceBookingDays,
        minAdvanceBookingHours: settings.minAdvanceBookingHours,
        requireDeposit: settings.requireDeposit ?? false,
        depositPercentage: settings.depositPercentage ?? 30,
        depositMode: settings.depositMode ?? 'simulated',
      },
      services: tenant.services.map((service) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        price: settings.showPrices ? Number(service.price) : null,
        duration: service.duration,
        image: service.image,
        categoryId: service.categoryId,
      })),
      categories: tenant.categories,
    };
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    await this.findById(id);

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
      data.settings = JSON.stringify({
        ...currentSettings,
        ...newSettings,
      });
    }

    return this.prisma.tenant.update({
      where: { id },
      data,
    });
  }

  async updateLogo(id: string, logoUrl: string) {
    await this.findById(id);
    return this.prisma.tenant.update({
      where: { id },
      data: { logo: logoUrl },
    });
  }

  async updateCover(id: string, coverUrl: string) {
    await this.findById(id);
    return this.prisma.tenant.update({
      where: { id },
      data: { coverImage: coverUrl },
    });
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
    await this.findById(id);
    return this.prisma.tenant.update({
      where: { id },
      data: { status },
    });
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
