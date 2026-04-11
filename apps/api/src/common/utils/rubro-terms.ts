/**
 * Rubro Terminology — Backend mirror of apps/web/lib/tenant-config.ts RUBRO_TERMS.
 * Used by notifications (email, WhatsApp, push) to render rubro-specific text.
 *
 * Keep in sync with the frontend version.
 */

export interface RubroTerms {
  bookingSingular: string;
  bookingPlural: string;
  serviceSingular: string;
  servicePlural: string;
  employeeSingular: string;
  employeePlural: string;
  depositLabel: string;
  bookAction: string;
  bookingVerb: string;
  emoji: string;
}

const DEFAULT_TERMS: RubroTerms = {
  bookingSingular: 'Turno', bookingPlural: 'Turnos',
  serviceSingular: 'Servicio', servicePlural: 'Servicios',
  employeeSingular: 'Profesional', employeePlural: 'Profesionales',
  depositLabel: 'Seña', bookAction: 'Reservar', bookingVerb: 'reservar',
  emoji: '📋',
};

const RUBRO_TERMS: Record<string, Partial<RubroTerms>> = {
  'estetica-belleza': { emoji: '💇' },
  'barberia':         { employeeSingular: 'Barbero', employeePlural: 'Barberos', emoji: '✂️' },
  'masajes-spa':      { bookingSingular: 'Sesión', bookingPlural: 'Sesiones', employeeSingular: 'Terapeuta', employeePlural: 'Terapeutas', emoji: '💆' },
  'tatuajes-piercing':{ bookingSingular: 'Sesión', bookingPlural: 'Sesiones', employeeSingular: 'Artista', employeePlural: 'Artistas', emoji: '🎨' },
  'salud':            { bookingSingular: 'Consulta', bookingPlural: 'Consultas', bookAction: 'Agendar', bookingVerb: 'agendar', emoji: '🩺' },
  'odontologia':      { employeeSingular: 'Odontólogo', employeePlural: 'Odontólogos', bookAction: 'Agendar', bookingVerb: 'agendar', emoji: '🦷' },
  'psicologia':       { bookingSingular: 'Sesión', bookingPlural: 'Sesiones', bookAction: 'Agendar', bookingVerb: 'agendar', emoji: '🧠' },
  'nutricion':        { bookingSingular: 'Consulta', bookingPlural: 'Consultas', employeeSingular: 'Nutricionista', employeePlural: 'Nutricionistas', bookAction: 'Agendar', bookingVerb: 'agendar', emoji: '🥗' },
  'veterinaria':      { employeeSingular: 'Veterinario', employeePlural: 'Veterinarios', bookAction: 'Agendar', bookingVerb: 'agendar', emoji: '🐾' },
  'fitness':          { bookingSingular: 'Clase', bookingPlural: 'Clases', serviceSingular: 'Clase', servicePlural: 'Clases', employeeSingular: 'Instructor', employeePlural: 'Instructores', emoji: '💪' },
  'deportes':         { bookingSingular: 'Reserva', bookingPlural: 'Reservas', serviceSingular: 'Cancha', servicePlural: 'Canchas', emoji: '⚽' },
  'hospedaje':        { bookingSingular: 'Reserva', bookingPlural: 'Reservas', serviceSingular: 'Habitación', servicePlural: 'Habitaciones', depositLabel: 'Depósito', emoji: '🏨' },
  'alquiler':         { bookingSingular: 'Reserva', bookingPlural: 'Reservas', serviceSingular: 'Propiedad', servicePlural: 'Propiedades', depositLabel: 'Depósito', emoji: '🏠' },
  'espacios':         { bookingSingular: 'Reserva', bookingPlural: 'Reservas', serviceSingular: 'Espacio', servicePlural: 'Espacios', emoji: '🏢' },
  'educacion':        { bookingSingular: 'Clase', bookingPlural: 'Clases', serviceSingular: 'Curso', servicePlural: 'Cursos', employeeSingular: 'Profesor', employeePlural: 'Profesores', bookAction: 'Inscribirse', bookingVerb: 'inscribirse', emoji: '📚' },
  'consultoria':      { bookingSingular: 'Consulta', bookingPlural: 'Consultas', depositLabel: 'Adelanto', bookAction: 'Agendar', bookingVerb: 'agendar', emoji: '💼' },
  'mercado':          { bookingSingular: 'Consulta', bookingPlural: 'Consultas', serviceSingular: 'Producto', servicePlural: 'Productos', employeeSingular: 'Vendedor', employeePlural: 'Vendedores', depositLabel: 'Seña', bookAction: 'Consultar', bookingVerb: 'consultar', emoji: '🛍️' },
  'inmobiliarias':    { bookingSingular: 'Visita', bookingPlural: 'Visitas', serviceSingular: 'Propiedad', servicePlural: 'Propiedades', employeeSingular: 'Asesor', employeePlural: 'Asesores', depositLabel: 'Seña', bookAction: 'Agendar visita', bookingVerb: 'agendar', emoji: '🏢' },
  'gastronomia':      { bookingSingular: 'Pedido', bookingPlural: 'Pedidos', serviceSingular: 'Plato', servicePlural: 'Platos', employeeSingular: 'Mozo', employeePlural: 'Mozos', depositLabel: 'Seña', bookAction: 'Pedir', bookingVerb: 'hacer', emoji: '🍽️' },
};

/**
 * Get terms for a tenant based on its rubro (from settings JSON).
 * Pass the parsed settings object or just the rubro string.
 */
export function getTermsForRubro(rubro: string): RubroTerms {
  const overrides = RUBRO_TERMS[rubro] || {};
  return { ...DEFAULT_TERMS, ...overrides };
}

/**
 * Extract rubro from tenant settings and return terms.
 * Accepts the raw tenant.settings (string or object).
 */
export function getTermsForTenant(settings: string | Record<string, any> | null): RubroTerms {
  let rubro = '';
  if (typeof settings === 'string') {
    try { rubro = JSON.parse(settings)?.rubro || ''; } catch { /* */ }
  } else if (settings) {
    rubro = settings.rubro || '';
  }
  return getTermsForRubro(rubro);
}

/**
 * Derive grammatical gender helpers for bookingSingular.
 * Spanish: Turno → 'o' (masc), Consulta/Reserva/Sesión/Clase → 'a' (fem).
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
