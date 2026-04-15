/**
 * Example services/products seeded on registration per industry.
 * Helps new users understand the system by editing rather than creating from scratch.
 *
 * Rules:
 * - 4 examples per rubro (even number for clean grid display)
 * - Realistic names, prices, and descriptions for the Argentine market
 * - Each example includes a placeholder image URL by rubro
 * - Services: include duration (minutes)
 * - Products: include stock and short description
 */

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://turnolink.com.ar';

interface ServiceExample {
  name: string;
  description: string;
  price: number;
  duration: number;
}

interface ProductExample {
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  stock: number;
}

interface OnboardingExamples {
  type: 'services' | 'products';
  placeholderImage: string;
  services?: ServiceExample[];
  products?: ProductExample[];
}

// Rubro → placeholder image mapping
const PLACEHOLDER_IMAGES: Record<string, string> = {
  'estetica-belleza': '/placeholders/belleza.svg',
  'barberia': '/placeholders/barberia.svg',
  'masajes-spa': '/placeholders/spa.svg',
  'salud': '/placeholders/salud.svg',
  'odontologia': '/placeholders/salud.svg',
  'psicologia': '/placeholders/salud.svg',
  'nutricion': '/placeholders/salud.svg',
  'veterinaria': '/placeholders/veterinaria.svg',
  'fitness': '/placeholders/fitness.svg',
  'deportes': '/placeholders/deportes.svg',
  'hospedaje': '/placeholders/hospedaje.svg',
  'alquiler': '/placeholders/hospedaje.svg',
  'espacios': '/placeholders/espacios.svg',
  'educacion': '/placeholders/educacion.svg',
  'consultoria': '/placeholders/consultoria.svg',
  'tatuajes-piercing': '/placeholders/tatuajes.svg',
  'inmobiliarias': '/placeholders/mercado.svg',
  'mercado': '/placeholders/mercado.svg',
};

function getPlaceholderUrl(rubro: string): string {
  const path = PLACEHOLDER_IMAGES[rubro] || '/placeholders/default.svg';
  return `${SITE_URL}${path}`;
}

