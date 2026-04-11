'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Check,
  Shield,
  Zap,
  Star,
  CalendarCheck,
  CreditCard,
  Users,
  Bell,
  Video,
  Clock,
  Timer,
  Briefcase,
  Scale,
  Calculator,
  FileSignature,
  TrendingUp,
  ClipboardList,
  BarChart3,
  Lock,
  ShieldCheck,
  FileCheck,
  Eye,
  type LucideIcon,
} from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '../_components/hooks';
import { SectionTag, SectionH2, WordReveal, WHATSAPP_URL } from '../_components/ui';
import { Navbar } from '../_components/navbar';
import { Footer } from '../_components/footer';
import { CTASection } from '../_components/cta-section';

/* ═══════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════ */

const ACCENT = '#8B5CF6';
const S = '/screenshots/profesionales/desktop';
const REGISTER_URL = '/register?industry=profesionales';

/* ═══════════════════════════════════════════════════════
   IMAGE SETS
   ═══════════════════════════════════════════════════════ */

const HERO_IMAGES = [
  { src: `${S}/abogados-dashboard.png`, alt: 'Dashboard con resumen de consultas, clientes recientes y facturación del estudio' },
  { src: `${S}/contadores-pagina-publica.png`, alt: 'Página pública de reservas — tus clientes eligen servicio, día y hora sin llamar' },
  { src: `${S}/escribanos-servicios.png`, alt: 'Configuración de servicios notariales con precios, duración y descripción' },
];

const DASHBOARD_IMAGES = [
  { src: `${S}/contadores-dashboard.png`, alt: 'Dashboard con consultas del día, métricas de rendimiento y agenda en tiempo real' },
  { src: `${S}/abogados-clientes.png`, alt: 'Base de clientes con historial, tipo de caso y datos de contacto centralizados' },
  { src: `${S}/abogados-servicios.png`, alt: 'Panel de servicios — configurá consultas, precios y duraciones desde un solo lugar' },
];

const PAGINA_IMAGES = [
  { src: `${S}/abogados-pagina-publica.png`, alt: 'Página pública de Estudio Molina & Asociados — reserva de consultas jurídicas online 24/7' },
  { src: `${S}/contadores-pagina-publica.png`, alt: 'Página pública de Estudio Contable Ruiz — servicios de Monotributo, IIBB y Planificación Fiscal' },
  { src: `${S}/escribanos-pagina-publica.png`, alt: 'Página pública de Escribanía Méndez — escrituras, poderes y certificaciones' },
];

const BOOKING_IMAGES = [
  { src: `${S}/cliente-seleccion-profesional.png`, alt: 'El cliente selecciona el profesional que necesita desde la página de reservas' },
  { src: `${S}/cliente-flujo-reserva.png`, alt: 'Flujo de reserva — el cliente elige servicio, fecha, hora y confirma en minutos' },
  { src: `${S}/escribanos-pagina-publica.png`, alt: 'Página pública de la escribanía donde el cliente reserva su trámite notarial' },
];

const CLIENTES_IMAGES = [
  { src: `${S}/abogados-clientes.png`, alt: 'Base de clientes del estudio jurídico — historial, contacto y notas por cliente' },
  { src: `${S}/contadores-servicios.png`, alt: 'Servicios contables configurados — Monotributo, IIBB, Planificación Fiscal con precios' },
  { src: `${S}/escribanos-servicios.png`, alt: 'Servicios notariales — Escrituras, Poderes, Certificaciones con duración y precio' },
  { src: `${S}/escribanos-dashboard.png`, alt: 'Dashboard de escribanía con próximas citas, métricas y clientes del día' },
];

/* ═══════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════ */

const PAIN_POINTS = [
  {
    emoji: '📞',
    title: 'Consultas que no se concretan',
    desc: 'Llaman, preguntan y después no confirman. Perdés el horario reservado.',
  },
  {
    emoji: '💸',
    title: 'Cobrar honorarios es incómodo',
    desc: 'Pedir honorarios cara a cara es incómodo. Algunos clientes se van sin pagar.',
  },
  {
    emoji: '🔥',
    title: 'Agenda desbordada en picos',
    desc: 'Vencimientos, cierres, escrituras urgentes. Tu agenda explota y no das abasto.',
  },
];

