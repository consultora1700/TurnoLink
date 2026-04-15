import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
import { EmailVerificationService } from '../email-verification/email-verification.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { getOnboardingExamples } from './onboarding-examples';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly tenantsService: TenantsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const isProfessional = registerDto.accountType === 'PROFESSIONAL';

    let tenantName: string;
    let tenantSlug: string;
    let tenantType: string;

    if (isProfessional) {
      tenantName = registerDto.name;
      tenantSlug = `pro-${this.slugify(registerDto.name)}-${crypto.randomBytes(3).toString('hex')}`;
      tenantType = 'PROFESSIONAL';
    } else {
      // Business flow
      if (registerDto.businessSlug) {
        // Explicit slug provided: check availability
        const existingTenant = await this.tenantsService.findBySlug(
          registerDto.businessSlug,
        );
        if (existingTenant) {
          throw new ConflictException('Business URL already taken');
        }
        tenantSlug = registerDto.businessSlug;
      } else {
        // No slug provided: auto-generate
        tenantSlug = `${this.slugify(registerDto.name)}-${crypto.randomBytes(3).toString('hex')}`;
      }
      tenantName = registerDto.businessName || registerDto.name;
      tenantType = 'BUSINESS';
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    // publicPageLayout per rubro — service_first por defecto para todos los rubros de servicios
    // All mercado-* sub-rubros share the same layout/sections/defaults as 'mercado'
    const MERCADO_SUB_RUBROS = [
      'mercado-celulares', 'mercado-indumentaria', 'mercado-calzado', 'mercado-computacion',
      'mercado-electronica', 'mercado-accesorios-tech', 'mercado-automotoras', 'mercado-alimentos',
      'mercado-muebles', 'mercado-juguetes', 'mercado-deportes', 'mercado-libreria',
      'mercado-cosmetica', 'mercado-mascotas', 'mercado-joyeria', 'mercado-ferreteria',
      'mercado-bazar', 'mercado-general',
    ];

    // All gastro-* sub-rubros share the same layout/sections/defaults as 'gastronomia'
    const GASTRO_SUB_RUBROS = [
      'gastro-parrilla', 'gastro-pizzeria', 'gastro-hamburgueseria', 'gastro-cafe',
      'gastro-heladeria', 'gastro-sushi', 'gastro-cerveceria', 'gastro-bodegon',
      'gastro-pasteleria', 'gastro-food-truck', 'gastro-otro',
    ];

    const RUBRO_LAYOUT: Record<string, string> = {
      'estetica-belleza': 'service_first',
      'barberia':         'service_first',
      'masajes-spa':      'service_first',
      'tatuajes-piercing':'service_first',
      'salud':            'service_first',
      'odontologia':      'service_first',
      'psicologia':       'service_first',
      'nutricion':        'service_first',
      'veterinaria':      'service_first',
      'fitness':          'service_first',
      'deportes':         'service_first',
      'hospedaje':        'service_first',
      'alquiler':         'service_first',
      'espacios':         'service_first',
      'educacion':        'service_first',
      'gastronomia':      'service_first',
      'inmobiliarias':    'product_grid',
      'mercado':          'product_grid',
      'consultoria':      'service_first',
      'otro':             'service_first',
      // Mercado sub-rubros inherit product_grid
      ...Object.fromEntries(MERCADO_SUB_RUBROS.map(k => [k, 'product_grid'])),
      // Gastro sub-rubros inherit gastronomia layout
      ...Object.fromEntries(GASTRO_SUB_RUBROS.map(k => [k, 'service_first'])),
    };

    // Items ocultos por defecto (siempre reactivables en Configuración → Secciones del Menú)
    const TALENTO = ['/talento', '/talento/propuestas', '/talento/ofertas'];
    const ADVANCED = ['/integracion'];
    // Catálogo/e-commerce sidebar items — ocultos para rubros que no son mercado
    const CATALOGO = ['/catalogo', '/categorias-productos', '/pedidos', '/mi-tienda'];

    const RUBRO_HIDDEN_SECTIONS: Record<string, string[]> = {
      'estetica-belleza': ['/especialidades', '/sucursales', '/videollamadas', ...TALENTO, ...ADVANCED, ...CATALOGO],
      'barberia':         ['/especialidades', '/sucursales', '/videollamadas', ...TALENTO, ...ADVANCED, ...CATALOGO],
      'masajes-spa':      ['/especialidades', '/sucursales', '/videollamadas', ...TALENTO, ...ADVANCED, ...CATALOGO],
      'tatuajes-piercing':['/especialidades', '/formularios', '/sucursales', '/videollamadas', ...TALENTO, ...ADVANCED, ...CATALOGO],
      'salud':            ['/sucursales', ...TALENTO, ...ADVANCED, ...CATALOGO],
      'odontologia':      ['/especialidades', '/sucursales', '/videollamadas', ...TALENTO, ...ADVANCED, ...CATALOGO],
      'psicologia':       ['/especialidades', '/empleados', '/sucursales', ...TALENTO, ...ADVANCED, ...CATALOGO],
      'nutricion':        ['/especialidades', '/empleados', '/sucursales', ...TALENTO, ...ADVANCED, ...CATALOGO],
      'veterinaria':      ['/especialidades', '/sucursales', '/videollamadas', ...TALENTO, ...ADVANCED, ...CATALOGO],
      'fitness':          ['/especialidades', '/formularios', '/sucursales', '/videollamadas', ...TALENTO, ...ADVANCED, ...CATALOGO],
      'deportes':         ['/empleados', '/especialidades', '/formularios', '/sucursales', '/videollamadas', ...TALENTO, ...ADVANCED, ...CATALOGO],
      'hospedaje':        ['/empleados', '/especialidades', '/formularios', '/sucursales', '/videollamadas', ...TALENTO, ...ADVANCED, ...CATALOGO],
      'alquiler':         ['/empleados', '/especialidades', '/formularios', '/sucursales', '/videollamadas', ...TALENTO, ...ADVANCED, ...CATALOGO],
      'espacios':         ['/empleados', '/especialidades', '/formularios', '/sucursales', '/videollamadas', ...TALENTO, ...ADVANCED, ...CATALOGO],
      'educacion':        ['/especialidades', '/sucursales', ...TALENTO, ...ADVANCED, ...CATALOGO],
      'gastronomia':      ['/especialidades', '/formularios', '/sucursales', '/videollamadas', ...TALENTO, ...ADVANCED],
      'consultoria':      ['/sucursales', ...TALENTO, ...ADVANCED, ...CATALOGO],
      'inmobiliarias':    ['/autogestion', '/turnos', '/servicios', '/empleados', '/especialidades', '/formularios', '/horarios', '/videollamadas', '/sucursales', '/clientes', ...TALENTO, ...ADVANCED],
      'mercado':          ['/autogestion', '/turnos', '/servicios', '/empleados', '/especialidades', '/formularios', '/horarios', '/videollamadas', '/sucursales', '/clientes', ...TALENTO, ...ADVANCED],
      'otro':             [...TALENTO, ...ADVANCED, ...CATALOGO],
      // Mercado sub-rubros inherit mercado hidden sections
      ...Object.fromEntries(MERCADO_SUB_RUBROS.map(k => [k, ['/autogestion', '/turnos', '/servicios', '/empleados', '/especialidades', '/formularios', '/horarios', '/videollamadas', '/sucursales', '/clientes', ...TALENTO, ...ADVANCED]])),
      // Gastro sub-rubros inherit gastronomia hidden sections
      ...Object.fromEntries(GASTRO_SUB_RUBROS.map(k => [k, ['/especialidades', '/formularios', '/sucursales', '/videollamadas', ...TALENTO, ...ADVANCED]])),
    };

    // Map industry slug to rubro key and plan slug
    const INDUSTRY_CONFIG: Record<string, { rubro: string; plan: string; bookingMode?: string }> = {
      // Landing page slugs (mantener por compatibilidad)
      'belleza':              { rubro: 'estetica-belleza', plan: 'belleza-gratis' },
      'salud':                { rubro: 'salud',            plan: 'salud-starter' },
      'deportes':             { rubro: 'deportes',         plan: 'deportes-gratis' },
      'hospedaje-por-horas':  { rubro: 'hospedaje',        plan: 'hospedaje-gratis',  bookingMode: 'DAILY' },
      'alquiler-temporario':  { rubro: 'alquiler',         plan: 'alquiler-gratis',   bookingMode: 'DAILY' },
      'espacios-flexibles':   { rubro: 'espacios',         plan: 'espacios-gratis' },
      'profesionales':        { rubro: 'consultoria',      plan: 'profesionales-starter' },
      // Rubro keys directos (desde formulario de registro)
      'estetica-belleza':     { rubro: 'estetica-belleza', plan: 'belleza-gratis' },
      'barberia':             { rubro: 'barberia',         plan: 'belleza-gratis' },
      'masajes-spa':          { rubro: 'masajes-spa',      plan: 'belleza-gratis' },
      'tatuajes-piercing':    { rubro: 'tatuajes-piercing', plan: 'belleza-gratis' },
      'odontologia':          { rubro: 'odontologia',      plan: 'salud-starter' },
      'psicologia':           { rubro: 'psicologia',       plan: 'salud-starter' },
      'nutricion':            { rubro: 'nutricion',        plan: 'salud-starter' },
      'veterinaria':          { rubro: 'veterinaria',      plan: 'salud-starter' },
      'fitness':              { rubro: 'fitness',           plan: 'deportes-gratis' },
      'hospedaje':            { rubro: 'hospedaje',         plan: 'hospedaje-gratis', bookingMode: 'DAILY' },
      'alquiler':             { rubro: 'alquiler',          plan: 'alquiler-gratis',  bookingMode: 'DAILY' },
      'espacios':             { rubro: 'espacios',          plan: 'espacios-gratis' },
      'educacion':            { rubro: 'educacion',         plan: 'profesionales-starter' },
      'gastronomia':          { rubro: 'gastronomia',       plan: 'gastronomia-gratis' },
      'consultoria':          { rubro: 'consultoria',       plan: 'profesionales-starter' },
      'inmobiliarias':        { rubro: 'inmobiliarias',      plan: 'mercado-vitrina' },
      'mercado':              { rubro: 'mercado',           plan: 'mercado-vitrina' },
      // Mercado sub-rubros (from sub-rubro picker in registration)
      ...Object.fromEntries(MERCADO_SUB_RUBROS.map(k => [k, { rubro: k, plan: 'mercado-vitrina' }])),
      // Gastro sub-rubros (from sub-rubro picker in registration)
      ...Object.fromEntries(GASTRO_SUB_RUBROS.map(k => [k, { rubro: k, plan: 'gastronomia-gratis' }])),
      // Backward compat
      'celulares':            { rubro: 'mercado-celulares', plan: 'mercado-vitrina' },
      'otro':                 { rubro: 'otro',              plan: 'profesional' },
    };

    const industryConfig = registerDto.industry ? INDUSTRY_CONFIG[registerDto.industry] : null;

    // Rubro-specific defaults: terminology + ficha modules
    // Mirrors RUBROS in apps/web/lib/tenant-config.ts — keep in sync
    const RUBRO_DEFAULTS: Record<string, { clientLabelSingular: string; clientLabelPlural: string; enabledFichas: string[] }> = {
      'estetica-belleza': { clientLabelSingular: 'Cliente', clientLabelPlural: 'Clientes', enabledFichas: ['datosPersonales', 'fichaBelleza', 'notasSeguimiento'] },
      'barberia':         { clientLabelSingular: 'Cliente', clientLabelPlural: 'Clientes', enabledFichas: ['datosPersonales', 'fichaBelleza', 'notasSeguimiento'] },
      'masajes-spa':      { clientLabelSingular: 'Cliente', clientLabelPlural: 'Clientes', enabledFichas: ['datosPersonales', 'fichaBelleza', 'notasSeguimiento'] },
      'salud':            { clientLabelSingular: 'Paciente', clientLabelPlural: 'Pacientes', enabledFichas: ['datosPersonales', 'fichaClinica', 'notasSeguimiento'] },
      'odontologia':      { clientLabelSingular: 'Paciente', clientLabelPlural: 'Pacientes', enabledFichas: ['datosPersonales', 'fichaClinica', 'notasSeguimiento'] },
      'psicologia':       { clientLabelSingular: 'Paciente', clientLabelPlural: 'Pacientes', enabledFichas: ['datosPersonales', 'fichaClinica', 'notasSeguimiento'] },
      'nutricion':        { clientLabelSingular: 'Paciente', clientLabelPlural: 'Pacientes', enabledFichas: ['datosPersonales', 'fichaClinica', 'fichaFitness', 'notasSeguimiento'] },
      'fitness':          { clientLabelSingular: 'Alumno', clientLabelPlural: 'Alumnos', enabledFichas: ['datosPersonales', 'fichaFitness', 'notasSeguimiento'] },
      'veterinaria':      { clientLabelSingular: 'Paciente', clientLabelPlural: 'Pacientes', enabledFichas: ['datosPersonales', 'fichaClinica', 'notasSeguimiento'] },
      'tatuajes-piercing': { clientLabelSingular: 'Cliente', clientLabelPlural: 'Clientes', enabledFichas: ['datosPersonales', 'fichaBelleza', 'notasSeguimiento'] },
      'educacion':        { clientLabelSingular: 'Alumno', clientLabelPlural: 'Alumnos', enabledFichas: ['datosPersonales', 'notasSeguimiento'] },
      'gastronomia':      { clientLabelSingular: 'Comensal', clientLabelPlural: 'Comensales', enabledFichas: ['datosPersonales', 'notasSeguimiento'] },
      'consultoria':      { clientLabelSingular: 'Cliente', clientLabelPlural: 'Clientes', enabledFichas: ['datosPersonales', 'notasSeguimiento'] },
      'deportes':         { clientLabelSingular: 'Cliente', clientLabelPlural: 'Clientes', enabledFichas: ['datosPersonales', 'notasSeguimiento'] },
      'espacios':         { clientLabelSingular: 'Usuario', clientLabelPlural: 'Usuarios', enabledFichas: ['datosPersonales', 'notasSeguimiento'] },
      'hospedaje':        { clientLabelSingular: 'Huesped', clientLabelPlural: 'Huespedes', enabledFichas: ['datosPersonales', 'notasSeguimiento'] },
      'alquiler':         { clientLabelSingular: 'Cliente', clientLabelPlural: 'Clientes', enabledFichas: ['datosPersonales', 'notasSeguimiento'] },
      'inmobiliarias':    { clientLabelSingular: 'Interesado', clientLabelPlural: 'Interesados', enabledFichas: ['datosPersonales', 'notasSeguimiento'] },
      'mercado':          { clientLabelSingular: 'Cliente', clientLabelPlural: 'Clientes', enabledFichas: ['datosPersonales', 'notasSeguimiento'] },
      // Mercado sub-rubros inherit mercado defaults
      ...Object.fromEntries(MERCADO_SUB_RUBROS.map(k => [k, { clientLabelSingular: 'Cliente', clientLabelPlural: 'Clientes', enabledFichas: ['datosPersonales', 'notasSeguimiento'] }])),
      // Gastro sub-rubros inherit gastronomia defaults
      ...Object.fromEntries(GASTRO_SUB_RUBROS.map(k => [k, { clientLabelSingular: 'Comensal', clientLabelPlural: 'Comensales', enabledFichas: ['datosPersonales', 'notasSeguimiento'] }])),
      'otro':             { clientLabelSingular: 'Cliente', clientLabelPlural: 'Clientes', enabledFichas: ['datosPersonales', 'notasSeguimiento'] },
    };

    // Build extra settings: rubro + bookingMode + terminology + fichas
    let extraSettings: Record<string, unknown> | undefined;
    if (industryConfig) {
      const rubroDefaults = RUBRO_DEFAULTS[industryConfig.rubro];
      extraSettings = {
        rubro: industryConfig.rubro,
        ...(industryConfig.bookingMode ? { bookingMode: industryConfig.bookingMode } : {}),
        ...(rubroDefaults || {}),
        hiddenSections: RUBRO_HIDDEN_SECTIONS[industryConfig.rubro] || [],
      };
    }

    // Create tenant first
    const publicPageLayout = industryConfig ? (RUBRO_LAYOUT[industryConfig.rubro] || 'service_first') : 'service_first';
    const tenant = await this.tenantsService.create(
      { name: tenantName, slug: tenantSlug, publicPageLayout },
      tenantType,
      extraSettings,
    );

    // Create user with tenant association
    const user = await this.usersService.create({
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name,
      role: 'OWNER',
      tenantId: tenant.id,
    });

    // Create trial subscription — use industry-specific plan or default
    const planSlug = industryConfig?.plan || 'profesional';
    this.subscriptionsService.createTrialSubscription(tenant.id, planSlug).catch((error) => {
      // Fallback to generic plan if industry plan not found
      if (planSlug !== 'profesional') {
        this.subscriptionsService.createTrialSubscription(tenant.id, 'profesional').catch(() => {});
      }
      this.logger.error(`Failed to create trial subscription for tenant ${tenant.id}: ${error.message}`);
    });

    // Seed example services/products based on industry (async, non-blocking)
    const rubro = extraSettings?.rubro as string || 'otro';
    this.seedOnboardingExamples(tenant.id, rubro).catch((error) => {
      this.logger.error(`Failed to seed onboarding examples for tenant ${tenant.id}: ${error.message}`);
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role, tenant.id, tenant.type);

    // Send verification email (async, don't block registration)
    this.emailVerificationService.sendVerificationEmail(user.id).catch((error) => {
      this.logger.error(`Failed to send verification email to ${user.email}: ${error.message}`);
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        type: tenant.type,
      },
      ...tokens,
    };
  }

  /**
   * Seeds example services or products for a new tenant based on their industry.
   * Products for 'mercado', services for everything else.
   */
  private async seedOnboardingExamples(tenantId: string, rubro: string): Promise<void> {
    const examples = getOnboardingExamples(rubro);

    const placeholderImage = examples.placeholderImage;

    if (examples.type === 'products' && examples.products) {
      for (let i = 0; i < examples.products.length; i++) {
        const p = examples.products[i];
        const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + crypto.randomBytes(2).toString('hex');
        const product = await this.prisma.product.create({
          data: {
            tenantId,
            name: p.name,
            slug,
            description: p.description,
            shortDescription: p.shortDescription,
            price: p.price,
            stock: p.stock,
            trackInventory: true,
            isActive: true,
            isFeatured: i === examples.products.length - 1, // last one featured
            order: i + 1,
          },
        });
        await this.prisma.productImage.create({
          data: {
            productId: product.id,
            url: placeholderImage,
            alt: p.name,
            order: 0,
            isPrimary: true,
          },
        });
      }
      this.logger.log(`Seeded ${examples.products.length} example products for tenant ${tenantId} (rubro: ${rubro})`);
    } else if (examples.services) {
      const imagesJson = JSON.stringify([{ url: placeholderImage, alt: 'Imagen de ejemplo' }]);
      for (let i = 0; i < examples.services.length; i++) {
        const s = examples.services[i];
        await this.prisma.service.create({
          data: {
            tenantId,
            name: s.name,
            description: s.description,
            price: s.price,
            duration: s.duration,
            capacity: 1,
            isActive: true,
            visibleOnPublicPage: true,
            order: i + 1,
            images: imagesJson,
            variations: '[]',
          },
        });
      }
      this.logger.log(`Seeded ${examples.services.length} example services for tenant ${tenantId} (rubro: ${rubro})`);
    }
  }

  // Dummy hash for constant-time response when user doesn't exist (prevents user enumeration)
  private readonly dummyHash = '$2a$12$000000000000000000000uGHEwMOxIEh0EECxGIGwVGHDITzSAZWy';

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    // Always run bcrypt.compare to prevent timing-based user enumeration
    const passwordToCompare = user?.password || this.dummyHash;
    const isPasswordValid = await bcrypt.compare(loginDto.password, passwordToCompare);

    if (!user || !user.isActive || !isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Fetch tenant type
    let tenantType = 'BUSINESS';
    if (user.tenantId) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: user.tenantId },
        select: { type: true },
      });
      if (tenant) {
        tenantType = tenant.type;
      }
    }

    // If user is EMPLOYEE, resolve employeeId and employeeRole
    let employeeId: string | undefined;
    let employeeRole: string | undefined;
    if (user.role === 'EMPLOYEE') {
      const employee = await this.prisma.employee.findUnique({
        where: { userId: user.id },
        select: { id: true, employeeRole: true },
      });
      if (employee) {
        employeeId = employee.id;
        employeeRole = employee.employeeRole;
      }
    }

    // Update lastLoginAt
    this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    }).catch(() => {});

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role,
      user.tenantId,
      tenantType,
      employeeId,
      employeeRole,
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        tenantType,
        ...(employeeId ? { employeeId, employeeRole } : {}),
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Check if this refresh token has been revoked (rotation check)
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { tokenHash },
      });

      if (storedToken?.revokedAt) {
        // Token was already used — possible token theft, revoke all user tokens
        await this.prisma.refreshToken.updateMany({
          where: { userId: payload.sub, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        this.logger.warn(`Refresh token reuse detected for user ${payload.sub} — all tokens revoked`);
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.usersService.findByIdSafe(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Revoke the current refresh token (it's being rotated)
      if (storedToken) {
        await this.prisma.refreshToken.update({
          where: { id: storedToken.id },
          data: { revokedAt: new Date() },
        });
      }

      // Fetch tenant type
      let tenantType = 'BUSINESS';
      if (user.tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
          where: { id: user.tenantId },
          select: { type: true },
        });
        if (tenant) {
          tenantType = tenant.type;
        }
      }

      // Resolve employee info for EMPLOYEE users
      let employeeId: string | undefined;
      let employeeRole: string | undefined;
      if (user.role === 'EMPLOYEE') {
        const employee = await this.prisma.employee.findUnique({
          where: { userId: user.id },
          select: { id: true, employeeRole: true },
        });
        if (employee) {
          employeeId = employee.id;
          employeeRole = employee.employeeRole;
        }
      }

      return this.generateTokens(user.id, user.email, user.role, user.tenantId, tenantType, employeeId, employeeRole);
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(userId: string) {
    const user = await this.usersService.findByIdSafe(userId);
    if (!user || !user.isActive) {
      return null;
    }
    return user;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.usersService.updatePassword(userId, hashedPassword);

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(email: string) {
    // Always return success to avoid email enumeration
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.isActive) {
      return { message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña' };
    }

    // Generate token and store hashed version (plain token sent via email only)
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    // Delete existing tokens for this user
    await this.prisma.passwordReset.deleteMany({
      where: { userId: user.id },
    });

    // Store hashed token in DB — if DB leaks, tokens are not usable
    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt,
      },
    });

    // Send email
    const appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    this.sendPasswordResetEmail(user.email, user.name, resetUrl).catch((error) => {
      this.logger.error(`Failed to send password reset email to ${user.email}: ${error.message}`);
    });

    this.logger.log(`Password reset email sent to ${user.email}`);

    return { message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña' };
  }

  async resetPassword(token: string, newPassword: string) {
    // Hash the incoming token to compare against stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const resetRecord = await this.prisma.passwordReset.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });

    if (!resetRecord) {
      throw new BadRequestException('El enlace es inválido o ha expirado');
    }

    if (resetRecord.used) {
      throw new BadRequestException('Este enlace ya fue utilizado');
    }

    if (new Date() > resetRecord.expiresAt) {
      throw new BadRequestException('El enlace ha expirado. Solicita uno nuevo.');
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true, usedAt: new Date() },
      }),
    ]);

    this.logger.log(`Password reset successful for user ${resetRecord.userId}`);

    return { message: 'Contraseña actualizada correctamente' };
  }

  private async sendPasswordResetEmail(to: string, name: string, resetUrl: string): Promise<void> {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    const fromEmail = this.configService.get<string>('EMAIL_FROM') || 'noreply@turnolink.com';

    if (!resendApiKey) {
      this.logger.warn('RESEND_API_KEY not configured, skipping email');
      return;
    }

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Restablecer contraseña - TurnoLink</title>
  <!--[if mso]>
  <style type="text/css">
    table { border-collapse: collapse; }
    .button-link { padding: 18px 48px !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; width: 100%; -webkit-font-smoothing: antialiased; background-color: #f3f4f6;">
  <!-- Preview text -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    Restablece tu contraseña de TurnoLink
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 16px;">

        <!-- Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px;">

          <!-- Card -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

              <!-- Header with integrated logo -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #3F8697 0%, #346E7D 100%); padding: 32px 32px 36px;">
                    <!-- Logo -->
                    <img src="https://turnolink.com.ar/logo-email-white.png" alt="TurnoLink" width="120" style="display: block; height: auto; border: 0; margin: 0 auto 24px; opacity: 0.9;" />
                    <!-- Icon circle -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" width="52" height="52" style="background-color: rgba(255,255,255,0.15); border-radius: 26px; vertical-align: middle; font-size: 26px;">
                          &#128274;
                        </td>
                      </tr>
                    </table>
                    <h1 style="margin: 14px 0 0 0; padding: 0; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 21px; font-weight: 600; line-height: 1.3;">
                      Restablecer contraseña
                    </h1>
                  </td>
                </tr>
              </table>

              <!-- Body -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding: 40px 32px;">

                    <!-- Greeting -->
                    <p style="margin: 0 0 6px 0; padding: 0; color: #9ca3af; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                      Hola de nuevo
                    </p>
                    <h2 style="margin: 0 0 20px 0; padding: 0; color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 24px; font-weight: 700; line-height: 1.3;">
                      ${name}
                    </h2>

                    <!-- Message -->
                    <p style="margin: 0 0 32px 0; padding: 0; color: #4b5563; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 15px; line-height: 1.6;">
                      Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón para crear una nueva contraseña.
                    </p>

                    <!-- CTA Button -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" style="padding-bottom: 32px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td align="center" style="background: linear-gradient(135deg, #3F8697 0%, #346E7D 100%); border-radius: 12px;">
                                <a href="${resetUrl}" target="_blank" class="button-link" style="display: inline-block; padding: 16px 40px; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 15px; font-weight: 600; text-decoration: none; text-align: center;">
                                  Restablecer contraseña &rarr;
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Link fallback box -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="background-color: #f9fafb; border-radius: 10px; padding: 16px;">
                          <p style="margin: 0 0 8px 0; padding: 0; color: #6b7280; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 12px; line-height: 1.4;">
                            ¿El botón no funciona? Copia y pega este enlace:
                          </p>
                          <a href="${resetUrl}" target="_blank" style="color: #3F8697; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 12px; line-height: 1.4; word-break: break-all; text-decoration: none;">
                            ${resetUrl}
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Expiration notice -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-top: 24px; border-top: 1px solid #e5e7eb; margin-top: 24px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="28" valign="middle" style="padding-right: 10px;">
                                <span style="font-size: 18px; line-height: 1;">&#9200;</span>
                              </td>
                              <td valign="middle">
                                <p style="margin: 0; padding: 0; color: #9ca3af; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 13px; line-height: 1.4;">
                                  Este enlace expira en <strong style="color: #6b7280;">1 hora</strong>
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 32px 16px;">
              <p style="margin: 0 0 8px 0; padding: 0; color: #9ca3af; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 12px; line-height: 1.5;">
                Si no solicitaste restablecer tu contraseña, puedes ignorar este email.
              </p>
              <p style="margin: 0; padding: 0; color: #d1d5db; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 11px; line-height: 1.5;">
                &copy; ${new Date().getFullYear()} TurnoLink &middot; Sistema de turnos online
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: `TurnoLink <${fromEmail}>`,
          to: [to],
          subject: 'Restablecer contraseña - TurnoLink',
          html,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Failed to send password reset email: ${error}`);
      }
    } catch (error) {
      this.logger.error(`Error sending password reset email: ${error}`);
    }
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
    tenantId: string | null,
    tenantType?: string,
    employeeId?: string,
    employeeRole?: string,
  ) {
    const payload: Record<string, unknown> = {
      sub: userId,
      email,
      role,
      tenantId,
      tenantType: tenantType || 'BUSINESS',
    };

    if (employeeId) {
      payload.employeeId = employeeId;
      payload.employeeRole = employeeRole || 'STAFF';
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    // Store refresh token hash for rotation tracking
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    }).catch((err) => {
      this.logger.error(`Failed to store refresh token: ${err.message}`);
    });

    // Cleanup expired tokens (async, non-blocking)
    this.prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    }).catch(() => {});

    return {
      accessToken,
      refreshToken,
    };
  }

  async acceptInvitation(token: string, name: string, email: string, password: string) {
    const invitation = await this.prisma.employeeInvitation.findUnique({
      where: { token },
      include: { employee: true, tenant: true },
    });

    if (!invitation) {
      throw new BadRequestException('Invitación inválida o expirada');
    }

    if (invitation.acceptedAt) {
      throw new BadRequestException('Esta invitación ya fue aceptada');
    }

    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('Esta invitación ha expirado');
    }

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);

    let userId: string;
    let userEmail: string;
    let userName: string;

    if (existingUser) {
      // Check this user is not already linked to another employee
      const existingLink = await this.prisma.employee.findUnique({
        where: { userId: existingUser.id },
      });
      if (existingLink) {
        throw new ConflictException('Este usuario ya está vinculado a otro empleado');
      }
      userId = existingUser.id;
      userEmail = existingUser.email;
      userName = existingUser.name;
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = await this.usersService.create({
        email,
        password: hashedPassword,
        name,
        role: 'EMPLOYEE',
        tenantId: invitation.tenantId,
      });
      userId = newUser.id;
      userEmail = newUser.email;
      userName = newUser.name;
    }

    const resolvedUser = { id: userId, email: userEmail, name: userName };

    // Link employee to user and accept invitation
    await this.prisma.$transaction([
      this.prisma.employee.update({
        where: { id: invitation.employeeId },
        data: {
          userId: resolvedUser.id,
          employeeRole: invitation.role,
          email: email,
        },
      }),
      this.prisma.employeeInvitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: resolvedUser.id },
        data: {
          role: 'EMPLOYEE',
          tenantId: invitation.tenantId,
          lastLoginAt: new Date(),
        },
      }),
    ]);

    // Generate tokens with employee info
    const tokens = await this.generateTokens(
      resolvedUser.id,
      resolvedUser.email,
      'EMPLOYEE',
      invitation.tenantId,
      invitation.tenant.type,
      invitation.employeeId,
      invitation.role,
    );

    return {
      user: {
        id: resolvedUser.id,
        email: resolvedUser.email,
        name: resolvedUser.name || name,
        role: 'EMPLOYEE',
        tenantId: invitation.tenantId,
        tenantType: invitation.tenant.type,
        employeeId: invitation.employeeId,
        employeeRole: invitation.role,
      },
      tenant: {
        id: invitation.tenant.id,
        name: invitation.tenant.name,
        slug: invitation.tenant.slug,
        type: invitation.tenant.type,
      },
      ...tokens,
    };
  }
}
