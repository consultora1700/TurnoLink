'use client';

import { useId } from 'react';
import { CATEGORY_MAP } from '@/lib/category-config';
import { cn } from '@/lib/utils';

// ─── 3D Gradient Color Palettes per Category ────────────────────────────────
const ICON_PALETTES: Record<string, { from: string; to: string; shadow: string; glow: string }> = {
  'estetica-belleza': { from: '#ec4899', to: '#be185d', shadow: '#9d174d', glow: '#f9a8d4' },
  'barberia':         { from: '#f97316', to: '#c2410c', shadow: '#9a3412', glow: '#fdba74' },
  'masajes-spa':      { from: '#38bdf8', to: '#0284c7', shadow: '#075985', glow: '#7dd3fc' },
  'salud':            { from: '#2dd4bf', to: '#0d9488', shadow: '#115e59', glow: '#5eead4' },
  'odontologia':      { from: '#60a5fa', to: '#2563eb', shadow: '#1e3a8a', glow: '#93c5fd' },
  'psicologia':       { from: '#a78bfa', to: '#7c3aed', shadow: '#4c1d95', glow: '#c4b5fd' },
  'nutricion':        { from: '#4ade80', to: '#16a34a', shadow: '#14532d', glow: '#86efac' },
  'fitness':          { from: '#f87171', to: '#dc2626', shadow: '#7f1d1d', glow: '#fca5a5' },
  'veterinaria':      { from: '#fbbf24', to: '#d97706', shadow: '#78350f', glow: '#fde68a' },
  'tatuajes-piercing':{ from: '#fb7185', to: '#e11d48', shadow: '#881337', glow: '#fda4af' },
  'educacion':        { from: '#818cf8', to: '#4f46e5', shadow: '#312e81', glow: '#a5b4fc' },
  'consultoria':      { from: '#94a3b8', to: '#475569', shadow: '#1e293b', glow: '#cbd5e1' },
};

// ─── Custom SVG Icon Paths (each designed at viewBox 0 0 24 24) ─────────────
// Carefully crafted silhouettes — recognizable at 20px+

function IconBelleza() {
  return (
    <g>
      {/* Scissors blades */}
      <circle cx="9" cy="7" r="2.5" fill="none" stroke="white" strokeWidth="1.5" />
      <circle cx="15" cy="7" r="2.5" fill="none" stroke="white" strokeWidth="1.5" />
      <path d="M9 9.5L15 17M15 9.5L9 17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      {/* Sparkle */}
      <path d="M19 4l.5 1.5L21 6l-1.5.5L19 8l-.5-1.5L17 6l1.5-.5z" fill="white" opacity="0.7" />
    </g>
  );
}

function IconBarberia() {
  return (
    <g>
      {/* Barber pole */}
      <rect x="9" y="4" width="6" height="16" rx="3" fill="none" stroke="white" strokeWidth="1.5" />
      {/* Diagonal stripes */}
      <path d="M9 8l6-3M9 12l6-3M9 16l6-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
      {/* Top ball */}
      <circle cx="12" cy="4" r="1.2" fill="white" />
      {/* Bottom ball */}
      <circle cx="12" cy="20" r="1.2" fill="white" />
    </g>
  );
}

function IconSpa() {
  return (
    <g>
      {/* Lotus flower - 5 petals */}
      <path d="M12 6C12 6 9 10 9 13c0 1.5 1.3 3 3 3s3-1.5 3-3c0-3-3-7-3-7z" fill="white" opacity="0.9" />
      <path d="M7.5 9C7.5 9 6 12.5 7 14.5c.7 1.4 2.5 1.5 3.5.5C11 14.5 9.5 10 7.5 9z" fill="white" opacity="0.6" />
      <path d="M16.5 9C16.5 9 18 12.5 17 14.5c-.7 1.4-2.5 1.5-3.5.5C13 14.5 14.5 10 16.5 9z" fill="white" opacity="0.6" />
      {/* Base leaves */}
      <path d="M8 17c1.5 1.5 3 2 4 2s2.5-.5 4-2" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M10 19c.5.8 1.2 1 2 1s1.5-.2 2-1" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" />
    </g>
  );
}