const BEFORE_ITEMS = [
  { time: '08:30', text: 'WhatsApp: "¿Tenés algo para hoy?"' },
  { time: '09:00', text: 'El cliente de las 9 no vino. Hora perdida' },
  { time: '10:00', text: '"Después te transfiero" — cobro pendiente' },
  { time: '11:30', text: 'Tres llamadas más. No podés trabajar' },
  { time: '15:00', text: 'Doble turno: dos clientes a la misma hora' },
  { time: '20:00', text: '"Mañana no puedo". Consulta perdida' },
];

const AFTER_ITEMS = [
  { time: '08:30', text: 'Agenda completa. Reservaron solos, online' },
  { time: '09:00', text: 'Todos vinieron. Recordatorio automático ayer' },
  { time: '10:00', text: 'Cobro procesado al reservar. Sin incomodidades' },
  { time: '11:30', text: 'Nuevas consultas se agendan solas' },
  { time: '15:00', text: 'Cada consulta en su horario. Sin solapamientos' },
  { time: '20:00', text: 'Cancela → turno se libera → otro lo toma' },
];

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: CalendarCheck, title: 'Agenda online 24/7', desc: 'Tus clientes reservan consultas cuando quieren, sin llamar.' },
  { icon: CreditCard, title: 'Cobro anticipado', desc: 'Cobrá honorarios al reservar vía Mercado Pago. Solo clientes comprometidos.' },
  { icon: Timer, title: 'Tipos de consulta', desc: 'Primera consulta 60 min, seguimiento 30 min, express 15 min.' },
  { icon: Video, title: 'Videollamadas', desc: 'Consultas online con link automático de Zoom o Google Meet.' },
  { icon: ClipboardList, title: 'Formularios pre-consulta', desc: 'El cliente completa motivo y datos antes de la cita.' },
  { icon: Users, title: 'Base de clientes', desc: 'CUIT, tipo de caso, historial y notas en un solo lugar.' },
  { icon: Bell, title: 'Recordatorios automáticos', desc: 'Confirmación al reservar y recordatorio antes de la consulta.' },
  { icon: Star, title: 'Reseñas verificadas', desc: 'Clientes califican la consulta. Generás confianza automáticamente.' },
  { icon: BarChart3, title: 'Reportes y métricas', desc: 'Ingresos, cancelaciones, servicios más pedidos y rendimiento.' },
  { icon: TrendingUp, title: 'Control de finanzas', desc: 'Visualizá ingresos, egresos y rentabilidad de tu estudio en tiempo real.' },
  { icon: Lock, title: 'Portal de empleados', desc: 'Cada profesional accede a su propia agenda, disponibilidad y clientes con credenciales independientes.' },
];

const PROFESIONES: {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  bullets: string[];
  subIndustries: string[];
}[] = [
  {
    id: 'abogados',
    icon: Scale,
    title: 'Estudios Jurídicos',
    subtitle: 'Abogados y estudios de derecho',
    bullets: [
      'Cobro anticipado de honorarios',
      'Formulario pre-consulta: tipo de caso y documentación',
      'Base de clientes con estado del expediente',
      'Bloqueo de horarios para audiencias y trámites',
      'Portal individual para cada abogado del estudio',
    ],
    subIndustries: ['Civil', 'Penal', 'Laboral', 'Comercial', 'Familia', 'Inmobiliario'],
  },
  {
    id: 'contadores',
    icon: Calculator,
    title: 'Estudios Contables',
    subtitle: 'Contadores y asesores impositivos',
    bullets: [
      'Tipos de consulta: Monotributo, IIBB, sociedades',
      'Formulario pre-consulta: CUIT, régimen, problemática',
      'Cobro de consultas de forma profesional y natural',
      'Portal propio para cada contador del estudio',
      'Reportes por tipo impositivo y rendimiento mensual',
    ],
    subIndustries: ['Monotributo', 'Responsable inscripto', 'Sociedades', 'IIBB', 'Sueldos', 'Planificación fiscal'],
  },
  {
    id: 'escribanos',
    icon: FileSignature,
    title: 'Escribanías y Notarías',
    subtitle: 'Escribanos y estudios notariales',
    bullets: [
      'Trámites: escrituras, certificaciones, poderes',
      'Seña al reservar para garantizar presencia',
      'Lista de documentos que debe traer el cliente',
      'Cada escribano gestiona su propia agenda',
      'Reseñas que posicionan tu escribanía',
    ],
    subIndustries: ['Escrituras', 'Certificaciones', 'Poderes', 'Actas', 'Autenticaciones', 'Testamentos'],
  },
];

