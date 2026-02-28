import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================================
// TYPES (same as seed-businesses.ts)
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
// HELPER: Create a single business (same pattern as seed-businesses)
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
    const employee = employees[i % employees.length];

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
          employeeId: employee.id,
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

const STANDARD_SCHEDULE = [
  { dayOfWeek: 0, startTime: '10:00', endTime: '18:00', isActive: false },
  { dayOfWeek: 1, startTime: '09:00', endTime: '20:00', isActive: true },
  { dayOfWeek: 2, startTime: '09:00', endTime: '20:00', isActive: true },
  { dayOfWeek: 3, startTime: '09:00', endTime: '20:00', isActive: true },
  { dayOfWeek: 4, startTime: '09:00', endTime: '20:00', isActive: true },
  { dayOfWeek: 5, startTime: '09:00', endTime: '20:00', isActive: true },
  { dayOfWeek: 6, startTime: '09:00', endTime: '14:00', isActive: true },
];

// ============================================================
// 3 NEW SHOWCASE BUSINESSES
// ============================================================

const SHOWCASE_BUSINESSES: BusinessData[] = [
  // ─────────────────────────────────────────
  // 1. ALMA RELAX SPA — Spa & Bienestar
  // ─────────────────────────────────────────
  {
    slug: 'alma-relax-spa',
    name: 'Alma Relax Spa',
    description: 'Spa holístico con tratamientos de relajación, faciales y circuitos wellness. Un oasis de tranquilidad en San Telmo.',
    phone: '+54 11 5555-4001',
    email: 'hola@almarelaxspa.com',
    address: 'Defensa 1234',
    city: 'San Telmo, Buenos Aires',
    instagram: '@almarelaxspa',
    logo: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=1600&h=600&fit=crop',
    settings: {
      primaryColor: '#D97706',
      secondaryColor: '#BE185D',
      heroStyle: 'warm',
    },
    branding: {
      primaryColor: '#D97706',
      secondaryColor: '#BE185D',
      accentColor: '#F59E0B',
      backgroundStyle: 'elegant',
      welcomeTitle: 'Alma Relax Spa',
      welcomeSubtitle: 'Tu momento de paz interior',
    },
    owner: { email: 'demo@almarelaxspa.com', name: 'Valentina Rosas' },
    categories: [
      { name: 'Masajes', order: 0 },
      { name: 'Faciales', order: 1 },
      { name: 'Corporales', order: 2 },
      { name: 'Circuitos Wellness', order: 3 },
    ],
    services: [
      { name: 'Masaje Hot Stones', description: 'Masaje con piedras calientes volcánicas para aliviar tensiones profundas', price: 18000, duration: 75, image: '', categoryIndex: 0, order: 0 },
      { name: 'Reflexología Podal', description: 'Estimulación de puntos reflejos en los pies para equilibrio general', price: 12000, duration: 50, image: '', categoryIndex: 0, order: 1 },
      { name: 'Masaje Ayurvédico', description: 'Masaje con aceites esenciales según tu dosha predominante', price: 16000, duration: 60, image: '', categoryIndex: 0, order: 2 },
      { name: 'Facial Hidratación Profunda', description: 'Limpieza + hidratación con ácido hialurónico y vitamina C', price: 14000, duration: 60, image: '', categoryIndex: 1, order: 0 },
      { name: 'Facial Antiage Colágeno', description: 'Tratamiento reafirmante con colágeno marino y radiofrecuencia', price: 18000, duration: 75, image: '', categoryIndex: 1, order: 1 },
      { name: 'Envoltura de Chocolate', description: 'Envoltura corporal con cacao orgánico hidratante y desintoxicante', price: 15000, duration: 60, image: '', categoryIndex: 2, order: 0 },
      { name: 'Exfoliación Corporal', description: 'Exfoliación con sales del Mar Muerto y aceites de argán', price: 12000, duration: 45, image: '', categoryIndex: 2, order: 1 },
      { name: 'Circuito Spa Completo', description: 'Sauna seco + húmedo + hidromasaje + masaje relajante 30min', includes: 'Toalla, bata, infusión de bienvenida, masaje incluido', price: 28000, duration: 150, image: '', categoryIndex: 3, order: 0 },
    ],
    employees: [
      { name: 'Valentina Rosas', email: 'valentina@almarelaxspa.com', phone: '+54 11 6001-0001', image: '', specialty: 'Masajes terapéuticos', bio: 'Terapeuta certificada en masajes orientales con 12 años de experiencia', serviceIndices: [0, 1, 2, 7] },
      { name: 'Camila Herrera', email: 'camila@almarelaxspa.com', phone: '+54 11 6001-0002', image: '', specialty: 'Tratamientos faciales', bio: 'Cosmetóloga especializada en tratamientos antiage y rejuvenecimiento', serviceIndices: [3, 4, 5, 6] },
      { name: 'Lucía Mendoza', email: 'lucia@almarelaxspa.com', phone: '+54 11 6001-0003', image: '', specialty: 'Wellness integral', bio: 'Especialista en circuitos de bienestar y aromaterapia', serviceIndices: [0, 5, 6, 7] },
    ],
    customers: [
      { name: 'María Fernanda López', phone: '+54 11 7001-0001', email: 'mf.lopez@email.com', totalBookings: 8 },
      { name: 'Carolina Vega', phone: '+54 11 7001-0002', email: 'carolina.v@email.com', totalBookings: 5 },
      { name: 'Paula Martínez', phone: '+54 11 7001-0003', email: 'paula.m@email.com', totalBookings: 12 },
      { name: 'Laura Sánchez', phone: '+54 11 7001-0004', email: 'laura.s@email.com', totalBookings: 3 },
      { name: 'Sofía Romero', phone: '+54 11 7001-0005', email: 'sofia.r@email.com', totalBookings: 6 },
      { name: 'Ana García', phone: '+54 11 7001-0006', email: 'ana.g@email.com', totalBookings: 4 },
    ],
    schedules: STANDARD_SCHEDULE,
  },

  // ─────────────────────────────────────────
  // 2. FINE LINE STUDIO — Tatuajes
  // ─────────────────────────────────────────
  {
    slug: 'fine-line-studio',
    name: 'Fine Line Studio',
    description: 'Estudio de tatuajes minimalistas especializados en fine line, micro realismo y piercing premium en Villa Crespo.',
    phone: '+54 11 5555-4002',
    email: 'hola@finelinestudio.com',
    address: 'Thames 456',
    city: 'Villa Crespo, Buenos Aires',
    instagram: '@finelinestudio',
    logo: 'https://images.unsplash.com/photo-1590246814883-57c511c5e7b5?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1598371839696-5c5bb1304a8a?w=1600&h=600&fit=crop',
    settings: {
      primaryColor: '#1A1A1A',
      secondaryColor: '#6B7280',
      heroStyle: 'zen',
    },
    branding: {
      primaryColor: '#1A1A1A',
      secondaryColor: '#6B7280',
      accentColor: '#A3A3A3',
      backgroundStyle: 'minimal',
      welcomeTitle: 'Fine Line Studio',
      welcomeSubtitle: 'Arte minimalista sobre tu piel',
    },
    owner: { email: 'demo@finelinestudio.com', name: 'Sol Herrera' },
    categories: [
      { name: 'Fine Line', order: 0 },
      { name: 'Micro Realismo', order: 1 },
      { name: 'Piercing Premium', order: 2 },
    ],
    services: [
      { name: 'Fine Line Pequeño', description: 'Tatuaje fine line hasta 5cm. Diseños delicados con líneas ultra finas', price: 20000, duration: 60, image: '', categoryIndex: 0, order: 0 },
      { name: 'Fine Line Mediano', description: 'Tatuaje fine line 5-15cm. Diseños botánicos, geométricos o lettering', price: 35000, duration: 120, image: '', categoryIndex: 0, order: 1 },
      { name: 'Botanical Fine Line', description: 'Flores, ramas y plantas en trazo fino. Incluye diseño personalizado', price: 30000, duration: 90, image: '', categoryIndex: 0, order: 2 },
      { name: 'Micro Portrait', description: 'Retratos miniatura hiperrealistas de hasta 8cm', price: 45000, duration: 180, image: '', categoryIndex: 1, order: 0 },
      { name: 'Micro Animal Realista', description: 'Retratos realistas de mascotas o animales en miniatura', price: 40000, duration: 150, image: '', categoryIndex: 1, order: 1 },
      { name: 'Micro Paisaje', description: 'Paisajes detallados en escala miniatura con sombreado fino', price: 50000, duration: 210, image: '', categoryIndex: 1, order: 2 },
      { name: 'Piercing Helix', description: 'Piercing helix con joyería de titanio ASTM F136 premium', price: 12000, duration: 20, image: '', categoryIndex: 2, order: 0 },
      { name: 'Piercing Septum', description: 'Piercing septum con aro clicker de titanio premium', price: 15000, duration: 25, image: '', categoryIndex: 2, order: 1 },
    ],
    employees: [
      { name: 'Sol Herrera', email: 'sol@finelinestudio.com', phone: '+54 11 6002-0001', image: '', specialty: 'Fine line & botanical', bio: 'Artista especializada en fine line con 8 años de trayectoria. Formada en Berlín.', serviceIndices: [0, 1, 2] },
      { name: 'Tomás Aguirre', email: 'tomas@finelinestudio.com', phone: '+54 11 6002-0002', image: '', specialty: 'Micro realismo', bio: 'Especialista en micro retratos y realismo miniatura. Premiado en convenciones internacionales.', serviceIndices: [3, 4, 5] },
      { name: 'Delfina Quiroga', email: 'delfina@finelinestudio.com', phone: '+54 11 6002-0003', image: '', specialty: 'Piercing profesional', bio: 'Piercer certificada APP con enfoque en joyería premium y cuidado post-piercing.', serviceIndices: [6, 7] },
    ],
    customers: [
      { name: 'Martina Ríos', phone: '+54 11 7002-0001', email: 'martina.r@email.com', totalBookings: 4 },
      { name: 'Joaquín Paz', phone: '+54 11 7002-0002', email: 'joaquin.p@email.com', totalBookings: 6 },
      { name: 'Agustina Flores', phone: '+54 11 7002-0003', email: 'agustina.f@email.com', totalBookings: 2 },
      { name: 'Nicolás Duarte', phone: '+54 11 7002-0004', email: 'nicolas.d@email.com', totalBookings: 3 },
      { name: 'Camila Ortiz', phone: '+54 11 7002-0005', email: 'camila.o@email.com', totalBookings: 5 },
      { name: 'Lucas Benítez', phone: '+54 11 7002-0006', email: 'lucas.b@email.com', totalBookings: 1 },
    ],
    schedules: [
      { dayOfWeek: 0, startTime: '10:00', endTime: '18:00', isActive: false },
      { dayOfWeek: 1, startTime: '11:00', endTime: '20:00', isActive: true },
      { dayOfWeek: 2, startTime: '11:00', endTime: '20:00', isActive: true },
      { dayOfWeek: 3, startTime: '11:00', endTime: '20:00', isActive: true },
      { dayOfWeek: 4, startTime: '11:00', endTime: '20:00', isActive: true },
      { dayOfWeek: 5, startTime: '11:00', endTime: '20:00', isActive: true },
      { dayOfWeek: 6, startTime: '11:00', endTime: '16:00', isActive: true },
    ],
  },

  // ─────────────────────────────────────────
  // 3. VETCARE CENTRO VETERINARIO — Veterinaria
  // ─────────────────────────────────────────
  {
    slug: 'vetcare-centro',
    name: 'VetCare Centro Veterinario',
    description: 'Centro veterinario integral con consultas, vacunación, cirugía y diagnóstico por imágenes en Caballito.',
    phone: '+54 11 5555-4003',
    email: 'hola@vetcarecentro.com',
    address: 'Av. Rivadavia 5678',
    city: 'Caballito, Buenos Aires',
    instagram: '@vetcarecentro',
    logo: 'https://images.unsplash.com/photo-1628009368231-7bb7cf0a1f59?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600&h=600&fit=crop',
    settings: {
      primaryColor: '#0D9488',
      secondaryColor: '#0284C7',
      heroStyle: 'clinical',
    },
    branding: {
      primaryColor: '#0D9488',
      secondaryColor: '#0284C7',
      accentColor: '#06B6D4',
      backgroundStyle: 'fresh',
      welcomeTitle: 'VetCare Centro Veterinario',
      welcomeSubtitle: 'Cuidamos a quienes más querés',
    },
    owner: { email: 'demo@vetcarecentro.com', name: 'Dr. Sebastián Molina' },
    categories: [
      { name: 'Consultas', order: 0 },
      { name: 'Vacunación', order: 1 },
      { name: 'Cirugía', order: 2 },
      { name: 'Diagnóstico', order: 3 },
    ],
    services: [
      { name: 'Consulta General', description: 'Revisión clínica completa con evaluación de peso, temperatura y auscultación', price: 8000, duration: 30, image: '', categoryIndex: 0, order: 0 },
      { name: 'Consulta de Urgencia', description: 'Atención prioritaria para emergencias veterinarias', price: 12000, duration: 45, image: '', categoryIndex: 0, order: 1 },
      { name: 'Plan de Vacunas Cachorro', description: 'Esquema completo de vacunación para cachorros (3 dosis + rabia)', price: 15000, duration: 20, image: '', categoryIndex: 1, order: 0 },
      { name: 'Vacuna Antirrábica', description: 'Vacuna antirrábica anual con certificado oficial', price: 5000, duration: 15, image: '', categoryIndex: 1, order: 1 },
      { name: 'Castración Perro/Gato', description: 'Cirugía de esterilización con anestesia inhalatoria y monitoreo', includes: 'Pre-quirúrgico, anestesia, cirugía, medicación post-operatoria', price: 25000, duration: 60, image: '', categoryIndex: 2, order: 0 },
      { name: 'Limpieza Dental', description: 'Profilaxis dental con ultrasonido bajo anestesia general', price: 18000, duration: 45, image: '', categoryIndex: 2, order: 1 },
      { name: 'Ecografía Abdominal', description: 'Estudio ecográfico completo de abdomen con informe', price: 10000, duration: 30, image: '', categoryIndex: 3, order: 0 },
      { name: 'Radiografía', description: 'Radiografía digital con informe del veterinario', price: 8000, duration: 20, image: '', categoryIndex: 3, order: 1 },
    ],
    employees: [
      { name: 'Dr. Sebastián Molina', email: 'sebastian@vetcarecentro.com', phone: '+54 11 6003-0001', image: '', specialty: 'Clínica general', bio: 'Médico veterinario UBA con 15 años de experiencia en pequeños animales', serviceIndices: [0, 1, 2, 3] },
      { name: 'Dra. Florencia Díaz', email: 'florencia@vetcarecentro.com', phone: '+54 11 6003-0002', image: '', specialty: 'Cirugía', bio: 'Cirujana veterinaria especializada en tejidos blandos y ortopedia', serviceIndices: [4, 5] },
      { name: 'Dr. Matías Luna', email: 'matias@vetcarecentro.com', phone: '+54 11 6003-0003', image: '', specialty: 'Diagnóstico por imágenes', bio: 'Especialista en ecografía y radiología veterinaria', serviceIndices: [0, 6, 7] },
    ],
    customers: [
      { name: 'Roberto (Luna)', phone: '+54 11 7003-0001', email: 'roberto.luna@email.com', totalBookings: 10 },
      { name: 'Mariana (Rocky)', phone: '+54 11 7003-0002', email: 'mariana.rocky@email.com', totalBookings: 7 },
      { name: 'Diego (Milo)', phone: '+54 11 7003-0003', email: 'diego.milo@email.com', totalBookings: 4 },
      { name: 'Celeste (Nina)', phone: '+54 11 7003-0004', email: 'celeste.nina@email.com', totalBookings: 6 },
      { name: 'Fernando (Max)', phone: '+54 11 7003-0005', email: 'fernando.max@email.com', totalBookings: 3 },
      { name: 'Patricia (Coco)', phone: '+54 11 7003-0006', email: 'patricia.coco@email.com', totalBookings: 8 },
    ],
    schedules: [
      { dayOfWeek: 0, startTime: '10:00', endTime: '14:00', isActive: true },
      { dayOfWeek: 1, startTime: '08:00', endTime: '20:00', isActive: true },
      { dayOfWeek: 2, startTime: '08:00', endTime: '20:00', isActive: true },
      { dayOfWeek: 3, startTime: '08:00', endTime: '20:00', isActive: true },
      { dayOfWeek: 4, startTime: '08:00', endTime: '20:00', isActive: true },
      { dayOfWeek: 5, startTime: '08:00', endTime: '20:00', isActive: true },
      { dayOfWeek: 6, startTime: '09:00', endTime: '14:00', isActive: true },
    ],
  },
];

