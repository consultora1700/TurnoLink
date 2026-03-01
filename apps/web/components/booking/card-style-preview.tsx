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

// Descriptive feature tags per card style
const CARD_FEATURES: Record<HeroStyleName, { label: string; color: string }[]> = {
  classic: [
    { label: 'Bordes suaves', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
    { label: 'Hover elevación', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    { label: 'Foto lateral', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  ],
  clinical: [
    { label: 'Limpio', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
    { label: 'Foto lateral', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
    { label: 'Botón pill', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-300' },
  ],
  bold: [
    { label: 'Angular', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
    { label: 'UPPERCASE', color: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300' },
    { label: 'Overlay texto', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  ],
  zen: [
    { label: 'Centrado', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
    { label: 'Hover escala', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
    { label: 'CTA redondeado', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
  ],
  corporate: [
    { label: 'Tipo lista', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    { label: 'Compacto', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
    { label: 'Sin adornos', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-300' },
  ],
  energetic: [
    { label: 'CTA gradiente', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
    { label: 'Precio arriba', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    { label: 'Imagen + badge', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  ],
  warm: [
    { label: 'Foto circular', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
    { label: 'Botón filled', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
    { label: 'Barra lateral', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
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

export function CardStylePreview({ style, selected, onClick, label, description }: Props) {
  const cfg = HERO_STYLES[style];
  const previewVars = buildPreviewVars(style);
  const features = CARD_FEATURES[style];
  const colors = HERO_STYLE_DEFAULT_COLORS[style];

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
      {/* ── Mini service card mockup ── */}
      <div
        className="relative h-[140px] overflow-hidden bg-white dark:bg-neutral-950 p-3 flex items-center justify-center"
        style={previewVars}
      >
        {/* Subtle background tint */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900" />

        {/* The mini card itself */}
        {style === 'corporate' ? (
          <CorporateCardMock cfg={cfg} colors={colors} />
        ) : style === 'zen' ? (
          <ZenCardMock cfg={cfg} colors={colors} />
        ) : style === 'bold' ? (
          <BoldCardMock cfg={cfg} colors={colors} />
        ) : style === 'clinical' ? (
          <ClinicalCardMock cfg={cfg} colors={colors} />
        ) : style === 'energetic' ? (
          <EnergeticCardMock cfg={cfg} colors={colors} />
        ) : style === 'warm' ? (
          <WarmCardMock cfg={cfg} colors={colors} />
        ) : (
          <ClassicCardMock cfg={cfg} colors={colors} />
        )}

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

// ─── Classic card mockup ────────────────────────────────────────────────────
// Mobile layout: small photo left + info right, rounded-2xl, "Reservar →" pill button
function ClassicCardMock({ cfg, colors }: { cfg: any; colors: any }) {
  return (
    <div className="relative w-[92%] max-w-[210px] bg-white dark:bg-neutral-800 rounded-2xl shadow-md border border-slate-100 dark:border-neutral-600/60 overflow-hidden p-2">
      <div className="flex gap-2">
        {/* Thumbnail image — matches real ClassicCard mobile 108x108 */}
        <div className="relative w-[52px] h-[52px] rounded-xl overflow-hidden flex-shrink-0 shadow-sm" style={{ background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20)` }}>
          <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}15)` }}>
            <span className="text-sm font-bold" style={{ color: colors.primary }}>C</span>
          </div>
          {/* Duration badge — bottom-left over image */}
          <div className="absolute bottom-0.5 left-0.5 bg-black/60 backdrop-blur-sm rounded px-[3px] py-[1px]">
            <span className="text-[5px] font-medium text-white">30 min</span>
          </div>
        </div>
        {/* Info — right side */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="h-[6px] w-[75%] bg-slate-800/70 dark:bg-white/80 rounded-full mb-1" />
            <div className="h-[4px] w-full bg-slate-300/40 dark:bg-neutral-600/40 rounded-full" />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[8px] font-bold text-slate-900 dark:text-white">$2.500</span>
            <div className="h-[14px] px-1.5 rounded-full flex items-center gap-0.5" style={{ backgroundColor: `${colors.primary}12` }}>
              <span className="text-[6px] font-semibold" style={{ color: colors.primary }}>Reservar</span>
              <span className="text-[6px]" style={{ color: colors.primary }}>→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Clinical card mockup ───────────────────────────────────────────────────
// Mobile layout: small photo/fallback left + info right, rounded-lg, clean & minimal
function ClinicalCardMock({ cfg, colors }: { cfg: any; colors: any }) {
  return (
    <div className="relative w-[92%] max-w-[210px] bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-slate-200 dark:border-neutral-600/60 overflow-hidden p-2">
      <div className="flex gap-2">
        {/* Thumbnail — matches real ClinicalCard mobile 90x90 */}
        <div className="w-[44px] h-[44px] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.primary}12, ${colors.secondary}12)` }}>
          <span className="text-sm font-bold" style={{ color: `${colors.primary}90` }}>C</span>
        </div>
        {/* Info — right side */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="h-[6px] w-[70%] bg-slate-800/70 dark:bg-white/80 rounded-full mb-1" />
            <div className="h-[4px] w-full bg-slate-300/40 dark:bg-neutral-600/40 rounded-full" />
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300/60 dark:bg-neutral-600/60" />
              <span className="text-[5px] text-slate-400">30 min</span>
              <span className="text-[7px] font-bold" style={{ color: colors.primary }}>$2.500</span>
            </div>
            <div className="h-[14px] px-1.5 rounded-full flex items-center gap-0.5" style={{ backgroundColor: `${colors.primary}12` }}>
              <span className="text-[6px] font-medium" style={{ color: colors.primary }}>Reservar</span>
              <span className="text-[6px]" style={{ color: colors.primary }}>›</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Bold card mockup ───────────────────────────────────────────────────────
// Mobile layout: full image with gradient overlay, title+duration inside overlay, UPPERCASE, angular
function BoldCardMock({ cfg, colors }: { cfg: any; colors: any }) {
  return (
    <div className="relative w-[85%] max-w-[180px] bg-neutral-200 dark:bg-neutral-900 rounded-sm shadow-md border border-neutral-300 dark:border-neutral-700 overflow-hidden">
      {/* Image area with gradient overlay — matches real BoldCard mobile */}
      <div className="h-[68px] bg-gradient-to-br from-neutral-800 to-neutral-900 relative overflow-hidden">
        <span className="absolute inset-0 flex items-center justify-center text-2xl font-black text-white/10">C</span>
        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent pt-6 pb-1.5 px-1.5">
          <div className="flex items-end justify-between gap-1">
            <div className="space-y-0.5">
              {/* Title — UPPERCASE, white, with backdrop blur pill */}
              <div className="bg-black/25 backdrop-blur-[2px] rounded px-1 py-[1px] w-fit">
                <span className="text-[6px] font-bold text-white uppercase tracking-wide">Corte</span>
              </div>
              {/* Duration — inside overlay */}
              <div className="bg-black/25 backdrop-blur-[2px] rounded px-1 py-[1px] w-fit flex items-center gap-0.5">
                <div className="w-1 h-1 rounded-full bg-white/50" />
                <span className="text-[5px] font-medium text-white">30 min</span>
              </div>
            </div>
            {/* Price — text only, primary color */}
            <span className="text-[8px] font-black" style={{ color: colors.primary }}>$2.500</span>
          </div>
        </div>
      </div>
      {/* CTA button below image — matches real BoldCard mobile */}
      <div className="p-1.5">
        <div className="h-5 w-full rounded-sm flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
          <span className="text-[6px] font-bold uppercase tracking-wider" style={{ color: getContrastTextColor(colors.primary) === 'dark' ? '#1a1a1a' : '#ffffff' }}>RESERVAR</span>
        </div>
      </div>
    </div>
  );
}

// ─── Zen card mockup ────────────────────────────────────────────────────────
// Centered text, rounded-2xl, rounded-full CTA, spacious
function ZenCardMock({ cfg, colors }: { cfg: any; colors: any }) {
  return (
    <div className="relative w-[85%] max-w-[180px] bg-white dark:bg-neutral-800 rounded-2xl shadow-sm overflow-hidden" style={{ borderColor: `${colors.primary}50`, borderWidth: 1 }}>
      {/* Image area with centered circle placeholder */}
      <div className="h-12 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.primary}10, ${colors.secondary}10)` }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.primary}30, ${colors.secondary}30)` }}>
          <span className="text-[10px] font-medium" style={{ color: colors.primary }}>C</span>
        </div>
      </div>
      {/* Content centered */}
      <div className="p-2 text-center space-y-1">
        <div className="h-2 w-3/5 mx-auto bg-slate-700/60 dark:bg-white/70 rounded-full" />
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-[6px] text-slate-400">30 min</span>
          <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
          <span className="text-[7px] font-semibold text-slate-600 dark:text-neutral-300">$2.500</span>
        </div>
        {/* Rounded-full CTA */}
        <div className="h-5 w-full rounded-full flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
          <span className="text-[7px] font-medium text-white">Reservar</span>
        </div>
      </div>
    </div>
  );
}

// ─── Corporate card mockup ──────────────────────────────────────────────────
// List-style/row layout, compact, no frills
function CorporateCardMock({ cfg, colors }: { cfg: any; colors: any }) {
  return (
    <div className="relative w-[76%] max-w-[170px] space-y-1.5">
      {/* Row 1 */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-600/60 p-1.5 flex items-center gap-1.5">
        <div className="w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: `${colors.primary}15` }}>
          <span className="text-[7px] font-bold" style={{ color: colors.primary }}>C</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="h-1.5 w-3/4 bg-slate-700/60 dark:bg-white/70 rounded-full" />
          <div className="h-1 w-1/2 bg-slate-300/40 dark:bg-neutral-600/40 rounded-full mt-0.5" />
        </div>
        <span className="text-[6px] text-slate-400 flex-shrink-0">30m</span>
        <span className="text-[6px] font-bold text-slate-800 dark:text-white flex-shrink-0">$2.500</span>
        <div className="h-3.5 px-1 rounded-md flex items-center flex-shrink-0" style={{ backgroundColor: colors.primary }}>
          <span className="text-[5px] font-medium text-white">Reservar</span>
        </div>
      </div>
      {/* Row 2 (dimmed) */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-600/60 p-1.5 flex items-center gap-1.5 opacity-50">
        <div className="w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: `${colors.primary}15` }}>
          <span className="text-[7px] font-bold" style={{ color: colors.primary }}>S</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="h-1.5 w-2/3 bg-slate-700/60 dark:bg-white/70 rounded-full" />
          <div className="h-1 w-2/5 bg-slate-300/40 dark:bg-neutral-600/40 rounded-full mt-0.5" />
        </div>
        <span className="text-[6px] text-slate-400 flex-shrink-0">45m</span>
        <span className="text-[6px] font-bold text-slate-800 dark:text-white flex-shrink-0">$3.000</span>
        <div className="h-3.5 px-1 rounded-md flex items-center flex-shrink-0" style={{ backgroundColor: colors.primary }}>
          <span className="text-[5px] font-medium text-white">Reservar</span>
        </div>
      </div>
    </div>
  );
}

// ─── Energetic card mockup ──────────────────────────────────────────────────
// Mobile layout: image top, price badge TOP-RIGHT, title+duration below image, gradient CTA
function EnergeticCardMock({ cfg, colors }: { cfg: any; colors: any }) {
  return (
    <div className="relative w-[85%] max-w-[180px] bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-slate-100 dark:border-neutral-600/60 overflow-hidden">
      {/* Top accent line */}
      <div className="h-[2px]" style={{ background: `linear-gradient(to right, transparent, ${colors.primary}60, transparent)` }} />
      {/* Image area */}
      <div className="h-14 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}15)` }}>
        <span className="absolute inset-0 flex items-center justify-center text-2xl font-black" style={{ color: `${colors.primary}15` }}>C</span>
        {/* Price badge — TOP-RIGHT (matches real EnergeticCard mobile) */}
        <div className="absolute top-1.5 right-1.5 rounded-lg px-1 py-0.5 shadow-md" style={{ backgroundColor: colors.primary }}>
          <span className="text-[7px] font-black text-white">$2.500</span>
        </div>
      </div>
      {/* Content — title + duration on same row (matches real EnergeticCard mobile) */}
      <div className="p-2 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="h-2 w-3/5 bg-slate-800/70 dark:bg-white/80 rounded-full" />
          <div className="flex items-center gap-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300/60 dark:bg-neutral-600/60" />
            <span className="text-[5px] text-slate-500 dark:text-neutral-400">30 min</span>
          </div>
        </div>
        {/* Gradient CTA */}
        <div className="h-5 w-full rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }}>
          <span className="text-[7px] font-bold text-white tracking-wide">RESERVAR →</span>
        </div>
      </div>
    </div>
  );
}

// ─── Warm card mockup ───────────────────────────────────────────────────────
// Mobile layout: circular photo, left color bar, warm tint bg, price badge, filled CTA
function WarmCardMock({ cfg, colors }: { cfg: any; colors: any }) {
  return (
    <div
      className="relative w-[92%] max-w-[210px] rounded-2xl overflow-hidden"
      style={{
        borderColor: `${colors.primary}40`,
        borderWidth: 1,
        backgroundColor: 'white',
        boxShadow: `0 2px 12px ${colors.primary}15`,
      }}
    >
      {/* Left color bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl" style={{ backgroundColor: colors.primary }} />
      {/* Warm bg tint */}
      <div className="absolute inset-0 rounded-2xl opacity-[0.04] dark:opacity-[0.06]" style={{ backgroundColor: colors.primary }} />
      <div className="relative flex gap-2 p-2 pl-2.5">
        {/* Circular photo */}
        <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
          <div className="w-[44px] h-[44px] rounded-full overflow-hidden shadow-sm" style={{ boxShadow: `0 0 0 1.5px ${colors.primary}40` }}>
            <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}15)` }}>
              <span className="text-sm font-bold" style={{ color: colors.primary }}>C</span>
            </div>
          </div>
          {/* Duration below photo */}
          <span className="text-[5px] font-medium" style={{ color: colors.primary }}>30 min</span>
        </div>
        {/* Info — right side */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="h-[6px] w-[75%] bg-slate-800/70 dark:bg-white/80 rounded-full mb-1" />
            <div className="h-[4px] w-full rounded-full" style={{ backgroundColor: `${colors.primary}12` }} />
          </div>
          <div className="flex items-center justify-between mt-1">
            {/* Price in badge */}
            <div className="h-[14px] px-1 rounded-md flex items-center" style={{ backgroundColor: colors.primary }}>
              <span className="text-[6px] font-bold text-white">$2.500</span>
            </div>
            {/* Filled CTA button */}
            <div className="h-[14px] px-1.5 rounded-lg flex items-center gap-0.5" style={{ backgroundColor: colors.primary }}>
              <span className="text-[6px] font-semibold text-white">Reservar</span>
              <span className="text-[5px] text-white">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
