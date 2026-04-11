import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================================
// TYPES (same as seed-showcase.ts)
// ============================================================

interface BusinessData {
  slug: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  instagram: string;
  logo: string;
  coverImage: string;
  settings: {
    primaryColor: string;
    secondaryColor: string;
    heroStyle: string;
    [key: string]: unknown;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundStyle: string;
    welcomeTitle: string;
    welcomeSubtitle: string;
  };
  owner: {
    email: string;
    name: string;
  };
  categories: { name: string; order: number }[];
  services: {
    name: string;
    description: string;
    includes?: string;
    price: number;
    duration: number;
    image: string;
    categoryIndex: number;
    order: number;
  }[];
  employees: {
    name: string;
    email: string;
    phone: string;
    image: string;
    specialty: string;
    bio: string;
    serviceIndices: number[];
  }[];
  customers: {
    name: string;
    phone: string;
    email: string;
    totalBookings: number;
  }[];
  schedules: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
  }[];
}

// ============================================================
// HELPER: Create a single business (same pattern as seed-showcase)
// ============================================================

async function createBusiness(data: BusinessData, passwordHash: string, gratisPlanId: string) {
  console.log(`\n📦 Creating: ${data.name} (${data.slug})...`);

  // 1. Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: data.slug },
    update: {
      name: data.name,
      description: data.description,
      logo: data.logo,
      coverImage: data.coverImage,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
      instagram: data.instagram,
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
        requireEmail: false,
        requireDeposit: true,
        depositPercentage: 30,
        depositMode: 'simulated',
        ...data.settings,
      }),
    },
    create: {
      slug: data.slug,
      name: data.name,
      description: data.description,
      logo: data.logo,
      coverImage: data.coverImage,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
      instagram: data.instagram,
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
        requireEmail: false,
        requireDeposit: true,
        depositPercentage: 30,
        depositMode: 'simulated',
        ...data.settings,
      }),
    },
  });
  console.log(`  ✅ Tenant: ${tenant.id}`);

  // 2. Owner
  const owner = await prisma.user.upsert({
    where: { email: data.owner.email },
    update: { name: data.owner.name, tenantId: tenant.id },
    create: {
      email: data.owner.email,
      password: passwordHash,
      name: data.owner.name,
      role: 'OWNER',
      tenantId: tenant.id,
      isActive: true,
    },
  });
  console.log(`  ✅ Owner: ${owner.email}`);

  // 3. Branding
  await prisma.tenantBranding.upsert({
    where: { tenantId: tenant.id },
    update: {
      primaryColor: data.branding.primaryColor,
      secondaryColor: data.branding.secondaryColor,
      accentColor: data.branding.accentColor,
      backgroundStyle: data.branding.backgroundStyle,
      welcomeTitle: data.branding.welcomeTitle,
      welcomeSubtitle: data.branding.welcomeSubtitle,
      fontFamily: 'Inter',
      headingFontFamily: 'Inter',
      logoUrl: data.logo,
      coverImageUrl: data.coverImage,
      showPrices: true,
    },
    create: {
      tenantId: tenant.id,
      primaryColor: data.branding.primaryColor,
      secondaryColor: data.branding.secondaryColor,
      accentColor: data.branding.accentColor,
      backgroundStyle: data.branding.backgroundStyle,
      welcomeTitle: data.branding.welcomeTitle,
      welcomeSubtitle: data.branding.welcomeSubtitle,
      fontFamily: 'Inter',
      headingFontFamily: 'Inter',
      logoUrl: data.logo,
      coverImageUrl: data.coverImage,
      showPrices: true,
    },
  });
  console.log(`  ✅ Branding`);

  // 4. Subscription (gratis plan)
  const existingSub = await prisma.subscription.findUnique({ where: { tenantId: tenant.id } });
  if (!existingSub) {
    await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        planId: gratisPlanId,
        status: 'ACTIVE',
        billingPeriod: 'MONTHLY',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log(`  ✅ Subscription`);

  // 5. Categories
  const existingCategories = await prisma.serviceCategory.findMany({ where: { tenantId: tenant.id } });
  const categories = [];
  for (const cat of data.categories) {
    const existing = existingCategories.find((c) => c.name === cat.name);
    if (existing) {
      categories.push(existing);
    } else {
      const created = await prisma.serviceCategory.create({
        data: { tenantId: tenant.id, name: cat.name, order: cat.order },
      });
      categories.push(created);
    }
  }
  console.log(`  ✅ Categories: ${categories.length}`);

  // 6. Services
  const services = [];
  for (const svc of data.services) {
    const categoryId = categories[svc.categoryIndex]?.id;
    const existing = await prisma.service.findFirst({
      where: { tenantId: tenant.id, name: svc.name },
    });
    if (existing) {
      services.push(existing);
    } else {
      const created = await prisma.service.create({
        data: {
          tenantId: tenant.id,
          categoryId,
          name: svc.name,
          description: svc.description,
          includes: svc.includes || null,
          price: svc.price,
          duration: svc.duration,
          image: svc.image,
          isActive: true,
          order: svc.order,
        },
      });
      services.push(created);
    }
  }
  console.log(`  ✅ Services: ${services.length}`);

  // 7. Employees
  const employees = [];
  for (let i = 0; i < data.employees.length; i++) {
    const emp = data.employees[i];
    const existing = await prisma.employee.findFirst({
      where: { tenantId: tenant.id, name: emp.name },
    });
    if (existing) {
      employees.push(existing);
    } else {
      const created = await prisma.employee.create({
        data: {
          tenantId: tenant.id,
          name: emp.name,
          email: emp.email,
          phone: emp.phone,
          image: emp.image,
          specialty: emp.specialty,
          bio: emp.bio,
          isActive: true,
          order: i,
        },
      });
      employees.push(created);
    }
  }
  console.log(`  ✅ Employees: ${employees.length}`);

  // 8. EmployeeService links
  for (let i = 0; i < data.employees.length; i++) {
    const emp = data.employees[i];
    const employee = employees[i];
    for (const svcIdx of emp.serviceIndices) {
      const service = services[svcIdx];
      if (!service || !employee) continue;
      const existing = await prisma.employeeService.findUnique({
        where: { employeeId_serviceId: { employeeId: employee.id, serviceId: service.id } },
      });
      if (!existing) {
        await prisma.employeeService.create({
          data: { employeeId: employee.id, serviceId: service.id },
        });
      }
    }
  }
  console.log(`  ✅ EmployeeService links`);

  // 9. Schedules
  for (const schedule of data.schedules) {
    await prisma.schedule.upsert({
      where: { tenantId_dayOfWeek: { tenantId: tenant.id, dayOfWeek: schedule.dayOfWeek } },
      update: schedule,
      create: { tenantId: tenant.id, ...schedule },
    });
  }
  console.log(`  ✅ Schedules`);

  // 10. Customers
  const customers = [];
  for (const cust of data.customers) {
    const customer = await prisma.customer.upsert({
      where: { tenantId_phone: { tenantId: tenant.id, phone: cust.phone } },
      update: { name: cust.name, email: cust.email, totalBookings: cust.totalBookings },
      create: { tenantId: tenant.id, ...cust },
    });
    customers.push(customer);
  }
  console.log(`  ✅ Customers: ${customers.length}`);

  // 11. Bookings (distributed over next 5 days)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bookingSlots = [
    { dayOffset: 0, startTime: '09:00', endTime: '10:00', status: 'CONFIRMED' },
    { dayOffset: 0, startTime: '10:30', endTime: '11:30', status: 'CONFIRMED' },
    { dayOffset: 0, startTime: '14:00', endTime: '15:00', status: 'PENDING' },
    { dayOffset: 1, startTime: '09:30', endTime: '10:30', status: 'CONFIRMED' },
    { dayOffset: 1, startTime: '11:00', endTime: '12:00', status: 'CONFIRMED' },
    { dayOffset: 1, startTime: '15:00', endTime: '16:00', status: 'PENDING' },
    { dayOffset: 2, startTime: '10:00', endTime: '11:00', status: 'CONFIRMED' },
    { dayOffset: 2, startTime: '14:30', endTime: '15:30', status: 'CONFIRMED' },
    { dayOffset: 3, startTime: '09:00', endTime: '10:00', status: 'PENDING' },
    { dayOffset: 3, startTime: '11:00', endTime: '12:00', status: 'CONFIRMED' },
    { dayOffset: 3, startTime: '16:00', endTime: '17:00', status: 'CONFIRMED' },
    { dayOffset: 4, startTime: '10:00', endTime: '11:00', status: 'PENDING' },
    { dayOffset: 4, startTime: '14:00', endTime: '15:00', status: 'CONFIRMED' },
    { dayOffset: 4, startTime: '16:30', endTime: '17:30', status: 'CONFIRMED' },
  ];

  let bookingCount = 0;
  for (let i = 0; i < bookingSlots.length; i++) {
    const slot = bookingSlots[i];
    const date = new Date(today);
    date.setDate(date.getDate() + slot.dayOffset);

    const customer = customers[i % customers.length];
    const service = services[i % services.length];
    const employee = employees.length > 0 ? employees[i % employees.length] : null;

    const existing = await prisma.booking.findFirst({
      where: {
        tenantId: tenant.id,
        customerId: customer.id,
        date,
        startTime: slot.startTime,
      },
    });

    if (!existing) {
      await prisma.booking.create({
        data: {
          tenantId: tenant.id,
          customerId: customer.id,
          serviceId: service.id,
          employeeId: employee?.id || null,
          date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: slot.status,
        },
      });
      bookingCount++;
    }
  }
  console.log(`  ✅ Bookings: ${bookingCount} new`);

  return tenant;
}

