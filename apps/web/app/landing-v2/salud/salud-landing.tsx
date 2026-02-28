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
    emoji: '📞',
    title: 'El teléfono no para',
    desc: 'Tu recepción atiende 40+ llamadas diarias solo para turnos. Mientras tanto, los pacientes que están en sala esperan.',
  },
  {
    emoji: '🕳️',
    title: 'Horas vacías que cuestan caro',
    desc: 'Pacientes que no avisan, turnos que se pierden. Cada hora vacía es una consulta que no cobrás.',
  },
  {
    emoji: '📋',
    title: 'Agenda en papel o planillas',
    desc: 'Cuadernos, Excel, sistemas viejos. Sin control real de tu ocupación ni visibilidad de tu facturación.',
  },
];

const BEFORE_ITEMS = [
  { time: '08:00', text: 'Recepción: 15 llamadas antes de las 9 pidiendo turno' },
  { time: '09:30', text: 'Paciente no vino. No avisó. Hora vacía que no recuperás' },
  { time: '11:00', text: '¿Tiene turno para la semana que viene? — la línea no para' },
  { time: '13:00', text: 'Revisás la agenda: doble turno, un paciente sin confirmar' },
  { time: '17:00', text: 'Planilla desactualizada. No sabés cuántos pacientes atendiste hoy' },
  { time: '20:00', text: 'WhatsApp: "Mañana no puedo" — el turno de las 9 se pierde' },
];

const AFTER_ITEMS = [
  { time: '08:00', text: 'Agenda completa. Los pacientes reservaron solos, online' },
  { time: '09:30', text: 'Todos vinieron. Recibieron recordatorio automático ayer' },
  { time: '11:00', text: 'Tu página de turnos muestra disponibilidad 24/7. Sin llamadas' },
  { time: '13:00', text: 'Cada profesional con su agenda propia, sin solapamientos' },
  { time: '17:00', text: 'Dashboard: 14 consultas hoy, facturación en tiempo real' },
  { time: '20:00', text: 'Paciente cancela → turno se libera → otro lo toma en minutos' },
];

const HOW_IT_WORKS = [
  {
    num: '01',
    icon: CalendarCheck,
    title: 'Configurá tus consultas',
    desc: 'Definí tipos de consulta (primera vez, seguimiento, control), duraciones y honorarios. Listo en 5 minutos.',
  },
  {
    num: '02',
    icon: Share2,
    title: 'Compartí tu agenda',
    desc: 'Tus pacientes acceden a tu disponibilidad en tiempo real. Eligen día, hora y profesional desde el celular.',
  },
  {
    num: '03',
    icon: Bell,
    title: 'Recibí sin ausencias',
    desc: 'Recordatorios automáticos reducen ausencias. Señas opcionales con Mercado Pago aseguran el compromiso.',
  },
];

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: CalendarCheck,
    title: 'Agenda online 24/7',
    desc: 'Tus pacientes sacan turno cuando quieren, sin llamar. Disponibilidad en tiempo real, sin solapamientos.',
  },
  {
    icon: Bell,
    title: 'Recordatorios automáticos',
    desc: 'Se envían solos antes del turno. Reducí ausencias sin levantar el teléfono.',
  },
  {
    icon: Star,
    title: 'Ficha de paciente',
    desc: 'Historial completo: turnos, pagos, asistencia y notas. Toda la info de cada paciente en un lugar.',
  },
  {
    icon: CreditCard,
    title: 'Cobro de señas (opcional)',
    desc: 'Cobrá seña al reservar vía Mercado Pago. Activálo solo para los servicios que quieras.',
  },
  {
    icon: Users,
    title: 'Multi-profesional',
    desc: 'Cada profesional con su agenda, servicios y horarios propios. Los pacientes eligen con quién atenderse.',
  },
  {
    icon: Building2,
    title: 'Multi-consultorio',
    desc: '¿Atendés en más de un lugar? Gestioná cada sede con configuración independiente.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard y reportes',
    desc: 'Ocupación, facturación, asistencia por profesional. Datos reales para tomar mejores decisiones.',
  },
  {
    icon: Shield,
    title: 'Datos seguros',
    desc: 'Cifrado de datos, acceso controlado y cumplimiento de buenas prácticas. Tu información protegida.',
  },
];

