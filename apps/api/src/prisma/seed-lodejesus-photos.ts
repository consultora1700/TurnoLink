import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs/promises';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharp = require('sharp');

const prisma = new PrismaClient();
const API_URL = 'https://api.turnolink.com.ar';
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Image URL map: product name → loveat URL
const IMAGE_MAP: Record<string, string> = {
  'Combo Tapeo': 'https://images.loveat.la/media/7900/images/plates/589955',
  'Vitel tone mediano': 'https://images.loveat.la/media/7900/images/plates/589971',
  'Pastel de Papas Mediano': 'https://images.loveat.la/media/7900/images/plates/589956',
  'Tortilla de Papas': 'https://images.loveat.la/media/7900/images/plates/589957',
  'Ensalada cesar con pollo': 'https://images.loveat.la/media/7900/images/plates/589968',
  'Ensalada cesar con pollo mediana': 'https://images.loveat.la/media/7900/images/plates/589969',
  'Vitel tone': 'https://images.loveat.la/media/7900/images/plates/589970',
  'Vitel tone + ensalada rusa': 'https://images.loveat.la/media/7900/images/plates/589972',
  'Vitel tone mediano + ens rusa': 'https://images.loveat.la/media/7900/images/plates/589973',
  'Buñuelos de Acelga X5': 'https://images.loveat.la/media/7900/images/plates/589963',
  'Buñuelos de acelga x3': 'https://images.loveat.la/media/7900/images/plates/595505',
  'Croquetas de Provolone y Tomillo X5': 'https://images.loveat.la/media/7900/images/plates/589964',
  'Croquetas de provolone y tomillo x3': 'https://images.loveat.la/media/7900/images/plates/595506',
  'Empanaditas de Carne X3': 'https://images.loveat.la/media/7900/images/plates/589965',
  'Empanaditas de Jamón y Queso X3': 'https://images.loveat.la/media/7900/images/plates/589966',
  'Docena de empanaditas': 'https://images.loveat.la/media/7900/images/plates/589967',
  'Tortilla de papas mediana': 'https://images.loveat.la/media/7900/images/plates/595507',
  'Combo Tapeo Mediano': 'https://images.loveat.la/media/7900/images/plates/595577',
  'Pastel de Papas': 'https://images.loveat.la/media/7900/images/plates/589977',
  'Lasagna': 'https://images.loveat.la/media/7900/images/plates/589974',
  'Cazuela de pollo con arroz': 'https://images.loveat.la/media/7900/images/plates/589978',
  'Suprema con guarnicion': 'https://images.loveat.la/media/7900/images/plates/589984',
  'Suprema mediana con guarnicion': 'https://images.loveat.la/media/7900/images/plates/589985',
  'Suprema napo con guarnicion': 'https://images.loveat.la/media/7900/images/plates/589986',
  'Suprema mediana napo con guarnicion': 'https://images.loveat.la/media/7900/images/plates/589987',
  'Mila peceto X3 con guarnicion': 'https://images.loveat.la/media/7900/images/plates/589988',
  'Mila peceto x2 con guarnicion': 'https://images.loveat.la/media/7900/images/plates/595508',
  'Mila peceto napo X3 con guarnicion': 'https://images.loveat.la/media/7900/images/plates/589989',
  'Mila peceto napo X2 con guarnicion': 'https://images.loveat.la/media/7900/images/plates/595509',
  'Mila de bife mediana con guarnicion': 'https://images.loveat.la/media/7900/images/plates/589995',
  'Mila de merluza con guarnicion': 'https://images.loveat.la/media/7900/images/plates/589975',
  'Sandwich de suprema con papas': 'https://images.loveat.la/media/7900/images/plates/589997',
  'Sandwich de milanesa de peceto con papas': 'https://images.loveat.la/media/7900/images/plates/589996',
  'Sandwich de Chorizo': 'https://images.loveat.la/media/7900/images/plates/590008',
  'Canelones de verdura y ricotta medianos': 'https://images.loveat.la/media/7900/images/plates/589999',
  'Bife de chorizo': 'https://images.loveat.la/media/7900/images/plates/590000',
  'Lomo': 'https://images.loveat.la/media/7900/images/plates/590001',
  'Ojo de bife': 'https://images.loveat.la/media/7900/images/plates/590002',
  'Morcilla': 'https://images.loveat.la/media/7900/images/plates/590003',
  'Chorizo': 'https://images.loveat.la/media/7900/images/plates/590007',
  'Ensalada de Rucula, Parmesano y Cherry': 'https://images.loveat.la/media/7900/images/plates/590009',
  'Ens de Remolacha Tomate Huevo y Choclo': 'https://images.loveat.la/media/7900/images/plates/590010',
  'Ensalada Mixta': 'https://images.loveat.la/media/7900/images/plates/590011',
  'Pure de Papas': 'https://images.loveat.la/media/7900/images/plates/590012',
  'Papas Fritas': 'https://images.loveat.la/media/7900/images/plates/590014',
  'Batatas Fritas': 'https://images.loveat.la/media/7900/images/plates/590015',
  'Espinacas a la Crema': 'https://images.loveat.la/media/7900/images/plates/590016',
  'Pan de Campo Adicional': 'https://images.loveat.la/media/7900/images/plates/590017',
  'Flan de dulce de leche': 'https://images.loveat.la/media/7900/images/plates/590018',
  'Lemon Pie': 'https://images.loveat.la/media/7900/images/plates/590019',
  'Coca-cola original 600ml': 'https://images.loveat.la/media/7900/images/plates/590021',
  'Coca-cola zero 600ml': 'https://images.loveat.la/media/7900/images/plates/590022',
  'Sprite lima-limon 600ml': 'https://images.loveat.la/media/7900/images/plates/590024',
  'Sprite zero lima-limon 600ml': 'https://images.loveat.la/media/7900/images/plates/590025',
  'Fanta naranja 600ml': 'https://images.loveat.la/media/7900/images/plates/590026',
  'Agua Mineral Con Gas 500ml': 'https://images.loveat.la/media/7900/images/plates/590027',
  'Agua mineral sin gas 500ml': 'https://images.loveat.la/media/7900/images/plates/590028',
};