// ============================================================
// SCHEDULES
// ============================================================

const SCHEDULE_MON_FRI_9_20_SAT_9_13 = [
  { dayOfWeek: 0, startTime: '09:00', endTime: '20:00', isActive: false },
  { dayOfWeek: 1, startTime: '09:00', endTime: '20:00', isActive: true },
  { dayOfWeek: 2, startTime: '09:00', endTime: '20:00', isActive: true },
  { dayOfWeek: 3, startTime: '09:00', endTime: '20:00', isActive: true },
  { dayOfWeek: 4, startTime: '09:00', endTime: '20:00', isActive: true },
  { dayOfWeek: 5, startTime: '09:00', endTime: '20:00', isActive: true },
  { dayOfWeek: 6, startTime: '09:00', endTime: '13:00', isActive: true },
];

const SCHEDULE_ALL_WEEK_8_22 = [
  { dayOfWeek: 0, startTime: '08:00', endTime: '22:00', isActive: true },
  { dayOfWeek: 1, startTime: '08:00', endTime: '22:00', isActive: true },
  { dayOfWeek: 2, startTime: '08:00', endTime: '22:00', isActive: true },
  { dayOfWeek: 3, startTime: '08:00', endTime: '22:00', isActive: true },
  { dayOfWeek: 4, startTime: '08:00', endTime: '22:00', isActive: true },
  { dayOfWeek: 5, startTime: '08:00', endTime: '22:00', isActive: true },
  { dayOfWeek: 6, startTime: '08:00', endTime: '22:00', isActive: true },
];

