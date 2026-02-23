// ─── Category configuration ─────────────────────────────────────────────────
// Single source of truth for all category metadata across the app.
// Visual icons are handled by CategoryIcon in components/ui/category-icon.tsx

export interface CategoryConfig {
  key: string;
  label: string;
  shortLabel: string; // For chips/pills where space is limited
  /** Search terms for browse matching */
  searchTerms: string;
}

export const CATEGORIES: CategoryConfig[] = [
  {
    key: 'estetica-belleza',
    label: 'Estética y Belleza',
    shortLabel: 'Belleza',
    searchTerms: 'estética belleza cosmetología maquillaje peluquería uñas depilación',
  },
  {
    key: 'barberia',
    label: 'Barbería',
    shortLabel: 'Barbería',
    searchTerms: 'barbería barbero peluquero corte barba',
  },
  {
    key: 'masajes-spa',
    label: 'Masajes y Spa',
    shortLabel: 'Spa',
    searchTerms: 'masaje spa relajación bienestar corporal',
  },
  {
    key: 'salud',
    label: 'Salud',
    shortLabel: 'Salud',
    searchTerms: 'salud médico enfermero kinesiología clínica',
  },
  {
    key: 'odontologia',
    label: 'Odontología',
    shortLabel: 'Odontología',
    searchTerms: 'dentista odontólogo ortodoncia implantes limpieza dental',
  },
  {
    key: 'psicologia',
    label: 'Psicología y Terapia',
    shortLabel: 'Psicología',
    searchTerms: 'psicólogo terapia terapeuta coaching bienestar mental',
  },
  {
    key: 'nutricion',
    label: 'Nutrición',
    shortLabel: 'Nutrición',
    searchTerms: 'nutricionista dietista alimentación dieta plan nutricional',
  },
  {
    key: 'fitness',
    label: 'Fitness y Deporte',
    shortLabel: 'Fitness',
    searchTerms: 'personal trainer entrenador yoga pilates gimnasio deporte',
  },
  {
    key: 'veterinaria',
    label: 'Veterinaria',
    shortLabel: 'Veterinaria',
    searchTerms: 'veterinario mascota animal clínica veterinaria',
  },
  {
    key: 'tatuajes-piercing',
    label: 'Tatuajes y Piercing',
    shortLabel: 'Tatuajes',
    searchTerms: 'tatuaje tattoo piercing arte corporal estudio',
  },
  {
    key: 'educacion',
    label: 'Educación y Clases',
    shortLabel: 'Educación',
    searchTerms: 'profesor tutor clases particulares música idiomas apoyo escolar',
  },
  {
    key: 'consultoria',
    label: 'Consultoría',
    shortLabel: 'Consultoría',
    searchTerms: 'consultor abogado contador asesor profesional legal contable',
  },
];

// ─── Lookup helpers ──────────────────────────────────────────────────────────

/** Map for O(1) lookup by key */
export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c]),
) as Record<string, CategoryConfig>;

/** Labels for display (key → full label) */
export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.label]),
);

/** Search terms for browse matching (key → terms) */
export const CATEGORY_SEARCH_TERMS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.searchTerms]),
);

/** For select/dropdown components */
export const CATEGORY_SELECT_OPTIONS = CATEGORIES.map((c) => ({
  label: c.label,
  value: c.key,
}));
