'use client';

import { Check } from 'lucide-react';

// ─── Store Hero Styles ─────────────────────────────────────────────

export type StoreHeroStyle = 'classic' | 'centered' | 'banner' | 'split' | 'minimal' | 'gradient' | 'glassmorphism' | 'editorial' | 'fullscreen' | 'floating' | 'ecommerce';

export const STORE_HERO_STYLES: {
  value: StoreHeroStyle;
  label: string;
  desc: string;
}[] = [
  { value: 'classic', label: 'Clásico', desc: 'Banner con info flotante' },
  { value: 'centered', label: 'Centrado', desc: 'Logo y texto al centro' },
  { value: 'banner', label: 'Banner', desc: 'Tipografía bold sobre imagen' },
  { value: 'split', label: 'Dividido', desc: 'Info izquierda, imagen derecha' },
  { value: 'minimal', label: 'Minimal', desc: 'Limpio, sin banner' },
  { value: 'gradient', label: 'Gradiente', desc: 'Degradado con profundidad' },
  { value: 'glassmorphism', label: 'Glass', desc: 'Cristal esmerilado premium' },
  { value: 'editorial', label: 'Editorial', desc: 'Tipografía gigante, revista' },
  { value: 'fullscreen', label: 'Fullscreen', desc: 'Pantalla completa inmersiva' },
  { value: 'floating', label: 'Floating', desc: 'Tarjeta flotante con sombra' },
  { value: 'ecommerce', label: 'E-Commerce', desc: 'Navbar + carrusel profesional' },
];

interface HeroPreviewProps {
  style: StoreHeroStyle;
  selected: boolean;
  onClick: () => void;
  primaryColor: string;
  secondaryColor: string;
}

