'use client';

import { useState, useRef, useCallback } from 'react';
import { MapPin, Phone, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Location {
  id: string;
  name: string;
  image: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  isMain?: boolean;
}

interface LocationCarouselProps {
  locations: Location[];
  tenantName: string;
  className?: string;
}

export function LocationCarousel({ locations, tenantName, className }: LocationCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const carouselRef = useRef<HTMLDivElement>(null);

  const validLocations = locations.filter(loc => loc.address || loc.city);

  const animateSlide = useCallback((direction: 'left' | 'right', newIndex: number) => {
    if (isAnimating) return;
    setSlideDirection(direction);
    setIsAnimating(true);

    setTimeout(() => {
      setCurrentIndex(newIndex);
      setTimeout(() => {
        setIsAnimating(false);
      }, 50);
    }, 150);
  }, [isAnimating]);

  const goToPrevious = useCallback(() => {
    const newIndex = (currentIndex - 1 + validLocations.length) % validLocations.length;
    animateSlide('right', newIndex);
  }, [currentIndex, validLocations.length, animateSlide]);

  const goToNext = useCallback(() => {
    const newIndex = (currentIndex + 1) % validLocations.length;
    animateSlide('left', newIndex);
  }, [currentIndex, validLocations.length, animateSlide]);

  const goToSlide = useCallback((index: number) => {
    if (index === currentIndex) return;
    const direction = index > currentIndex ? 'left' : 'right';
    animateSlide(direction, index);
  }, [currentIndex, animateSlide]);

  // Touch/swipe handling
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (isAnimating) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
  };

  if (validLocations.length === 0) return null;

  const currentLocation = validLocations[currentIndex];
  const fullAddress = [currentLocation.address, currentLocation.city].filter(Boolean).join(', ');
  const mapQuery = encodeURIComponent(`${fullAddress}, Argentina`);

  return (
    <section
      id="location-section"
      className={cn(
        "relative z-10 overflow-hidden border-t border-slate-200/60 dark:border-neutral-800",
        className
      )}
    >
      {/* Background gradient — light: soft slate→teal tint, dark: deep neutral→teal tint */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-teal-50/40 dark:from-neutral-900 dark:via-neutral-900 dark:to-teal-950/30" />
      {/* Decorative blobs */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-teal-200/20 dark:bg-teal-800/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-slate-200/30 dark:bg-neutral-700/15 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 relative">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 mb-3 relative">
              {/* Subtle animated ping ring */}
              <span className="absolute inset-0 rounded-full bg-slate-900/5 dark:bg-white/5 animate-ping opacity-30" />
              <span className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-600 dark:from-neutral-200 dark:to-neutral-400 shadow-md">
                <MapPin className="h-4.5 w-4.5 text-white dark:text-neutral-900" strokeWidth={2.5} />
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {validLocations.length > 1 ? 'Nuestras Ubicaciones' : 'Nuestra Ubicacion'}
            </h2>
            <p className="text-muted-foreground">
              {validLocations.length > 1
                ? 'Encuentra la sucursal mas cercana'
                : 'Visitanos en nuestro local'}
            </p>
          </div>

          {/* Carousel Container */}
          <div
            ref={carouselRef}
            className="relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Navigation Arrows - Desktop */}
            {validLocations.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="hidden md:flex absolute -left-5 lg:-left-14 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white dark:bg-neutral-800 shadow-md border border-slate-200 dark:border-neutral-700 items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-neutral-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  aria-label="Ubicacion anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={goToNext}
                  className="hidden md:flex absolute -right-5 lg:-right-14 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white dark:bg-neutral-800 shadow-md border border-slate-200 dark:border-neutral-700 items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-neutral-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  aria-label="Siguiente ubicacion"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Location Card */}
            <div
              className={cn(
                "relative overflow-hidden rounded-2xl shadow-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800",
                "transition-all duration-300 ease-out",
                isAnimating && slideDirection === 'left' && "translate-x-[-20px] opacity-0",
                isAnimating && slideDirection === 'right' && "translate-x-[20px] opacity-0",
                !isAnimating && "translate-x-0 opacity-100"
              )}
            >
              {/* Branch indicator badge */}
              {validLocations.length > 1 && (
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium shadow-sm",
                    currentLocation.isMain
                      ? "bg-amber-500 text-white"
                      : "bg-white/95 dark:bg-neutral-800/95 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-neutral-600"
                  )}>
                    {currentLocation.isMain ? '★ Principal' : currentLocation.name}
                  </div>
                </div>
              )}

              {/* Counter badge */}
              {validLocations.length > 1 && (
                <div className="absolute top-3 right-3 z-10">
                  <div className="px-2.5 py-1 rounded-full text-xs font-medium bg-black/60 text-white">
                    {currentIndex + 1} / {validLocations.length}
                  </div>
                </div>
              )}

              {/* Map — CSS invert for dark mode */}
              <div className="relative h-56 sm:h-64 md:h-72 bg-slate-200 dark:bg-neutral-700">
                <iframe
                  key={currentLocation.id}
                  src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 dark:invert dark:hue-rotate-180 dark:brightness-95 dark:contrast-90"
                  title={`Mapa de ${currentLocation.name}`}
                />
              </div>

              {/* Address Details */}
              <div className="p-4 sm:p-5">
                {/* Location info row */}
                <div className="flex items-start gap-3 min-w-0 mb-3 sm:mb-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-slate-600 dark:text-neutral-300" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                      {validLocations.length > 1 ? currentLocation.name : tenantName}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {currentLocation.address && <span>{currentLocation.address}</span>}
                      {currentLocation.address && currentLocation.city && <span>, </span>}
                      {currentLocation.city && <span>{currentLocation.city}</span>}
                    </p>
                  </div>
                </div>

                {/* Action Buttons — equal width grid on mobile, inline on desktop */}
                <div className={cn(
                  "grid gap-2",
                  currentLocation.phone ? "grid-cols-2" : "grid-cols-1",
                  "sm:flex sm:justify-end"
                )}>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-sm font-medium rounded-lg transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Como llegar</span>
                  </a>
                  {currentLocation.phone && (
                    <a
                      href={`tel:${currentLocation.phone}`}
                      className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      <span>Llamar</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Dot Indicators */}
            {validLocations.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-5">
                {validLocations.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={cn(
                      "rounded-full transition-all",
                      index === currentIndex
                        ? "w-6 h-2 bg-violet-600 dark:bg-violet-500"
                        : "w-2 h-2 bg-slate-300 dark:bg-neutral-600 hover:bg-slate-400 dark:hover:bg-neutral-500"
                    )}
                    aria-label={`Ir a ubicacion ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Mobile swipe hint */}
            {validLocations.length > 1 && (
              <p className="text-center text-xs text-muted-foreground mt-3 md:hidden">
                Desliza para ver otras sucursales
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
