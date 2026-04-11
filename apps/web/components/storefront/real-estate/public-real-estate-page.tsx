'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Search, X, SlidersHorizontal, ChevronDown, ArrowUpDown, MapPin, Building2, ChevronRight, Shield, Award, Clock, Layers, TrendingUp, ArrowRight, CheckCircle2, Calendar, ChevronLeft, MessageCircle, Heart } from 'lucide-react';
import { publicApi } from '@/lib/api';
import { useFavorites } from '@/lib/hooks/use-favorites';
import { PublicThemeWrapper } from '@/components/booking/public-theme-wrapper';
import type { TenantPublic, Product, ProductCategory, TenantBranding } from '@/lib/api';
import { usePropertyFilters, type OperationType, type SortOption } from '@/lib/hooks/use-property-filters';
import { getAttrValue, inferPropertyAttrs } from '@/lib/property-utils';
import { RealEstateHeader } from './real-estate-header';
import { RealEstateHero } from './real-estate-hero';
import { PropertyCard } from './property-card';
import { RealEstateFooter } from './real-estate-footer';
import { normalizePhoneForWhatsApp } from '@/lib/property-utils';

interface DevelopmentProject {
  name: string;
  slug: string;
  description?: string;
  address?: string;
  city?: string;
  progressPercent: number;
  status: string;
  coverImage?: string;
  totalUnits: number;
  latitude?: number | null;
  longitude?: number | null;
  _count?: { units: number };
}

interface Props {
  tenant: TenantPublic;
  slug: string;
  products: Product[];
  categories: ProductCategory[];
  branding?: TenantBranding | null;
  developments?: DevelopmentProject[];
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'reciente', label: 'Más reciente' },
  { value: 'precio-asc', label: 'Menor precio' },
  { value: 'precio-desc', label: 'Mayor precio' },
  { value: 'superficie', label: 'Mayor superficie' },
];

