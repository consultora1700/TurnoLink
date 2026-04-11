/**
 * Seed industry groups and plans
 * Run: cd apps/api && npx ts-node src/prisma/seed-industry-plans.ts
 */
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding industry groups and plans...\n');

  // Deactivate old generic plans (keep for existing subscriptions)
  const deactivated = await prisma.subscriptionPlan.updateMany({
    where: { slug: { in: ['gratis', 'profesional', 'negocio'] } },
    data: { isActive: false },
  });
  console.log(`⏸️  Deactivated ${deactivated.count} generic plans`);

  const groups = [
    {
      slug: 'belleza',
      name: 'Belleza & Bienestar',
      description: 'Peluquerías, barberías, centros de estética, spas y más',
      industries: JSON.stringify([
        'peluquerias', 'barberias', 'centros-de-estetica', 'unas-nail-bars',
        'pestanas-y-cejas', 'depilacion', 'spa-y-relax', 'masajes',
        'bronceado', 'cosmetologia',
      ]),
      limitLabels: JSON.stringify({
        maxEmployees: 'estilistas',
        maxBranches: 'sucursales',
        maxBookingsMonth: 'turnos/mes',
        maxCustomers: 'clientes',
        maxServices: 'servicios',
      }),
      order: 0,
      plans: [
        {
          name: 'Gratis', slug: 'belleza-gratis',
          description: 'Ideal para empezar con tu salón',
          priceMonthly: 0, priceYearly: 0, trialDays: 0,
          maxBranches: 1, maxEmployees: 2, maxServices: 5,
          maxBookingsMonth: 30, maxCustomers: 50,
          features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'basic_reports'],
          isPopular: false, order: 0,
        },
        {
          name: 'Profesional', slug: 'belleza-profesional',
          description: 'Para salones en crecimiento',
          priceMonthly: 14999, priceYearly: 149990, trialDays: 14,
          maxBranches: 1, maxEmployees: 5, maxServices: 20,
          maxBookingsMonth: null, maxCustomers: 500,
          features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'advanced_reports', 'finance_module', 'mercadopago', 'whatsapp_support', 'employee_portal', 'seo_custom'],
          isPopular: true, order: 1,
        },
        {
          name: 'Business', slug: 'belleza-business',
          description: 'Para cadenas y franquicias',
          priceMonthly: 29999, priceYearly: 299990, trialDays: 14,
          maxBranches: 5, maxEmployees: 15, maxServices: null as number | null,
          maxBookingsMonth: null as number | null, maxCustomers: null as number | null,
          features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'complete_reports', 'finance_module', 'mercadopago', 'priority_support', 'multi_branch', 'api_access', 'employee_portal', 'employee_portal_advanced', 'seo_custom', 'seo_rich_snippets'],
          isPopular: false, order: 2,
        },
      ],
    },
    {
      slug: 'salud',
      name: 'Salud & Profesionales',
      description: 'Consultorios, clínicas, profesionales de salud',
      industries: JSON.stringify([
        'consultorios-medicos', 'odontologos', 'nutricionistas',
        'kinesiologos', 'fonoaudiologos', 'psicologos',
        'abogados', 'contadores', 'escribanos',
      ]),
      limitLabels: JSON.stringify({
        maxEmployees: 'profesionales',
        maxBranches: 'consultorios',
        maxBookingsMonth: 'sesiones/mes',
        maxCustomers: 'pacientes',
        maxServices: 'servicios',
      }),
      order: 1,
      plans: [
        {
          name: 'Starter', slug: 'salud-starter',
          description: 'Para profesionales independientes',
          priceMonthly: 16990, priceYearly: 169900, trialDays: 14,
          maxBranches: 1, maxEmployees: 1, maxServices: null as number | null,
          maxBookingsMonth: null as number | null, maxCustomers: null as number | null,
          features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'basic_reports', 'ficha_paciente'],
          isPopular: false, order: 0,
        },
        {
          name: 'Profesional', slug: 'salud-profesional',
          description: 'Para consultorios con equipo',
          priceMonthly: 29990, priceYearly: 299900, trialDays: 14,
          maxBranches: 2, maxEmployees: 5, maxServices: null as number | null,
          maxBookingsMonth: null as number | null, maxCustomers: null as number | null,
          features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'advanced_reports', 'finance_module', 'mercadopago', 'whatsapp_support', 'ficha_paciente', 'videollamada', 'employee_portal'],
          isPopular: true, order: 1,
        },
        {
          name: 'Clínica', slug: 'salud-clinica',
          description: 'Para clínicas y centros médicos',
          priceMonthly: 49990, priceYearly: 499900, trialDays: 14,
          maxBranches: null as number | null, maxEmployees: null as number | null, maxServices: null as number | null,
          maxBookingsMonth: null as number | null, maxCustomers: null as number | null,
          features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'complete_reports', 'finance_module', 'mercadopago', 'priority_support', 'multi_branch', 'api_access', 'ficha_paciente', 'videollamada', 'employee_portal', 'employee_portal_advanced'],
          isPopular: false, order: 2,
        },
      ],
    },
    {
      slug: 'deportes',
      name: 'Deportes & Recreación',
      description: 'Canchas, gimnasios, estudios de danza y más',
      industries: JSON.stringify([
        'canchas-de-futbol', 'canchas-de-padel', 'canchas-de-tenis',
        'canchas-de-basquet', 'estudios-de-danza', 'gimnasios',
        'entrenadores-personales', 'salas-de-ensayo', 'estudios-de-grabacion',
      ]),
      limitLabels: JSON.stringify({
        maxEmployees: null,
        maxBranches: 'espacios',
        maxBookingsMonth: 'reservas/mes',
        maxCustomers: 'socios',
        maxServices: 'servicios',
      }),
      order: 2,
      plans: [
        {
          name: 'Gratis', slug: 'deportes-gratis',
          description: 'Ideal para empezar con tu espacio',
          priceMonthly: 0, priceYearly: 0, trialDays: 0,
          maxBranches: 1, maxEmployees: 1, maxServices: 5,
          maxBookingsMonth: 30, maxCustomers: 50,
          features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'basic_reports'],
          isPopular: false, order: 0,
        },
        {
          name: 'Profesional', slug: 'deportes-profesional',
          description: 'Para centros deportivos en crecimiento',
          priceMonthly: 14999, priceYearly: 149990, trialDays: 14,
          maxBranches: 5, maxEmployees: 5, maxServices: null as number | null,
          maxBookingsMonth: null as number | null, maxCustomers: 500,
          features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'advanced_reports', 'finance_module', 'mercadopago', 'whatsapp_support', 'employee_portal'],
          isPopular: true, order: 1,
        },
        {
          name: 'Business', slug: 'deportes-business',
          description: 'Para complejos deportivos',
          priceMonthly: 29999, priceYearly: 299990, trialDays: 14,
          maxBranches: null as number | null, maxEmployees: null as number | null, maxServices: null as number | null,
          maxBookingsMonth: null as number | null, maxCustomers: null as number | null,
          features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'complete_reports', 'finance_module', 'mercadopago', 'priority_support', 'multi_branch', 'api_access', 'employee_portal', 'employee_portal_advanced'],
          isPopular: false, order: 2,
        },
      ],
    },
    {
      slug: 'hospedaje-por-horas',
      name: 'Hospedaje por Horas',
      description: 'Albergues transitorios, hoteles por turno, hostels',
      industries: JSON.stringify([
        'albergues-transitorios', 'hoteles-por-turno', 'hostels',
        'habitaciones-12hs', 'boxes-privados',
      ]),
      limitLabels: JSON.stringify({
        maxEmployees: null,
        maxBranches: 'sucursales',
        maxBookingsMonth: 'reservas/mes',
        maxCustomers: 'clientes',
        maxServices: 'habitaciones',
      }),
      order: 3,
      plans: [
        {
          name: 'Gratis', slug: 'hospedaje-gratis',
          description: 'Ideal para empezar',
          priceMonthly: 0, priceYearly: 0, trialDays: 0,
          maxBranches: 1, maxEmployees: 1, maxServices: 5,
          maxBookingsMonth: 30, maxCustomers: 50,
          features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'basic_reports'],
          isPopular: false, order: 0,
        },
        {
          name: 'Profesional', slug: 'hospedaje-profesional',
          description: 'Para hoteles en crecimiento',
          priceMonthly: 14999, priceYearly: 149990, trialDays: 14,
          maxBranches: 1, maxEmployees: 5, maxServices: 10,
          maxBookingsMonth: null as number | null, maxCustomers: 500,
          features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'advanced_reports', 'finance_module', 'mercadopago', 'whatsapp_support', 'employee_portal'],
          isPopular: true, order: 1,
        },
        {
          name: 'Business', slug: 'hospedaje-business',
          description: 'Para cadenas de hospedaje',
          priceMonthly: 29999, priceYearly: 299990, trialDays: 14,
          maxBranches: null as number | null, maxEmployees: null as number | null, maxServices: null as number | null,
          maxBookingsMonth: null as number | null, maxCustomers: null as number | null,
          features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'complete_reports', 'finance_module', 'mercadopago', 'priority_support', 'multi_branch', 'api_access', 'employee_portal', 'employee_portal_advanced'],
          isPopular: false, order: 2,
        },
      ],
    },
    {
      slug: 'alquiler-temporario',
      name: 'Alquiler Temporario',
      description: 'Casas quinta, cabañas, departamentos temporarios',
      industries: JSON.stringify([
        'casas-quinta', 'cabanas', 'departamentos-temporarios',
        'campos-y-estancias', 'salones-de-eventos', 'quinchos',
        'espacios-para-eventos',
      ]),
      limitLabels: JSON.stringify({
        maxEmployees: null,
        maxBranches: 'propiedades',
        maxBookingsMonth: 'reservas/mes',
        maxCustomers: 'huéspedes',
        maxServices: 'servicios',
      }),
      order: 4,
      plans: [
        {
          name: 'Gratis', slug: 'alquiler-gratis',
          description: 'Ideal para empezar con tu propiedad',
          priceMonthly: 0, priceYearly: 0, trialDays: 0,
          maxBranches: 1, maxEmployees: 1, maxServices: 5,
          maxBookingsMonth: 30, maxCustomers: 50,
          features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'basic_reports'],
          isPopular: false, order: 0,
        },
        {
          name: 'Profesional', slug: 'alquiler-profesional',
          description: 'Para administradores de propiedades',
          priceMonthly: 14999, priceYearly: 149990, trialDays: 14,
          maxBranches: 5, maxEmployees: 5, maxServices: null as number | null,
          maxBookingsMonth: null as number | null, maxCustomers: 500,
          features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'advanced_reports', 'finance_module', 'mercadopago', 'whatsapp_support', 'employee_portal'],
          isPopular: true, order: 1,
        },
        {
          name: 'Business', slug: 'alquiler-business',
          description: 'Para empresas de alquiler',
          priceMonthly: 29999, priceYearly: 299990, trialDays: 14,
          maxBranches: null as number | null, maxEmployees: null as number | null, maxServices: null as number | null,
          maxBookingsMonth: null as number | null, maxCustomers: null as number | null,
          features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'complete_reports', 'finance_module', 'mercadopago', 'priority_support', 'multi_branch', 'api_access', 'employee_portal', 'employee_portal_advanced'],
          isPopular: false, order: 2,
        },
      ],
    },
    {
      slug: 'mercado',
      name: 'Mercado & Catálogos',
      description: 'Tiendas online, catálogos de productos, inmobiliarias, emprendedores',
      industries: JSON.stringify([
        'tiendas-online', 'ropa-y-accesorios', 'inmobiliarias',
        'alimentos-y-bebidas', 'artesanias', 'productos-naturales',
        'electronica', 'libreria-y-papeleria', 'joyeria',
        'decoracion', 'jugueteria', 'cosmeticos',
      ]),
      limitLabels: JSON.stringify({
        maxEmployees: 'vendedores',
        maxBranches: 'sucursales',
        maxBookingsMonth: 'consultas/mes',
        maxCustomers: 'clientes',
        maxServices: 'productos',
        maxPhotos: 'fotos',
      }),
      order: 6,
      plans: [
        {
          name: 'Vitrina', slug: 'mercado-vitrina',
          description: 'Tu catálogo online gratis',
          priceMonthly: 0, priceYearly: 0, trialDays: 0,
          maxBranches: 1, maxEmployees: 1, maxServices: 15,
          maxBookingsMonth: 30, maxCustomers: 50, maxPhotos: 500,
          features: ['whatsapp_catalog', 'basic_reports', 'show_ads', 'stock_management'],
          isPopular: false, order: 0,
        },
        {
          name: 'Comercio', slug: 'mercado-comercio',
          description: 'Vendé y cobrá desde tu página',
          priceMonthly: 9990, priceYearly: 99900, trialDays: 14,
          maxBranches: 2, maxEmployees: 3, maxServices: 50,
          maxBookingsMonth: null as number | null, maxCustomers: 500, maxPhotos: 3000,
          features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'advanced_reports', 'finance_module', 'mercadopago', 'whatsapp_support', 'stock_management', 'whatsapp_catalog', 'employee_portal', 'seo_custom', 'online_payments'],
          isPopular: true, order: 1,
        },
        {
          name: 'Tienda Pro', slug: 'mercado-tienda-pro',
          description: 'E-commerce completo para tu negocio',
          priceMonthly: 19990, priceYearly: 199900, trialDays: 14,
          maxBranches: null as number | null, maxEmployees: null as number | null, maxServices: null as number | null,
          maxBookingsMonth: null as number | null, maxCustomers: null as number | null, maxPhotos: null as number | null,
          features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'complete_reports', 'finance_module', 'mercadopago', 'priority_support', 'multi_branch', 'api_access', 'stock_management', 'whatsapp_catalog', 'employee_portal', 'employee_portal_advanced', 'seo_custom', 'seo_rich_snippets', 'seo_product', 'online_payments', 'ecommerce_cart', 'coupons', 'shipping'],
          isPopular: false, order: 2,
        },
      ],
    },
    {
      slug: 'espacios-flexibles',
      name: 'Espacios Flexibles',
      description: 'Coworking, oficinas por hora, salas de reuniones',
      industries: JSON.stringify([
        'coworking', 'oficinas-por-hora', 'salas-de-reuniones',
        'boxes-profesionales', 'estudios-compartidos',
      ]),
      limitLabels: JSON.stringify({
        maxEmployees: null,
        maxBranches: 'ubicaciones',
        maxBookingsMonth: 'reservas/mes',
        maxCustomers: 'miembros',
        maxServices: 'tipos de espacio',
      }),
      order: 5,
      plans: [
        {
          name: 'Gratis', slug: 'espacios-gratis',
          description: 'Ideal para empezar con tu espacio',
          priceMonthly: 0, priceYearly: 0, trialDays: 0,
          maxBranches: 1, maxEmployees: 1, maxServices: 5,
          maxBookingsMonth: 30, maxCustomers: 50,
          features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'basic_reports'],
          isPopular: false, order: 0,
        },
        {
          name: 'Profesional', slug: 'espacios-profesional',
          description: 'Para espacios en crecimiento',
          priceMonthly: 14999, priceYearly: 149990, trialDays: 14,
          maxBranches: 1, maxEmployees: 5, maxServices: null as number | null,
          maxBookingsMonth: null as number | null, maxCustomers: 500,
          features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'advanced_reports', 'finance_module', 'mercadopago', 'whatsapp_support', 'employee_portal'],
          isPopular: true, order: 1,
        },
        {
          name: 'Business', slug: 'espacios-business',
          description: 'Para redes de espacios',
          priceMonthly: 29999, priceYearly: 299990, trialDays: 14,
          maxBranches: null as number | null, maxEmployees: null as number | null, maxServices: null as number | null,
          maxBookingsMonth: null as number | null, maxCustomers: null as number | null,
          features: ['whatsapp_confirmation', 'email_reminder', 'calendar', 'complete_reports', 'finance_module', 'mercadopago', 'priority_support', 'multi_branch', 'api_access', 'employee_portal', 'employee_portal_advanced'],
          isPopular: false, order: 2,
        },
      ],
    },
  ];

  for (const groupData of groups) {
    const { plans, ...groupFields } = groupData;

    const group = await prisma.industryGroup.upsert({
      where: { slug: groupFields.slug },
      create: { ...groupFields, isActive: true },
      update: { ...groupFields },
    });

    console.log(`\n📦 ${group.name}`);

    for (const p of plans) {
      await prisma.subscriptionPlan.upsert({
        where: { slug: p.slug },
        create: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          priceMonthly: new Prisma.Decimal(p.priceMonthly),
          priceYearly: new Prisma.Decimal(p.priceYearly),
          currency: 'ARS',
          trialDays: p.trialDays,
          maxBranches: p.maxBranches,
          maxEmployees: p.maxEmployees,
          maxServices: p.maxServices,
          maxBookingsMonth: p.maxBookingsMonth,
          maxCustomers: p.maxCustomers,
          maxPhotos: (p as any).maxPhotos ?? null,
          features: JSON.stringify(p.features),
          isPopular: p.isPopular,
          isActive: true,
          order: p.order,
          industryGroupId: group.id,
        },
        update: {
          name: p.name,
          description: p.description,
          priceMonthly: new Prisma.Decimal(p.priceMonthly),
          priceYearly: new Prisma.Decimal(p.priceYearly),
          trialDays: p.trialDays,
          maxBranches: p.maxBranches,
          maxEmployees: p.maxEmployees,
          maxServices: p.maxServices,
          maxBookingsMonth: p.maxBookingsMonth,
          maxCustomers: p.maxCustomers,
          maxPhotos: (p as any).maxPhotos ?? null,
          features: JSON.stringify(p.features),
          isPopular: p.isPopular,
          isActive: true,
          order: p.order,
          industryGroupId: group.id,
        },
      });
      const priceStr = p.priceMonthly === 0 ? 'Gratis' : `$${p.priceMonthly.toLocaleString()}/mes`;
      console.log(`   ✅ ${p.name} (${priceStr})`);
    }
  }

  const totalGroups = await prisma.industryGroup.count();
  const totalPlans = await prisma.subscriptionPlan.count({ where: { isActive: true } });
  console.log(`\n🎉 Done! ${totalGroups} groups, ${totalPlans} active plans\n`);
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
