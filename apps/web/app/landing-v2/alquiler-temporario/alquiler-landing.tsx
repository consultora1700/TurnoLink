'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Check,
  Shield,
  Zap,
  Globe,
  Star,
  CalendarCheck,
  CreditCard,
  Users,
  Building2,
  Bell,
  BarChart3,
  Share2,
  TrendingUp,
  Timer,
  Clock,
  Home,
  type LucideIcon,
} from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '../_components/hooks';
import { SectionTag, SectionH2, WordReveal, WHATSAPP_URL } from '../_components/ui';
import { Navbar } from '../_components/navbar';
import { Footer } from '../_components/footer';
import { CTASection } from '../_components/cta-section';

/* ═══════════════════════════════════════════════════════
   ACCENT: Cyan / Sky — #06B6D4 primary, #0891B2 secondary
   Fresh, open-air, vacation, properties
   ═══════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════
   DATA CONSTANTS
   ═══════════════════════════════════════════════════════ */

const PAIN_POINTS = [
  {
    emoji: '📱',
    title: 'WhatsApp que no para',
    desc: 'Consultas de fechas, precios, disponibilidad, fotos. Respondés todo el día mientras se te escapan reservas de otros interesados.',
  },
  {
    emoji: '👻',
    title: 'Reservas que se caen',
    desc: 'Reservan de palabra, no pagan seña, cancelan a último momento. Perdés el fin de semana largo y la plata.',
  },
  {
    emoji: '📅',
    title: 'Calendario imposible de mantener',
    desc: 'Planillas, cuadernos, anotaciones sueltas. Sin un calendario centralizado, las dobles reservas y confusiones son inevitables.',
  },
];

const BEFORE_ITEMS = [
  { time: 'Lunes', text: '"¿Está disponible el finde largo?" — 15 mensajes preguntando lo mismo' },
  { time: 'Martes', text: '"Te transfiero mañana la seña" — nunca la transfirió' },
  { time: 'Miércoles', text: 'Dos familias reservaron el mismo fin de semana. Conflicto' },
  { time: 'Jueves', text: '"¿Cuánto sale en enero?" — respondés con la tabla de precios por 50va vez' },
  { time: 'Viernes', text: 'Cancelación de último momento. La cabaña queda vacía todo el finde' },
  { time: 'Domingo', text: 'Cerrás el mes sin saber cuánto facturaste realmente por propiedad' },
];

const AFTER_ITEMS = [
  { time: 'Lunes', text: 'Tu página muestra disponibilidad y precios por temporada. Sin mensajes' },
  { time: 'Martes', text: 'Reserva confirmada con seña pagada vía Mercado Pago. Sin excusas' },
  { time: 'Miércoles', text: 'Calendario único por propiedad. Cero solapamientos, cero confusiones' },
  { time: 'Jueves', text: 'Precios por temporada configurados. El huésped ve el monto correcto al instante' },
  { time: 'Viernes', text: 'Si cancela, la seña ya está cobrada. Y las fechas se liberan para otro' },
  { time: 'Domingo', text: 'Dashboard con ocupación y facturación por propiedad. Todo trazable' },
];

