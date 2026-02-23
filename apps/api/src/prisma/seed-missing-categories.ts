/**
 * Seed: 6 perfiles profesionales completos por cada categoría faltante (48 total)
 * Categorías: odontologia, psicologia, nutricion, fitness, veterinaria, tatuajes-piercing, educacion, consultoria
 * Ejecutar: npx ts-node src/prisma/seed-missing-categories.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

const ZONAS = [
  'CABA', 'Zona Norte', 'Zona Sur', 'Zona Oeste', 'La Plata',
  'Córdoba Capital', 'Rosario', 'Mendoza', 'Palermo', 'Belgrano',
  'Recoleta', 'Caballito', 'San Isidro', 'Vicente López', 'Tigre',
];

const AVAILABILITY = ['full-time', 'part-time', 'freelance'];

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
// 1. ODONTOLOGÍA
// ════════════════════════════════════════════════════════════
const odontologia: ProfileSeed[] = [
  {
    name: 'Dr. Alejandro Vidal',
    gender: 'men',
    headline: 'Odontólogo general con especialización en estética dental',
    specialty: 'Estética dental',
    bio: 'Odontólogo con 12 años de experiencia, especializado en carillas de porcelana, blanqueamiento y diseño de sonrisa digital. Mi objetivo es que cada paciente logre la sonrisa que siempre soñó, combinando técnica de vanguardia con materiales premium.',
    skills: ['Carillas de porcelana', 'Blanqueamiento', 'Diseño de sonrisa', 'Resinas estéticas', 'Coronas', 'DSD (Digital Smile Design)'],
    certifications: ['Odontología UBA', 'Posgrado en Estética Dental - Círculo Argentino de Odontología'],
    yearsExperience: 12,
    experiences: [
      { businessName: 'Clínica Dental Sonríe', role: 'Director odontológico', yearsAgo: 0, current: true, desc: 'Estética dental integral, carillas y diseño de sonrisa' },
      { businessName: 'Consultorio Dr. Vidal', role: 'Odontólogo', yearsAgo: 6, current: false, desc: 'Odontología general y restauradora' },
    ],
  },
  {
    name: 'Dra. Mariana Beltrán',
    gender: 'women',
    headline: 'Ortodoncista con alineadores invisibles y brackets estéticos',
    specialty: 'Ortodoncia',
    bio: 'Ortodoncista con formación de posgrado y experiencia en tratamientos con alineadores transparentes (Invisalign), brackets estéticos y ortodoncia lingual. Atiendo niños, adolescentes y adultos con planes personalizados y resultados predecibles.',
    skills: ['Invisalign', 'Brackets estéticos', 'Ortodoncia lingual', 'Ortodoncia interceptiva', 'Planificación digital', 'Mini implantes'],
    certifications: ['Especialista en Ortodoncia - UBA', 'Invisalign Certified Provider'],
    yearsExperience: 9,
    experiences: [
      { businessName: 'Ortodoncia Beltrán', role: 'Ortodoncista', yearsAgo: 0, current: true, desc: 'Tratamientos de ortodoncia con alineadores y brackets' },
      { businessName: 'Centro Odontológico del Sur', role: 'Ortodoncista', yearsAgo: 4, current: false, desc: 'Ortodoncia en niños y adultos' },
    ],
  },
  {
    name: 'Dr. Federico Lanza',
    gender: 'men',
    headline: 'Implantólogo oral con tecnología 3D',
    specialty: 'Implantología',
    bio: 'Especialista en implantes dentales con cirugía guiada por computadora. Realizo desde implantes unitarios hasta rehabilitaciones completas (All-on-4). Trabajo con tomografía 3D y planificación digital para máxima precisión y mínima invasión.',
    skills: ['Implantes dentales', 'All-on-4', 'Cirugía guiada', 'Regeneración ósea', 'Elevación de seno', 'Carga inmediata'],
    certifications: ['Especialista en Implantología - USAL', 'Fellow ITI (International Team for Implantology)'],
    yearsExperience: 15,
    experiences: [
      { businessName: 'Centro de Implantes Buenos Aires', role: 'Implantólogo senior', yearsAgo: 0, current: true, desc: 'Implantes dentales y rehabilitación oral completa' },
      { businessName: 'Hospital Alemán', role: 'Cirujano implantólogo', yearsAgo: 7, current: false, desc: 'Cirugía de implantes y regeneración ósea' },
    ],
  },
  {
    name: 'Dra. Carla Romagnoli',
    gender: 'women',
    headline: 'Odontopediatra con atención lúdica y sin dolor',
    specialty: 'Odontopediatría',
    bio: 'Odontóloga especializada en niños y bebés. Mi consultorio está diseñado para que los más pequeños se sientan cómodos y seguros. Uso técnicas de manejo de conducta, sedación consciente y odontología mínimamente invasiva para una experiencia positiva.',
    skills: ['Odontología infantil', 'Sedación consciente', 'Selladores', 'Pulpotomía', 'Coronas pediátricas', 'Manejo de conducta'],
    certifications: ['Especialista en Odontopediatría - UBA', 'Sedación consciente en odontología'],
    yearsExperience: 8,
    experiences: [
      { businessName: 'Dientes Felices', role: 'Odontopediatra', yearsAgo: 0, current: true, desc: 'Atención odontológica integral para niños de 0 a 14 años' },
      { businessName: 'Hospital de Niños R. Gutiérrez', role: 'Odontóloga de planta', yearsAgo: 4, current: false, desc: 'Odontopediatría hospitalaria' },
    ],
  },
  {
    name: 'Dr. Gastón Heredia',
    gender: 'men',
    headline: 'Endodoncista con microscopio y tecnología rotaria',
    specialty: 'Endodoncia',
    bio: 'Especialista en tratamientos de conducto con tecnología de última generación: microscopio operatorio, limas rotatorias NiTi y obturación termoplástica. Resuelvo casos complejos como retratamientos, conductos calcificados y perforaciones.',
    skills: ['Tratamiento de conducto', 'Microscopio operatorio', 'Limas rotatorias', 'Retratamiento', 'Apicectomía', 'Conductos calcificados'],
    certifications: ['Especialista en Endodoncia - USAL', 'Microscopía en endodoncia'],
    yearsExperience: 11,
    experiences: [
      { businessName: 'EndoDent Especializada', role: 'Endodoncista', yearsAgo: 0, current: true, desc: 'Endodoncia de alta complejidad con microscopio' },
      { businessName: 'Clínica Odontológica Integral', role: 'Endodoncista', yearsAgo: 5, current: false, desc: 'Tratamientos de conducto y urgencias' },
    ],
  },
  {
    name: 'Dra. Natalia Cuestas',
    gender: 'women',
    headline: 'Periodoncista especializada en encías y mantenimiento',
    specialty: 'Periodoncia',
    bio: 'Periodoncista con enfoque preventivo y quirúrgico. Trato enfermedad periodontal, recesiones gingivales y estética de encías. Realizo cirugías plásticas periodontales e injertos de tejido conectivo con resultados naturales y estables.',
    skills: ['Periodoncia', 'Injerto de encía', 'Cirugía plástica periodontal', 'Raspaje y alisado', 'Alargamiento coronario', 'Mantenimiento periodontal'],
    certifications: ['Especialista en Periodoncia - UBA', 'Microcirugía periodontal'],
    yearsExperience: 10,
    experiences: [
      { businessName: 'Perio Center', role: 'Periodoncista', yearsAgo: 0, current: true, desc: 'Periodoncia clínica y quirúrgica' },
      { businessName: 'Facultad de Odontología UBA', role: 'Docente e investigadora', yearsAgo: 6, current: false, desc: 'Docencia e investigación en periodoncia' },
    ],
  },
];

// ════════════════════════════════════════════════════════════
// 2. PSICOLOGÍA Y TERAPIA
// ════════════════════════════════════════════════════════════
const psicologia: ProfileSeed[] = [
  {
    name: 'Lic. Gabriela Fontana',
    gender: 'women',
    headline: 'Psicóloga clínica especializada en ansiedad y estrés',
    specialty: 'Psicología clínica',
    bio: 'Psicóloga clínica con orientación cognitivo-conductual. Trabajo con adultos que atraviesan cuadros de ansiedad, ataques de pánico, estrés laboral y trastornos del ánimo. Ofrezco terapia presencial y online con un enfoque práctico y basado en evidencia.',
    skills: ['Terapia cognitivo-conductual', 'Ansiedad', 'Ataques de pánico', 'Estrés laboral', 'Mindfulness', 'Terapia online'],
    certifications: ['Lic. en Psicología - UBA', 'Posgrado en TCC - Fundación Foro'],
    yearsExperience: 10,
    experiences: [
      { businessName: 'Consultorio Lic. Fontana', role: 'Psicóloga clínica', yearsAgo: 0, current: true, desc: 'Atención individual de adultos con trastornos de ansiedad y del ánimo' },
      { businessName: 'Centro de Salud Mental Belgrano', role: 'Psicóloga', yearsAgo: 5, current: false, desc: 'Atención clínica y grupos terapéuticos' },
    ],
  },
  {
    name: 'Lic. Martín Etcheverry',
    gender: 'men',
    headline: 'Psicólogo de parejas y familias con enfoque sistémico',
    specialty: 'Terapia de pareja',
    bio: 'Psicólogo sistémico especializado en conflictos de pareja, crisis familiares y comunicación. Trabajo con el vínculo como unidad de análisis, ayudando a las parejas a reencontrar la conexión, resolver diferencias y construir una relación más sólida.',
    skills: ['Terapia de pareja', 'Terapia familiar', 'Mediación', 'Comunicación no violenta', 'Crisis vincular', 'Terapia sistémica'],
    certifications: ['Lic. en Psicología - USAL', 'Posgrado en Terapia Familiar Sistémica - CEFYP'],
    yearsExperience: 12,
    experiences: [
      { businessName: 'Espacio Vincular', role: 'Terapeuta de pareja y familia', yearsAgo: 0, current: true, desc: 'Terapia de pareja, familia y mediación vincular' },
      { businessName: 'Hospital Rivadavia', role: 'Psicólogo de planta', yearsAgo: 6, current: false, desc: 'Atención clínica y grupos de familia' },
    ],
  },
  {
    name: 'Lic. Carolina Amaya',
    gender: 'women',
    headline: 'Psicóloga infanto-juvenil con juego y arte terapia',
    specialty: 'Psicología infantil',
    bio: 'Psicóloga especializada en niños y adolescentes. Utilizo técnicas de juego, arte terapia y narrativa para acompañar procesos emocionales, dificultades escolares, duelos, separaciones y trastornos del neurodesarrollo. Trabajo en equipo con padres y escuelas.',
    skills: ['Psicología infantil', 'Arte terapia', 'Juego terapéutico', 'TDAH', 'TEA', 'Orientación a padres'],
    certifications: ['Lic. en Psicología - UBA', 'Especialización en Psicología Infanto-Juvenil'],
    yearsExperience: 8,
    experiences: [
      { businessName: 'Crecer Jugando', role: 'Psicóloga infantil', yearsAgo: 0, current: true, desc: 'Atención psicológica de niños de 3 a 16 años' },
      { businessName: 'Colegio San Andrés', role: 'Psicóloga escolar', yearsAgo: 4, current: false, desc: 'Gabinete psicopedagógico y orientación' },
    ],
  },
  {
    name: 'Lic. Diego Santoro',
    gender: 'men',
    headline: 'Coach ontológico y terapeuta de desarrollo personal',
    specialty: 'Coaching ontológico',
    bio: 'Coach ontológico certificado con formación en PNL y psicología positiva. Acompaño procesos de cambio personal y profesional: transiciones de carrera, liderazgo, autoconocimiento y diseño de vida. Sesiones individuales y grupales, presenciales y online.',
    skills: ['Coaching ontológico', 'PNL', 'Psicología positiva', 'Liderazgo', 'Inteligencia emocional', 'Diseño de vida'],
    certifications: ['Coach Ontológico Profesional - Newfield Network', 'PNL Practitioner'],
    yearsExperience: 7,
    experiences: [
      { businessName: 'Coaching Transformar', role: 'Coach y facilitador', yearsAgo: 0, current: true, desc: 'Coaching individual y de equipos para el desarrollo personal y profesional' },
      { businessName: 'Consultora RH Partners', role: 'Coach ejecutivo', yearsAgo: 3, current: false, desc: 'Coaching ejecutivo y de liderazgo en empresas' },
    ],
  },
  {
    name: 'Lic. Florencia Navarro',
    gender: 'women',
    headline: 'Neuropsicóloga con evaluación y rehabilitación cognitiva',
    specialty: 'Neuropsicología',
    bio: 'Neuropsicóloga clínica con experiencia en evaluación y rehabilitación de funciones cognitivas: memoria, atención, lenguaje y funciones ejecutivas. Trabajo con pacientes neurológicos, adultos mayores y personas con deterioro cognitivo.',
    skills: ['Evaluación neuropsicológica', 'Rehabilitación cognitiva', 'Estimulación cognitiva', 'Memoria', 'Atención', 'Demencias'],
    certifications: ['Lic. en Psicología - UBA', 'Especialista en Neuropsicología Clínica - INECO'],
    yearsExperience: 9,
    experiences: [
      { businessName: 'Centro Neurocognitivo', role: 'Neuropsicóloga', yearsAgo: 0, current: true, desc: 'Evaluación y rehabilitación neuropsicológica' },
      { businessName: 'INECO', role: 'Neuropsicóloga clínica', yearsAgo: 5, current: false, desc: 'Evaluación cognitiva e investigación' },
    ],
  },
  {
    name: 'Lic. Tomás Regueira',
    gender: 'men',
    headline: 'Psicólogo especialista en adicciones y conductas compulsivas',
    specialty: 'Adicciones',
    bio: 'Psicólogo especializado en tratamiento de adicciones: sustancias, juego patológico, tecnología y conductas compulsivas. Enfoque motivacional e integrativo. Trabajo individual, grupal y con familias afectadas. Experiencia en comunidades terapéuticas.',
    skills: ['Adicciones', 'Entrevista motivacional', 'Prevención de recaídas', 'Terapia grupal', 'Juego patológico', 'Acompañamiento familiar'],
    certifications: ['Lic. en Psicología - UBA', 'Especialista en Drogadependencia - Fundación CEDRO'],
    yearsExperience: 11,
    experiences: [
      { businessName: 'Centro Renacer', role: 'Psicólogo especialista en adicciones', yearsAgo: 0, current: true, desc: 'Tratamiento individual y grupal de adicciones' },
      { businessName: 'Comunidad Terapéutica Vida Nueva', role: 'Coordinador terapéutico', yearsAgo: 5, current: false, desc: 'Coordinación de equipos y atención de residentes' },
    ],
  },
];

// ════════════════════════════════════════════════════════════
// 3. NUTRICIÓN
// ════════════════════════════════════════════════════════════
const nutricion: ProfileSeed[] = [
  {
    name: 'Lic. Julieta Marín',
    gender: 'women',
    headline: 'Nutricionista clínica con enfoque en alimentación real',
    specialty: 'Nutrición clínica',
    bio: 'Nutricionista con enfoque en alimentación real, sin dietas restrictivas. Trabajo con un abordaje integral que incluye planificación de menús, educación alimentaria y seguimiento personalizado. Atiendo patologías como diabetes, hipertensión, celiaquía y alergias alimentarias.',
    skills: ['Plan alimentario', 'Diabetes', 'Celiaquía', 'Hipertensión', 'Educación alimentaria', 'Alimentación real'],
    certifications: ['Lic. en Nutrición - UBA', 'Posgrado en Nutrición Clínica'],
    yearsExperience: 8,
    experiences: [
      { businessName: 'Nutrición Consciente', role: 'Nutricionista clínica', yearsAgo: 0, current: true, desc: 'Consultas nutricionales individuales y planes alimentarios' },
      { businessName: 'Hospital Fernández', role: 'Nutricionista de planta', yearsAgo: 4, current: false, desc: 'Atención nutricional hospitalaria' },
    ],
  },
  {
    name: 'Lic. Sebastián Quiroga',
    gender: 'men',
    headline: 'Nutricionista deportivo para atletas y deportistas',
    specialty: 'Nutrición deportiva',
    bio: 'Nutricionista deportivo con experiencia en equipos de fútbol, rugby y running. Diseño planes de alimentación para optimizar rendimiento, recuperación y composición corporal. Trabajo con suplementación basada en evidencia y periodización nutricional.',
    skills: ['Nutrición deportiva', 'Suplementación', 'Composición corporal', 'Periodización nutricional', 'Hidratación', 'Antropometría'],
    certifications: ['Lic. en Nutrición - USAL', 'Nutrición Deportiva - ISAK Level 2'],
    yearsExperience: 7,
    experiences: [
      { businessName: 'Sport Nutrition BA', role: 'Nutricionista deportivo', yearsAgo: 0, current: true, desc: 'Asesoramiento nutricional para deportistas y equipos' },
      { businessName: 'Club Atlético River Plate', role: 'Nutricionista del plantel juvenil', yearsAgo: 3, current: false, desc: 'Nutrición deportiva para divisiones inferiores' },
    ],
  },
  {
    name: 'Lic. Romina Fuentes',
    gender: 'women',
    headline: 'Nutricionista materno-infantil y pediatría',
    specialty: 'Nutrición infantil',
    bio: 'Nutricionista especializada en embarazo, lactancia, alimentación complementaria y nutrición pediátrica. Acompaño a familias en cada etapa del crecimiento con un enfoque respetuoso y basado en la evidencia. También trabajo con selectividad alimentaria y BLW.',
    skills: ['Nutrición pediátrica', 'Embarazo', 'Lactancia', 'BLW', 'Alimentación complementaria', 'Selectividad alimentaria'],
    certifications: ['Lic. en Nutrición - UBA', 'Nutrición Materno-Infantil - Hospital Garrahan'],
    yearsExperience: 6,
    experiences: [
      { businessName: 'Nutri Familia', role: 'Nutricionista materno-infantil', yearsAgo: 0, current: true, desc: 'Asesoramiento nutricional para embarazadas, bebés y niños' },
      { businessName: 'Hospital Garrahan', role: 'Nutricionista pediátrica', yearsAgo: 3, current: false, desc: 'Nutrición clínica pediátrica' },
    ],
  },
  {
    name: 'Lic. Andrés Molina',
    gender: 'men',
    headline: 'Nutricionista funcional y microbioma intestinal',
    specialty: 'Nutrición funcional',
    bio: 'Nutricionista con formación en medicina funcional e integrativa. Me enfoco en la salud intestinal, microbioma y su relación con inflamación, autoinmunidad y bienestar general. Diseño protocolos personalizados con alimentos funcionales y suplementación dirigida.',
    skills: ['Nutrición funcional', 'Microbioma', 'Salud intestinal', 'Antiinflamatorio', 'Suplementación', 'Autoinmunidad'],
    certifications: ['Lic. en Nutrición - UBA', 'Nutrición Funcional - IFM (Institute for Functional Medicine)'],
    yearsExperience: 9,
    experiences: [
      { businessName: 'Centro de Nutrición Integrativa', role: 'Nutricionista funcional', yearsAgo: 0, current: true, desc: 'Consultas de nutrición funcional e integrativa' },
      { businessName: 'Clínica Swiss Medical', role: 'Nutricionista', yearsAgo: 4, current: false, desc: 'Nutrición clínica y consulta ambulatoria' },
    ],
  },
  {
    name: 'Lic. Camila Astrada',
    gender: 'women',
    headline: 'Nutricionista especializada en trastornos alimentarios',
    specialty: 'Trastornos alimentarios',
    bio: 'Nutricionista con formación en trastornos de la conducta alimentaria: anorexia, bulimia, atracones y ortorexia. Trabajo en equipo interdisciplinario con psicólogos y psiquiatras. Mi enfoque es la alimentación intuitiva y la reconciliación con la comida.',
    skills: ['TCA', 'Alimentación intuitiva', 'Anorexia', 'Bulimia', 'Atracones', 'Body positive'],
    certifications: ['Lic. en Nutrición - UBA', 'TCA - Asociación de Lucha contra Bulimia y Anorexia'],
    yearsExperience: 7,
    experiences: [
      { businessName: 'Espacio Nutrir', role: 'Nutricionista especializada en TCA', yearsAgo: 0, current: true, desc: 'Tratamiento nutricional de trastornos alimentarios' },
      { businessName: 'Fundación ALUBA', role: 'Nutricionista', yearsAgo: 3, current: false, desc: 'Abordaje nutricional en equipo interdisciplinario' },
    ],
  },
  {
    name: 'Lic. Pablo Arriaga',
    gender: 'men',
    headline: 'Nutricionista plant-based y alimentación sustentable',
    specialty: 'Nutrición vegana',
    bio: 'Nutricionista especializado en alimentación basada en plantas: veganismo, vegetarianismo y flexitarianismo. Diseño planes completos y equilibrados, asegurando todos los nutrientes críticos. También asesoro restaurantes y empresas de alimentos plant-based.',
    skills: ['Nutrición vegana', 'Vegetarianismo', 'Suplementación B12', 'Proteínas vegetales', 'Recetas plant-based', 'Sustentabilidad'],
    certifications: ['Lic. en Nutrición - USAL', 'Plant-Based Nutrition - eCornell'],
    yearsExperience: 5,
    experiences: [
      { businessName: 'Green Nutrition', role: 'Nutricionista plant-based', yearsAgo: 0, current: true, desc: 'Asesoramiento en alimentación basada en plantas' },
      { businessName: 'Restaurante Buenos Aires Verde', role: 'Asesor nutricional', yearsAgo: 2, current: false, desc: 'Diseño de menú y contenido nutricional' },
    ],
  },
];

// ════════════════════════════════════════════════════════════
// 4. FITNESS Y DEPORTE
// ════════════════════════════════════════════════════════════
const fitness: ProfileSeed[] = [
  {
    name: 'Matías Coronel',
    gender: 'men',
    headline: 'Personal trainer certificado con enfoque funcional',
    specialty: 'Entrenamiento funcional',
    bio: 'Entrenador personal con más de 10 años de experiencia. Me especializo en entrenamiento funcional, HIIT y preparación física general. Diseño rutinas personalizadas según objetivos: pérdida de grasa, ganancia muscular, rendimiento deportivo o simplemente sentirse mejor.',
    skills: ['Entrenamiento funcional', 'HIIT', 'Fuerza', 'Pérdida de grasa', 'Hipertrofia', 'Evaluación física'],
    certifications: ['Personal Trainer Certificado - ACSM', 'Entrenamiento Funcional - FMS Level 2'],
    yearsExperience: 10,
    experiences: [
      { businessName: 'Fit Studio Coronel', role: 'Personal trainer y dueño', yearsAgo: 0, current: true, desc: 'Entrenamiento personal y grupal funcional' },
      { businessName: 'Megatlon Gym', role: 'Personal trainer', yearsAgo: 5, current: false, desc: 'Entrenamiento personalizado y clases grupales' },
    ],
  },
  {
    name: 'Agustina Pellegrini',
    gender: 'women',
    headline: 'Instructora de yoga con formación en India',
    specialty: 'Yoga',
    bio: 'Instructora de yoga certificada con formación en Rishikesh, India. Enseño Hatha, Vinyasa y Yoga Restaurativo. Mis clases combinan asanas, pranayama y meditación para lograr un equilibrio entre cuerpo y mente. Clases grupales, privadas y retiros.',
    skills: ['Hatha yoga', 'Vinyasa', 'Yoga restaurativo', 'Pranayama', 'Meditación', 'Yoga prenatal'],
    certifications: ['RYT 500 - Yoga Alliance', 'Yoga Prenatal - Birthlight'],
    yearsExperience: 8,
    experiences: [
      { businessName: 'Shanti Yoga Studio', role: 'Directora e instructora', yearsAgo: 0, current: true, desc: 'Clases de yoga grupal, privadas y retiros' },
      { businessName: 'Club El Progreso', role: 'Instructora de yoga', yearsAgo: 4, current: false, desc: 'Clases de yoga y meditación' },
    ],
  },
  {
    name: 'Lucas Pereyra',
    gender: 'men',
    headline: 'Coach de CrossFit y preparación física de alto rendimiento',
    specialty: 'CrossFit',
    bio: 'Coach de CrossFit Level 2 con experiencia en competidores y atletas recreacionales. Mi enfoque combina halterofilia, gimnásticos y cardio metabólico con progresión segura y técnica impecable. También preparo atletas para competencias regionales y nacionales.',
    skills: ['CrossFit', 'Halterofilia', 'Gimnásticos', 'Programación', 'Competición', 'Movilidad'],
    certifications: ['CrossFit Level 2 Trainer', 'USAW Sport Performance Coach'],
    yearsExperience: 7,
    experiences: [
      { businessName: 'Box CrossFit Fuego', role: 'Head coach', yearsAgo: 0, current: true, desc: 'Programación y coaching de CrossFit para todos los niveles' },
      { businessName: 'CrossFit Recoleta', role: 'Coach', yearsAgo: 3, current: false, desc: 'Coaching de clases grupales y privadas' },
    ],
  },
  {
    name: 'Valentina Rizzo',
    gender: 'women',
    headline: 'Instructora de Pilates reformer y mat certificada',
    specialty: 'Pilates',
    bio: 'Instructora de Pilates con especialización en Reformer, mat y Pilates terapéutico. Trabajo con personas con dolores de espalda, problemas posturales, embarazadas y adultos mayores. Mi método se adapta a cada cuerpo con atención personalizada.',
    skills: ['Pilates reformer', 'Pilates mat', 'Pilates terapéutico', 'Postura', 'Core', 'Embarazo'],
    certifications: ['Pilates Reformer - STOTT Pilates', 'Pilates Terapéutico - Polestar'],
    yearsExperience: 9,
    experiences: [
      { businessName: 'Studio Pilates Rizzo', role: 'Directora e instructora', yearsAgo: 0, current: true, desc: 'Clases de Pilates reformer individuales y en grupo reducido' },
      { businessName: 'Centro Médico Fitz Roy', role: 'Instructora de Pilates terapéutico', yearsAgo: 4, current: false, desc: 'Pilates para rehabilitación y problemas posturales' },
    ],
  },
  {
    name: 'Nicolás Bravo',
    gender: 'men',
    headline: 'Entrenador de running y preparador de maratones',
    specialty: 'Running',
    bio: 'Entrenador de running con experiencia propia en maratones y ultramaratones. Preparo corredores principiantes y avanzados para distancias de 5K a 42K+. Planes de entrenamiento periodizados, análisis de técnica de carrera y prevención de lesiones.',
    skills: ['Running', 'Maratón', 'Trail running', 'Técnica de carrera', 'Periodización', 'Prevención de lesiones'],
    certifications: ['Entrenador Nacional de Atletismo', 'Running Coach - RRCA'],
    yearsExperience: 6,
    experiences: [
      { businessName: 'Run Team BA', role: 'Head coach', yearsAgo: 0, current: true, desc: 'Preparación de corredores para carreras de 5K a maratón' },
      { businessName: 'Nike Run Club BA', role: 'Pacer y coach invitado', yearsAgo: 2, current: false, desc: 'Coaching de grupos de running' },
    ],
  },
  {
    name: 'Catalina Herrera',
    gender: 'women',
    headline: 'Especialista en fitness para adultos mayores',
    specialty: 'Fitness adulto mayor',
    bio: 'Profesora de educación física especializada en tercera edad. Diseño programas de ejercicio seguros y efectivos para adultos mayores: equilibrio, fuerza funcional, flexibilidad y prevención de caídas. Trabajo en geriátricos, centros de día y a domicilio.',
    skills: ['Adultos mayores', 'Equilibrio', 'Prevención de caídas', 'Fuerza funcional', 'Flexibilidad', 'Gimnasia suave'],
    certifications: ['Prof. de Educación Física - UBA', 'Actividad Física para Adultos Mayores - OMS'],
    yearsExperience: 11,
    experiences: [
      { businessName: 'Movimiento Senior', role: 'Directora y profesora', yearsAgo: 0, current: true, desc: 'Programas de ejercicio para adultos mayores' },
      { businessName: 'Residencia Los Robles', role: 'Profesora de educación física', yearsAgo: 5, current: false, desc: 'Gimnasia y actividad física para residentes' },
    ],
  },
];

// ════════════════════════════════════════════════════════════
// 5. VETERINARIA
// ════════════════════════════════════════════════════════════
const veterinaria: ProfileSeed[] = [
  {
    name: 'Dra. Laura Mendoza',
    gender: 'women',
    headline: 'Veterinaria de pequeños animales con enfoque integral',
    specialty: 'Clínica general',
    bio: 'Médica veterinaria con 10 años de experiencia en clínica de pequeños animales. Atiendo perros, gatos, conejos y hurones. Consultas de rutina, vacunación, desparasitación, cirugías menores y medicina preventiva. Mi prioridad es el bienestar animal y la tranquilidad de sus familias.',
    skills: ['Clínica general', 'Vacunación', 'Cirugía menor', 'Medicina preventiva', 'Ecografía', 'Análisis de laboratorio'],
    certifications: ['Médica Veterinaria - UBA', 'Ecografía veterinaria'],
    yearsExperience: 10,
    experiences: [
      { businessName: 'Veterinaria Patitas', role: 'Directora médica', yearsAgo: 0, current: true, desc: 'Clínica veterinaria integral para pequeños animales' },
      { businessName: 'Pet Shop Mundo Animal', role: 'Veterinaria de guardia', yearsAgo: 5, current: false, desc: 'Atención clínica y urgencias' },
    ],
  },
  {
    name: 'Dr. Fernando Giménez',
    gender: 'men',
    headline: 'Cirujano veterinario especializado en traumatología',
    specialty: 'Cirugía veterinaria',
    bio: 'Cirujano veterinario con especialización en traumatología y ortopedia. Realizo cirugías de fractura, luxación de rótula, ligamento cruzado (TPLO), hernias y cirugías de tejidos blandos. Equipamiento de última generación y recuperación con fisioterapia.',
    skills: ['Cirugía ortopédica', 'TPLO', 'Fracturas', 'Luxación de rótula', 'Tejidos blandos', 'Artroscopia'],
    certifications: ['Médico Veterinario - UBA', 'Especialista en Cirugía - CPMV'],
    yearsExperience: 14,
    experiences: [
      { businessName: 'Centro Quirúrgico Veterinario', role: 'Cirujano jefe', yearsAgo: 0, current: true, desc: 'Cirugías ortopédicas y de tejidos blandos' },
      { businessName: 'Hospital Veterinario del Sur', role: 'Cirujano', yearsAgo: 6, current: false, desc: 'Cirugía general y traumatología' },
    ],
  },
  {
    name: 'Dra. Celeste Ramos',
    gender: 'women',
    headline: 'Dermatóloga veterinaria para perros y gatos',
    specialty: 'Dermatología veterinaria',
    bio: 'Veterinaria especialista en dermatología. Diagnostico y trato enfermedades de piel, pelo y oídos: alergias, dermatitis atópica, sarnas, hongos, otitis crónicas y enfermedades autoinmunes. Uso citología, cultivos y biopsias para diagnóstico preciso.',
    skills: ['Dermatología canina', 'Dermatología felina', 'Alergias', 'Otitis', 'Citología', 'Inmunoterapia'],
    certifications: ['Médica Veterinaria - UBA', 'Residencia en Dermatología Veterinaria'],
    yearsExperience: 8,
    experiences: [
      { businessName: 'DermVet Buenos Aires', role: 'Dermatóloga veterinaria', yearsAgo: 0, current: true, desc: 'Consultas dermatológicas especializadas' },
      { businessName: 'Hospital Escuela FCV-UBA', role: 'Residente de dermatología', yearsAgo: 4, current: false, desc: 'Formación en dermatología veterinaria' },
    ],
  },
  {
    name: 'Dr. Martín Carreras',
    gender: 'men',
    headline: 'Veterinario de exóticos: aves, reptiles y pequeños mamíferos',
    specialty: 'Animales exóticos',
    bio: 'Veterinario especializado en animales exóticos y no tradicionales: aves (loros, canarios), reptiles (tortugas, iguanas), roedores (hamsters, cobayos) y erizos. Uno de los pocos veterinarios de exóticos en Buenos Aires con equipamiento específico.',
    skills: ['Aves', 'Reptiles', 'Roedores', 'Erizos', 'Cirugía de exóticos', 'Nutrición de exóticos'],
    certifications: ['Médico Veterinario - UBA', 'Medicina de Animales Exóticos - AAMeFE'],
    yearsExperience: 9,
    experiences: [
      { businessName: 'Exotics Vet Center', role: 'Veterinario de exóticos', yearsAgo: 0, current: true, desc: 'Atención médica integral para animales exóticos' },
      { businessName: 'Zoológico de Buenos Aires', role: 'Veterinario', yearsAgo: 5, current: false, desc: 'Atención de fauna silvestre y exótica' },
    ],
  },
  {
    name: 'Dra. Agustina Correa',
    gender: 'women',
    headline: 'Veterinaria conductista especializada en comportamiento animal',
    specialty: 'Etología clínica',
    bio: 'Veterinaria etóloga clínica. Diagnostico y trato problemas de comportamiento en perros y gatos: agresividad, ansiedad por separación, miedos, fobias, marcaje y problemas de convivencia. Trabajo con modificación de conducta y, cuando es necesario, psicofarmacología.',
    skills: ['Etología clínica', 'Modificación de conducta', 'Ansiedad por separación', 'Agresividad', 'Socialización', 'Enriquecimiento ambiental'],
    certifications: ['Médica Veterinaria - UBA', 'Etología Clínica Veterinaria - GRETCA'],
    yearsExperience: 7,
    experiences: [
      { businessName: 'Comportamiento Animal BA', role: 'Veterinaria conductista', yearsAgo: 0, current: true, desc: 'Consultas de comportamiento y modificación de conducta' },
      { businessName: 'Clínica Veterinaria San Bernardo', role: 'Veterinaria clínica', yearsAgo: 3, current: false, desc: 'Medicina general y consultas de conducta' },
    ],
  },
  {
    name: 'Dr. Diego Urquiza',
    gender: 'men',
    headline: 'Cardiólogo veterinario con ecocardiografía',
    specialty: 'Cardiología veterinaria',
    bio: 'Veterinario cardiólogo con experiencia en diagnóstico y tratamiento de enfermedades cardíacas en perros y gatos. Realizo ecocardiografía Doppler, electrocardiografía y Holter. Manejo insuficiencia cardíaca, valvulopatías, cardiomiopatías y arritmias.',
    skills: ['Ecocardiografía', 'Electrocardiografía', 'Holter', 'Insuficiencia cardíaca', 'Valvulopatías', 'Cardiomiopatías'],
    certifications: ['Médico Veterinario - UBA', 'Cardiología Veterinaria - ECVIM-CA'],
    yearsExperience: 12,
    experiences: [
      { businessName: 'CardioVet Centro Diagnóstico', role: 'Cardiólogo veterinario', yearsAgo: 0, current: true, desc: 'Diagnóstico y tratamiento de enfermedades cardíacas' },
      { businessName: 'Hospital Veterinario del Parque', role: 'Cardiólogo referente', yearsAgo: 5, current: false, desc: 'Cardiología veterinaria de referencia' },
    ],
  },
];

// ════════════════════════════════════════════════════════════
// 6. TATUAJES Y PIERCING
// ════════════════════════════════════════════════════════════
const tatuajesPiercing: ProfileSeed[] = [
  {
    name: 'Nahuel Bustos',
    gender: 'men',
    headline: 'Tatuador realista especializado en retratos y animales',
    specialty: 'Tatuaje realista',
    bio: 'Tatuador con 9 años de experiencia especializado en realismo en blanco y negro y color. Mis trabajos más destacados son retratos, animales y naturaleza. Cada pieza es única, diseñada a medida con el cliente. Trabajo con las mejores tintas y equipos del mercado.',
    skills: ['Realismo B&N', 'Realismo color', 'Retratos', 'Animales', 'Naturaleza', 'Cover ups'],
    certifications: ['Certificación en bioseguridad', 'Realismo avanzado - Ink Master Academy'],
    yearsExperience: 9,
    experiences: [
      { businessName: 'Black Ink Studio', role: 'Tatuador principal', yearsAgo: 0, current: true, desc: 'Tatuajes realistas y cover ups' },
      { businessName: 'Tattoo Convention Buenos Aires', role: 'Artista invitado', yearsAgo: 3, current: false, desc: 'Participación en convenciones nacionales' },
    ],
  },
  {
    name: 'Ailén Contreras',
    gender: 'women',
    headline: 'Tatuadora fine line y minimalista',
    specialty: 'Fine line',
    bio: 'Tatuadora especializada en fine line, trazo fino y minimalismo. Mis diseños son delicados, elegantes y con significado. Trabajo mucho con botánica, constelaciones, lettering y símbolos. Cada tatuaje es una obra de arte en miniatura hecha con precisión.',
    skills: ['Fine line', 'Minimalismo', 'Botánica', 'Lettering', 'Micro tattoo', 'Constelaciones'],
    certifications: ['Certificación en bioseguridad', 'Fine line technique - Seoul Ink'],
    yearsExperience: 5,
    experiences: [
      { businessName: 'Delicate Ink', role: 'Tatuadora fine line', yearsAgo: 0, current: true, desc: 'Tatuajes fine line y minimalistas' },
      { businessName: 'Studio Bohemio', role: 'Tatuadora', yearsAgo: 2, current: false, desc: 'Tatuajes artísticos y diseño' },
    ],
  },
  {
    name: 'Joaquín Altamirano',
    gender: 'men',
    headline: 'Tatuador tradicional y neotradicional',
    specialty: 'Neotradicional',
    bio: 'Tatuador con pasión por el old school y el neotradicional. Mis diseños combinan la estética clásica americana con colores vibrantes y líneas modernas. Especialista en piezas grandes: mangas completas, espaldas y pecho. Cada trabajo lleva horas de diseño personalizado.',
    skills: ['Old school', 'Neotradicional', 'Mangas completas', 'Color vibrante', 'Diseño personalizado', 'Piezas grandes'],
    certifications: ['Certificación en bioseguridad', 'Traditional tattooing masterclass'],
    yearsExperience: 11,
    experiences: [
      { businessName: 'Old Crown Tattoo', role: 'Tatuador y dueño', yearsAgo: 0, current: true, desc: 'Tatuajes tradicionales y neotradicionales' },
      { businessName: 'Classic Ink Parlour', role: 'Tatuador senior', yearsAgo: 5, current: false, desc: 'Tatuajes old school y custom' },
    ],
  },
  {
    name: 'Sofía Del Valle',
    gender: 'women',
    headline: 'Piercer profesional con joyería de alta calidad',
    specialty: 'Piercing',
    bio: 'Piercer profesional con formación en anatomía y bioseguridad. Realizo todo tipo de piercings corporales y de oreja con joyería de titanio implant-grade y oro 14k. Mi prioridad es la seguridad, la higiene y una experiencia cómoda para el cliente.',
    skills: ['Piercing de oreja', 'Piercing corporal', 'Joyería implant-grade', 'Curated ear', 'Dilataciones', 'Aftercare'],
    certifications: ['Piercer certificada - APP (Association of Professional Piercers)', 'Bioseguridad nivel III'],
    yearsExperience: 6,
    experiences: [
      { businessName: 'Adorn Piercing Studio', role: 'Piercer principal', yearsAgo: 0, current: true, desc: 'Piercing profesional con joyería premium' },
      { businessName: 'Ink & Pierce BA', role: 'Piercer', yearsAgo: 3, current: false, desc: 'Piercing corporal y de oreja' },
    ],
  },
  {
    name: 'Gonzalo Peralta',
    gender: 'men',
    headline: 'Tatuador geométrico y dotwork con piezas de gran formato',
    specialty: 'Geométrico y dotwork',
    bio: 'Tatuador especializado en geometría sagrada, dotwork y mandalas. Mis piezas se caracterizan por la simetría perfecta, los patrones complejos y el puntillismo. Trabajo mucho con piezas de gran formato que fluyen con la anatomía del cuerpo.',
    skills: ['Dotwork', 'Geometría sagrada', 'Mandalas', 'Puntillismo', 'Blackwork', 'Patrones'],
    certifications: ['Certificación en bioseguridad', 'Dotwork masterclass - Berlin Ink'],
    yearsExperience: 8,
    experiences: [
      { businessName: 'Sacred Geometry Tattoo', role: 'Tatuador especializado', yearsAgo: 0, current: true, desc: 'Tatuajes geométricos, dotwork y mandalas' },
      { businessName: 'Tattoo Expo Berlín', role: 'Artista invitado', yearsAgo: 2, current: false, desc: 'Participación internacional en convenciones' },
    ],
  },
  {
    name: 'Camila Roldán',
    gender: 'women',
    headline: 'Tatuadora acuarela y estilo ilustrativo',
    specialty: 'Acuarela',
    bio: 'Tatuadora con formación en bellas artes, especializada en estilo acuarela, ilustrativo y sketch. Mis tatuajes parecen pinturas sobre la piel, con colores suaves, salpicaduras y trazos libres. Cada pieza es arte original que nace de la colaboración con el cliente.',
    skills: ['Acuarela', 'Ilustrativo', 'Sketch', 'Color suave', 'Arte original', 'Diseño personalizado'],
    certifications: ['Bellas Artes - UNA', 'Certificación en bioseguridad'],
    yearsExperience: 6,
    experiences: [
      { businessName: 'Watercolor Ink Studio', role: 'Tatuadora artística', yearsAgo: 0, current: true, desc: 'Tatuajes estilo acuarela e ilustrativo' },
      { businessName: 'Galería de Arte Contemporáneo', role: 'Artista visual', yearsAgo: 3, current: false, desc: 'Exposiciones y arte visual' },
    ],
  },
];

// ════════════════════════════════════════════════════════════
// 7. EDUCACIÓN Y CLASES
// ════════════════════════════════════════════════════════════
const educacion: ProfileSeed[] = [
  {
    name: 'Prof. Ignacio Salgado',
    gender: 'men',
    headline: 'Profesor de inglés con certificación Cambridge',
    specialty: 'Inglés',
    bio: 'Profesor de inglés con certificación Cambridge CELTA y 12 años de experiencia. Preparo alumnos para exámenes internacionales (FCE, CAE, IELTS, TOEFL), inglés de negocios y conversación. Clases dinámicas, personalizadas y orientadas a resultados.',
    skills: ['FCE', 'CAE', 'IELTS', 'TOEFL', 'Business English', 'Conversación'],
    certifications: ['Cambridge CELTA', 'CAE - Grade A'],
    yearsExperience: 12,
    experiences: [
      { businessName: 'English Lab BA', role: 'Director y profesor', yearsAgo: 0, current: true, desc: 'Clases de inglés y preparación de exámenes internacionales' },
      { businessName: 'Instituto Británico', role: 'Profesor de inglés', yearsAgo: 6, current: false, desc: 'Enseñanza de inglés todos los niveles' },
    ],
  },
  {
    name: 'Prof. Lucía Ferreyra',
    gender: 'women',
    headline: 'Profesora de música - Piano y teoría musical',
    specialty: 'Piano',
    bio: 'Profesora de piano y teoría musical con formación en el Conservatorio Nacional. Enseño desde nivel inicial hasta avanzado, repertorio clásico, popular y jazz. Preparo alumnos para exámenes del conservatorio y también para quienes buscan tocar por placer.',
    skills: ['Piano clásico', 'Piano popular', 'Jazz', 'Teoría musical', 'Lectura', 'Armonía'],
    certifications: ['Profesora Nacional de Música - Conservatorio Nacional', 'ABRSM Grade 8 Piano'],
    yearsExperience: 10,
    experiences: [
      { businessName: 'Estudio Musical Ferreyra', role: 'Profesora de piano', yearsAgo: 0, current: true, desc: 'Clases particulares de piano y teoría musical' },
      { businessName: 'Escuela de Música del Sur', role: 'Profesora', yearsAgo: 5, current: false, desc: 'Enseñanza de piano e iniciación musical' },
    ],
  },
  {
    name: 'Prof. Martín Aguiar',
    gender: 'men',
    headline: 'Tutor de matemáticas y física para secundario y universidad',
    specialty: 'Matemáticas',
    bio: 'Profesor de matemáticas y física con 8 años de experiencia en apoyo escolar y universitario. Explico de forma clara y paciente: álgebra, análisis, geometría, probabilidad, física mecánica y termodinámica. Preparo para exámenes, ingresos universitarios y CBC.',
    skills: ['Álgebra', 'Análisis matemático', 'Física', 'CBC', 'Ingreso universitario', 'Geometría'],
    certifications: ['Profesor de Matemáticas - UTN', 'Física General'],
    yearsExperience: 8,
    experiences: [
      { businessName: 'Clases Prof. Aguiar', role: 'Profesor particular', yearsAgo: 0, current: true, desc: 'Clases de matemáticas y física para secundario y universidad' },
      { businessName: 'Colegio Nacional Buenos Aires', role: 'Profesor de matemáticas', yearsAgo: 4, current: false, desc: 'Enseñanza de matemáticas nivel secundario' },
    ],
  },
  {
    name: 'Prof. Julieta Orozco',
    gender: 'women',
    headline: 'Profesora de danza contemporánea y expresión corporal',
    specialty: 'Danza contemporánea',
    bio: 'Bailarina y profesora de danza contemporánea con formación en el IUNA y cursos en Europa. Mis clases combinan técnica contemporánea, improvisación y composición. Trabajo con todos los niveles, desde principiantes hasta bailarines avanzados.',
    skills: ['Danza contemporánea', 'Expresión corporal', 'Improvisación', 'Contact improvisation', 'Release technique', 'Composición coreográfica'],
    certifications: ['Profesora de Danza - UNA (ex IUNA)', 'Contemporary Dance - Pina Bausch Foundation'],
    yearsExperience: 9,
    experiences: [
      { businessName: 'Estudio de Danza Orozco', role: 'Directora y profesora', yearsAgo: 0, current: true, desc: 'Clases de danza contemporánea y expresión corporal' },
      { businessName: 'Teatro San Martín', role: 'Bailarina y coreógrafa', yearsAgo: 4, current: false, desc: 'Compañía de danza contemporánea' },
    ],
  },
  {
    name: 'Prof. Ezequiel Moreno',
    gender: 'men',
    headline: 'Profesor de guitarra - Criolla, eléctrica y bajo',
    specialty: 'Guitarra',
    bio: 'Músico profesional y profesor de guitarra criolla, eléctrica y bajo. Enseño rock, blues, folk, tango y repertorio popular. Desde los primeros acordes hasta improvisación y composición. Clases amenas con foco en que el alumno disfrute tocando desde el primer día.',
    skills: ['Guitarra criolla', 'Guitarra eléctrica', 'Bajo', 'Rock', 'Blues', 'Improvisación'],
    certifications: ['Músico profesional - Conservatorio Manuel de Falla', 'Berklee Online Guitar'],
    yearsExperience: 11,
    experiences: [
      { businessName: 'Rock & Strings Academia', role: 'Profesor de guitarra', yearsAgo: 0, current: true, desc: 'Clases de guitarra y bajo para todos los niveles' },
      { businessName: 'Escuela de Música Popular', role: 'Profesor', yearsAgo: 5, current: false, desc: 'Enseñanza de guitarra y ensamble' },
    ],
  },
  {
    name: 'Prof. Carolina Lamas',
    gender: 'women',
    headline: 'Profesora de francés nativa con clases culturales',
    specialty: 'Francés',
    bio: 'Profesora de francés con doble nacionalidad (argentino-francesa). Enseño desde nivel A1 hasta C2 con un enfoque comunicativo y cultural. Preparo para exámenes DELF/DALF, francés para viajes, negocios y relocalización. Mis clases incluyen cultura, cine y gastronomía francesa.',
    skills: ['DELF', 'DALF', 'Francés conversacional', 'Francés de negocios', 'Cultura francesa', 'Fonética'],
    certifications: ['DALF C2', 'Profesora de FLE - Alliance Française'],
    yearsExperience: 7,
    experiences: [
      { businessName: 'Le Français avec Caro', role: 'Profesora de francés', yearsAgo: 0, current: true, desc: 'Clases de francés individuales y grupales' },
      { businessName: 'Alliance Française Buenos Aires', role: 'Profesora', yearsAgo: 4, current: false, desc: 'Enseñanza de francés todos los niveles' },
    ],
  },
];

// ════════════════════════════════════════════════════════════
// 8. CONSULTORÍA
// ════════════════════════════════════════════════════════════
const consultoria: ProfileSeed[] = [
  {
    name: 'Dr. Marcelo Pereyra',
    gender: 'men',
    headline: 'Abogado especializado en derecho laboral y empresarial',
    specialty: 'Derecho laboral',
    bio: 'Abogado con 15 años de experiencia en derecho laboral y empresarial. Asesoro empresas en contratación, despidos, convenios colectivos, prevención de litigios y compliance laboral. También atiendo consultas individuales de trabajadores.',
    skills: ['Derecho laboral', 'Despidos', 'Convenios colectivos', 'Compliance', 'Contratos', 'Litigios'],
    certifications: ['Abogado UBA', 'Posgrado en Derecho del Trabajo - UBA'],
    yearsExperience: 15,
    experiences: [
      { businessName: 'Estudio Pereyra & Asociados', role: 'Socio fundador', yearsAgo: 0, current: true, desc: 'Asesoramiento legal laboral y empresarial' },
      { businessName: 'Estudio Marval, O\'Farrell & Mairal', role: 'Asociado senior', yearsAgo: 7, current: false, desc: 'Derecho laboral corporativo' },
    ],
  },
  {
    name: 'Cdra. Silvina Marchetti',
    gender: 'women',
    headline: 'Contadora pública con especialización en impuestos',
    specialty: 'Contabilidad e impuestos',
    bio: 'Contadora pública con amplia experiencia en liquidación de impuestos, planificación fiscal, balances y auditoría para PyMEs y profesionales independientes. Me destaco por simplificar lo complejo y acompañar a mis clientes en cada paso con el fisco.',
    skills: ['Liquidación de impuestos', 'Ganancias', 'IVA', 'Bienes Personales', 'Monotributo', 'Balances'],
    certifications: ['Contadora Pública Nacional - UBA', 'Especialización en Tributación - UBA'],
    yearsExperience: 12,
    experiences: [
      { businessName: 'Estudio Contable Marchetti', role: 'Socia directora', yearsAgo: 0, current: true, desc: 'Asesoramiento contable e impositivo para PyMEs' },
      { businessName: 'KPMG Argentina', role: 'Senior de auditoría', yearsAgo: 6, current: false, desc: 'Auditoría de estados contables' },
    ],
  },
  {
    name: 'Lic. Roberto Insúa',
    gender: 'men',
    headline: 'Consultor de negocios y estrategia para PyMEs',
    specialty: 'Consultoría de negocios',
    bio: 'Consultor de negocios con MBA y experiencia en consultoría estratégica. Ayudo a PyMEs y emprendedores a crecer: modelo de negocio, estrategia comercial, pricing, procesos, indicadores y desarrollo organizacional. Enfoque práctico con resultados medibles.',
    skills: ['Estrategia', 'Modelo de negocio', 'Pricing', 'KPIs', 'Plan de negocios', 'Desarrollo organizacional'],
    certifications: ['MBA - IAE Business School', 'Lean Six Sigma Green Belt'],
    yearsExperience: 14,
    experiences: [
      { businessName: 'Insúa Consulting', role: 'Director', yearsAgo: 0, current: true, desc: 'Consultoría estratégica y de negocios para PyMEs' },
      { businessName: 'McKinsey & Company', role: 'Engagement Manager', yearsAgo: 7, current: false, desc: 'Consultoría estratégica corporativa' },
    ],
  },
  {
    name: 'Arq. Daniela Villamil',
    gender: 'women',
    headline: 'Arquitecta consultora en interiorismo comercial',
    specialty: 'Interiorismo comercial',
    bio: 'Arquitecta especializada en diseño de interiores comerciales: locales, consultorios, oficinas, restaurantes y spa. Diseño espacios funcionales y estéticos que potencian la experiencia del cliente y reflejan la identidad de la marca.',
    skills: ['Interiorismo comercial', 'Diseño de locales', 'Oficinas', 'Consultorios', 'Branding espacial', 'Renders 3D'],
    certifications: ['Arquitecta UBA', 'Interiorismo Comercial - Universidad de Palermo'],
    yearsExperience: 10,
    experiences: [
      { businessName: 'DV Arquitectura & Diseño', role: 'Directora de proyectos', yearsAgo: 0, current: true, desc: 'Diseño de interiores comerciales y corporativos' },
      { businessName: 'Estudio HOK', role: 'Arquitecta senior', yearsAgo: 5, current: false, desc: 'Diseño de espacios comerciales y hospitality' },
    ],
  },
  {
    name: 'Lic. Fernando Castellano',
    gender: 'men',
    headline: 'Asesor financiero personal y de inversiones',
    specialty: 'Finanzas personales',
    bio: 'Asesor financiero certificado con experiencia en banca privada y wealth management. Asesoro en planificación financiera personal, inversiones, ahorro, protección patrimonial y jubilación. Mi objetivo es que cada cliente tome decisiones financieras informadas.',
    skills: ['Planificación financiera', 'Inversiones', 'Fondos', 'Bonos', 'Ahorro', 'Jubilación'],
    certifications: ['Lic. en Administración - UTDT', 'CFA Level II', 'Asesor financiero CNV'],
    yearsExperience: 11,
    experiences: [
      { businessName: 'Castellano Wealth Advisory', role: 'Asesor financiero', yearsAgo: 0, current: true, desc: 'Asesoramiento financiero personal y patrimonial' },
      { businessName: 'Banco Santander - Banca Privada', role: 'Wealth Manager', yearsAgo: 5, current: false, desc: 'Gestión de patrimonios y portafolios de inversión' },
    ],
  },
  {
    name: 'Lic. María Sol Ortega',
    gender: 'women',
    headline: 'Consultora en marketing digital y redes sociales',
    specialty: 'Marketing digital',
    bio: 'Consultora en marketing digital con foco en estrategia, branding y presencia online para profesionales independientes y pequeños negocios. Diseño estrategias de contenido, gestiono redes sociales y creo campañas publicitarias que generan resultados reales.',
    skills: ['Estrategia digital', 'Redes sociales', 'Meta Ads', 'Google Ads', 'Branding', 'Content marketing'],
    certifications: ['Lic. en Comunicación - UBA', 'Google Ads Certified', 'Meta Blueprint'],
    yearsExperience: 8,
    experiences: [
      { businessName: 'Sol Digital Studio', role: 'Consultora y estratega', yearsAgo: 0, current: true, desc: 'Consultoría en marketing digital y redes sociales' },
      { businessName: 'Agencia DDB Argentina', role: 'Social media manager', yearsAgo: 4, current: false, desc: 'Gestión de redes sociales para marcas' },
    ],
  },
];

// ─── Main Seed Function ───────────────────────────────────

async function seed() {
  console.log('🌱 Seeding missing category profiles...\n');

  const categories: { key: string; label: string; profiles: ProfileSeed[] }[] = [
    { key: 'odontologia', label: 'Odontología', profiles: odontologia },
    { key: 'psicologia', label: 'Psicología y Terapia', profiles: psicologia },
    { key: 'nutricion', label: 'Nutrición', profiles: nutricion },
    { key: 'fitness', label: 'Fitness y Deporte', profiles: fitness },
    { key: 'veterinaria', label: 'Veterinaria', profiles: veterinaria },
    { key: 'tatuajes-piercing', label: 'Tatuajes y Piercing', profiles: tatuajesPiercing },
    { key: 'educacion', label: 'Educación y Clases', profiles: educacion },
    { key: 'consultoria', label: 'Consultoría', profiles: consultoria },
  ];

  let totalCreated = 0;
  let photoIndex = 0;

  for (const cat of categories) {
    console.log(`📁 ${cat.label} (${cat.profiles.length} perfiles)`);

    for (const p of cat.profiles) {
      const email = `${slug(p.name)}@turnolink-talent.com`;
      const existing = await prisma.professionalProfile.findUnique({ where: { email } });
      if (existing) {
        console.log(`  ⏭️  ${p.name} (ya existe)`);
        photoIndex++;
        continue;
      }

      // Use randomuser.me photos for consistent realistic avatars
      const imgId = (photoIndex % 70) + 1;
      const image = `https://randomuser.me/api/portraits/${p.gender}/${imgId}.jpg`;

      const profile = await prisma.professionalProfile.create({
        data: {
          email,
          name: p.name,
          image,
          specialty: p.specialty,
          category: cat.key,
          headline: p.headline,
          bio: p.bio,
          yearsExperience: p.yearsExperience,
          skills: JSON.stringify(p.skills),
          certifications: JSON.stringify(p.certifications),
          availability: randomEl(AVAILABILITY),
          preferredZones: JSON.stringify([randomEl(ZONAS), randomEl(ZONAS)].filter((v, i, a) => a.indexOf(v) === i)),
          openToWork: Math.random() > 0.15, // 85% open to work
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