const OTHER_PROFESSIONS = [
  'Consultores de negocios',
  'Asesores financieros',
  'Coaches ejecutivos',
  'Arquitectos',
  'Mediadores',
  'Peritos judiciales',
  'Despachantes de aduana',
  'Asesores de seguros',
  'Ingenieros consultores',
  'Psicopedagogos',
];

const TESTIMONIALS = [
  {
    quote: 'El cobro anticipado filtró a los curiosos. Ahora solo vienen clientes comprometidos.',
    name: 'Dr. Andrés Molina',
    role: 'Abogado',
    business: 'Estudio Molina & Asoc.',
    metric: '+40% facturación',
    initials: 'AM',
    image: 'https://randomuser.me/api/portraits/men/11.jpg',
  },
  {
    quote: 'En época de vencimientos mi agenda se organiza sola. Los clientes reservan y yo sé cuántos tengo.',
    name: 'Cr. Alejandro Ruiz',
    role: 'Contador',
    business: 'Estudio Ruiz & Asoc.',
    metric: '0 llamadas/día',
    initials: 'AR',
    image: 'https://randomuser.me/api/portraits/men/12.jpg',
  },
  {
    quote: 'Mis clientes reservan online y reciben la lista de documentos. Llegamos mucho más preparados.',
    name: 'Esc. Daniela Méndez',
    role: 'Escribana',
    business: 'Escribanía Méndez',
    metric: '-60% caídas',
    initials: 'DM',
    image: 'https://randomuser.me/api/portraits/women/13.jpg',
  },
];

const PRICING_TIERS = [
  {
    name: 'Starter',
    price: '$16.990',
    period: '/mes',
    popular: false,
    features: ['1 profesional', '1 estudio', 'Reservas ilimitadas', 'Cobro de honorarios', 'Recordatorios automáticos', 'Base de clientes'],
  },
  {
    name: 'Profesional',
    price: '$29.990',
    period: '/mes',
    popular: true,
    features: ['Hasta 5 profesionales', '2 estudios', 'Reservas ilimitadas', 'Cobro de honorarios', 'Reportes avanzados', 'Control de finanzas', 'Portal de empleados (hasta 3)', 'Dashboard completo'],
  },
  {
    name: 'Estudio',
    price: '$49.990',
    period: '/mes',
    popular: false,
    features: ['Profesionales ilimitados', 'Multi-sede', 'Reservas ilimitadas', 'Portal de empleados ilimitado', 'Reportes gerenciales', 'Control de finanzas', 'Soporte prioritario', 'API disponible'],
  },
];

const FAQS = [
  { q: '¿Funciona para estudios con varios profesionales?', a: 'Sí. Cada profesional tiene su propia agenda, especialidades y horarios. El cliente elige a quién reservarle.' },
  { q: '¿Puedo cobrar la consulta por adelantado?', a: 'Sí. El cliente paga al reservar mediante Mercado Pago. El dinero va directo a tu cuenta, sin comisiones.' },
  { q: '¿Puedo ofrecer primera consulta gratuita?', a: 'Sí. Creás un servicio con precio $0 y otro con honorarios. El cliente elige al reservar.' },
  { q: '¿Es seguro para datos confidenciales?', a: 'Sí. Cifrado AES-256-GCM, autenticación 2FA, registro de auditoría. Cumplimos Ley 25.326.' },
  { q: '¿Funciona para consultas virtuales?', a: 'Sí. Videollamada integrada con Zoom o Google Meet. El link se genera automáticamente.' },
  { q: '¿Puedo usar formularios pre-consulta?', a: 'Sí. El cliente completa los campos que configures al reservar y vos lo leés antes de atenderlo.' },
  { q: '¿Puedo bloquear horarios?', a: 'Sí. Bloqueás horarios para audiencias, escritos o cualquier compromiso que no sea consulta.' },
  { q: '¿Cuánto tiempo lleva configurar?', a: 'Menos de 10 minutos. Creás tu cuenta, configurás consultas, definís horarios y listo.' },
  { q: '¿Funciona en épocas de alta demanda?', a: 'Perfecto. Los clientes ven tu disponibilidad real y reservan sin saturarte el teléfono.' },
  { q: '¿Puedo ver reseñas en mi página?', a: 'Sí. El cliente deja una reseña con calificación que se publica en tu página pública.' },
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
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return { count, ref };
}

