'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MessageCircle, MapPin, Phone, Share2,
  ChevronLeft, ChevronRight, X, BedDouble, Bath, Maximize2, Car,
  CalendarDays, Check, Camera, Grid3X3, Heart,
} from 'lucide-react';
import type { TenantPublic, Product, TenantBranding, ProductAttribute } from '@/lib/api';
import { PublicThemeWrapper } from '@/components/booking/public-theme-wrapper';
import { RealEstateHeader } from './real-estate-header';
import {
  processPropertyDescription, normalizePhoneForWhatsApp, formatPropertyPrice,
  getAttrValue, isAptoCredito, inferPropertyAttrs, stripHtml,
} from '@/lib/property-utils';
import { PropertyCard } from './property-card';
import { RealEstateFooter } from './real-estate-footer';
import { useFavorites } from '@/lib/hooks/use-favorites';

interface PropertyDetailProps {
  tenant: TenantPublic;
  slug: string;
  product: Product;
  branding: TenantBranding | null;
  relatedProducts: Product[];
}

export function PropertyDetail({ tenant, slug, product, branding, relatedProducts }: PropertyDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxMode, setLightboxMode] = useState<'carousel' | 'grid'>('carousel');
  const [copied, setCopied] = useState(false);
  const { isFav: isFavFn, toggleFav: toggleFavHook } = useFavorites();
  const isFav = isFavFn(product.id);
  const toggleFav = () => toggleFavHook(product.id);
  const [descExpanded, setDescExpanded] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const thumbnailStripRef = useRef<HTMLDivElement>(null);

  const settings = tenant.settings as any;
  const primaryColor = settings?.primaryColor || branding?.primaryColor || '#111827';
  const whatsappNumber = tenant.phone ? normalizePhoneForWhatsApp(tenant.phone) : '';

  const attrs = product.attributes as ProductAttribute[] | null;
  const inferred = inferPropertyAttrs(product.name, attrs);
  const operacion = getAttrValue(attrs, 'operacion') || inferred.operacion;
  const tipoPropiedad = getAttrValue(attrs, 'tipo_propiedad') || inferred.tipoPropiedad;
  const barrio = getAttrValue(attrs, 'barrio') || inferred.barrio;
  const expensas = getAttrValue(attrs, 'expensas');
  const aptoCredito = isAptoCredito(attrs);

  // Clean display name — remove redundant "Tipo en Operacion - " prefix
  const displayName = (() => {
    const prefixPattern = /^(?:Departamento|Casa|PH|Dúplex|Duplex|Tríplex|Semipiso|Piso|Loft|Penthouse|Local|Oficina|Terreno|Lote|Cochera|Galpón|Galpon|Depósito|Deposito|Quinta|Campo|Fondo\s+de\s+Comercio)\s+en\s+(?:Venta|Alquiler(?:\s+[Tt]emporario)?)\s*[-–—]\s*/i;
    const cleaned = product.name.replace(prefixPattern, '').trim();
    return cleaned || product.name;
  })();

  const { cleanDescription, extractedAttrs } = product.description
    ? processPropertyDescription(product.description, attrs || [])
    : { cleanDescription: '', extractedAttrs: [] };

  const heroKeys = ['m2_totales', 'ambientes', 'banos', 'dormitorios', 'cochera'];
  const surfaceKeys = ['m2_cubiertos', 'm2_descubiertos', 'm2_totales'];
  const detailKeys = ['antiguedad', 'estado', 'orientacion', 'plantas'];
  const allGroupedKeys = new Set([...heroKeys, ...surfaceKeys, ...detailKeys, 'operacion', 'tipo_propiedad', 'barrio', 'expensas', 'amenities', 'mascotas', 'apto_credito', 'apto_profesional']);

  const getVal = (key: string) => getAttrValue(attrs, key);
  const heroAttrs = heroKeys.map(k => attrs?.find(a => a.key === k)).filter((a): a is ProductAttribute => !!a && !!a.value);
  const amenities = getVal('amenities')?.split(',').filter(Boolean) || [];
  const booleanAttrs = attrs?.filter(a => a.type === 'boolean' && a.value === 'true') || [];
  const otherAttrs = (attrs?.filter(a => !allGroupedKeys.has(a.key) && a.value) || [])
    .map(a => ({
      ...a,
      // Strip HTML entities/tags from values (e.g. "servicios" field often has raw HTML)
      value: a.value && /&lt;|&gt;|<[a-z]|&amp;/i.test(a.value) ? stripHtml(a.value) : a.value,
    }))
    // Filter out attrs whose cleaned value is too long (likely full HTML dumps)
    .filter(a => a.value.length <= 200);

  const images = product.images?.length
    ? [...product.images].sort((a, b) => a.order - b.order)
    : [];

  // Window of 3 indices to render (prev, current, next).
  // Keeps DOM small for properties with 30+ photos while making
  // navigation feel instant — neighbours are always pre-mounted.
  const windowIndices = useMemo(() => {
    const total = images.length;
    if (total === 0) return [] as number[];
    if (total === 1) return [0];
    if (total === 2) return [0, 1];
    const prev = (selectedImage - 1 + total) % total;
    const next = (selectedImage + 1) % total;
    // Use a Set to dedupe in case selectedImage is at edges and wraps
    return Array.from(new Set([prev, selectedImage, next]));
  }, [selectedImage, images.length]);

  const heroIcons: Record<string, React.ReactNode> = {
    m2_totales: <Maximize2 className="h-5 w-5" />,
    ambientes: <BedDouble className="h-5 w-5" />,
    banos: <Bath className="h-5 w-5" />,
    dormitorios: <BedDouble className="h-5 w-5" />,
    cochera: <Car className="h-5 w-5" />,
  };

  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Hola! Me interesa la propiedad "${product.name}" (Cod: ${product.sku || product.slug}) - ${formatPropertyPrice(Number(product.price), operacion, product.currency)}. ¿Podrían darme más información?`
      )}`
    : null;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Share — native on mobile, clipboard on desktop
  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `${product.name} — ${formatPropertyPrice(Number(product.price), operacion, product.currency)}`,
          url: shareUrl,
        });
        return;
      } catch {}
    }
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const goToImage = useCallback((index: number) => {
    setSelectedImage(index);
  }, []);

  // Preload neighbour images so navigation between them is instant
  useEffect(() => {
    if (!images.length) return;
    const total = images.length;
    const neighbours = [
      (selectedImage + 1) % total,
      (selectedImage - 1 + total) % total,
      (selectedImage + 2) % total,
    ];
    neighbours.forEach((i) => {
      if (!images[i]?.url) return;
      const img = new window.Image();
      img.src = images[i].url;
    });
  }, [selectedImage, images]);

  const nextImage = useCallback(() => {
    if (images.length <= 1) return;
    goToImage(selectedImage === images.length - 1 ? 0 : selectedImage + 1);
  }, [selectedImage, images.length, goToImage]);

  const prevImage = useCallback(() => {
    if (images.length <= 1) return;
    goToImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1);
  }, [selectedImage, images.length, goToImage]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [nextImage, prevImage]);

  // Lock body scroll when lightbox open
  useEffect(() => {
    if (lightboxOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

  // Auto-scroll thumbnail strip to keep selected visible
  useEffect(() => {
    if (thumbnailStripRef.current && lightboxOpen) {
      const el = thumbnailStripRef.current.children[selectedImage] as HTMLElement;
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedImage, lightboxOpen]);

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setTouchDelta(0);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    setTouchDelta(e.touches[0].clientX - touchStart);
  };
  const handleTouchEnd = () => {
    if (Math.abs(touchDelta) > 60) {
      if (touchDelta > 0) prevImage();
      else nextImage();
    }
    setTouchStart(null);
    setTouchDelta(0);
  };

  const descLines = cleanDescription?.split('\n') || [];
  const showDescToggle = descLines.length > 6;

  const openLightbox = (index: number) => {
    setSelectedImage(index);
    setLightboxMode('carousel');
    setLightboxOpen(true);
  };

  return (
    <PublicThemeWrapper
      tenantSlug={slug}
      colors={{
        primaryColor,
        secondaryColor: settings?.secondaryColor || branding?.secondaryColor,
        accentColor: settings?.accentColor || branding?.accentColor,
      }}
      enableDarkMode={false}
      themeMode="light"
    >
      <RealEstateHeader tenant={tenant} slug={slug} primaryColor={primaryColor} transparent branding={branding} />

      <div className="min-h-screen relative" style={{ backgroundColor: '#FAF8F5' }}>
        {/* ===== GALLERY ===== */}

        <div className="max-w-[1400px] mx-auto relative z-[1]">
          {images.length > 0 ? (
            <>
              {/* Desktop / tablet: single-image carousel (windowed stack) */}
              <div className="hidden md:block px-6 pt-[90px]">
                <div
                  className="group relative h-[560px] rounded-3xl overflow-hidden shadow-lg bg-stone-900 cursor-zoom-in"
                  onClick={() => openLightbox(selectedImage)}
                  onTouchStart={images.length > 1 ? handleTouchStart : undefined}
                  onTouchMove={images.length > 1 ? handleTouchMove : undefined}
                  onTouchEnd={images.length > 1 ? handleTouchEnd : undefined}
                >
                  {/* Stacked images — only render the 3-image window */}
                  {windowIndices.map((idx) => (
                    <div
                      key={images[idx].id || idx}
                      className="absolute inset-0 transition-opacity duration-200 ease-out"
                      style={{
                        opacity: idx === selectedImage ? 1 : 0,
                        zIndex: idx === selectedImage ? 2 : 1,
                        ...(touchDelta !== 0 && idx === selectedImage
                          ? { transform: `translateX(${touchDelta * 0.35}px)`, transition: 'none' }
                          : {}),
                      }}
                    >
                      {/* Blurred backdrop — fills the container so any aspect ratio looks cohesive */}
                      <Image
                        src={images[idx].url}
                        alt=""
                        fill
                        className="object-cover scale-110 blur-2xl opacity-55 select-none"
                        sizes="(max-width: 1400px) 50vw, 700px"
                        aria-hidden="true"
                        draggable={false}
                      />
                      {/* Foreground — contained, full quality, no crop */}
                      <Image
                        src={images[idx].url}
                        alt={idx === 0 ? product.name : ''}
                        fill
                        className="object-contain select-none"
                        sizes="(max-width: 1400px) 100vw, 1400px"
                        priority={idx === 0}
                        quality={88}
                        draggable={false}
                      />
                    </div>
                  ))}

                  {/* Subtle gradient — improves contrast for overlay controls */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/15 to-transparent z-[3]" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent z-[3]" />

                  {/* Nav arrows — desktop only, hover-revealed */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        aria-label="Imagen anterior"
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-[5] h-12 w-12 rounded-full bg-white/90 hover:bg-white text-stone-800 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        aria-label="Imagen siguiente"
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-[5] h-12 w-12 rounded-full bg-white/90 hover:bg-white text-stone-800 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}

                  {/* Counter pill */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 right-4 z-[5] px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-sm text-white text-xs font-semibold flex items-center gap-1.5">
                      <Camera className="h-3 w-3" />
                      {selectedImage + 1} / {images.length}
                    </div>
                  )}

                  {/* Dot indicators */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[5] flex items-center gap-1.5">
                      {images.slice(0, Math.min(images.length, 7)).map((_, i) => (
                        <button
                          key={i}
                          onClick={(e) => { e.stopPropagation(); goToImage(i); }}
                          aria-label={`Foto ${i + 1}`}
                          className={`rounded-full transition-all duration-300 ${
                            selectedImage === i
                              ? 'w-6 h-1.5 bg-white'
                              : 'w-1.5 h-1.5 bg-white/55 hover:bg-white/80'
                          }`}
                        />
                      ))}
                      {images.length > 7 && (
                        <span className="text-white/70 text-[10px] ml-1 font-medium">+{images.length - 7}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action buttons below gallery */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleShare}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors border border-stone-200/60"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
                      {copied ? 'Copiado' : 'Compartir'}
                    </button>
                    <button
                      onClick={toggleFav}
                      className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-medium transition-colors border ${
                        isFav
                          ? 'text-red-500 border-red-200 bg-red-50 hover:bg-red-100'
                          : 'text-stone-600 border-stone-200/60 hover:bg-stone-100'
                      }`}
                    >
                      <Heart className="h-3.5 w-3.5" fill={isFav ? 'currentColor' : 'none'} />
                      {isFav ? 'Guardado' : 'Guardar'}
                    </button>
                  </div>
                  {images.length > 1 && (
                    <button
                      onClick={() => { setLightboxMode('grid'); setLightboxOpen(true); }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors border border-stone-200/60"
                      style={{ backgroundColor: '#FAF8F5' }}
                    >
                      <Grid3X3 className="h-3.5 w-3.5" />
                      Ver las {images.length} fotos
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile: Full-width swipeable carousel (windowed stack) */}
              <div className="md:hidden relative">
                <div
                  className="relative h-[80vw] min-h-[340px] max-h-[560px] overflow-hidden bg-stone-900"
                  onTouchStart={images.length > 1 ? handleTouchStart : undefined}
                  onTouchMove={images.length > 1 ? handleTouchMove : undefined}
                  onTouchEnd={images.length > 1 ? handleTouchEnd : undefined}
                  onClick={() => openLightbox(selectedImage)}
                >
                  {windowIndices.map((idx) => (
                    <div
                      key={images[idx].id || idx}
                      className="absolute inset-0 transition-opacity duration-200 ease-out"
                      style={{
                        opacity: idx === selectedImage ? 1 : 0,
                        zIndex: idx === selectedImage ? 2 : 1,
                        ...(touchDelta !== 0 && idx === selectedImage
                          ? { transform: `translateX(${touchDelta * 0.4}px)`, transition: 'none' }
                          : {}),
                      }}
                    >
                      {/* Blurred backdrop */}
                      <Image
                        src={images[idx].url}
                        alt=""
                        fill
                        className="object-cover scale-110 blur-2xl opacity-55 select-none"
                        sizes="60vw"
                        aria-hidden="true"
                        draggable={false}
                      />
                      {/* Foreground */}
                      <Image
                        src={images[idx].url}
                        alt={idx === 0 ? product.name : ''}
                        fill
                        className="object-contain select-none"
                        priority={idx === 0}
                        sizes="100vw"
                        quality={88}
                        draggable={false}
                      />
                    </div>
                  ))}
                  {/* Gradient overlay — top only, blends into header */}
                  <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/30 to-transparent" />

                  {/* Right action column — heart + share, continues right below header hamburger (h-[64px] header, hamburger bottom ~52px, +8px gap = 60px) */}
                  <div className="absolute top-[60px] right-5 flex flex-col items-center gap-2 z-[41]" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={toggleFav}
                      className={`h-10 w-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all active:scale-90 ${
                        isFav ? 'bg-red-500 text-white' : 'bg-black/30 text-white hover:bg-black/50'
                      }`}
                    >
                      <Heart className="h-[18px] w-[18px]" fill={isFav ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={handleShare}
                      className="h-10 w-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white transition-all hover:bg-black/50 active:scale-90"
                    >
                      {copied ? <Check className="h-[18px] w-[18px] text-emerald-400" /> : <Share2 className="h-[18px] w-[18px]" />}
                    </button>
                  </div>

                  {/* Back button — same vertical as heart (top-[60px]), left edge aligned with header logo */}
                  <Link
                    href={`/${slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-[60px] left-3 h-7 px-2.5 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white text-[10px] font-semibold tracking-wide z-[41] hover:bg-black/50 transition-colors"
                  >
                    Volver
                  </Link>

                  {/* Counter pill */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-semibold flex items-center gap-1.5 z-10">
                      <Camera className="h-3 w-3" />
                      {selectedImage + 1} / {images.length}
                    </div>
                  )}

                  {/* Swipe hint dots */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
                      {images.slice(0, Math.min(images.length, 7)).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-full transition-all duration-300 ${
                            selectedImage === i
                              ? 'w-5 h-1.5 bg-white'
                              : 'w-1.5 h-1.5 bg-white/50'
                          }`}
                        />
                      ))}
                      {images.length > 7 && (
                        <span className="text-white/60 text-[9px] ml-0.5">+{images.length - 7}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="h-64 mx-4 md:mx-6 mt-6 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#F0EBE3', border: '1px solid rgba(168,162,150,0.2)' }}>
              <Camera className="h-12 w-12 text-stone-300" />
            </div>
          )}
        </div>

        {/* ===== Content ===== */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-14">
            {/* Left column (2/3) */}
            <div className="lg:col-span-2 space-y-10">
              {/* Header: clear visual hierarchy */}
              <div>
                {/* Tier 1 — Badges row */}
                <div className="flex flex-wrap items-center gap-1.5 md:gap-2.5 mb-4 md:mb-5">
                  {operacion && (
                    <span className={`px-2.5 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-[11px] font-bold text-white uppercase tracking-wider ${
                      operacion === 'Venta' ? 'bg-blue-600' : operacion === 'Alquiler' ? 'bg-amber-500' : 'bg-violet-600'
                    }`} style={{ boxShadow: operacion === 'Venta' ? '0 2px 8px rgba(37,99,235,0.25)' : operacion === 'Alquiler' ? '0 2px 8px rgba(245,158,11,0.25)' : '0 2px 8px rgba(139,92,246,0.25)' }}>
                      {operacion}
                    </span>
                  )}
                  {tipoPropiedad && (
                    <span className="px-2.5 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-[11px] font-semibold uppercase tracking-wider border" style={{ backgroundColor: '#F0EBE3', borderColor: 'rgba(168,162,150,0.25)', color: '#78716c' }}>
                      {tipoPropiedad}
                    </span>
                  )}
                  {aptoCredito && (
                    <span className="px-2.5 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-[11px] font-bold text-white uppercase tracking-wider bg-emerald-600 inline-flex items-center gap-1" style={{ boxShadow: '0 2px 8px rgba(5,150,105,0.25)' }}>
                      <Check className="h-3 w-3" />
                      Apto Crédito
                    </span>
                  )}
                  {product.sku && (
                    <span className="text-[10px] md:text-[11px] text-stone-400 font-mono ml-auto tracking-wide">COD {product.sku}</span>
                  )}
                </div>

                {/* Tier 2 — Title: cleaned name without redundant prefix */}
                <h1
                  className="text-[22px] md:text-[28px] lg:text-[34px] font-bold text-stone-900 mb-2.5"
                  style={{ letterSpacing: '-0.025em', lineHeight: 1.15 }}
                >
                  {displayName}
                </h1>

                {/* Tier 3 — Location */}
                {barrio && (
                  <p className="flex items-center gap-2 text-[14px] text-stone-400 mb-7">
                    <MapPin className="h-4 w-4 shrink-0" style={{ color: primaryColor }} />
                    <span>{barrio}{tenant.city ? `, ${tenant.city}` : ''}</span>
                  </p>
                )}

                {/* Tier 4 — Price: premium card */}
                <div className="rounded-xl md:rounded-2xl p-4 md:p-6" style={{ backgroundColor: '#F0EBE3', border: '1px solid rgba(168,162,150,0.2)' }}>
                  <p className="text-[10px] md:text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1.5 md:mb-2">Precio</p>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p
                      className="text-[26px] md:text-[36px] lg:text-[44px] font-extrabold text-stone-900"
                      style={{ letterSpacing: '-0.03em', lineHeight: 1 }}
                    >
                      {formatPropertyPrice(Number(product.price), operacion, product.currency)}
                    </p>
                    {operacion === 'Alquiler' && (
                      <span className="text-lg font-normal text-stone-400">/mes</span>
                    )}
                  </div>
                  {expensas && !isNaN(Number(expensas)) && (
                    <p className="text-sm text-stone-500 mt-2 flex items-center gap-2">
                      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor, opacity: 0.5 }} />
                      Expensas: ${Number(expensas).toLocaleString('es-AR')}
                    </p>
                  )}
                </div>
              </div>

              {/* Features bar — compact metric pills */}
              {heroAttrs.length > 0 && (
                <div className="flex flex-wrap gap-2 md:gap-2.5">
                  {heroAttrs.map(attr => (
                    <div
                      key={attr.key}
                      className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-3.5 md:py-2 rounded-lg md:rounded-xl"
                      style={{
                        backgroundColor: '#FAF8F5',
                        border: '1px solid rgba(168,162,150,0.2)',
                      }}
                    >
                      <div
                        className="h-6 w-6 md:h-7 md:w-7 rounded-md md:rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}
                      >
                        {heroIcons[attr.key]}
                      </div>
                      <div className="flex items-baseline gap-0.5 md:gap-1">
                        <span className="text-sm md:text-base font-bold text-stone-900">
                          {attr.value}
                          {attr.unit && <span className="text-[10px] md:text-[11px] font-normal text-stone-400 ml-0.5">{attr.unit}</span>}
                        </span>
                        <span className="text-[10px] md:text-[11px] text-stone-400 font-medium">{attr.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Description — editorial style */}
              {cleanDescription && (
                <div className="rounded-xl md:rounded-2xl p-4 md:p-8" style={{ backgroundColor: 'white', border: '1px solid rgba(168,162,150,0.15)', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                  <div className="flex items-center gap-2.5 md:gap-3 mb-4 md:mb-5">
                    <div className="w-1 h-5 md:h-6 rounded-full" style={{ backgroundColor: primaryColor }} />
                    <h2 className="text-lg md:text-xl font-bold text-stone-900">Descripción</h2>
                  </div>
                  <div className="text-sm md:text-[15px] text-stone-600 leading-[1.75] md:leading-[1.85]">
                    {(descExpanded ? descLines : descLines.slice(0, 6)).map((line, i) => (
                      <p key={i} className="mb-2.5">{line}</p>
                    ))}
                    {showDescToggle && (
                      <button
                        onClick={() => setDescExpanded(!descExpanded)}
                        className="text-sm font-bold mt-4 px-5 py-2.5 rounded-xl transition-all hover:brightness-110 text-white"
                        style={{ backgroundColor: primaryColor, boxShadow: `0 2px 8px ${primaryColor}25` }}
                      >
                        {descExpanded ? 'Mostrar menos' : 'Leer más'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Ficha técnica — premium card */}
              <div className="rounded-xl md:rounded-2xl overflow-hidden" style={{ backgroundColor: 'white', border: '1px solid rgba(168,162,150,0.15)', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                <div className="p-4 md:p-8 space-y-6 md:space-y-8">
                  <div className="flex items-center gap-2.5 md:gap-3">
                    <div className="w-1 h-5 md:h-6 rounded-full" style={{ backgroundColor: primaryColor }} />
                    <h2 className="text-lg md:text-xl font-bold text-stone-900">Características</h2>
                  </div>

                  {/* Surface — highlighted section */}
                  {surfaceKeys.some(k => getVal(k)) && (
                    <div>
                      <h3 className="text-xs font-bold text-stone-400 uppercase tracking-[0.12em] mb-4 flex items-center gap-2">
                        <Maximize2 className="h-3.5 w-3.5" />
                        Superficie
                      </h3>
                      <div className="flex flex-wrap gap-2 md:gap-2.5">
                        {surfaceKeys.map(k => {
                          const val = getVal(k);
                          if (!val) return null;
                          const label = k === 'm2_cubiertos' ? 'Cubiertos' : k === 'm2_descubiertos' ? 'Descubiertos' : 'Totales';
                          const isTotal = k === 'm2_totales';
                          return (
                            <div
                              key={k}
                              className="inline-flex items-baseline gap-1 md:gap-1.5 px-2.5 py-1.5 md:px-3.5 md:py-2 rounded-lg md:rounded-xl"
                              style={isTotal ? {
                                background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                                boxShadow: `0 2px 8px ${primaryColor}20`,
                              } : {
                                backgroundColor: '#F0EBE3',
                                border: '1px solid rgba(168,162,150,0.2)',
                              }}
                            >
                              <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${isTotal ? 'text-white/60' : 'text-stone-400'}`}>{label}</span>
                              <span className={`text-sm md:text-base font-bold ${isTotal ? 'text-white' : 'text-stone-900'}`}>
                                {val} <span className={`text-[10px] md:text-xs font-normal ${isTotal ? 'text-white/50' : 'text-stone-400'}`}>m²</span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Details — alternating rows */}
                  {detailKeys.some(k => getVal(k)) && (
                    <div>
                      <h3 className="text-xs font-bold text-stone-400 uppercase tracking-[0.12em] mb-4">Detalles</h3>
                      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(168,162,150,0.15)' }}>
                        {detailKeys.map((k, idx) => {
                          const val = getVal(k);
                          if (!val) return null;
                          const attr = attrs?.find(a => a.key === k);
                          return (
                            <div
                              key={k}
                              className="flex items-center justify-between px-4 py-3 md:px-5 md:py-4 transition-colors"
                              style={{ backgroundColor: idx % 2 === 0 ? '#FAF8F5' : 'white' }}
                            >
                              <span className="text-xs md:text-sm text-stone-500 font-medium">{attr?.label || k}</span>
                              <span className="text-xs md:text-sm font-bold text-stone-800">{val}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  {barrio && (
                    <div>
                      <h3 className="text-xs font-bold text-stone-400 uppercase tracking-[0.12em] mb-4 flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        Ubicación
                      </h3>
                      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(168,162,150,0.15)' }}>
                        <div className="flex items-center justify-between px-4 py-3 md:px-5 md:py-4" style={{ backgroundColor: '#FAF8F5' }}>
                          <span className="text-xs md:text-sm text-stone-500 font-medium">Barrio</span>
                          <span className="text-xs md:text-sm font-bold text-stone-800">{barrio}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Other attributes */}
                  {otherAttrs.length > 0 && (
                    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(168,162,150,0.15)' }}>
                      {otherAttrs.map((attr, idx) => (
                        <div
                          key={attr.key}
                          className="flex items-center justify-between px-4 py-3 md:px-5 md:py-4 transition-colors"
                          style={{ backgroundColor: idx % 2 === 0 ? '#FAF8F5' : 'white' }}
                        >
                          <span className="text-xs md:text-sm text-stone-500 font-medium">{attr.label}</span>
                          <span className="text-xs md:text-sm font-bold text-stone-800 text-right truncate ml-4">
                            {attr.value}{attr.unit ? ` ${attr.unit}` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Extracted attributes from description */}
                  {extractedAttrs.length > 0 && (
                    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(168,162,150,0.15)' }}>
                      {extractedAttrs.map((attr, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between px-4 py-3 md:px-5 md:py-4 transition-colors"
                          style={{ backgroundColor: i % 2 === 0 ? '#FAF8F5' : 'white' }}
                        >
                          <span className="text-xs md:text-sm text-stone-500 font-medium">{attr.label}</span>
                          <span className="text-xs md:text-sm font-bold text-stone-800">{attr.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Amenities — refined chips */}
                  {amenities.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-stone-400 uppercase tracking-[0.12em] mb-4">Amenities</h3>
                      <div className="flex flex-wrap gap-1.5 md:gap-2.5">
                        {amenities.map(a => (
                          <span
                            key={a}
                            className="px-2.5 py-1.5 md:px-4 md:py-2.5 rounded-lg md:rounded-xl text-[11px] md:text-xs font-semibold"
                            style={{ backgroundColor: `${primaryColor}10`, color: primaryColor, border: `1px solid ${primaryColor}20` }}
                          >
                            {a.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Boolean extras — elegant tags */}
                  {booleanAttrs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 md:gap-2.5">
                      {booleanAttrs.map(attr => (
                        <span
                          key={attr.key}
                          className="inline-flex items-center gap-1 md:gap-1.5 px-2.5 py-1.5 md:px-4 md:py-2.5 rounded-lg md:rounded-xl text-[11px] md:text-xs font-semibold bg-emerald-50 text-emerald-700"
                          style={{ border: '1px solid rgba(5,150,105,0.15)' }}
                        >
                          <Check className="h-3 w-3" /> {attr.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Map — with refined header */}
              {barrio && tenant.city && (
                <div className="rounded-xl md:rounded-2xl overflow-hidden" style={{ backgroundColor: 'white', border: '1px solid rgba(168,162,150,0.15)', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                  <div className="flex items-center gap-2.5 md:gap-3 p-4 pb-3 md:p-6 md:pb-4">
                    <div className="w-1 h-5 md:h-6 rounded-full" style={{ backgroundColor: primaryColor }} />
                    <h2 className="text-lg md:text-xl font-bold text-stone-900">Ubicación</h2>
                  </div>
                  <div className="px-4 pb-4 md:px-6 md:pb-6">
                  <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(168,162,150,0.15)' }}>
                    <iframe
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(`${barrio}, ${tenant.city}, Argentina`)}&zoom=14`}
                      width="100%"
                      height="280"
                      className="md:!h-[380px]"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  </div>
                </div>
              )}
            </div>

            {/* ===== Right column — Sticky contact ===== */}
            <div className="lg:col-span-1">
              <div className="sticky top-[88px] space-y-4">
                {/* Price + CTA card */}
                <div
                  className="rounded-3xl overflow-hidden"
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid rgba(168,162,150,0.15)',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  {/* Price header */}
                  <div className="p-4 pb-3 md:p-6 md:pb-5" style={{ background: 'linear-gradient(to bottom, #F0EBE3, #FAF8F5)' }}>
                    <p className="text-[10px] md:text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1.5 md:mb-2">Precio</p>
                    <p className="text-[22px] md:text-[28px] font-extrabold text-stone-900" style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                      {formatPropertyPrice(Number(product.price), operacion, product.currency)}
                      {operacion === 'Alquiler' && <span className="text-sm font-normal text-stone-400 ml-1">/mes</span>}
                    </p>
                    {expensas && !isNaN(Number(expensas)) && (
                      <p className="text-xs text-stone-500 mt-2 flex items-center gap-1.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor, opacity: 0.4 }} />
                        Expensas: ${Number(expensas).toLocaleString('es-AR')}
                      </p>
                    )}
                  </div>

                  <div className="px-4 pb-4 md:px-6 md:pb-6 space-y-2.5 md:space-y-3">
                    {/* WhatsApp CTA — prominent with gradient */}
                    {whatsappLink && (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 md:gap-2.5 py-3 md:py-4 rounded-xl md:rounded-2xl text-sm md:text-[15px] font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
                        style={{
                          background: 'linear-gradient(135deg, #25D366, #128C7E)',
                          boxShadow: '0 6px 20px rgba(37,211,102,0.35), 0 2px 6px rgba(37,211,102,0.2)',
                        }}
                      >
                        <MessageCircle className="h-5 w-5" />
                        Consultar por WhatsApp
                      </a>
                    )}

                    {/* Agendar visita */}
                    <Link
                      href={`/${slug}`}
                      className="w-full inline-flex items-center justify-center gap-2 md:gap-2.5 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition-all hover:brightness-110 active:scale-[0.98]"
                      style={{
                        backgroundColor: '#FAF8F5',
                        color: primaryColor,
                        border: `2px solid ${primaryColor}`,
                        boxShadow: `0 2px 8px ${primaryColor}15`,
                      }}
                    >
                      <CalendarDays className="h-[18px] w-[18px]" />
                      Agendar visita
                    </Link>

                    {/* Phone */}
                    {tenant.phone && (
                      <a
                        href={`tel:${tenant.phone}`}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-xs md:text-sm font-semibold text-stone-600 hover:bg-stone-100 transition-all"
                        style={{ backgroundColor: '#F0EBE3', border: '1px solid rgba(168,162,150,0.2)' }}
                      >
                        <Phone className="h-4 w-4" />
                        {tenant.phone}
                      </a>
                    )}
                  </div>

                  {/* Agent info — refined */}
                  <div className="px-6 py-4 flex items-center gap-3.5" style={{ borderTop: '1px solid rgba(168,162,150,0.15)', backgroundColor: '#F0EBE3' }}>
                    {tenant.logo && (
                      <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-white flex items-center justify-center" style={{ border: '1px solid rgba(168,162,150,0.2)' }}>
                        <Image
                          src={tenant.logo}
                          alt={tenant.name}
                          fill
                          className="object-contain p-1"
                          sizes="48px"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-sm text-stone-900">{tenant.name}</p>
                      <p className="text-xs text-stone-400 font-medium">Inmobiliaria</p>
                    </div>
                  </div>
                </div>

                {/* Contact form card — refined */}
                <div
                  className="rounded-3xl overflow-hidden"
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid rgba(168,162,150,0.15)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  }}
                >
                  <div className="px-4 py-4 md:px-6 md:py-5" style={{ borderBottom: '1px solid rgba(168,162,150,0.15)', background: 'linear-gradient(to bottom, #F0EBE3, #FAF8F5)' }}>
                    <p className="text-sm font-bold text-stone-900">Envianos tu consulta</p>
                    <p className="text-xs text-stone-400 mt-0.5 font-medium">Te respondemos a la brevedad</p>
                  </div>
                  <form className="p-4 md:p-6 space-y-3 md:space-y-3.5" onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
                    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
                    const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value;
                    const msg = `Hola! Soy ${name} (${phone}). ${message} - Propiedad: ${product.name} (${product.sku || product.slug})`;
                    if (whatsappNumber) {
                      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
                    }
                  }}>
                    <input
                      name="name"
                      type="text"
                      placeholder="Nombre completo"
                      required
                      className="w-full px-3.5 py-3 md:px-4 md:py-3.5 rounded-lg md:rounded-xl text-xs md:text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                      style={{ backgroundColor: '#FAF8F5', border: '1px solid rgba(168,162,150,0.2)', '--tw-ring-color': primaryColor } as any}
                    />
                    <input
                      name="phone"
                      type="tel"
                      placeholder="Teléfono"
                      required
                      className="w-full px-3.5 py-3 md:px-4 md:py-3.5 rounded-lg md:rounded-xl text-xs md:text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                      style={{ backgroundColor: '#FAF8F5', border: '1px solid rgba(168,162,150,0.2)', '--tw-ring-color': primaryColor } as any}
                    />
                    <input
                      name="email"
                      type="email"
                      placeholder="Email (opcional)"
                      className="w-full px-3.5 py-3 md:px-4 md:py-3.5 rounded-lg md:rounded-xl text-xs md:text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                      style={{ backgroundColor: '#FAF8F5', border: '1px solid rgba(168,162,150,0.2)', '--tw-ring-color': primaryColor } as any}
                    />
                    <textarea
                      name="message"
                      placeholder="Quiero más información sobre esta propiedad..."
                      rows={3}
                      className="w-full px-4 py-3.5 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all resize-none"
                      style={{ backgroundColor: '#FAF8F5', border: '1px solid rgba(168,162,150,0.2)', '--tw-ring-color': primaryColor } as any}
                    />
                    <button
                      type="submit"
                      className="w-full py-3 md:py-3.5 rounded-lg md:rounded-xl text-xs md:text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
                      style={{
                        backgroundColor: primaryColor,
                        boxShadow: `0 4px 16px ${primaryColor}30`,
                      }}
                    >
                      Enviar consulta
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Related properties — premium section */}
          {relatedProducts.length > 0 && (
            <div className="mt-10 md:mt-16 -mx-4 md:-mx-6 px-4 md:px-6 py-8 md:py-16 rounded-t-2xl md:rounded-t-3xl" style={{ backgroundColor: '#F0EBE3' }}>
              <div className="flex items-center gap-2.5 md:gap-3 mb-6 md:mb-8">
                <div className="w-1 h-5 md:h-6 rounded-full" style={{ backgroundColor: primaryColor }} />
                <h2 className="text-lg md:text-xl font-bold text-stone-900">Propiedades similares</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProducts.slice(0, 3).map(p => (
                  <PropertyCard
                    key={p.id}
                    product={p}
                    slug={slug}
                    primaryColor={primaryColor}
                    whatsappNumber={whatsappNumber}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <RealEstateFooter tenant={tenant} branding={branding} primaryColor={primaryColor} />
      </div>

      {/* ===== LIGHTBOX ===== */}
      {lightboxOpen && images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* Top bar */}
          <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 md:px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                onClick={() => setLightboxOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
              <span className="text-white/70 text-sm font-medium hidden sm:block">
                {selectedImage + 1} de {images.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Toggle grid/carousel */}
              <button
                onClick={() => setLightboxMode(m => m === 'carousel' ? 'grid' : 'carousel')}
                className={`h-10 w-10 rounded-full flex items-center justify-center text-white transition-colors ${
                  lightboxMode === 'grid' ? 'bg-white/25' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={handleShare}
                className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {lightboxMode === 'carousel' ? (
            <>
              {/* Navigation arrows — desktop */}
              {images.length > 1 && (
                <>
                  <button
                    className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center text-white transition-all hover:scale-105 z-20"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-7 w-7" />
                  </button>
                  <button
                    className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center text-white transition-all hover:scale-105 z-20"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-7 w-7" />
                  </button>
                </>
              )}

              {/* Main image — windowed stack of 3 (prev/current/next) */}
              <div
                className="absolute inset-0 flex items-center justify-center pt-16 pb-28 md:px-20 px-4"
                onClick={() => setLightboxOpen(false)}
                onTouchStart={images.length > 1 ? handleTouchStart : undefined}
                onTouchMove={images.length > 1 ? handleTouchMove : undefined}
                onTouchEnd={images.length > 1 ? handleTouchEnd : undefined}
              >
                <div
                  className="relative w-full h-full max-w-6xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {windowIndices.map((idx) => (
                    <div
                      key={images[idx].id || idx}
                      className="absolute inset-0 transition-opacity duration-200 ease-out"
                      style={{
                        opacity: idx === selectedImage ? 1 : 0,
                        zIndex: idx === selectedImage ? 2 : 1,
                        ...(touchDelta !== 0 && idx === selectedImage
                          ? { transform: `translateX(${touchDelta * 0.5}px)`, transition: 'none' }
                          : {}),
                      }}
                    >
                      <Image
                        src={images[idx].url}
                        alt={idx === 0 ? product.name : ''}
                        fill
                        className="object-contain select-none"
                        sizes="100vw"
                        priority={idx === selectedImage}
                        quality={92}
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Thumbnail strip — bottom */}
              {images.length > 1 && (
                <div className="absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-8 pb-4">
                  <div
                    ref={thumbnailStripRef}
                    className="flex items-center gap-2 px-4 md:px-6 overflow-x-auto scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {images.map((img, i) => (
                      <button
                        key={img.id}
                        onClick={() => goToImage(i)}
                        className={`relative shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${
                          selectedImage === i
                            ? 'ring-2 ring-white w-16 h-16 md:w-20 md:h-20 opacity-100'
                            : 'w-14 h-14 md:w-16 md:h-16 opacity-50 hover:opacity-80'
                        }`}
                      >
                        <Image
                          src={img.url}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile counter */}
              <div className="md:hidden absolute bottom-24 left-1/2 -translate-x-1/2 z-20">
                <span className="text-white/60 text-sm font-medium">
                  {selectedImage + 1} / {images.length}
                </span>
              </div>
            </>
          ) : (
            /* Grid mode — all photos */
            <div className="absolute inset-0 pt-16 overflow-y-auto">
              <div className="max-w-5xl mx-auto px-4 md:px-6 pb-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                  {images.map((img, i) => (
                    <div
                      key={img.id}
                      className={`relative cursor-pointer group overflow-hidden rounded-lg ${
                        i === 0 ? 'col-span-2 md:col-span-2 aspect-[16/10]' : 'aspect-square'
                      }`}
                      onClick={() => { setSelectedImage(i); setLightboxMode('carousel'); }}
                    >
                      <Image
                        src={img.url}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes={i === 0 ? '66vw' : '33vw'}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/50 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </PublicThemeWrapper>
  );
}