const SERVICE_RUBROS: Record<string, ServiceExample[]> = {
  'estetica-belleza': [
    { name: 'Corte de pelo', description: 'Corte personalizado con lavado y secado. Consultá estilos y tendencias.', price: 8500, duration: 45 },
    { name: 'Color completo', description: 'Coloración global con productos profesionales. Incluye diagnóstico capilar.', price: 18000, duration: 90 },
    { name: 'Brushing', description: 'Lavado y secado con cepillo. Liso, ondas o volumen según tu preferencia.', price: 6000, duration: 30 },
    { name: 'Manicura semipermanente', description: 'Esmaltado semipermanente con preparación de uñas. Duración: 3 semanas.', price: 7000, duration: 40 },
  ],
  'barberia': [
    { name: 'Corte clásico', description: 'Corte a tijera o máquina con terminación prolija. Incluye lavado.', price: 7000, duration: 30 },
    { name: 'Barba completa', description: 'Perfilado y afeitado con navaja. Incluye toalla caliente y bálsamo.', price: 5000, duration: 25 },
    { name: 'Corte + Barba', description: 'Combo completo: corte de pelo y perfilado de barba. El pack más elegido.', price: 10000, duration: 50 },
    { name: 'Cejas y perfilado', description: 'Diseño y perfilado de cejas con cera o pinza. Acabado natural.', price: 3000, duration: 15 },
  ],
  'masajes-spa': [
    { name: 'Masaje descontracturante', description: 'Sesión enfocada en zonas de tensión: cuello, espalda y hombros.', price: 12000, duration: 60 },
    { name: 'Masaje relajante', description: 'Masaje suave de cuerpo completo con aceites esenciales. Ideal para desconectar.', price: 10000, duration: 50 },
    { name: 'Limpieza facial profunda', description: 'Limpieza con extracción, exfoliación y máscara hidratante.', price: 9000, duration: 45 },
    { name: 'Reflexología podal', description: 'Masaje terapéutico en pies que estimula puntos de todo el cuerpo.', price: 8000, duration: 40 },
  ],
  'salud': [
    { name: 'Consulta inicial', description: 'Primera consulta con evaluación completa y plan de tratamiento.', price: 15000, duration: 40 },
    { name: 'Sesión de seguimiento', description: 'Control de evolución y ajuste de tratamiento según progreso.', price: 10000, duration: 30 },
    { name: 'Estudio complementario', description: 'Estudio diagnóstico en consultorio. Resultados en 48hs.', price: 8000, duration: 20 },
    { name: 'Certificado médico', description: 'Revisión general y emisión de certificado apto físico.', price: 6000, duration: 20 },
  ],
  'odontologia': [
    { name: 'Limpieza dental', description: 'Limpieza con ultrasonido y pulido. Incluye control general.', price: 12000, duration: 40 },
    { name: 'Consulta odontológica', description: 'Revisión completa con diagnóstico y plan de tratamiento.', price: 8000, duration: 30 },
    { name: 'Blanqueamiento', description: 'Blanqueamiento dental profesional con luz LED. Resultados inmediatos.', price: 35000, duration: 60 },
    { name: 'Extracción simple', description: 'Extracción de pieza dental con anestesia local. Control post incluido.', price: 15000, duration: 30 },
  ],
  'psicologia': [
    { name: 'Sesión individual', description: 'Sesión de psicoterapia individual. Presencial o por videollamada.', price: 12000, duration: 50 },
    { name: 'Primera entrevista', description: 'Entrevista inicial para conocerte y definir objetivos terapéuticos.', price: 10000, duration: 60 },
    { name: 'Sesión de pareja', description: 'Terapia de pareja. Espacio seguro para trabajar la relación.', price: 18000, duration: 60 },
    { name: 'Orientación vocacional', description: 'Proceso de 3 encuentros para definir tu camino profesional.', price: 15000, duration: 50 },
  ],
  'nutricion': [
    { name: 'Consulta nutricional', description: 'Evaluación antropométrica, análisis de hábitos y plan alimentario.', price: 12000, duration: 45 },
    { name: 'Control mensual', description: 'Seguimiento de progreso, ajuste de plan y nuevas recetas.', price: 8000, duration: 30 },
    { name: 'Plan deportivo', description: 'Plan nutricional especializado para deportistas. Con suplementación.', price: 15000, duration: 50 },
    { name: 'Consulta online', description: 'Consulta por videollamada con envío de plan por email.', price: 10000, duration: 40 },
  ],
  'veterinaria': [
    { name: 'Consulta veterinaria', description: 'Revisión general de tu mascota con control de peso y vacunas.', price: 8000, duration: 30 },
    { name: 'Vacunación', description: 'Aplicación de vacuna con revisión previa. Carnet sanitario incluido.', price: 6000, duration: 20 },
    { name: 'Baño y corte', description: 'Baño completo con secado, corte higiénico y limpieza de oídos.', price: 10000, duration: 60 },
    { name: 'Desparasitación', description: 'Desparasitación interna y externa. Control de peso incluido.', price: 5000, duration: 15 },
  ],
  'fitness': [
    { name: 'Clase grupal', description: 'Clase de entrenamiento funcional en grupo reducido (máx. 8 personas).', price: 5000, duration: 50 },
    { name: 'Entrenamiento personal', description: 'Sesión one-on-one con planificación personalizada.', price: 12000, duration: 60 },
    { name: 'Evaluación física', description: 'Test de condición física, mediciones y armado de rutina.', price: 8000, duration: 45 },
    { name: 'Clase de yoga', description: 'Sesión de yoga para todos los niveles. Incluye meditación guiada.', price: 5000, duration: 60 },
  ],
  'deportes': [
    { name: 'Cancha de fútbol 5', description: 'Alquiler de cancha de césped sintético con iluminación.', price: 25000, duration: 60 },
    { name: 'Cancha de pádel', description: 'Cancha de pádel con iluminación. Paletas disponibles en alquiler.', price: 18000, duration: 90 },
    { name: 'Clase de tenis', description: 'Clase individual con profesor. Incluye uso de cancha y pelotas.', price: 15000, duration: 60 },
    { name: 'Cancha de básquet', description: 'Media cancha de básquet techada. Ideal para partidos 3v3.', price: 20000, duration: 60 },
  ],
  'hospedaje': [
    { name: 'Habitación estándar', description: 'Habitación doble con baño privado, TV y WiFi. Check-in: 14hs.', price: 25000, duration: 1440 },
    { name: 'Suite premium', description: 'Suite con jacuzzi, minibar y desayuno incluido. Vista panorámica.', price: 45000, duration: 1440 },
    { name: 'Cabaña para 4', description: 'Cabaña equipada con cocina, parrilla y estacionamiento privado.', price: 55000, duration: 1440 },
    { name: 'Habitación single', description: 'Habitación individual económica con baño privado y WiFi.', price: 18000, duration: 1440 },
  ],
  'alquiler': [
    { name: 'Departamento 2 ambientes', description: 'Departamento amueblado con cocina equipada, WiFi y ropa blanca.', price: 35000, duration: 1440 },
    { name: 'Casa con pileta', description: 'Casa para 6 personas con pileta, parrilla y cochera. Zona tranquila.', price: 65000, duration: 1440 },
    { name: 'Loft céntrico', description: 'Loft moderno en pleno centro. Ideal para parejas o viajeros solos.', price: 28000, duration: 1440 },
    { name: 'Quinta para eventos', description: 'Quinta con parque, pileta y salón para hasta 80 personas.', price: 120000, duration: 1440 },
  ],
  'espacios': [
    { name: 'Sala de reuniones (4h)', description: 'Sala para 8 personas con pantalla, WiFi y café incluido.', price: 12000, duration: 240 },
    { name: 'Escritorio flex', description: 'Puesto de trabajo en coworking con acceso a áreas comunes.', price: 5000, duration: 480 },
    { name: 'Salón de eventos', description: 'Salón para hasta 50 personas con sonido, proyector y cocina.', price: 45000, duration: 480 },
    { name: 'Estudio fotográfico', description: 'Estudio con fondos, iluminación profesional y vestidor.', price: 15000, duration: 240 },
  ],
  'educacion': [
    { name: 'Clase particular', description: 'Clase individual de 1 hora. Matemática, física, química o idiomas.', price: 8000, duration: 60 },
    { name: 'Taller grupal', description: 'Taller práctico en grupo reducido. Materiales incluidos.', price: 6000, duration: 90 },
    { name: 'Clase de prueba', description: 'Primera clase sin compromiso para conocer la metodología.', price: 0, duration: 30 },
    { name: 'Pack 4 clases', description: 'Paquete de 4 clases con descuento. Agendá en los horarios que te convengan.', price: 28000, duration: 60 },
  ],
  'consultoria': [
    { name: 'Consultoría inicial', description: 'Reunión de diagnóstico para entender tu situación y objetivos.', price: 15000, duration: 60 },
    { name: 'Sesión de seguimiento', description: 'Revisión de avances y ajuste de estrategia.', price: 12000, duration: 45 },
    { name: 'Asesoría express', description: 'Consulta puntual de 30 minutos para resolver dudas específicas.', price: 8000, duration: 30 },
    { name: 'Plan mensual', description: 'Acompañamiento mensual con 4 reuniones y soporte por WhatsApp.', price: 40000, duration: 60 },
  ],
  'tatuajes-piercing': [
    { name: 'Tatuaje pequeño', description: 'Tatuaje de hasta 5cm. Incluye diseño personalizado y retoque.', price: 20000, duration: 60 },
    { name: 'Tatuaje mediano', description: 'Tatuaje de 5 a 15cm. Diseño a medida con consulta previa.', price: 40000, duration: 120 },
    { name: 'Piercing', description: 'Colocación de piercing con joya de acero quirúrgico. Cuidados incluidos.', price: 8000, duration: 20 },
    { name: 'Cover up', description: 'Cobertura de tatuaje existente. Incluye diseño y consulta previa.', price: 35000, duration: 120 },
  ],
};

