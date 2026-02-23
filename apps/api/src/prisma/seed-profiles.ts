/**
 * Seed: 20 perfiles profesionales completos por categoría (160 total)
 * Ejecutar: npx ts-node src/prisma/seed-profiles.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Helpers ───────────────────────────────────────────────
function randomEl<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(yearsAgo: number): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - yearsAgo);
  d.setMonth(randomInt(0, 11));
  d.setDate(randomInt(1, 28));
  return d;
}

function slug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Photos using pravatar.cc (150 unique IDs)
function photoUrl(index: number, gender: 'men' | 'women'): string {
  const id = (index % 70) + 1;
  return `https://randomuser.me/api/portraits/${gender}/${id}.jpg`;
}

const ZONAS = [
  'CABA', 'Zona Norte', 'Zona Sur', 'Zona Oeste', 'La Plata',
  'Córdoba Capital', 'Rosario', 'Mendoza', 'Mar del Plata', 'Tucumán',
  'Palermo', 'Belgrano', 'Recoleta', 'Caballito', 'San Isidro',
  'Vicente López', 'Tigre', 'Quilmes', 'Lomas de Zamora', 'Morón',
];

const AVAILABILITY = ['full-time', 'part-time', 'freelance'];

// ─── Category Data ─────────────────────────────────────────

interface ProfileSeed {
  name: string;
  gender: 'men' | 'women';
  headline: string;
  specialty: string;
  bio: string;
  skills: string[];
  certifications: string[];
  yearsExperience: number;
  experiences: { businessName: string; role: string; yearsAgo: number; current: boolean; desc: string }[];
}

// ════════════════════════════════════════════════════════════
// 1. ESTÉTICA Y BELLEZA
// ════════════════════════════════════════════════════════════
const esteticaBelleza: ProfileSeed[] = [
  {
    name: 'Luciana Fernández',
    gender: 'women',
    headline: 'Maquilladora profesional especializada en novias y eventos',
    specialty: 'Maquillaje profesional',
    bio: 'Con más de 8 años de experiencia en maquillaje profesional, me especializo en looks para novias, quinceañeras y eventos sociales. Certificada en técnicas de aerografía y maquillaje editorial. Mi pasión es resaltar la belleza natural de cada persona.',
    skills: ['Maquillaje social', 'Aerografía', 'Maquillaje editorial', 'Automaquillaje', 'Contouring', 'Cejas'],
    certifications: ['Certificación MAC Cosmetics', 'Curso avanzado de maquillaje editorial'],
    yearsExperience: 8,
    experiences: [
      { businessName: 'Studio Belleza Total', role: 'Maquilladora senior', yearsAgo: 1, current: true, desc: 'Maquillaje para novias, editoriales y eventos corporativos' },
      { businessName: 'Salon Glamour', role: 'Maquilladora', yearsAgo: 5, current: false, desc: 'Maquillaje social y clases de automaquillaje' },
    ],
  },
  {
    name: 'Valentina Morales',
    gender: 'women',
    headline: 'Esteticista facial y corporal con enfoque holístico',
    specialty: 'Estética facial',
    bio: 'Profesional en tratamientos faciales y corporales con un enfoque integral de la belleza. Manejo tecnología de última generación como radiofrecuencia, ultracavitación y dermapen. Mi objetivo es que cada cliente se sienta renovada.',
    skills: ['Limpieza profunda', 'Radiofrecuencia', 'Dermapen', 'Ultracavitación', 'Peeling químico', 'LED therapy'],
    certifications: ['Cosmetología UBA', 'Dermapen Certified Professional'],
    yearsExperience: 6,
    experiences: [
      { businessName: 'Centro Estético Renova', role: 'Esteticista facial', yearsAgo: 0, current: true, desc: 'Tratamientos faciales avanzados y consultoría de skincare' },
      { businessName: 'Spa Serena', role: 'Cosmetóloga', yearsAgo: 4, current: false, desc: 'Tratamientos corporales y faciales' },
    ],
  },
  {
    name: 'Camila Rodríguez',
    gender: 'women',
    headline: 'Especialista en uñas esculpidas y nail art',
    specialty: 'Manicura y nail art',
    bio: 'Apasionada por el nail art y las uñas esculpidas. Manejo todas las técnicas: acrílico, polygel, gel y press-on. Más de 5000 clientas satisfechas. Siempre actualizada con las últimas tendencias internacionales.',
    skills: ['Uñas esculpidas', 'Nail art', 'Polygel', 'Gel semipermanente', 'Acrílico', 'Decoración a mano alzada'],
    certifications: ['Master en uñas esculpidas', 'Nail art avanzado'],
    yearsExperience: 7,
    experiences: [
      { businessName: 'Nails by Cami', role: 'Nail artist independiente', yearsAgo: 0, current: true, desc: 'Estudio propio de uñas esculpidas y nail art personalizado' },
      { businessName: 'Beauty Center Palermo', role: 'Manicurista', yearsAgo: 4, current: false, desc: 'Servicio de manicuría y pedicuría' },
    ],
  },
  {
    name: 'Sofía Giménez',
    gender: 'women',
    headline: 'Colorista capilar especializada en técnicas de color',
    specialty: 'Colorimetría capilar',
    bio: 'Colorista profesional con formación en las mejores academias. Me especializo en balayage, mechas babylights, colores fantasía y corrección de color. Cada trabajo es único y personalizado según el estilo de vida de cada clienta.',
    skills: ['Balayage', 'Mechas babylights', 'Colorimetría', 'Corrección de color', 'Colores fantasía', 'Tintes orgánicos'],
    certifications: ['Colorimetría L\'Oréal Professionnel', 'Wella Color Expert'],
    yearsExperience: 10,
    experiences: [
      { businessName: 'Atelier del Color', role: 'Colorista senior', yearsAgo: 0, current: true, desc: 'Especialista en técnicas avanzadas de coloración' },
      { businessName: 'Peluquería Moderna', role: 'Colorista', yearsAgo: 5, current: false, desc: 'Coloración y tratamientos capilares' },
    ],
  },
  {
    name: 'Martina López',
    gender: 'women',
    headline: 'Depiladora profesional láser y cera',
    specialty: 'Depilación definitiva',
    bio: 'Técnica en depilación láser y cera con amplia experiencia en todo tipo de pieles. Trabajo con equipos de última generación (diodo y alejandrita). Compromiso con la seguridad y el bienestar de cada cliente.',
    skills: ['Depilación láser diodo', 'Láser alejandrita', 'Cera española', 'IPL', 'Depilación masculina'],
    certifications: ['Operadora láser certificada', 'Curso de fotodepilación'],
    yearsExperience: 5,
    experiences: [
      { businessName: 'Láser Center', role: 'Técnica en depilación láser', yearsAgo: 0, current: true, desc: 'Operación de equipos láser diodo y alejandrita' },
      { businessName: 'Estética Integral', role: 'Depiladora', yearsAgo: 3, current: false, desc: 'Depilación con cera y técnicas tradicionales' },
    ],
  },
  {
    name: 'Florencia Acosta',
    gender: 'women',
    headline: 'Microblading y micropigmentación de cejas',
    specialty: 'Micropigmentación',
    bio: 'Artista de micropigmentación especializada en cejas pelo a pelo, labios y delineado. Formada en técnicas coreanas y europeas. Más de 2000 procedimientos realizados con resultados naturales y duraderos.',
    skills: ['Microblading', 'Micropigmentación', 'Cejas pelo a pelo', 'Lip blushing', 'Corrección de micropigmentación'],
    certifications: ['PhiBrows Artist', 'Micropigmentación avanzada'],
    yearsExperience: 4,
    experiences: [
      { businessName: 'Brow Studio', role: 'Micropigmentadora', yearsAgo: 0, current: true, desc: 'Microblading y técnicas avanzadas de cejas' },
      { businessName: 'Beauty Lab', role: 'Técnica en cejas', yearsAgo: 2, current: false, desc: 'Diseño y perfilado de cejas' },
    ],
  },
  {
    name: 'Julieta Herrera',
    gender: 'women',
    headline: 'Cosmetóloga integral con foco en anti-age',
    specialty: 'Cosmetología anti-age',
    bio: 'Cosmetóloga con especialización en tratamientos anti-age y rejuvenecimiento facial. Trabajo con ácido hialurónico, vitamina C, retinol y tecnologías como HIFU y radiofrecuencia tripolar. Creo protocolos personalizados.',
    skills: ['Ácido hialurónico', 'HIFU', 'Radiofrecuencia tripolar', 'Peelings', 'Mesoterapia virtual', 'Skincare personalizado'],
    certifications: ['Cosmetología - Instituto Bettina Feste', 'Especialización en anti-aging'],
    yearsExperience: 9,
    experiences: [
      { businessName: 'Clínica Dermis', role: 'Cosmetóloga senior', yearsAgo: 0, current: true, desc: 'Protocolos anti-age y rejuvenecimiento' },
      { businessName: 'Centro Médico Estético', role: 'Cosmetóloga', yearsAgo: 4, current: false, desc: 'Tratamientos faciales y corporales' },
    ],
  },
  {
    name: 'Agustina Paz',
    gender: 'women',
    headline: 'Estilista de pestañas - Extensiones y lifting',
    specialty: 'Pestañas',
    bio: 'Lash artist profesional especializada en extensiones de pestañas pelo a pelo, volumen ruso y lifting. Utilizo solo productos premium hipoalergénicos. Cada set es diseñado según la forma del ojo y estilo de cada clienta.',
    skills: ['Extensiones pelo a pelo', 'Volumen ruso', 'Mega volumen', 'Lifting de pestañas', 'Laminado', 'Tinte de pestañas'],
    certifications: ['Lash Artist Certified', 'Volumen ruso avanzado'],
    yearsExperience: 5,
    experiences: [
      { businessName: 'Lash Boutique', role: 'Lash artist', yearsAgo: 0, current: true, desc: 'Extensiones de pestañas y lifting' },
      { businessName: 'Beauty Corner', role: 'Técnica en pestañas', yearsAgo: 3, current: false, desc: 'Servicios de pestañas y cejas' },
    ],
  },
  {
    name: 'Carolina Vega',
    gender: 'women',
    headline: 'Estilista integral - Corte, color y peinados',
    specialty: 'Estilismo capilar',
    bio: 'Estilista integral con formación en Argentina y Europa. Me apasiona crear looks completos que reflejen la personalidad de cada cliente. Especialista en cortes modernos, peinados de fiesta y tratamientos reconstructivos.',
    skills: ['Corte de cabello', 'Peinados', 'Brushing', 'Alisado', 'Keratina', 'Tratamientos capilares'],
    certifications: ['Sassoon Academy London', 'Schwarzkopf Essential Looks'],
    yearsExperience: 12,
    experiences: [
      { businessName: 'Hair Studio Caro', role: 'Directora creativa', yearsAgo: 0, current: true, desc: 'Estilismo integral y dirección de equipo' },
      { businessName: 'Salón Trends', role: 'Estilista senior', yearsAgo: 5, current: false, desc: 'Corte, color y peinados' },
    ],
  },
  {
    name: 'María José Torres',
    gender: 'women',
    headline: 'Especialista en tratamientos corporales reductores',
    specialty: 'Estética corporal',
    bio: 'Profesional en estética corporal con foco en tratamientos reductores y modeladores. Manejo criólisis, presoterapia, masajes reductores y vendas frías. Diseño planes integrales combinando tecnología y técnicas manuales.',
    skills: ['Criolipólisis', 'Presoterapia', 'Masaje reductor', 'Vendas frías', 'Drenaje linfático', 'Mesoterapia'],
    certifications: ['Técnica en estética corporal', 'Criolipólisis - Certificación oficial'],
    yearsExperience: 7,
    experiences: [
      { businessName: 'Body Center', role: 'Especialista corporal', yearsAgo: 0, current: true, desc: 'Tratamientos reductores y modeladores' },
      { businessName: 'Spa Relax', role: 'Esteticista', yearsAgo: 4, current: false, desc: 'Tratamientos corporales y faciales' },
    ],
  },
  {
    name: 'Aldana Ruiz',
    gender: 'women',
    headline: 'Maquilladora artística para cine, teatro y TV',
    specialty: 'Maquillaje artístico',
    bio: 'Maquilladora artística con experiencia en producciones de cine, teatro y televisión. Manejo FX, caracterización, body painting y maquillaje de época. Trabajé en más de 30 producciones audiovisuales.',
    skills: ['Maquillaje FX', 'Caracterización', 'Body painting', 'Maquillaje de época', 'Prótesis', 'Efectos especiales'],
    certifications: ['Maquillaje cinematográfico - ENERC', 'FX Makeup Academy'],
    yearsExperience: 6,
    experiences: [
      { businessName: 'Producción independiente', role: 'Maquilladora de cine', yearsAgo: 0, current: true, desc: 'Maquillaje y caracterización para producciones audiovisuales' },
      { businessName: 'Teatro Colón', role: 'Asistente de maquillaje', yearsAgo: 4, current: false, desc: 'Maquillaje y caracterización para óperas y ballet' },
    ],
  },
  {
    name: 'Rocío Méndez',
    gender: 'women',
    headline: 'Podóloga y especialista en pedicuría spa',
    specialty: 'Podología estética',
    bio: 'Podóloga matriculada con especialización en pedicuría spa y tratamientos para uñas. Atención personalizada con los más altos estándares de higiene y bioseguridad. Tratamiento de onicocriptosis, callosidades y uñas encarnadas.',
    skills: ['Pedicuría spa', 'Podología', 'Tratamiento de hongos', 'Uñas encarnadas', 'Reflexología podal'],
    certifications: ['Podología - Universidad de Buenos Aires', 'Pedicuría spa avanzada'],
    yearsExperience: 8,
    experiences: [
      { businessName: 'Pies Sanos', role: 'Podóloga', yearsAgo: 0, current: true, desc: 'Consultorios de podología y pedicuría spa' },
      { businessName: 'Centro de Salud', role: 'Podóloga', yearsAgo: 5, current: false, desc: 'Atención podológica general' },
    ],
  },
  {
    name: 'Daniela Sosa',
    gender: 'women',
    headline: 'Peluquera canina profesional con certificación',
    specialty: 'Grooming canino',
    bio: 'Groomer profesional certificada con amor por los animales. Especialista en cortes de raza, baño terapéutico, stripping y manejo de mascotas nerviosas. Cada mascota recibe un trato único con productos premium.',
    skills: ['Corte de raza', 'Baño terapéutico', 'Stripping', 'Deslanado', 'Manejo de mascotas nerviosas'],
    certifications: ['Grooming profesional certificado', 'Primeros auxilios veterinarios'],
    yearsExperience: 4,
    experiences: [
      { businessName: 'Pet Spa', role: 'Groomer profesional', yearsAgo: 0, current: true, desc: 'Grooming integral para todas las razas' },
    ],
  },
  {
    name: 'Brenda Aguirre',
    gender: 'women',
    headline: 'Asesora de imagen personal y profesional',
    specialty: 'Asesoramiento de imagen',
    bio: 'Asesora de imagen con formación en colorimetría personal, morfología corporal y estilo. Ayudo a mujeres y hombres a descubrir su mejor versión a través del vestir, el maquillaje y el cuidado personal.',
    skills: ['Colorimetría personal', 'Morfología corporal', 'Personal shopping', 'Armado de outfits', 'Imagen corporativa'],
    certifications: ['Asesoramiento de imagen - Universidad de Palermo', 'Color analysis certified'],
    yearsExperience: 5,
    experiences: [
      { businessName: 'Imagen & Estilo', role: 'Asesora de imagen', yearsAgo: 0, current: true, desc: 'Asesoramiento de imagen personal y corporativa' },
      { businessName: 'Revista Ohlalá', role: 'Colaboradora de moda', yearsAgo: 3, current: false, desc: 'Producción de contenido de moda y estilo' },
    ],
  },
  {
    name: 'Milagros Castro',
    gender: 'women',
    headline: 'Experta en extensiones de cabello y pelucas',
    specialty: 'Extensiones capilares',
    bio: 'Especialista en extensiones de cabello con todas las técnicas: micro ring, tape-in, clip-in y tejido. También trabajo con pelucas oncológicas hechas a medida. Mi prioridad es la salud del cabello natural.',
    skills: ['Extensiones micro ring', 'Tape-in', 'Clip-in', 'Tejido', 'Pelucas oncológicas', 'Mantenimiento'],
    certifications: ['Extensiones capilares avanzadas', 'Tricología básica'],
    yearsExperience: 6,
    experiences: [
      { businessName: 'Hair Extensions BA', role: 'Especialista en extensiones', yearsAgo: 0, current: true, desc: 'Colocación y mantenimiento de extensiones' },
      { businessName: 'Peluquería VIP', role: 'Estilista', yearsAgo: 4, current: false, desc: 'Extensiones y estilismo capilar' },
    ],
  },
  {
    name: 'Abril Domínguez',
    gender: 'women',
    headline: 'Cosmetóloga especializada en acné y pieles sensibles',
    specialty: 'Dermocosmética',
    bio: 'Cosmetóloga con enfoque en pieles problemáticas: acné, rosácea, dermatitis y pieles sensibles. Diseño rutinas de skincare personalizadas y realizo tratamientos con ácidos, peelings suaves y tecnología LED.',
    skills: ['Tratamiento de acné', 'Pieles sensibles', 'Peelings', 'LED therapy', 'Skincare personalizado', 'Rosácea'],
    certifications: ['Dermocosmética clínica', 'Cosmetología médica'],
    yearsExperience: 7,
    experiences: [
      { businessName: 'Derma Skin', role: 'Cosmetóloga clínica', yearsAgo: 0, current: true, desc: 'Tratamientos para pieles problemáticas' },
      { businessName: 'Farmacia dermatológica', role: 'Asesora en skincare', yearsAgo: 3, current: false, desc: 'Asesoramiento en productos dermatológicos' },
    ],
  },
  {
    name: 'Catalina Ríos',
    gender: 'women',
    headline: 'Profesional en alisados y tratamientos capilares',
    specialty: 'Tratamientos capilares',
    bio: 'Especialista en alisados brasileños, keratina y tratamientos reconstructivos. Trabajo solo con productos libres de formol y aprobados. Mi foco es recuperar la salud del cabello mientras logro el resultado deseado.',
    skills: ['Alisado brasileño', 'Keratina', 'Botox capilar', 'Cauterización', 'Nanoplastia', 'Diagnóstico capilar'],
    certifications: ['Keratina y alisados - Certificación profesional', 'Tricología aplicada'],
    yearsExperience: 8,
    experiences: [
      { businessName: 'Liso Perfecto', role: 'Especialista en alisados', yearsAgo: 0, current: true, desc: 'Alisados y tratamientos reconstructivos' },
      { businessName: 'Salón Premium', role: 'Estilista', yearsAgo: 4, current: false, desc: 'Corte, color y tratamientos' },
    ],
  },
  {
    name: 'Pilar Gómez',
    gender: 'women',
    headline: 'Masajista facial con técnicas japonesas',
    specialty: 'Masaje facial',
    bio: 'Profesional en masaje facial con formación en técnicas japonesas como Kobido y lifting manual. Combino el masaje facial con cosmética natural para lograr resultados visibles de rejuvenecimiento sin procedimientos invasivos.',
    skills: ['Kobido', 'Lifting facial manual', 'Gua sha', 'Face yoga', 'Cosmética natural', 'Drenaje facial'],
    certifications: ['Kobido - Certificación internacional', 'Masaje facial japonés'],
    yearsExperience: 4,
    experiences: [
      { businessName: 'Zen Face', role: 'Terapeuta facial', yearsAgo: 0, current: true, desc: 'Masaje facial Kobido y técnicas de lifting natural' },
    ],
  },
  {
    name: 'Renata Bustos',
    gender: 'women',
    headline: 'Técnica en depilación con hilo y cejas perfectas',
    specialty: 'Diseño de cejas',
    bio: 'Especialista en diseño de cejas con técnica de hilo (threading), pinza y cera. Analizo la morfología facial de cada clienta para crear el diseño perfecto. También ofrezco laminado y tinte de cejas.',
    skills: ['Threading', 'Diseño de cejas', 'Laminado de cejas', 'Tinte', 'Henna', 'Brow lamination'],
    certifications: ['Threading certified professional', 'Brow design master'],
    yearsExperience: 5,
    experiences: [
      { businessName: 'Brow Bar', role: 'Diseñadora de cejas', yearsAgo: 0, current: true, desc: 'Diseño personalizado de cejas con hilo y laminado' },
      { businessName: 'Estética Natural', role: 'Técnica en cejas', yearsAgo: 3, current: false, desc: 'Diseño y depilación de cejas' },
    ],
  },
  {
    name: 'Guadalupe Romero',
    gender: 'women',
    headline: 'Peinadora profesional para eventos y novias',
    specialty: 'Peinados de fiesta',
    bio: 'Peinadora profesional con más de 500 novias en su portfolio. Especialista en recogidos, semi-recogidos, ondas glam y peinados bohemios. Trabajo a domicilio en toda la zona metropolitana.',
    skills: ['Recogidos', 'Semi-recogidos', 'Ondas glam', 'Trenzas', 'Tocados', 'Hair accessories'],
    certifications: ['Peinados de novia - Academia L\'Oréal', 'Bridal hair specialist'],
    yearsExperience: 9,
    experiences: [
      { businessName: 'Bridal Hair by Guada', role: 'Peinadora de novias', yearsAgo: 0, current: true, desc: 'Servicio de peinado a domicilio para novias y eventos' },
      { businessName: 'Salón Exclusive', role: 'Peinadora', yearsAgo: 5, current: false, desc: 'Peinados de fiesta y sociales' },
    ],
  },
];

// ════════════════════════════════════════════════════════════
// 2. BARBERÍA
// ════════════════════════════════════════════════════════════
const barberia: ProfileSeed[] = [
  { name: 'Tomás Álvarez', gender: 'men', headline: 'Barbero clásico con estilo moderno', specialty: 'Barbería clásica', bio: 'Barbero con formación clásica y visión moderna. Experto en degradados, cortes con navaja y afeitado tradicional con toalla caliente. Más de 10.000 cortes realizados. Mi barbería es un espacio de confianza y estilo.', skills: ['Degradado', 'Fade', 'Navaja', 'Afeitado clásico', 'Diseño de barba', 'Toalla caliente'], certifications: ['Master Barber certified', 'Andis Education'], yearsExperience: 10, experiences: [{ businessName: 'The Barber Club', role: 'Barbero principal', yearsAgo: 0, current: true, desc: 'Cortes clásicos y modernos, afeitado con navaja' }, { businessName: 'Old School Barbers', role: 'Barbero', yearsAgo: 5, current: false, desc: 'Barbería tradicional' }] },
  { name: 'Nicolás García', gender: 'men', headline: 'Especialista en degradados y diseños', specialty: 'Degradados', bio: 'Fanático de los fades y los diseños con máquina. Me apasiona la precisión y los detalles. Participo en competencias de barbería y me actualizo constantemente con las tendencias de USA y Europa.', skills: ['Skin fade', 'Mid fade', 'Drop fade', 'Diseños con máquina', 'Line up', 'Texturas'], certifications: ['Barber Battle Champion 2024', 'Wahl Educator'], yearsExperience: 7, experiences: [{ businessName: 'Fade Masters', role: 'Barbero senior', yearsAgo: 0, current: true, desc: 'Especialista en degradados y diseños de precisión' }] },
  { name: 'Matías Peralta', gender: 'men', headline: 'Barbero y estilista masculino integral', specialty: 'Estilismo masculino', bio: 'Combino la barbería tradicional con el estilismo moderno. Ofrezco corte, barba, cejas, tintura masculina y asesoramiento de imagen. Creo looks completos para el hombre actual.', skills: ['Corte masculino', 'Barba', 'Cejas masculinas', 'Tintura', 'Asesoramiento', 'Productos capilares'], certifications: ['Estilismo masculino profesional', 'American Barber Association'], yearsExperience: 8, experiences: [{ businessName: 'Men\'s Room', role: 'Barbero estilista', yearsAgo: 0, current: true, desc: 'Estilismo masculino integral' }, { businessName: 'Urban Barber', role: 'Barbero', yearsAgo: 4, current: false, desc: 'Cortes y barbas' }] },
  { name: 'Santiago Díaz', gender: 'men', headline: 'Barbero especializado en barbas largas', specialty: 'Diseño de barba', bio: 'Me especializo en el cuidado, mantenimiento y diseño de barbas largas y medianas. Trabajo con productos premium y técnicas de recorte con tijera caliente. Cada barba es una obra de arte.', skills: ['Barbas largas', 'Tijera caliente', 'Hot towel', 'Aceites premium', 'Modelado de barba', 'Tratamiento beard oil'], certifications: ['Beard grooming specialist', 'Barbería premium'], yearsExperience: 6, experiences: [{ businessName: 'Beard Brothers', role: 'Especialista en barbas', yearsAgo: 0, current: true, desc: 'Diseño y mantenimiento de barbas' }] },
  { name: 'Facundo Romero', gender: 'men', headline: 'Barbero joven con estilo urbano', specialty: 'Cortes urbanos', bio: 'Barbero joven con estilo propio y mucha creatividad. Me especializo en cortes urbanos, mullets modernos, texturas y looks para redes sociales. Siempre a la vanguardia de las tendencias.', skills: ['Mullet moderno', 'Texturas', 'Crop', 'Curtain bangs', 'Buzz cut', 'Social media looks'], certifications: ['Urban Barber Academy', 'Instagram barbering'], yearsExperience: 4, experiences: [{ businessName: 'Street Barber', role: 'Barbero', yearsAgo: 0, current: true, desc: 'Cortes urbanos y de tendencia' }] },
  { name: 'Lautaro Martínez', gender: 'men', headline: 'Afeitado clásico con navaja y toalla caliente', specialty: 'Afeitado tradicional', bio: 'Maestro del afeitado clásico con navaja de barbero. Ofrezco la experiencia completa: toalla caliente, espuma artesanal, navaja y aftershave premium. Un ritual que todo hombre merece experimentar.', skills: ['Navaja de barbero', 'Toalla caliente', 'Espuma artesanal', 'Masaje facial', 'Exfoliación pre-afeitado'], certifications: ['Traditional shaving master', 'Barbería clásica italiana'], yearsExperience: 15, experiences: [{ businessName: 'La Barbería de Don Lauta', role: 'Maestro barbero', yearsAgo: 0, current: true, desc: 'Afeitado clásico y experiencia premium' }, { businessName: 'Peluquería del Centro', role: 'Barbero', yearsAgo: 8, current: false, desc: 'Barbería y peluquería masculina' }] },
  { name: 'Bruno Sánchez', gender: 'men', headline: 'Barbero y formador de nuevos barberos', specialty: 'Formación en barbería', bio: 'Barbero con 12 años de experiencia y formador de nuevos profesionales. Dirijo cursos de barbería desde nivel inicial hasta avanzado. Mi pasión es transmitir el oficio a las nuevas generaciones.', skills: ['Todos los cortes', 'Enseñanza', 'Técnicas avanzadas', 'Gestión de barbería', 'Pedagogía'], certifications: ['Instructor certificado', 'Barbería nivel master'], yearsExperience: 12, experiences: [{ businessName: 'Academia de Barbería BA', role: 'Director y formador', yearsAgo: 0, current: true, desc: 'Formación de barberos profesionales' }, { businessName: 'Elite Barbers', role: 'Barbero senior', yearsAgo: 6, current: false, desc: 'Barbería premium y mentoría' }] },
  { name: 'Joaquín Medina', gender: 'men', headline: 'Barbero mobile - Atención a domicilio', specialty: 'Barbería a domicilio', bio: 'Llevo la barbería a tu casa, oficina o evento. Equipado con todas las herramientas profesionales. Ideal para ejecutivos, adultos mayores y eventos corporativos. Puntualidad y profesionalismo garantizados.', skills: ['Corte a domicilio', 'Barbería ejecutiva', 'Eventos', 'Grooming corporativo', 'Atención VIP'], certifications: ['Barbero profesional', 'Protocolo y etiqueta'], yearsExperience: 5, experiences: [{ businessName: 'Barber On The Go', role: 'Barbero mobile', yearsAgo: 0, current: true, desc: 'Servicio de barbería a domicilio premium' }] },
  { name: 'Gonzalo Ríos', gender: 'men', headline: 'Barbero con experiencia en peluquería unisex', specialty: 'Cortes unisex', bio: 'Barbero versátil con experiencia tanto en barbería como en peluquería unisex. Manejo cortes masculinos, femeninos y no binarios. Mi enfoque es crear looks que representen la identidad de cada persona.', skills: ['Cortes masculinos', 'Cortes femeninos', 'Looks andróginos', 'Degradados', 'Texturas', 'Diseño personalizado'], certifications: ['Peluquería unisex avanzada', 'Barbería moderna'], yearsExperience: 9, experiences: [{ businessName: 'Unisex Studio', role: 'Estilista barbero', yearsAgo: 0, current: true, desc: 'Cortes y estilismo para todos los géneros' }, { businessName: 'The Barber Shop', role: 'Barbero', yearsAgo: 5, current: false, desc: 'Barbería masculina' }] },
  { name: 'Franco López', gender: 'men', headline: 'Barbero kids - Especialista en cortes infantiles', specialty: 'Barbería infantil', bio: 'Me especializo en cortes para niños y adolescentes. Mi espacio está diseñado para que los más chicos se sientan cómodos: pantallas con dibujos, sillones especiales y mucha paciencia. ¡Primer corte de pelo incluye certificado!', skills: ['Cortes infantiles', 'Manejo de niños', 'Primer corte', 'Diseños divertidos', 'Patience & fun'], certifications: ['Barbería infantil', 'Psicología infantil básica'], yearsExperience: 6, experiences: [{ businessName: 'Mini Barbers', role: 'Barbero infantil', yearsAgo: 0, current: true, desc: 'Barbería especializada en niños' }] },
  { name: 'Agustín Herrera', gender: 'men', headline: 'Barbero experto en cabello afro y rizado', specialty: 'Cabello afro y rizado', bio: 'Especialista en cabello afro, rizado y ondulado masculino. Manejo técnicas específicas para este tipo de cabello: twist, coils, temp fade, afro taper y tratamientos de hidratación.', skills: ['Afro taper', 'Twist out', 'Coils', 'Temp fade', 'Hidratación', 'Definición de rizos'], certifications: ['Afro hair specialist', 'Textured hair barbering'], yearsExperience: 7, experiences: [{ businessName: 'Curly Barber', role: 'Especialista afro', yearsAgo: 0, current: true, desc: 'Cortes y tratamientos para cabello afro y rizado' }] },
  { name: 'Diego Fernández', gender: 'men', headline: 'Barbero de competencia con premios internacionales', specialty: 'Barbería de competición', bio: 'Barbero competitivo con múltiples premios en barber battles nacionales e internacionales. Me especializo en cortes de alta precisión, diseños artísticos y looks de pasarela.', skills: ['Precisión extrema', 'Diseños artísticos', 'Hair tattoo', 'Competición', 'Looks de pasarela', 'Fotografía barbería'], certifications: ['Barber Battle Argentina - 1er puesto', 'International Barber Award'], yearsExperience: 8, experiences: [{ businessName: 'Championship Barbers', role: 'Barbero campeón', yearsAgo: 0, current: true, desc: 'Barbería premium y competición' }, { businessName: 'Pro Barber', role: 'Barbero', yearsAgo: 4, current: false, desc: 'Barbería y formación' }] },
  { name: 'Ezequiel Torres', gender: 'men', headline: 'Barbero con foco en salud capilar masculina', specialty: 'Tricología masculina', bio: 'Barbero con formación en tricología. Me especializo en detectar y tratar problemas capilares: alopecia, caspa, cuero cabelludo graso. Combino el corte con tratamientos para mantener el pelo sano.', skills: ['Tricología', 'Tratamiento capilar', 'Anti-caída', 'Cuero cabelludo', 'Cortes adaptativos', 'Micropigmentación capilar'], certifications: ['Tricología aplicada', 'Dermatología capilar básica'], yearsExperience: 10, experiences: [{ businessName: 'Hair Health Barber', role: 'Barbero tricólogo', yearsAgo: 0, current: true, desc: 'Barbería y salud capilar' }] },
  { name: 'Ramiro Acosta', gender: 'men', headline: 'Barbero vintage - Estilo rockabilly y retro', specialty: 'Barbería retro', bio: 'Amante de la cultura retro y vintage. Me especializo en cortes clásicos como pompadour, slick back, side part y jelly roll. Mi barbería tiene estética de los años 50 con servicio del siglo XXI.', skills: ['Pompadour', 'Slick back', 'Side part', 'Jelly roll', 'Productos vintage', 'Hot lather'], certifications: ['Barbería clásica americana', 'Retro styling'], yearsExperience: 9, experiences: [{ businessName: 'Retro Barber Shop', role: 'Barbero vintage', yearsAgo: 0, current: true, desc: 'Cortes clásicos estilo años 50 y 60' }, { businessName: 'Classic Cuts', role: 'Barbero', yearsAgo: 5, current: false, desc: 'Barbería clásica' }] },
  { name: 'Iván Gutiérrez', gender: 'men', headline: 'Barbero y tatuador - Doble oficio', specialty: 'Barbería y tattoo', bio: 'Combino dos pasiones: la barbería y el tatuaje. Mi espacio ofrece ambos servicios. Me especializo en hair tattoo (diseños con máquina) y tatuajes geométricos y minimalistas.', skills: ['Barbería', 'Hair tattoo', 'Diseños con máquina', 'Tatuaje', 'Geometría', 'Minimalismo'], certifications: ['Barbero profesional', 'Tatuador certificado'], yearsExperience: 7, experiences: [{ businessName: 'Ink & Blade', role: 'Barbero y tatuador', yearsAgo: 0, current: true, desc: 'Barbería y estudio de tatuajes' }] },
  { name: 'Sebastián Paz', gender: 'men', headline: 'Barbero especializado en grooming masculino premium', specialty: 'Grooming premium', bio: 'Ofrezco la experiencia completa de grooming masculino: corte, barba, cejas, tratamiento facial, manicura y skincare. Todo en un ambiente relajado y exclusivo con productos de primera línea.', skills: ['Grooming completo', 'Facial masculino', 'Manicura masculina', 'Skincare hombre', 'Cejas', 'Tratamiento anti-age'], certifications: ['Men\'s grooming specialist', 'Skincare masculino'], yearsExperience: 8, experiences: [{ businessName: 'Gentlemen\'s Club', role: 'Grooming specialist', yearsAgo: 0, current: true, desc: 'Grooming masculino premium integral' }] },
  { name: 'Lucas Vargas', gender: 'men', headline: 'Barbero nocturno - Atención hasta las 2AM', specialty: 'Barbería nocturna', bio: 'El barbero de los noctámbulos. Atiendo de 18hs a 2AM para quienes no pueden en horarios convencionales. Cortes de calidad premium en un ambiente relajado con buena música y bebidas.', skills: ['Todos los cortes', 'Degradados', 'Barba', 'Ambiente nocturno', 'Atención flexible', 'Cortes express'], certifications: ['Barbero profesional'], yearsExperience: 5, experiences: [{ businessName: 'Night Barber', role: 'Barbero nocturno', yearsAgo: 0, current: true, desc: 'Barbería con horario nocturno extendido' }] },
  { name: 'Maximiliano Costa', gender: 'men', headline: 'Barbero de eventos y novios', specialty: 'Barbería para eventos', bio: 'Me especializo en preparar novios y padrinos para el gran día. Servicio a domicilio o en mi estudio. Incluye prueba previa, corte, barba, cejas, facial y asesoramiento de look.', skills: ['Grooming de novios', 'Servicio a domicilio', 'Look completo', 'Asesoramiento', 'Eventos corporativos'], certifications: ['Barbería premium', 'Estilismo para eventos'], yearsExperience: 6, experiences: [{ businessName: 'Groom & Go', role: 'Barbero de eventos', yearsAgo: 0, current: true, desc: 'Servicio premium de barbería para novios y eventos' }] },
  { name: 'Thiago Molina', gender: 'men', headline: 'Barbero joven con contenido en redes', specialty: 'Barbería y redes sociales', bio: 'Barbero e influencer con más de 50K seguidores en Instagram. Comparto tutoriales, técnicas y tendencias. Mi barbería es un set de filmación donde cada corte se convierte en contenido.', skills: ['Cortes trendy', 'Fotografía', 'Video editing', 'Redes sociales', 'Marketing personal', 'Tendencias'], certifications: ['Barbero profesional', 'Marketing digital'], yearsExperience: 4, experiences: [{ businessName: 'Viral Barber', role: 'Barbero e influencer', yearsAgo: 0, current: true, desc: 'Barbería y creación de contenido' }] },
  { name: 'Pablo Navarro', gender: 'men', headline: 'Barbero con 20 años de experiencia en el oficio', specialty: 'Barbería tradicional', bio: 'Dos décadas dedicadas al oficio de barbero. Conocimiento profundo de todas las técnicas, tipos de cabello y estilos. Formé a más de 50 barberos. Mi experiencia es mi mayor herramienta.', skills: ['Todas las técnicas', 'Tijera', 'Navaja', 'Máquina', 'Formación', 'Gestión de barbería'], certifications: ['Maestro barbero', 'Formador de formadores'], yearsExperience: 20, experiences: [{ businessName: 'Barbería Don Pablo', role: 'Maestro barbero y dueño', yearsAgo: 0, current: true, desc: 'Barbería tradicional con 15 años de trayectoria' }, { businessName: 'Peluquería del Barrio', role: 'Barbero', yearsAgo: 12, current: false, desc: 'Barbería y peluquería masculina' }] },
];

// ════════════════════════════════════════════════════════════
// 3-8: Remaining categories (shortened format for brevity)
// ════════════════════════════════════════════════════════════

function generateCategoryProfiles(
  category: string,
  names: { name: string; gender: 'men' | 'women' }[],
  headlines: string[],
  specialties: string[],
  bios: string[],
  skillSets: string[][],
  certs: string[][],
  expYears: number[],
  businessNames: string[],
  roles: string[],
): ProfileSeed[] {
  return names.map((n, i) => ({
    name: n.name,
    gender: n.gender,
    headline: headlines[i % headlines.length],
    specialty: specialties[i % specialties.length],
    bio: bios[i % bios.length],
    skills: skillSets[i % skillSets.length],
    certifications: certs[i % certs.length],
    yearsExperience: expYears[i % expYears.length],
    experiences: [
      {
        businessName: businessNames[i % businessNames.length],
        role: roles[i % roles.length],
        yearsAgo: 0,
        current: true,
        desc: `Responsable de ${specialties[i % specialties.length].toLowerCase()} y gestión de equipo`,
      },
      ...(i % 3 !== 0 ? [{
        businessName: businessNames[(i + 5) % businessNames.length],
        role: roles[(i + 2) % roles.length],
        yearsAgo: randomInt(3, 6),
        current: false,
        desc: `Desarrollo profesional en ${specialties[(i + 1) % specialties.length].toLowerCase()}`,
      }] : []),
    ],
  }));
}

const masajesSpa = generateCategoryProfiles('masajes-spa',
  [
    { name: 'Ana Belén Quiroga', gender: 'women' }, { name: 'Marcos Ruiz', gender: 'men' },
    { name: 'Celeste Paredes', gender: 'women' }, { name: 'Federico Ortiz', gender: 'men' },
    { name: 'Laura Ibáñez', gender: 'women' }, { name: 'Cristian Varela', gender: 'men' },
    { name: 'Natalia Correa', gender: 'women' }, { name: 'Andrés Mansilla', gender: 'men' },
    { name: 'Silvina Lagos', gender: 'women' }, { name: 'Gabriel Ponce', gender: 'men' },
    { name: 'Eugenia Duarte', gender: 'women' }, { name: 'Damián Salazar', gender: 'men' },
    { name: 'Melisa Cardozo', gender: 'women' }, { name: 'Hernán Figueroa', gender: 'men' },
    { name: 'Patricia Ledesma', gender: 'women' }, { name: 'Rodrigo Benítez', gender: 'men' },
    { name: 'Verónica Suárez', gender: 'women' }, { name: 'Esteban Moreno', gender: 'men' },
    { name: 'Yanina Pereyra', gender: 'women' }, { name: 'Alejandro Soria', gender: 'men' },
  ],
  ['Masajista terapéutico con técnicas orientales', 'Terapeuta de spa con certificación internacional', 'Especialista en masajes descontracturantes', 'Reflexóloga y terapeuta holística', 'Masajista deportivo certificado', 'Aromaterapeuta y masajista relajante', 'Terapeuta de shiatsu y digitopuntura', 'Masajista prenatal y postnatal', 'Especialista en hot stones y bambúterapia', 'Quiromasajista profesional'],
  ['Masaje terapéutico', 'Masaje descontracturante', 'Reflexología', 'Shiatsu', 'Masaje deportivo', 'Aromaterapia', 'Hot stones', 'Masaje prenatal', 'Drenaje linfático', 'Quiromasaje'],
  [
    'Masajista profesional con más de 8 años de experiencia en técnicas orientales y occidentales. Mi enfoque es personalizar cada sesión según las necesidades del paciente, combinando diferentes técnicas para lograr el máximo bienestar.',
    'Terapeuta corporal especializado en descontracturas y alivio del dolor. Trabajo con deportistas y personas con estrés laboral. Utilizo técnicas de tejido profundo, trigger points y stretching asistido.',
    'Reflexóloga certificada con formación en medicinas complementarias. Creo sesiones integrales que combinan reflexología podal, craneal y de manos con aromaterapia para un bienestar completo.',
    'Especialista en masajes de spa premium. Diseño experiencias sensoriales completas con aceites esenciales, música terapéutica y ambientación. Ideal para regalos y momentos de desconexión.',
    'Masajista deportivo con experiencia en clubes de fútbol y rugby. Trabajo en prevención de lesiones, recuperación post-competencia y mantenimiento de la performance deportiva.',
  ],
  [
    ['Masaje sueco', 'Tejido profundo', 'Trigger points', 'Stretching', 'Aromaterapia', 'Relajación'],
    ['Descontracturante', 'Deportivo', 'Rehabilitación', 'Kinesiotaping', 'Crioterapia', 'Electroterapia'],
    ['Reflexología podal', 'Reflexología craneal', 'Auriculoterapia', 'Digitopuntura', 'Reiki', 'Flores de Bach'],
    ['Shiatsu', 'Thai massage', 'Ayurveda', 'Tuina', 'Acupresión', 'Moxa'],
    ['Hot stones', 'Bambúterapia', 'Ventosas', 'Lomi lomi', 'Hidromasaje', 'Vinoterapia'],
  ],
  [
    ['Masaje terapéutico - Instituto de Masajes BA', 'Aromaterapia clínica'],
    ['Masaje deportivo certificado', 'Kinesiotaping level 1'],
    ['Reflexología integral', 'Reiki nivel III'],
    ['Shiatsu - Escuela Japonesa de Buenos Aires', 'Medicina Traditional China básica'],
    ['Spa therapist certified', 'Masaje con piedras calientes'],
  ],
  [8, 6, 10, 5, 12, 7, 4, 9, 11, 3],
  ['Spa Wellness', 'Centro Terapéutico Vida', 'Termas del Sur', 'Club Atlético Buenos Aires', 'Hotel Hilton Spa', 'Oasis Spa', 'Centro de Rehabilitación', 'Spa Zen', 'Clínica Kinésica', 'Wellness Center'],
  ['Masajista senior', 'Terapeuta principal', 'Jefe de spa', 'Masajista', 'Terapeuta corporal', 'Coordinador de bienestar']
);

const salud = generateCategoryProfiles('salud',
  [
    { name: 'Dra. María Elena Rivas', gender: 'women' }, { name: 'Lic. Juan Pablo Moretti', gender: 'men' },
    { name: 'Lic. Cecilia Blanco', gender: 'women' }, { name: 'Dr. Martín Aguirre', gender: 'men' },
    { name: 'Lic. Paula Vázquez', gender: 'women' }, { name: 'Lic. Fernando Cabrera', gender: 'men' },
    { name: 'Dra. Soledad Martín', gender: 'women' }, { name: 'Lic. Nicolás Prieto', gender: 'men' },
    { name: 'Lic. Andrea Molina', gender: 'women' }, { name: 'Dr. Roberto Campos', gender: 'men' },
    { name: 'Lic. Romina Bustos', gender: 'women' }, { name: 'Dr. Carlos Pereyra', gender: 'men' },
    { name: 'Lic. Daniela Aguiar', gender: 'women' }, { name: 'Lic. Gustavo Arce', gender: 'men' },
    { name: 'Dra. Lorena Arias', gender: 'women' }, { name: 'Lic. Maximiliano Luna', gender: 'men' },
    { name: 'Lic. Gisela Peralta', gender: 'women' }, { name: 'Dr. Sergio Navarro', gender: 'men' },
    { name: 'Lic. Mariana Ochoa', gender: 'women' }, { name: 'Lic. Diego Carrizo', gender: 'men' },
  ],
  ['Kinesióloga especializada en rehabilitación deportiva', 'Nutricionista deportivo y clínico', 'Psicóloga clínica con enfoque cognitivo-conductual', 'Fisioterapeuta con formación en RPG', 'Fonoaudióloga especializada en disfagia', 'Kinesiólogo en neurorehabilitación', 'Enfermera profesional con experiencia en UTI', 'Terapeuta ocupacional pediátrico', 'Nutricionista especializada en trastornos alimentarios', 'Médico generalista con orientación en medicina preventiva'],
  ['Kinesiología', 'Nutrición', 'Psicología', 'Fisioterapia', 'Fonoaudiología', 'Neurorehabilitación', 'Enfermería', 'Terapia ocupacional', 'Nutrición deportiva', 'Medicina preventiva'],
  [
    'Profesional de la salud con amplia experiencia en atención de pacientes. Mi enfoque es integral, combinando evidencia científica con un trato humano y personalizado. Trabajo en equipo interdisciplinario para lograr los mejores resultados.',
    'Especialista con formación de posgrado y experiencia en centros de salud de primer nivel. Me actualizo constantemente con las últimas investigaciones y guías clínicas para brindar la mejor atención posible.',
    'Profesional comprometido con la salud y el bienestar de mis pacientes. Creo en la educación del paciente como herramienta fundamental para la prevención y el tratamiento exitoso de patologías.',
    'Con más de 10 años de experiencia en el sistema de salud público y privado. Mi vocación es ayudar a las personas a recuperar su calidad de vida a través de tratamientos basados en evidencia.',
    'Profesional joven con formación sólida y ganas de hacer la diferencia. Me especializo en nuevas técnicas y tecnologías aplicadas a la salud para ofrecer tratamientos innovadores y efectivos.',
  ],
  [
    ['Rehabilitación', 'RPG', 'Pilates terapéutico', 'Vendaje neuromuscular', 'Electroterapia', 'Ecografía MSK'],
    ['Nutrición clínica', 'Antropometría', 'Plan alimentario', 'Suplementación', 'Educación nutricional'],
    ['TCC', 'EMDR', 'Mindfulness', 'Terapia de pareja', 'Ansiedad', 'Depresión'],
    ['RPG', 'Osteopatía', 'Punción seca', 'Terapia manual', 'Cadenas musculares'],
    ['Estimulación temprana', 'Evaluación del desarrollo', 'Neurodesarrollo', 'Integración sensorial'],
  ],
  [
    ['Kinesiología UBA', 'RPG certificada'],
    ['Nutrición - Universidad Favaloro', 'Nutrición deportiva'],
    ['Psicología UBA', 'Posgrado en TCC'],
    ['Fisioterapia - UNLP', 'Osteopatía'],
    ['Fonoaudiología UBA', 'Disfagia - Hospital Italiano'],
  ],
  [10, 7, 12, 5, 8, 15, 6, 9, 4, 11],
  ['Hospital Italiano', 'Sanatorio Güemes', 'Centro Médico San Lucas', 'FLENI', 'Clínica del Sol', 'CEMIC', 'Hospital Austral', 'Centro Kinésico', 'Consultorio privado', 'Centro de Rehabilitación'],
  ['Kinesióloga', 'Nutricionista', 'Psicóloga', 'Fisioterapeuta', 'Fonoaudióloga', 'Coordinadora clínica', 'Jefa de servicio', 'Terapeuta', 'Médica de planta', 'Profesional de guardia']
);

// ─── Main Seed Function ───────────────────────────────────

async function seed() {
  console.log('🌱 Seeding professional profiles...\n');

  const categories: { key: string; label: string; profiles: ProfileSeed[] }[] = [
    { key: 'estetica-belleza', label: 'Estética y Belleza', profiles: esteticaBelleza },
    { key: 'barberia', label: 'Barbería', profiles: barberia },
    { key: 'masajes-spa', label: 'Masajes y Spa', profiles: masajesSpa },
    { key: 'salud', label: 'Salud', profiles: salud },
  ];

  let totalCreated = 0;
  let photoIndex = 0;

  for (const cat of categories) {
    console.log(`📁 ${cat.label} (${cat.profiles.length} perfiles)`);

    for (const p of cat.profiles) {
      // Check if profile with this email already exists
      const email = `${slug(p.name)}@turnolink-talent.com`;
      const existing = await prisma.professionalProfile.findUnique({ where: { email } });
      if (existing) {
        console.log(`  ⏭️  ${p.name} (ya existe)`);
        continue;
      }

      const profile = await prisma.professionalProfile.create({
        data: {
          email,
          name: p.name,
          image: photoUrl(photoIndex, p.gender),
          specialty: p.specialty,
          category: cat.key,
          headline: p.headline,
          bio: p.bio,
          yearsExperience: p.yearsExperience,
          skills: JSON.stringify(p.skills),
          certifications: JSON.stringify(p.certifications),
          availability: randomEl(AVAILABILITY),
          preferredZones: JSON.stringify([randomEl(ZONAS), randomEl(ZONAS)].filter((v, i, a) => a.indexOf(v) === i)),
          openToWork: Math.random() > 0.2, // 80% open to work
          profileVisible: true,
          consentedAt: new Date(),
          lastActiveAt: randomDate(0),
        },
      });

      // Create experiences
      for (const exp of p.experiences) {
        const startDate = randomDate(exp.yearsAgo + randomInt(1, 3));
        await prisma.professionalExperience.create({
          data: {
            profileId: profile.id,
            businessName: exp.businessName,
            role: exp.role,
            startDate,
            endDate: exp.current ? null : randomDate(exp.yearsAgo),
            isCurrent: exp.current,
            description: exp.desc,
          },
        });
      }

      console.log(`  ✅ ${p.name}`);
      totalCreated++;
      photoIndex++;
    }
    console.log('');
  }

  console.log(`\n🎉 Seed completado: ${totalCreated} perfiles creados.`);
}

seed()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
