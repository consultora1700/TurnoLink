'use client';

import { ArrowRight, Timer, Clock, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice, formatDuration } from '@/lib/utils';
import { HeroStyleName } from '@/lib/hero-styles';

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  duration: number;
  image: string | null;
  images?: string[];
  imageDisplayMode?: string;
  includes: string | null;
  variations?: { id: string; label: string; type: string; required: boolean; options: { id: string; name: string; priceModifier: number; pricingType: string; durationModifier: number; }[] }[];
}

interface Props {
  service: Service;
  heroStyle: HeroStyleName;
  showPrices: boolean;
  index: number;
  onSelect: (service: Service) => void;
  onShowDetail: (service: Service) => void;
}

// ─── CLASSIC card (original pink/violet, rounded-2xl, hover translate) ──────
function ClassicCard({ service, showPrices, onSelect, onShowDetail }: Omit<Props, 'heroStyle' | 'index'>) {
  return (
    <>
      {/* Mobile */}
      <div className="md:hidden bg-white dark:bg-neutral-800/90 rounded-2xl border border-slate-100 dark:border-neutral-700/50 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden cursor-pointer active:scale-[0.99]" onClick={() => onShowDetail(service)}>
        <div className="flex gap-3.5 p-3.5">
          <div className="relative w-[108px] h-[108px] rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
            {service.image ? <img src={service.image} alt={service.name} className="w-full h-full object-cover" /> : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-100 to-violet-100 dark:from-teal-900/30 dark:to-violet-900/30"><span className="text-3xl font-bold bg-gradient-to-br from-teal-500 to-violet-500 bg-clip-text text-transparent">{service.name.charAt(0)}</span></div>
            )}
            <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm"><span className="text-[11px] font-medium text-white">{formatDuration(service.duration)}</span></div>
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base leading-snug mb-1 line-clamp-2">{service.name}</h3>
              {service.description && <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-2 mb-1">{service.description}</p>}
            </div>
            <div className="flex items-center justify-between">
              {service.price !== null && showPrices && <span className="text-lg font-bold text-slate-900 dark:text-white">{formatPrice(service.price)}</span>}
              <button type="button" onClick={(e) => { e.stopPropagation(); onSelect(service); }} className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-3.5 py-2 rounded-full hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors ml-auto">Reservar<ArrowRight className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </div>
      </div>
      {/* Desktop */}
      <Card className="hidden md:block overflow-hidden border border-slate-200/80 dark:border-neutral-700/80 shadow-sm hover:shadow-xl hover:border-teal-300 dark:hover:border-teal-600/50 transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-neutral-800 rounded-2xl cursor-pointer" onClick={() => onShowDetail(service)}>
        <div className="relative w-full h-40 lg:h-44 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-neutral-700 dark:to-neutral-800">
          {service.image ? <img src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-500/5 to-violet-500/5"><div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-teal-500/20 to-violet-500/20 flex items-center justify-center"><span className="text-3xl font-bold text-teal-500/70">{service.name.charAt(0)}</span></div></div>
          )}
          <div className="absolute top-3 left-3"><Badge className="bg-white/95 dark:bg-neutral-900/95 text-slate-700 dark:text-neutral-200 border-0 shadow-sm backdrop-blur-sm font-medium text-xs"><Timer className="h-3 w-3 mr-1" />{formatDuration(service.duration)}</Badge></div>
          {service.price !== null && showPrices && <div className="absolute top-3 right-3"><Badge className="bg-emerald-500 text-white border-0 shadow-md text-sm font-bold px-2.5 py-1">{formatPrice(service.price)}</Badge></div>}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <CardContent className="p-4 lg:p-5">
          <div className="space-y-3">
            <div><h3 className="text-base lg:text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1">{service.name}</h3>{service.description && <p className="text-muted-foreground text-sm mt-1.5 line-clamp-2 leading-relaxed">{service.description}</p>}</div>
            <Button onClick={(e) => { e.stopPropagation(); onSelect(service); }} className="w-full h-10 lg:h-11 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white font-semibold rounded-xl group-hover:bg-teal-600 dark:group-hover:bg-teal-500 dark:group-hover:text-white transition-all">Reservar<ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" /></Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// ─── CLINICAL card (clean, no image emphasis, teal border accent) ────────────
function ClinicalCard({ service, showPrices, onSelect, onShowDetail }: Omit<Props, 'heroStyle' | 'index'>) {
  return (
    <>
      {/* Mobile — clean with optional image */}
      <div className="md:hidden bg-white dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-700 overflow-hidden cursor-pointer hover:border-teal-300 dark:hover:border-teal-700 transition-colors" onClick={() => onShowDetail(service)}>
        <div className="flex gap-3.5 p-3.5">
          {service.image ? (
            <div className="w-[90px] h-[90px] rounded-lg overflow-hidden flex-shrink-0">
              <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-[90px] h-[90px] rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-teal-500/70 dark:text-teal-400/70">{service.name.charAt(0)}</span>
            </div>
          )}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base truncate mb-1">{service.name}</h3>
              {service.description && <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-2 mb-1">{service.description}</p>}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(service.duration)}</span>
                {service.price !== null && showPrices && <span className="text-sm font-bold text-teal-700 dark:text-teal-400">{formatPrice(service.price)}</span>}
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); onSelect(service); }} className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-3 py-1.5 rounded-full hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors">Reservar<ChevronRight className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </div>
      </div>
      {/* Desktop — clean card with left teal accent */}
      <Card className="hidden md:block overflow-hidden border border-slate-200 dark:border-neutral-700 shadow-sm hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-200 bg-white dark:bg-neutral-800 rounded-lg cursor-pointer" onClick={() => onShowDetail(service)}>
        <div className="flex">
          {/* Left teal stripe */}
          <div className="w-1 bg-gradient-to-b from-teal-400 to-cyan-400 flex-shrink-0" />
          <div className="flex-1 p-4 lg:p-5">
            {service.image && (
              <div className="relative w-full h-32 rounded-md overflow-hidden mb-3">
                <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2"><Badge className="bg-white/95 text-slate-700 border-0 shadow-sm text-xs"><Timer className="h-3 w-3 mr-1" />{formatDuration(service.duration)}</Badge></div>
              </div>
            )}
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white line-clamp-1">{service.name}</h3>
              {service.price !== null && showPrices && <span className="text-sm font-bold text-teal-700 dark:text-teal-400 ml-2 whitespace-nowrap">{formatPrice(service.price)}</span>}
            </div>
            {service.description && <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{service.description}</p>}
            {!service.image && <span className="text-xs text-slate-400 flex items-center gap-1 mb-3"><Clock className="h-3 w-3" />{formatDuration(service.duration)}</span>}
            <Button onClick={(e) => { e.stopPropagation(); onSelect(service); }} variant="outline" className="w-full h-9 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/30 font-medium rounded-md">Reservar turno<ChevronRight className="h-4 w-4 ml-1" /></Button>
          </div>
        </div>
      </Card>
    </>
  );
}

