'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Shield,
  Zap,
  Globe,
  Building2,
  CalendarCheck,
  CreditCard,
  Bell,
  TrendingUp,
  BarChart3,
  Target,
  Star,
  Users,
  AlertTriangle,
  Clock,
  HelpCircle,
  BarChart,
  UserX,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from './_components/hooks';
import { WordReveal, SectionTag, SectionH2, WHATSAPP_URL } from './_components/ui';
import { Navbar } from './_components/navbar';
import { Footer } from './_components/footer';
import { CTASection } from './_components/cta-section';

/* ═══════════════════════════════════════
   1. HERO
   ═══════════════════════════════════════ */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-28 lg:pt-32 pb-8 px-5 lg:px-10 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] rounded-full bg-[#3F8697]/[0.07] blur-[180px]" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[#3F8697]/[0.05] blur-[140px] lv2-glow-orb" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
      </div>

      <div className="max-w-[1000px] mx-auto text-center relative z-10">
        <div className="mb-8">
          <span className="lv2-pill inline-flex items-center px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm text-white/80">
            +500 negocios ya gestionan con TurnoLink
          </span>
        </div>

        <h1 className="text-[7.5vw] sm:text-[56px] lg:text-[86px] font-normal leading-[1.05] lg:leading-[90px] tracking-[-2px] lg:tracking-[-3.8px] mb-6">
          <span className="text-white block whitespace-nowrap">Tus turnos y servicios</span>
          <span className="text-white/60 block mt-1 whitespace-nowrap">en piloto automático.</span>
        </h1>

        <p className="text-base sm:text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed tracking-[-0.2px]">
          <WordReveal text="Agenda inteligente, cobro automático, recordatorios y control financiero. Todo en una sola plataforma." />
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="lv2-glow-btn bg-[#3F8697] text-white font-medium px-8 py-3.5 rounded-[10px] text-base flex items-center gap-2"
          >
            Empezar gratis
            <ArrowRight size={18} />
          </Link>
          <Link
            href="#como-funciona"
            className="lv2-glass text-white/80 font-medium px-8 py-3.5 rounded-[10px] text-base flex items-center gap-2"
          >
            Ver qué incluye
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-white/40">
          <span className="flex items-center gap-1.5">
            <Zap size={14} className="text-[#3F8697]" /> Listo en 3 minutos
          </span>
          <span className="flex items-center gap-1.5">
            <Shield size={14} className="text-[#3F8697]" /> Sin tarjeta requerida
          </span>
          <span className="flex items-center gap-1.5">
            <Globe size={14} className="text-[#3F8697]" /> Soporte en tiempo real
          </span>
        </div>
      </div>

      {/* Hero mockup */}
      <div className="max-w-[1000px] mx-auto mt-16 w-full lv2-hero-img relative">
        <div className="absolute -inset-8 bg-[#3F8697]/[0.06] rounded-[40px] blur-[60px] pointer-events-none" />
        <div className="lv2-mockup-wrapper lv2-gradient-border relative">
          <div className="lv2-mockup-frame relative">
            <div className="bg-[#0D0D0D] px-4 py-3 flex items-center gap-2 border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
              </div>
              <div className="flex-1 mx-8">
                <div className="bg-white/[0.05] rounded-md h-6 max-w-xs mx-auto flex items-center justify-center">
                  <span className="text-[11px] text-white/30 tracking-tight">app.turnolink.com/dashboard</span>
                </div>
              </div>
            </div>
            <Image
              src="/mockups/turnos-dark.webp"
              alt="TurnoLink — Agenda de turnos y servicios"
              width={1200}
              height={700}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   2. TRUST STRIP
   ═══════════════════════════════════════ */
function TrustStrip() {
  const stats = [
    { value: '+500', label: 'negocios activos', icon: Building2 },
    { value: '+25K', label: 'turnos gestionados', icon: CalendarCheck },
    { value: '+40', label: 'industrias', icon: Globe },
    { value: '0%', label: 'comisión', icon: Shield },
  ];

  return (
    <div className="py-12 lg:py-16 relative">
      <div className="lv2-section-divider mb-12" />
      <div className="max-w-[1200px] mx-auto px-5 lg:px-10 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="text-center group">
              <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3 group-hover:border-[#3F8697]/30 group-hover:bg-[#3F8697]/10 transition-all duration-300">
                <Icon size={18} className="text-white/30 group-hover:text-[#3F8697] transition-colors duration-300" />
              </div>
              <span className="text-white font-semibold text-2xl sm:text-3xl tracking-[-1.5px] block">{s.value}</span>
              <span className="text-white/35 text-sm tracking-tight mt-1 block">{s.label}</span>
            </div>
          );
        })}
      </div>
      <div className="lv2-section-divider mt-12" />
    </div>
  );
}