async function downloadAndProcess(imageUrl: string, tenantId: string, folder: string) {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());

  const uuid = uuidv4();
  const folderPath = path.join(UPLOAD_DIR, tenantId, folder);
  await fs.mkdir(folderPath, { recursive: true });

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
}

async function main() {
  console.log('\n🖼️  Downloading real photos for Lo de Jesús\n');

  const tenant = await prisma.tenant.findUnique({ where: { slug: 'lo-de-jesus' } });
  if (!tenant) { console.error('❌ Not found'); return; }

  const products = await prisma.product.findMany({
    where: { tenantId: tenant.id },
    include: { images: true },
  });

  let ok = 0, fail = 0, skip = 0;

  for (const product of products) {
    if (product.images.length > 0) { skip++; continue; }

    const imageUrl = IMAGE_MAP[product.name];
    if (!imageUrl) {
      console.log(`  ⚠️  No image mapping: ${product.name}`);
      fail++;
      continue;
    }

    process.stdout.write(`  📸 ${product.name.substring(0, 45).padEnd(45)} `);
    try {
      const media = await downloadAndProcess(imageUrl, tenant.id, 'products');

      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: media.url,
          alt: product.name,
          order: 0,
          isPrimary: true,
        },
      });

      await prisma.media.create({
        data: {
          tenantId: tenant.id,
          filename: media.filename,
          originalName: `${product.slug}.webp`,
          mimeType: 'image/webp',
          size: media.size,
          url: media.url,
          thumbnailUrl: media.thumbnailUrl,
          folder: 'products',
        },
      });

      ok++;
      console.log('✅');
    } catch (err: any) {
      fail++;
      console.log(`❌ ${err.message}`);
    }
  }

  // Logo + banner
  console.log('\n  📸 Logo & Banner...');
  try {
    const logo = await downloadAndProcess('https://images.loveat.la/media/7900/images/logo/logo', tenant.id, 'logos');
    await prisma.tenant.update({ where: { id: tenant.id }, data: { logo: logo.url } });
    await prisma.tenantBranding.update({ where: { tenantId: tenant.id }, data: { logoUrl: logo.url } });
    console.log('  ✅ Logo');
  } catch (e: any) { console.log(`  ❌ Logo: ${e.message}`); }

  try {
    const banner = await downloadAndProcess('https://images.loveat.la/media/7900/images/bannerLogo/bannerLogo', tenant.id, 'covers');
    await prisma.tenant.update({ where: { id: tenant.id }, data: { coverImage: banner.url } });
    await prisma.tenantBranding.update({ where: { tenantId: tenant.id }, data: { coverImageUrl: banner.url } });
    console.log('  ✅ Banner');
  } catch (e: any) { console.log(`  ❌ Banner: ${e.message}`); }

  console.log(`\n✅ Done! OK: ${ok}, Failed: ${fail}, Skipped: ${skip}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
