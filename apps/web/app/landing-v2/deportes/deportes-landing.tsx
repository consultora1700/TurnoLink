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
  type LucideIcon,
} from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '../_components/hooks';
import { SectionTag, SectionH2, WordReveal, WHATSAPP_URL } from '../_components/ui';
import { Navbar } from '../_components/navbar';
import { Footer } from '../_components/footer';
import { CTASection } from '../_components/cta-section';

/* ═══════════════════════════════════════════════════════
   ACCENT: Green / Emerald — #22C55E primary, #2D9B4E secondary
   ═══════════════════════════════════════════════════════ */

const ACCENT = '#22C55E';
const ACCENT_DIM = '#2D9B4E';

/* ═══════════════════════════════════════════════════════
   DATA CONSTANTS
   ═══════════════════════════════════════════════════════ */

const PAIN_POINTS = [
  {
    emoji: '📞',
    title: 'El teléfono no para',
    desc: 'Llamadas y mensajes todo el día para reservar canchas. Tu equipo pierde tiempo que podría usar en la operación del complejo.',
  },
  {
    emoji: '👻',
    title: 'Reservas fantasma',
    desc: 'Reservan de palabra, no vienen, no avisan. Sin seña no hay compromiso. Y vos perdés horas de cancha vacía.',
  },
  {
    emoji: '📋',
    title: 'Grilla en papel o Excel',
    desc: 'Cuadernos, planillas, pizarras. Sin visibilidad real de tu ocupación ni control de la facturación diaria.',
  },
];

const BEFORE_ITEMS = [
  { time: '08:00', text: '23 mensajes de WhatsApp pidiendo cancha para la noche' },
  { time: '10:00', text: 'Grupo de las 10 no vino. No avisó. Cancha vacía 1 hora' },
  { time: '14:00', text: 'Doble reserva: dos grupos llegan a la misma cancha a las 18' },
  { time: '17:00', text: '"¿Cuánto sale la cancha de noche?" — lo respondés por 30va vez' },
  { time: '20:00', text: 'Cerrás sin saber cuántas horas facturaste realmente hoy' },
  { time: '23:00', text: 'Seguís respondiendo mensajes para reservas de mañana' },
];

const AFTER_ITEMS = [
  { time: '08:00', text: 'Grilla completa. Los jugadores reservaron anoche desde el celu' },
  { time: '10:00', text: 'Todos vinieron. Ya habían pagado seña al reservar' },
  { time: '14:00', text: 'Cada cancha con su disponibilidad. Cero solapamientos' },
  { time: '17:00', text: 'Tu página muestra canchas, precios y horarios 24/7' },
  { time: '20:00', text: 'Dashboard con la ocupación y facturación del día en tiempo real' },
  { time: '23:00', text: 'Descansás. El sistema sigue recibiendo reservas para mañana' },
];

const HOW_IT_WORKS = [
  {
    num: '01',
    icon: CalendarCheck,
    title: 'Configurá tus espacios',
    desc: 'Cargá tus canchas, estudios o salas con bloques horarios, precios y disponibilidad. Listo en 5 minutos.',
  },
  {
    num: '02',
    icon: Share2,
    title: 'Compartí tu grilla',
    desc: 'Pegá tu link en Instagram, Google Maps y WhatsApp. Tus clientes ven la disponibilidad y reservan solos.',
  },
  {
    num: '03',
    icon: CreditCard,
    title: 'Cobrá y confirmá',
    desc: 'Tu cliente paga la seña con Mercado Pago al reservar. Sin excusas, sin ausencias. Plata directo a tu cuenta.',
  },
];

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: CalendarCheck,
    title: 'Reserva por espacio',
    desc: 'Cada cancha, sala o estudio con su disponibilidad independiente. Fútbol, pádel, tenis — todo organizado.',
  },
  {
    icon: Timer,
    title: 'Bloques horarios flexibles',
    desc: 'Configurá bloques de 1, 1.5 o 2 horas según tu operación. Disponibilidad que se actualiza en tiempo real.',
  },
  {
    icon: CreditCard,
    title: 'Cobro de señas',
    desc: 'Seña automática con Mercado Pago al reservar. Eliminá las ausencias y asegurá tus ingresos.',
  },
  {
    icon: Building2,
    title: 'Multi-cancha y sede',
    desc: 'Gestioná todas tus canchas desde un solo panel. Más de una sede? Cada una con su configuración.',
  },
  {
    icon: Globe,
    title: 'Página de reservas',
    desc: 'Link donde tus clientes ven disponibilidad y reservan solos. Compartilo en redes y Google.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard de ocupación',
    desc: 'Métricas de ocupación por cancha, horarios pico, facturación. Tomá decisiones con datos reales.',
  },
  {
    icon: TrendingUp,
    title: 'Precios por franja horaria',
    desc: 'Horario pico, noche, fin de semana — cada franja con su precio. TurnoLink se adapta a tu modelo.',
  },
  {
    icon: Bell,
    title: 'Recordatorios automáticos',
    desc: 'Tu cliente recibe aviso antes de la reserva. Menos olvidos, menos ausencias, más ocupación.',
  },
];

