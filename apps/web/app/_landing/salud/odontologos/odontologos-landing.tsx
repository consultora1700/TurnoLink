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
  Lock,
  Clock,
  TrendingUp,
  FileText,
  Smile,
  ClipboardList,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '../../_components/hooks';
import { SectionTag, SectionH2, WordReveal, WHATSAPP_URL } from '../../_components/ui';
import { Navbar } from '../../_components/navbar';
import { Footer } from '../../_components/footer';
import { CTASection } from '../../_components/cta-section';

/* ═══════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════ */

const ACCENT = '#06B6D4';
const S = '/screenshots/odontologos/desktop';

/* ═══════════════════════════════════════════════════════
   IMAGE SETS — Auto-cycling carousels per section
   ═══════════════════════════════════════════════════════ */

const HERO_IMAGES = [
  { src: `${S}/dashboard.png`, alt: 'Dashboard del consultorio dental con métricas de turnos, pacientes y próximas citas del día' },
  { src: `${S}/agenda-semanal.png`, alt: 'Agenda semanal del consultorio con 27 turnos distribuidos de lunes a sábado' },
  { src: `${S}/lista-pacientes.png`, alt: 'Directorio de pacientes dentales con datos de contacto, turnos y fichas clínicas' },
];

const FICHA_IMAGES = [
  { src: `${S}/ficha-paciente-timeline.png`, alt: 'Timeline del paciente con historial completo de tratamientos dentales y notas clínicas' },
  { src: `${S}/ficha-paciente-datos.png`, alt: 'Ficha del paciente con datos personales, obra social e historial odontológico' },
  { src: `${S}/autogestion.png`, alt: 'Vista diaria de autogestión con turnos del día y estado de cada paciente' },
];

const PAGINA_IMAGES = [
  { src: `${S}/pagina-publica-servicios.png`, alt: 'Página pública de reservas con 8 servicios dentales, precios y botones de reserva' },
  { src: `${S}/servicio-detalle-modal.png`, alt: 'Detalle del servicio de limpieza dental con duración, precio y descripción' },
  { src: `${S}/calendario-reserva.png`, alt: 'Calendario de reservas con fecha seleccionada y horarios disponibles mañana y tarde' },
];

const DASHBOARD_IMAGES = [
  { src: `${S}/reportes.png`, alt: 'Reportes del consultorio con gráficos de facturación, servicios más solicitados y pacientes frecuentes' },
  { src: `${S}/servicios-configurados.png`, alt: 'Página de servicios con 8 tratamientos dentales configurados con fotos y precios' },
  { src: `${S}/agenda-mensual.png`, alt: 'Vista mensual de la agenda con 50 turnos distribuidos en marzo' },
];

/* ═══════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════ */

const PAIN_POINTS = [
  {
    emoji: '🦷',
    title: 'Tu tiempo se va en confirmar turnos',
    desc: 'Mensajes de WhatsApp, llamadas para reprogramar, pacientes que no responden. Cada hora que dedicás a administración es una hora menos en el sillón dental.',
  },
  {
    emoji: '💸',
    title: 'Las ausencias te cuestan tratamientos enteros',
    desc: 'Un paciente que no viene a su turno de endodoncia o limpieza es una hora que no facturás ni reasignás. Sin recordatorios automáticos, la tasa de ausencias en odontología supera el 30%.',
  },
  {
    emoji: '📋',
    title: 'El historial clínico está en mil lugares',
    desc: 'Fichas en papel, radiografías sueltas, notas en el cuaderno. Sin un registro centralizado, perdés continuidad en los tratamientos y tiempo buscando información antes de cada sesión.',
  },
];

const BEFORE_ITEMS = [
  { time: '08:00', text: 'WhatsApp: "Hola doc, necesito cambiar el turno de la limpieza"' },
  { time: '09:00', text: 'El paciente de endodoncia no vino. No avisó. Hora perdida' },
  { time: '10:30', text: 'Buscás las notas del último tratamiento. No las encontrás' },
  { time: '12:00', text: '"Te paso el CBU para la corona" — otra conversación incómoda' },
  { time: '16:00', text: 'Doble turno: dos pacientes agendados a la misma hora en el sillón' },
  { time: '21:00', text: '"Mañana no puedo ir". La extracción de las 10 se pierde' },
];

