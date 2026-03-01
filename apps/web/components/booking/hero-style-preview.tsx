'use client';

import { cn } from '@/lib/utils';
import { HeroStyleName, HERO_STYLES, HERO_STYLE_DEFAULT_COLORS } from '@/lib/hero-styles';
import { generateColorVariations } from '@/components/booking/public-theme-wrapper';
import { getContrastTextColor } from '@/lib/color-contrast';

interface Props {
  style: HeroStyleName;
  selected: boolean;
  onClick: () => void;
  label: string;
  description?: string;
}

// Descriptive feature tags per style
const STYLE_FEATURES: Record<HeroStyleName, { label: string; color: string }[]> = {
  classic: [
    { label: 'Alineado izq.', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    { label: 'Degradado', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
    { label: 'Patrón ✕', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  ],
  clinical: [
    { label: 'Alineado izq.', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    { label: 'Fondo claro', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-300' },
    { label: 'Minimalista', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
  ],
  bold: [
    { label: 'Alineado izq.', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    { label: 'Fondo oscuro', color: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300' },
    { label: 'Angular', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  ],
  zen: [
    { label: 'Centrado', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
    { label: 'Pastel', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
    { label: 'Ondas', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  ],
  corporate: [
    { label: 'Lado a lado', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
    { label: 'Fondo oscuro', color: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300' },
    { label: 'Compacto', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  ],
  energetic: [
    { label: 'Alineado izq.', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    { label: 'Vibrante', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
    { label: 'Triángulos', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  ],
  warm: [
    { label: 'Alineado izq.', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    { label: 'Fondo cálido', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
    { label: 'Suave', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
  ],
};

function buildPreviewVars(style: HeroStyleName): React.CSSProperties {
  const colors = HERO_STYLE_DEFAULT_COLORS[style];
  const vars: Record<string, string> = {};

  const families = [
    { prefix: '--tenant-primary', hex: colors.primary },
    { prefix: '--tenant-secondary', hex: colors.secondary },
    { prefix: '--tenant-accent', hex: colors.accent },
  ];

  for (const { prefix, hex } of families) {
    const variations = generateColorVariations(hex);
    for (const [key, value] of Object.entries(variations)) {
      vars[`${prefix}-${key}`] = value;
    }
  }

  return vars as unknown as React.CSSProperties;
}

export function HeroStylePreview({ style, selected, onClick, label, description }: Props) {
  const cfg = HERO_STYLES[style];
  const previewVars = buildPreviewVars(style);
  const features = STYLE_FEATURES[style];

  const fixedBg = { bold: 'light', corporate: 'light', clinical: 'dark', zen: 'dark', warm: 'dark' } as Record<string, string>;
  const contrastMode = fixedBg[style]
    ? fixedBg[style]
    : getContrastTextColor(HERO_STYLE_DEFAULT_COLORS[style].primary);
  const isLight = contrastMode === 'dark';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative w-full rounded-xl overflow-hidden border-2 transition-all text-left',
        selected
          ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-md'
          : 'border-neutral-200 dark:border-neutral-700 hover:border-primary/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:shadow-sm'
      )}
    >
      {/* ── Miniature hero preview (taller, more detail) ── */}
      <div className={cn('relative h-[140px] overflow-hidden', cfg.heroBg)} style={previewVars}>
        {/* Pattern overlay */}
        {cfg.heroPattern && <div className={cn('absolute inset-0', cfg.heroPattern)} />}

        {/* Decorative blobs */}
        <div className={cn('absolute -top-8 -right-8 w-20 h-20 rounded-full blur-2xl', cfg.heroDecorativeBlobs[0])} />
        <div className={cn('absolute -bottom-8 -left-8 w-20 h-20 rounded-full blur-2xl', cfg.heroDecorativeBlobs[1])} />

        {/* ── Layout preview ── */}
        <div className={cn(
          'relative flex gap-2 p-3 h-full',
          cfg.heroLayout === 'center' && 'flex-col items-center justify-center text-center',
          cfg.heroLayout === 'left' && 'items-start',
          cfg.heroLayout === 'side-by-side' && 'items-center'
        )}>
          {/* Logo placeholder */}
          <div className={cn(
            'flex-shrink-0 flex items-center justify-center shadow-md',
            cfg.heroLayout === 'center' ? 'w-11 h-11' : 'w-9 h-9',
            cfg.logoRadius,
            cfg.logoFallbackGradient,
          )}>
            <span className="text-xs font-bold text-white">T</span>
          </div>

          {/* Content block */}
          <div className={cn(
            'flex flex-col gap-1 flex-1 min-w-0',
            cfg.heroLayout === 'center' && 'items-center'
          )}>
            {/* Name: show weight/tracking visually */}
            <div className={cn(
              'h-2.5 rounded-full',
              cfg.heroLayout === 'center' ? 'w-20' : 'w-24',
              cfg.nameWeight === 'font-black' ? (isLight ? 'bg-slate-900/80' : 'bg-white/90') :
              cfg.nameWeight === 'font-bold' ? (isLight ? 'bg-slate-800/70' : 'bg-white/80') :
              (isLight ? 'bg-slate-700/50' : 'bg-white/60')
            )} />

            {/* Description */}
            <div className={cn(
              'h-1.5 rounded-full',
              cfg.heroLayout === 'center' ? 'w-14' : 'w-16',
              isLight ? 'bg-slate-500/35' : 'bg-white/35'
            )} />

            {/* Contact buttons row */}
            <div className={cn(
              'flex gap-1 mt-1',
              cfg.heroLayout === 'center' && 'justify-center'
            )}>
              {[0, 1, 2].map(i => {
                const isSquarish = cfg.contactBtnClasses.includes('rounded-sm');
                const isMedium = cfg.contactBtnClasses.includes('rounded-md');
                return (
                  <div
                    key={i}
                    className={cn(
                      'w-5 h-5 flex items-center justify-center',
                      isSquarish ? 'rounded-sm' : isMedium ? 'rounded-md' : 'rounded-full',
                      isLight ? 'bg-slate-200/50' : 'bg-white/15'
                    )}
                  >
                    <div className={cn(
                      'w-[5px] h-[5px] rounded-full',
                      i === 0 ? (isLight ? 'bg-blue-500/60' : 'bg-blue-300/60') :
                      i === 1 ? (isLight ? 'bg-emerald-500/60' : 'bg-emerald-300/60') :
                      (isLight ? 'bg-pink-500/60' : 'bg-pink-300/60')
                    )} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side stats box (corporate side-by-side) */}
          {cfg.heroLayout === 'side-by-side' && (
            <div className={cn('w-14 h-14 flex-shrink-0 flex flex-col items-center justify-center gap-0.5', cfg.statsBoxClasses)}>
              <span className={cn('text-[9px] font-bold', isLight ? 'text-slate-700' : 'text-white/90')}>4.8</span>
              <div className="flex gap-px">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400/70" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Trust badges row ── */}
        <div className={cn(
          'absolute bottom-1.5 left-2.5 right-2.5 flex gap-1',
          cfg.heroLayout === 'center' && 'justify-center'
        )}>
          {cfg.trustBadgeStyle === 'icon-box' && [0,1,2].map(i => (
            <div key={i} className={cn(
              'w-7 h-4 rounded flex items-center justify-center',
              cfg.trustBadgeIconBoxClasses?.[i] || (isLight ? 'bg-slate-200/50' : 'bg-white/10')
            )}>
              <div className={cn('w-2 h-2 rounded-sm', isLight ? 'bg-slate-500/40' : 'bg-white/30')} />
            </div>
          ))}
          {cfg.trustBadgeStyle === 'checks' && [0,1,2].map(i => (
            <div key={i} className="flex items-center gap-0.5">
              <div className={cn('w-2 h-2 rounded-full', isLight ? 'bg-emerald-500/50' : 'bg-emerald-400/40')} />
              <div className={cn('w-5 h-1 rounded-full', isLight ? 'bg-slate-400/30' : 'bg-white/15')} />
            </div>
          ))}
          {cfg.trustBadgeStyle === 'dark-rect' && [0,1,2].map(i => (
            <div key={i} className="flex items-center gap-0.5 bg-white/10 rounded-sm px-1 py-0.5">
              <div className="w-1.5 h-1.5 rounded-sm bg-white/30" />
              <div className="w-4 h-1 rounded-full bg-white/20" />
            </div>
          ))}
          {cfg.trustBadgeStyle === 'minimal-dots' && [0,1,2].map(i => (
            <div key={i} className="flex items-center gap-0.5">
              <div className={cn('w-1 h-1 rounded-full', isLight ? 'bg-slate-400/50' : 'bg-white/30')} />
              <div className={cn('w-5 h-1 rounded-full', isLight ? 'bg-slate-400/25' : 'bg-white/15')} />
            </div>
          ))}
          {cfg.trustBadgeStyle === 'bold-separators' && [0,1,2].map(i => (
            <div key={i} className="flex items-center gap-1">
              {i > 0 && <div className="w-px h-3 bg-white/20" />}
              <div className="w-5 h-1 rounded-full bg-white/25" />
            </div>
          ))}
          {cfg.trustBadgeStyle === 'warm-box' && [0,1,2].map(i => (
            <div key={i} className={cn(
              'w-7 h-4 rounded-md flex items-center justify-center',
              cfg.trustBadgeIconBoxClasses?.[i] || (isLight ? 'bg-amber-100/60' : 'bg-white/10')
            )}>
              <div className={cn('w-2 h-2 rounded-full', isLight ? 'bg-amber-500/40' : 'bg-white/30')} />
            </div>
          ))}
        </div>

        {/* Selected check */}
        {selected && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg z-10">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* ── Info section with feature tags ── */}
      <div className="p-3 space-y-2">
        <div className="space-y-0.5">
          <span className={cn(
            'font-medium text-sm block',
            selected ? 'text-primary' : 'text-neutral-900 dark:text-neutral-100'
          )}>
            {label}
          </span>
          {description && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {description}
            </p>
          )}
        </div>

        {/* Feature tags */}
        <div className="flex flex-wrap gap-1">
          {features.map((f, i) => (
            <span
              key={i}
              className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium leading-tight', f.color)}
            >
              {f.label}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
