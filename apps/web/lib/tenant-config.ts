// ─── Tenant Configuration ────────────────────────────────────────────────────
// Rubros, terminologia, y modulos de ficha configurables por negocio.
// Single source of truth for dynamic tenant customization.

// ─── Terminology Options ─────────────────────────────────────────────────────

export interface TerminologyOption {
  singular: string;
  plural: string;
}

export const TERMINOLOGY_OPTIONS: TerminologyOption[] = [
  { singular: 'Cliente', plural: 'Clientes' },
  { singular: 'Paciente', plural: 'Pacientes' },
  { singular: 'Alumno', plural: 'Alumnos' },
  { singular: 'Socio', plural: 'Socios' },
  { singular: 'Prospecto', plural: 'Prospectos' },
  { singular: 'Usuario', plural: 'Usuarios' },
  { singular: 'Huesped', plural: 'Huespedes' },
];

// ─── Ficha Module Definitions ────────────────────────────────────────────────

export type FichaModuleId =
  | 'datosPersonales'
  | 'fichaClinica'
  | 'fichaBelleza'
  | 'fichaFitness'
  | 'notasSeguimiento'
  | 'derivaciones';

export interface FichaModuleConfig {
  id: FichaModuleId;
  label: string;
  /** Key in customer.extraInfo for backward compat */
  extraInfoKey: string;
  /** Always shown, cannot be disabled */
  universal: boolean;
}

export const FICHA_MODULES: FichaModuleConfig[] = [
  { id: 'datosPersonales', label: 'Datos Personales', extraInfoKey: 'datosPersonales', universal: true },
  { id: 'fichaClinica', label: 'Ficha Clinica', extraInfoKey: 'fichaPaciente', universal: false },
  { id: 'fichaBelleza', label: 'Ficha de Belleza', extraInfoKey: 'fichaBelleza', universal: false },
  { id: 'fichaFitness', label: 'Ficha Fitness', extraInfoKey: 'fichaFitness', universal: false },
  { id: 'notasSeguimiento', label: 'Notas de Seguimiento', extraInfoKey: 'sessionNotes', universal: true },
  { id: 'derivaciones', label: 'Derivaciones', extraInfoKey: 'referrals', universal: false },
];

export const FICHA_MODULE_MAP = Object.fromEntries(
  FICHA_MODULES.map((m) => [m.id, m]),
) as Record<FichaModuleId, FichaModuleConfig>;

// ─── Rubro Definitions ───────────────────────────────────────────────────────

export interface RubroConfig {
  key: string;
  label: string;
  /** Suggested terminology */
  suggestedTerminology: TerminologyOption;
  /** Suggested ficha modules */
  suggestedFichas: FichaModuleId[];
}