const HOW_IT_WORKS = [
  {
    num: '01',
    icon: Home,
    title: 'Cargá tus propiedades',
    desc: 'Agregá cada propiedad con fotos, descripción, precios por temporada y reglas de estadía mínima. Listo en 10 minutos.',
  },
  {
    num: '02',
    icon: Share2,
    title: 'Compartí tu link',
    desc: 'Pegá tu link en Instagram, Google, portales de turismo y WhatsApp. Tus huéspedes ven disponibilidad y reservan solos.',
  },
  {
    num: '03',
    icon: CreditCard,
    title: 'Cobrá la seña automáticamente',
    desc: 'El huésped paga la seña con Mercado Pago al reservar. La reserva se confirma al instante. Plata directo a tu cuenta.',
  },
];

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: CalendarCheck,
    title: 'Calendario por día',
    desc: 'Disponibilidad por noche con check-in y check-out. Tus huéspedes ven las fechas libres y reservan al instante.',
  },
  {
    icon: CreditCard,
    title: 'Cobro de seña automático',
    desc: 'Configurá el monto de seña. Al reservar, el huésped paga vía Mercado Pago y la reserva se confirma sola.',
  },
  {
    icon: Timer,
    title: 'Estadía mínima por temporada',
    desc: 'Fin de semana largo: 3 noches. Vacaciones: 7 noches. Vos ponés las reglas, el sistema las aplica.',
  },
  {
    icon: TrendingUp,
    title: 'Precios por temporada',
    desc: 'Alta, baja, fines de semana largos. Cada período con su tarifa. El calendario muestra el precio correcto.',
  },
  {
    icon: Building2,
    title: 'Múltiples propiedades',
    desc: 'Cabañas, deptos, quinchos — cada uno con su calendario, precios y configuración. Todo desde una cuenta.',
  },
  {
    icon: Globe,
    title: 'Página de reservas con fotos',
    desc: 'Link personalizado con fotos, descripción, servicios y disponibilidad. Compartilo en redes y portales.',
  },
  {
    icon: Bell,
    title: 'Recordatorios automáticos',
    desc: 'El huésped recibe recordatorio antes del check-in. Menos olvidos, menos problemas de coordinación.',
  },
  {
    icon: BarChart3,
    title: 'Reportes de ocupación',
    desc: 'Ocupación por propiedad, facturación por temporada, noches vendidas. Datos para optimizar tus precios.',
  },
];

const SUB_INDUSTRIES = [
  { emoji: '🏡', name: 'Casas quinta', desc: 'Alquiler por día con pileta, parque y parrilla' },
  { emoji: '🛖', name: 'Cabañas', desc: 'Complejos de cabañas con gestión centralizada' },
  { emoji: '🏢', name: 'Departamentos temporarios', desc: 'Deptos amoblados por día o semana' },
  { emoji: '🌾', name: 'Campos recreativos', desc: 'Espacios rurales para eventos y estadías' },
  { emoji: '🎪', name: 'Salones por día', desc: 'Salones de fiestas, eventos y reuniones' },
  { emoji: '🔥', name: 'Quinchos', desc: 'Quinchos con parrilla para eventos y reuniones' },
  { emoji: '🎉', name: 'Espacios para eventos', desc: 'Jardines, terrazas y espacios al aire libre' },
];

const TESTIMONIALS = [
  {
    quote:
      'Administramos 12 cabañas y antes era un caos de WhatsApp. Ahora el huésped reserva y paga la seña online. Las cancelaciones bajaron un 90%.',
    name: 'Valeria Torres',
    role: 'Dueña',
    business: 'Cabañas del Lago',
    metric: '-90% cancelaciones',
  },
  {
    quote:
      'Tenemos 3 departamentos temporarios. Las dobles reservas desaparecieron y el cobro de seña nos aseguró cada fin de semana. Facturamos 35% más.',
    name: 'Andrés Gutiérrez',
    role: 'Propietario',
    business: 'Dptos Temporarios AG',
    metric: '+35% facturación',
  },
  {
    quote:
      'Alquilamos el quincho para eventos. TurnoLink nos resolvió la coordinación de fechas y el cobro anticipado. Cero conflictos desde que lo usamos.',
    name: 'Laura Pereyra',
    role: 'Administradora',
    business: 'Quincho La Ribera',
    metric: '0 dobles reservas',
  },
];

const PRICING_TIERS = [
  {
    name: 'Starter',
    price: '$24.990',
    period: '/mes',
    popular: false,
    features: [
      'Hasta 5 propiedades',
      'Cobro de señas',
      'Calendario por día',
      'Página de reservas con fotos',
      'Recordatorios automáticos',
      'Reportes básicos',
    ],
  },
  {
    name: 'Profesional',
    price: '$39.990',
    period: '/mes',
    popular: true,
    features: [
      'Propiedades ilimitadas',
      'Cobro de señas',
      'Reglas de estadía mínima',
      'Precios por temporada',
      'Dashboard completo',
      'Soporte prioritario',
    ],
  },
  {
    name: 'Agencia',
    price: '$64.990',
    period: '/mes',
    popular: false,
    features: [
      'Todo de Profesional',
      'Multi-operador',
      'API disponible',
      'Soporte dedicado',
      'Personalización avanzada',
      'SLA garantizado',
    ],
  },
];

