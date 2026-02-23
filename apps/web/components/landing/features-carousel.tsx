'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
  CalendarIcon,
  Clock247Icon,
  BellWaveIcon,
  CardCheckIcon,
  PaletteDropIcon,
  ChartTrendIcon,
} from './custom-icons';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  bgGradient: string;
  accentColor: string;
  glowColor: string;
}

const features: Feature[] = [
  {
    icon: <CalendarIcon className="w-7 h-7" />,
    title: 'Calendario Inteligente',
    description: 'Gestiona todos tus turnos en un solo lugar. Vista diaria, semanal y mensual.',
    gradient: 'from-teal-500 via-teal-500 to-cyan-500',
    bgGradient: 'from-teal-500/20 via-teal-500/10 to-transparent',
    accentColor: 'rose',
    glowColor: 'rgba(244, 63, 94, 0.4)',
  },
  {
    icon: <Clock247Icon className="w-7 h-7" />,
    title: 'Reservas 24/7',
    description: 'Tus clientes reservan cuando quieran. Tu negocio nunca duerme.',
    gradient: 'from-blue-500 via-indigo-500 to-violet-500',
    bgGradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
    accentColor: 'blue',
    glowColor: 'rgba(59, 130, 246, 0.4)',
  },
  {
    icon: <BellWaveIcon className="w-7 h-7" />,
    title: 'Recordatorios Auto',
    description: 'WhatsApp y email automáticos. Reduce ausencias hasta un 80%.',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    bgGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    accentColor: 'emerald',
    glowColor: 'rgba(16, 185, 129, 0.4)',
  },
  {
    icon: <CardCheckIcon className="w-7 h-7" />,
    title: 'Cobro de Señas',
    description: 'Integración con Mercado Pago. Cobra señas y reduce cancelaciones.',
    gradient: 'from-violet-500 via-purple-500 to-cyan-500',
    bgGradient: 'from-violet-500/20 via-purple-500/10 to-transparent',
    accentColor: 'violet',
    glowColor: 'rgba(139, 92, 246, 0.4)',
  },
  {
    icon: <PaletteDropIcon className="w-7 h-7" />,
    title: 'Tu Marca, Tu Estilo',
    description: 'Personaliza colores, logo y dominio. Refleja tu identidad.',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    bgGradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    accentColor: 'amber',
    glowColor: 'rgba(245, 158, 11, 0.4)',
  },
  {
    icon: <ChartTrendIcon className="w-7 h-7" />,
    title: 'Estadísticas en Vivo',
    description: 'Métricas de tu negocio en tiempo real. Toma mejores decisiones.',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    bgGradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    accentColor: 'cyan',
    glowColor: 'rgba(6, 182, 212, 0.4)',
  },
];