export const RUBROS: RubroConfig[] = [
  {
    key: 'estetica-belleza',
    label: 'Estetica y Belleza',
    suggestedTerminology: { singular: 'Cliente', plural: 'Clientes' },
    suggestedFichas: ['datosPersonales', 'fichaBelleza', 'notasSeguimiento'],
  },
  {
    key: 'barberia',
    label: 'Barberia',
    suggestedTerminology: { singular: 'Cliente', plural: 'Clientes' },
    suggestedFichas: ['datosPersonales', 'fichaBelleza', 'notasSeguimiento'],
  },
  {
    key: 'masajes-spa',
    label: 'Masajes y Spa',
    suggestedTerminology: { singular: 'Cliente', plural: 'Clientes' },
    suggestedFichas: ['datosPersonales', 'fichaBelleza', 'notasSeguimiento'],
  },
  {
    key: 'salud',
    label: 'Salud',
    suggestedTerminology: { singular: 'Paciente', plural: 'Pacientes' },
    suggestedFichas: ['datosPersonales', 'fichaClinica', 'notasSeguimiento'],
  },
  {
    key: 'odontologia',
    label: 'Odontologia',
    suggestedTerminology: { singular: 'Paciente', plural: 'Pacientes' },
    suggestedFichas: ['datosPersonales', 'fichaClinica', 'notasSeguimiento'],
  },
  {
    key: 'psicologia',
    label: 'Psicologia y Terapia',
    suggestedTerminology: { singular: 'Paciente', plural: 'Pacientes' },
    suggestedFichas: ['datosPersonales', 'fichaClinica', 'notasSeguimiento'],
  },
  {
    key: 'nutricion',
    label: 'Nutricion',
    suggestedTerminology: { singular: 'Paciente', plural: 'Pacientes' },
    suggestedFichas: ['datosPersonales', 'fichaClinica', 'fichaFitness', 'notasSeguimiento'],
  },
  {
    key: 'fitness',
    label: 'Fitness y Deporte',
    suggestedTerminology: { singular: 'Alumno', plural: 'Alumnos' },
    suggestedFichas: ['datosPersonales', 'fichaFitness', 'notasSeguimiento'],
  },
  {
    key: 'veterinaria',
    label: 'Veterinaria',
    suggestedTerminology: { singular: 'Paciente', plural: 'Pacientes' },
    suggestedFichas: ['datosPersonales', 'fichaClinica', 'notasSeguimiento'],
  },
  {
    key: 'tatuajes-piercing',
    label: 'Tatuajes y Piercing',
    suggestedTerminology: { singular: 'Cliente', plural: 'Clientes' },
    suggestedFichas: ['datosPersonales', 'fichaBelleza', 'notasSeguimiento'],
  },
  {
    key: 'educacion',
    label: 'Educacion y Clases',
    suggestedTerminology: { singular: 'Alumno', plural: 'Alumnos' },
    suggestedFichas: ['datosPersonales', 'notasSeguimiento'],
  },
  {
    key: 'consultoria',
    label: 'Consultoria',
    suggestedTerminology: { singular: 'Cliente', plural: 'Clientes' },
    suggestedFichas: ['datosPersonales', 'notasSeguimiento'],
  },
  {
    key: 'deportes',
    label: 'Deportes',
    suggestedTerminology: { singular: 'Cliente', plural: 'Clientes' },
    suggestedFichas: ['datosPersonales', 'notasSeguimiento'],
  },
  {
    key: 'espacios',
    label: 'Espacios',
    suggestedTerminology: { singular: 'Usuario', plural: 'Usuarios' },
    suggestedFichas: ['datosPersonales', 'notasSeguimiento'],
  },
  {
    key: 'hospedaje',
    label: 'Hospedaje',
    suggestedTerminology: { singular: 'Huesped', plural: 'Huespedes' },
    suggestedFichas: ['datosPersonales', 'notasSeguimiento'],
  },
  {
    key: 'alquiler',
    label: 'Alquiler Temporario',
    suggestedTerminology: { singular: 'Cliente', plural: 'Clientes' },
    suggestedFichas: ['datosPersonales', 'notasSeguimiento'],
  },
  {
    key: 'inmobiliarias',
    label: 'Inmobiliarias',
    suggestedTerminology: { singular: 'Interesado', plural: 'Interesados' },
    suggestedFichas: ['datosPersonales', 'notasSeguimiento'],
  },
  {
    key: 'gastronomia',
    label: 'Gastronomía',
    suggestedTerminology: { singular: 'Comensal', plural: 'Comensales' },
    suggestedFichas: ['datosPersonales', 'notasSeguimiento'],
  },
  {
    key: 'mercado',
    label: 'Catálogo & Ventas',
    suggestedTerminology: { singular: 'Cliente', plural: 'Clientes' },
    suggestedFichas: ['datosPersonales', 'notasSeguimiento'],
  },
  {
    key: 'otro',
    label: 'Otro',
    suggestedTerminology: { singular: 'Cliente', plural: 'Clientes' },
    suggestedFichas: ['datosPersonales', 'notasSeguimiento'],
  },
];

export const RUBRO_MAP = Object.fromEntries(
  RUBROS.map((r) => [r.key, r]),
) as Record<string, RubroConfig>;

// ─── Rubro Terminology (Full) ────────────────────────────────────────────────
// Terminología completa por rubro: booking, service, employee, deposit, etc.
// Single source of truth — frontend usa useRubroTerms(), backend importa RUBRO_TERMS.

