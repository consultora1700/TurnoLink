// ─── Ficha Module Field Definitions ──────────────────────────────────────────
// Defines field groups for each ficha module type.
// Used by the dynamic ficha form renderer in client detail page.

import type { FichaModuleId } from './tenant-config';

export type FieldType = 'text' | 'date' | 'number' | 'textarea' | 'select';

export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** How many grid columns (of 3) this field spans */
  colSpan?: number;
}

export interface FieldGroup {
  title: string;
  iconBg: string;
  fields: FieldDefinition[];
  defaultOpen?: boolean;
}

// ─── Shared option sets ──────────────────────────────────────────────────────

const genderOptions = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Femenino', label: 'Femenino' },
  { value: 'No binario', label: 'No binario' },
  { value: 'Otro', label: 'Otro' },
  { value: 'Prefiero no decir', label: 'Prefiero no decir' },
];

const bloodTypeOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((v) => ({
  value: v,
  label: v,
}));

const yesNoOptions = [
  { value: 'No', label: 'No' },
  { value: 'Si', label: 'Si' },
];

const frequencyOptions = [
  { value: 'No', label: 'No' },
  { value: 'Ocasional', label: 'Ocasional' },
  { value: 'Moderado', label: 'Moderado' },
  { value: 'Frecuente', label: 'Frecuente' },
];

const exerciseOptions = [
  { value: 'Sedentario', label: 'Sedentario' },
  { value: 'Leve', label: 'Leve' },
  { value: 'Moderada', label: 'Moderada' },
  { value: 'Intensa', label: 'Intensa' },
];

const skinTypeOptions = [
  { value: 'Normal', label: 'Normal' },
  { value: 'Seca', label: 'Seca' },
  { value: 'Grasa', label: 'Grasa' },
  { value: 'Mixta', label: 'Mixta' },
  { value: 'Sensible', label: 'Sensible' },
];

const hairTypeOptions = [
  { value: 'Liso', label: 'Liso' },
  { value: 'Ondulado', label: 'Ondulado' },
  { value: 'Rizado', label: 'Rizado' },
  { value: 'Muy rizado', label: 'Muy rizado' },
  { value: 'Fino', label: 'Fino' },
  { value: 'Grueso', label: 'Grueso' },
];

// ─── Datos Personales ────────────────────────────────────────────────────────

const datosPersonalesGroups: FieldGroup[] = [
  {
    title: 'Datos Personales',
    iconBg: 'bg-violet-500',
    fields: [
      { key: 'fechaNacimiento', label: 'Fecha de nacimiento', type: 'date' },
      { key: 'genero', label: 'Genero', type: 'select', options: genderOptions },
      { key: 'documento', label: 'DNI / Documento', type: 'text', placeholder: 'Numero de documento' },
      { key: 'direccion', label: 'Direccion', type: 'text', placeholder: 'Direccion completa', colSpan: 3 },
      { key: 'localidad', label: 'Localidad', type: 'text', placeholder: 'Ciudad / Localidad' },
    ],
  },
  {
    title: 'Contacto de Emergencia',
    iconBg: 'bg-amber-500',
    defaultOpen: false,
    fields: [
      { key: 'contactoEmergenciaNombre', label: 'Nombre', type: 'text' },
      { key: 'contactoEmergenciaTelefono', label: 'Telefono', type: 'text' },
      { key: 'contactoEmergenciaRelacion', label: 'Relacion', type: 'text', placeholder: 'Esposo/a, padre/madre...' },
    ],
  },
];

// ─── Ficha Clinica ───────────────────────────────────────────────────────────
// Uses 'fichaPaciente' extraInfo key for backward compat

const fichaClinicaGroups: FieldGroup[] = [
  {
    title: 'Cobertura Medica',
    iconBg: 'bg-blue-500',
    fields: [
      { key: 'obraSocial', label: 'Obra social / Prepaga', type: 'text' },
      { key: 'numeroAfiliado', label: 'N de afiliado', type: 'text' },
    ],
  },
  {
    title: 'Historial Clinico',
    iconBg: 'bg-red-500',
    fields: [
      { key: 'grupoSanguineo', label: 'Grupo sanguineo', type: 'select', options: bloodTypeOptions },
      { key: 'alergias', label: 'Alergias', type: 'text', placeholder: 'Medicamentos, alimentos...' },
      { key: 'medicacionActual', label: 'Medicacion actual', type: 'text', placeholder: 'Nombre y dosis...' },
      { key: 'enfermedadesCronicas', label: 'Enfermedades cronicas', type: 'text', placeholder: 'Diabetes, hipertension...' },
      { key: 'cirugiasPrevias', label: 'Cirugias previas', type: 'text' },
      { key: 'antecedentesFamiliares', label: 'Antecedentes familiares', type: 'text', placeholder: 'Enfermedades en familia...' },
    ],
  },
  {
    title: 'Datos de Consulta',
    iconBg: 'bg-teal-500',
    fields: [
      { key: 'motivoConsulta', label: 'Motivo de consulta', type: 'textarea', placeholder: 'Motivo principal de la consulta...' },
      { key: 'diagnostico', label: 'Diagnostico', type: 'textarea', placeholder: 'Diagnostico clinico...' },
      { key: 'derivadoPor', label: 'Derivado por', type: 'text', placeholder: 'Profesional o institucion...' },
      { key: 'tratamientoPrevio', label: 'Tratamiento previo', type: 'text', placeholder: 'Tratamientos anteriores...' },
    ],
  },
  {
    title: 'Habitos y Medidas',
    iconBg: 'bg-orange-500',
    defaultOpen: false,
    fields: [
      { key: 'fumador', label: 'Fumador', type: 'select', options: [{ value: 'No', label: 'No' }, { value: 'Ex-fumador', label: 'Ex-fumador' }, { value: 'Si', label: 'Si' }] },
      { key: 'consumoAlcohol', label: 'Consumo de alcohol', type: 'select', options: frequencyOptions },
      { key: 'actividadFisica', label: 'Actividad fisica', type: 'select', options: exerciseOptions },
      { key: 'peso', label: 'Peso (kg)', type: 'number' },
      { key: 'altura', label: 'Altura (cm)', type: 'number' },
      { key: 'embarazo', label: 'Embarazo', type: 'select', options: [{ value: 'No', label: 'No' }, { value: 'Si', label: 'Si' }, { value: 'No aplica', label: 'No aplica' }] },
    ],
  },
  {
    title: 'Notas del Profesional',
    iconBg: 'bg-indigo-500',
    fields: [
      { key: 'notasProfesional', label: 'Notas privadas (solo vos las ves)', type: 'textarea', placeholder: 'Observaciones generales, notas privadas...', colSpan: 3 },
    ],
  },
];

