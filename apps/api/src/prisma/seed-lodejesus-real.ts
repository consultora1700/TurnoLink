import { PrismaClient } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharp = require('sharp');
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs/promises';

const prisma = new PrismaClient();

const API_URL = process.env.API_URL || 'https://api.turnolink.com.ar';
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parsePrice(priceStr: string): number {
  // "$34.900" → 34900
  return parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 0;
}

async function downloadAndProcess(imageUrl: string, tenantId: string, folder: string): Promise<{ url: string; thumbnailUrl: string; filename: string; size: number } | null> {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      console.log(`    ⚠️  Failed to download: ${imageUrl} (${res.status})`);
      return null;
    }
    const buffer = Buffer.from(await res.arrayBuffer());

    const uuid = uuidv4();
    const folderPath = path.join(UPLOAD_DIR, tenantId, folder);
    await fs.mkdir(folderPath, { recursive: true });

    // Process with Sharp: WebP main + thumbnail (same as media.service.ts)
    await Promise.all([
      sharp(buffer)
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(path.join(folderPath, `${uuid}.webp`)),
      sharp(buffer)
        .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 75 })
        .toFile(path.join(folderPath, `${uuid}-thumb.webp`)),
    ]);

    const stats = await fs.stat(path.join(folderPath, `${uuid}.webp`));
    const urlBase = `${API_URL}/uploads/${tenantId}/${folder}`;

    return {
      url: `${urlBase}/${uuid}.webp`,
      thumbnailUrl: `${urlBase}/${uuid}-thumb.webp`,
      filename: `${uuid}.webp`,
      size: stats.size,
    };
  } catch (err: any) {
    console.log(`    ⚠️  Error processing: ${imageUrl} — ${err.message}`);
    return null;
  }
}

// ======== REAL MENU DATA FROM TUCÁN ========

interface MenuItem {
  name: string;
  description: string;
  price: string;
  tags: string[];
  category: string;
  imageUrl: string;
}

const CATEGORIES_ORDER = [
  'Descuentos increíbles',
  'Nuevos productos de verano',
  'Entradas',
  'Combos',
  'Los Elegidos del Chef',
  'Minutas',
  'Sándwiches',
  'Pastas',
  'Parrilla',
  'Ensaladas',
  'Acompañamientos',
  'Postres',
  'Bebidas',
];