export interface RubroTerms {
  bookingSingular: string;   // "Turno", "Reserva", "Consulta", "Clase"
  bookingPlural: string;     // "Turnos", "Reservas", "Consultas", "Clases"
  serviceSingular: string;   // "Servicio", "Habitación", "Cancha", "Clase"
  servicePlural: string;     // "Servicios", "Habitaciones", "Canchas", "Clases"
  employeeSingular: string;  // "Profesional", "Instructor", "Profesor"
  employeePlural: string;    // "Profesionales", "Instructores", "Profesores"
  depositLabel: string;      // "Seña", "Depósito", "Adelanto"
  bookAction: string;        // "Reservar", "Agendar", "Inscribirse"
  bookingVerb: string;       // "reservar", "agendar", "inscribirse"
  attendVerb: string;        // "atender", "dictar", "recibir"
  emoji: string;             // "💇", "🩺", "🏨"
  notesPlaceholder: string;  // "Alguna indicación especial...", "Notas médicas...", "Peticiones especiales..."
  credentialsLabel: string;  // "Matrícula profesional", "Certificaciones", ""
  credentialsPlaceholder: string; // "Mat. CPACF T.123...", "Certificación de instructor", ""
  specialtyExamples: string; // "Ej: Derecho Penal, Nutrición", "Ej: Yoga, Boxing", ""
}

const DEFAULT_TERMS: RubroTerms = {
  bookingSingular: 'Turno', bookingPlural: 'Turnos',
  serviceSingular: 'Servicio', servicePlural: 'Servicios',
  employeeSingular: 'Profesional', employeePlural: 'Profesionales',
  depositLabel: 'Seña', bookAction: 'Reservar', bookingVerb: 'reservar',
  attendVerb: 'atender', emoji: '📋',
  notesPlaceholder: 'Alguna indicación especial...',
  credentialsLabel: '', credentialsPlaceholder: '', specialtyExamples: '',
};

