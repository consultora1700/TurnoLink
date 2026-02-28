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
  Briefcase,
  Clock,
  type LucideIcon,
} from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '../_components/hooks';
import { SectionTag, SectionH2, WordReveal, WHATSAPP_URL } from '../_components/ui';
import { Navbar } from '../_components/navbar';
import { Footer } from '../_components/footer';
import { CTASection } from '../_components/cta-section';

/* ═══════════════════════════════════════════════════════
   DATA CONSTANTS
   ═══════════════════════════════════════════════════════ */

const PAIN_POINTS = [
  {
    emoji: '📧',
    title: 'Reservas por mail y WhatsApp',
    desc: 'Coordinás disponibilidad por mensajes todo el día. Mientras respondés, alguien más quiere la misma sala y no lo sabés.',
  },
  {
    emoji: '🕳️',
    title: 'Espacios vacíos que no facturan',
    desc: 'Sin visibilidad online, nadie sabe que hay lugar. Cada hora vacía en tu sala o escritorio es plata que se pierde.',
  },
  {
    emoji: '💸',
    title: 'Cobros manuales, seguimiento infinito',
    desc: 'Transferencias, efectivo, "te pago después". Perseguir pagos te consume más tiempo que atender clientes.',
  },
];

const BEFORE_ITEMS = [
  { time: '08:00', text: '12 mails pidiendo disponibilidad de salas para hoy' },
  { time: '09:30', text: 'Cliente no vino. No avisó. Sala vacía 2 horas' },
  { time: '11:00', text: '"¿Cuánto sale la oficina por medio día?" — respondés por 10ma vez' },
  { time: '14:00', text: 'Doble reserva: dos clientes para la misma sala a las 15' },
  { time: '17:00', text: 'Cerrás sin saber cuántas horas vendiste hoy' },
  { time: '20:00', text: 'Un freelancer quiere reservar para mañana. Recién lo ves a las 23' },
];

const AFTER_ITEMS = [
  { time: '08:00', text: 'Espacios completos. Reservaron anoche desde tu página' },
  { time: '09:30', text: 'Todos vinieron. Pagaron seña al reservar' },
  { time: '11:00', text: 'Tu grilla muestra espacios, precios y disponibilidad 24/7' },
  { time: '14:00', text: 'Cada espacio con su calendario propio. Sin conflictos' },
  { time: '17:00', text: 'Dashboard: 14 reservas hoy, ocupación del 85%' },
  { time: '20:00', text: 'Un freelancer reserva para mañana. Automático, sin llamadas' },
];

const HOW_IT_WORKS = [
  {
    num: '01',
    icon: CalendarCheck,
    title: 'Configurá tus espacios',
    desc: 'Salas, oficinas, escritorios — cada uno con capacidad, equipamiento y tarifas por hora o por día. Listo en 5 minutos.',
  },
  {
    num: '02',
    icon: Share2,
    title: 'Compartí tu grilla',
    desc: 'Pegá tu link en tu web, Google Maps y redes. Tus clientes ven disponibilidad en tiempo real y reservan solos.',
  },
  {
    num: '03',
    icon: CreditCard,
    title: 'Cobrá y confirmá',
    desc: 'Seña automática con Mercado Pago al reservar. Sin perseguir pagos, sin excusas. Plata directo a tu cuenta.',
  },
];

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: CalendarCheck,
    title: 'Reserva por espacio',
    desc: 'Cada sala, oficina o escritorio con su calendario independiente. Sin solapamientos, sin conflictos.',
  },
  {
    icon: Clock,
    title: 'Bloques flexibles',
    desc: 'Por hora, medio día, día completo. Vos definís los bloques y las tarifas de cada espacio.',
  },
  {
    icon: CreditCard,
    title: 'Cobro de señas',
    desc: 'Mercado Pago integrado. Tu cliente paga al reservar, la reserva se confirma al instante.',
  },
  {
    icon: Building2,
    title: 'Multi-espacio y multi-sede',
    desc: 'Gestioná todas tus salas y oficinas desde un solo panel. Múltiples ubicaciones, una sola cuenta.',
  },
  {
    icon: Globe,
    title: 'Página de reservas',
    desc: 'Link personalizado con disponibilidad en tiempo real. Tus clientes reservan solos, 24/7.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard de ocupación',
    desc: 'Métricas de uso, ingresos por espacio, horarios pico. Datos para optimizar tu operación.',
  },
  {
    icon: TrendingUp,
    title: 'Precios por franja',
    desc: 'Tarifas diferentes para mañana, tarde y noche. Maximizá ingresos en horarios premium.',
  },
  {
    icon: Bell,
    title: 'Recordatorios automáticos',
    desc: 'Tu cliente recibe aviso antes de su reserva. Menos no-shows, más ocupación.',
  },
];

