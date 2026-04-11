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
  Sparkles,
  Tag,
  ClipboardList,
  Package,
  Code2,
  Crown,
  Search,
  Clock,
  Flame,
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
    desc: 'Respondés mensajes todo el día para coordinar turnos. Mientras tanto, perdés tiempo que podrías dedicar a atender clientes.',
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
  { time: '09:30', text: 'Cliente no vino. No avisó. Turno vacío' },
  { time: '11:00', text: '"¿Cuánto sale?" — lo respondés por vigésima vez' },
  { time: '14:00', text: 'Doble turno: anotaste dos personas a la misma hora' },
  { time: '18:00', text: 'Cerrás sin saber cuánto facturaste hoy' },
  { time: '22:00', text: 'Seguís respondiendo mensajes desde tu casa' },
];

const AFTER_ITEMS = [
  { time: '08:00', text: 'Turnos del día completos. Reservaron anoche' },
  { time: '09:30', text: 'Todos vinieron. Ya habían pagado seña' },
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
    desc: 'Cargá tus servicios con duraciones y precios. Agregá tu equipo si tenés. Listo en 5 minutos.',
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
    desc: 'Tu cliente paga la seña con Mercado Pago al reservar. Sin excusas, sin ausencias. Plata directo a tu cuenta.',
  },
];

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: CalendarCheck,
    title: 'Agenda inteligente',
    desc: 'Cada servicio con su duración, precio y profesional. Sin solapamientos ni dobles turnos.',
  },
  {
    icon: CreditCard,
    title: 'Cobro de señas',
    desc: 'Tu cliente reserva y paga con Mercado Pago. Sin excusas. El dinero va directo a tu cuenta.',
  },
  {
    icon: Users,
    title: 'Gestión de equipo',
    desc: 'Cada profesional con su agenda, servicios y horarios propios. Asignación automática o por elección del cliente.',
  },
  {
    icon: Crown,
    title: 'Tarifas por seniority',
    desc: 'Junior, Senior, Master — cada nivel con su precio. Cobrá más por tus mejores profesionales sin cambiar nada.',
  },
  {
    icon: Star,
    title: 'Ficha de clientes',
    desc: 'Historial completo: servicios, pagos, preferencias, alergias y notas. Conocé y fidelizá.',
  },
  {
    icon: ClipboardList,
    title: 'Formularios pre-turno',
    desc: '¿Alergias? ¿Preferencias? ¿Foto de referencia? Tu cliente completa todo antes de llegar.',
  },
  {
    icon: Globe,
    title: 'Página de reservas',
    desc: 'Link personalizado para Instagram, WhatsApp y Google. Tus clientes reservan solos, 24/7.',
  },
  {
    icon: Bell,
    title: 'Recordatorios automáticos',
    desc: 'WhatsApp y email antes del turno. Menos olvidos, menos ausencias, sin intervención tuya.',
  },
  {
    icon: Tag,
    title: 'Promociones con límite',
    desc: 'Creá promos con cupo: "Solo 20 turnos". El contador genera urgencia y llena horarios vacíos.',
  },
  {
    icon: Package,
    title: 'Packs de sesiones',
    desc: 'Paquetes de sesiones prepagos. Cobrá por adelantado, fidelizá y asegurá el flujo de caja.',
  },
  {
    icon: BarChart3,
    title: 'Reportes y métricas',
    desc: 'Facturación, horas pico, servicios más pedidos, ocupación por profesional. Datos para crecer.',
  },
  {
    icon: Building2,
    title: 'Multi-sucursal',
    desc: '¿Más de un local? Gestioná todo desde una cuenta con configuración independiente.',
  },
];

const SUB_INDUSTRIES = [
  { name: 'Peluquerías', slug: 'peluquerias' },
  { name: 'Barberías', slug: 'barberias' },
  { name: 'Centros de estética', slug: 'centros-de-estetica' },
  { name: 'Uñas & Nail bars', slug: 'unas-nail-bars' },
  { name: 'Pestañas & Cejas', slug: 'pestanas-cejas' },
  { name: 'Depilación', slug: 'depilacion' },
  { name: 'Spa & Relax', slug: 'spa-relax' },
  { name: 'Masajes', slug: 'masajes' },
  { name: 'Bronceado', slug: 'bronceado' },
  { name: 'Cosmetología', slug: 'cosmetologia' },
];

