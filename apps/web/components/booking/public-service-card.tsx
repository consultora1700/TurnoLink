'use client';

import Image from 'next/image';
import { ArrowRight, Timer, Clock, ChevronRight, Tag } from 'lucide-react';
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
  promoPrice?: number | null;
  promoLabel?: string | null;
  isPack?: boolean;
  packCheckIn?: string | null;
  packCheckOut?: string | null;
  packNights?: number | null;
  packOriginalPrice?: number | null;
}

interface Props {
  service: Service;
  cardStyle: HeroStyleName;
  showPrices: boolean;
  index: number;
  onSelect: (service: Service) => void;
  onShowDetail: (service: Service) => void;
  ctaLabel?: string;
}

// ─── Price Display (promo-aware) ─────────────────────────────────────────────
export function PriceDisplay({ price, promoPrice, promoLabel, className }: { price: number; promoPrice?: number | null; promoLabel?: string | null; className?: string }) {
  if (promoPrice != null) {
    const discountPct = Math.round((1 - promoPrice / price) * 100);
    return (
      <span className={`inline-flex items-center gap-1.5 flex-wrap ${className || ''}`}>
        {promoLabel && (
          <span className="text-[10px] font-bold uppercase text-[var(--tenant-primary-contrast)] bg-[hsl(var(--tenant-primary-500))] px-1.5 py-0.5 rounded">
            {promoLabel}
          </span>
        )}
        {!promoLabel && discountPct > 0 && (
          <span className="text-[10px] font-bold text-[var(--tenant-primary-contrast)] bg-[hsl(var(--tenant-primary-500))] px-1.5 py-0.5 rounded">
            -{discountPct}%
          </span>
        )}
        <span className="text-sm line-through text-slate-400 dark:text-neutral-500">{formatPrice(price)}</span>
        <span className="font-bold text-slate-900 dark:text-white">{formatPrice(promoPrice)}</span>
      </span>
    );
  }
  return <span className={className}>{formatPrice(price)}</span>;
}

// ─── CLASSIC card (original pink/violet, rounded-2xl, hover translate) ──────
function ClassicCard({ service, showPrices, onSelect, onShowDetail, ctaLabel }: Omit<Props, 'cardStyle' | 'index'>) {
  return (
    <>
      {/* Mobile */}
      <div className="md:hidden bg-white dark:bg-neutral-800/90 rounded-2xl border border-slate-100 dark:border-neutral-700/50 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden cursor-pointer active:scale-[0.99]" onClick={() => onShowDetail(service)}>
        <div className="flex gap-3.5 p-3.5">
          <div className="relative w-[108px] h-[108px] rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
            {service.image ? <Image src={service.image} alt={service.name} className="w-full h-full object-cover" fill sizes="(max-width: 768px) 100vw, 400px" /> : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[hsl(var(--tenant-primary-100))] to-[hsl(var(--tenant-secondary-100))] dark:from-[hsl(var(--tenant-primary-900)_/_0.3)] dark:to-[hsl(var(--tenant-secondary-900)_/_0.3)]"><span className="text-3xl font-bold bg-gradient-to-br from-[hsl(var(--tenant-primary-500))] to-[hsl(var(--tenant-secondary-500))] bg-clip-text text-transparent">{service.name.charAt(0)}</span></div>
            )}
            {service.duration > 0 && <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm"><span className="text-[11px] font-medium text-white">{formatDuration(service.duration)}</span></div>}
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base leading-snug mb-1 line-clamp-2">{service.name}</h3>
              {service.description && <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-2 mb-1">{service.description}</p>}
            </div>
            <DiscountBadge service={service} />
            <div className="flex items-center justify-between">
              {service.price !== null && showPrices && <span className="text-lg font-bold text-slate-900 dark:text-white">{service.promoPrice != null ? <PriceDisplay price={service.price!} promoPrice={service.promoPrice} promoLabel={service.promoLabel} /> : formatPrice(service.price!)}</span>}
              <button type="button" onClick={(e) => { e.stopPropagation(); onSelect(service); }} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))] bg-[hsl(var(--tenant-primary-50))] dark:bg-[hsl(var(--tenant-primary-900)_/_0.3)] px-3.5 py-2 rounded-full hover:bg-[hsl(var(--tenant-primary-100))] dark:hover:bg-[hsl(var(--tenant-primary-900)_/_0.5)] transition-colors ml-auto">{ ctaLabel || 'Reservar'}<ArrowRight className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </div>
      </div>
      {/* Desktop */}
      <Card className="hidden md:flex md:flex-col h-auto min-h-[360px] overflow-hidden border border-slate-200/80 dark:border-neutral-700/80 shadow-sm hover:shadow-xl hover:border-[hsl(var(--tenant-primary-300))] dark:hover:border-[hsl(var(--tenant-primary-600)_/_0.5)] transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-neutral-800 rounded-2xl cursor-pointer" onClick={() => onShowDetail(service)}>
        <div className="relative w-full h-40 overflow-hidden flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-neutral-700 dark:to-neutral-800">
          {service.image ? <Image src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" fill sizes="(max-width: 768px) 100vw, 400px" /> : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[hsl(var(--tenant-primary-500)_/_0.05)] to-[hsl(var(--tenant-secondary-500)_/_0.05)]"><div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[hsl(var(--tenant-primary-500)_/_0.2)] to-[hsl(var(--tenant-secondary-500)_/_0.2)] flex items-center justify-center"><span className="text-3xl font-bold text-[hsl(var(--tenant-primary-500)_/_0.7)]">{service.name.charAt(0)}</span></div></div>
          )}
          {service.duration > 0 && <div className="absolute top-3 left-3"><Badge className="bg-white/95 dark:bg-neutral-900/95 text-slate-700 dark:text-neutral-200 border-0 shadow-sm backdrop-blur-sm font-medium text-xs"><Timer className="h-3 w-3 mr-1" />{formatDuration(service.duration)}</Badge></div>}
          {service.price !== null && showPrices && <div className="absolute top-3 right-3"><Badge className="bg-emerald-500 text-white border-0 shadow-md text-sm font-bold px-2.5 py-1">{service.promoPrice != null ? <PriceDisplay price={service.price!} promoPrice={service.promoPrice} promoLabel={service.promoLabel} /> : formatPrice(service.price!)}</Badge></div>}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <CardContent className="p-4 lg:p-5 flex-1 flex flex-col">
          <div className="min-h-0 flex-1">
            <h3 className="text-base lg:text-lg font-bold text-slate-900 dark:text-white group-hover:text-[hsl(var(--tenant-primary-600))] dark:group-hover:text-[hsl(var(--tenant-primary-400))] transition-colors line-clamp-2">{service.name}</h3>
            {service.description && <p className="text-muted-foreground text-sm mt-1.5 line-clamp-2 leading-relaxed">{service.description}</p>}
          </div>
          <DiscountBadge service={service} />
          <Button onClick={(e) => { e.stopPropagation(); onSelect(service); }} className="w-full h-10 lg:h-11 mt-auto bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white font-semibold rounded-xl group-hover:bg-[hsl(var(--tenant-primary-600))] dark:group-hover:bg-[hsl(var(--tenant-primary-500))] dark:group-hover:text-white transition-all">{ ctaLabel || 'Reservar'}<ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" /></Button>
        </CardContent>
      </Card>
    </>
  );
}