/* ═══════════════════════════════════════
   3. PROBLEMAS
   ═══════════════════════════════════════ */
const PROBLEMS = [
  {
    icon: Clock,
    title: 'Turnos por WhatsApp todo el día',
    desc: 'Mensajes a cualquier hora, ida y vuelta para coordinar horarios, clientes que no confirman. Perdés tiempo en cada reserva.',
    cost: 'Horas perdidas en coordinación manual',
  },
  {
    icon: AlertTriangle,
    title: 'Clientes que no se presentan',
    desc: 'Sin recordatorios automáticos ni seña, los ausentes son moneda corriente. Tu agenda queda con huecos que no recuperás.',
    cost: 'Hasta 30% de turnos perdidos',
  },
  {
    icon: BarChart,
    title: 'No sabés si ganás o perdés',
    desc: 'Las cuentas no cierran. No tenés visibilidad real de cuánto facturás, cuánto gastás ni cuál es tu margen.',
    cost: 'Decisiones a ciegas = plata que se pierde',
  },
  {
    icon: HelpCircle,
    title: 'Agenda en cuadernos o Excel',
    desc: 'Información dispersa, solapamientos, turnos que se pisan. Cada error es un cliente que no vuelve.',
    cost: 'Errores que cuestan clientes',
  },
  {
    icon: UserX,
    title: 'Clientes de una sola vez',
    desc: 'No hacés seguimiento, no sabés cuándo vinieron la última vez ni qué servicio eligieron. Cada turno es empezar de cero.',
    cost: 'Cuesta 5x más conseguir uno nuevo',
  },
  {
    icon: Users,
    title: 'Equipo sin organización',
    desc: 'No sabés quién tiene turnos, quién está libre, ni cómo distribuir la carga. Cada empleado maneja su parte por separado.',
    cost: 'Cero visibilidad = cero control',
  },
];

function ProblemsSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 80);

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="El problema" />
          <SectionH2
            line1="Si tu negocio funciona así,"
            line2="está perdiendo plata."
          />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            Estos problemas parecen normales, pero tienen un costo enorme en tiempo, dinero y clientes.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROBLEMS.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className="lv2-card-stagger lv2-bento-card p-6 group">
                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-red-500/10 group-hover:bg-red-500/20 transition-all duration-300">
                    <Icon size={20} className="text-red-400/70" />
                  </div>
                  <h3 className="text-white font-medium text-base tracking-[-0.3px] mb-2">{p.title}</h3>
                  <p className="text-white/40 text-[14px] leading-[22px] tracking-[-0.2px] mb-4">{p.desc}</p>
                  <p className="text-red-400/60 text-xs font-medium">{p.cost}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <p className="text-white/60 text-lg tracking-[-0.3px]">
            TurnoLink resuelve todo eso.{' '}
            <span className="text-[#3F8697] font-medium">Desde el primer día.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   4. FUNCIONALIDADES — Solo turnos/servicios + finanzas como herramienta
   ═══════════════════════════════════════ */
