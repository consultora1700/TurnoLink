'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Star,
  Check,
  Shield,
  ArrowRight,
  Sparkles,
  Crown,
  TrendingUp,
  Building2,
  Gift,
} from 'lucide-react';

// Custom Animated Icons
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="6" width="18" height="15" rx="2" className="fill-current opacity-20" />
      <rect x="3" y="6" width="18" height="15" rx="2" className="stroke-current" strokeWidth="1.5" fill="none" />
      <rect x="3" y="6" width="18" height="4" rx="2" className="fill-current opacity-40" />
      <line x1="8" y1="3" x2="8" y2="7" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="3" x2="16" y2="7" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
      <circle cx="8" cy="14" r="1.5" className="fill-current animate-pulse" style={{ animationDelay: '0ms' }} />
      <circle cx="12" cy="14" r="1.5" className="fill-current animate-pulse" style={{ animationDelay: '150ms' }} />
      <circle cx="16" cy="14" r="1.5" className="fill-current animate-pulse" style={{ animationDelay: '300ms' }} />
      <circle cx="8" cy="18" r="1.5" className="fill-current opacity-50" />
      <circle cx="12" cy="18" r="1.5" className="fill-current opacity-50" />
    </svg>
  );
}

function RocketIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C12 2 8 6 8 12C8 15 9.5 17.5 12 19C14.5 17.5 16 15 16 12C16 6 12 2 12 2Z"
        className="fill-current opacity-30"
      />
      <path
        d="M12 2C12 2 8 6 8 12C8 15 9.5 17.5 12 19C14.5 17.5 16 15 16 12C16 6 12 2 12 2Z"
        className="stroke-current"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="12" cy="10" r="2" className="fill-current" />
      <path d="M8 12L5 15L8 14" className="stroke-current fill-current opacity-50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 12L19 15L16 14" className="stroke-current fill-current opacity-50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 19L12 22L14 19" className="stroke-amber-400 fill-amber-400/50 pricing-flame" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 19L12 21L13 19" className="stroke-orange-500 fill-orange-500/70 pricing-flame-inner" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EnterpriseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="4" y="6" width="10" height="16" rx="1" className="fill-current opacity-20" />
      <rect x="4" y="6" width="10" height="16" rx="1" className="stroke-current" strokeWidth="1.5" fill="none" />
      <rect x="14" y="10" width="6" height="12" rx="1" className="fill-current opacity-30" />
      <rect x="14" y="10" width="6" height="12" rx="1" className="stroke-current" strokeWidth="1.5" fill="none" />
      <rect x="6" y="9" width="2" height="2" rx="0.5" className="fill-current pricing-window" style={{ animationDelay: '0ms' }} />
      <rect x="10" y="9" width="2" height="2" rx="0.5" className="fill-current pricing-window" style={{ animationDelay: '200ms' }} />
      <rect x="6" y="13" width="2" height="2" rx="0.5" className="fill-current pricing-window" style={{ animationDelay: '400ms' }} />
      <rect x="10" y="13" width="2" height="2" rx="0.5" className="fill-current pricing-window" style={{ animationDelay: '100ms' }} />
      <rect x="6" y="17" width="2" height="2" rx="0.5" className="fill-current pricing-window" style={{ animationDelay: '300ms' }} />
      <rect x="10" y="17" width="2" height="2" rx="0.5" className="fill-current pricing-window" style={{ animationDelay: '500ms' }} />
      <rect x="16" y="13" width="2" height="2" rx="0.5" className="fill-current pricing-window" style={{ animationDelay: '250ms' }} />
      <rect x="16" y="17" width="2" height="2" rx="0.5" className="fill-current pricing-window" style={{ animationDelay: '450ms' }} />
      <line x1="9" y1="6" x2="9" y2="3" className="stroke-current" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="2" r="1" className="fill-current animate-ping" style={{ animationDuration: '2s' }} />
    </svg>
  );
}

