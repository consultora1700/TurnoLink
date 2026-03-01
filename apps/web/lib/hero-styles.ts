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
  industry: string;
}[] = [
  { value: 'classic',    label: 'Clásico',      description: 'Degradado colorido con patrón de cruces', industry: 'Belleza, peluquería, barbería' },
  { value: 'clinical',   label: 'Clínico',      description: 'Fondo claro, limpio y profesional', industry: 'Salud, medicina, odontología' },
  { value: 'bold',       label: 'Urbano',        description: 'Fondo oscuro con geometría angular', industry: 'Barbería urbana, tattoo, piercing' },
  { value: 'zen',        label: 'Zen',           description: 'Centrado, pastel con ondas suaves', industry: 'Spa, yoga, bienestar' },
  { value: 'corporate',  label: 'Profesional',   description: 'Compacto lado a lado, fondo formal', industry: 'Abogados, contadores, consultoría' },
  { value: 'energetic',  label: 'Energético',    description: 'Gradiente vibrante con triángulos', industry: 'Fitness, deporte, crossfit' },
  { value: 'warm',       label: 'Cálido',        description: 'Tonos suaves y bordes redondeados', industry: 'Gastronomía, veterinaria, guardería' },
];

export const CARD_STYLE_OPTIONS: {
  value: '' | HeroStyleName;
  label: string;
  description: string;
}[] = [
  { value: '',           label: 'Igual al encabezado', description: 'Sincronizado con el estilo del hero' },
  { value: 'classic',    label: 'Clásico',      description: 'Imagen arriba, bordes suaves, botón oscuro' },
  { value: 'clinical',   label: 'Clínico',      description: 'Sin imagen prominente, botón outline' },
  { value: 'warm',       label: 'Cálido',        description: 'Foto circular, botón cálido, barra lateral' },
  { value: 'bold',       label: 'Urbano',        description: 'Overlay oscuro, texto uppercase, angular' },
  { value: 'zen',        label: 'Zen',           description: 'Texto centrado, botón redondeado' },
  { value: 'corporate',  label: 'Profesional',   description: 'Filas compactas tipo lista' },
  { value: 'energetic',  label: 'Energético',    description: 'Botón gradiente, precio en badge' },
];

// ---------------------------------------------------------------------------
// Default recommended colors per style
// ---------------------------------------------------------------------------

export const HERO_STYLE_DEFAULT_COLORS: Record<HeroStyleName, { primary: string; secondary: string; accent: string }> = {
  classic:    { primary: '#3F8697', secondary: '#8B5CF6', accent: '#10B981' },
  clinical:   { primary: '#3F8697', secondary: '#06B6D4', accent: '#10B981' },
  bold:       { primary: '#F59E0B', secondary: '#F97316', accent: '#10B981' },
  zen:        { primary: '#10B981', secondary: '#14B8A6', accent: '#06B6D4' },
  corporate:  { primary: '#3B82F6', secondary: '#6366F1', accent: '#10B981' },
  energetic:  { primary: '#F97316', secondary: '#EF4444', accent: '#EAB308' },
  warm:       { primary: '#F59E0B', secondary: '#14B8A6', accent: '#10B981' },
};

// Card styles share the same color palette as their matching hero style,
// so selecting a card style independently also loads its recommended colors.
export const CARD_STYLE_DEFAULT_COLORS = HERO_STYLE_DEFAULT_COLORS;

