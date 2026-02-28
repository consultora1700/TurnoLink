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
  Scissors,
  type LucideIcon,
} from 'lucide-react';
import { useScrollReveal, useStaggerReveal, useImageReveal } from '../_components/hooks';
import { SectionTag, SectionH2, WordReveal, WHATSAPP_URL } from '../_components/ui';
import { Navbar } from '../_components/navbar';
import { Footer } from '../_components/footer';
import { CTASection } from '../_components/cta-section';

/* ═══════════════════════════════════════════════════════
   DATA CONSTANTS
   ═══════════════════════════════════════════════════════ */

const PAIN_POINTS = [
  {
    emoji: '📱',
    title: 'Tu WhatsApp no para',
    desc: 'Respondés mensajes todo el día para coordinar turnos. Mientras tanto, el salón espera y perdés plata.',
  },
  {
    emoji: '👻',
    title: 'Clientes fantasma',
    desc: 'No vienen, no avisan, te dejan el turno vacío. Sin seña, no hay compromiso. Y vos perdés ingresos.',
  },
  {
    emoji: '🤯',
    title: 'Cobros que no cuadran',
    desc: 'Efectivo, transferencias, "te pago después". Llegás a fin de mes sin saber cuánto facturaste realmente.',
  },
];

const BEFORE_ITEMS = [
  { time: '08:00', text: '47 mensajes de WhatsApp pidiendo turno' },
  { time: '09:30', text: 'Clienta no vino. No avisó. Turno vacío' },
  { time: '11:00', text: '"¿Cuánto sale el balayage?" — lo respondés por 20va vez' },
  { time: '14:00', text: 'Doble turno: anotaste dos clientas a la misma hora' },
  { time: '18:00', text: 'Cerrás sin saber cuánto facturaste hoy' },
  { time: '22:00', text: 'Seguís respondiendo mensajes desde tu casa' },
];

const AFTER_ITEMS = [
  { time: '08:00', text: 'Turnos del día completos. Reservaron anoche' },
  { time: '09:30', text: 'Todas vinieron. Ya habían pagado seña' },
  { time: '11:00', text: 'Tu página muestra servicios, precios y disponibilidad 24/7' },
  { time: '14:00', text: 'Agenda organizada. Cada profesional con sus horarios' },
  { time: '18:00', text: 'Dashboard con la facturación del día en tiempo real' },
  { time: '22:00', text: 'Descansás. El sistema sigue recibiendo reservas para mañana' },
];

const HOW_IT_WORKS = [
  {
    num: '01',
    icon: CalendarCheck,
    title: 'Configurá tus servicios',
    desc: 'Cargá cortes, colores, manicura... con duraciones y precios. Agregá tu equipo. Listo en 5 minutos.',
  },
  {
    num: '02',
    icon: Share2,
    title: 'Compartí tu link',
    desc: 'Pegá tu link en tu bio de Instagram, Google Maps y WhatsApp. Tus clientes eligen día, hora y profesional.',
  },
  {
    num: '03',
    icon: CreditCard,
    title: 'Cobrá automáticamente',
    desc: 'Tu clienta paga la seña con Mercado Pago al reservar. Sin excusas, sin ausencias. Plata directo a tu cuenta.',
  },
];

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: CalendarCheck,
    title: 'Agenda inteligente',
    desc: 'Cada servicio con su duración, precio y profesional. Corte, color, manicura — sin solapamientos.',
  },
  {
    icon: CreditCard,
    title: 'Cobro de señas',
    desc: 'Tu clienta reserva y paga con Mercado Pago. Sin excusas. El dinero va directo a tu cuenta.',
  },
  {
    icon: Users,
    title: 'Gestión de equipo',
    desc: 'Cada profesional con su agenda, servicios y horarios propios. Asignación automática.',
  },
  {
    icon: Star,
    title: 'Ficha de clientes',
    desc: 'Historial completo: servicios, pagos, preferencias y notas. Conocé y fidelizá.',
  },
  {
    icon: Globe,
    title: 'Página de reservas',
    desc: 'Link personalizado para Instagram, WhatsApp y Google. Tus clientes reservan solos, 24/7.',
  },
  {
    icon: Bell,
    title: 'Recordatorios automáticos',
    desc: 'Tu cliente recibe aviso antes del turno. Menos olvidos, menos ausencias.',
  },
  {
    icon: BarChart3,
    title: 'Reportes y métricas',
    desc: 'Facturación, servicios más pedidos, ocupación por profesional. Datos para crecer.',
  },
  {
    icon: Building2,
    title: 'Multi-sucursal',
    desc: 'Más de un local? Gestioná todo desde una cuenta con configuración independiente.',
  },
];