const REAL_MENU: MenuItem[] = [
  // === Descuentos increíbles ===
  { name: 'Combo Tapeo', description: '5 Buñuelos de acelga, 3 empanaditas de jamón y queso, 3 empanaditas de carne y 5 croquetas de provolone.', price: '$34.900', tags: [], category: 'Descuentos increíbles', imageUrl: 'https://images.loveat.la/media/7900/images/plates/589955' },
  { name: 'Vitel tone mediano', description: 'Peceto tierno en finas rodajas, cubierto con nuestra cremosa salsa de vitel toné y alcaparras.', price: '$17.900', tags: ['Nuevo'], category: 'Descuentos increíbles', imageUrl: 'https://images.loveat.la/media/7900/images/plates/589971' },
  { name: 'Pastel de Papas Mediano', description: 'Pastel de papas con relleno de carne, huevo duro y cebolla de verdeo, queso mozzarella y puré de papas con queso parmesano, tamaño mediano 350gr', price: '$16.900', tags: ['Nuevo', 'Popular'], category: 'Descuentos increíbles', imageUrl: 'https://images.loveat.la/media/7900/images/plates/589956' },
  { name: 'Tortilla de Papas', description: 'Clasica y abundante tortilla de papas.', price: '$13.900', tags: ['Popular', 'Vegetariano'], category: 'Descuentos increíbles', imageUrl: 'https://images.loveat.la/media/7900/images/plates/589957' },

  // === Nuevos productos de verano ===
  { name: 'Ensalada cesar con pollo', description: 'Mix de verdes, croutons, queso sardo y pollo. viene con dip de nuestra salsa césar.', price: '$19.900', tags: [], category: 'Nuevos productos de verano', imageUrl: 'https://images.loveat.la/media/7900/images/plates/589968' },
  { name: 'Ensalada cesar con pollo mediana', description: 'Mix de verdes, croutons, queso sardo y pollo. viene con dip de nuestra salsa césar.', price: '$15.900', tags: [], category: 'Nuevos productos de verano', imageUrl: 'https://images.loveat.la/media/7900/images/plates/589969' },
  { name: 'Vitel tone', description: 'Peceto tierno en finas rodajas, cubierto con nuestra cremosa salsa y alcaparras.', price: '$24.900', tags: [], category: 'Nuevos productos de verano', imageUrl: 'https://images.loveat.la/media/7900/images/plates/589970' },
  { name: 'Vitel tone + ensalada rusa', description: 'Peceto tierno en finas rodajas, cubierto con nuestra cremosa salsa y alcaparras, con guarnición de ensalada rusa.', price: '$25.900', tags: [], category: 'Nuevos productos de verano', imageUrl: 'https://images.loveat.la/media/7900/images/plates/589972' },
  { name: 'Vitel tone mediano + ens rusa', description: 'Peceto tierno en finas rodajas, cubierto con nuestra cremosa salsa y alcaparras, con guarnición de ensalada rusa.', price: '$22.900', tags: [], category: 'Nuevos productos de verano', imageUrl: 'https://images.loveat.la/media/7900/images/plates/589973' },

  // === Entradas ===
  { name: 'Buñuelos de Acelga X5', description: '5 Típicos y nutritivos buñuelos de acelga con salsa alioli.', price: '$10.900', tags: [], category: 'Entradas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/589963' },
  { name: 'Buñuelos de acelga x3', description: '3 Típicos y nutritivos buñuelos de acelga con salsa alioli.', price: '$7.900', tags: ['Vegetariano'], category: 'Entradas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/595505' },
  { name: 'Croquetas de Provolone y Tomillo X5', description: '5 Croquetas crocantes de queso provolone y hierba de tomillo, acompañada de salsa yagua (tomates y hierbas).', price: '$10.900', tags: [], category: 'Entradas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/589964' },
  { name: 'Croquetas de provolone y tomillo x3', description: 'Croquetas crocantes de queso provolone y hierba de tomillo, acompañada de salsa yagua.', price: '$7.900', tags: ['Vegetariano'], category: 'Entradas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/595506' },
  { name: 'Empanaditas de Carne X3', description: 'Clásicas empanaditas fritas salteñas rellenas de lomo.', price: '$7.900', tags: [], category: 'Entradas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/589965' },
  { name: 'Empanaditas de Jamón y Queso X3', description: 'Clásicas empanaditas fritas salteñas rellenas de jamón y queso.', price: '$7.900', tags: [], category: 'Entradas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/589966' },
  { name: 'Docena de empanaditas', description: 'Empanaditas de Jamón y queso o Carne', price: '$30.900', tags: [], category: 'Entradas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/589967' },
  { name: 'Tortilla de papas mediana', description: 'Clásica tortilla de papa mediana.', price: '$11.900', tags: ['Vegetariano'], category: 'Entradas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/595507' },

  // === Combos ===
  { name: 'Combo Tapeo Mediano', description: 'Tapeo tradicional mediano: 3 buñuelos de acelga, 2 empanaditas de carne, 2 empanaditas de jamón y queso y 3 croquetas de provolone.', price: '$25.900', tags: [], category: 'Combos', imageUrl: 'https://images.loveat.la/media/7900/images/plates/595577' },

  // === Los Elegidos del Chef ===
  { name: 'Pastel de Papas', description: 'Carne con huevo duro, cebolla de verdeo, queso mozzarella, puré de papas y queso gratinado.', price: '$19.900', tags: [], category: 'Los Elegidos del Chef', imageUrl: 'https://images.loveat.la/media/7900/images/plates/589977' },
  { name: 'Lasagna', description: 'Lasagna de carne, espinacas a la crema y salsa pomodoro.', price: '$19.900', tags: [], category: 'Los Elegidos del Chef', imageUrl: 'https://images.loveat.la/media/7900/images/plates/589974' },

  // === Minutas ===
  { name: 'Cazuela de pollo con arroz', description: 'Cazuela de pollo con arroz parbolizado, champiñones, cebolla, zanahoria, puerro y crema', price: '$19.900', tags: [], category: 'Minutas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/589978' },
  { name: 'Suprema con guarnicion', description: 'Clásica milanesa de pechuga de pollo.', price: '$23.900', tags: [], category: 'Minutas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/589984' },
  { name: 'Suprema mediana con guarnicion', description: 'Clásica milanesa frita de pechuga de pollo mediana con guarnición a elección', price: '$20.900', tags: [], category: 'Minutas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/589985' },
  { name: 'Suprema napo con guarnicion', description: 'Suntuosa milanesa de pechuga de pollo frita a la napolitana (salsa de tomates, jamón, queso y orégano) con guarnición a elección.', price: '$27.900', tags: [], category: 'Minutas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/589986' },
  { name: 'Suprema mediana napo con guarnicion', description: 'Suntuosa milanesa de pechuga de pollo frita a la napolitana (salsa de tomates, jamón, queso y orégano) con guarnición a elección.', price: '$24.900', tags: [], category: 'Minutas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/589987' },
  { name: 'Mila peceto X3 con guarnicion', description: 'Clásicas milanesas crocantes de peceto por 3 unidades con guarnición a elección.', price: '$25.900', tags: [], category: 'Minutas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/589988' },
  { name: 'Mila peceto x2 con guarnicion', description: 'Clásicas milanesas crocantes de peceto por 2 unidades con guarnición a elección.', price: '$21.900', tags: [], category: 'Minutas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/595508' },
  { name: 'Mila peceto napo X3 con guarnicion', description: 'Milanesas de peceto napolitana suntuosas por 3 unidades con guarnición.', price: '$28.900', tags: [], category: 'Minutas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/589989' },
  { name: 'Mila peceto napo X2 con guarnicion', description: 'Milanesas de peceto napolitana suntuosas por 2 unidades con guarnición.', price: '$24.900', tags: [], category: 'Minutas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/595509' },
  { name: 'Mila de bife mediana con guarnicion', description: 'Milanesa de bife de chorizo mediana en pan panko con guarnición a elección.', price: '$23.900', tags: [], category: 'Minutas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/589995' },
  { name: 'Mila de merluza con guarnicion', description: 'Milanesa de merluza fresca de la patagonia con guarnición a elección.', price: '$21.900', tags: [], category: 'Minutas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/589975' },

  // === Sándwiches ===
  { name: 'Sandwich de suprema con papas', description: 'Suprema de pollo, tomate, lechuga y mayonesa de alioli en nuestro pan de siempre, vienen con papas fritas', price: '$17.900', tags: [], category: 'Sándwiches', imageUrl: 'https://images.loveat.la/media/7900/images/plates/589997' },
  { name: 'Sandwich de milanesa de peceto con papas', description: 'Milanesa de peceto, tomate, lechuga y mayonesa en nuestro pan de siempre, vienen con papas fritas', price: '$19.900', tags: [], category: 'Sándwiches', imageUrl: 'https://images.loveat.la/media/7900/images/plates/589996' },
  { name: 'Sandwich de Chorizo', description: 'Sándwich de chorizo a la parrilla, rúcula, tomates secos y mayonesa.', price: '$14.900', tags: [], category: 'Sándwiches', imageUrl: 'https://images.loveat.la/media/7900/images/plates/590008' },

  // === Pastas ===
  { name: 'Canelones de verdura y ricotta medianos', description: 'Canelones Medianos de Espinaca a la Rossini.', price: '$16.900', tags: [], category: 'Pastas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/589999' },

  // === Parrilla ===
  { name: 'Bife de chorizo', description: 'Bife de chorizo madurado en 21 días y hecho a la parrilla con quebracho colorado y blanco.', price: '$44.900', tags: [], category: 'Parrilla', imageUrl: 'https://images.loveat.la/media/7900/images/plates/590000' },
  { name: 'Lomo', description: 'Lomo madurado en 21 días y hecho a la parrilla con quebracho colorado y blanco.', price: '$49.900', tags: [], category: 'Parrilla', imageUrl: 'https://images.loveat.la/media/7900/images/plates/590001' },
  { name: 'Ojo de bife', description: 'Ojo de bife madurado en 21 días y hecho a la parrilla con quebracho colorado y blanco.', price: '$43.900', tags: [], category: 'Parrilla', imageUrl: 'https://images.loveat.la/media/7900/images/plates/590002' },
  { name: 'Morcilla', description: 'Morcilla de campo.', price: '$10.900', tags: [], category: 'Parrilla', imageUrl: 'https://images.loveat.la/media/7900/images/plates/590003' },
  { name: 'Chorizo', description: 'Chorizo de campo fresco.', price: '$11.900', tags: [], category: 'Parrilla', imageUrl: 'https://images.loveat.la/media/7900/images/plates/590007' },

  // === Ensaladas ===
  { name: 'Ensalada de Rucula, Parmesano y Cherry', description: 'Ensalada de rúcula, queso parmesano y tomates cherrys.', price: '$12.900', tags: [], category: 'Ensaladas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/590009' },
  { name: 'Ens de Remolacha Tomate Huevo y Choclo', description: 'Ensalada de remolachas, choclo, cebolla morada, tomates, zanahoria y huevo duro.', price: '$12.900', tags: [], category: 'Ensaladas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/590010' },
  { name: 'Ensalada Mixta', description: 'Ensalada de lechuga romana, tomates y cebolla morada y criolla.', price: '$9.900', tags: [], category: 'Ensaladas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/590011' },

  // === Acompañamientos ===
  { name: 'Pure de Papas', description: 'Puré de papas cremoso.', price: '$7.900', tags: [], category: 'Acompañamientos', imageUrl: 'https://images.loveat.la/media/7900/images/plates/590012' },
  { name: 'Papas Fritas', description: 'Papas fritas crocantes.', price: '$8.900', tags: [], category: 'Acompañamientos', imageUrl: 'https://images.loveat.la/media/7900/images/plates/590014' },
  { name: 'Batatas Fritas', description: 'Batatas fritas al bastón.', price: '$8.900', tags: [], category: 'Acompañamientos', imageUrl: 'https://images.loveat.la/media/7900/images/plates/590015' },
  { name: 'Espinacas a la Crema', description: 'Espinacas a la crema con queso parmesano gratinado.', price: '$10.900', tags: [], category: 'Acompañamientos', imageUrl: 'https://images.loveat.la/media/7900/images/plates/590016' },
  { name: 'Pan de Campo Adicional', description: 'Pan de campo artesanal.', price: '$900', tags: [], category: 'Acompañamientos', imageUrl: 'https://images.loveat.la/media/7900/images/plates/590017' },

  // === Postres ===
  { name: 'Flan de dulce de leche', description: 'Exquisito flan de dulce de leche con crema.', price: '$6.900', tags: [], category: 'Postres', imageUrl: 'https://images.loveat.la/media/7900/images/plates/590018' },
  { name: 'Lemon Pie', description: 'Torta individual con base crocante, crema de limón y merengue.', price: '$6.900', tags: [], category: 'Postres', imageUrl: 'https://images.loveat.la/media/7900/images/plates/590019' },

  // === Bebidas ===
  { name: 'Coca-cola original 600ml', description: 'Coca-cola original 600ml', price: '$4.900', tags: [], category: 'Bebidas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/590021' },
  { name: 'Coca-cola zero 600ml', description: 'Coca-cola zero 600ml', price: '$4.900', tags: [], category: 'Bebidas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/590022' },
  { name: 'Sprite lima-limon 600ml', description: 'Sprite lima-limon 600ml', price: '$4.900', tags: [], category: 'Bebidas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/590024' },
  { name: 'Sprite zero lima-limon 600ml', description: 'Sprite zero lima-limon 600ml', price: '$4.900', tags: [], category: 'Bebidas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/590025' },
  { name: 'Fanta naranja 600ml', description: 'Fanta naranja 600ml', price: '$4.900', tags: [], category: 'Bebidas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/590026' },
  { name: 'Agua Mineral Con Gas 500ml', description: 'Agua Mineral Con Gas 500ml', price: '$4.900', tags: [], category: 'Bebidas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/590027' },
  { name: 'Agua mineral sin gas 500ml', description: 'Agua mineral sin gas 500ml', price: '$4.900', tags: [], category: 'Bebidas', imageUrl: 'https://images.loveat.la/media/7900/images/plates/590028' },
];