const SUB_INDUSTRIES = [
  { emoji: '⚽', name: 'Canchas de fútbol', desc: 'Fútbol 5, 7, 8 y 11 — gestión de múltiples canchas' },
  { emoji: '🏸', name: 'Canchas de pádel', desc: 'Reservas por hora, torneos y clases' },
  { emoji: '🎾', name: 'Tenis', desc: 'Singles, dobles y clases con coach' },
  { emoji: '🏀', name: 'Básquet', desc: 'Canchas por hora y ligas recreativas' },
  { emoji: '💃', name: 'Estudios de danza', desc: 'Clases, ensayos y eventos por hora' },
  { emoji: '🏋️', name: 'Gimnasios por clase', desc: 'CrossFit, funcional, spinning y más' },
  { emoji: '🏃', name: 'Entrenadores personales', desc: 'Sesiones individuales y grupos reducidos' },
  { emoji: '🎵', name: 'Salas de ensayo', desc: 'Bandas, músicos y producción musical' },
  { emoji: '🎙️', name: 'Estudios de grabación', desc: 'Grabación, mezcla y producción por hora' },
];

const TESTIMONIALS = [
  {
    quote:
      'Tenemos 4 canchas de pádel y 2 de fútbol. TurnoLink nos eliminó los solapamientos y el teléfono que no paraba. Las reservas subieron un 40%.',
    name: 'Nicolás Romero',
    role: 'Socio',
    business: 'Pádel & Fútbol Norte',
    metric: '+40% reservas',
  },
  {
    quote:
      'El cobro de seña fue un antes y después. Antes cancelaban 3 de cada 10 reservas. Ahora casi nadie falta. Recuperamos $200K por mes.',
    name: 'Martín Delgado',
    role: 'Dueño',
    business: 'Centro Deportivo MD',
    metric: '-70% ausencias',
  },
  {
    quote:
      'Nuestros alumnos reservan las clases desde el celu. Nosotros vemos la ocupación en tiempo real. Simple, rápido y profesional.',
    name: 'Paula Sánchez',
    role: 'Directora',
    business: 'Gimnasio Fuerza Vital',
    metric: '85% ocupación',
  },
];

const PRICING_TIERS = [
  {
    name: 'Gratis',
    price: '$0',
    period: 'para siempre',
    popular: false,
    features: [
      'Hasta 2 canchas/espacios',
      '30 reservas por mes',
      '1 sede',
      'Página de reservas',
      'Recordatorios básicos',
    ],
  },
  {
    name: 'Profesional',
    price: '$19.990',
    period: '/mes',
    popular: true,
    features: [
      'Canchas/espacios ilimitados',
      'Reservas ilimitadas',
      'Cobro de señas con Mercado Pago',
      '1 sede',
      'Reportes de ocupación',
      'Dashboard completo',
    ],
  },
  {
    name: 'Complejo',
    price: '$34.990',
    period: '/mes',
    popular: false,
    features: [
      'Todo de Profesional',
      'Multi-sede',
      'Reportes avanzados',
      'Soporte prioritario',
      'Dashboard gerencial',
      'API disponible',
    ],
  },
];