// ─── CLINICAL card (clean, no image emphasis, teal border accent) ────────────
function ClinicalCard({ service, showPrices, onSelect, onShowDetail, ctaLabel }: Omit<Props, 'cardStyle' | 'index'>) {
  return (
    <>
      {/* Mobile — clean with optional image */}
      <div className="md:hidden bg-white dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-700 overflow-hidden cursor-pointer hover:border-[hsl(var(--tenant-primary-300))] dark:hover:border-[hsl(var(--tenant-primary-700))] transition-colors" onClick={() => onShowDetail(service)}>
        <div className="flex gap-3.5 p-3.5">
          {service.image ? (
            <div className="relative w-[90px] h-[90px] rounded-lg overflow-hidden flex-shrink-0">
              <Image src={service.image} alt={service.name} className="w-full h-full object-cover" fill sizes="(max-width: 768px) 100vw, 400px" />
            </div>
          ) : (
            <div className="w-[90px] h-[90px] rounded-lg bg-gradient-to-br from-[hsl(var(--tenant-primary-50))] to-[hsl(var(--tenant-secondary-50))] dark:from-[hsl(var(--tenant-primary-900)_/_0.2)] dark:to-[hsl(var(--tenant-secondary-900)_/_0.2)] flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-[hsl(var(--tenant-primary-500)_/_0.7)] dark:text-[hsl(var(--tenant-primary-400)_/_0.7)]">{service.name.charAt(0)}</span>
            </div>
          )}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base line-clamp-2 mb-1">{service.name}</h3>
              {service.description && <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-2 mb-1">{service.description}</p>}
            </div>
            <DiscountBadge service={service} />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {service.duration > 0 && <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(service.duration)}</span>}
                {service.price !== null && showPrices && <span className="text-sm font-bold text-[hsl(var(--tenant-primary-700))] dark:text-[hsl(var(--tenant-primary-400))]">{service.promoPrice != null ? <PriceDisplay price={service.price!} promoPrice={service.promoPrice} promoLabel={service.promoLabel} /> : formatPrice(service.price!)}</span>}
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); onSelect(service); }} className="inline-flex items-center gap-1 text-xs font-medium text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))] bg-[hsl(var(--tenant-primary-50))] dark:bg-[hsl(var(--tenant-primary-900)_/_0.3)] px-3 py-1.5 rounded-full hover:bg-[hsl(var(--tenant-primary-100))] dark:hover:bg-[hsl(var(--tenant-primary-900)_/_0.5)] transition-colors">Reservar<ChevronRight className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </div>
      </div>
      {/* Desktop — clean card with subtle teal glow */}
      <Card className="hidden md:flex md:flex-col h-auto min-h-[340px] overflow-hidden border border-slate-200 dark:border-neutral-700 shadow-sm hover:shadow-md hover:shadow-[hsl(var(--tenant-primary-500)_/_0.1)] hover:border-[hsl(var(--tenant-primary-300))] dark:hover:border-[hsl(var(--tenant-primary-700))] transition-all duration-200 bg-white dark:bg-neutral-800 rounded-lg cursor-pointer relative" onClick={() => onShowDetail(service)}>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-16 bg-[hsl(var(--tenant-primary-500)_/_0.15)] dark:bg-[hsl(var(--tenant-primary-500)_/_0.1)] rounded-full blur-xl pointer-events-none" />
        <div className="flex flex-col flex-1">
          <div className="flex-1 p-4 lg:p-5 flex flex-col">
            {service.image && (
              <div className="relative w-full h-32 rounded-md overflow-hidden mb-3 flex-shrink-0">
                <Image src={service.image} alt={service.name} className="w-full h-full object-cover" fill sizes="(max-width: 768px) 100vw, 400px" />
                {service.duration > 0 && <div className="absolute top-2 right-2"><Badge className="bg-white/95 text-slate-700 border-0 shadow-sm text-xs"><Timer className="h-3 w-3 mr-1" />{formatDuration(service.duration)}</Badge></div>}
              </div>
            )}
            <div className="min-h-0 flex-1">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white line-clamp-2">{service.name}</h3>
                {service.price !== null && showPrices && <span className="text-sm font-bold text-[hsl(var(--tenant-primary-700))] dark:text-[hsl(var(--tenant-primary-400))] ml-2 whitespace-nowrap">{service.promoPrice != null ? <PriceDisplay price={service.price!} promoPrice={service.promoPrice} promoLabel={service.promoLabel} /> : formatPrice(service.price!)}</span>}
              </div>
              {service.description && <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{service.description}</p>}
              {service.duration > 0 && !service.image && <span className="text-xs text-slate-400 flex items-center gap-1 mb-3"><Clock className="h-3 w-3" />{formatDuration(service.duration)}</span>}
            </div>
            <DiscountBadge service={service} />
            <Button onClick={(e) => { e.stopPropagation(); onSelect(service); }} variant="outline" className="w-full h-9 mt-auto border-[hsl(var(--tenant-primary-200))] dark:border-[hsl(var(--tenant-primary-800))] text-[hsl(var(--tenant-primary-700))] dark:text-[hsl(var(--tenant-primary-300))] hover:bg-[hsl(var(--tenant-primary-50))] dark:hover:bg-[hsl(var(--tenant-primary-900)_/_0.3)] font-medium rounded-md">{ctaLabel || 'Reservar turno'}<ChevronRight className="h-4 w-4 ml-1" /></Button>
          </div>
        </div>
      </Card>
    </>
  );
}