function IconSalud() {
  return (
    <g>
      {/* Heart */}
      <path d="M12 20S5 14.5 5 10c0-2.5 2-4.5 4-4.5 1.2 0 2.3.6 3 1.5.7-.9 1.8-1.5 3-1.5 2 0 4 2 4 4.5 0 4.5-7 10-7 10z" fill="white" opacity="0.3" />
      {/* Pulse line across heart */}
      <polyline points="4,13 8,13 9.5,9 11,16 12.5,11 14,13 20,13" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function IconOdontologia() {
  return (
    <g>
      {/* Tooth shape */}
      <path
        d="M8.5 5C7 5 5.5 6.5 5.5 8.5c0 2.5 1.5 4 2 7 .3 2 .8 3.5 1.5 3.5s1-1 1.2-2.5c.1-.8.5-1.5 1.8-1.5s1.7.7 1.8 1.5c.2 1.5.5 2.5 1.2 2.5s1.2-1.5 1.5-3.5c.5-3 2-4.5 2-7 0-2-1.5-3.5-3-3.5-.8 0-1.5.3-2 .8-.3.3-.6.4-1 .4s-.7-.1-1-.4c-.5-.5-1.2-.8-2-.8z"
        fill="white"
        opacity="0.9"
      />
      {/* Shine on tooth */}
      <path d="M9 8c0-1 .5-1.5 1-1.5" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </g>
  );
}

function IconPsicologia() {
  return (
    <g>
      {/* Head profile */}
      <path d="M15 19v-2a3 3 0 0 0-3-3h0a3 3 0 0 1-3-3V9a5 5 0 0 1 9-3" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      {/* Brain folds */}
      <path d="M13 6c1.5 0 3 .5 3.5 2s-.5 3-1 3.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M15.5 8c1 .5 1.5 1.5 1 3" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* Thought bubbles */}
      <circle cx="18" cy="5" r="1.5" fill="white" opacity="0.5" />
      <circle cx="20" cy="3.5" r="0.8" fill="white" opacity="0.4" />
    </g>
  );
}

function IconNutricion() {
  return (
    <g>
      {/* Apple body */}
      <path
        d="M12 20c-3.5 0-6-3-6-6.5C6 10 8.5 7 12 7s6 3 6 6.5c0 3.5-2.5 6.5-6 6.5z"
        fill="white"
        opacity="0.85"
      />
      {/* Apple indent */}
      <path d="M10 7.5c.8-1 1.5-1.5 2-1.5s1.2.5 2 1.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      {/* Leaf */}
      <path d="M12 6C12 4.5 13.5 3 15 3c0 1.5-1.5 3-3 3z" fill="white" opacity="0.7" />
      {/* Stem */}
      <line x1="12" y1="7" x2="12" y2="4.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      {/* Shine */}
      <path d="M8.5 11c0-1.5 1-2.5 2-2.5" stroke="white" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
    </g>
  );
}

function IconFitness() {
  return (
    <g>
      {/* Dumbbell */}
      {/* Left weight */}
      <rect x="3" y="8" width="3.5" height="8" rx="1" fill="white" opacity="0.85" />
      <rect x="5" y="6.5" width="2" height="11" rx="0.8" fill="white" opacity="0.65" />
      {/* Right weight */}
      <rect x="17.5" y="8" width="3.5" height="8" rx="1" fill="white" opacity="0.85" />
      <rect x="17" y="6.5" width="2" height="11" rx="0.8" fill="white" opacity="0.65" />
      {/* Bar */}
      <rect x="7" y="10.5" width="10" height="3" rx="1.5" fill="white" opacity="0.9" />
    </g>
  );
}

function IconVeterinaria() {
  return (
    <g>
      {/* Main pad */}
      <ellipse cx="12" cy="15" rx="4" ry="3.5" fill="white" opacity="0.85" />
      {/* Toe pads */}
      <ellipse cx="7.5" cy="9.5" rx="2" ry="2.3" fill="white" opacity="0.75" transform="rotate(-15 7.5 9.5)" />
      <ellipse cx="16.5" cy="9.5" rx="2" ry="2.3" fill="white" opacity="0.75" transform="rotate(15 16.5 9.5)" />
      <ellipse cx="10" cy="7.5" rx="1.8" ry="2.2" fill="white" opacity="0.75" transform="rotate(-5 10 7.5)" />
      <ellipse cx="14" cy="7.5" rx="1.8" ry="2.2" fill="white" opacity="0.75" transform="rotate(5 14 7.5)" />
    </g>
  );
}

function IconTatuajes() {
  return (
    <g>
      {/* Tattoo machine body */}
      <rect x="8" y="4" width="4" height="10" rx="1.5" fill="white" opacity="0.85" transform="rotate(15 10 9)" />
      {/* Grip */}
      <rect x="8.5" y="7" width="3" height="5" rx="0.5" fill="white" opacity="0.5" transform="rotate(15 10 9.5)" />
      {/* Needle */}
      <line x1="11" y1="14" x2="13" y2="19" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      {/* Ink drops */}
      <circle cx="15" cy="18" r="1.2" fill="white" opacity="0.6" />
      <circle cx="17" cy="16" r="0.8" fill="white" opacity="0.4" />
      {/* Star decoration */}
      <path d="M17 7l.7 1.4 1.5.2-1.1 1 .3 1.5L17 10.5l-1.4.6.3-1.5-1.1-1 1.5-.2z" fill="white" opacity="0.5" />
    </g>
  );
}

function IconEducacion() {
  return (
    <g>
      {/* Cap top - diamond */}
      <polygon points="12,5 21,10 12,15 3,10" fill="white" opacity="0.85" />
      {/* Cap bottom band */}
      <path d="M6 11v4c0 2 3 3.5 6 3.5s6-1.5 6-3.5v-4" fill="none" stroke="white" strokeWidth="1.5" />
      {/* Tassel */}
      <line x1="20" y1="10" x2="20" y2="16" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="20" cy="17" r="1" fill="white" opacity="0.7" />
      {/* Tassel string */}
      <path d="M20 17c0 0-.5 1-1.5 1.5" stroke="white" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.6" />
    </g>
  );
}

function IconConsultoria() {
  return (
    <g>
      {/* Briefcase body */}
      <rect x="4" y="9" width="16" height="11" rx="2" fill="white" opacity="0.85" />
      {/* Handle */}
      <path d="M9 9V7a3 3 0 0 1 6 0v2" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      {/* Clasp/center detail */}
      <rect x="10" y="12" width="4" height="3" rx="0.5" fill="white" opacity="0.3" />
      {/* Divider line */}
      <line x1="4" y1="14" x2="20" y2="14" stroke="white" strokeWidth="0.8" opacity="0.3" />
    </g>
  );
}

// Registry of custom icon components
const ICON_COMPONENTS: Record<string, () => JSX.Element> = {
  'estetica-belleza': IconBelleza,
  'barberia': IconBarberia,
  'masajes-spa': IconSpa,
  'salud': IconSalud,
  'odontologia': IconOdontologia,
  'psicologia': IconPsicologia,
  'nutricion': IconNutricion,
  'fitness': IconFitness,
  'veterinaria': IconVeterinaria,
  'tatuajes-piercing': IconTatuajes,
  'educacion': IconEducacion,
  'consultoria': IconConsultoria,
};

// ─── 3D Category Icon Component ─────────────────────────────────────────────

interface CategoryIconProps {
  categoryKey: string;
  /** px size: 24, 32, 40, 48 */
  size?: number;
  className?: string;
}

export function CategoryIcon({ categoryKey, size = 32, className }: CategoryIconProps) {
  const palette = ICON_PALETTES[categoryKey];
  const IconComponent = ICON_COMPONENTS[categoryKey];
  if (!palette || !IconComponent) return null;

  const uid = useId();
  const id = `cat-${categoryKey}-${uid.replace(/:/g, '')}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
    >
      <defs>
        {/* Main gradient — lighter top, darker bottom for 3D depth */}
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.from} />
          <stop offset="100%" stopColor={palette.to} />
        </linearGradient>
        {/* Glow/shine gradient */}
        <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.45" />
          <stop offset="50%" stopColor="white" stopOpacity="0.05" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        {/* Drop shadow */}
        <filter id={`${id}-shadow`} x="-10%" y="-5%" width="120%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor={palette.shadow} floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Shadow layer */}
      <rect x="4" y="5" width="40" height="40" rx="12" fill={palette.shadow} opacity="0.2" />

      {/* Main background with gradient */}
      <rect x="4" y="4" width="40" height="40" rx="12" fill={`url(#${id}-bg)`} filter={`url(#${id}-shadow)`} />

      {/* Glossy shine overlay — top half */}
      <rect x="4" y="4" width="40" height="20" rx="12" fill={`url(#${id}-shine)`} />

      {/* Subtle inner border for glass effect */}
      <rect x="4.5" y="4.5" width="39" height="39" rx="11.5" fill="none" stroke="white" strokeOpacity="0.15" strokeWidth="1" />

      {/* Icon content — centered and scaled up to fill background */}
      <g transform="translate(8, 8) scale(1.33)">
        <IconComponent />
      </g>
    </svg>
  );
}

// ─── Category Chip with 3D Icon ─────────────────────────────────────────────

interface CategoryChipProps {
  categoryKey: string;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
  variant?: 'default' | 'hero';
  /** Show category-colored gradient background on the chip */
  colored?: boolean;
  className?: string;
}

export function CategoryChip({
  categoryKey,
  selected,
  onClick,
  compact,
  variant = 'default',
  colored,
  className,
}: CategoryChipProps) {
  const config = CATEGORY_MAP[categoryKey];
  if (!config) return null;

  const label = compact ? config.shortLabel : config.label;
  const palette = ICON_PALETTES[categoryKey];

  const baseClasses =
    'shrink-0 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer';

  const variantClasses =
    variant === 'hero'
      ? selected
        ? colored
          ? 'text-white shadow-lg pl-1 pr-3 py-1 sm:pl-1.5 sm:pr-3.5 sm:py-1.5 text-xs sm:text-sm backdrop-blur-sm ring-2 ring-white/60'
          : 'bg-white/95 text-gray-800 shadow-lg pl-1 pr-3 py-1 sm:pl-1.5 sm:pr-3.5 sm:py-1.5 text-xs sm:text-sm backdrop-blur-sm'
        : colored
          ? 'text-white hover:brightness-110 pl-1 pr-3 py-1 sm:pl-1.5 sm:pr-3.5 sm:py-1.5 text-xs sm:text-sm backdrop-blur-sm border border-white/15'
          : 'bg-white/10 text-white hover:bg-white/20 pl-1 pr-3 py-1 sm:pl-1.5 sm:pr-3.5 sm:py-1.5 text-xs sm:text-sm backdrop-blur-sm border border-white/10'
      : selected
      ? 'bg-primary text-primary-foreground shadow-md pl-1 pr-3 py-1 sm:pl-1.5 sm:pr-3.5 sm:py-1.5'
      : 'bg-muted hover:bg-muted/80 text-muted-foreground pl-1 pr-3 py-1 sm:pl-1.5 sm:pr-3.5 sm:py-1.5 hover:shadow-sm';

  // Colored hero uses category gradient background
  const heroStyle =
    variant === 'hero' && colored && palette
      ? {
          background: selected
            ? `linear-gradient(135deg, ${palette.from}, ${palette.to})`
            : `linear-gradient(135deg, ${palette.from}99, ${palette.to}88)`,
        }
      : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(baseClasses, variantClasses, className)}
      style={heroStyle}
    >
      <CategoryIcon categoryKey={categoryKey} size={28} />
      {label}
    </button>
  );
}
