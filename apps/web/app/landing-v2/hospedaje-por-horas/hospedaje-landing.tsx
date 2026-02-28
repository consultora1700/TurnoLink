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
  BedDouble,
  type LucideIcon,
} from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '../_components/hooks';
import { SectionTag, SectionH2, WordReveal, WHATSAPP_URL } from '../_components/ui';
import { Navbar } from '../_components/navbar';
import { Footer } from '../_components/footer';
import { CTASection } from '../_components/cta-section';

/* ═══════════════════════════════════════════════════════
   ACCENT: Amber / Warm Gold — #F59E0B primary, #D97706 secondary
   Hospitality warmth, premium, 24/7 energy
   ═══════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════
   DATA CONSTANTS
   ═══════════════════════════════════════════════════════ */

const PAIN_POINTS = [
  {
    emoji: '📓',
    title: 'Cuaderno y rotación manual',
    desc: 'Anotás entradas y salidas a mano. Con 20+ habitaciones rotando, los errores de asignación y los solapamientos son inevitables.',
  },
  {
    emoji: '💸',
    title: 'Cobros en efectivo sin control',
    desc: 'Pagos en mano, sin registro digital, sin trazabilidad. Llegás a fin de mes sin saber cuánto facturaste realmente por habitación.',
  },
  {
    emoji: '🕐',
    title: 'Tiempos muertos que cuestan caro',
    desc: 'Sin coordinar limpieza entre salidas y entradas, perdés bloques enteros. Cada hora de habitación vacía es plata que no entra.',
  },
];

const BEFORE_ITEMS = [
  { time: '00:00', text: 'Turno noche: anotás a mano quién entra, cuántas horas, qué habitación' },
  { time: '03:00', text: 'Habitación 5 desocupada hace 1 hora. Nadie avisó a limpieza' },
  { time: '08:00', text: 'Cambio de turno: "¿la 12 está ocupada?" — nadie sabe' },
  { time: '12:00', text: 'Cliente dice que pagó 4 horas. El cuaderno dice 2. Conflicto' },
  { time: '18:00', text: 'Cerrás caja: $30K en efectivo, pero los números no coinciden' },
  { time: '22:00', text: 'Sábado a la noche, lleno. ¿Cuántas habitaciones rotan bien? No sabés' },
];

const AFTER_ITEMS = [
  { time: '00:00', text: 'Check-in digital. El sistema asigna habitación y registra el bloque' },
  { time: '03:00', text: 'Check-out automático → alerta a limpieza → habitación lista en 20 min' },
  { time: '08:00', text: 'Cambio de turno: el panel muestra estado de cada habitación en vivo' },
  { time: '12:00', text: 'Cada reserva con pago confirmado, hora de entrada y salida registrada' },
  { time: '18:00', text: 'Dashboard: facturación del día, ocupación por habitación, todo trazable' },
  { time: '22:00', text: 'Sábado lleno. Ves la rotación real y la ocupación al minuto' },
];

const HOW_IT_WORKS = [
  {
    num: '01',
    icon: Building2,
    title: 'Configurá tus habitaciones',
    desc: 'Cargá cada habitación con su tipo (suite, estándar, box), precio por bloque y buffer de limpieza. Listo en 10 minutos.',
  },
  {
    num: '02',
    icon: Timer,
    title: 'Definí los bloques horarios',
    desc: 'Bloques de 1, 2, 3, 4 o 12 horas. Precios por franja horaria. El sistema arma la grilla 24/7 automáticamente.',
  },
  {
    num: '03',
    icon: CreditCard,
    title: 'Cobrá al instante',
    desc: 'Check-in con pago confirmado vía Mercado Pago. Trazabilidad total de cada transacción. Cero efectivo perdido.',
  },
];

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Timer,
    title: 'Turnos por bloque 24/7',
    desc: 'Bloques de 1 a 12 horas. Disponibilidad en tiempo real por habitación. Operación que nunca para.',
  },
  {
    icon: CreditCard,
    title: 'Cobro anticipado trazable',
    desc: 'Seña o pago total vía Mercado Pago. Cada transacción registrada. Cero efectivo sin control.',
  },
  {
    icon: CalendarCheck,
    title: 'Check-in / check-out digital',
    desc: 'Entrada y salida registradas automáticamente. Sabés qué habitación está libre y cuándo.',
  },
  {
    icon: Clock,
    title: 'Buffer de limpieza',
    desc: 'Configurá tiempo de preparación entre turnos. El sistema bloquea la habitación y avisa al equipo.',
  },
  {
    icon: Building2,
    title: 'Gestión de habitaciones',
    desc: 'Suite, estándar, box — cada tipo con su precio y config. Todo desde un solo panel.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard de ocupación',
    desc: 'Ocupación, rotación, facturación por habitación y por turno. Datos reales para decidir.',
  },
  {
    icon: TrendingUp,
    title: 'Precios por franja horaria',
    desc: 'Noche, madrugada, mediodía, fin de semana. Cada franja con su precio. Maximizá ingresos.',
  },
  {
    icon: Globe,
    title: 'Reserva online (opcional)',
    desc: 'Página de reservas para clientes que prefieren reservar antes. Disponibilidad en tiempo real.',
  },
];