// ============================================
// MOBILE: Horizontal Snap Carousel - Senior UX
// ============================================
export function FeaturesCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const lastInteraction = useRef(0);

  // IntersectionObserver - reset when user arrives
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // User arrived - reset to first card
          setActiveIndex(0);
          setProgress(0);
          setIsInView(true);
          setIsPaused(false);

          // Scroll to first card
          if (scrollRef.current) {
            scrollRef.current.scrollTo({ left: 0, behavior: 'auto' });
          }
        } else {
          setIsInView(false);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-advance with progress - only when in view
  useEffect(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }

    if (!isInView || isPaused) return;

    progressInterval.current = setInterval(() => {
      const timeSinceInteraction = Date.now() - lastInteraction.current;
      if (timeSinceInteraction < 2000) return; // Wait after user interaction

      setProgress((prev) => {
        if (prev >= 100) {
          const nextIndex = (activeIndex + 1) % features.length;
          setActiveIndex(nextIndex);
          scrollToCard(nextIndex);
          return 0;
        }
        return prev + 2.5;
      });
    }, 100);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };
  }, [activeIndex, isInView, isPaused]);

  // Passive scroll tracking (like pricing section)
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let rafId: number;

    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const containerRect = container.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;

        const cards = container.querySelectorAll('[data-feature-card]');
        let closestIndex = 0;
        let closestDistance = Infinity;

        cards.forEach((card, index) => {
          const cardRect = card.getBoundingClientRect();
          const cardCenter = cardRect.left + cardRect.width / 2;
          const distance = Math.abs(containerCenter - cardCenter);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        if (closestIndex !== activeIndex) {
          setActiveIndex(closestIndex);
          setProgress(0);
        }
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [activeIndex]);

  const scrollToCard = (index: number) => {
    if (!scrollRef.current) return;

    const cards = scrollRef.current.querySelectorAll('[data-feature-card]');
    if (cards[index]) {
      cards[index].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  };

  const handleCardClick = (index: number) => {
    lastInteraction.current = Date.now();
    setActiveIndex(index);
    setProgress(0);
    scrollToCard(index);
  };

  const handleTouchStart = () => {
    lastInteraction.current = Date.now();
    setIsPaused(true);
  };

  const handleTouchEnd = () => {
    lastInteraction.current = Date.now();
    setTimeout(() => setIsPaused(false), 3000);
  };

  const activeFeature = features[activeIndex];

  return (
    <div ref={sectionRef} className="relative py-6">
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 transition-all duration-700 blur-3xl opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${activeFeature.glowColor}, transparent 60%)`
        }}
      />

      {/* Horizontal scroll container - Native CSS snap like pricing */}
      <div
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex gap-4 pb-4 -mx-4 px-4 scrollbar-hide overscroll-x-contain overflow-y-visible"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          overflowX: 'auto',
        }}
      >
        {features.map((feature, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={index}
              data-feature-card
              onClick={() => handleCardClick(index)}
              className={cn(
                "flex-shrink-0 w-[75vw] max-w-[280px] text-left",
                "relative overflow-hidden rounded-2xl",
                "bg-card/90 backdrop-blur-sm",
                "border transition-all duration-300",
                isActive
                  ? "border-white/20 shadow-xl"
                  : "border-border/50 opacity-70"
              )}
              style={{
                scrollSnapAlign: 'center',
                scrollSnapStop: 'always',
                boxShadow: isActive
                  ? `0 20px 40px -15px ${feature.glowColor}`
                  : undefined
              }}
            >
              {/* Gradient overlay */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500",
                  feature.bgGradient,
                  isActive && "opacity-100"
                )}
              />

              {/* Content */}
              <div className="relative p-5">
                {/* Header: Icon + Number */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-white",
                      "bg-gradient-to-br transition-all duration-300",
                      feature.gradient,
                      isActive && "shadow-lg scale-105"
                    )}
                    style={{
                      boxShadow: isActive
                        ? `0 8px 20px -6px ${feature.glowColor}`
                        : undefined
                    }}
                  >
                    {feature.icon}
                  </div>

                  <span className={cn(
                    "text-xs font-bold px-2.5 py-1 rounded-full",
                    "bg-foreground/5 text-muted-foreground",
                    "transition-all duration-300",
                    isActive && "bg-foreground/10 text-foreground"
                  )}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Title */}
                <h3 className={cn(
                  "font-bold text-base mb-1.5 transition-colors duration-300",
                  isActive ? "text-foreground" : "text-foreground/80"
                )}>
                  {feature.title}
                </h3>

                {/* Description */}
                <p className={cn(
                  "text-sm leading-relaxed transition-colors duration-300",
                  isActive ? "text-muted-foreground" : "text-muted-foreground/70"
                )}>
                  {feature.description}
                </p>

                {/* Progress bar - only on active */}
                <div className={cn(
                  "mt-4 h-1 rounded-full overflow-hidden transition-all duration-300",
                  isActive ? "bg-muted/30 opacity-100" : "opacity-0"
                )}>
                  <div
                    className={cn("h-full rounded-full bg-gradient-to-r", feature.gradient)}
                    style={{
                      width: isActive ? `${progress}%` : '0%',
                      transition: 'width 100ms linear'
                    }}
                  />
                </div>
              </div>

              {/* Active indicator line at top */}
              <div
                className={cn(
                  "absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r transition-all duration-300",
                  feature.gradient,
                  isActive ? "opacity-100" : "opacity-0"
                )}
              />
            </button>
          );
        })}
      </div>

      {/* Bottom navigation: Pills with progress */}
      <div className="flex justify-center items-center gap-2 mt-4 px-4">
        {features.map((feature, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={index}
              onClick={() => handleCardClick(index)}
              className={cn(
                "relative h-2 rounded-full transition-all duration-300",
                isActive ? "w-8" : "w-2 bg-muted-foreground/20 hover:bg-muted-foreground/40"
              )}
              aria-label={`Ver ${feature.title}`}
            >
              {isActive && (
                <>
                  <div className="absolute inset-0 rounded-full bg-muted/40" />
                  <div
                    className={cn("absolute inset-0 rounded-full bg-gradient-to-r origin-left", feature.gradient)}
                    style={{
                      transform: `scaleX(${progress / 100})`,
                      transition: 'transform 100ms linear'
                    }}
                  />
                </>
              )}
            </button>
          );
        })}

        <span className="ml-3 text-xs font-medium text-muted-foreground tabular-nums">
          {activeIndex + 1}/{features.length}
        </span>
      </div>
    </div>
  );
}

// ============================================
// Desktop Grid - Enhanced with better animations
// ============================================
export function FeaturesGrid() {
  // Start with all cards visible - no waiting for JS
  const [visibleCards] = useState<Set<number>>(new Set([0, 1, 2, 3, 4, 5]));
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
      {features.map((feature, index) => (
        <div
          key={index}
          ref={(el) => { cardRefs.current[index] = el; }}
          onMouseEnter={() => setHoveredCard(index)}
          onMouseLeave={() => setHoveredCard(null)}
          className={cn(
            'group relative overflow-hidden',
            'bg-card rounded-2xl border p-6',
            'transition-all duration-500 ease-out',
            visibleCards.has(index)
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8',
            'hover:shadow-xl hover:-translate-y-2 hover:border-brand-200/50 dark:hover:border-brand-700/50'
          )}
          style={{
            transitionDelay: visibleCards.has(index) ? `${index * 80}ms` : '0ms',
          }}
        >
          {/* Animated gradient background on hover */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
              feature.bgGradient
            )}
          />

          {/* Top accent line with hover animation */}
          <div
            className={cn(
              'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500',
              feature.gradient
            )}
          />

          {/* Icon */}
          <div
            className={cn(
              'relative w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-4',
              'shadow-lg group-hover:shadow-xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500',
              feature.gradient
            )}
          >
            {/* Glow effect */}
            <div
              className={cn(
                "absolute inset-0 rounded-xl bg-gradient-to-br blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10",
                feature.gradient
              )}
            />
            {feature.icon}
          </div>

          {/* Title */}
          <h3 className="relative text-lg font-semibold mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-300">
            {feature.title}
          </h3>

          {/* Description */}
          <p className="relative text-muted-foreground text-sm leading-relaxed">
            {feature.description}
          </p>

          {/* Decorative corner gradient */}
          <div
            className={cn(
              "absolute -bottom-8 -right-8 w-32 h-32 rounded-full",
              "bg-gradient-to-br opacity-0 blur-2xl group-hover:opacity-20 transition-opacity duration-700",
              feature.gradient
            )}
          />
        </div>
      ))}
    </div>
  );
}
