// Profile Header Templates — maps categories to visual styles

export type TemplateName = 'vibrant' | 'clinical' | 'corporate' | 'modern' | 'minimal';

// Category → default template
export const CATEGORY_TEMPLATE_MAP: Record<string, TemplateName> = {
  'estetica-belleza': 'vibrant',
  'barberia': 'vibrant',
  'masajes-spa': 'vibrant',
  'salud': 'clinical',
  'odontologia': 'clinical',
  'psicologia': 'minimal',
  'nutricion': 'clinical',
  'fitness': 'vibrant',
  'veterinaria': 'minimal',
  'tatuajes-piercing': 'vibrant',
  'educacion': 'minimal',
  'consultoria': 'minimal',
};

/**
 * Resolve which template to use.
 * Priority: explicit override > category default > 'minimal'
 */
export function resolveTemplate(
  headerTemplate: string | null | undefined,
  category: string | null | undefined,
): TemplateName {
  if (headerTemplate && TEMPLATE_NAMES.includes(headerTemplate as TemplateName)) {
    return headerTemplate as TemplateName;
  }
  if (category && CATEGORY_TEMPLATE_MAP[category]) {
    return CATEGORY_TEMPLATE_MAP[category];
  }
  return 'minimal';
}

export const TEMPLATE_NAMES: TemplateName[] = ['vibrant', 'clinical', 'corporate', 'modern', 'minimal'];

// Options for the UI selector
export const TEMPLATE_OPTIONS: Array<{ value: string; label: string; description: string }> = [
  { value: '', label: 'Automatico', description: 'Se elige segun tu categoria' },
  { value: 'vibrant', label: 'Vibrante', description: 'Creativo, colorido — ideal para belleza, barberia, spa' },
  { value: 'clinical', label: 'Clinico', description: 'Limpio, profesional — ideal para salud' },
  { value: 'minimal', label: 'Clasico', description: 'Simple y limpio' },
];

// Visual styles per template
export interface TemplateStyle {
  // Header gradient/bg
  headerBg: string;
  headerBgDark: string;
  // Avatar shape
  avatarShape: string; // rounded-full | rounded-xl | rounded-lg
  avatarSize: string;
  avatarRing: string;
  // Skill pill style
  skillVariant: 'colorful' | 'outline' | 'subtle' | 'tech' | 'plain';
  // Section order priority
  sectionOrder: Array<'bio' | 'skills' | 'certifications' | 'experience' | 'zones'>;
  // Accent colors for pills/badges
  accentClass: string;
}

export const TEMPLATE_STYLES: Record<TemplateName, TemplateStyle> = {
  vibrant: {
    headerBg: 'bg-gradient-to-br from-teal-500 via-cyan-500 to-indigo-500',
    headerBgDark: 'dark:from-teal-600 dark:via-cyan-600 dark:to-indigo-600',
    avatarShape: 'rounded-full',
    avatarSize: 'h-20 w-20 sm:h-24 sm:w-24',
    avatarRing: 'ring-4 ring-white dark:ring-gray-900 shadow-xl',
    skillVariant: 'colorful',
    sectionOrder: ['bio', 'skills', 'certifications', 'experience', 'zones'],
    accentClass: 'text-cyan-600 dark:text-cyan-400',
  },
  clinical: {
    headerBg: 'bg-gradient-to-r from-teal-50 via-white to-teal-50/50',
    headerBgDark: 'dark:from-teal-900/40 dark:via-gray-800 dark:to-teal-900/40',
    avatarShape: 'rounded-xl',
    avatarSize: 'h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20',
    avatarRing: 'ring-2 ring-teal-200 dark:ring-teal-700',
    skillVariant: 'outline',
    sectionOrder: ['certifications', 'bio', 'skills', 'experience', 'zones'],
    accentClass: 'text-teal-600 dark:text-teal-400',
  },
  corporate: {
    headerBg: 'bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800',
    headerBgDark: 'dark:from-slate-900 dark:via-gray-950 dark:to-slate-900',
    avatarShape: 'rounded-lg',
    avatarSize: 'h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]',
    avatarRing: 'ring-2 ring-slate-300 dark:ring-slate-600',
    skillVariant: 'subtle',
    sectionOrder: ['experience', 'bio', 'certifications', 'skills', 'zones'],
    accentClass: 'text-slate-600 dark:text-slate-400',
  },
  modern: {
    headerBg: 'bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500',
    headerBgDark: 'dark:from-blue-700 dark:via-cyan-600 dark:to-emerald-600',
    avatarShape: 'rounded-2xl',
    avatarSize: 'h-[4.5rem] w-[4.5rem] sm:h-[5.5rem] sm:w-[5.5rem]',
    avatarRing: 'ring-4 ring-white/60 dark:ring-gray-800/60 shadow-lg',
    skillVariant: 'tech',
    sectionOrder: ['skills', 'bio', 'certifications', 'experience', 'zones'],
    accentClass: 'text-cyan-600 dark:text-cyan-400',
  },
  minimal: {
    headerBg: 'bg-gradient-to-r from-gray-100 to-gray-50',
    headerBgDark: 'dark:from-gray-800/80 dark:to-gray-800/40',
    avatarShape: 'rounded-full',
    avatarSize: 'h-16 w-16 sm:h-20 sm:w-20',
    avatarRing: 'ring-2 ring-gray-200 dark:ring-gray-700',
    skillVariant: 'plain',
    sectionOrder: ['bio', 'skills', 'certifications', 'experience', 'zones'],
    accentClass: 'text-gray-600 dark:text-gray-400',
  },
};

// Category → card border accent color (for browse grid)
export const CATEGORY_CARD_ACCENTS: Record<string, string> = {
  'estetica-belleza': 'border-l-cyan-400',
  'barberia': 'border-l-orange-400',
  'masajes-spa': 'border-l-sky-400',
  'salud': 'border-l-teal-400',
  'odontologia': 'border-l-blue-400',
  'psicologia': 'border-l-violet-400',
  'nutricion': 'border-l-green-400',
  'fitness': 'border-l-red-400',
  'veterinaria': 'border-l-amber-400',
  'tatuajes-piercing': 'border-l-rose-400',
  'educacion': 'border-l-indigo-400',
  'consultoria': 'border-l-slate-400',
};
