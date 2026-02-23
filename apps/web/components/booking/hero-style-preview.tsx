'use client';

import { cn } from '@/lib/utils';
import { HeroStyleName, HERO_STYLES } from '@/lib/hero-styles';

interface Props {
  style: HeroStyleName;
  selected: boolean;
  onClick: () => void;
  label: string;
  description?: string;
}

export function HeroStylePreview({ style, selected, onClick, label, description }: Props) {
  const cfg = HERO_STYLES[style];
  const isLight = cfg.heroTextColor === 'dark';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative w-full rounded-xl overflow-hidden border-2 transition-all text-left',
        selected
          ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
          : 'border-neutral-200 dark:border-neutral-700 hover:border-primary/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
      )}
    >
      {/* Miniature hero preview */}
      <div className={cn('relative h-24 overflow-hidden', cfg.heroBg)}>
        {/* Pattern overlay */}
        {cfg.heroPattern && <div className={cn('absolute inset-0', cfg.heroPattern)} />}

        {/* Decorative blobs */}
        <div className={cn('absolute -top-8 -right-8 w-20 h-20 rounded-full blur-2xl', cfg.heroDecorativeBlobs[0])} />
        <div className={cn('absolute -bottom-8 -left-8 w-20 h-20 rounded-full blur-2xl', cfg.heroDecorativeBlobs[1])} />

        {/* Mini layout preview */}
        <div className={cn(
          'relative flex items-center gap-2 p-3',
          cfg.heroLayout === 'center' && 'flex-col items-center pt-4',
          cfg.heroLayout === 'side-by-side' && 'items-center'
        )}>
          {/* Mini logo */}
          <div className={cn(
            'flex-shrink-0',
            cfg.heroLayout === 'center' ? 'w-8 h-8' : 'w-7 h-7',
            cfg.logoRadius,
            cfg.logoFallbackGradient,
            'flex items-center justify-center'
          )}>
            <span className="text-[10px] font-bold text-white">T</span>
          </div>

          {/* Mini text lines */}
          <div className={cn(
            'flex flex-col gap-1',
            cfg.heroLayout === 'center' && 'items-center'
          )}>
            <div className={cn(
              'h-2 rounded-full',
              cfg.heroLayout === 'center' ? 'w-16' : 'w-20',
              isLight ? 'bg-slate-800/60' : 'bg-white/70'
            )} />
            <div className={cn(
              'h-1.5 rounded-full',
              cfg.heroLayout === 'center' ? 'w-12' : 'w-14',
              isLight ? 'bg-slate-600/40' : 'bg-white/40'
            )} />
          </div>
        </div>

        {/* Mini trust badges row */}
        <div className={cn(
          'absolute bottom-2 left-3 right-3 flex gap-1.5',
          cfg.heroLayout === 'center' && 'justify-center'
        )}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={cn(
                'h-1 rounded-full',
                i === 0 ? 'w-8' : i === 1 ? 'w-6' : 'w-7',
                isLight ? 'bg-slate-500/30' : 'bg-white/20'
              )}
            />
          ))}
        </div>

        {/* Selected check */}
        {selected && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="p-3 space-y-0.5">
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
    </button>
  );
}