const TESTIMONIALS = [
  {
    quote:
      'Desde que usamos TurnoLink, las ausencias bajaron un 80%. El cobro de seña automático cambió todo. Mis clientas reservan solas desde Instagram.',
    name: 'Mariana López',
    role: 'Dueña',
    business: 'Estudio MR — Peluquería',
    metric: '-80% ausencias',
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    quote:
      'Antes perdía 3 horas por día en WhatsApp coordinando turnos. Ahora mis clientes reservan solos y yo me enfoco en lo que hago.',
    name: 'Lucas Fernández',
    role: 'Barbero',
    business: 'Barber Shop LF',
    metric: '3hs/día ahorradas',
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    quote:
      'Gestionamos 3 gabinetes con 6 profesionales. Cada una tiene su agenda y sus servicios. TurnoLink nos organizó el centro completo.',
    name: 'Carolina Ruiz',
    role: 'Directora',
    business: 'Spa Esencia',
    metric: '6 profesionales',
    image: 'https://randomuser.me/api/portraits/women/2.jpg',
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
    price: '$14.999',
    period: '/mes',
    popular: true,
    features: [
      'Reservas ilimitadas',
      'Hasta 5 profesionales',
      'Cobro de señas con Mercado Pago',
      '1 sucursal',
      'Ficha de cliente',
      'Formularios pre-turno',
      'Promociones con límite',
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
      'Profesionales ilimitados',
      'Multi-sucursal',
      'Tarifas por seniority',
      'Heatmap de horas pico',
      'Reportes avanzados',
      'Widget embebible',
      'Soporte prioritario',
      'Dashboard gerencial',
    ],
  },
];

// FAQs moved to ./belleza-faqs.ts for server component compatibility
import { BELLEZA_FAQS } from './belleza-faqs';
export { BELLEZA_FAQS };

/* ═══════════════════════════════════════════════════════
   PROMO SHOWCASE DATA
   ═══════════════════════════════════════════════════════ */

const PROMO_EXAMPLES = [
  {
    title: 'Happy Hour — Horarios valle',
    originalPrice: '$35.000',
    promoPrice: '$24.500',
    badge: 'Quedan 6 lugares',
    schedule: 'Lun a Mié, 9 a 12hs',
    impact: 'Ocupación +60%',
  },
  {
    title: 'Promo Lanzamiento',
    originalPrice: '$50.000',
    promoPrice: '$35.000',
    badge: 'Quedan 3 lugares',
    schedule: 'Solo 20 turnos',
    impact: '20 reservas en 48hs',
  },
  {
    title: 'Pack 5 Sesiones',
    originalPrice: '$25.000',
    promoPrice: '$18.000',
    badge: 'Ahorro $7.000',
    schedule: 'Sin vencimiento',
    impact: 'Clientes fidelizados',
  },
];

/* ═══════════════════════════════════════════════════════
   PRODUCT SHOWCASE — NAIPE (card deck swap) DATA
   ═══════════════════════════════════════════════════════ */

const BELLEZA_SHOWCASE_SETS = [
  {
    id: 'salon-noir', label: 'Salon Noir',
    heroImg: '/mockups/turnos-dark.webp',
    images: [
      '/mockups/flow-01-portada.webp',
      '/mockups/flow-04-calendario.webp',
      '/mockups/flow-06-formulario.webp',
      '/mockups/flow-07-confirmacion.webp',
      '/mockups/booking-services-dark.webp',
      '/mockups/clientes-dark.webp',
      '/mockups/videollamadas-dark.webp',
    ],
  },
  {
    id: 'barber-club', label: 'The Barber Club',
    heroImg: '/mockups/set1/turnos.webp',
    images: [
      '/mockups/set1/portada.webp',
      '/mockups/set1/calendario.webp',
      '/mockups/set1/formulario.webp',
      '/mockups/set1/confirmacion.webp',
      '/mockups/set1/servicios.webp',
      '/mockups/set1/clientes.webp',
      '/mockups/set1/videollamadas.webp',
    ],
  },
  {
    id: 'nails-and-co', label: 'Nails & Co',
    heroImg: '/mockups/set2/turnos.webp',
    images: [
      '/mockups/set2/portada.webp',
      '/mockups/set2/calendario.webp',
      '/mockups/set2/formulario.webp',
      '/mockups/set2/confirmacion.webp',
      '/mockups/set2/servicios.webp',
      '/mockups/set2/clientes.webp',
      '/mockups/set2/videollamadas.webp',
    ],
  },
  {
    id: 'ink-master', label: 'Ink Master Studio',
    heroImg: '/mockups/set3/turnos.webp',
    images: [
      '/mockups/set3/portada.webp',
      '/mockups/set3/calendario.webp',
      '/mockups/set3/formulario.webp',
      '/mockups/set3/confirmacion.webp',
      '/mockups/set3/servicios.webp',
      '/mockups/set3/clientes.webp',
      '/mockups/set3/videollamadas.webp',
    ],
  },
];