// ─── BOLD card (angular, dark hover, amber accents) ─────────────────────────
function BoldCard({ service, showPrices, onSelect, onShowDetail, ctaLabel }: Omit<Props, 'cardStyle' | 'index'>) {
  return (
    <>
      {/* Mobile */}
      <div className="md:hidden bg-neutral-200 dark:bg-neutral-900 rounded-sm border border-neutral-300 dark:border-neutral-700 overflow-hidden cursor-pointer hover:border-[hsl(var(--tenant-primary-400))] dark:hover:border-[hsl(var(--tenant-primary-600))] transition-colors active:scale-[0.99]" onClick={() => onShowDetail(service)}>
        <div className="relative">
          {service.image ? (
            <div className="relative h-40 overflow-hidden"><Image src={service.image} alt={service.name} className="w-full h-full object-cover" fill sizes="(max-width: 768px) 100vw, 400px" /></div>
          ) : (
            <div className="h-40 flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900"><span className="text-5xl font-black text-white/10">{service.name.charAt(0)}</span></div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10">
            <h3 className="font-bold text-white text-[15px] uppercase tracking-wide line-clamp-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">{service.name}</h3>
            {service.duration > 0 && <span className="text-[11px] font-medium text-white/80 mt-1 inline-flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{formatDuration(service.duration)}</span>}
          </div>
        </div>
        <div className="p-3 space-y-2">
          {service.price !== null && showPrices && (
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-neutral-900 dark:text-white">{service.promoPrice != null ? <PriceDisplay price={service.price!} promoPrice={service.promoPrice} promoLabel={service.promoLabel} /> : formatPrice(service.price!)}</span>
            </div>
          )}
          <DiscountBadge service={service} />
          <button type="button" onClick={(e) => { e.stopPropagation(); onSelect(service); }} className="w-full bg-[hsl(var(--tenant-primary-500))] dark:bg-[hsl(var(--tenant-primary-500))] text-[var(--tenant-primary-contrast)] text-xs font-bold uppercase tracking-wider py-2.5 rounded-sm hover:bg-[hsl(var(--tenant-primary-600))] dark:hover:bg-[hsl(var(--tenant-primary-400))] transition-colors">{ ctaLabel || 'Reservar'}</button>
        </div>
      </div>
      {/* Desktop */}
      <Card className="hidden md:flex md:flex-col h-auto min-h-[360px] overflow-hidden border border-neutral-300 dark:border-neutral-700 shadow-sm hover:shadow-lg hover:border-[hsl(var(--tenant-primary-400))] dark:hover:border-[hsl(var(--tenant-primary-600))] transition-all duration-200 bg-neutral-200 dark:bg-neutral-900 rounded-sm cursor-pointer" onClick={() => onShowDetail(service)}>
        <div className="relative w-full h-40 overflow-hidden flex-shrink-0 bg-neutral-200 dark:bg-neutral-700">
          {service.image ? <Image src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" fill sizes="(max-width: 768px) 100vw, 400px" /> : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900"><span className="text-5xl font-black text-white/10">{service.name.charAt(0)}</span></div>
          )}
          {service.price !== null && showPrices && <div className="absolute top-0 right-0 bg-[hsl(var(--tenant-primary-500))] text-[var(--tenant-primary-contrast)] font-black text-sm px-3 py-1.5">{service.promoPrice != null ? <PriceDisplay price={service.price!} promoPrice={service.promoPrice} promoLabel={service.promoLabel} /> : formatPrice(service.price!)}</div>}
          {service.duration > 0 && <div className="absolute bottom-0 left-0 bg-black/70 px-3 py-1"><span className="text-xs font-medium text-white">{formatDuration(service.duration)}</span></div>}
        </div>
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="min-h-0 flex-1">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white uppercase tracking-wide mb-1 line-clamp-2">{service.name}</h3>
            {service.description && <p className="text-neutral-500 dark:text-neutral-400 text-sm line-clamp-2 mb-3">{service.description}</p>}
          </div>
          <DiscountBadge service={service} />
          <Button onClick={(e) => { e.stopPropagation(); onSelect(service); }} className="w-full h-10 mt-auto bg-[hsl(var(--tenant-primary-500))] hover:bg-[hsl(var(--tenant-primary-600))] dark:bg-[hsl(var(--tenant-primary-500))] dark:hover:bg-[hsl(var(--tenant-primary-400))] text-[var(--tenant-primary-contrast)] font-bold uppercase tracking-wider text-xs rounded-sm transition-colors">{ ctaLabel || 'Reservar'}<ArrowRight className="h-4 w-4 ml-2" /></Button>
        </CardContent>
      </Card>
    </>
  );
}

// ─── ZEN card (soft, rounded-2xl, scale hover, spacious) ────────────────────
function ZenCard({ service, showPrices, onSelect, onShowDetail, ctaLabel }: Omit<Props, 'cardStyle' | 'index'>) {
  return (
    <>
      {/* Mobile */}
      <div className="md:hidden bg-white dark:bg-neutral-800/90 rounded-2xl border border-[hsl(var(--tenant-primary-100))] dark:border-neutral-700/50 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]" onClick={() => onShowDetail(service)}>
        {service.image ? (
          <div className="relative w-full h-40 overflow-hidden"><Image src={service.image} alt={service.name} className="w-full h-full object-cover" fill sizes="(max-width: 768px) 100vw, 400px" /></div>
        ) : (
          <div className="w-full h-28 flex items-center justify-center bg-gradient-to-br from-[hsl(var(--tenant-primary-50))] to-[hsl(var(--tenant-secondary-50))] dark:from-[hsl(var(--tenant-primary-900)_/_0.2)] dark:to-[hsl(var(--tenant-secondary-900)_/_0.2)]">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(var(--tenant-primary-200))] to-[hsl(var(--tenant-secondary-200))] dark:from-[hsl(var(--tenant-primary-800)_/_0.4)] dark:to-[hsl(var(--tenant-secondary-800)_/_0.4)] flex items-center justify-center"><span className="text-2xl font-medium text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))]">{service.name.charAt(0)}</span></div>
          </div>
        )}
        <div className="p-4 text-center">
          <h3 className="font-medium text-slate-800 dark:text-white text-base mb-1.5">{service.name}</h3>
          <div className="flex items-center justify-center gap-3 text-sm text-slate-400 mb-3">
            {service.duration > 0 && <span>{formatDuration(service.duration)}</span>}
            {service.price !== null && showPrices && <><span className="w-1 h-1 rounded-full bg-slate-300" /><span className="font-semibold text-slate-700 dark:text-neutral-200">{service.promoPrice != null ? <PriceDisplay price={service.price!} promoPrice={service.promoPrice} promoLabel={service.promoLabel} /> : formatPrice(service.price!)}</span></>}
          </div>
          <DiscountBadge service={service} />
          <button type="button" onClick={(e) => { e.stopPropagation(); onSelect(service); }} className="w-full text-center text-sm text-white bg-[hsl(var(--tenant-primary-600))] dark:bg-[hsl(var(--tenant-primary-500))] font-medium py-2.5 rounded-full hover:bg-[hsl(var(--tenant-primary-700))] dark:hover:bg-[hsl(var(--tenant-primary-600))] transition-colors">{ ctaLabel || 'Reservar'}</button>
        </div>
      </div>
      {/* Desktop */}
      <Card className="hidden md:flex md:flex-col h-auto min-h-[360px] overflow-hidden border border-[hsl(var(--tenant-primary-100))] dark:border-neutral-700/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-white dark:bg-neutral-800 rounded-2xl cursor-pointer" onClick={() => onShowDetail(service)}>
        <div className="relative w-full h-40 overflow-hidden flex-shrink-0">
          {service.image ? <Image src={service.image} alt={service.name} className="w-full h-full object-cover" fill sizes="(max-width: 768px) 100vw, 400px" /> : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[hsl(var(--tenant-primary-50))] to-[hsl(var(--tenant-secondary-50))] dark:from-[hsl(var(--tenant-primary-900)_/_0.2)] dark:to-[hsl(var(--tenant-secondary-900)_/_0.2)]"><div className="w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(var(--tenant-primary-200))] to-[hsl(var(--tenant-secondary-200))] dark:from-[hsl(var(--tenant-primary-800)_/_0.4)] dark:to-[hsl(var(--tenant-secondary-800)_/_0.4)] flex items-center justify-center"><span className="text-2xl font-medium text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))]">{service.name.charAt(0)}</span></div></div>
          )}
        </div>
        <CardContent className="p-5 text-center flex-1 flex flex-col">
          <div className="min-h-0 flex-1">
            <h3 className="text-base font-medium text-slate-800 dark:text-white mb-1 line-clamp-2">{service.name}</h3>
            {service.description && <p className="text-muted-foreground text-sm line-clamp-2 mb-2 leading-relaxed">{service.description}</p>}
            <div className="flex items-center justify-center gap-3 text-xs text-slate-400 mb-4">
              {service.duration > 0 && <span>{formatDuration(service.duration)}</span>}
              {service.price !== null && showPrices && <><span className="w-1 h-1 rounded-full bg-slate-300" /><span className="font-medium text-slate-600 dark:text-neutral-300">{service.promoPrice != null ? <PriceDisplay price={service.price!} promoPrice={service.promoPrice} promoLabel={service.promoLabel} /> : formatPrice(service.price!)}</span></>}
            </div>
          </div>
          <DiscountBadge service={service} />
          <Button onClick={(e) => { e.stopPropagation(); onSelect(service); }} className="w-full h-10 mt-auto bg-[hsl(var(--tenant-primary-600))] hover:bg-[hsl(var(--tenant-primary-700))] dark:bg-[hsl(var(--tenant-primary-500))] dark:hover:bg-[hsl(var(--tenant-primary-600))] text-white rounded-full font-medium transition-colors">{ ctaLabel || 'Reservar'}</Button>
        </CardContent>
      </Card>
    </>
  );
}