const FEATURES: { icon: LucideIcon; title: string; desc: string; tag: string }[] = [
  { icon: CalendarCheck, title: 'Agenda inteligente', desc: 'Disponibilidad por hora, bloque o día. Se adapta a cualquier tipo de servicio.', tag: 'Turnos' },
  { icon: CreditCard, title: 'Cobro de señas', desc: 'Mercado Pago integrado. Tu cliente paga al reservar, 0% de comisión.', tag: 'Turnos' },
  { icon: Bell, title: 'Recordatorios automáticos', desc: 'Email, push y WhatsApp para que tus clientes no falten.', tag: 'Turnos' },
  { icon: Globe, title: 'Página pública de tu negocio', desc: 'Link personalizado donde tus clientes ven servicios y reservan solos.', tag: 'Turnos' },
  { icon: Smartphone, title: 'Reservas desde cualquier dispositivo', desc: 'Tus clientes agendan desde el celular, tablet o computadora. Sin descargas.', tag: 'Turnos' },
  { icon: Star, title: 'CRM de clientes', desc: 'Historial completo: turnos, pagos, contacto y preferencias.', tag: 'Gestión' },
  { icon: Users, title: 'Equipo y permisos', desc: 'Empleados con roles, horarios propios y permisos por módulo.', tag: 'Gestión' },
  { icon: Building2, title: 'Multi-sucursal', desc: 'Cada sede con su configuración, horarios y equipo.', tag: 'Gestión' },
  { icon: TrendingUp, title: 'Dashboard financiero', desc: 'Ingresos, gastos, margen y proyecciones en tiempo real.', tag: 'Finanzas' },
  { icon: BarChart3, title: 'Reportes por período', desc: 'Rentabilidad por sucursal, servicio o mes.', tag: 'Finanzas' },
  { icon: Target, title: 'Metas y alertas', desc: 'Objetivos de facturación y alertas automáticas.', tag: 'Finanzas' },
];

const TAG_COLORS: Record<string, string> = {
  Turnos: '#3F8697',
  Gestión: '#8B5CF6',
  Finanzas: '#22C55E',
};

function FeaturesSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 60);

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} id="funcionalidades" className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10 relative">
      <div className="absolute inset-0 lv2-gradient-mesh pointer-events-none" />
      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="text-center mb-16">
          <SectionTag text="Funcionalidades" />
          <SectionH2
            line1="Todo lo que necesitás"
            line2="para gestionar tus turnos."
          />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            Cada funcionalidad fue diseñada escuchando a comerciantes reales. Sin features de relleno, solo lo que usás.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map((f, i) => {
            const color = TAG_COLORS[f.tag] || '#3F8697';
            return (
              <div key={i} className="lv2-card-stagger lv2-bento-card p-6 group">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{ background: `linear-gradient(135deg, ${color}20, ${color}08)` }}
                    >
                      <f.icon size={18} style={{ color }} />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color }}>{f.tag}</span>
                  </div>
                  <h3 className="text-white font-medium text-[15px] tracking-[-0.3px] mb-1">{f.title}</h3>
                  <p className="text-white/40 text-[13px] leading-[20px] tracking-[-0.2px]">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   5. CÓMO FUNCIONA
   ═══════════════════════════════════════ */