const BELLEZA_CARD_META = [
  { title: 'Página de reservas pública', subtitle: 'Link personalizado', desc: 'Tu link donde tus clientes ven servicios, eligen horarios y reservan.', badge: null },
  { title: 'Calendario inteligente', subtitle: 'Tiempo real', desc: 'Disponibilidad en tiempo real sin solapamientos. Se actualiza automáticamente.', badge: 'PRO' as const },
  { title: 'Formulario + datos del cliente', subtitle: 'Captura de datos', desc: 'Toda la información que necesitás antes de confirmar la reserva.', badge: null },
  { title: 'Confirmación + cobro instantáneo', subtitle: 'Pago automático', desc: 'Pago de seña vía Mercado Pago. Confirmación automática al cliente.', badge: 'PRO' as const },
  { title: 'Servicios con fotos y precios', subtitle: 'Catálogo visual', desc: 'Tus servicios con imágenes, duración y precios. Tu cliente elige sin preguntarte.', badge: null },
  { title: 'Clientes / Fichas / Historial', subtitle: 'CRM integrado', desc: 'Base completa con historial, notas, fotos adjuntas, pagos y asistencia de cada cliente.', badge: null },
  { title: 'Sesiones online con Zoom y Meet', subtitle: 'Videollamadas', desc: 'Link de Zoom o Google Meet automático al confirmar. Ideal para asesorías de imagen.', badge: 'PRO' as const },
];

/* ═══════════════════════════════════════════════════════
   ANALYTICS DATA
   ═══════════════════════════════════════════════════════ */

const HEATMAP_DATA = [
  { day: 'Lun', hours: [20, 35, 60, 80, 90, 70, 45, 30, 25, 15] },
  { day: 'Mar', hours: [15, 30, 55, 75, 85, 65, 50, 35, 20, 10] },
  { day: 'Mié', hours: [25, 40, 65, 85, 95, 75, 55, 40, 30, 20] },
  { day: 'Jue', hours: [10, 20, 40, 55, 60, 45, 30, 25, 15, 10] },
  { day: 'Vie', hours: [30, 50, 75, 90, 100, 95, 80, 60, 45, 30] },
  { day: 'Sáb', hours: [45, 65, 90, 100, 100, 95, 85, 70, 50, 35] },
];