// Default cover overlay + fade settings per hero style.
// coverOverlayColor uses the style's primary so the user can tune opacity.
export const HERO_STYLE_COVER_DEFAULTS: Record<HeroStyleName, {
  coverOverlayColor: string;
  coverOverlayOpacity: number;
  coverFadeEnabled: boolean;
  coverFadeColor: string;
}> = {
  classic:    { coverOverlayColor: '#3F8697', coverOverlayOpacity: 50, coverFadeEnabled: true,  coverFadeColor: '#000000' },
  clinical:   { coverOverlayColor: '#ffffff', coverOverlayOpacity: 60, coverFadeEnabled: true,  coverFadeColor: '#ffffff' },
  bold:       { coverOverlayColor: '#F59E0B', coverOverlayOpacity: 55, coverFadeEnabled: true,  coverFadeColor: '#000000' },
  zen:        { coverOverlayColor: '#10B981', coverOverlayOpacity: 30, coverFadeEnabled: true,  coverFadeColor: '#ffffff' },
  corporate:  { coverOverlayColor: '#1e293b', coverOverlayOpacity: 65, coverFadeEnabled: false, coverFadeColor: '#1e293b' },
  energetic:  { coverOverlayColor: '#F97316', coverOverlayOpacity: 45, coverFadeEnabled: true,  coverFadeColor: '#000000' },
  warm:       { coverOverlayColor: '#F59E0B', coverOverlayOpacity: 35, coverFadeEnabled: true,  coverFadeColor: '#f5f0e8' },
};

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
    heroBg: 'bg-gradient-to-br from-[hsl(var(--tenant-primary-500))] via-[hsl(var(--tenant-primary-600))] to-[hsl(var(--tenant-secondary-600))]',
    heroPattern: PATTERN_CROSSES,
    heroDecorativeBlobs: [
      'bg-[hsl(var(--tenant-primary-300)_/_0.3)]',
      'bg-[hsl(var(--tenant-secondary-300)_/_0.3)]',
    ],
    heroLayout: 'left',
    heroPadding: 'py-4 lg:py-6',
    logoRadius: 'rounded-xl',
    logoFallbackGradient: 'bg-gradient-to-br from-[hsl(var(--tenant-secondary-500))] to-[hsl(var(--tenant-primary-500))]',
    heroTextColor: 'light',
    nameWeight: 'font-bold',
    nameTracking: 'tracking-normal',
    descriptionOpacity: 'text-white/80',
    onlineBadgeClasses: 'bg-[hsl(var(--tenant-accent-500)_/_0.2)] text-[hsl(var(--tenant-accent-200))] border-[hsl(var(--tenant-accent-400)_/_0.3)]',
    contactBtnClasses: 'bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-colors',
    contactIconColors: ['text-[hsl(var(--tenant-secondary-300))]', 'text-[hsl(var(--tenant-accent-300))]', 'text-[hsl(var(--tenant-primary-300))]'],
    trustBadgeStyle: 'icon-box',
    trustBadgeIconBoxClasses: [
      'bg-[hsl(var(--tenant-secondary-500)_/_0.2)]',
      'bg-[hsl(var(--tenant-accent-500)_/_0.2)]',
      'bg-[hsl(var(--tenant-primary-500)_/_0.2)]',
    ],
    trustBadgeTextClasses: 'text-white/70',
    statsBoxClasses: 'bg-white/10 backdrop-blur rounded-2xl',
    cardRadius: 'rounded-2xl',
    cardBorder: 'hover:border-[hsl(var(--tenant-primary-300))] dark:hover:border-[hsl(var(--tenant-primary-600)_/_0.5)]',
    cardHoverEffect: 'hover:-translate-y-1',
    cardCtaClasses: 'text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))] bg-[hsl(var(--tenant-primary-50))] dark:bg-[hsl(var(--tenant-primary-900)_/_0.3)] hover:bg-[hsl(var(--tenant-primary-100))] dark:hover:bg-[hsl(var(--tenant-primary-900)_/_0.5)]',
    cardDesktopBtnClasses: 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white group-hover:bg-[hsl(var(--tenant-primary-600))] dark:group-hover:bg-[hsl(var(--tenant-primary-500))] dark:group-hover:text-white',
    cardFallbackGradient: 'bg-gradient-to-br from-[hsl(var(--tenant-primary-100))] to-[hsl(var(--tenant-secondary-100))] dark:from-[hsl(var(--tenant-primary-900)_/_0.3)] dark:to-[hsl(var(--tenant-secondary-900)_/_0.3)]',
    cardFallbackLetterClasses: 'bg-gradient-to-br from-[hsl(var(--tenant-primary-500))] to-[hsl(var(--tenant-secondary-500))] bg-clip-text text-transparent',
    modalFallbackGradient: 'bg-gradient-to-br from-[hsl(var(--tenant-primary-500))] via-[hsl(var(--tenant-secondary-500))] to-[hsl(var(--tenant-secondary-600))]',
    modalCtaBtnClasses: 'bg-[hsl(var(--tenant-primary-600))] hover:bg-[hsl(var(--tenant-primary-700))] dark:bg-[hsl(var(--tenant-primary-500))] dark:hover:bg-[hsl(var(--tenant-primary-600))] text-white shadow-lg shadow-[hsl(var(--tenant-primary-500)_/_0.25)]',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLINICAL — Clean, trustworthy, light background with teal accent
  // ═══════════════════════════════════════════════════════════════════════
  clinical: {
    heroBg: 'bg-gradient-to-r from-slate-50 via-white to-[hsl(var(--tenant-primary-50))]',
    heroPattern: null,
    heroDecorativeBlobs: [
      'bg-[hsl(var(--tenant-primary-200)_/_0.4)]',
      'bg-[hsl(var(--tenant-secondary-200)_/_0.3)]',
    ],
    heroLayout: 'left',
    heroPadding: 'py-4 lg:py-6',
    logoRadius: 'rounded-lg',
    logoFallbackGradient: 'bg-gradient-to-br from-[hsl(var(--tenant-primary-500))] to-[hsl(var(--tenant-secondary-500))]',
    heroTextColor: 'dark',
    nameWeight: 'font-bold',
    nameTracking: 'tracking-normal',
    descriptionOpacity: 'text-slate-600',
    onlineBadgeClasses: 'bg-[hsl(var(--tenant-primary-100))] text-[hsl(var(--tenant-primary-700))] border-[hsl(var(--tenant-primary-200))]',
    contactBtnClasses: 'bg-slate-100 rounded-full hover:bg-slate-200 transition-colors',
    contactIconColors: ['text-[hsl(var(--tenant-primary-600))]', 'text-[hsl(var(--tenant-accent-600))]', 'text-[hsl(var(--tenant-secondary-600))]'],
    trustBadgeStyle: 'checks',
    trustBadgeTextClasses: 'text-slate-600',
    statsBoxClasses: 'bg-white border border-slate-200 rounded-2xl shadow-sm',
    cardRadius: 'rounded-xl',
    cardBorder: 'hover:border-[hsl(var(--tenant-primary-300))] dark:hover:border-[hsl(var(--tenant-primary-600)_/_0.5)]',
    cardHoverEffect: 'hover:-translate-y-1',
    cardCtaClasses: 'text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))] bg-[hsl(var(--tenant-primary-50))] dark:bg-[hsl(var(--tenant-primary-900)_/_0.3)] hover:bg-[hsl(var(--tenant-primary-100))] dark:hover:bg-[hsl(var(--tenant-primary-900)_/_0.5)]',
    cardDesktopBtnClasses: 'bg-[hsl(var(--tenant-primary-600))] hover:bg-[hsl(var(--tenant-primary-700))] dark:bg-[hsl(var(--tenant-primary-500))] dark:hover:bg-[hsl(var(--tenant-primary-600))] text-white',
    cardFallbackGradient: 'bg-gradient-to-br from-[hsl(var(--tenant-primary-50))] to-[hsl(var(--tenant-secondary-50))] dark:from-[hsl(var(--tenant-primary-900)_/_0.3)] dark:to-[hsl(var(--tenant-secondary-900)_/_0.3)]',
    cardFallbackLetterClasses: 'bg-gradient-to-br from-[hsl(var(--tenant-primary-500))] to-[hsl(var(--tenant-secondary-500))] bg-clip-text text-transparent',
    modalFallbackGradient: 'bg-gradient-to-br from-[hsl(var(--tenant-primary-500))] via-[hsl(var(--tenant-secondary-500))] to-[hsl(var(--tenant-secondary-500))]',
    modalCtaBtnClasses: 'bg-[hsl(var(--tenant-primary-600))] hover:bg-[hsl(var(--tenant-primary-700))] dark:bg-[hsl(var(--tenant-primary-500))] dark:hover:bg-[hsl(var(--tenant-primary-600))] text-white shadow-lg shadow-[hsl(var(--tenant-primary-500)_/_0.25)]',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // BOLD — Dark, angular, urban
  // ═══════════════════════════════════════════════════════════════════════
  bold: {
    heroBg: 'bg-gradient-to-br from-neutral-900 via-neutral-800 to-zinc-900',
    heroPattern: PATTERN_GEOMETRIC,
    heroDecorativeBlobs: [
      'bg-[hsl(var(--tenant-primary-500)_/_0.2)]',
      'bg-[hsl(var(--tenant-secondary-500)_/_0.15)]',
    ],
    heroLayout: 'left',
    heroPadding: 'py-4 lg:py-6',
    logoRadius: 'rounded-sm',
    logoFallbackGradient: 'bg-gradient-to-br from-[hsl(var(--tenant-primary-500))] to-[hsl(var(--tenant-secondary-600))]',
    heroTextColor: 'light',
    nameWeight: 'font-black',
    nameTracking: 'tracking-tight',
    descriptionOpacity: 'text-white/70',
    onlineBadgeClasses: 'bg-[hsl(var(--tenant-primary-500)_/_0.2)] text-[hsl(var(--tenant-primary-300))] border-[hsl(var(--tenant-primary-500)_/_0.3)]',
    contactBtnClasses: 'bg-white/10 backdrop-blur rounded-sm hover:bg-white/20 transition-colors',
    contactIconColors: ['text-[hsl(var(--tenant-primary-400))]', 'text-[hsl(var(--tenant-accent-400))]', 'text-[hsl(var(--tenant-secondary-400))]'],
    trustBadgeStyle: 'dark-rect',
    trustBadgeTextClasses: 'text-white/80',
    statsBoxClasses: 'bg-white/10 backdrop-blur rounded-lg',
    cardRadius: 'rounded-lg',
    cardBorder: 'hover:border-[hsl(var(--tenant-primary-400))] dark:hover:border-[hsl(var(--tenant-primary-500)_/_0.5)]',
    cardHoverEffect: 'hover:-translate-y-1',
    cardCtaClasses: 'text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))] bg-[hsl(var(--tenant-primary-50))] dark:bg-[hsl(var(--tenant-primary-900)_/_0.3)] hover:bg-[hsl(var(--tenant-primary-100))] dark:hover:bg-[hsl(var(--tenant-primary-900)_/_0.5)]',
    cardDesktopBtnClasses: 'bg-[hsl(var(--tenant-primary-500))] hover:bg-[hsl(var(--tenant-primary-600))] text-black font-bold',
    cardFallbackGradient: 'bg-gradient-to-br from-[hsl(var(--tenant-primary-100))] to-[hsl(var(--tenant-secondary-100))] dark:from-[hsl(var(--tenant-primary-900)_/_0.3)] dark:to-[hsl(var(--tenant-secondary-900)_/_0.3)]',
    cardFallbackLetterClasses: 'bg-gradient-to-br from-[hsl(var(--tenant-primary-500))] to-[hsl(var(--tenant-secondary-500))] bg-clip-text text-transparent',
    modalFallbackGradient: 'bg-gradient-to-br from-neutral-800 via-zinc-700 to-neutral-900',
    modalCtaBtnClasses: 'bg-[hsl(var(--tenant-primary-500))] hover:bg-[hsl(var(--tenant-primary-600))] text-black font-bold shadow-lg shadow-[hsl(var(--tenant-primary-500)_/_0.25)]',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ZEN — Centered, soft, spacious
  // ═══════════════════════════════════════════════════════════════════════
  zen: {
    heroBg: 'bg-gradient-to-b from-[hsl(var(--tenant-primary-50))] via-[hsl(var(--tenant-secondary-50))] to-[hsl(var(--tenant-accent-50))]',
    heroPattern: PATTERN_WAVE,
    heroDecorativeBlobs: [
      'bg-[hsl(var(--tenant-primary-200)_/_0.3)]',
      'bg-[hsl(var(--tenant-secondary-200)_/_0.3)]',
    ],
    heroLayout: 'center',
    heroPadding: 'py-8 lg:py-10',
    logoRadius: 'rounded-full',
    logoFallbackGradient: 'bg-gradient-to-br from-[hsl(var(--tenant-primary-400))] to-[hsl(var(--tenant-secondary-500))]',
    heroTextColor: 'dark',
    nameWeight: 'font-medium',
    nameTracking: 'tracking-wide',
    descriptionOpacity: 'text-slate-500',
    onlineBadgeClasses: 'bg-[hsl(var(--tenant-primary-100))] text-[hsl(var(--tenant-primary-700))] border-[hsl(var(--tenant-primary-200))]',
    contactBtnClasses: 'bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors shadow-sm',
    contactIconColors: ['text-[hsl(var(--tenant-primary-500))]', 'text-[hsl(var(--tenant-secondary-500))]', 'text-[hsl(var(--tenant-accent-500))]'],
    trustBadgeStyle: 'minimal-dots',
    trustBadgeTextClasses: 'text-slate-500',
    statsBoxClasses: 'bg-white/80 backdrop-blur border border-[hsl(var(--tenant-primary-100))] rounded-full',
    cardRadius: 'rounded-2xl',
    cardBorder: 'hover:border-[hsl(var(--tenant-primary-300))] dark:hover:border-[hsl(var(--tenant-primary-600)_/_0.5)]',
    cardHoverEffect: 'hover:scale-[1.02]',
    cardCtaClasses: 'text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))] bg-[hsl(var(--tenant-primary-50))] dark:bg-[hsl(var(--tenant-primary-900)_/_0.3)] hover:bg-[hsl(var(--tenant-primary-100))] dark:hover:bg-[hsl(var(--tenant-primary-900)_/_0.5)]',
    cardDesktopBtnClasses: 'bg-[hsl(var(--tenant-primary-600))] hover:bg-[hsl(var(--tenant-primary-700))] dark:bg-[hsl(var(--tenant-primary-500))] dark:hover:bg-[hsl(var(--tenant-primary-600))] text-white',
    cardFallbackGradient: 'bg-gradient-to-br from-[hsl(var(--tenant-primary-50))] to-[hsl(var(--tenant-secondary-50))] dark:from-[hsl(var(--tenant-primary-900)_/_0.3)] dark:to-[hsl(var(--tenant-secondary-900)_/_0.3)]',
    cardFallbackLetterClasses: 'bg-gradient-to-br from-[hsl(var(--tenant-primary-500))] to-[hsl(var(--tenant-secondary-500))] bg-clip-text text-transparent',
    modalFallbackGradient: 'bg-gradient-to-br from-[hsl(var(--tenant-primary-400))] via-[hsl(var(--tenant-secondary-400))] to-[hsl(var(--tenant-accent-400))]',
    modalCtaBtnClasses: 'bg-[hsl(var(--tenant-primary-600))] hover:bg-[hsl(var(--tenant-primary-700))] dark:bg-[hsl(var(--tenant-primary-500))] dark:hover:bg-[hsl(var(--tenant-primary-600))] text-white shadow-lg shadow-[hsl(var(--tenant-primary-500)_/_0.25)]',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CORPORATE — Compact side-by-side, solid bg, professional
  // ═══════════════════════════════════════════════════════════════════════
  corporate: {
    heroBg: 'bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800',
    heroPattern: null,
    heroDecorativeBlobs: [
      'bg-[hsl(var(--tenant-primary-400)_/_0.1)]',
      'bg-[hsl(var(--tenant-secondary-400)_/_0.1)]',
    ],
    heroLayout: 'side-by-side',
    heroPadding: 'py-3 lg:py-4',
    logoRadius: 'rounded-md',
    logoFallbackGradient: 'bg-gradient-to-br from-[hsl(var(--tenant-primary-600))] to-[hsl(var(--tenant-secondary-600))]',
    heroTextColor: 'light',
    nameWeight: 'font-bold',
    nameTracking: 'tracking-tight',
    descriptionOpacity: 'text-white/70',
    onlineBadgeClasses: 'bg-[hsl(var(--tenant-primary-500)_/_0.2)] text-[hsl(var(--tenant-primary-200))] border-[hsl(var(--tenant-primary-400)_/_0.3)]',
    contactBtnClasses: 'bg-white/10 backdrop-blur rounded-md hover:bg-white/20 transition-colors',
    contactIconColors: ['text-[hsl(var(--tenant-primary-300))]', 'text-[hsl(var(--tenant-accent-300))]', 'text-[hsl(var(--tenant-secondary-300))]'],
    trustBadgeStyle: 'checks',
    trustBadgeTextClasses: 'text-white/70',
    statsBoxClasses: 'bg-white/10 backdrop-blur rounded-lg',
    cardRadius: 'rounded-xl',
    cardBorder: 'hover:border-[hsl(var(--tenant-primary-300))] dark:hover:border-[hsl(var(--tenant-primary-600)_/_0.5)]',
    cardHoverEffect: 'hover:-translate-y-1',
    cardCtaClasses: 'text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))] bg-[hsl(var(--tenant-primary-50))] dark:bg-[hsl(var(--tenant-primary-900)_/_0.3)] hover:bg-[hsl(var(--tenant-primary-100))] dark:hover:bg-[hsl(var(--tenant-primary-900)_/_0.5)]',
    cardDesktopBtnClasses: 'bg-[hsl(var(--tenant-primary-600))] hover:bg-[hsl(var(--tenant-primary-700))] dark:bg-[hsl(var(--tenant-primary-500))] dark:hover:bg-[hsl(var(--tenant-primary-600))] text-white',
    cardFallbackGradient: 'bg-gradient-to-br from-[hsl(var(--tenant-primary-50))] to-[hsl(var(--tenant-secondary-50))] dark:from-[hsl(var(--tenant-primary-900)_/_0.3)] dark:to-[hsl(var(--tenant-secondary-900)_/_0.3)]',
    cardFallbackLetterClasses: 'bg-gradient-to-br from-[hsl(var(--tenant-primary-500))] to-[hsl(var(--tenant-secondary-500))] bg-clip-text text-transparent',
    modalFallbackGradient: 'bg-gradient-to-br from-slate-700 via-[hsl(var(--tenant-primary-700))] to-[hsl(var(--tenant-secondary-700))]',
    modalCtaBtnClasses: 'bg-[hsl(var(--tenant-primary-600))] hover:bg-[hsl(var(--tenant-primary-700))] dark:bg-[hsl(var(--tenant-primary-500))] dark:hover:bg-[hsl(var(--tenant-primary-600))] text-white shadow-lg shadow-[hsl(var(--tenant-primary-500)_/_0.25)]',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ENERGETIC — Diagonal gradient, bold, triangles
  // ═══════════════════════════════════════════════════════════════════════
  energetic: {
    heroBg: 'bg-gradient-to-br from-[hsl(var(--tenant-secondary-600))] via-[hsl(var(--tenant-primary-500))] to-[hsl(var(--tenant-accent-500))]',
    heroPattern: PATTERN_TRIANGLES,
    heroDecorativeBlobs: [
      'bg-[hsl(var(--tenant-accent-300)_/_0.3)]',
      'bg-[hsl(var(--tenant-secondary-300)_/_0.2)]',
    ],
    heroLayout: 'left',
    heroPadding: 'py-4 lg:py-6',
    logoRadius: 'rounded-xl',
    logoFallbackGradient: 'bg-gradient-to-br from-[hsl(var(--tenant-secondary-500))] to-[hsl(var(--tenant-primary-500))]',
    heroTextColor: 'light',
    nameWeight: 'font-black',
    nameTracking: 'tracking-tight',
    descriptionOpacity: 'text-white/80',
    onlineBadgeClasses: 'bg-[hsl(var(--tenant-accent-500)_/_0.2)] text-[hsl(var(--tenant-accent-200))] border-[hsl(var(--tenant-accent-400)_/_0.3)]',
    contactBtnClasses: 'bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-colors',
    contactIconColors: ['text-[hsl(var(--tenant-accent-300))]', 'text-[hsl(var(--tenant-accent-300))]', 'text-[hsl(var(--tenant-primary-300))]'],
    trustBadgeStyle: 'bold-separators',
    trustBadgeTextClasses: 'text-white/90',
    statsBoxClasses: 'bg-white/10 backdrop-blur rounded-2xl',
    cardRadius: 'rounded-xl',
    cardBorder: 'hover:border-[hsl(var(--tenant-primary-300))] dark:hover:border-[hsl(var(--tenant-primary-500)_/_0.5)]',
    cardHoverEffect: 'hover:-translate-y-1',
    cardCtaClasses: 'text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))] bg-[hsl(var(--tenant-primary-50))] dark:bg-[hsl(var(--tenant-primary-900)_/_0.3)] hover:bg-[hsl(var(--tenant-primary-100))] dark:hover:bg-[hsl(var(--tenant-primary-900)_/_0.5)]',
    cardDesktopBtnClasses: 'bg-[hsl(var(--tenant-primary-600))] hover:bg-[hsl(var(--tenant-primary-700))] dark:bg-[hsl(var(--tenant-primary-500))] dark:hover:bg-[hsl(var(--tenant-primary-600))] text-white font-bold',
    cardFallbackGradient: 'bg-gradient-to-br from-[hsl(var(--tenant-primary-50))] to-[hsl(var(--tenant-accent-50))] dark:from-[hsl(var(--tenant-primary-900)_/_0.3)] dark:to-[hsl(var(--tenant-accent-900)_/_0.3)]',
    cardFallbackLetterClasses: 'bg-gradient-to-br from-[hsl(var(--tenant-primary-500))] to-[hsl(var(--tenant-secondary-500))] bg-clip-text text-transparent',
    modalFallbackGradient: 'bg-gradient-to-br from-[hsl(var(--tenant-secondary-500))] via-[hsl(var(--tenant-primary-500))] to-[hsl(var(--tenant-accent-500))]',
    modalCtaBtnClasses: 'bg-[hsl(var(--tenant-primary-600))] hover:bg-[hsl(var(--tenant-primary-700))] dark:bg-[hsl(var(--tenant-primary-500))] dark:hover:bg-[hsl(var(--tenant-primary-600))] text-white font-bold shadow-lg shadow-[hsl(var(--tenant-primary-500)_/_0.25)]',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // WARM — Amber → rose gradient, cozy, rounded
  // ═══════════════════════════════════════════════════════════════════════
  warm: {
    heroBg: 'bg-gradient-to-br from-[hsl(var(--tenant-primary-50))] via-[hsl(var(--tenant-primary-50))] to-[hsl(var(--tenant-secondary-50))]',
    heroPattern: null,
    heroDecorativeBlobs: [
      'bg-[hsl(var(--tenant-primary-200)_/_0.4)]',
      'bg-[hsl(var(--tenant-secondary-200)_/_0.3)]',
    ],
    heroLayout: 'left',
    heroPadding: 'py-4 lg:py-6',
    logoRadius: 'rounded-2xl',
    logoFallbackGradient: 'bg-gradient-to-br from-[hsl(var(--tenant-primary-500))] to-[hsl(var(--tenant-secondary-500))]',
    heroTextColor: 'dark',
    nameWeight: 'font-bold',
    nameTracking: 'tracking-normal',
    descriptionOpacity: 'text-slate-600',
    onlineBadgeClasses: 'bg-[hsl(var(--tenant-primary-100))] text-[hsl(var(--tenant-primary-700))] border-[hsl(var(--tenant-primary-200))]',
    contactBtnClasses: 'bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors shadow-sm',
    contactIconColors: ['text-[hsl(var(--tenant-primary-600))]', 'text-[hsl(var(--tenant-accent-600))]', 'text-[hsl(var(--tenant-secondary-500))]'],
    trustBadgeStyle: 'warm-box',
    trustBadgeIconBoxClasses: [
      'bg-[hsl(var(--tenant-primary-100))]',
      'bg-[hsl(var(--tenant-accent-100))]',
      'bg-[hsl(var(--tenant-secondary-100))]',
    ],
    trustBadgeTextClasses: 'text-slate-600',
    statsBoxClasses: 'bg-white/80 backdrop-blur border border-[hsl(var(--tenant-primary-100))] rounded-2xl shadow-sm',
    cardRadius: 'rounded-2xl',
    cardBorder: 'hover:border-[hsl(var(--tenant-primary-300))] dark:hover:border-[hsl(var(--tenant-primary-500)_/_0.5)]',
    cardHoverEffect: 'hover:-translate-y-1',
    cardCtaClasses: 'text-[hsl(var(--tenant-primary-700))] dark:text-[hsl(var(--tenant-primary-400))] bg-[hsl(var(--tenant-primary-50))] dark:bg-[hsl(var(--tenant-primary-900)_/_0.3)] hover:bg-[hsl(var(--tenant-primary-100))] dark:hover:bg-[hsl(var(--tenant-primary-900)_/_0.5)]',
    cardDesktopBtnClasses: 'bg-[hsl(var(--tenant-primary-600))] hover:bg-[hsl(var(--tenant-primary-700))] dark:bg-[hsl(var(--tenant-primary-500))] dark:hover:bg-[hsl(var(--tenant-primary-600))] text-white',
    cardFallbackGradient: 'bg-gradient-to-br from-[hsl(var(--tenant-primary-50))] to-[hsl(var(--tenant-secondary-50))] dark:from-[hsl(var(--tenant-primary-900)_/_0.3)] dark:to-[hsl(var(--tenant-secondary-900)_/_0.3)]',
    cardFallbackLetterClasses: 'bg-gradient-to-br from-[hsl(var(--tenant-primary-500))] to-[hsl(var(--tenant-secondary-500))] bg-clip-text text-transparent',
    modalFallbackGradient: 'bg-gradient-to-br from-[hsl(var(--tenant-primary-400))] via-[hsl(var(--tenant-primary-400))] to-[hsl(var(--tenant-secondary-400))]',
    modalCtaBtnClasses: 'bg-[hsl(var(--tenant-primary-600))] hover:bg-[hsl(var(--tenant-primary-700))] dark:bg-[hsl(var(--tenant-primary-500))] dark:hover:bg-[hsl(var(--tenant-primary-600))] text-white shadow-lg shadow-[hsl(var(--tenant-primary-500)_/_0.25)]',
  },
};