// ─── Ficha de Belleza ────────────────────────────────────────────────────────

const fichaBellezaGroups: FieldGroup[] = [
  {
    title: 'Tipo de Piel y Cabello',
    iconBg: 'bg-pink-500',
    fields: [
      { key: 'tipoPiel', label: 'Tipo de piel', type: 'select', options: skinTypeOptions },
      { key: 'tipoCabello', label: 'Tipo de cabello', type: 'select', options: hairTypeOptions },
      { key: 'colorCabello', label: 'Color de cabello actual', type: 'text', placeholder: 'Ej: Castano oscuro, rubio...' },
    ],
  },
  {
    title: 'Alergias y Sensibilidades',
    iconBg: 'bg-red-400',
    fields: [
      { key: 'alergiaCosmetica', label: 'Alergias cosmeticas', type: 'textarea', placeholder: 'Reacciones a productos, tinturas, quimicos...' },
      { key: 'sensibilidades', label: 'Sensibilidades', type: 'text', placeholder: 'Piel sensible a...' },
    ],
  },
  {
    title: 'Productos y Tratamientos',
    iconBg: 'bg-purple-500',
    fields: [
      { key: 'productosHabituales', label: 'Productos habituales', type: 'textarea', placeholder: 'Marcas y productos que usa regularmente...' },
      { key: 'tratamientosPrevios', label: 'Tratamientos previos', type: 'textarea', placeholder: 'Alisados, tinturas, tratamientos faciales...' },
      { key: 'preferencias', label: 'Preferencias', type: 'textarea', placeholder: 'Estilo preferido, referencias, notas...' },
    ],
  },
  {
    title: 'Notas del Profesional',
    iconBg: 'bg-indigo-500',
    fields: [
      { key: 'notasProfesional', label: 'Notas privadas', type: 'textarea', placeholder: 'Observaciones, formulas, anotaciones...', colSpan: 3 },
    ],
  },
];

// ─── Ficha Fitness ───────────────────────────────────────────────────────────

const fichaFitnessGroups: FieldGroup[] = [
  {
    title: 'Medidas Corporales',
    iconBg: 'bg-red-500',
    fields: [
      { key: 'peso', label: 'Peso (kg)', type: 'number' },
      { key: 'altura', label: 'Altura (cm)', type: 'number' },
      { key: 'circunferenciaPecho', label: 'Pecho (cm)', type: 'number' },
      { key: 'circunferenciaCintura', label: 'Cintura (cm)', type: 'number' },
      { key: 'circunferenciaCadera', label: 'Cadera (cm)', type: 'number' },
      { key: 'circunferenciaBrazo', label: 'Brazo (cm)', type: 'number' },
    ],
  },
  {
    title: 'Objetivos y Condicion',
    iconBg: 'bg-emerald-500',
    fields: [
      { key: 'objetivo', label: 'Objetivo principal', type: 'textarea', placeholder: 'Bajar de peso, ganar masa muscular, mejorar flexibilidad...' },
      { key: 'nivelActividad', label: 'Nivel de actividad actual', type: 'select', options: exerciseOptions },
      { key: 'frecuenciaEntrenamiento', label: 'Frecuencia de entrenamiento', type: 'text', placeholder: 'Ej: 3 veces por semana' },
    ],
  },
  {
    title: 'Lesiones y Condiciones',
    iconBg: 'bg-amber-500',
    fields: [
      { key: 'lesiones', label: 'Lesiones previas o actuales', type: 'textarea', placeholder: 'Hernias, esguinces, problemas articulares...' },
      { key: 'condicionesMedicas', label: 'Condiciones medicas relevantes', type: 'textarea', placeholder: 'Asma, hipertension, diabetes...' },
    ],
  },
  {
    title: 'Notas del Profesional',
    iconBg: 'bg-indigo-500',
    fields: [
      { key: 'notasProfesional', label: 'Notas y plan de entrenamiento', type: 'textarea', placeholder: 'Observaciones, rutinas, progreso...', colSpan: 3 },
    ],
  },
];

// ─── Module Registry ─────────────────────────────────────────────────────────

export const FICHA_MODULE_FIELDS: Record<FichaModuleId, FieldGroup[]> = {
  datosPersonales: datosPersonalesGroups,
  fichaClinica: fichaClinicaGroups,
  fichaBelleza: fichaBellezaGroups,
  fichaFitness: fichaFitnessGroups,
  notasSeguimiento: [], // Handled by the timeline component, not form fields
  derivaciones: [], // Handled by the referrals component, not form fields
};