const AFTER_ITEMS = [
  { time: '08:00', text: 'Agenda completa. Los pacientes reservaron solos desde tu página' },
  { time: '09:00', text: 'Todos vinieron. Recibieron recordatorio automático ayer' },
  { time: '10:30', text: 'Abrís la ficha: historial completo, tratamientos, notas clínicas' },
  { time: '12:00', text: 'El cobro se procesó al reservar. Sin conversaciones de dinero' },
  { time: '16:00', text: 'Cada tratamiento en su horario. Sin solapamientos posibles' },
  { time: '21:00', text: 'Paciente cancela → turno se libera → otro lo toma en minutos' },
];

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: CalendarCheck,
    title: 'Agenda online 24/7',
    desc: 'Tus pacientes reservan cuando quieren, sin llamar ni escribir. Disponibilidad en tiempo real para cada tipo de tratamiento.',
  },
  {
    icon: Bell,
    title: 'Recordatorios automáticos',
    desc: 'Se envían solos antes de cada turno. Reducen ausencias sin que levantes el teléfono ni mandes un solo WhatsApp.',
  },
  {
    icon: FileText,
    title: 'Ficha clínica dental',
    desc: 'Historial de tratamientos, notas clínicas, seguimiento por sesión y datos del paciente. Todo centralizado y accesible.',
  },
  {
    icon: CreditCard,
    title: 'Cobro automático de consultas',
    desc: 'Cobrá seña o consulta completa al reservar vía Mercado Pago. El dinero va directo a tu cuenta, sin incomodidad.',
  },
  {
    icon: ClipboardList,
    title: 'Gestión de tratamientos',
    desc: 'Organizá tratamientos de múltiples sesiones. Cada paciente con su plan, avance y próximo paso. Sin perder continuidad.',
  },
  {
    icon: Lock,
    title: 'Datos seguros y privados',
    desc: 'Información cifrada, acceso controlado. Los datos de tus pacientes protegidos con las mejores prácticas de seguridad.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'Dejé de perder turnos y de perseguir pacientes por WhatsApp. Ahora reservan solos, les llega el recordatorio y el cobro es automático. Mi consultorio funciona como debería.',
    name: 'Dr. Facundo Giménez',
    role: 'Odontólogo general',
    business: 'Consultorio Giménez Odontología',
    metric: '-75% ausencias',
    image: 'https://randomuser.me/api/portraits/men/13.jpg',
  },
  {
    quote:
      'Con la ficha de paciente tengo todo el historial de tratamientos en un lugar. Antes de cada sesión, repaso el caso en segundos. Mis pacientes notan la diferencia.',
    name: 'Dra. Lucía Peralta',
    role: 'Ortodoncista',
    business: 'Ortodoncia Peralta',
    metric: '200+ pacientes',
    image: 'https://randomuser.me/api/portraits/women/14.jpg',
  },
  {
    quote:
      'Tengo 3 consultorios y ahora manejo la agenda de todos desde un solo lugar. Cada sede con sus horarios, servicios y precios. Antes era un caos organizarme.',
    name: 'Dr. Alejandro Busto',
    role: 'Implantólogo',
    business: 'Centro Dental Busto',
    metric: '3 sedes unificadas',
    image: 'https://randomuser.me/api/portraits/men/14.jpg',
  },
];

const PRICING_TIERS = [
  {
    name: 'Starter',
    price: '$16.990',
    period: '/mes',
    popular: false,
    features: [
      '1 profesional',
      '1 consultorio',
      'Reservas ilimitadas',
      'Cobro de consultas',
      'Recordatorios automáticos',
      'Ficha de paciente',
    ],
  },
  {
    name: 'Profesional',
    price: '$29.990',
    period: '/mes',
    popular: true,
    features: [
      'Hasta 5 profesionales',
      '2 consultorios',
      'Reservas ilimitadas',
      'Cobro de consultas',
      'Reportes avanzados',
      'Dashboard completo',
    ],
  },
  {
    name: 'Institución',
    price: '$49.990',
    period: '/mes',
    popular: false,
    features: [
      'Profesionales ilimitados',
      'Multi-sede',
      'Reservas ilimitadas',
      'Reportes gerenciales',
      'Soporte prioritario',
      'API disponible',
    ],
  },
];

