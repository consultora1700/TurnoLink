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

const PRODUCT_CARD_FEATURES: Record<HeroStyleName, { label: string; color: string }[]> = {
  classic: [
    { label: 'Bordes suaves', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
    { label: 'Hover elevación', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    { label: 'CTA pill', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  ],
  clinical: [
    { label: 'Limpio', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
    { label: 'Borde hover', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
    { label: 'Botón outline', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-300' },
  ],
  bold: [
    { label: 'Angular', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
    { label: 'UPPERCASE', color: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300' },
    { label: 'Overlay oscuro', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  ],
  zen: [
    { label: 'Centrado', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
    { label: 'Hover escala', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
    { label: 'CTA redondeado', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
  ],
  corporate: [
    { label: 'Compacto', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    { label: 'Info arriba', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
    { label: 'Sin adornos', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-300' },
  ],
  energetic: [
    { label: 'CTA gradiente', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
    { label: 'Badge precio', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    { label: 'Línea gradiente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  ],
  warm: [
    { label: 'Fondo tintado', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
    { label: 'Barra superior', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
    { label: 'Botón claro', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  ],
  minimalist: [
    { label: 'Sin sombra', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    { label: 'Texto light', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-300' },
    { label: 'CTA texto', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
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

export function ProductCardStylePreview({ style, selected, onClick, label, description }: Props) {
  const previewVars = buildPreviewVars(style);
  const features = PRODUCT_CARD_FEATURES[style];
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
      {/* ── Mini product card mockup (2-column compact layout) ── */}
      <div
        className="relative h-[160px] overflow-hidden bg-white dark:bg-neutral-950 p-3 flex items-center justify-center"
        style={previewVars}
      >
        <div className={cn(
          'absolute inset-0',
          style === 'minimalist'
            ? 'bg-[#F3F4F6] dark:bg-neutral-950'
            : 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900'
        )} />

        {style === 'classic' ? (
          <ClassicProductMock colors={colors} />
        ) : style === 'clinical' ? (
          <ClinicalProductMock colors={colors} />
        ) : style === 'bold' ? (
          <BoldProductMock colors={colors} />
        ) : style === 'zen' ? (
          <ZenProductMock colors={colors} />
        ) : style === 'corporate' ? (
          <CorporateProductMock colors={colors} />
        ) : style === 'energetic' ? (
          <EnergeticProductMock colors={colors} />
        ) : style === 'warm' ? (
          <WarmProductMock colors={colors} />
        ) : (
          <MinimalistProductMock colors={colors} />
        )}

        {selected && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg z-10">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

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

// ─── Helper: two compact cards side by side ─────────────────────────────────
function TwoCardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex gap-1.5 w-full max-w-[210px]">
      {children}
    </div>
  );
}

// ─── CLASSIC: rounded-2xl, shadow, pill CTA ────────────────────────────────
function ClassicProductMock({ colors }: { colors: any }) {
  return (
    <TwoCardLayout>
      {/* Card 1 */}
      <div className="flex-1 bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-slate-100 dark:border-neutral-600/60 overflow-hidden">
        <div className="h-[52px] relative" style={{ background: `linear-gradient(135deg, ${colors.primary}18, ${colors.secondary}18)` }}>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold" style={{ color: `${colors.primary}30` }}>R</span>
          <div className="absolute top-1 left-1 px-1 py-[1px] rounded-md shadow-sm" style={{ backgroundColor: colors.primary }}>
            <span className="text-[5px] font-bold text-white">-20%</span>
          </div>
        </div>
        <div className="p-1.5">
          <div className="h-[5px] w-[80%] bg-slate-800/70 dark:bg-white/80 rounded-full mb-1" />
          <div className="flex items-baseline gap-1">
            <span className="text-[5px] line-through text-slate-400">$14.990</span>
            <span className="text-[7px] font-bold text-slate-900 dark:text-white">$11.990</span>
          </div>
          <div className="mt-1 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.primary}12` }}>
            <span className="text-[5px] font-semibold" style={{ color: colors.primary }}>Consultar</span>
          </div>
        </div>
      </div>
      {/* Card 2 (dimmed) */}
      <div className="flex-1 bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-slate-100 dark:border-neutral-600/60 overflow-hidden opacity-60">
        <div className="h-[52px]" style={{ background: `linear-gradient(135deg, ${colors.primary}12, ${colors.secondary}12)` }}>
          <span className="flex items-center justify-center h-full text-lg font-bold" style={{ color: `${colors.primary}20` }}>B</span>
        </div>
        <div className="p-1.5">
          <div className="h-[5px] w-[65%] bg-slate-800/70 dark:bg-white/80 rounded-full mb-1" />
          <span className="text-[7px] font-bold text-slate-900 dark:text-white">$19.990</span>
          <div className="mt-1 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.primary}12` }}>
            <span className="text-[5px] font-semibold" style={{ color: colors.primary }}>Consultar</span>
          </div>
        </div>
      </div>
    </TwoCardLayout>
  );
}

// ─── CLINICAL: clean, outlined CTA, border hover ──────────────────────────
function ClinicalProductMock({ colors }: { colors: any }) {
  return (
    <TwoCardLayout>
      <div className="flex-1 bg-white dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-600/60 overflow-hidden" style={{ borderColor: `${colors.primary}50` }}>
        <div className="h-[52px]" style={{ background: `linear-gradient(135deg, ${colors.primary}10, ${colors.secondary}10)` }}>
          <span className="flex items-center justify-center h-full text-lg font-bold" style={{ color: `${colors.primary}20` }}>R</span>
        </div>
        <div className="p-1.5">
          <div className="h-[5px] w-[80%] bg-slate-800/60 dark:bg-white/70 rounded-full mb-1" />
          <span className="text-[7px] font-medium text-slate-700 dark:text-neutral-300">$11.990</span>
          <div className="mt-1 h-4 rounded-lg flex items-center justify-center border" style={{ borderColor: `${colors.primary}60` }}>
            <span className="text-[5px] font-medium" style={{ color: colors.primary }}>Consultar</span>
          </div>
        </div>
      </div>
      <div className="flex-1 bg-white dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-600/60 overflow-hidden opacity-60">
        <div className="h-[52px]" style={{ background: `linear-gradient(135deg, ${colors.primary}08, ${colors.secondary}08)` }}>
          <span className="flex items-center justify-center h-full text-lg font-bold" style={{ color: `${colors.primary}15` }}>B</span>
        </div>
        <div className="p-1.5">
          <div className="h-[5px] w-[65%] bg-slate-800/60 dark:bg-white/70 rounded-full mb-1" />
          <span className="text-[7px] font-medium text-slate-700 dark:text-neutral-300">$19.990</span>
          <div className="mt-1 h-4 rounded-lg flex items-center justify-center border" style={{ borderColor: `${colors.primary}60` }}>
            <span className="text-[5px] font-medium" style={{ color: colors.primary }}>Consultar</span>
          </div>
        </div>
      </div>
    </TwoCardLayout>
  );
}

// ─── BOLD: angular, dark bg, overlay gradient, uppercase ───────────────────
function BoldProductMock({ colors }: { colors: any }) {
  const ctaTextColor = getContrastTextColor(colors.primary) === 'dark' ? '#1a1a1a' : '#ffffff';
  return (
    <TwoCardLayout>
      <div className="flex-1 bg-neutral-100 dark:bg-neutral-900 rounded-sm border border-neutral-300 dark:border-neutral-700 shadow-md overflow-hidden">
        <div className="h-[52px] bg-gradient-to-br from-neutral-800 to-neutral-900 relative overflow-hidden">
          <span className="absolute inset-0 flex items-center justify-center text-lg font-black text-white/10">R</span>
          <div className="absolute top-1 left-1 px-1 py-[1px] rounded-sm shadow-sm" style={{ backgroundColor: colors.primary }}>
            <span className="text-[5px] font-bold" style={{ color: ctaTextColor }}>-20%</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="p-1.5">
          <div className="h-[5px] w-[80%] bg-neutral-900/80 dark:bg-white/80 rounded-full mb-1" />
          <span className="text-[6px] font-black uppercase tracking-wider text-neutral-800 dark:text-white">$11.990</span>
          <div className="mt-1 h-4 rounded-sm flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
            <span className="text-[5px] font-black uppercase tracking-wider" style={{ color: ctaTextColor }}>CONSULTAR</span>
          </div>
        </div>
      </div>
      <div className="flex-1 bg-neutral-100 dark:bg-neutral-900 rounded-sm border border-neutral-300 dark:border-neutral-700 shadow-md overflow-hidden opacity-60">
        <div className="h-[52px] bg-gradient-to-br from-neutral-800 to-neutral-900 relative overflow-hidden">
          <span className="absolute inset-0 flex items-center justify-center text-lg font-black text-white/10">B</span>
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="p-1.5">
          <div className="h-[5px] w-[65%] bg-neutral-900/80 dark:bg-white/80 rounded-full mb-1" />
          <span className="text-[6px] font-black uppercase tracking-wider text-neutral-800 dark:text-white">$19.990</span>
          <div className="mt-1 h-4 rounded-sm flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
            <span className="text-[5px] font-black uppercase tracking-wider" style={{ color: ctaTextColor }}>CONSULTAR</span>
          </div>
        </div>
      </div>
    </TwoCardLayout>
  );
}

// ─── ZEN: centered text, primary border, rounded-full CTA ─────────────────
function ZenProductMock({ colors }: { colors: any }) {
  return (
    <TwoCardLayout>
      <div className="flex-1 bg-white dark:bg-neutral-800 rounded-xl overflow-hidden" style={{ borderColor: `${colors.primary}50`, borderWidth: 1 }}>
        <div className="h-[48px] flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.primary}10, ${colors.secondary}10)` }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.primary}30, ${colors.secondary}30)` }}>
            <span className="text-[9px] font-medium" style={{ color: colors.primary }}>R</span>
          </div>
        </div>
        <div className="p-1.5 text-center">
          <div className="h-[5px] w-[70%] mx-auto bg-slate-700/60 dark:bg-white/70 rounded-full mb-1" />
          <span className="text-[7px] font-semibold text-slate-600 dark:text-neutral-300">$11.990</span>
          <div className="mt-1 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
            <span className="text-[5px] font-medium text-white">Consultar</span>
          </div>
        </div>
      </div>
      <div className="flex-1 bg-white dark:bg-neutral-800 rounded-xl overflow-hidden opacity-60" style={{ borderColor: `${colors.primary}50`, borderWidth: 1 }}>
        <div className="h-[48px] flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.primary}08, ${colors.secondary}08)` }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20)` }}>
            <span className="text-[9px] font-medium" style={{ color: colors.primary }}>B</span>
          </div>
        </div>
        <div className="p-1.5 text-center">
          <div className="h-[5px] w-[65%] mx-auto bg-slate-700/60 dark:bg-white/70 rounded-full mb-1" />
          <span className="text-[7px] font-semibold text-slate-600 dark:text-neutral-300">$19.990</span>
          <div className="mt-1 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
            <span className="text-[5px] font-medium text-white">Consultar</span>
          </div>
        </div>
      </div>
    </TwoCardLayout>
  );
}

// ─── CORPORATE: compact, info-first, no frills ─────────────────────────────
function CorporateProductMock({ colors }: { colors: any }) {
  return (
    <TwoCardLayout>
      <div className="flex-1 bg-white dark:bg-neutral-800 rounded-md border border-slate-200 dark:border-neutral-600/60 overflow-hidden">
        <div className="p-1.5 border-b border-slate-100 dark:border-neutral-700/50">
          <div className="h-[5px] w-[80%] bg-slate-800/70 dark:bg-white/80 rounded-full mb-0.5" />
          <div className="flex items-center gap-1">
            <span className="text-[6px] font-bold text-slate-900 dark:text-white">$11.990</span>
            <span className="text-[5px] line-through text-slate-400">$14.990</span>
          </div>
        </div>
        <div className="h-[40px]" style={{ background: `linear-gradient(135deg, ${colors.primary}10, ${colors.secondary}10)` }}>
          <span className="flex items-center justify-center h-full text-sm font-bold" style={{ color: `${colors.primary}25` }}>R</span>
        </div>
        <div className="p-1.5">
          <div className="h-4 rounded-md flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
            <span className="text-[5px] font-semibold text-white">Consultar</span>
          </div>
        </div>
      </div>
      <div className="flex-1 bg-white dark:bg-neutral-800 rounded-md border border-slate-200 dark:border-neutral-600/60 overflow-hidden opacity-60">
        <div className="p-1.5 border-b border-slate-100 dark:border-neutral-700/50">
          <div className="h-[5px] w-[65%] bg-slate-800/70 dark:bg-white/80 rounded-full mb-0.5" />
          <span className="text-[6px] font-bold text-slate-900 dark:text-white">$19.990</span>
        </div>
        <div className="h-[40px]" style={{ background: `linear-gradient(135deg, ${colors.primary}08, ${colors.secondary}08)` }}>
          <span className="flex items-center justify-center h-full text-sm font-bold" style={{ color: `${colors.primary}15` }}>B</span>
        </div>
        <div className="p-1.5">
          <div className="h-4 rounded-md flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
            <span className="text-[5px] font-semibold text-white">Consultar</span>
          </div>
        </div>
      </div>
    </TwoCardLayout>
  );
}

// ─── ENERGETIC: gradient top line, price badge on image, gradient CTA ──────
function EnergeticProductMock({ colors }: { colors: any }) {
  return (
    <TwoCardLayout>
      <div className="flex-1 bg-white dark:bg-neutral-800 rounded-lg shadow-md border border-slate-100 dark:border-neutral-600/60 overflow-hidden">
        <div className="h-[2px]" style={{ background: `linear-gradient(to right, transparent, ${colors.primary}80, transparent)` }} />
        <div className="h-[52px] relative" style={{ background: `linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}15)` }}>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-black" style={{ color: `${colors.primary}15` }}>R</span>
          <div className="absolute top-1 right-1 rounded-md px-1 py-[1px] shadow-sm" style={{ backgroundColor: colors.primary }}>
            <span className="text-[6px] font-black text-white">$11.990</span>
          </div>
          <div className="absolute top-1 left-1 px-1 py-[1px] rounded-md shadow-sm" style={{ backgroundColor: `${colors.secondary}` }}>
            <span className="text-[5px] font-bold text-white">-20%</span>
          </div>
        </div>
        <div className="p-1.5">
          <div className="h-[5px] w-[80%] bg-slate-800/70 dark:bg-white/80 rounded-full mb-1.5" />
          <div className="h-4 rounded-md flex items-center justify-center" style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }}>
            <span className="text-[5px] font-bold text-white uppercase tracking-wide">CONSULTAR →</span>
          </div>
        </div>
      </div>
      <div className="flex-1 bg-white dark:bg-neutral-800 rounded-lg shadow-md border border-slate-100 dark:border-neutral-600/60 overflow-hidden opacity-60">
        <div className="h-[2px]" style={{ background: `linear-gradient(to right, transparent, ${colors.primary}60, transparent)` }} />
        <div className="h-[52px] relative" style={{ background: `linear-gradient(135deg, ${colors.primary}10, ${colors.secondary}10)` }}>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-black" style={{ color: `${colors.primary}10` }}>B</span>
          <div className="absolute top-1 right-1 rounded-md px-1 py-[1px] shadow-sm" style={{ backgroundColor: colors.primary }}>
            <span className="text-[6px] font-black text-white">$19.990</span>
          </div>
        </div>
        <div className="p-1.5">
          <div className="h-[5px] w-[65%] bg-slate-800/70 dark:bg-white/80 rounded-full mb-1.5" />
          <div className="h-4 rounded-md flex items-center justify-center" style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }}>
            <span className="text-[5px] font-bold text-white uppercase tracking-wide">CONSULTAR →</span>
          </div>
        </div>
      </div>
    </TwoCardLayout>
  );
}

// ─── WARM: tinted bg, top accent bar, white outlined CTA ──────────────────
function WarmProductMock({ colors }: { colors: any }) {
  return (
    <TwoCardLayout>
      <div className="flex-1 rounded-xl overflow-hidden" style={{ borderColor: `${colors.primary}40`, borderWidth: 1, backgroundColor: `${colors.primary}06`, boxShadow: `0 2px 8px ${colors.primary}10` }}>
        <div className="h-[3px]" style={{ backgroundColor: colors.primary }} />
        <div className="h-[48px]" style={{ background: `linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}10)` }}>
          <span className="flex items-center justify-center h-full text-lg font-bold" style={{ color: `${colors.primary}25` }}>R</span>
        </div>
        <div className="p-1.5">
          <div className="h-[5px] w-[80%] bg-slate-800/70 dark:bg-white/80 rounded-full mb-1" />
          <span className="text-[7px] font-bold text-slate-900 dark:text-white">$11.990</span>
          <div className="mt-1 h-4 rounded-full flex items-center justify-center bg-white dark:bg-neutral-700 border" style={{ borderColor: `${colors.primary}40` }}>
            <span className="text-[5px] font-semibold" style={{ color: colors.primary }}>Consultar</span>
          </div>
        </div>
      </div>
      <div className="flex-1 rounded-xl overflow-hidden opacity-60" style={{ borderColor: `${colors.primary}40`, borderWidth: 1, backgroundColor: `${colors.primary}04`, boxShadow: `0 2px 8px ${colors.primary}08` }}>
        <div className="h-[3px]" style={{ backgroundColor: colors.primary }} />
        <div className="h-[48px]" style={{ background: `linear-gradient(135deg, ${colors.primary}10, ${colors.secondary}08)` }}>
          <span className="flex items-center justify-center h-full text-lg font-bold" style={{ color: `${colors.primary}18` }}>B</span>
        </div>
        <div className="p-1.5">
          <div className="h-[5px] w-[65%] bg-slate-800/70 dark:bg-white/80 rounded-full mb-1" />
          <span className="text-[7px] font-bold text-slate-900 dark:text-white">$19.990</span>
          <div className="mt-1 h-4 rounded-full flex items-center justify-center bg-white dark:bg-neutral-700 border" style={{ borderColor: `${colors.primary}40` }}>
            <span className="text-[5px] font-semibold" style={{ color: colors.primary }}>Consultar</span>
          </div>
        </div>
      </div>
    </TwoCardLayout>
  );
}

// ─── MINIMALIST: nearly flat, light text, underlined CTA ──────────────────
function MinimalistProductMock({ colors }: { colors: any }) {
  return (
    <TwoCardLayout>
      <div className="flex-1 bg-white dark:bg-neutral-800/60 rounded-lg border border-slate-100 dark:border-neutral-800 overflow-hidden">
        <div className="h-[52px]" style={{ background: `linear-gradient(135deg, ${colors.primary}06, ${colors.secondary}06)` }}>
          <span className="flex items-center justify-center h-full text-lg font-normal text-slate-300 dark:text-neutral-600">R</span>
        </div>
        <div className="p-1.5">
          <div className="h-[5px] w-[80%] bg-slate-600/50 dark:bg-white/50 rounded-full mb-1" />
          <span className="text-[7px] font-normal text-slate-600 dark:text-neutral-400">$11.990</span>
          <div className="mt-1 flex items-center justify-center">
            <span className="text-[5px] font-medium underline underline-offset-2" style={{ color: colors.primary }}>Ver detalle</span>
          </div>
        </div>
      </div>
      <div className="flex-1 bg-white dark:bg-neutral-800/60 rounded-lg border border-slate-100 dark:border-neutral-800 overflow-hidden opacity-60">
        <div className="h-[52px]" style={{ background: `linear-gradient(135deg, ${colors.primary}04, ${colors.secondary}04)` }}>
          <span className="flex items-center justify-center h-full text-lg font-normal text-slate-300 dark:text-neutral-600">B</span>
        </div>
        <div className="p-1.5">
          <div className="h-[5px] w-[65%] bg-slate-600/50 dark:bg-white/50 rounded-full mb-1" />
          <span className="text-[7px] font-normal text-slate-600 dark:text-neutral-400">$19.990</span>
          <div className="mt-1 flex items-center justify-center">
            <span className="text-[5px] font-medium underline underline-offset-2" style={{ color: colors.primary }}>Ver detalle</span>
          </div>
        </div>
      </div>
    </TwoCardLayout>
  );
}
