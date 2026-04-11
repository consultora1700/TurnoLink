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
  ImageIcon,
  MessageCircle,
  UtensilsCrossed,
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
    title: 'Reservas por WhatsApp que se pierden',
    desc: 'Mensajes que llegan a cualquier hora, reservas que se confunden, mesas que quedan vacías. Tu WhatsApp no es un sistema de reservas.',
  },
  {
    emoji: '📄',
    title: 'Menú en PDF que nadie actualiza',
    desc: 'Precios viejos, platos que ya no están, fotos que no coinciden. Tu carta debería ser tan dinámica como tu cocina.',
  },
  {
    emoji: '🤯',
    title: 'Sin control de caja ni gastos',
    desc: 'Proveedores, insumos, sueldos, delivery. Llegás a fin de mes sin saber cuánto ganaste realmente.',
  },
];

const BEFORE_ITEMS = [
  { time: '11:00', text: '23 mensajes de WhatsApp pidiendo mesa para la noche' },
  { time: '13:00', text: 'Mesa reservada para 6, vinieron 2. No hubo seña' },
  { time: '14:00', text: '"¿Tienen opciones sin TACC?" — lo respondés por décima vez' },
  { time: '20:00', text: 'Doble reserva: anotaste dos grupos a la misma mesa' },
  { time: '23:00', text: 'Cerrás sin saber cuánto facturaste hoy' },
  { time: '00:00', text: 'Seguís respondiendo mensajes para reservas de mañana' },
];

const AFTER_ITEMS = [
  { time: '11:00', text: 'Mesas de la noche ya completas. Reservaron anoche' },
  { time: '13:00', text: 'Todos vinieron. Ya habían pagado seña al reservar' },
  { time: '14:00', text: 'Tu carta digital muestra alérgenos, sin TACC y opciones veganas 24/7' },
  { time: '20:00', text: 'Cada mesa con su horario y comensales. Sin solapamientos' },
  { time: '23:00', text: 'Dashboard con la facturación del día en tiempo real' },
  { time: '00:00', text: 'Descansás. El sistema sigue recibiendo reservas para mañana' },
];

const HOW_IT_WORKS = [
  {
    num: '01',
    icon: CalendarCheck,
    title: 'Configurá tu carta y mesas',
    desc: 'Cargá tu carta con fotos y precios. Configurá mesas, capacidad y turnos de servicio. Listo en 5 minutos.',
  },
  {
    num: '02',
    icon: Share2,
    title: 'Compartí tu link',
    desc: 'Pegá tu link en Instagram, Google Maps y WhatsApp. Tus clientes ven la carta y reservan mesa solos.',
  },
  {
    num: '03',
    icon: CreditCard,
    title: 'Cobrá automáticamente',
    desc: 'Tu cliente paga la seña con Mercado Pago al reservar. Sin no-shows, sin mesas vacías. Plata directo a tu cuenta.',
  },
];

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: CalendarCheck,
    title: 'Reservas de mesas online',
    desc: 'Tus clientes eligen fecha, hora y comensales. Disponibilidad en tiempo real sin solapamientos.',
  },
  {
    icon: ImageIcon,
    title: 'Carta digital con fotos',
    desc: 'Menú visual con fotos, descripciones y precios. Siempre actualizado, sin imprimir nada.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp integrado',
    desc: 'Notificaciones automáticas de confirmación y recordatorio. Tu cliente recibe todo por WhatsApp.',
  },
  {
    icon: CreditCard,
    title: 'Cobro con Mercado Pago',
    desc: 'Seña al reservar o pago total del pedido. Sin excusas, sin ausencias. El dinero va directo a tu cuenta.',
  },
  {
    icon: Shield,
    title: 'Ficha técnica: alérgenos y más',
    desc: 'Indicá alérgenos, opciones sin TACC, veganas y vegetarianas en cada plato. Tu cliente filtra según sus necesidades.',
  },
  {
    icon: TrendingUp,
    title: 'Control financiero',
    desc: 'Caja diaria, gastos, proveedores, insumos. Sabé exactamente cuánto ganás y dónde optimizar.',
  },
  {
    icon: Globe,
    title: 'Página de reservas',
    desc: 'Link personalizado para Instagram, WhatsApp y Google. Tus clientes reservan y ven la carta 24/7.',
  },
  {
    icon: Bell,
    title: 'Recordatorios automáticos',
    desc: 'WhatsApp y email antes de la reserva. Menos no-shows, sin intervención tuya.',
  },
  {
    icon: Users,
    title: 'Gestión de equipo',
    desc: 'Mozos, cocineros, encargados — cada rol con sus permisos y accesos propios.',
  },
  {
    icon: Star,
    title: 'Reseñas verificadas',
    desc: 'Tus clientes dejan reseñas con rating de 1 a 5 estrellas. Confianza que atrae nuevos comensales.',
  },
  {
    icon: BarChart3,
    title: 'Reportes y métricas',
    desc: 'Platos más pedidos, horas pico, ticket promedio, ocupación por día. Datos para crecer.',
  },
  {
    icon: Building2,
    title: 'Multi-sucursal',
    desc: '¿Más de un local? Gestioná todo desde una cuenta con carta y configuración independiente.',
  },
];

