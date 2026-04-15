import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const U = (id: string) => `https://images.unsplash.com/photo-${id}?w=600&h=600&fit=crop`;

// ── Verified Unsplash photo IDs mapped to products ──
// Estilo: warm, editorial, moody — café de especialidad
const PRODUCT_DATA: Record<string, {
  image: string;
  description: string;
  attributes: Record<string, string | boolean>;
}> = {
  // ══════════ CAFÉ DE ESPECIALIDAD ══════════
  'espresso': {
    image: U('1509042239860-f550ce710b93'),
    description: 'Shot doble extraído a 93°C y 9 bar de presión. Crema color avellana, cuerpo denso. Origen rotativo entre fincas de Colombia, Etiopía y Brasil.',
    attributes: { seccion: 'Café', origen: 'Colombia / Etiopía / Brasil (rotativo)', ingredientes: 'Café de especialidad (14g doble)', alergenos: 'Libre de alérgenos', elaboracion: 'Extracción espresso 25-30 seg', temperatura: 'Caliente' },
  },
  'americano': {
    image: U('1572490122747-3968b75cc699'),
    description: 'Espresso doble diluido en agua caliente filtrada. Cuerpo limpio con las notas del grano intactas. Para quienes buscan intensidad sin concentración.',
    attributes: { seccion: 'Café', ingredientes: 'Café de especialidad (14g doble), agua filtrada', alergenos: 'Libre de alérgenos', elaboracion: 'Espresso + agua caliente 200ml', temperatura: 'Caliente' },
  },
  'cortado': {
    image: U('1461023058943-07fcbe16d735'),
    description: 'Espresso cortado con un toque de leche vaporizada. Equilibrio perfecto entre la intensidad del café y la suavidad de la leche.',
    attributes: { seccion: 'Café', ingredientes: 'Café de especialidad (14g doble), leche entera', alergenos: 'Lácteos', elaboracion: 'Espresso + 60ml leche micro-texturizada', temperatura: 'Caliente' },
  },
  'flat white': {
    image: U('1572442388796-11668a67e53d'),
    description: 'Doble ristretto con leche micro-texturizada. Cuerpo sedoso y aterciopelado, sabor intenso. El favorito de los baristas.',
    attributes: { seccion: 'Café', ingredientes: 'Café de especialidad (14g ristretto doble), leche entera', alergenos: 'Lácteos', elaboracion: 'Ristretto doble + leche micro-texturizada 150ml', temperatura: 'Caliente' },
  },
  'cappuccino': {
    image: U('1504630083234-14187a9df0f5'),
    description: 'Espresso doble, leche vaporizada y corona de espuma cremosa. Arte latte en cada taza. Clásico italiano reinterpretado con grano de especialidad.',
    attributes: { seccion: 'Café', ingredientes: 'Café de especialidad (14g doble), leche entera', alergenos: 'Lácteos', elaboracion: 'Espresso + leche vaporizada + espuma 1cm', temperatura: 'Caliente' },
  },
  'latte': {
    image: U('1495474472287-4d71bcdd2085'),
    description: 'Espresso con generosa proporción de leche vaporizada. Suave, cremoso, ideal para el primer café del día. Opción con leche de almendra o avena.',
    attributes: { seccion: 'Café', ingredientes: 'Café de especialidad (14g doble), leche entera (opción vegetal)', alergenos: 'Lácteos (opción sin lácteos disponible)', elaboracion: 'Espresso + leche vaporizada 240ml', temperatura: 'Caliente' },
  },
  'latte de vainilla': {
    image: U('1534687941688-651ccaafbff8'),
    description: 'Latte con jarabe artesanal de vainilla de Madagascar infusionada en casa. Dulzura elegante que complementa sin opacar las notas del café.',
    attributes: { seccion: 'Café', ingredientes: 'Café de especialidad, leche entera, jarabe de vainilla artesanal (azúcar, vainilla de Madagascar)', alergenos: 'Lácteos', elaboracion: 'Espresso + jarabe vainilla 20ml + leche vaporizada', temperatura: 'Caliente' },
  },
  'mocha': {
    image: U('1578314675249-a6910f80cc4e'),
    description: 'Espresso doble, chocolate belga Callebaut fundido y leche vaporizada. Coronado con crema batida artesanal. Indulgencia en taza.',
    attributes: { seccion: 'Café', ingredientes: 'Café de especialidad, chocolate belga 54% cacao, leche entera, crema de leche', alergenos: 'Lácteos, puede contener soja (chocolate)', elaboracion: 'Chocolate fundido + espresso + leche vaporizada + crema batida', temperatura: 'Caliente' },
  },
  'v60 pour over': {
    image: U('1510591509098-f4fdc6d0ff04'),
    description: 'Filtrado manual gota a gota en V60 de cerámica. Resalta notas frutales, florales y cítricas del grano single origin. Servido en jarra para dos tazas.',
    attributes: { seccion: 'Método', ingredientes: 'Café single origin (20g), agua filtrada 320ml', alergenos: 'Libre de alérgenos', elaboracion: 'Molienda media, agua a 96°C, vertido en espiral 3:30 min', tiempo_prep: '5 min', porciones: 'Para 2', origen: 'Single origin rotativo' },
  },
  'aeropress': {
    image: U('1541167760496-1628856ab772'),
    description: 'Método de inmersión y presión manual. Taza limpia con cuerpo concentrado. Ideal para apreciar las notas de un single origin sin filtrar.',
    attributes: { seccion: 'Método', ingredientes: 'Café single origin (17g), agua filtrada 220ml', alergenos: 'Libre de alérgenos', elaboracion: 'Molienda media-fina, inmersión 1:30 + presión 30 seg', tiempo_prep: '4 min', origen: 'Single origin rotativo' },
  },
  'chemex': {
    image: U('1511920170033-f8396924c348'),
    description: 'Filtrado por goteo en Chemex de vidrio con filtro de papel grueso. Taza cristalina, brillante, con notas cítricas y florales pronunciadas. Para dos.',
    attributes: { seccion: 'Método', ingredientes: 'Café single origin (30g), agua filtrada 500ml', alergenos: 'Libre de alérgenos', elaboracion: 'Molienda media-gruesa, vertido en pulsos, 4:30 min total', tiempo_prep: '6 min', porciones: 'Para 2', origen: 'Single origin rotativo' },
  },
  'cold brew nitro': {
    image: U('1587049352846-4a222e784d38'),
    description: 'Café extraído en frío durante 18 horas, infusionado con nitrógeno al servir. Textura aterciopelada tipo stout, microburbujas y crema natural. Sin azúcar.',
    attributes: { seccion: 'Café frío', ingredientes: 'Café de especialidad (extracción fría 18h), nitrógeno', alergenos: 'Libre de alérgenos', elaboracion: 'Inmersión fría 18h, filtrado, nitrogenado en grifo', temperatura: 'Frío' },
  },

  // ══════════ INFUSIONES ══════════
  'té english breakfast': {
    image: U('1563729784474-d77dbb933a9e'),
    description: 'Blend clásico de Ceylon y Assam en hebras sueltas. Cuerpo robusto, maltoso. Perfecto solo o con un toque de leche. Servido en tetera individual.',
    attributes: { seccion: 'Té', ingredientes: 'Té negro Ceylon, té negro Assam (hebras sueltas)', alergenos: 'Libre de alérgenos', elaboracion: 'Infusión 4 min a 95°C, tetera individual', temperatura: 'Caliente' },
  },
  'té earl grey': {
    image: U('1473093295043-cdd812d0e601'),
    description: 'Té negro con aceite esencial de bergamota natural de Calabria. Aromático, cítrico, refinado. Servido en tetera individual.',
    attributes: { seccion: 'Té', ingredientes: 'Té negro, aceite esencial de bergamota', alergenos: 'Libre de alérgenos', elaboracion: 'Infusión 3-4 min a 95°C', temperatura: 'Caliente' },
  },
  'té verde sencha': {
    image: U('1536935338788-846bb9981813'),
    description: 'Té verde japonés de primera cosecha. Notas herbáceas, umami suave y final dulce. Antioxidante natural.',
    attributes: { seccion: 'Té', ingredientes: 'Té verde Sencha japonés (hebras)', alergenos: 'Libre de alérgenos', elaboracion: 'Infusión 2 min a 75°C (no hervir)', temperatura: 'Caliente' },
  },
  'chai latte': {
    image: U('1515823064-d6e0c04616a7'),
    description: 'Té negro Assam cocido con especias frescas — canela de Ceilán, cardamomo verde, jengibre, clavo, pimienta negra — y leche vaporizada. Dulzura con miel.',
    attributes: { seccion: 'Té', ingredientes: 'Té negro Assam, canela, cardamomo, jengibre fresco, clavo, pimienta negra, leche entera, miel', alergenos: 'Lácteos', elaboracion: 'Especias cocidas 5 min, infusión de té, colado, leche vaporizada', temperatura: 'Caliente' },
  },
  'matcha latte': {
    image: U('1573521193826-58c7dc2e13e3'),
    description: 'Matcha ceremonial grado A de Uji, Kioto. Batido con chasen (batidor de bambú) y leche vaporizada. Caliente o frío. Energía sostenida sin crash de cafeína.',
    attributes: { seccion: 'Té', ingredientes: 'Matcha ceremonial de Uji (2g), leche entera (opción vegetal)', alergenos: 'Lácteos (opción sin lácteos)', elaboracion: 'Matcha tamizado, batido con chasen, leche vaporizada', temperatura: 'Caliente o frío' },
  },
  'infusión de frutas': {
    image: U('1507133750040-4a8f57021571'),
    description: 'Blend de hibiscus, frutos rojos deshidratados, manzana y rosa mosqueta. Color rubí intenso, sabor afrutado. Sin cafeína, ideal a toda hora.',
    attributes: { seccion: 'Infusión', ingredientes: 'Hibiscus, frutilla deshidratada, arándano, manzana, rosa mosqueta', alergenos: 'Libre de alérgenos', elaboracion: 'Infusión 5 min a 100°C', temperatura: 'Caliente', apto_vegano: 'Vegano' },
  },
  'chocolate caliente': {
    image: U('1550617931-e17a7b70dce2'),
    description: 'Chocolate belga Callebaut 54% cacao fundido lentamente en leche. Denso, cremoso, reconfortante. Con opción de crema batida artesanal.',
    attributes: { seccion: 'Infusión', ingredientes: 'Chocolate belga 54% cacao, leche entera, crema de leche (opcional)', alergenos: 'Lácteos, puede contener soja', elaboracion: 'Chocolate fundido a baño maría, incorporado a leche caliente', temperatura: 'Caliente' },
  },
  'golden milk': {
    image: U('1563379926898-05f4575a45d8'),
    description: 'Leche de coco con cúrcuma fresca, canela de Ceilán, jengibre, pimienta negra (activa la curcumina) y miel. Antiinflamatorio natural con sabor envolvente.',
    attributes: { seccion: 'Infusión', ingredientes: 'Leche de coco, cúrcuma fresca, canela, jengibre, pimienta negra, miel', alergenos: 'Puede contener frutos secos', elaboracion: 'Especias cocidas en leche de coco 5 min, colado', temperatura: 'Caliente', apto_vegano: 'Vegano' },
  },

  // ══════════ BEBIDAS FRÍAS ══════════
  'cold brew clásico': {
    image: U('1560008581-09826d1de69e'),
    description: 'Café de especialidad extraído en frío durante 18 horas. Suave, bajo en acidez, con notas de chocolate y caramelo. Sin azúcar. Servido con hielo.',
    attributes: { seccion: 'Café frío', ingredientes: 'Café de especialidad (extracción fría 18h), hielo', alergenos: 'Libre de alérgenos', elaboracion: 'Inmersión en agua fría 18h, doble filtrado', temperatura: 'Frío' },
  },
  'iced latte': {
    image: U('1544787219-7f47ccb76574'),
    description: 'Espresso doble vertido sobre hielo con leche fría. Refrescante sin perder la complejidad del café. Opción con leche de avena.',
    attributes: { seccion: 'Café frío', ingredientes: 'Café de especialidad (14g doble), leche fría, hielo', alergenos: 'Lácteos (opción sin lácteos)', elaboracion: 'Espresso sobre hielo + leche fría', temperatura: 'Frío' },
  },
  'iced matcha': {
    image: U('1574856344991-aaa31b6f4ce3'),
    description: 'Matcha ceremonial batido con agua fría, servido sobre hielo con leche. Verde vibrante, refrescante, con L-teanina que da calma y foco.',
    attributes: { seccion: 'Té frío', ingredientes: 'Matcha ceremonial (2g), leche fría, hielo', alergenos: 'Lácteos (opción sin lácteos)', elaboracion: 'Matcha batido en frío + hielo + leche', temperatura: 'Frío' },
  },
  'frapuccino de café': {
    image: U('1606890658317-7d14490b76fd'),
    description: 'Espresso doble blended con hielo, leche y crema. Elegí toffee, chocolate o vainilla. Coronado con crema batida. Indulgencia helada.',
    attributes: { seccion: 'Blended', ingredientes: 'Café de especialidad, leche, hielo, crema, jarabe a elección (toffee/chocolate/vainilla)', alergenos: 'Lácteos', elaboracion: 'Blended en alta velocidad, topped con crema batida', temperatura: 'Frío' },
  },
  'limonada de jengibre y menta': {
    image: U('1559181567-c3190ca9959b'),
    description: 'Limones exprimidos al momento con jengibre fresco rallado y hojas de menta del huerto. Refrescante y digestiva. Sin azúcar refinada — endulzada con agave.',
    attributes: { seccion: 'Sin café', ingredientes: 'Limón exprimido, jengibre fresco, menta fresca, jarabe de agave, agua mineral', alergenos: 'Libre de alérgenos', elaboracion: 'Exprimido al momento, jengibre rallado, menta macerada', temperatura: 'Frío', apto_vegano: 'Vegano' },
  },
  'smoothie de frutos rojos': {
    image: U('1556679343-c7306c1976bc'),
    description: 'Frutillas frescas, arándanos, frambuesas, banana madura y yogur griego. Sin azúcar agregada — la fruta aporta toda la dulzura. Textura espesa.',
    attributes: { seccion: 'Smoothie', ingredientes: 'Frutilla, arándano, frambuesa, banana, yogur griego', alergenos: 'Lácteos', elaboracion: 'Blended con frutas frescas y congeladas', temperatura: 'Frío' },
  },
  'smoothie verde detox': {
    image: U('1576618148400-f54bed99fcfd'),
    description: 'Espinaca baby, banana, mango congelado, jengibre y leche de almendra. Detox sin sacrificar sabor. Rico en fibra, hierro y vitamina C.',
    attributes: { seccion: 'Smoothie', ingredientes: 'Espinaca baby, banana, mango, jengibre fresco, leche de almendra', alergenos: 'Frutos secos (almendra)', elaboracion: 'Blended con frutas congeladas, servido al instante', temperatura: 'Frío', apto_vegano: 'Vegano' },
  },
  'jugo de naranja exprimido': {
    image: U('1622597467836-f3285f2131b8'),
    description: 'Naranjas de estación exprimidas al momento del pedido. 400ml de pura vitamina C. Sin agua, sin azúcar, sin conservantes.',
    attributes: { seccion: 'Jugo natural', ingredientes: '100% naranja exprimida (~5 naranjas)', alergenos: 'Libre de alérgenos', elaboracion: 'Exprimido al momento, sin pasteurizar', temperatura: 'Frío' },
  },

  // ══════════ PASTELERÍA ══════════
  'medialunas de manteca (x3)': {
    image: U('1484723091739-30a097e8f929'),
    description: 'Medialunas artesanales de manteca francesa, hojaldradas en 27 capas, horneadas cada mañana a las 7. Crocantes por fuera, tiernas por dentro. Glaseado sutil de almíbar.',
    attributes: { seccion: 'Pastelería', ingredientes: 'Harina 000, manteca francesa, azúcar, huevo, levadura, almíbar', alergenos: 'Gluten, lácteos, huevo', elaboracion: 'Laminado 27 capas, leudado 12h en frío, horneado 190°C', tiempo_prep: 'Horneadas frescas cada mañana' },
  },
  'croissant de almendras': {
    image: U('1550547660-d9450f859349'),
    description: 'Croissant de manteca relleno de frangipane (crema de almendras) y cubierto con láminas de almendra tostada y azúcar impalpable. Textura crujiente-cremosa.',
    attributes: { seccion: 'Pastelería', ingredientes: 'Croissant de manteca, almendra molida, manteca, azúcar, huevo, almendra fileteada', alergenos: 'Gluten, lácteos, huevo, frutos secos (almendra)', elaboracion: 'Croissant relleno de frangipane, tostado en horno 180°C' },
  },
  'pain au chocolat': {
    image: U('1590301157890-4810ed352733'),
    description: 'Hojaldre francés clásico con dos barras de chocolate belga Callebaut 54% cacao. Laminado artesanal, horneado hasta dorar. El chocolate se funde pero no escapa.',
    attributes: { seccion: 'Pastelería', ingredientes: 'Harina, manteca francesa, chocolate belga 54%, azúcar, huevo, levadura', alergenos: 'Gluten, lácteos, huevo, puede contener soja', elaboracion: 'Laminado 27 capas, barras de chocolate, leudado, horneado 195°C' },
  },
  'budín de limón y amapola': {
    image: U('1504754524776-8f4f37790ca0'),
    description: 'Budín húmedo de limón con semillas de amapola y glaseado de limón natural. Receta de la casa. Cada porción se sirve tibia bajo pedido.',
    attributes: { seccion: 'Pastelería', ingredientes: 'Harina, manteca, azúcar, huevo, limón (ralladura + jugo), semilla de amapola, azúcar impalpable', alergenos: 'Gluten, lácteos, huevo', elaboracion: 'Batido cremado, horneado 170°C 50 min, glaseado al servir' },
  },
  'muffin de arándanos': {
    image: U('1551024506-0bccd828d307'),
    description: 'Muffin artesanal esponjoso con arándanos frescos de la Patagonia y streusel crocante de manteca y canela. Horneado cada mañana.',
    attributes: { seccion: 'Pastelería', ingredientes: 'Harina, manteca, azúcar, huevo, arándano fresco, canela, avena (streusel)', alergenos: 'Gluten, lácteos, huevo', elaboracion: 'Masa con mínimo batido (textura esponjosa), arándanos plegados, streusel, horno 190°C' },
  },
  'scone de queso': {
    image: U('1509365390695-33aee754301f'),
    description: 'Scone salado con queso cheddar madurado y ciboulette fresca. Se sirve tibio con manteca. Textura quebradiza por fuera, tierno por dentro.',
    attributes: { seccion: 'Pastelería', ingredientes: 'Harina, manteca fría, queso cheddar, ciboulette, crema, huevo', alergenos: 'Gluten, lácteos, huevo', elaboracion: 'Masa cortada en frío (no amasada), horno 200°C 18 min' },
  },
  'carrot cake': {
    image: U('1569058242253-92a9c755a0ec'),
    description: 'Torta húmeda de zanahoria rallada, nuez pecán, canela y clavo, con frosting generoso de queso crema Philadelphia. Receta americana clásica.',
    attributes: { seccion: 'Pastelería', ingredientes: 'Zanahoria, harina, huevo, aceite, azúcar, nuez pecán, canela, clavo, queso crema, manteca, azúcar impalpable', alergenos: 'Gluten, lácteos, huevo, frutos secos (nuez)', elaboracion: 'Masa húmeda horneada, frosting de queso crema montado' },
  },
  'banana bread': {
    image: U('1558961363-fa8fdf82db35'),
    description: 'Pan de banana ultra húmedo con nueces tostadas y chips de chocolate belga. Hecho con bananas bien maduras para máxima dulzura natural. Porción generosa.',
    attributes: { seccion: 'Pastelería', ingredientes: 'Banana madura, harina, manteca, azúcar mascabo, huevo, nuez, chips de chocolate', alergenos: 'Gluten, lácteos, huevo, frutos secos (nuez)', elaboracion: 'Bananas pisadas, masa con mínimo batido, horno 170°C 55 min', apto_vegano: 'Vegetariano' },
  },
  'alfajor de maicena artesanal': {
    image: U('1548943487-a2e4e43b4853'),
    description: 'Alfajor de maicena clásico argentino con dulce de leche colonial espeso y coco rallado. Tapas que se deshacen en la boca. Hechos a mano, en tandas chicas.',
    attributes: { seccion: 'Pastelería', ingredientes: 'Maicena, harina, manteca, azúcar impalpable, yema, dulce de leche, coco rallado', alergenos: 'Gluten, lácteos, huevo', elaboracion: 'Tapas horneadas 160°C 10 min, rellenas de dulce de leche, rebozadas en coco' },
  },
  'cookie de chocolate chunk': {
    image: U('1499636136210-6f4ee915583e'),
    description: 'Cookie XXL (120g) con trozos irregulares de chocolate belga 70% y escamas de sal marina Maldon. Bordes crocantes, centro chewy. La firma de la casa.',
    attributes: { seccion: 'Pastelería', ingredientes: 'Manteca, azúcar mascabo, huevo, harina, chocolate belga 70%, sal Maldon, extracto de vainilla', alergenos: 'Gluten, lácteos, huevo, puede contener soja', elaboracion: 'Masa reposada 24h en frío, horneada 180°C 12 min (centro sin cocción completa)' },
  },

  // ══════════ DESAYUNOS & MERIENDAS ══════════
  'desayuno origen': {
    image: U('1517248135467-4c7edcad34c4'),
    description: 'El desayuno insignia de la casa. Café de especialidad o té en hebras + 3 medialunas de manteca recién horneadas + jugo de naranja exprimido al momento.',
    attributes: { seccion: 'Desayuno', porciones: 'Individual', ingredientes: 'Café o té a elección, 3 medialunas de manteca, jugo de naranja exprimido', alergenos: 'Gluten, lácteos, huevo', elaboracion: 'Preparado al momento del pedido' },
  },
  'desayuno tostadas': {
    image: U('1523049673857-eb18f1d7b578'),
    description: 'Café o té + 2 tostadas gruesas de pan de masa madre (fermentación 48h) con manteca bretona y mermelada artesanal de estación + jugo de naranja.',
    attributes: { seccion: 'Desayuno', porciones: 'Individual', ingredientes: 'Café o té, pan de masa madre, manteca, mermelada artesanal, jugo de naranja', alergenos: 'Gluten, lácteos', elaboracion: 'Pan tostado al momento, mermelada de estación' },
  },
  'desayuno saludable': {
    image: U('1585032226651-759b368d7246'),
    description: 'Matcha latte o té verde + bowl de yogur griego con granola casera (avena, miel, almendras) y frutas de estación cortadas al momento.',
    attributes: { seccion: 'Desayuno', porciones: 'Individual', ingredientes: 'Matcha o té verde, yogur griego, granola artesanal (avena, almendras, miel), frutas de estación', alergenos: 'Lácteos, frutos secos, gluten (granola)', elaboracion: 'Bowl armado al momento con frutas frescas cortadas' },
  },
  'desayuno para dos': {
    image: U('1414235077428-338989a2e8c0'),
    description: '2 cafés o tés a elección + 6 medialunas de manteca + 2 jugos de naranja exprimidos + porción de torta del día a elección. Para compartir con alguien especial.',
    attributes: { seccion: 'Desayuno', porciones: 'Para 2', ingredientes: '2 cafés/tés, 6 medialunas, 2 jugos, 1 porción torta del día', alergenos: 'Gluten, lácteos, huevo', elaboracion: 'Servido en bandeja de madera, todo preparado al momento' },
  },
  'merienda completa': {
    image: U('1476224203421-9ac39bcb3327'),
    description: 'Café de especialidad o té en hebras + scone de queso tibio o pieza de pastelería dulce a elección. La pausa de las 17h que tu día necesita.',
    attributes: { seccion: 'Merienda', porciones: 'Individual', ingredientes: 'Café o té a elección + pastelería a elección', alergenos: 'Gluten, lácteos (varía según elección)', elaboracion: 'Preparado al momento' },
  },
  'tostadas de masa madre con palta': {
    image: U('1512621776951-a57141f2eefd'),
    description: '2 tostadas de masa madre (fermentación 48h) con palta Hass machacada, tomate cherry cortado, mix de semillas (chía, sésamo, lino) y aceite de oliva virgen extra.',
    attributes: { seccion: 'Desayuno', ingredientes: 'Pan de masa madre, palta Hass, tomate cherry, semillas (chía, sésamo, lino), aceite de oliva, sal marina, pimienta', alergenos: 'Gluten, semillas', elaboracion: 'Palta machacada al momento, pan tostado, ensamblado fresco', apto_vegano: 'Vegano' },
  },
  'yogur con granola y frutas': {
    image: U('1559056199-641a0ac8b55e'),
    description: 'Yogur griego cremoso con granola casera (avena, almendras, coco, miel de abejas) y frutas de estación cortadas al momento. Textura y frescura en cada cucharada.',
    attributes: { seccion: 'Desayuno', ingredientes: 'Yogur griego, granola artesanal (avena, almendra, coco, miel), frutas de estación', alergenos: 'Lácteos, gluten, frutos secos', elaboracion: 'Armado al momento, frutas cortadas frescas' },
  },
  'avena overnight': {
    image: U('1557142046-c704a3adf364'),
    description: 'Avena remojada toda la noche en leche de almendra con chía, banana, manteca de maní y canela. Servida fría. Preparada ayer para que hoy sea perfecta.',
    attributes: { seccion: 'Desayuno', ingredientes: 'Avena arrollada, leche de almendra, semillas de chía, banana, manteca de maní, canela', alergenos: 'Frutos secos (almendra, maní), gluten (avena)', elaboracion: 'Remojada 12h en frío, servida con toppings frescos', apto_vegano: 'Vegano' },
  },

  // ══════════ BRUNCH ══════════
  'eggs benedict': {
    image: U('1579888944880-d98341245702'),
    description: 'Muffin inglés tostado, jamón cocido artesanal, 2 huevos poché con yema líquida y salsa hollandaise de manteca clarificada y limón. Con ensalada de rúcula.',
    attributes: { seccion: 'Brunch', ingredientes: 'Muffin inglés, jamón cocido, huevo (x2), manteca, yema, limón, rúcula', alergenos: 'Gluten, lácteos, huevo', elaboracion: 'Huevos poché 3 min, hollandaise emulsionada al momento, ensamblado inmediato' },
  },
  'avocado toast premium': {
    image: U('1603569283847-aa295f0d016a'),
    description: 'Pan de masa madre tostado, palta Hass en láminas, huevo poché con yema líquida, salmón ahumado en frío, semillas de sésamo negro y microgreens del vivero local.',
    attributes: { seccion: 'Brunch', ingredientes: 'Pan masa madre, palta Hass, huevo, salmón ahumado, sésamo negro, microgreens, aceite de oliva', alergenos: 'Gluten, huevo, pescado, semillas', elaboracion: 'Pan tostado, palta en láminas, huevo poché 3 min, salmón ahumado, ensamblado' },
  },
  'tostado francés': {
    image: U('1565958011703-44f9829ba187'),
    description: 'Brioche artesanal sumergido en huevo con vainilla, caramelizado en plancha con manteca. Servido con frutos rojos frescos, crema chantilly y miel orgánica.',
    attributes: { seccion: 'Brunch', ingredientes: 'Brioche artesanal, huevo, leche, vainilla, manteca, frutos rojos, crema, miel', alergenos: 'Gluten, lácteos, huevo', elaboracion: 'Brioche en mezcla de huevo+leche+vainilla, cocido en plancha con manteca a fuego medio' },
  },
  'shakshuka': {
    image: U('1540914124281-342587941389'),
    description: 'Huevos pochados en salsa de tomate especiada con pimentón, comino y harissa. Queso feta desmenuzado y cilantro fresco. Servido en sartén de hierro con pan de masa madre.',
    attributes: { seccion: 'Brunch', ingredientes: 'Huevo (x2), tomate, pimentón, comino, harissa, cebolla, ajo, queso feta, cilantro, pan masa madre', alergenos: 'Huevo, lácteos (feta), gluten (pan)', elaboracion: 'Salsa cocida 15 min, huevos pochados en la salsa, servido en sartén de hierro' },
  },
  'pancakes de ricota': {
    image: U('1567620905732-2d1ec7ab7445'),
    description: 'Stack de 3 pancakes extra esponjosos de ricota fresca (no mezcla comercial). Con maple canadiense puro, banana caramelizada en manteca y nueces tostadas.',
    attributes: { seccion: 'Brunch', ingredientes: 'Ricota fresca, harina, huevo, leche, maple puro, banana, manteca, nuez', alergenos: 'Gluten, lácteos, huevo, frutos secos (nuez)', elaboracion: 'Ricota incorporada a la masa (esponjosidad), cocidos en plancha, banana caramelizada al momento' },
  },
  'omelette de hongos y brie': {
    image: U('1525351484163-7529414344d8'),
    description: 'Omelette francés (huevos batidos suavemente, sin dorar) relleno de hongos de pino salteados en manteca, brie fundido y rúcula fresca. Textura baveuse.',
    attributes: { seccion: 'Brunch', ingredientes: 'Huevo (x3), hongos de pino, queso brie, manteca, rúcula, sal, pimienta', alergenos: 'Huevo, lácteos', elaboracion: 'Técnica francesa: fuego medio-bajo, movimiento constante, relleno antes de plegar, punto baveuse' },
  },
  'waffle salado': {
    image: U('1586985289688-ca3cf47d3e6e'),
    description: 'Waffle belga crujiente con salmón ahumado en frío, queso crema batido con eneldo, alcaparras, cebolla morada en pickle y ciboulette.',
    attributes: { seccion: 'Brunch', ingredientes: 'Masa de waffle (harina, manteca, huevo, levadura), salmón ahumado, queso crema, alcaparras, cebolla morada, eneldo, ciboulette', alergenos: 'Gluten, lácteos, huevo, pescado', elaboracion: 'Waffle en wafflera belga, toppings armados al momento' },
  },
  'bowl acai': {
    image: U('1594631252845-29fc4cc8cde9'),
    description: 'Base de açaí orgánico brasileño blended con banana congelada. Topped con granola casera, coco rallado, banana fresca, frutillas y miel de abejas.',
    attributes: { seccion: 'Brunch', ingredientes: 'Açaí orgánico, banana, granola casera, coco rallado, frutilla, miel', alergenos: 'Frutos secos (granola), gluten (granola)', elaboracion: 'Açaí + banana congelada blended, bowl armado con toppings frescos', apto_vegano: 'Vegano' },
  },

  // ══════════ TOSTADOS & SÁNDWICHES ══════════
  'tostado de jamón y queso': {
    image: U('1528735602780-2552fd46c7af'),
    description: 'Pan de masa madre (fermentación 48h) con jamón cocido natural y queso gruyère suizo fundido en plancha de hierro. Simple, honesto, perfecto.',
    attributes: { seccion: 'Tostado', ingredientes: 'Pan de masa madre, jamón cocido, queso gruyère', alergenos: 'Gluten, lácteos', elaboracion: 'Tostado en plancha de hierro hasta que el queso funda y el pan dore' },
  },
  'tostado caprese': {
    image: U('1548340748-6d2b7d7da280'),
    description: 'Pan ciabatta, mozzarella fior di latte en rodajas, tomate en rama, albahaca fresca y pesto genovés casero. Tostado suave para fundir la mozzarella.',
    attributes: { seccion: 'Tostado', ingredientes: 'Ciabatta, mozzarella fior di latte, tomate, albahaca, pesto (albahaca, piñón, parmesano, ajo, oliva)', alergenos: 'Gluten, lácteos, frutos secos (piñón)', elaboracion: 'Tostado suave en plancha, pesto agregado post-cocción', apto_vegano: 'Vegetariano' },
  },
  'croque monsieur': {
    image: U('1582576163090-09d3b6f8a969'),
    description: 'Clásico parisino: pan brioche, jamón cocido, gruyère rallado y bechamel casera gratinada en horno. Exterior crujiente dorado, interior cremoso fundente.',
    attributes: { seccion: 'Tostado', ingredientes: 'Pan brioche, jamón cocido, queso gruyère, bechamel (leche, manteca, harina, nuez moscada)', alergenos: 'Gluten, lácteos', elaboracion: 'Ensamblado, bechamel por encima, gratinado en horno 220°C hasta dorar' },
  },
  'sándwich de salmón ahumado': {
    image: U('1473093226795-af9932fe5856'),
    description: 'Pan de centeno oscuro, salmón ahumado en frío artesanal, queso crema batido con eneldo, cebolla morada en aros finos, alcaparras y rúcula baby.',
    attributes: { seccion: 'Sándwich', ingredientes: 'Pan de centeno, salmón ahumado, queso crema, eneldo, cebolla morada, alcaparras, rúcula', alergenos: 'Gluten, lácteos, pescado', elaboracion: 'Pan tostado suave, queso crema untado, salmón en láminas, toppings frescos' },
  },
  'club sándwich': {
    image: U('1540189549336-e6e99c3679fe'),
    description: 'Triple piso: pollo grillé marinado, panceta crocante, huevo duro, lechuga, tomate y mayonesa de la casa. En pan de molde tostado. Un clásico que no falla.',
    attributes: { seccion: 'Sándwich', ingredientes: 'Pan de molde, pollo, panceta, huevo, lechuga, tomate, mayonesa casera', alergenos: 'Gluten, huevo', elaboracion: 'Pollo grillé, panceta en plancha, huevo duro, ensamblado triple' },
  },
  'wrap veggie': {
    image: U('1626700051175-6818013e1d4f'),
    description: 'Tortilla integral con hummus casero (garbanzos, tahini, limón), palta en láminas, zanahoria rallada, pepino, rúcula y semillas de sésamo.',
    attributes: { seccion: 'Sándwich', ingredientes: 'Tortilla integral, hummus (garbanzo, tahini, limón, ajo), palta, zanahoria, pepino, rúcula, sésamo', alergenos: 'Gluten, semillas (sésamo)', elaboracion: 'Hummus casero, vegetales frescos cortados, enrollado y tostado suave', apto_vegano: 'Vegano' },
  },
  'bagel con queso crema y salmón': {
    image: U('1560512823-829485b8bf24'),
    description: 'Bagel artesanal (hervido + horneado, corteza firme) con queso crema Philadelphia batido, salmón ahumado, alcaparras y eneldo fresco.',
    attributes: { seccion: 'Sándwich', ingredientes: 'Bagel artesanal, queso crema, salmón ahumado, alcaparras, eneldo', alergenos: 'Gluten, lácteos, pescado', elaboracion: 'Bagel tostado, queso crema untado generoso, salmón en láminas' },
  },

  // ══════════ ENSALADAS & BOWLS ══════════
  'ensalada origen': {
    image: U('1505253758473-96b7015fcd40'),
    description: 'La ensalada de la casa: mix de verdes (rúcula, espinaca baby, lechuga mantecosa), pollo grillé en fetas, palta, tomate cherry, huevo poché y vinagreta de mostaza Dijon.',
    attributes: { seccion: 'Ensalada', ingredientes: 'Mix de verdes, pollo grillé, palta, tomate cherry, huevo, vinagreta (oliva, mostaza Dijon, limón, miel)', alergenos: 'Huevo, mostaza', elaboracion: 'Pollo grillé en plancha, huevo poché, vinagreta emulsionada al momento' },
  },
  'ensalada de salmón y palta': {
    image: U('1502741126161-b048400d085d'),
    description: 'Mix de verdes, salmón ahumado en frío en láminas generosas, palta Hass, pepino, edamame desgranado y dressing de sésamo tostado con jengibre.',
    attributes: { seccion: 'Ensalada', ingredientes: 'Mix de verdes, salmón ahumado, palta, pepino, edamame, dressing (sésamo, soja, jengibre, mirin)', alergenos: 'Pescado, soja, semillas (sésamo)', elaboracion: 'Vegetales frescos, salmón en láminas, dressing emulsionado' },
  },
  'bowl mediterráneo': {
    image: U('1546069901-ba9599a7e63c'),
    description: 'Quinoa cocida, falafel casero (garbanzo, cilantro, comino), hummus, tabulé de perejil con trigo burgol, pepino, tomate y salsa tahini con limón.',
    attributes: { seccion: 'Bowl', ingredientes: 'Quinoa, falafel (garbanzo, cilantro, comino), hummus, tabulé (perejil, burgol, tomate), tahini, limón', alergenos: 'Gluten (burgol), semillas (sésamo/tahini)', elaboracion: 'Falafel horneado (no frito), quinoa cocida, componentes ensamblados al momento', apto_vegano: 'Vegano' },
  },
  'poke bowl de salmón': {
    image: U('1553909489-cd47e0907980'),
    description: 'Arroz de sushi, salmón fresco cortado en cubos marinado en soja y sésamo, palta, edamame, mango fresco, cebolla de verdeo y salsa ponzu con sriracha.',
    attributes: { seccion: 'Bowl', ingredientes: 'Arroz de sushi, salmón fresco, palta, edamame, mango, cebolla de verdeo, ponzu, sésamo, sriracha', alergenos: 'Pescado, soja, semillas (sésamo)', elaboracion: 'Salmón marinado 30 min en soja+sésamo, arroz sazonado, bowl ensamblado al momento' },
  },
  'bowl de pollo teriyaki': {
    image: U('1612929633738-8fe44f7ec841'),
    description: 'Arroz jazmín, pollo grillé con glaseado teriyaki casero (soja, mirin, jengibre), palta en láminas, zanahoria encurtida en vinagre de arroz y sésamo negro.',
    attributes: { seccion: 'Bowl', ingredientes: 'Arroz jazmín, pollo, salsa teriyaki (soja, mirin, jengibre, azúcar), palta, zanahoria, vinagre de arroz, sésamo', alergenos: 'Soja, semillas (sésamo)', elaboracion: 'Pollo grillé y glaseado con teriyaki, zanahoria encurtida 2h, bowl ensamblado' },
  },
  'ensalada caesar': {
    image: U('1546793665-c74683f339c1'),
    description: 'Lechuga romana crocante, pollo grillé en fetas, croutons de masa madre tostados en manteca de ajo, parmesano en lascas y aderezo Caesar casero (anchoa, ajo, limón, mostaza).',
    attributes: { seccion: 'Ensalada', ingredientes: 'Lechuga romana, pollo grillé, croutons de masa madre, parmesano reggiano, aderezo (anchoa, ajo, limón, mostaza, huevo, oliva)', alergenos: 'Gluten (croutons), lácteos, huevo, pescado (anchoa), mostaza', elaboracion: 'Aderezo emulsionado al momento, croutons tostados en manteca de ajo, pollo grillé' },
  },

  // ══════════ POSTRES ══════════
  'tiramisú': {
    image: U('1571877227200-a0d98ea607e9'),
    description: 'Tiramisú clásico preparado con café de especialidad de la casa (no instantáneo). Vainillas embebidas, crema de mascarpone italiano, cacao amargo espolvoreado. Reposa 24h.',
    attributes: { seccion: 'Postre', ingredientes: 'Mascarpone italiano, huevo, azúcar, café de especialidad, vainillas, cacao amargo', alergenos: 'Gluten, lácteos, huevo', elaboracion: 'Crema de mascarpone montada, vainillas en café frío, capas alternadas, reposo 24h en frío' },
  },
  'cheesecake de frutos rojos': {
    image: U('1484980972926-edee96e0960d'),
    description: 'Cheesecake estilo New York: base de galleta de manteca, relleno cremoso de queso crema horneado y coulis de frutos rojos (frutilla, frambuesa, arándano).',
    attributes: { seccion: 'Postre', ingredientes: 'Queso crema, crema de leche, huevo, azúcar, vainilla, galleta de manteca, frutilla, frambuesa, arándano', alergenos: 'Gluten, lácteos, huevo', elaboracion: 'Base prensada, relleno horneado a baño maría 160°C 50 min, coulis cocido aparte, reposo 12h' },
  },
  'brownie tibio con helado': {
    image: U('1606313564200-e75d5e30476c'),
    description: 'Brownie denso de chocolate belga 70% cacao, servido tibio con helado de vainilla artesanal y salsa de chocolate caliente. Centro fundente, bordes crocantes.',
    attributes: { seccion: 'Postre', ingredientes: 'Chocolate belga 70%, manteca, huevo, azúcar, harina mínima, helado de vainilla, salsa de chocolate', alergenos: 'Gluten, lácteos, huevo, puede contener soja', elaboracion: 'Chocolate fundido con manteca, mínima harina, horno 180°C 22 min (centro sin cocción completa), tibio al servir' },
  },
  'crème brûlée': {
    image: U('1624353365286-3f8d62daad51'),
    description: 'Crema de vainilla de Madagascar cocida a fuego lento, con costra de azúcar quemada al soplete al momento de servir. Contraste cremoso-crocante.',
    attributes: { seccion: 'Postre', ingredientes: 'Crema de leche, yema de huevo, azúcar, vainilla de Madagascar', alergenos: 'Lácteos, huevo', elaboracion: 'Crema cocida a baño maría 150°C 45 min, reposada 6h, azúcar quemada al soplete al servir' },
  },
  'affogato': {
    image: U('1508737804141-4c3b688e2546'),
    description: 'Helado de vainilla artesanal ahogado en un espresso doble de especialidad recién extraído. Dos mundos que chocan: frío cremoso + caliente amargo. Servido al instante.',
    attributes: { seccion: 'Postre', ingredientes: 'Helado de vainilla artesanal, café de especialidad (espresso doble)', alergenos: 'Lácteos', elaboracion: 'Espresso extraído al momento, vertido sobre helado, servido inmediato' },
  },
  'tarta de manzana tibia': {
    image: U('1562440499-64c9a111f713'),
    description: 'Tarta de masa quebrada con manzanas verdes caramelizadas en canela y manteca, servida tibia con crema chantilly. Receta clásica francesa de la casa.',
    attributes: { seccion: 'Postre', ingredientes: 'Masa quebrada (harina, manteca, azúcar), manzana verde, canela, manteca, azúcar, crema chantilly', alergenos: 'Gluten, lácteos, huevo', elaboracion: 'Manzanas caramelizadas en manteca+canela, tarta horneada 180°C, servida tibia' },
  },

  // ══════════ PARA LLEVAR ══════════
  'café en grano 250g': {
    image: U('1498804103079-a6351b050096'),
    description: 'Blend de la casa: granos de Colombia (Huila) y Brasil (Cerrado), tueste medio. Notas de chocolate con leche, caramelo y cítricos suaves. Tostado semanal en micro-lote.',
    attributes: { seccion: 'Granos', origen: 'Colombia Huila + Brasil Cerrado', ingredientes: '100% café arábica, tueste medio', elaboracion: 'Tostado artesanal semanal en lotes de 5kg, empacado con válvula desgasificadora', nota_barista: 'Ideal para espresso y moka. Moler justo antes de preparar.' },
  },
  'café en grano 1kg': {
    image: U('1587314168485-3236d6710814'),
    description: 'Blend de la casa en formato kilo. Mismo perfil que el 250g: Colombia + Brasil, tueste medio. Ideal para oficinas, hogares cafeteros o regalos corporativos.',
    attributes: { seccion: 'Granos', origen: 'Colombia Huila + Brasil Cerrado', ingredientes: '100% café arábica, tueste medio', elaboracion: 'Tostado semanal, empacado con válvula, fecha de tueste visible' },
  },
  'café single origin 250g': {
    image: U('1551106652-a5bcf4b29ab6'),
    description: 'Origen único rotativo del mes. Variedades Geisha, Bourbon o Caturra según disponibilidad. Tueste claro para maximizar las notas del terroir. Para métodos de filtrado.',
    attributes: { seccion: 'Granos', origen: 'Rotativo (consultá el origen del mes)', ingredientes: '100% café arábica single origin, tueste claro', elaboracion: 'Tostado en micro-lote, empacado con ficha de origen y notas de cata', nota_barista: 'Recomendado para V60, Chemex o Aeropress. No ideal para espresso.' },
  },
  'granola artesanal 400g': {
    image: U('1559056199-641a0ac8b55e'),
    description: 'Nuestra granola de la casa en frasco para llevar. Avena arrollada, almendras, nueces, coco, arándanos y miel de abejas. Horneada lenta a baja temperatura.',
    attributes: { seccion: 'Despensa', ingredientes: 'Avena arrollada, almendra, nuez, coco rallado, arándano, miel de abejas, aceite de coco, canela', alergenos: 'Gluten (avena), frutos secos', elaboracion: 'Horneada a 150°C durante 40 min, enfriada y envasada en frasco de vidrio' },
  },
  'mermelada artesanal': {
    image: U('1563805042-7684c019e1cb'),
    description: 'Frasco 300g. Tres sabores rotativos: frutos rojos (frutilla, frambuesa), durazno de estación o naranja amarga. Cocción lenta, sin conservantes artificiales.',
    attributes: { seccion: 'Despensa', ingredientes: 'Fruta de estación (70%), azúcar, jugo de limón', alergenos: 'Libre de alérgenos', elaboracion: 'Cocción lenta en olla de cobre 45 min, envasado en caliente, sin conservantes' },
  },
  'alfajores artesanales (x6)': {
    image: U('1574085733277-851d9d856a3a'),
    description: 'Caja regalo de 6 alfajores de maicena artesanales. Tapas que se deshacen, dulce de leche colonial espeso, rebozados en coco rallado. Packaging kraft con moño.',
    attributes: { seccion: 'Despensa', ingredientes: 'Maicena, harina, manteca, azúcar impalpable, yema, dulce de leche, coco rallado', alergenos: 'Gluten, lácteos, huevo', elaboracion: 'Tapas horneadas a 160°C, rellenas de dulce de leche, rebozadas en coco, empacadas en caja kraft' },
  },
};