const SUB_INDUSTRIES = [
  { emoji: '🏥', name: 'Consultorios médicos', desc: 'Clínico, especialistas, pediatría y más' },
  { emoji: '🧠', name: 'Psicólogos', desc: 'Sesiones individuales, pareja y grupales' },
  { emoji: '🦷', name: 'Odontólogos', desc: 'Consultas, limpiezas y tratamientos' },
  { emoji: '🥗', name: 'Nutricionistas', desc: 'Consultas, seguimiento y planes alimentarios' },
  { emoji: '💪', name: 'Kinesiólogos', desc: 'Rehabilitación, sesiones y tratamientos' },
  { emoji: '🗣️', name: 'Fonoaudiólogos', desc: 'Evaluación, terapia y seguimiento' },
  { emoji: '⚖️', name: 'Abogados', desc: 'Consultas, audiencias y seguimiento de casos' },
  { emoji: '📊', name: 'Contadores', desc: 'Reuniones, declaraciones y asesoramiento' },
  { emoji: '📝', name: 'Escribanos', desc: 'Escrituras, certificaciones y poderes' },
];

const TESTIMONIALS = [
  {
    quote:
      'Mis pacientes sacan turno solos desde el celular. La recepcionista dejó de atender 40 llamadas por día. Un cambio total.',
    name: 'Dr. Martín Acosta',
    role: 'Médico clínico',
    business: 'Consultorio Dr. Acosta',
    metric: '-40 llamadas/día',
  },
  {
    quote:
      'El cobro de seña redujo las ausencias de 30% a menos de 5%. Recuperé miles de pesos por mes en turnos que antes se perdían.',
    name: 'Dra. Sofía Méndez',
    role: 'Odontóloga',
    business: 'Centro Dental Sonrisa',
    metric: '30% → 5% ausencias',
  },
  {
    quote:
      'Atiendo en 2 consultorios y TurnoLink me muestra todo junto. Agenda, pacientes, cobros. Sin planillas ni confusiones.',
    name: 'Lic. Ana Beltrán',
    role: 'Psicóloga',
    business: 'Consultorio Ana Beltrán',
    metric: '2 consultorios',
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
      'Cobro de señas',
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
      'Cobro de señas',
      'Reportes avanzados',
      'Dashboard completo',
    ],
  },
  {
    name: 'Clínica',
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
    a: 'No. La página de reservas funciona desde cualquier navegador, en celular, tablet o computadora. Sin descargas, sin fricciones.',
  },
  {
    q: '¿Puedo configurar distintos tipos de consulta?',
    a: 'Sí. Primera consulta, seguimiento, urgencia, control — cada tipo con su duración y precio. Tus pacientes eligen al reservar.',
  },
  {
    q: '¿TurnoLink cumple con normativas de datos de salud?',
    a: 'TurnoLink gestiona turnos y pagos, no historias clínicas. Los datos se almacenan con cifrado y no se comparten con terceros.',
  },
  {
    q: '¿Puedo tener varios profesionales en el mismo consultorio?',
    a: 'Sí. Cada profesional tiene su propia agenda, servicios y horarios. Los pacientes eligen con quién atenderse.',
  },
  {
    q: '¿El cobro de seña es obligatorio?',
    a: 'No. Podés activarlo o no para cada servicio. Configurás el porcentaje y si aplica solo a ciertos tipos de consulta.',
  },
  {
    q: '¿Sirve para profesionales no médicos (abogados, contadores)?',
    a: 'Sí. TurnoLink se adapta a cualquier profesional que trabaje con agenda de turnos. Abogados, contadores, escribanos — la lógica es la misma: agendar, recordar, cobrar.',
  },
  {
    q: '¿Puedo personalizar los recordatorios?',
    a: 'Sí. Configurás cuándo se envían (24hs antes, 2hs antes) y por qué canal. El sistema los manda automáticamente.',
  },
  {
    q: '¿Qué pasa si un paciente cancela?',
    a: 'El turno se libera automáticamente y queda disponible para que otro paciente lo reserve. Podés configurar políticas de cancelación y seña.',
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
      {/* Glow orbs — cool professional tones */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[#3B82F6]/[0.07] blur-[140px] lv2-glow-orb pointer-events-none" />
      <div
        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[#4A7FBF]/[0.04] blur-[120px] lv2-glow-orb pointer-events-none"
        style={{ animationDelay: '3s' }}
      />

      <div className="max-w-[1200px] mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div>
            <div className="mb-8">
              <span className="lv2-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm text-white/80">
                <Briefcase size={14} className="text-[#3B82F6]" />
                Salud &amp; Profesionales
              </span>
            </div>

            <h1 className="text-[9vw] sm:text-[48px] lg:text-[60px] xl:text-[72px] font-normal leading-[1.05] tracking-[-2px] lg:tracking-[-3px] mb-6">
              <span className="text-white block">M&aacute;s consultas,</span>
              <span className="text-white/60 block mt-1">menos tel&eacute;fono.</span>
            </h1>

            <p className="text-base sm:text-lg text-white/50 max-w-xl mb-8 leading-relaxed tracking-[-0.2px]">
              <WordReveal text="Agenda online 24/7 con recordatorios automáticos, cobro de señas con Mercado Pago y ficha de cada paciente. Para médicos, psicólogos, odontólogos, abogados y más." />
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-10">
              <Link
                href="/register"
                className="lv2-glow-btn bg-[#3B82F6] text-white font-medium px-8 py-3.5 rounded-[10px] text-base flex items-center gap-2"
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
                <Zap size={14} className="text-[#3B82F6]" /> Configuraci&oacute;n en 5 min
              </span>
              <span className="flex items-center gap-1.5">
                <Shield size={14} className="text-[#3B82F6]" /> 14 d&iacute;as gratis
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-[#3B82F6]" /> +200 profesionales activos
              </span>
            </div>
          </div>

          {/* Right: Product mockup — turnos/agenda view */}
          <div className="relative hidden lg:block">
            <div className="lv2-mockup-wrapper relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-[#3B82F6]/10">
              <Image
                src="/mockups/salud-hero.webp"
                alt="Dra. Martínez Dermatología — agenda de turnos médicos con calendario y pacientes"
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
                <p className="text-white text-sm font-medium">-70% ausencias</p>
                <p className="text-white/40 text-xs">Con recordatorios autom&aacute;ticos</p>
              </div>
            </div>
            <div className="absolute -top-3 -right-3 bg-black/90 backdrop-blur-xl border border-white/[0.1] rounded-xl px-5 py-3.5 flex items-center gap-3 shadow-xl">
              <div className="w-9 h-9 rounded-full bg-[#3B82F6]/20 flex items-center justify-center">
                <Clock size={18} className="text-[#3B82F6]" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Agenda 24/7</p>
                <p className="text-white/40 text-xs">Sin llamadas, sin esperas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-only mockup */}
        <div className="mt-12 lg:hidden">
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-xl shadow-[#3B82F6]/10 max-w-md mx-auto">
            <Image
              src="/mockups/salud-mobile.webp"
              alt="Consultorio médico — vista móvil de turnos online"
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
  const c1 = useCountUp(70, 2000);
  const c2 = useCountUp(200, 2500);
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
              {c1.count}<span className="text-[#3B82F6]">%</span>
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
              -{c3.count}
            </p>
            <p className="text-sm text-white/40 mt-2">Llamadas menos por d&iacute;a</p>
          </div>
          <div className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-[#3B82F6] tracking-[-2px]">$0</p>
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
          <SectionH2 line1="&iquest;Tu consultorio vive as&iacute;?" line2="No tiene por qu&eacute;." />
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
          <SectionH2 line1="Un d&iacute;a en tu consultorio," line2="antes y despu&eacute;s." />
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
          <SectionH2 line1="Empez&aacute; en 3 pasos." line2="Simple como debe ser." />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="lv2-card-stagger lv2-card p-8 relative overflow-hidden"
              >
                <span className="absolute top-4 right-6 text-[#3B82F6]/[0.08] text-7xl font-bold leading-none pointer-events-none select-none">
                  {step.num}
                </span>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl lv2-icon-glow flex items-center justify-center mb-6">
                    <Icon size={24} className="text-[#3B82F6]" />
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
              src="/mockups/salud-services.webp"
              alt="Servicios médicos configurados — consultas, tratamientos y estudios"
              width={400}
              height={260}
              className="w-full h-auto"
            />
          </div>
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <Image
              src="/mockups/salud-mobile.webp"
              alt="Calendario de disponibilidad para pacientes en móvil"
              width={400}
              height={260}
              className="w-full h-auto"
            />
          </div>
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <Image
              src="/mockups/salud-hero.webp"
              alt="Vista completa del sistema de turnos para consultorio médico"
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
          <SectionH2 line1="Herramientas profesionales" line2="para tu pr&aacute;ctica." />
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
                  <Icon size={22} className="text-[#3B82F6]" />
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
          <SectionTag text="Especialidades" />
          <SectionH2 line1="Para profesionales que" line2="trabajan con agenda." />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            No importa si sos m&eacute;dico, psic&oacute;logo, abogado o contador. Si tu trabajo depende de una agenda, TurnoLink es para vos.
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
          <SectionH2 line1="&iquest;Cu&aacute;nto perd&eacute;s en" line2="horas vac&iacute;as?" />
          <p className="mt-5 text-white/50 max-w-xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            Cada paciente que no viene es una hora que no cobr&aacute;s. Con recordatorios y se&ntilde;as, la ecuaci&oacute;n cambia.
          </p>
        </div>

        <div className="lv2-card p-8 sm:p-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            {/* Sin TurnoLink */}
            <div className="text-center p-7 rounded-xl bg-red-500/[0.04] border border-red-500/[0.08]">
              <p className="text-sm text-red-400/70 font-medium mb-5 tracking-tight">Sin gesti&oacute;n de ausencias</p>
              <div className="space-y-2 text-white/45 text-sm">
                <p>~6 ausencias por semana</p>
                <p>Consulta promedio: $15.000</p>
              </div>
              <div className="mt-5 pt-5 border-t border-red-500/[0.08]">
                <p className="text-3xl text-red-400/80 font-normal tracking-[-1.5px]">
                  -$360.000
                </p>
                <p className="text-xs text-red-400/40 mt-1">perdidos por mes</p>
              </div>
            </div>

            {/* Con TurnoLink */}
            <div className="text-center p-7 rounded-xl bg-[#10B981]/[0.06] border border-[#10B981]/[0.15]">
              <p className="text-sm text-[#10B981] font-medium mb-5 tracking-tight">Con TurnoLink</p>
              <div className="space-y-2 text-white/45 text-sm">
                <p>~2 ausencias por semana (-70%)</p>
                <p>Consulta promedio: $15.000</p>
              </div>
              <div className="mt-5 pt-5 border-t border-[#10B981]/[0.12]">
                <p className="text-3xl text-[#10B981] font-normal tracking-[-1.5px]">
                  -$120.000
                </p>
                <p className="text-xs text-[#10B981]/50 mt-1">perdidos por mes</p>
              </div>
            </div>
          </div>

          {/* ROI Summary */}
          <div className="text-center border-t border-white/[0.06] pt-8">
            <p className="text-white/50 text-sm mb-2">Recuper&aacute;s</p>
            <p className="text-4xl sm:text-5xl text-white font-normal tracking-[-2px]">
              $240.000<span className="text-lg text-white/30 ml-1">/mes</span>
            </p>
            <p className="text-white/40 text-sm mt-4">
              Plan Starter: $16.990/mes &mdash;{' '}
              <span className="text-[#10B981] font-medium">ROI de 14x tu inversi&oacute;n</span>
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
          <SectionH2 line1="Lo que dicen profesionales" line2="que ya lo usan." />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="lv2-card-stagger lv2-card p-8 flex flex-col">
              <div className="mb-5">
                <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#3B82F6]/[0.1] border border-[#3B82F6]/[0.15] text-xs text-[#3B82F6] font-medium">
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
          <SectionH2 line1="Planes profesionales," line2="sin letra chica." />
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
                  <span className="text-[10px] font-bold text-white bg-[#3B82F6] px-3 py-1 rounded-md tracking-wide uppercase">
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
                    <Check size={16} className="text-[#3B82F6] mt-0.5 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`mt-8 w-full text-center py-3 rounded-[10px] text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  tier.popular
                    ? 'lv2-glow-btn bg-[#3B82F6] text-white'
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
            className="text-sm text-[#3B82F6] hover:text-[#60A5FA] transition-colors duration-300"
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
              Respuestas a las dudas m&aacute;s comunes de m&eacute;dicos, profesionales de la salud y estudios profesionales.
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

export function SaludLanding() {
  return (
    <div
      className="min-h-screen bg-black text-white selection:bg-[#3B82F6]/30 selection:text-white"
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
        headline="Tu consultorio merece una agenda profesional"
        subtitle="empez&aacute; en 5 minutos."
        description="Prob&aacute; TurnoLink 14 d&iacute;as gratis. Configur&aacute; tus consultas, activ&aacute; recordatorios y empez&aacute; a recibir pacientes con agenda autom&aacute;tica."
      />
      <Footer />
    </div>
  );
}
