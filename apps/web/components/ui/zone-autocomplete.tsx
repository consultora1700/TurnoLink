'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Badge } from '@/components/ui/badge';
import { Loader2, X, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GeoRefLocalidad {
  nombre: string;
  provincia: { nombre: string };
  departamento?: { nombre: string };
}

interface ZoneAutocompleteProps {
  values: string[];
  onChange: (zones: string[]) => void;
  placeholder?: string;
}

export function ZoneAutocomplete({
  values,
  onChange,
  placeholder = 'Buscar zona...',
}: ZoneAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeoRefLocalidad[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        nombre: q,
        max: '8',
        campos: 'nombre,provincia.nombre,departamento.nombre',
      });
      const res = await fetch(
        `https://apis.datos.gob.ar/georef/api/localidades?${params}`
      );
      if (!res.ok) throw new Error('GeoRef error');
      const data = await res.json();
      setSuggestions(data.localidades || []);
      setIsOpen(true);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions(debouncedQuery);
  }, [debouncedQuery, fetchSuggestions]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addZone = (zone: string) => {
    const trimmed = zone.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const removeZone = (zone: string) => {
    onChange(values.filter((z) => z !== zone));
  };

  const handleSelect = (loc: GeoRefLocalidad) => {
    const formatted = `${loc.nombre}, ${loc.provincia.nombre}`;
    addZone(formatted);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (query.trim()) {
        addZone(query);
      }
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'flex w-full rounded-md border border-input bg-background pl-9 pr-9 text-sm ring-offset-background',
            'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'h-11 sm:h-10'
          )}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          {suggestions.length > 0 ? (
            <ul className="max-h-[240px] overflow-y-auto">
              {suggestions.map((loc, idx) => {
                const formatted = `${loc.nombre}, ${loc.provincia.nombre}`;
                const alreadyAdded = values.includes(formatted);
                return (
                  <li
                    key={`${loc.nombre}-${loc.provincia.nombre}-${idx}`}
                    onClick={() => !alreadyAdded && handleSelect(loc)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-3 sm:py-2 text-sm cursor-pointer',
                      'hover:bg-accent hover:text-accent-foreground',
                      alreadyAdded && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>
                      <span className="font-medium">{loc.nombre}</span>
                      <span className="text-muted-foreground">
                        , {loc.provincia.nombre}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-3 py-3 sm:py-2 text-sm text-muted-foreground">
              No se encontraron zonas
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {values.map((zone) => (
            <Badge key={zone} variant="outline" className="pr-1">
              {zone}
              <button
                onClick={() => removeZone(zone)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