const SUB_INDUSTRIES = [
  { name: 'Restaurantes', slug: 'restaurantes' },
  { name: 'Bares', slug: 'bares' },
  { name: 'Cafeterías', slug: 'cafeterias' },
  { name: 'Pizzerías', slug: 'pizzerias' },
  { name: 'Cervecerías', slug: 'cervecerias' },
  { name: 'Heladerías', slug: 'heladerias' },
  { name: 'Food trucks', slug: 'food-trucks' },
  { name: 'Vinotecas', slug: 'vinotecas' },
  { name: 'Panaderías', slug: 'panaderias' },
  { name: 'Rotiserías', slug: 'rotiserias' },
];

const TESTIMONIALS = [
  {
    quote:
      'Desde que usamos TurnoLink, los no-shows bajaron un 75%. La seña automática cambió todo. Nuestros clientes reservan desde Instagram y llegan.',
    name: 'Martín Herrera',
    role: 'Dueño',
    business: 'La Esquina — Restaurante',
    metric: '-75% no-shows',
    image: 'https://randomuser.me/api/portraits/men/10.jpg',
  },
  {
    quote:
      'La carta digital es un golazo. Actualizamos precios y platos del día en 2 minutos. Los clientes ya llegan sabiendo qué pedir.',
    name: 'Valentina Gómez',
    role: 'Encargada',
    business: 'Café Mariposa',
    metric: 'Carta siempre al día',
    image: 'https://randomuser.me/api/portraits/women/10.jpg',
  },
  {
    quote:
      'Gestionamos 2 locales con cartas distintas. Cada sucursal tiene sus mesas, horarios y equipo. TurnoLink nos organizó todo.',
    name: 'Federico Paz',
    role: 'Socio fundador',
    business: 'Birra & Co — Cervecería',
    metric: '2 sucursales',
    image: 'https://randomuser.me/api/portraits/men/11.jpg',
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
      '1 local',
      'Carta digital básica',
      'Página de reservas',
      'Recordatorios básicos',
    ],
  },
  {
    name: 'Profesional',
    price: '$14.999',
    period: '/mes',
    popular: true,
    features: [
      'Reservas ilimitadas',
      'Carta digital con fotos',
      'Cobro de señas con Mercado Pago',
      '1 sucursal',
      'Alérgenos y opciones sin TACC',
      'WhatsApp integrado',
      'Control financiero básico',
      'Reportes básicos',
    ],
  },
  {
    name: 'Business',
    price: '$29.999',
    period: '/mes',
    popular: false,
    features: [
      'Todo de Profesional',
      'Multi-sucursal',
      'Equipo ilimitado',
      'Reportes avanzados',
      'Heatmap de demanda',
      'Dashboard gerencial',
      'Widget embebible',
      'Soporte prioritario',
      'Control financiero completo',
    ],
  },
];

// FAQs moved to ./gastronomia-faqs.ts for server component compatibility
import { GASTRONOMIA_FAQS } from './gastronomia-faqs';
export { GASTRONOMIA_FAQS };

/* ═══════════════════════════════════════════════════════
   ANALYTICS DATA
   ═══════════════════════════════════════════════════════ */