const SUB_INDUSTRIES = [
  { emoji: '✂️', name: 'Peluquerías', desc: 'Corte, color, peinados y tratamientos capilares' },
  { emoji: '💈', name: 'Barberías', desc: 'Corte, barba, afeitado y grooming masculino' },
  { emoji: '✨', name: 'Centros de estética', desc: 'Tratamientos faciales, corporales y rejuvenecimiento' },
  { emoji: '💅', name: 'Uñas & Nail bars', desc: 'Manicura, pedicura, esculpidas y nail art' },
  { emoji: '👁️', name: 'Pestañas & Cejas', desc: 'Extensiones, lifting, diseño y laminado' },
  { emoji: '⚡', name: 'Depilación', desc: 'Láser, cera, IPL y definitiva' },
  { emoji: '🧖', name: 'Spa & Relax', desc: 'Circuitos de agua, sauna y wellness' },
  { emoji: '💆', name: 'Masajes', desc: 'Relajante, descontracturante y drenaje' },
  { emoji: '☀️', name: 'Bronceado', desc: 'Camas solares, spray tan y artificial' },
  { emoji: '💧', name: 'Cosmetología', desc: 'Limpieza profunda, peelings y skincare' },
];

const TESTIMONIALS = [
  {
    quote:
      'Desde que usamos TurnoLink, las ausencias bajaron un 80%. El cobro de seña automático cambió todo. Mis clientas reservan solas desde Instagram.',
    name: 'Mariana López',
    role: 'Dueña',
    business: 'Estudio MR — Peluquería',
    metric: '-80% ausencias',
  },
  {
    quote:
      'Antes perdía 3 horas por día en WhatsApp coordinando turnos. Ahora mis clientes reservan solos y yo me enfoco en cortar.',
    name: 'Lucas Fernández',
    role: 'Barbero',
    business: 'Barber Shop LF',
    metric: '3hs/día ahorradas',
  },
  {
    quote:
      'Gestionamos 3 gabinetes con 6 profesionales. Cada una tiene su agenda y sus servicios. TurnoLink nos organizó el spa completo.',
    name: 'Carolina Ruiz',
    role: 'Directora',
    business: 'Spa Esencia',
    metric: '6 profesionales',
  },
];

const PRICING_TIERS = [
  {
    name: 'Gratis',
    price: '$0',
    period: 'para siempre',
    popular: false,
    features: [
      '30 reservas por mes',
      '1 profesional',
      '1 sucursal',
      'Página de reservas',
      'Recordatorios básicos',
    ],
  },
  {
    name: 'Profesional',
    price: '$12.990',
    period: '/mes',
    popular: true,
    features: [
      'Reservas ilimitadas',
      'Hasta 5 profesionales',
      'Cobro de señas con Mercado Pago',
      '1 sucursal',
      'Ficha de cliente',
      'Reportes básicos',
    ],
  },
  {
    name: 'Business',
    price: '$22.990',
    period: '/mes',
    popular: false,
    features: [
      'Todo de Profesional',
      'Profesionales ilimitados',
      'Multi-sucursal',
      'Reportes avanzados',
      'Soporte prioritario',
      'Dashboard gerencial',
    ],
  },
];