export function StoreHeroPreview({ style, selected, onClick, primaryColor, secondaryColor }: HeroPreviewProps) {
  const meta = STORE_HERO_STYLES.find(s => s.value === style)!;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-xl overflow-hidden border-2 transition-all text-left ${
        selected
          ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      {/* Mini preview */}
      <div className="h-24 relative overflow-hidden">
        <HeroMiniPreview style={style} primary={primaryColor} secondary={secondaryColor} />
        {selected && (
          <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center">
            <Check className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-xs font-semibold">{meta.label}</p>
        <p className="text-[10px] text-muted-foreground">{meta.desc}</p>
      </div>
    </button>
  );
}

function HeroMiniPreview({ style, primary, secondary }: { style: StoreHeroStyle; primary: string; secondary: string }) {
  switch (style) {
    case 'classic':
      return (
        <div className="h-full relative">
          <div className="h-16" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }} />
          <div className="absolute bottom-1 left-2 right-2 rounded-lg p-1.5 flex items-center gap-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
            <div className="h-5 w-5 rounded-full border border-white/50 flex items-center justify-center" style={{ backgroundColor: primary }}>
              <div className="h-2.5 w-2.5 rounded-full bg-white/40" />
            </div>
            <div className="space-y-0.5">
              <div className="h-1.5 w-12 rounded-full bg-white/90" />
              <div className="h-1 w-8 rounded-full bg-white/50" />
            </div>
          </div>
        </div>
      );
    case 'centered':
      return (
        <div className="h-full flex flex-col items-center justify-center gap-1" style={{ background: `linear-gradient(180deg, ${primary}20, ${secondary}10)` }}>
          <div className="h-7 w-7 rounded-full shadow-sm flex items-center justify-center ring-2 ring-white/50" style={{ backgroundColor: primary }}>
            <div className="h-3.5 w-3.5 rounded-full bg-white/30" />
          </div>
          <div className="h-1.5 w-16 rounded-full bg-slate-800 dark:bg-white" />
          <div className="h-1 w-10 rounded-full bg-slate-300" />
          <div className="flex gap-1 mt-0.5">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: `${primary}40` }} />
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: `${primary}40` }} />
          </div>
        </div>
      );
    case 'banner':
      return (
        <div className="h-full relative" style={{ background: `linear-gradient(135deg, ${primary}dd, ${secondary}dd)` }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="h-3 w-24 rounded bg-white/90 mb-1" />
            <div className="h-1.5 w-14 rounded-full bg-white/50" />
            <div className="flex gap-1.5 mt-2">
              <div className="h-3.5 w-10 rounded-full bg-white/25 flex items-center justify-center">
                <div className="h-1 w-5 rounded-full bg-white/80" />
              </div>
              <div className="h-3.5 w-3.5 rounded-full bg-white/20" />
            </div>
          </div>
        </div>
      );
    case 'split':
      return (
        <div className="h-full flex">
          <div className="flex-1 flex flex-col justify-center px-2.5 bg-slate-50 dark:bg-slate-800">
            <div className="h-1 w-4 rounded-full mb-1.5" style={{ backgroundColor: primary }} />
            <div className="h-2 w-14 rounded bg-slate-800 dark:bg-white mb-1" />
            <div className="h-1 w-10 rounded-full bg-slate-300 mb-2" />
            <div className="h-3 w-12 rounded-full" style={{ backgroundColor: primary }}>
              <div className="h-0.5 w-6 mx-auto mt-1.5 rounded-full bg-white/80" />
            </div>
          </div>
          <div className="w-14 relative" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-slate-50 dark:from-slate-800 to-transparent" />
          </div>
        </div>
      );
    case 'minimal':
      return (
        <div className="h-full flex items-center px-3 bg-white dark:bg-slate-900 border-b-2" style={{ borderColor: `${primary}30` }}>
          <div className="h-8 w-8 rounded-xl mr-2.5 flex items-center justify-center shadow-sm" style={{ backgroundColor: `${primary}12` }}>
            <div className="h-4 w-4 rounded-lg" style={{ backgroundColor: primary }} />
          </div>
          <div className="flex-1">
            <div className="h-1.5 w-16 rounded-full bg-slate-800 dark:bg-white" />
            <div className="h-1 w-12 rounded-full bg-slate-200 mt-1" />
          </div>
          <div className="h-4 w-8 rounded-full" style={{ backgroundColor: `${primary}15` }}>
            <div className="h-0.5 w-4 mx-auto mt-1.5 rounded-full" style={{ backgroundColor: primary }} />
          </div>
        </div>
      );
    case 'gradient':
      return (
        <div className="h-full relative" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary}, ${primary}88)` }}>
          {/* Floating orbs */}
          <div className="absolute top-1 right-2 w-6 h-6 rounded-full bg-white/10 blur-sm" />
          <div className="absolute bottom-3 left-1 w-4 h-4 rounded-full bg-white/10 blur-sm" />
          <div className="absolute inset-0 flex items-end pb-2 px-2">
            <div className="w-full rounded-lg p-1.5 flex items-center gap-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">
                <div className="h-2.5 w-2.5 rounded-full bg-white/50" />
              </div>
              <div className="space-y-0.5">
                <div className="h-1.5 w-12 rounded-full bg-white/90" />
                <div className="h-1 w-8 rounded-full bg-white/40" />
              </div>
            </div>
          </div>
        </div>
      );
    case 'glassmorphism':
      return (
        <div className="h-full relative" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
          <div className="absolute inset-0 flex items-center justify-center p-2">
            <div className="w-full rounded-xl p-2 space-y-1 border border-white/20" style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)' }}>
              <div className="flex items-center gap-1.5">
                <div className="h-5 w-5 rounded-full bg-white/30" />
                <div className="h-1.5 w-12 rounded-full bg-white/90" />
              </div>
              <div className="h-1 w-16 rounded-full bg-white/40" />
              <div className="h-3 w-full rounded-lg bg-white/20 flex items-center justify-center">
                <div className="h-1 w-8 rounded-full bg-white/70" />
              </div>
            </div>
          </div>
        </div>
      );
    case 'editorial':
      return (
        <div className="h-full relative bg-slate-900">
          <div className="absolute top-1.5 left-2.5">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: primary }} />
          </div>
          <div className="absolute inset-0 flex flex-col justify-center px-2.5">
            <div className="h-4 w-24 rounded bg-white/90 mb-1" />
            <div className="h-0.5 w-8 mb-1.5" style={{ backgroundColor: primary }} />
            <div className="h-1 w-16 rounded-full bg-white/30" />
          </div>
          <div className="absolute bottom-1.5 right-2.5 flex gap-1">
            <div className="h-2 w-2 rounded-full bg-white/20" />
            <div className="h-2 w-2 rounded-full bg-white/20" />
          </div>
        </div>
      );
    case 'fullscreen':
      return (
        <div className="h-full relative" style={{ background: `linear-gradient(180deg, ${primary}cc, ${secondary}cc)` }}>
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
            <div className="h-5 w-5 rounded-full bg-white/20 mb-1.5 flex items-center justify-center">
              <div className="h-2.5 w-2.5 rounded-full bg-white/40" />
            </div>
            <div className="h-2 w-20 rounded bg-white/90 mb-0.5" />
            <div className="h-1 w-12 rounded-full bg-white/50 mb-2" />
            <div className="h-3.5 w-14 rounded-full border border-white/40 flex items-center justify-center">
              <div className="h-1 w-7 rounded-full bg-white/70" />
            </div>
            <div className="mt-1.5 flex flex-col items-center">
              <div className="h-0.5 w-0.5 rounded-full bg-white/50" />
              <div className="h-1.5 w-0.5 rounded-full bg-white/30 mt-0.5" />
            </div>
          </div>
        </div>
      );
    case 'floating':
      return (
        <div className="h-full relative">
          <div className="h-12" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }} />
          <div className="bg-slate-50 dark:bg-slate-800 h-12" />
          <div className="absolute left-2 right-2 top-6 rounded-xl bg-white dark:bg-slate-900 shadow-lg p-2 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primary}15` }}>
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: primary }} />
              </div>
              <div className="space-y-0.5 flex-1">
                <div className="h-1.5 w-14 rounded-full bg-slate-800 dark:bg-white" />
                <div className="h-1 w-10 rounded-full bg-slate-300" />
              </div>
            </div>
            <div className="flex gap-1 mt-1.5">
              <div className="h-2.5 w-8 rounded-full" style={{ backgroundColor: `${primary}20` }} />
              <div className="h-2.5 w-6 rounded-full bg-slate-100 dark:bg-slate-700" />
            </div>
          </div>
        </div>
      );
    case 'ecommerce':
      return (
        <div className="h-full relative bg-gray-900">
          {/* Mini navbar */}
          <div className="h-5 bg-gray-900 flex items-center px-1.5 gap-1 border-b border-white/10">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: primary }} />
            <div className="flex-1" />
            <div className="flex gap-1">
              <div className="h-1 w-4 rounded-full bg-white/50" />
              <div className="h-1 w-4 rounded-full bg-white/50" />
            </div>
            <div className="h-2.5 w-2.5 rounded-full bg-white/20 ml-1" />
          </div>
          {/* Mini carousel */}
          <div className="px-1.5 pt-1.5" style={{ background: `linear-gradient(180deg, #111827 0%, #4b5563 60%, #9ca3af 100%)` }}>
            <div className="rounded-lg overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${primary}dd, ${secondary}dd)` }}>
              <div className="h-12 flex items-center justify-center">
                <div className="h-1.5 w-14 rounded bg-white/80" />
              </div>
              {/* Dots */}
              <div className="flex justify-center gap-0.5 pb-1">
                <div className="h-1 w-1 rounded-full bg-white" />
                <div className="h-1 w-1 rounded-full bg-white/40" />
                <div className="h-1 w-1 rounded-full bg-white/40" />
              </div>
            </div>
          </div>
        </div>
      );
  }
}