export const RUBRO_TERMS: Record<string, RubroTerms> = {
  'estetica-belleza': {
    ...DEFAULT_TERMS,
    emoji: '💇',
    notesPlaceholder: 'Ej: Quiero un cambio de look...',
    credentialsLabel: 'Certificaciones',
    credentialsPlaceholder: 'Ej: Certificación en colorimetría',
    specialtyExamples: 'Ej: Colorista, Manicura, Depilación',
  },
  'barberia': {
    ...DEFAULT_TERMS,
    employeeSingular: 'Barbero', employeePlural: 'Barberos',
    emoji: '✂️',
    notesPlaceholder: 'Ej: Quiero el mismo corte de siempre...',
    specialtyExamples: 'Ej: Corte clásico, Barba, Diseño',
  },
  'masajes-spa': {
    ...DEFAULT_TERMS,
    bookingSingular: 'Sesión', bookingPlural: 'Sesiones',
    employeeSingular: 'Terapeuta', employeePlural: 'Terapeutas',
    bookAction: 'Reservar', bookingVerb: 'reservar',
    emoji: '💆',
    notesPlaceholder: 'Ej: Tengo contractura en la espalda...',
    specialtyExamples: 'Ej: Masaje descontracturante, Piedras calientes',
  },
  'tatuajes-piercing': {
    ...DEFAULT_TERMS,
    bookingSingular: 'Sesión', bookingPlural: 'Sesiones',
    employeeSingular: 'Artista', employeePlural: 'Artistas',
    emoji: '🎨',
    notesPlaceholder: 'Ej: Quiero un diseño personalizado...',
    specialtyExamples: 'Ej: Realismo, Old School, Piercing',
  },
  'salud': {
    ...DEFAULT_TERMS,
    bookingSingular: 'Consulta', bookingPlural: 'Consultas',
    employeeSingular: 'Profesional', employeePlural: 'Profesionales',
    bookAction: 'Agendar', bookingVerb: 'agendar',
    attendVerb: 'atender', emoji: '🩺',
    notesPlaceholder: 'Ej: Motivo de consulta, síntomas...',
    credentialsLabel: 'Matrícula profesional',
    credentialsPlaceholder: 'Ej: MN 12345, MP 67890',
    specialtyExamples: 'Ej: Cardiología, Dermatología, Pediatría',
  },
  'odontologia': {
    ...DEFAULT_TERMS,
    bookingSingular: 'Turno', bookingPlural: 'Turnos',
    employeeSingular: 'Odontólogo', employeePlural: 'Odontólogos',
    bookAction: 'Agendar', bookingVerb: 'agendar',
    emoji: '🦷',
    notesPlaceholder: 'Ej: Me duele una muela...',
    credentialsLabel: 'Matrícula profesional',
    credentialsPlaceholder: 'Ej: MN 12345',
    specialtyExamples: 'Ej: Ortodoncia, Endodoncia, Implantes',
  },
  'psicologia': {
    ...DEFAULT_TERMS,
    bookingSingular: 'Sesión', bookingPlural: 'Sesiones',
    employeeSingular: 'Profesional', employeePlural: 'Profesionales',
    bookAction: 'Agendar', bookingVerb: 'agendar',
    emoji: '🧠',
    notesPlaceholder: 'Ej: Primera consulta, derivación...',
    credentialsLabel: 'Matrícula profesional',
    credentialsPlaceholder: 'Ej: MN 12345',
    specialtyExamples: 'Ej: Terapia cognitiva, Terapia de pareja',
  },
  'nutricion': {
    ...DEFAULT_TERMS,
    bookingSingular: 'Consulta', bookingPlural: 'Consultas',
    employeeSingular: 'Nutricionista', employeePlural: 'Nutricionistas',
    bookAction: 'Agendar', bookingVerb: 'agendar',
    emoji: '🥗',
    notesPlaceholder: 'Ej: Busco plan alimentario...',
    credentialsLabel: 'Matrícula profesional',
    credentialsPlaceholder: 'Ej: MN 12345',
    specialtyExamples: 'Ej: Nutrición deportiva, Nutrición clínica',
  },
  'veterinaria': {
    ...DEFAULT_TERMS,
    bookingSingular: 'Turno', bookingPlural: 'Turnos',
    employeeSingular: 'Veterinario', employeePlural: 'Veterinarios',
    bookAction: 'Agendar', bookingVerb: 'agendar',
    emoji: '🐾',
    notesPlaceholder: 'Ej: Raza, peso, síntomas de la mascota...',
    credentialsLabel: 'Matrícula profesional',
    credentialsPlaceholder: 'Ej: MV 12345',
    specialtyExamples: 'Ej: Clínica general, Cirugía, Dermatología',
  },
  'fitness': {
    ...DEFAULT_TERMS,
    bookingSingular: 'Clase', bookingPlural: 'Clases',
    serviceSingular: 'Clase', servicePlural: 'Clases',
    employeeSingular: 'Instructor', employeePlural: 'Instructores',
    bookAction: 'Reservar', bookingVerb: 'reservar',
    attendVerb: 'dictar', emoji: '💪',
    notesPlaceholder: 'Ej: Tengo una lesión en la rodilla...',
    credentialsLabel: 'Certificaciones',
    credentialsPlaceholder: 'Ej: Certificación en CrossFit L1',
    specialtyExamples: 'Ej: CrossFit, Yoga, Spinning, Pilates',
  },
  'deportes': {
    ...DEFAULT_TERMS,
    bookingSingular: 'Reserva', bookingPlural: 'Reservas',
    serviceSingular: 'Cancha', servicePlural: 'Canchas',
    employeeSingular: 'Encargado', employeePlural: 'Encargados',
    bookAction: 'Reservar', bookingVerb: 'reservar',
    emoji: '⚽',
    notesPlaceholder: 'Ej: Somos 10 jugadores...',
  },
  'hospedaje': {
    ...DEFAULT_TERMS,
    bookingSingular: 'Reserva', bookingPlural: 'Reservas',
    serviceSingular: 'Habitación', servicePlural: 'Habitaciones',
    employeeSingular: 'Staff', employeePlural: 'Staff',
    depositLabel: 'Depósito',
    bookAction: 'Reservar', bookingVerb: 'reservar',
    emoji: '🏨',
    notesPlaceholder: 'Ej: Llegamos tarde, cama extra...',
  },
  'alquiler': {
    ...DEFAULT_TERMS,
    bookingSingular: 'Reserva', bookingPlural: 'Reservas',
    serviceSingular: 'Propiedad', servicePlural: 'Propiedades',
    employeeSingular: 'Encargado', employeePlural: 'Encargados',
    depositLabel: 'Depósito',
    bookAction: 'Reservar', bookingVerb: 'reservar',
    emoji: '🏠',
    notesPlaceholder: 'Ej: Somos 6 personas, llegamos de noche...',
  },
  'espacios': {
    ...DEFAULT_TERMS,
    bookingSingular: 'Reserva', bookingPlural: 'Reservas',
    serviceSingular: 'Espacio', servicePlural: 'Espacios',
    employeeSingular: 'Encargado', employeePlural: 'Encargados',
    bookAction: 'Reservar', bookingVerb: 'reservar',
    emoji: '🏢',
    notesPlaceholder: 'Ej: Necesitamos proyector y pizarra...',
  },
  'educacion': {
    ...DEFAULT_TERMS,
    bookingSingular: 'Clase', bookingPlural: 'Clases',
    serviceSingular: 'Curso', servicePlural: 'Cursos',
    employeeSingular: 'Profesor', employeePlural: 'Profesores',
    bookAction: 'Inscribirse', bookingVerb: 'inscribirse',
    attendVerb: 'dictar', emoji: '📚',
    notesPlaceholder: 'Ej: Nivel principiante, horario preferido...',
    credentialsLabel: 'Credenciales educativas',
    credentialsPlaceholder: 'Ej: Licenciatura en Letras, Certificación TEFL',
    specialtyExamples: 'Ej: Inglés, Matemáticas, Música, Arte',
  },
  'consultoria': {
    ...DEFAULT_TERMS,
    bookingSingular: 'Consulta', bookingPlural: 'Consultas',
    employeeSingular: 'Profesional', employeePlural: 'Profesionales',
    depositLabel: 'Adelanto',
    bookAction: 'Agendar', bookingVerb: 'agendar',
    emoji: '💼',
    notesPlaceholder: 'Ej: Consulta sobre constitución de sociedad...',
    credentialsLabel: 'Matrícula profesional',
    credentialsPlaceholder: 'Ej: CPACF T.123 F.456, CPCECABA T.1 F.234',
    specialtyExamples: 'Ej: Derecho Penal, Contabilidad, Laboral',
  },
  'inmobiliarias': {
    ...DEFAULT_TERMS,
    bookingSingular: 'Visita', bookingPlural: 'Visitas',
    serviceSingular: 'Propiedad', servicePlural: 'Propiedades',
    employeeSingular: 'Asesor', employeePlural: 'Asesores',
    depositLabel: 'Seña',
    bookAction: 'Agendar visita', bookingVerb: 'agendar',
    attendVerb: 'mostrar', emoji: '🏢',
    notesPlaceholder: 'Ej: Busca 3 ambientes, zona norte, presupuesto $X...',
    credentialsLabel: 'Matrícula inmobiliaria',
    credentialsPlaceholder: 'Ej: CUCICBA Mat. 1234, CMCPSI 5678',
    specialtyExamples: 'Ej: Venta residencial, Alquileres, Terrenos, Comercial',
  },
  'gastronomia': {
    ...DEFAULT_TERMS,
    bookingSingular: 'Reserva', bookingPlural: 'Reservas',
    serviceSingular: 'Mesa', servicePlural: 'Mesas',
    employeeSingular: 'Mozo', employeePlural: 'Personal',
    depositLabel: 'Seña',
    bookAction: 'Reservar', bookingVerb: 'reservar',
    attendVerb: 'atender', emoji: '🍽️',
    notesPlaceholder: 'Ej: Mesa para 4, preferimos terraza, cumpleaños...',
    credentialsLabel: 'Habilitaciones',
    credentialsPlaceholder: 'Ej: Habilitación bromatológica, Registro RNPA',
    specialtyExamples: 'Ej: Parrilla, Sushi, Pastas, Cafetería',
  },
  'mercado': {
    ...DEFAULT_TERMS,
    bookingSingular: 'Venta', bookingPlural: 'Ventas',
    serviceSingular: 'Producto', servicePlural: 'Productos',
    employeeSingular: 'Vendedor', employeePlural: 'Vendedores',
    bookAction: 'Comprar', bookingVerb: 'comprar',
    emoji: '🛍️',
    notesPlaceholder: 'Ej: Nota sobre la venta, detalle del pedido...',
    specialtyExamples: 'Ej: Ropa, Accesorios, Alimentos',
  },
  'otro': { ...DEFAULT_TERMS },
};

