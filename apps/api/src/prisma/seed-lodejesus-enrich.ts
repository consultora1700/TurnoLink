import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Enrichment data extracted from Tucán detail modals
// Format: { description update, shortDescription, attributes to add/replace }

interface Enrichment {
  description?: string;        // Full description (replace)
  shortDescription?: string;   // Short tagline for cards
  attributes?: Record<string, string | boolean>;
  isFeatured?: boolean;
}

const ENRICHMENTS: Record<string, Enrichment> = {
  // === Descuentos ===
  'Combo Tapeo': {
    description: '5 Buñuelos de acelga, 3 empanaditas de jamón y queso, 3 empanaditas de carne y 5 croquetas de provolone. Incluye salsas a elección: Ali Oli o Yajua (tomates y hierbas).',
    shortDescription: 'Tabla para compartir con salsas',
    attributes: { seccion: 'Entrada', porciones: 'Para compartir' },
    isFeatured: true,
  },
  'Vitel tone mediano': {
    description: 'Peceto tierno en finas rodajas, cubierto con nuestra cremosa salsa de vitel toné y alcaparras. Porción mediana.',
    shortDescription: 'Peceto con salsa vitel toné',
    attributes: { seccion: 'Entrada' },
    isFeatured: true,
  },
  'Pastel de Papas Mediano': {
    description: 'Pastel de papas con relleno de carne, huevo duro y cebolla de verdeo, queso mozzarella y puré de papas con queso parmesano. Tamaño mediano 350gr.',
    shortDescription: 'Con carne, huevo y queso gratinado',
    attributes: { seccion: 'Principal' },
    isFeatured: true,
  },
  'Tortilla de Papas': {
    description: 'Clásica y abundante tortilla de papas. Elegí la cocción: cocida, babé o a punto.',
    shortDescription: 'Cocción a elección',
    attributes: { seccion: 'Entrada', apto_vegano: 'Vegetariano' },
    isFeatured: true,
  },

  // === Verano ===
  'Ensalada cesar con pollo': {
    description: 'Mix de verdes, croutons, queso sardo y pollo. Viene con dip de nuestra salsa césar.',
    shortDescription: 'Con croutons, sardo y dip de salsa césar',
    attributes: { seccion: 'Principal' },
  },
  'Ensalada cesar con pollo mediana': {
    description: 'Mix de verdes, croutons, queso sardo y pollo. Viene con dip de nuestra salsa césar. Porción mediana.',
    shortDescription: 'Porción mediana con salsa césar',
    attributes: { seccion: 'Principal' },
  },
  'Vitel tone': {
    description: 'Peceto tierno en finas rodajas, cubierto con nuestra cremosa salsa y alcaparras. Porción grande.',
    shortDescription: 'Porción grande, peceto con salsa',
    attributes: { seccion: 'Entrada' },
  },
  'Vitel tone + ensalada rusa': {
    description: 'Peceto tierno en finas rodajas, cubierto con nuestra cremosa salsa y alcaparras, con guarnición de ensalada rusa.',
    shortDescription: 'Peceto con salsa + ensalada rusa',
    attributes: { seccion: 'Entrada' },
  },
  'Vitel tone mediano + ens rusa': {
    description: 'Peceto tierno en finas rodajas, cubierto con nuestra cremosa salsa y alcaparras, con guarnición de ensalada rusa. Porción mediana.',
    shortDescription: 'Mediano con ensalada rusa',
    attributes: { seccion: 'Entrada' },
  },

  // === Entradas ===
  'Buñuelos de Acelga X5': {
    description: '5 típicos y nutritivos buñuelos de acelga con salsa a elección: Ali Oli o Yajua (tomates y hierbas).',
    shortDescription: '5 unidades con salsa a elección',
    attributes: { seccion: 'Entrada', apto_vegano: 'Vegetariano' },
  },
  'Buñuelos de acelga x3': {
    description: '3 típicos y nutritivos buñuelos de acelga con salsa a elección: Ali Oli o Yajua (tomates y hierbas).',
    shortDescription: '3 unidades con salsa a elección',
    attributes: { seccion: 'Entrada', apto_vegano: 'Vegetariano' },
  },
  'Croquetas de Provolone y Tomillo X5': {
    description: '5 croquetas crocantes de queso provolone y hierba de tomillo, acompañada de salsa a elección: Ali Oli o Yajua (tomates y hierbas).',
    shortDescription: '5 unidades con salsa a elección',
    attributes: { seccion: 'Entrada', apto_vegano: 'Vegetariano' },
  },
  'Croquetas de provolone y tomillo x3': {
    description: 'Croquetas crocantes de queso provolone y hierba de tomillo, acompañada de salsa a elección: Yajua o Ali Oli.',
    shortDescription: '3 unidades con salsa a elección',
    attributes: { seccion: 'Entrada', apto_vegano: 'Vegetariano' },
  },
  'Empanaditas de Carne X3': {
    description: 'Clásicas empanaditas fritas salteñas rellenas de lomo. Con salsa a elección: Ali Oli o Yajua.',
    shortDescription: 'Fritas salteñas rellenas de lomo',
    attributes: { seccion: 'Entrada' },
  },
  'Empanaditas de Jamón y Queso X3': {
    description: 'Clásicas empanaditas fritas salteñas rellenas de jamón y queso. Con salsa a elección: Ali Oli o Yajua.',
    shortDescription: 'Fritas salteñas de jamón y queso',
    attributes: { seccion: 'Entrada' },
  },
  'Docena de empanaditas': {
    description: 'Docena de empanaditas fritas salteñas. Elegí el sabor: jamón y queso o carne.',
    shortDescription: '12 unidades, sabor a elección',
    attributes: { seccion: 'Entrada', porciones: 'Para compartir' },
  },
  'Tortilla de papas mediana': {
    description: 'Clásica tortilla de papa mediana. Elegí la cocción: a punto, babé o cocida.',
    shortDescription: 'Cocción a elección',
    attributes: { seccion: 'Entrada', apto_vegano: 'Vegetariano' },
  },

  // === Combos ===
  'Combo Tapeo Mediano': {
    description: 'Tapeo tradicional mediano: 3 buñuelos de acelga, 2 empanaditas de carne, 2 empanaditas de jamón y queso y 3 croquetas de provolone. Con salsa a elección: Ali Oli o Yajua.',
    shortDescription: 'Tabla mediana con salsas',
    attributes: { seccion: 'Entrada', porciones: 'Para 2' },
  },

  // === Elegidos del Chef ===
  'Pastel de Papas': {
    description: 'Carne con huevo duro, cebolla de verdeo, queso mozzarella, puré de papas y queso gratinado. Porción grande.',
    shortDescription: 'Con carne, huevo y queso gratinado',
    attributes: { seccion: 'Principal' },
  },
  'Lasagna': {
    description: 'Lasagna de carne, espinacas a la crema y salsa pomodoro.',
    shortDescription: 'Carne, espinacas y salsa pomodoro',
    attributes: { seccion: 'Principal' },
  },

  // === Minutas ===
  'Cazuela de pollo con arroz': {
    description: 'Cazuela de pollo con arroz parbolizado, champiñones, cebolla, zanahoria, puerro y crema.',
    shortDescription: 'Con arroz, champiñones y crema',
    attributes: { seccion: 'Principal' },
  },
  'Suprema con guarnicion': {
    description: 'Clásica milanesa de pechuga de pollo. Guarnición a elección: puré de papas, batatas fritas, papas fritas, ensalada mixta, ensalada de rúcula/parmesano/cherry o ensalada de remolacha. Opción de agregar limón.',
    shortDescription: 'Con guarnición a elección',
    attributes: { seccion: 'Principal' },
  },
  'Suprema mediana con guarnicion': {
    description: 'Clásica milanesa frita de pechuga de pollo mediana. Guarnición a elección: papas fritas, ensalada mixta, rúcula/parmesano/cherry, remolacha, puré o batatas. Opción de agregar limón.',
    shortDescription: 'Mediana con guarnición a elección',
    attributes: { seccion: 'Principal' },
  },
  'Suprema napo con guarnicion': {
    description: 'Suntuosa milanesa de pechuga de pollo frita a la napolitana (salsa de tomates, jamón, queso y orégano). Guarnición a elección: puré, batatas, papas fritas, ensalada mixta, rúcula o remolacha.',
    shortDescription: 'Napolitana con guarnición a elección',
    attributes: { seccion: 'Principal' },
  },
  'Suprema mediana napo con guarnicion': {
    description: 'Suntuosa milanesa de pechuga de pollo frita a la napolitana (salsa de tomates, jamón, queso y orégano) mediana. Guarnición a elección: puré, batatas, papas fritas, ensalada mixta, rúcula o remolacha.',
    shortDescription: 'Napo mediana con guarnición',
    attributes: { seccion: 'Principal' },
  },
  'Mila peceto X3 con guarnicion': {
    description: 'Clásicas milanesas crocantes de peceto por 3 unidades. Guarnición a elección: puré, batatas, papas fritas, ensalada mixta, rúcula/parmesano o remolacha. Opción de agregar limón.',
    shortDescription: '3 milanesas de peceto con guarnición',
    attributes: { seccion: 'Principal', porciones: 'Para compartir' },
  },
  'Mila peceto x2 con guarnicion': {
    description: 'Clásicas milanesas crocantes de peceto por 2 unidades. Guarnición a elección: puré, batatas, papas fritas, ensalada mixta, rúcula/parmesano o remolacha. Opción de agregar limón.',
    shortDescription: '2 milanesas de peceto con guarnición',
    attributes: { seccion: 'Principal' },
  },
  'Mila peceto napo X3 con guarnicion': {
    description: 'Milanesas de peceto napolitana suntuosas por 3 unidades. Guarnición a elección: puré, papas fritas, ensalada mixta, rúcula/parmesano, remolacha o batatas.',
    shortDescription: '3 napo de peceto con guarnición',
    attributes: { seccion: 'Principal', porciones: 'Para compartir' },
  },
  'Mila peceto napo X2 con guarnicion': {
    description: 'Milanesas de peceto napolitana suntuosas por 2 unidades. Guarnición a elección: puré, batatas, papas fritas, ensalada mixta, rúcula/parmesano o remolacha.',
    shortDescription: '2 napo de peceto con guarnición',
    attributes: { seccion: 'Principal' },
  },
  'Mila de bife mediana con guarnicion': {
    description: 'Milanesa de bife de chorizo mediana en pan panko. Guarnición a elección: puré, batatas, papas fritas, ensalada mixta, rúcula/parmesano o remolacha. Opción de agregar limón.',
    shortDescription: 'Bife en panko con guarnición',
    attributes: { seccion: 'Principal' },
  },
  'Mila de merluza con guarnicion': {
    description: 'Milanesa de merluza fresca de la Patagonia. Guarnición a elección: puré, papas fritas, ensalada mixta, rúcula/parmesano, remolacha o batatas. Opción de agregar limón.',
    shortDescription: 'Merluza patagónica con guarnición',
    attributes: { seccion: 'Principal' },
  },

  // === Sándwiches ===
  'Sandwich de suprema con papas': {
    description: 'Suprema de pollo, tomate, lechuga y mayonesa de alioli en nuestro pan de siempre. Vienen con papas fritas. Personalizá: sin aderezo, sin tomate o sin lechuga.',
    shortDescription: 'Con papas fritas, personalizable',
    attributes: { seccion: 'Principal' },
  },
  'Sandwich de milanesa de peceto con papas': {
    description: 'Milanesa de peceto, tomate, lechuga y mayonesa en nuestro pan de siempre. Vienen con papas fritas. Personalizá: sin tomate, sin lechuga o sin aderezo.',
    shortDescription: 'Con papas fritas, personalizable',
    attributes: { seccion: 'Principal' },
  },
  'Sandwich de Chorizo': {
    description: 'Sándwich de chorizo a la parrilla, rúcula, tomates secos y mayonesa. Personalizá: sin tomate, sin aderezo o sin rúcula.',
    shortDescription: 'Chorizo parrillero con rúcula',
    attributes: { seccion: 'Principal' },
  },

  // === Pastas ===
  'Canelones de verdura y ricotta medianos': {
    description: 'Canelones medianos de espinaca a la Rossini.',
    shortDescription: 'Espinaca a la Rossini',
    attributes: { seccion: 'Principal', apto_vegano: 'Vegetariano' },
  },

  // === Parrilla ===
  'Bife de chorizo': {
    description: 'Bife de chorizo madurado en 21 días y hecho a la parrilla con quebracho colorado y blanco. Aderezos: chimichurri o criolla. Término: cocida, jugosa o a punto.',
    shortDescription: 'Madurado 21 días, a la parrilla',
    attributes: { seccion: 'Principal', tiempo_prep: '30 min' },
  },
  'Lomo': {
    description: 'Lomo madurado en 21 días y hecho a la parrilla con quebracho colorado y blanco. Aderezos: chimichurri, criolla o sin salsa. Término: cocida, jugosa o a punto.',
    shortDescription: 'Madurado 21 días, a la parrilla',
    attributes: { seccion: 'Principal', tiempo_prep: '30 min' },
  },
  'Ojo de bife': {
    description: 'Ojo de bife madurado en 21 días y hecho a la parrilla con quebracho colorado y blanco.',
    shortDescription: 'Madurado 21 días, a la parrilla',
    attributes: { seccion: 'Principal', tiempo_prep: '30 min' },
  },
  'Morcilla': {
    description: 'Morcilla de campo.',
    shortDescription: 'De campo',
    attributes: { seccion: 'Principal' },
  },
  'Chorizo': {
    description: 'Chorizo de campo fresco. Aderezos: chimichurri o criolla. Punto: cocido mariposa o cocido.',
    shortDescription: 'De campo, con aderezos',
    attributes: { seccion: 'Principal' },
  },

  // === Ensaladas ===
  'Ensalada de Rucula, Parmesano y Cherry': {
    description: 'Ensalada de rúcula, queso parmesano y tomates cherrys.',
    shortDescription: 'Rúcula, parmesano y cherry',
    attributes: { seccion: 'Entrada', apto_celiaco: true },
  },
  'Ens de Remolacha Tomate Huevo y Choclo': {
    description: 'Ensalada de remolachas, choclo, cebolla morada, tomates, zanahoria y huevo duro. Personalizá: sin cebolla, sin remolacha, sin choclo, sin zanahoria o sin huevo.',
    shortDescription: 'Remolacha, choclo, huevo, personalizable',
    attributes: { seccion: 'Entrada', apto_celiaco: true },
  },
  'Ensalada Mixta': {
    description: 'Ensalada de lechuga romana, tomates y cebolla morada y criolla.',
    shortDescription: 'Lechuga, tomate y cebolla',
    attributes: { seccion: 'Entrada', apto_vegano: 'Vegano', apto_celiaco: true },
  },

  // === Acompañamientos ===
  'Pure de Papas': {
    description: 'Puré de papas cremoso.',
    shortDescription: 'Cremoso',
    attributes: { seccion: 'Guarnición', apto_vegano: 'Vegetariano' },
  },
  'Papas Fritas': {
    description: 'Papas fritas crocantes.',
    shortDescription: 'Crocantes',
    attributes: { seccion: 'Guarnición', apto_vegano: 'Vegano', apto_celiaco: true },
  },
  'Batatas Fritas': {
    description: 'Batatas fritas al bastón.',
    shortDescription: 'Al bastón',
    attributes: { seccion: 'Guarnición', apto_vegano: 'Vegano', apto_celiaco: true },
  },
  'Espinacas a la Crema': {
    description: 'Espinacas a la crema con queso parmesano gratinado.',
    shortDescription: 'Con parmesano gratinado',
    attributes: { seccion: 'Guarnición', apto_vegano: 'Vegetariano' },
  },
  'Pan de Campo Adicional': {
    description: 'Pan de campo artesanal.',
    shortDescription: 'Artesanal',
    attributes: { seccion: 'Guarnición', apto_vegano: 'Vegano' },
  },

  // === Postres ===
  'Flan de dulce de leche': {
    description: 'Exquisito flan de dulce de leche con crema.',
    shortDescription: 'Con dulce de leche y crema',
    attributes: { seccion: 'Postre' },
  },
  'Lemon Pie': {
    description: 'Torta individual con base crocante, crema de limón y merengue.',
    shortDescription: 'Base crocante, crema de limón',
    attributes: { seccion: 'Postre' },
  },

  // === Bebidas ===
  'Coca-cola original 600ml': { attributes: { seccion: 'Bebida' } },
  'Coca-cola zero 600ml': { attributes: { seccion: 'Bebida' } },
  'Sprite lima-limon 600ml': { attributes: { seccion: 'Bebida' } },
  'Sprite zero lima-limon 600ml': { attributes: { seccion: 'Bebida' } },
  'Fanta naranja 600ml': { attributes: { seccion: 'Bebida' } },
  'Agua Mineral Con Gas 500ml': { attributes: { seccion: 'Bebida' } },
  'Agua mineral sin gas 500ml': { attributes: { seccion: 'Bebida' } },
};

