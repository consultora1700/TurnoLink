import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🏡 Creando perfil demo: Quinta Los Álamos...');

  // ─── Images (Unsplash - Free License) ───
  const images = {
    // 3 fotos aéreas del mismo fotógrafo (Zoshua Colah) - misma propiedad
    cover: 'https://images.unsplash.com/photo-1711110066231-cb235d6e117e?w=1200&q=80&auto=format&fit=crop',
    poolAerial: 'https://images.unsplash.com/photo-1711110065992-6d6aff9ae35c?w=1200&q=80&auto=format&fit=crop',
    propertyWide: 'https://images.unsplash.com/photo-1711110065954-1c79c1dec505?w=1200&q=80&auto=format&fit=crop',
    // Pool area at ground level
    poolGround: 'https://images.unsplash.com/photo-1600793732399-96544bcf47fa?w=1200&q=80&auto=format&fit=crop',
    // Cozy rustic bedroom
    bedroom: 'https://images.unsplash.com/photo-1771207918220-2b297e290f5d?w=1200&q=80&auto=format&fit=crop',
    // Modern bedroom with view
    bedroomView: 'https://images.unsplash.com/photo-1771275919604-81ae44ac4c38?w=1200&q=80&auto=format&fit=crop',
    // Outdoor BBQ/parrilla area
    parrilla: 'https://plus.unsplash.com/premium_photo-1685291511970-3b96dc92f38c?w=1200&q=80&auto=format&fit=crop',
    // Bedroom with wooden walls (rustic cabin feel)
    cabinBedroom: 'https://plus.unsplash.com/premium_photo-1685291511996-e7484d9bac0f?w=1200&q=80&auto=format&fit=crop',
    // Pool with loungers
    poolLounge: 'https://plus.unsplash.com/premium_photo-1733514692194-b7fa81796293?w=1200&q=80&auto=format&fit=crop',
    // House with pool and dining
    houseDining: 'https://plus.unsplash.com/premium_photo-1757976211213-6db08396f3d8?w=1200&q=80&auto=format&fit=crop',
  };

  // ─── Tenant ───
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'quinta-los-alamos' },
    update: {
      name: 'Quinta Los Álamos',
      description:
        'Hermosa casa de campo con pileta, parrilla y amplio parque arbolado. Ubicada a solo 45 minutos de Capital Federal, ideal para escapadas de fin de semana, reuniones familiares o descanso en pareja. Capacidad para hasta 8 personas.',
      logo: images.poolAerial,
      coverImage: images.cover,
      phone: '+54 11 6789-1234',
      email: 'reservas@quintalosalamos.com.ar',
      address: 'Ruta 6, Km 42, Barrio Las Acacias',
      city: 'Open Door, Luján',
      instagram: '@quinta.losalamos',
      facebook: 'QuintaLosAlamos',
      website: 'https://quintalosalamos.com.ar',
      settings: JSON.stringify({
        timezone: 'America/Argentina/Buenos_Aires',
        currency: 'ARS',
        language: 'es',
        bookingBuffer: 0,
        maxAdvanceBookingDays: 90,
        minAdvanceBookingHours: 24,
        allowCancellation: true,
        cancellationHoursLimit: 48,
        showPrices: true,
        requirePhone: true,
        requireEmail: true,
        requireDeposit: true,
        depositPercentage: 30,
        depositMode: 'simulated',
        primaryColor: '#059669',
        secondaryColor: '#34d399',
        bookingMode: 'DAILY',
        dailyCheckInTime: '14:00',
        dailyCheckOutTime: '10:00',
        dailyMinNights: 1,
        dailyMaxNights: 14,
        dailyClosedDays: [],
      }),
    },
    create: {
      slug: 'quinta-los-alamos',
      name: 'Quinta Los Álamos',
      type: 'BUSINESS',
      description:
        'Hermosa casa de campo con pileta, parrilla y amplio parque arbolado. Ubicada a solo 45 minutos de Capital Federal, ideal para escapadas de fin de semana, reuniones familiares o descanso en pareja. Capacidad para hasta 8 personas.',
      logo: images.poolAerial,
      coverImage: images.cover,
      phone: '+54 11 6789-1234',
      email: 'reservas@quintalosalamos.com.ar',
      address: 'Ruta 6, Km 42, Barrio Las Acacias',
      city: 'Open Door, Luján',
      instagram: '@quinta.losalamos',
      facebook: 'QuintaLosAlamos',
      website: 'https://quintalosalamos.com.ar',
      status: 'ACTIVE',
      settings: JSON.stringify({
        timezone: 'America/Argentina/Buenos_Aires',
        currency: 'ARS',
        language: 'es',
        bookingBuffer: 0,
        maxAdvanceBookingDays: 90,
        minAdvanceBookingHours: 24,
        allowCancellation: true,
        cancellationHoursLimit: 48,
        showPrices: true,
        requirePhone: true,
        requireEmail: true,
        requireDeposit: true,
        depositPercentage: 30,
        depositMode: 'simulated',
        primaryColor: '#059669',
        secondaryColor: '#34d399',
        bookingMode: 'DAILY',
        dailyCheckInTime: '14:00',
        dailyCheckOutTime: '10:00',
        dailyMinNights: 1,
        dailyMaxNights: 14,
        dailyClosedDays: [],
      }),
    },
  });

  console.log('✅ Tenant creado:', tenant.name, `(/${tenant.slug})`);

  // ─── Owner User ───
  const ownerPassword = await bcrypt.hash('quinta123456', 12);

  const owner = await prisma.user.upsert({
    where: { email: 'martin@quintalosalamos.com.ar' },
    update: {},
    create: {
      email: 'martin@quintalosalamos.com.ar',
      password: ownerPassword,
      name: 'Martín Álvarez',
      role: 'OWNER',
      tenantId: tenant.id,
      isActive: true,
    },
  });

  console.log('✅ Owner creado:', owner.email);

  // ─── Service Categories ───
  const categories = await Promise.all([
    prisma.serviceCategory.upsert({
      where: { id: 'cat-alojamiento' },
      update: { name: 'Alojamiento', order: 1 },
      create: {
        id: 'cat-alojamiento',
        tenantId: tenant.id,
        name: 'Alojamiento',
        order: 1,
      },
    }),
    prisma.serviceCategory.upsert({
      where: { id: 'cat-experiencias' },
      update: { name: 'Experiencias', order: 2 },
      create: {
        id: 'cat-experiencias',
        tenantId: tenant.id,
        name: 'Experiencias',
        order: 2,
      },
    }),
  ]);

  console.log('✅ Categorías creadas:', categories.length);

  // ─── Services (price = per night) ───
  const servicesData = [
    {
      name: 'Casa Completa (hasta 8 personas)',
      description:
        'Alquiler completo de la quinta. Incluye 3 habitaciones (2 dobles + 1 cuádruple), living-comedor, cocina equipada, pileta, parrilla techada y parque de 2000m². WiFi, DirecTV, aire acondicionado y ropa blanca incluidos.',
      price: 45000,
      duration: 1440,
      categoryId: categories[0].id,
      order: 1,
      image: images.cover,
      images: JSON.stringify([
        images.cover,
        images.poolAerial,
        images.propertyWide,
        images.bedroom,
        images.parrilla,
        images.poolGround,
      ]),
      includes: 'WiFi, DirecTV, Aire acondicionado, Ropa blanca, Toallas, Parrilla, Pileta, Estacionamiento',
    },
    {
      name: 'Habitación Principal (2 personas)',
      description:
        'Habitación matrimonial con cama king size, baño privado con hidromasaje, aire acondicionado y vista al parque. Acceso compartido a pileta, parrilla y espacios comunes.',
      price: 25000,
      duration: 1440,
      categoryId: categories[0].id,
      order: 2,
      image: images.bedroomView,
      images: JSON.stringify([
        images.bedroomView,
        images.poolGround,
        images.poolAerial,
      ]),
      includes: 'WiFi, Aire acondicionado, Baño privado, Hidromasaje, Ropa blanca, Desayuno',
    },
    {
      name: 'Cabaña del Parque (4 personas)',
      description:
        'Cabaña independiente rodeada de árboles con una cama matrimonial y dos camas individuales. Baño privado, pequeña galería con vista al jardín. Acceso a pileta y parrilla compartida.',
      price: 35000,
      duration: 1440,
      categoryId: categories[0].id,
      order: 3,
      image: images.cabinBedroom,
      images: JSON.stringify([
        images.cabinBedroom,
        images.poolLounge,
        images.propertyWide,
      ]),
      includes: 'WiFi, Aire acondicionado, Baño privado, Ropa blanca, Galería privada',
    },
    {
      name: 'Día de Campo + Almuerzo',
      description:
        'Jornada de día completo (10:00 a 18:00) con acceso a pileta, parque y juegos. Incluye almuerzo con asado criollo completo, ensaladas, postre y bebidas. Mínimo 6 personas.',
      price: 15000,
      duration: 480,
      categoryId: categories[1].id,
      order: 1,
      image: images.parrilla,
      images: JSON.stringify([
        images.parrilla,
        images.poolGround,
        images.houseDining,
      ]),
      includes: 'Asado completo, Bebidas, Pileta, Parque, Juegos, Estacionamiento',
    },
  ];

  const services = [];
  for (const svc of servicesData) {
    const existing = await prisma.service.findFirst({
      where: { tenantId: tenant.id, name: svc.name },
    });
    if (existing) {
      const updated = await prisma.service.update({
        where: { id: existing.id },
        data: { ...svc },
      });
      services.push(updated);
    } else {
      const service = await prisma.service.create({
        data: { tenantId: tenant.id, isActive: true, ...svc },
      });
      services.push(service);
    }
  }

  console.log('✅ Servicios creados:', services.length);

  // ─── Schedules (check-in availability) ───
  const schedules = [
    { dayOfWeek: 0, startTime: '14:00', endTime: '22:00', isActive: true }, // Domingo
    { dayOfWeek: 1, startTime: '14:00', endTime: '22:00', isActive: true }, // Lunes
    { dayOfWeek: 2, startTime: '14:00', endTime: '22:00', isActive: true }, // Martes
    { dayOfWeek: 3, startTime: '14:00', endTime: '22:00', isActive: true }, // Miércoles
    { dayOfWeek: 4, startTime: '14:00', endTime: '22:00', isActive: true }, // Jueves
    { dayOfWeek: 5, startTime: '14:00', endTime: '22:00', isActive: true }, // Viernes
    { dayOfWeek: 6, startTime: '14:00', endTime: '22:00', isActive: true }, // Sábado
  ];

  for (const schedule of schedules) {
    await prisma.schedule.upsert({
      where: {
        tenantId_dayOfWeek: {
          tenantId: tenant.id,
          dayOfWeek: schedule.dayOfWeek,
        },
      },
      update: schedule,
      create: {
        tenantId: tenant.id,
        ...schedule,
      },
    });
  }

  console.log('✅ Horarios creados (7 días)');

  // ─── Demo Customers ───
  const customersData = [
    { name: 'Roberto Fernández', phone: '+5491144441111', email: 'roberto.f@gmail.com', totalBookings: 5 },
    { name: 'Carolina Méndez', phone: '+5491144442222', email: 'caro.mendez@gmail.com', totalBookings: 3 },
    { name: 'Diego y Familia Ruiz', phone: '+5491144443333', email: 'diego.ruiz@yahoo.com', totalBookings: 8 },
    { name: 'Ana Paula Sosa', phone: '+5491144444444', email: 'anapaulasosa@gmail.com', totalBookings: 2 },
    { name: 'Grupo Empresa TechCo', phone: '+5491144445555', email: 'eventos@techco.com.ar', totalBookings: 1 },
  ];

  const customers = [];
  for (const cust of customersData) {
    const customer = await prisma.customer.upsert({
      where: { tenantId_phone: { tenantId: tenant.id, phone: cust.phone } },
      update: { name: cust.name, email: cust.email, totalBookings: cust.totalBookings },
      create: {
        tenantId: tenant.id,
        ...cust,
      },
    });
    customers.push(customer);
  }

  console.log('✅ Clientes creados:', customers.length);

  // ─── Sample Daily Bookings ───
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Booking 1: Current stay (started 2 days ago, ends tomorrow)
  const b1CheckIn = new Date(today);
  b1CheckIn.setDate(b1CheckIn.getDate() - 2);
  const b1CheckOut = new Date(today);
  b1CheckOut.setDate(b1CheckOut.getDate() + 1);

  // Booking 2: Upcoming stay (starts in 3 days, 4 nights)
  const b2CheckIn = new Date(today);
  b2CheckIn.setDate(b2CheckIn.getDate() + 3);
  const b2CheckOut = new Date(today);
  b2CheckOut.setDate(b2CheckOut.getDate() + 7);

  // Booking 3: Weekend stay (next Friday to Sunday)
  const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7;
  const b3CheckIn = new Date(today);
  b3CheckIn.setDate(b3CheckIn.getDate() + daysUntilFriday + 7); // Next next Friday
  const b3CheckOut = new Date(b3CheckIn);
  b3CheckOut.setDate(b3CheckOut.getDate() + 2);

  const bookingsData = [
    {
      customerId: customers[2].id, // Diego y Familia
      serviceId: services[0].id, // Casa Completa
      date: b1CheckIn,
      startTime: '14:00',
      endTime: '10:00',
      status: 'CONFIRMED',
      checkOutDate: b1CheckOut,
      totalNights: 3,
      totalPrice: 135000, // 45000 x 3
    },
    {
      customerId: customers[0].id, // Roberto
      serviceId: services[1].id, // Habitación Principal
      date: b2CheckIn,
      startTime: '14:00',
      endTime: '10:00',
      status: 'CONFIRMED',
      checkOutDate: b2CheckOut,
      totalNights: 4,
      totalPrice: 100000, // 25000 x 4
    },
    {
      customerId: customers[1].id, // Carolina
      serviceId: services[2].id, // Cabaña del Parque
      date: b3CheckIn,
      startTime: '14:00',
      endTime: '10:00',
      status: 'PENDING',
      checkOutDate: b3CheckOut,
      totalNights: 2,
      totalPrice: 70000, // 35000 x 2
    },
  ];

  for (const booking of bookingsData) {
    const existingBooking = await prisma.booking.findFirst({
      where: {
        tenantId: tenant.id,
        customerId: booking.customerId,
        date: booking.date,
        serviceId: booking.serviceId,
      },
    });

    if (!existingBooking) {
      await prisma.booking.create({
        data: {
          tenantId: tenant.id,
          ...booking,
        },
      });
    }
  }

  console.log('✅ Reservas de ejemplo creadas:', bookingsData.length);

  // ─── Assign free plan subscription ───
  const freePlan = await prisma.subscriptionPlan.findUnique({
    where: { slug: 'gratis' },
  });

  if (freePlan) {
    const existingSub = await prisma.subscription.findUnique({
      where: { tenantId: tenant.id },
    });

    if (!existingSub) {
      await prisma.subscription.create({
        data: {
          tenantId: tenant.id,
          planId: freePlan.id,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });
      console.log('✅ Suscripción gratuita asignada');
    }
  }

  console.log('\n🎉 ¡Perfil de Quinta Los Álamos creado exitosamente!');
  console.log('\n📋 Credenciales:');
  console.log('   Owner: martin@quintalosalamos.com.ar / quinta123456');
  console.log('\n🔗 URL pública:');
  console.log('   https://turnolink.app/quinta-los-alamos');
  console.log('\n📊 Datos creados:');
  console.log(`   - ${categories.length} categorías de servicio`);
  console.log(`   - ${services.length} servicios (precio por noche)`);
  console.log(`   - ${customers.length} clientes demo`);
  console.log(`   - ${bookingsData.length} reservas de ejemplo`);
  console.log(`   - Modo: DAILY (check-in 14:00 / check-out 10:00)`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
