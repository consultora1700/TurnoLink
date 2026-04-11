'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Loader2, Check, AlertCircle, Search } from 'lucide-react';

export interface SelectedAddress {
  formattedAddress: string;
  street?: string;
  streetNumber?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  lat?: number;
  lng?: number;
  placeId?: string;
}

interface HereSuggestion {
  id: string;
  title: string;
  resultType?: string;
  address?: {
    label?: string;
    countryName?: string;
    state?: string;
    county?: string;
    city?: string;
    district?: string;
    street?: string;
    houseNumber?: string;
    postalCode?: string;
  };
  position?: { lat: number; lng: number };
}

interface Props {
  value: string;
  onChange: (text: string) => void;
  onSelect: (address: SelectedAddress | null) => void;
  placeholder?: string;
  className?: string;
  inputStyle?: React.CSSProperties;
  /** ISO3 país. Por defecto Argentina. */
  countryCode?: string;
}

const HERE_AUTOSUGGEST_URL =
  'https://autosuggest.search.hereapi.com/v1/autosuggest';

/**
 * Input con autocompletado de direcciones usando HERE Maps Autosuggest.
 * - Restringido a Argentina por defecto.
 * - Devuelve dirección formateada + lat/lng + componentes.
 * - Si no hay API key configurada, cae a un input normal con un aviso.
 */
export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Empezá a escribir tu dirección...',
  className = '',
  inputStyle,
  countryCode = 'ARG',
}: Props) {
  const apiKey = process.env.NEXT_PUBLIC_HERE_API_KEY;

  const [suggestions, setSuggestions] = useState<HereSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'selected' | 'unavailable'>(
    apiKey ? 'idle' : 'unavailable',
  );
  const [highlight, setHighlight] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (!apiKey) return;
      if (query.trim().length < 3) {
        setSuggestions([]);
        return;
      }

      // Abortar request anterior
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      try {
        // HERE Autosuggest necesita un punto de referencia (`at`).
        // Usamos el centro aproximado de Argentina (Córdoba) — funciona bien para todo el país.
        const params = new URLSearchParams({
          q: query,
          at: '-34.6037,-58.3816', // Buenos Aires como bias inicial
          in: `countryCode:${countryCode}`,
          limit: '6',
          lang: 'es-AR',
          apiKey,
        });

        const res = await fetch(`${HERE_AUTOSUGGEST_URL}?${params}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            console.error('[AddressAutocomplete] HERE API key inválida');
            setStatus('unavailable');
          }
          setSuggestions([]);
          return;
        }
        const data = await res.json();
        // Filtramos a tipos de resultado relevantes para entrega: street + houseNumber + place
        const items: HereSuggestion[] = (data.items || []).filter(
          (i: HereSuggestion) =>
            i.resultType === 'houseNumber' ||
            i.resultType === 'street' ||
            i.resultType === 'place' ||
            i.resultType === 'locality' ||
            i.address,
        );
        setSuggestions(items);
        setOpen(items.length > 0);
        setHighlight(-1);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('[AddressAutocomplete] HERE fetch error', err);
        }
      } finally {
        setLoading(false);
      }
    },
    [apiKey, countryCode],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    onChange(v);
    if (status === 'selected') {
      setStatus('idle');
      onSelect(null);
    }
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(v);
    }, 280);
  };

  const handleSelect = (s: HereSuggestion) => {
    if (!s.position) return;
    const a = s.address || {};
    const formatted =
      a.label ||
      [
        [a.street, a.houseNumber].filter(Boolean).join(' '),
        a.district,
        a.city,
        a.state,
      ]
        .filter(Boolean)
        .join(', ');

    const result: SelectedAddress = {
      formattedAddress: formatted,
      street: a.street,
      streetNumber: a.houseNumber,
      city: a.city || a.district || a.county,
      province: a.state,
      postalCode: a.postalCode,
      country: a.countryName,
      lat: s.position.lat,
      lng: s.position.lng,
      placeId: s.id,
    };

    onChange(formatted);
    onSelect(result);
    setStatus('selected');
    setOpen(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      if (highlight >= 0 && highlight < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[highlight]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const StatusIcon = () => {
    if (loading)
      return <Loader2 className="h-4 w-4 animate-spin text-slate-400" />;
    if (status === 'selected')
      return <Check className="h-4 w-4 text-emerald-500" />;
    if (status === 'unavailable')
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
    return <MapPin className="h-4 w-4 text-slate-400" />;
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="absolute left-3 top-[1.1rem] -translate-y-1/2 pointer-events-none z-10">
        <StatusIcon />
      </div>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        placeholder={
          status === 'unavailable'
            ? 'Escribí tu dirección completa'
            : placeholder
        }
        className={`pl-10 ${className}`}
        style={inputStyle}
        autoComplete="off"
        spellCheck={false}
      />

      {/* Dropdown de sugerencias */}
      {open && suggestions.length > 0 && (
        <div
          className="absolute z-50 left-0 right-0 mt-1 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-xl overflow-hidden"
          style={{ maxHeight: 320, overflowY: 'auto' }}
        >
          {suggestions.map((s, i) => {
            const isHighlight = i === highlight;
            const a = s.address || {};
            const primary =
              [a.street, a.houseNumber].filter(Boolean).join(' ') || s.title;
            const secondary = [a.district, a.city, a.state]
              .filter(Boolean)
              .join(', ');
            return (
              <button
                key={s.id || i}
                type="button"
                onClick={() => handleSelect(s)}
                onMouseEnter={() => setHighlight(i)}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors border-b border-slate-100 dark:border-neutral-800 last:border-b-0 ${
                  isHighlight
                    ? 'bg-slate-100 dark:bg-neutral-800'
                    : 'hover:bg-slate-50 dark:hover:bg-neutral-800/50'
                }`}
              >
                <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {primary}
                  </p>
                  {secondary && (
                    <p className="text-xs text-slate-500 dark:text-neutral-400 truncate mt-0.5">
                      {secondary}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Mensajes de estado */}
      {status === 'unavailable' && (
        <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Buscador de direcciones no disponible — escribí tu dirección completa.
        </p>
      )}
      {status === 'idle' && value.length >= 3 && !loading && suggestions.length === 0 && apiKey && (
        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
          <Search className="h-3 w-3" />
          Sin resultados — probá con calle y número.
        </p>
      )}
      {status === 'idle' && value.length > 0 && apiKey && (
        <p className="text-[11px] text-amber-600 mt-1">
          Elegí una sugerencia para confirmar la dirección.
        </p>
      )}
      {status === 'selected' && (
        <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
          <Check className="h-3 w-3" />
          Dirección verificada
        </p>
      )}
    </div>
  );
}