const FAQS = [
  {
    q: '¿Puedo configurar precios distintos por temporada?',
    a: 'Sí. Temporada alta, baja, fines de semana largos — cada período con su tarifa por noche. El calendario muestra el precio correcto automáticamente.',
  },
  {
    q: '¿Cómo funciona la estadía mínima?',
    a: 'Configurás la cantidad mínima de noches por temporada (ej: 2 noches en finde, 7 en vacaciones). El sistema solo permite reservas que cumplan tu regla.',
  },
  {
    q: '¿Puedo gestionar varias propiedades desde una cuenta?',
    a: 'Sí. Cada propiedad tiene su calendario, precios, fotos y configuración independiente. Todo gestionado desde un solo panel.',
  },
  {
    q: '¿Los huéspedes ven fotos y descripción de la propiedad?',
    a: 'Sí. Tu página de reservas muestra fotos, descripción, servicios incluidos, ubicación y disponibilidad. Todo lo que el huésped necesita para decidir.',
  },
  {
    q: '¿Cómo funciona el cobro de seña?',
    a: 'Configurás un monto fijo o porcentaje. Al reservar, el huésped paga vía Mercado Pago y la reserva se confirma automáticamente. El dinero va a tu cuenta.',
  },
  {
    q: '¿Sirve para salones de eventos y quinchos?',
    a: 'Sí. Configurás disponibilidad por día, precio por evento y cobro de seña. Ideal para quinchos, salones, jardines y cualquier espacio que se alquile por día.',
  },
  {
    q: '¿Qué pasa si un huésped cancela?',
    a: 'Las fechas se liberan automáticamente para que otro huésped pueda reservar. La política de seña (devolver o retener) la definís vos desde la configuración.',
  },
  {
    q: '¿Hay período de prueba?',
    a: 'Sí. 14 días de prueba gratuita en todos los planes, sin tarjeta de crédito. Configurás tus propiedades y probás con reservas reales.',
  },
];

/* ═══════════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════════ */

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          obs.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return { count, ref };
}

/* ═══════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════ */