const FAQS = [
  {
    q: '¿Puedo configurar distintos tipos de cancha?',
    a: 'Sí. Fútbol 5, fútbol 7, pádel, tenis — cada tipo con su duración de bloque, precio y disponibilidad independiente.',
  },
  {
    q: '¿Los clientes pueden ver la disponibilidad en tiempo real?',
    a: 'Sí. Tu página de reservas muestra las canchas disponibles para cada horario. Se actualiza automáticamente cuando alguien reserva o cancela.',
  },
  {
    q: '¿Puedo configurar precios distintos por horario?',
    a: 'Sí. Horario pico, noche, fin de semana — cada franja con su precio. TurnoLink se adapta a tu modelo de negocio.',
  },
  {
    q: '¿Sirve para un complejo con varias canchas y actividades?',
    a: 'Sí. Podés gestionar canchas, gimnasio, pileta y más desde una sola cuenta. Cada espacio con su configuración independiente.',
  },
  {
    q: '¿Cómo funciona el cobro de seña para canchas?',
    a: 'Configurás un monto fijo o porcentaje. Al reservar, el cliente paga vía Mercado Pago y la reserva se confirma automáticamente. El dinero va a tu cuenta.',
  },
  {
    q: '¿Sirve para clases y actividades grupales?',
    a: 'Sí. Podés configurar clases con cupo máximo (ej: 12 personas por clase de spinning). Los alumnos reservan y pagan desde el celular.',
  },
  {
    q: '¿Funciona para salas de ensayo y estudios de grabación?',
    a: 'Sí. La lógica es la misma: espacios por hora con disponibilidad en tiempo real. Configurás bloques, precios y señas como con una cancha.',
  },
  {
    q: '¿Qué pasa si un cliente cancela la reserva?',
    a: 'El horario se libera automáticamente para que otro cliente pueda reservar. La política de seña (devolver o retener) la definís vos desde la configuración.',
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
      {/* Glow orbs — green/emerald */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[#22C55E]/[0.07] blur-[140px] lv2-glow-orb pointer-events-none" />
      <div
        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[#2D9B4E]/[0.04] blur-[120px] lv2-glow-orb pointer-events-none"
        style={{ animationDelay: '3s' }}
      />

      <div className="max-w-[1200px] mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div>
            <div className="mb-8">
              <span className="lv2-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm text-white/80">
                <Timer size={14} className="text-[#22C55E]" />
                Deportes &amp; Espacios por Hora
              </span>
            </div>

            <h1 className="text-[9vw] sm:text-[48px] lg:text-[60px] xl:text-[72px] font-normal leading-[1.05] tracking-[-2px] lg:tracking-[-3px] mb-6">
              <span className="text-white block">Espacios llenos,</span>
              <span className="text-white/60 block mt-1">gesti&oacute;n en cero.</span>
            </h1>

            <p className="text-base sm:text-lg text-white/50 max-w-xl mb-8 leading-relaxed tracking-[-0.2px]">
              <WordReveal text="Reservas automáticas para canchas, estudios y espacios por hora. Tus clientes reservan solos y pagan la seña con Mercado Pago. Vos te dedicás a tu complejo." />
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-10">
              <Link
                href="/register"
                className="lv2-glow-btn bg-[#22C55E] text-white font-medium px-8 py-3.5 rounded-[10px] text-base flex items-center gap-2"
              >
                Empezar gratis ahora
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
                <Zap size={14} className="text-[#22C55E]" /> Configuraci&oacute;n en 5 min
              </span>
              <span className="flex items-center gap-1.5">
                <Shield size={14} className="text-[#22C55E]" /> Sin tarjeta de cr&eacute;dito
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-[#22C55E]" /> +300 espacios activos
              </span>
            </div>
          </div>

          {/* Right: Product mockup — calendar grid / time blocks */}
          <div className="relative hidden lg:block">
            <div className="lv2-mockup-wrapper relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-[#22C55E]/10">
              <Image
                src="/mockups/deportes-hero.webp"
                alt="Pádel & Fútbol Sur — reservas de canchas con bloques horarios"
                width={700}
                height={480}
                className="w-full h-auto"
                priority
              />
            </div>
            {/* Floating metric badge */}
            <div className="absolute -bottom-5 -left-5 bg-black/90 backdrop-blur-xl border border-white/[0.1] rounded-xl px-5 py-3.5 flex items-center gap-3 shadow-xl">
              <div className="w-9 h-9 rounded-full bg-[#22C55E]/20 flex items-center justify-center">
                <TrendingUp size={18} className="text-[#22C55E]" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">85% ocupaci&oacute;n</p>
                <p className="text-white/40 text-xs">Promedio de nuestros clientes</p>
              </div>
            </div>
            {/* Second floating badge */}
            <div className="absolute -top-3 -right-3 bg-black/90 backdrop-blur-xl border border-white/[0.1] rounded-xl px-5 py-3.5 flex items-center gap-3 shadow-xl">
              <div className="w-9 h-9 rounded-full bg-[#22C55E]/20 flex items-center justify-center">
                <CalendarCheck size={18} className="text-[#22C55E]" />
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
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-xl shadow-[#22C55E]/10 max-w-md mx-auto">
            <Image
              src="/mockups/deportes-mobile.webp"
              alt="Complejo deportivo — vista móvil de reservas de canchas"
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
  const c2 = useCountUp(300, 2500);
  const c3 = useCountUp(50, 2000);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-14 border-y border-white/[0.04] bg-white/[0.01]"
    >
      <div className="max-w-[1200px] mx-auto px-5 lg:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-4">
          <div ref={c1.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              {c1.count}<span className="text-[#22C55E]">%</span>
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
              -{c3.count}
            </p>
            <p className="text-sm text-white/40 mt-2">Llamadas menos por d&iacute;a</p>
          </div>
          <div className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-[#22C55E] tracking-[-2px]">$0</p>
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
          <SectionH2 line1="&iquest;Tu complejo vive as&iacute;?" line2="No tiene por qu&eacute;." />
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
          <SectionH2 line1="Un d&iacute;a en tu complejo," line2="antes y despu&eacute;s." />
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
            <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E]/[0.05] to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-3 h-3 rounded-full bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                <h3 className="text-white/80 font-medium text-lg tracking-[-0.5px]">Con TurnoLink</h3>
              </div>
              <div className="space-y-5">
                {AFTER_ITEMS.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="text-xs text-[#22C55E]/70 font-mono mt-0.5 w-12 flex-shrink-0 tabular-nums">
                      {item.time}
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]/60 mt-2 flex-shrink-0" />
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
                <span className="absolute top-4 right-6 text-[#22C55E]/[0.08] text-7xl font-bold leading-none pointer-events-none select-none">
                  {step.num}
                </span>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-[#22C55E]/[0.08] border border-[#22C55E]/[0.12] flex items-center justify-center mb-6">
                    <Icon size={24} className="text-[#22C55E]" />
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
              src="/mockups/deportes-services.webp"
              alt="Canchas de pádel, fútbol y tenis configuradas en TurnoLink"
              width={400}
              height={260}
              className="w-full h-auto"
            />
          </div>
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <Image
              src="/mockups/deportes-mobile.webp"
              alt="Grilla de disponibilidad de canchas en móvil"
              width={400}
              height={260}
              className="w-full h-auto"
            />
          </div>
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <Image
              src="/mockups/deportes-hero.webp"
              alt="Vista completa del sistema de reservas para complejo deportivo"
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
          <SectionH2 line1="Todo lo que necesit&aacute;s" line2="para gestionar tu espacio." />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="lv2-card-stagger lv2-card p-7 hover:bg-[#0A0A0A] transition-colors duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-[#22C55E]/[0.08] border border-[#22C55E]/[0.12] flex items-center justify-center mb-5">
                  <Icon size={22} className="text-[#22C55E]" />
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
          <SectionH2 line1="Para todo tipo de" line2="espacios por hora." />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            Canchas, estudios, salas de ensayo o gimnasios. Si alquil&aacute;s espacios por hora, TurnoLink es para vos.
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
          <SectionH2 line1="&iquest;Cu&aacute;nto te cuestan" line2="las canchas vac&iacute;as?" />
          <p className="mt-5 text-white/50 max-w-xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            Cada hora de cancha vac&iacute;a es plata que no entra. Con se&ntilde;as autom&aacute;ticas, la historia cambia.
          </p>
        </div>

        <div className="lv2-card p-8 sm:p-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            {/* Sin TurnoLink */}
            <div className="text-center p-7 rounded-xl bg-red-500/[0.04] border border-red-500/[0.08]">
              <p className="text-sm text-red-400/70 font-medium mb-5 tracking-tight">Sin cobro de se&ntilde;as</p>
              <div className="space-y-2 text-white/45 text-sm">
                <p>~4 no-shows por semana</p>
                <p>Hora de cancha promedio: $12.000</p>
              </div>
              <div className="mt-5 pt-5 border-t border-red-500/[0.08]">
                <p className="text-3xl text-red-400/80 font-normal tracking-[-1.5px]">
                  -$192.000
                </p>
                <p className="text-xs text-red-400/40 mt-1">perdidos por mes</p>
              </div>
            </div>

            {/* Con TurnoLink */}
            <div className="text-center p-7 rounded-xl bg-[#22C55E]/[0.06] border border-[#22C55E]/[0.15]">
              <p className="text-sm text-[#22C55E] font-medium mb-5 tracking-tight">Con TurnoLink</p>
              <div className="space-y-2 text-white/45 text-sm">
                <p>~1 no-show por semana (-75%)</p>
                <p>Hora de cancha promedio: $12.000</p>
              </div>
              <div className="mt-5 pt-5 border-t border-[#22C55E]/[0.12]">
                <p className="text-3xl text-[#22C55E] font-normal tracking-[-1.5px]">
                  -$48.000
                </p>
                <p className="text-xs text-[#22C55E]/50 mt-1">perdidos por mes</p>
              </div>
            </div>
          </div>

          {/* ROI Summary */}
          <div className="text-center border-t border-white/[0.06] pt-8">
            <p className="text-white/50 text-sm mb-2">Recuper&aacute;s</p>
            <p className="text-4xl sm:text-5xl text-white font-normal tracking-[-2px]">
              $144.000<span className="text-lg text-white/30 ml-1">/mes</span>
            </p>
            <p className="text-white/40 text-sm mt-4">
              Plan Profesional: $19.990/mes &mdash;{' '}
              <span className="text-[#22C55E] font-medium">ROI de 7.2x tu inversi&oacute;n</span>
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
                <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#22C55E]/[0.1] border border-[#22C55E]/[0.15] text-xs text-[#22C55E] font-medium">
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
          <SectionH2 line1="Planes simples," line2="sin letra chica." />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            Empez&aacute; gratis y escal&aacute; cuando lo necesites. Sin compromiso, sin tarjeta de cr&eacute;dito.
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
                  <span className="text-[10px] font-bold text-white bg-[#22C55E] px-3 py-1 rounded-md tracking-wide uppercase">
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
                    <Check size={16} className="text-[#22C55E] mt-0.5 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`mt-8 w-full text-center py-3 rounded-[10px] text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  tier.popular
                    ? 'lv2-glow-btn bg-[#22C55E] text-white'
                    : 'bg-white/[0.06] text-white/80 hover:bg-white/[0.12] border border-white/[0.08]'
                }`}
              >
                {tier.price === '$0' ? 'Empezar gratis' : 'Probar 14 d\u00edas gratis'}
                <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-white/25 text-sm mt-10 flex items-center justify-center gap-2">
          <Shield size={14} />
          Plan Gratis permanente. 14 d&iacute;as de prueba en planes pagos. Sin tarjeta de cr&eacute;dito.
        </p>
        <p className="text-center mt-4">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#22C55E] hover:text-[#2D9B4E] transition-colors duration-300"
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
              Respuestas a las dudas m&aacute;s comunes de due&ntilde;os de complejos deportivos, canchas y espacios por hora.
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

export function DeportesLanding() {
  return (
    <div
      className="min-h-screen bg-black text-white selection:bg-[#22C55E]/30 selection:text-white"
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
        subtitle="empez&aacute; gratis en 5 minutos."
        description="Cre&aacute; tu cuenta gratis, configur&aacute; tus canchas y empez&aacute; a recibir reservas con cobro autom&aacute;tico. Sin tarjeta de cr&eacute;dito."
      />
      <Footer />
    </div>
  );
}
