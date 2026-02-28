import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PASSWORD = 'demo123456';

async function main() {
  const hashedPassword = await bcrypt.hash(PASSWORD, 12);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  // ========================================
  // 1. BELLA ESTETICA — Enrich existing
  // ========================================
  console.log('\n=== 1. Enriching Bella Estetica ===');

  const estetica = await prisma.tenant.findUnique({ where: { slug: 'demo-estetica' } });
  if (!estetica) {
    console.log('ERROR: demo-estetica not found. Run the main seed first.');
    return;
  }

  // Add branding
  await prisma.tenantBranding.upsert({
    where: { tenantId: estetica.id },
    update: {
      primaryColor: '#ec4899',
      secondaryColor: '#f472b6',
      accentColor: '#f59e0b',
      backgroundStyle: 'elegant',
      welcomeTitle: 'Bella Estetica',
      welcomeSubtitle: 'Centro de belleza y bienestar',
      metaTitle: 'Bella Estetica — Reserva tu turno online',
      metaDescription: 'Centro de belleza y bienestar en Buenos Aires. Reserva tu turno online.',
    },
    create: {
      tenantId: estetica.id,
      primaryColor: '#ec4899',
      secondaryColor: '#f472b6',
      accentColor: '#f59e0b',
      backgroundStyle: 'elegant',
      welcomeTitle: 'Bella Estetica',
      welcomeSubtitle: 'Centro de belleza y bienestar',
      metaTitle: 'Bella Estetica — Reserva tu turno online',
      metaDescription: 'Centro de belleza y bienestar en Buenos Aires. Reserva tu turno online.',
    },
  });

  // Add employees
  const esteticaEmployees = [
    { name: 'Mariana Lopez', email: 'mariana@bellaestetica.com', phone: '+5491155559001', specialty: 'Tratamientos Faciales' },
    { name: 'Sofia Ramirez', email: 'sofia@bellaestetica.com', phone: '+5491155559002', specialty: 'Masajes y Corporales' },
    { name: 'Camila Torres', email: 'camila@bellaestetica.com', phone: '+5491155559003', specialty: 'Manos, Pies y Depilacion' },
  ];

  const esteticaEmps = [];
  for (const emp of esteticaEmployees) {
    const existing = await prisma.employee.findFirst({
      where: { tenantId: estetica.id, name: emp.name },
    });
    if (existing) {
      esteticaEmps.push(existing);
    } else {
      const e = await prisma.employee.create({
        data: { tenantId: estetica.id, isActive: true, ...emp },
      });
      esteticaEmps.push(e);
    }
  }
  console.log('  Employees:', esteticaEmps.length);

  // Add more customers (4 extra to reach 12+)
  const extraCustomers = [
    { name: 'Ana Beltran', phone: '+5491155559101', email: 'ana.beltran@email.com', totalBookings: 6 },
    { name: 'Paula Vega', phone: '+5491155559102', email: 'paula.vega@email.com', totalBookings: 9 },
    { name: 'Florencia Diaz', phone: '+5491155559103', email: 'flor.diaz@email.com', totalBookings: 4 },
    { name: 'Julieta Morales', phone: '+5491155559104', email: 'juli.morales@email.com', totalBookings: 11 },
  ];
  for (const cust of extraCustomers) {
    await prisma.customer.upsert({
      where: { tenantId_phone: { tenantId: estetica.id, phone: cust.phone } },
      update: {},
      create: { tenantId: estetica.id, ...cust },
    });
  }

  // Fetch all customers and services for bookings
  const allEsteticaCustomers = await prisma.customer.findMany({ where: { tenantId: estetica.id } });
  const allEsteticaServices = await prisma.service.findMany({ where: { tenantId: estetica.id, isActive: true } });

  // Delete today's bookings for estetica and re-create with employee assignments
  await prisma.booking.deleteMany({
    where: { tenantId: estetica.id, date: today },
  });

  const esteticaBookingsToday = [
    { customerIdx: 0, serviceIdx: 0, startTime: '09:00', endTime: '10:00', status: 'CONFIRMED', empIdx: 0 },
    { customerIdx: 1, serviceIdx: 8, startTime: '09:30', endTime: '10:15', status: 'CONFIRMED', empIdx: 2 },
    { customerIdx: 2, serviceIdx: 4, startTime: '10:00', endTime: '11:00', status: 'CONFIRMED', empIdx: 1 },
    { customerIdx: 3, serviceIdx: 1, startTime: '11:00', endTime: '12:15', status: 'CONFIRMED', empIdx: 0 },
    { customerIdx: 4, serviceIdx: 12, startTime: '14:00', endTime: '14:45', status: 'CONFIRMED', empIdx: 2 },
    { customerIdx: 5, serviceIdx: 9, startTime: '15:00', endTime: '16:00', status: 'CONFIRMED', empIdx: 1 },
    { customerIdx: 6, serviceIdx: 2, startTime: '16:00', endTime: '16:45', status: 'CONFIRMED', empIdx: 0 },
    { customerIdx: 7, serviceIdx: 10, startTime: '17:00', endTime: '18:30', status: 'CONFIRMED', empIdx: 2 },
  ];

  for (const b of esteticaBookingsToday) {
    if (allEsteticaCustomers[b.customerIdx] && allEsteticaServices[b.serviceIdx]) {
      await prisma.booking.create({
        data: {
          tenantId: estetica.id,
          customerId: allEsteticaCustomers[b.customerIdx].id,
          serviceId: allEsteticaServices[b.serviceIdx].id,
          employeeId: esteticaEmps[b.empIdx].id,
          date: today,
          startTime: b.startTime,
          endTime: b.endTime,
          status: b.status,
        },
      });
    }
  }
  console.log('  Today bookings: 8');

  // ========================================
  // 2. CONSULTORIO MEDICO
  // ========================================
  console.log('\n=== 2. Creating Consultorio Medico ===');

  const consultorio = await prisma.tenant.upsert({
    where: { slug: 'consultorio-medico' },
    update: {
      name: 'Centro Medico Salud Integral',
      description: 'Centro medico multidisciplinario. Consultas clinicas, pediatria, dermatologia, cardiologia y nutricion.',
      phone: '+54 11 4555-8800',
      email: 'turnos@saludintegral.com',
      address: 'Av. Corrientes 1234, 2do piso',
      city: 'Buenos Aires',
      status: 'ACTIVE',
      settings: JSON.stringify({
        timezone: 'America/Argentina/Buenos_Aires',
        currency: 'ARS',
        language: 'es',
        bookingBuffer: 10,
        maxAdvanceBookingDays: 30,
        minAdvanceBookingHours: 4,
        allowCancellation: true,
        cancellationHoursLimit: 24,
        showPrices: true,
        requirePhone: true,
        requireEmail: true,
        requireDeposit: false,
        primaryColor: '#2563eb',
        secondaryColor: '#3b82f6',
      }),
    },
    create: {
      slug: 'consultorio-medico',
      name: 'Centro Medico Salud Integral',
      description: 'Centro medico multidisciplinario. Consultas clinicas, pediatria, dermatologia, cardiologia y nutricion.',
      phone: '+54 11 4555-8800',
      email: 'turnos@saludintegral.com',
      address: 'Av. Corrientes 1234, 2do piso',
      city: 'Buenos Aires',
      status: 'ACTIVE',
      settings: JSON.stringify({
        timezone: 'America/Argentina/Buenos_Aires',
        currency: 'ARS',
        language: 'es',
        bookingBuffer: 10,
        maxAdvanceBookingDays: 30,
        minAdvanceBookingHours: 4,
        allowCancellation: true,
        cancellationHoursLimit: 24,
        showPrices: true,
        requirePhone: true,
        requireEmail: true,
        requireDeposit: false,
        primaryColor: '#2563eb',
        secondaryColor: '#3b82f6',
      }),
    },
  });

  // Owner
  await prisma.user.upsert({
    where: { email: 'admin@saludintegral.com' },
    update: {},
    create: {
      email: 'admin@saludintegral.com',
      password: hashedPassword,
      name: 'Dr. Roberto Alvarez',
      role: 'OWNER',
      tenantId: consultorio.id,
      isActive: true,
    },
  });

  // Branding
  await prisma.tenantBranding.upsert({
    where: { tenantId: consultorio.id },
    update: {
      primaryColor: '#2563eb',
      secondaryColor: '#3b82f6',
      accentColor: '#10b981',
      backgroundStyle: 'minimal',
      welcomeTitle: 'Centro Medico Salud Integral',
      welcomeSubtitle: 'Tu salud, nuestra prioridad',
    },
    create: {
      tenantId: consultorio.id,
      primaryColor: '#2563eb',
      secondaryColor: '#3b82f6',
      accentColor: '#10b981',
      backgroundStyle: 'minimal',
      welcomeTitle: 'Centro Medico Salud Integral',
      welcomeSubtitle: 'Tu salud, nuestra prioridad',
    },
  });

  // Schedules — L-V 8:00-18:00, Sat 8:00-13:00
  const consultorioSchedules = [
    { dayOfWeek: 0, startTime: '08:00', endTime: '18:00', isActive: false },
    { dayOfWeek: 1, startTime: '08:00', endTime: '18:00', isActive: true },
    { dayOfWeek: 2, startTime: '08:00', endTime: '18:00', isActive: true },
    { dayOfWeek: 3, startTime: '08:00', endTime: '18:00', isActive: true },
    { dayOfWeek: 4, startTime: '08:00', endTime: '18:00', isActive: true },
    { dayOfWeek: 5, startTime: '08:00', endTime: '18:00', isActive: true },
    { dayOfWeek: 6, startTime: '08:00', endTime: '13:00', isActive: true },
  ];
  for (const s of consultorioSchedules) {
    await prisma.schedule.upsert({
      where: { tenantId_dayOfWeek: { tenantId: consultorio.id, dayOfWeek: s.dayOfWeek } },
      update: s,
      create: { tenantId: consultorio.id, ...s },
    });
  }

  // Categories
  const medCats = await Promise.all([
    prisma.serviceCategory.upsert({
      where: { id: 'cat-med-clinica' },
      update: { name: 'Clinica General', order: 1 },
      create: { id: 'cat-med-clinica', tenantId: consultorio.id, name: 'Clinica General', order: 1 },
    }),
    prisma.serviceCategory.upsert({
      where: { id: 'cat-med-especialidades' },
      update: { name: 'Especialidades', order: 2 },
      create: { id: 'cat-med-especialidades', tenantId: consultorio.id, name: 'Especialidades', order: 2 },
    }),
  ]);

  // Services
  const medServicesData = [
    { name: 'Consulta Clinica General', description: 'Consulta medica clinica integral con revision completa', price: 8000, duration: 30, categoryId: medCats[0].id, order: 1 },
    { name: 'Control de Rutina', description: 'Chequeo general con indicacion de estudios', price: 6000, duration: 20, categoryId: medCats[0].id, order: 2 },
    { name: 'Pediatria', description: 'Consulta pediatrica para ninos y adolescentes', price: 10000, duration: 30, categoryId: medCats[1].id, order: 1 },
    { name: 'Dermatologia', description: 'Consulta dermatologica. Diagnostico y tratamiento de afecciones de piel', price: 12000, duration: 30, categoryId: medCats[1].id, order: 2 },
    { name: 'Cardiologia', description: 'Evaluacion cardiovascular completa con electrocardiograma', price: 15000, duration: 40, categoryId: medCats[1].id, order: 3 },
    { name: 'Nutricion', description: 'Consulta nutricional con plan alimentario personalizado', price: 9000, duration: 45, categoryId: medCats[1].id, order: 4 },
  ];

  const medServices = [];
  for (const svc of medServicesData) {
    const existing = await prisma.service.findFirst({ where: { tenantId: consultorio.id, name: svc.name } });
    if (existing) { medServices.push(existing); }
    else {
      const s = await prisma.service.create({ data: { tenantId: consultorio.id, isActive: true, ...svc } });
      medServices.push(s);
    }
  }
  console.log('  Services:', medServices.length);

  // Employees (Doctors)
  const medEmployeesData = [
    { name: 'Dr. Martinez', email: 'martinez@saludintegral.com', phone: '+5491144001001', specialty: 'Clinica General' },
    { name: 'Dra. Garcia', email: 'garcia@saludintegral.com', phone: '+5491144001002', specialty: 'Pediatria' },
    { name: 'Dr. Romero', email: 'romero@saludintegral.com', phone: '+5491144001003', specialty: 'Dermatologia' },
    { name: 'Dra. Fernandez', email: 'fernandez@saludintegral.com', phone: '+5491144001004', specialty: 'Cardiologia' },
  ];

  const medEmps = [];
  for (const emp of medEmployeesData) {
    const existing = await prisma.employee.findFirst({ where: { tenantId: consultorio.id, name: emp.name } });
    if (existing) { medEmps.push(existing); }
    else {
      const e = await prisma.employee.create({ data: { tenantId: consultorio.id, isActive: true, ...emp } });
      medEmps.push(e);
    }
  }
  console.log('  Employees:', medEmps.length);

  // Customers (patients)
  const medCustomersData = [
    { name: 'Juan Perez', phone: '+5491144002001', email: 'juan.perez@email.com', totalBookings: 5 },
    { name: 'Maria Gonzalez', phone: '+5491144002002', email: 'maria.gon@email.com', totalBookings: 3 },
    { name: 'Carlos Ruiz', phone: '+5491144002003', email: 'carlos.r@email.com', totalBookings: 8 },
    { name: 'Laura Sosa', phone: '+5491144002004', email: 'laura.sosa@email.com', totalBookings: 2 },
    { name: 'Pedro Acosta', phone: '+5491144002005', email: 'pedro.a@email.com', totalBookings: 6 },
    { name: 'Marta Ibañez', phone: '+5491144002006', email: 'marta.i@email.com', totalBookings: 4 },
    { name: 'Fernando Rios', phone: '+5491144002007', email: 'fer.rios@email.com', totalBookings: 1 },
    { name: 'Elena Vargas', phone: '+5491144002008', email: 'elena.v@email.com', totalBookings: 7 },
    { name: 'Roberto Molina', phone: '+5491144002009', email: 'roberto.m@email.com', totalBookings: 3 },
    { name: 'Susana Herrera', phone: '+5491144002010', email: 'susana.h@email.com', totalBookings: 5 },
  ];

  const medCustomers = [];
  for (const cust of medCustomersData) {
    const c = await prisma.customer.upsert({
      where: { tenantId_phone: { tenantId: consultorio.id, phone: cust.phone } },
      update: {},
      create: { tenantId: consultorio.id, ...cust },
    });
    medCustomers.push(c);
  }

  // Bookings today
  await prisma.booking.deleteMany({ where: { tenantId: consultorio.id, date: today } });

  const medBookingsToday = [
    { customerIdx: 0, serviceIdx: 0, startTime: '08:30', endTime: '09:00', empIdx: 0, status: 'CONFIRMED' },
    { customerIdx: 1, serviceIdx: 2, startTime: '09:00', endTime: '09:30', empIdx: 1, status: 'CONFIRMED' },
    { customerIdx: 2, serviceIdx: 3, startTime: '10:00', endTime: '10:30', empIdx: 2, status: 'CONFIRMED' },
    { customerIdx: 3, serviceIdx: 4, startTime: '11:00', endTime: '11:40', empIdx: 3, status: 'CONFIRMED' },
    { customerIdx: 4, serviceIdx: 5, startTime: '14:00', endTime: '14:45', empIdx: 0, status: 'CONFIRMED' },
    { customerIdx: 5, serviceIdx: 0, startTime: '15:30', endTime: '16:00', empIdx: 0, status: 'CONFIRMED' },
  ];

  for (const b of medBookingsToday) {
    await prisma.booking.create({
      data: {
        tenantId: consultorio.id,
        customerId: medCustomers[b.customerIdx].id,
        serviceId: medServices[b.serviceIdx].id,
        employeeId: medEmps[b.empIdx].id,
        date: today,
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status,
      },
    });
  }
  console.log('  Today bookings: 6');

  // ========================================
  // 3. HOTEL COSTA SERENA
  // ========================================
  console.log('\n=== 3. Creating Hotel Costa Serena ===');

  const hotel = await prisma.tenant.upsert({
    where: { slug: 'hotel-costa-serena' },
    update: {
      name: 'Hotel Costa Serena',
      description: 'Hotel boutique frente al mar. Habitaciones con vista al oceano, suites premium y cabanas.',
      phone: '+54 223 555-4400',
      email: 'reservas@costaserena.com',
      address: 'Av. Costanera 890',
      city: 'Mar del Plata',
      status: 'ACTIVE',
      settings: JSON.stringify({
        timezone: 'America/Argentina/Buenos_Aires',
        currency: 'ARS',
        language: 'es',
        bookingMode: 'DAILY',
        dailyCheckInTime: '14:00',
        dailyCheckOutTime: '10:00',
        maxAdvanceBookingDays: 90,
        minAdvanceBookingHours: 24,
        allowCancellation: true,
        cancellationHoursLimit: 48,
        showPrices: true,
        requirePhone: true,
        requireEmail: true,
        requireDeposit: true,
        depositPercentage: 50,
        depositMode: 'simulated',
        primaryColor: '#059669',
        secondaryColor: '#10b981',
      }),
    },
    create: {
      slug: 'hotel-costa-serena',
      name: 'Hotel Costa Serena',
      description: 'Hotel boutique frente al mar. Habitaciones con vista al oceano, suites premium y cabanas.',
      phone: '+54 223 555-4400',
      email: 'reservas@costaserena.com',
      address: 'Av. Costanera 890',
      city: 'Mar del Plata',
      status: 'ACTIVE',
      settings: JSON.stringify({
        timezone: 'America/Argentina/Buenos_Aires',
        currency: 'ARS',
        language: 'es',
        bookingMode: 'DAILY',
        dailyCheckInTime: '14:00',
        dailyCheckOutTime: '10:00',
        maxAdvanceBookingDays: 90,
        minAdvanceBookingHours: 24,
        allowCancellation: true,
        cancellationHoursLimit: 48,
        showPrices: true,
        requirePhone: true,
        requireEmail: true,
        requireDeposit: true,
        depositPercentage: 50,
        depositMode: 'simulated',
        primaryColor: '#059669',
        secondaryColor: '#10b981',
      }),
    },
  });

  // Owner
  await prisma.user.upsert({
    where: { email: 'admin@costaserena.com' },
    update: {},
    create: {
      email: 'admin@costaserena.com',
      password: hashedPassword,
      name: 'Ricardo Mendez',
      role: 'OWNER',
      tenantId: hotel.id,
      isActive: true,
    },
  });

  // Branding
  await prisma.tenantBranding.upsert({
    where: { tenantId: hotel.id },
    update: {
      primaryColor: '#059669',
      secondaryColor: '#10b981',
      accentColor: '#d97706',
      backgroundStyle: 'elegant',
      welcomeTitle: 'Hotel Costa Serena',
      welcomeSubtitle: 'Tu refugio frente al mar',
    },
    create: {
      tenantId: hotel.id,
      primaryColor: '#059669',
      secondaryColor: '#10b981',
      accentColor: '#d97706',
      backgroundStyle: 'elegant',
      welcomeTitle: 'Hotel Costa Serena',
      welcomeSubtitle: 'Tu refugio frente al mar',
    },
  });

  // Schedules — 7 days
  for (let d = 0; d <= 6; d++) {
    await prisma.schedule.upsert({
      where: { tenantId_dayOfWeek: { tenantId: hotel.id, dayOfWeek: d } },
      update: { startTime: '00:00', endTime: '23:59', isActive: true },
      create: { tenantId: hotel.id, dayOfWeek: d, startTime: '00:00', endTime: '23:59', isActive: true },
    });
  }

  // Categories
  const hotelCat = await prisma.serviceCategory.upsert({
    where: { id: 'cat-hotel-habitaciones' },
    update: { name: 'Habitaciones', order: 1 },
    create: { id: 'cat-hotel-habitaciones', tenantId: hotel.id, name: 'Habitaciones', order: 1 },
  });

  // Services (rooms)
  const hotelServicesData = [
    { name: 'Habitacion Simple', description: 'Habitacion individual con vista a la ciudad. WiFi, TV, minibar.', price: 25000, duration: 1440, categoryId: hotelCat.id, order: 1 },
    { name: 'Habitacion Doble', description: 'Habitacion doble con vista al mar. Balcon privado, WiFi, desayuno incluido.', price: 38000, duration: 1440, categoryId: hotelCat.id, order: 2 },
    { name: 'Suite Premium', description: 'Suite de lujo con jacuzzi, terraza panoramica y servicio de habitacion 24hs.', price: 65000, duration: 1440, categoryId: hotelCat.id, order: 3 },
    { name: 'Cabana para 4', description: 'Cabana independiente con cocina, living y 2 dormitorios. Ideal familias.', price: 55000, duration: 1440, categoryId: hotelCat.id, order: 4 },
  ];

  const hotelServices = [];
  for (const svc of hotelServicesData) {
    const existing = await prisma.service.findFirst({ where: { tenantId: hotel.id, name: svc.name } });
    if (existing) { hotelServices.push(existing); }
    else {
      const s = await prisma.service.create({ data: { tenantId: hotel.id, isActive: true, ...svc } });
      hotelServices.push(s);
    }
  }
  console.log('  Services:', hotelServices.length);

  // Customers (guests)
  const hotelCustomersData = [
    { name: 'Alejandro Paz', phone: '+5491155600001', email: 'alejandro.paz@email.com', totalBookings: 2 },
    { name: 'Gabriela Stein', phone: '+5491155600002', email: 'gabi.stein@email.com', totalBookings: 1 },
    { name: 'Marcos y Julia Bianchetti', phone: '+5491155600003', email: 'bianchetti@email.com', totalBookings: 3 },
    { name: 'Familia Rodriguez', phone: '+5491155600004', email: 'fam.rodriguez@email.com', totalBookings: 1 },
    { name: 'Daniela Quiroga', phone: '+5491155600005', email: 'daniela.q@email.com', totalBookings: 2 },
    { name: 'Leonardo Fuentes', phone: '+5491155600006', email: 'leo.fuentes@email.com', totalBookings: 1 },
    { name: 'Pareja Sanchez-Lopez', phone: '+5491155600007', email: 'sanchezlopez@email.com', totalBookings: 4 },
    { name: 'Familia Aguirre', phone: '+5491155600008', email: 'fam.aguirre@email.com', totalBookings: 2 },
  ];

  const hotelCustomers = [];
  for (const cust of hotelCustomersData) {
    const c = await prisma.customer.upsert({
      where: { tenantId_phone: { tenantId: hotel.id, phone: cust.phone } },
      update: {},
      create: { tenantId: hotel.id, ...cust },
    });
    hotelCustomers.push(c);
  }

  // Reservations (daily bookings with check-in/out)
  await prisma.booking.deleteMany({ where: { tenantId: hotel.id } });

  const checkIn1 = new Date(today); checkIn1.setDate(checkIn1.getDate() - 1);
  const checkOut1 = new Date(today); checkOut1.setDate(checkOut1.getDate() + 2);
  const checkIn2 = new Date(today);
  const checkOut2 = new Date(today); checkOut2.setDate(checkOut2.getDate() + 3);
  const checkIn3 = new Date(today); checkIn3.setDate(checkIn3.getDate() + 1);
  const checkOut3 = new Date(today); checkOut3.setDate(checkOut3.getDate() + 4);
  const checkIn4 = new Date(today);
  const checkOut4 = new Date(today); checkOut4.setDate(checkOut4.getDate() + 5);

  const hotelBookings = [
    { customerIdx: 0, serviceIdx: 1, date: checkIn1, checkOutDate: checkOut1, totalNights: 3, totalPrice: 114000, status: 'CONFIRMED' },
    { customerIdx: 2, serviceIdx: 2, date: checkIn2, checkOutDate: checkOut2, totalNights: 3, totalPrice: 195000, status: 'CONFIRMED' },
    { customerIdx: 3, serviceIdx: 3, date: checkIn3, checkOutDate: checkOut3, totalNights: 3, totalPrice: 165000, status: 'CONFIRMED' },
    { customerIdx: 4, serviceIdx: 0, date: checkIn4, checkOutDate: checkOut4, totalNights: 5, totalPrice: 125000, status: 'CONFIRMED' },
  ];

  for (const b of hotelBookings) {
    await prisma.booking.create({
      data: {
        tenantId: hotel.id,
        customerId: hotelCustomers[b.customerIdx].id,
        serviceId: hotelServices[b.serviceIdx].id,
        date: b.date,
        startTime: '14:00',
        endTime: '10:00',
        checkOutDate: b.checkOutDate,
        totalNights: b.totalNights,
        totalPrice: b.totalPrice,
        status: b.status,
      },
    });
  }
  console.log('  Reservations: 4');

  // ========================================
  // 4. BARBER CLUB
  // ========================================
  console.log('\n=== 4. Creating Barber Club ===');

  const barber = await prisma.tenant.upsert({
    where: { slug: 'barber-club' },
    update: {
      name: 'Barber Club',
      description: 'Barberia premium. Cortes clasicos, fades, barba y tratamientos capilares.',
      phone: '+54 11 5555-7700',
      email: 'turnos@barberclub.com',
      address: 'Calle Thames 1650',
      city: 'Buenos Aires',
      instagram: '@barber.club.ba',
      status: 'ACTIVE',
      settings: JSON.stringify({
        timezone: 'America/Argentina/Buenos_Aires',
        currency: 'ARS',
        language: 'es',
        bookingBuffer: 10,
        maxAdvanceBookingDays: 14,
        minAdvanceBookingHours: 1,
        allowCancellation: true,
        cancellationHoursLimit: 2,
        showPrices: true,
        requirePhone: true,
        requireEmail: false,
        requireDeposit: true,
        depositPercentage: 30,
        depositMode: 'simulated',
        primaryColor: '#d4a017',
        secondaryColor: '#facc15',
      }),
    },
    create: {
      slug: 'barber-club',
      name: 'Barber Club',
      description: 'Barberia premium. Cortes clasicos, fades, barba y tratamientos capilares.',
      phone: '+54 11 5555-7700',
      email: 'turnos@barberclub.com',
      address: 'Calle Thames 1650',
      city: 'Buenos Aires',
      instagram: '@barber.club.ba',
      status: 'ACTIVE',
      settings: JSON.stringify({
        timezone: 'America/Argentina/Buenos_Aires',
        currency: 'ARS',
        language: 'es',
        bookingBuffer: 10,
        maxAdvanceBookingDays: 14,
        minAdvanceBookingHours: 1,
        allowCancellation: true,
        cancellationHoursLimit: 2,
        showPrices: true,
        requirePhone: true,
        requireEmail: false,
        requireDeposit: true,
        depositPercentage: 30,
        depositMode: 'simulated',
        primaryColor: '#d4a017',
        secondaryColor: '#facc15',
      }),
    },
  });

  // Owner
  await prisma.user.upsert({
    where: { email: 'admin@barberclub.com' },
    update: {},
    create: {
      email: 'admin@barberclub.com',
      password: hashedPassword,
      name: 'Lucas Barbero',
      role: 'OWNER',
      tenantId: barber.id,
      isActive: true,
    },
  });

  // Branding
  await prisma.tenantBranding.upsert({
    where: { tenantId: barber.id },
    update: {
      primaryColor: '#d4a017',
      secondaryColor: '#facc15',
      accentColor: '#000000',
      backgroundColor: '#0a0a0a',
      textColor: '#ffffff',
      backgroundStyle: 'modern',
      welcomeTitle: 'Barber Club',
      welcomeSubtitle: 'Estilo que define',
    },
    create: {
      tenantId: barber.id,
      primaryColor: '#d4a017',
      secondaryColor: '#facc15',
      accentColor: '#000000',
      backgroundColor: '#0a0a0a',
      textColor: '#ffffff',
      backgroundStyle: 'modern',
      welcomeTitle: 'Barber Club',
      welcomeSubtitle: 'Estilo que define',
    },
  });

  // Schedules — Mar-Sab 9:00-20:00
  const barberSchedules = [
    { dayOfWeek: 0, startTime: '09:00', endTime: '20:00', isActive: false }, // Domingo
    { dayOfWeek: 1, startTime: '09:00', endTime: '20:00', isActive: false }, // Lunes
    { dayOfWeek: 2, startTime: '09:00', endTime: '20:00', isActive: true },
    { dayOfWeek: 3, startTime: '09:00', endTime: '20:00', isActive: true },
    { dayOfWeek: 4, startTime: '09:00', endTime: '20:00', isActive: true },
    { dayOfWeek: 5, startTime: '09:00', endTime: '20:00', isActive: true },
    { dayOfWeek: 6, startTime: '09:00', endTime: '20:00', isActive: true },
  ];
  for (const s of barberSchedules) {
    await prisma.schedule.upsert({
      where: { tenantId_dayOfWeek: { tenantId: barber.id, dayOfWeek: s.dayOfWeek } },
      update: s,
      create: { tenantId: barber.id, ...s },
    });
  }

  // Categories
  const barberCats = await Promise.all([
    prisma.serviceCategory.upsert({
      where: { id: 'cat-barber-cortes' },
      update: { name: 'Cortes', order: 1 },
      create: { id: 'cat-barber-cortes', tenantId: barber.id, name: 'Cortes', order: 1 },
    }),
    prisma.serviceCategory.upsert({
      where: { id: 'cat-barber-barba' },
      update: { name: 'Barba', order: 2 },
      create: { id: 'cat-barber-barba', tenantId: barber.id, name: 'Barba', order: 2 },
    }),
    prisma.serviceCategory.upsert({
      where: { id: 'cat-barber-tratamientos' },
      update: { name: 'Tratamientos', order: 3 },
      create: { id: 'cat-barber-tratamientos', tenantId: barber.id, name: 'Tratamientos', order: 3 },
    }),
  ]);

  // Services
  const barberServicesData = [
    { name: 'Corte Clasico', description: 'Corte de pelo clasico con tijera y maquina', price: 5000, duration: 30, categoryId: barberCats[0].id, order: 1 },
    { name: 'Corte + Barba', description: 'Combo corte de pelo y arreglo de barba completo', price: 7500, duration: 45, categoryId: barberCats[0].id, order: 2 },
    { name: 'Fade + Diseño', description: 'Degradado con diseño personalizado', price: 6500, duration: 40, categoryId: barberCats[0].id, order: 3 },
    { name: 'Barba Completa', description: 'Perfilado, recorte y aceites esenciales', price: 4000, duration: 25, categoryId: barberCats[1].id, order: 1 },
    { name: 'Color', description: 'Coloracion capilar completa', price: 8000, duration: 60, categoryId: barberCats[2].id, order: 1 },
    { name: 'Tratamiento Capilar', description: 'Hidratacion profunda y masaje capilar', price: 10000, duration: 45, categoryId: barberCats[2].id, order: 2 },
  ];

  const barberServices = [];
  for (const svc of barberServicesData) {
    const existing = await prisma.service.findFirst({ where: { tenantId: barber.id, name: svc.name } });
    if (existing) { barberServices.push(existing); }
    else {
      const s = await prisma.service.create({ data: { tenantId: barber.id, isActive: true, ...svc } });
      barberServices.push(s);
    }
  }
  console.log('  Services:', barberServices.length);

  // Employees
  const barberEmployeesData = [
    { name: 'Lucas', email: 'lucas@barberclub.com', phone: '+5491155770001', specialty: 'Barbero Senior', bio: '10 anos de experiencia en cortes clasicos y fades' },
    { name: 'Matias', email: 'matias@barberclub.com', phone: '+5491155770002', specialty: 'Barbero', bio: 'Especialista en color y tratamientos' },
    { name: 'Tomas', email: 'tomas@barberclub.com', phone: '+5491155770003', specialty: 'Barbero Junior', bio: 'Apasionado por los diseños creativos' },
  ];

  const barberEmps = [];
  for (const emp of barberEmployeesData) {
    const existing = await prisma.employee.findFirst({ where: { tenantId: barber.id, name: emp.name } });
    if (existing) { barberEmps.push(existing); }
    else {
      const e = await prisma.employee.create({ data: { tenantId: barber.id, isActive: true, ...emp } });
      barberEmps.push(e);
    }
  }
  console.log('  Employees:', barberEmps.length);

  // Customers
  const barberCustomersData = [
    { name: 'Nicolas Gutierrez', phone: '+5491155780001', totalBookings: 12 },
    { name: 'Santiago Romero', phone: '+5491155780002', totalBookings: 8 },
    { name: 'Facundo Lopez', phone: '+5491155780003', totalBookings: 5 },
    { name: 'Agustin Diaz', phone: '+5491155780004', totalBookings: 15 },
    { name: 'Thiago Fernandez', phone: '+5491155780005', totalBookings: 3 },
    { name: 'Benjamin Garcia', phone: '+5491155780006', totalBookings: 7 },
    { name: 'Lautaro Martinez', phone: '+5491155780007', totalBookings: 20 },
    { name: 'Valentino Perez', phone: '+5491155780008', totalBookings: 10 },
    { name: 'Joaquin Torres', phone: '+5491155780009', totalBookings: 6 },
    { name: 'Bautista Sanchez', phone: '+5491155780010', totalBookings: 9 },
  ];

  const barberCustomers = [];
  for (const cust of barberCustomersData) {
    const c = await prisma.customer.upsert({
      where: { tenantId_phone: { tenantId: barber.id, phone: cust.phone } },
      update: {},
      create: { tenantId: barber.id, ...cust },
    });
    barberCustomers.push(c);
  }

  // Bookings today (8 — high rotation)
  await prisma.booking.deleteMany({ where: { tenantId: barber.id, date: today } });

  const barberBookingsToday = [
    { customerIdx: 0, serviceIdx: 0, startTime: '09:00', endTime: '09:30', empIdx: 0, status: 'CONFIRMED' },
    { customerIdx: 1, serviceIdx: 1, startTime: '09:00', endTime: '09:45', empIdx: 1, status: 'CONFIRMED' },
    { customerIdx: 2, serviceIdx: 3, startTime: '09:30', endTime: '09:55', empIdx: 2, status: 'CONFIRMED' },
    { customerIdx: 3, serviceIdx: 2, startTime: '10:00', endTime: '10:40', empIdx: 0, status: 'CONFIRMED' },
    { customerIdx: 4, serviceIdx: 0, startTime: '10:30', endTime: '11:00', empIdx: 1, status: 'CONFIRMED' },
    { customerIdx: 5, serviceIdx: 1, startTime: '11:00', endTime: '11:45', empIdx: 2, status: 'CONFIRMED' },
    { customerIdx: 6, serviceIdx: 4, startTime: '14:00', endTime: '15:00', empIdx: 1, status: 'CONFIRMED' },
    { customerIdx: 7, serviceIdx: 5, startTime: '15:00', endTime: '15:45', empIdx: 0, status: 'CONFIRMED' },
  ];

  for (const b of barberBookingsToday) {
    await prisma.booking.create({
      data: {
        tenantId: barber.id,
        customerId: barberCustomers[b.customerIdx].id,
        serviceId: barberServices[b.serviceIdx].id,
        employeeId: barberEmps[b.empIdx].id,
        date: today,
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status,
      },
    });
  }
  console.log('  Today bookings: 8');

  // ========================================
  // 5. ALBERGUE LUXURY
  // ========================================
  console.log('\n=== 5. Creating Albergue Luxury ===');

  const albergue = await prisma.tenant.upsert({
    where: { slug: 'albergue-luxury' },
    update: {
      name: 'Albergue Luxury',
      description: 'Experiencia exclusiva y discreta. Turnos de 2hs, 4hs, pernocte y suite VIP.',
      phone: '+54 11 5555-9900',
      email: 'reservas@albergueluxury.com',
      address: 'Zona exclusiva',
      city: 'Buenos Aires',
      status: 'ACTIVE',
      settings: JSON.stringify({
        timezone: 'America/Argentina/Buenos_Aires',
        currency: 'ARS',
        language: 'es',
        bookingBuffer: 15,
        maxAdvanceBookingDays: 7,
        minAdvanceBookingHours: 1,
        allowCancellation: true,
        cancellationHoursLimit: 2,
        showPrices: true,
        requirePhone: true,
        requireEmail: false,
        requireDeposit: false,
        primaryColor: '#9f1239',
        secondaryColor: '#e11d48',
      }),
    },
    create: {
      slug: 'albergue-luxury',
      name: 'Albergue Luxury',
      description: 'Experiencia exclusiva y discreta. Turnos de 2hs, 4hs, pernocte y suite VIP.',
      phone: '+54 11 5555-9900',
      email: 'reservas@albergueluxury.com',
      address: 'Zona exclusiva',
      city: 'Buenos Aires',
      status: 'ACTIVE',
      settings: JSON.stringify({
        timezone: 'America/Argentina/Buenos_Aires',
        currency: 'ARS',
        language: 'es',
        bookingBuffer: 15,
        maxAdvanceBookingDays: 7,
        minAdvanceBookingHours: 1,
        allowCancellation: true,
        cancellationHoursLimit: 2,
        showPrices: true,
        requirePhone: true,
        requireEmail: false,
        requireDeposit: false,
        primaryColor: '#9f1239',
        secondaryColor: '#e11d48',
      }),
    },
  });

  // Owner
  await prisma.user.upsert({
    where: { email: 'admin@albergueluxury.com' },
    update: {},
    create: {
      email: 'admin@albergueluxury.com',
      password: hashedPassword,
      name: 'Admin Luxury',
      role: 'OWNER',
      tenantId: albergue.id,
      isActive: true,
    },
  });

  // Branding
  await prisma.tenantBranding.upsert({
    where: { tenantId: albergue.id },
    update: {
      primaryColor: '#9f1239',
      secondaryColor: '#e11d48',
      accentColor: '#fbbf24',
      backgroundStyle: 'vibrant',
      welcomeTitle: 'Albergue Luxury',
      welcomeSubtitle: 'Experiencia exclusiva',
    },
    create: {
      tenantId: albergue.id,
      primaryColor: '#9f1239',
      secondaryColor: '#e11d48',
      accentColor: '#fbbf24',
      backgroundStyle: 'vibrant',
      welcomeTitle: 'Albergue Luxury',
      welcomeSubtitle: 'Experiencia exclusiva',
    },
  });

  // Schedules — 24/7
  for (let d = 0; d <= 6; d++) {
    await prisma.schedule.upsert({
      where: { tenantId_dayOfWeek: { tenantId: albergue.id, dayOfWeek: d } },
      update: { startTime: '00:00', endTime: '23:59', isActive: true },
      create: { tenantId: albergue.id, dayOfWeek: d, startTime: '00:00', endTime: '23:59', isActive: true },
    });
  }

  // Category
  const albergueCat = await prisma.serviceCategory.upsert({
    where: { id: 'cat-albergue-turnos' },
    update: { name: 'Turnos', order: 1 },
    create: { id: 'cat-albergue-turnos', tenantId: albergue.id, name: 'Turnos', order: 1 },
  });

  // Services
  const albergueServicesData = [
    { name: 'Turno 2hs', description: 'Habitacion estandar por 2 horas', price: 4500, duration: 120, categoryId: albergueCat.id, order: 1 },
    { name: 'Turno 4hs', description: 'Habitacion estandar por 4 horas. Incluye amenities premium', price: 7000, duration: 240, categoryId: albergueCat.id, order: 2 },
    { name: 'Pernocte', description: 'Estadia completa de 20:00 a 11:00 del dia siguiente', price: 12000, duration: 900, categoryId: albergueCat.id, order: 3 },
    { name: 'Suite VIP 2hs', description: 'Suite premium con jacuzzi, minibar y decoracion exclusiva', price: 8000, duration: 120, categoryId: albergueCat.id, order: 4 },
  ];

  const albergueServices = [];
  for (const svc of albergueServicesData) {
    const existing = await prisma.service.findFirst({ where: { tenantId: albergue.id, name: svc.name } });
    if (existing) { albergueServices.push(existing); }
    else {
      const s = await prisma.service.create({ data: { tenantId: albergue.id, isActive: true, ...svc } });
      albergueServices.push(s);
    }
  }
  console.log('  Services:', albergueServices.length);

  // Customers (minimal/anonymous)
  const albergueCustomersData = [
    { name: 'Cliente 1', phone: '+5491155990001', totalBookings: 5 },
    { name: 'Cliente 2', phone: '+5491155990002', totalBookings: 3 },
    { name: 'Cliente 3', phone: '+5491155990003', totalBookings: 8 },
    { name: 'Cliente 4', phone: '+5491155990004', totalBookings: 2 },
    { name: 'Cliente 5', phone: '+5491155990005', totalBookings: 6 },
    { name: 'Cliente 6', phone: '+5491155990006', totalBookings: 1 },
  ];

  const albergueCustomers = [];
  for (const cust of albergueCustomersData) {
    const c = await prisma.customer.upsert({
      where: { tenantId_phone: { tenantId: albergue.id, phone: cust.phone } },
      update: {},
      create: { tenantId: albergue.id, ...cust },
    });
    albergueCustomers.push(c);
  }

  // Bookings
  await prisma.booking.deleteMany({ where: { tenantId: albergue.id, date: today } });

  const albergueBookingsToday = [
    { customerIdx: 0, serviceIdx: 0, startTime: '10:00', endTime: '12:00', status: 'CONFIRMED' },
    { customerIdx: 1, serviceIdx: 3, startTime: '12:00', endTime: '14:00', status: 'CONFIRMED' },
    { customerIdx: 2, serviceIdx: 1, startTime: '14:00', endTime: '18:00', status: 'CONFIRMED' },
    { customerIdx: 3, serviceIdx: 0, startTime: '16:00', endTime: '18:00', status: 'CONFIRMED' },
    { customerIdx: 4, serviceIdx: 2, startTime: '20:00', endTime: '11:00', status: 'CONFIRMED' },
  ];

  for (const b of albergueBookingsToday) {
    await prisma.booking.create({
      data: {
        tenantId: albergue.id,
        customerId: albergueCustomers[b.customerIdx].id,
        serviceId: albergueServices[b.serviceIdx].id,
        date: today,
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status,
      },
    });
  }
  console.log('  Today bookings: 5');

  // ========================================
  // SUMMARY
  // ========================================
  console.log('\n========================================');
  console.log('Seed completed successfully!');
  console.log('========================================');
  console.log('\nDemo accounts (all password: demo123456):');
  console.log('  1. Bella Estetica: demo@bellaestetica.com');
  console.log('  2. Consultorio Medico: admin@saludintegral.com');
  console.log('  3. Hotel Costa Serena: admin@costaserena.com');
  console.log('  4. Barber Club: admin@barberclub.com');
  console.log('  5. Albergue Luxury: admin@albergueluxury.com');
  console.log('\nPublic booking pages:');
  console.log('  https://turnolink.mubitt.com/demo-estetica');
  console.log('  https://turnolink.mubitt.com/consultorio-medico');
  console.log('  https://turnolink.mubitt.com/hotel-costa-serena');
  console.log('  https://turnolink.mubitt.com/barber-club');
  console.log('  https://turnolink.mubitt.com/albergue-luxury');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