const PRODUCT_RUBROS: Record<string, ProductExample[]> = {
  'mercado': [
    { name: 'Producto de ejemplo 1', shortDescription: 'Editá este producto con tus datos reales', description: 'Este es un producto de ejemplo para que veas cómo queda tu tienda. Editalo con el nombre, precio, descripción y fotos de tus productos reales.', price: 5000, stock: 10 },
    { name: 'Producto de ejemplo 2', shortDescription: 'Cambiá el nombre, precio y descripción', description: 'Otro producto de ejemplo. Podés editarlo, duplicarlo o eliminarlo. Agregá tus propias fotos para que se vea profesional.', price: 12000, stock: 5 },
    { name: 'Producto destacado', shortDescription: 'Los destacados aparecen primero en tu catálogo', description: 'Este producto está marcado como destacado. Los productos destacados aparecen primero en tu catálogo y llaman más la atención de tus clientes.', price: 25000, stock: 3 },
    { name: 'Producto con descuento', shortDescription: 'Podés poner precio tachado y precio final', description: 'Ejemplo de producto con descuento. El precio anterior aparece tachado y el nuevo resaltado. Ideal para liquidaciones y promociones.', price: 8000, stock: 8 },
  ],
  'inmobiliarias': [
    { name: 'Depto 2 amb. Palermo', shortDescription: '45m² · 1 dormitorio · Balcón', description: 'Departamento luminoso en Palermo Hollywood. Living-comedor, cocina integrada, dormitorio con placard, baño completo. Balcón con vista abierta. Edificio con amenities.', price: 120000, stock: 1 },
    { name: 'Casa 3 amb. Zona Norte', shortDescription: '180m² · 2 dormitorios · Jardín · Cochera', description: 'Casa en barrio residencial con jardín y cochera doble. Living amplio, cocina independiente, 2 dormitorios, 2 baños. Ideal para familia.', price: 280000, stock: 1 },
    { name: 'Local comercial Centro', shortDescription: '60m² · Sobre avenida · Vidriera', description: 'Local a la calle sobre avenida principal. Gran vidriera, depósito, baño. Apto todo rubro. Excelente ubicación comercial.', price: 95000, stock: 1 },
    { name: 'Terreno Barrio Privado', shortDescription: '800m² · Escritura inmediata', description: 'Lote en barrio cerrado con seguridad 24hs. Servicios de gas, agua y electricidad. Apto para construcción. Financiación disponible.', price: 45000000, stock: 1 },
  ],
};

