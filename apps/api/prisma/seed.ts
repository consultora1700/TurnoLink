import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Super Admin - require env vars in production
  const adminEmail = process.env.SUPER_ADMIN_EMAIL;
  const adminPasswordRaw = process.env.SUPER_ADMIN_PASSWORD;

  if (!adminEmail || !adminPasswordRaw) {
    throw new Error('SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD env vars are required for seeding');
  }

  const adminPassword = await bcrypt.hash(adminPasswordRaw, 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: adminPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.log('Super Admin created:', superAdmin.email);

  // Create Demo Tenant - Bella Estética
  const demoTenant = await prisma.tenant.upsert({
    where: { slug: 'bella-estetica' },
    update: {
      name: 'Bella Estética',
      description: 'Centro de belleza y bienestar. Tratamientos faciales, corporales y spa.',
      phone: '+54 11 5555-1234',
      email: 'info@bellaestetica.com',
      address: 'Av. Libertador 4500',
      city: 'Buenos Aires',
      instagram: '@bella_estetica',
      logo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=1600&h=600&fit=crop',
      settings: JSON.stringify({
        timezone: 'America/Argentina/Buenos_Aires',
        currency: 'ARS',
        language: 'es',
        bookingBuffer: 0,
        maxAdvanceBookingDays: 30,
        minAdvanceBookingHours: 2,
        allowCancellation: true,
        cancellationHoursLimit: 24,
        showPrices: true,
        requirePhone: true,
        requireEmail: false,
        primaryColor: '#ec4899',
        secondaryColor: '#8b5cf6',
        requireDeposit: true,
        depositPercentage: 30,
        depositMode: 'simulated',
      }),
    },
    create: {
      slug: 'bella-estetica',
      name: 'Bella Estética',
      description: 'Centro de belleza y bienestar. Tratamientos faciales, corporales y spa.',
      phone: '+54 11 5555-1234',
      email: 'info@bellaestetica.com',
      address: 'Av. Libertador 4500',
      city: 'Buenos Aires',
      instagram: '@bella_estetica',
      logo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=1600&h=600&fit=crop',
      status: 'ACTIVE',
      settings: JSON.stringify({
        timezone: 'America/Argentina/Buenos_Aires',
        currency: 'ARS',
        language: 'es',
        bookingBuffer: 0,
        maxAdvanceBookingDays: 30,
        minAdvanceBookingHours: 2,
        allowCancellation: true,
        cancellationHoursLimit: 24,
        showPrices: true,
        requirePhone: true,
        requireEmail: false,
        primaryColor: '#ec4899',
        secondaryColor: '#8b5cf6',
        requireDeposit: true,
        depositPercentage: 30,
        depositMode: 'simulated',
      }),
    },
  });

  console.log('✅ Demo Tenant created:', demoTenant.name);

  // Create Demo Owner
  const demoPasswordRaw = process.env.DEMO_OWNER_PASSWORD || 'demo-' + Math.random().toString(36).slice(2, 10);
  const ownerPassword = await bcrypt.hash(demoPasswordRaw, 12);

  const demoOwner = await prisma.user.upsert({
    where: { email: 'info@bellaestetica.com' },
    update: {},
    create: {
      email: 'info@bellaestetica.com',
      password: ownerPassword,
      name: 'Carolina López',
      role: 'OWNER',
      tenantId: demoTenant.id,
      isActive: true,
    },
  });

  console.log('✅ Demo Owner created:', demoOwner.email);

  // Delete existing bookings first (foreign key constraint)
  await prisma.booking.deleteMany({
    where: { tenantId: demoTenant.id },
  });

  // Delete existing services for this tenant to avoid duplicates
  await prisma.service.deleteMany({
    where: { tenantId: demoTenant.id },
  });

  // Create Services - Estética
  const serviceData = [
    { name: 'Limpieza Facial Profunda', description: 'Limpieza completa con extracción, vaporización y mascarilla hidratante', price: 8500, duration: 60, order: 1 },
    { name: 'Manicura + Pedicura', description: 'Tratamiento completo de manos y pies con esmaltado', price: 8500, duration: 90, order: 2 },
    { name: 'Masaje Relajante', description: 'Masaje corporal completo con aceites esenciales aromáticos', price: 9000, duration: 60, order: 3 },
    { name: 'Depilación Piernas Completas', description: 'Depilación con cera descartable, incluye hidratación', price: 6500, duration: 45, order: 4 },
    { name: 'Tratamiento Antiage', description: 'Tratamiento facial rejuvenecedor con ácido hialurónico', price: 12000, duration: 75, order: 5 },
    { name: 'Uñas Esculpidas', description: 'Uñas acrílicas o gel con diseño a elección', price: 15000, duration: 120, order: 6 },
  ];

  const services = [];
  for (const svc of serviceData) {
    const service = await prisma.service.create({
      data: { tenantId: demoTenant.id, isActive: true, ...svc },
    });
    services.push(service);
  }

  console.log('✅ Services created:', services.length);

  // Create Schedules
  const schedules = [
    { dayOfWeek: 0, startTime: '09:00', endTime: '20:00', isActive: true },
    { dayOfWeek: 1, startTime: '09:00', endTime: '20:00', isActive: true },
    { dayOfWeek: 2, startTime: '09:00', endTime: '20:00', isActive: true },
    { dayOfWeek: 3, startTime: '09:00', endTime: '20:00', isActive: true },
    { dayOfWeek: 4, startTime: '09:00', endTime: '20:00', isActive: true },
    { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isActive: true },
    { dayOfWeek: 6, startTime: '10:00', endTime: '14:00', isActive: false },
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

  // Delete existing employees and create new ones
  await prisma.employee.deleteMany({
    where: { tenantId: demoTenant.id },
  });

  // Create Demo Employees - Estética
  const employeesData = [
    {
      name: 'María Fernández',
      email: 'maria.fernandez@bellaestetica.com',
      phone: '+54 11 5555-1001',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
      specialty: 'Tratamientos Faciales',
      bio: 'Especialista en tratamientos faciales con más de 8 años de experiencia. Certificada en cosmiatría avanzada.',
      isActive: true,
      order: 1,
    },
    {
      name: 'Lucía Gómez',
      email: 'lucia.gomez@bellaestetica.com',
      phone: '+54 11 5555-1002',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
      specialty: 'Manicura y Pedicura',
      bio: 'Experta en nail art y técnicas de esmaltado semipermanente. Creativa y detallista.',
      isActive: true,
      order: 2,
    },
    {
      name: 'Ana Rodríguez',
      email: 'ana.rodriguez@bellaestetica.com',
      phone: '+54 11 5555-1003',
      image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=200&h=200&fit=crop&crop=face',
      specialty: 'Masajes y Spa',
      bio: 'Masajista profesional especializada en técnicas relajantes y descontracturantes. Certificada en aromaterapia.',
      isActive: true,
      order: 3,
    },
  ];

  const employees = [];
  for (const emp of employeesData) {
    const employee = await prisma.employee.create({
      data: {
        tenantId: demoTenant.id,
        ...emp,
      },
    });
    employees.push(employee);
  }

  console.log('✅ Employees created:', employees.length);

  // Delete existing customers and create new ones
  await prisma.customer.deleteMany({
    where: { tenantId: demoTenant.id },
  });

  // Create Demo Customers - Estética
  const customersData = [
    { name: 'María García', phone: '+5491155551234', email: 'maria.garcia@email.com', totalBookings: 8 },
    { name: 'Luciana Fernández', phone: '+5491155552345', email: 'luciana.f@email.com', totalBookings: 5 },
    { name: 'Valentina López', phone: '+5491155553456', email: 'vale.lopez@email.com', totalBookings: 12 },
    { name: 'Camila Rodríguez', phone: '+5491155554567', email: 'cami.rod@email.com', totalBookings: 3 },
    { name: 'Sofía Martínez', phone: '+5491155555678', email: 'sofia.m@email.com', totalBookings: 15 },
    { name: 'Florencia Pérez', phone: '+5491155556789', email: 'flor.perez@email.com', totalBookings: 2 },
  ];

  const customers = [];
  for (const cust of customersData) {
    const customer = await prisma.customer.create({
      data: {
        tenantId: demoTenant.id,
        ...cust,
      },
    });
    customers.push(customer);
  }

  console.log('✅ Customers created:', customers.length);

  // Delete existing bookings
  await prisma.booking.deleteMany({
    where: { tenantId: demoTenant.id },
  });

  // Create Sample Bookings - Hoy y próximos días
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const in3Days = new Date(today);
  in3Days.setDate(in3Days.getDate() + 3);

  const in4Days = new Date(today);
  in4Days.setDate(in4Days.getDate() + 4);

  const bookingsData = [
    // HOY - 4 turnos
    { customerId: customers[0].id, serviceId: services[0].id, date: today, startTime: '10:00', endTime: '11:00', status: 'CONFIRMED' },
    { customerId: customers[1].id, serviceId: services[1].id, date: today, startTime: '11:30', endTime: '13:00', status: 'PENDING' },
    { customerId: customers[2].id, serviceId: services[2].id, date: today, startTime: '14:00', endTime: '15:00', status: 'CONFIRMED' },
    { customerId: customers[3].id, serviceId: services[3].id, date: today, startTime: '16:00', endTime: '16:45', status: 'PENDING' },
    // MAÑANA - 3 turnos
    { customerId: customers[4].id, serviceId: services[4].id, date: tomorrow, startTime: '09:00', endTime: '10:30', status: 'CONFIRMED' },
    { customerId: customers[5].id, serviceId: services[0].id, date: tomorrow, startTime: '11:00', endTime: '12:00', status: 'PENDING' },
    { customerId: customers[0].id, serviceId: services[5].id, date: tomorrow, startTime: '15:00', endTime: '17:00', status: 'CONFIRMED' },
    // PASADO MAÑANA - 2 turnos
    { customerId: customers[1].id, serviceId: services[2].id, date: dayAfter, startTime: '10:00', endTime: '11:00', status: 'PENDING' },
    { customerId: customers[2].id, serviceId: services[1].id, date: dayAfter, startTime: '14:00', endTime: '15:30', status: 'CONFIRMED' },
    // EN 3 DÍAS - 3 turnos
    { customerId: customers[3].id, serviceId: services[0].id, date: in3Days, startTime: '09:30', endTime: '10:30', status: 'PENDING' },
    { customerId: customers[4].id, serviceId: services[3].id, date: in3Days, startTime: '12:00', endTime: '12:45', status: 'CONFIRMED' },
    { customerId: customers[5].id, serviceId: services[4].id, date: in3Days, startTime: '16:00', endTime: '17:30', status: 'PENDING' },
    // EN 4 DÍAS - 2 turnos
    { customerId: customers[0].id, serviceId: services[2].id, date: in4Days, startTime: '11:00', endTime: '12:00', status: 'CONFIRMED' },
    { customerId: customers[1].id, serviceId: services[5].id, date: in4Days, startTime: '15:00', endTime: '17:00', status: 'PENDING' },
  ];

  for (const booking of bookingsData) {
    await prisma.booking.create({
      data: {
        tenantId: demoTenant.id,
        ...booking,
      },
    });
  }

  console.log('✅ Sample bookings created');

  // ==========================================
  // E-COMMERCE: Categories, Products, Coupons
  // ==========================================

  // Delete existing products and categories
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({
    where: { tenantId: demoTenant.id },
  });
  await prisma.productCategory.deleteMany({
    where: { tenantId: demoTenant.id },
  });

  // Create Product Categories - Belleza
  const categories = await Promise.all([
    prisma.productCategory.create({
      data: {
        tenantId: demoTenant.id,
        name: 'Cuidado Facial',
        slug: 'cuidado-facial',
        description: 'Productos profesionales para el cuidado del rostro',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=300&fit=crop',
        isActive: true,
        order: 1,
      },
    }),
    prisma.productCategory.create({
      data: {
        tenantId: demoTenant.id,
        name: 'Cuidado Corporal',
        slug: 'cuidado-corporal',
        description: 'Cremas, aceites y tratamientos para el cuerpo',
        image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&h=300&fit=crop',
        isActive: true,
        order: 2,
      },
    }),
    prisma.productCategory.create({
      data: {
        tenantId: demoTenant.id,
        name: 'Maquillaje',
        slug: 'maquillaje',
        description: 'Productos de maquillaje profesional',
        image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=300&fit=crop',
        isActive: true,
        order: 3,
      },
    }),
    prisma.productCategory.create({
      data: {
        tenantId: demoTenant.id,
        name: 'Uñas',
        slug: 'unas',
        description: 'Esmaltes, tratamientos y accesorios para uñas',
        image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop',
        isActive: true,
        order: 4,
      },
    }),
  ]);

  console.log('✅ Product categories created:', categories.length);

  // Create Products - Belleza
  const productsData = [
    // Cuidado Facial
    {
      categoryId: categories[0].id,
      name: 'Sérum Vitamina C',
      slug: 'serum-vitamina-c',
      description: 'Sérum iluminador con vitamina C pura al 20%. Antioxidante potente que unifica el tono y reduce manchas. Apto para todo tipo de piel.',
      shortDescription: 'Sérum iluminador antioxidante',
      price: 12500,
      compareAtPrice: 15000,
      sku: 'SER-001',
      stock: 20,
      lowStockThreshold: 5,
      isActive: true,
      isFeatured: true,
      type: 'PHYSICAL' as const,
      order: 1,
      images: [
        { url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop', alt: 'Sérum Vitamina C', order: 0 },
      ],
    },
    {
      categoryId: categories[0].id,
      name: 'Crema Hidratante Ácido Hialurónico',
      slug: 'crema-acido-hialuronico',
      description: 'Crema facial con ácido hialurónico de bajo peso molecular. Hidratación profunda y efecto plumping. Reduce líneas finas.',
      shortDescription: 'Hidratación profunda con efecto plumping',
      price: 9800,
      sku: 'CRE-001',
      stock: 35,
      lowStockThreshold: 10,
      isActive: true,
      isFeatured: true,
      type: 'PHYSICAL' as const,
      order: 2,
      images: [
        { url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop', alt: 'Crema Hidratante', order: 0 },
      ],
    },
    {
      categoryId: categories[0].id,
      name: 'Limpiador Facial Espumoso',
      slug: 'limpiador-espumoso',
      description: 'Limpiador suave con espuma cremosa. Elimina impurezas sin resecar. Con extracto de aloe vera y manzanilla.',
      shortDescription: 'Limpieza suave y profunda',
      price: 5500,
      sku: 'LIM-001',
      stock: 40,
      lowStockThreshold: 10,
      isActive: true,
      isFeatured: false,
      type: 'PHYSICAL' as const,
      order: 3,
      images: [
        { url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop', alt: 'Limpiador Facial', order: 0 },
      ],
    },
    // Cuidado Corporal
    {
      categoryId: categories[1].id,
      name: 'Aceite Corporal Rosas',
      slug: 'aceite-corporal-rosas',
      description: 'Aceite hidratante con extracto de rosa mosqueta. Nutre y regenera la piel. Aroma delicado y relajante.',
      shortDescription: 'Aceite nutritivo con rosa mosqueta',
      price: 7500,
      sku: 'ACE-001',
      stock: 25,
      lowStockThreshold: 8,
      isActive: true,
      isFeatured: true,
      type: 'PHYSICAL' as const,
      order: 1,
      images: [
        { url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&h=600&fit=crop', alt: 'Aceite Corporal', order: 0 },
      ],
    },
    {
      categoryId: categories[1].id,
      name: 'Crema Anticelulítica',
      slug: 'crema-anticelulitica',
      description: 'Crema reductora con cafeína y centella asiática. Combate la celulitis y reafirma la piel. Aplicar con masajes circulares.',
      shortDescription: 'Reduce celulitis y reafirma',
      price: 8900,
      compareAtPrice: 10500,
      sku: 'CEL-001',
      stock: 18,
      lowStockThreshold: 5,
      isActive: true,
      isFeatured: false,
      type: 'PHYSICAL' as const,
      order: 2,
      images: [
        { url: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=600&h=600&fit=crop', alt: 'Crema Anticelulítica', order: 0 },
      ],
    },
    {
      categoryId: categories[1].id,
      name: 'Kit Spa en Casa',
      slug: 'kit-spa-casa',
      description: 'Kit completo para spa en casa: sales de baño, vela aromática, mascarilla facial y exfoliante corporal. El regalo perfecto.',
      shortDescription: 'Kit completo de relajación',
      price: 18500,
      compareAtPrice: 22000,
      sku: 'KIT-001',
      stock: 12,
      lowStockThreshold: 3,
      isActive: true,
      isFeatured: true,
      type: 'PHYSICAL' as const,
      order: 3,
      images: [
        { url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=600&fit=crop', alt: 'Kit Spa', order: 0 },
      ],
    },
    // Maquillaje
    {
      categoryId: categories[2].id,
      name: 'Paleta Sombras Nude',
      slug: 'paleta-sombras-nude',
      description: 'Paleta con 12 tonos nude altamente pigmentados. Incluye mates y brillos. Larga duración sin creasing.',
      shortDescription: '12 tonos nude versátiles',
      price: 11000,
      sku: 'PAL-001',
      stock: 22,
      lowStockThreshold: 5,
      isActive: true,
      isFeatured: true,
      type: 'PHYSICAL' as const,
      order: 1,
      images: [
        { url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=600&fit=crop', alt: 'Paleta Sombras', order: 0 },
      ],
    },
    {
      categoryId: categories[2].id,
      name: 'Base de Maquillaje HD',
      slug: 'base-maquillaje-hd',
      description: 'Base de cobertura media-alta con acabado natural. SPF 15. No se transfiere. Disponible en 15 tonos.',
      shortDescription: 'Cobertura natural de larga duración',
      price: 8500,
      sku: 'BAS-001',
      stock: 30,
      lowStockThreshold: 8,
      isActive: true,
      isFeatured: false,
      type: 'PHYSICAL' as const,
      order: 2,
      images: [
        { url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop', alt: 'Base de Maquillaje', order: 0 },
      ],
    },
    // Uñas
    {
      categoryId: categories[3].id,
      name: 'Set Esmaltes Semipermanentes',
      slug: 'set-esmaltes-semi',
      description: 'Set de 6 esmaltes semipermanentes colores tendencia. Duración hasta 3 semanas. Requiere lámpara UV/LED.',
      shortDescription: '6 colores tendencia',
      price: 14500,
      compareAtPrice: 18000,
      sku: 'ESM-001',
      stock: 15,
      lowStockThreshold: 4,
      isActive: true,
      isFeatured: true,
      type: 'PHYSICAL' as const,
      order: 1,
      images: [
        { url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=600&fit=crop', alt: 'Set Esmaltes', order: 0 },
      ],
    },
    {
      categoryId: categories[3].id,
      name: 'Lámpara UV/LED Profesional',
      slug: 'lampara-uv-led',
      description: 'Lámpara de secado profesional 48W. Compatible con esmaltes UV y LED. Timer automático 30/60/99 seg.',
      shortDescription: 'Secado profesional rápido',
      price: 22000,
      sku: 'LAM-001',
      stock: 8,
      lowStockThreshold: 2,
      isActive: true,
      isFeatured: false,
      type: 'PHYSICAL' as const,
      order: 2,
      images: [
        { url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&h=600&fit=crop', alt: 'Lámpara UV LED', order: 0 },
      ],
    },
    {
      categoryId: categories[3].id,
      name: 'Kit Nail Art',
      slug: 'kit-nail-art',
      description: 'Kit completo para diseño de uñas: pinceles, dotting tools, strass, cintas decorativas y stickers.',
      shortDescription: 'Todo para diseños creativos',
      price: 9500,
      sku: 'NAI-001',
      stock: 20,
      lowStockThreshold: 5,
      isActive: true,
      isFeatured: false,
      type: 'PHYSICAL' as const,
      order: 3,
      images: [
        { url: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&h=600&fit=crop', alt: 'Kit Nail Art', order: 0 },
      ],
    },
    {
      categoryId: categories[0].id,
      name: 'Mascarilla Facial Colágeno',
      slug: 'mascarilla-colageno',
      description: 'Mascarilla hidrogel con colágeno marino. Efecto lifting inmediato. Uso semanal recomendado.',
      shortDescription: 'Efecto lifting con colágeno',
      price: 3500,
      sku: 'MAS-001',
      stock: 45,
      lowStockThreshold: 10,
      isActive: true,
      isFeatured: false,
      type: 'PHYSICAL' as const,
      order: 4,
      images: [
        { url: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&h=600&fit=crop', alt: 'Mascarilla Colágeno', order: 0 },
      ],
    },
  ];

  const products = [];
  for (const productData of productsData) {
    const { images, ...product } = productData;

    const createdProduct = await prisma.product.create({
      data: {
        tenantId: demoTenant.id,
        ...product,
      },
    });

    // Create product images
    if (images && images.length > 0) {
      for (const img of images) {
        await prisma.productImage.create({
          data: {
            productId: createdProduct.id,
            url: img.url,
            alt: img.alt,
            order: img.order,
          },
        });
      }
    }

    products.push(createdProduct);
  }

  console.log('✅ Products created with images:', products.length);

  // Delete existing coupons
  await prisma.coupon.deleteMany({
    where: { tenantId: demoTenant.id },
  });

  // Create Coupons
  const coupons = await Promise.all([
    prisma.coupon.create({
      data: {
        tenantId: demoTenant.id,
        code: 'BIENVENIDA15',
        description: '15% de descuento para nuevas clientas',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        minPurchase: 5000,
        usageLimit: 100,
        usagePerCustomer: 1,
        isActive: true,
      },
    }),
    prisma.coupon.create({
      data: {
        tenantId: demoTenant.id,
        code: 'ENVIOGRATIS',
        description: 'Envío gratis en compras mayores a $10.000',
        discountType: 'FIXED',
        discountValue: 2000,
        minPurchase: 10000,
        isActive: true,
      },
    }),
    prisma.coupon.create({
      data: {
        tenantId: demoTenant.id,
        code: 'BELLEZA20',
        description: '20% en productos seleccionados',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        maxDiscount: 8000,
        usageLimit: 50,
        expiresAt: new Date('2026-06-30'),
        isActive: true,
      },
    }),
    prisma.coupon.create({
      data: {
        tenantId: demoTenant.id,
        code: 'SPADAY',
        description: '$3000 de descuento en Kit Spa en Casa',
        discountType: 'FIXED',
        discountValue: 3000,
        minPurchase: 15000,
        usagePerCustomer: 1,
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Coupons created:', coupons.length);

  // Create/Update Tenant Branding - Colores rosa/violeta
  await prisma.tenantBranding.upsert({
    where: { tenantId: demoTenant.id },
    update: {
      primaryColor: '#ec4899',
      secondaryColor: '#8b5cf6',
      accentColor: '#f472b6',
      backgroundColor: '#ECF6F8',
      textColor: '#1e293b',
      logoUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop',
      coverImageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=400&fit=crop',
      welcomeTitle: 'Bienvenida a Bella Estética',
      welcomeSubtitle: 'Tu centro de belleza y bienestar',
      footerText: '© 2026 Bella Estética. Todos los derechos reservados.',
    },
    create: {
      tenantId: demoTenant.id,
      primaryColor: '#ec4899',
      secondaryColor: '#8b5cf6',
      accentColor: '#f472b6',
      backgroundColor: '#ECF6F8',
      textColor: '#1e293b',
      logoUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop',
      coverImageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=400&fit=crop',
      welcomeTitle: 'Bienvenida a Bella Estética',
      welcomeSubtitle: 'Tu centro de belleza y bienestar',
      footerText: '© 2026 Bella Estética. Todos los derechos reservados.',
      showPrices: true,
      showStock: true,
      enableWishlist: true,
      enableReviews: false,
    },
  });

  console.log('✅ Tenant branding created');

  // ==========================================
  // CREATE SAMPLE ORDERS
  // ==========================================

  // Delete existing orders
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({
    where: { tenantId: demoTenant.id },
  });

  // Sample orders
  const ordersData = [
    {
      orderNumber: 'ORD-2026-001',
      status: 'DELIVERED',
      customerName: 'María García',
      customerEmail: 'maria.garcia@email.com',
      customerPhone: '+5491155551234',
      shippingAddress: JSON.stringify({
        street: 'Av. Libertador 2500',
        city: 'Buenos Aires',
        state: 'CABA',
        zipCode: '1425',
        country: 'Argentina',
      }),
      subtotal: 22300,
      shippingCost: 0,
      discount: 2230,
      total: 20070,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      items: [
        { productId: products[0].id, productName: products[0].name, quantity: 1, unitPrice: 12500, totalPrice: 12500 },
        { productId: products[1].id, productName: products[1].name, quantity: 1, unitPrice: 9800, totalPrice: 9800 },
      ],
    },
    {
      orderNumber: 'ORD-2026-002',
      status: 'SHIPPED',
      customerName: 'Luciana Fernández',
      customerEmail: 'luciana.f@email.com',
      customerPhone: '+5491155552345',
      shippingAddress: JSON.stringify({
        street: 'Calle Posadas 1234',
        city: 'Buenos Aires',
        state: 'CABA',
        zipCode: '1112',
        country: 'Argentina',
      }),
      subtotal: 18500,
      shippingCost: 0,
      discount: 3000,
      total: 15500,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      items: [
        { productId: products[5].id, productName: products[5].name, quantity: 1, unitPrice: 18500, totalPrice: 18500 },
      ],
    },
    {
      orderNumber: 'ORD-2026-003',
      status: 'PROCESSING',
      customerName: 'Valentina López',
      customerEmail: 'vale.lopez@email.com',
      customerPhone: '+5491155553456',
      shippingAddress: JSON.stringify({
        street: 'Av. Santa Fe 3200',
        city: 'Buenos Aires',
        state: 'CABA',
        zipCode: '1425',
        country: 'Argentina',
      }),
      subtotal: 25500,
      shippingCost: 0,
      discount: 5100,
      total: 20400,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      items: [
        { productId: products[6].id, productName: products[6].name, quantity: 1, unitPrice: 11000, totalPrice: 11000 },
        { productId: products[8].id, productName: products[8].name, quantity: 1, unitPrice: 14500, totalPrice: 14500 },
      ],
    },
    {
      orderNumber: 'ORD-2026-004',
      status: 'CONFIRMED',
      customerName: 'Camila Rodríguez',
      customerEmail: 'cami.rod@email.com',
      customerPhone: '+5491155554567',
      shippingAddress: JSON.stringify({
        street: 'Calle Juncal 890',
        city: 'Buenos Aires',
        state: 'CABA',
        zipCode: '1062',
        country: 'Argentina',
      }),
      subtotal: 16000,
      shippingCost: 2000,
      discount: 0,
      total: 18000,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      items: [
        { productId: products[3].id, productName: products[3].name, quantity: 1, unitPrice: 7500, totalPrice: 7500 },
        { productId: products[7].id, productName: products[7].name, quantity: 1, unitPrice: 8500, totalPrice: 8500 },
      ],
    },
    {
      orderNumber: 'ORD-2026-005',
      status: 'PENDING',
      customerName: 'Sofía Martínez',
      customerEmail: 'sofia.m@email.com',
      customerPhone: '+5491155555678',
      shippingAddress: JSON.stringify({
        street: 'Av. Callao 1500',
        city: 'Buenos Aires',
        state: 'CABA',
        zipCode: '1024',
        country: 'Argentina',
      }),
      subtotal: 12500,
      shippingCost: 2000,
      discount: 1875,
      total: 12625,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      items: [
        { productId: products[0].id, productName: products[0].name, quantity: 1, unitPrice: 12500, totalPrice: 12500 },
      ],
    },
  ];

  for (const orderData of ordersData) {
    const { items, ...order } = orderData;

    const createdOrder = await prisma.order.create({
      data: {
        tenantId: demoTenant.id,
        ...order,
      },
    });

    for (const item of items) {
      await prisma.orderItem.create({
        data: {
          orderId: createdOrder.id,
          ...item,
        },
      });
    }
  }

  console.log('✅ Sample orders created:', ordersData.length);

  console.log('\nSeed completed successfully!');
  console.log('\nDemo URL: http://localhost:3000/bella-estetica');
  console.log('\n📦 Sample data created:');
  console.log(`   - ${customers.length} customers`);
  console.log(`   - ${services.length} services`);
  console.log(`   - ${products.length} products with images`);
  console.log(`   - ${categories.length} categories`);
  console.log(`   - ${coupons.length} coupons`);
  console.log(`   - ${ordersData.length} orders`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