interface PlanFeature {
  text: string;
  highlight?: boolean;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  iconType: 'calendar' | 'rocket' | 'enterprise';
  monthlyPrice: number;
  yearlyPrice: number;
  features: PlanFeature[];
  cta: string;
  popular?: boolean;
  badge: string;
  badgeIcon: 'gift' | 'crown' | 'building';
  badgeStyle: string;
  iconBg: string;
  iconColor: string;
}

const plans: Plan[] = [
  {
    id: 'gratis',
    name: 'Gratis',
    description: 'Perfecto para empezar',
    iconType: 'calendar',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { text: '30 turnos/mes' },
      { text: '2 empleados' },
      { text: '5 servicios' },
      { text: '50 clientes' },
      { text: 'Confirmación WhatsApp' },
      { text: 'Recordatorios email' },
    ],
    cta: 'Empezar gratis',
    badge: 'Gratis',
    badgeIcon: 'gift',
    badgeStyle: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    iconBg: 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800',
    iconColor: 'text-slate-600 dark:text-slate-300',
  },
  {
    id: 'profesional',
    name: 'Profesional',
    description: 'Para profesionales exigentes',
    iconType: 'rocket',
    monthlyPrice: 8990,
    yearlyPrice: 7490,
    features: [
      { text: '150 turnos/mes', highlight: true },
      { text: '5 empleados' },
      { text: '20 servicios' },
      { text: '500 clientes' },
      { text: 'Cobros MercadoPago', highlight: true },
      { text: 'Soporte WhatsApp' },
    ],
    cta: 'Probar 14 días gratis',
    popular: true,
    badge: 'Más popular',
    badgeIcon: 'crown',
    badgeStyle: 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30',
    iconBg: 'bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/30',
    iconColor: 'text-white',
  },
  {
    id: 'negocio',
    name: 'Negocio',
    description: 'Para equipos y franquicias',
    iconType: 'enterprise',
    monthlyPrice: 14990,
    yearlyPrice: 12490,
    features: [
      { text: 'Turnos ilimitados', highlight: true },
      { text: '15 empleados' },
      { text: 'Servicios ilimitados', highlight: true },
      { text: 'Clientes ilimitados', highlight: true },
      { text: '5 sucursales', highlight: true },
      { text: 'Soporte prioritario' },
    ],
    cta: 'Probar 14 días gratis',
    badge: 'Empresas',
    badgeIcon: 'building',
    badgeStyle: 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800',
    iconBg: 'bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30',
    iconColor: 'text-white',
  },
];

function formatPrice(price: number): string {
  if (price === 0) return '$0';
  return `$${price.toLocaleString('es-CL')}`;
}

function PlanIcon({ type, className }: { type: 'calendar' | 'rocket' | 'enterprise'; className?: string }) {
  switch (type) {
    case 'calendar':
      return <CalendarIcon className={className} />;
    case 'rocket':
      return <RocketIcon className={className} />;
    case 'enterprise':
      return <EnterpriseIcon className={className} />;
  }
}