// ─── Gastro sub-rubros ─────────────────────────────────────────
const GASTRO_PRODUCT_RUBROS: Record<string, ProductExample[]> = {
  'gastro-parrilla': [
    { name: 'Bife de chorizo', shortDescription: 'Corte premium a la parrilla con leña de quebracho', description: 'Bife de chorizo de 400g, cocción a punto elegido. Acompañado de papas rústicas y ensalada mixta.', price: 18500, stock: 99 },
    { name: 'Tabla de achuras', shortDescription: 'Selección de achuras a la parrilla para compartir', description: 'Chinchulín, molleja, riñón y morcilla. Para 2 personas. Con chimichurri y criolla casera.', price: 15000, stock: 99 },
    { name: 'Empanadas (x3)', shortDescription: 'Empanadas criollas horneadas al horno de barro', description: 'Tres empanadas a elección: carne cortada a cuchillo, jamón y queso, o verdura.', price: 6500, stock: 99 },
    { name: 'Flan casero con DDL', shortDescription: 'Postre clásico argentino con dulce de leche y crema', description: 'Flan de huevo casero con dulce de leche artesanal y crema. Receta de la casa.', price: 5500, stock: 99 },
  ],
  'gastro-pizzeria': [
    { name: 'Muzzarella', shortDescription: 'Pizza clásica con muzzarella y aceitunas', description: 'Masa madre, salsa de tomate casera, muzzarella gratinada y aceitunas verdes. La clásica porteña.', price: 9500, stock: 99 },
    { name: 'Napolitana', shortDescription: 'Muzzarella con tomate fresco, ajo y albahaca', description: 'Base de muzzarella con rodajas de tomate, ajo fileteado y albahaca fresca. Un clásico que nunca falla.', price: 10500, stock: 99 },
    { name: 'Fugazzeta rellena', shortDescription: 'Doble masa rellena de muzzarella con cebolla', description: 'Doble disco de masa relleno de muzzarella, cubierto con cebolla caramelizada. Especialidad de la casa.', price: 12500, stock: 99 },
    { name: 'Fainá', shortDescription: 'Torta de harina de garbanzos al horno', description: 'Fainá crocante, ideal para acompañar tu pizza. Porción individual.', price: 3500, stock: 99 },
  ],
  'gastro-hamburgueseria': [
    { name: 'Smash Burger Clásica', shortDescription: 'Doble smash patty con cheddar, cebolla y pepinillos', description: 'Doble medallón smash de 90g, queso cheddar derretido, cebolla caramelizada, pepinillos y salsa de la casa. Pan brioche.', price: 9800, stock: 99 },
    { name: 'Burger BBQ Bacon', shortDescription: 'Burger con panceta crocante y salsa BBQ ahumada', description: 'Medallón de 180g, panceta crocante, cheddar, aros de cebolla, salsa BBQ ahumada. Pan con semillas.', price: 11500, stock: 99 },
    { name: 'Papas con Cheddar y Bacon', shortDescription: 'Papas fritas con cheddar fundido y panceta', description: 'Papas fritas crocantes bañadas en salsa cheddar, panceta crocante y cebolla de verdeo.', price: 6500, stock: 99 },
    { name: 'Pinta de Cerveza Artesanal', shortDescription: 'Cerveza artesanal tirada de canilla', description: 'Pinta de 473ml. Estilos rotativos: IPA, Red Ale, Stout, Blonde. Consultar variedades del día.', price: 5500, stock: 99 },
  ],
  'gastro-cafe': [
    { name: 'Flat White', shortDescription: 'Espresso doble con leche micro-texturizada', description: 'Café de especialidad con leche vaporizada. Cuerpo sedoso y arte latte. Grano de origen seleccionado.', price: 4200, stock: 99 },
    { name: 'Avocado Toast', shortDescription: 'Pan de masa madre con palta, huevo poché y semillas', description: 'Tostada de masa madre con palta pisada, huevo poché, tomate cherry, semillas y aceite de oliva.', price: 8500, stock: 99 },
    { name: 'Croissant de Almendras', shortDescription: 'Croissant relleno de crema de almendras tostadas', description: 'Croissant artesanal relleno de crema frangipane con láminas de almendra tostada y azúcar impalpable.', price: 4800, stock: 99 },
    { name: 'Cheesecake de Frutos Rojos', shortDescription: 'Cheesecake estilo New York con coulis de berries', description: 'Cheesecake horneado con base de galleta, queso crema y coulis de frutos rojos de estación.', price: 7500, stock: 99 },
  ],
  'gastro-heladeria': [
    { name: '1/4 kg (2 gustos)', shortDescription: 'Cuarto kilo de helado artesanal, elegí 2 gustos', description: 'Helado artesanal elaborado con ingredientes naturales. Elegí 2 gustos de nuestra vitrina.', price: 5500, stock: 99 },
    { name: '1 kg (4 gustos)', shortDescription: 'Kilo de helado artesanal, elegí 4 gustos', description: 'Kilo de helado artesanal. Elegí 4 gustos. Ideal para compartir en casa. Incluye cucuruchos.', price: 16000, stock: 99 },
    { name: 'Sundae de Chocolate', shortDescription: 'Helado con salsa de chocolate, crema y brownie', description: 'Copa con 3 bochas de helado a elección, salsa de chocolate caliente, crema batida, brownie y cerezas.', price: 8500, stock: 99 },
    { name: 'Paleta Artesanal', shortDescription: 'Paleta helada con cobertura de chocolate', description: 'Paleta de helado artesanal con cobertura de chocolate belga. Sabores: dulce de leche, frutilla, limón.', price: 4500, stock: 99 },
  ],
  'gastro-sushi': [
    { name: 'Combo 30 Piezas', shortDescription: 'Mix de rolls: salmón, langostino y veggie', description: '10 piezas de Philadelphia roll, 10 de Ebi tempura roll y 10 de California roll. Para 2 personas.', price: 18500, stock: 99 },
    { name: 'Salmón Roll (10 pzas)', shortDescription: 'Roll de salmón fresco con palta y queso crema', description: '10 piezas de salmón fresco, palta, queso crema. Rebozado en panko. Salsa teriyaki y spicy mayo.', price: 9500, stock: 99 },
    { name: 'Poke Bowl de Salmón', shortDescription: 'Bowl con salmón fresco, palta, mango y edamame', description: 'Arroz de sushi, salmón fresco, palta, mango, edamame, pepino, alga nori y salsa ponzu.', price: 12500, stock: 99 },
    { name: 'Gyozas de Cerdo (6 u)', shortDescription: 'Empanaditas japonesas al vapor con salsa de soja', description: '6 gyozas rellenas de cerdo y verduras, cocidas al vapor y selladas a la plancha. Salsa de soja y jengibre.', price: 7200, stock: 99 },
  ],
  'gastro-cerveceria': [
    { name: 'Pinta IPA', shortDescription: 'India Pale Ale artesanal, lupulada y cítrica', description: 'Pinta de 473ml de nuestra IPA de la casa. Notas cítricas y tropicales, amargor equilibrado. IBU 45.', price: 5500, stock: 99 },
    { name: 'Tabla de Picada Completa', shortDescription: 'Fiambres, quesos, aceitunas y grisines para compartir', description: 'Selección de salamín, bondiola, jamón crudo, quesos duros y blandos, aceitunas, grisines y pan casero. Para 2-3 personas.', price: 14500, stock: 99 },
    { name: 'Nachos con Guacamole', shortDescription: 'Nachos crocantes con guacamole, cheddar y jalapeños', description: 'Nachos de maíz con guacamole casero, salsa cheddar, crema agria, jalapeños y pico de gallo.', price: 8500, stock: 99 },
    { name: 'Hamburguesa del Brewmaster', shortDescription: 'Burger especial con queso azul y cebolla al porter', description: 'Medallón 200g, queso azul, cebolla caramelizada en cerveza porter, rúcula y mostaza Dijon. Pan artesanal.', price: 12500, stock: 99 },
  ],
  'gastro-bodegon': [
    { name: 'Milanesa napolitana', shortDescription: 'Milanesa de ternera con jamón, muzzarella y salsa', description: 'Milanesa de ternera a la napolitana con jamón, muzzarella gratinada y salsa pomodoro. Con papas fritas.', price: 13500, stock: 99 },
    { name: 'Ravioles de ricota', shortDescription: 'Ravioles caseros con salsa bolognesa o estofado', description: 'Ravioles de ricota y nuez moscada hechos en casa. Con salsa bolognesa, filetto o estofado. Porción abundante.', price: 10500, stock: 99 },
    { name: 'Tortilla de papas', shortDescription: 'Tortilla española jugosa con ensalada mixta', description: 'Tortilla de papas y cebolla al estilo casero, jugosa por dentro. Con ensalada de lechuga, tomate y cebolla.', price: 7500, stock: 99 },
    { name: 'Arroz con leche', shortDescription: 'Postre casero con canela y dulce de leche opcional', description: 'Arroz con leche cremoso, canela espolvoreada. Opción con dulce de leche. Receta de la abuela.', price: 4500, stock: 99 },
  ],
  'gastro-pasteleria': [
    { name: 'Torta de Chocolate', shortDescription: 'Torta de chocolate húmeda con ganache', description: 'Torta de chocolate belga con ganache, entre 3 capas húmedas. Decorada con virutas de chocolate. Porción generosa.', price: 7500, stock: 99 },
    { name: 'Box de Macarons (6 u)', shortDescription: 'Caja de 6 macarons franceses surtidos', description: 'Caja de 6 macarons artesanales: pistacho, frambuesa, chocolate, vainilla, dulce de leche y limón.', price: 9500, stock: 99 },
    { name: 'Desayuno Dulce', shortDescription: 'Café + croissant + jugo de naranja exprimido', description: 'Combo desayuno: café americano o latte, croissant de manteca y jugo de naranja recién exprimido.', price: 7200, stock: 99 },
    { name: 'Cookies (x4)', shortDescription: 'Cookies XXL artesanales con chips de chocolate', description: '4 cookies artesanales con chips de chocolate, textura chewy por dentro y crocante por fuera. Sal marina.', price: 5800, stock: 99 },
  ],
  'gastro-food-truck': [
    { name: 'Wrap de Pollo', shortDescription: 'Tortilla con pollo grillé, guacamole y jalapeños', description: 'Tortilla de trigo con pollo grillado, guacamole, tomate, lechuga, jalapeños y salsa chipotle.', price: 7500, stock: 99 },
    { name: 'Papas Loaded', shortDescription: 'Papas fritas con cheddar, bacon y salsa ranch', description: 'Porción grande de papas fritas con cheddar fundido, bacon crocante, cebolla de verdeo y ranch.', price: 6500, stock: 99 },
    { name: 'Choripán Gourmet', shortDescription: 'Chorizo artesanal en pan con chimichurri y criolla', description: 'Chorizo artesanal parrillero en pan casero con chimichurri picante y salsa criolla. Street food argentino.', price: 6000, stock: 99 },
    { name: 'Limonada Casera', shortDescription: 'Limonada fresca con menta y jengibre', description: 'Limonada exprimida al momento con menta fresca y jengibre rallado. Vaso de 500ml.', price: 4000, stock: 99 },
  ],
};

