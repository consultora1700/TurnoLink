'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useI18n, Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  variant?: 'default' | 'minimal' | 'button';
  className?: string;
  showFlag?: boolean;
  showName?: boolean;
}

// Default fallback locale
const fallbackLocale = { code: 'es' as Locale, name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' };

export function LanguageSelector({
  variant = 'default',
  className,
  showFlag = true,
  showName = true,
}: LanguageSelectorProps) {
  const i18n = useI18n();

  // Safe destructuring with fallbacks
  const locale = i18n?.locale ?? 'es';
  const setLocale = i18n?.setLocale ?? (() => {});
  const locales = i18n?.locales ?? [fallbackLocale];
  const currentLocale = i18n?.currentLocale ?? fallbackLocale;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: Locale) => {
    setLocale(code);
    setIsOpen(false);
  };

  if (variant === 'minimal') {
    return (
      <div className={cn('relative', className)} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Select language"
        >
          <Globe className="h-4 w-4" />
          <span className="uppercase font-medium">{locale}</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border py-1 z-50 animate-fade-in">
            {locales.map((l) => (
              <button
                key={l.code}
                onClick={() => handleSelect(l.code)}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-muted transition-colors',
                  l.code === locale && 'text-primary font-medium'
                )}
              >
                <span>{l.flag}</span>
                <span>{l.nativeName}</span>
                {l.code === locale && <Check className="h-4 w-4 ml-auto" />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <div className={cn('relative', className)} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
          aria-label="Select language"
        >
          {showFlag && <span className="text-lg">{currentLocale.flag}</span>}
          {showName && <span className="text-sm font-medium">{currentLocale.nativeName}</span>}
          <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border py-1 z-50 animate-fade-in">
            {locales.map((l) => (
              <button
                key={l.code}
                onClick={() => handleSelect(l.code)}
                className={cn(
                  'w-full px-3 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-muted transition-colors',
                  l.code === locale && 'bg-primary/5 text-primary'
                )}
              >
                <span className="text-lg">{l.flag}</span>
                <span className="flex-1">{l.nativeName}</span>
                {l.code === locale && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200',
          'hover:border-primary/30 hover:bg-primary/5',
          isOpen ? 'border-primary/30 bg-primary/5' : 'border-border'
        )}
        aria-label="Select language"
      >
        <Globe className="h-4 w-4 text-muted-foreground" />
        {showFlag && <span className="text-lg">{currentLocale.flag}</span>}
        {showName && (
          <span className="text-sm font-medium">{currentLocale.nativeName}</span>
        )}
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border py-2 z-50 animate-slide-up">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Select Language
          </div>
          <div className="mt-1">
            {locales.map((l) => (
              <button
                key={l.code}
                onClick={() => handleSelect(l.code)}
                className={cn(
                  'w-full px-3 py-3 text-left flex items-center gap-3 hover:bg-muted transition-colors',
                  l.code === locale && 'bg-primary/5'
                )}
              >
                <span className="text-xl">{l.flag}</span>
                <div className="flex-1">
                  <p className={cn('text-sm font-medium', l.code === locale && 'text-primary')}>
                    {l.nativeName}
                  </p>
                  <p className="text-xs text-muted-foreground">{l.name}</p>
                </div>
                {l.code === locale && <Check className="h-5 w-5 text-primary" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Simple inline selector for headers
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, locales } = useI18n();

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {locales.map((l, index) => (
        <button
          key={l.code}
          onClick={() => setLocale(l.code)}
          className={cn(
            'px-2 py-1 text-sm font-medium transition-colors rounded',
            l.code === locale
              ? 'text-primary bg-primary/10'
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-label={`Switch to ${l.nativeName}`}
        >
          {l.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