const SUB_INDUSTRIES = [
  { emoji: '🏩', name: 'Albergues transitorios', desc: 'Alta rotación por turnos cortos, operación 24/7' },
  { emoji: '🏨', name: 'Hoteles por turno', desc: 'Habitaciones por bloque horario con check-in express' },
  { emoji: '🛏️', name: 'Hostels por bloque', desc: 'Camas y habitaciones compartidas por horas' },
  { emoji: '🕐', name: 'Habitaciones 12 hs', desc: 'Bloques de medio día para estadías cortas' },
  { emoji: '🚪', name: 'Boxes privados', desc: 'Espacios privados por hora con rotación rápida' },
];

const TESTIMONIALS = [
  {
    quote:
      'Pasamos de gestionar 20 habitaciones con cuadernos a tener todo automatizado. La ocupación subió un 25% el primer mes porque eliminamos tiempos muertos.',
    name: 'Roberto Díaz',
    role: 'Gerente',
    business: 'Hotel Express Zona Sur',
    metric: '+25% ocupación',
  },
  {
    quote:
      'El cobro anticipado eliminó los problemas de caja. Antes perdíamos $150K por mes en cobros informales. Ahora cada reserva viene con el pago confirmado.',
    name: 'Gabriela Morales',
    role: 'Administradora',
    business: 'Albergue Las Palmas',
    metric: '$150K recuperados',
  },
  {
    quote:
      'Los buffers de limpieza entre turnos nos organizaron la operación. Sabemos exactamente cuándo entra y sale cada huésped. Cero caos.',
    name: 'Sergio Acuña',
    role: 'Dueño',
    business: 'Boxes Privados Sur',
    metric: '-40 min/turno muerto',
  },
];

const PRICING_TIERS = [
  {
    name: 'Starter',
    price: '$29.990',
    period: '/mes',
    popular: false,
    features: [
      'Hasta 10 habitaciones',
      '1 sede',
      'Cobro de señas',
      'Check-in/check-out digital',
      'Buffer de limpieza',
      'Reportes básicos',
    ],
  },
  {
    name: 'Profesional',
    price: '$49.990',
    period: '/mes',
    popular: true,
    features: [
      'Habitaciones ilimitadas',
      'Multi-sede',
      'Cobro de señas',
      'Dashboard de ocupación',
      'Reportes avanzados',
      'Soporte prioritario',
    ],
  },
  {
    name: 'Enterprise',
    price: '$79.990',
    period: '/mes',
    popular: false,
    features: [
      'Todo de Profesional',
      'API disponible',
      'Soporte dedicado',
      'Personalización de flujo',
      'Integraciones custom',
      'SLA garantizado',
    ],
  },
];