const SENIORITY_TIERS = [
  { level: 'Junior', price: '$8.000', color: 'text-white/50', bar: 'w-[30%]' },
  { level: 'Senior', price: '$15.000', color: 'text-white/70', bar: 'w-[56%]' },
  { level: 'Master', price: '$25.000', color: 'text-[#EC4899]', bar: 'w-[93%]' },
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

      <div className="max-w-[900px] mx-auto w-full relative z-10 text-center">
        <div className="mb-8">
          <span className="lv2-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm text-white/80">
            <Scissors size={14} className="text-[#EC4899]" />
            {'Belleza & Bienestar'}
          </span>
        </div>

        <h1 className="text-[9vw] sm:text-[48px] lg:text-[60px] xl:text-[72px] font-normal leading-[1.05] tracking-[-2px] lg:tracking-[-3px] mb-6">
          <span className="text-white block">{'Tu agenda llena,'}</span>
          <span className="text-white/60 block mt-1">{'tu WhatsApp libre.'}</span>
        </h1>

        <p className="text-base sm:text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed tracking-[-0.2px]">
          <WordReveal text="Tus clientes reservan solos desde Instagram. Pagan la seña con Mercado Pago. Vos te dedicás a lo que mejor hacés." />
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link
            href="/register?industry=belleza"
            className="lv2-glow-btn bg-[#EC4899] text-white font-medium px-8 py-3.5 rounded-[10px] text-base flex items-center gap-2"
          >
            {'Empezar gratis ahora'}
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
            <Zap size={14} className="text-[#EC4899]" /> {'Configuración en 5 min'}
          </span>
          <span className="flex items-center gap-1.5">
            <Shield size={14} className="text-[#EC4899]" /> {'Sin tarjeta de crédito'}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={14} className="text-[#EC4899]" /> {'+500 negocios activos'}
          </span>
        </div>

        {/* Product mockup — desktop screenshot */}
        <div className="relative max-w-4xl mx-auto">
          <div className="lv2-mockup-wrapper relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-[#EC4899]/10">
            <Image
              src="/mockups/dashboard-dark.webp"
              alt="Dashboard de gestión integral para negocios de belleza"
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
              <p className="text-white text-sm font-medium">{'-80% ausencias'}</p>
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
  const c1 = useCountUp(80, 2000);
  const c2 = useCountUp(500, 2500);
  const c3 = useCountUp(25, 2000);
  const c4 = useCountUp(35, 2000);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-14 border-y border-white/[0.04] bg-white/[0.01]"
    >
      <div className="max-w-[1200px] mx-auto px-5 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-4">
          <div ref={c1.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              {c1.count}<span className="text-[#EC4899]">{'%'}</span>
            </p>
            <p className="text-sm text-white/40 mt-2">{'Menos ausencias'}</p>
          </div>
          <div ref={c2.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              +{c2.count}
            </p>
            <p className="text-sm text-white/40 mt-2">{'Negocios activos'}</p>
          </div>
          <div ref={c3.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              +{c3.count}K
            </p>
            <p className="text-sm text-white/40 mt-2">{'Reservas gestionadas'}</p>
          </div>
          <div ref={c4.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              +{c4.count}<span className="text-[#EC4899]">{'%'}</span>
            </p>
            <p className="text-sm text-white/40 mt-2">{'Ticket promedio con seniority'}</p>
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
                <span className="absolute top-4 right-6 text-[#EC4899]/[0.08] text-7xl font-bold leading-none pointer-events-none select-none">
                  {step.num}
                </span>
                <div className="relative z-10 text-center">
                  <div className="w-12 h-12 rounded-xl lv2-icon-glow flex items-center justify-center mb-6 mx-auto">
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

        {/* Mockup row — desktop screenshots */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <Image
              src="/mockups/servicios-dark.webp"
              alt="Panel de servicios — configurá servicios, precios y duración"
              width={400}
              height={260}
              className="w-full h-auto"
            />
            <div className="p-3 bg-white/[0.02]">
              <p className="text-white/50 text-xs text-center">{'Paso 1 — Configurá tus servicios'}</p>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <Image
              src="/mockups/turnos-dark.webp"
              alt="Vista de turnos y agenda semanal"
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
              alt="Dashboard con resumen de turnos y métricas"
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
   FEATURES (expanded to 12)
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
          <SectionH2 line1="Todo lo que necesitás" line2="para crecer tu negocio." />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            {'No es solo un sistema de turnos. Es una plataforma de gestión integral que digitaliza, automatiza y potencia tu negocio de belleza.'}
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
   PROMO SHOWCASE (NEW)
   ═══════════════════════════════════════════════════════ */

function PromoShowcase() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 150);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Promociones" />
          <SectionH2 line1="Llená horarios muertos" line2="con promos inteligentes." />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            {'Creá promociones con cupo limitado y el sistema genera urgencia automática. "Quedan 3 lugares" convierte un lunes vacío en un lunes lleno.'}
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
          <div className="lv2-card p-6 text-center">
            <div className="w-10 h-10 rounded-lg bg-[#EC4899]/10 flex items-center justify-center mx-auto mb-4">
              <Flame size={18} className="text-[#EC4899]" />
            </div>
            <p className="text-white font-medium text-sm mb-1">{'Happy Hour'}</p>
            <p className="text-white/40 text-[13px]">{'Descuentos en horarios de baja demanda. La ocupación pasa del 20% al 80%.'}</p>
          </div>
          <div className="lv2-card p-6 text-center">
            <div className="w-10 h-10 rounded-lg bg-[#EC4899]/10 flex items-center justify-center mx-auto mb-4">
              <Clock size={18} className="text-[#EC4899]" />
            </div>
            <p className="text-white font-medium text-sm mb-1">{'Cupos en tiempo real'}</p>
            <p className="text-white/40 text-[13px]">{'Cuando tu cliente ve "quedan 3", la conversión sube 40-60%.'}</p>
          </div>
          <div className="lv2-card p-6 text-center">
            <div className="w-10 h-10 rounded-lg bg-[#EC4899]/10 flex items-center justify-center mx-auto mb-4">
              <Package size={18} className="text-[#EC4899]" />
            </div>
            <p className="text-white font-medium text-sm mb-1">{'Packs de sesiones'}</p>
            <p className="text-white/40 text-[13px]">{'Paquetes de múltiples sesiones. Cobrás por adelantado y fidelizás.'}</p>
          </div>
        </div>

        {/* Promo cards */}
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {PROMO_EXAMPLES.map((promo, i) => (
            <div
              key={i}
              className="lv2-card-stagger lv2-card p-6 hover:bg-[#0A0A0A] transition-colors duration-300 text-center"
            >
              <h4 className="text-white font-medium text-base tracking-[-0.3px] mb-2">{promo.title}</h4>
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#EC4899]/[0.12] border border-[#EC4899]/[0.2] text-[11px] text-[#EC4899] font-medium mb-3">
                {promo.badge}
              </span>
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="text-white/30 line-through text-sm">{promo.originalPrice}</span>
                <span className="text-[#10B981] font-medium text-lg">{promo.promoPrice}</span>
              </div>
              <div className="text-white/30 text-xs mb-1">{promo.schedule}</div>
              <div className="text-[#10B981]/70 text-xs font-medium">{promo.impact}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   PRODUCT SHOWCASE — NAIPE (card deck swap)
   ═══════════════════════════════════════════════════════ */

function ProductShowcaseSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 200);

  // Naipe system: two layers (top=front, bottom=back peeking)
  const [topIdx, setTopIdx] = useState(0);
  const [bottomIdx, setBottomIdx] = useState(1);
  const [swapping, setSwapping] = useState(false);
  const lockRef = useRef(false);
  const topRef = useRef(0);
  const facesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => { topRef.current = topIdx; }, [topIdx]);

  const resetAfterSwap = useCallback((newTopIdx: number) => {
    facesRef.current.forEach(el => { if (el) el.style.transition = 'none'; });
    setTopIdx(newTopIdx);
    setBottomIdx((newTopIdx + 1) % BELLEZA_SHOWCASE_SETS.length);
    setSwapping(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        facesRef.current.forEach(el => { if (el) el.style.transition = ''; });
        lockRef.current = false;
      });
    });
  }, []);

  const handleCycle = useCallback(() => {
    if (lockRef.current) return;
    lockRef.current = true;
    setSwapping(true);
    const next = (topRef.current + 1) % BELLEZA_SHOWCASE_SETS.length;
    setTimeout(() => resetAfterSwap(next), 380);
  }, [resetAfterSwap]);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-8">
          <SectionTag text="Así se ve tu negocio" />
          <SectionH2 line1="Tocá las imágenes" line2="y descubrí distintos rubros." />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            {'Peluquerías, barberías, nail studios, centros de estética — cada negocio tiene su propia identidad. Tocá cualquier tarjeta para ver cómo se ve.'}
          </p>
        </div>

        {/* Business selector pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {BELLEZA_SHOWCASE_SETS.map((set, i) => (
            <button
              key={set.id}
              onClick={handleCycle}
              className={`px-4 py-1.5 rounded-full text-sm transition-all duration-300 ${
                topIdx === i
                  ? 'bg-[#EC4899]/20 border border-[#EC4899]/30 text-[#EC4899]'
                  : 'bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white/80'
              }`}
            >
              {set.label}
            </button>
          ))}
        </div>

        {/* Hero — naipe dual layer */}
        <div className="mb-8">
          <div className="lv2-mockup-wrapper">
            <div className="lv2-mockup-frame relative">
              {/* Browser chrome bar */}
              <div className="bg-[#0D0D0D] px-4 py-3 flex items-center gap-2 border-b border-white/[0.06]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                </div>
                <div className="flex-1 mx-8">
                  <div className="bg-white/[0.05] rounded-md h-6 max-w-xs mx-auto flex items-center justify-center">
                    <span className="text-[11px] text-white/30 tracking-tight">
                      turnolink.com.ar/{BELLEZA_SHOWCASE_SETS[topIdx].id}
                    </span>
                  </div>
                </div>
              </div>
              <div className="lv2-img-zoom relative">
                {/* Back hero (peeking) */}
                <div
                  ref={el => { facesRef.current[14] = el; }}
                  className={`absolute inset-0 lv2-hero-face ${swapping ? 'lv2-hero-front' : 'lv2-hero-back'}`}
                >
                  <Image
                    src={BELLEZA_SHOWCASE_SETS[bottomIdx].heroImg}
                    alt={`TurnoLink — ${BELLEZA_SHOWCASE_SETS[bottomIdx].label}`}
                    width={1200}
                    height={700}
                    className="w-full h-auto"
                  />
                </div>
                {/* Front hero */}
                <div
                  ref={el => { facesRef.current[15] = el; }}
                  className={`relative lv2-hero-face ${swapping ? 'lv2-hero-back' : 'lv2-hero-front'}`}
                >
                  <Image
                    src={BELLEZA_SHOWCASE_SETS[topIdx].heroImg}
                    alt={`TurnoLink — ${BELLEZA_SHOWCASE_SETS[topIdx].label}`}
                    width={1200}
                    height={700}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards grid */}
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BELLEZA_CARD_META.map((f, i) => (
            <div
              key={i}
              role="button"
              tabIndex={0}
              onClick={handleCycle}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCycle(); } }}
              className="lv2-card-stagger lv2-feature-card lv2-showcase-card group block"
            >
              <div className="rounded-[16px]">
                {/* Image naipe stack */}
                <div className="aspect-[16/10] relative">
                  {/* Back face (peeking behind) */}
                  <div
                    ref={el => { facesRef.current[i * 2] = el; }}
                    className={`absolute inset-0 lv2-naipe-face ${swapping ? 'lv2-naipe-front' : 'lv2-naipe-back'}`}
                  >
                    <Image
                      src={BELLEZA_SHOWCASE_SETS[bottomIdx].images[i]}
                      alt={f.title}
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                  {/* Front face */}
                  <div
                    ref={el => { facesRef.current[i * 2 + 1] = el; }}
                    className={`absolute inset-0 lv2-naipe-face ${swapping ? 'lv2-naipe-back' : 'lv2-naipe-front'}`}
                  >
                    <Image
                      src={BELLEZA_SHOWCASE_SETS[topIdx].images[i]}
                      alt={f.title}
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                </div>
                {/* Card text */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg lv2-icon-glow flex items-center justify-center flex-shrink-0">
                      <Scissors size={16} className="text-[#EC4899]" />
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <h3 className="text-white font-medium text-[16px] tracking-[-0.5px] truncate">{f.title}</h3>
                      {f.badge && (
                        <span className="text-[10px] font-bold text-white bg-[#EC4899] px-2 py-0.5 rounded-md tracking-wide uppercase flex-shrink-0">
                          {f.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-white/40 text-xs mb-2">{f.subtitle}</p>
                  <p className="text-white/50 text-[14px] leading-[22px] tracking-[-0.2px]">{f.desc}</p>
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
   BRANDED PAGE + REVIEWS + WIDGET (NEW)
   ═══════════════════════════════════════════════════════ */

function BrandedPageSection() {
  const sectionRef = useScrollReveal();
  const imgRef = useImageReveal();

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Presencia digital" />
          <SectionH2 line1="Tu propia web" line2="con tu marca, lista en 5 min." />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            {'No es un simple link. Es una página profesional con tu logo, colores, portfolio de servicios y reseñas de clientes. Los negocios con página de reservas reciben '}
            <span className="text-white font-medium">{'3x más reservas'}</span>
            {' que los que solo usan WhatsApp.'}
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
          <div className="lv2-card p-6 text-center">
            <div className="w-10 h-10 rounded-lg bg-[#EC4899]/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles size={18} className="text-[#EC4899]" />
            </div>
            <p className="text-white font-medium text-sm mb-1">{'Branding completo'}</p>
            <p className="text-white/40 text-[13px]">{'Tu logo, colores, tipografía, cover, banner y texto de bienvenida.'}</p>
          </div>
          <div className="lv2-card p-6 text-center">
            <div className="w-10 h-10 rounded-lg bg-[#EC4899]/10 flex items-center justify-center mx-auto mb-4">
              <Star size={18} className="text-[#EC4899]" />
            </div>
            <p className="text-white font-medium text-sm mb-1">{'Reseñas verificadas'}</p>
            <p className="text-white/40 text-[13px]">{'Rating de 1 a 5 estrellas con comentarios. Confianza que convierte.'}</p>
          </div>
          <div className="lv2-card p-6 text-center">
            <div className="w-10 h-10 rounded-lg bg-[#EC4899]/10 flex items-center justify-center mx-auto mb-4">
              <Code2 size={18} className="text-[#EC4899]" />
            </div>
            <p className="text-white font-medium text-sm mb-1">{'Widget embebible'}</p>
            <p className="text-white/40 text-[13px]">{'¿Ya tenés web? Embebé el sistema de reservas con un iframe.'}</p>
          </div>
        </div>

        {/* Mockup — desktop screenshot */}
        <div ref={imgRef as React.RefObject<HTMLDivElement>} className="relative max-w-3xl mx-auto">
          <div className="lv2-mockup-wrapper rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-[#EC4899]/10">
            <Image
              src="/mockups/set1/portada.webp"
              alt="Página pública de reservas con branding personalizado — vista escritorio"
              width={800}
              height={500}
              className="w-full h-auto"
            />
          </div>
          {/* Floating review card */}
          <div className="absolute -bottom-4 right-4 md:-right-8 bg-black/90 backdrop-blur-xl border border-white/[0.1] rounded-xl px-5 py-4 shadow-xl max-w-[220px]">
            <div className="flex gap-0.5 mb-2">
              {[...Array(5)].map((_, j) => (
                <Star key={j} size={12} className="text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-white/60 text-xs leading-relaxed mb-2 text-left">
              {'"Excelente atención. Reservar fue súper fácil y rápido."'}
            </p>
            <p className="text-white/30 text-[10px] text-left">{'Sofía M. · Clienta verificada'}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SUB-INDUSTRIES (simplified — small cards, no emojis)
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
            {'Sea cual sea tu especialidad, TurnoLink se adapta a tu forma de trabajar.'}
          </p>
        </div>

        <div ref={cardsRef} className="flex flex-wrap justify-center gap-3">
          {SUB_INDUSTRIES.map((item, i) => (
            <Link
              key={i}
              href={`/belleza/${item.slug}`}
              className="lv2-card-stagger px-5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-[#EC4899]/20 transition-all duration-300 group"
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
   SMART ANALYTICS (NEW) — Heatmap + Seniority + Intake
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
                <BarChart3 size={20} className="text-[#EC4899]" />
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
                {['9', '10', '11', '12', '13', '14', '15', '16', '17', '18'].map((h) => (
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
                            ? 'rgba(236,72,153,0.6)'
                            : val >= 70
                              ? 'rgba(236,72,153,0.35)'
                              : val >= 50
                                ? 'rgba(236,72,153,0.2)'
                                : val >= 30
                                  ? 'rgba(236,72,153,0.1)'
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
                  <span className="w-3 h-3 rounded-sm bg-[#EC4899]/20" /> {'Medio'}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-[#EC4899]/60" /> {'Lleno'}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
              <p className="text-white/40 text-[13px] leading-relaxed">
                <span className="text-[#10B981] font-medium">{'Acción:'}</span>
                {' Jueves de 14 a 16 tiene 30% de ocupación. Lanzá una promo Happy Hour y subilo al 80%.'}
              </p>
            </div>
          </div>

          {/* Seniority + Intake Card */}
          <div className="space-y-6">
            {/* Seniority Pricing */}
            <div className="lv2-card p-6 sm:p-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl lv2-icon-glow flex items-center justify-center">
                  <Crown size={20} className="text-[#EC4899]" />
                </div>
                <div>
                  <h3 className="text-white font-medium text-lg tracking-[-0.5px]">{'Tarifas por nivel'}</h3>
                  <p className="text-white/40 text-xs">{'+35% en ticket promedio sin cambiar infraestructura'}</p>
                </div>
              </div>

              <div className="space-y-4">
                {SENIORITY_TIERS.map((tier) => (
                  <div key={tier.level}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-sm font-medium ${tier.color}`}>{tier.level}</span>
                      <span className="text-sm text-white/60 font-mono">{tier.price}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r from-[#EC4899]/40 to-[#EC4899] ${tier.bar}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-white/35 text-[13px] text-center">
                {'Tu cliente elige el nivel de profesional que prefiere. Cobrás más por tus mejores talentos.'}
              </p>
            </div>

            {/* Intake Forms */}
            <div className="lv2-card p-6 sm:p-8">
              <div className="flex items-center justify-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl lv2-icon-glow flex items-center justify-center">
                  <ClipboardList size={20} className="text-[#EC4899]" />
                </div>
                <div>
                  <h3 className="text-white font-medium text-lg tracking-[-0.5px]">{'Formularios pre-turno'}</h3>
                  <p className="text-white/40 text-xs">{'10 minutos menos por turno = 1-2 turnos más por día'}</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  { label: '¿Tiene alergias o sensibilidades?', type: 'Sí/No + detalle' },
                  { label: '¿Qué productos usa actualmente?', type: 'Texto libre' },
                  { label: 'Foto de referencia del resultado deseado', type: 'Imagen' },
                  { label: 'Último tratamiento / servicio', type: 'Fecha' },
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
                {'Tu cliente completa todo al reservar. Vos llegás al turno preparado/a. Aumento del '}
                <span className="text-[#10B981]">{'30% en retención'}</span>
                {' por experiencia personalizada.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   ROI SECTION (improved with realistic ticket)
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
          <SectionH2 line1="¿Cuánto te cuestan" line2="las ausencias?" />
          <p className="mt-5 text-white/50 max-w-xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            {'Hacé la cuenta. Cada turno vacío es plata que no entra. Con señas automáticas, la historia cambia.'}
          </p>
        </div>

        <div className="lv2-card p-6 sm:p-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            {/* Sin TurnoLink */}
            <div className="text-center p-6 sm:p-7 rounded-xl bg-red-500/[0.04] border border-red-500/[0.08]">
              <p className="text-sm text-red-400/70 font-medium mb-5 tracking-tight">{'Sin cobro de señas'}</p>
              <div className="space-y-2 text-white/45 text-sm">
                <p>{'~5 ausencias por semana'}</p>
                <p>{'Turno promedio: $15.000'}</p>
              </div>
              <div className="mt-5 pt-5 border-t border-red-500/[0.08]">
                <p className="text-3xl text-red-400/80 font-normal tracking-[-1.5px]">
                  {'-$300.000'}
                </p>
                <p className="text-xs text-red-400/40 mt-1">{'perdidos por mes'}</p>
              </div>
            </div>

            {/* Con TurnoLink */}
            <div className="text-center p-6 sm:p-7 rounded-xl bg-[#10B981]/[0.06] border border-[#10B981]/[0.15]">
              <p className="text-sm text-[#10B981] font-medium mb-5 tracking-tight">{'Con TurnoLink'}</p>
              <div className="space-y-2 text-white/45 text-sm">
                <p>{'~1 ausencia por semana (-80%)'}</p>
                <p>{'Turno promedio: $15.000'}</p>
              </div>
              <div className="mt-5 pt-5 border-t border-[#10B981]/[0.12]">
                <p className="text-3xl text-[#10B981] font-normal tracking-[-1.5px]">
                  {'-$60.000'}
                </p>
                <p className="text-xs text-[#10B981]/50 mt-1">{'perdidos por mes'}</p>
              </div>
            </div>
          </div>

          {/* ROI Summary */}
          <div className="text-center border-t border-white/[0.06] pt-8">
            <p className="text-white/50 text-sm mb-2">{'Recuperás'}</p>
            <p className="text-4xl sm:text-5xl text-white font-normal tracking-[-2px]">
              {'$240.000'}<span className="text-lg text-white/30 ml-1">{'/mes'}</span>
            </p>
            <p className="text-white/40 text-sm mt-4">
              {'Plan Profesional: $14.999/mes — '}
              <span className="text-[#10B981] font-medium">{'ROI de 16x tu inversión'}</span>
            </p>
          </div>

          {/* Additional ROI from seniority */}
          <div className="mt-8 pt-6 border-t border-white/[0.06]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg text-white font-normal tracking-[-0.5px]">{'+35%'}</p>
                <p className="text-white/30 text-xs mt-1">{'Ticket promedio con seniority'}</p>
              </div>
              <div>
                <p className="text-lg text-white font-normal tracking-[-0.5px]">{'+60%'}</p>
                <p className="text-white/30 text-xs mt-1">{'Ocupación con promos'}</p>
              </div>
              <div>
                <p className="text-lg text-white font-normal tracking-[-0.5px]">{'+30%'}</p>
                <p className="text-white/30 text-xs mt-1">{'Retención con fichas de cliente'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   TALENT TEASER (NEW)
   ═══════════════════════════════════════════════════════ */

function TalentTeaser() {
  const sectionRef = useScrollReveal();

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[80px] lg:py-[100px] px-5 lg:px-10"
    >
      <div className="max-w-[900px] mx-auto">
        <div className="lv2-card p-6 sm:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#EC4899]/[0.04] to-transparent pointer-events-none" />
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Search size={18} className="text-[#EC4899]" />
              <span className="text-sm text-[#EC4899] font-medium">{'TurnoLink Talento'}</span>
            </div>
            <h3 className="text-white text-[22px] sm:text-[28px] font-normal tracking-[-1px] leading-[1.2] mb-3">
              {'¿Necesitás un profesional para cubrir una vacante?'}
            </h3>
            <p className="text-white/50 text-[15px] leading-relaxed max-w-lg mx-auto mb-6">
              {'Publicá la vacante en TurnoLink Talento y recibí postulaciones de profesionales verificados con reseñas. Contratá en '}
              <span className="text-white font-medium">{'3-5 días'}</span>
              {' en vez de 3-4 semanas.'}
            </p>
            <Link
              href="/para/talento"
              className="inline-flex items-center gap-1.5 text-sm text-[#EC4899] hover:text-[#DB2777] transition-colors duration-300 font-medium"
            >
              {'Conocer más'} <ArrowRight size={14} />
            </Link>
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
                <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#EC4899]/[0.1] border border-[#EC4899]/[0.15] text-xs text-[#EC4899] font-medium">
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
                  <span className="text-[10px] font-bold text-white bg-[#EC4899] px-3 py-1 rounded-md tracking-wide uppercase">
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
                    <Check size={16} className="text-[#EC4899] mt-0.5 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/register?industry=belleza"
                className={`mt-8 w-full text-center py-3 rounded-[10px] text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  tier.popular
                    ? 'lv2-glow-btn bg-[#EC4899] text-white'
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
            className="text-sm text-[#EC4899] hover:text-[#DB2777] transition-colors duration-300"
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
            {'Respuestas a las dudas más comunes de profesionales de belleza y bienestar.'}
          </p>
        </div>

          <div className="space-y-3">
            {BELLEZA_FAQS.map((faq, i) => {
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

export function BellezaLanding({ dynamicPricing }: { dynamicPricing?: PricingTier[] } = {}) {
  const pricingTiers = dynamicPricing || PRICING_TIERS;
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
      <PromoShowcase />
      <ProductShowcaseSection />
      <BrandedPageSection />
      <SubIndustriesSection />
      <SmartAnalyticsSection />
      <ROISection />
      <TalentTeaser />
      <TestimonialsSection />
      <PricingSection tiers={pricingTiers} />
      <FAQSection />
      <CTASection
        headline="Tu negocio de belleza merece una plataforma de crecimiento"
        subtitle="empezá en 5 minutos."
        description="Creá tu cuenta gratis, configurá tus servicios y empezá a recibir reservas con cobro automático. Promociones, reseñas, métricas y talento. Todo en un lugar."
      />
      <Footer />
    </div>
  );
}