// Gastro sub-rubros inherit gastronomia terms with customized specialtyExamples and employee labels
const GASTRO_BASE_TERMS: RubroTerms = RUBRO_TERMS['gastronomia'];
const GASTRO_SUB_RUBRO_OVERRIDES: Record<string, Partial<RubroTerms>> = {
  'gastro-parrilla':       { specialtyExamples: 'Ej: Parrilla, Asado, Cocina criolla', employeeSingular: 'Mozo', employeePlural: 'Personal' },
  'gastro-pizzeria':       { specialtyExamples: 'Ej: Pizza al molde, A la piedra, Napolitana', employeeSingular: 'Mozo', employeePlural: 'Personal' },
  'gastro-hamburgueseria': { specialtyExamples: 'Ej: Smash burgers, Gourmet, Fast casual', employeeSingular: 'Mozo', employeePlural: 'Personal' },
  'gastro-cafe':           { specialtyExamples: 'Ej: Café de especialidad, Brunch, Pastelería', employeeSingular: 'Barista', employeePlural: 'Equipo' },
  'gastro-heladeria':      { specialtyExamples: 'Ej: Helado artesanal, Paletas, Postres fríos', employeeSingular: 'Heladero', employeePlural: 'Equipo' },
  'gastro-sushi':          { specialtyExamples: 'Ej: Sushi, Rolls, Poke bowls, Ramen', employeeSingular: 'Itamae', employeePlural: 'Equipo' },
  'gastro-cerveceria':     { specialtyExamples: 'Ej: Cerveza artesanal, Picadas, Brewpub', employeeSingular: 'Mozo', employeePlural: 'Personal' },
  'gastro-bodegon':        { specialtyExamples: 'Ej: Cocina casera, Milanesas, Pastas, Guisos', employeeSingular: 'Mozo', employeePlural: 'Personal' },
  'gastro-pasteleria':     { specialtyExamples: 'Ej: Tortas, Cookies, Macarons, Desayunos', employeeSingular: 'Pastelero', employeePlural: 'Equipo' },
  'gastro-food-truck':     { specialtyExamples: 'Ej: Street food, Wraps, Choripanes, Eventos', employeeSingular: 'Cocinero', employeePlural: 'Equipo' },
  'gastro-otro':           { specialtyExamples: 'Ej: Parrilla, Sushi, Pastas, Cafetería' },
};
for (const [key, overrides] of Object.entries(GASTRO_SUB_RUBRO_OVERRIDES)) {
  RUBRO_TERMS[key] = { ...GASTRO_BASE_TERMS, ...overrides };
}