const SUB_INDUSTRIES = [
  { emoji: '🏢', name: 'Coworking', desc: 'Escritorios compartidos, hot desks y puestos fijos por hora o día' },
  { emoji: '🏬', name: 'Oficinas por hora', desc: 'Oficinas privadas para reuniones, entrevistas y trabajo concentrado' },
  { emoji: '🤝', name: 'Salas de reuniones', desc: 'Salas equipadas para meetings, capacitaciones y workshops' },
  { emoji: '💼', name: 'Boxes profesionales', desc: 'Consultorios y espacios privados por turno para profesionales' },
  { emoji: '🎨', name: 'Estudios compartidos', desc: 'Estudios de diseño, fotografía, podcast y producción' },
];

const TESTIMONIALS = [
  {
    quote:
      'Gestionamos 15 escritorios y 3 salas de reuniones. Antes era un Excel compartido. Con TurnoLink cada espacio se reserva solo y la ocupación subió al 85%.',
    name: 'Tomás Rivera',
    role: 'Fundador',
    business: 'Espacio Nodo Coworking',
    metric: '85% ocupación',
  },
  {
    quote:
      'Nuestras salas tenían 50% de ocupación. Desde que los clientes reservan y pagan online, llegamos al 90%. El cobro automático fue clave.',
    name: 'Florencia Campos',
    role: 'Directora',
    business: 'Hub Salas Ejecutivas',
    metric: '50% → 90% ocupación',
  },
  {
    quote:
      'Alquilamos boxes por hora para profesionales independientes. TurnoLink resolvió la disponibilidad, el cobro y los recordatorios. Todo en piloto automático.',
    name: 'Diego Ramos',
    role: 'Dueño',
    business: 'Boxes Pro Belgrano',
    metric: '+40% facturación',
  },
];

const PRICING_TIERS = [
  {
    name: 'Starter',
    price: '$19.990',
    period: '/mes',
    popular: false,
    features: [
      'Hasta 5 espacios',
      '1 sede',
      'Reservas ilimitadas',
      'Cobro de señas',
      'Página de reservas',
      'Recordatorios automáticos',
    ],
  },
  {
    name: 'Profesional',
    price: '$34.990',
    period: '/mes',
    popular: true,
    features: [
      'Espacios ilimitados',
      '2 sedes',
      'Cobro de señas',
      'Reportes avanzados',
      'Dashboard completo',
      'Soporte prioritario',
    ],
  },
  {
    name: 'Enterprise',
    price: '$59.990',
    period: '/mes',
    popular: false,
    features: [
      'Todo de Profesional',
      'Multi-sede ilimitada',
      'Reportes gerenciales',
      'Soporte dedicado',
      'API disponible',
      'SLA garantizado',
    ],
  },
];

