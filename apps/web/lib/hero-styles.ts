/**
 * Hero Style definitions for public booking pages.
 *
 * Each style provides structural tokens (Tailwind classes) that control
 * layout, shapes, typography, patterns, badges and cards — things that
 * a colour picker cannot change.
 *
 * Colours still come from the tenant's primaryColor / secondaryColor.
 * "classic" reproduces the original brand look exactly.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type HeroStyleName =
  | 'classic'
  | 'clinical'
  | 'bold'
  | 'zen'
  | 'corporate'
  | 'energetic'
  | 'warm';

export interface HeroStyleConfig {
  // ── Hero background (when there's NO cover image) ──────────────────────
  heroBg: string;                   // gradient / solid on the <header>
  heroPattern: string | null;       // optional SVG data-uri pattern
  heroDecorativeBlobs: [string, string]; // two blobs (top-right, bottom-left)

  // ── Layout ─────────────────────────────────────────────────────────────
  heroLayout: 'left' | 'center' | 'side-by-side';
  heroPadding: string;              // py-* on the inner container

  // ── Logo / Avatar shape ────────────────────────────────────────────────
  logoRadius: string;               // e.g. 'rounded-xl', 'rounded-full'
  logoFallbackGradient: string;     // gradient for the letter avatar

  // ── Text ───────────────────────────────────────────────────────────────
  heroTextColor: 'light' | 'dark';  // white-on-dark vs dark-on-light
  nameWeight: string;               // 'font-bold' | 'font-black' | 'font-medium'
  nameTracking: string;             // 'tracking-normal' | 'tracking-tight' | 'tracking-wide'
  descriptionOpacity: string;       // e.g. 'text-white/80' or 'text-slate-600'

  // ── Badge "Online" ─────────────────────────────────────────────────────
  onlineBadgeClasses: string;

  // ── Contact buttons ────────────────────────────────────────────────────
  contactBtnClasses: string;        // shared base for the pill/rect buttons
  contactIconColors: [string, string, string]; // [location, phone, instagram]

  // ── Trust badges ───────────────────────────────────────────────────────
  trustBadgeStyle: 'icon-box' | 'text-only' | 'dark-rect' | 'minimal-dots' | 'checks' | 'bold-separators' | 'warm-box';
  trustBadgeIconBoxClasses?: [string, string, string]; // 3 icon-box bg classes
  trustBadgeTextClasses: string;    // text colour

  // ── Stats box (desktop) ────────────────────────────────────────────────
  statsBoxClasses: string;

  // ── Service cards ──────────────────────────────────────────────────────
  cardRadius: string;               // 'rounded-2xl' | 'rounded-lg' etc.
  cardBorder: string;               // border colour on hover
  cardHoverEffect: string;          // 'hover:-translate-y-1' | 'hover:scale-[1.02]' | ''
  cardCtaClasses: string;           // mobile "Reservar" pill
  cardDesktopBtnClasses: string;    // desktop "Reservar" button
  cardFallbackGradient: string;     // no-image placeholder
  cardFallbackLetterClasses: string;

  // ── Service detail modal ───────────────────────────────────────────────
  modalFallbackGradient: string;    // gradient when service has no image
  modalCtaBtnClasses: string;       // "Reservar este servicio" button
}

// ---------------------------------------------------------------------------
// Selector options (for Configuracion UI)
// ---------------------------------------------------------------------------

export const HERO_STYLE_OPTIONS: {
  value: HeroStyleName;
  label: string;
  description: string;
}[] = [
  { value: 'classic',    label: 'Clásico',      description: 'Belleza, peluquería, barbería' },
  { value: 'clinical',   label: 'Clínico',      description: 'Salud, medicina, odontología' },
  { value: 'bold',       label: 'Urbano',        description: 'Barbería urbana, tattoo, piercing' },
  { value: 'zen',        label: 'Zen',           description: 'Spa, yoga, bienestar' },
  { value: 'corporate',  label: 'Profesional',   description: 'Abogados, contadores, consultoría' },
  { value: 'energetic',  label: 'Energético',    description: 'Fitness, deporte, crossfit' },
  { value: 'warm',       label: 'Cálido',        description: 'Gastronomía, veterinaria, guardería' },
];

// ---------------------------------------------------------------------------
// Style configs
// ---------------------------------------------------------------------------

// SVG patterns encoded as data-uris
const PATTERN_CROSSES = "bg-[url('data:image/svg+xml,%3Csvg width=%2760%27 height=%2760%27 viewBox=%270 0 60 60%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27none%27 fill-rule=%27evenodd%27%3E%3Cg fill=%27%23ffffff%27 fill-opacity=%270.05%27%3E%3Cpath d=%27M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]";

const PATTERN_GEOMETRIC = "bg-[url('data:image/svg+xml,%3Csvg width=%2740%27 height=%2740%27 viewBox=%270 0 40 40%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27%23ffffff%27 fill-opacity=%270.06%27 fill-rule=%27evenodd%27%3E%3Cpath d=%27M0 0h20v20H0V0zm20 20h20v20H20V20z%27/%3E%3C/g%3E%3C/svg%3E')]";

const PATTERN_TRIANGLES = "bg-[url('data:image/svg+xml,%3Csvg width=%2760%27 height=%2760%27 viewBox=%270 0 60 60%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27%23ffffff%27 fill-opacity=%270.06%27%3E%3Cpolygon points=%2730 0 60 30 30 60 0 30%27/%3E%3C/g%3E%3C/svg%3E')]";

const PATTERN_WAVE = "bg-[url('data:image/svg+xml,%3Csvg width=%27100%25%27 height=%27100%25%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cdefs%3E%3Cpattern id=%27w%27 width=%27120%27 height=%2720%27 patternUnits=%27userSpaceOnUse%27%3E%3Cpath d=%27M0 10 Q30 0 60 10 T120 10%27 fill=%27none%27 stroke=%27%23ffffff%27 stroke-opacity=%270.07%27 stroke-width=%271.5%27/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=%27100%25%27 height=%27100%25%27 fill=%27url(%23w)%27/%3E%3C/svg%3E')]";


export const HERO_STYLES: Record<HeroStyleName, HeroStyleConfig> = {
  // ═══════════════════════════════════════════════════════════════════════
  // CLASSIC — The original pink → fuchsia → violet style (preservado 1:1)
  // ═══════════════════════════════════════════════════════════════════════
  classic: {
    heroBg: 'bg-gradient-to-br from-teal-500 via-cyan-600 to-violet-600',
    heroPattern: PATTERN_CROSSES,
    heroDecorativeBlobs: [
      'bg-teal-300/30',
      'bg-violet-300/30',
    ],
    heroLayout: 'left',
    heroPadding: 'py-4 lg:py-6',
    logoRadius: 'rounded-xl',
    logoFallbackGradient: 'bg-gradient-to-br from-violet-500 to-teal-500',
    heroTextColor: 'light',
    nameWeight: 'font-bold',
    nameTracking: 'tracking-normal',
    descriptionOpacity: 'text-white/80',
    onlineBadgeClasses: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
    contactBtnClasses: 'bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-colors',
    contactIconColors: ['text-violet-300', 'text-emerald-300', 'text-teal-300'],
    trustBadgeStyle: 'icon-box',
    trustBadgeIconBoxClasses: [
      'bg-violet-500/20',
      'bg-emerald-500/20',
      'bg-teal-500/20',
    ],
    trustBadgeTextClasses: 'text-white/70',
    statsBoxClasses: 'bg-white/10 backdrop-blur rounded-2xl',
    cardRadius: 'rounded-2xl',
    cardBorder: 'hover:border-teal-300 dark:hover:border-teal-600/50',
    cardHoverEffect: 'hover:-translate-y-1',
    cardCtaClasses: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 hover:bg-teal-100 dark:hover:bg-teal-900/50',
    cardDesktopBtnClasses: 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white group-hover:bg-teal-600 dark:group-hover:bg-teal-500 dark:group-hover:text-white',
    cardFallbackGradient: 'bg-gradient-to-br from-teal-100 to-violet-100 dark:from-teal-900/30 dark:to-violet-900/30',
    cardFallbackLetterClasses: 'bg-gradient-to-br from-teal-500 to-violet-500 bg-clip-text text-transparent',
    modalFallbackGradient: 'bg-gradient-to-br from-teal-500 via-violet-500 to-purple-600',
    modalCtaBtnClasses: 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white shadow-lg shadow-teal-500/25',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLINICAL — Clean, trustworthy, light background with teal accent
  // ═══════════════════════════════════════════════════════════════════════
  clinical: {
    heroBg: 'bg-gradient-to-r from-slate-50 via-white to-teal-50',
    heroPattern: null,
    heroDecorativeBlobs: [
      'bg-teal-200/40',
      'bg-sky-200/30',
    ],
    heroLayout: 'left',
    heroPadding: 'py-4 lg:py-6',
    logoRadius: 'rounded-lg',
    logoFallbackGradient: 'bg-gradient-to-br from-teal-500 to-cyan-500',
    heroTextColor: 'dark',
    nameWeight: 'font-bold',
    nameTracking: 'tracking-normal',
    descriptionOpacity: 'text-slate-600',
    onlineBadgeClasses: 'bg-teal-100 text-teal-700 border-teal-200',
    contactBtnClasses: 'bg-slate-100 rounded-full hover:bg-slate-200 transition-colors',
    contactIconColors: ['text-teal-600', 'text-emerald-600', 'text-sky-600'],
    trustBadgeStyle: 'checks',
    trustBadgeTextClasses: 'text-slate-600',
    statsBoxClasses: 'bg-white border border-slate-200 rounded-2xl shadow-sm',
    cardRadius: 'rounded-xl',
    cardBorder: 'hover:border-teal-300 dark:hover:border-teal-600/50',
    cardHoverEffect: 'hover:-translate-y-1',
    cardCtaClasses: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 hover:bg-teal-100 dark:hover:bg-teal-900/50',
    cardDesktopBtnClasses: 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white',
    cardFallbackGradient: 'bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30',
    cardFallbackLetterClasses: 'bg-gradient-to-br from-teal-500 to-cyan-500 bg-clip-text text-transparent',
    modalFallbackGradient: 'bg-gradient-to-br from-teal-500 via-cyan-500 to-sky-500',
    modalCtaBtnClasses: 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white shadow-lg shadow-teal-500/25',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // BOLD — Dark, angular, urban
  // ═══════════════════════════════════════════════════════════════════════
  bold: {
    heroBg: 'bg-gradient-to-br from-neutral-900 via-neutral-800 to-zinc-900',
    heroPattern: PATTERN_GEOMETRIC,
    heroDecorativeBlobs: [
      'bg-amber-500/20',
      'bg-orange-500/15',
    ],
    heroLayout: 'left',
    heroPadding: 'py-4 lg:py-6',
    logoRadius: 'rounded-sm',
    logoFallbackGradient: 'bg-gradient-to-br from-amber-500 to-orange-600',
    heroTextColor: 'light',
    nameWeight: 'font-black',
    nameTracking: 'tracking-tight',
    descriptionOpacity: 'text-white/70',
    onlineBadgeClasses: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    contactBtnClasses: 'bg-white/10 backdrop-blur rounded-sm hover:bg-white/20 transition-colors',
    contactIconColors: ['text-amber-400', 'text-emerald-400', 'text-orange-400'],
    trustBadgeStyle: 'dark-rect',
    trustBadgeTextClasses: 'text-white/80',
    statsBoxClasses: 'bg-white/10 backdrop-blur rounded-lg',
    cardRadius: 'rounded-lg',
    cardBorder: 'hover:border-amber-400 dark:hover:border-amber-500/50',
    cardHoverEffect: 'hover:-translate-y-1',
    cardCtaClasses: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50',
    cardDesktopBtnClasses: 'bg-amber-500 hover:bg-amber-600 text-black font-bold',
    cardFallbackGradient: 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30',
    cardFallbackLetterClasses: 'bg-gradient-to-br from-amber-500 to-orange-500 bg-clip-text text-transparent',
    modalFallbackGradient: 'bg-gradient-to-br from-neutral-800 via-zinc-700 to-neutral-900',
    modalCtaBtnClasses: 'bg-amber-500 hover:bg-amber-600 text-black font-bold shadow-lg shadow-amber-500/25',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ZEN — Centered, soft, spacious
  // ═══════════════════════════════════════════════════════════════════════
  zen: {
    heroBg: 'bg-gradient-to-b from-emerald-50 via-teal-50 to-cyan-50',
    heroPattern: PATTERN_WAVE,
    heroDecorativeBlobs: [
      'bg-emerald-200/30',
      'bg-teal-200/30',
    ],
    heroLayout: 'center',
    heroPadding: 'py-8 lg:py-10',
    logoRadius: 'rounded-full',
    logoFallbackGradient: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    heroTextColor: 'dark',
    nameWeight: 'font-medium',
    nameTracking: 'tracking-wide',
    descriptionOpacity: 'text-slate-500',
    onlineBadgeClasses: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    contactBtnClasses: 'bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors shadow-sm',
    contactIconColors: ['text-emerald-500', 'text-teal-500', 'text-cyan-500'],
    trustBadgeStyle: 'minimal-dots',
    trustBadgeTextClasses: 'text-slate-500',
    statsBoxClasses: 'bg-white/80 backdrop-blur border border-emerald-100 rounded-full',
    cardRadius: 'rounded-2xl',
    cardBorder: 'hover:border-emerald-300 dark:hover:border-emerald-600/50',
    cardHoverEffect: 'hover:scale-[1.02]',
    cardCtaClasses: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50',
    cardDesktopBtnClasses: 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white',
    cardFallbackGradient: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30',
    cardFallbackLetterClasses: 'bg-gradient-to-br from-emerald-500 to-teal-500 bg-clip-text text-transparent',
    modalFallbackGradient: 'bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400',
    modalCtaBtnClasses: 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CORPORATE — Compact side-by-side, solid bg, professional
  // ═══════════════════════════════════════════════════════════════════════
  corporate: {
    heroBg: 'bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800',
    heroPattern: null,
    heroDecorativeBlobs: [
      'bg-blue-400/10',
      'bg-indigo-400/10',
    ],
    heroLayout: 'side-by-side',
    heroPadding: 'py-3 lg:py-4',
    logoRadius: 'rounded-md',
    logoFallbackGradient: 'bg-gradient-to-br from-blue-600 to-indigo-600',
    heroTextColor: 'light',
    nameWeight: 'font-bold',
    nameTracking: 'tracking-tight',
    descriptionOpacity: 'text-white/70',
    onlineBadgeClasses: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
    contactBtnClasses: 'bg-white/10 backdrop-blur rounded-md hover:bg-white/20 transition-colors',
    contactIconColors: ['text-blue-300', 'text-emerald-300', 'text-indigo-300'],
    trustBadgeStyle: 'checks',
    trustBadgeTextClasses: 'text-white/70',
    statsBoxClasses: 'bg-white/10 backdrop-blur rounded-lg',
    cardRadius: 'rounded-xl',
    cardBorder: 'hover:border-blue-300 dark:hover:border-blue-600/50',
    cardHoverEffect: 'hover:-translate-y-1',
    cardCtaClasses: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50',
    cardDesktopBtnClasses: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white',
    cardFallbackGradient: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30',
    cardFallbackLetterClasses: 'bg-gradient-to-br from-blue-500 to-indigo-500 bg-clip-text text-transparent',
    modalFallbackGradient: 'bg-gradient-to-br from-slate-700 via-blue-700 to-indigo-700',
    modalCtaBtnClasses: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ENERGETIC — Diagonal gradient, bold, triangles
  // ═══════════════════════════════════════════════════════════════════════
  energetic: {
    heroBg: 'bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500',
    heroPattern: PATTERN_TRIANGLES,
    heroDecorativeBlobs: [
      'bg-yellow-300/30',
      'bg-red-300/20',
    ],
    heroLayout: 'left',
    heroPadding: 'py-4 lg:py-6',
    logoRadius: 'rounded-xl',
    logoFallbackGradient: 'bg-gradient-to-br from-red-500 to-orange-500',
    heroTextColor: 'light',
    nameWeight: 'font-black',
    nameTracking: 'tracking-tight',
    descriptionOpacity: 'text-white/80',
    onlineBadgeClasses: 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30',
    contactBtnClasses: 'bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-colors',
    contactIconColors: ['text-yellow-300', 'text-emerald-300', 'text-orange-300'],
    trustBadgeStyle: 'bold-separators',
    trustBadgeTextClasses: 'text-white/90',
    statsBoxClasses: 'bg-white/10 backdrop-blur rounded-2xl',
    cardRadius: 'rounded-xl',
    cardBorder: 'hover:border-orange-300 dark:hover:border-orange-500/50',
    cardHoverEffect: 'hover:-translate-y-1',
    cardCtaClasses: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50',
    cardDesktopBtnClasses: 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-bold',
    cardFallbackGradient: 'bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/30 dark:to-yellow-900/30',
    cardFallbackLetterClasses: 'bg-gradient-to-br from-orange-500 to-red-500 bg-clip-text text-transparent',
    modalFallbackGradient: 'bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500',
    modalCtaBtnClasses: 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/25',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // WARM — Amber → rose gradient, cozy, rounded
  // ═══════════════════════════════════════════════════════════════════════
  warm: {
    heroBg: 'bg-gradient-to-br from-amber-50 via-orange-50 to-teal-50',
    heroPattern: null,
    heroDecorativeBlobs: [
      'bg-amber-200/40',
      'bg-teal-200/30',
    ],
    heroLayout: 'left',
    heroPadding: 'py-4 lg:py-6',
    logoRadius: 'rounded-2xl',
    logoFallbackGradient: 'bg-gradient-to-br from-amber-500 to-teal-500',
    heroTextColor: 'dark',
    nameWeight: 'font-bold',
    nameTracking: 'tracking-normal',
    descriptionOpacity: 'text-slate-600',
    onlineBadgeClasses: 'bg-amber-100 text-amber-700 border-amber-200',
    contactBtnClasses: 'bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors shadow-sm',
    contactIconColors: ['text-amber-600', 'text-emerald-600', 'text-teal-500'],
    trustBadgeStyle: 'warm-box',
    trustBadgeIconBoxClasses: [
      'bg-amber-100',
      'bg-emerald-100',
      'bg-teal-100',
    ],
    trustBadgeTextClasses: 'text-slate-600',
    statsBoxClasses: 'bg-white/80 backdrop-blur border border-amber-100 rounded-2xl shadow-sm',
    cardRadius: 'rounded-2xl',
    cardBorder: 'hover:border-amber-300 dark:hover:border-amber-500/50',
    cardHoverEffect: 'hover:-translate-y-1',
    cardCtaClasses: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50',
    cardDesktopBtnClasses: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white',
    cardFallbackGradient: 'bg-gradient-to-br from-amber-50 to-teal-50 dark:from-amber-900/30 dark:to-teal-900/30',
    cardFallbackLetterClasses: 'bg-gradient-to-br from-amber-500 to-teal-500 bg-clip-text text-transparent',
    modalFallbackGradient: 'bg-gradient-to-br from-amber-400 via-orange-400 to-teal-400',
    modalCtaBtnClasses: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25',
  },
};