/** Get terms for a rubro key, with fallback to defaults */
export function getTermsForRubro(rubro: string): RubroTerms {
  return RUBRO_TERMS[rubro] || DEFAULT_TERMS;
}

/**
 * Derive grammatical gender suffix for bookingSingular.
 * Spanish: words ending in -a, -ón, -ión are feminine → 'a', else masculine → 'o'.
 * Returns { suffix: 'o'|'a', article: 'el'|'la', articleUn: 'un'|'una', preposition: 'del'|'de la' }
 */
export function bookingGender(terms: RubroTerms) {
  const word = terms.bookingSingular.toLowerCase();
  const isFem = word.endsWith('a') || word.endsWith('ón') || word === 'clase' || word === 'sesión';
  return {
    suffix: isFem ? 'a' : 'o',
    article: isFem ? 'la' : 'el',
    articleUn: isFem ? 'una' : 'un',
    preposition: isFem ? 'de la' : 'del',
  };
}

// ─── Rubro UI Configuration (centralized) ───────────────────────────────────
// Single source of truth para: fichas permitidas, label de amenidades,
// preset de terminología pública, y tab labels por rubro.
// Agregar un rubro nuevo = agregar una entrada acá y todo el UI se adapta.

export interface RubroUIConfig {
  /** Fichas que el rubro puede activar (universal siempre se muestran) */
  allowedFichas: FichaModuleId[];
  /** Label contextual para la sección amenidades (null = no mostrar) */
  amenitiesLabel: string | null;
  /** Descripción contextual para amenidades */
  amenitiesDescription: string | null;
  /** Preset de terminología pública al elegir este rubro */
  terminologyPreset: string;
  /** Label del tab de operación/reservas */
  operationTabLabel: string;
}

const DEFAULT_UI_CONFIG: RubroUIConfig = {
  allowedFichas: ['datosPersonales', 'notasSeguimiento'],
  amenitiesLabel: null,
  amenitiesDescription: null,
  terminologyPreset: '',
  operationTabLabel: 'Reservas',
};

