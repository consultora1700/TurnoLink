'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';

// Import translations
import es from '@/locales/es.json';
import en from '@/locales/en.json';
import pt from '@/locales/pt.json';

// =============================================================================
// Types
// =============================================================================

export type Locale = 'es' | 'en' | 'pt';

export interface LocaleConfig {
  code: Locale;
  name: string;
  nativeName: string;
  flag: string;
}

export const locales: LocaleConfig[] = [
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
];

const translations: Record<Locale, typeof es> = {
  es,
  en,
  pt,
};

type TranslationKeys = typeof es;
type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeyOf<T[K]>}` | K
          : K
        : never;
    }[keyof T]
  : never;

type TranslationKey = NestedKeyOf<TranslationKeys>;

// =============================================================================
// Context
// =============================================================================

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  locales: LocaleConfig[];
  currentLocale: LocaleConfig;
}

const I18nContext = createContext<I18nContextValue | null>(null);

// =============================================================================
// Provider
// =============================================================================

const STORAGE_KEY = 'turnero-locale';
const DEFAULT_LOCALE: Locale = 'es';

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  // Check localStorage
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && (stored === 'es' || stored === 'en' || stored === 'pt')) {
    return stored;
  }

  // Check browser language
  const browserLang = navigator.language.split('-')[0];
  if (browserLang === 'es' || browserLang === 'en' || browserLang === 'pt') {
    return browserLang;
  }

  return DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [isClient, setIsClient] = useState(false);

  // Initialize locale on client
  useEffect(() => {
    setIsClient(true);
    setLocaleState(getInitialLocale());
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const keys = key.split('.');
      let value: unknown = translations[locale];

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          // Fallback to Spanish if key not found
          value = translations.es;
          for (const fallbackK of keys) {
            if (value && typeof value === 'object' && fallbackK in value) {
              value = (value as Record<string, unknown>)[fallbackK];
            } else {
              return key; // Return key if not found
            }
          }
        }
      }

      if (typeof value !== 'string') {
        return key;
      }

      // Replace params
      if (params) {
        return value.replace(/\{(\w+)\}/g, (_, paramKey) =>
          String(params[paramKey] ?? `{${paramKey}}`)
        );
      }

      return value;
    },
    [locale]
  );

  const currentLocale = locales.find((l) => l.code === locale) || locales[0];

  // Set initial lang attribute
  useEffect(() => {
    if (isClient) {
      document.documentElement.lang = locale;
    }
  }, [locale, isClient]);

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        locales,
        currentLocale,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

// =============================================================================
// Hooks
// =============================================================================

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

export function useTranslation() {
  const { t, locale } = useI18n();
  return { t, locale };
}

// =============================================================================
// Utility Functions
// =============================================================================

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatTime(time: string, locale: Locale): string {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes);

  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: locale === 'en',
  }).format(date);
}

export function formatCurrency(
  amount: number,
  locale: Locale,
  currency: string = 'USD'
): string {
  const currencyMap: Record<Locale, string> = {
    es: 'ARS',
    en: 'USD',
    pt: 'BRL',
  };

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency || currencyMap[locale],
  }).format(amount);
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatRelativeTime(
  date: Date,
  locale: Locale
): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(days) > 0) {
    return rtf.format(days, 'day');
  }
  if (Math.abs(hours) > 0) {
    return rtf.format(hours, 'hour');
  }
  if (Math.abs(minutes) > 0) {
    return rtf.format(minutes, 'minute');
  }
  return rtf.format(seconds, 'second');
}