export function PublicRealEstatePage({ tenant, slug, products, categories, branding, developments = [] }: Props) {
  const settings = tenant.settings as any;
  const primaryColor = settings?.primaryColor || branding?.primaryColor || '#111827';
  const whatsappNumber = tenant.phone ? normalizePhoneForWhatsApp(tenant.phone) : '';
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'sections' | 'grid' | 'developments' | 'favorites'>('sections');
  const resultsRef = useRef<HTMLDivElement>(null);
  const { favorites } = useFavorites();

  const favoriteProducts = useMemo(
    () => products.filter((p) => favorites.includes(p.id)),
    [products, favorites],
  );

  // Development modal state
  const [devModalOpen, setDevModalOpen] = useState(false);
  const [devDetail, setDevDetail] = useState<any>(null);
  const [devLoading, setDevLoading] = useState(false);
  const [devGalleryIdx, setDevGalleryIdx] = useState(0);

  const handleOpenDevModal = useCallback(async (devSlug: string) => {
    setDevModalOpen(true);
    setDevLoading(true);
    setDevDetail(null);
    setDevGalleryIdx(0);
    document.body.style.overflow = 'hidden';
    try {
      const detail = await publicApi.getDevelopment(slug, devSlug);
      setDevDetail(detail);
    } catch (e) { console.error(e); }
    finally { setDevLoading(false); }
  }, [slug, publicApi]);

  const closeDevModal = useCallback(() => {
    setDevModalOpen(false);
    setDevDetail(null);
    document.body.style.overflow = '';
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape' && devModalOpen) closeDevModal(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [devModalOpen, closeDevModal]);

  const {
    filters, filterOptions, filteredProducts,
    updateFilter, clearFilters, activeFilterCount, totalCount,
  } = usePropertyFilters(products);

  const handleHeroSearch = useCallback((params: {
    operacion: OperationType; barrio: string; tipoPropiedad: string; ambientes: string;
  }) => {
    if (params.operacion === 'Desarrollo') {
      setViewMode('developments');
      requestAnimationFrame(() => {
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      });
      return;
    }
    updateFilter('operacion', params.operacion);
    updateFilter('barrio', params.barrio);
    updateFilter('tipoPropiedad', params.tipoPropiedad);
    updateFilter('ambientes', params.ambientes);
    setViewMode('grid');
    requestAnimationFrame(() => {
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    });
  }, [updateFilter]);

  const hasActiveFilters = activeFilterCount > 0 || filters.search;
  const showSections = viewMode === 'sections' && !hasActiveFilters;

  // Helper: get attribute with name-inference fallback
  const getProductAttr = useCallback((p: Product, key: string): string | undefined => {
    const direct = getAttrValue(p.attributes as any, key);
    if (direct) return direct;
    const inferred = inferPropertyAttrs(p.name, p.attributes as any);
    if (key === 'operacion') return inferred.operacion;
    if (key === 'tipo_propiedad') return inferred.tipoPropiedad;
    if (key === 'barrio') return inferred.barrio;
    return undefined;
  }, []);

  const productsByOperation = useMemo(() => {
    const venta: Product[] = [], alquiler: Product[] = [], temporario: Product[] = [], desarrollo: Product[] = [];
    products.forEach(p => {
      const op = getProductAttr(p, 'operacion');
      if (op === 'Alquiler temporario') temporario.push(p);
      else if (op === 'Alquiler') alquiler.push(p);
      else if (op === 'Desarrollo' || op === 'Emprendimiento') desarrollo.push(p);
      else venta.push(p);
    });
    return { venta, alquiler, temporario, desarrollo };
  }, [products, getProductAttr]);

  const barrioGroups = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach(p => {
      const b = getProductAttr(p, 'barrio');
      if (b) map.set(b, (map.get(b) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [products, getProductAttr]);

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    if (filters.operacion !== 'todos') chips.push({ key: 'op', label: filters.operacion, onRemove: () => updateFilter('operacion', 'todos') });
    if (filters.barrio) chips.push({ key: 'barrio', label: filters.barrio, onRemove: () => updateFilter('barrio', '') });
    if (filters.tipoPropiedad) chips.push({ key: 'tipo', label: filters.tipoPropiedad, onRemove: () => updateFilter('tipoPropiedad', '') });
    if (filters.ambientes) chips.push({ key: 'amb', label: `${filters.ambientes} amb`, onRemove: () => updateFilter('ambientes', '') });
    if (filters.dormitorios) chips.push({ key: 'dorm', label: `${filters.dormitorios} dorm`, onRemove: () => updateFilter('dormitorios', '') });
    if (filters.aptoCredito) chips.push({ key: 'credito', label: 'Apto Crédito', onRemove: () => updateFilter('aptoCredito', false) });
    if (filters.precioMin !== null || filters.precioMax !== null) {
      const label = filters.precioMin && filters.precioMax ? `$${filters.precioMin.toLocaleString('es-AR')} - $${filters.precioMax.toLocaleString('es-AR')}` : filters.precioMin ? `Desde $${filters.precioMin.toLocaleString('es-AR')}` : `Hasta $${filters.precioMax!.toLocaleString('es-AR')}`;
      chips.push({ key: 'precio', label, onRemove: () => { updateFilter('precioMin', null); updateFilter('precioMax', null); } });
    }
    return chips;
  }, [filters, updateFilter]);

  const selectClasses = 'px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none cursor-pointer';

  const handleBarrioClick = (barrio: string) => { updateFilter('barrio', barrio); setViewMode('grid'); };
  const handleOperationClick = (op: OperationType) => { updateFilter('operacion', op); setViewMode('grid'); };

  const handleHeaderNavigate = useCallback((section: string) => {
    if (section === 'about') {
      const aboutEl = document.getElementById('about-section');
      if (aboutEl) aboutEl.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (section === 'favorites') {
      setViewMode('favorites');
      clearFilters();
      requestAnimationFrame(() => {
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      });
      return;
    }
    if (section === 'Desarrollo') {
      setViewMode('developments');
      clearFilters();
      requestAnimationFrame(() => {
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      });
      return;
    }
    // Treat as operation filter
    updateFilter('operacion', section as OperationType);
    setViewMode('grid');
    requestAnimationFrame(() => {
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    });
  }, [updateFilter, clearFilters]);

  // Section renderer helper
  const renderSection = (title: string, subtitle: string, items: Product[], op: OperationType) => {
    if (items.length === 0) return null;
    return (
      <section className="pt-12 md:pt-14">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>{title}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
          </div>
          {items.length > 6 && (
            <button onClick={() => handleOperationClick(op)} className="flex items-center gap-0.5 text-sm font-semibold hover:brightness-110 transition-colors" style={{ color: primaryColor }}>
              Ver todas <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {items.slice(0, 6).map(product => (
            <PropertyCard key={product.id} product={product} slug={slug} primaryColor={primaryColor} whatsappNumber={whatsappNumber} />
          ))}
        </div>
      </section>
    );
  };

  return (
    <PublicThemeWrapper
      tenantSlug={slug}
      colors={{ primaryColor, secondaryColor: settings?.secondaryColor || branding?.secondaryColor, accentColor: settings?.accentColor || branding?.accentColor }}
      enableDarkMode={false}
      themeMode="light"
    >
      <div className="min-h-screen" style={{ backgroundColor: '#F0EBE3' }}>
        <RealEstateHeader tenant={tenant} slug={slug} primaryColor={primaryColor} transparent onNavigate={handleHeaderNavigate} hasDevelopments={developments.length > 0} branding={branding} />

        <RealEstateHero
          tenantName={tenant.name}
          coverImage={tenant.coverImage}
          headline={settings?.heroHeadline || 'Encontrá tu próximo hogar'}
          productCount={totalCount}
          primaryColor={primaryColor}
          onSearch={handleHeroSearch}
          barrios={filterOptions.barrios}
          tipos={filterOptions.tipos}
        />

        {/* ═══ SECTIONS MODE ═══ */}
        {/* ═══ DEVELOPMENTS MODE ═══ */}
        {viewMode === 'developments' && (
          <div ref={resultsRef} className="max-w-[1280px] mx-auto px-4 md:px-6 pt-6 pb-16">
            <button onClick={() => { clearFilters(); setViewMode('sections'); }} className="mb-4 text-sm text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1">
              ← Volver a la portada
            </button>
            {developments.length > 0 ? (
              <DevelopmentsSection
                developments={developments}
                primaryColor={primaryColor}
                onOpenDev={handleOpenDevModal}
              />
            ) : (
              <div className="text-center py-24">
                <div className="h-20 w-20 rounded-2xl bg-white flex items-center justify-center mx-auto mb-5 border border-gray-100">
                  <Building2 className="h-8 w-8 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No hay desarrollos disponibles</h3>
                <p className="text-sm text-gray-400 mb-5">Pronto tendremos novedades</p>
                <button onClick={() => setViewMode('sections')} className="px-6 py-2.5 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
                  Ver propiedades
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══ FAVORITES MODE ═══ */}
        {viewMode === 'favorites' && (
          <div ref={resultsRef} className="max-w-[1280px] mx-auto px-4 md:px-6 pt-6 pb-16">
            <button
              onClick={() => { clearFilters(); setViewMode('sections'); }}
              className="mb-4 text-sm text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1"
            >
              ← Volver a la portada
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div
                className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
              >
                <Heart className="h-5 w-5" fill="currentColor" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>
                  Mis favoritos
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {favoriteProducts.length === 0
                    ? 'Todavía no guardaste propiedades'
                    : `${favoriteProducts.length} propiedad${favoriteProducts.length !== 1 ? 'es' : ''} guardada${favoriteProducts.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            {favoriteProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {favoriteProducts.map((product) => (
                  <PropertyCard
                    key={product.id}
                    product={product}
                    slug={slug}
                    primaryColor={primaryColor}
                    whatsappNumber={whatsappNumber}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 rounded-2xl border border-dashed border-stone-300" style={{ backgroundColor: '#FAF8F5' }}>
                <div className="h-20 w-20 rounded-2xl bg-white flex items-center justify-center mx-auto mb-5 border border-stone-200">
                  <Heart className="h-8 w-8 text-stone-300" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">Tu lista está vacía</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto px-4">
                  Tocá el corazón en cualquier propiedad para guardarla y volver a verla cuando quieras.
                </p>
                <button
                  onClick={() => setViewMode('sections')}
                  className="px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{ backgroundColor: primaryColor }}
                >
                  Explorar propiedades
                </button>
              </div>
            )}
          </div>
        )}

        {viewMode !== 'developments' && viewMode !== 'favorites' && (showSections ? (
          <div className="max-w-[1280px] mx-auto px-4 md:px-6 pb-16">
            {renderSection(
              'Propiedades en Venta',
              `${productsByOperation.venta.length} disponible${productsByOperation.venta.length !== 1 ? 's' : ''}`,
              productsByOperation.venta, 'Venta'
            )}

            {renderSection(
              'Propiedades en Alquiler',
              `${productsByOperation.alquiler.length} disponible${productsByOperation.alquiler.length !== 1 ? 's' : ''}`,
              productsByOperation.alquiler, 'Alquiler'
            )}

            {renderSection(
              'Alquiler Temporario',
              `${productsByOperation.temporario.length} disponible${productsByOperation.temporario.length !== 1 ? 's' : ''}`,
              productsByOperation.temporario, 'Alquiler temporario'
            )}

            {/* Desarrollos — en la portada si hay datos */}
            {developments.length > 0 && (
              <DevelopmentsSection
                developments={developments}
                primaryColor={primaryColor}
                onOpenDev={handleOpenDevModal}
              />
            )}

            {/* Barrios */}
            {barrioGroups.length > 1 && (
              <section className="pt-14 md:pt-16">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1" style={{ letterSpacing: '-0.02em' }}>
                  Explorá por Barrio
                </h2>
                <p className="text-sm text-gray-400 mb-6">Propiedades en las zonas más buscadas</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {barrioGroups.map(([barrio, count]) => (
                    <button
                      key={barrio}
                      onClick={() => handleBarrioClick(barrio)}
                      className="group flex items-center gap-3 p-4 rounded-xl border border-stone-200/60 hover:border-stone-300 transition-all hover:shadow-md text-left" style={{ backgroundColor: '#FAF8F5' }}
                    >
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${primaryColor}0D` }}>
                        <MapPin className="h-5 w-5" style={{ color: primaryColor }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{barrio}</p>
                        <p className="text-xs text-gray-400">{count} propiedad{count !== 1 ? 'es' : ''}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Trust band */}
            <section className="pt-14 md:pt-16">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-4 p-5 rounded-xl border border-stone-200/60" style={{ backgroundColor: '#FAF8F5' }}>
                  <div className="h-11 w-11 rounded-lg flex items-center justify-center shrink-0 bg-blue-50">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Operaciones seguras</p>
                    <p className="text-xs text-gray-400 mt-0.5">Asesoramiento profesional en cada paso</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-5 rounded-xl border border-stone-200/60" style={{ backgroundColor: '#FAF8F5' }}>
                  <div className="h-11 w-11 rounded-lg flex items-center justify-center shrink-0 bg-amber-50">
                    <Award className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Corredor matriculado</p>
                    <p className="text-xs text-gray-400 mt-0.5">Habilitación profesional vigente</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-5 rounded-xl border border-stone-200/60" style={{ backgroundColor: '#FAF8F5' }}>
                  <div className="h-11 w-11 rounded-lg flex items-center justify-center shrink-0 bg-emerald-50">
                    <Clock className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Respuesta inmediata</p>
                    <p className="text-xs text-gray-400 mt-0.5">Te respondemos en minutos por WhatsApp</p>
                  </div>
                </div>
              </div>
            </section>

            {/* About */}
            {tenant.description && (
              <section id="about-section" className="pt-10">
                <div className="rounded-2xl border border-stone-200/60 p-6 md:p-8 flex flex-col md:flex-row gap-5 items-start" style={{ backgroundColor: '#FAF8F5' }}>
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${primaryColor}0D` }}>
                    <Building2 className="h-6 w-6" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Sobre {tenant.name}</h2>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">{tenant.description}</p>
                  </div>
                </div>
              </section>
            )}

            {/* CTA */}
            <div className="pt-10 text-center">
              <button
                onClick={() => setViewMode('grid')}
                className="px-8 py-3 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
                style={{ backgroundColor: primaryColor }}
              >
                Ver todas las propiedades ({totalCount})
              </button>
            </div>
          </div>
        ) : (
          /* ═══ GRID MODE ═══ */
          <div ref={resultsRef} className="max-w-[1280px] mx-auto px-4 md:px-6 pt-6 pb-12">
            {!hasActiveFilters && (
              <button onClick={() => { clearFilters(); setViewMode('sections'); }} className="mb-3 text-sm text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1">
                ← Volver a la portada
              </button>
            )}

            {/* Toolbar */}
            <div className="sticky top-[64px] md:top-[72px] z-20 -mx-4 md:-mx-6 px-4 md:px-6 py-3 backdrop-blur-lg border-b border-gray-200/50 mb-6" style={{ backgroundColor: 'rgba(240,235,227,0.95)' }}>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text" placeholder="Buscar..." value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 rounded-full border border-gray-200 bg-white text-sm focus:outline-none transition-all"
                    style={{ boxShadow: filters.search ? `0 0 0 2px ${primaryColor}30` : undefined, borderColor: filters.search ? primaryColor : undefined }}
                  />
                  {filters.search && (
                    <button onClick={() => updateFilter('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full bg-gray-200">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <div className="hidden md:flex items-center gap-1.5">
                  {(['todos', 'Venta', 'Alquiler', 'Alquiler temporario'] as OperationType[]).map(op => (
                    <button key={op} onClick={() => updateFilter('operacion', op)}
                      className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${filters.operacion === op ? 'text-white' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'}`}
                      style={filters.operacion === op ? { backgroundColor: primaryColor } : undefined}
                    >
                      {op === 'todos' ? 'Todas' : op === 'Alquiler temporario' ? 'Temp.' : op}
                    </button>
                  ))}
                  {developments.length > 0 && (
                    <button onClick={() => { setViewMode('developments'); requestAnimationFrame(() => setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)); }}
                      className="px-3.5 py-2 rounded-full text-xs font-semibold transition-all bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
                    >
                      Desarrollos
                    </button>
                  )}
                </div>

                <button onClick={() => updateFilter('aptoCredito', !filters.aptoCredito)}
                  className={`hidden md:flex items-center px-3.5 py-2 rounded-full text-xs font-semibold transition-all border ${filters.aptoCredito ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                >Apto Crédito</button>

                <div className="relative hidden md:block">
                  <select value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value as SortOption)} className={`pr-8 ${selectClasses} rounded-full`}>
                    {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                </div>

                <button onClick={() => setShowAdvancedFilters(f => !f)}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all border ${showAdvancedFilters || activeFilterCount > 0 ? 'border-gray-400 text-gray-800 bg-gray-100' : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-100'}`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Más filtros</span>
                  <span className="sm:hidden">Filtros</span>
                  {activeFilterCount > 0 && (
                    <span className="h-5 min-w-[20px] flex items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: primaryColor }}>{activeFilterCount}</span>
                  )}
                </button>
              </div>

              {showAdvancedFilters && (
                <div className="mt-3 pt-3 border-t border-gray-200/50 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="md:hidden">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Operación</label>
                    <div className="relative">
                      <select value={filters.operacion} onChange={(e) => updateFilter('operacion', e.target.value as OperationType)} className={`w-full ${selectClasses}`}>
                        <option value="todos">Todas</option><option value="Venta">Venta</option><option value="Alquiler">Alquiler</option><option value="Alquiler temporario">Temporario</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Tipo</label>
                    <div className="relative">
                      <select value={filters.tipoPropiedad} onChange={(e) => updateFilter('tipoPropiedad', e.target.value)} className={`w-full ${selectClasses}`}>
                        <option value="">Todos</option>{filterOptions.tipos.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Barrio</label>
                    <div className="relative">
                      <select value={filters.barrio} onChange={(e) => updateFilter('barrio', e.target.value)} className={`w-full ${selectClasses}`}>
                        <option value="">Todos</option>{filterOptions.barrios.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Ambientes</label>
                    <div className="flex gap-1.5">
                      {['1','2','3','4','5+'].map(a => (
                        <button key={a} onClick={() => updateFilter('ambientes', filters.ambientes === a ? '' : a)}
                          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${filters.ambientes === a ? 'text-white' : 'bg-white text-gray-500'}`}
                          style={filters.ambientes === a ? { backgroundColor: primaryColor } : undefined}
                        >{a}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Dormitorios</label>
                    <div className="flex gap-1.5">
                      {['1','2','3','4','5+'].map(d => (
                        <button key={d} onClick={() => updateFilter('dormitorios', filters.dormitorios === d ? '' : d)}
                          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${filters.dormitorios === d ? 'text-white' : 'bg-white text-gray-500'}`}
                          style={filters.dormitorios === d ? { backgroundColor: primaryColor } : undefined}
                        >{d}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Precio mín.</label>
                    <input type="number" placeholder="Desde" value={filters.precioMin ?? ''} onChange={(e) => updateFilter('precioMin', e.target.value ? Number(e.target.value) : null)} className={`w-full ${selectClasses}`} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Precio máx.</label>
                    <input type="number" placeholder="Hasta" value={filters.precioMax ?? ''} onChange={(e) => updateFilter('precioMax', e.target.value ? Number(e.target.value) : null)} className={`w-full ${selectClasses}`} />
                  </div>
                  <div className="md:hidden flex items-end">
                    <button onClick={() => updateFilter('aptoCredito', !filters.aptoCredito)}
                      className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all border ${filters.aptoCredito ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-gray-200 text-gray-500'}`}
                    >Apto Crédito</button>
                  </div>
                  <div className="md:hidden">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Ordenar</label>
                    <div className="relative">
                      <select value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value as SortOption)} className={`w-full ${selectClasses}`}>
                        {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <p className="text-sm text-gray-400 mr-1">
                  <span className="font-bold text-gray-800">{filteredProducts.length}</span> propiedad{filteredProducts.length !== 1 ? 'es' : ''}
                  {activeFilterCount > 0 && <span className="text-gray-300"> de {totalCount}</span>}
                </p>
                {activeChips.map(chip => (
                  <span key={chip.key} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border" style={{ backgroundColor: `${primaryColor}08`, borderColor: `${primaryColor}20`, color: primaryColor }}>
                    {chip.label}
                    <button onClick={chip.onRemove} className="h-3.5 w-3.5 rounded-full flex items-center justify-center hover:bg-gray-200"><X className="h-2.5 w-2.5" /></button>
                  </span>
                ))}
                {activeChips.length > 0 && (
                  <button onClick={() => { clearFilters(); setViewMode('sections'); }} className="text-xs text-gray-400 hover:text-gray-700 underline underline-offset-2">Limpiar</button>
                )}
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {filteredProducts.map(product => (
                  <PropertyCard key={product.id} product={product} slug={slug} primaryColor={primaryColor} whatsappNumber={whatsappNumber} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <div className="h-20 w-20 rounded-2xl bg-white flex items-center justify-center mx-auto mb-5 border border-gray-100">
                  <Search className="h-8 w-8 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No se encontraron propiedades</h3>
                <p className="text-sm text-gray-400 mb-5">Probá ajustando los filtros</p>
                <button onClick={() => { clearFilters(); setViewMode('sections'); }} className="px-6 py-2.5 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>
                  Volver a la portada
                </button>
              </div>
            )}
          </div>
        ))}

        <RealEstateFooter tenant={tenant} branding={branding} primaryColor={primaryColor} />
      </div>

      {/* ═══ DEVELOPMENT PROJECT MODAL ═══ */}
      {devModalOpen && (
        <DevelopmentModal
          devDetail={devDetail}
          devLoading={devLoading}
          devGalleryIdx={devGalleryIdx}
          setDevGalleryIdx={setDevGalleryIdx}
          primaryColor={primaryColor}
          whatsappNumber={whatsappNumber}
          tenantName={tenant.name}
          onClose={closeDevModal}
        />
      )}
    </PublicThemeWrapper>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   DEVELOPMENTS SECTION — Premium cards for development_projects
   ═══════════════════════════════════════════════════════════════════════ */

const DEV_STATUS_LABEL: Record<string, string> = {
  planning: 'Planificación', pre_sale: 'Preventa',
  under_construction: 'En construcción', delivered: 'Entregado',
};
const DEV_STATUS_COLOR: Record<string, string> = {
  planning: 'bg-gray-500', pre_sale: 'bg-blue-500',
  under_construction: 'bg-amber-500', delivered: 'bg-emerald-500',
};

function DevelopmentsSection({ developments, primaryColor, onOpenDev }: {
  developments: DevelopmentProject[];
  primaryColor: string;
  onOpenDev: (slug: string) => void;
}) {
  return (
    <section id="desarrollos-section" className="pt-12 md:pt-14 scroll-mt-24">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>
            Desarrollos y Emprendimientos
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {developments.length} proyecto{developments.length !== 1 ? 's' : ''} disponible{developments.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {developments.map((dev) => {
          const unitCount = dev._count?.units || dev.totalUnits || 0;
          return (
            <div
              key={dev.slug}
              onClick={() => onOpenDev(dev.slug)}
              className="group relative w-full overflow-hidden cursor-pointer rounded-2xl border border-gray-200/80 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.1)] transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row">
                {/* Image */}
                <div className="relative lg:w-[55%] xl:w-[50%] shrink-0">
                  {dev.coverImage ? (
                    <div className="relative h-56 sm:h-72 lg:h-full min-h-[280px]">
                      <Image src={dev.coverImage} alt={dev.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/5" />
                    </div>
                  ) : (
                    <div className="relative h-56 sm:h-72 lg:h-full min-h-[280px] bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50 flex items-center justify-center">
                      <Building2 className="h-16 w-16 text-gray-200" />
                    </div>
                  )}
                  {/* Status badge */}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-lg">
                      <span className={`h-2 w-2 rounded-full ${DEV_STATUS_COLOR[dev.status] || 'bg-gray-500'} animate-pulse`} />
                      <span className="text-xs font-semibold text-gray-700">{DEV_STATUS_LABEL[dev.status] || dev.status}</span>
                    </div>
                  </div>
                  {/* Mobile progress bar */}
                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 lg:hidden">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 backdrop-blur-md">
                      <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all" style={{ width: `${dev.progressPercent}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-700">{dev.progressPercent}%</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-5 sm:p-6 lg:p-8 flex flex-col justify-center">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {dev.name}
                  </h3>
                  {dev.address && (
                    <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {dev.address}{dev.city ? `, ${dev.city}` : ''}
                    </p>
                  )}
                  {dev.description && (
                    <p className="text-sm text-gray-500 mt-3 line-clamp-2 leading-relaxed">{dev.description}</p>
                  )}
                  <div className="mt-5 space-y-4">
                    {/* Desktop progress */}
                    <div className="hidden lg:block">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium text-gray-500">Avance de obra</span>
                        <span className="font-bold text-gray-900">{dev.progressPercent}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-emerald-400 transition-all duration-700" style={{ width: `${dev.progressPercent}%` }} />
                      </div>
                    </div>
                    {/* Pills */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      {unitCount > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100">
                          <Layers className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-xs font-semibold text-blue-700">{unitCount} unidades</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-xs font-semibold text-emerald-700">{dev.progressPercent}% completado</span>
                      </div>
                      <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold group-hover:underline" style={{ color: primaryColor }}>
                        Ver ficha completa
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   DEVELOPMENT MODAL — Full detail view
   ═══════════════════════════════════════════════════════════════════════ */

function DevelopmentModal({ devDetail: d, devLoading, devGalleryIdx, setDevGalleryIdx, primaryColor, whatsappNumber, tenantName, onClose }: {
  devDetail: any;
  devLoading: boolean;
  devGalleryIdx: number;
  setDevGalleryIdx: (fn: (i: number) => number) => void;
  primaryColor: string;
  whatsappNumber: string;
  tenantName: string;
  onClose: () => void;
}) {
  const UNIT_TYPE_LABELS: Record<string, string> = {
    monoambiente: 'Monoambiente', '1amb': '1 Ambiente', '2amb': '2 Ambientes', '3amb': '3 Ambientes',
    local: 'Local comercial', cochera: 'Cochera', baulera: 'Baulera',
  };
  const UNIT_STATUS_MAP: Record<string, { label: string; cls: string }> = {
    available: { label: 'Disponible', cls: 'bg-emerald-100 text-emerald-700' },
    reserved: { label: 'Reservada', cls: 'bg-amber-100 text-amber-700' },
    sold: { label: 'Vendida', cls: 'bg-blue-100 text-blue-700' },
    escriturada: { label: 'Escriturada', cls: 'bg-purple-100 text-purple-700' },
  };
  const fmtUSD = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const allImages = d ? [d.coverImage, ...(d.images || [])].filter(Boolean) : [];
  const availableUnits = d?.units?.filter((u: any) => u.status === 'available') || [];
  const amenities = d?.amenities ? (Array.isArray(d.amenities) ? d.amenities : (() => { try { return JSON.parse(d.amenities); } catch { return []; } })()) : [];
  const minPrice = d?.units?.length > 0 ? Math.min(...d.units.filter((u: any) => u.price > 0).map((u: any) => u.price)) : 0;
  const maxPrice = d?.units?.length > 0 ? Math.max(...d.units.filter((u: any) => u.price > 0).map((u: any) => u.price)) : 0;
  const contactMsg = d ? encodeURIComponent(`Hola! Me interesa el desarrollo "${d.name}". ¿Podrían darme más información?`) : '';

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto overscroll-contain">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-5xl mx-2 sm:mx-4 my-4 sm:my-6 rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.25)] ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200" style={{ backgroundColor: '#FAF8F5' }}>

        <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white/90 hover:bg-black/60 hover:text-white transition-all shadow-lg">
          <X className="h-5 w-5" />
        </button>

        {devLoading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="relative">
              <div className="h-14 w-14 rounded-full border-[3px] border-blue-500/20 border-t-blue-500 animate-spin" />
              <Building2 className="h-6 w-6 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-sm text-gray-400 mt-5 font-medium">Cargando proyecto...</p>
          </div>
        ) : d ? (
          <>
            {/* Hero Image Gallery */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[2/1] overflow-hidden rounded-t-2xl">
              {allImages.length > 0 ? (
                <>
                  {allImages.map((imgSrc: string, imgIdx: number) => (
                    <Image key={imgSrc} src={imgSrc} alt={`${d.name} ${imgIdx + 1}`} fill
                      className={`object-cover transition-opacity duration-300 pointer-events-none ${imgIdx === devGalleryIdx ? 'opacity-100' : 'opacity-0'}`}
                      sizes="(max-width: 768px) 100vw, 1120px" priority={imgIdx <= 1} loading={imgIdx <= 2 ? 'eager' : 'lazy'}
                    />
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-transparent pointer-events-none" />
                  {allImages.length > 1 && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); setDevGalleryIdx(i => i > 0 ? i - 1 : allImages.length - 1); }}
                        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-all shadow-xl">
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDevGalleryIdx(i => i < allImages.length - 1 ? i + 1 : 0); }}
                        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-all shadow-xl">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-medium tabular-nums">
                        {devGalleryIdx + 1} / {allImages.length}
                      </div>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                        {allImages.map((_: any, i: number) => (
                          <button key={i} onClick={(e) => { e.stopPropagation(); setDevGalleryIdx(() => i); }}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === devGalleryIdx ? 'w-7 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50/50">
                  <Building2 className="h-24 w-24 text-gray-200" />
                </div>
              )}
              {/* Status badge */}
              <div className="absolute top-4 left-4 sm:top-5 sm:left-5">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-xl shadow-xl">
                  <span className={`h-2.5 w-2.5 rounded-full ${DEV_STATUS_COLOR[d.status] || 'bg-gray-500'} animate-pulse`} />
                  <span className="text-sm font-bold text-gray-800">{DEV_STATUS_LABEL[d.status] || d.status}</span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 sm:px-8 lg:px-10 py-6 sm:py-8 space-y-8 sm:space-y-10">

              {/* Header: title + price */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-8">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-extrabold text-gray-900 tracking-tight leading-tight">{d.name}</h2>
                  {d.address && (
                    <p className="flex items-center gap-2 text-sm sm:text-base text-gray-500 mt-2.5">
                      <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                      {d.address}{d.city ? `, ${d.city}` : ''}
                    </p>
                  )}
                </div>
                {minPrice > 0 && (
                  <div className="shrink-0 px-5 py-3 rounded-2xl text-white shadow-lg" style={{ backgroundColor: primaryColor }}>
                    <p className="text-[11px] font-medium opacity-80 uppercase tracking-wider">{minPrice === maxPrice ? 'Precio' : 'Desde'}</p>
                    <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">{fmtUSD(minPrice)}</p>
                  </div>
                )}
              </div>

              {/* Metric cards */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="relative p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden">
                  <Layers className="h-5 w-5 text-blue-500 mb-2" />
                  <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tabular-nums">{d.totalUnits}</p>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">Unidades totales</p>
                </div>
                <div className="relative p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden">
                  <TrendingUp className="h-5 w-5 text-emerald-500 mb-2" />
                  <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tabular-nums">{d.progressPercent}<span className="text-base font-bold text-gray-400">%</span></p>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">Avance de obra</p>
                </div>
                <div className="relative p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden">
                  <CheckCircle2 className="h-5 w-5 text-violet-500 mb-2" />
                  <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tabular-nums">{availableUnits.length}</p>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">Disponibles</p>
                </div>
              </div>

              {/* Description */}
              {d.description && (
                <div className="relative">
                  <div className="absolute -left-3 sm:-left-5 top-0 bottom-0 w-1 rounded-full" style={{ background: `linear-gradient(to bottom, ${primaryColor}, #34d399)` }} />
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed pl-4 sm:pl-3">{d.description}</p>
                </div>
              )}

              {/* Amenities */}
              {amenities.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em] mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((a: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery date */}
              {d.deliveryDate && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
                  <div className="p-2.5 rounded-xl bg-amber-100"><Calendar className="h-5 w-5 text-amber-600" /></div>
                  <div>
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Fecha estimada de entrega</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{new Date(d.deliveryDate).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              )}

              {/* Progress bar */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Progreso general</span>
                  <span className="text-2xl font-extrabold text-gray-900 tabular-nums">{d.progressPercent}%</span>
                </div>
                <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-emerald-400 transition-all duration-700 relative" style={{ width: `${d.progressPercent}%` }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                  </div>
                </div>

                {/* Milestones timeline */}
                {d.milestones?.length > 0 && (
                  <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em] mb-5">Avance de obra</h4>
                    <div className="relative">
                      <div className="absolute left-[18px] top-3 bottom-3 w-px bg-gray-200" />
                      <div className="space-y-0.5">
                        {d.milestones
                          .slice()
                          .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
                          .map((m: any, i: number) => {
                            const done = m.progressPercent >= 100;
                            const active = m.progressPercent > 0 && m.progressPercent < 100;
                            return (
                              <div key={m.id || i} className="relative flex items-start gap-3.5 pl-0.5 py-2.5">
                                <div className={`relative z-10 flex items-center justify-center h-9 w-9 rounded-xl shrink-0 transition-all ${
                                  done
                                    ? 'bg-emerald-500 shadow-md shadow-emerald-500/20'
                                    : active
                                      ? 'bg-blue-500 shadow-md shadow-blue-500/20'
                                      : 'bg-gray-200'
                                }`}>
                                  {done
                                    ? <CheckCircle2 className="h-4 w-4 text-white" />
                                    : active
                                      ? <TrendingUp className="h-4 w-4 text-white" />
                                      : <Clock className="h-4 w-4 text-gray-400" />
                                  }
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                  <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-bold text-gray-800">{m.name}</p>
                                    <span className={`text-sm font-extrabold tabular-nums shrink-0 ${
                                      done ? 'text-emerald-600' : active ? 'text-blue-600' : 'text-gray-400'
                                    }`}>
                                      {m.progressPercent}%
                                    </span>
                                  </div>
                                  {m.description && (
                                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{m.description}</p>
                                  )}
                                  <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-700 ${
                                        done ? 'bg-emerald-500' : active ? 'bg-blue-500' : ''
                                      }`}
                                      style={{ width: `${m.progressPercent}%` }}
                                    />
                                  </div>
                                  {m.targetDate && (
                                    <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(m.targetDate).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Units — Premium inventory */}
              {d.units && d.units.length > 0 && (() => {
                const byFloor = new Map<string, any[]>();
                d.units.forEach((u: any) => {
                  const floor = u.floor || 'PB';
                  if (!byFloor.has(floor)) byFloor.set(floor, []);
                  byFloor.get(floor)!.push(u);
                });
                const floors = Array.from(byFloor.entries()).sort((a, b) => {
                  if (a[0] === 'PB') return -1;
                  if (b[0] === 'PB') return 1;
                  return Number(a[0]) - Number(b[0]);
                });

                const available = d.units.filter((u: any) => u.status === 'available').length;
                const reserved = d.units.filter((u: any) => u.status === 'reserved').length;
                const sold = d.units.filter((u: any) => u.status === 'sold' || u.status === 'escriturada').length;
                const total = d.units.length;

                const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; border: string; text: string; stripe: string; badgeBg: string }> = {
                  available: { label: 'Disponible', dot: 'bg-emerald-500', bg: 'bg-white', border: 'border-gray-200 hover:border-emerald-300', text: 'text-emerald-700', stripe: 'bg-emerald-500', badgeBg: 'bg-emerald-50' },
                  reserved: { label: 'Reservada', dot: 'bg-amber-500', bg: 'bg-amber-50/40', border: 'border-amber-200/60', text: 'text-amber-700', stripe: 'bg-amber-400', badgeBg: 'bg-amber-50' },
                  sold: { label: 'Vendida', dot: 'bg-blue-500', bg: 'bg-blue-50/30', border: 'border-blue-200/50', text: 'text-blue-700', stripe: 'bg-blue-400', badgeBg: 'bg-blue-50' },
                  escriturada: { label: 'Escriturada', dot: 'bg-purple-500', bg: 'bg-purple-50/30', border: 'border-purple-200/50', text: 'text-purple-700', stripe: 'bg-purple-400', badgeBg: 'bg-purple-50' },
                };

                return (
                  <div>
                    {/* Header with visual inventory bar */}
                    <div className="mb-6">
                      <div className="flex items-end justify-between mb-4">
                        <div>
                          <h3 className="text-base font-bold text-gray-900">Inventario de unidades</h3>
                          <p className="text-xs text-gray-400 mt-0.5">{total} unidades en {floors.length} planta{floors.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>

                      {/* Visual inventory bar */}
                      <div className="flex rounded-full overflow-hidden h-3 bg-gray-100 mb-3">
                        {available > 0 && <div className="bg-emerald-500 transition-all" style={{ width: `${(available/total)*100}%` }} />}
                        {reserved > 0 && <div className="bg-amber-400 transition-all" style={{ width: `${(reserved/total)*100}%` }} />}
                        {sold > 0 && <div className="bg-blue-400 transition-all" style={{ width: `${(sold/total)*100}%` }} />}
                      </div>

                      {/* Legend */}
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700">
                          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> {available} disponible{available !== 1 ? 's' : ''}
                        </span>
                        {reserved > 0 && (
                          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-amber-600">
                            <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" /> {reserved} reservada{reserved !== 1 ? 's' : ''}
                          </span>
                        )}
                        {sold > 0 && (
                          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-blue-600">
                            <span className="h-2.5 w-2.5 rounded-sm bg-blue-400" /> {sold} vendida{sold !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Floor groups */}
                    {floors.map(([floor, units]) => (
                      <div key={floor} className="mb-6 last:mb-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 text-white">
                            <Layers className="h-3.5 w-3.5" />
                            <span className="text-xs font-bold tracking-wide">
                              {floor === 'PB' ? 'PLANTA BAJA' : `PISO ${floor}`}
                            </span>
                          </div>
                          <div className="flex-1 h-px bg-gray-200" />
                          <span className="text-[11px] text-gray-400 font-medium">{units.length} unidad{units.length !== 1 ? 'es' : ''}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {units.map((u: any) => {
                            const cfg = STATUS_CONFIG[u.status] || STATUS_CONFIG.available;
                            const isAvailable = u.status === 'available';
                            const isSold = u.status === 'sold' || u.status === 'escriturada';
                            const unitMsg = encodeURIComponent(`Hola! Me interesa la unidad ${u.unitIdentifier} del proyecto "${d.name}". ¿Podrían darme más información?`);

                            // Ambientes — human readable
                            const AMB_LABEL: Record<string, string> = {
                              monoambiente: 'Monoambiente', '1amb': '1 Ambiente', '2amb': '2 Ambientes',
                              '3amb': '3 Ambientes', '4amb': '4 Ambientes', '5amb': '5 Ambientes',
                              local: 'Local', cochera: 'Cochera', baulera: 'Baulera',
                            };
                            const AMB_SHORT: Record<string, string> = {
                              monoambiente: 'Mono', '1amb': '1 amb', '2amb': '2 amb',
                              '3amb': '3 amb', '4amb': '4 amb', '5amb': '5 amb',
                              local: 'Local', cochera: 'Coch.', baulera: 'Baul.',
                            };
                            // Orientation — full name
                            const ORI_LABEL: Record<string, string> = {
                              N: 'Norte', S: 'Sur', E: 'Este', O: 'Oeste',
                              NE: 'Noreste', NO: 'Noroeste', SE: 'Sudeste', SO: 'Sudoeste',
                            };

                            const ambLabel = AMB_LABEL[u.unitType] || u.unitType;
                            const ambShort = AMB_SHORT[u.unitType] || u.unitType;
                            const oriLabel = u.orientation ? (ORI_LABEL[u.orientation] || u.orientation) : null;

                            return (
                              <div
                                key={u.id}
                                className={`group relative rounded-2xl border overflow-hidden transition-all duration-200 ${cfg.bg} ${cfg.border} ${
                                  isAvailable ? 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5' : ''
                                } ${isSold ? 'opacity-60' : ''}`}
                              >
                                {/* Top color stripe */}
                                <div className={`h-1 w-full ${cfg.stripe}`} />

                                <div className="p-4 sm:p-5">
                                  {/* Header: Unit ID + Ambientes + Status */}
                                  <div className="flex items-start justify-between mb-1">
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-xl font-black text-gray-900 tracking-tight leading-none">{u.unitIdentifier}</span>
                                      <span className="text-[10px] font-semibold text-gray-400">Piso {u.floor || 'PB'}</span>
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${cfg.badgeBg} ${cfg.text}`}>
                                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} ${isAvailable ? 'animate-pulse' : ''}`} />
                                      {cfg.label}
                                    </span>
                                  </div>

                                  {/* Ambientes — hero element */}
                                  <p className="text-[15px] font-bold text-gray-700 mb-3">{ambLabel}</p>

                                  {/* Specs row — compact pills */}
                                  <div className="flex flex-wrap gap-1.5 mb-3">
                                    {u.area && (
                                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-[11px] font-semibold text-gray-600">
                                        <svg className="h-3 w-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                                        {u.area} m² tot.
                                      </span>
                                    )}
                                    {u.supCubierta && (
                                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-[11px] font-semibold text-gray-600">
                                        {u.supCubierta} m² cub.
                                      </span>
                                    )}
                                    {oriLabel && (
                                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-[11px] font-semibold text-gray-600">
                                        <svg className="h-3 w-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>
                                        {oriLabel}
                                      </span>
                                    )}
                                    {u.floorPlanUrl && (
                                      <a href={u.floorPlanUrl} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-[11px] font-semibold text-blue-600 hover:bg-blue-100 transition-colors">
                                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                                        Ver plano
                                      </a>
                                    )}
                                  </div>

                                  {/* Price */}
                                  {u.price > 0 && (
                                    <div className={`flex items-baseline gap-1 ${isSold ? '' : 'mb-3'}`}>
                                      <span className="text-[11px] font-semibold text-gray-400">USD</span>
                                      <span className="text-2xl font-black text-gray-900 tracking-tight tabular-nums">
                                        {new Intl.NumberFormat('en-US').format(u.price)}
                                      </span>
                                    </div>
                                  )}

                                  {/* CTA */}
                                  {isAvailable && whatsappNumber && (
                                    <a
                                      href={`https://wa.me/${whatsappNumber}?text=${unitMsg}`}
                                      target="_blank" rel="noopener noreferrer"
                                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.97]"
                                      style={{ backgroundColor: primaryColor }}
                                    >
                                      <MessageCircle className="h-4 w-4" />
                                      Consultar unidad
                                    </a>
                                  )}

                                  {u.status === 'reserved' && (
                                    <div className="flex items-center gap-1.5 py-2 justify-center text-[12px] font-semibold text-amber-600">
                                      <Clock className="h-3.5 w-3.5" />
                                      Unidad reservada
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* WhatsApp CTA */}
              {whatsappNumber && (
                <div className="text-center pt-2">
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${contactMsg}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-[15px] font-bold text-white transition-all hover:shadow-lg active:scale-[0.98]"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <MessageCircle className="h-5 w-5" />
                    Consultar sobre este desarrollo
                  </a>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