const FAQS = [
  {
    q: '¿Puedo configurar distintos tipos de habitación?',
    a: 'Sí. Suite, estándar, box, cabaña — cada tipo con su precio por bloque, duración y disponibilidad independiente.',
  },
  {
    q: '¿Cómo funciona el buffer de limpieza entre turnos?',
    a: 'Configurás el tiempo de preparación (ej: 30 min). El sistema bloquea la habitación automáticamente después del check-out y avisa al equipo de limpieza.',
  },
  {
    q: '¿Los clientes pueden reservar online?',
    a: 'Sí, es opcional. Tenés una página de reservas donde ven disponibilidad en tiempo real y pagan al reservar. También podés operar solo con check-in presencial.',
  },
  {
    q: '¿Funciona para operaciones 24/7?',
    a: 'Sí. El sistema opera sin pausas. Turnos de noche, madrugada, mediodía — la grilla se arma automáticamente y nunca se detiene.',
  },
  {
    q: '¿Cómo es el cobro por Mercado Pago?',
    a: 'El cliente paga al hacer check-in (o al reservar online). El dinero va directo a tu cuenta de Mercado Pago. Cada transacción queda registrada con hora, habitación y monto.',
  },
  {
    q: '¿Puedo ver la ocupación en tiempo real?',
    a: 'Sí. El dashboard muestra qué habitaciones están ocupadas, cuáles en limpieza y cuáles disponibles. Además: facturación del día, rotación y métricas por habitación.',
  },
  {
    q: '¿Sirve para un albergue con varias sedes?',
    a: 'Sí. Con el plan Profesional podés gestionar múltiples sedes, cada una con sus habitaciones, precios y configuración independiente.',
  },
  {
    q: '¿Hay período de prueba?',
    a: 'Sí. 14 días de prueba gratuita en todos los planes, sin tarjeta de crédito. Configurás tu operación y probás con reservas reales.',
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
      {/* Glow orbs — amber/warm gold */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[#F59E0B]/[0.06] blur-[140px] lv2-glow-orb pointer-events-none" />
      <div
        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[#D97706]/[0.04] blur-[120px] lv2-glow-orb pointer-events-none"
        style={{ animationDelay: '3s' }}
      />

      <div className="max-w-[1200px] mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div>
            <div className="mb-8">
              <span className="lv2-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm text-white/80">
                <BedDouble size={14} className="text-[#F59E0B]" />
                Hospedaje por Horas
              </span>
            </div>

            <h1 className="text-[9vw] sm:text-[48px] lg:text-[60px] xl:text-[72px] font-normal leading-[1.05] tracking-[-2px] lg:tracking-[-3px] mb-6">
              <span className="text-white block">Ocupaci&oacute;n m&aacute;xima,</span>
              <span className="text-white/60 block mt-1">gesti&oacute;n m&iacute;nima.</span>
            </h1>

            <p className="text-base sm:text-lg text-white/50 max-w-xl mb-8 leading-relaxed tracking-[-0.2px]">
              <WordReveal text="Turnos por bloque 24/7 con check-in digital, cobro automático con Mercado Pago y buffer de limpieza entre turnos. Tu albergue en piloto automático." />
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-10">
              <Link
                href="/register"
                className="lv2-glow-btn bg-[#F59E0B] text-black font-medium px-8 py-3.5 rounded-[10px] text-base flex items-center gap-2"
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
                <Zap size={14} className="text-[#F59E0B]" /> Configuraci&oacute;n en 10 min
              </span>
              <span className="flex items-center gap-1.5">
                <Shield size={14} className="text-[#F59E0B]" /> 14 d&iacute;as gratis
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-[#F59E0B]" /> Operaci&oacute;n 24/7
              </span>
            </div>
          </div>

          {/* Right: Product mockup */}
          <div className="relative hidden lg:block">
            <div className="lv2-mockup-wrapper relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-[#F59E0B]/10">
              <Image
                src="/mockups/hospedaje-hero.webp"
                alt="Armenón Hotel — reservas de habitaciones por turnos con bloques horarios"
                width={700}
                height={480}
                className="w-full h-auto"
                priority
              />
            </div>
            {/* Floating metric badge */}
            <div className="absolute -bottom-5 -left-5 bg-black/90 backdrop-blur-xl border border-white/[0.1] rounded-xl px-5 py-3.5 flex items-center gap-3 shadow-xl">
              <div className="w-9 h-9 rounded-full bg-[#F59E0B]/20 flex items-center justify-center">
                <TrendingUp size={18} className="text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">+25% ocupaci&oacute;n</p>
                <p className="text-white/40 text-xs">Eliminando tiempos muertos</p>
              </div>
            </div>
            {/* Second floating badge */}
            <div className="absolute -top-3 -right-3 bg-black/90 backdrop-blur-xl border border-white/[0.1] rounded-xl px-5 py-3.5 flex items-center gap-3 shadow-xl">
              <div className="w-9 h-9 rounded-full bg-[#F59E0B]/20 flex items-center justify-center">
                <Clock size={18} className="text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">24/7 operativo</p>
                <p className="text-white/40 text-xs">El sistema nunca para</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-only mockup */}
        <div className="mt-12 lg:hidden">
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-xl shadow-[#F59E0B]/10 max-w-md mx-auto">
            <Image
              src="/mockups/hospedaje-mobile.webp"
              alt="Hotel — vista móvil de reservas de habitaciones"
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
  const c1 = useCountUp(25, 2000);
  const c2 = useCountUp(150, 2500);
  const c3 = useCountUp(40, 2000);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-14 border-y border-white/[0.04] bg-white/[0.01]"
    >
      <div className="max-w-[1200px] mx-auto px-5 lg:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-4">
          <div ref={c1.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              +{c1.count}<span className="text-[#F59E0B]">%</span>
            </p>
            <p className="text-sm text-white/40 mt-2">Ocupaci&oacute;n promedio</p>
          </div>
          <div ref={c2.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              +{c2.count}
            </p>
            <p className="text-sm text-white/40 mt-2">Hospedajes activos</p>
          </div>
          <div ref={c3.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              -{c3.count}<span className="text-[#F59E0B]">min</span>
            </p>
            <p className="text-sm text-white/40 mt-2">Tiempos muertos por turno</p>
          </div>
          <div className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-[#F59E0B] tracking-[-2px]">$0</p>
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
          <SectionH2 line1="&iquest;Tu hospedaje opera as&iacute;?" line2="No tiene por qu&eacute;." />
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
          <SectionH2 line1="24 horas en tu hospedaje," line2="antes y despu&eacute;s." />
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
                    <span className="text-xs text-red-400/50 font-mono mt-0.5 w-12 flex-shrink-0 tabular-nums">
                      {item.time}
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/30 mt-2 flex-shrink-0" />
                    <p className="text-white/40 text-sm leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DESPUÉS */}
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
                    <span className="text-xs text-[#10B981]/70 font-mono mt-0.5 w-12 flex-shrink-0 tabular-nums">
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
          <SectionH2 line1="Empez&aacute; en 3 pasos." line2="Operaci&oacute;n 24/7 desde el d&iacute;a uno." />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="lv2-card-stagger lv2-card p-8 relative overflow-hidden"
              >
                <span className="absolute top-4 right-6 text-[#F59E0B]/[0.08] text-7xl font-bold leading-none pointer-events-none select-none">
                  {step.num}
                </span>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/[0.08] border border-[#F59E0B]/[0.12] flex items-center justify-center mb-6">
                    <Icon size={24} className="text-[#F59E0B]" />
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
              src="/mockups/hospedaje-services.webp"
              alt="Habitaciones y suites configuradas en TurnoLink"
              width={400}
              height={260}
              className="w-full h-auto"
            />
          </div>
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <Image
              src="/mockups/hospedaje-mobile.webp"
              alt="Disponibilidad de habitaciones 24/7 en móvil"
              width={400}
              height={260}
              className="w-full h-auto"
            />
          </div>
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <Image
              src="/mockups/hospedaje-hero.webp"
              alt="Vista completa del sistema de reservas para hotel"
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
          <SectionH2 line1="Herramientas para" line2="operaciones de alta rotaci&oacute;n." />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="lv2-card-stagger lv2-card p-7 hover:bg-[#0A0A0A] transition-colors duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-[#F59E0B]/[0.08] border border-[#F59E0B]/[0.12] flex items-center justify-center mb-5">
                  <Icon size={22} className="text-[#F59E0B]" />
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
          <SectionH2 line1="Para todo tipo de" line2="hospedaje por horas." />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            Albergues, hoteles por turno, boxes o habitaciones de medio d&iacute;a. Si alquil&aacute;s habitaciones por bloque horario, TurnoLink es para vos.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
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
          <SectionH2 line1="&iquest;Cu&aacute;nto perd&eacute;s en" line2="tiempos muertos?" />
          <p className="mt-5 text-white/50 max-w-xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            Cada hora de habitaci&oacute;n vac&iacute;a entre turnos es plata que no factur&aacute;s. Con buffers y cobro autom&aacute;tico, la ecuaci&oacute;n cambia.
          </p>
        </div>

        <div className="lv2-card p-8 sm:p-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            {/* Sin TurnoLink */}
            <div className="text-center p-7 rounded-xl bg-red-500/[0.04] border border-red-500/[0.08]">
              <p className="text-sm text-red-400/70 font-medium mb-5 tracking-tight">Sin gesti&oacute;n digital</p>
              <div className="space-y-2 text-white/45 text-sm">
                <p>~2 hs/d&iacute;a de tiempo muerto por habitaci&oacute;n</p>
                <p>15 habitaciones &times; $5.000/hora</p>
              </div>
              <div className="mt-5 pt-5 border-t border-red-500/[0.08]">
                <p className="text-3xl text-red-400/80 font-normal tracking-[-1.5px]">
                  -$4.500.000
                </p>
                <p className="text-xs text-red-400/40 mt-1">perdidos por mes</p>
              </div>
            </div>

            {/* Con TurnoLink */}
            <div className="text-center p-7 rounded-xl bg-[#F59E0B]/[0.06] border border-[#F59E0B]/[0.15]">
              <p className="text-sm text-[#F59E0B] font-medium mb-5 tracking-tight">Con TurnoLink</p>
              <div className="space-y-2 text-white/45 text-sm">
                <p>~30 min/d&iacute;a de tiempo muerto (-75%)</p>
                <p>15 habitaciones &times; $5.000/hora</p>
              </div>
              <div className="mt-5 pt-5 border-t border-[#F59E0B]/[0.12]">
                <p className="text-3xl text-[#F59E0B] font-normal tracking-[-1.5px]">
                  -$1.125.000
                </p>
                <p className="text-xs text-[#F59E0B]/50 mt-1">perdidos por mes</p>
              </div>
            </div>
          </div>

          {/* ROI Summary */}
          <div className="text-center border-t border-white/[0.06] pt-8">
            <p className="text-white/50 text-sm mb-2">Recuper&aacute;s</p>
            <p className="text-4xl sm:text-5xl text-white font-normal tracking-[-2px]">
              $3.375.000<span className="text-lg text-white/30 ml-1">/mes</span>
            </p>
            <p className="text-white/40 text-sm mt-4">
              Plan Profesional: $49.990/mes &mdash;{' '}
              <span className="text-[#F59E0B] font-medium">ROI de 67x tu inversi&oacute;n</span>
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
                <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#F59E0B]/[0.1] border border-[#F59E0B]/[0.15] text-xs text-[#F59E0B] font-medium">
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
          <SectionH2 line1="Planes para operaciones" line2="de alta rotaci&oacute;n." />
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
                  <span className="text-[10px] font-bold text-black bg-[#F59E0B] px-3 py-1 rounded-md tracking-wide uppercase">
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
                    <Check size={16} className="text-[#F59E0B] mt-0.5 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`mt-8 w-full text-center py-3 rounded-[10px] text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  tier.popular
                    ? 'lv2-glow-btn bg-[#F59E0B] text-black'
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
            className="text-sm text-[#F59E0B] hover:text-[#D97706] transition-colors duration-300"
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
              Respuestas a las dudas m&aacute;s comunes de due&ntilde;os de albergues, hoteles por hora y hospedajes por bloque.
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

export function HospedajeLanding() {
  return (
    <div
      className="min-h-screen bg-black text-white selection:bg-[#F59E0B]/30 selection:text-white"
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
        headline="Tu hospedaje merece un sistema profesional"
        subtitle="empez&aacute; en 5 minutos."
        description="Prob&aacute; TurnoLink 14 d&iacute;as gratis. Configur&aacute; tus habitaciones, activ&aacute; los bloques horarios y empez&aacute; a operar con check-in digital y cobro autom&aacute;tico."
      />
      <Footer />
    </div>
  );
}
