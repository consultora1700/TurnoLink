import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const STANDARD_SCHEDULE = [
  { dayOfWeek: 0, startTime: '09:00', endTime: '20:00', isActive: false },
  { dayOfWeek: 1, startTime: '09:00', endTime: '20:00', isActive: true },
  { dayOfWeek: 2, startTime: '09:00', endTime: '20:00', isActive: true },
  { dayOfWeek: 3, startTime: '09:00', endTime: '20:00', isActive: true },
  { dayOfWeek: 4, startTime: '09:00', endTime: '20:00', isActive: true },
  { dayOfWeek: 5, startTime: '09:00', endTime: '20:00', isActive: true },
  { dayOfWeek: 6, startTime: '09:00', endTime: '14:00', isActive: true },
];

async function main() {
  const passwordHash = await bcrypt.hash('demo123456', 10);

  // Find the gratis plan
  const gratisPlan = await prisma.subscriptionPlan.findFirst({ where: { name: 'Gratis' } });
  if (!gratisPlan) {
    console.error('❌ Gratis plan not found. Run main seed first.');
    return;
  }

  // ============================================================
  // 1. CREATE "Pádel & Fútbol Sur" (deportes)
  // ============================================================
  console.log('\n🏟️ Creating Pádel & Fútbol Sur...');

  const padelTenant = await prisma.tenant.upsert({
    where: { slug: 'padel-futbol-sur' },
    update: {
      name: 'Pádel & Fútbol Sur',
      description: 'Complejo deportivo con canchas de pádel, fútbol 5, fútbol 7, tenis y básquet. Clases grupales y alquiler de equipamiento.',
      logo: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=400&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1600&h=600&fit=crop',
      phone: '+54 11 5555-3001',
      email: 'hola@padelfutbolsur.com',
      address: 'Av. del Libertador 8200',
      city: 'Buenos Aires',
      instagram: '@padelfutbolsur',
      settings: JSON.stringify({
        timezone: 'America/Argentina/Buenos_Aires',
        currency: 'ARS',
        language: 'es',
        bookingBuffer: 15,
        maxAdvanceBookingDays: 30,
        minAdvanceBookingHours: 1,
        allowCancellation: true,
        cancellationHoursLimit: 12,
        showPrices: true,
        requirePhone: true,
        requireEmail: false,
        requireDeposit: true,
        depositPercentage: 50,
        depositMode: 'simulated',
        primaryColor: '#22C55E',
        secondaryColor: '#065F46',
        heroStyle: 'energetic',
      }),
    },
    create: {
      slug: 'padel-futbol-sur',
      name: 'Pádel & Fútbol Sur',
      description: 'Complejo deportivo con canchas de pádel, fútbol 5, fútbol 7, tenis y básquet. Clases grupales y alquiler de equipamiento.',
      logo: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=400&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1600&h=600&fit=crop',
      phone: '+54 11 5555-3001',
      email: 'hola@padelfutbolsur.com',
      address: 'Av. del Libertador 8200',
      city: 'Buenos Aires',
      instagram: '@padelfutbolsur',
      status: 'ACTIVE',
      settings: JSON.stringify({
        timezone: 'America/Argentina/Buenos_Aires',
        currency: 'ARS',
        language: 'es',
        bookingBuffer: 15,
        maxAdvanceBookingDays: 30,
        minAdvanceBookingHours: 1,
        allowCancellation: true,
        cancellationHoursLimit: 12,
        showPrices: true,
        requirePhone: true,
        requireEmail: false,
        requireDeposit: true,
        depositPercentage: 50,
        depositMode: 'simulated',
        primaryColor: '#22C55E',
        secondaryColor: '#065F46',
        heroStyle: 'energetic',
      }),
    },
  });
  console.log(`  ✅ Tenant: ${padelTenant.id}`);

  // Owner
  await prisma.user.upsert({
    where: { email: 'demo@padelfutbolsur.com' },
    update: { name: 'Martín Giménez', tenantId: padelTenant.id },
    create: {
      email: 'demo@padelfutbolsur.com',
      password: passwordHash,
      name: 'Martín Giménez',
      role: 'OWNER',
      tenantId: padelTenant.id,
      isActive: true,
    },
  });

  // Branding
  await prisma.tenantBranding.upsert({
    where: { tenantId: padelTenant.id },
    update: {
      primaryColor: '#22C55E',
      secondaryColor: '#065F46',
      accentColor: '#FCD34D',
      backgroundStyle: 'vibrant',
      welcomeTitle: 'Pádel & Fútbol Sur',
      welcomeSubtitle: 'Reservá tu cancha en segundos',
      logoUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=400&fit=crop',
      coverImageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1600&h=600&fit=crop',
      showPrices: true,
    },
    create: {
      tenantId: padelTenant.id,
      primaryColor: '#22C55E',
      secondaryColor: '#065F46',
      accentColor: '#FCD34D',
      backgroundStyle: 'vibrant',
      welcomeTitle: 'Pádel & Fútbol Sur',
      welcomeSubtitle: 'Reservá tu cancha en segundos',
      logoUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=400&fit=crop',
      coverImageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1600&h=600&fit=crop',
      showPrices: true,
    },
  });

  // Subscription
  const existingPadelSub = await prisma.subscription.findUnique({ where: { tenantId: padelTenant.id } });
  if (!existingPadelSub) {
    await prisma.subscription.create({
      data: {
        tenantId: padelTenant.id,
        planId: gratisPlan.id,
        status: 'ACTIVE',
        billingPeriod: 'MONTHLY',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Categories
  const padelCategories = [
    { name: 'Canchas', order: 0 },
    { name: 'Clases & Escuelitas', order: 1 },
    { name: 'Alquiler de Equipos', order: 2 },
  ];
  const padelCatIds: string[] = [];
  for (const cat of padelCategories) {
    const existing = await prisma.serviceCategory.findFirst({ where: { tenantId: padelTenant.id, name: cat.name } });
    if (existing) {
      padelCatIds.push(existing.id);
    } else {
      const created = await prisma.serviceCategory.create({ data: { tenantId: padelTenant.id, ...cat } });
      padelCatIds.push(created.id);
    }
  }

  // Services
  const padelServices = [
    { name: 'Cancha Pádel', description: 'Cancha de pádel cubierta con iluminación LED profesional.', price: 8000, duration: 60, image: 'https://images.unsplash.com/photo-1612534847738-b3af3b7c3e57?w=600&h=400&fit=crop', categoryIdx: 0, order: 0 },
    { name: 'Cancha Fútbol 5', description: 'Cancha de césped sintético con vestuarios y duchas.', price: 15000, duration: 60, image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600&h=400&fit=crop', categoryIdx: 0, order: 1 },
    { name: 'Cancha Fútbol 7', description: 'Cancha de fútbol 7 con césped sintético de última generación.', price: 22000, duration: 90, image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&h=400&fit=crop', categoryIdx: 0, order: 2 },
    { name: 'Cancha Tenis', description: 'Cancha de polvo de ladrillo con red profesional.', price: 7000, duration: 60, image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&h=400&fit=crop', categoryIdx: 0, order: 3 },
    { name: 'Turno Básquet', description: 'Media cancha de básquet techada.', price: 10000, duration: 60, image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=400&fit=crop', categoryIdx: 0, order: 4 },
    { name: 'Clase Grupal Pádel', description: 'Clase de pádel para principiantes e intermedios. Grupos de hasta 8 personas.', price: 5000, duration: 90, image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&h=400&fit=crop', categoryIdx: 1, order: 5 },
    { name: 'Escuelita Fútbol Infantil', description: 'Escuela de fútbol para chicos de 5 a 12 años. Técnica y diversión.', price: 4500, duration: 60, image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&h=400&fit=crop', categoryIdx: 1, order: 6 },
    { name: 'Alquiler Paletas Pádel', description: 'Paletas profesionales Bullpadel y Head disponibles para alquilar.', price: 2000, duration: 30, image: 'https://images.unsplash.com/photo-1612534847738-b3af3b7c3e57?w=600&h=400&fit=crop', categoryIdx: 2, order: 7 },
  ];

  for (const svc of padelServices) {
    const existing = await prisma.service.findFirst({ where: { tenantId: padelTenant.id, name: svc.name } });
    if (!existing) {
      await prisma.service.create({
        data: {
          tenantId: padelTenant.id,
          categoryId: padelCatIds[svc.categoryIdx],
          name: svc.name,
          description: svc.description,
          price: svc.price,
          duration: svc.duration,
          image: svc.image,
          isActive: true,
          order: svc.order,
        },
      });
    }
  }

  // Schedules
  for (const schedule of STANDARD_SCHEDULE) {
    await prisma.schedule.upsert({
      where: { tenantId_dayOfWeek: { tenantId: padelTenant.id, dayOfWeek: schedule.dayOfWeek } },
      update: schedule,
      create: { tenantId: padelTenant.id, ...schedule },
    });
  }
  console.log('  ✅ Pádel & Fútbol Sur complete');

  // ============================================================
  // 2. CREATE "WorkHub Coworking" (espacios flexibles)
  // ============================================================
  console.log('\n🏢 Creating WorkHub Coworking...');

  const workhubTenant = await prisma.tenant.upsert({
    where: { slug: 'workhub-coworking' },
    update: {
      name: 'WorkHub Coworking',
      description: 'Espacios de trabajo flexibles en el corazón de Buenos Aires. Hot desks, oficinas privadas, salas de reuniones y espacios para eventos.',
      logo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1600&h=600&fit=crop',
      phone: '+54 11 5555-4001',
      email: 'hola@workhubco.com',
      address: 'Av. Corrientes 1234, Piso 8',
      city: 'Buenos Aires',
      instagram: '@workhubco',
      settings: JSON.stringify({
        timezone: 'America/Argentina/Buenos_Aires',
        currency: 'ARS',
        language: 'es',
        bookingBuffer: 15,
        maxAdvanceBookingDays: 60,
        minAdvanceBookingHours: 2,
        allowCancellation: true,
        cancellationHoursLimit: 24,
        showPrices: true,
        requirePhone: true,
        requireEmail: true,
        requireDeposit: true,
        depositPercentage: 30,
        depositMode: 'simulated',
        primaryColor: '#8B5CF6',
        secondaryColor: '#4C1D95',
        heroStyle: 'corporate',
      }),
    },
    create: {
      slug: 'workhub-coworking',
      name: 'WorkHub Coworking',
      description: 'Espacios de trabajo flexibles en el corazón de Buenos Aires. Hot desks, oficinas privadas, salas de reuniones y espacios para eventos.',
      logo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1600&h=600&fit=crop',
      phone: '+54 11 5555-4001',
      email: 'hola@workhubco.com',
      address: 'Av. Corrientes 1234, Piso 8',
      city: 'Buenos Aires',
      instagram: '@workhubco',
      status: 'ACTIVE',
      settings: JSON.stringify({
        timezone: 'America/Argentina/Buenos_Aires',
        currency: 'ARS',
        language: 'es',
        bookingBuffer: 15,
        maxAdvanceBookingDays: 60,
        minAdvanceBookingHours: 2,
        allowCancellation: true,
        cancellationHoursLimit: 24,
        showPrices: true,
        requirePhone: true,
        requireEmail: true,
        requireDeposit: true,
        depositPercentage: 30,
        depositMode: 'simulated',
        primaryColor: '#8B5CF6',
        secondaryColor: '#4C1D95',
        heroStyle: 'corporate',
      }),
    },
  });
  console.log(`  ✅ Tenant: ${workhubTenant.id}`);

  // Owner
  await prisma.user.upsert({
    where: { email: 'demo@workhubco.com' },
    update: { name: 'Nicolás Fernández', tenantId: workhubTenant.id },
    create: {
      email: 'demo@workhubco.com',
      password: passwordHash,
      name: 'Nicolás Fernández',
      role: 'OWNER',
      tenantId: workhubTenant.id,
      isActive: true,
    },
  });

  // Branding
  await prisma.tenantBranding.upsert({
    where: { tenantId: workhubTenant.id },
    update: {
      primaryColor: '#8B5CF6',
      secondaryColor: '#4C1D95',
      accentColor: '#F59E0B',
      backgroundStyle: 'modern',
      welcomeTitle: 'WorkHub Coworking',
      welcomeSubtitle: 'Tu espacio de trabajo, a tu medida',
      logoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop',
      coverImageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1600&h=600&fit=crop',
      showPrices: true,
    },
    create: {
      tenantId: workhubTenant.id,
      primaryColor: '#8B5CF6',
      secondaryColor: '#4C1D95',
      accentColor: '#F59E0B',
      backgroundStyle: 'modern',
      welcomeTitle: 'WorkHub Coworking',
      welcomeSubtitle: 'Tu espacio de trabajo, a tu medida',
      logoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop',
      coverImageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1600&h=600&fit=crop',
      showPrices: true,
    },
  });

  // Subscription
  const existingWhSub = await prisma.subscription.findUnique({ where: { tenantId: workhubTenant.id } });
  if (!existingWhSub) {
    await prisma.subscription.create({
      data: {
        tenantId: workhubTenant.id,
        planId: gratisPlan.id,
        status: 'ACTIVE',
        billingPeriod: 'MONTHLY',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Categories
  const whCategories = [
    { name: 'Escritorios', order: 0 },
    { name: 'Oficinas', order: 1 },
    { name: 'Salas', order: 2 },
    { name: 'Espacios Premium', order: 3 },
  ];
  const whCatIds: string[] = [];
  for (const cat of whCategories) {
    const existing = await prisma.serviceCategory.findFirst({ where: { tenantId: workhubTenant.id, name: cat.name } });
    if (existing) {
      whCatIds.push(existing.id);
    } else {
      const created = await prisma.serviceCategory.create({ data: { tenantId: workhubTenant.id, ...cat } });
      whCatIds.push(created.id);
    }
  }

  // Services
  const whServices = [
    { name: 'Hot Desk', description: 'Escritorio compartido con WiFi de alta velocidad, café ilimitado y acceso a áreas comunes.', price: 5000, duration: 480, image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop', categoryIdx: 0, order: 0 },
    { name: 'Escritorio Fijo', description: 'Tu escritorio reservado con locker personal, monitor extra y silla ergonómica premium.', price: 8000, duration: 480, image: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=600&h=400&fit=crop', categoryIdx: 0, order: 1 },
    { name: 'Oficina Privada 2 personas', description: 'Oficina cerrada para 2 personas con escritorios, sillas ergonómicas y pizarra.', price: 12000, duration: 240, image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&h=400&fit=crop', categoryIdx: 1, order: 2 },
    { name: 'Box Profesional', description: 'Espacio individual insonorizado ideal para llamadas, videollamadas y trabajo concentrado.', price: 4000, duration: 120, image: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=600&h=400&fit=crop', categoryIdx: 1, order: 3 },
    { name: 'Sala de Reuniones', description: 'Sala equipada con pantalla 65\", webcam HD, pizarra magnética y café para 8 personas.', price: 6000, duration: 60, image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop', categoryIdx: 2, order: 4 },
    { name: 'Sala de Conferencias', description: 'Sala premium para hasta 20 personas con equipamiento audiovisual profesional.', price: 15000, duration: 120, image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&h=400&fit=crop', categoryIdx: 2, order: 5 },
    { name: 'Espacio Eventos', description: 'Espacio abierto de 120m² para workshops, meetups y presentaciones. Hasta 50 personas.', price: 25000, duration: 240, image: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=600&h=400&fit=crop', categoryIdx: 3, order: 6 },
    { name: 'Coworking Nocturno', description: 'Acceso al espacio de 18 a 23hs. Ideal para freelancers nocturnos. Incluye snacks.', price: 3500, duration: 240, image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop', categoryIdx: 3, order: 7 },
  ];

  for (const svc of whServices) {
    const existing = await prisma.service.findFirst({ where: { tenantId: workhubTenant.id, name: svc.name } });
    if (!existing) {
      await prisma.service.create({
        data: {
          tenantId: workhubTenant.id,
          categoryId: whCatIds[svc.categoryIdx],
          name: svc.name,
          description: svc.description,
          price: svc.price,
          duration: svc.duration,
          image: svc.image,
          isActive: true,
          order: svc.order,
        },
      });
    }
  }

  // Schedules (coworking: Mon-Sat 8-22, closed Sunday)
  const coworkingSchedule = [
    { dayOfWeek: 0, startTime: '08:00', endTime: '22:00', isActive: false },
    { dayOfWeek: 1, startTime: '08:00', endTime: '22:00', isActive: true },
    { dayOfWeek: 2, startTime: '08:00', endTime: '22:00', isActive: true },
    { dayOfWeek: 3, startTime: '08:00', endTime: '22:00', isActive: true },
    { dayOfWeek: 4, startTime: '08:00', endTime: '22:00', isActive: true },
    { dayOfWeek: 5, startTime: '08:00', endTime: '22:00', isActive: true },
    { dayOfWeek: 6, startTime: '09:00', endTime: '18:00', isActive: true },
  ];
  for (const schedule of coworkingSchedule) {
    await prisma.schedule.upsert({
      where: { tenantId_dayOfWeek: { tenantId: workhubTenant.id, dayOfWeek: schedule.dayOfWeek } },
      update: schedule,
      create: { tenantId: workhubTenant.id, ...schedule },
    });
  }
  console.log('  ✅ WorkHub Coworking complete');

  // ============================================================
  // 3. UPDATE heroStyles for screenshot candidates
  // ============================================================
  console.log('\n🎨 Updating heroStyles...');

  const heroStyleUpdates: { slug: string; heroStyle: string }[] = [
    { slug: 'salon-noir', heroStyle: 'zen' },
    { slug: 'dra-martinez-dermatologia', heroStyle: 'clinical' },
    { slug: 'armenon', heroStyle: 'warm' },
    { slug: 'quinta-los-alamos', heroStyle: 'warm' },
  ];

  for (const upd of heroStyleUpdates) {
    const tenant = await prisma.tenant.findUnique({ where: { slug: upd.slug } });
    if (!tenant) {
      console.log(`  ⚠️ Tenant ${upd.slug} not found, skipping`);
      continue;
    }
    const currentSettings = JSON.parse(tenant.settings as string || '{}');
    currentSettings.heroStyle = upd.heroStyle;
    await prisma.tenant.update({
      where: { slug: upd.slug },
      data: { settings: JSON.stringify(currentSettings) },
    });
    console.log(`  ✅ ${upd.slug} → heroStyle: ${upd.heroStyle}`);
  }

  console.log('\n✅ All done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