const SCHEDULE_ALL_WEEK_24H = [
  { dayOfWeek: 0, startTime: '00:00', endTime: '23:59', isActive: true },
  { dayOfWeek: 1, startTime: '00:00', endTime: '23:59', isActive: true },
  { dayOfWeek: 2, startTime: '00:00', endTime: '23:59', isActive: true },
  { dayOfWeek: 3, startTime: '00:00', endTime: '23:59', isActive: true },
  { dayOfWeek: 4, startTime: '00:00', endTime: '23:59', isActive: true },
  { dayOfWeek: 5, startTime: '00:00', endTime: '23:59', isActive: true },
  { dayOfWeek: 6, startTime: '00:00', endTime: '23:59', isActive: true },
];

const SCHEDULE_MON_FRI_8_18_SAT_8_13 = [
  { dayOfWeek: 0, startTime: '08:00', endTime: '18:00', isActive: false },
  { dayOfWeek: 1, startTime: '08:00', endTime: '18:00', isActive: true },
  { dayOfWeek: 2, startTime: '08:00', endTime: '18:00', isActive: true },
  { dayOfWeek: 3, startTime: '08:00', endTime: '18:00', isActive: true },
  { dayOfWeek: 4, startTime: '08:00', endTime: '18:00', isActive: true },
  { dayOfWeek: 5, startTime: '08:00', endTime: '18:00', isActive: true },
  { dayOfWeek: 6, startTime: '08:00', endTime: '13:00', isActive: true },
];

const SCHEDULE_MON_SAT_8_19_SUN_9_14 = [
  { dayOfWeek: 0, startTime: '09:00', endTime: '14:00', isActive: true },
  { dayOfWeek: 1, startTime: '08:00', endTime: '19:00', isActive: true },
  { dayOfWeek: 2, startTime: '08:00', endTime: '19:00', isActive: true },
  { dayOfWeek: 3, startTime: '08:00', endTime: '19:00', isActive: true },
  { dayOfWeek: 4, startTime: '08:00', endTime: '19:00', isActive: true },
  { dayOfWeek: 5, startTime: '08:00', endTime: '19:00', isActive: true },
  { dayOfWeek: 6, startTime: '08:00', endTime: '19:00', isActive: true },
];

// ============================================================
// 5 NEW SHOWCASE BUSINESSES
// ============================================================