function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center pt-28 lg:pt-32 pb-12 px-5 lg:px-10 overflow-hidden">
      {/* Glow orbs — cyan/sky */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[#06B6D4]/[0.06] blur-[140px] lv2-glow-orb pointer-events-none" />
      <div
        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[#0891B2]/[0.04] blur-[120px] lv2-glow-orb pointer-events-none"
        style={{ animationDelay: '3s' }}
      />

      <div className="max-w-[1200px] mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div>
            <div className="mb-8">
              <span className="lv2-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm text-white/80">
                <Home size={14} className="text-[#06B6D4]" />
                Alquiler Temporario
              </span>
            </div>

            <h1 className="text-[9vw] sm:text-[48px] lg:text-[60px] xl:text-[72px] font-normal leading-[1.05] tracking-[-2px] lg:tracking-[-3px] mb-6">
              <span className="text-white block">Reservas confirmadas,</span>
              <span className="text-white/60 block mt-1">cobros asegurados.</span>
            </h1>

            <p className="text-base sm:text-lg text-white/50 max-w-xl mb-8 leading-relaxed tracking-[-0.2px]">
              <WordReveal text="Calendario por día con disponibilidad en tiempo real, cobro de seña automático con Mercado Pago y precios por temporada. Tu propiedad, gestionada 24/7." />
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-10">
              <Link
                href="/register"
                className="lv2-glow-btn bg-[#06B6D4] text-white font-medium px-8 py-3.5 rounded-[10px] text-base flex items-center gap-2"
              >
                Probar 14 d&iacute;as gratis
                <ArrowRight size={18} />
              </Link>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="lv2-glass text-white/80 font-medium px-8 py-3.5 rounded-[10px] text-base flex items-center gap-2"
              >
                Hablar con ventas
                <ArrowRight size={16} />
              </a>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/40">
              <span className="flex items-center gap-1.5">
                <Zap size={14} className="text-[#06B6D4]" /> Configuraci&oacute;n en 10 min
              </span>
              <span className="flex items-center gap-1.5">
                <Shield size={14} className="text-[#06B6D4]" /> 14 d&iacute;as gratis
              </span>
              <span className="flex items-center gap-1.5">
                <Home size={14} className="text-[#06B6D4]" /> +100 propiedades activas
              </span>
            </div>
          </div>

          {/* Right: Product mockup */}
          <div className="relative hidden lg:block">
            <div className="lv2-mockup-wrapper relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-[#06B6D4]/10">
              <Image
                src="/mockups/alquiler-hero.webp"
                alt="Quinta Los Álamos — calendario de reservas con disponibilidad por propiedad"
                width={700}
                height={480}
                className="w-full h-auto"
                priority
              />
            </div>
            {/* Floating metric badge */}
            <div className="absolute -bottom-5 -left-5 bg-black/90 backdrop-blur-xl border border-white/[0.1] rounded-xl px-5 py-3.5 flex items-center gap-3 shadow-xl">
              <div className="w-9 h-9 rounded-full bg-[#06B6D4]/20 flex items-center justify-center">
                <TrendingUp size={18} className="text-[#06B6D4]" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">-90% cancelaciones</p>
                <p className="text-white/40 text-xs">Con cobro de se&ntilde;a</p>
              </div>
            </div>
            {/* Second floating badge */}
            <div className="absolute -top-3 -right-3 bg-black/90 backdrop-blur-xl border border-white/[0.1] rounded-xl px-5 py-3.5 flex items-center gap-3 shadow-xl">
              <div className="w-9 h-9 rounded-full bg-[#06B6D4]/20 flex items-center justify-center">
                <CalendarCheck size={18} className="text-[#06B6D4]" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Reservas 24/7</p>
                <p className="text-white/40 text-xs">Desde el celular, sin llamar</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-only mockup */}
        <div className="mt-12 lg:hidden">
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-xl shadow-[#06B6D4]/10 max-w-md mx-auto">
            <Image
              src="/mockups/alquiler-mobile.webp"
              alt="Alquiler temporario — vista móvil de reservas de propiedades"
              width={500}
              height={340}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   METRICS STRIP
   ═══════════════════════════════════════════════════════ */

function MetricsStrip() {
  const sectionRef = useScrollReveal();
  const c1 = useCountUp(90, 2000);
  const c2 = useCountUp(100, 2500);
  const c3 = useCountUp(35, 2000);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-14 border-y border-white/[0.04] bg-white/[0.01]"
    >
      <div className="max-w-[1200px] mx-auto px-5 lg:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-4">
          <div ref={c1.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              -{c1.count}<span className="text-[#06B6D4]">%</span>
            </p>
            <p className="text-sm text-white/40 mt-2">Cancelaciones</p>
          </div>
          <div ref={c2.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              +{c2.count}
            </p>
            <p className="text-sm text-white/40 mt-2">Propiedades activas</p>
          </div>
          <div ref={c3.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              +{c3.count}<span className="text-[#06B6D4]">%</span>
            </p>
            <p className="text-sm text-white/40 mt-2">M&aacute;s facturaci&oacute;n</p>
          </div>
          <div className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-[#06B6D4] tracking-[-2px]">$0</p>
            <p className="text-sm text-white/40 mt-2">Comisi&oacute;n sobre cobros</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   PAIN POINTS
   ═══════════════════════════════════════════════════════ */

function PainPointsSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 120);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="El problema" />
          <SectionH2 line1="&iquest;Te suena familiar?" line2="No est&aacute;s solo/a." />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PAIN_POINTS.map((item, i) => (
            <div
              key={i}
              className="lv2-card-stagger lv2-card p-8 hover:bg-[#0A0A0A] transition-colors duration-300"
            >
              <div className="text-3xl mb-5">{item.emoji}</div>
              <h3 className="text-white font-medium text-lg tracking-[-0.5px] mb-3">{item.title}</h3>
              <p className="text-white/50 text-[15px] leading-[26px] tracking-[-0.2px]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   BEFORE / AFTER
   ═══════════════════════════════════════════════════════ */

function BeforeAfterSection() {
  const sectionRef = useScrollReveal();

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Transformaci&oacute;n" />
          <SectionH2 line1="Tu semana gestionando" line2="propiedades, antes y despu&eacute;s." />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ANTES */}
          <div className="lv2-card p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.03] to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-3 h-3 rounded-full bg-red-500/60 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                <h3 className="text-white/80 font-medium text-lg tracking-[-0.5px]">Sin TurnoLink</h3>
              </div>
              <div className="space-y-5">
                {BEFORE_ITEMS.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="text-xs text-red-400/50 font-mono mt-0.5 w-20 flex-shrink-0 tabular-nums">
                      {item.time}
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/30 mt-2 flex-shrink-0" />
                    <p className="text-white/40 text-sm leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DESPUÉS — verde positivo */}
          <div className="lv2-card p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/[0.05] to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-3 h-3 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                <h3 className="text-white/80 font-medium text-lg tracking-[-0.5px]">Con TurnoLink</h3>
              </div>
              <div className="space-y-5">
                {AFTER_ITEMS.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="text-xs text-[#10B981]/70 font-mono mt-0.5 w-20 flex-shrink-0 tabular-nums">
                      {item.time}
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]/60 mt-2 flex-shrink-0" />
                    <p className="text-white/60 text-sm leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════════════════════ */

function HowItWorksSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 200);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="C&oacute;mo funciona" />
          <SectionH2 line1="Empez&aacute; en 3 pasos." line2="Sin complicaciones." />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="lv2-card-stagger lv2-card p-8 relative overflow-hidden"
              >
                <span className="absolute top-4 right-6 text-[#06B6D4]/[0.08] text-7xl font-bold leading-none pointer-events-none select-none">
                  {step.num}
                </span>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-[#06B6D4]/[0.08] border border-[#06B6D4]/[0.12] flex items-center justify-center mb-6">
                    <Icon size={24} className="text-[#06B6D4]" />
                  </div>
                  <h3 className="text-white font-medium text-lg tracking-[-0.5px] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-white/50 text-[15px] leading-[26px] tracking-[-0.2px]">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mockup row */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <Image
              src="/mockups/alquiler-services.webp"
              alt="Propiedades y cabañas configuradas en TurnoLink"
              width={400}
              height={260}
              className="w-full h-auto"
            />
          </div>
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <Image
              src="/mockups/alquiler-mobile.webp"
              alt="Disponibilidad de propiedades en móvil"
              width={400}
              height={260}
              className="w-full h-auto"
            />
          </div>
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <Image
              src="/mockups/alquiler-hero.webp"
              alt="Vista completa del sistema de reservas para alquiler temporario"
              width={400}
              height={260}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   FEATURES
   ═══════════════════════════════════════════════════════ */

function FeaturesSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 80);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Funcionalidades" />
          <SectionH2 line1="Todo lo que necesit&aacute;s" line2="para gestionar tus propiedades." />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="lv2-card-stagger lv2-card p-7 hover:bg-[#0A0A0A] transition-colors duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-[#06B6D4]/[0.08] border border-[#06B6D4]/[0.12] flex items-center justify-center mb-5">
                  <Icon size={22} className="text-[#06B6D4]" />
                </div>
                <h3 className="text-white font-medium text-[15px] tracking-[-0.3px] mb-2">
                  {feat.title}
                </h3>
                <p className="text-white/45 text-[13px] leading-[22px] tracking-[-0.1px]">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SUB-INDUSTRIES
   ═══════════════════════════════════════════════════════ */

function SubIndustriesSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 60);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Rubros" />
          <SectionH2 line1="Para todo tipo de" line2="alquiler temporario." />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            Caba&ntilde;as, quintas, departamentos o salones. Si alquil&aacute;s propiedades por d&iacute;a, TurnoLink es para vos.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {SUB_INDUSTRIES.map((item, i) => (
            <div
              key={i}
              className="lv2-card-stagger lv2-card p-6 flex items-start gap-4 hover:bg-[#0A0A0A] transition-colors duration-300 group"
            >
              <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                {item.emoji}
              </span>
              <div>
                <h3 className="text-white font-medium text-sm tracking-[-0.3px] mb-1">{item.name}</h3>
                <p className="text-white/35 text-xs leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   ROI SECTION
   ═══════════════════════════════════════════════════════ */

function ROISection() {
  const sectionRef = useScrollReveal();

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[900px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="N&uacute;meros" />
          <SectionH2 line1="&iquest;Cu&aacute;nto perd&eacute;s en" line2="fines de semana vac&iacute;os?" />
          <p className="mt-5 text-white/50 max-w-xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            Cada noche sin reservar es plata que no entra. Con se&ntilde;as autom&aacute;ticas, las cancelaciones desaparecen.
          </p>
        </div>

        <div className="lv2-card p-8 sm:p-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            {/* Sin TurnoLink */}
            <div className="text-center p-7 rounded-xl bg-red-500/[0.04] border border-red-500/[0.08]">
              <p className="text-sm text-red-400/70 font-medium mb-5 tracking-tight">Sin cobro de se&ntilde;a</p>
              <div className="space-y-2 text-white/45 text-sm">
                <p>~3 cancelaciones por mes</p>
                <p>Noche promedio: $35.000</p>
                <p>Estad&iacute;a promedio: 2 noches</p>
              </div>
              <div className="mt-5 pt-5 border-t border-red-500/[0.08]">
                <p className="text-3xl text-red-400/80 font-normal tracking-[-1.5px]">
                  -$210.000
                </p>
                <p className="text-xs text-red-400/40 mt-1">perdidos por mes</p>
              </div>
            </div>

            {/* Con TurnoLink — verde positivo */}
            <div className="text-center p-7 rounded-xl bg-[#10B981]/[0.06] border border-[#10B981]/[0.15]">
              <p className="text-sm text-[#10B981] font-medium mb-5 tracking-tight">Con TurnoLink</p>
              <div className="space-y-2 text-white/45 text-sm">
                <p>~0 cancelaciones (-90%)</p>
                <p>Noche promedio: $35.000</p>
                <p>Estad&iacute;a promedio: 2 noches</p>
              </div>
              <div className="mt-5 pt-5 border-t border-[#10B981]/[0.12]">
                <p className="text-3xl text-[#10B981] font-normal tracking-[-1.5px]">
                  -$0
                </p>
                <p className="text-xs text-[#10B981]/50 mt-1">perdidos por mes</p>
              </div>
            </div>
          </div>

          {/* ROI Summary */}
          <div className="text-center border-t border-white/[0.06] pt-8">
            <p className="text-white/50 text-sm mb-2">Recuper&aacute;s</p>
            <p className="text-4xl sm:text-5xl text-white font-normal tracking-[-2px]">
              $210.000<span className="text-lg text-white/30 ml-1">/mes</span>
            </p>
            <p className="text-white/40 text-sm mt-4">
              Plan Starter: $24.990/mes &mdash;{' '}
              <span className="text-[#06B6D4] font-medium">ROI de 8.4x tu inversi&oacute;n</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   TESTIMONIALS
   ═══════════════════════════════════════════════════════ */

function TestimonialsSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 150);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Resultados" />
          <SectionH2 line1="Lo que dicen quienes" line2="ya lo usan." />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="lv2-card-stagger lv2-card p-8 flex flex-col">
              {/* Metric badge */}
              <div className="mb-5">
                <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#06B6D4]/[0.1] border border-[#06B6D4]/[0.15] text-xs text-[#06B6D4] font-medium">
                  {t.metric}
                </span>
              </div>

              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              <p className="text-white/50 text-[15px] leading-[26px] tracking-[-0.2px] flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="border-t border-white/[0.06] pt-4">
                <p className="text-white font-medium text-sm tracking-tight">{t.name}</p>
                <p className="text-white/40 text-xs mt-0.5">
                  {t.role} &middot; {t.business}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   PRICING
   ═══════════════════════════════════════════════════════ */

function PricingSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 150);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      id="precios"
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Precios" />
          <SectionH2 line1="Planes para propietarios" line2="sin letra chica." />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            14 d&iacute;as de prueba gratuita en todos los planes. Sin tarjeta de cr&eacute;dito. Sin compromiso.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PRICING_TIERS.map((tier, i) => (
            <div
              key={i}
              className={`lv2-card-stagger lv2-card p-8 flex flex-col ${
                tier.popular ? 'lv2-pricing-popular' : ''
              }`}
            >
              {tier.popular && (
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-white bg-[#06B6D4] px-3 py-1 rounded-md tracking-wide uppercase">
                    M&aacute;s elegido
                  </span>
                </div>
              )}
              <h3 className="text-white font-medium text-xl tracking-[-0.5px] mb-2">{tier.name}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-white text-3xl font-normal tracking-[-2px]">{tier.price}</span>
                <span className="text-white/30 text-sm">{tier.period}</span>
              </div>
              <div className="lv2-glass-line w-full my-5" />
              <ul className="space-y-3 flex-1">
                {tier.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-white/60">
                    <Check size={16} className="text-[#06B6D4] mt-0.5 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`mt-8 w-full text-center py-3 rounded-[10px] text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  tier.popular
                    ? 'lv2-glow-btn bg-[#06B6D4] text-white'
                    : 'bg-white/[0.06] text-white/80 hover:bg-white/[0.12] border border-white/[0.08]'
                }`}
              >
                Probar 14 d&iacute;as gratis
                <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-white/25 text-sm mt-10 flex items-center justify-center gap-2">
          <Shield size={14} />
          14 d&iacute;as de prueba en todos los planes. Sin tarjeta de cr&eacute;dito.
        </p>
        <p className="text-center mt-4">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#06B6D4] hover:text-[#0891B2] transition-colors duration-300"
          >
            &iquest;Necesit&aacute;s ayuda para elegir? Habl&aacute; con nuestro equipo &rarr;
          </a>
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   FAQ
   ═══════════════════════════════════════════════════════ */

function FAQSection() {
  const sectionRef = useScrollReveal();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = useCallback((i: number) => setOpenIdx((prev) => (prev === i ? null : i)), []);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-10 lg:gap-16">
          <div className="text-center lg:text-left lg:sticky lg:top-[120px] lg:self-start">
            <SectionTag text="FAQ" />
            <h2 className="lv2-h2 mt-6 text-[32px] sm:text-[40px] lg:text-[54px] font-normal leading-[1.0] lg:leading-[50px] tracking-[-1.9px]">
              <span className="text-white block">Preguntas</span>
              <span className="text-white/60 block mt-1">frecuentes</span>
            </h2>
            <p className="mt-5 text-white/50 max-w-sm mx-auto lg:mx-0 text-[15px] leading-relaxed tracking-[-0.2px]">
              Respuestas a las dudas m&aacute;s comunes de propietarios de caba&ntilde;as, departamentos, quintas y espacios para eventos.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => {
              const isOpen = openIdx === i;
              return (
                <div
                  key={i}
                  className={`lv2-faq-item ${isOpen ? 'open' : ''}`}
                  onClick={() => toggle(i)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium text-[15px] sm:text-base tracking-[-0.3px] text-white">
                      {faq.q}
                    </span>
                    <div className="lv2-faq-icon" />
                  </div>
                  <div
                    className={`overflow-hidden transition-all duration-400 ${
                      isOpen ? 'mt-4 max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="text-white/50 text-[15px] leading-[26px] tracking-[-0.2px]">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════ */

export function AlquilerLanding() {
  return (
    <div
      className="min-h-screen bg-black text-white selection:bg-[#06B6D4]/30 selection:text-white"
      style={{ overflowX: 'clip' }}
    >
      <Navbar />
      <HeroSection />
      <MetricsStrip />
      <PainPointsSection />
      <BeforeAfterSection />
      <HowItWorksSection />
      <FeaturesSection />
      <SubIndustriesSection />
      <ROISection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection
        headline="Tu propiedad merece un sistema profesional"
        subtitle="empez&aacute; en 5 minutos."
        description="Prob&aacute; TurnoLink 14 d&iacute;as gratis. Carg&aacute; tus propiedades, configur&aacute; precios por temporada y empez&aacute; a recibir reservas con cobro autom&aacute;tico."
      />
      <Footer />
    </div>
  );
}