// ─── CORPORATE card (compact list-style, no frills) ─────────────────────────
function CorporateCard({ service, showPrices, onSelect, onShowDetail, ctaLabel }: Omit<Props, 'cardStyle' | 'index'>) {
  return (
    <>
      {/* Mobile — compact row */}
      <div className="md:hidden bg-white dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-700 p-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-neutral-750 transition-colors active:scale-[0.99]" onClick={() => onShowDetail(service)}>
        <div className="flex items-center gap-3.5">
          {service.image ? <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-sm"><Image src={service.image} alt={service.name} className="w-full h-full object-cover" fill sizes="(max-width: 768px) 100vw, 400px" /></div> : (
            <div className="w-16 h-16 rounded-lg bg-[hsl(var(--tenant-primary-50))] dark:bg-[hsl(var(--tenant-primary-900)_/_0.3)] flex items-center justify-center flex-shrink-0"><span className="text-lg font-bold text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))]">{service.name.charAt(0)}</span></div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white text-[15px] line-clamp-2 mb-0.5">{service.name}</h3>
            {service.duration > 0 && <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(service.duration)}</span>}
          </div>
          <div className="flex flex-col items-end gap-2">
            {service.price !== null && showPrices && <span className="text-base font-bold text-slate-900 dark:text-white">{service.promoPrice != null ? <PriceDisplay price={service.price!} promoPrice={service.promoPrice} promoLabel={service.promoLabel} /> : formatPrice(service.price!)}</span>}
            <DiscountBadge service={service} />
            <button type="button" onClick={(e) => { e.stopPropagation(); onSelect(service); }} className="inline-flex items-center text-xs text-white bg-[hsl(var(--tenant-primary-600))] dark:bg-[hsl(var(--tenant-primary-500))] font-medium px-3 py-1.5 rounded-md hover:bg-[hsl(var(--tenant-primary-700))] dark:hover:bg-[hsl(var(--tenant-primary-600))] transition-colors">{ ctaLabel || 'Reservar'}</button>
          </div>
        </div>
      </div>
      {/* Desktop — compact vertical card */}
      <Card className="hidden md:block overflow-hidden border border-slate-200 dark:border-neutral-700 shadow-sm hover:shadow-md hover:border-[hsl(var(--tenant-primary-200))] dark:hover:border-[hsl(var(--tenant-primary-800))] transition-all bg-white dark:bg-neutral-800 rounded-lg cursor-pointer" onClick={() => onShowDetail(service)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            {service.image ? <div className="relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0"><Image src={service.image} alt={service.name} className="w-full h-full object-cover" fill sizes="(max-width: 768px) 100vw, 400px" /></div> : (
              <div className="w-14 h-14 rounded-md bg-[hsl(var(--tenant-primary-50))] dark:bg-[hsl(var(--tenant-primary-900)_/_0.3)] flex items-center justify-center flex-shrink-0"><span className="text-xl font-bold text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))]">{service.name.charAt(0)}</span></div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white line-clamp-2">{service.name}</h3>
              {service.description && <p className="text-sm text-muted-foreground line-clamp-1">{service.description}</p>}
            </div>
          </div>
          <div className="flex items-center justify-between mb-3">
            {service.duration > 0 && <span className="text-xs text-slate-400">{formatDuration(service.duration)}</span>}
            {service.price !== null && showPrices && <span className="text-base font-bold text-slate-900 dark:text-white">{service.promoPrice != null ? <PriceDisplay price={service.price!} promoPrice={service.promoPrice} promoLabel={service.promoLabel} /> : formatPrice(service.price!)}</span>}
          </div>
          <DiscountBadge service={service} />
          <Button onClick={(e) => { e.stopPropagation(); onSelect(service); }} size="sm" className="w-full bg-[hsl(var(--tenant-primary-600))] hover:bg-[hsl(var(--tenant-primary-700))] text-white rounded-md font-medium">{ ctaLabel || 'Reservar'}</Button>
        </CardContent>
      </Card>
    </>
  );
}

// ─── ENERGETIC card (bold CTA, angular accents, orange) ─────────────────────
function EnergeticCard({ service, showPrices, onSelect, onShowDetail, ctaLabel }: Omit<Props, 'cardStyle' | 'index'>) {
  return (
    <>
      {/* Mobile */}
      <div className="md:hidden bg-white dark:bg-neutral-800 rounded-xl border border-slate-100 dark:border-neutral-700/50 shadow-sm overflow-hidden cursor-pointer active:scale-[0.99]" onClick={() => onShowDetail(service)}>
        <div className="relative">
          {service.image ? (
            <div className="relative h-40 overflow-hidden"><Image src={service.image} alt={service.name} className="w-full h-full object-cover" fill sizes="(max-width: 768px) 100vw, 400px" /></div>
          ) : (
            <div className="h-32 flex items-center justify-center bg-gradient-to-br from-[hsl(var(--tenant-primary-50))] to-[hsl(var(--tenant-secondary-50))] dark:from-neutral-700 dark:to-neutral-800"><span className="text-5xl font-black text-[hsl(var(--tenant-primary-200)_/_0.5)] dark:text-[hsl(var(--tenant-primary-800)_/_0.3)]">{service.name.charAt(0)}</span></div>
          )}
          <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-[hsl(var(--tenant-primary-400)_/_0.4)] to-transparent" />
          {service.price !== null && showPrices && <div className="absolute top-2.5 right-2.5 bg-[hsl(var(--tenant-primary-500))] text-white text-sm font-black px-2.5 py-1 rounded-lg shadow-md">{service.promoPrice != null ? <PriceDisplay price={service.price!} promoPrice={service.promoPrice} promoLabel={service.promoLabel} /> : formatPrice(service.price!)}</div>}
        </div>
        <div className="p-3.5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-2 flex-1 mr-2">{service.name}</h3>
            {service.duration > 0 && <span className="text-xs text-slate-500 dark:text-neutral-400 flex items-center gap-1 flex-shrink-0"><Timer className="h-3 w-3" />{formatDuration(service.duration)}</span>}
          </div>
          <DiscountBadge service={service} />
          <button type="button" onClick={(e) => { e.stopPropagation(); onSelect(service); }} className="w-full bg-gradient-to-r from-[hsl(var(--tenant-primary-500))] to-[hsl(var(--tenant-secondary-500))] text-white text-sm font-bold py-2.5 rounded-lg hover:from-[hsl(var(--tenant-primary-600))] hover:to-[hsl(var(--tenant-secondary-600))] transition-all">{ ctaLabel ? ctaLabel.toUpperCase() : 'RESERVAR'}<ArrowRight className="h-4 w-4 ml-1.5 inline" /></button>
        </div>
      </div>
      {/* Desktop */}
      <Card className="hidden md:flex md:flex-col h-auto min-h-[360px] overflow-hidden border border-slate-200/80 dark:border-neutral-700 shadow-sm hover:shadow-xl hover:border-[hsl(var(--tenant-primary-300))] dark:hover:border-[hsl(var(--tenant-primary-600)_/_0.5)] transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-neutral-800 rounded-xl cursor-pointer" onClick={() => onShowDetail(service)}>
        <div className="relative w-full h-40 overflow-hidden flex-shrink-0 bg-gradient-to-br from-[hsl(var(--tenant-primary-50))] to-[hsl(var(--tenant-secondary-50))] dark:from-neutral-700 dark:to-neutral-800">
          {service.image ? <Image src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" fill sizes="(max-width: 768px) 100vw, 400px" /> : (
            <div className="w-full h-full flex items-center justify-center"><span className="text-6xl font-black text-[hsl(var(--tenant-primary-200)_/_0.5)] dark:text-[hsl(var(--tenant-primary-800)_/_0.3)]">{service.name.charAt(0)}</span></div>
          )}
          <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-[hsl(var(--tenant-primary-400)_/_0.4)] to-transparent" />
          {service.duration > 0 && <div className="absolute bottom-3 left-3"><Badge className="bg-black/70 text-white border-0 text-xs font-bold"><Timer className="h-3 w-3 mr-1" />{formatDuration(service.duration)}</Badge></div>}
          {service.price !== null && showPrices && <div className="absolute bottom-3 right-3"><Badge className="bg-[hsl(var(--tenant-primary-500))] text-white border-0 text-sm font-black px-2.5 py-1">{service.promoPrice != null ? <PriceDisplay price={service.price!} promoPrice={service.promoPrice} promoLabel={service.promoLabel} /> : formatPrice(service.price!)}</Badge></div>}
        </div>
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="min-h-0 flex-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">{service.name}</h3>
            {service.description && <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{service.description}</p>}
          </div>
          <DiscountBadge service={service} />
          <Button onClick={(e) => { e.stopPropagation(); onSelect(service); }} className="w-full h-10 mt-auto bg-gradient-to-r from-[hsl(var(--tenant-primary-500))] to-[hsl(var(--tenant-secondary-500))] hover:from-[hsl(var(--tenant-primary-600))] hover:to-[hsl(var(--tenant-secondary-600))] text-white font-bold rounded-lg">{ ctaLabel ? ctaLabel.toUpperCase() : 'RESERVAR'}<ArrowRight className="h-4 w-4 ml-2" /></Button>
        </CardContent>
      </Card>
    </>
  );
}

// ─── WARM card (circular photo, left color bar, warm tint, filled CTA) ──────
function WarmCard({ service, showPrices, onSelect, onShowDetail, ctaLabel }: Omit<Props, 'cardStyle' | 'index'>) {
  return (
    <>
      {/* Mobile — circular photo, left primary bar, warm bg tint */}
      <div className="md:hidden relative overflow-hidden rounded-2xl border border-[hsl(var(--tenant-primary-200))] dark:border-[hsl(var(--tenant-primary-800)_/_0.4)] shadow-[0_2px_12px_hsl(var(--tenant-primary-500)_/_0.08)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] cursor-pointer hover:shadow-[0_4px_20px_hsl(var(--tenant-primary-500)_/_0.15)] transition-all active:scale-[0.99]" onClick={() => onShowDetail(service)}>
        {/* Left color bar */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[hsl(var(--tenant-primary-500))]" />
        {/* Warm background tint */}
        <div className="absolute inset-0 bg-[hsl(var(--tenant-primary-500)_/_0.04)] dark:bg-[hsl(var(--tenant-primary-500)_/_0.06)]" />
        <div className="relative flex gap-3.5 p-3.5 pl-4">
          {/* Circular photo */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="relative w-[88px] h-[88px] rounded-full overflow-hidden shadow-md ring-2 ring-[hsl(var(--tenant-primary-200))] dark:ring-[hsl(var(--tenant-primary-700)_/_0.4)]">
              {service.image ? <Image src={service.image} alt={service.name} className="w-full h-full object-cover" fill sizes="(max-width: 768px) 100vw, 400px" /> : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[hsl(var(--tenant-primary-100))] to-[hsl(var(--tenant-secondary-100))] dark:from-[hsl(var(--tenant-primary-900)_/_0.3)] dark:to-[hsl(var(--tenant-secondary-900)_/_0.3)]"><span className="text-2xl font-bold text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))]">{service.name.charAt(0)}</span></div>
              )}
            </div>
            {/* Duration badge below photo */}
            {service.duration > 0 && <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[hsl(var(--tenant-primary-700))] dark:text-[hsl(var(--tenant-primary-400))]"><Clock className="h-2.5 w-2.5" />{formatDuration(service.duration)}</span>}
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base mb-1 line-clamp-2">{service.name}</h3>
              {service.description && <p className="text-sm text-slate-600 dark:text-neutral-300 line-clamp-2 mb-1">{service.description}</p>}
            </div>
            <DiscountBadge service={service} />
            <div className="flex items-center justify-between gap-2">
              {/* Price in badge */}
              {service.price !== null && showPrices && <span className="inline-flex items-center text-sm font-bold text-white bg-[hsl(var(--tenant-primary-500))] dark:bg-[hsl(var(--tenant-primary-600))] px-2.5 py-1 rounded-lg shadow-sm">{service.promoPrice != null ? <PriceDisplay price={service.price!} promoPrice={service.promoPrice} promoLabel={service.promoLabel} /> : formatPrice(service.price!)}</span>}
              {/* Filled CTA button */}
              <button type="button" onClick={(e) => { e.stopPropagation(); onSelect(service); }} className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[hsl(var(--tenant-primary-600))] dark:bg-[hsl(var(--tenant-primary-500))] px-3.5 py-2 rounded-xl hover:bg-[hsl(var(--tenant-primary-700))] dark:hover:bg-[hsl(var(--tenant-primary-600))] transition-colors ml-auto shadow-sm">{ ctaLabel || 'Reservar'}<ArrowRight className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </div>
      </div>
      {/* Desktop — top color bar, warm tint, circular photo fallback, filled button */}
      <Card className="hidden md:flex md:flex-col h-auto min-h-[360px] overflow-hidden border border-[hsl(var(--tenant-primary-200))] dark:border-[hsl(var(--tenant-primary-800)_/_0.4)] shadow-[0_2px_12px_hsl(var(--tenant-primary-500)_/_0.08)] hover:shadow-[0_8px_30px_hsl(var(--tenant-primary-500)_/_0.15)] hover:border-[hsl(var(--tenant-primary-300))] dark:hover:border-[hsl(var(--tenant-primary-600)_/_0.5)] transition-all duration-300 hover:-translate-y-1 rounded-2xl cursor-pointer relative" onClick={() => onShowDetail(service)}>
        {/* Top color bar */}
        <div className="h-[3px] bg-[hsl(var(--tenant-primary-500))] flex-shrink-0" />
        {/* Warm background tint */}
        <div className="absolute inset-0 bg-[hsl(var(--tenant-primary-500)_/_0.03)] dark:bg-[hsl(var(--tenant-primary-500)_/_0.05)]" />
        <div className="relative w-full h-40 overflow-hidden flex-shrink-0 bg-gradient-to-br from-[hsl(var(--tenant-primary-50))] to-[hsl(var(--tenant-secondary-50))] dark:from-neutral-700 dark:to-neutral-800">
          {service.image ? <Image src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" fill sizes="(max-width: 768px) 100vw, 400px" /> : (
            <div className="w-full h-full flex items-center justify-center"><div className="w-20 h-20 rounded-full bg-gradient-to-br from-[hsl(var(--tenant-primary-200))] to-[hsl(var(--tenant-secondary-200))] dark:from-[hsl(var(--tenant-primary-800)_/_0.3)] dark:to-[hsl(var(--tenant-secondary-800)_/_0.3)] flex items-center justify-center ring-2 ring-white/50 dark:ring-neutral-600/50"><span className="text-3xl font-bold text-[hsl(var(--tenant-primary-700)_/_0.6)] dark:text-[hsl(var(--tenant-primary-400)_/_0.6)]">{service.name.charAt(0)}</span></div></div>
          )}
          {service.duration > 0 && <div className="absolute bottom-3 left-3"><Badge className="bg-white/95 dark:bg-neutral-900/95 text-[hsl(var(--tenant-primary-700))] dark:text-[hsl(var(--tenant-primary-400))] border-0 shadow-sm text-xs"><Clock className="h-3 w-3 mr-1" />{formatDuration(service.duration)}</Badge></div>}
          {service.price !== null && showPrices && <div className="absolute top-3 right-3"><Badge className="bg-[hsl(var(--tenant-primary-500))] text-white border-0 shadow-md text-sm font-bold px-2.5 py-1">{service.promoPrice != null ? <PriceDisplay price={service.price!} promoPrice={service.promoPrice} promoLabel={service.promoLabel} /> : formatPrice(service.price!)}</Badge></div>}
        </div>
        <CardContent className="relative p-4 lg:p-5 flex-1 flex flex-col">
          <div className="min-h-0 flex-1">
            <h3 className="text-base lg:text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">{service.name}</h3>
            {service.description && <p className="text-slate-600 dark:text-neutral-300 text-sm line-clamp-2 mb-3 leading-relaxed">{service.description}</p>}
          </div>
          <DiscountBadge service={service} />
          <Button onClick={(e) => { e.stopPropagation(); onSelect(service); }} className="w-full h-10 mt-auto bg-[hsl(var(--tenant-primary-600))] hover:bg-[hsl(var(--tenant-primary-700))] dark:bg-[hsl(var(--tenant-primary-500))] dark:hover:bg-[hsl(var(--tenant-primary-600))] text-white font-semibold rounded-xl transition-colors shadow-sm">{ ctaLabel || 'Reservar'}<ArrowRight className="h-4 w-4 ml-2" /></Button>
        </CardContent>
      </Card>
    </>
  );
}