const SHOWCASE_BUSINESSES: BusinessData[] = [
  // ─────────────────────────────────────────
  // 1. Lic. Gómez — Psicología
  // ─────────────────────────────────────────
  {
    slug: 'lic-gomez-psicologia',
    name: 'Lic. Laura Gómez — Psicología',
    description: 'Psicología clínica, terapia de pareja y orientación vocacional. Consultorio en Belgrano, Buenos Aires.',
    phone: '+54 11 5500-3001',
    email: 'lic.gomez@turnolink-demo.com',
    address: 'Av. Cabildo 2345',
    city: 'Belgrano, Buenos Aires',
    instagram: '@licgomezpsicologia',
    logo: '',
    coverImage: '',
    settings: {
      primaryColor: '#5b21b6',
      secondaryColor: '#a78bfa',
      heroStyle: 'clinical',
      themeMode: 'light',
      cardStyle: 'corporate',
      showEmployeeSelector: true,
      bookingMode: 'professional',
    },
    branding: {
      primaryColor: '#5b21b6',
      secondaryColor: '#a78bfa',
      accentColor: '#7c3aed',
      backgroundStyle: 'gradient',
      welcomeTitle: 'Lic. Laura Gómez — Psicología',
      welcomeSubtitle: 'Psicología clínica, terapia de pareja y orientación vocacional',
    },
    owner: { email: 'lic.gomez@turnolink-demo.com', name: 'Lic. Laura Gómez' },
    categories: [
      { name: 'Psicología Clínica', order: 0 },
      { name: 'Terapia de Pareja', order: 1 },
      { name: 'Evaluaciones', order: 2 },
    ],
    services: [
      { name: 'Sesión Individual', description: 'Sesión de psicoterapia individual de 50 minutos', price: 12000, duration: 50, image: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=400&h=300&fit=crop', categoryIndex: 0, order: 0 },
      { name: 'Terapia de Pareja', description: 'Sesión de terapia de pareja de 75 minutos', price: 18000, duration: 75, image: 'https://images.unsplash.com/photo-1591228127791-8e2eaef098d3?w=400&h=300&fit=crop', categoryIndex: 1, order: 0 },
      { name: 'Evaluación Inicial', description: 'Primera consulta con evaluación diagnóstica completa', price: 15000, duration: 60, image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop', categoryIndex: 2, order: 0 },
      { name: 'Terapia Adolescentes', description: 'Sesión de psicoterapia orientada a adolescentes', price: 12000, duration: 50, image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=300&fit=crop', categoryIndex: 0, order: 1 },
      { name: 'Orientación Vocacional', description: 'Proceso de orientación vocacional y ocupacional', price: 14000, duration: 60, image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop', categoryIndex: 2, order: 1 },
      { name: 'Sesión Online', description: 'Sesión de psicoterapia por videollamada', price: 10000, duration: 50, image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop', categoryIndex: 0, order: 2 },
    ],
    employees: [
      { name: 'Lic. Laura Gómez', email: 'lic.gomez@email.com', phone: '+54 11 5500-3001', image: 'https://randomuser.me/api/portraits/women/90.jpg', specialty: 'Psicología Clínica', bio: 'Lic. en Psicología UBA. +15 años de experiencia', serviceIndices: [0, 1, 2, 3, 4, 5] },
    ],
    customers: [
      { name: 'Marcela Rodríguez', phone: '+54 11 6100-0001', email: 'marcela.r@mail.com', totalBookings: 12 },
      { name: 'Pablo Fernández', phone: '+54 11 6100-0002', email: 'pablo.f@mail.com', totalBookings: 8 },
      { name: 'Silvina Morales', phone: '+54 11 6100-0003', email: 'silvina.m@mail.com', totalBookings: 5 },
      { name: 'Gustavo Pereyra', phone: '+54 11 6100-0004', email: 'gustavo.p@mail.com', totalBookings: 3 },
      { name: 'Andrea Suárez', phone: '+54 11 6100-0005', email: 'andrea.s@mail.com', totalBookings: 7 },
    ],
    schedules: SCHEDULE_MON_FRI_9_20_SAT_9_13,
  },

  // ─────────────────────────────────────────
  // 2. Cabañas del Lago
  // ─────────────────────────────────────────
  {
    slug: 'cabanas-del-lago',
    name: 'Cabañas del Lago',
    description: 'Tu escape perfecto con vista al lago en Villa La Angostura. Cabañas equipadas y experiencias al aire libre.',
    phone: '+54 11 5500-3002',
    email: 'info@cabanasdellago-demo.com',
    address: 'Ruta 40 Km 2045',
    city: 'Villa La Angostura, Neuquén',
    instagram: '@cabanasdellago',
    logo: '',
    coverImage: '',
    settings: {
      primaryColor: '#1e3a5f',
      secondaryColor: '#7dd3fc',
      heroStyle: 'zen',
      themeMode: 'both',
      cardStyle: 'warm',
      bookingMode: 'hourly',
    },
    branding: {
      primaryColor: '#1e3a5f',
      secondaryColor: '#7dd3fc',
      accentColor: '#38bdf8',
      backgroundStyle: 'image',
      welcomeTitle: 'Cabañas del Lago',
      welcomeSubtitle: 'Tu escape perfecto con vista al lago. Reservá online y asegurá tu estadía.',
    },
    owner: { email: 'info@cabanasdellago-demo.com', name: 'Valeria Torres' },
    categories: [
      { name: 'Cabañas', order: 0 },
      { name: 'Experiencias', order: 1 },
    ],
    services: [
      { name: 'Cabaña Doble', description: 'Cabaña para 2 personas con vista al lago, calefacción y desayuno', price: 45000, duration: 1440, image: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=400&h=300&fit=crop', categoryIndex: 0, order: 0 },
      { name: 'Cabaña Familiar', description: 'Cabaña para 4-6 personas con living, cocina equipada y parrilla', price: 65000, duration: 1440, image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=400&h=300&fit=crop', categoryIndex: 0, order: 1 },
      { name: 'Suite Premium', description: 'Suite premium con jacuzzi privado y vista panorámica al lago', price: 85000, duration: 1440, image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400&h=300&fit=crop', categoryIndex: 0, order: 2 },
      { name: 'Cabaña Lago VIP', description: 'Cabaña VIP a orillas del lago con muelle privado', price: 110000, duration: 1440, image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400&h=300&fit=crop', categoryIndex: 0, order: 3 },
      { name: 'Excursión Kayak', description: 'Excursión guiada en kayak por el lago con equipo incluido', price: 15000, duration: 180, image: 'https://images.unsplash.com/photo-1472745942893-4b9f730c7668?w=400&h=300&fit=crop', categoryIndex: 1, order: 0 },
      { name: 'Trekking Guiado', description: 'Trekking guiado por senderos de montaña con guía especializado', price: 12000, duration: 240, image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop', categoryIndex: 1, order: 1 },
    ],
    employees: [],
    customers: [
      { name: 'Rodrigo Almada', phone: '+54 11 6200-0001', email: 'rodrigo.a@mail.com', totalBookings: 4 },
      { name: 'Florencia Giménez', phone: '+54 11 6200-0002', email: 'florencia.g@mail.com', totalBookings: 2 },
      { name: 'Martín Acosta', phone: '+54 11 6200-0003', email: 'martin.a@mail.com', totalBookings: 6 },
      { name: 'Julieta Bravo', phone: '+54 11 6200-0004', email: 'julieta.b@mail.com', totalBookings: 3 },
      { name: 'Sebastián Ruiz', phone: '+54 11 6200-0005', email: 'sebastian.r@mail.com', totalBookings: 5 },
    ],
    schedules: SCHEDULE_ALL_WEEK_8_22,
  },

  // ─────────────────────────────────────────
  // 3. Urban Apart Hotel
  // ─────────────────────────────────────────
  {
    slug: 'apart-hotel-centro',
    name: 'Urban Apart Hotel',
    description: 'Departamentos equipados en el corazón de Córdoba. Check-in 24hs, ideal para viajeros y ejecutivos.',
    phone: '+54 11 5500-3003',
    email: 'reservas@urbanapart-demo.com',
    address: 'Av. Colón 567',
    city: 'Córdoba Capital',
    instagram: '@aparthotelcentro',
    logo: '',
    coverImage: '',
    settings: {
      primaryColor: '#b45309',
      secondaryColor: '#fbbf24',
      heroStyle: 'bold',
      themeMode: 'dark',
      cardStyle: 'minimalist',
      bookingMode: 'hourly',
    },
    branding: {
      primaryColor: '#b45309',
      secondaryColor: '#fbbf24',
      accentColor: '#f59e0b',
      backgroundStyle: 'solid',
      welcomeTitle: 'Urban Apart Hotel',
      welcomeSubtitle: 'Departamentos equipados en el corazón de Córdoba. Check-in 24hs.',
    },
    owner: { email: 'reservas@urbanapart-demo.com', name: 'Andrés Gutiérrez' },
    categories: [
      { name: 'Departamentos', order: 0 },
      { name: 'Servicios Extras', order: 1 },
    ],
    services: [
      { name: 'Studio', description: 'Studio amueblado con kitchenette y WiFi de alta velocidad', price: 35000, duration: 1440, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop', categoryIndex: 0, order: 0 },
      { name: 'Depto 1 Ambiente', description: 'Departamento de 1 ambiente con cocina completa y balcón', price: 48000, duration: 1440, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop', categoryIndex: 0, order: 1 },
      { name: 'Depto 2 Ambientes', description: 'Departamento de 2 ambientes con living separado y cocina equipada', price: 62000, duration: 1440, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop', categoryIndex: 0, order: 2 },
      { name: 'Suite Ejecutiva', description: 'Suite ejecutiva con escritorio, minibar y vista a la ciudad', price: 75000, duration: 1440, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop', categoryIndex: 0, order: 3 },
      { name: 'Cochera por día', description: 'Cochera cubierta con seguridad 24hs', price: 5000, duration: 1440, image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400&h=300&fit=crop', categoryIndex: 1, order: 0 },
      { name: 'Late Check-out', description: 'Extensión de check-out hasta las 18hs', price: 8000, duration: 240, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop', categoryIndex: 1, order: 1 },
    ],
    employees: [],
    customers: [
      { name: 'Luciano Méndez', phone: '+54 11 6300-0001', email: 'luciano.m@mail.com', totalBookings: 5 },
      { name: 'Carla Domínguez', phone: '+54 11 6300-0002', email: 'carla.d@mail.com', totalBookings: 3 },
      { name: 'Esteban Navarro', phone: '+54 11 6300-0003', email: 'esteban.n@mail.com', totalBookings: 8 },
      { name: 'Valeria Pacheco', phone: '+54 11 6300-0004', email: 'valeria.p@mail.com', totalBookings: 2 },
      { name: 'Diego Coronel', phone: '+54 11 6300-0005', email: 'diego.c@mail.com', totalBookings: 6 },
    ],
    schedules: SCHEDULE_ALL_WEEK_24H,
  },

  // ─────────────────────────────────────────
  // 4. Taller Martínez Hnos.
  // ─────────────────────────────────────────
  {
    slug: 'taller-martinez-hnos',
    name: 'Taller Martínez Hnos.',
    description: 'Mecánica integral, service oficial y diagnóstico computarizado. Más de 30 años en Avellaneda.',
    phone: '+54 11 5500-4001',
    email: 'taller@martinezhnos-demo.com',
    address: 'Av. Mitre 890',
    city: 'Avellaneda, Buenos Aires',
    instagram: '@tallermartinezhnos',
    logo: '',
    coverImage: '',
    settings: {
      primaryColor: '#dc2626',
      secondaryColor: '#fca5a5',
      heroStyle: 'energetic',
      themeMode: 'light',
      cardStyle: 'bold',
    },
    branding: {
      primaryColor: '#dc2626',
      secondaryColor: '#fca5a5',
      accentColor: '#ef4444',
      backgroundStyle: 'gradient',
      welcomeTitle: 'Taller Martínez Hnos.',
      welcomeSubtitle: 'Mecánica integral, service oficial y diagnóstico computarizado. Reservá tu turno.',
    },
    owner: { email: 'taller@martinezhnos-demo.com', name: 'Carlos Martínez' },
    categories: [
      { name: 'Service', order: 0 },
      { name: 'Mecánica', order: 1 },
      { name: 'Diagnóstico', order: 2 },
    ],
    services: [
      { name: 'Service Completo', description: 'Service completo con cambio de aceite, filtros y revisión general', price: 35000, duration: 120, image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400&h=300&fit=crop', categoryIndex: 0, order: 0 },
      { name: 'Cambio de Aceite', description: 'Cambio de aceite y filtro con aceite sintético', price: 15000, duration: 30, image: 'https://images.unsplash.com/photo-1635784063388-1ff609e4f0e3?w=400&h=300&fit=crop', categoryIndex: 0, order: 1 },
      { name: 'Diagnóstico General', description: 'Diagnóstico computarizado completo del vehículo', price: 8000, duration: 45, image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=300&fit=crop', categoryIndex: 2, order: 0 },
      { name: 'Cambio de Frenos', description: 'Cambio de pastillas y discos de freno con repuestos originales', price: 25000, duration: 90, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop', categoryIndex: 1, order: 0 },
      { name: 'Alineación y Balanceo', description: 'Alineación computarizada y balanceo de las 4 ruedas', price: 12000, duration: 60, image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=300&fit=crop', categoryIndex: 1, order: 1 },
      { name: 'Cambio de Correa', description: 'Cambio de kit de distribución completo', price: 40000, duration: 180, image: 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=400&h=300&fit=crop', categoryIndex: 1, order: 2 },
      { name: 'Scanner OBD', description: 'Lectura y borrado de códigos de error con scanner OBD profesional', price: 6000, duration: 30, image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop', categoryIndex: 2, order: 1 },
      { name: 'Pre-VTV', description: 'Revisión completa pre-VTV con informe detallado', price: 10000, duration: 60, image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop', categoryIndex: 2, order: 2 },
    ],
    employees: [
      { name: 'Carlos Martínez', email: 'carlos@martinezhnos.com', phone: '+54 11 5500-4001', image: 'https://randomuser.me/api/portraits/men/87.jpg', specialty: 'Mecánica General', bio: '30 años de experiencia en mecánica automotriz', serviceIndices: [0, 1, 3, 4, 5] },
      { name: 'Martín Martínez', email: 'martin@martinezhnos.com', phone: '+54 11 5500-4002', image: 'https://randomuser.me/api/portraits/men/88.jpg', specialty: 'Diagnóstico Electrónico', bio: 'Especialista en inyección electrónica y scanner', serviceIndices: [0, 2, 6, 7] },
    ],
    customers: [
      { name: 'Ricardo Sosa', phone: '+54 11 6400-0001', email: 'ricardo.s@mail.com', totalBookings: 9 },
      { name: 'Alejandra Villalba', phone: '+54 11 6400-0002', email: 'alejandra.v@mail.com', totalBookings: 4 },
      { name: 'Hugo Romero', phone: '+54 11 6400-0003', email: 'hugo.r@mail.com', totalBookings: 7 },
      { name: 'Mariela Castro', phone: '+54 11 6400-0004', email: 'mariela.c@mail.com', totalBookings: 3 },
      { name: 'Facundo Ledesma', phone: '+54 11 6400-0005', email: 'facundo.l@mail.com', totalBookings: 6 },
    ],
    schedules: SCHEDULE_MON_FRI_8_18_SAT_8_13,
  },

  // ─────────────────────────────────────────
  // 5. Black Diamond Detailing Studio
  // ─────────────────────────────────────────
  {
    slug: 'wash-pro-lavadero',
    name: 'Black Diamond Detailing',
    description: 'Estudio premium de detailing automotriz. Corrección de pintura, coating cerámico y PPF. Cada vehículo recibe tratamiento de élite.',
    phone: '+54 11 5500-5001',
    email: 'info@washpro-demo.com',
    address: 'Av. del Libertador 4200',
    city: 'Vicente López, Buenos Aires',
    instagram: '@blackdiamonddetailing',
    logo: '',
    coverImage: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=1200&h=630&fit=crop',
    settings: {
      primaryColor: '#0f172a',
      secondaryColor: '#1e293b',
      heroStyle: 'bold',
      themeMode: 'dark',
      cardStyle: 'corporate',
    },
    branding: {
      primaryColor: '#0f172a',
      secondaryColor: '#1e293b',
      accentColor: '#c9a84c',
      backgroundStyle: 'gradient',
      welcomeTitle: 'Black Diamond Detailing',
      welcomeSubtitle: 'Estudio premium de detailing automotriz. Tu vehículo merece el mejor tratamiento.',
    },
    owner: { email: 'info@washpro-demo.com', name: 'Nicolás Ferrara' },
    categories: [
      { name: 'Corrección de Pintura', order: 0 },
      { name: 'Protección Premium', order: 1 },
      { name: 'Detailing Interior', order: 2 },
      { name: 'Lavado Especializado', order: 3 },
    ],
    services: [
      // Corrección de Pintura
      { name: 'Pulido en 1 Paso', description: 'Corrección leve de swirls y micro-rayas. Devuelve el brillo de fábrica con acabado espejo. Incluye descontaminado previo con clay bar.', price: 35000, duration: 180, image: 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800&h=600&fit=crop', categoryIndex: 0, order: 0 },
      { name: 'Corrección en 2 Pasos', description: 'Proceso de corte y refinado para eliminar rayas medias y oxidación. Restauración completa del brillo con resultados de nivel concurso.', price: 65000, duration: 360, image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800&h=600&fit=crop', categoryIndex: 0, order: 1 },
      { name: 'Corrección Full Detail', description: 'Máxima corrección de pintura en 3 pasos: corte, pulido y ultra-finish. Para vehículos de alta gama y preparación para concurso. Resultado impecable.', price: 120000, duration: 480, image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop', categoryIndex: 0, order: 2 },

      // Protección Premium
      { name: 'Coating Cerámico 9H', description: 'Protección cerámica profesional de 2 años. Nano-coating 9H que repele agua, suciedad y rayos UV. Incluye corrección previa y curado infrarrojo.', price: 85000, duration: 300, image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop', categoryIndex: 1, order: 0 },
      { name: 'Coating Grafeno Premium', description: 'Última generación en protección: coating de grafeno con durabilidad de hasta 5 años. Máxima hidrofobicidad y resistencia térmica. El mejor tratamiento del mercado.', price: 150000, duration: 420, image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600&fit=crop', categoryIndex: 1, order: 1 },
      { name: 'PPF Paint Protection Film', description: 'Film de protección de pintura (PPF) transparente auto-reparable. Protege contra piedrazos, rayas y la intemperie. Instalación profesional zona frontal completa.', price: 280000, duration: 480, image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop', categoryIndex: 1, order: 2 },

      // Detailing Interior
      { name: 'Detailing Interior Completo', description: 'Limpieza profunda y acondicionamiento de cueros, alcántara y plásticos. Vapor + extracción + ozono. Tu interior como nuevo.', price: 45000, duration: 240, image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&h=600&fit=crop', categoryIndex: 2, order: 0 },
      { name: 'Tratamiento de Cuero Premium', description: 'Limpieza, nutrición y protección de cueros con productos europeos de máxima gama. Restaura el color y la suavidad original.', price: 35000, duration: 180, image: 'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800&h=600&fit=crop', categoryIndex: 2, order: 1 },

      // Lavado Especializado
      { name: 'Lavado Premium Sin Contacto', description: 'Lavado safe-wash con técnica de 2 baldes, shampoo pH neutro, secado con aire filtrado y cera rápida. Cero rayas, cero riesgo.', price: 15000, duration: 90, image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&h=600&fit=crop', categoryIndex: 3, order: 0 },
      { name: 'Descontaminado Completo', description: 'Clay bar + iron remover + fallout removal + descontaminado químico. Prepara la superficie para pulido o coating. Paso esencial.', price: 25000, duration: 120, image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop', categoryIndex: 3, order: 1 },
    ],
    employees: [
      { name: 'Nicolás Ferrara', email: 'nico@washpro.com', phone: '+54 11 5500-5001', image: 'https://randomuser.me/api/portraits/men/89.jpg', specialty: 'Corrección de Pintura & Coating', bio: 'Detailer certificado IDA Level 3. Especialista en corrección de pintura y coating cerámico con más de 500 vehículos tratados.', serviceIndices: [0, 1, 2, 3, 4, 5] },
      { name: 'Damián Rossi', email: 'damian@washpro.com', phone: '+54 11 5500-5002', image: 'https://randomuser.me/api/portraits/men/90.jpg', specialty: 'Interior & PPF', bio: 'Especialista en detailing interior y aplicación de PPF. Formación en RUPES Academy y certificación Xpel.', serviceIndices: [5, 6, 7, 8, 9] },
    ],
    customers: [
      { name: 'Gonzalo Aguirre', phone: '+54 11 6500-0001', email: 'gonzalo.a@mail.com', totalBookings: 10 },
      { name: 'Patricia Herrera', phone: '+54 11 6500-0002', email: 'patricia.h@mail.com', totalBookings: 6 },
      { name: 'Ramiro Figueroa', phone: '+54 11 6500-0003', email: 'ramiro.f@mail.com', totalBookings: 4 },
      { name: 'Cecilia Ortega', phone: '+54 11 6500-0004', email: 'cecilia.o@mail.com', totalBookings: 8 },
      { name: 'Tomás Ibarra', phone: '+54 11 6500-0005', email: 'tomas.i@mail.com', totalBookings: 3 },
    ],
    schedules: SCHEDULE_MON_SAT_8_19_SUN_9_14,
  },
];

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('🎬 Showcase Extra Seed — Creating 5 new businesses\n');

  const passwordHash = await bcrypt.hash('demo123456', 10);

  // Find the Gratis plan
  const gratisPlan = await prisma.subscriptionPlan.findFirst({ where: { name: 'Gratis' } });
  if (!gratisPlan) {
    console.error('❌ No "Gratis" subscription plan found. Run the main seed first.');
    process.exit(1);
  }

  // ─── Create 5 new businesses ─────────────────────
  for (const biz of SHOWCASE_BUSINESSES) {
    await createBusiness(biz, passwordHash, gratisPlan.id);
  }

  console.log('\n✅ Showcase Extra seed complete!');
  console.log('  New pages:');
  console.log('    /lic-gomez-psicologia');
  console.log('    /cabanas-del-lago');
  console.log('    /apart-hotel-centro');
  console.log('    /taller-martinez-hnos');
  console.log('    /wash-pro-lavadero');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