async function main() {
  console.log('\n📝 Enriching Lo de Jesús products with full details\n');

  const tenant = await prisma.tenant.findUnique({ where: { slug: 'lo-de-jesus' } });
  if (!tenant) { console.error('❌ Not found'); return; }

  const products = await prisma.product.findMany({ where: { tenantId: tenant.id } });
  let updated = 0;

  for (const product of products) {
    const enrichment = ENRICHMENTS[product.name];
    if (!enrichment) continue;

    // Build attributes array
    const attrs: any[] = [];
    if (enrichment.attributes) {
      for (const [key, value] of Object.entries(enrichment.attributes)) {
        const labelMap: Record<string, string> = {
          seccion: 'Sección',
          apto_vegano: 'Vegano/Vegetariano',
          apto_celiaco: 'Apto celíaco',
          porciones: 'Porciones',
          tiempo_prep: 'Tiempo aprox.',
          picante: 'Picante',
        };
        attrs.push({
          key,
          label: labelMap[key] || key,
          value: typeof value === 'boolean' ? value : String(value),
          type: typeof value === 'boolean' ? 'boolean' : 'select',
        });
      }
    }

    const updateData: any = {};
    if (enrichment.description) updateData.description = enrichment.description;
    if (enrichment.shortDescription) updateData.shortDescription = enrichment.shortDescription;
    if (attrs.length > 0) updateData.attributes = attrs;
    if (enrichment.isFeatured !== undefined) updateData.isFeatured = enrichment.isFeatured;

    if (Object.keys(updateData).length > 0) {
      await prisma.product.update({
        where: { id: product.id },
        data: updateData,
      });
      updated++;
      console.log(`  ✅ ${product.name}`);
    }
  }

  console.log(`\n✅ Enriched ${updated}/${products.length} products\n`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
