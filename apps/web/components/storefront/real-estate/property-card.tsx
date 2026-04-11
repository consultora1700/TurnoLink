'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, ChevronLeft, ChevronRight, BedDouble, Bath, Maximize2, Car, MessageCircle, Heart } from 'lucide-react';
import type { Product, ProductAttribute } from '@/lib/api';
import { formatPropertyPrice, getAttrValue, isAptoCredito, buildPropertyFeatures } from '@/lib/property-utils';
import { useFavorites } from '@/lib/hooks/use-favorites';

interface PropertyCardProps {
  product: Product;
  slug: string;
  primaryColor: string;
  whatsappNumber?: string;
}

export function PropertyCard({ product, slug, primaryColor, whatsappNumber }: PropertyCardProps) {
  const [imgIdx, setImgIdx] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFav, toggleFav } = useFavorites();
  const favorited = isFav(product.id);

  const handleToggleFav = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFav(product.id);
  }, [product.id, toggleFav]);

  const attrs = product.attributes as ProductAttribute[] | null;
  const operacion = getAttrValue(attrs, 'operacion');
  const tipoPropiedad = getAttrValue(attrs, 'tipo_propiedad');
  const barrio = getAttrValue(attrs, 'barrio');
  const expensas = getAttrValue(attrs, 'expensas');
  const aptoCredito = isAptoCredito(attrs);
  const features = buildPropertyFeatures(attrs);

  const images = product.images?.length
    ? [...product.images].sort((a, b) => a.order - b.order)
    : [];
  const totalImages = images.length;

  const operacionColor = operacion === 'Venta'
    ? 'bg-blue-600' : operacion === 'Alquiler'
    ? 'bg-amber-500' : 'bg-violet-600';

  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Hola! Me interesa la propiedad "${product.name}" (${formatPropertyPrice(Number(product.price), operacion, product.currency)}). ¿Podrían darme más información?`
      )}`
    : null;

  const goTo = useCallback((idx: number) => {
    setImgIdx(idx < 0 ? totalImages - 1 : idx >= totalImages ? 0 : idx);
  }, [totalImages]);

  const goPrev = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    goTo(imgIdx - 1);
  }, [imgIdx, goTo]);

  const goNext = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    goTo(imgIdx + 1);
  }, [imgIdx, goTo]);

  // Touch/swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setTouchDelta(0);
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStart === null) return;
    setTouchDelta(e.touches[0].clientX - touchStart);
  }, [touchStart]);

  const handleTouchEnd = useCallback(() => {
    if (Math.abs(touchDelta) > 40) {
      if (touchDelta > 0) goTo(imgIdx - 1);
      else goTo(imgIdx + 1);
    }
    setTouchStart(null);
    setTouchDelta(0);
    setIsDragging(false);
  }, [touchDelta, imgIdx, goTo]);

  // Render ALL images so they're preloaded and transitions are instant
  const imagesToRender = images.map((img, i) => ({ img, idx: i }));

  return (
    <div className="group flex flex-col h-full rounded-2xl overflow-hidden border border-stone-200/60 shadow-sm hover:shadow-xl transition-all duration-300" style={{ backgroundColor: '#FAF8F5' }}>
      {/* Image carousel */}
      <div className="relative aspect-video overflow-hidden bg-stone-100">
        {images.length > 0 ? (
          <>
            {/* All images stacked — only current visible via opacity */}
            <div
              ref={containerRef}
              className="relative w-full h-full"
              onTouchStart={totalImages > 1 ? handleTouchStart : undefined}
              onTouchMove={totalImages > 1 ? handleTouchMove : undefined}
              onTouchEnd={totalImages > 1 ? handleTouchEnd : undefined}
            >
              {imagesToRender.map(({ img, idx }) => (
                <div
                  key={img.id || idx}
                  className="absolute inset-0 transition-opacity duration-300 ease-in-out"
                  style={{
                    opacity: idx === imgIdx ? 1 : 0,
                    zIndex: idx === imgIdx ? 2 : 1,
                    ...(isDragging && idx === imgIdx ? {
                      transform: `translateX(${touchDelta * 0.3}px)`,
                      transition: 'none',
                    } : {}),
                  }}
                >
                  <Link
                    href={`/${slug}/producto/${product.slug}`}
                    draggable={false}
                    onClick={(e) => { if (isDragging) e.preventDefault(); }}
                  >
                    <Image
                      src={img.url}
                      alt={idx === 0 ? product.name : ''}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={idx === 0}
                      loading={idx <= 1 ? 'eager' : 'lazy'}
                      draggable={false}
                    />
                  </Link>
                </div>
              ))}
            </div>

            {/* Carousel controls */}
            {totalImages > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 active:scale-90"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 active:scale-90"
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Dots */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                  {images.slice(0, 5).map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImgIdx(i); }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === imgIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`Foto ${i + 1}`}
                    />
                  ))}
                  {totalImages > 5 && (
                    <span className="text-[10px] text-white/70 ml-1">+{totalImages - 5}</span>
                  )}
                </div>

                {/* Photo counter */}
                <span className="absolute bottom-2 right-2 z-10 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-white text-[11px] font-medium">
                  {imgIdx + 1}/{totalImages}
                </span>
              </>
            )}
          </>
        ) : (
          <Link href={`/${slug}/producto/${product.slug}`} className="flex items-center justify-center h-full">
            <Maximize2 className="h-8 w-8 text-stone-300" />
          </Link>
        )}

        {/* Badges over image */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5 z-10 max-w-[calc(100%-56px)]">
          {operacion && (
            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold text-white uppercase tracking-wide ${operacionColor}`}>
              {operacion === 'Alquiler temporario' ? 'Temporario' : operacion}
            </span>
          )}
          {aptoCredito && (
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white uppercase tracking-wide bg-emerald-600">
              Apto Crédito
            </span>
          )}
        </div>

        {/* Favorite heart */}
        <button
          onClick={handleToggleFav}
          aria-label={favorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          aria-pressed={favorited}
          className={`absolute top-2 right-2 z-10 h-9 w-9 rounded-full backdrop-blur-sm flex items-center justify-center transition-all active:scale-90 ${
            favorited
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-black/35 text-white hover:bg-black/55'
          }`}
        >
          <Heart className="h-[17px] w-[17px]" fill={favorited ? 'currentColor' : 'none'} strokeWidth={2.2} />
        </button>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Price — fixed top */}
        <div className="mb-2 min-h-[52px]">
          <p className="text-xl font-bold text-slate-900">
            {formatPropertyPrice(Number(product.price), operacion, product.currency)}
            {operacion === 'Alquiler' && <span className="text-sm font-normal text-slate-500">/mes</span>}
          </p>
          {expensas && !isNaN(Number(expensas)) && (
            <p className="text-xs text-slate-500 mt-0.5">
              Expensas: ${Number(expensas).toLocaleString('es-AR')}
            </p>
          )}
        </div>

        {/* Type badge */}
        <p className="text-xs font-medium text-slate-500 mb-1.5 min-h-[16px]">
          {tipoPropiedad || '\u00A0'}
        </p>

        {/* Title */}
        <Link href={`/${slug}/producto/${product.slug}`}>
          <h3 className="text-sm font-semibold text-slate-800 line-clamp-1 hover:underline mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Features row with icons */}
        {features && (
          <div className="flex items-center gap-3 text-xs text-slate-600 mb-2.5 min-h-[18px]">
            {(() => {
              const amb = getAttrValue(attrs, 'ambientes');
              const dorm = getAttrValue(attrs, 'dormitorios');
              const banos = getAttrValue(attrs, 'banos');
              const m2 = getAttrValue(attrs, 'm2_totales') || getAttrValue(attrs, 'm2_cubiertos');
              const cochera = getAttrValue(attrs, 'cochera');
              return (
                <>
                  {amb && (
                    <span className="flex items-center gap-1">
                      <BedDouble className="h-3.5 w-3.5" />
                      {amb} amb{dorm ? ` (${dorm} dorm)` : ''}
                    </span>
                  )}
                  {banos && (
                    <span className="flex items-center gap-1">
                      <Bath className="h-3.5 w-3.5" />
                      {banos}
                    </span>
                  )}
                  {m2 && (
                    <span className="flex items-center gap-1">
                      <Maximize2 className="h-3.5 w-3.5" />
                      {m2}m²
                    </span>
                  )}
                  {cochera && cochera !== 'No' && (
                    <span className="flex items-center gap-1">
                      <Car className="h-3.5 w-3.5" />
                      {cochera === '1' ? '' : cochera}
                    </span>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* Location */}
        <p className="flex items-center gap-1 text-xs text-slate-500 mb-3 min-h-[16px]">
          {barrio && (
            <>
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{barrio}</span>
            </>
          )}
        </p>

        {/* CTA — always at bottom */}
        <div className="mt-auto">
          {whatsappLink ? (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <MessageCircle className="h-4 w-4" />
              Consultar
            </a>
          ) : (
            <Link
              href={`/${slug}/producto/${product.slug}`}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Ver propiedad
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
