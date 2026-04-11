/**
 * Dynamic terminology system for multi-industry support.
 *
 * Each tenant can configure custom terms via publicPageConfig.terminology.
 * This allows the same booking system to speak naturally to different industries:
 * - Beauty: "Elegí tu estilista", "Turnos", "Servicios"
 * - Legal: "Elegí tu abogado", "Consultas", "Tipos de consulta"
 * - Health: "Elegí tu profesional", "Sesiones", "Tratamientos"
 */

export interface Terminology {
  /** "Servicio" / "Consulta" / "Tratamiento" */
  service: string;
  /** "Servicios" / "Consultas" / "Tratamientos" */
  services: string;
  /** "Turno" / "Consulta" / "Sesión" */
  appointment: string;
  /** "Turnos" / "Consultas" / "Sesiones" */
  appointments: string;
  /** "Profesional" / "Estilista" / "Abogado" */
  professional: string;
  /** "Profesionales" / "Estilistas" / "Abogados" */
  professionals: string;
  /** "Cliente" / "Paciente" */
  client: string;
  /** "Clientes" / "Pacientes" */
  clients: string;
  /** "Sucursal" / "Sede" / "Consultorio" */
  branch: string;
  /** "Sucursales" / "Sedes" / "Consultorios" */
  branches: string;
  /** "Reservar" / "Agendar" */
  bookAction: string;
  /** "Reserva" / "Agenda" */
  booking: string;
}

const DEFAULT_TERMINOLOGY: Terminology = {
  service: 'Servicio',
  services: 'Servicios',
  appointment: 'Turno',
  appointments: 'Turnos',
  professional: 'Profesional',
  professionals: 'Profesionales',
  client: 'Cliente',
  clients: 'Clientes',
  branch: 'Sucursal',
  branches: 'Sucursales',
  bookAction: 'Reservar',
  booking: 'Reserva',
};

/** Industry presets for quick configuration */
export const TERMINOLOGY_PRESETS: Record<string, Partial<Terminology>> = {
  beauty: {
    professional: 'Estilista',
    professionals: 'Estilistas',
  },
  legal: {
    service: 'Consulta',
    services: 'Tipos de consulta',
    appointment: 'Consulta',
    appointments: 'Consultas',
    professional: 'Abogado',
    professionals: 'Abogados',
    bookAction: 'Agendar',
    booking: 'Agenda',
  },
  accounting: {
    service: 'Consulta',
    services: 'Tipos de consulta',
    appointment: 'Consulta',
    appointments: 'Consultas',
    professional: 'Contador',
    professionals: 'Contadores',
    branch: 'Estudio',
    branches: 'Estudios',
    bookAction: 'Agendar',
    booking: 'Agenda',
  },
  notary: {
    service: 'Trámite',
    services: 'Trámites',
    appointment: 'Cita',
    appointments: 'Citas',
    professional: 'Escribano',
    professionals: 'Escribanos',
    branch: 'Escribanía',
    branches: 'Escribanías',
    bookAction: 'Agendar',
    booking: 'Agenda',
  },
  health: {
    service: 'Consulta',
    services: 'Consultas',
    appointment: 'Turno',
    appointments: 'Turnos',
    client: 'Paciente',
    clients: 'Pacientes',
    branch: 'Consultorio',
    branches: 'Consultorios',
  },
  psychology: {
    service: 'Sesión',
    services: 'Tipos de sesión',
    appointment: 'Sesión',
    appointments: 'Sesiones',
    professional: 'Psicólogo',
    professionals: 'Psicólogos',
    client: 'Paciente',
    clients: 'Pacientes',
    branch: 'Consultorio',
    branches: 'Consultorios',
  },
  fitness: {
    service: 'Clase',
    services: 'Clases',
    appointment: 'Reserva',
    appointments: 'Reservas',
    professional: 'Instructor',
    professionals: 'Instructores',
    client: 'Alumno',
    clients: 'Alumnos',
    branch: 'Sede',
    branches: 'Sedes',
  },
  lodging: {
    service: 'Alojamiento',
    services: 'Alojamientos',
    appointment: 'Reserva',
    appointments: 'Reservas',
    client: 'Huésped',
    clients: 'Huéspedes',
    branch: 'Propiedad',
    branches: 'Propiedades',
  },
};

/**
 * Get the terminology for a tenant based on its publicPageConfig.
 * Falls back to defaults for any missing keys.
 */
export function getTerminology(
  publicPageConfig?: Record<string, unknown> | null,
): Terminology {
  if (!publicPageConfig) return { ...DEFAULT_TERMINOLOGY };

  const terminology = publicPageConfig.terminology as Partial<Terminology> | string | undefined;

  // If terminology is a preset name string
  if (typeof terminology === 'string') {
    const preset = TERMINOLOGY_PRESETS[terminology];
    return { ...DEFAULT_TERMINOLOGY, ...(preset || {}) };
  }

  // If terminology is a custom object
  if (terminology && typeof terminology === 'object') {
    return { ...DEFAULT_TERMINOLOGY, ...terminology };
  }

  return { ...DEFAULT_TERMINOLOGY };
}

/**
 * Shorthand: get a specific term.
 */
export function t(
  publicPageConfig: Record<string, unknown> | null | undefined,
  key: keyof Terminology,
): string {
  return getTerminology(publicPageConfig)[key];
}
