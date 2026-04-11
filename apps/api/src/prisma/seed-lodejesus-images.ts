import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Unsplash food photos mapped by product name keywords
const PRODUCT_IMAGES: Record<string, string> = {
  // === Descuentos / Minutas ===
  'suprema napolitana con papas fritas': 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=600&h=600&fit=crop', // milanesa napo
  'milanesa de carne con papas fritas': 'https://images.unsplash.com/photo-1585325701956-60dd9c8553bc?w=600&h=600&fit=crop', // milanesa
  'hamburguesa completa con papas fritas': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=600&fit=crop', // burger
  'pizza muzzarella grande': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=600&fit=crop', // pizza
  'milanesa de carne': 'https://images.unsplash.com/photo-1585325701956-60dd9c8553bc?w=600&h=600&fit=crop',
  'milanesa napolitana': 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=600&h=600&fit=crop',
  'suprema de pollo': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&h=600&fit=crop',
  'suprema napolitana': 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=600&h=600&fit=crop',
  'tortilla de papas': 'https://images.unsplash.com/photo-1623246123320-0d6636755796?w=600&h=600&fit=crop',
  'omelette de jamón y queso': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=600&fit=crop',
  'tarta de jamón y queso': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=600&fit=crop',
  'tarta de verdura': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=600&fit=crop',

  // === Verano ===
  'ensalada caesar con pollo grillé': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&h=600&fit=crop',
  'wrap de pollo': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&h=600&fit=crop',
  'licuado de frutas': 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=600&h=600&fit=crop',

  // === Entradas ===
  'empanadas (x unidad)': 'https://images.unsplash.com/photo-1604467707321-70d009801bf5?w=600&h=600&fit=crop',
  'docena de empanadas': 'https://images.unsplash.com/photo-1604467707321-70d009801bf5?w=600&h=600&fit=crop',
  'provoleta': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&h=600&fit=crop',
  'tabla de fiambres y quesos': 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=600&h=600&fit=crop',
  'papas fritas': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&h=600&fit=crop',
  'bastones de muzzarella': 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=600&h=600&fit=crop',

  // === Combos ===
  'combo milanesa + bebida': 'https://images.unsplash.com/photo-1585325701956-60dd9c8553bc?w=600&h=600&fit=crop',
  'combo hamburguesa + bebida': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=600&fit=crop',
  'combo pizza + fainá + bebida': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=600&fit=crop',
  'combo parrilla para 2': 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&h=600&fit=crop',

  // === Elegidos del Chef ===
  'bife de chorizo a la criolla': 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&h=600&fit=crop',
  'pollo al verdeo': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&h=600&fit=crop',
  'sorrentinos de jamón y queso': 'https://images.unsplash.com/photo-1587740908075-9e245070dfaa?w=600&h=600&fit=crop',
  'entraña a la parrilla': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=600&fit=crop',

  // === Sándwiches ===
  'sándwich de milanesa': 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=600&h=600&fit=crop',
  'sándwich de milanesa completo': 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=600&h=600&fit=crop',
  'hamburguesa casera': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&h=600&fit=crop',
  'hamburguesa completa': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=600&fit=crop',
  'lomito completo': 'https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?w=600&h=600&fit=crop',
  'sándwich de bondiola': 'https://images.unsplash.com/photo-1550507992-eb63ffee0847?w=600&h=600&fit=crop',

  // === Pastas ===
  'fideos con tuco': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=600&fit=crop',
  'fideos con bolognesa': 'https://images.unsplash.com/photo-1598866594042-8c11f76cacb5?w=600&h=600&fit=crop',
  'ñoquis con tuco': 'https://images.unsplash.com/photo-1589227365533-cee630bd59bd?w=600&h=600&fit=crop',
  'ravioles de ricota': 'https://images.unsplash.com/photo-1587740908075-9e245070dfaa?w=600&h=600&fit=crop',
  'lasagna de carne': 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&h=600&fit=crop',
  'canelones de verdura': 'https://images.unsplash.com/photo-1587740908075-9e245070dfaa?w=600&h=600&fit=crop',

  // === Parrilla ===
  'asado de tira': 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&h=600&fit=crop',
  'vacío': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=600&fit=crop',
  'entraña': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=600&fit=crop',
  'bife de chorizo': 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&h=600&fit=crop',
  'bife de lomo': 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&h=600&fit=crop',
  'pollo a la parrilla': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&h=600&fit=crop',
  'choripán': 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=600&h=600&fit=crop',
  'parrillada para 2': 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&h=600&fit=crop',

  // === Ensaladas ===
  'ensalada mixta': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=600&fit=crop',
  'ensalada caesar': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&h=600&fit=crop',
  'ensalada rúcula y parmesano': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=600&fit=crop',
  'ensalada completa': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=600&fit=crop',

  // === Acompañamientos ===
  'papas fritas (porción)': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&h=600&fit=crop',
  'puré de papas': 'https://images.unsplash.com/photo-1585672840563-f2af2ced55c9?w=600&h=600&fit=crop',
  'papas rústicas': 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=600&h=600&fit=crop',
  'ensalada del día': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=600&fit=crop',
  'fainá': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=600&fit=crop',

  // === Postres ===
  'flan casero': 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&h=600&fit=crop',
  'tiramisú': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=600&fit=crop',
  'panqueques con dulce de leche': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=600&fit=crop',
  'ensalada de frutas': 'https://images.unsplash.com/photo-1564093497595-593b96d80571?w=600&h=600&fit=crop',
  'brownie con helado': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&h=600&fit=crop',

  // === Bebidas ===
  'agua mineral 500ml': 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&h=600&fit=crop',
  'agua mineral 1.5l': 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&h=600&fit=crop',
  'gaseosa línea coca-cola 500ml': 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&h=600&fit=crop',
  'gaseosa línea coca-cola 1.5l': 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&h=600&fit=crop',
  'cerveza quilmes 1l': 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&h=600&fit=crop',
  'cerveza artesanal pinta': 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&h=600&fit=crop',
  'vino de la casa': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=600&fit=crop',
  'café': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=600&fit=crop',
  'cortado': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=600&fit=crop',
  'café con leche': 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&h=600&fit=crop',
};

async function main() {
  console.log('\n🖼️  Adding images to Lo de Jesús products\n');

  const tenant = await prisma.tenant.findUnique({ where: { slug: 'lo-de-jesus' } });
  if (!tenant) {
    console.error('❌ Tenant lo-de-jesus not found');
    return;
  }

  const products = await prisma.product.findMany({
    where: { tenantId: tenant.id },
    include: { images: true },
  });

  let added = 0;
  let skipped = 0;

  for (const product of products) {
    // Skip if already has images
    if (product.images.length > 0) {
      skipped++;
      continue;
    }

    const key = product.name.toLowerCase();
    const imageUrl = PRODUCT_IMAGES[key];

    if (!imageUrl) {
      console.log(`  ⚠️  No image for: ${product.name}`);
      continue;
    }

    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: imageUrl,
        alt: product.name,
        order: 0,
        isPrimary: true,
      },
    });
    added++;
  }

  console.log(`\n✅ Images added: ${added}, skipped (already had): ${skipped}`);
  console.log(`   Total products: ${products.length}\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