// ─── Store Card Styles ─────────────────────────────────────────────

export type StoreCardStyle = 'standard' | 'minimal' | 'compact' | 'editorial' | 'detailed' | 'rounded';

export const STORE_CARD_STYLES: {
  value: StoreCardStyle;
  label: string;
  desc: string;
}[] = [
  { value: 'standard', label: 'Estándar', desc: 'Tarjeta clásica de e-commerce' },
  { value: 'minimal', label: 'Minimal', desc: 'Sin bordes, limpio y moderno' },
  { value: 'compact', label: 'Compacto', desc: 'Imagen y texto lado a lado' },
  { value: 'editorial', label: 'Editorial', desc: 'Imagen grande, estilo revista' },
  { value: 'detailed', label: 'Detallado', desc: 'Más info: descripción y stock' },
  { value: 'rounded', label: 'Redondeado', desc: 'Bordes suaves, sombras sutiles' },
];

interface CardPreviewProps {
  style: StoreCardStyle;
  selected: boolean;
  onClick: () => void;
  primaryColor: string;
}

export function StoreCardPreview({ style, selected, onClick, primaryColor }: CardPreviewProps) {
  const meta = STORE_CARD_STYLES.find(s => s.value === style)!;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-xl overflow-hidden border-2 transition-all text-left ${
        selected
          ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      {/* Mini card preview */}
      <div className="p-2.5 pb-1">
        <CardMiniPreview style={style} primary={primaryColor} />
      </div>
      <div className="px-2.5 pb-2.5">
        <p className="text-xs font-semibold">{meta.label}</p>
        <p className="text-[10px] text-muted-foreground">{meta.desc}</p>
      </div>
      {selected && (
        <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-amber-500 flex items-center justify-center">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}
    </button>
  );
}

function CardMiniPreview({ style, primary }: { style: StoreCardStyle; primary: string }) {
  switch (style) {
    case 'standard':
      return (
        <div className="grid grid-cols-2 gap-1.5">
          {[0, 1].map(i => (
            <div key={i} className="rounded-lg border bg-white dark:bg-slate-800 overflow-hidden">
              <div className="aspect-square bg-slate-100 dark:bg-slate-700" />
              <div className="p-1.5 space-y-0.5">
                <div className="h-1 w-10 rounded-full bg-slate-700 dark:bg-slate-300" />
                <div className="h-1 w-6 rounded-full" style={{ backgroundColor: primary }} />
              </div>
            </div>
          ))}
        </div>
      );
    case 'minimal':
      return (
        <div className="grid grid-cols-2 gap-2">
          {[0, 1].map(i => (
            <div key={i} className="group">
              <div className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-lg" />
              <div className="pt-1.5 space-y-0.5">
                <div className="h-1 w-10 rounded-full bg-slate-600 dark:bg-slate-300" />
                <div className="h-1 w-6 rounded-full bg-slate-400" />
              </div>
            </div>
          ))}
        </div>
      );
    case 'compact':
      return (
        <div className="space-y-1.5">
          {[0, 1].map(i => (
            <div key={i} className="flex gap-1.5 rounded-lg border bg-white dark:bg-slate-800 p-1">
              <div className="h-8 w-8 rounded bg-slate-100 dark:bg-slate-700 shrink-0" />
              <div className="flex-1 py-0.5 space-y-0.5">
                <div className="h-1 w-full rounded-full bg-slate-700 dark:bg-slate-300" />
                <div className="h-1 w-6 rounded-full" style={{ backgroundColor: primary }} />
              </div>
            </div>
          ))}
        </div>
      );
    case 'editorial':
      return (
        <div className="grid grid-cols-2 gap-1.5">
          {[0, 1].map(i => (
            <div key={i} className="rounded-lg overflow-hidden relative">
              <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-700" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                <div className="h-1 w-10 rounded-full bg-white/90" />
                <div className="h-1 w-5 rounded-full bg-white/60 mt-0.5" />
              </div>
            </div>
          ))}
        </div>
      );
    case 'detailed':
      return (
        <div className="grid grid-cols-2 gap-1.5">
          {[0, 1].map(i => (
            <div key={i} className="rounded-lg border bg-white dark:bg-slate-800 overflow-hidden">
              <div className="aspect-video bg-slate-100 dark:bg-slate-700" />
              <div className="p-1.5 space-y-0.5">
                <div className="h-1 w-10 rounded-full bg-slate-700 dark:bg-slate-300" />
                <div className="h-0.5 w-full rounded-full bg-slate-200" />
                <div className="flex justify-between items-center">
                  <div className="h-1 w-5 rounded-full" style={{ backgroundColor: primary }} />
                  <div className="h-1 w-4 rounded-full bg-emerald-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    case 'rounded':
      return (
        <div className="grid grid-cols-2 gap-1.5">
          {[0, 1].map(i => (
            <div key={i} className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
              <div className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-t-2xl" />
              <div className="p-1.5 space-y-0.5">
                <div className="h-1 w-10 rounded-full bg-slate-700 dark:bg-slate-300" />
                <div className="h-1 w-6 rounded-full" style={{ backgroundColor: primary }} />
                <div className="h-3 w-full rounded-full mt-0.5" style={{ backgroundColor: `${primary}20` }}>
                  <div className="h-0.5 w-6 mx-auto pt-1 rounded-full" style={{ backgroundColor: primary }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
  }
}

// ─── Profile Photo Style ───────────────────────────────────────────

export type ProfilePhotoStyle = 'none' | 'round' | 'square';

export const PROFILE_PHOTO_STYLES: {
  value: ProfilePhotoStyle;
  label: string;
  desc: string;
}[] = [
  { value: 'round', label: 'Circular', desc: 'Logo redondo' },
  { value: 'square', label: 'Cuadrado', desc: 'Logo con bordes redondeados' },
  { value: 'none', label: 'Sin logo', desc: 'Solo texto' },
];
