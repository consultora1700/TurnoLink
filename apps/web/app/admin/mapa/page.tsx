'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Loader2,
  MapPin,
  Building2,
  Users,
  RefreshCw,
  Layers,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminApi, MapBusiness, MapProfessional } from '@/lib/admin-api';
import { cn } from '@/lib/utils';

const AdminMap = dynamic(() => import('@/components/admin/map/AdminMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-muted/30">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <Globe className="h-10 w-10 text-muted-foreground/40 animate-pulse" />
          <Loader2 className="h-5 w-5 animate-spin text-primary absolute -bottom-1 -right-1" />
        </div>
        <span className="text-sm text-muted-foreground">Cargando mapa...</span>
      </div>
    </div>
  ),
});

type FilterType = 'all' | 'business' | 'professional';

export default function MapaPage() {
  const [businesses, setBusinesses] = useState<MapBusiness[]>([]);
  const [professionals, setProfessionals] = useState<MapProfessional[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getMapEntities();
      setBusinesses(data.businesses);
      setProfessionals(data.professionals);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos del mapa');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredBusinesses = useMemo(
    () => (filter === 'professional' ? [] : businesses),
    [filter, businesses]
  );

  const filteredProfessionals = useMemo(
    () => (filter === 'business' ? [] : professionals),
    [filter, professionals]
  );

  const visibleCount = filteredBusinesses.length + filteredProfessionals.length;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="rounded-2xl bg-destructive/5 p-6 text-center">
          <MapPin className="h-10 w-10 text-destructive/40 mx-auto mb-3" />
          <p className="text-destructive font-medium mb-1">Error al cargar el mapa</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/90 to-primary flex items-center justify-center shadow-sm">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            Mapa de Entidades
          </h1>
          <p className="text-muted-foreground text-sm mt-1 ml-[46px]">
            Distribución geográfica de la plataforma
          </p>
        </div>

        <Button
          onClick={loadData}
          variant="ghost"
          size="sm"
          disabled={loading}
          className="self-start sm:self-auto"
        >
          <RefreshCw className={cn('h-4 w-4 mr-1.5', loading && 'animate-spin')} />
          Actualizar
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'relative rounded-xl border p-3 sm:p-4 transition-all duration-200 text-left group',
            filter === 'all'
              ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm'
              : 'border-border bg-card hover:border-primary/30 hover:shadow-sm'
          )}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={cn(
              'h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
            )}>
              <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold tabular-nums">{businesses.length + professionals.length}</p>
              <p className="text-xs text-muted-foreground truncate">Todos</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setFilter('business')}
          className={cn(
            'relative rounded-xl border p-3 sm:p-4 transition-all duration-200 text-left group',
            filter === 'business'
              ? 'border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/20 shadow-sm'
              : 'border-border bg-card hover:border-blue-500/30 hover:shadow-sm'
          )}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={cn(
              'h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
              filter === 'business'
                ? 'bg-blue-500 text-white'
                : 'bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20'
            )}>
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold tabular-nums">{businesses.length}</p>
              <p className="text-xs text-muted-foreground truncate">Comercios</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setFilter('professional')}
          className={cn(
            'relative rounded-xl border p-3 sm:p-4 transition-all duration-200 text-left group',
            filter === 'professional'
              ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/20 shadow-sm'
              : 'border-border bg-card hover:border-emerald-500/30 hover:shadow-sm'
          )}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={cn(
              'h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
              filter === 'professional'
                ? 'bg-emerald-500 text-white'
                : 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20'
            )}>
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-bold tabular-nums">{professionals.length}</p>
              <p className="text-xs text-muted-foreground truncate">Profesionales</p>
            </div>
          </div>
        </button>
      </div>

      {/* Map container — z-index: 0 forces it below sidebar z-50 */}
      <div className="relative rounded-xl border bg-card overflow-hidden shadow-sm" style={{ zIndex: 0 }}>
        {/* Floating legend */}
        <div className="absolute top-3 right-3 z-[10] bg-white/90 dark:bg-card/90 backdrop-blur-md rounded-lg border shadow-sm px-3 py-2 flex items-center gap-3 text-xs pointer-events-none">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/30" />
            <span className="text-muted-foreground font-medium">Comercios</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/30" />
            <span className="text-muted-foreground font-medium">Profesionales</span>
          </div>
        </div>

        {/* Floating counter */}
        <div className="absolute bottom-3 left-3 z-[10] bg-white/90 dark:bg-card/90 backdrop-blur-md rounded-lg border shadow-sm px-3 py-1.5 pointer-events-none">
          <span className="text-xs text-muted-foreground font-medium tabular-nums">
            {visibleCount} ubicaciones visibles
          </span>
        </div>

        {/* Map */}
        <div className="h-[calc(100vh-340px)] min-h-[450px]">
          {loading ? (
            <div className="flex items-center justify-center h-full bg-muted/20">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <Globe className="h-10 w-10 text-muted-foreground/30 animate-pulse" />
                  <Loader2 className="h-5 w-5 animate-spin text-primary absolute -bottom-1 -right-1" />
                </div>
                <span className="text-sm text-muted-foreground">Cargando ubicaciones...</span>
              </div>
            </div>
          ) : (
            <AdminMap
              businesses={filteredBusinesses}
              professionals={filteredProfessionals}
            />
          )}
        </div>
      </div>
    </div>
  );
}
