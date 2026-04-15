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
  console.log('\n☕ Seeding Café Origen — Café de Especialidad\n');

  const hashedPassword = await bcrypt.hash(PASSWORD, 12);

  // Find gastronomia-gratis plan
  let plan = await prisma.subscriptionPlan.findUnique({ where: { slug: 'gastronomia-gratis' } });
  if (!plan) {
    plan = await prisma.subscriptionPlan.findUnique({ where: { slug: 'gratis' } });
  }
  if (!plan) {
    console.error('❌ No plan found. Run subscription seed first.');
    return;
  }
  console.log(`  Plan: ${plan.name} (${plan.slug})`);

  // 1. Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'cafe-origen' },
    update: {
      name: 'Café Origen',
      description: 'Café de especialidad, pastelería artesanal y brunch. Granos seleccionados de fincas latinoamericanas, tostados en casa.',
      phone: '+5491155028734',
      address: 'Thames 1885, Palermo Soho',
      city: 'Buenos Aires',
      instagram: '@cafeorigen.ba',
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
      slug: 'cafe-origen',
      name: 'Café Origen',
      description: 'Café de especialidad, pastelería artesanal y brunch. Granos seleccionados de fincas latinoamericanas, tostados en casa.',
      phone: '+5491155028734',
      address: 'Thames 1885, Palermo Soho',
      city: 'Buenos Aires',
      instagram: '@cafeorigen.ba',
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
    where: { email: 'demo-cafe@turnolink.com.ar' },
    update: { name: 'Café Origen', tenantId: tenant.id },
    create: {
      email: 'demo-cafe@turnolink.com.ar',
      password: hashedPassword,
      name: 'Café Origen',
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
      primaryColor: '#78350f',
      secondaryColor: '#92400e',
      accentColor: '#d97706',
      backgroundStyle: 'warm',
      welcomeTitle: 'Café Origen',
      welcomeSubtitle: 'Café de especialidad · Palermo Soho',
      showPrices: true,
    },
    create: {
      tenantId: tenant.id,
      primaryColor: '#78350f',
      secondaryColor: '#92400e',
      accentColor: '#d97706',
      backgroundStyle: 'warm',
      welcomeTitle: 'Café Origen',
      welcomeSubtitle: 'Café de especialidad · Palermo Soho',
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

  // 5. Product Categories (carta del café)
  const categoryDefs = [
    { name: 'Café de Especialidad', slug: 'cafe-de-especialidad', order: 0 },
    { name: 'Infusiones', slug: 'infusiones', order: 1 },
    { name: 'Bebidas Frías', slug: 'bebidas-frias', order: 2 },
    { name: 'Pastelería', slug: 'pasteleria', order: 3 },
    { name: 'Desayunos & Meriendas', slug: 'desayunos-meriendas', order: 4 },
    { name: 'Brunch', slug: 'brunch', order: 5 },
    { name: 'Tostados & Sándwiches', slug: 'tostados-sandwiches', order: 6 },
    { name: 'Ensaladas & Bowls', slug: 'ensaladas-bowls', order: 7 },
    { name: 'Postres', slug: 'postres', order: 8 },
    { name: 'Para Llevar', slug: 'para-llevar', order: 9 },
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

  // 6. Products — precios reales Buenos Aires 2026 (café de especialidad Palermo)
  const products: {
    name: string;
    description?: string;
    price: number;
    category: string;
    order: number;
    attributes?: Record<string, string | boolean>;
    isFeatured?: boolean;
  }[] = [
    // === Café de Especialidad ===
    { name: 'Espresso', description: 'Shot doble de café de especialidad. Origen rotativo.', price: 3200, category: 'cafe-de-especialidad', order: 1, attributes: { seccion: 'Café', origen: 'Colombia / Etiopía / Brasil (rotativo)' } },
    { name: 'Americano', description: 'Espresso doble con agua caliente.', price: 3500, category: 'cafe-de-especialidad', order: 2, attributes: { seccion: 'Café' } },
    { name: 'Cortado', description: 'Espresso con toque de leche vaporizada.', price: 3400, category: 'cafe-de-especialidad', order: 3, attributes: { seccion: 'Café' } },
    { name: 'Flat White', description: 'Espresso doble con leche micro-texturizada. Cuerpo sedoso.', price: 4200, category: 'cafe-de-especialidad', order: 4, attributes: { seccion: 'Café' }, isFeatured: true },
    { name: 'Cappuccino', description: 'Espresso, leche vaporizada y espuma cremosa. Arte latte.', price: 4200, category: 'cafe-de-especialidad', order: 5, attributes: { seccion: 'Café' } },
    { name: 'Latte', description: 'Espresso con leche vaporizada. Suave y cremoso.', price: 4500, category: 'cafe-de-especialidad', order: 6, attributes: { seccion: 'Café' } },
    { name: 'Latte de Vainilla', description: 'Latte con jarabe artesanal de vainilla de Madagascar.', price: 5200, category: 'cafe-de-especialidad', order: 7, attributes: { seccion: 'Café' } },
    { name: 'Mocha', description: 'Espresso, chocolate belga fundido y leche vaporizada. Crema batida.', price: 5500, category: 'cafe-de-especialidad', order: 8, attributes: { seccion: 'Café' } },
    { name: 'V60 Pour Over', description: 'Filtrado manual. Resalta notas frutales y florales del grano. Servido para dos.', price: 5800, category: 'cafe-de-especialidad', order: 9, attributes: { seccion: 'Método', tiempo_prep: '5 min' }, isFeatured: true },
    { name: 'Aeropress', description: 'Método de presión. Cuerpo limpio, sabor concentrado.', price: 5500, category: 'cafe-de-especialidad', order: 10, attributes: { seccion: 'Método', tiempo_prep: '4 min' } },
    { name: 'Chemex', description: 'Filtrado por goteo. Taza cristalina con notas cítricas. Para dos.', price: 6200, category: 'cafe-de-especialidad', order: 11, attributes: { seccion: 'Método', tiempo_prep: '6 min', porciones: 'Para 2' } },
    { name: 'Cold Brew Nitro', description: 'Café extraído en frío 18h, servido con nitrógeno. Textura aterciopelada.', price: 5800, category: 'cafe-de-especialidad', order: 12, attributes: { seccion: 'Café frío' }, isFeatured: true },

    // === Infusiones ===
    { name: 'Té English Breakfast', description: 'Blend clásico de Ceylon y Assam. Con leche opcional.', price: 3800, category: 'infusiones', order: 1, attributes: { seccion: 'Té' } },
    { name: 'Té Earl Grey', description: 'Té negro con bergamota natural.', price: 3800, category: 'infusiones', order: 2, attributes: { seccion: 'Té' } },
    { name: 'Té Verde Sencha', description: 'Té verde japonés. Notas herbáceas, umami suave.', price: 3800, category: 'infusiones', order: 3, attributes: { seccion: 'Té' } },
    { name: 'Chai Latte', description: 'Té negro con especias (canela, cardamomo, jengibre) y leche vaporizada.', price: 4800, category: 'infusiones', order: 4, attributes: { seccion: 'Té' } },
    { name: 'Matcha Latte', description: 'Matcha ceremonial japonés con leche. Caliente o frío.', price: 5500, category: 'infusiones', order: 5, attributes: { seccion: 'Té' }, isFeatured: true },
    { name: 'Infusión de Frutas', description: 'Blend de hibiscus, frutos rojos y manzana. Sin cafeína.', price: 3500, category: 'infusiones', order: 6, attributes: { seccion: 'Infusión', apto_vegano: 'Vegano' } },
    { name: 'Chocolate Caliente', description: 'Chocolate belga fundido con leche. Opción con crema batida.', price: 5200, category: 'infusiones', order: 7, attributes: { seccion: 'Infusión' } },
    { name: 'Golden Milk', description: 'Leche con cúrcuma, canela, jengibre y miel. Antiinflamatorio natural.', price: 4800, category: 'infusiones', order: 8, attributes: { seccion: 'Infusión', apto_vegano: 'Vegano' } },

    // === Bebidas Frías ===
    { name: 'Cold Brew Clásico', description: 'Café extraído en frío durante 18 horas. Suave, bajo en acidez.', price: 4800, category: 'bebidas-frias', order: 1, attributes: { seccion: 'Café frío' } },
    { name: 'Iced Latte', description: 'Espresso doble sobre hielo con leche fría.', price: 4800, category: 'bebidas-frias', order: 2, attributes: { seccion: 'Café frío' } },
    { name: 'Iced Matcha', description: 'Matcha batido con hielo y leche. Refrescante.', price: 5500, category: 'bebidas-frias', order: 3, attributes: { seccion: 'Té frío' } },
    { name: 'Frapuccino de Café', description: 'Café blended con hielo, leche y crema. Toffee o chocolate.', price: 5800, category: 'bebidas-frias', order: 4, attributes: { seccion: 'Blended' } },
    { name: 'Limonada de Jengibre y Menta', description: 'Limonada fresca con jengibre rallado y menta.', price: 4200, category: 'bebidas-frias', order: 5, attributes: { seccion: 'Sin café', apto_vegano: 'Vegano' } },
    { name: 'Smoothie de Frutos Rojos', description: 'Frutillas, arándanos, banana y yogur griego.', price: 5500, category: 'bebidas-frias', order: 6, attributes: { seccion: 'Smoothie' } },
    { name: 'Smoothie Verde Detox', description: 'Espinaca, banana, mango, jengibre y leche de almendra.', price: 5800, category: 'bebidas-frias', order: 7, attributes: { seccion: 'Smoothie', apto_vegano: 'Vegano' } },
    { name: 'Jugo de Naranja Exprimido', description: 'Naranja recién exprimida. 400ml.', price: 4500, category: 'bebidas-frias', order: 8, attributes: { seccion: 'Jugo natural' } },

    // === Pastelería ===
    { name: 'Medialunas de Manteca (x3)', description: 'Medialunas artesanales de manteca, horneadas cada mañana.', price: 4500, category: 'pasteleria', order: 1, attributes: { seccion: 'Pastelería' }, isFeatured: true },
    { name: 'Croissant de Almendras', description: 'Croissant relleno de crema de almendras y láminas tostadas.', price: 4800, category: 'pasteleria', order: 2, attributes: { seccion: 'Pastelería' } },
    { name: 'Pain au Chocolat', description: 'Hojaldre francés con barras de chocolate belga.', price: 4500, category: 'pasteleria', order: 3, attributes: { seccion: 'Pastelería' } },
    { name: 'Budín de Limón y Amapola', description: 'Porción de budín húmedo con glaseado de limón.', price: 4200, category: 'pasteleria', order: 4, attributes: { seccion: 'Pastelería' } },
    { name: 'Muffin de Arándanos', description: 'Muffin artesanal con arándanos frescos y streusel.', price: 4200, category: 'pasteleria', order: 5, attributes: { seccion: 'Pastelería' } },
    { name: 'Scone de Queso', description: 'Scone salado con queso cheddar y ciboulette. Con manteca.', price: 3800, category: 'pasteleria', order: 6, attributes: { seccion: 'Pastelería' } },
    { name: 'Carrot Cake', description: 'Torta de zanahoria con frosting de queso crema.', price: 5500, category: 'pasteleria', order: 7, attributes: { seccion: 'Pastelería' } },
    { name: 'Banana Bread', description: 'Pan de banana con nueces y chips de chocolate.', price: 4500, category: 'pasteleria', order: 8, attributes: { seccion: 'Pastelería', apto_vegano: 'Vegetariano' } },
    { name: 'Alfajor de Maicena Artesanal', description: 'Alfajor de maicena con dulce de leche y coco rallado.', price: 3500, category: 'pasteleria', order: 9, attributes: { seccion: 'Pastelería' } },
    { name: 'Cookie de Chocolate Chunk', description: 'Cookie XXL con trozos de chocolate y sal marina.', price: 4200, category: 'pasteleria', order: 10, attributes: { seccion: 'Pastelería' } },

    // === Desayunos & Meriendas ===
    { name: 'Desayuno Origen', description: 'Café o té + 3 medialunas de manteca + jugo de naranja exprimido.', price: 9500, category: 'desayunos-meriendas', order: 1, isFeatured: true, attributes: { seccion: 'Desayuno', porciones: 'Individual' } },
    { name: 'Desayuno Tostadas', description: 'Café o té + 2 tostadas de masa madre con manteca y mermelada artesanal + jugo.', price: 8500, category: 'desayunos-meriendas', order: 2, attributes: { seccion: 'Desayuno', porciones: 'Individual' } },
    { name: 'Desayuno Saludable', description: 'Matcha latte o té verde + bowl de yogur con granola y frutas.', price: 10500, category: 'desayunos-meriendas', order: 3, attributes: { seccion: 'Desayuno', porciones: 'Individual' } },
    { name: 'Desayuno para Dos', description: '2 cafés o tés + 6 medialunas + 2 jugos + porción de torta a elección.', price: 17500, category: 'desayunos-meriendas', order: 4, attributes: { seccion: 'Desayuno', porciones: 'Para 2' } },
    { name: 'Merienda Completa', description: 'Café o té + scone de queso o pastelería dulce a elección.', price: 7500, category: 'desayunos-meriendas', order: 5, attributes: { seccion: 'Merienda', porciones: 'Individual' } },
    { name: 'Tostadas de Masa Madre con Palta', description: '2 tostadas con palta, tomate cherry, semillas y aceite de oliva.', price: 7200, category: 'desayunos-meriendas', order: 6, attributes: { seccion: 'Desayuno', apto_vegano: 'Vegano' } },
    { name: 'Yogur con Granola y Frutas', description: 'Yogur griego con granola casera, miel y frutas de estación.', price: 6200, category: 'desayunos-meriendas', order: 7, attributes: { seccion: 'Desayuno' } },
    { name: 'Avena Overnight', description: 'Avena remojada con leche de almendra, chía, banana y manteca de maní.', price: 5800, category: 'desayunos-meriendas', order: 8, attributes: { seccion: 'Desayuno', apto_vegano: 'Vegano' } },

    // === Brunch ===
    { name: 'Eggs Benedict', description: 'Muffin inglés, jamón cocido, huevos poché y hollandaise. Con ensalada.', price: 11500, category: 'brunch', order: 1, isFeatured: true, attributes: { seccion: 'Brunch' } },
    { name: 'Avocado Toast Premium', description: 'Pan de masa madre, palta, huevo poché, salmón ahumado, semillas y microgreens.', price: 12800, category: 'brunch', order: 2, attributes: { seccion: 'Brunch' }, isFeatured: true },
    { name: 'Tostado Francés', description: 'Brioche caramelizado con frutos rojos, crema y miel. Dulzura justa.', price: 9800, category: 'brunch', order: 3, attributes: { seccion: 'Brunch' } },
    { name: 'Shakshuka', description: 'Huevos pochados en salsa de tomate especiada con feta y pan de masa madre.', price: 10500, category: 'brunch', order: 4, attributes: { seccion: 'Brunch' } },
    { name: 'Pancakes de Ricota', description: 'Stack de 3 pancakes esponjosos de ricota con maple, banana y nueces.', price: 9500, category: 'brunch', order: 5, attributes: { seccion: 'Brunch' } },
    { name: 'Omelette de Hongos y Brie', description: 'Omelette relleno de hongos salteados, brie fundido y rúcula.', price: 9800, category: 'brunch', order: 6, attributes: { seccion: 'Brunch' } },
    { name: 'Waffle Salado', description: 'Waffle con salmón ahumado, queso crema, alcaparras y ciboulette.', price: 11200, category: 'brunch', order: 7, attributes: { seccion: 'Brunch' } },
    { name: 'Bowl Acai', description: 'Açaí, banana, granola, coco rallado, frutas y miel.', price: 9200, category: 'brunch', order: 8, attributes: { seccion: 'Brunch', apto_vegano: 'Vegano' } },

    // === Tostados & Sándwiches ===
    { name: 'Tostado de Jamón y Queso', description: 'Pan de masa madre, jamón cocido y queso gruyère fundido.', price: 6500, category: 'tostados-sandwiches', order: 1, attributes: { seccion: 'Tostado' } },
    { name: 'Tostado Caprese', description: 'Pan ciabatta, mozzarella fresca, tomate, albahaca y pesto.', price: 7200, category: 'tostados-sandwiches', order: 2, attributes: { seccion: 'Tostado', apto_vegano: 'Vegetariano' } },
    { name: 'Croque Monsieur', description: 'Clásico francés: jamón, gruyère fundido y bechamel gratinada.', price: 8200, category: 'tostados-sandwiches', order: 3, attributes: { seccion: 'Tostado' } },
    { name: 'Sándwich de Salmón Ahumado', description: 'Pan de centeno, salmón ahumado, queso crema, cebolla morada y alcaparras.', price: 10500, category: 'tostados-sandwiches', order: 4, attributes: { seccion: 'Sándwich' } },
    { name: 'Club Sándwich', description: 'Triple: pollo grillé, panceta, huevo, lechuga, tomate y mayonesa.', price: 9500, category: 'tostados-sandwiches', order: 5, attributes: { seccion: 'Sándwich' } },
    { name: 'Wrap Veggie', description: 'Tortilla integral con hummus, palta, zanahoria, pepino y rúcula.', price: 7800, category: 'tostados-sandwiches', order: 6, attributes: { seccion: 'Sándwich', apto_vegano: 'Vegano' } },
    { name: 'Bagel con Queso Crema y Salmón', description: 'Bagel artesanal con queso crema, salmón ahumado y eneldo.', price: 9800, category: 'tostados-sandwiches', order: 7, attributes: { seccion: 'Sándwich' } },

    // === Ensaladas & Bowls ===
    { name: 'Ensalada Origen', description: 'Mix de verdes, pollo grillé, palta, tomate cherry, huevo y vinagreta de mostaza.', price: 9800, category: 'ensaladas-bowls', order: 1, attributes: { seccion: 'Ensalada' } },
    { name: 'Ensalada de Salmón y Palta', description: 'Mix de verdes, salmón ahumado, palta, pepino, edamame y dressing de sésamo.', price: 12500, category: 'ensaladas-bowls', order: 2, attributes: { seccion: 'Ensalada' } },
    { name: 'Bowl Mediterráneo', description: 'Quinoa, falafel casero, hummus, tabulé, pepino y salsa tahini.', price: 10200, category: 'ensaladas-bowls', order: 3, attributes: { seccion: 'Bowl', apto_vegano: 'Vegano' } },
    { name: 'Poke Bowl de Salmón', description: 'Arroz de sushi, salmón fresco, palta, edamame, mango y salsa ponzu.', price: 13500, category: 'ensaladas-bowls', order: 4, attributes: { seccion: 'Bowl' }, isFeatured: true },
    { name: 'Bowl de Pollo Teriyaki', description: 'Arroz, pollo teriyaki, palta, zanahoria encurtida y sésamo.', price: 11200, category: 'ensaladas-bowls', order: 5, attributes: { seccion: 'Bowl' } },
    { name: 'Ensalada Caesar', description: 'Lechuga romana, pollo grillé, croutons de masa madre, parmesano y aderezo Caesar.', price: 9200, category: 'ensaladas-bowls', order: 6, attributes: { seccion: 'Ensalada' } },

    // === Postres ===
    { name: 'Tiramisú', description: 'Tiramisú clásico con café de especialidad y mascarpone.', price: 7200, category: 'postres', order: 1, attributes: { seccion: 'Postre' } },
    { name: 'Cheesecake de Frutos Rojos', description: 'Cheesecake New York con coulis de frutos rojos.', price: 7500, category: 'postres', order: 2, attributes: { seccion: 'Postre' } },
    { name: 'Brownie Tibio con Helado', description: 'Brownie de chocolate 70% con helado de vainilla y salsa de chocolate.', price: 7800, category: 'postres', order: 3, attributes: { seccion: 'Postre' }, isFeatured: true },
    { name: 'Crème Brûlée', description: 'Crema de vainilla con costra de caramelo.', price: 6800, category: 'postres', order: 4, attributes: { seccion: 'Postre' } },
    { name: 'Affogato', description: 'Helado de vainilla ahogado en espresso doble.', price: 5800, category: 'postres', order: 5, attributes: { seccion: 'Postre' } },
    { name: 'Tarta de Manzana Tibia', description: 'Tarta de manzana con canela, servida tibia con crema.', price: 6500, category: 'postres', order: 6, attributes: { seccion: 'Postre' } },

    // === Para Llevar ===
    { name: 'Café en Grano 250g', description: 'Blend de la casa. Notas de chocolate, caramelo y cítricos. Tueste medio.', price: 9800, category: 'para-llevar', order: 1, attributes: { seccion: 'Granos', origen: 'Colombia & Brasil' } },
    { name: 'Café en Grano 1kg', description: 'Blend de la casa en formato kilo. Ideal para oficinas.', price: 33000, category: 'para-llevar', order: 2, attributes: { seccion: 'Granos', origen: 'Colombia & Brasil' } },
    { name: 'Café Single Origin 250g', description: 'Origen único rotativo. Geisha, Bourbon o Caturra. Tueste claro.', price: 13500, category: 'para-llevar', order: 3, attributes: { seccion: 'Granos', origen: 'Rotativo' } },
    { name: 'Granola Artesanal 400g', description: 'Avena, miel, almendras, nueces, coco y arándanos.', price: 7500, category: 'para-llevar', order: 4, attributes: { seccion: 'Despensa' } },
    { name: 'Mermelada Artesanal', description: 'Frasco 300g. Frutos rojos, durazno o naranja amarga.', price: 5200, category: 'para-llevar', order: 5, attributes: { seccion: 'Despensa' } },
    { name: 'Alfajores Artesanales (x6)', description: 'Caja de 6 alfajores de maicena con dulce de leche.', price: 9800, category: 'para-llevar', order: 6, attributes: { seccion: 'Despensa' } },
  ];

  let productCount = 0;
  for (const p of products) {
    const productSlug = slugify(p.name);

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

  // 7. Mesas (services for table reservations)
  let mesasCat = await prisma.serviceCategory.findFirst({
    where: { tenantId: tenant.id, name: 'Mesas' },
  });
  if (!mesasCat) {
    mesasCat = await prisma.serviceCategory.create({
      data: { tenantId: tenant.id, name: 'Mesas', order: 0 },
    });
  }

  const mesas = [
    { name: 'Mesa para 2', description: 'Mesa interior junto a ventanal.', duration: 90, price: 0, order: 1 },
    { name: 'Mesa para 4', description: 'Mesa interior o vereda.', duration: 90, price: 0, order: 2 },
    { name: 'Barra', description: 'Asiento en barra frente al barista.', duration: 60, price: 0, order: 3 },
    { name: 'Mesa grupal (6+)', description: 'Mesa grande para grupos.', duration: 120, price: 0, order: 4 },
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

  // 8. Schedule (Lunes a Sábado 8:00-20:00, Domingo 9:00-18:00)
  const weekdays = [1, 2, 3, 4, 5, 6]; // Mon-Sat
  for (const dayOfWeek of weekdays) {
    await prisma.schedule.upsert({
      where: { tenantId_dayOfWeek: { tenantId: tenant.id, dayOfWeek } },
      update: { startTime: '08:00', endTime: '20:00', isActive: true },
      create: { tenantId: tenant.id, dayOfWeek, startTime: '08:00', endTime: '20:00', isActive: true },
    });
  }
  // Sunday
  await prisma.schedule.upsert({
    where: { tenantId_dayOfWeek: { tenantId: tenant.id, dayOfWeek: 0 } },
    update: { startTime: '09:00', endTime: '18:00', isActive: true },
    create: { tenantId: tenant.id, dayOfWeek: 0, startTime: '09:00', endTime: '18:00', isActive: true },
  });
  console.log(`  ✅ Schedule: Mon-Sat 08:00-20:00, Sun 09:00-18:00`);

  console.log('\n✅ Café Origen seeded successfully!');
  console.log(`   🔗 https://turnolink.com.ar/cafe-origen`);
  console.log(`   📧 demo-cafe@turnolink.com.ar`);
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