// ─── MINIMALIST card (Calendly-inspired, clean list mobile, white card desktop) ──
function MinimalistCard({ service, showPrices, onSelect, onShowDetail, ctaLabel }: Omit<Props, 'cardStyle' | 'index'>) {
  return (
    <>
      {/* Mobile — clean list row, white bg, subtle bottom border */}
      <div className="md:hidden bg-white dark:bg-neutral-900 border-b border-slate-100 dark:border-neutral-800 cursor-pointer" onClick={() => onShowDetail(service)}>
        <div className="flex gap-3.5 py-4 px-4">
          {service.image ? (
            <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-slate-200 dark:ring-neutral-700">
              <Image src={service.image} alt={service.name} className="w-full h-full object-cover" fill sizes="56px" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#F3F4F6] dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 ring-1 ring-slate-200 dark:ring-neutral-700">
              <span className="text-lg font-medium text-slate-400 dark:text-neutral-500">{service.name.charAt(0)}</span>
            </div>
          )}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h3 className="font-semibold text-[15px] text-[#1A1A2E] dark:text-white line-clamp-2">{service.name}</h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-neutral-500 mt-0.5">
              {service.duration > 0 && <><Clock className="h-3 w-3" /><span>{formatDuration(service.duration)}</span></>}
              {service.price !== null && showPrices && <>{service.duration > 0 && <span className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-neutral-600" />}<span>{service.promoPrice != null ? <PriceDisplay price={service.price!} promoPrice={service.promoPrice} promoLabel={service.promoLabel} /> : formatPrice(service.price!)}</span></>}
            </div>
          </div>
          <button type="button" onClick={(e) => { e.stopPropagation(); onSelect(service); }} className="self-center text-sm font-semibold text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))] hover:text-[hsl(var(--tenant-primary-700))] dark:hover:text-[hsl(var(--tenant-primary-300))] transition-colors flex-shrink-0">{ ctaLabel || 'Reservar'}</button>
        </div>
        <DiscountBadge service={service} />
      </div>
      {/* Desktop — white card, subtle border, rounded-xl, filled CTA */}
      <Card className="hidden md:flex md:flex-col h-auto min-h-[340px] overflow-hidden border border-slate-200/80 dark:border-neutral-700 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-slate-300 dark:hover:border-neutral-600 transition-all duration-200 bg-white dark:bg-neutral-900 rounded-xl cursor-pointer" onClick={() => onShowDetail(service)}>
        <div className="relative w-full h-36 overflow-hidden flex-shrink-0">
          {service.image ? <Image src={service.image} alt={service.name} className="w-full h-full object-cover" fill sizes="(max-width: 768px) 100vw, 400px" /> : (
            <div className="w-full h-full flex items-center justify-center bg-[#F3F4F6] dark:bg-neutral-800"><span className="text-4xl text-slate-300 dark:text-neutral-600">{service.name.charAt(0)}</span></div>
          )}
        </div>
        <CardContent className="p-4 lg:p-5 flex-1 flex flex-col">
          <div className="min-h-0 flex-1">
            <h3 className="text-base font-semibold text-[#1A1A2E] dark:text-white line-clamp-2 mb-1">{service.name}</h3>
            {service.description && <p className="text-slate-500 dark:text-neutral-400 text-sm line-clamp-2 mb-2">{service.description}</p>}
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-neutral-500">
              {service.duration > 0 && <><Clock className="h-3 w-3" /><span>{formatDuration(service.duration)}</span></>}
              {service.price !== null && showPrices && <>{service.duration > 0 && <span className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-neutral-600" />}<span className="font-medium text-slate-600 dark:text-neutral-300">{service.promoPrice != null ? <PriceDisplay price={service.price!} promoPrice={service.promoPrice} promoLabel={service.promoLabel} /> : formatPrice(service.price!)}</span></>}
            </div>
          </div>
          <DiscountBadge service={service} />
          <Button onClick={(e) => { e.stopPropagation(); onSelect(service); }} className="w-full h-10 mt-auto bg-[hsl(var(--tenant-primary-600))] hover:bg-[hsl(var(--tenant-primary-700))] dark:bg-[hsl(var(--tenant-primary-500))] dark:hover:bg-[hsl(var(--tenant-primary-600))] text-white font-semibold rounded-lg">{ ctaLabel || 'Reservar'}<ArrowRight className="h-4 w-4 ml-2" /></Button>
        </CardContent>
      </Card>
    </>
  );
}

// ─── Discount Badge (inline, inside card) ───────────────────────────────────
function DiscountBadge({ service }: { service: Service }) {
  if (service.promoPrice == null || service.price == null || service.promoPrice >= service.price) return null;
  const promoPct = Math.round((1 - service.promoPrice / service.price) * 100);
  if (promoPct <= 0) return null;
  const savings = service.price - service.promoPrice;
  return (
    <div className="flex items-center justify-center gap-1.5 my-2 px-3 py-2 rounded-lg bg-[hsl(var(--tenant-primary-500)_/_0.1)] dark:bg-[hsl(var(--tenant-primary-500)_/_0.15)] border border-[hsl(var(--tenant-primary-500)_/_0.2)] dark:border-[hsl(var(--tenant-primary-500)_/_0.25)]">
      <Tag className="h-3 w-3 text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))] flex-shrink-0" />
      <span className="text-[11px] font-bold text-[hsl(var(--tenant-primary-700))] dark:text-[hsl(var(--tenant-primary-300))]">{promoPct}% OFF</span>
      <span className="text-[11px] text-slate-500 dark:text-neutral-400">— Ahorrás {formatPrice(savings)}</span>
    </div>
  );
}

// ─── Main export ────────────────────────────────────────────────────────────
export function PublicServiceCard({ service, cardStyle, showPrices, index, onSelect, onShowDetail, ctaLabel }: Props) {
  const cardProps = { service, showPrices, onSelect, onShowDetail, ctaLabel };

  const CardComponent = (() => {
    switch (cardStyle) {
      case 'clinical':  return <ClinicalCard {...cardProps} />;
      case 'bold':      return <BoldCard {...cardProps} />;
      case 'zen':       return <ZenCard {...cardProps} />;
      case 'corporate': return <CorporateCard {...cardProps} />;
      case 'energetic': return <EnergeticCard {...cardProps} />;
      case 'warm':      return <WarmCard {...cardProps} />;
      case 'minimalist': return <MinimalistCard {...cardProps} />;
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
