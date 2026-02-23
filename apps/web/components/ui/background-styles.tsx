'use client';

import { cn } from '@/lib/utils';

export type BackgroundStyle = 'minimal' | 'modern' | 'elegant' | 'fresh' | 'vibrant';

interface BackgroundStylesProps {
  style: BackgroundStyle;
  className?: string;
}

export function BackgroundStyles({ style, className }: BackgroundStylesProps) {
  return (
    <div className={cn('fixed inset-0 pointer-events-none overflow-hidden', className)}>
      {/* Base background layer */}
      <div className="absolute inset-0 bg-background" />
      {/* Decorative style layer */}
      {style === 'minimal' && <MinimalStyle />}
      {style === 'modern' && <ModernStyle />}
      {style === 'elegant' && <ElegantStyle />}
      {style === 'fresh' && <FreshStyle />}
      {style === 'vibrant' && <VibrantStyle />}
    </div>
  );
}

// Minimal - Clean, subtle gradient with soft bottom accent
function MinimalStyle() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/15 via-transparent to-primary/10 dark:from-primary/25 dark:via-transparent dark:to-primary/15" />
      {/* Soft bottom glow */}
      <div className="absolute bottom-0 left-1/4 right-1/4 h-64 bg-primary/10 dark:bg-primary/20 blur-3xl rounded-full" />
    </>
  );
}

// Modern - Soft orbs/blobs with gradients (Stripe/Linear style)
function ModernStyle() {
  return (
    <>
      {/* Top right orb */}
      <div
        className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full blur-3xl
          bg-primary/25 dark:bg-primary/40"
      />
      {/* Bottom left orb */}
      <div
        className="absolute -bottom-24 -left-24 w-[350px] h-[350px] rounded-full blur-3xl
          bg-primary/20 dark:bg-primary/35"
      />
      {/* Center subtle accent */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-3xl
          bg-primary/10 dark:bg-primary/20"
      />
    </>
  );
}

// Elegant - Gradient + grain texture + corner accents
function ElegantStyle() {
  return (
    <>
      {/* Gradient overlay */}
      <div
        className="absolute inset-0
          bg-gradient-to-br from-primary/20 via-transparent to-primary/25
          dark:from-primary/30 dark:via-transparent dark:to-primary/35"
      />
      {/* Grain texture */}
      <div
        className="absolute inset-0 opacity-30 dark:opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Top highlight */}
      <div
        className="absolute top-0 left-0 right-0 h-80
          bg-gradient-to-b from-primary/25 to-transparent
          dark:from-primary/35"
      />
      {/* Bottom right corner accent */}
      <div
        className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full blur-3xl
          bg-primary/15 dark:bg-primary/25"
      />
    </>
  );
}

// Fresh - Waves in header/footer
function FreshStyle() {
  return (
    <>
      {/* Top wave */}
      <svg
        className="absolute top-0 left-0 w-full h-72 text-primary/30 dark:text-primary/45"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
        />
      </svg>
      {/* Bottom wave */}
      <svg
        className="absolute bottom-0 left-0 w-full h-72 text-primary/30 dark:text-primary/45"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,229.3C960,213,1056,171,1152,165.3C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>
      {/* Side accents */}
      <div
        className="absolute top-1/4 -left-16 w-64 h-96 rounded-full blur-3xl rotate-12
          bg-primary/25 dark:bg-primary/40"
      />
      <div
        className="absolute bottom-1/4 -right-16 w-64 h-96 rounded-full blur-3xl -rotate-12
          bg-primary/25 dark:bg-primary/40"
      />
    </>
  );
}

// Vibrant - More color, geometric shapes
function VibrantStyle() {
  return (
    <>
      {/* Main gradient background */}
      <div
        className="absolute inset-0
          bg-gradient-to-br from-primary/25 via-transparent to-teal-500/20
          dark:from-primary/35 dark:via-transparent dark:to-teal-500/30"
      />
      {/* Geometric circles - larger and more visible */}
      <div
        className="absolute top-20 right-[10%] w-40 h-40 rounded-full border-4
          border-primary/35 dark:border-primary/50"
      />
      <div
        className="absolute top-40 right-[15%] w-20 h-20 rounded-full
          bg-primary/30 dark:bg-primary/45"
      />
      <div
        className="absolute bottom-32 left-[8%] w-32 h-32 rounded-full border-4
          border-primary/35 dark:border-primary/50"
      />
      <div
        className="absolute bottom-20 left-[12%] w-16 h-16 rounded-full
          bg-primary/30 dark:bg-primary/45"
      />
      {/* Extra decorative ring */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border-2
          border-primary/10 dark:border-primary/20"
      />
      {/* Top left accent blob */}
      <div
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl
          bg-gradient-to-br from-primary/35 to-teal-500/25
          dark:from-primary/50 dark:to-teal-500/40"
      />
      {/* Bottom right accent blob */}
      <div
        className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl
          bg-gradient-to-tl from-primary/35 to-teal-500/25
          dark:from-primary/50 dark:to-teal-500/40"
      />
    </>
  );
}

// Preview component for settings page
export function BackgroundStylePreview({
  style,
  selected,
  onClick,
  label,
  description
}: {
  style: BackgroundStyle;
  selected: boolean;
  onClick: () => void;
  label: string;
  description?: string;
}) {
  // Get icon for each style
  const getStyleIcon = () => {
    switch (style) {
      case 'minimal':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
          </svg>
        );
      case 'modern':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <circle cx="12" cy="12" r="8" />
            <circle cx="18" cy="6" r="3" />
          </svg>
        );
      case 'elegant':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        );
      case 'fresh':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18" />
            <path strokeLinecap="round" d="M3 10c3-3 6-3 9 0s6 3 9 0M3 14c3 3 6 3 9 0s6-3 9 0" />
          </svg>
        );
      case 'vibrant':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <circle cx="8" cy="8" r="4" />
            <circle cx="16" cy="16" r="4" />
            <circle cx="16" cy="8" r="2" />
            <circle cx="8" cy="16" r="2" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative w-full rounded-xl overflow-hidden border-2 transition-all text-left",
        selected
          ? "border-primary ring-2 ring-primary/20 bg-primary/5"
          : "border-neutral-200 dark:border-neutral-700 hover:border-primary/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
      )}
    >
      {/* Preview area */}
      <div className="relative h-24 bg-white dark:bg-neutral-900 overflow-hidden">
        <div className="absolute inset-0 scale-50 origin-center">
          <BackgroundStyles style={style} />
        </div>
        {/* Selected indicator */}
        {selected && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="p-3 space-y-1">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            selected
              ? "bg-primary/10 text-primary"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
          )}>
            {getStyleIcon()}
          </div>
          <span className={cn(
            "font-medium text-sm",
            selected ? "text-primary" : "text-neutral-900 dark:text-neutral-100"
          )}>
            {label}
          </span>
        </div>
        {description && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 pl-10">
            {description}
          </p>
        )}
      </div>
    </button>
  );
}

export const BACKGROUND_STYLE_OPTIONS: { value: BackgroundStyle; label: string; description: string }[] = [
  { value: 'minimal', label: 'Minimal', description: 'Limpio y profesional' },
  { value: 'modern', label: 'Moderno', description: 'Orbes suaves estilo tech' },
  { value: 'elegant', label: 'Elegante', description: 'Gradiente con textura sutil' },
  { value: 'fresh', label: 'Fresco', description: 'Ondas suaves y acentos' },
  { value: 'vibrant', label: 'Vibrante', description: 'Formas geométricas coloridas' },
];