function BadgeIcon({ type, className }: { type: 'gift' | 'crown' | 'building'; className?: string }) {
  switch (type) {
    case 'gift':
      return <Gift className={className} />;
    case 'crown':
      return <Crown className={className} />;
    case 'building':
      return <Building2 className={className} />;
  }
}

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  const [activePlanIndex, setActivePlanIndex] = useState(1);
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasScrolledToPopular = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-scroll to Popular plan on mobile when section becomes visible
  useEffect(() => {
    if (!isVisible || hasScrolledToPopular.current) return;
    hasScrolledToPopular.current = true;

    const container = scrollContainerRef.current;
    if (!container) return;

    // Small delay to let cards render
    const timeout = setTimeout(() => {
      const cards = container.querySelectorAll('[data-plan-card]');
      if (cards[1]) {
        cards[1].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [isVisible]);

  // Scroll to specific plan (for dot indicators)
  const scrollToPlan = useCallback((index: number) => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const cards = container.querySelectorAll('[data-plan-card]');
    if (cards[index]) {
      cards[index].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
      setActivePlanIndex(index);
    }
  }, []);

  // Update active index based on scroll position (passive, no interference)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let rafId: number;

    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const containerRect = container.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;

        const cards = container.querySelectorAll('[data-plan-card]');
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

        if (closestIndex !== activePlanIndex) {
          setActivePlanIndex(closestIndex);
        }
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [activePlanIndex]);

  const yearlyDiscount = 17;

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="py-16 md:py-24 relative overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 mb-6 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Precios de lanzamiento
            </span>
          </div>

          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Elige tu plan{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-brand-500 via-brand-600 to-brand-500 bg-clip-text text-transparent">
                ideal
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-brand-200/40 dark:bg-brand-500/20 -skew-x-6 rounded-sm" />
            </span>
          </h2>

          <p
            className={`text-lg text-muted-foreground mb-8 transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Empieza gratis y escala cuando lo necesites. Sin contratos.
          </p>

          {/* Billing Toggle */}
          <div
            className={`inline-flex items-center gap-1 p-1.5 rounded-full bg-muted/80 backdrop-blur-sm border border-border/50 transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <button
              onClick={() => setIsYearly(false)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                !isYearly
                  ? 'bg-white dark:bg-card text-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                isYearly
                  ? 'bg-white dark:bg-card text-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Anual
              <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-xs font-bold">
                -{yearlyDiscount}%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="md:grid md:grid-cols-3 md:gap-8 max-w-6xl mx-auto relative">
          {/* Mobile scroll container - Pure CSS scroll-snap */}
          <div
            ref={scrollContainerRef}
            className="flex md:contents gap-4 pt-5 pb-6 md:pt-0 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide overscroll-x-contain overflow-y-visible"
            style={{
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              overflowX: 'auto',
            }}
          >
            {plans.map((plan, index) => {
              const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
              const originalPrice = isYearly && plan.monthlyPrice > 0 ? plan.monthlyPrice : null;
              const isHovered = hoveredPlan === plan.id;

              return (
                <div
                  key={plan.id}
                  data-plan-card
                  className={`relative group transition-all duration-700 flex-shrink-0 w-[80vw] md:w-auto ${
                    isVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8'
                  }`}
                  style={{
                    transitionDelay: `${400 + index * 150}ms`,
                    scrollSnapAlign: 'center',
                    scrollSnapStop: 'always',
                  }}
                  onMouseEnter={() => setHoveredPlan(plan.id)}
                  onMouseLeave={() => setHoveredPlan(null)}
                >
                  {/* Badge - ABOVE everything */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{ top: '-14px', zIndex: 100 }}
                  >
                    <span
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-md ${plan.badgeStyle}`}
                    >
                      <BadgeIcon type={plan.badgeIcon} className="h-3.5 w-3.5" />
                      {plan.badge}
                    </span>
                  </div>

                  {/* Popular Plan Glow Effect */}
                  {plan.popular && (
                    <div className="absolute -inset-[2px] bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 rounded-3xl opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-500 animate-pulse-slow" />
                  )}

                  {/* Card */}
                  <div
                    className={`relative h-full flex flex-col rounded-3xl p-6 lg:p-8 pt-8 transition-all duration-500 ${
                      plan.popular
                        ? 'bg-gradient-to-b from-white to-brand-50/50 dark:from-card dark:to-brand-950/30 border-2 border-brand-500/50 shadow-2xl shadow-brand-500/20 md:scale-105'
                        : 'bg-card/80 backdrop-blur-sm border-2 border-border hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-xl'
                    }`}
                  >
                    {/* Header */}
                    <div className="text-center mb-6 pt-2">
                      <div
                        className={`mx-auto h-16 w-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${plan.iconBg} ${
                          isHovered ? 'scale-110 rotate-3' : ''
                        }`}
                      >
                        <PlanIcon type={plan.iconType} className={`h-8 w-8 ${plan.iconColor}`} />
                      </div>
                      <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div className="text-center mb-6">
                      <div className="flex items-baseline justify-center gap-1">
                        {originalPrice && (
                          <span className="text-lg text-muted-foreground line-through mr-2">
                            {formatPrice(originalPrice)}
                          </span>
                        )}
                        <span
                          className={`text-4xl lg:text-5xl font-bold tracking-tight transition-all duration-300 ${
                            plan.popular
                              ? 'bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent'
                              : ''
                          } ${isHovered && !plan.popular ? 'scale-105' : ''}`}
                        >
                          {formatPrice(price)}
                        </span>
                        <span className="text-muted-foreground text-sm">/mes</span>
                      </div>
                      {plan.monthlyPrice > 0 && (
                        <p className="text-xs text-brand-600 dark:text-brand-400 mt-2 font-medium">
                          14 días gratis para probar
                        </p>
                      )}
                      {isYearly && plan.monthlyPrice > 0 && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center justify-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Ahorras {formatPrice((plan.monthlyPrice - plan.yearlyPrice) * 12)}/año
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8 flex-grow">
                      {plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className={`flex items-start gap-3 text-sm transition-all duration-300 ${
                            feature.highlight ? 'font-medium' : ''
                          }`}
                          style={{ transitionDelay: `${idx * 50}ms` }}
                        >
                          <span
                            className={`flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                              feature.highlight
                                ? 'bg-green-100 dark:bg-green-900/50'
                                : 'bg-muted'
                            } ${isHovered ? 'scale-110' : ''}`}
                          >
                            <Check
                              className={`h-3 w-3 ${
                                feature.highlight
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          </span>
                          <span
                            className={
                              feature.highlight
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            }
                          >
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Link href={`/register?plan=${plan.id}`} className="block mt-auto">
                      {plan.popular ? (
                        <Button
                          size="lg"
                          className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white shadow-lg shadow-brand-500/25 group/btn"
                        >
                          {plan.cta}
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      ) : (
                        <Button
                          size="lg"
                          variant="outline"
                          className="w-full border-2 hover:bg-muted/50 group/btn"
                        >
                          {plan.cta}
                          {plan.monthlyPrice > 0 && (
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                          )}
                        </Button>
                      )}
                    </Link>

                    {plan.popular && (
                      <p className="text-center text-xs text-muted-foreground mt-3">
                        Sin tarjeta de crédito
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Scroll Indicator - Interactive */}
        <div className="flex justify-center gap-3 mt-6 md:hidden">
          {plans.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToPlan(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activePlanIndex
                  ? 'w-8 bg-brand-500'
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Ver plan ${index + 1}`}
            />
          ))}
        </div>

        {/* Guarantee Card */}
        <div
          className={`max-w-2xl mx-auto mt-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '850ms' }}
        >
          <div className="relative p-6 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-2xl" />
            <div className="absolute inset-[2px] bg-green-50 dark:bg-green-950/90 rounded-2xl" />

            <div className="relative flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="flex-shrink-0 h-14 w-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="font-semibold text-green-700 dark:text-green-300 flex items-center gap-2 justify-center sm:justify-start">
                  <Sparkles className="h-4 w-4" />
                  Garantía de satisfacción de 30 días
                </p>
                <p className="text-sm text-green-600/80 dark:text-green-400/80 mt-1">
                  Si no te convence, te devolvemos el dinero. Sin preguntas, sin complicaciones.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Compare Plans Link */}
        <p
          className={`text-center mt-8 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '950ms' }}
        >
          <Link
            href="/suscripcion"
            className="inline-flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors group"
          >
            Ver comparación detallada de planes
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </p>
      </div>
    </section>
  );
}
