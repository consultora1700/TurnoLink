// ─── Rubro-Specific Labels ──────────────────────────────────────────────────
// Dynamic labels, placeholders and example text that adapt to the tenant's rubro.
// Used by session notes, derivaciones, WhatsApp messages, etc.

export interface SessionNoteLabels {
  /** "nota de sesión" / "nota de consulta" / "nota de servicio" */
  noteTitle: string;
  /** "Fecha de sesión" / "Fecha de consulta" */
  dateLabel: string;
  /** "Título / Tema principal" placeholder */
  titlePlaceholder: string;
  /** "Estado emocional / Observaciones" → label */
  observationsLabel: string;
  /** Placeholder for observations field */
  observationsPlaceholder: string;
  /** "Notas de la sesión" */
  notesLabel: string;
  /** Placeholder for notes */
  notesPlaceholder: string;
  /** "Objetivos trabajados / Avances" */
  progressLabel: string;
  /** Placeholder for progress */
  progressPlaceholder: string;
  /** "Tareas / Indicaciones para el paciente" */
  tasksLabel: string;
  /** Placeholder for tasks */
  tasksPlaceholder: string;
  /** Derivaciones reason placeholder */
  referralPlaceholder: string;
}

const SALUD_LABELS: SessionNoteLabels = {
  noteTitle: 'nota de consulta',
  dateLabel: 'Fecha de consulta',
  titlePlaceholder: 'Ej: Control de presion arterial, seguimiento postoperatorio...',
  observationsLabel: 'Observaciones clinicas',
  observationsPlaceholder: 'Ej: Paciente estable, signos vitales normales...',
  notesLabel: 'Notas de la consulta',
  notesPlaceholder: 'Descripcion detallada del examen, hallazgos, indicaciones...',
  progressLabel: 'Tratamiento / Evolucion',
  progressPlaceholder: 'Tratamientos aplicados, evolucion observada, cambios en medicacion...',
  tasksLabel: 'Indicaciones para el paciente',
  tasksPlaceholder: 'Medicamentos, estudios a realizar, proxima consulta...',
  referralPlaceholder: 'Ej: Interconsulta cardiologica, evaluacion nutricional...',
};

const PSICOLOGIA_LABELS: SessionNoteLabels = {
  noteTitle: 'nota de sesion',
  dateLabel: 'Fecha de sesion',
  titlePlaceholder: 'Ej: Seguimiento - Ansiedad, Primera sesion...',
  observationsLabel: 'Estado emocional / Observaciones',
  observationsPlaceholder: 'Ej: Paciente llego tranquilo, buen animo...',
  notesLabel: 'Notas de la sesion',
  notesPlaceholder: 'Descripcion detallada de lo trabajado en la sesion...',
  progressLabel: 'Objetivos trabajados / Avances',
  progressPlaceholder: 'Objetivos abordados, progreso observado...',
  tasksLabel: 'Tareas / Indicaciones para el paciente',
  tasksPlaceholder: 'Ejercicios, lecturas, practicas entre sesiones...',
  referralPlaceholder: 'Ej: Evaluacion psiquiatrica, interconsulta neurologica...',
};

const BELLEZA_LABELS: SessionNoteLabels = {
  noteTitle: 'nota de servicio',
  dateLabel: 'Fecha del servicio',
  titlePlaceholder: 'Ej: Tinte raiz + corte, Limpieza facial profunda...',
  observationsLabel: 'Observaciones del cliente',
  observationsPlaceholder: 'Ej: Prefiere tonos frios, piel sensible al calor...',
  notesLabel: 'Detalle del servicio',
  notesPlaceholder: 'Productos usados, tecnica aplicada, formulas, tiempos...',
  progressLabel: 'Resultado / Recomendaciones',
  progressPlaceholder: 'Resultado obtenido, recomendaciones de cuidado...',
  tasksLabel: 'Cuidados post-servicio',
  tasksPlaceholder: 'Productos recomendados, cuidados en casa, proximo turno sugerido...',
  referralPlaceholder: 'Ej: Consulta dermatologica, tratamiento capilar especializado...',
};