// ─── BOLD card (angular, dark hover, amber accents) ─────────────────────────
function BoldCard({ service, showPrices, onSelect, onShowDetail }: Omit<Props, 'heroStyle' | 'index'>) {
  return (
    <>
      {/* Mobile */}
      <div className="md:hidden bg-neutral-200 dark:bg-neutral-900 rounded-sm border border-neutral-300 dark:border-neutral-700 overflow-hidden cursor-pointer hover:border-amber-400 dark:hover:border-amber-600 transition-colors active:scale-[0.99]" onClick={() => onShowDetail(service)}>
        <div className="relative">
          {service.image ? (
            <div className="h-40 overflow-hidden"><img src={service.image} alt={service.name} className="w-full h-full object-cover" /></div>
          ) : (
            <div className="h-40 flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900"><span className="text-5xl font-black text-white/10">{service.name.charAt(0)}</span></div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-10">
            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0 space-y-1">
                <h3 className="font-bold text-white text-[15px] uppercase tracking-wide line-clamp-1 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] bg-black/25 backdrop-blur-[3px] rounded px-2 py-0.5 w-fit max-w-full">{service.name}</h3>
                <span className="text-[11px] font-medium text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] bg-black/25 backdrop-blur-[3px] rounded px-1.5 py-0.5 inline-flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{formatDuration(service.duration)}</span>
              </div>
              {service.price !== null && showPrices && <span className="text-base font-black text-amber-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] flex-shrink-0">{formatPrice(service.price)}</span>}
            </div>
          </div>
        </div>
        <div className="p-3">
          <button type="button" onClick={(e) => { e.stopPropagation(); onSelect(service); }} className="w-full bg-amber-500 dark:bg-amber-500 text-black dark:text-black text-xs font-bold uppercase tracking-wider py-2.5 rounded-sm hover:bg-amber-600 dark:hover:bg-amber-400 transition-colors">Reservar</button>
        </div>
      </div>
      {/* Desktop */}
      <Card className="hidden md:block overflow-hidden border border-neutral-300 dark:border-neutral-700 shadow-sm hover:shadow-lg hover:border-amber-400 dark:hover:border-amber-600 transition-all duration-200 bg-neutral-200 dark:bg-neutral-900 rounded-sm cursor-pointer" onClick={() => onShowDetail(service)}>
        <div className="relative w-full h-40 lg:h-44 overflow-hidden bg-neutral-200 dark:bg-neutral-700">
          {service.image ? <img src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900"><span className="text-5xl font-black text-white/10">{service.name.charAt(0)}</span></div>
          )}
          {service.price !== null && showPrices && <div className="absolute top-0 right-0 bg-amber-500 text-black font-black text-sm px-3 py-1.5">{formatPrice(service.price)}</div>}
          <div className="absolute bottom-0 left-0 bg-black/70 px-3 py-1"><span className="text-xs font-medium text-white">{formatDuration(service.duration)}</span></div>
        </div>
        <CardContent className="p-4">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white uppercase tracking-wide mb-1 line-clamp-1">{service.name}</h3>
          {service.description && <p className="text-neutral-500 dark:text-neutral-400 text-sm line-clamp-2 mb-3">{service.description}</p>}
          <Button onClick={(e) => { e.stopPropagation(); onSelect(service); }} className="w-full h-10 bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-400 text-black font-bold uppercase tracking-wider text-xs rounded-sm transition-colors">Reservar<ArrowRight className="h-4 w-4 ml-2" /></Button>
        </CardContent>
      </Card>
    </>
  );
}

// ─── ZEN card (soft, rounded-2xl, scale hover, spacious) ────────────────────
function ZenCard({ service, showPrices, onSelect, onShowDetail }: Omit<Props, 'heroStyle' | 'index'>) {
  return (
    <>
      {/* Mobile */}
      <div className="md:hidden bg-white dark:bg-neutral-800/90 rounded-2xl border border-emerald-100 dark:border-neutral-700/50 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]" onClick={() => onShowDetail(service)}>
        {service.image ? (
          <div className="w-full h-40 overflow-hidden"><img src={service.image} alt={service.name} className="w-full h-full object-cover" /></div>
        ) : (
          <div className="w-full h-28 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-200 to-teal-200 dark:from-emerald-800/40 dark:to-teal-800/40 flex items-center justify-center"><span className="text-2xl font-medium text-emerald-600 dark:text-emerald-400">{service.name.charAt(0)}</span></div>
          </div>
        )}
        <div className="p-4 text-center">
          <h3 className="font-medium text-slate-800 dark:text-white text-base mb-1.5">{service.name}</h3>
          <div className="flex items-center justify-center gap-3 text-sm text-slate-400 mb-3">
            <span>{formatDuration(service.duration)}</span>
            {service.price !== null && showPrices && <><span className="w-1 h-1 rounded-full bg-slate-300" /><span className="font-semibold text-slate-700 dark:text-neutral-200">{formatPrice(service.price)}</span></>}
          </div>
          <button type="button" onClick={(e) => { e.stopPropagation(); onSelect(service); }} className="w-full text-center text-sm text-white bg-emerald-600 dark:bg-emerald-500 font-medium py-2.5 rounded-full hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors">Reservar</button>
        </div>
      </div>
      {/* Desktop */}
      <Card className="hidden md:block overflow-hidden border border-emerald-100 dark:border-neutral-700/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-white dark:bg-neutral-800 rounded-2xl cursor-pointer" onClick={() => onShowDetail(service)}>
        <div className="relative w-full h-40 lg:h-44 overflow-hidden">
          {service.image ? <img src={service.image} alt={service.name} className="w-full h-full object-cover" /> : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20"><div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-200 to-teal-200 dark:from-emerald-800/40 dark:to-teal-800/40 flex items-center justify-center"><span className="text-2xl font-medium text-emerald-600 dark:text-emerald-400">{service.name.charAt(0)}</span></div></div>
          )}
        </div>
        <CardContent className="p-5 text-center">
          <h3 className="text-base font-medium text-slate-800 dark:text-white mb-1">{service.name}</h3>
          {service.description && <p className="text-muted-foreground text-sm line-clamp-2 mb-2 leading-relaxed">{service.description}</p>}
          <div className="flex items-center justify-center gap-3 text-xs text-slate-400 mb-4">
            <span>{formatDuration(service.duration)}</span>
            {service.price !== null && showPrices && <><span className="w-1 h-1 rounded-full bg-slate-300" /><span className="font-medium text-slate-600 dark:text-neutral-300">{formatPrice(service.price)}</span></>}
          </div>
          <Button onClick={(e) => { e.stopPropagation(); onSelect(service); }} className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-full font-medium transition-colors">Reservar</Button>
        </CardContent>
      </Card>
    </>
  );
}