async function main() {
  console.log('\n🍽️  Re-seeding Lo de Jesús with REAL menu data + photos\n');

  const tenant = await prisma.tenant.findUnique({ where: { slug: 'lo-de-jesus' } });
  if (!tenant) {
    console.error('❌ Tenant lo-de-jesus not found');
    return;
  }

  // 1. Delete old products, images, and categories
  console.log('🗑️  Cleaning old data...');
  await prisma.productImage.deleteMany({
    where: { product: { tenantId: tenant.id } },
  });
  await prisma.product.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.productCategory.deleteMany({ where: { tenantId: tenant.id } });
  // Also delete old media records for this tenant's products folder
  await prisma.media.deleteMany({ where: { tenantId: tenant.id, folder: 'products' } });
  console.log('  ✅ Old products/categories/images deleted');

  // 2. Create categories
  const categories: Record<string, string> = {};
  for (let i = 0; i < CATEGORIES_ORDER.length; i++) {
    const catName = CATEGORIES_ORDER[i];
    const cat = await prisma.productCategory.create({
      data: {
        tenantId: tenant.id,
        name: catName,
        slug: slugify(catName),
        order: i,
        isActive: true,
      },
    });
    categories[catName] = cat.id;
  }
  console.log(`  ✅ ${CATEGORIES_ORDER.length} categories created`);

  // 3. Create products with downloaded images
  let created = 0;
  let imgOk = 0;
  let imgFail = 0;

  for (let i = 0; i < REAL_MENU.length; i++) {
    const item = REAL_MENU[i];
    const price = parsePrice(item.price);
    const slug = slugify(item.name);
    const categoryId = categories[item.category];

    // Build attributes
    const attrs: any[] = [];
    if (item.tags.includes('Vegetariano')) {
      attrs.push({ key: 'apto_vegano', label: 'Vegano/Vegetariano', value: 'Vegetariano', type: 'select' });
    }
    if (item.tags.includes('Nuevo')) {
      attrs.push({ key: 'destacado', label: 'Destacado', value: 'Nuevo', type: 'text' });
    }
    if (item.tags.includes('Popular')) {
      attrs.push({ key: 'destacado', label: 'Destacado', value: 'Popular', type: 'text' });
    }

    // Determine seccion from category
    const seccionMap: Record<string, string> = {
      'Entradas': 'Entrada',
      'Los Elegidos del Chef': 'Principal',
      'Minutas': 'Principal',
      'Sándwiches': 'Principal',
      'Pastas': 'Principal',
      'Parrilla': 'Principal',
      'Ensaladas': 'Entrada',
      'Acompañamientos': 'Guarnición',
      'Postres': 'Postre',
      'Bebidas': 'Bebida',
    };
    if (seccionMap[item.category]) {
      attrs.push({ key: 'seccion', label: 'Sección', value: seccionMap[item.category], type: 'select' });
    }

    const product = await prisma.product.create({
      data: {
        tenantId: tenant.id,
        name: item.name,
        slug,
        description: item.description,
        price,
        categoryId,
        order: i,
        isActive: true,
        isFeatured: item.tags.includes('Popular') || item.category === 'Descuentos increíbles',
        trackInventory: false,
        stock: 0,
        type: 'PHYSICAL',
        attributes: attrs.length > 0 ? attrs : undefined,
      },
    });
    created++;

    // Download and process image
    process.stdout.write(`  📸 [${i + 1}/${REAL_MENU.length}] ${item.name.substring(0, 40).padEnd(40)} `);
    const media = await downloadAndProcess(item.imageUrl, tenant.id, 'products');

    if (media) {
      // Create ProductImage
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: media.url,
          alt: item.name,
          order: 0,
          isPrimary: true,
        },
      });
      // Create Media record
      await prisma.media.create({
        data: {
          tenantId: tenant.id,
          filename: media.filename,
          originalName: `${slug}.webp`,
          mimeType: 'image/webp',
          size: media.size,
          url: media.url,
          thumbnailUrl: media.thumbnailUrl,
          folder: 'products',
        },
      });
      imgOk++;
      console.log('✅');
    } else {
      imgFail++;
      console.log('❌');
    }
  }

  // Also download banner/logo for branding
  console.log('\n  📸 Downloading logo and banner...');
  const logo = await downloadAndProcess('https://images.loveat.la/media/7900/images/logo/logo', tenant.id, 'logos');
  const banner = await downloadAndProcess('https://images.loveat.la/media/7900/images/bannerLogo/bannerLogo', tenant.id, 'covers');

  if (logo) {
    await prisma.tenant.update({ where: { id: tenant.id }, data: { logo: logo.url } });
    await prisma.tenantBranding.update({ where: { tenantId: tenant.id }, data: { logoUrl: logo.url } });
    console.log('  ✅ Logo uploaded');
  }
  if (banner) {
    await prisma.tenant.update({ where: { id: tenant.id }, data: { coverImage: banner.url } });
    await prisma.tenantBranding.update({ where: { tenantId: tenant.id }, data: { coverImageUrl: banner.url } });
    console.log('  ✅ Banner uploaded');
  }

  console.log(`\n✅ Lo de Jesús re-seeded with REAL menu!`);
  console.log(`   Products: ${created}`);
  console.log(`   Images OK: ${imgOk}, Failed: ${imgFail}`);
  console.log(`   🔗 https://turnolink.com.ar/lo-de-jesus\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
