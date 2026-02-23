import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database for TurnoLink...');

  // Create Super Admin
  const adminPassword = await bcrypt.hash(
    process.env.SUPER_ADMIN_PASSWORD || 'admin123456',
    12,
  );

  const superAdmin = await prisma.user.upsert({
    where: { email: process.env.SUPER_ADMIN_EMAIL || 'admin@turnolink.app' },
    update: {},
    create: {
      email: process.env.SUPER_ADMIN_EMAIL || 'admin@turnolink.app',
      password: adminPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Super Admin created:', superAdmin.email);

  // Create Demo Tenant - Estética
  const demoTenant = await prisma.tenant.upsert({
    where: { slug: 'demo-estetica' },
    update: {
      name: 'Bella Estética',
      description: 'Centro de belleza y bienestar. Tratamientos faciales, corporales, manicura, pedicura y más.',
      phone: '+54 11 5555-1234',
      email: 'hola@bellaestetica.com',
      address: 'Av. Santa Fe 2345, Piso 3',
      city: 'Buenos Aires',
      instagram: '@bella.estetica',
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
        primaryColor: '#ec4899',
        secondaryColor: '#f472b6',
      }),
    },
    create: {
      slug: 'demo-estetica',
      name: 'Bella Estética',
      description: 'Centro de belleza y bienestar. Tratamientos faciales, corporales, manicura, pedicura y más.',
      phone: '+54 11 5555-1234',
      email: 'hola@bellaestetica.com',
      address: 'Av. Santa Fe 2345, Piso 3',
      city: 'Buenos Aires',
      instagram: '@bella.estetica',
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
        primaryColor: '#ec4899',
        secondaryColor: '#f472b6',
      }),
    },
  });

  console.log('✅ Demo Tenant (Estética) created:', demoTenant.name);

  // Create Demo Owner
  const ownerPassword = await bcrypt.hash('demo123456', 12);

  const demoOwner = await prisma.user.upsert({
    where: { email: 'demo@bellaestetica.com' },
    update: {},
    create: {
      email: 'demo@bellaestetica.com',
      password: ownerPassword,
      name: 'María González',
      role: 'OWNER',
      tenantId: demoTenant.id,
      isActive: true,
    },
  });

  console.log('✅ Demo Owner created:', demoOwner.email);

  // Create Service Categories
  const categories = await Promise.all([
    prisma.serviceCategory.upsert({
      where: { id: 'cat-facial' },
      update: { name: 'Tratamientos Faciales', order: 1 },
      create: {
        id: 'cat-facial',
        tenantId: demoTenant.id,
        name: 'Tratamientos Faciales',
        order: 1,
      },
    }),
    prisma.serviceCategory.upsert({
      where: { id: 'cat-corporal' },
      update: { name: 'Tratamientos Corporales', order: 2 },
      create: {
        id: 'cat-corporal',
        tenantId: demoTenant.id,
        name: 'Tratamientos Corporales',
        order: 2,
      },
    }),
    prisma.serviceCategory.upsert({
      where: { id: 'cat-manos' },
      update: { name: 'Manos y Pies', order: 3 },
      create: {
        id: 'cat-manos',
        tenantId: demoTenant.id,
        name: 'Manos y Pies',
        order: 3,
      },
    }),
    prisma.serviceCategory.upsert({
      where: { id: 'cat-depilacion' },
      update: { name: 'Depilación', order: 4 },
      create: {
        id: 'cat-depilacion',
        tenantId: demoTenant.id,
        name: 'Depilación',
        order: 4,
      },
    }),
  ]);

  console.log('✅ Service categories created:', categories.length);

  // Create Services
  const servicesData = [
    // Tratamientos Faciales
    { name: 'Limpieza Facial Profunda', description: 'Limpieza completa con extracción, vapor y mascarilla revitalizante', price: 8500, duration: 60, categoryId: categories[0].id, order: 1 },
    { name: 'Tratamiento Antiage', description: 'Tratamiento rejuvenecedor con ácido hialurónico y vitamina C', price: 12000, duration: 75, categoryId: categories[0].id, order: 2 },
    { name: 'Hidratación Express', description: 'Hidratación intensiva para pieles secas o deshidratadas', price: 6500, duration: 45, categoryId: categories[0].id, order: 3 },
    { name: 'Peeling Químico', description: 'Renovación celular con ácidos suaves para una piel radiante', price: 9500, duration: 50, categoryId: categories[0].id, order: 4 },

    // Tratamientos Corporales
    { name: 'Masaje Relajante', description: 'Masaje descontracturante de cuerpo completo con aromaterapia', price: 9000, duration: 60, categoryId: categories[1].id, order: 1 },
    { name: 'Drenaje Linfático', description: 'Masaje para activar el sistema linfático y reducir retención de líquidos', price: 8500, duration: 60, categoryId: categories[1].id, order: 2 },
    { name: 'Tratamiento Reductor', description: 'Sesión reductora con ultracavitación y radiofrecuencia', price: 15000, duration: 90, categoryId: categories[1].id, order: 3 },
    { name: 'Exfoliación Corporal', description: 'Exfoliación completa con hidratación posterior', price: 7000, duration: 45, categoryId: categories[1].id, order: 4 },

    // Manos y Pies
    { name: 'Manicura Completa', description: 'Manicura con esmaltado semipermanente a elección', price: 4500, duration: 45, categoryId: categories[2].id, order: 1 },
    { name: 'Pedicura Spa', description: 'Pedicura completa con tratamiento hidratante y masaje', price: 5500, duration: 60, categoryId: categories[2].id, order: 2 },
    { name: 'Uñas Esculpidas', description: 'Aplicación de uñas esculpidas en gel o acrílico', price: 8000, duration: 90, categoryId: categories[2].id, order: 3 },
    { name: 'Mani + Pedi Combo', description: 'Manicura y pedicura completas con esmaltado', price: 8500, duration: 90, categoryId: categories[2].id, order: 4 },

    // Depilación
    { name: 'Depilación Piernas Completas', description: 'Depilación con cera descartable de piernas enteras', price: 5000, duration: 45, categoryId: categories[3].id, order: 1 },
    { name: 'Depilación Brasileña', description: 'Depilación íntima completa con cera descartable', price: 4500, duration: 30, categoryId: categories[3].id, order: 2 },
    { name: 'Depilación Axilas', description: 'Depilación de axilas con cera', price: 2000, duration: 15, categoryId: categories[3].id, order: 3 },
    { name: 'Depilación Facial', description: 'Cejas, bozo y mentón', price: 2500, duration: 20, categoryId: categories[3].id, order: 4 },
  ];

  const services = [];
  for (const svc of servicesData) {
    const existing = await prisma.service.findFirst({
      where: { tenantId: demoTenant.id, name: svc.name },
    });
    if (existing) {
      services.push(existing);
    } else {
      const service = await prisma.service.create({
        data: { tenantId: demoTenant.id, isActive: true, ...svc },
      });
      services.push(service);
    }
  }

  console.log('✅ Services created:', services.length);

  // Create Schedules
  const schedules = [
    { dayOfWeek: 0, startTime: '10:00', endTime: '18:00', isActive: false }, // Domingo cerrado
    { dayOfWeek: 1, startTime: '09:00', endTime: '20:00', isActive: true },
    { dayOfWeek: 2, startTime: '09:00', endTime: '20:00', isActive: true },
    { dayOfWeek: 3, startTime: '09:00', endTime: '20:00', isActive: true },
    { dayOfWeek: 4, startTime: '09:00', endTime: '20:00', isActive: true },
    { dayOfWeek: 5, startTime: '09:00', endTime: '20:00', isActive: true },
    { dayOfWeek: 6, startTime: '09:00', endTime: '15:00', isActive: true }, // Sábado medio día
  ];

  for (const schedule of schedules) {
    await prisma.schedule.upsert({
      where: {
        tenantId_dayOfWeek: {
          tenantId: demoTenant.id,
          dayOfWeek: schedule.dayOfWeek,
        },
      },
      update: schedule,
      create: {
        tenantId: demoTenant.id,
        ...schedule,
      },
    });
  }

  console.log('✅ Schedules created');

  // Create Demo Customers
  const customersData = [
    { name: 'Lucía Fernández', phone: '+5491155551111', email: 'lucia.f@email.com', totalBookings: 12 },
    { name: 'Valentina Rodríguez', phone: '+5491155552222', email: 'vale.rod@email.com', totalBookings: 8 },
    { name: 'Camila López', phone: '+5491155553333', email: 'cami.lopez@email.com', totalBookings: 5 },
    { name: 'Sofía Martínez', phone: '+5491155554444', email: 'sofi.m@email.com', totalBookings: 15 },
    { name: 'Martina García', phone: '+5491155555555', email: 'martina.g@email.com', totalBookings: 3 },
    { name: 'Isabella Sánchez', phone: '+5491155556666', email: 'isa.sanchez@email.com', totalBookings: 7 },
    { name: 'Emma Torres', phone: '+5491155557777', email: 'emma.t@email.com', totalBookings: 2 },
    { name: 'Mía Ramírez', phone: '+5491155558888', email: 'mia.r@email.com', totalBookings: 10 },
  ];

  const customers = [];
  for (const cust of customersData) {
    const customer = await prisma.customer.upsert({
      where: { tenantId_phone: { tenantId: demoTenant.id, phone: cust.phone } },
      update: { name: cust.name, email: cust.email, totalBookings: cust.totalBookings },
      create: {
        tenantId: demoTenant.id,
        ...cust,
      },
    });
    customers.push(customer);
  }

  console.log('✅ Customers created:', customers.length);

  // Create Sample Bookings for today and upcoming days
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const bookingsData = [
    // Today's bookings
    { customerId: customers[0].id, serviceId: services[0].id, date: today, startTime: '09:00', endTime: '10:00', status: 'CONFIRMED' },
    { customerId: customers[1].id, serviceId: services[8].id, date: today, startTime: '10:00', endTime: '10:45', status: 'CONFIRMED' },
    { customerId: customers[2].id, serviceId: services[4].id, date: today, startTime: '11:00', endTime: '12:00', status: 'PENDING' },
    { customerId: customers[3].id, serviceId: services[12].id, date: today, startTime: '14:00', endTime: '14:45', status: 'CONFIRMED' },
    { customerId: customers[4].id, serviceId: services[1].id, date: today, startTime: '15:00', endTime: '16:15', status: 'CONFIRMED' },
    { customerId: customers[5].id, serviceId: services[9].id, date: today, startTime: '16:30', endTime: '17:30', status: 'PENDING' },

    // Tomorrow's bookings
    { customerId: customers[6].id, serviceId: services[0].id, date: tomorrow, startTime: '10:00', endTime: '11:00', status: 'CONFIRMED' },
    { customerId: customers[7].id, serviceId: services[6].id, date: tomorrow, startTime: '11:00', endTime: '12:30', status: 'CONFIRMED' },
    { customerId: customers[0].id, serviceId: services[10].id, date: tomorrow, startTime: '14:00', endTime: '15:30', status: 'PENDING' },
    { customerId: customers[1].id, serviceId: services[5].id, date: tomorrow, startTime: '16:00', endTime: '17:00', status: 'CONFIRMED' },

    // Day after tomorrow
    { customerId: customers[2].id, serviceId: services[2].id, date: dayAfter, startTime: '09:00', endTime: '09:45', status: 'PENDING' },
    { customerId: customers[3].id, serviceId: services[11].id, date: dayAfter, startTime: '10:00', endTime: '11:30', status: 'CONFIRMED' },
  ];

  for (const booking of bookingsData) {
    const existingBooking = await prisma.booking.findFirst({
      where: {
        tenantId: demoTenant.id,
        customerId: booking.customerId,
        date: booking.date,
        startTime: booking.startTime,
      },
    });

    if (!existingBooking) {
      await prisma.booking.create({
        data: {
          tenantId: demoTenant.id,
          ...booking,
        },
      });
    }
  }

  console.log('✅ Sample bookings created');

  // Create Subscription Plans - Precios de Lanzamiento
  // Después de 3 meses: Profesional $10,990, Negocio $16,990
  const plans = [
    {
      name: 'Gratis',
      slug: 'gratis',
      description: 'Perfecto para empezar y probar TurnoLink',
      priceMonthly: 0,
      priceYearly: 0,
      currency: 'ARS',
      trialDays: 0, // No trial, es gratis siempre
      maxBranches: 1,
      maxEmployees: 2,
      maxServices: 5,
      maxBookingsMonth: 30,
      maxCustomers: 50,
      features: JSON.stringify(['whatsapp_confirmation', 'email_reminder', 'calendar', 'basic_reports']),
      isPopular: false,
      isActive: true,
      order: 0,
    },
    {
      name: 'Profesional',
      slug: 'profesional',
      description: 'Ideal para profesionales independientes',
      priceMonthly: 8990, // Precio lanzamiento, luego $10,990
      priceYearly: 89900,
      currency: 'ARS',
      trialDays: 14,
      maxBranches: 1,
      maxEmployees: 5,
      maxServices: 20,
      maxBookingsMonth: 150,
      maxCustomers: 500,
      features: JSON.stringify(['whatsapp_confirmation', 'email_reminder', 'calendar', 'advanced_reports', 'mercadopago', 'whatsapp_support']),
      isPopular: true,
      isActive: true,
      order: 1,
    },
    {
      name: 'Negocio',
      slug: 'negocio',
      description: 'Para negocios en crecimiento con equipo',
      priceMonthly: 14990, // Precio lanzamiento, luego $16,990
      priceYearly: 149900,
      currency: 'ARS',
      trialDays: 14,
      maxBranches: 5,
      maxEmployees: 15,
      maxServices: null, // Ilimitados
      maxBookingsMonth: null, // Ilimitados
      maxCustomers: null, // Ilimitados
      features: JSON.stringify(['whatsapp_confirmation', 'email_reminder', 'calendar', 'complete_reports', 'mercadopago', 'priority_support', 'multi_branch']),
      isPopular: false,
      isActive: true,
      order: 2,
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
  }

  console.log('✅ Subscription plans created');

  // Also keep the old demo-barberia for backwards compatibility
  const oldTenant = await prisma.tenant.findUnique({
    where: { slug: 'demo-barberia' },
  });

  if (oldTenant) {
    // Update the redirect to the new demo
    console.log('ℹ️  Keeping demo-barberia for backwards compatibility');
  }

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Demo credentials:');
  console.log('   Super Admin: admin@turnolink.app / admin123456');
  console.log('   Demo Owner: demo@bellaestetica.com / demo123456');
  console.log('\n🔗 URLs:');
  console.log('   Landing: http://localhost:3000');
  console.log('   Demo Estética: http://localhost:3000/demo-estetica');
  console.log('   Panel Admin: http://localhost:3000/login');
  console.log('\n📊 Data created:');
  console.log(`   - ${categories.length} service categories`);
  console.log(`   - ${services.length} services`);
  console.log(`   - ${customers.length} customers`);
  console.log(`   - ${bookingsData.length} sample bookings`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