// ============================================================
// HERO STYLE UPDATES for all showcase tenants
// ============================================================

const HERO_STYLE_UPDATES: { slug: string; heroStyle: string }[] = [
  { slug: 'salon-noir', heroStyle: 'zen' },
  { slug: 'the-barber-club', heroStyle: 'bold' },
  { slug: 'nails-and-co', heroStyle: 'classic' },
  { slug: 'zen-spa-masajes', heroStyle: 'zen' },
  { slug: 'dra-martinez-dermatologia', heroStyle: 'clinical' },
  { slug: 'fitzone-training', heroStyle: 'energetic' },
  { slug: 'ink-master-studio', heroStyle: 'bold' },
  { slug: 'happy-paws', heroStyle: 'warm' },
];

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('🎬 Showcase Seed — Creating 3 new businesses + updating heroStyles\n');

  const passwordHash = await bcrypt.hash('demo123456', 10);

  // Find the Gratis plan
  const gratisPlan = await prisma.subscriptionPlan.findFirst({ where: { name: 'Gratis' } });
  if (!gratisPlan) {
    console.error('❌ No "Gratis" subscription plan found. Run the main seed first.');
    process.exit(1);
  }

  // ─── Create 3 new businesses ─────────────────────
  for (const biz of SHOWCASE_BUSINESSES) {
    await createBusiness(biz, passwordHash, gratisPlan.id);
  }

  // ─── Update heroStyles for existing showcase tenants ─────
  console.log('\n🎨 Updating heroStyles for showcase tenants...');

  for (const upd of HERO_STYLE_UPDATES) {
    const tenant = await prisma.tenant.findUnique({ where: { slug: upd.slug } });
    if (!tenant) {
      console.log(`  ⚠️ Tenant ${upd.slug} not found, skipping`);
      continue;
    }
    const currentSettings = JSON.parse((tenant.settings as string) || '{}');
    currentSettings.heroStyle = upd.heroStyle;
    await prisma.tenant.update({
      where: { slug: upd.slug },
      data: { settings: JSON.stringify(currentSettings) },
    });
    console.log(`  ✅ ${upd.slug} → heroStyle: ${upd.heroStyle}`);
  }

  console.log('\n✅ Showcase seed complete!');
  console.log('  New pages:');
  console.log('    /alma-relax-spa');
  console.log('    /fine-line-studio');
  console.log('    /vetcare-centro');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