const FAQS = [
  {
    q: '¿Puedo configurar distintos servicios con distintas duraciones?',
    a: 'Sí. Cada servicio tiene su nombre, duración, precio y profesional asignado. Podés tener "Corte" de 30 min, "Color" de 90 min, "Manicura" de 45 min — todo configurable.',
  },
  {
    q: '¿Mis clientas pueden elegir profesional al reservar?',
    a: 'Sí. La página de reservas muestra los profesionales disponibles para cada servicio. Tu clienta elige quién la atiende y el horario que le conviene.',
  },
  {
    q: '¿Cómo funciona el cobro de seña?',
    a: 'Configurás un porcentaje de seña (ej: 30%). Cuando tu clienta reserva, paga automáticamente vía Mercado Pago. La reserva se confirma al instante y el dinero va a tu cuenta.',
  },
  {
    q: '¿Puedo compartir el link de reservas en mis redes?',
    a: 'Sí. Tenés un link personalizado (ej: turnolink.com/tu-salon) que podés compartir en Instagram, WhatsApp, Google My Business y donde quieras.',
  },
  {
    q: '¿Funciona si tengo más de un local?',
    a: 'Sí. Con el plan Business podés gestionar múltiples sucursales, cada una con sus propios profesionales, servicios y horarios.',
  },
  {
    q: '¿Necesito saber de tecnología para usarlo?',
    a: 'No. Si sabés usar WhatsApp, sabés usar TurnoLink. La configuración toma 5 minutos y nuestro equipo te ayuda si lo necesitás.',
  },
  {
    q: '¿Qué pasa si una clienta cancela?',
    a: 'El turno se libera automáticamente para que otro cliente pueda reservar. La política de seña (devolver o retener) la definís vos desde la configuración.',
  },
  {
    q: '¿Puedo probar gratis antes de pagar?',
    a: 'Sí. Tenés un plan Gratis permanente con 30 reservas por mes. Y los planes pagos tienen 14 días de prueba gratis, sin tarjeta de crédito.',
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
      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[#EC4899]/[0.07] blur-[140px] lv2-glow-orb pointer-events-none" />
      <div
        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[#C9A87C]/[0.04] blur-[120px] lv2-glow-orb pointer-events-none"
        style={{ animationDelay: '3s' }}
      />

      <div className="max-w-[1200px] mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div>
            <div className="mb-8">
              <span className="lv2-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm text-white/80">
                <Scissors size={14} className="text-[#EC4899]" />
                Belleza &amp; Bienestar
              </span>
            </div>

            <h1 className="text-[9vw] sm:text-[48px] lg:text-[60px] xl:text-[72px] font-normal leading-[1.05] tracking-[-2px] lg:tracking-[-3px] mb-6">
              <span className="text-white block">Tu sal&oacute;n lleno,</span>
              <span className="text-white/60 block mt-1">tu WhatsApp libre.</span>
            </h1>

            <p className="text-base sm:text-lg text-white/50 max-w-xl mb-8 leading-relaxed tracking-[-0.2px]">
              <WordReveal text="Tus clientes reservan solos desde Instagram. Pagan la seña con Mercado Pago. Vos te dedicás a lo que mejor hacés." />
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-10">
              <Link
                href="/register"
                className="lv2-glow-btn bg-[#EC4899] text-white font-medium px-8 py-3.5 rounded-[10px] text-base flex items-center gap-2"
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
                <Zap size={14} className="text-[#EC4899]" /> Configuraci&oacute;n en 5 min
              </span>
              <span className="flex items-center gap-1.5">
                <Shield size={14} className="text-[#EC4899]" /> Sin tarjeta de cr&eacute;dito
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-[#EC4899]" /> +500 salones activos
              </span>
            </div>
          </div>

          {/* Right: Product mockup */}
          <div className="relative hidden lg:block">
            <div className="lv2-mockup-wrapper relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-[#EC4899]/10">
              <Image
                src="/mockups/belleza-hero.webp"
                alt="Salón Noir — página de reservas con servicios de peluquería y estética"
                width={700}
                height={480}
                className="w-full h-auto"
                priority
              />
            </div>
            {/* Floating metric badge */}
            <div className="absolute -bottom-5 -left-5 bg-black/90 backdrop-blur-xl border border-white/[0.1] rounded-xl px-5 py-3.5 flex items-center gap-3 shadow-xl">
              <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center">
                <TrendingUp size={18} className="text-green-400" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">-80% ausencias</p>
                <p className="text-white/40 text-xs">Con cobro de se&ntilde;as</p>
              </div>
            </div>
            {/* Second floating badge */}
            <div className="absolute -top-3 -right-3 bg-black/90 backdrop-blur-xl border border-white/[0.1] rounded-xl px-5 py-3.5 flex items-center gap-3 shadow-xl">
              <div className="w-9 h-9 rounded-full bg-[#EC4899]/20 flex items-center justify-center">
                <CalendarCheck size={18} className="text-[#EC4899]" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Reservas 24/7</p>
                <p className="text-white/40 text-xs">Desde Instagram y WhatsApp</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-only mockup */}
        <div className="mt-12 lg:hidden">
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-xl shadow-[#EC4899]/10 max-w-md mx-auto">
            <Image
              src="/mockups/belleza-mobile.webp"
              alt="Salón Noir — vista móvil de reservas de belleza"
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
  const c1 = useCountUp(80, 2000);
  const c2 = useCountUp(500, 2500);
  const c3 = useCountUp(25, 2000);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-14 border-y border-white/[0.04] bg-white/[0.01]"
    >
      <div className="max-w-[1200px] mx-auto px-5 lg:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-4">
          <div ref={c1.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              {c1.count}<span className="text-[#EC4899]">%</span>
            </p>
            <p className="text-sm text-white/40 mt-2">Menos ausencias</p>
          </div>
          <div ref={c2.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              +{c2.count}
            </p>
            <p className="text-sm text-white/40 mt-2">Salones activos</p>
          </div>
          <div ref={c3.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              +{c3.count}K
            </p>
            <p className="text-sm text-white/40 mt-2">Reservas gestionadas</p>
          </div>
          <div className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-[#EC4899] tracking-[-2px]">$0</p>
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
          <SectionH2 line1="Tu d&iacute;a, antes y despu&eacute;s" line2="de TurnoLink." />
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
                <span className="absolute top-4 right-6 text-[#EC4899]/[0.08] text-7xl font-bold leading-none pointer-events-none select-none">
                  {step.num}
                </span>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl lv2-icon-glow flex items-center justify-center mb-6">
                    <Icon size={24} className="text-[#EC4899]" />
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
              src="/mockups/belleza-services.webp"
              alt="Servicios de peluquería configurados en TurnoLink"
              width={400}
              height={260}
              className="w-full h-auto"
            />
          </div>
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <Image
              src="/mockups/belleza-mobile.webp"
              alt="Página de reservas de salón de belleza en móvil"
              width={400}
              height={260}
              className="w-full h-auto"
            />
          </div>
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <Image
              src="/mockups/belleza-hero.webp"
              alt="Vista completa del sistema de turnos para salón de belleza"
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
          <SectionH2 line1="Todo lo que necesit&aacute;s" line2="nada que te sobre." />
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
                  <Icon size={22} className="text-[#EC4899]" />
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
          <SectionH2 line1="Para todo el mundo" line2="de la belleza." />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            No importa si ten&eacute;s una peluquer&iacute;a, una barber&iacute;a, un spa o un centro de est&eacute;tica. TurnoLink se adapta a tu rubro.
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
          <SectionH2 line1="&iquest;Cu&aacute;nto te cuestan" line2="las ausencias?" />
          <p className="mt-5 text-white/50 max-w-xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            Hac&eacute; la cuenta. Cada turno vac&iacute;o es plata que no entra. Con se&ntilde;as autom&aacute;ticas, la historia cambia.
          </p>
        </div>

        <div className="lv2-card p-8 sm:p-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            {/* Sin TurnoLink */}
            <div className="text-center p-7 rounded-xl bg-red-500/[0.04] border border-red-500/[0.08]">
              <p className="text-sm text-red-400/70 font-medium mb-5 tracking-tight">Sin cobro de se&ntilde;as</p>
              <div className="space-y-2 text-white/45 text-sm">
                <p>~5 ausencias por semana</p>
                <p>Turno promedio: $8.000</p>
              </div>
              <div className="mt-5 pt-5 border-t border-red-500/[0.08]">
                <p className="text-3xl text-red-400/80 font-normal tracking-[-1.5px]">
                  -$160.000
                </p>
                <p className="text-xs text-red-400/40 mt-1">perdidos por mes</p>
              </div>
            </div>

            {/* Con TurnoLink */}
            <div className="text-center p-7 rounded-xl bg-[#10B981]/[0.06] border border-[#10B981]/[0.15]">
              <p className="text-sm text-[#10B981] font-medium mb-5 tracking-tight">Con TurnoLink</p>
              <div className="space-y-2 text-white/45 text-sm">
                <p>~1 ausencia por semana (-80%)</p>
                <p>Turno promedio: $8.000</p>
              </div>
              <div className="mt-5 pt-5 border-t border-[#10B981]/[0.12]">
                <p className="text-3xl text-[#10B981] font-normal tracking-[-1.5px]">
                  -$32.000
                </p>
                <p className="text-xs text-[#10B981]/50 mt-1">perdidos por mes</p>
              </div>
            </div>
          </div>

          {/* ROI Summary */}
          <div className="text-center border-t border-white/[0.06] pt-8">
            <p className="text-white/50 text-sm mb-2">Recuper&aacute;s</p>
            <p className="text-4xl sm:text-5xl text-white font-normal tracking-[-2px]">
              $128.000<span className="text-lg text-white/30 ml-1">/mes</span>
            </p>
            <p className="text-white/40 text-sm mt-4">
              Plan Profesional: $12.990/mes &mdash;{' '}
              <span className="text-[#10B981] font-medium">ROI de 10x tu inversi&oacute;n</span>
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
                <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#EC4899]/[0.1] border border-[#EC4899]/[0.15] text-xs text-[#EC4899] font-medium">
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
                  <span className="text-[10px] font-bold text-white bg-[#EC4899] px-3 py-1 rounded-md tracking-wide uppercase">
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
                    <Check size={16} className="text-[#EC4899] mt-0.5 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`mt-8 w-full text-center py-3 rounded-[10px] text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  tier.popular
                    ? 'lv2-glow-btn bg-[#EC4899] text-white'
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
            className="text-sm text-[#EC4899] hover:text-[#DB2777] transition-colors duration-300"
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
              Respuestas a las dudas m&aacute;s comunes de due&ntilde;os de salones, barber&iacute;as y centros de est&eacute;tica.
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

export function BellezaLanding() {
  return (
    <div
      className="min-h-screen bg-black text-white selection:bg-[#EC4899]/30 selection:text-white"
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
        headline="Tu sal&oacute;n merece un sistema profesional"
        subtitle="empez&aacute; en 5 minutos."
        description="Cre&aacute; tu cuenta gratis, configur&aacute; tus servicios y empez&aacute; a recibir reservas con cobro autom&aacute;tico. Sin tarjeta de cr&eacute;dito."
      />
      <Footer />
    </div>
  );
}