export const RUBRO_UI_CONFIG: Record<string, RubroUIConfig> = {
  'estetica-belleza': {
    allowedFichas: ['datosPersonales', 'fichaBelleza', 'notasSeguimiento'],
    amenitiesLabel: 'Comodidades del salón',
    amenitiesDescription: 'Seleccioná lo que ofrece tu salón. Se muestra en la página pública.',
    terminologyPreset: 'beauty',
    operationTabLabel: 'Turnos',
  },
  'barberia': {
    allowedFichas: ['datosPersonales', 'fichaBelleza', 'notasSeguimiento'],
    amenitiesLabel: 'Comodidades de la barbería',
    amenitiesDescription: 'Seleccioná lo que ofrece tu barbería. Se muestra en la página pública.',
    terminologyPreset: 'beauty',
    operationTabLabel: 'Turnos',
  },
  'masajes-spa': {
    allowedFichas: ['datosPersonales', 'fichaBelleza', 'notasSeguimiento'],
    amenitiesLabel: 'Comodidades del spa',
    amenitiesDescription: 'Seleccioná lo que ofrece tu spa. Se muestra en la página pública.',
    terminologyPreset: 'beauty',
    operationTabLabel: 'Sesiones',
  },
  'tatuajes-piercing': {
    allowedFichas: ['datosPersonales', 'fichaBelleza', 'notasSeguimiento'],
    amenitiesLabel: 'Comodidades del estudio',
    amenitiesDescription: 'Seleccioná lo que ofrece tu estudio. Se muestra en la página pública.',
    terminologyPreset: 'beauty',
    operationTabLabel: 'Sesiones',
  },
  'salud': {
    allowedFichas: ['datosPersonales', 'fichaClinica', 'notasSeguimiento', 'derivaciones'],
    amenitiesLabel: 'Comodidades del consultorio',
    amenitiesDescription: 'Seleccioná las facilidades disponibles para tus pacientes.',
    terminologyPreset: 'health',
    operationTabLabel: 'Consultas',
  },
  'odontologia': {
    allowedFichas: ['datosPersonales', 'fichaClinica', 'notasSeguimiento', 'derivaciones'],
    amenitiesLabel: 'Comodidades del consultorio',
    amenitiesDescription: 'Seleccioná las facilidades disponibles para tus pacientes.',
    terminologyPreset: 'health',
    operationTabLabel: 'Turnos',
  },
  'psicologia': {
    allowedFichas: ['datosPersonales', 'fichaClinica', 'notasSeguimiento', 'derivaciones'],
    amenitiesLabel: 'Comodidades del consultorio',
    amenitiesDescription: 'Seleccioná las facilidades disponibles para tus pacientes.',
    terminologyPreset: 'psychology',
    operationTabLabel: 'Sesiones',
  },
  'nutricion': {
    allowedFichas: ['datosPersonales', 'fichaClinica', 'fichaFitness', 'notasSeguimiento', 'derivaciones'],
    amenitiesLabel: 'Comodidades del consultorio',
    amenitiesDescription: 'Seleccioná las facilidades disponibles para tus pacientes.',
    terminologyPreset: 'health',
    operationTabLabel: 'Consultas',
  },
  'veterinaria': {
    allowedFichas: ['datosPersonales', 'fichaClinica', 'notasSeguimiento'],
    amenitiesLabel: 'Comodidades de la veterinaria',
    amenitiesDescription: 'Seleccioná las facilidades disponibles en tu veterinaria.',
    terminologyPreset: 'health',
    operationTabLabel: 'Turnos',
  },
  'fitness': {
    allowedFichas: ['datosPersonales', 'fichaFitness', 'notasSeguimiento'],
    amenitiesLabel: 'Instalaciones del gimnasio',
    amenitiesDescription: 'Seleccioná las instalaciones disponibles para tus alumnos.',
    terminologyPreset: 'fitness',
    operationTabLabel: 'Clases',
  },
  'deportes': {
    allowedFichas: ['datosPersonales', 'notasSeguimiento'],
    amenitiesLabel: 'Instalaciones del complejo',
    amenitiesDescription: 'Seleccioná las instalaciones disponibles en tu complejo deportivo.',
    terminologyPreset: 'fitness',
    operationTabLabel: 'Reservas',
  },
  'educacion': {
    allowedFichas: ['datosPersonales', 'notasSeguimiento'],
    amenitiesLabel: 'Facilidades del espacio',
    amenitiesDescription: 'Seleccioná las facilidades disponibles para tus alumnos.',
    terminologyPreset: '',
    operationTabLabel: 'Clases',
  },
  'consultoria': {
    allowedFichas: ['datosPersonales', 'notasSeguimiento'],
    amenitiesLabel: 'Comodidades del estudio',
    amenitiesDescription: 'Seleccioná las facilidades disponibles para tus clientes.',
    terminologyPreset: 'legal',
    operationTabLabel: 'Consultas',
  },
  'hospedaje': {
    allowedFichas: ['datosPersonales', 'notasSeguimiento'],
    amenitiesLabel: 'Amenidades del alojamiento',
    amenitiesDescription: 'Seleccioná las amenidades que ofrece tu alojamiento.',
    terminologyPreset: 'lodging',
    operationTabLabel: 'Reservas',
  },
  'alquiler': {
    allowedFichas: ['datosPersonales', 'notasSeguimiento'],
    amenitiesLabel: 'Amenidades de la propiedad',
    amenitiesDescription: 'Seleccioná las amenidades de tus propiedades.',
    terminologyPreset: 'lodging',
    operationTabLabel: 'Reservas',
  },
  'espacios': {
    allowedFichas: ['datosPersonales', 'notasSeguimiento'],
    amenitiesLabel: 'Equipamiento del espacio',
    amenitiesDescription: 'Seleccioná el equipamiento disponible en tus espacios.',
    terminologyPreset: '',
    operationTabLabel: 'Reservas',
  },
  'inmobiliarias': {
    allowedFichas: ['datosPersonales', 'notasSeguimiento'],
    amenitiesLabel: 'Características de la propiedad',
    amenitiesDescription: 'Seleccioná las características destacadas de tus propiedades.',
    terminologyPreset: '',
    operationTabLabel: 'Visitas',
  },
  'gastronomia': {
    allowedFichas: ['datosPersonales', 'notasSeguimiento'],
    amenitiesLabel: 'Servicios del local',
    amenitiesDescription: 'Seleccioná lo que ofrece tu local gastronómico.',
    terminologyPreset: '',
    operationTabLabel: 'Reservas',
  },
  'mercado': {
    allowedFichas: ['datosPersonales', 'notasSeguimiento'],
    amenitiesLabel: null,
    amenitiesDescription: null,
    terminologyPreset: '',
    operationTabLabel: 'Ventas',
  },
  'otro': { ...DEFAULT_UI_CONFIG },
};