const FITNESS_LABELS: SessionNoteLabels = {
  noteTitle: 'nota de entrenamiento',
  dateLabel: 'Fecha del entrenamiento',
  titlePlaceholder: 'Ej: Tren superior - Fuerza, Cardio HIIT...',
  observationsLabel: 'Rendimiento / Observaciones',
  observationsPlaceholder: 'Ej: Buen rendimiento, aumento de cargas, buena hidratacion...',
  notesLabel: 'Detalle de la sesion',
  notesPlaceholder: 'Ejercicios realizados, series, repeticiones, cargas...',
  progressLabel: 'Progreso / Marcas',
  progressPlaceholder: 'Mejoras en cargas, tiempos, resistencia, mediciones...',
  tasksLabel: 'Plan para proxima sesion',
  tasksPlaceholder: 'Ejercicios a realizar, alimentacion pre/post, descanso...',
  referralPlaceholder: 'Ej: Evaluacion fisioterapeutica, consulta traumatologica...',
};

const LEGAL_LABELS: SessionNoteLabels = {
  noteTitle: 'nota de consulta',
  dateLabel: 'Fecha de consulta',
  titlePlaceholder: 'Ej: Revision contrato de alquiler, Consulta sucesion...',
  observationsLabel: 'Situacion del cliente',
  observationsPlaceholder: 'Ej: Cliente presento documentacion completa, caso con urgencia...',
  notesLabel: 'Notas de la consulta',
  notesPlaceholder: 'Hechos relevantes, analisis juridico, estrategia planteada...',
  progressLabel: 'Acciones realizadas / Estado del caso',
  progressPlaceholder: 'Escritos presentados, plazos, avance procesal, mediacion...',
  tasksLabel: 'Proximos pasos / Documentacion pendiente',
  tasksPlaceholder: 'Documentos a conseguir, firmas pendientes, proxima audiencia...',
  referralPlaceholder: 'Ej: Derivacion a escribano, perito contable, mediador...',
};

const NUTRICION_LABELS: SessionNoteLabels = {
  noteTitle: 'nota de consulta',
  dateLabel: 'Fecha de consulta',
  titlePlaceholder: 'Ej: Control mensual, Ajuste de plan alimentario...',
  observationsLabel: 'Estado del paciente / Observaciones',
  observationsPlaceholder: 'Ej: Reporta mejor digestion, bajo 2kg, mejor energia...',
  notesLabel: 'Notas de la consulta',
  notesPlaceholder: 'Mediciones, analisis de adherencia al plan, ajustes realizados...',
  progressLabel: 'Progreso / Mediciones',
  progressPlaceholder: 'Peso, medidas, porcentaje graso, cumplimiento del plan...',
  tasksLabel: 'Plan alimentario / Indicaciones',
  tasksPlaceholder: 'Nuevo plan semanal, suplementos, recetas sugeridas...',
  referralPlaceholder: 'Ej: Analisis de laboratorio, consulta endocrinologica...',
};

const DEFAULT_LABELS: SessionNoteLabels = {
  noteTitle: 'nota de seguimiento',
  dateLabel: 'Fecha',
  titlePlaceholder: 'Ej: Seguimiento, Consulta inicial...',
  observationsLabel: 'Observaciones generales',
  observationsPlaceholder: 'Observaciones sobre el cliente o la sesion...',
  notesLabel: 'Notas',
  notesPlaceholder: 'Descripcion detallada...',
  progressLabel: 'Avances / Resultados',
  progressPlaceholder: 'Progreso observado, resultados obtenidos...',
  tasksLabel: 'Proximos pasos',
  tasksPlaceholder: 'Indicaciones, tareas, proximo turno...',
  referralPlaceholder: 'Ej: Derivacion a especialista...',
};

const RUBRO_LABELS_MAP: Record<string, SessionNoteLabels> = {
  // Salud
  'salud': SALUD_LABELS,
  'odontologia': SALUD_LABELS,
  'veterinaria': SALUD_LABELS,
  // Psicología
  'psicologia': PSICOLOGIA_LABELS,
  // Belleza
  'estetica-belleza': BELLEZA_LABELS,
  'barberia': BELLEZA_LABELS,
  'masajes-spa': BELLEZA_LABELS,
  'tatuajes-piercing': BELLEZA_LABELS,
  // Fitness
  'fitness': FITNESS_LABELS,
  'deportes': FITNESS_LABELS,
  // Legal / Consultoría
  'consultoria': LEGAL_LABELS,
  // Nutrición
  'nutricion': NUTRICION_LABELS,
};

/**
 * Get session note labels adapted to the tenant's rubro.
 */
export function getSessionNoteLabels(rubro?: string): SessionNoteLabels {
  if (!rubro) return DEFAULT_LABELS;
  return RUBRO_LABELS_MAP[rubro] || DEFAULT_LABELS;
}