async function main() {
  console.log('\n🖼️  Updating Café Origen — images, descriptions & fichas\n');

  const tenant = await prisma.tenant.findUnique({ where: { slug: 'cafe-origen' } });
  if (!tenant) {
    console.error('❌ Tenant cafe-origen not found');
    return;
  }

  const products = await prisma.product.findMany({
    where: { tenantId: tenant.id },
    include: { images: true },
  });

  let imagesAdded = 0;
  let descriptionsUpdated = 0;
  let notFound = 0;

  for (const product of products) {
    const key = product.name.toLowerCase();
    const data = PRODUCT_DATA[key];

    if (!data) {
      console.log(`  ⚠️  No data for: ${product.name}`);
      notFound++;
      continue;
    }

    // Update description + attributes
    const attrs = Object.entries(data.attributes).map(([k, value]) => ({
      key: k,
      label: k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, ' '),
      value: typeof value === 'boolean' ? value : String(value),
      type: typeof value === 'boolean' ? 'boolean' : 'select',
    }));

    await prisma.product.update({
      where: { id: product.id },
      data: {
        description: data.description,
        attributes: attrs,
      },
    });
    descriptionsUpdated++;

    // Add image if not already present
    if (product.images.length === 0) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: data.image,
          alt: product.name,
          order: 0,
          isPrimary: true,
        },
      });
      imagesAdded++;
    }
  }

  console.log(`\n✅ Descriptions updated: ${descriptionsUpdated}`);
  console.log(`✅ Images added: ${imagesAdded}`);
  if (notFound > 0) console.log(`⚠️  Not matched: ${notFound}`);
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