// Gastro sub-rubros inherit gastronomia UI config
const GASTRO_UI_BASE = RUBRO_UI_CONFIG['gastronomia'];
for (const key of [
  'gastro-parrilla', 'gastro-pizzeria', 'gastro-hamburgueseria', 'gastro-cafe',
  'gastro-heladeria', 'gastro-sushi', 'gastro-cerveceria', 'gastro-bodegon',
  'gastro-pasteleria', 'gastro-food-truck', 'gastro-otro',
]) {
  RUBRO_UI_CONFIG[key] = { ...GASTRO_UI_BASE };
}

/** Get UI config for a rubro, with fallback to defaults */
export function getRubroUIConfig(rubro: string): RubroUIConfig {
  return RUBRO_UI_CONFIG[rubro] || DEFAULT_UI_CONFIG;
}

/** Get ficha modules allowed for a rubro (universal + allowed non-universal) */
export function getFichaModulesForRubro(rubro: string): FichaModuleConfig[] {
  const uiConfig = getRubroUIConfig(rubro);
  return FICHA_MODULES.filter(
    (mod) => mod.universal || uiConfig.allowedFichas.includes(mod.id),
  );
}

// ─── Defaults ────────────────────────────────────────────────────────────────

export const DEFAULT_CLIENT_LABEL_SINGULAR = 'Cliente';
export const DEFAULT_CLIENT_LABEL_PLURAL = 'Clientes';
export const DEFAULT_ENABLED_FICHAS: FichaModuleId[] = ['datosPersonales', 'notasSeguimiento'];