const FAQS = [
  {
    q: '¿Los pacientes necesitan descargar una app?',
    a: 'No. Tu página de reservas funciona desde cualquier navegador. El paciente elige tratamiento, día y hora desde su celular o computadora. Sin descargas, sin fricciones.',
  },
  {
    q: '¿Puedo gestionar tratamientos de múltiples sesiones?',
    a: 'Sí. Podés crear planes de tratamiento con varias sesiones (ej: endodoncia en 3 visitas, ortodoncia mensual). El paciente ve su plan y agenda la siguiente sesión fácilmente.',
  },
  {
    q: '¿Sirve para consultorios con varios odontólogos?',
    a: 'Sí. El plan Profesional permite hasta 5 profesionales con agendas independientes. Cada odontólogo con sus horarios, servicios y disponibilidad propia.',
  },
  {
    q: '¿Puedo cobrar la consulta al momento de la reserva?',
    a: 'Sí. Configurás el monto (seña o consulta completa) y el paciente paga vía Mercado Pago al reservar. El dinero va directo a tu cuenta. Sin intermediarios.',
  },
  {
    q: '¿La ficha incluye historial de tratamientos?',
    a: 'Sí. Cada paciente tiene su ficha con historial completo de tratamientos realizados, notas clínicas por sesión, datos personales y obra social. Todo en un lugar.',
  },
  {
    q: '¿Qué pasa si un paciente cancela?',
    a: 'El turno se libera automáticamente y queda disponible para que otro paciente lo reserve. Podés configurar políticas de cancelación y si la seña se retiene o reembolsa.',
  },
  {
    q: '¿Cuánto tiempo toma configurar mi consultorio?',
    a: 'Menos de 10 minutos. Creás tu cuenta, configurás tus servicios (limpieza, ortodoncia, implantes, etc.), definís horarios y listo. Ya podés compartir tu link de reservas.',
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
   AUTO-CYCLE IMAGE — Crossfade carousel with dot indicators
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
        {/* Centered copy */}
        <div className="text-center">
          <div className="mb-8 flex justify-center">
            <span className="lv2-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm text-white/80">
              <Smile size={14} style={{ color: ACCENT }} />
              Para odontólogos
            </span>
          </div>

          <h1 className="text-[9vw] sm:text-[48px] lg:text-[56px] xl:text-[64px] font-normal leading-[1.05] tracking-[-2px] lg:tracking-[-3px] mb-6">
            <span className="text-white block">Tu consultorio dental</span>
            <span className="text-white block">funciona solo.</span>
            <span className="text-white/50 block mt-1">Vos te enfocás</span>
            <span className="text-white/50 block">en tus pacientes.</span>
          </h1>

          <p className="text-base sm:text-lg text-white/50 max-w-2xl mx-auto mb-8 leading-relaxed tracking-[-0.2px]">
            <WordReveal text="Agenda online con recordatorios automáticos, cobro de consultas sin incomodidad, ficha clínica con historial de tratamientos y página de reservas profesional. Todo lo que necesitás para dejar de perseguir pacientes por WhatsApp." />
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href="/register?industry=salud"
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

        {/* Product screenshot — centered below */}
        <div className="mt-14 relative max-w-5xl mx-auto">
          <div className="lv2-mockup-wrapper relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl" style={{ boxShadow: `0 25px 50px -12px ${ACCENT}15` }}>
            <AutoCycleImage images={HERO_IMAGES} priority />
          </div>
          {/* Floating badge: ausencias */}
          <div className="absolute -bottom-5 -left-5 bg-black/90 backdrop-blur-xl border border-white/[0.1] rounded-xl px-5 py-3.5 flex items-center gap-3 shadow-xl">
            <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center">
              <TrendingUp size={18} className="text-green-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">-75% ausencias</p>
              <p className="text-white/40 text-xs">Con recordatorios automáticos</p>
            </div>
          </div>
          {/* Floating badge: 24/7 */}
          <div className="absolute -top-3 -right-3 bg-black/90 backdrop-blur-xl border border-white/[0.1] rounded-xl px-5 py-3.5 flex items-center gap-3 shadow-xl">
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
  const c1 = useCountUp(75, 2000);
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
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="El problema" />
          <SectionH2 line1="Estudiaste años para esto." line2="No para ser recepcionista." />
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
          <SectionTag text="Transformación" />
          <SectionH2 line1="Un día en tu consultorio," line2="antes y después." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* DESPUES */}
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
   SHOWCASE: FICHA CLINICA DENTAL
   ═══════════════════════════════════════════════════════ */

function ShowcaseFichaSection() {
  const sectionRef = useScrollReveal();

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-center">
          {/* Copy */}
          <div>
            <SectionTag text="Ficha clínica" />
            <h2 className="lv2-h2 mt-6 text-[32px] sm:text-[40px] lg:text-[48px] font-normal leading-[1.05] tracking-[-1.9px]">
              <span className="text-white block">Todo el historial</span>
              <span className="text-white/60 block mt-1">de cada paciente.</span>
            </h2>
            <p className="mt-5 text-white/50 text-base leading-relaxed tracking-[-0.2px] max-w-lg">
              Tratamientos realizados, notas clínicas, seguimiento por sesión y datos completos del paciente. Antes de sentar al paciente en el sillón, repasás el caso en 30 segundos.
            </p>

            <div className="mt-8 space-y-4">
              {[
                'Timeline completo de tratamientos con fecha y notas',
                'Historial clínico y motivo de consulta centralizado',
                'Notas de cada sesión con detalle del procedimiento',
                'Datos de contacto, obra social y medio de pago',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check size={18} className="mt-0.5 flex-shrink-0" style={{ color: ACCENT }} />
                  <p className="text-white/60 text-[15px] leading-relaxed">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link
                href="/register?industry=salud"
                className="lv2-glow-btn text-white font-medium px-7 py-3 rounded-[10px] text-sm inline-flex items-center gap-2"
                style={{ backgroundColor: ACCENT }}
              >
                Probar ficha de paciente
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Screenshot */}
          <div className="lv2-mockup-wrapper rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl" style={{ boxShadow: `0 25px 50px -12px ${ACCENT}10` }}>
            <AutoCycleImage images={FICHA_IMAGES} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SHOWCASE: PAGINA DE RESERVAS
   ═══════════════════════════════════════════════════════ */

function ShowcasePaginaSection() {
  const sectionRef = useScrollReveal();

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-center">
          {/* Screenshot */}
          <div className="lv2-mockup-wrapper rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl order-2 lg:order-1" style={{ boxShadow: `0 25px 50px -12px ${ACCENT}10` }}>
            <AutoCycleImage images={PAGINA_IMAGES} />
          </div>

          {/* Copy */}
          <div className="order-1 lg:order-2">
            <SectionTag text="Tu página de reservas" />
            <h2 className="lv2-h2 mt-6 text-[32px] sm:text-[40px] lg:text-[48px] font-normal leading-[1.05] tracking-[-1.9px]">
              <span className="text-white block">Tus pacientes</span>
              <span className="text-white/60 block mt-1">reservan solos.</span>
            </h2>
            <p className="mt-5 text-white/50 text-base leading-relaxed tracking-[-0.2px] max-w-lg">
              Compartí un único link y tus pacientes ven todos tus servicios dentales. Eligen tratamiento, día y hora. Pagan al reservar si lo configurás. Sin WhatsApp, sin llamadas, sin esperas.
            </p>

            <div className="mt-8 space-y-4">
              {[
                'Link personalizado: turnolink.com/tu-consultorio',
                'Servicios con duración, precio y descripción',
                'Calendario con disponibilidad en tiempo real',
                'Compatible con celular, tablet y computadora',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check size={18} className="mt-0.5 flex-shrink-0" style={{ color: ACCENT }} />
                  <p className="text-white/60 text-[15px] leading-relaxed">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link
                href="/register?industry=salud"
                className="lv2-glow-btn text-white font-medium px-7 py-3 rounded-[10px] text-sm inline-flex items-center gap-2"
                style={{ backgroundColor: ACCENT }}
              >
                Crear mi página de reservas
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SHOWCASE: REPORTES Y CONTROL
   ═══════════════════════════════════════════════════════ */

function ShowcaseDashboardSection() {
  const sectionRef = useScrollReveal();

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-14">
          <SectionTag text="Control total" />
          <SectionH2 line1="Tu consultorio en números." line2="En tiempo real." />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            Turnos del día, pacientes atendidos, facturación, tratamientos más solicitados y próximas citas. Todo en una sola pantalla, actualizado al instante.
          </p>
        </div>

        <div className="lv2-mockup-wrapper rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl" style={{ boxShadow: `0 25px 50px -12px ${ACCENT}10` }}>
          <AutoCycleImage images={DASHBOARD_IMAGES} />
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
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 100);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Funcionalidades" />
          <SectionH2 line1="Todo lo que necesitás." line2="Nada que no." />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="lv2-card-stagger lv2-card p-8 hover:bg-[#0A0A0A] transition-colors duration-300"
              >
                <div className="w-12 h-12 rounded-xl lv2-icon-glow flex items-center justify-center mb-6">
                  <Icon size={24} style={{ color: ACCENT }} />
                </div>
                <h3 className="text-white font-medium text-lg tracking-[-0.5px] mb-3">
                  {feat.title}
                </h3>
                <p className="text-white/50 text-[15px] leading-[26px] tracking-[-0.2px]">
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
   ROI
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
          <SectionH2 line1="Cada ausencia es un" line2="tratamiento que no cobrás." />
          <p className="mt-5 text-white/50 max-w-xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            Con una consulta promedio de $12.000 y 8 ausencias semanales, perdés $384.000 por mes. Los recordatorios automáticos reducen ausencias un 75%.
          </p>
        </div>

        <div className="lv2-card p-8 sm:p-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            <div className="text-center p-7 rounded-xl bg-red-500/[0.04] border border-red-500/[0.08]">
              <p className="text-sm text-red-400/70 font-medium mb-5 tracking-tight">Sin gestión de ausencias</p>
              <div className="space-y-2 text-white/45 text-sm">
                <p>~8 ausencias por semana</p>
                <p>Consulta promedio: $12.000</p>
              </div>
              <div className="mt-5 pt-5 border-t border-red-500/[0.08]">
                <p className="text-3xl text-red-400/80 font-normal tracking-[-1.5px]">-$384.000</p>
                <p className="text-xs text-red-400/40 mt-1">perdidos por mes</p>
              </div>
            </div>

            <div className="text-center p-7 rounded-xl bg-[#10B981]/[0.06] border border-[#10B981]/[0.15]">
              <p className="text-sm text-[#10B981] font-medium mb-5 tracking-tight">Con TurnoLink</p>
              <div className="space-y-2 text-white/45 text-sm">
                <p>~2 ausencias por semana (-75%)</p>
                <p>Consulta promedio: $12.000</p>
              </div>
              <div className="mt-5 pt-5 border-t border-[#10B981]/[0.12]">
                <p className="text-3xl text-[#10B981] font-normal tracking-[-1.5px]">-$96.000</p>
                <p className="text-xs text-[#10B981]/50 mt-1">perdidos por mes</p>
              </div>
            </div>
          </div>

          <div className="text-center border-t border-white/[0.06] pt-8">
            <p className="text-white/50 text-sm mb-2">Recuperás</p>
            <p className="text-4xl sm:text-5xl text-white font-normal tracking-[-2px]">
              $288.000<span className="text-lg text-white/30 ml-1">/mes</span>
            </p>
            <p className="text-white/40 text-sm mt-4">
              Plan Starter: $16.990/mes —{' '}
              <span className="text-[#10B981] font-medium">ROI de 17x tu inversión</span>
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
          <SectionH2 line1="Lo que dicen colegas" line2="que ya lo usan." />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="lv2-card-stagger lv2-card p-8 flex flex-col">
              <div className="mb-5">
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

              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              <p className="text-white/50 text-[15px] leading-[26px] tracking-[-0.2px] flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="border-t border-white/[0.06] pt-4 flex items-center gap-3">
                {t.image && (
                  <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" loading="lazy" />
                )}
                <div>
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
          <SectionH2 line1="Planes claros," line2="sin letra chica." />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            14 días de prueba gratuita en todos los planes. Sin tarjeta de crédito. Sin compromiso.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`lv2-card-stagger lv2-card p-8 flex flex-col ${
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
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-white text-3xl font-normal tracking-[-2px]">{tier.price}</span>
                <span className="text-white/30 text-sm">{tier.period}</span>
              </div>
              <div className="lv2-glass-line w-full my-5" />
              <ul className="space-y-3 flex-1">
                {tier.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-white/60">
                    <Check size={16} className="mt-0.5 flex-shrink-0" style={{ color: ACCENT }} />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/register?industry=salud"
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

        <p className="text-center text-white/25 text-sm mt-10 flex items-center justify-center gap-2">
          <Shield size={14} />
          14 días de prueba en todos los planes. Sin tarjeta de crédito.
        </p>
        <p className="text-center mt-4">
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
              Respuestas a las dudas más comunes de odontólogos y profesionales de salud bucal.
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

interface PricingTier {
  name: string;
  price: string;
  period: string;
  popular?: boolean;
  features: string[];
}

export function OdontologosLanding({ dynamicPricing }: { dynamicPricing?: PricingTier[] } = {}) {
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
      <ShowcaseFichaSection />
      <ShowcasePaginaSection />
      <ShowcaseDashboardSection />
      <FeaturesSection />
      <ROISection />
      <TestimonialsSection />
      <PricingSection tiers={pricingTiers} />
      <FAQSection />
      <CTASection
        headline="Tu consultorio dental merece funcionar solo"
        subtitle="empezá en 5 minutos."
        description="Probá TurnoLink 14 días gratis. Configurá tus servicios dentales, activá recordatorios y empezá a recibir pacientes con agenda automática."
        accent={ACCENT}
      />
      <Footer />
    </div>
  );
}