// ─── CORPORATE card (compact list-style, no frills) ─────────────────────────
function CorporateCard({ service, showPrices, onSelect, onShowDetail }: Omit<Props, 'heroStyle' | 'index'>) {
  return (
    <>
      {/* Mobile — compact row */}
      <div className="md:hidden bg-white dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-700 p-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-neutral-750 transition-colors active:scale-[0.99]" onClick={() => onShowDetail(service)}>
        <div className="flex items-center gap-3.5">
          {service.image ? <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-sm"><img src={service.image} alt={service.name} className="w-full h-full object-cover" /></div> : (
            <div className="w-16 h-16 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0"><span className="text-lg font-bold text-blue-600 dark:text-blue-400">{service.name.charAt(0)}</span></div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white text-[15px] truncate mb-0.5">{service.name}</h3>
            <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(service.duration)}</span>
          </div>
          <div className="flex flex-col items-end gap-2">
            {service.price !== null && showPrices && <span className="text-base font-bold text-slate-900 dark:text-white">{formatPrice(service.price)}</span>}
            <button type="button" onClick={(e) => { e.stopPropagation(); onSelect(service); }} className="inline-flex items-center text-xs text-white bg-blue-600 dark:bg-blue-500 font-medium px-3 py-1.5 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">Reservar</button>
          </div>
        </div>
      </div>
      {/* Desktop — table-like row */}
      <Card className="hidden md:block border border-slate-200 dark:border-neutral-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all bg-white dark:bg-neutral-800 rounded-lg cursor-pointer" onClick={() => onShowDetail(service)}>
        <CardContent className="p-4 flex items-center gap-4">
          {service.image ? <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0"><img src={service.image} alt={service.name} className="w-full h-full object-cover" /></div> : (
            <div className="w-16 h-16 rounded-md bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0"><span className="text-xl font-bold text-blue-600 dark:text-blue-400">{service.name.charAt(0)}</span></div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white truncate">{service.name}</h3>
            {service.description && <p className="text-sm text-muted-foreground line-clamp-1">{service.description}</p>}
          </div>
          <span className="text-xs text-slate-400 whitespace-nowrap">{formatDuration(service.duration)}</span>
          {service.price !== null && showPrices && <span className="text-base font-bold text-slate-900 dark:text-white whitespace-nowrap">{formatPrice(service.price)}</span>}
          <Button onClick={(e) => { e.stopPropagation(); onSelect(service); }} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium whitespace-nowrap">Reservar</Button>
        </CardContent>
      </Card>
    </>
  );
}

// ─── ENERGETIC card (bold CTA, angular accents, orange) ─────────────────────
function EnergeticCard({ service, showPrices, onSelect, onShowDetail }: Omit<Props, 'heroStyle' | 'index'>) {
  return (
    <>
      {/* Mobile */}
      <div className="md:hidden bg-white dark:bg-neutral-800 rounded-xl border border-slate-100 dark:border-neutral-700/50 shadow-sm overflow-hidden cursor-pointer active:scale-[0.99]" onClick={() => onShowDetail(service)}>
        <div className="relative">
          {service.image ? (
            <div className="h-40 overflow-hidden"><img src={service.image} alt={service.name} className="w-full h-full object-cover" /></div>
          ) : (
            <div className="h-32 flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 dark:from-neutral-700 dark:to-neutral-800"><span className="text-5xl font-black text-orange-200/50 dark:text-orange-800/30">{service.name.charAt(0)}</span></div>
          )}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
          {service.price !== null && showPrices && <div className="absolute top-2.5 right-2.5 bg-orange-500 text-white text-sm font-black px-2.5 py-1 rounded-lg shadow-md">{formatPrice(service.price)}</div>}
        </div>
        <div className="p-3.5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base truncate flex-1 mr-2">{service.name}</h3>
            <span className="text-xs text-slate-500 dark:text-neutral-400 flex items-center gap-1 flex-shrink-0"><Timer className="h-3 w-3" />{formatDuration(service.duration)}</span>
          </div>
          <button type="button" onClick={(e) => { e.stopPropagation(); onSelect(service); }} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold py-2.5 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all">RESERVAR<ArrowRight className="h-4 w-4 ml-1.5 inline" /></button>
        </div>
      </div>
      {/* Desktop */}
      <Card className="hidden md:block overflow-hidden border border-slate-200/80 dark:border-neutral-700 shadow-sm hover:shadow-xl hover:border-orange-300 dark:hover:border-orange-600/50 transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-neutral-800 rounded-xl cursor-pointer" onClick={() => onShowDetail(service)}>
        <div className="relative w-full h-40 lg:h-44 overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 dark:from-neutral-700 dark:to-neutral-800">
          {service.image ? <img src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : (
            <div className="w-full h-full flex items-center justify-center"><span className="text-6xl font-black text-orange-200/50 dark:text-orange-800/30">{service.name.charAt(0)}</span></div>
          )}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
          <div className="absolute bottom-3 left-3"><Badge className="bg-black/70 text-white border-0 text-xs font-bold"><Timer className="h-3 w-3 mr-1" />{formatDuration(service.duration)}</Badge></div>
          {service.price !== null && showPrices && <div className="absolute bottom-3 right-3"><Badge className="bg-orange-500 text-white border-0 text-sm font-black px-2.5 py-1">{formatPrice(service.price)}</Badge></div>}
        </div>
        <CardContent className="p-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{service.name}</h3>
          {service.description && <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{service.description}</p>}
          <Button onClick={(e) => { e.stopPropagation(); onSelect(service); }} className="w-full h-10 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-lg">RESERVAR<ArrowRight className="h-4 w-4 ml-2" /></Button>
        </CardContent>
      </Card>
    </>
  );
}

// ─── WARM card (amber/rose, rounded-2xl, soft shadow) ───────────────────────
function WarmCard({ service, showPrices, onSelect, onShowDetail }: Omit<Props, 'heroStyle' | 'index'>) {
  return (
    <>
      {/* Mobile */}
      <div className="md:hidden bg-white dark:bg-neutral-800/90 rounded-2xl border border-amber-100 dark:border-neutral-700/50 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]" onClick={() => onShowDetail(service)}>
        <div className="flex gap-3.5 p-3.5">
          <div className="relative w-[104px] h-[104px] rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
            {service.image ? <img src={service.image} alt={service.name} className="w-full h-full object-cover" /> : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-teal-100 dark:from-amber-900/30 dark:to-teal-900/30"><span className="text-2xl font-bold text-amber-700 dark:text-amber-400">{service.name.charAt(0)}</span></div>
            )}
            <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm"><span className="text-[11px] font-medium text-white"><Clock className="h-2.5 w-2.5 inline mr-0.5 -mt-0.5" />{formatDuration(service.duration)}</span></div>
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base mb-1 line-clamp-2">{service.name}</h3>
              {service.description && <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-2 mb-1">{service.description}</p>}
            </div>
            <div className="flex items-center justify-between">
              {service.price !== null && showPrices && <span className="text-lg font-bold text-amber-700 dark:text-amber-400">{formatPrice(service.price)}</span>}
              <button type="button" onClick={(e) => { e.stopPropagation(); onSelect(service); }} className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-3.5 py-2 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors ml-auto">Reservar<ArrowRight className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </div>
      </div>
      {/* Desktop */}
      <Card className="hidden md:block overflow-hidden border border-amber-100 dark:border-neutral-700/50 shadow-sm hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-600/50 transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-neutral-800 rounded-2xl cursor-pointer" onClick={() => onShowDetail(service)}>
        <div className="relative w-full h-40 lg:h-44 overflow-hidden bg-gradient-to-br from-amber-50 to-teal-50 dark:from-neutral-700 dark:to-neutral-800">
          {service.image ? <img src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : (
            <div className="w-full h-full flex items-center justify-center"><div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-200 to-teal-200 dark:from-amber-800/30 dark:to-teal-800/30 flex items-center justify-center"><span className="text-3xl font-bold text-amber-700/60 dark:text-amber-400/60">{service.name.charAt(0)}</span></div></div>
          )}
          <div className="absolute top-3 left-3"><Badge className="bg-white/95 dark:bg-neutral-900/95 text-slate-700 dark:text-neutral-200 border-0 shadow-sm text-xs"><Clock className="h-3 w-3 mr-1" />{formatDuration(service.duration)}</Badge></div>
          {service.price !== null && showPrices && <div className="absolute top-3 right-3"><Badge className="bg-amber-500 text-white border-0 shadow-md text-sm font-bold px-2.5 py-1">{formatPrice(service.price)}</Badge></div>}
        </div>
        <CardContent className="p-4 lg:p-5">
          <h3 className="text-base lg:text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{service.name}</h3>
          {service.description && <p className="text-muted-foreground text-sm line-clamp-2 mb-3 leading-relaxed">{service.description}</p>}
          <Button onClick={(e) => { e.stopPropagation(); onSelect(service); }} className="w-full h-10 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors">Reservar<ArrowRight className="h-4 w-4 ml-2" /></Button>
        </CardContent>
      </Card>
    </>
  );
}

// ─── Main export ────────────────────────────────────────────────────────────
export function PublicServiceCard({ service, heroStyle, showPrices, index, onSelect, onShowDetail }: Props) {
  const cardProps = { service, showPrices, onSelect, onShowDetail };

  const CardComponent = (() => {
    switch (heroStyle) {
      case 'clinical':  return <ClinicalCard {...cardProps} />;
      case 'bold':      return <BoldCard {...cardProps} />;
      case 'zen':       return <ZenCard {...cardProps} />;
      case 'corporate': return <CorporateCard {...cardProps} />;
      case 'energetic': return <EnergeticCard {...cardProps} />;
      case 'warm':      return <WarmCard {...cardProps} />;
      case 'classic':
      default:          return <ClassicCard {...cardProps} />;
    }
  })();

  return (
    <div className="group animate-slide-up" style={{ animationDelay: `${index * 0.08}s` }}>
      {CardComponent}
    </div>
  );
}
