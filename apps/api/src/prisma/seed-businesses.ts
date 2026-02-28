import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================================
// TYPES
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
    [key: string]: unknown;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundStyle: string;
    welcomeTitle: string;
    welcomeSubtitle: string;
    fontFamily?: string;
    headingFontFamily?: string;
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
// HELPER: Create a single business with all related data
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
      fontFamily: data.branding.fontFamily || 'Inter',
      headingFontFamily: data.branding.headingFontFamily || 'Inter',
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
      fontFamily: data.branding.fontFamily || 'Inter',
      headingFontFamily: data.branding.headingFontFamily || 'Inter',
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
  // Delete existing categories for this tenant first to avoid conflicts
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
// DEFAULT SCHEDULES
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
// 10 BUSINESSES DATA
// ============================================================

const businesses: BusinessData[] = [
  // -------------------------------------------------------
  // 1. NAILS & CO. (Centro de Unas)
  // -------------------------------------------------------
  {
    slug: 'nails-and-co',
    name: 'Nails & Co.',
    description: 'Centro especializado en unas esculpidas, semipermanente y nail art. Tendencias y tecnicas de vanguardia para unas perfectas.',
    phone: '+54 11 4567-1001',
    email: 'hola@nailsandco.com',
    address: 'Av. Cabildo 2150, Local 12',
    city: 'Buenos Aires',
    instagram: '@nails.and.co',
    logo: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=1600&h=600&fit=crop',
    settings: { primaryColor: '#e91e63', secondaryColor: '#f06292' },
    branding: {
      primaryColor: '#e91e63',
      secondaryColor: '#f06292',
      accentColor: '#ff80ab',
      backgroundStyle: 'vibrant',
      welcomeTitle: 'Nails & Co.',
      welcomeSubtitle: 'Unas perfectas, estilo unico',
    },
    owner: { email: 'demo@nailsandco.com', name: 'Carolina Ruiz' },
    categories: [
      { name: 'Esculpidas', order: 1 },
      { name: 'Semipermanente', order: 2 },
      { name: 'Manicura', order: 3 },
      { name: 'Nail Art', order: 4 },
    ],
    services: [
      { name: 'Unas esculpidas acrilico', description: 'Aplicacion completa de unas esculpidas en acrilico con diseno a eleccion', includes: 'Preparacion, esculpido, limado, diseno basico', price: 15000, duration: 120, image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=600&fit=crop', categoryIndex: 0, order: 1 },
      { name: 'Unas gel', description: 'Esculpidas en gel polygel con terminacion natural', includes: 'Preparacion, aplicacion gel, limado, brillo', price: 16000, duration: 120, image: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&h=600&fit=crop', categoryIndex: 0, order: 2 },
      { name: 'Semi clasico', description: 'Esmaltado semipermanente color liso a eleccion', includes: 'Limado, cuticulado, esmaltado, secado UV', price: 8000, duration: 60, image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=600&fit=crop', categoryIndex: 1, order: 1 },
      { name: 'Semi con diseno', description: 'Semipermanente con diseno artistico en hasta 4 unas', includes: 'Limado, cuticulado, esmaltado, disenos, secado UV', price: 10000, duration: 75, image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&h=600&fit=crop', categoryIndex: 1, order: 2 },
      { name: 'Manicura rusa', description: 'Manicura con tecnica rusa de cuticulado perfecto', includes: 'Cuticulado con torno, hidratacion, esmaltado', price: 9000, duration: 60, image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&h=600&fit=crop', categoryIndex: 2, order: 1 },
      { name: 'Pedicura spa', description: 'Pedicura completa con bano de pies y tratamiento hidratante', includes: 'Bano de pies, limado, cuticulado, exfoliacion, esmaltado', price: 10000, duration: 75, image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&h=600&fit=crop', categoryIndex: 2, order: 2 },
      { name: 'Nail art premium', description: 'Disenos artisticos complejos, encapsulados, 3D o pedreria', includes: 'Diseno completo en todas las unas', price: 18000, duration: 150, image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=600&fit=crop', categoryIndex: 3, order: 1 },
      { name: 'Retoque esculpidas', description: 'Relleno y mantenimiento de unas esculpidas', includes: 'Retiro del largo, relleno, limado, diseno basico', price: 10000, duration: 90, image: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&h=600&fit=crop', categoryIndex: 0, order: 3 },
      { name: 'Kapping gel', description: 'Capa protectora de gel sobre una natural', includes: 'Preparacion, aplicacion gel, limado', price: 8000, duration: 45, image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&h=600&fit=crop', categoryIndex: 1, order: 3 },
      { name: 'Bano de acrilico', description: 'Fortalecimiento con capa fina de acrilico', includes: 'Preparacion, aplicacion acrilico, limado, brillo', price: 9000, duration: 60, image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=600&fit=crop', categoryIndex: 0, order: 4 },
    ],
    employees: [
      { name: 'Valentina Torres', email: 'vale@nailsandco.com', phone: '+5491155001001', image: 'https://randomuser.me/api/portraits/women/21.jpg', specialty: 'Esculpidas y Nail Art', bio: 'Especialista en esculpidas acrilico y disenos 3D. +8 anos de experiencia.', serviceIndices: [0, 1, 6, 7, 9] },
      { name: 'Camila Mendez', email: 'cami@nailsandco.com', phone: '+5491155001002', image: 'https://randomuser.me/api/portraits/women/22.jpg', specialty: 'Semipermanente', bio: 'Manicurista certificada en tecnica rusa y semipermanente.', serviceIndices: [2, 3, 4, 8] },
      { name: 'Lucia Herrera', email: 'lucia@nailsandco.com', phone: '+5491155001003', image: 'https://randomuser.me/api/portraits/women/23.jpg', specialty: 'Gel y Pedicura', bio: 'Experta en unas de gel polygel y pedicura spa.', serviceIndices: [1, 5, 8, 9] },
      { name: 'Sofia Alvarez', email: 'sofi@nailsandco.com', phone: '+5491155001004', image: 'https://randomuser.me/api/portraits/women/24.jpg', specialty: 'Nail Art', bio: 'Artista de unas, especializada en disenos a mano alzada y encapsulados.', serviceIndices: [3, 6, 0, 7] },
    ],
    customers: [
      { name: 'Maria Paz Gonzalez', phone: '+5491166001001', email: 'mpaz@email.com', totalBookings: 15 },
      { name: 'Florencia Diaz', phone: '+5491166001002', email: 'flor.d@email.com', totalBookings: 8 },
      { name: 'Antonella Ruiz', phone: '+5491166001003', email: 'anto.r@email.com', totalBookings: 12 },
      { name: 'Julieta Moreno', phone: '+5491166001004', email: 'juli.m@email.com', totalBookings: 5 },
      { name: 'Candela Vega', phone: '+5491166001005', email: 'cande.v@email.com', totalBookings: 20 },
      { name: 'Rocio Blanco', phone: '+5491166001006', email: 'rocio.b@email.com', totalBookings: 3 },
    ],
    schedules: STANDARD_SCHEDULE,
  },

  // -------------------------------------------------------
  // 2. LASH STUDIO BA (Centro de Pestanas)
  // -------------------------------------------------------
  {
    slug: 'lash-studio-ba',
    name: 'Lash Studio BA',
    description: 'Estudio premium de extensiones de pestanas, lifting y diseno de cejas. Mirada perfecta garantizada.',
    phone: '+54 11 4567-1002',
    email: 'info@lashstudioba.com',
    address: 'Gorriti 4820, Palermo',
    city: 'Buenos Aires',
    instagram: '@lash.studio.ba',
    logo: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1600&h=600&fit=crop',
    settings: { primaryColor: '#9c27b0', secondaryColor: '#ce93d8' },
    branding: {
      primaryColor: '#9c27b0',
      secondaryColor: '#ce93d8',
      accentColor: '#ea80fc',
      backgroundStyle: 'elegant',
      welcomeTitle: 'Lash Studio BA',
      welcomeSubtitle: 'Tu mirada, nuestra pasion',
    },
    owner: { email: 'demo@lashstudioba.com', name: 'Agustina Paz' },
    categories: [
      { name: 'Extensiones', order: 1 },
      { name: 'Lifting', order: 2 },
      { name: 'Cejas', order: 3 },
    ],
    services: [
      { name: 'Extensiones clasicas', description: 'Aplicacion de extensiones pelo a pelo para un look natural', includes: 'Evaluacion, aplicacion completa, retoque final', price: 14000, duration: 120, image: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=600&h=600&fit=crop', categoryIndex: 0, order: 1 },
      { name: 'Volumen ruso', description: 'Tecnica de abanicos 3D-5D para mayor volumen y densidad', includes: 'Evaluacion, aplicacion volumen, diseno personalizado', price: 18000, duration: 150, image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop', categoryIndex: 0, order: 2 },
      { name: 'Mega volumen', description: 'Extensiones de mega volumen 6D-10D para efecto dramatico', includes: 'Evaluacion, aplicacion mega volumen, diseno', price: 22000, duration: 180, image: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=600&h=600&fit=crop', categoryIndex: 0, order: 3 },
      { name: 'Lifting de pestanas', description: 'Curvado permanente de pestanas naturales que dura 6-8 semanas', includes: 'Lifting, tinting, nutricion', price: 10000, duration: 60, image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop', categoryIndex: 1, order: 1 },
      { name: 'Laminado de cejas', description: 'Laminado y diseno de cejas para un look peinado y ordenado', includes: 'Laminado, tinting, diseno', price: 8000, duration: 45, image: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=600&h=600&fit=crop', categoryIndex: 2, order: 1 },
      { name: 'Tinting de pestanas', description: 'Tintura de pestanas para mayor definicion sin maquillaje', includes: 'Aplicacion de tinte, cuidado', price: 6000, duration: 30, image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop', categoryIndex: 1, order: 2 },
      { name: 'Retoque 2 semanas', description: 'Mantenimiento de extensiones a las 2 semanas', includes: 'Retiro selectivo, relleno, limpieza', price: 8000, duration: 60, image: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=600&h=600&fit=crop', categoryIndex: 0, order: 4 },
      { name: 'Retoque 3 semanas', description: 'Mantenimiento de extensiones a las 3 semanas', includes: 'Retiro selectivo, relleno completo', price: 10000, duration: 90, image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop', categoryIndex: 0, order: 5 },
      { name: 'Combo lifting + tinting', description: 'Lifting de pestanas con tinting incluido', includes: 'Lifting completo, tinting, nutricion', price: 13000, duration: 75, image: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=600&h=600&fit=crop', categoryIndex: 1, order: 3 },
    ],
    employees: [
      { name: 'Martina Gomez', email: 'martina@lashstudioba.com', phone: '+5491155002001', image: 'https://randomuser.me/api/portraits/women/31.jpg', specialty: 'Extensiones Clasicas y Volumen', bio: 'Lash artist certificada con +5 anos. Especialista en volumen ruso.', serviceIndices: [0, 1, 2, 6, 7] },
      { name: 'Delfina Rios', email: 'delfi@lashstudioba.com', phone: '+5491155002002', image: 'https://randomuser.me/api/portraits/women/32.jpg', specialty: 'Lifting y Cejas', bio: 'Experta en lifting de pestanas y laminado de cejas.', serviceIndices: [3, 4, 5, 8] },
      { name: 'Isabella Ferrer', email: 'isa@lashstudioba.com', phone: '+5491155002003', image: 'https://randomuser.me/api/portraits/women/33.jpg', specialty: 'Mega Volumen', bio: 'Especialista en mega volumen y disenos dramaticos.', serviceIndices: [1, 2, 6, 7] },
    ],
    customers: [
      { name: 'Pilar Sanchez', phone: '+5491166002001', email: 'pilar.s@email.com', totalBookings: 10 },
      { name: 'Milagros Torres', phone: '+5491166002002', email: 'mili.t@email.com', totalBookings: 6 },
      { name: 'Abril Castro', phone: '+5491166002003', email: 'abril.c@email.com', totalBookings: 14 },
      { name: 'Catalina Vera', phone: '+5491166002004', email: 'cata.v@email.com', totalBookings: 8 },
      { name: 'Renata Molina', phone: '+5491166002005', email: 'rena.m@email.com', totalBookings: 4 },
    ],
    schedules: STANDARD_SCHEDULE,
  },

  // -------------------------------------------------------
  // 3. ZEN SPA & MASAJES
  // -------------------------------------------------------
  {
    slug: 'zen-spa-masajes',
    name: 'Zen Spa & Masajes',
    description: 'Spa urbano con masajes relajantes, descontracturantes, tratamientos corporales y circuitos de bienestar. Tu oasis en la ciudad.',
    phone: '+54 11 4567-1003',
    email: 'reservas@zenspaba.com',
    address: 'Av. Libertador 6200, Belgrano',
    city: 'Buenos Aires',
    instagram: '@zen.spa.masajes',
    logo: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=1600&h=600&fit=crop',
    settings: { primaryColor: '#00897b', secondaryColor: '#4db6ac' },
    branding: {
      primaryColor: '#00897b',
      secondaryColor: '#4db6ac',
      accentColor: '#80cbc4',
      backgroundStyle: 'fresh',
      welcomeTitle: 'Zen Spa & Masajes',
      welcomeSubtitle: 'Relaja cuerpo y mente',
    },
    owner: { email: 'demo@zenspaba.com', name: 'Andrea Villalba' },
    categories: [
      { name: 'Masajes', order: 1 },
      { name: 'Tratamientos Corporales', order: 2 },
      { name: 'Faciales', order: 3 },
      { name: 'Circuitos', order: 4 },
    ],
    services: [
      { name: 'Masaje relajante 60min', description: 'Masaje de cuerpo completo con aceites esenciales y aromaterapia', includes: 'Aceites esenciales, musica ambiental, infusion post-masaje', price: 12000, duration: 60, image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=600&fit=crop', categoryIndex: 0, order: 1 },
      { name: 'Masaje descontracturante', description: 'Masaje profundo para aliviar contracturas y tensiones musculares', includes: 'Diagnostico muscular, masaje profundo, estiramientos', price: 14000, duration: 60, image: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=600&h=600&fit=crop', categoryIndex: 0, order: 2 },
      { name: 'Masaje piedras calientes', description: 'Terapia con piedras volcanicas calientes para relajacion profunda', includes: 'Piedras calientes, aceites, relajacion guiada', price: 16000, duration: 75, image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&h=600&fit=crop', categoryIndex: 0, order: 3 },
      { name: 'Drenaje linfatico', description: 'Masaje suave para activar el sistema linfatico y reducir retencion de liquidos', includes: 'Tecnica Vodder, evaluacion previa', price: 12000, duration: 60, image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=600&fit=crop', categoryIndex: 1, order: 1 },
      { name: 'Envoltura corporal', description: 'Tratamiento corporal con envolturas de algas o chocolate', includes: 'Exfoliacion, envoltura, hidratacion final', price: 15000, duration: 75, image: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=600&h=600&fit=crop', categoryIndex: 1, order: 2 },
      { name: 'Limpieza facial profunda', description: 'Limpieza completa con vapor, extraccion y mascarilla revitalizante', includes: 'Vapor, extraccion, mascarilla, hidratacion', price: 10000, duration: 60, image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=600&fit=crop', categoryIndex: 2, order: 1 },
      { name: 'Circuito spa completo', description: 'Sauna + pileta climatizada + masaje relajante de 30min', includes: 'Acceso a sauna, pileta, masaje, bata, infusion', price: 25000, duration: 150, image: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=600&h=600&fit=crop', categoryIndex: 3, order: 1 },
      { name: 'Reflexologia', description: 'Masaje de puntos reflejos en pies para equilibrar el organismo', includes: 'Bano de pies, reflexologia, relajacion', price: 10000, duration: 45, image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=600&fit=crop', categoryIndex: 0, order: 4 },
      { name: 'Masaje 4 manos', description: 'Dos terapeutas trabajando simultaneamente para una experiencia unica', includes: 'Doble terapeuta, aceites premium, relax total', price: 22000, duration: 60, image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&h=600&fit=crop', categoryIndex: 0, order: 5 },
    ],
    employees: [
      { name: 'Romina Lagos', email: 'romina@zenspaba.com', phone: '+5491155003001', image: 'https://randomuser.me/api/portraits/women/41.jpg', specialty: 'Masajes Relajantes', bio: 'Terapeuta corporal especializada en masajes relajantes y piedras calientes.', serviceIndices: [0, 2, 7, 8] },
      { name: 'Fernando Ibarra', email: 'fer@zenspaba.com', phone: '+5491155003002', image: 'https://randomuser.me/api/portraits/men/41.jpg', specialty: 'Descontracturante', bio: 'Kinesiologo y masajista. Experto en masaje descontracturante y deportivo.', serviceIndices: [1, 3, 7, 8] },
      { name: 'Paula Mendez', email: 'paula@zenspaba.com', phone: '+5491155003003', image: 'https://randomuser.me/api/portraits/women/42.jpg', specialty: 'Faciales y Corporales', bio: 'Cosmetologa especializada en tratamientos faciales y envolturas corporales.', serviceIndices: [4, 5, 3] },
      { name: 'Diego Peralta', email: 'diego@zenspaba.com', phone: '+5491155003004', image: 'https://randomuser.me/api/portraits/men/42.jpg', specialty: 'Reflexologia', bio: 'Reflexologo certificado y terapeuta holístico con 10 anos de experiencia.', serviceIndices: [0, 1, 7, 8] },
    ],
    customers: [
      { name: 'Carolina Insua', phone: '+5491166003001', email: 'carol.i@email.com', totalBookings: 18 },
      { name: 'Marcos Navarro', phone: '+5491166003002', email: 'marcos.n@email.com', totalBookings: 7 },
      { name: 'Patricia Ledesma', phone: '+5491166003003', email: 'patri.l@email.com', totalBookings: 12 },
      { name: 'Ricardo Sosa', phone: '+5491166003004', email: 'ricardo.s@email.com', totalBookings: 4 },
      { name: 'Virginia Ponce', phone: '+5491166003005', email: 'virgi.p@email.com', totalBookings: 9 },
      { name: 'Esteban Quiroga', phone: '+5491166003006', email: 'esteban.q@email.com', totalBookings: 6 },
      { name: 'Natalia Fuentes', phone: '+5491166003007', email: 'nati.f@email.com', totalBookings: 15 },
    ],
    schedules: STANDARD_SCHEDULE,
  },

  // -------------------------------------------------------
  // 4. DRA. MARTINEZ DERMATOLOGIA
  // -------------------------------------------------------
  {
    slug: 'dra-martinez-dermatologia',
    name: 'Dra. Martinez Dermatologia',
    description: 'Consultorio dermatologico especializado en tratamientos esteticos y medicos. Botox, rellenos, peelings y mas.',
    phone: '+54 11 4567-1004',
    email: 'turnos@dramartinezdermo.com',
    address: 'Av. Callao 1234, Piso 5 Of. B',
    city: 'Buenos Aires',
    instagram: '@dra.martinez.dermo',
    logo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1600&h=600&fit=crop',
    settings: { primaryColor: '#1565c0', secondaryColor: '#64b5f6' },
    branding: {
      primaryColor: '#1565c0',
      secondaryColor: '#64b5f6',
      accentColor: '#42a5f5',
      backgroundStyle: 'minimal',
      welcomeTitle: 'Dra. Martinez Dermatologia',
      welcomeSubtitle: 'Cuidamos tu piel con ciencia y tecnologia',
    },
    owner: { email: 'demo@dramartinezdermo.com', name: 'Dra. Laura Martinez' },
    categories: [
      { name: 'Consultas', order: 1 },
      { name: 'Tratamientos Esteticos', order: 2 },
      { name: 'Tratamientos Medicos', order: 3 },
    ],
    services: [
      { name: 'Consulta primera vez', description: 'Evaluacion dermatologica completa con diagnostico y plan de tratamiento', includes: 'Evaluacion, dermatoscopia basica, receta', price: 15000, duration: 40, image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=600&fit=crop', categoryIndex: 0, order: 1 },
      { name: 'Control', description: 'Consulta de seguimiento para evaluar progreso del tratamiento', includes: 'Evaluacion, ajuste de tratamiento', price: 10000, duration: 20, image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&h=600&fit=crop', categoryIndex: 0, order: 2 },
      { name: 'Peeling quimico', description: 'Renovacion celular con acidos suaves para una piel radiante y uniforme', includes: 'Limpieza, aplicacion de acidos, proteccion', price: 18000, duration: 45, image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=600&fit=crop', categoryIndex: 1, order: 1 },
      { name: 'Microagujado', description: 'Tratamiento con dermapen para estimular colageno y mejorar textura', includes: 'Anestesia topica, microagujado, serum post-tratamiento', price: 20000, duration: 45, image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&h=600&fit=crop', categoryIndex: 1, order: 2 },
      { name: 'Botox', description: 'Aplicacion de toxina botulinica para arrugas de expresion', includes: 'Evaluacion, marcacion, aplicacion, control 15 dias', price: 45000, duration: 30, image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=600&fit=crop', categoryIndex: 1, order: 3 },
      { name: 'Relleno ac. hialuronico', description: 'Relleno de labios, surcos o pomulos con acido hialuronico', includes: 'Evaluacion, anestesia, aplicacion, control', price: 40000, duration: 45, image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&h=600&fit=crop', categoryIndex: 1, order: 4 },
      { name: 'Crioterapia', description: 'Tratamiento con frio para verrugas, queratosis y lesiones benignas', includes: 'Evaluacion, aplicacion de nitrogeno liquido', price: 8000, duration: 20, image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=600&fit=crop', categoryIndex: 2, order: 1 },
      { name: 'Dermatoscopia', description: 'Evaluacion digital de lunares y lesiones pigmentadas con dermatoscopio', includes: 'Mapeo de lunares, informe digital', price: 12000, duration: 30, image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&h=600&fit=crop', categoryIndex: 2, order: 2 },
      { name: 'Limpieza facial medica', description: 'Limpieza profunda con protocolo medico y productos farmaceuticos', includes: 'Limpieza, extraccion, peeling suave, LED', price: 15000, duration: 60, image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=600&fit=crop', categoryIndex: 1, order: 5 },
    ],
    employees: [
      { name: 'Dra. Laura Martinez', email: 'laura@dramartinezdermo.com', phone: '+5491155004001', image: 'https://randomuser.me/api/portraits/women/51.jpg', specialty: 'Dermatologia Estetica', bio: 'Dermatologa MN 45678. Especialista en estetica facial y corporal. 15 anos de experiencia.', serviceIndices: [0, 1, 4, 5, 7] },
      { name: 'Dr. Sebastian Aguirre', email: 'seba@dramartinezdermo.com', phone: '+5491155004002', image: 'https://randomuser.me/api/portraits/men/51.jpg', specialty: 'Dermatologia Clinica', bio: 'Dermatologo MN 56789. Especialista en dermatoscopia y tratamientos medicos.', serviceIndices: [0, 1, 6, 7] },
      { name: 'Lic. Marina Costa', email: 'marina@dramartinezdermo.com', phone: '+5491155004003', image: 'https://randomuser.me/api/portraits/women/52.jpg', specialty: 'Cosmiatra', bio: 'Cosmiatra especializada en peelings, microagujado y limpiezas medicalizadas.', serviceIndices: [2, 3, 8] },
    ],
    customers: [
      { name: 'Alejandra Ruiz', phone: '+5491166004001', email: 'ale.r@email.com', totalBookings: 8 },
      { name: 'Gabriel Luna', phone: '+5491166004002', email: 'gabi.l@email.com', totalBookings: 3 },
      { name: 'Silvina Campos', phone: '+5491166004003', email: 'silvi.c@email.com', totalBookings: 11 },
      { name: 'Mariano Diaz', phone: '+5491166004004', email: 'mariano.d@email.com', totalBookings: 5 },
      { name: 'Daniela Rios', phone: '+5491166004005', email: 'dani.r@email.com', totalBookings: 7 },
      { name: 'Claudia Pereyra', phone: '+5491166004006', email: 'clau.p@email.com', totalBookings: 16 },
    ],
    schedules: [
      { dayOfWeek: 0, startTime: '10:00', endTime: '18:00', isActive: false },
      { dayOfWeek: 1, startTime: '08:30', endTime: '18:00', isActive: true },
      { dayOfWeek: 2, startTime: '08:30', endTime: '18:00', isActive: true },
      { dayOfWeek: 3, startTime: '08:30', endTime: '18:00', isActive: true },
      { dayOfWeek: 4, startTime: '08:30', endTime: '18:00', isActive: true },
      { dayOfWeek: 5, startTime: '08:30', endTime: '18:00', isActive: true },
      { dayOfWeek: 6, startTime: '09:00', endTime: '13:00', isActive: true },
    ],
  },

  // -------------------------------------------------------
  // 5. THE BARBER CLUB
  // -------------------------------------------------------
  {
    slug: 'the-barber-club',
    name: 'The Barber Club',
    description: 'Barberia premium con estilo clasico y moderno. Cortes fade, barba sculpting, afeitada a navaja y mas.',
    phone: '+54 11 4567-1005',
    email: 'info@thebarberclub.com',
    address: 'Av. Corrientes 3456',
    city: 'Buenos Aires',
    instagram: '@the.barber.club.ba',
    logo: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1600&h=600&fit=crop',
    settings: { primaryColor: '#212121', secondaryColor: '#d4a574' },
    branding: {
      primaryColor: '#212121',
      secondaryColor: '#d4a574',
      accentColor: '#8d6e63',
      backgroundStyle: 'modern',
      welcomeTitle: 'The Barber Club',
      welcomeSubtitle: 'Estilo, actitud y precision',
    },
    owner: { email: 'demo@thebarberclub.com', name: 'Martin Rossi' },
    categories: [
      { name: 'Cortes', order: 1 },
      { name: 'Barba', order: 2 },
      { name: 'Combos', order: 3 },
      { name: 'Premium', order: 4 },
    ],
    services: [
      { name: 'Corte clasico', description: 'Corte de pelo clasico con tijera y maquina', includes: 'Lavado, corte, peinado, producto de terminacion', price: 5000, duration: 30, image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=600&fit=crop', categoryIndex: 0, order: 1 },
      { name: 'Corte + barba', description: 'Corte de pelo con perfilado de barba completo', includes: 'Lavado, corte, perfilado de barba, toalla caliente', price: 7000, duration: 45, image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=600&fit=crop', categoryIndex: 2, order: 1 },
      { name: 'Corte fade', description: 'Corte degradado fade (low, mid o high) a eleccion', includes: 'Lavado, fade, diseno, producto', price: 6000, duration: 40, image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=600&fit=crop', categoryIndex: 0, order: 2 },
      { name: 'Barba sculpting', description: 'Diseno y perfilado de barba con navaja y maquina', includes: 'Toalla caliente, perfilado, aceite para barba', price: 4000, duration: 25, image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop', categoryIndex: 1, order: 1 },
      { name: 'Afeitada navaja', description: 'Afeitada clasica a navaja con toallas calientes', includes: 'Vapor, pre-shave, afeitado, balsamo post-afeitado', price: 5000, duration: 30, image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=600&fit=crop', categoryIndex: 1, order: 2 },
      { name: 'Combo premium', description: 'Corte + barba + cejas + black mask + lavado premium', includes: 'Todo el combo: corte, barba, cejas, mascara, masaje', price: 12000, duration: 75, image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=600&fit=crop', categoryIndex: 2, order: 2 },
      { name: 'Black mask', description: 'Mascara negra purificante para limpieza profunda del rostro', includes: 'Limpieza, aplicacion, retiro, hidratacion', price: 4000, duration: 20, image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=600&fit=crop', categoryIndex: 3, order: 1 },
      { name: 'Keratina capilar', description: 'Tratamiento de keratina para alisar y nutrir el cabello', includes: 'Lavado, aplicacion keratina, planchado, peinado', price: 15000, duration: 90, image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=600&fit=crop', categoryIndex: 3, order: 2 },
      { name: 'Coloracion', description: 'Coloracion completa o parcial con productos premium', includes: 'Evaluacion, aplicacion color, lavado, peinado', price: 8000, duration: 60, image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=600&fit=crop', categoryIndex: 3, order: 3 },
      { name: 'Corte nino', description: 'Corte de pelo para ninos hasta 12 anos', includes: 'Corte, peinado, spray de colores (opcional)', price: 4000, duration: 25, image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=600&fit=crop', categoryIndex: 0, order: 3 },
    ],
    employees: [
      { name: 'Matias Rossi', email: 'mati@thebarberclub.com', phone: '+5491155005001', image: 'https://randomuser.me/api/portraits/men/61.jpg', specialty: 'Fade y Diseno', bio: 'Master barber especializado en fades y disenos con navaja. +10 anos de experiencia.', serviceIndices: [0, 1, 2, 5, 9] },
      { name: 'Lucas Dominguez', email: 'lucas@thebarberclub.com', phone: '+5491155005002', image: 'https://randomuser.me/api/portraits/men/62.jpg', specialty: 'Barba y Afeitado', bio: 'Barbero clasico. Experto en afeitada a navaja y barba sculpting.', serviceIndices: [0, 1, 3, 4, 5] },
      { name: 'Tomas Herrera', email: 'tomas@thebarberclub.com', phone: '+5491155005003', image: 'https://randomuser.me/api/portraits/men/63.jpg', specialty: 'Corte Clasico', bio: 'Barbero con estilo old school. Cortes clasicos y fades suaves.', serviceIndices: [0, 1, 2, 6, 9] },
      { name: 'Nicolas Blanco', email: 'nico@thebarberclub.com', phone: '+5491155005004', image: 'https://randomuser.me/api/portraits/men/64.jpg', specialty: 'Premium y Color', bio: 'Estilista y barbero. Especialista en keratina y coloracion masculina.', serviceIndices: [0, 5, 7, 8] },
    ],
    customers: [
      { name: 'Juan Pablo Messi', phone: '+5491166005001', email: 'jp.messi@email.com', totalBookings: 20 },
      { name: 'Federico Gomez', phone: '+5491166005002', email: 'fede.g@email.com', totalBookings: 12 },
      { name: 'Santiago Perez', phone: '+5491166005003', email: 'santi.p@email.com', totalBookings: 8 },
      { name: 'Agustin Martinez', phone: '+5491166005004', email: 'agus.m@email.com', totalBookings: 15 },
      { name: 'Bruno Lopez', phone: '+5491166005005', email: 'bruno.l@email.com', totalBookings: 6 },
      { name: 'Thiago Fernandez', phone: '+5491166005006', email: 'thiago.f@email.com', totalBookings: 10 },
      { name: 'Lautaro Silva', phone: '+5491166005007', email: 'lauti.s@email.com', totalBookings: 4 },
    ],
    schedules: [
      { dayOfWeek: 0, startTime: '10:00', endTime: '18:00', isActive: false },
      { dayOfWeek: 1, startTime: '10:00', endTime: '21:00', isActive: true },
      { dayOfWeek: 2, startTime: '10:00', endTime: '21:00', isActive: true },
      { dayOfWeek: 3, startTime: '10:00', endTime: '21:00', isActive: true },
      { dayOfWeek: 4, startTime: '10:00', endTime: '21:00', isActive: true },
      { dayOfWeek: 5, startTime: '10:00', endTime: '21:00', isActive: true },
      { dayOfWeek: 6, startTime: '09:00', endTime: '18:00', isActive: true },
    ],
  },

  // -------------------------------------------------------
  // 6. SALON NOIR (Peluqueria Unisex)
  // -------------------------------------------------------
  {
    slug: 'salon-noir',
    name: 'Salon Noir',
    description: 'Peluqueria unisex de alta gama. Color, corte, mechas balayage, alisados y tratamientos capilares premium.',
    phone: '+54 11 4567-1006',
    email: 'reservas@salonnoir.com',
    address: 'Honduras 5200, Palermo Soho',
    city: 'Buenos Aires',
    instagram: '@salon.noir.ba',
    logo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1600&h=600&fit=crop',
    settings: { primaryColor: '#4a148c', secondaryColor: '#e1bee7' },
    branding: {
      primaryColor: '#4a148c',
      secondaryColor: '#e1bee7',
      accentColor: '#ab47bc',
      backgroundStyle: 'elegant',
      welcomeTitle: 'Salon Noir',
      welcomeSubtitle: 'Tu estilo, nuestra firma',
    },
    owner: { email: 'demo@salonnoir.com', name: 'Julieta Montes' },
    categories: [
      { name: 'Corte', order: 1 },
      { name: 'Color', order: 2 },
      { name: 'Tratamientos', order: 3 },
      { name: 'Peinados', order: 4 },
    ],
    services: [
      { name: 'Corte mujer', description: 'Corte femenino con lavado, corte y brushing de terminacion', includes: 'Lavado, corte personalizado, brushing', price: 8000, duration: 60, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop', categoryIndex: 0, order: 1 },
      { name: 'Corte hombre', description: 'Corte masculino con lavado y peinado', includes: 'Lavado, corte, producto de terminacion', price: 5000, duration: 30, image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&h=600&fit=crop', categoryIndex: 0, order: 2 },
      { name: 'Color global', description: 'Tintura completa de raiz a puntas con color a eleccion', includes: 'Evaluacion capilar, color, lavado, brushing', price: 12000, duration: 90, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop', categoryIndex: 1, order: 1 },
      { name: 'Mechas balayage', description: 'Tecnica balayage para un efecto degradado natural y luminoso', includes: 'Decoloracion, matizado, lavado, brushing', price: 25000, duration: 150, image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&h=600&fit=crop', categoryIndex: 1, order: 2 },
      { name: 'Brushing', description: 'Lavado y brushing con secador y cepillo redondo', includes: 'Lavado, protector termico, brushing', price: 5000, duration: 45, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop', categoryIndex: 3, order: 1 },
      { name: 'Alisado keratina', description: 'Alisado permanente con keratina brasilena. Dura 3-4 meses', includes: 'Lavado, aplicacion keratina, planchado, sellado', price: 35000, duration: 180, image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&h=600&fit=crop', categoryIndex: 2, order: 1 },
      { name: 'Tratamiento botox capilar', description: 'Nutricion profunda con complejo vitaminico para cabello danado', includes: 'Lavado, aplicacion botox, calor, sellado, brushing', price: 15000, duration: 75, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop', categoryIndex: 2, order: 2 },
      { name: 'Peinado fiesta', description: 'Peinado elegante para eventos especiales', includes: 'Lavado, peinado, fijacion, producto', price: 12000, duration: 60, image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&h=600&fit=crop', categoryIndex: 3, order: 2 },
      { name: 'Reflejos', description: 'Reflejos tradicionales con papel de aluminio', includes: 'Decoloracion, tonalizacion, lavado, brushing', price: 18000, duration: 120, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop', categoryIndex: 1, order: 3 },
      { name: 'Corte + color', description: 'Combo de corte femenino con color global', includes: 'Todo incluido: color, lavado, corte, brushing', price: 18000, duration: 120, image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&h=600&fit=crop', categoryIndex: 1, order: 4 },
    ],
    employees: [
      { name: 'Julieta Montes', email: 'juli@salonnoir.com', phone: '+5491155006001', image: 'https://randomuser.me/api/portraits/women/61.jpg', specialty: 'Colorista Senior', bio: 'Directora y colorista. Especialista en balayage y color creativo. +12 anos.', serviceIndices: [2, 3, 5, 8, 9] },
      { name: 'Franco Benedetti', email: 'franco@salonnoir.com', phone: '+5491155006002', image: 'https://randomuser.me/api/portraits/men/71.jpg', specialty: 'Corte y Estilo', bio: 'Estilista internacional. Especializado en corte de precision y tendencias.', serviceIndices: [0, 1, 4, 7] },
      { name: 'Agostina Paz', email: 'ago@salonnoir.com', phone: '+5491155006003', image: 'https://randomuser.me/api/portraits/women/62.jpg', specialty: 'Tratamientos', bio: 'Especialista en alisados, keratina y tratamientos de nutricion capilar.', serviceIndices: [5, 6, 4, 0] },
      { name: 'Ramiro Vidal', email: 'ramiro@salonnoir.com', phone: '+5491155006004', image: 'https://randomuser.me/api/portraits/men/72.jpg', specialty: 'Color y Corte', bio: 'Colorista y estilista. Experto en mechas y reflejos.', serviceIndices: [0, 1, 2, 3, 8] },
      { name: 'Melina Arce', email: 'meli@salonnoir.com', phone: '+5491155006005', image: 'https://randomuser.me/api/portraits/women/63.jpg', specialty: 'Peinados y Eventos', bio: 'Especialista en peinados de fiesta y novias. Maquillaje profesional.', serviceIndices: [4, 7, 0] },
    ],
    customers: [
      { name: 'Luz Marina Solis', phone: '+5491166006001', email: 'luz.s@email.com', totalBookings: 14 },
      { name: 'Emilia Gutierrez', phone: '+5491166006002', email: 'emi.g@email.com', totalBookings: 9 },
      { name: 'Tomas Acosta', phone: '+5491166006003', email: 'tomas.a@email.com', totalBookings: 6 },
      { name: 'Valentina Paredes', phone: '+5491166006004', email: 'vale.p@email.com', totalBookings: 18 },
      { name: 'Sofia Ramos', phone: '+5491166006005', email: 'sofi.r@email.com', totalBookings: 11 },
      { name: 'Camila Rojas', phone: '+5491166006006', email: 'cami.rj@email.com', totalBookings: 7 },
    ],
    schedules: STANDARD_SCHEDULE,
  },

  // -------------------------------------------------------
  // 7. INK MASTER STUDIO (Tatuajes)
  // -------------------------------------------------------
  {
    slug: 'ink-master-studio',
    name: 'Ink Master Studio',
    description: 'Estudio de tatuajes profesional. Realismo, blackwork, neotradicional, fine line y piercing. Arte en tu piel.',
    phone: '+54 11 4567-1007',
    email: 'turnos@inkmasterstudio.com',
    address: 'Thames 1800, Palermo Soho',
    city: 'Buenos Aires',
    instagram: '@ink.master.studio',
    logo: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=1600&h=600&fit=crop',
    settings: { primaryColor: '#b71c1c', secondaryColor: '#ef5350' },
    branding: {
      primaryColor: '#b71c1c',
      secondaryColor: '#ef5350',
      accentColor: '#ff1744',
      backgroundStyle: 'vibrant',
      welcomeTitle: 'Ink Master Studio',
      welcomeSubtitle: 'Tu historia en tu piel',
    },
    owner: { email: 'demo@inkmasterstudio.com', name: 'Facundo Ortiz' },
    categories: [
      { name: 'Tatuajes', order: 1 },
      { name: 'Piercing', order: 2 },
      { name: 'Micropigmentacion', order: 3 },
    ],
    services: [
      { name: 'Tatuaje pequeno (<10cm)', description: 'Tatuaje pequeno de hasta 10cm. Ideal para primeros tatuajes', includes: 'Diseno, preparacion, ejecucion, cuidados post-tattoo', price: 15000, duration: 60, image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=600&h=600&fit=crop', categoryIndex: 0, order: 1 },
      { name: 'Tatuaje mediano', description: 'Tatuaje mediano de 10-20cm. Brazos, piernas, espalda', includes: 'Diseno personalizado, ejecucion, vendaje', price: 30000, duration: 120, image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600&h=600&fit=crop', categoryIndex: 0, order: 2 },
      { name: 'Tatuaje grande (sesion)', description: 'Sesion de tatuaje grande. Piezas extensas que requieren varias sesiones', includes: 'Sesion de 3-4 horas, diseno incluido', price: 50000, duration: 240, image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=600&h=600&fit=crop', categoryIndex: 0, order: 3 },
      { name: 'Cover up', description: 'Cobertura de tatuaje existente con nuevo diseno', includes: 'Evaluacion, diseno de cobertura, ejecucion', price: 35000, duration: 180, image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600&h=600&fit=crop', categoryIndex: 0, order: 4 },
      { name: 'Piercing oreja', description: 'Perforacion de oreja con joyeria de acero quirurgico o titanio', includes: 'Esterilizacion, perforacion, joya, cuidados', price: 8000, duration: 20, image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=600&h=600&fit=crop', categoryIndex: 1, order: 1 },
      { name: 'Piercing nariz', description: 'Perforacion de nariz con joyeria hipoalergenica', includes: 'Esterilizacion, perforacion, joya, cuidados', price: 8000, duration: 20, image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600&h=600&fit=crop', categoryIndex: 1, order: 2 },
      { name: 'Microblading cejas', description: 'Micropigmentacion de cejas pelo a pelo para un resultado natural', includes: 'Diseno de cejas, anestesia, micropigmentacion, retoque', price: 35000, duration: 120, image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=600&h=600&fit=crop', categoryIndex: 2, order: 1 },
      { name: 'Micropigmentacion labios', description: 'Delineado o relleno de labios con pigmentos de alta duracion', includes: 'Diseno, anestesia, aplicacion, cuidados', price: 30000, duration: 120, image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600&h=600&fit=crop', categoryIndex: 2, order: 2 },
      { name: 'Consulta diseno', description: 'Sesion de consulta para planificar tu tatuaje', includes: 'Charla, boceto preliminar, presupuesto', price: 0, duration: 30, image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=600&h=600&fit=crop', categoryIndex: 0, order: 5 },
      { name: 'Retoque tatuaje', description: 'Retoque de color y lineas de tatuaje existente (hasta 2 anos)', includes: 'Evaluacion, retoque, vendaje', price: 10000, duration: 60, image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600&h=600&fit=crop', categoryIndex: 0, order: 6 },
    ],
    employees: [
      { name: 'Facundo Ortiz', email: 'facu@inkmasterstudio.com', phone: '+5491155007001', image: 'https://randomuser.me/api/portraits/men/81.jpg', specialty: 'Realismo y Blackwork', bio: 'Tatuador profesional con 12 anos. Especialista en realismo B&N y color.', serviceIndices: [0, 1, 2, 3, 8, 9] },
      { name: 'Emanuel Gutierrez', email: 'ema@inkmasterstudio.com', phone: '+5491155007002', image: 'https://randomuser.me/api/portraits/men/82.jpg', specialty: 'Neotradicional', bio: 'Artista neotradicional y new school. Colores vibrantes y disenos unicos.', serviceIndices: [0, 1, 2, 3, 8, 9] },
      { name: 'Gonzalo Aguirre', email: 'gonza@inkmasterstudio.com', phone: '+5491155007003', image: 'https://randomuser.me/api/portraits/men/83.jpg', specialty: 'Fine Line y Piercing', bio: 'Especialista en fine line, minimalismo y piercing profesional.', serviceIndices: [0, 1, 4, 5, 8, 9] },
      { name: 'Aldana Ferrari', email: 'aldana@inkmasterstudio.com', phone: '+5491155007004', image: 'https://randomuser.me/api/portraits/women/71.jpg', specialty: 'Micropigmentacion', bio: 'Micropigmentadora certificada. Microblading de cejas y labios.', serviceIndices: [6, 7, 0] },
    ],
    customers: [
      { name: 'Nicolas Quiroga', phone: '+5491166007001', email: 'nico.q@email.com', totalBookings: 5 },
      { name: 'Brenda Vega', phone: '+5491166007002', email: 'brenda.v@email.com', totalBookings: 3 },
      { name: 'Maximo Salazar', phone: '+5491166007003', email: 'maxi.s@email.com', totalBookings: 8 },
      { name: 'Tamara Leiva', phone: '+5491166007004', email: 'tami.l@email.com', totalBookings: 2 },
      { name: 'Franco Estevez', phone: '+5491166007005', email: 'franco.e@email.com', totalBookings: 6 },
      { name: 'Rocio Aguero', phone: '+5491166007006', email: 'rocio.a@email.com', totalBookings: 4 },
    ],
    schedules: [
      { dayOfWeek: 0, startTime: '10:00', endTime: '18:00', isActive: false },
      { dayOfWeek: 1, startTime: '12:00', endTime: '20:00', isActive: true },
      { dayOfWeek: 2, startTime: '12:00', endTime: '20:00', isActive: true },
      { dayOfWeek: 3, startTime: '12:00', endTime: '20:00', isActive: true },
      { dayOfWeek: 4, startTime: '12:00', endTime: '20:00', isActive: true },
      { dayOfWeek: 5, startTime: '12:00', endTime: '20:00', isActive: true },
      { dayOfWeek: 6, startTime: '11:00', endTime: '17:00', isActive: true },
    ],
  },

  // -------------------------------------------------------
  // 8. SONRISAS ODONTOLOGIA
  // -------------------------------------------------------
  {
    slug: 'sonrisas-odontologia',
    name: 'Sonrisas Odontologia',
    description: 'Consultorio odontologico integral. Odontologia general, estetica, ortodoncia, blanqueamiento e implantes.',
    phone: '+54 11 4567-1008',
    email: 'turnos@sonrisasodonto.com',
    address: 'Av. Rivadavia 5678, Piso 2',
    city: 'Buenos Aires',
    instagram: '@sonrisas.odontologia',
    logo: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?w=1600&h=600&fit=crop',
    settings: { primaryColor: '#0277bd', secondaryColor: '#81d4fa' },
    branding: {
      primaryColor: '#0277bd',
      secondaryColor: '#81d4fa',
      accentColor: '#29b6f6',
      backgroundStyle: 'minimal',
      welcomeTitle: 'Sonrisas Odontologia',
      welcomeSubtitle: 'Tu sonrisa en las mejores manos',
    },
    owner: { email: 'demo@sonrisasodonto.com', name: 'Dr. Pablo Suarez' },
    categories: [
      { name: 'General', order: 1 },
      { name: 'Estetica', order: 2 },
      { name: 'Ortodoncia', order: 3 },
      { name: 'Cirugia', order: 4 },
    ],
    services: [
      { name: 'Consulta + diagnostico', description: 'Consulta odontologica con radiografia panoramica y plan de tratamiento', includes: 'Evaluacion, radiografia, diagnostico, presupuesto', price: 8000, duration: 30, image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&h=600&fit=crop', categoryIndex: 0, order: 1 },
      { name: 'Limpieza dental', description: 'Profilaxis dental completa con ultrasonido y pulido', includes: 'Tartrecotomia, pulido, fluor, instrucciones', price: 10000, duration: 45, image: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?w=600&h=600&fit=crop', categoryIndex: 0, order: 2 },
      { name: 'Blanqueamiento', description: 'Blanqueamiento dental LED en consultorio para dientes mas blancos', includes: '3 sesiones de LED, kit de mantenimiento', price: 35000, duration: 60, image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&h=600&fit=crop', categoryIndex: 1, order: 1 },
      { name: 'Carillas', description: 'Carillas de porcelana o composite para una sonrisa perfecta', includes: 'Evaluacion, preparacion, colocacion (por pieza)', price: 45000, duration: 60, image: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?w=600&h=600&fit=crop', categoryIndex: 1, order: 2 },
      { name: 'Ortodoncia consulta', description: 'Evaluacion para tratamiento de ortodoncia', includes: 'Modelos, radiografias, plan de ortodoncia', price: 10000, duration: 45, image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&h=600&fit=crop', categoryIndex: 2, order: 1 },
      { name: 'Extraccion simple', description: 'Extraccion de pieza dental con anestesia local', includes: 'Anestesia, extraccion, indicaciones, medicacion', price: 12000, duration: 30, image: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?w=600&h=600&fit=crop', categoryIndex: 3, order: 1 },
      { name: 'Corona porcelana', description: 'Confeccion y colocacion de corona de porcelana sobre metal', includes: 'Tallado, impresion, prueba, cementado', price: 55000, duration: 60, image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&h=600&fit=crop', categoryIndex: 1, order: 3 },
      { name: 'Endodoncia', description: 'Tratamiento de conducto para salvar piezas danadas', includes: 'Anestesia, acceso, instrumentacion, obturacion', price: 25000, duration: 60, image: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?w=600&h=600&fit=crop', categoryIndex: 3, order: 2 },
      { name: 'Implante dental', description: 'Colocacion de implante de titanio para reemplazo de pieza', includes: 'Cirugia, implante, control post-operatorio', price: 80000, duration: 90, image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&h=600&fit=crop', categoryIndex: 3, order: 3 },
      { name: 'Control ortodoncia', description: 'Control mensual de ortodoncia con ajuste de brackets o alineadores', includes: 'Control, ajuste, limpieza basica', price: 5000, duration: 20, image: 'https://images.unsplash.com/photo-1629909615184-74f495363b67?w=600&h=600&fit=crop', categoryIndex: 2, order: 2 },
    ],
    employees: [
      { name: 'Dr. Pablo Suarez', email: 'pablo@sonrisasodonto.com', phone: '+5491155008001', image: 'https://randomuser.me/api/portraits/men/91.jpg', specialty: 'Odontologia General y Estetica', bio: 'Odontologo MN 34567. Director del consultorio. Especialista en estetica dental.', serviceIndices: [0, 1, 2, 3, 6] },
      { name: 'Dra. Cecilia Romero', email: 'ceci@sonrisasodonto.com', phone: '+5491155008002', image: 'https://randomuser.me/api/portraits/women/81.jpg', specialty: 'Endodoncia y Cirugia', bio: 'Odontologa MN 45678. Especialista en endodoncia y cirugia oral.', serviceIndices: [0, 5, 7, 8] },
      { name: 'Dra. Ana Colombo', email: 'ana@sonrisasodonto.com', phone: '+5491155008003', image: 'https://randomuser.me/api/portraits/women/82.jpg', specialty: 'Ortodoncia', bio: 'Ortodoncista MN 56789. Brackets, alineadores y ortodoncia invisible.', serviceIndices: [4, 9, 0] },
      { name: 'Lic. Micaela Torres', email: 'mica@sonrisasodonto.com', phone: '+5491155008004', image: 'https://randomuser.me/api/portraits/women/83.jpg', specialty: 'Higienista Dental', bio: 'Higienista dental certificada. Profilaxis, blanqueamiento y prevencion.', serviceIndices: [1, 2] },
    ],
    customers: [
      { name: 'Roberto Herrera', phone: '+5491166008001', email: 'roberto.h@email.com', totalBookings: 10 },
      { name: 'Laura Bustos', phone: '+5491166008002', email: 'laura.b@email.com', totalBookings: 6 },
      { name: 'Hernan Vargas', phone: '+5491166008003', email: 'hernan.v@email.com', totalBookings: 4 },
      { name: 'Cecilia Nuñez', phone: '+5491166008004', email: 'ceci.n@email.com', totalBookings: 12 },
      { name: 'Martin Cabrera', phone: '+5491166008005', email: 'martin.c@email.com', totalBookings: 8 },
      { name: 'Graciela Medina', phone: '+5491166008006', email: 'graci.m@email.com', totalBookings: 15 },
      { name: 'Alejandro Rios', phone: '+5491166008007', email: 'ale.rios@email.com', totalBookings: 3 },
    ],
    schedules: [
      { dayOfWeek: 0, startTime: '10:00', endTime: '18:00', isActive: false },
      { dayOfWeek: 1, startTime: '08:00', endTime: '18:00', isActive: true },
      { dayOfWeek: 2, startTime: '08:00', endTime: '18:00', isActive: true },
      { dayOfWeek: 3, startTime: '08:00', endTime: '18:00', isActive: true },
      { dayOfWeek: 4, startTime: '08:00', endTime: '18:00', isActive: true },
      { dayOfWeek: 5, startTime: '08:00', endTime: '18:00', isActive: true },
      { dayOfWeek: 6, startTime: '09:00', endTime: '13:00', isActive: true },
    ],
  },

  // -------------------------------------------------------
  // 9. FITZONE TRAINING
  // -------------------------------------------------------
  {
    slug: 'fitzone-training',
    name: 'FitZone Training',
    description: 'Centro de entrenamiento personalizado. Sesiones individuales, grupales, funcional, yoga, pilates y nutricion.',
    phone: '+54 11 4567-1009',
    email: 'info@fitzonetraining.com',
    address: 'Av. del Libertador 4500',
    city: 'Buenos Aires',
    instagram: '@fitzone.training',
    logo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&h=600&fit=crop',
    settings: { primaryColor: '#e65100', secondaryColor: '#ffb74d' },
    branding: {
      primaryColor: '#e65100',
      secondaryColor: '#ffb74d',
      accentColor: '#ff9800',
      backgroundStyle: 'vibrant',
      welcomeTitle: 'FitZone Training',
      welcomeSubtitle: 'Entrena inteligente, vivi mejor',
    },
    owner: { email: 'demo@fitzonetraining.com', name: 'Rodrigo Acevedo' },
    categories: [
      { name: 'Personal', order: 1 },
      { name: 'Grupal', order: 2 },
      { name: 'Evaluaciones', order: 3 },
      { name: 'Nutricion', order: 4 },
    ],
    services: [
      { name: 'Sesion personal 1h', description: 'Entrenamiento personalizado one-on-one adaptado a tus objetivos', includes: 'Planificacion, entrenamiento, seguimiento', price: 8000, duration: 60, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop', categoryIndex: 0, order: 1 },
      { name: 'Pack 8 sesiones', description: 'Pack de 8 sesiones personales (1 mes) con descuento', includes: '8 sesiones, planificacion mensual, seguimiento', price: 55000, duration: 60, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop', categoryIndex: 0, order: 2 },
      { name: 'Clase grupal funcional', description: 'Clase de entrenamiento funcional en grupo reducido (max 8)', includes: 'Clase completa, entrada en calor, WOD, vuelta a la calma', price: 4000, duration: 60, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop', categoryIndex: 1, order: 1 },
      { name: 'Evaluacion fisica', description: 'Evaluacion completa: composicion corporal, fuerza, flexibilidad, cardio', includes: 'Antropometria, tests fisicos, informe, recomendaciones', price: 10000, duration: 60, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop', categoryIndex: 2, order: 1 },
      { name: 'Plan nutricional', description: 'Consulta con nutricionista deportivo y plan alimentario personalizado', includes: 'Evaluacion nutricional, plan alimentario, suplementacion', price: 12000, duration: 45, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop', categoryIndex: 3, order: 1 },
      { name: 'Clase spinning', description: 'Clase de ciclismo indoor de alta intensidad', includes: 'Bici, clase guiada, musica motivacional', price: 4000, duration: 45, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop', categoryIndex: 1, order: 2 },
      { name: 'Yoga', description: 'Clase de yoga vinyasa para flexibilidad, fuerza y relajacion', includes: 'Mat, clase guiada, relajacion final', price: 4500, duration: 60, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop', categoryIndex: 1, order: 3 },
      { name: 'Pilates reformer', description: 'Clase de pilates en reformer para tono muscular y postura', includes: 'Reformer, clase personalizada', price: 6000, duration: 50, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop', categoryIndex: 1, order: 4 },
      { name: 'Entrenamiento duo', description: 'Sesion de entrenamiento personal para 2 personas', includes: 'Planificacion, entrenamiento en pareja', price: 12000, duration: 60, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop', categoryIndex: 0, order: 3 },
      { name: 'Seguimiento mensual', description: 'Control mensual con mediciones y ajuste de plan de entrenamiento', includes: 'Mediciones, evaluacion progreso, ajuste de plan', price: 5000, duration: 30, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop', categoryIndex: 2, order: 2 },
    ],
    employees: [
      { name: 'Rodrigo Acevedo', email: 'rodri@fitzonetraining.com', phone: '+5491155009001', image: 'https://randomuser.me/api/portraits/men/35.jpg', specialty: 'Entrenamiento Personal', bio: 'Personal trainer certificado NSCA. Especialista en hipertrofia y fuerza.', serviceIndices: [0, 1, 2, 3, 8, 9] },
      { name: 'Damian Fuentes', email: 'damian@fitzonetraining.com', phone: '+5491155009002', image: 'https://randomuser.me/api/portraits/men/36.jpg', specialty: 'Funcional y CrossFit', bio: 'Coach funcional y CrossFit L2. Experto en WODs y acondicionamiento.', serviceIndices: [0, 1, 2, 5, 8] },
      { name: 'Abril Sanchez', email: 'abril@fitzonetraining.com', phone: '+5491155009003', image: 'https://randomuser.me/api/portraits/women/35.jpg', specialty: 'Yoga y Pilates', bio: 'Instructora certificada de yoga y pilates reformer. +7 anos de experiencia.', serviceIndices: [6, 7, 0] },
      { name: 'Marcos Ledesma', email: 'marcos@fitzonetraining.com', phone: '+5491155009004', image: 'https://randomuser.me/api/portraits/men/37.jpg', specialty: 'Spinning y Cardio', bio: 'Instructor de spinning y entrenamiento cardiovascular. Maratonista.', serviceIndices: [2, 5, 0, 8] },
      { name: 'Lic. Carla Maidana', email: 'carla@fitzonetraining.com', phone: '+5491155009005', image: 'https://randomuser.me/api/portraits/women/36.jpg', specialty: 'Nutricion Deportiva', bio: 'Nutricionista deportiva MN 7890. Especialista en composicion corporal.', serviceIndices: [3, 4, 9] },
    ],
    customers: [
      { name: 'Julian Colombo', phone: '+5491166009001', email: 'julian.c@email.com', totalBookings: 25 },
      { name: 'Maria Jose Lima', phone: '+5491166009002', email: 'majo.l@email.com', totalBookings: 18 },
      { name: 'Pedro Alonso', phone: '+5491166009003', email: 'pedro.a@email.com', totalBookings: 10 },
      { name: 'Florencia Ibarra', phone: '+5491166009004', email: 'flor.i@email.com', totalBookings: 30 },
      { name: 'Sebastian Duarte', phone: '+5491166009005', email: 'seba.d@email.com', totalBookings: 15 },
      { name: 'Natalia Correa', phone: '+5491166009006', email: 'nati.c@email.com', totalBookings: 8 },
      { name: 'Gonzalo Mendez', phone: '+5491166009007', email: 'gonza.m@email.com', totalBookings: 12 },
      { name: 'Camila Rivero', phone: '+5491166009008', email: 'cami.ri@email.com', totalBookings: 6 },
    ],
    schedules: [
      { dayOfWeek: 0, startTime: '10:00', endTime: '18:00', isActive: false },
      { dayOfWeek: 1, startTime: '07:00', endTime: '21:00', isActive: true },
      { dayOfWeek: 2, startTime: '07:00', endTime: '21:00', isActive: true },
      { dayOfWeek: 3, startTime: '07:00', endTime: '21:00', isActive: true },
      { dayOfWeek: 4, startTime: '07:00', endTime: '21:00', isActive: true },
      { dayOfWeek: 5, startTime: '07:00', endTime: '21:00', isActive: true },
      { dayOfWeek: 6, startTime: '08:00', endTime: '14:00', isActive: true },
    ],
  },

  // -------------------------------------------------------
  // 10. HAPPY PAWS (Peluqueria Canina)
  // -------------------------------------------------------
  {
    slug: 'happy-paws',
    name: 'Happy Paws',
    description: 'Peluqueria y spa canino. Bano, corte, tratamientos antipulgas, deslanado y cuidado integral para tu mascota.',
    phone: '+54 11 4567-1010',
    email: 'turnos@happypaws.com',
    address: 'Av. Directorio 3200',
    city: 'Buenos Aires',
    instagram: '@happy.paws.ba',
    logo: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1600&h=600&fit=crop',
    settings: { primaryColor: '#2e7d32', secondaryColor: '#a5d6a7' },
    branding: {
      primaryColor: '#2e7d32',
      secondaryColor: '#a5d6a7',
      accentColor: '#66bb6a',
      backgroundStyle: 'fresh',
      welcomeTitle: 'Happy Paws',
      welcomeSubtitle: 'Porque tu mascota merece lo mejor',
    },
    owner: { email: 'demo@happypaws.com', name: 'Marina Stella' },
    categories: [
      { name: 'Bano', order: 1 },
      { name: 'Corte', order: 2 },
      { name: 'Tratamientos', order: 3 },
      { name: 'Especiales', order: 4 },
    ],
    services: [
      { name: 'Bano completo S', description: 'Bano completo para perros pequenos (hasta 10kg). Shampoo, acondicionador, secado', includes: 'Shampoo especifico, acondicionador, secado, perfume', price: 5000, duration: 45, image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop', categoryIndex: 0, order: 1 },
      { name: 'Bano completo M', description: 'Bano completo para perros medianos (10-25kg)', includes: 'Shampoo especifico, acondicionador, secado, perfume', price: 7000, duration: 60, image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=600&fit=crop', categoryIndex: 0, order: 2 },
      { name: 'Bano completo L', description: 'Bano completo para perros grandes (mas de 25kg)', includes: 'Shampoo especifico, acondicionador, secado, perfume', price: 9000, duration: 75, image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop', categoryIndex: 0, order: 3 },
      { name: 'Corte higienico', description: 'Corte de pelo en zonas sensibles: patas, ojos, sanitario', includes: 'Recorte zonas higienicas, limpieza de oidos', price: 4000, duration: 30, image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=600&fit=crop', categoryIndex: 1, order: 1 },
      { name: 'Corte breed (raza)', description: 'Corte segun estandar de la raza con tecnica profesional', includes: 'Bano, secado, corte de raza, perfume', price: 10000, duration: 90, image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop', categoryIndex: 1, order: 2 },
      { name: 'Deslanado', description: 'Remocion de subpelo muerto para razas de doble manto', includes: 'Cepillado profundo, deslanado, bano, secado', price: 8000, duration: 60, image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=600&fit=crop', categoryIndex: 2, order: 1 },
      { name: 'Tratamiento antipulgas', description: 'Bano medicado antipulgas y garrapatas con producto veterinario', includes: 'Bano medicado, aplicacion de pipeta, secado', price: 7000, duration: 45, image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop', categoryIndex: 2, order: 2 },
      { name: 'Limpieza dental canina', description: 'Limpieza dental mecanica sin anestesia para eliminar sarro', includes: 'Limpieza mecanica, pasta dental canina', price: 6000, duration: 30, image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=600&fit=crop', categoryIndex: 2, order: 3 },
      { name: 'Spa canino premium', description: 'Experiencia spa completa: bano de ozono, masaje, aromaterapia canina', includes: 'Bano ozono, masaje relajante, aromaterapia, bano, secado', price: 15000, duration: 90, image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop', categoryIndex: 3, order: 1 },
      { name: 'Corte + bano combo', description: 'Combo de bano completo con corte a maquina o tijera', includes: 'Bano, secado, corte completo, perfume, monio', price: 12000, duration: 90, image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=600&fit=crop', categoryIndex: 3, order: 2 },
    ],
    employees: [
      { name: 'Marina Stella', email: 'marina@happypaws.com', phone: '+5491155010001', image: 'https://randomuser.me/api/portraits/women/91.jpg', specialty: 'Groomer Senior', bio: 'Groomer profesional certificada. Especialista en cortes de raza y spa canino.', serviceIndices: [0, 1, 2, 4, 8, 9] },
      { name: 'Jimena Robles', email: 'jime@happypaws.com', phone: '+5491155010002', image: 'https://randomuser.me/api/portraits/women/92.jpg', specialty: 'Bano y Tratamientos', bio: 'Auxiliar de grooming. Experta en banos medicados y tratamientos.', serviceIndices: [0, 1, 2, 5, 6, 7] },
      { name: 'Ezequiel Luna', email: 'eze@happypaws.com', phone: '+5491155010003', image: 'https://randomuser.me/api/portraits/men/92.jpg', specialty: 'Corte y Deslanado', bio: 'Groomer especializado en razas grandes y deslanado profesional.', serviceIndices: [2, 3, 4, 5, 9] },
    ],
    customers: [
      { name: 'Lorena Paz (Firulais)', phone: '+5491166010001', email: 'lorena.p@email.com', totalBookings: 12 },
      { name: 'Carlos Gimenez (Rocky)', phone: '+5491166010002', email: 'carlos.g@email.com', totalBookings: 8 },
      { name: 'Mariana Soto (Luna)', phone: '+5491166010003', email: 'mari.s@email.com', totalBookings: 15 },
      { name: 'Pablo Crespo (Max)', phone: '+5491166010004', email: 'pablo.c@email.com', totalBookings: 6 },
      { name: 'Soledad Arias (Coco)', phone: '+5491166010005', email: 'sole.a@email.com', totalBookings: 10 },
      { name: 'Diego Herrera (Toby)', phone: '+5491166010006', email: 'diego.h@email.com', totalBookings: 4 },
    ],
    schedules: [
      { dayOfWeek: 0, startTime: '10:00', endTime: '18:00', isActive: false },
      { dayOfWeek: 1, startTime: '09:00', endTime: '19:00', isActive: true },
      { dayOfWeek: 2, startTime: '09:00', endTime: '19:00', isActive: true },
      { dayOfWeek: 3, startTime: '09:00', endTime: '19:00', isActive: true },
      { dayOfWeek: 4, startTime: '09:00', endTime: '19:00', isActive: true },
      { dayOfWeek: 5, startTime: '09:00', endTime: '19:00', isActive: true },
      { dayOfWeek: 6, startTime: '09:00', endTime: '15:00', isActive: true },
    ],
  },
];

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('🌱 Seeding 10 demo businesses for TurnoLink...\n');

  // Hash password once for all owners
  const passwordHash = await bcrypt.hash('demo123456', 12);

  // Find the "gratis" subscription plan
  const gratisPlan = await prisma.subscriptionPlan.findUnique({ where: { slug: 'gratis' } });
  if (!gratisPlan) {
    console.error('❌ No "gratis" subscription plan found. Run the main seed first.');
    process.exit(1);
  }

  for (const biz of businesses) {
    try {
      await createBusiness(biz, passwordHash, gratisPlan.id);
    } catch (err) {
      console.error(`❌ Failed to create ${biz.name}:`, err);
    }
  }

  console.log('\n🎉 All businesses seeded successfully!\n');
  console.log('📋 Owner login credentials (password: demo123456):');
  for (const biz of businesses) {
    console.log(`   ${biz.name}: ${biz.owner.email}`);
  }
  console.log('\n🔗 Public pages:');
  for (const biz of businesses) {
    console.log(`   https://turnolink.com/${biz.slug}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