const HEATMAP_DATA = [
  { day: 'Lun', hours: [10, 15, 50, 85, 90, 30, 20, 55, 80, 70] },
  { day: 'Mar', hours: [10, 15, 45, 80, 85, 25, 20, 50, 75, 65] },
  { day: 'Mié', hours: [15, 20, 55, 85, 90, 35, 25, 60, 85, 75] },
  { day: 'Jue', hours: [15, 20, 55, 80, 85, 30, 25, 65, 90, 80] },
  { day: 'Vie', hours: [20, 30, 65, 95, 100, 40, 35, 80, 100, 95] },
  { day: 'Sáb', hours: [25, 35, 70, 100, 100, 45, 40, 85, 100, 100] },
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
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[#F59E0B]/[0.07] blur-[140px] lv2-glow-orb pointer-events-none" />
      <div
        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[#C9A87C]/[0.04] blur-[120px] lv2-glow-orb pointer-events-none"
        style={{ animationDelay: '3s' }}
      />

      <div className="max-w-[900px] mx-auto w-full relative z-10 text-center">
        <div className="mb-8">
          <span className="lv2-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm text-white/80">
            <UtensilsCrossed size={14} className="text-[#F59E0B]" />
            {'Gastronomía'}
          </span>
        </div>

        <h1 className="text-[9vw] sm:text-[48px] lg:text-[60px] xl:text-[72px] font-normal leading-[1.05] tracking-[-2px] lg:tracking-[-3px] mb-6">
          <span className="text-white block">{'Tu restaurante'}</span>
          <span className="text-white/60 block mt-1">{'en una sola app.'}</span>
        </h1>

        <p className="text-base sm:text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed tracking-[-0.2px]">
          <WordReveal text="Reservas de mesas, carta digital con fotos y gestión financiera. Todo integrado." />
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link
            href="/register?industry=gastronomia"
            className="lv2-glow-btn bg-[#F59E0B] text-white font-medium px-8 py-3.5 rounded-[10px] text-base flex items-center gap-2"
          >
            {'Empezar gratis'}
            <ArrowRight size={18} />
          </Link>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="lv2-glass text-white/80 font-medium px-8 py-3.5 rounded-[10px] text-base flex items-center gap-2"
          >
            {'Hablar con ventas'}
            <ArrowRight size={16} />
          </a>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-white/40 mb-14">
          <span className="flex items-center gap-1.5">
            <Zap size={14} className="text-[#F59E0B]" /> {'Configuración en 5 min'}
          </span>
          <span className="flex items-center gap-1.5">
            <Shield size={14} className="text-[#F59E0B]" /> {'Sin tarjeta de crédito'}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={14} className="text-[#F59E0B]" /> {'+55 comercios activos'}
          </span>
        </div>

        {/* Product mockup — desktop screenshot */}
        <div className="relative max-w-4xl mx-auto">
          <div className="lv2-mockup-wrapper relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-[#F59E0B]/10">
            <Image
              src="/mockups/dashboard-dark.webp"
              alt="Dashboard de gestión integral para restaurantes y gastronomía"
              width={900}
              height={560}
              className="w-full h-auto"
              priority
            />
          </div>
          {/* Floating metric badge */}
          <div className="absolute -bottom-5 left-4 lg:-left-5 bg-black/90 backdrop-blur-xl border border-white/[0.1] rounded-xl px-5 py-3.5 flex items-center gap-3 shadow-xl">
            <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center">
              <TrendingUp size={18} className="text-green-400" />
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-medium">{'-75% no-shows'}</p>
              <p className="text-white/40 text-xs">{'Con cobro de señas'}</p>
            </div>
          </div>
          {/* Reviews badge */}
          <div className="absolute -top-3 right-4 lg:-right-3 bg-black/90 backdrop-blur-xl border border-white/[0.1] rounded-xl px-5 py-3.5 flex items-center gap-3 shadow-xl">
            <div className="w-9 h-9 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Star size={18} className="text-yellow-400 fill-yellow-400" />
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-medium">{'4.8★ Reseñas'}</p>
              <p className="text-white/40 text-xs">{'Verificadas por clientes'}</p>
            </div>
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
  const c1 = useCountUp(55, 2000);
  const c2 = useCountUp(500, 2500);
  const c3 = useCountUp(97, 2000);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-14 border-y border-white/[0.04] bg-white/[0.01]"
    >
      <div className="max-w-[1200px] mx-auto px-5 lg:px-10">
        <div className="text-center mb-8">
          <p className="text-white/50 text-base tracking-[-0.2px]">
            {'Más de 40 rubros confían en TurnoLink'}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-10 lg:gap-4">
          <div ref={c1.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              {c1.count}<span className="text-[#F59E0B]">{'+'}</span>
            </p>
            <p className="text-sm text-white/40 mt-2">{'Comercios activos'}</p>
          </div>
          <div ref={c2.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              {c2.count}<span className="text-[#F59E0B]">{'+'}</span>
            </p>
            <p className="text-sm text-white/40 mt-2">{'Reservas gestionadas'}</p>
          </div>
          <div ref={c3.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              {c3.count}<span className="text-[#F59E0B]">{'%+'}</span>
            </p>
            <p className="text-sm text-white/40 mt-2">{'Uptime garantizado'}</p>
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
          <SectionH2 line1="¿Te suena familiar?" line2="No estás solo/a." />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PAIN_POINTS.map((item, i) => (
            <div
              key={i}
              className="lv2-card-stagger lv2-card p-8 hover:bg-[#0A0A0A] transition-colors duration-300 text-center"
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
          <SectionTag text="Transformación" />
          <SectionH2 line1="Tu día, antes y después" line2="de TurnoLink." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ANTES */}
          <div className="lv2-card p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.03] to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-3 h-3 rounded-full bg-red-500/60 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                <h3 className="text-white/80 font-medium text-lg tracking-[-0.5px]">{'Sin TurnoLink'}</h3>
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
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-3 h-3 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                <h3 className="text-white/80 font-medium text-lg tracking-[-0.5px]">{'Con TurnoLink'}</h3>
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
          <SectionTag text="Cómo funciona" />
          <SectionH2 line1="Empezá en 3 pasos." line2="Sin complicaciones." />
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
                <div className="relative z-10 text-center">
                  <div className="w-12 h-12 rounded-xl lv2-icon-glow flex items-center justify-center mb-6 mx-auto">
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

        {/* Mockup row — desktop screenshots */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <Image
              src="/mockups/servicios-dark.webp"
              alt="Panel de carta digital — configurá platos, precios y fotos"
              width={400}
              height={260}
              className="w-full h-auto"
            />
            <div className="p-3 bg-white/[0.02]">
              <p className="text-white/50 text-xs text-center">{'Paso 1 — Configurá tu carta y mesas'}</p>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <Image
              src="/mockups/turnos-dark.webp"
              alt="Vista de reservas y ocupación de mesas"
              width={400}
              height={260}
              className="w-full h-auto"
            />
            <div className="p-3 bg-white/[0.02]">
              <p className="text-white/50 text-xs text-center">{'Paso 2 — Tus clientes reservan solos'}</p>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <Image
              src="/mockups/dashboard-dark.webp"
              alt="Dashboard con resumen de reservas y métricas"
              width={400}
              height={260}
              className="w-full h-auto"
            />
            <div className="p-3 bg-white/[0.02]">
              <p className="text-white/50 text-xs text-center">{'Paso 3 — Controlá todo desde el dashboard'}</p>
            </div>
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
          <SectionH2 line1="Todo lo que necesitás" line2="para tu local gastronómico." />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            {'No es solo un sistema de reservas. Es una plataforma de gestión integral que digitaliza, automatiza y potencia tu negocio gastronómico.'}
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="lv2-card-stagger lv2-card p-7 hover:bg-[#0A0A0A] transition-colors duration-300 text-center"
              >
                <div className="w-11 h-11 rounded-xl lv2-icon-glow flex items-center justify-center mb-5 mx-auto">
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
          <SectionH2 line1="Para todo el mundo" line2="de la gastronomía." />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            {'Sea cual sea tu tipo de local, TurnoLink se adapta a tu operación.'}
          </p>
        </div>

        <div ref={cardsRef} className="flex flex-wrap justify-center gap-3">
          {SUB_INDUSTRIES.map((item, i) => (
            <Link
              key={i}
              href={`/gastronomia/${item.slug}`}
              className="lv2-card-stagger px-5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-[#F59E0B]/20 transition-all duration-300 group"
            >
              <span className="text-white/70 text-sm font-medium tracking-[-0.2px] group-hover:text-white transition-colors">
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SMART ANALYTICS — Heatmap + Carta Digital
   ═══════════════════════════════════════════════════════ */

function SmartAnalyticsSection() {
  const sectionRef = useScrollReveal();

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Inteligencia" />
          <SectionH2 line1="Datos que te hacen" line2="ganar más." />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            {'No adivinés. TurnoLink te muestra dónde está la oportunidad y cómo capturarla.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Heatmap Card */}
          <div className="lv2-card p-6 sm:p-8 relative overflow-hidden">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl lv2-icon-glow flex items-center justify-center">
                <BarChart3 size={20} className="text-[#F59E0B]" />
              </div>
              <div>
                <h3 className="text-white font-medium text-lg tracking-[-0.5px]">{'Heatmap de demanda'}</h3>
                <p className="text-white/40 text-xs">{'Descubrí tus horas pico y tus horarios vacíos'}</p>
              </div>
            </div>

            {/* Mini heatmap visualization */}
            <div className="space-y-2 overflow-x-auto">
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] text-white/30 mb-1 min-w-[320px]">
                <span className="w-8 flex-shrink-0" />
                {['11', '12', '13', '14', '15', '16', '19', '20', '21', '22'].map((h) => (
                  <span key={h} className="flex-1 text-center">{h}</span>
                ))}
              </div>
              {HEATMAP_DATA.map((row) => (
                <div key={row.day} className="flex items-center gap-1.5 sm:gap-2 min-w-[320px]">
                  <span className="w-8 text-[11px] text-white/40 font-mono flex-shrink-0">{row.day}</span>
                  {row.hours.map((val, j) => (
                    <div
                      key={j}
                      className="flex-1 h-5 sm:h-6 rounded-[3px] transition-colors"
                      style={{
                        backgroundColor:
                          val >= 90
                            ? 'rgba(245,158,11,0.6)'
                            : val >= 70
                              ? 'rgba(245,158,11,0.35)'
                              : val >= 50
                                ? 'rgba(245,158,11,0.2)'
                                : val >= 30
                                  ? 'rgba(245,158,11,0.1)'
                                  : 'rgba(255,255,255,0.03)',
                      }}
                    />
                  ))}
                </div>
              ))}
              <div className="flex items-center justify-end gap-3 mt-3 text-[10px] text-white/30">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-white/[0.03]" /> {'Vacío'}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-[#F59E0B]/20" /> {'Medio'}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-[#F59E0B]/60" /> {'Lleno'}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
              <p className="text-white/40 text-[13px] leading-relaxed">
                <span className="text-[#10B981] font-medium">{'Acción:'}</span>
                {' Martes a las 15hs tiene 25% de ocupación. Lanzá un menú ejecutivo con descuento y subilo al 70%.'}
              </p>
            </div>
          </div>

          {/* Carta Digital + Alérgenos Card */}
          <div className="space-y-6">
            {/* Carta Digital */}
            <div className="lv2-card p-6 sm:p-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl lv2-icon-glow flex items-center justify-center">
                  <ImageIcon size={20} className="text-[#F59E0B]" />
                </div>
                <div>
                  <h3 className="text-white font-medium text-lg tracking-[-0.5px]">{'Carta digital inteligente'}</h3>
                  <p className="text-white/40 text-xs">{'Actualizá precios y platos en tiempo real'}</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Milanesa napolitana', price: '$12.500', tag: 'Popular' },
                  { name: 'Ensalada Caesar', price: '$8.900', tag: 'Veggie' },
                  { name: 'Lomo al champignon', price: '$18.000', tag: 'Premium' },
                ].map((plato, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.05]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-white/60 text-[13px]">{plato.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F59E0B]/[0.12] border border-[#F59E0B]/[0.2] text-[#F59E0B] font-medium">
                        {plato.tag}
                      </span>
                    </div>
                    <span className="text-white/50 text-sm font-mono">{plato.price}</span>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-white/35 text-[13px] text-center">
                {'Tu cliente escanea el QR y ve la carta completa con fotos. Actualizá precios sin reimprimir.'}
              </p>
            </div>

            {/* Alérgenos */}
            <div className="lv2-card p-6 sm:p-8">
              <div className="flex items-center justify-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl lv2-icon-glow flex items-center justify-center">
                  <Shield size={20} className="text-[#F59E0B]" />
                </div>
                <div>
                  <h3 className="text-white font-medium text-lg tracking-[-0.5px]">{'Alérgenos y restricciones'}</h3>
                  <p className="text-white/40 text-xs">{'Información clara para cada comensal'}</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  { label: 'Sin TACC / Apto celíacos', type: 'Filtro' },
                  { label: 'Vegano / Vegetariano', type: 'Filtro' },
                  { label: 'Sin lactosa', type: 'Filtro' },
                  { label: 'Contiene frutos secos', type: 'Alerta' },
                ].map((field, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]"
                  >
                    <span className="text-white/60 text-[13px]">{field.label}</span>
                    <span className="text-white/25 text-[11px] font-mono hidden sm:block">{field.type}</span>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-white/35 text-[13px] text-center">
                {'Tu comensal filtra la carta según sus restricciones alimentarias. '}
                <span className="text-[#10B981]">{'Menos errores, más confianza.'}</span>
              </p>
            </div>
          </div>
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
          <SectionTag text="Números" />
          <SectionH2 line1="¿Cuánto te cuestan" line2="los no-shows?" />
          <p className="mt-5 text-white/50 max-w-xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            {'Hacé la cuenta. Cada mesa vacía es plata que no entra. Con señas automáticas, la historia cambia.'}
          </p>
        </div>

        <div className="lv2-card p-6 sm:p-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            {/* Sin TurnoLink */}
            <div className="text-center p-6 sm:p-7 rounded-xl bg-red-500/[0.04] border border-red-500/[0.08]">
              <p className="text-sm text-red-400/70 font-medium mb-5 tracking-tight">{'Sin cobro de señas'}</p>
              <div className="space-y-2 text-white/45 text-sm">
                <p>{'~8 no-shows por semana'}</p>
                <p>{'Mesa promedio: $25.000'}</p>
              </div>
              <div className="mt-5 pt-5 border-t border-red-500/[0.08]">
                <p className="text-3xl text-red-400/80 font-normal tracking-[-1.5px]">
                  {'-$800.000'}
                </p>
                <p className="text-xs text-red-400/40 mt-1">{'perdidos por mes'}</p>
              </div>
            </div>

            {/* Con TurnoLink */}
            <div className="text-center p-6 sm:p-7 rounded-xl bg-[#10B981]/[0.06] border border-[#10B981]/[0.15]">
              <p className="text-sm text-[#10B981] font-medium mb-5 tracking-tight">{'Con TurnoLink'}</p>
              <div className="space-y-2 text-white/45 text-sm">
                <p>{'~2 no-shows por semana (-75%)'}</p>
                <p>{'Mesa promedio: $25.000'}</p>
              </div>
              <div className="mt-5 pt-5 border-t border-[#10B981]/[0.12]">
                <p className="text-3xl text-[#10B981] font-normal tracking-[-1.5px]">
                  {'-$200.000'}
                </p>
                <p className="text-xs text-[#10B981]/50 mt-1">{'perdidos por mes'}</p>
              </div>
            </div>
          </div>

          {/* ROI Summary */}
          <div className="text-center border-t border-white/[0.06] pt-8">
            <p className="text-white/50 text-sm mb-2">{'Recuperás'}</p>
            <p className="text-4xl sm:text-5xl text-white font-normal tracking-[-2px]">
              {'$600.000'}<span className="text-lg text-white/30 ml-1">{'/mes'}</span>
            </p>
            <p className="text-white/40 text-sm mt-4">
              {'Plan Profesional: $14.999/mes — '}
              <span className="text-[#10B981] font-medium">{'ROI de 40x tu inversión'}</span>
            </p>
          </div>

          {/* Additional ROI */}
          <div className="mt-8 pt-6 border-t border-white/[0.06]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg text-white font-normal tracking-[-0.5px]">{'-75%'}</p>
                <p className="text-white/30 text-xs mt-1">{'No-shows con señas'}</p>
              </div>
              <div>
                <p className="text-lg text-white font-normal tracking-[-0.5px]">{'+40%'}</p>
                <p className="text-white/30 text-xs mt-1">{'Ocupación con promos'}</p>
              </div>
              <div>
                <p className="text-lg text-white font-normal tracking-[-0.5px]">{'$0'}</p>
                <p className="text-white/30 text-xs mt-1">{'Costo de carta impresa'}</p>
              </div>
            </div>
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
            <div key={i} className="lv2-card-stagger lv2-card p-8 flex flex-col text-center">
              {/* Metric badge */}
              <div className="mb-5">
                <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#F59E0B]/[0.1] border border-[#F59E0B]/[0.15] text-xs text-[#F59E0B] font-medium">
                  {t.metric}
                </span>
              </div>

              <div className="flex gap-0.5 justify-center mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              <p className="text-white/50 text-[15px] leading-[26px] tracking-[-0.2px] flex-1 mb-6">
                {'"'}{t.quote}{'"'}
              </p>

              <div className="border-t border-white/[0.06] pt-4 flex items-center gap-3">
                {t.image && (
                  <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" loading="lazy" />
                )}
                <div>
                  <p className="text-white font-medium text-sm tracking-tight">{t.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {t.role} {' · '} {t.business}
                  </p>
                </div>
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

function PricingSection({ tiers }: { tiers: PricingTier[] }) {
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
            {'Empezá gratis y escalá cuando lo necesites. Sin compromiso, sin tarjeta de crédito.'}
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`lv2-card-stagger lv2-card p-8 flex flex-col text-center ${
                tier.popular ? 'lv2-pricing-popular' : ''
              }`}
            >
              {tier.popular && (
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-white bg-[#F59E0B] px-3 py-1 rounded-md tracking-wide uppercase">
                    {'Más elegido'}
                  </span>
                </div>
              )}
              <h3 className="text-white font-medium text-xl tracking-[-0.5px] mb-2">{tier.name}</h3>
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-white text-3xl font-normal tracking-[-2px]">{tier.price}</span>
                <span className="text-white/30 text-sm">{tier.period}</span>
              </div>
              <div className="lv2-glass-line w-full my-5" />
              <ul className="space-y-3 flex-1 text-left">
                {tier.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-white/60">
                    <Check size={16} className="text-[#F59E0B] mt-0.5 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/register?industry=gastronomia"
                className={`mt-8 w-full text-center py-3 rounded-[10px] text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  tier.popular
                    ? 'lv2-glow-btn bg-[#F59E0B] text-white'
                    : 'bg-white/[0.06] text-white/80 hover:bg-white/[0.12] border border-white/[0.08]'
                }`}
              >
                {tier.price === '$0' ? 'Empezar gratis' : 'Probar 14 días gratis'}
                <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-white/25 text-sm mt-10 flex items-center justify-center gap-2">
          <Shield size={14} />
          {'Plan Gratis permanente. 14 días de prueba en planes pagos. Sin tarjeta de crédito.'}
        </p>
        <p className="text-center mt-4">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#F59E0B] hover:text-[#D97706] transition-colors duration-300"
          >
            {'¿Necesitás ayuda para elegir? Hablá con nuestro equipo →'}
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
      <div className="max-w-[900px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="FAQ" />
          <SectionH2 line1="Preguntas" line2="frecuentes." />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-[15px] leading-relaxed tracking-[-0.2px]">
            {'Respuestas a las dudas más comunes de locales gastronómicos.'}
          </p>
        </div>

          <div className="space-y-3">
            {GASTRONOMIA_FAQS.map((faq, i) => {
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
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════ */

interface PricingTier {
  name: string;
  price: string;
  period: string;
  popular?: boolean;
  features: string[];
}

export function GastronomiaLanding({ dynamicPricing }: { dynamicPricing?: PricingTier[] } = {}) {
  const pricingTiers = dynamicPricing || PRICING_TIERS;
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
      <SmartAnalyticsSection />
      <ROISection />
      <TestimonialsSection />
      <PricingSection tiers={pricingTiers} />
      <FAQSection />
      <CTASection
        headline="Tu local merece más que un cuaderno de reservas"
        subtitle="empezá en 5 minutos."
        description="Creá tu cuenta gratis, cargá tu carta y empezá a recibir reservas con cobro automático. Carta digital, alérgenos, finanzas y más. Todo en un lugar."
      />
      <Footer />
    </div>
  );
}