function HowItWorksSection() {
  const sectionRef = useScrollReveal();

  const steps = [
    {
      num: '01',
      title: 'Creá tu cuenta gratis',
      desc: 'Registrate en 30 segundos con tu email. Sin tarjeta, sin compromiso, sin letra chica.',
    },
    {
      num: '02',
      title: 'Configurá tus servicios',
      desc: 'Cargá tus servicios, horarios y equipo. Personalizá tu página pública. Te guiamos paso a paso.',
    },
    {
      num: '03',
      title: 'Tus clientes reservan solos',
      desc: 'Compartí tu link. Tus clientes eligen día, hora y pagan la seña. Vos solo atendés.',
    },
  ];

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} id="como-funciona" className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10">
      <div className="max-w-[900px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Cómo funciona" />
          <SectionH2
            line1="Arrancá en minutos,"
            line2="no en semanas."
          />
        </div>

        <div className="space-y-6">
          {steps.map((step, i) => (
            <div key={i} className="lv2-bento-card p-8 flex items-start gap-6 group">
              <div className="relative z-10 flex items-start gap-6 w-full">
                <div className="w-14 h-14 rounded-2xl bg-[#3F8697]/10 border border-[#3F8697]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#3F8697]/20 transition-all duration-300">
                  <span className="text-[#3F8697] font-semibold text-lg">{step.num}</span>
                </div>
                <div>
                  <h3 className="text-white font-medium text-lg tracking-[-0.3px] mb-2">{step.title}</h3>
                  <p className="text-white/45 text-[15px] leading-[24px] tracking-[-0.2px]">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   6. PRECIOS — 2 planes simples
   ═══════════════════════════════════════ */
function PricingSection() {
  const sectionRef = useScrollReveal();

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} id="precios" className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10">
      <div className="max-w-[900px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Precios" />
          <SectionH2
            line1="Empezá gratis."
            line2="Escalá cuando quieras."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Free */}
          <div className="lv2-bento-card p-8 flex flex-col">
            <div className="relative z-10 flex flex-col h-full">
              <h3 className="text-white font-medium text-lg tracking-[-0.3px] mb-1">Gratis</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-white text-4xl font-semibold tracking-[-2px]">$0</span>
                <span className="text-white/30 text-sm">/mes</span>
              </div>
              <p className="text-white/40 text-sm mb-6">Para arrancar sin riesgo.</p>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Hasta 30 turnos/mes',
                  'Cobros con Mercado Pago',
                  'Página pública de tu negocio',
                  'Recordatorios automáticos',
                  'Dashboard financiero',
                  '1 usuario',
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-white/50 text-sm">
                    <div className="w-4 h-4 rounded-full bg-[#3F8697]/15 flex items-center justify-center flex-shrink-0">
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="#3F8697" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="w-full text-center py-3 rounded-[10px] border border-white/[0.1] text-white/70 font-medium text-sm hover:border-[#3F8697]/40 hover:text-white transition-all duration-300"
              >
                Crear cuenta gratis
              </Link>
            </div>
          </div>

          {/* Pro */}
          <div className="lv2-bento-card p-8 flex flex-col relative overflow-hidden" style={{ borderColor: '#3F869740' }}>
            <div className="absolute top-4 right-4 bg-[#3F8697] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full z-20">
              Popular
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <h3 className="text-white font-medium text-lg tracking-[-0.3px] mb-1">Pro</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-white/40 text-sm">Desde</span>
                <span className="text-white text-4xl font-semibold tracking-[-2px]">$8.990</span>
                <span className="text-white/30 text-sm">/mes</span>
              </div>
              <p className="text-white/40 text-sm mb-6">Todo lo que tu negocio necesita.</p>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Turnos ilimitados',
                  'Usuarios ilimitados + roles',
                  'Multi-sucursal',
                  'Mercado Pago integrado',
                  'Recordatorios por WhatsApp',
                  'Reportes y proyecciones financieras',
                  'CRM de clientes',
                  'Soporte prioritario',
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-white/50 text-sm">
                    <div className="w-4 h-4 rounded-full bg-[#3F8697]/15 flex items-center justify-center flex-shrink-0">
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="#3F8697" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="lv2-glow-btn w-full text-center py-3 rounded-[10px] bg-[#3F8697] text-white font-medium text-sm"
              >
                Empezar con Pro
              </Link>
              <p className="text-center text-white/25 text-xs mt-3">14 días gratis. Cancelá cuando quieras.</p>
            </div>
          </div>
        </div>

        <p className="text-center text-white/30 text-sm mt-8">
          Los precios varían según tu industria.{' '}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#3F8697] hover:text-[#4a9db0] transition-colors duration-300"
          >
            Consultá el plan ideal para tu rubro →
          </a>
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   7. TESTIMONIOS
   ═══════════════════════════════════════ */
const TESTIMONIALS = [
  {
    quote: 'Antes tenía todo en un cuaderno y perdía turnos cada semana. Ahora mis clientes reservan solos y yo me enfoco en trabajar.',
    name: 'Camila Rodríguez',
    role: 'Dueña',
    business: 'Studio de Pestañas — Palermo',
  },
  {
    quote: 'Lo que más me sirvió fue el cobro de seña. Desde que los clientes pagan al reservar, las ausencias bajaron a casi cero.',
    name: 'Martín García',
    role: 'Propietario',
    business: 'Barbería Clásica — Córdoba',
  },
  {
    quote: 'Gestiono 3 sucursales desde una sola cuenta. Veo los turnos, la plata y el equipo en tiempo real sin moverme de casa.',
    name: 'Laura Sánchez',
    role: 'Socia',
    business: 'Centro de Estética — Buenos Aires',
  },
];

function TestimonialsSection() {
  const sectionRef = useScrollReveal();

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Testimonios" />
          <SectionH2
            line1="Negocios reales,"
            line2="resultados reales."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="lv2-bento-card p-8 flex flex-col">
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex gap-0.5 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-white/50 text-[15px] leading-[26px] tracking-[-0.2px] flex-1 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="border-t border-white/[0.06] pt-4">
                  <p className="text-white font-medium text-sm tracking-tight">{t.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">{t.role} · {t.business}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   8. FAQ
   ═══════════════════════════════════════ */
const FAQS = [
  {
    q: '¿Necesito conocimientos técnicos para usar TurnoLink?',
    a: 'No. TurnoLink fue diseñado para ser intuitivo. Si sabés usar WhatsApp, sabés usar TurnoLink. Además tenés soporte humano siempre disponible.',
  },
  {
    q: '¿Puedo probarlo gratis antes de pagar?',
    a: 'Sí. Tenés un plan gratuito para siempre y 14 días gratis del plan Pro. Sin tarjeta de crédito requerida.',
  },
  {
    q: '¿Funciona en celular?',
    a: 'Sí. TurnoLink funciona desde cualquier navegador, en celular, tablet o computadora. No necesitás instalar nada.',
  },
  {
    q: '¿Sirve para mi tipo de negocio?',
    a: 'TurnoLink funciona con cualquier negocio que gestione servicios con turnos: belleza, salud, deportes, profesionales y más. Cada rubro tiene planes adaptados a sus necesidades.',
  },
  {
    q: '¿Cómo funciona el cobro de señas?',
    a: 'Conectás tu cuenta de Mercado Pago con un click. Configurás el porcentaje de seña. Cuando un cliente reserva, paga automáticamente y el dinero va directo a tu cuenta. 0% de comisión.',
  },
  {
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Sí. Sin contratos, sin permanencia. Si decidís cancelar, tu cuenta simplemente vuelve al plan Gratis con sus límites.',
  },
];

function FAQSection() {
  const sectionRef = useScrollReveal();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = useCallback(
    (i: number) => setOpenIdx((prev) => (prev === i ? null : i)),
    [],
  );

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} id="faq" className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10">
      <div className="max-w-[800px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Preguntas frecuentes" />
          <SectionH2
            line1="¿Tenés dudas?"
            line2="Acá las respondemos."
          />
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
                  <p className="text-white/50 text-[15px] leading-[26px] tracking-[-0.2px]">{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════ */
export default function LandingV2Page() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#3F8697]/30 selection:text-white" style={{ overflowX: 'clip' }}>
      <Navbar />
      <HeroSection />
      <TrustStrip />
      <ProblemsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection
        headline="Dejá de perder turnos."
        subtitle="Empezá a crecer."
        description="Creá tu cuenta en 30 segundos y descubrí cómo se siente tener tus turnos, clientes y finanzas bajo control."
      />
      <Footer />

      {/* WhatsApp FAB */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:scale-110 hover:shadow-[0_6px_28px_rgba(37,211,102,0.5)] transition-all duration-300"
      >
        <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
}