const FAQS = [
  {
    q: '¿Puedo alquilar por hora y por día desde el mismo sistema?',
    a: 'Sí. Cada espacio tiene sus propios bloques: hora, medio día, día completo. Configurás las tarifas de cada modalidad y tus clientes eligen al reservar.',
  },
  {
    q: '¿Mis clientes necesitan crear cuenta para reservar?',
    a: 'No. Tu página de reservas funciona desde cualquier navegador. El cliente elige espacio, horario, paga la seña y listo. Sin apps, sin fricciones.',
  },
  {
    q: '¿Cómo funciona el cobro de seña?',
    a: 'Configurás un monto o porcentaje de seña. Cuando el cliente reserva, paga automáticamente vía Mercado Pago. La reserva se confirma al instante y el dinero va a tu cuenta.',
  },
  {
    q: '¿Puedo gestionar múltiples espacios y sedes?',
    a: 'Sí. Desde una sola cuenta gestionás salas, oficinas, escritorios y múltiples ubicaciones. Cada espacio con su calendario, precio y configuración.',
  },
  {
    q: '¿Sirve para coworkings con escritorios compartidos?',
    a: 'Sí. Podés configurar escritorios como espacios individuales con disponibilidad por turno. Ideal para hot desking y puestos rotativos.',
  },
  {
    q: '¿Puedo poner precios distintos por franja horaria?',
    a: 'Sí. Mañana, tarde, noche — cada franja con su tarifa. Los horarios premium cobran más y los horarios valle te ayudan a llenar huecos.',
  },
  {
    q: '¿Qué pasa si un cliente cancela?',
    a: 'El espacio se libera automáticamente y queda disponible para que otro cliente lo reserve. La política de seña (devolver o retener) la definís vos.',
  },
  {
    q: '¿Puedo ver la ocupación en tiempo real?',
    a: 'Sí. El dashboard muestra ocupación por espacio, por día y por franja horaria. Sabés exactamente dónde tenés huecos y cómo optimizar.',
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
      {/* Glow orbs — violet professional tones */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[#8B5CF6]/[0.07] blur-[140px] lv2-glow-orb pointer-events-none" />
      <div
        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[#6366F1]/[0.04] blur-[120px] lv2-glow-orb pointer-events-none"
        style={{ animationDelay: '3s' }}
      />

      <div className="max-w-[1200px] mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div>
            <div className="mb-8">
              <span className="lv2-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm text-white/80">
                <Briefcase size={14} className="text-[#8B5CF6]" />
                Espacios de Trabajo
              </span>
            </div>

            <h1 className="text-[9vw] sm:text-[48px] lg:text-[60px] xl:text-[72px] font-normal leading-[1.05] tracking-[-2px] lg:tracking-[-3px] mb-6">
              <span className="text-white block">Cada espacio ocupado,</span>
              <span className="text-white/60 block mt-1">sin mover un dedo.</span>
            </h1>

            <p className="text-base sm:text-lg text-white/50 max-w-xl mb-8 leading-relaxed tracking-[-0.2px]">
              <WordReveal text="Reservas automáticas para coworkings, salas de reuniones y oficinas flexibles. Tus clientes reservan y pagan solos. Vos maximizás la ocupación." />
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-10">
              <Link
                href="/register"
                className="lv2-glow-btn bg-[#8B5CF6] text-white font-medium px-8 py-3.5 rounded-[10px] text-base flex items-center gap-2"
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
                <Zap size={14} className="text-[#8B5CF6]" /> Configuraci&oacute;n en 5 min
              </span>
              <span className="flex items-center gap-1.5">
                <Shield size={14} className="text-[#8B5CF6]" /> 14 d&iacute;as gratis
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-[#8B5CF6]" /> +150 espacios activos
              </span>
            </div>
          </div>

          {/* Right: Product mockup — calendar/grid view */}
          <div className="relative hidden lg:block">
            <div className="lv2-mockup-wrapper relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-[#8B5CF6]/10">
              <Image
                src="/mockups/espacios-hero.webp"
                alt="WorkHub Coworking — reservas de espacios de trabajo con calendario y disponibilidad"
                width={700}
                height={480}
                className="w-full h-auto"
                priority
              />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-5 -left-5 bg-black/90 backdrop-blur-xl border border-white/[0.1] rounded-xl px-5 py-3.5 flex items-center gap-3 shadow-xl">
              <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center">
                <TrendingUp size={18} className="text-green-400" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">85% ocupaci&oacute;n</p>
                <p className="text-white/40 text-xs">Promedio de nuestros clientes</p>
              </div>
            </div>
            <div className="absolute -top-3 -right-3 bg-black/90 backdrop-blur-xl border border-white/[0.1] rounded-xl px-5 py-3.5 flex items-center gap-3 shadow-xl">
              <div className="w-9 h-9 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center">
                <CalendarCheck size={18} className="text-[#8B5CF6]" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Reservas 24/7</p>
                <p className="text-white/40 text-xs">Desde tu web y redes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-only mockup */}
        <div className="mt-12 lg:hidden">
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-xl shadow-[#8B5CF6]/10 max-w-md mx-auto">
            <Image
              src="/mockups/espacios-mobile.webp"
              alt="Coworking — vista móvil de reservas de espacios"
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
  const c1 = useCountUp(85, 2000);
  const c2 = useCountUp(150, 2500);
  const c3 = useCountUp(60, 2000);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-14 border-y border-white/[0.04] bg-white/[0.01]"
    >
      <div className="max-w-[1200px] mx-auto px-5 lg:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-4">
          <div ref={c1.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              {c1.count}<span className="text-[#8B5CF6]">%</span>
            </p>
            <p className="text-sm text-white/40 mt-2">Ocupaci&oacute;n promedio</p>
          </div>
          <div ref={c2.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              +{c2.count}
            </p>
            <p className="text-sm text-white/40 mt-2">Espacios activos</p>
          </div>
          <div ref={c3.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              -{c3.count}<span className="text-[#8B5CF6]">%</span>
            </p>
            <p className="text-sm text-white/40 mt-2">Horas vac&iacute;as</p>
          </div>
          <div className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-[#8B5CF6] tracking-[-2px]">$0</p>
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
          <SectionH2 line1="&iquest;Tu espacio vive as&iacute;?" line2="No tiene por qu&eacute;." />
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
          <SectionH2 line1="Un d&iacute;a en tu espacio," line2="antes y despu&eacute;s." />
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
                <span className="absolute top-4 right-6 text-[#8B5CF6]/[0.08] text-7xl font-bold leading-none pointer-events-none select-none">
                  {step.num}
                </span>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl lv2-icon-glow flex items-center justify-center mb-6">
                    <Icon size={24} className="text-[#8B5CF6]" />
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

        {/* Mockups */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <Image
              src="/mockups/espacios-services.webp"
              alt="Escritorios, oficinas y salas configurados en TurnoLink"
              width={400}
              height={260}
              className="w-full h-auto"
            />
          </div>
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <Image
              src="/mockups/espacios-mobile.webp"
              alt="Disponibilidad de espacios de coworking en móvil"
              width={400}
              height={260}
              className="w-full h-auto"
            />
          </div>
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <Image
              src="/mockups/espacios-hero.webp"
              alt="Vista completa del sistema de reservas para coworking"
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
          <SectionH2 line1="Todo para gestionar" line2="tus espacios." />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="lv2-card-stagger lv2-card p-7 hover:bg-[#0A0A0A] transition-colors duration-300"
              >
                <div className="w-11 h-11 rounded-xl lv2-icon-glow flex items-center justify-center mb-5">
                  <Icon size={22} className="text-[#8B5CF6]" />
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
          <SectionTag text="Tipos de espacio" />
          <SectionH2 line1="Para todo tipo de" line2="espacio flexible." />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            Coworking, oficinas, salas de reuniones o boxes profesionales. TurnoLink se adapta a la forma en que oper&aacute;s tu espacio.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {SUB_INDUSTRIES.map((item, i) => (
            <div
              key={i}
              className="lv2-card-stagger lv2-card p-5 text-center hover:bg-[#0A0A0A] transition-colors duration-300 group"
            >
              <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform duration-300">
                {item.emoji}
              </span>
              <h3 className="text-white font-medium text-sm tracking-[-0.3px] mb-1">{item.name}</h3>
              <p className="text-white/35 text-xs leading-relaxed">{item.desc}</p>
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
          <SectionH2 line1="&iquest;Cu&aacute;nto te cuestan" line2="las horas vac&iacute;as?" />
          <p className="mt-5 text-white/50 max-w-xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            Cada hora que tu sala o escritorio est&aacute; vac&iacute;o es facturaci&oacute;n que se pierde. Con reservas online, la ocupaci&oacute;n sube sola.
          </p>
        </div>

        <div className="lv2-card p-8 sm:p-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            {/* Sin TurnoLink */}
            <div className="text-center p-7 rounded-xl bg-red-500/[0.04] border border-red-500/[0.08]">
              <p className="text-sm text-red-400/70 font-medium mb-5 tracking-tight">Sin reservas online</p>
              <div className="space-y-2 text-white/45 text-sm">
                <p>~4 horas vac&iacute;as por d&iacute;a</p>
                <p>Tarifa promedio: $5.000/hora</p>
              </div>
              <div className="mt-5 pt-5 border-t border-red-500/[0.08]">
                <p className="text-3xl text-red-400/80 font-normal tracking-[-1.5px]">
                  -$440.000
                </p>
                <p className="text-xs text-red-400/40 mt-1">perdidos por mes</p>
              </div>
            </div>

            {/* Con TurnoLink */}
            <div className="text-center p-7 rounded-xl bg-[#10B981]/[0.06] border border-[#10B981]/[0.15]">
              <p className="text-sm text-[#10B981] font-medium mb-5 tracking-tight">Con TurnoLink</p>
              <div className="space-y-2 text-white/45 text-sm">
                <p>~1 hora vac&iacute;a por d&iacute;a (-75%)</p>
                <p>Tarifa promedio: $5.000/hora</p>
              </div>
              <div className="mt-5 pt-5 border-t border-[#10B981]/[0.12]">
                <p className="text-3xl text-[#10B981] font-normal tracking-[-1.5px]">
                  -$110.000
                </p>
                <p className="text-xs text-[#10B981]/50 mt-1">perdidos por mes</p>
              </div>
            </div>
          </div>

          {/* ROI Summary */}
          <div className="text-center border-t border-white/[0.06] pt-8">
            <p className="text-white/50 text-sm mb-2">Recuper&aacute;s</p>
            <p className="text-4xl sm:text-5xl text-white font-normal tracking-[-2px]">
              $330.000<span className="text-lg text-white/30 ml-1">/mes</span>
            </p>
            <p className="text-white/40 text-sm mt-4">
              Plan Starter: $19.990/mes &mdash;{' '}
              <span className="text-[#10B981] font-medium">ROI de 16x tu inversi&oacute;n</span>
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
              <div className="mb-5">
                <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#8B5CF6]/[0.1] border border-[#8B5CF6]/[0.15] text-xs text-[#8B5CF6] font-medium">
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
          <SectionH2 line1="Planes para cada espacio," line2="sin letra chica." />
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
                  <span className="text-[10px] font-bold text-white bg-[#8B5CF6] px-3 py-1 rounded-md tracking-wide uppercase">
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
                    <Check size={16} className="text-[#8B5CF6] mt-0.5 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`mt-8 w-full text-center py-3 rounded-[10px] text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  tier.popular
                    ? 'lv2-glow-btn bg-[#8B5CF6] text-white'
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
            className="text-sm text-[#8B5CF6] hover:text-[#A78BFA] transition-colors duration-300"
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
              Respuestas a las dudas m&aacute;s comunes de operadores de coworkings, salas y espacios flexibles.
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

export function EspaciosLanding() {
  return (
    <div
      className="min-h-screen bg-black text-white selection:bg-[#8B5CF6]/30 selection:text-white"
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
        headline="Tu espacio merece un sistema profesional"
        subtitle="empez&aacute; en 5 minutos."
        description="Prob&aacute; TurnoLink 14 d&iacute;as gratis. Configur&aacute; tus salas y oficinas, activ&aacute; reservas online y empez&aacute; a maximizar tu ocupaci&oacute;n."
      />
      <Footer />
    </div>
  );
}