/* ═══════════════════════════════════════════════════════
   AUTO-CYCLE IMAGE
   ═══════════════════════════════════════════════════════ */

function AutoCycleImage({
  images,
  width = 1440,
  height = 900,
  interval = 3000,
  priority = false,
}: {
  images: { src: string; alt: string }[];
  width?: number;
  height?: number;
  interval?: number;
  priority?: boolean;
}) {
  const [current, setCurrent] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [isVisible, images.length, interval]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative w-full" style={{ aspectRatio: `${width} / ${height}` }}>
        {images.map((img, i) => (
          <Image
            key={img.src}
            src={img.src}
            alt={img.alt}
            width={width}
            height={height}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
              i === current ? 'opacity-100' : 'opacity-0'
            }`}
            priority={priority && i === 0}
          />
        ))}
      </div>
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 backdrop-blur-md rounded-full px-3 py-1.5">
          {images.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-500 ease-out ${
                i === current
                  ? 'w-5 h-1.5 bg-white/90'
                  : 'w-1.5 h-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════ */

function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center pt-28 lg:pt-32 pb-12 px-5 lg:px-10 overflow-hidden">
      <div
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] lv2-glow-orb pointer-events-none"
        style={{ backgroundColor: `${ACCENT}11` }}
      />
      <div
        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] lv2-glow-orb pointer-events-none"
        style={{ backgroundColor: `${ACCENT}08`, animationDelay: '3s' }}
      />

      <div className="max-w-[1200px] mx-auto w-full relative z-10">
        <div className="text-center">
          <div className="mb-8 flex justify-center">
            <span className="lv2-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm text-white/80">
              <Briefcase size={14} style={{ color: ACCENT }} />
              Para estudios profesionales
            </span>
          </div>

          <h1 className="text-[9vw] sm:text-[48px] lg:text-[56px] xl:text-[64px] font-normal leading-[1.05] tracking-[-2px] lg:tracking-[-3px] mb-6">
            <span className="text-white block">Tu estudio profesional,</span>
            <span className="text-white block">con agenda que</span>
            <span className="text-white/50 block mt-1">trabaja sola.</span>
          </h1>

          <p className="text-base sm:text-lg text-white/50 max-w-2xl mx-auto mb-8 leading-relaxed tracking-[-0.2px]">
            <WordReveal text="Agenda online con cobro de honorarios, formularios pre-consulta, recordatorios automáticos y videollamadas integradas." />
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href={REGISTER_URL}
              className="lv2-glow-btn text-white font-medium px-8 py-3.5 rounded-[10px] text-base flex items-center gap-2"
              style={{ backgroundColor: ACCENT }}
            >
              Probar 14 días gratis
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

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-white/40">
            <span className="flex items-center gap-1.5">
              <Zap size={14} style={{ color: ACCENT }} /> Configuración en 5 min
            </span>
            <span className="flex items-center gap-1.5">
              <Shield size={14} style={{ color: ACCENT }} /> 14 días gratis
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={14} style={{ color: ACCENT }} /> +200 profesionales activos
            </span>
          </div>
        </div>

        {/* Product screenshot */}
        <div className="mt-14 relative max-w-5xl mx-auto">
          <div className="lv2-mockup-wrapper relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl" style={{ boxShadow: `0 25px 50px -12px ${ACCENT}15` }}>
            <AutoCycleImage images={HERO_IMAGES} priority />
          </div>
          <div className="absolute -bottom-5 -left-5 bg-black/90 backdrop-blur-xl border border-white/[0.1] rounded-xl px-5 py-3.5 flex items-center gap-3 shadow-xl hidden sm:flex">
            <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center">
              <TrendingUp size={18} className="text-green-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">+40% facturación</p>
              <p className="text-white/40 text-xs">Con cobro anticipado</p>
            </div>
          </div>
          <div className="absolute -top-3 -right-3 bg-black/90 backdrop-blur-xl border border-white/[0.1] rounded-xl px-5 py-3.5 flex items-center gap-3 shadow-xl hidden sm:flex">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: `${ACCENT}20` }}>
              <Clock size={18} style={{ color: ACCENT }} />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Agenda 24/7</p>
              <p className="text-white/40 text-xs">Reservas sin llamadas</p>
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
  const c1 = useCountUp(60, 2000);
  const c2 = useCountUp(200, 2500);
  const c3 = useCountUp(24, 2000);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-14 border-y border-white/[0.04] bg-white/[0.01]"
    >
      <div className="max-w-[1200px] mx-auto px-5 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-4">
          <div ref={c1.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              {c1.count}<span style={{ color: ACCENT }}>%</span>
            </p>
            <p className="text-sm text-white/40 mt-2">Menos ausencias</p>
          </div>
          <div ref={c2.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              +{c2.count}
            </p>
            <p className="text-sm text-white/40 mt-2">Profesionales activos</p>
          </div>
          <div ref={c3.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              {c3.count}/7
            </p>
            <p className="text-sm text-white/40 mt-2">Reservas online</p>
          </div>
          <div className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal tracking-[-2px]" style={{ color: ACCENT }}>$0</p>
            <p className="text-sm text-white/40 mt-2">Comisión sobre cobros</p>
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
      className="lv2-section py-[80px] lg:py-[100px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-14">
          <SectionTag text="El problema" />
          <SectionH2 line1="Estudiaste años para esto." line2="No para perseguir clientes." />
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
      className="lv2-section py-[80px] lg:py-[100px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-14">
          <SectionTag text="Transformación" />
          <SectionH2 line1="Un día en tu estudio," line2="antes y después." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ANTES */}
          <div className="lv2-card p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.03] to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-8">
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

          {/* DESPUES */}
          <div className="lv2-card p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/[0.05] to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-8">
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
   SHOWCASE: PAGINA PUBLICA — CENTERED
   ═══════════════════════════════════════════════════════ */

function ShowcasePaginaSection() {
  const sectionRef = useScrollReveal();

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[80px] lg:py-[100px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto text-center">
        <SectionTag text="Tu página de reservas" />
        <SectionH2 line1="Tus clientes" line2="reservan solos." />
        <p className="mt-5 text-white/50 text-base leading-relaxed tracking-[-0.2px] max-w-xl mx-auto mb-8">
          Compartí un link y tus clientes eligen consulta, día y hora. Pagan al reservar. Sin WhatsApp, sin llamadas.
        </p>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-white/50 mb-10">
          {[
            'Link personalizado',
            'Tu marca y colores',
            'Credenciales visibles',
            'Reseñas verificadas',
            'Mobile-friendly',
          ].map((item, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <Check size={14} style={{ color: ACCENT }} />
              {item}
            </span>
          ))}
        </div>

        <div className="lv2-mockup-wrapper rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl max-w-5xl mx-auto" style={{ boxShadow: `0 25px 50px -12px ${ACCENT}10` }}>
          <AutoCycleImage images={PAGINA_IMAGES} />
        </div>

        <div className="mt-10">
          <Link
            href={REGISTER_URL}
            className="lv2-glow-btn text-white font-medium px-7 py-3 rounded-[10px] text-sm inline-flex items-center gap-2"
            style={{ backgroundColor: ACCENT }}
          >
            Crear mi página de reservas
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SHOWCASE: DASHBOARD — CENTERED
   ═══════════════════════════════════════════════════════ */

function ShowcaseDashboardSection() {
  const sectionRef = useScrollReveal();

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[80px] lg:py-[100px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto text-center">
        <SectionTag text="Control total" />
        <SectionH2 line1="Tu estudio en números." line2="En tiempo real." />
        <p className="mt-5 text-white/50 max-w-xl mx-auto text-base leading-relaxed tracking-[-0.2px] mb-10">
          Consultas, clientes, facturación y próximas citas en una sola pantalla.
        </p>

        <div className="lv2-mockup-wrapper rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl max-w-5xl mx-auto" style={{ boxShadow: `0 25px 50px -12px ${ACCENT}10` }}>
          <AutoCycleImage images={DASHBOARD_IMAGES} />
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   FEATURES — 9 cards compact + IMAGE SHOWCASE
   ═══════════════════════════════════════════════════════ */

function FeaturesSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 100);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[80px] lg:py-[100px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto text-center">
        <SectionTag text="Funcionalidades" />
        <SectionH2 line1="Todo lo que necesitás." line2="Nada que no." />

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mt-14">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className={`lv2-card-stagger lv2-card p-6 sm:p-8 hover:bg-[#0A0A0A] transition-colors duration-300 text-center ${
                  i === FEATURES.length - 1 && FEATURES.length % 2 !== 0 ? 'sm:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl lv2-icon-glow flex items-center justify-center mb-4 sm:mb-5 mx-auto">
                  <Icon size={22} style={{ color: ACCENT }} />
                </div>
                <h3 className="text-white font-medium text-base sm:text-lg tracking-[-0.5px] mb-2">
                  {feat.title}
                </h3>
                <p className="text-white/50 text-[13px] sm:text-[15px] leading-[22px] sm:leading-[26px] tracking-[-0.2px]">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Showcase: Servicios y Clientes */}
        <div className="mt-14 lv2-mockup-wrapper rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl max-w-5xl mx-auto" style={{ boxShadow: `0 25px 50px -12px ${ACCENT}10` }}>
          <AutoCycleImage images={CLIENTES_IMAGES} />
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   ROI SECTION — with image
   ═══════════════════════════════════════════════════════ */

function ROISection() {
  const sectionRef = useScrollReveal();

  const items = [
    {
      icon: CreditCard,
      title: 'Recuperá turnos',
      loss: '$100.000/mes',
      solution: 'Con cobro anticipado, los no-shows bajan al 5%.',
    },
    {
      icon: Clock,
      title: 'Ahorrá horas',
      loss: '2-3 horas/día',
      solution: 'La agenda se gestiona sola. Más tiempo para atender.',
    },
    {
      icon: Video,
      title: 'Expandí sin oficina',
      loss: 'Solo clientes locales',
      solution: 'Videollamadas integradas. Clientes de todo el país.',
    },
  ];

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[80px] lg:py-[100px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto text-center">
        <SectionTag text="Retorno de inversión" />
        <SectionH2 line1="Los números hablan." line2="TurnoLink se paga solo." />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mt-14">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="lv2-card p-6 sm:p-8 text-center">
                <div
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-5 mx-auto"
                  style={{ backgroundColor: `${ACCENT}15` }}
                >
                  <Icon size={24} style={{ color: ACCENT }} />
                </div>
                <h3 className="text-white font-medium text-base sm:text-lg tracking-[-0.5px] mb-3">{item.title}</h3>
                <p className="text-xl sm:text-2xl font-normal text-red-400/80 tracking-[-1px] mb-3">{item.loss}</p>
                <p className="text-white/60 text-[13px] sm:text-sm leading-relaxed flex items-start gap-2 justify-center">
                  <Check size={16} className="mt-0.5 flex-shrink-0 text-green-400" />
                  {item.solution}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-10">
          <div className="inline-flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-xl px-6 py-4">
            <TrendingUp size={20} className="text-green-400 flex-shrink-0" />
            <p className="text-white/60 text-sm">
              <span className="text-white font-medium">Desde $16.990/mes</span> — se paga con un solo turno recuperado
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   CLIENT EXPERIENCE — CENTERED with IMAGE
   ═══════════════════════════════════════════════════════ */

function ClientExperienceSection() {
  const sectionRef = useScrollReveal();

  const steps = [
    { step: '01', title: 'Entra a tu página', desc: 'Accede desde cualquier dispositivo a tu link personalizado.' },
    { step: '02', title: 'Completa formulario', desc: 'Motivo de consulta, documentación y datos del caso.' },
    { step: '03', title: 'Elige y paga', desc: 'Tipo de consulta, fecha, hora y pago con Mercado Pago.' },
    { step: '04', title: 'Recibe recordatorio', desc: 'Email y WhatsApp 24hs antes con detalles de la cita.' },
  ];

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[80px] lg:py-[100px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto text-center">
        <SectionTag text="Experiencia del cliente" />
        <SectionH2 line1="Lo que vive tu cliente." line2="De principio a fin." />

        {/* Booking flow screenshot */}
        <div className="mt-10 mb-14 lv2-mockup-wrapper rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl max-w-5xl mx-auto" style={{ boxShadow: `0 25px 50px -12px ${ACCENT}10` }}>
          <AutoCycleImage images={BOOKING_IMAGES} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {steps.map((s, i) => (
            <div key={i} className="lv2-card p-5 sm:p-6 relative text-center">
              <span
                className="text-[36px] sm:text-[44px] font-normal tracking-[-3px] leading-none mb-2 block"
                style={{ color: `${ACCENT}30` }}
              >
                {s.step}
              </span>
              <h3 className="text-white font-medium text-sm sm:text-base tracking-[-0.5px] mb-1.5">{s.title}</h3>
              <p className="text-white/50 text-xs sm:text-[13px] leading-relaxed">{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 -right-3 text-white/10 z-10">
                  <ArrowRight size={20} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   PARA QUIÉN ES — 3 profesiones + "También ideal para"
   ═══════════════════════════════════════════════════════ */

function ParaQuienSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 150);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[80px] lg:py-[100px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto text-center">
        <SectionTag text="¿Para quién es?" />
        <SectionH2 line1="Diseñado para profesionales" line2="que venden su tiempo." />

        <div ref={cardsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-14">
          {PROFESIONES.map((prof) => {
            const Icon = prof.icon;
            return (
              <div
                key={prof.id}
                id={prof.id}
                className="lv2-card-stagger lv2-card p-8 scroll-mt-24 text-center"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 mx-auto"
                  style={{ backgroundColor: `${ACCENT}15` }}
                >
                  <Icon size={24} style={{ color: ACCENT }} />
                </div>
                <h3 className="text-white font-medium text-xl tracking-[-0.5px] mb-1">
                  {prof.title}
                </h3>
                <p className="text-white/40 text-sm mb-6">{prof.subtitle}</p>

                <div className="space-y-3 mb-8 text-left">
                  {prof.bullets.map((bullet, j) => (
                    <div key={j} className="flex items-start gap-2.5">
                      <Check size={16} className="mt-0.5 flex-shrink-0" style={{ color: ACCENT }} />
                      <p className="text-white/60 text-sm leading-relaxed">{bullet}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/[0.06] pt-5">
                  <div className="flex flex-wrap justify-center gap-2">
                    {prof.subIndustries.map((sub, j) => (
                      <span
                        key={j}
                        className="text-xs px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-white/50"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* También ideal para */}
        <div className="mt-10 sm:mt-12">
          <p className="text-white/40 text-xs sm:text-sm mb-4 sm:mb-5 font-medium uppercase tracking-wider">También ideal para</p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 max-w-3xl mx-auto">
            {OTHER_PROFESSIONS.map((prof, i) => (
              <span
                key={i}
                className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/60 hover:bg-white/[0.08] hover:text-white/80 transition-colors duration-200"
              >
                {prof}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   TESTIMONIALS — with avatar initials
   ═══════════════════════════════════════════════════════ */

function TestimonialsSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 150);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[80px] lg:py-[100px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto text-center">
        <SectionTag text="Resultados" />
        <SectionH2 line1="Lo que dicen colegas" line2="que ya lo usan." />

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-14">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="lv2-card-stagger lv2-card p-8 flex flex-col text-center">
              <div className="mb-5 flex justify-center">
                <span
                  className="inline-flex items-center px-3 py-1 rounded-md border text-xs font-medium"
                  style={{
                    backgroundColor: `${ACCENT}15`,
                    borderColor: `${ACCENT}25`,
                    color: ACCENT,
                  }}
                >
                  {t.metric}
                </span>
              </div>

              <div className="flex justify-center gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              <p className="text-white/50 text-[15px] leading-[26px] tracking-[-0.2px] flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="border-t border-white/[0.06] pt-4 flex items-center justify-center gap-3">
                {t.image ? (
                  <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" loading="lazy" />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
                    style={{ backgroundColor: `${ACCENT}20`, color: ACCENT }}
                  >
                    {t.initials}
                  </div>
                )}
                <div className="text-left">
                  <p className="text-white font-medium text-sm tracking-tight">{t.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {t.role} · {t.business}
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
   SECURITY SECTION — compact centered
   ═══════════════════════════════════════════════════════ */

function SecuritySection() {
  const sectionRef = useScrollReveal();

  const items = [
    { icon: Lock, title: 'Cifrado AES-256-GCM', desc: 'Estándar bancario para toda la información.' },
    { icon: ShieldCheck, title: 'Autenticación 2FA', desc: 'Códigos temporales y respaldo.' },
    { icon: FileCheck, title: 'Registro de auditoría', desc: 'Cada acción con timestamp, usuario e IP.' },
    { icon: Eye, title: 'Acceso exclusivo', desc: 'Tus datos son tuyos. Solo vos accedés.' },
  ];

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[80px] lg:py-[100px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto text-center">
        <SectionTag text="Seguridad" />
        <SectionH2 line1="Tu información protegida." line2="Como tu secreto profesional." />
        <p className="mt-5 text-white/50 max-w-xl mx-auto text-base leading-relaxed tracking-[-0.2px] mb-10">
          Seguridad de nivel bancario. Cumplimiento de la Ley 25.326 de Protección de Datos Personales.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="lv2-card p-5 sm:p-6 text-center">
                <div
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-4 mx-auto"
                  style={{ backgroundColor: `${ACCENT}15` }}
                >
                  <Icon size={22} style={{ color: ACCENT }} />
                </div>
                <h3 className="text-white font-medium text-[14px] sm:text-base tracking-[-0.3px] mb-1.5">{item.title}</h3>
                <p className="text-white/50 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
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
      className="lv2-section py-[80px] lg:py-[100px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto text-center">
        <SectionTag text="Precios" />
        <SectionH2 line1="Planes claros," line2="sin letra chica." />
        <p className="mt-5 text-white/50 max-w-xl mx-auto text-base leading-relaxed tracking-[-0.2px] mb-14">
          14 días gratis en todos los planes. Sin tarjeta. Sin compromiso.
        </p>

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
                  <span
                    className="text-[10px] font-bold text-white px-3 py-1 rounded-md tracking-wide uppercase"
                    style={{ backgroundColor: ACCENT }}
                  >
                    Más elegido
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
                    <Check size={16} className="mt-0.5 flex-shrink-0" style={{ color: ACCENT }} />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href={REGISTER_URL}
                className={`mt-8 w-full text-center py-3 rounded-[10px] text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  tier.popular
                    ? 'lv2-glow-btn text-white'
                    : 'bg-white/[0.06] text-white/80 hover:bg-white/[0.12] border border-white/[0.08]'
                }`}
                style={tier.popular ? { backgroundColor: ACCENT } : undefined}
              >
                Probar 14 días gratis
                <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>

        <p className="text-white/25 text-sm mt-10 flex items-center justify-center gap-2">
          <Shield size={14} />
          14 días de prueba. Sin tarjeta de crédito.
        </p>
        <p className="mt-4">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:opacity-80 transition-opacity duration-300"
            style={{ color: ACCENT }}
          >
            ¿Necesitás ayuda para elegir? Hablá con nuestro equipo →
          </a>
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   FAQ — CENTERED
   ═══════════════════════════════════════════════════════ */

function FAQSection() {
  const sectionRef = useScrollReveal();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = useCallback((i: number) => setOpenIdx((prev) => (prev === i ? null : i)), []);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[80px] lg:py-[100px] px-5 lg:px-10"
    >
      <div className="max-w-[800px] mx-auto text-center">
        <SectionTag text="FAQ" />
        <SectionH2 line1="Preguntas" line2="frecuentes" />

        <div className="space-y-3 mt-14 text-left">
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

export function ProfesionalesLanding({ dynamicPricing }: { dynamicPricing?: PricingTier[] } = {}) {
  const pricingTiers = dynamicPricing || PRICING_TIERS;
  return (
    <div
      className="min-h-screen bg-black text-white"
      style={{ overflowX: 'clip' }}
    >
      <Navbar />
      <HeroSection />
      <MetricsStrip />
      <PainPointsSection />
      <BeforeAfterSection />
      <ShowcasePaginaSection />
      <ShowcaseDashboardSection />
      <FeaturesSection />
      <ROISection />
      <ClientExperienceSection />
      <ParaQuienSection />
      <TestimonialsSection />
      <SecuritySection />
      <PricingSection tiers={pricingTiers} />
      <FAQSection />
      <CTASection
        headline="Profesionalizá tu estudio"
        subtitle="en 5 minutos."
        description="Probá TurnoLink 14 días gratis. Configurá tus consultas, activá cobro de honorarios y empezá a recibir clientes."
        accent={ACCENT}
        registerUrl={REGISTER_URL}
      />
      <Footer />
    </div>
  );
}