// Default for unknown rubros
const DEFAULT_SERVICES: ServiceExample[] = [
  { name: 'Servicio de ejemplo 1', description: 'Este es un servicio de ejemplo. Editalo con tu información real: nombre, precio y duración.', price: 8000, duration: 60 },
  { name: 'Servicio de ejemplo 2', description: 'Otro servicio de ejemplo. Cambiá el nombre, precio y duración por los de tu negocio.', price: 12000, duration: 45 },
  { name: 'Consulta inicial', description: 'Primera consulta o sesión. Podés cambiar el nombre y la descripción.', price: 5000, duration: 30 },
  { name: 'Pack o combo', description: 'Ejemplo de servicio combinado. Ideal para ofrecer paquetes con descuento.', price: 18000, duration: 90 },
];

/**
 * Returns the appropriate example data for a given rubro.
 * Rubros mapped to 'mercado' get products; all others get services.
 */
export function getOnboardingExamples(rubro: string): OnboardingExamples {
  const placeholderImage = getPlaceholderUrl(rubro);

  if (rubro === 'mercado' || rubro === 'inmobiliarias') {
    return {
      type: 'products',
      placeholderImage,
      products: PRODUCT_RUBROS[rubro] || PRODUCT_RUBROS['mercado'],
    };
  }

  // Gastro sub-rubros and generic gastronomia → products (platos)
  if (rubro === 'gastronomia' || rubro.startsWith('gastro-')) {
    return {
      type: 'products',
      placeholderImage,
      products: GASTRO_PRODUCT_RUBROS[rubro] || GASTRO_PRODUCT_RUBROS['gastro-parrilla'],
    };
  }

  return {
    type: 'services',
    placeholderImage,
    services: SERVICE_RUBROS[rubro] || DEFAULT_SERVICES,
  };
}
