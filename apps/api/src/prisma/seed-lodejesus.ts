import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PASSWORD = 'demo123456';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('\n🍽️  Seeding Lo de Jesús — Restaurante Gastronómico\n');

  const hashedPassword = await bcrypt.hash(PASSWORD, 12);

  // Find gastronomia-gratis plan
  let plan = await prisma.subscriptionPlan.findUnique({ where: { slug: 'gastronomia-gratis' } });
  if (!plan) {
    // Fallback to generic gratis
    plan = await prisma.subscriptionPlan.findUnique({ where: { slug: 'gratis' } });
  }
  if (!plan) {
    console.error('❌ No plan found. Run subscription seed first.');
    return;
  }
  console.log(`  Plan: ${plan.name} (${plan.slug})`);

  // 1. Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'lo-de-jesus' },
    update: {
      name: 'Lo de Jesús',
      description: 'Restaurante de comida casera y parrilla en Caballito. Delivery, take away y salón.',
      phone: '+5491132719114',
      address: 'El Maestro 39, Caballito',
      city: 'Buenos Aires',
      instagram: '@lodejesusdelivery',
      settings: JSON.stringify({
        timezone: 'America/Argentina/Buenos_Aires',
        currency: 'ARS',
        language: 'es',
        rubro: 'gastronomia',
        layout: 'service_first',
        showPrices: true,
        requirePhone: true,
        requireEmail: false,
        clientLabelSingular: 'Comensal',
        clientLabelPlural: 'Comensales',
        enabledFichas: ['datosPersonales', 'notasSeguimiento'],
        hiddenSections: ['/especialidades', '/formularios', '/sucursales', '/videollamadas'],
      }),
    },
    create: {
      slug: 'lo-de-jesus',
      name: 'Lo de Jesús',
      description: 'Restaurante de comida casera y parrilla en Caballito. Delivery, take away y salón.',
      phone: '+5491132719114',
      address: 'El Maestro 39, Caballito',
      city: 'Buenos Aires',
      instagram: '@lodejesusdelivery',
      status: 'ACTIVE',
      settings: JSON.stringify({
        timezone: 'America/Argentina/Buenos_Aires',
        currency: 'ARS',
        language: 'es',
        rubro: 'gastronomia',
        layout: 'service_first',
        showPrices: true,
        requirePhone: true,
        requireEmail: false,
        clientLabelSingular: 'Comensal',
        clientLabelPlural: 'Comensales',
        enabledFichas: ['datosPersonales', 'notasSeguimiento'],
        hiddenSections: ['/especialidades', '/formularios', '/sucursales', '/videollamadas'],
      }),
    },
  });
  console.log(`  ✅ Tenant: ${tenant.id}`);

  // 2. Owner
  const owner = await prisma.user.upsert({
    where: { email: 'demo-lodejesus@turnolink.com.ar' },
    update: { name: 'Lo de Jesús', tenantId: tenant.id },
    create: {
      email: 'demo-lodejesus@turnolink.com.ar',
      password: hashedPassword,
      name: 'Lo de Jesús',
      role: 'OWNER',
      tenantId: tenant.id,
      isActive: true,
      emailVerified: true,
    },
  });
  console.log(`  ✅ Owner: ${owner.email}`);

  // 3. Branding
  await prisma.tenantBranding.upsert({
    where: { tenantId: tenant.id },
    update: {
      primaryColor: '#b91c1c',
      secondaryColor: '#dc2626',
      accentColor: '#f59e0b',
      backgroundStyle: 'warm',
      welcomeTitle: 'Lo de Jesús',
      welcomeSubtitle: 'Comida casera y parrilla — Caballito',
      showPrices: true,
    },
    create: {
      tenantId: tenant.id,
      primaryColor: '#b91c1c',
      secondaryColor: '#dc2626',
      accentColor: '#f59e0b',
      backgroundStyle: 'warm',
      welcomeTitle: 'Lo de Jesús',
      welcomeSubtitle: 'Comida casera y parrilla — Caballito',
      showPrices: true,
    },
  });
  console.log(`  ✅ Branding`);

  // 4. Subscription
  const existingSub = await prisma.subscription.findUnique({ where: { tenantId: tenant.id } });
  if (!existingSub) {
    await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        planId: plan.id,
        status: 'ACTIVE',
        billingPeriod: 'MONTHLY',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log(`  ✅ Subscription`);

  // 5. Product Categories (menu sections)
  const categoryDefs = [
    { name: 'Descuentos', slug: 'descuentos', order: 0 },
    { name: 'Productos de Verano', slug: 'productos-de-verano', order: 1 },
    { name: 'Entradas', slug: 'entradas', order: 2 },
    { name: 'Combos', slug: 'combos', order: 3 },
    { name: 'Los Elegidos del Chef', slug: 'elegidos-del-chef', order: 4 },
    { name: 'Minutas', slug: 'minutas', order: 5 },
    { name: 'Sándwiches', slug: 'sandwiches', order: 6 },
    { name: 'Pastas', slug: 'pastas', order: 7 },
    { name: 'Parrilla', slug: 'parrilla', order: 8 },
    { name: 'Ensaladas', slug: 'ensaladas', order: 9 },
    { name: 'Acompañamientos', slug: 'acompanamientos', order: 10 },
    { name: 'Postres', slug: 'postres', order: 11 },
    { name: 'Bebidas', slug: 'bebidas', order: 12 },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoryDefs) {
    const created = await prisma.productCategory.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: cat.slug } },
      update: { name: cat.name, order: cat.order },
      create: {
        tenantId: tenant.id,
        name: cat.name,
        slug: cat.slug,
        order: cat.order,
        isActive: true,
      },
    });
    categories[cat.slug] = created.id;
  }
  console.log(`  ✅ Categories: ${Object.keys(categories).length}`);

  // 6. Products (full menu from Lo de Jesús — Caballito)
  const products: {
    name: string;
    description?: string;
    price: number;
    category: string;
    order: number;
    attributes?: Record<string, string | boolean>;
    isFeatured?: boolean;
  }[] = [
    // === Descuentos ===
    { name: 'Suprema napolitana con papas fritas', description: 'Suprema de pollo con jamón, muzza y salsa. Acompañada de papas fritas.', price: 8990, category: 'descuentos', order: 1, isFeatured: true },
    { name: 'Milanesa de carne con papas fritas', description: 'Milanesa de carne con guarnición de papas fritas.', price: 8990, category: 'descuentos', order: 2, isFeatured: true },
    { name: 'Hamburguesa completa con papas fritas', description: 'Hamburguesa casera completa con papas fritas.', price: 7490, category: 'descuentos', order: 3, isFeatured: true },
    { name: 'Pizza muzzarella grande', description: 'Pizza de muzzarella, 8 porciones.', price: 7990, category: 'descuentos', order: 4, isFeatured: true },

    // === Productos de Verano ===
    { name: 'Ensalada Caesar con pollo grillé', description: 'Lechuga, pollo grillé, croutons, parmesano y aderezo Caesar.', price: 7990, category: 'productos-de-verano', order: 1 },
    { name: 'Wrap de pollo', description: 'Tortilla de trigo con pollo, verduras frescas y aderezo.', price: 6990, category: 'productos-de-verano', order: 2 },
    { name: 'Licuado de frutas', description: 'Licuado de frutas de estación con leche o agua.', price: 3500, category: 'productos-de-verano', order: 3 },

    // === Entradas ===
    { name: 'Empanadas (x unidad)', description: 'Carne, pollo, jamón y queso, humita o verdura.', price: 1500, category: 'entradas', order: 1, attributes: { seccion: 'Entrada' } },
    { name: 'Docena de empanadas', description: '12 empanadas surtidas a elección.', price: 15000, category: 'entradas', order: 2, attributes: { seccion: 'Entrada', porciones: 'Para compartir' } },
    { name: 'Provoleta', description: 'Provolone fundido con orégano y tomate.', price: 6500, category: 'entradas', order: 3, attributes: { seccion: 'Entrada' } },
    { name: 'Tabla de fiambres y quesos', description: 'Selección de fiambres, quesos, aceitunas y grisines.', price: 12000, category: 'entradas', order: 4, attributes: { seccion: 'Entrada', porciones: 'Para compartir' } },
    { name: 'Papas fritas', description: 'Porción de papas fritas.', price: 4500, category: 'entradas', order: 5 },
    { name: 'Bastones de muzzarella', description: 'Bastones de muzzarella rebozados con salsa de tomate.', price: 5500, category: 'entradas', order: 6, attributes: { seccion: 'Entrada' } },

    // === Combos ===
    { name: 'Combo Milanesa + Bebida', description: 'Milanesa con papas fritas + bebida a elección.', price: 10490, category: 'combos', order: 1 },
    { name: 'Combo Hamburguesa + Bebida', description: 'Hamburguesa completa con papas fritas + bebida.', price: 8990, category: 'combos', order: 2 },
    { name: 'Combo Pizza + Fainá + Bebida', description: 'Pizza muzzarella grande + fainá + bebida 1.5L.', price: 10990, category: 'combos', order: 3 },
    { name: 'Combo Parrilla para 2', description: 'Vacío, chorizo, morcilla, ensalada mixta y papas + 2 bebidas.', price: 18990, category: 'combos', order: 4, attributes: { seccion: 'Principal', porciones: 'Para 2' } },

    // === Los Elegidos del Chef ===
    { name: 'Bife de chorizo a la criolla', description: 'Bife de chorizo con salsa criolla, papas rústicas.', price: 12500, category: 'elegidos-del-chef', order: 1, attributes: { seccion: 'Principal' } },
    { name: 'Pollo al verdeo', description: 'Pechuga de pollo grillé con salsa de verdeo y puré.', price: 9900, category: 'elegidos-del-chef', order: 2, attributes: { seccion: 'Principal' } },
    { name: 'Sorrentinos de jamón y queso', description: 'Sorrentinos caseros con salsa rosa.', price: 8900, category: 'elegidos-del-chef', order: 3, attributes: { seccion: 'Principal' } },
    { name: 'Entraña a la parrilla', description: 'Entraña con chimichurri, ensalada rúcula y parmesano.', price: 13500, category: 'elegidos-del-chef', order: 4, attributes: { seccion: 'Principal' } },

    // === Minutas ===
    { name: 'Milanesa de carne', description: 'Milanesa de carne casera.', price: 7500, category: 'minutas', order: 1, attributes: { seccion: 'Principal' } },
    { name: 'Milanesa napolitana', description: 'Milanesa con jamón, muzzarella y salsa de tomate.', price: 8500, category: 'minutas', order: 2, attributes: { seccion: 'Principal' } },
    { name: 'Suprema de pollo', description: 'Suprema de pollo rebozada.', price: 7500, category: 'minutas', order: 3, attributes: { seccion: 'Principal' } },
    { name: 'Suprema napolitana', description: 'Suprema con jamón, muzza y salsa.', price: 8500, category: 'minutas', order: 4, attributes: { seccion: 'Principal' } },
    { name: 'Tortilla de papas', description: 'Tortilla española de papas y cebolla.', price: 6500, category: 'minutas', order: 5 },
    { name: 'Omelette de jamón y queso', description: 'Omelette relleno de jamón y queso fundido.', price: 5500, category: 'minutas', order: 6 },
    { name: 'Tarta de jamón y queso', description: 'Porción de tarta de jamón y queso.', price: 5000, category: 'minutas', order: 7 },
    { name: 'Tarta de verdura', description: 'Porción de tarta de verdura.', price: 5000, category: 'minutas', order: 8, attributes: { apto_vegano: 'Vegetariano' } },

    // === Sándwiches ===
    { name: 'Sándwich de milanesa', description: 'Milanesa de carne en pan francés con lechuga y tomate.', price: 6500, category: 'sandwiches', order: 1 },
    { name: 'Sándwich de milanesa completo', description: 'Milanesa, jamón, queso, lechuga, tomate, huevo.', price: 7500, category: 'sandwiches', order: 2 },
    { name: 'Hamburguesa casera', description: 'Medallón de carne 200g, lechuga, tomate.', price: 6000, category: 'sandwiches', order: 3 },
    { name: 'Hamburguesa completa', description: 'Medallón, jamón, queso, lechuga, tomate, huevo, panceta.', price: 7500, category: 'sandwiches', order: 4 },
    { name: 'Lomito completo', description: 'Lomo, jamón, queso, lechuga, tomate, huevo.', price: 8500, category: 'sandwiches', order: 5 },
    { name: 'Sándwich de bondiola', description: 'Bondiola braseada con chimichurri en pan ciabatta.', price: 7000, category: 'sandwiches', order: 6 },

    // === Pastas ===
    { name: 'Fideos con tuco', description: 'Fideos caseros con salsa de tomate casera.', price: 6500, category: 'pastas', order: 1, attributes: { seccion: 'Principal' } },
    { name: 'Fideos con bolognesa', description: 'Fideos con salsa bolognesa de carne.', price: 7500, category: 'pastas', order: 2, attributes: { seccion: 'Principal' } },
    { name: 'Ñoquis con tuco', description: 'Ñoquis de papa caseros con salsa de tomate.', price: 7000, category: 'pastas', order: 3, attributes: { seccion: 'Principal' } },
    { name: 'Ravioles de ricota', description: 'Ravioles caseros de ricota y nuez con salsa rosa.', price: 8000, category: 'pastas', order: 4, attributes: { seccion: 'Principal' } },
    { name: 'Lasagna de carne', description: 'Lasagna con carne, bechamel y muzzarella gratinada.', price: 9000, category: 'pastas', order: 5, attributes: { seccion: 'Principal' } },
    { name: 'Canelones de verdura', description: 'Canelones rellenos de ricota y verdura con salsa blanca.', price: 8000, category: 'pastas', order: 6, attributes: { seccion: 'Principal', apto_vegano: 'Vegetariano' } },

    // === Parrilla ===
    { name: 'Asado de tira', description: 'Asado de tira a la parrilla.', price: 11000, category: 'parrilla', order: 1, attributes: { seccion: 'Principal', tiempo_prep: '45 min' } },
    { name: 'Vacío', description: 'Vacío a la parrilla con chimichurri.', price: 12000, category: 'parrilla', order: 2, attributes: { seccion: 'Principal', tiempo_prep: '45 min' } },
    { name: 'Entraña', description: 'Entraña a la parrilla.', price: 13000, category: 'parrilla', order: 3, attributes: { seccion: 'Principal', tiempo_prep: '30 min' } },
    { name: 'Bife de chorizo', description: 'Bife de chorizo a la parrilla.', price: 12500, category: 'parrilla', order: 4, attributes: { seccion: 'Principal', tiempo_prep: '30 min' } },
    { name: 'Bife de lomo', description: 'Bife de lomo a la parrilla.', price: 14000, category: 'parrilla', order: 5, attributes: { seccion: 'Principal', tiempo_prep: '30 min' } },
    { name: 'Pollo a la parrilla', description: 'Medio pollo a la parrilla.', price: 8000, category: 'parrilla', order: 6, attributes: { seccion: 'Principal', tiempo_prep: '45 min' } },
    { name: 'Choripán', description: 'Chorizo criollo en pan francés con chimichurri.', price: 4500, category: 'parrilla', order: 7 },
    { name: 'Parrillada para 2', description: 'Asado, vacío, chorizo, morcilla, chinchulín, ensalada y papas.', price: 22000, category: 'parrilla', order: 8, attributes: { seccion: 'Principal', porciones: 'Para 2', tiempo_prep: '45 min' } },

    // === Ensaladas ===
    { name: 'Ensalada mixta', description: 'Lechuga, tomate, cebolla y zanahoria.', price: 4500, category: 'ensaladas', order: 1, attributes: { apto_vegano: 'Vegano', apto_celiaco: true } },
    { name: 'Ensalada Caesar', description: 'Lechuga, croutons, parmesano, aderezo Caesar.', price: 6500, category: 'ensaladas', order: 2 },
    { name: 'Ensalada rúcula y parmesano', description: 'Rúcula, parmesano, tomates cherry y aceto.', price: 6000, category: 'ensaladas', order: 3, attributes: { apto_celiaco: true } },
    { name: 'Ensalada completa', description: 'Lechuga, tomate, huevo, choclo, zanahoria, atún.', price: 7000, category: 'ensaladas', order: 4 },

    // === Acompañamientos ===
    { name: 'Papas fritas (porción)', description: 'Porción de papas fritas.', price: 4500, category: 'acompanamientos', order: 1, attributes: { seccion: 'Guarnición' } },
    { name: 'Puré de papas', description: 'Puré de papas casero.', price: 3500, category: 'acompanamientos', order: 2, attributes: { seccion: 'Guarnición' } },
    { name: 'Papas rústicas', description: 'Papas al horno con hierbas.', price: 4500, category: 'acompanamientos', order: 3, attributes: { seccion: 'Guarnición' } },
    { name: 'Ensalada del día', description: 'Ensalada de estación.', price: 3500, category: 'acompanamientos', order: 4, attributes: { seccion: 'Guarnición', apto_vegano: 'Vegano' } },
    { name: 'Fainá', description: 'Porción de fainá.', price: 2500, category: 'acompanamientos', order: 5, attributes: { apto_vegano: 'Vegano', apto_celiaco: true } },

    // === Postres ===
    { name: 'Flan casero', description: 'Flan casero con dulce de leche y crema.', price: 4500, category: 'postres', order: 1, attributes: { seccion: 'Postre' } },
    { name: 'Tiramisú', description: 'Tiramisú casero.', price: 5500, category: 'postres', order: 2, attributes: { seccion: 'Postre' } },
    { name: 'Panqueques con dulce de leche', description: 'Panqueques caseros con dulce de leche.', price: 4500, category: 'postres', order: 3, attributes: { seccion: 'Postre' } },
    { name: 'Ensalada de frutas', description: 'Frutas de estación.', price: 4000, category: 'postres', order: 4, attributes: { seccion: 'Postre', apto_vegano: 'Vegano', apto_celiaco: true } },
    { name: 'Brownie con helado', description: 'Brownie de chocolate con helado de crema.', price: 5500, category: 'postres', order: 5, attributes: { seccion: 'Postre' } },

    // === Bebidas ===
    { name: 'Agua mineral 500ml', price: 1500, category: 'bebidas', order: 1, attributes: { seccion: 'Bebida' } },
    { name: 'Agua mineral 1.5L', price: 2500, category: 'bebidas', order: 2, attributes: { seccion: 'Bebida' } },
    { name: 'Gaseosa línea Coca-Cola 500ml', description: 'Coca-Cola, Sprite, Fanta.', price: 2500, category: 'bebidas', order: 3, attributes: { seccion: 'Bebida' } },
    { name: 'Gaseosa línea Coca-Cola 1.5L', description: 'Coca-Cola, Sprite, Fanta.', price: 4000, category: 'bebidas', order: 4, attributes: { seccion: 'Bebida' } },
    { name: 'Cerveza Quilmes 1L', price: 4500, category: 'bebidas', order: 5, attributes: { seccion: 'Bebida' } },
    { name: 'Cerveza artesanal pinta', description: 'Consultar variedades disponibles.', price: 4000, category: 'bebidas', order: 6, attributes: { seccion: 'Bebida' } },
    { name: 'Vino de la casa', description: 'Tinto o blanco, botella 750ml.', price: 7000, category: 'bebidas', order: 7, attributes: { seccion: 'Bebida' } },
    { name: 'Café', price: 2000, category: 'bebidas', order: 8, attributes: { seccion: 'Bebida' } },
    { name: 'Cortado', price: 2200, category: 'bebidas', order: 9, attributes: { seccion: 'Bebida' } },
    { name: 'Café con leche', price: 2500, category: 'bebidas', order: 10, attributes: { seccion: 'Bebida' } },
  ];

  let productCount = 0;
  for (const p of products) {
    const productSlug = slugify(p.name);

    // Build attributes array in ficha técnica format
    const attrs = p.attributes
      ? Object.entries(p.attributes).map(([key, value]) => ({
          key,
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
          value: typeof value === 'boolean' ? value : String(value),
          type: typeof value === 'boolean' ? 'boolean' : 'select',
        }))
      : null;

    await prisma.product.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: productSlug } },
      update: {
        name: p.name,
        description: p.description || null,
        price: p.price,
        categoryId: categories[p.category],
        order: p.order,
        isActive: true,
        isFeatured: p.isFeatured || false,
        trackInventory: false,
        attributes: attrs ?? undefined,
      },
      create: {
        tenantId: tenant.id,
        name: p.name,
        slug: productSlug,
        description: p.description || null,
        price: p.price,
        categoryId: categories[p.category],
        order: p.order,
        isActive: true,
        isFeatured: p.isFeatured || false,
        trackInventory: false,
        stock: 0,
        type: 'PHYSICAL',
        attributes: attrs ?? undefined,
      },
    });
    productCount++;
  }
  console.log(`  ✅ Products: ${productCount}`);

  // 7. A few sample mesas (services for reservations)
  let mesasCat = await prisma.serviceCategory.findFirst({
    where: { tenantId: tenant.id, name: 'Mesas' },
  });
  if (!mesasCat) {
    mesasCat = await prisma.serviceCategory.create({
      data: { tenantId: tenant.id, name: 'Mesas', order: 0 },
    });
  }

  const mesas = [
    { name: 'Mesa para 2', description: 'Mesa interior para 2 personas.', duration: 90, price: 0, order: 1 },
    { name: 'Mesa para 4', description: 'Mesa interior para 4 personas.', duration: 90, price: 0, order: 2 },
    { name: 'Mesa para 6', description: 'Mesa para 6 personas.', duration: 120, price: 0, order: 3 },
    { name: 'Mesa grupal (8+)', description: 'Mesa grande para grupos de 8 o más.', duration: 150, price: 0, order: 4 },
  ];

  for (const mesa of mesas) {
    const existing = await prisma.service.findFirst({
      where: { tenantId: tenant.id, name: mesa.name },
    });
    if (!existing) {
      await prisma.service.create({
        data: {
          tenantId: tenant.id,
          categoryId: mesasCat.id,
          name: mesa.name,
          description: mesa.description,
          duration: mesa.duration,
          price: mesa.price,
          order: mesa.order,
          isActive: true,
        },
      });
    }
  }
  console.log(`  ✅ Mesas (services): ${mesas.length}`);

  // 8. Schedule (Martes a Domingo, 12:00-00:00 — lunch + dinner)
  const days = [2, 3, 4, 5, 6, 0]; // Tue-Sun (closed Monday)
  for (const dayOfWeek of days) {
    await prisma.schedule.upsert({
      where: { tenantId_dayOfWeek: { tenantId: tenant.id, dayOfWeek } },
      update: { startTime: '12:00', endTime: '00:00', isActive: true },
      create: { tenantId: tenant.id, dayOfWeek, startTime: '12:00', endTime: '00:00', isActive: true },
    });
  }
  // Monday = closed
  await prisma.schedule.upsert({
    where: { tenantId_dayOfWeek: { tenantId: tenant.id, dayOfWeek: 1 } },
    update: { startTime: '00:00', endTime: '00:00', isActive: false },
    create: { tenantId: tenant.id, dayOfWeek: 1, startTime: '00:00', endTime: '00:00', isActive: false },
  });
  console.log(`  ✅ Schedule: Tue-Sun 12:00-00:00 (Mon closed)`);

  console.log('\n✅ Lo de Jesús seeded successfully!');
  console.log(`   🔗 https://turnolink.com.ar/lo-de-jesus`);
  console.log(`   📧 demo-lodejesus@turnolink.com.ar`);
  console.log(`   🔑 ${PASSWORD}\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
