'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Clock,
  CreditCard,
  LayoutDashboard,
  Timer,
  CalendarCheck,
  Check,
  ArrowRight,
  Shield,
  Zap,
  Star,
  Globe,
  Smartphone,
  Scissors,
  HeartPulse,
  Trophy,
  BedDouble,
  Home,
  Briefcase,
  Building2,
  Users,
  Bell,
  Sparkles,
  Dumbbell,
  Wrench,
  ShoppingBag,
  MapPin,
  Scale,
  TrendingUp,
  BarChart3,
  Target,
  Package,
  DollarSign,
  type LucideIcon,
} from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from './_components/hooks';
import { WordReveal, SectionTag, SectionH2, GlassLine, WHATSAPP_URL } from './_components/ui';
import { Navbar } from './_components/navbar';
import { Footer } from './_components/footer';
import { CTASection } from './_components/cta-section';
import { LANDING_FAQS } from './_data/landing-faqs';

/* Navbar imported from ./_components/navbar */

/* ═════════════════════════════════════════
   HERO — Cambio 1: De descripción a autoridad
   ═════════════════════════════════════════ */
const HERO_SLIDES = [
  { url: 'app.turnolink.com/dashboard', type: 'image' as const, src: '/mockups/turnos-dark.webp' },
  { url: 'app.turnolink.com/mercado', type: 'mockup' as const, component: 'products' as const },
  { url: 'app.turnolink.com/finanzas', type: 'mockup' as const, component: 'finance' as const },
];

function HeroSection() {
  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-28 lg:pt-32 pb-8 px-5 lg:px-10 overflow-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] rounded-full bg-[#3F8697]/[0.07] blur-[180px]" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[#3F8697]/[0.05] blur-[140px] lv2-glow-orb" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[#3F8697]/[0.04] blur-[100px] lv2-glow-orb" style={{ animationDelay: '3s' }} />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
      </div>

      <div className="max-w-[1000px] mx-auto text-center relative z-10">
        {/* Tag — nuevo */}
        <div className="mb-8">
          <span className="lv2-pill inline-flex items-center px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm text-white/80">
            Plataforma integral para comercios
          </span>
        </div>

        {/* H1 — nuevo: autoridad */}
        <h1 className="text-[7.5vw] sm:text-[56px] lg:text-[86px] font-normal leading-[1.05] lg:leading-[90px] tracking-[-2px] lg:tracking-[-3.8px] mb-6">
          <span className="text-white block whitespace-nowrap">Todo tu negocio.</span>
          <span className="text-white/60 block mt-1 whitespace-nowrap">Una sola plataforma.</span>
        </h1>

        {/* Subtitle — nuevo: 6 capacidades concretas */}
        <p className="text-base sm:text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed tracking-[-0.2px]">
          <WordReveal text="Gestioná tu agenda, vendé online y controlá tus finanzas. +500 comercios ya operan todo su negocio desde acá." />
        </p>

        {/* CTAs — mantener */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="lv2-glow-btn bg-[#3F8697] text-white font-medium px-8 py-3.5 rounded-[10px] text-base flex items-center gap-2"
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

        {/* Trust signals — mantener */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-white/40">
          <span className="flex items-center gap-1.5">
            <Zap size={14} className="text-[#3F8697]" /> Configuraci&oacute;n en 5 min
          </span>
          <span className="flex items-center gap-1.5">
            <Shield size={14} className="text-[#3F8697]" /> Sin tarjeta de cr&eacute;dito
          </span>
          <span className="flex items-center gap-1.5">
            <Globe size={14} className="text-[#3F8697]" /> Soporte en espa&ntilde;ol
          </span>
        </div>
      </div>

      {/* Hero product mockup — rotativo 3 pilares */}
      <div className="max-w-[1000px] mx-auto mt-16 w-full lv2-hero-img relative">
        {/* Decorative glow behind mockup */}
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
                  <span className="text-[11px] text-white/30 tracking-tight transition-all duration-500">{HERO_SLIDES[heroSlide].url}</span>
                </div>
              </div>
            </div>
            <div className="relative min-h-[200px] sm:min-h-[350px] lg:min-h-[500px]">
              {HERO_SLIDES.map((slide, idx) => (
                <div
                  key={idx}
                  className={`transition-opacity duration-600 ${idx === 0 ? '' : 'absolute inset-0'} ${heroSlide === idx ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                  {slide.type === 'image' ? (
                    <Image
                      src={slide.src!}
                      alt="TurnoLink Dashboard — Plataforma integral para comercios"
                      width={1200}
                      height={700}
                      className="w-full h-auto"
                      priority={idx === 0}
                    />
                  ) : (
                    <div className="p-6 sm:p-10 lg:p-16">
                      {slide.component === 'products' ? <ProductGridMockup /> : <FinanceDashboardMockup />}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Slide indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setHeroSlide(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${heroSlide === idx ? 'bg-[#3F8697] w-4' : 'bg-white/20'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Floating badge — left */}
        <div className="hidden lg:flex lv2-badge-float absolute -left-8 top-1/3 bg-[#0D0D0D] rounded-2xl p-4 items-center gap-3 border border-white/[0.06] shadow-[rgba(63,134,151,0.3)_0px_8px_30px]">
          <div className="w-10 h-10 rounded-xl lv2-icon-glow flex items-center justify-center">
            <CreditCard size={20} className="text-[#3F8697]" />
          </div>
          <div>
            <p className="text-white text-sm font-medium tracking-tight">Cobro autom&aacute;tico</p>
            <p className="text-white/40 text-xs">Mercado Pago integrado</p>
          </div>
        </div>

        {/* Floating badge — right */}
        <div
          className="hidden lg:flex lv2-badge-float absolute -right-6 top-1/2 bg-[#0D0D0D] rounded-2xl p-4 items-center gap-3 border border-white/[0.06] shadow-[rgba(63,134,151,0.25)_0px_8px_30px]"
          style={{ animationDelay: '1.5s' }}
        >
          <div className="w-10 h-10 rounded-xl lv2-icon-glow flex items-center justify-center">
            <LayoutDashboard size={20} className="text-[#3F8697]" />
          </div>
          <div>
            <p className="text-white text-sm font-medium tracking-tight">Todo integrado</p>
            <p className="text-white/40 text-xs">Agenda &middot; Tienda &middot; CRM &middot; Finanzas</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════
   TRUST STRIP — Cambio 2: Reemplaza MarqueeSection
   ═════════════════════════════════════════ */
function TrustStrip() {
  const stats = [
    { value: '+500', label: 'negocios activos', icon: Building2 },
    { value: '+25K', label: 'operaciones', icon: Zap },
    { value: '+40', label: 'industrias', icon: LayoutDashboard },
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

/* ═════════════════════════════════════════
   INDUSTRY MARQUEE — Sub-industrias scrolleando
   ═════════════════════════════════════════ */
// Fila 1 — rubros core de alto impacto: belleza, salud, deportes
const MARQUEE_ROW1 = [
  { pill: 'Peluquerías', href: '/belleza/peluquerias' },
  { pill: 'Barberías', href: '/belleza/barberias' },
  { pill: 'Psicólogos', href: '/salud/psicologos' },
  { pill: 'Canchas de Fútbol', href: '/deportes/canchas-de-futbol' },
  { pill: 'Centros de Estética', href: '/belleza/centros-de-estetica' },
  { pill: 'Odontólogos', href: '/salud/odontologos' },
  { pill: 'Canchas de Pádel', href: '/deportes/canchas-de-padel' },
  { pill: 'Spa & Relax', href: '/belleza/spa-relax' },
  { pill: 'Nutricionistas', href: '/salud/nutricionistas' },
  { pill: 'Consultorios Médicos', href: '/salud/consultorios-medicos' },
  { pill: 'Uñas & Nail Bars', href: '/belleza/unas-nail-bars' },
  { pill: 'Gimnasios por Clase', href: '/deportes/gimnasios-por-clase' },
  { pill: 'Masajes', href: '/belleza/masajes' },
  { pill: 'Kinesiólogos', href: '/salud/kinesiologos' },
  { pill: 'Pestañas & Cejas', href: '/belleza/pestanas-cejas' },
  { pill: 'Tenis', href: '/deportes/tenis' },
  { pill: 'Depilación', href: '/belleza/depilacion' },
  { pill: 'Fonoaudiólogos', href: '/salud/fonoaudiologos' },
  { pill: 'Entrenadores Personales', href: '/deportes/entrenadores-personales' },
  { pill: 'Cosmetología', href: '/belleza/cosmetologia' },
  { pill: 'Ropa y Accesorios', href: '/mercado/ropa-y-accesorios' },
  { pill: 'Electrónica', href: '/mercado/electronica' },
  { pill: 'Bronceado', href: '/belleza/bronceado' },
  { pill: 'Alimentos y Bebidas', href: '/mercado/alimentos-y-bebidas' },
  { pill: 'Joyería', href: '/mercado/joyeria' },
];

// Fila 2 — profesionales, espacios, alquiler, hospedaje
const MARQUEE_ROW2 = [
  { pill: 'Abogados', href: '/turnos-profesionales#abogados' },
  { pill: 'Coworking', href: '/espacios-flexibles/coworking' },
  { pill: 'Cabañas', href: '/alquiler-temporario/cabanas' },
  { pill: 'Contadores', href: '/turnos-profesionales#contadores' },
  { pill: 'Salas de Reuniones', href: '/espacios-flexibles/salas-de-reuniones' },
  { pill: 'Albergues Transitorios', href: '/hospedaje-por-horas/albergues-transitorios' },
  { pill: 'Escribanos', href: '/turnos-profesionales#escribanos' },
  { pill: 'Oficinas por Hora', href: '/espacios-flexibles/oficinas-por-hora' },
  { pill: 'Departamentos Temporarios', href: '/alquiler-temporario/departamentos-temporarios' },
  { pill: 'Estudios de Danza', href: '/deportes/estudios-de-danza' },
  { pill: 'Hoteles por Turno', href: '/hospedaje-por-horas/hoteles-por-turno' },
  { pill: 'Básquet', href: '/deportes/basquet' },
  { pill: 'Boxes Profesionales', href: '/espacios-flexibles/boxes-profesionales' },
  { pill: 'Casas Quinta', href: '/alquiler-temporario/casas-quinta' },
  { pill: 'Salas de Ensayo', href: '/deportes/salas-de-ensayo' },
  { pill: 'Estudios de Grabación', href: '/deportes/estudios-de-grabacion' },
  { pill: 'Salones por Día', href: '/alquiler-temporario/salones-por-dia' },
  { pill: 'Hostels por Bloque', href: '/hospedaje-por-horas/hostels-por-bloque' },
  { pill: 'Estudios Compartidos', href: '/espacios-flexibles/estudios-compartidos' },
  { pill: 'Quinchos', href: '/alquiler-temporario/quinchos' },
  { pill: 'Espacios para Eventos', href: '/alquiler-temporario/espacios-para-eventos' },
  { pill: 'Campos Recreativos', href: '/alquiler-temporario/campos-recreativos' },
  { pill: 'Habitaciones 12hs', href: '/hospedaje-por-horas/habitaciones-12hs' },
  { pill: 'Boxes Privados', href: '/hospedaje-por-horas/boxes-privados' },
  { pill: 'Restaurantes', href: '/gastronomia' },
  { pill: 'Bares', href: '/gastronomia' },
  { pill: 'Cafeterías', href: '/gastronomia' },
  { pill: 'Pizzerías', href: '/gastronomia' },
  { pill: 'Cosméticos', href: '/mercado/cosmeticos' },
  { pill: 'Artesanías', href: '/mercado/artesanias' },
  { pill: 'Decoración y Hogar', href: '/mercado/decoracion' },
  { pill: 'Indumentaria', href: '/mercado/ropa-y-accesorios' },
  { pill: 'Accesorios', href: '/mercado/ropa-y-accesorios' },
];

function IndustryMarquee() {
  return (
    <section className="lv2-industry-section py-14 lg:py-20">
      {/* Living light orbs — live OUTSIDE overflow:hidden so they bleed naturally */}
      <div className="lv2-orb lv2-orb-1" />
      <div className="lv2-orb lv2-orb-2" />
      <div className="lv2-orb lv2-orb-3" />

      <div className="max-w-[1200px] mx-auto px-5 lg:px-10 mb-8 text-center relative z-[2]">
        <p className="text-sm text-white/40 tracking-wide uppercase">
          Más de 40 industrias ya digitalizaron su negocio con TurnoLink
        </p>
      </div>
      <div className="lv2-industry-marquee">
        <div className="lv2-industry-fade-l" />
        <div className="lv2-industry-fade-r" />

        {/* Row 1 — alto impacto: belleza, salud, deportes */}
        <div className="lv2-marquee-row forward mb-3">
          {[...MARQUEE_ROW1, ...MARQUEE_ROW1].map((item, i) => (
            <Link key={i} href={item.href} className="lv2-industry-pill">
              {item.pill}
            </Link>
          ))}
        </div>

        {/* Row 2 — profesionales, espacios, alquiler, hospedaje */}
        <div className="lv2-marquee-row reverse">
          {[...MARQUEE_ROW2, ...MARQUEE_ROW2].map((item, i) => (
            <Link key={i} href={item.href} className="lv2-industry-pill">
              {item.pill}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════
   PLATAFORMA — Cambio 3: Reemplaza Problema + Solución
   8 capability cards
   ═════════════════════════════════════════ */
const CAPABILITY_PILAR_ACCENT: Record<string, string> = {
  Servicios: '#3F8697',
  Mercado: '#F59E0B',
  Finanzas: '#22C55E',
  Plataforma: '#8B5CF6',
};

const CAPABILITIES = [
  // — Pilar: Servicios —
  {
    icon: CalendarCheck,
    title: 'Agenda inteligente',
    desc: 'Organizá tu disponibilidad por hora, bloque o día. Se adapta a cualquier tipo de servicio.',
    pilar: 'Servicios',
  },
  {
    icon: CreditCard,
    title: 'Cobros integrados',
    desc: 'Mercado Pago con un click. 0% de comisión. El dinero va directo a tu cuenta.',
    pilar: 'Servicios',
  },
  {
    icon: Bell,
    title: 'Recordatorios automáticos',
    desc: 'Push, WhatsApp y email. Tus clientes no se olvidan, vos no perdés tiempo.',
    pilar: 'Servicios',
  },
  // — Pilar: Mercado —
  {
    icon: ShoppingBag,
    title: 'Tienda online integrada',
    desc: 'Catálogo de productos con fotos, precios y stock. Tus clientes compran 24/7.',
    pilar: 'Mercado',
  },
  {
    icon: Globe,
    title: 'Catálogo o e-commerce',
    desc: 'Modo catálogo con WhatsApp o carrito completo con checkout y Mercado Pago.',
    pilar: 'Mercado',
  },
  {
    icon: Smartphone,
    title: 'Página de tu negocio',
    desc: 'Link personalizado con tu marca. Servicios y productos en un solo lugar.',
    pilar: 'Mercado',
  },
  // — Pilar: Finanzas —
  {
    icon: TrendingUp,
    title: 'Dashboard financiero',
    desc: 'Ingresos, gastos, margen y proyecciones. Todo en tiempo real.',
    pilar: 'Finanzas',
  },
  {
    icon: BarChart3,
    title: 'Reportes por período',
    desc: 'Rentabilidad por sucursal, servicio o mes. Proyectá los próximos meses.',
    pilar: 'Finanzas',
  },
  {
    icon: Target,
    title: 'Metas y alertas',
    desc: 'Objetivos de facturación y alertas cuando los gastos superan el límite.',
    pilar: 'Finanzas',
  },
  // — Transversales —
  {
    icon: Star,
    title: 'CRM de clientes',
    desc: 'Historial completo: servicios, compras, pagos. Base de datos unificada.',
    pilar: 'Plataforma',
  },
  {
    icon: Building2,
    title: 'Multi-sucursal',
    desc: 'Cada sede con su configuración, horarios, productos y equipo.',
    pilar: 'Plataforma',
  },
  {
    icon: Users,
    title: 'Equipo y permisos',
    desc: 'Empleados con roles, horarios propios y permisos por módulo.',
    pilar: 'Plataforma',
  },
];

function PlataformaSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 80);

  // Group capabilities by pilar
  const pilars = ['Servicios', 'Mercado', 'Finanzas', 'Plataforma'] as const;
  const pilarMeta: Record<string, { label: string; desc: string }> = {
    Servicios: { label: '⏰ Servicios', desc: 'Gestión de agenda y clientes' },
    Mercado: { label: '🛍 Mercado', desc: 'Tienda y catálogo online' },
    Finanzas: { label: '📊 Finanzas', desc: 'Control financiero total' },
    Plataforma: { label: '⚙️ Plataforma', desc: 'Infraestructura del negocio' },
  };

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} id="plataforma" className="lv2-section py-[100px] lg:py-[140px] px-5 lg:px-10 relative">
      {/* Section background */}
      <div className="absolute inset-0 lv2-gradient-mesh pointer-events-none" />

      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="text-center mb-16">
          <SectionTag text="Plataforma" />
          <SectionH2
            line1="Todo lo que necesitás"
            line2="para operar tu negocio."
          />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            Agenda, tienda online, finanzas, CRM, multi-sucursal y más. Un solo sistema que reemplaza 5 herramientas.
          </p>
        </div>

        {/* Grouped by pilar with visual hierarchy */}
        <div ref={cardsRef} className="space-y-6">
          {pilars.map((pilar) => {
            const accent = CAPABILITY_PILAR_ACCENT[pilar] || '#3F8697';
            const caps = CAPABILITIES.filter(c => c.pilar === pilar);
            const meta = pilarMeta[pilar];
            return (
              <div key={pilar} className="lv2-card-stagger">
                {/* Pilar header */}
                <div className="flex items-center gap-3 mb-4 px-1">
                  <div className="h-px flex-1 max-w-[40px]" style={{ background: `${accent}30` }} />
                  <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: `${accent}` }}>{meta.label}</span>
                  <span className="text-white/25 text-[11px] hidden sm:inline">— {meta.desc}</span>
                  <div className="h-px flex-1" style={{ background: `${accent}15` }} />
                </div>
                {/* Cards row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {caps.map((c, i) => (
                    <div
                      key={i}
                      className="lv2-bento-card p-6 sm:p-7 group"
                    >
                      <div className="relative z-10">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                          style={{ background: `linear-gradient(135deg, ${accent}20, ${accent}08)`, boxShadow: `0 4px 20px ${accent}15` }}
                        >
                          <c.icon size={22} style={{ color: accent }} />
                        </div>
                        <h3 className="text-white font-medium text-lg tracking-[-0.5px] mb-2">{c.title}</h3>
                        <p className="text-white/45 text-[15px] leading-[26px] tracking-[-0.2px]">{c.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════
   MERCADO PREVIEW — Pilar 2: Tienda online
   ═════════════════════════════════════════ */
/* ═════════════════════════════════════════
   PILLAR DEEP DIVE — Los 3 pilares con tabs animados + mockups CSS
   ═════════════════════════════════════════ */
const PILLAR_TABS = [
  {
    id: 'servicios',
    label: 'Servicios',
    icon: CalendarCheck,
    accent: '#3F8697',
    features: [
      { icon: Clock, title: 'Agenda flexible', desc: 'Organizá disponibilidad por hora, bloque o día. Se adapta a cualquier tipo de servicio.' },
      { icon: CreditCard, title: 'Cobros con Mercado Pago', desc: 'Tus clientes pagan al agendar. 0% de comisión. El dinero va directo a tu cuenta.' },
      { icon: Bell, title: 'Recordatorios automáticos', desc: 'Email y notificaciones al cliente y al profesional. Menos ausencias, más ingresos.' },
    ],
  },
  {
    id: 'mercado',
    label: 'Mercado',
    icon: ShoppingBag,
    accent: '#F59E0B',
    features: [
      { icon: Package, title: 'Catálogo profesional', desc: 'Fotos, variantes, precios y stock. Todo organizado por categorías.' },
      { icon: Smartphone, title: 'Dos modos de venta', desc: 'Catálogo con botón WhatsApp o tienda con carrito y checkout completo.' },
      { icon: CreditCard, title: 'Cobro integrado', desc: 'Mercado Pago o consulta por WhatsApp. Vos elegís cómo vender.' },
    ],
  },
  {
    id: 'finanzas',
    label: 'Finanzas',
    icon: TrendingUp,
    accent: '#22C55E',
    features: [
      { icon: DollarSign, title: 'Ingresos y gastos', desc: 'Registrá cada movimiento. Las operaciones de la plataforma se cargan solas.' },
      { icon: BarChart3, title: 'Reportes y proyecciones', desc: 'Visualizá el rendimiento por período, sucursal o servicio. Proyectá los próximos meses.' },
      { icon: Target, title: 'Metas y alertas', desc: 'Configurá objetivos de facturación y recibí alertas cuando los gastos se disparan.' },
    ],
  },
];

function CalendarMockup() {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const timeSlots = [
    { time: '09:00', slots: [{ name: 'Corte + Barba', color: '#3F8697', w: 2 }, null, null, { name: 'Alisado', color: '#8B5CF6', w: 1 }, null, null, null] },
    { time: '10:00', slots: [null, { name: 'Mechas', color: '#EC4899', w: 1 }, null, null, { name: 'Color', color: '#F59E0B', w: 2 }, null, null] },
    { time: '11:00', slots: [{ name: 'Corte', color: '#3F8697', w: 1 }, null, { name: 'Tratamiento', color: '#22C55E', w: 1 }, null, null, null, null] },
    { time: '12:00', slots: [null, null, null, { name: 'Corte', color: '#3F8697', w: 1 }, null, null, null] },
    { time: '14:00', slots: [null, { name: 'Barba', color: '#F59E0B', w: 1 }, { name: 'Mechas', color: '#EC4899', w: 2 }, null, null, { name: 'Corte', color: '#3F8697', w: 1 }, null] },
  ];
  return (
    <div className="lv2-mockup-wrapper">
      <div className="lv2-mockup-bar">
        <div className="flex gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" /><span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" /><span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" /></div>
        <div className="flex-1 mx-4"><div className="bg-white/[0.04] rounded-md h-5 max-w-[180px] mx-auto flex items-center justify-center"><span className="text-white/25 text-[9px] tracking-tight">app.turnolink.com/dashboard</span></div></div>
      </div>
      <div className="flex">
        {/* Mini sidebar */}
        <div className="lv2-mock-sidebar hidden sm:flex">
          {[true, false, false, false, false].map((active, i) => (
            <div key={i} className={`lv2-mock-sidebar-item ${active ? 'active' : ''}`}>
              <div className={`w-4 h-4 rounded ${active ? 'bg-[#3F8697]/60' : 'bg-white/10'}`} />
            </div>
          ))}
        </div>
        <div className="flex-1 p-3 sm:p-4">
          {/* Header with month */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-white/80 text-[11px] sm:text-xs font-semibold">Marzo 2026</span>
              <span className="text-[9px] text-white/30 bg-white/[0.04] px-2 py-0.5 rounded">Semana</span>
            </div>
            <div className="flex gap-1">
              <div className="w-5 h-5 rounded bg-white/[0.04] flex items-center justify-center"><span className="text-white/30 text-[9px]">‹</span></div>
              <div className="w-5 h-5 rounded bg-white/[0.04] flex items-center justify-center"><span className="text-white/30 text-[9px]">›</span></div>
            </div>
          </div>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {days.map(d => <div key={d} className="text-center text-white/30 text-[8px] sm:text-[9px] font-medium pb-1">{d}</div>)}
          </div>
          {/* Time slots */}
          {timeSlots.map((row, ri) => (
            <div key={ri} className="grid grid-cols-[32px_1fr] sm:grid-cols-[40px_1fr] gap-1 mb-1">
              <span className="text-white/20 text-[8px] sm:text-[9px] pt-1 text-right pr-1">{row.time}</span>
              <div className="grid grid-cols-7 gap-1">
                {row.slots.map((slot, ci) => (
                  <div
                    key={ci}
                    className={`h-6 sm:h-7 rounded lv2-calendar-block-reveal ${slot ? '' : 'bg-white/[0.02] border border-white/[0.03]'}`}
                    style={{
                      animationDelay: `${(ri * 7 + ci) * 35}ms`,
                      ...(slot ? { background: `${slot.color}20`, borderLeft: `2px solid ${slot.color}60` } : {}),
                    }}
                  >
                    {slot && <span className="text-[7px] sm:text-[8px] font-medium px-1 truncate block pt-0.5 sm:pt-1" style={{ color: `${slot.color}cc` }}>{slot.name}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {/* Bottom stats */}
          <div className="flex gap-2 mt-3 pt-2 border-t border-white/[0.04]">
            <div className="lv2-mock-kpi flex-1 !p-2">
              <p className="text-[8px] text-white/30">Hoy</p>
              <p className="text-[12px] sm:text-sm text-white font-semibold">8 citas</p>
            </div>
            <div className="lv2-mock-kpi flex-1 !p-2">
              <p className="text-[8px] text-white/30">Ocupación</p>
              <p className="text-[12px] sm:text-sm text-[#22C55E] font-semibold">87%</p>
            </div>
            <div className="lv2-mock-kpi flex-1 !p-2">
              <p className="text-[8px] text-white/30">Ingresos</p>
              <p className="text-[12px] sm:text-sm text-[#3F8697] font-semibold">$64.800</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductGridMockup() {
  const products = [
    { name: 'Remera Oversize', price: '$8.990', tag: null, gradient: 'from-rose-500/20 via-pink-500/10 to-transparent' },
    { name: 'Jean Cargo Wide', price: '$29.990', tag: 'NUEVO', gradient: 'from-indigo-500/20 via-blue-500/10 to-transparent' },
    { name: 'Buzo Hoodie', price: '$24.990', tag: '-15%', gradient: 'from-amber-500/20 via-orange-500/10 to-transparent' },
    { name: 'Zapatillas Urban', price: '$45.990', tag: null, gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent' },
  ];
  const categories = ['Todo', 'Remeras', 'Pantalones', 'Buzos', 'Calzado'];
  return (
    <div className="lv2-mockup-wrapper">
      <div className="lv2-mockup-bar">
        <div className="flex gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" /><span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" /><span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" /></div>
        <div className="flex-1 mx-4"><div className="bg-white/[0.04] rounded-md h-5 max-w-[180px] mx-auto flex items-center justify-center"><span className="text-white/25 text-[9px] tracking-tight">app.turnolink.com/mercado</span></div></div>
      </div>
      <div className="p-3 sm:p-4">
        {/* Store header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-white/90 text-[11px] sm:text-xs font-semibold tracking-tight">Moda Urbana BA</h4>
            <p className="text-white/30 text-[8px] sm:text-[9px]">24 productos · 6 categorías</p>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-white/[0.04] flex items-center justify-center"><span className="text-white/30 text-[9px]">🔍</span></div>
            <div className="relative w-5 h-5 rounded-full bg-[#F59E0B]/15 flex items-center justify-center">
              <ShoppingBag size={10} className="text-[#F59E0B]/70" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#F59E0B] rounded-full text-[6px] text-white font-bold flex items-center justify-center">2</span>
            </div>
          </div>
        </div>
        {/* Categories */}
        <div className="flex gap-1.5 mb-3 overflow-hidden">
          {categories.map((c, i) => (
            <span key={i} className={`text-[8px] sm:text-[9px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${i === 0 ? 'bg-[#F59E0B]/20 text-[#F59E0B]' : 'bg-white/[0.04] text-white/40'}`}>{c}</span>
          ))}
        </div>
        {/* Products grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          {products.map((p, i) => (
            <div key={i} className="lv2-product-card-reveal group" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="bg-white/[0.03] rounded-xl overflow-hidden border border-white/[0.06] transition-all duration-300 hover:border-white/[0.1]">
                <div className={`aspect-[4/3] bg-gradient-to-br ${p.gradient} relative flex items-end p-2`}>
                  {/* Simulated product silhouette */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <div className="w-12 h-14 sm:w-16 sm:h-18 rounded-lg bg-white/20" />
                  </div>
                  {p.tag && (
                    <span className="relative z-10 text-[7px] sm:text-[8px] font-bold bg-[#F59E0B] text-white px-1.5 py-0.5 rounded">{p.tag}</span>
                  )}
                </div>
                <div className="p-2 sm:p-2.5">
                  <p className="text-white/70 text-[10px] sm:text-[11px] font-medium truncate">{p.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[#F59E0B] text-[11px] sm:text-[12px] font-bold">{p.price}</p>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-[#F59E0B]/15 flex items-center justify-center">
                      <span className="text-[#F59E0B] text-[10px] sm:text-[11px]">+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FinanceDashboardMockup() {
  const bars = [45, 60, 52, 78, 65, 72, 88];
  const months = ['Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar'];
  const transactions = [
    { label: 'Servicios del día', amount: '+$48.200', type: 'in' },
    { label: 'Productos vendidos', amount: '+$15.800', type: 'in' },
    { label: 'Alquiler local', amount: '-$120.000', type: 'out' },
  ];
  return (
    <div className="lv2-mockup-wrapper">
      <div className="lv2-mockup-bar">
        <div className="flex gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" /><span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" /><span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" /></div>
        <div className="flex-1 mx-4"><div className="bg-white/[0.04] rounded-md h-5 max-w-[180px] mx-auto flex items-center justify-center"><span className="text-white/25 text-[9px] tracking-tight">app.turnolink.com/finanzas</span></div></div>
      </div>
      <div className="flex">
        {/* Mini sidebar */}
        <div className="lv2-mock-sidebar hidden sm:flex">
          {[false, false, true, false, false].map((active, i) => (
            <div key={i} className={`lv2-mock-sidebar-item ${active ? 'active' : ''}`}>
              <div className={`w-4 h-4 rounded ${active ? 'bg-[#22C55E]/60' : 'bg-white/10'}`} />
            </div>
          ))}
        </div>
        <div className="flex-1 p-3 sm:p-4">
          {/* KPI row */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="lv2-mock-kpi !p-2">
              <p className="text-[7px] sm:text-[8px] text-white/30 mb-0.5">Ingresos</p>
              <p className="text-[11px] sm:text-sm text-[#22C55E] font-bold tracking-tight">$1.85M</p>
              <span className="text-[7px] text-[#22C55E]/60">↑ 12%</span>
            </div>
            <div className="lv2-mock-kpi !p-2">
              <p className="text-[7px] sm:text-[8px] text-white/30 mb-0.5">Gastos</p>
              <p className="text-[11px] sm:text-sm text-[#ef4444] font-bold tracking-tight">$580K</p>
              <span className="text-[7px] text-[#ef4444]/60">↑ 3%</span>
            </div>
            <div className="lv2-mock-kpi !p-2">
              <p className="text-[7px] sm:text-[8px] text-white/30 mb-0.5">Margen</p>
              <p className="text-[11px] sm:text-sm text-white font-bold tracking-tight">69%</p>
              <span className="text-[7px] text-[#22C55E]/60">↑ 4%</span>
            </div>
          </div>
          {/* Chart */}
          <div className="bg-white/[0.02] rounded-lg p-2 sm:p-3 border border-white/[0.04] mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[8px] sm:text-[9px] text-white/40 font-medium">Ingresos vs Gastos</span>
              <span className="text-[7px] sm:text-[8px] text-white/20 bg-white/[0.04] px-1.5 py-0.5 rounded">7 meses</span>
            </div>
            <div className="flex items-end gap-1 h-16 sm:h-20">
              {bars.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="w-full flex flex-col gap-[1px]">
                    <div
                      className="w-full rounded-t lv2-bar-grow"
                      style={{ height: `${h * 0.8}px`, backgroundColor: i === bars.length - 1 ? '#22C55E' : 'rgba(34,197,94,0.25)', animationDelay: `${i * 70}ms` }}
                    />
                    <div
                      className="w-full rounded-b lv2-bar-grow"
                      style={{ height: `${h * 0.3}px`, backgroundColor: 'rgba(239,68,68,0.2)', animationDelay: `${i * 70 + 30}ms` }}
                    />
                  </div>
                  <span className="text-white/20 text-[7px]">{months[i]}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Recent transactions */}
          <div>
            <span className="text-[8px] sm:text-[9px] text-white/30 font-medium mb-1.5 block">Últimos movimientos</span>
            {transactions.map((t, i) => (
              <div key={i} className="lv2-mock-row !py-1.5 !px-0">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${t.type === 'in' ? 'bg-[#22C55E]/15' : 'bg-[#ef4444]/15'}`}>
                  <span className={`text-[9px] ${t.type === 'in' ? 'text-[#22C55E]' : 'text-[#ef4444]'}`}>{t.type === 'in' ? '↑' : '↓'}</span>
                </div>
                <span className="text-white/50 text-[9px] sm:text-[10px] flex-1 truncate">{t.label}</span>
                <span className={`text-[9px] sm:text-[10px] font-semibold ${t.type === 'in' ? 'text-[#22C55E]' : 'text-[#ef4444]'}`}>{t.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const PILLAR_MOCKUPS: Record<string, () => JSX.Element> = {
  servicios: CalendarMockup,
  mercado: ProductGridMockup,
  finanzas: FinanceDashboardMockup,
};

function PillarDeepDiveSection() {
  const sectionRef = useScrollReveal();
  const [activeTab, setActiveTab] = useState(0);
  const [animating, setAnimating] = useState(false);

  const handleTab = useCallback((idx: number) => {
    if (idx === activeTab || animating) return;
    setAnimating(true);
    setTimeout(() => {
      setActiveTab(idx);
      setAnimating(false);
    }, 200);
  }, [activeTab, animating]);

  const tab = PILLAR_TABS[activeTab];
  const MockupComponent = PILLAR_MOCKUPS[tab.id];

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} id="pilares" className="lv2-section py-[100px] lg:py-[140px] px-5 lg:px-10 relative">
      {/* Section background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full blur-[200px] pointer-events-none" style={{ background: `${tab.accent}08` }} />

      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="text-center mb-14">
          <SectionTag text="Explorá la plataforma" />
          <SectionH2
            line1="Cada área de tu negocio,"
            line2="resuelta."
          />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            Activá lo que necesites, cuando lo necesites. Cada herramienta funciona sola o integrada con las demás.
          </p>
        </div>

        {/* Tab bar — premium pill tabs */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-14">
          {PILLAR_TABS.map((t, idx) => {
            const Icon = t.icon;
            const isActive = idx === activeTab;
            return (
              <button
                key={t.id}
                onClick={() => handleTab(idx)}
                className="lv2-pillar-tab group relative"
                style={{
                  borderColor: isActive ? `${t.accent}60` : 'rgba(255,255,255,0.06)',
                  background: isActive ? `${t.accent}12` : 'rgba(255,255,255,0.02)',
                  color: isActive ? t.accent : 'rgba(255,255,255,0.4)',
                  boxShadow: isActive ? `0 0 30px ${t.accent}15, 0 4px 16px rgba(0,0,0,0.3)` : 'none',
                }}
              >
                <Icon size={16} />
                <span className="font-medium text-sm">{t.label}</span>
                {isActive && <span className="absolute -bottom-px left-1/4 right-1/4 h-px" style={{ background: `linear-gradient(90deg, transparent, ${t.accent}80, transparent)` }} />}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center transition-all duration-300 ${animating ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'}`}
        >
          {/* Feature cards */}
          <div className="space-y-4">
            {tab.features.map((f, i) => {
              const FIcon = f.icon;
              return (
                <div
                  key={i}
                  className="lv2-bento-card p-6 group"
                  style={{ borderLeftWidth: '2px', borderLeftColor: `${tab.accent}40` }}
                >
                  <div className="relative z-10 flex items-start gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{ background: `linear-gradient(135deg, ${tab.accent}20, ${tab.accent}08)`, boxShadow: `0 4px 20px ${tab.accent}12` }}
                    >
                      <FIcon size={20} style={{ color: tab.accent }} />
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-base tracking-[-0.3px] mb-1">{f.title}</h3>
                      <p className="text-white/45 text-[14px] leading-[22px] tracking-[-0.2px]">{f.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {tab.id === 'mercado' && (
              <Link
                href="/mercado"
                className="inline-flex items-center gap-2 text-sm font-medium transition-all duration-300 mt-2 group"
                style={{ color: tab.accent }}
              >
                Conocer TurnoLink Mercado
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            )}
          </div>

          {/* Mockup — bigger and more prominent */}
          <div className="flex justify-center">
            <div className="w-full max-w-[440px] relative">
              {/* Glow behind mockup */}
              <div className="absolute -inset-6 rounded-3xl blur-[40px] pointer-events-none" style={{ background: `${tab.accent}08` }} />
              <div className="relative">
                <MockupComponent />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════
   PRODUCT SHOWCASE — Carrusel Multi-Negocio con Transición 3D
   ═════════════════════════════════════════ */
const SHOWCASE_SETS = [
  {
    id: 'salon-noir', label: 'Salon Noir',
    heroImg: '/mockups/turnos-dark.webp',
    images: [
      '/mockups/flow-01-portada.webp',
      '/mockups/flow-04-calendario.webp',
      '/mockups/booking-services-dark.webp',
      '/mockups/flow-07-confirmacion.webp',
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
      '/mockups/set1/servicios.webp',
      '/mockups/set1/confirmacion.webp',
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
      '/mockups/set2/servicios.webp',
      '/mockups/set2/confirmacion.webp',
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
      '/mockups/set3/servicios.webp',
      '/mockups/set3/confirmacion.webp',
      '/mockups/set3/clientes.webp',
      '/mockups/set3/videollamadas.webp',
    ],
  },
];

const CARD_META = [
  // Servicios (2)
  { title: 'Página pública de tu negocio', subtitle: 'Link personalizado', desc: 'Tu link donde tus clientes ven servicios, eligen horarios y agendan.', badge: null, pilar: 'servicios' as const },
  { title: 'Agenda con cobro integrado', subtitle: 'Mercado Pago integrado', desc: 'Disponibilidad en tiempo real + cobro automático. Sin solapamientos, sin intermediarios.', badge: 'PRO' as const, pilar: 'servicios' as const },
  // Mercado (2)
  { title: 'Catálogo de productos', subtitle: 'Tienda online', desc: 'Fotos, variantes, precios y stock. Tus clientes compran por WhatsApp o con carrito + checkout.', badge: null, pilar: 'mercado' as const },
  { title: 'Checkout o WhatsApp', subtitle: 'Dos modos de venta', desc: 'Modo catálogo con botón de WhatsApp o e-commerce completo con Mercado Pago.', badge: null, pilar: 'mercado' as const },
  // Finanzas (2)
  { title: 'Dashboard financiero', subtitle: 'Ingresos y gastos', desc: 'Registrá cada movimiento. Los ingresos de tu operación se cargan automáticamente.', badge: null, pilar: 'finanzas' as const },
  { title: 'Reportes y proyecciones', subtitle: 'Rentabilidad por período', desc: 'Visualizá el rendimiento por sucursal o servicio. Proyectá los próximos meses con datos reales.', badge: 'PRO' as const, pilar: 'finanzas' as const },
];

const PILAR_COLORS: Record<string, string> = {
  servicios: '#3F8697',
  mercado: '#F59E0B',
  finanzas: '#22C55E',
};

function ProductShowcase() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 150);

  // Naipe system: two layers (top=front, bottom=back peeking)
  const [topIdx, setTopIdx] = useState(0);
  const [bottomIdx, setBottomIdx] = useState(1);
  const [swapping, setSwapping] = useState(false);
  const lockRef = useRef(false);
  const topRef = useRef(0);
  const facesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => { topRef.current = topIdx; }, [topIdx]);

  // Instant reset after animation: disable transitions → swap data → re-enable
  const resetAfterSwap = useCallback((newTopIdx: number) => {
    facesRef.current.forEach(el => { if (el) el.style.transition = 'none'; });
    setTopIdx(newTopIdx);
    setBottomIdx((newTopIdx + 1) % SHOWCASE_SETS.length);
    setSwapping(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        facesRef.current.forEach(el => { if (el) el.style.transition = ''; });
        lockRef.current = false;
      });
    });
  }, []);

  // Click any card → front goes back, back comes front (350ms)
  const handleCycle = useCallback(() => {
    if (lockRef.current) return;
    lockRef.current = true;
    setSwapping(true);
    const next = (topRef.current + 1) % SHOWCASE_SETS.length;
    setTimeout(() => resetAfterSwap(next), 380);
  }, [resetAfterSwap]);

  // Dot navigation → jump to any set
  const goToSet = useCallback((idx: number) => {
    if (lockRef.current || idx === topRef.current) return;
    lockRef.current = true;
    setBottomIdx(idx);
    requestAnimationFrame(() => {
      setSwapping(true);
      setTimeout(() => resetAfterSwap(idx), 380);
    });
  }, [resetAfterSwap]);

  // Preload all sets on mount (only 28 images total)
  useEffect(() => {
    SHOWCASE_SETS.forEach(set => {
      set.images.forEach(src => { const img = new window.Image(); img.src = src; });
      const h = new window.Image(); h.src = set.heroImg;
    });
  }, []);

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} id="producto" className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 items-end mb-16">
          <div className="text-center lg:text-left">
            <SectionTag text="Producto" />
            <SectionH2
              line1="Así opera un negocio"
              line2="con TurnoLink."
            />
          </div>
          <div className="text-center lg:text-right">
            <p className="text-white/50 max-w-md mx-auto lg:mx-0 lg:ml-auto text-base leading-relaxed tracking-[-0.2px]">
              Cada herramienta diseñada para que tu negocio funcione con menos esfuerzo y más resultados.
            </p>
            <Link
              href="/register"
              className="lv2-glow-btn inline-flex items-center gap-2 bg-[#3F8697] text-white font-medium px-6 py-3 rounded-[10px] text-sm mt-6"
            >
              Probar gratis
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Hero — naipe dual layer */}
        <div className="mb-8">
          <div className="lv2-mockup-wrapper">
            <div className="lv2-img-zoom relative">
              {/* Back hero (peeking) */}
              <div
                ref={el => { facesRef.current[12] = el; }}
                className={`absolute inset-0 lv2-hero-face ${swapping ? 'lv2-hero-front' : 'lv2-hero-back'}`}
              >
                <Image
                  src={SHOWCASE_SETS[bottomIdx].heroImg}
                  alt={`TurnoLink — ${SHOWCASE_SETS[bottomIdx].label}`}
                  width={1200}
                  height={700}
                  className="w-full h-auto"
                />
              </div>
              {/* Front hero */}
              <div
                ref={el => { facesRef.current[13] = el; }}
                className={`relative lv2-hero-face ${swapping ? 'lv2-hero-back' : 'lv2-hero-front'}`}
              >
                <Image
                  src={SHOWCASE_SETS[topIdx].heroImg}
                  alt={`TurnoLink — ${SHOWCASE_SETS[topIdx].label}`}
                  width={1200}
                  height={700}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Active set label */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-white/30 text-sm">Viendo:</span>
          <span className="text-[#3F8697] text-sm font-medium">{SHOWCASE_SETS[topIdx].label}</span>
          <span className="text-white/20 text-xs ml-2">— Tocá una card para ver otro ejemplo</span>
        </div>

        {/* Cards grid */}
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CARD_META.map((f, i) => {
            const accent = PILAR_COLORS[f.pilar];
            const isServiceCard = f.pilar === 'servicios';
            const CardIcon = f.pilar === 'mercado' ? ShoppingBag : f.pilar === 'finanzas' ? TrendingUp : CalendarCheck;

            return (
              <div
                key={i}
                role={isServiceCard ? 'button' : undefined}
                tabIndex={isServiceCard ? 0 : undefined}
                onClick={isServiceCard ? handleCycle : undefined}
                onKeyDown={isServiceCard ? (e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCycle(); } }) : undefined}
                className={`lv2-card-stagger lv2-feature-card ${isServiceCard ? 'lv2-showcase-card group' : ''} block`}
              >
                <div className="rounded-[16px]">
                  {/* Visual area */}
                  <div className="aspect-[16/10] relative overflow-hidden">
                    {isServiceCard ? (
                      <>
                        <div
                          ref={el => { facesRef.current[i * 2] = el; }}
                          className={`absolute inset-0 lv2-naipe-face ${swapping ? 'lv2-naipe-front' : 'lv2-naipe-back'}`}
                        >
                          <Image src={SHOWCASE_SETS[bottomIdx].images[i]} alt={f.title} fill className="object-cover object-top" />
                        </div>
                        <div
                          ref={el => { facesRef.current[i * 2 + 1] = el; }}
                          className={`absolute inset-0 lv2-naipe-face ${swapping ? 'lv2-naipe-back' : 'lv2-naipe-front'}`}
                        >
                          <Image src={SHOWCASE_SETS[topIdx].images[i]} alt={f.title} fill className="object-cover object-top" />
                        </div>
                      </>
                    ) : (
                      <div
                        className="absolute inset-0 overflow-hidden"
                        style={{ background: `linear-gradient(145deg, ${accent}12, ${accent}05, rgba(0,0,0,0.3))` }}
                      >
                        {/* Simulated UI skeleton */}
                        <div className="absolute inset-0 p-4 flex flex-col justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg" style={{ background: `${accent}25` }} />
                            <div className="h-2 w-16 rounded-full bg-white/10" />
                            <div className="ml-auto h-2 w-10 rounded-full bg-white/[0.06]" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <div className="h-8 flex-1 rounded-lg bg-white/[0.04] border border-white/[0.06]" />
                              <div className="h-8 flex-1 rounded-lg" style={{ background: `${accent}10`, border: `1px solid ${accent}20` }} />
                            </div>
                            <div className="h-6 w-3/4 rounded-md bg-white/[0.03]" />
                          </div>
                        </div>
                        {/* Accent glow */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200px] h-[100px] rounded-full blur-[50px] opacity-20" style={{ background: accent }} />
                      </div>
                    )}
                  </div>
                  {/* Card text */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${accent}15` }}>
                        <CardIcon size={16} style={{ color: accent }} />
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <h3 className="text-white font-medium text-[16px] tracking-[-0.5px] truncate">{f.title}</h3>
                        {f.badge && (
                          <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-md tracking-wide uppercase flex-shrink-0" style={{ backgroundColor: accent }}>
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
            );
          })}
        </div>

        {/* Set indicator dots */}
        <div className="lv2-set-dots">
          {SHOWCASE_SETS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goToSet(i)}
              className={`lv2-set-dot ${i === topIdx ? 'active' : ''}`}
              aria-label={`Ver ${s.label}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════
   FUNCIONALIDADES — Sin cambios estructurales
   ═════════════════════════════════════════ */
interface FuncFlow {
  icon: LucideIcon;
  stage: string;
  title: string;
  desc: string;
  tags: string[];
  img: string | null;
  mockup?: 'calendar' | 'products' | 'finance';
}

const FUNC_FLOWS: { id: string; label: string; icon: LucideIcon; accent: string; steps: FuncFlow[] }[] = [
  {
    id: 'servicios', label: 'Servicios', icon: CalendarCheck, accent: '#3F8697',
    steps: [
      {
        icon: Globe, stage: 'Paso 1', title: 'Tu cliente entra a tu página',
        desc: 'Un link personalizado donde tus clientes ven tus servicios, precios y disponibilidad. Sin descargas, funciona en cualquier dispositivo.',
        tags: ['Link personalizado', 'Responsive', 'Sin descargas'], img: '/mockups/flow-01-portada.webp',
      },
      {
        icon: CalendarCheck, stage: 'Paso 2', title: 'Elige día, hora y servicio',
        desc: 'Agenda inteligente que muestra solo los horarios disponibles. Sin solapamientos, sin llamadas. Tu cliente agenda en 30 segundos.',
        tags: ['Disponibilidad real', 'Sin solapamientos', 'Multi-servicio'], img: '/mockups/flow-04-calendario.webp',
      },
      {
        icon: CreditCard, stage: 'Paso 3', title: 'Paga y confirma',
        desc: 'Mercado Pago integrado con un click. Tu cliente paga y la cita se confirma al instante. El dinero va directo a tu cuenta.',
        tags: ['Mercado Pago', 'Cobro instantáneo', '0% comisión'], img: '/mockups/flow-07-confirmacion.webp',
      },
    ],
  },
  {
    id: 'mercado', label: 'Mercado', icon: ShoppingBag, accent: '#F59E0B',
    steps: [
      {
        icon: Package, stage: 'Paso 1', title: 'Subís productos con fotos y precios',
        desc: 'Creá tu catálogo profesional en minutos. Fotos, variantes, precios, stock y categorías. Todo desde tu panel de administración.',
        tags: ['Fotos HD', 'Variantes', 'Stock automático'], img: null, mockup: 'products',
      },
      {
        icon: Smartphone, stage: 'Paso 2', title: 'Tu cliente navega el catálogo',
        desc: 'Página pública con tu marca donde tus clientes ven todos tus productos. Filtros por categoría, búsqueda y carrito.',
        tags: ['Catálogo público', 'Filtros', 'Mobile-first'], img: null, mockup: 'products',
      },
      {
        icon: CreditCard, stage: 'Paso 3', title: 'Compra por WhatsApp o checkout',
        desc: 'Dos modos: catálogo con botón WhatsApp para pedidos manuales, o e-commerce completo con carrito y checkout vía Mercado Pago.',
        tags: ['WhatsApp', 'Carrito', 'Mercado Pago'], img: null, mockup: 'products',
      },
    ],
  },
  {
    id: 'finanzas', label: 'Finanzas', icon: TrendingUp, accent: '#22C55E',
    steps: [
      {
        icon: DollarSign, stage: 'Paso 1', title: 'Ingresos automáticos desde tu operación',
        desc: 'Cada operación que se genera en la plataforma se registra automáticamente como ingreso. Sin cargar nada manual.',
        tags: ['Automático', 'Servicios + Ventas', 'Tiempo real'], img: null, mockup: 'finance',
      },
      {
        icon: BarChart3, stage: 'Paso 2', title: 'Registrás gastos y categorizás',
        desc: 'Cargá gastos de alquiler, sueldos, insumos y más. 11 categorías predefinidas o personalizables.',
        tags: ['11 categorías', 'Personalizable', 'Recurrentes'], img: null, mockup: 'finance',
      },
      {
        icon: Target, stage: 'Paso 3', title: 'Reportes, margen y proyecciones',
        desc: 'Dashboard con ingresos vs gastos, margen de ganancia, comparación mensual y proyecciones. Todo visual, todo accionable.',
        tags: ['Margen', 'Comparación', 'Proyecciones'], img: null, mockup: 'finance',
      },
    ],
  },
];

function FuncMockup({ type }: { type: 'products' | 'finance' | 'calendar' }) {
  if (type === 'products') return <ProductGridMockup />;
  if (type === 'finance') return <FinanceDashboardMockup />;
  return <CalendarMockup />;
}

function FuncionalidadesSection() {
  const [activeFlow, setActiveFlow] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const flow = FUNC_FLOWS[activeFlow];

  const handleFlowChange = useCallback((idx: number) => {
    if (idx === activeFlow || animating) return;
    setAnimating(true);
    setTimeout(() => {
      setActiveFlow(idx);
      setActiveIdx(0);
      setAnimating(false);
    }, 200);
  }, [activeFlow, animating]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveIdx(i);
          }
        },
        { threshold: 0.5, rootMargin: '-20% 0px -20% 0px' }
      );
      obs.observe(card);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [activeFlow]);

  return (
    <section
      ref={sectionRef}
      id="funcionalidades"
      className="py-[100px] lg:py-[120px] px-5 lg:px-10 transition-opacity duration-[900ms]"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-8 text-center">
          <SectionTag text="Cómo funciona" />
          <SectionH2
            line1="Cada módulo tiene"
            line2="su propio flujo."
          />
          <p className="mt-5 text-white/50 max-w-lg mx-auto text-base leading-relaxed tracking-[-0.2px]">
            Elegí el módulo que te interesa y mirá cómo funciona paso a paso.
          </p>
        </div>

        {/* Flow tabs */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-14">
          {FUNC_FLOWS.map((f, idx) => {
            const Icon = f.icon;
            const isActive = idx === activeFlow;
            return (
              <button
                key={f.id}
                onClick={() => handleFlowChange(idx)}
                className="lv2-pillar-tab"
                style={{
                  borderColor: isActive ? `${f.accent}60` : 'rgba(255,255,255,0.06)',
                  background: isActive ? `${f.accent}12` : 'rgba(255,255,255,0.02)',
                  color: isActive ? f.accent : 'rgba(255,255,255,0.4)',
                  boxShadow: isActive ? `0 0 30px ${f.accent}15, 0 4px 16px rgba(0,0,0,0.3)` : 'none',
                }}
              >
                <Icon size={16} />
                <span className="font-medium text-sm">{f.label}</span>
              </button>
            );
          })}
        </div>

        <div className={`lv2-sticky-row transition-all duration-300 ${animating ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'}`}>
          <div className="lv2-sticky-cards-col">
            {flow.steps.map((f, i) => (
              <div
                key={`${flow.id}-${i}`}
                ref={(el) => { cardRefs.current[i] = el; }}
                className={`lv2-func-card ${activeIdx === i ? 'active' : ''}`}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${flow.accent}15` }}>
                    <f.icon size={22} style={{ color: flow.accent }} />
                  </div>
                  <span className="lv2-stage-label inline-flex items-center text-sm text-white/70">
                    {f.stage}
                  </span>
                </div>

                <h3 className="text-white font-medium text-xl tracking-[-0.5px] mb-3">
                  {f.title}
                </h3>

                <p className="text-white/50 text-[15px] leading-[26px] tracking-[-0.2px] mb-5">
                  {f.desc}
                </p>

                <div className="flex flex-wrap gap-2">
                  {f.tags.map((tag, j) => (
                    <span
                      key={j}
                      className="flex items-center gap-1.5 text-xs text-white/50 bg-white/[0.05] px-3 py-1.5 rounded-full border border-white/[0.06]"
                    >
                      <Check size={12} style={{ color: flow.accent }} />
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="lg:hidden mt-6">
                  {f.img ? (
                    <div className="lv2-mockup-wrapper">
                      <div className="lv2-img-zoom">
                        <Image src={f.img} alt={f.title} width={800} height={500} className="w-full h-auto" />
                      </div>
                    </div>
                  ) : f.mockup ? (
                    <FuncMockup type={f.mockup} />
                  ) : null}
                </div>
              </div>
            ))}

            <div className="mt-4">
              <Link
                href="/register"
                className="lv2-glow-btn inline-flex items-center gap-2 text-white font-medium px-6 py-3 rounded-[10px] text-sm"
                style={{ backgroundColor: flow.accent }}
              >
                Empezar gratis
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="lv2-sticky-img-col hidden lg:block">
            <div className="lv2-sticky-img-wrap">
              {flow.steps.map((f, i) => (
                f.img ? (
                  <Image
                    key={`${flow.id}-img-${i}`}
                    src={f.img}
                    alt={f.title}
                    width={600}
                    height={600}
                    className={activeIdx === i ? 'active-img' : ''}
                  />
                ) : f.mockup ? (
                  <div key={`${flow.id}-mock-${i}`} className={`absolute inset-0 flex items-center justify-center p-8 transition-opacity duration-500 ${activeIdx === i ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <FuncMockup type={f.mockup} />
                  </div>
                ) : null
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════
   INDUSTRIAS Y PRECIOS — Cambio 6: Fusiona Verticales + Pricing
   ═════════════════════════════════════════ */
const INDUSTRIAS = [
  {
    icon: Scissors,
    title: 'Belleza & Bienestar',
    desc: 'Peluquerías, barberías, spas, estética, uñas, depilación',
    price: '0',
    hasFree: true,
    slug: 'belleza',
  },
  {
    icon: HeartPulse,
    title: 'Salud',
    desc: 'Psicólogos, nutricionistas, odontólogos, kinesiólogos, fonoaudiólogos',
    price: '16.990',
    hasFree: false,
    slug: 'salud',
  },
  {
    icon: Scale,
    title: 'Profesionales',
    desc: 'Abogados, contadores, escribanos — estudios jurídicos, contables y notariales',
    price: '16.990',
    hasFree: false,
    slug: 'turnos-profesionales',
  },
  {
    icon: Trophy,
    title: 'Deportes & Recreación',
    desc: 'Canchas de fútbol, pádel, tenis, gimnasios, academias',
    price: '0',
    hasFree: true,
    slug: 'deportes',
  },
  {
    icon: BedDouble,
    title: 'Hospedaje por horas',
    desc: 'Hoteles, albergues transitorios, boxes privados',
    price: '0',
    hasFree: true,
    slug: 'hospedaje-por-horas',
  },
  {
    icon: Home,
    title: 'Alquiler temporario',
    desc: 'Cabañas, departamentos, quinchos, salones de eventos',
    price: '9.990',
    hasFree: false,
    slug: 'alquiler-temporario',
  },
  {
    icon: Briefcase,
    title: 'Espacios flexibles',
    desc: 'Coworking, oficinas por hora, salas de reuniones, estudios',
    price: '0',
    hasFree: true,
    slug: 'espacios-flexibles',
  },
  {
    icon: ShoppingBag,
    title: 'Mercado',
    desc: 'Catálogos online, tiendas, inmobiliarias, emprendedores',
    price: '0',
    hasFree: true,
    slug: 'mercado',
  },
];

function IndustriasYPreciosSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 100);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      id="industrias"
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Industrias y precios" />
          <SectionH2
            line1="Un sistema para cada industria."
            line2="Precios adaptados a tu rubro."
          />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            Cada industria tiene necesidades distintas. Por eso TurnoLink ofrece planes específicos para tu tipo de negocio.
          </p>
        </div>

        {/* Industry cards */}
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {INDUSTRIAS.map((ind, i) => (
            <Link
              key={i}
              href={`/${ind.slug}`}
              className="lv2-card-stagger lv2-bento-card p-6 flex flex-col group"
            >
              <div className="relative z-10">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110" style={{ background: 'linear-gradient(135deg, rgba(63,134,151,0.15), rgba(63,134,151,0.05))', boxShadow: '0 4px 20px rgba(63,134,151,0.1)' }}>
                  <ind.icon size={20} className="text-[#3F8697]" />
                </div>
                <h3 className="text-white font-medium text-base tracking-[-0.3px] mb-1">{ind.title}</h3>
                <p className="text-white/40 text-[13px] leading-[20px] tracking-[-0.2px] mb-4 flex-1">{ind.desc}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    {ind.hasFree ? (
                      <span className="text-[#22C55E] text-sm font-semibold">Gratis</span>
                    ) : (
                      <>
                        <span className="text-white/60 text-sm font-semibold">${ind.price}</span>
                        <span className="text-white/25 text-xs">/mes</span>
                      </>
                    )}
                  </div>
                  <ArrowRight size={14} className="text-white/20 group-hover:text-[#3F8697] group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Trust line + WhatsApp */}
        <p className="text-center text-white/25 text-sm mt-10 flex items-center justify-center gap-2">
          <Shield size={14} />
          14 días de prueba en todos los planes. Sin tarjeta de crédito.
        </p>
        <p className="text-center mt-4">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#3F8697] hover:text-[#4a9db0] transition-colors duration-300"
          >
            ¿Necesitás ayuda para elegir? Hablá con nuestro equipo →
          </a>
        </p>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════
   SHOWCASE — Casos reales de negocios por industria
   ═════════════════════════════════════════ */

interface ShowcaseBusiness {
  slug: string;
  name: string;
  shortDesc: string;
  location: string;
  rating: number;
  reviews: number;
  primaryColor: string;
  secondaryColor: string;
  services: { name: string; price: string; duration: string }[];
}

interface ShowcaseIndustry {
  id: string;
  label: string;
  icon: LucideIcon;
  ctaText: string;
  businesses: ShowcaseBusiness[];
}

const SHOWCASE_DATA: ShowcaseIndustry[] = [
  // ── 1. Peluquerías & Barberías ─────────────────────────────────────
  // TAM #1: Toda ciudad tiene decenas. Alta frecuencia de reserva (mensual).
  // Merge de las dos categorías previas — un salón unisex + una barbería.
  {
    id: 'peluquerias-barberias',
    label: 'Peluquerías & Barberías',
    icon: Scissors,
    ctaText: 'Reservar turno',
    businesses: [
      {
        slug: 'salon-noir',
        name: 'Salon Noir',
        shortDesc: 'Peluquería unisex premium',
        location: 'Palermo',
        rating: 4.8,
        reviews: 127,
        primaryColor: '#4a148c',
        secondaryColor: '#e1bee7',
        services: [
          { name: 'Corte Mujer', price: '$8.000', duration: '60 min' },
          { name: 'Mechas Balayage', price: '$25.000', duration: '150 min' },
          { name: 'Alisado Keratina', price: '$35.000', duration: '180 min' },
        ],
      },
      {
        slug: 'the-barber-club',
        name: 'The Barber Club',
        shortDesc: 'Barbería clásica masculina',
        location: 'San Isidro',
        rating: 4.7,
        reviews: 203,
        primaryColor: '#F59E0B',
        secondaryColor: '#F97316',
        services: [
          { name: 'Corte Clásico', price: '$5.000', duration: '30 min' },
          { name: 'Corte + Barba', price: '$7.000', duration: '45 min' },
          { name: 'Combo Premium', price: '$12.000', duration: '75 min' },
        ],
      },
    ],
  },
  // ── 2. Estética & Belleza ──────────────────────────────────────────
  // TAM alto: uñas, pestañas, depilación, maquillaje. Reserva frecuente (quincenal/mensual).
  {
    id: 'estetica',
    label: 'Estética & Belleza',
    ctaText: 'Reservar turno',
    icon: Sparkles,
    businesses: [
      {
        slug: 'nails-and-co',
        name: 'Nails & Co.',
        shortDesc: 'Centro de uñas esculpidas',
        location: 'Palermo',
        rating: 4.9,
        reviews: 184,
        primaryColor: '#e91e63',
        secondaryColor: '#f06292',
        services: [
          { name: 'Uñas Esculpidas', price: '$15.000', duration: '120 min' },
          { name: 'Semi Clásico', price: '$8.000', duration: '60 min' },
          { name: 'Nail Art Premium', price: '$18.000', duration: '150 min' },
        ],
      },
      {
        slug: 'lash-studio-ba',
        name: 'Lash Studio BA',
        shortDesc: 'Pestañas & cejas',
        location: 'Núñez',
        rating: 4.8,
        reviews: 112,
        primaryColor: '#9c27b0',
        secondaryColor: '#ce93d8',
        services: [
          { name: 'Extensiones Clásicas', price: '$14.000', duration: '120 min' },
          { name: 'Volumen Ruso', price: '$18.000', duration: '150 min' },
          { name: 'Lifting de Pestañas', price: '$10.000', duration: '60 min' },
        ],
      },
    ],
  },
  // ── 3. Spa & Bienestar ─────────────────────────────────────────────
  // Mercado premium con ticket alto. Transmite confianza y profesionalismo.
  {
    id: 'spa',
    label: 'Spa & Bienestar',
    ctaText: 'Reservar turno',
    icon: HeartPulse,
    businesses: [
      {
        slug: 'zen-spa-masajes',
        name: 'Zen Spa & Masajes',
        shortDesc: 'Spa urbano & relajación',
        location: 'Palermo',
        rating: 4.8,
        reviews: 145,
        primaryColor: '#00897b',
        secondaryColor: '#4db6ac',
        services: [
          { name: 'Masaje Relajante', price: '$12.000', duration: '60 min' },
          { name: 'Piedras Calientes', price: '$16.000', duration: '75 min' },
          { name: 'Circuito Spa', price: '$25.000', duration: '150 min' },
        ],
      },
      {
        slug: 'alma-relax-spa',
        name: 'Alma Relax Spa',
        shortDesc: 'Spa holístico & wellness',
        location: 'San Telmo',
        rating: 4.9,
        reviews: 89,
        primaryColor: '#D97706',
        secondaryColor: '#BE185D',
        services: [
          { name: 'Masaje Hot Stones', price: '$18.000', duration: '75 min' },
          { name: 'Reflexología Podal', price: '$12.000', duration: '50 min' },
          { name: 'Facial Antiage', price: '$18.000', duration: '75 min' },
        ],
      },
    ],
  },
  // ── 4. Salud & Consultorios ────────────────────────────────────────
  // TAM enorme. Médicos, odontólogos, dermatólogos. Transmite seriedad profesional.
  {
    id: 'salud',
    label: 'Salud & Consultorios',
    ctaText: 'Reservar turno',
    icon: Building2,
    businesses: [
      {
        slug: 'dra-martinez-dermatologia',
        name: 'Dra. Martínez',
        shortDesc: 'Dermatología clínica & estética',
        location: 'Recoleta',
        rating: 4.9,
        reviews: 231,
        primaryColor: '#1565c0',
        secondaryColor: '#64b5f6',
        services: [
          { name: 'Consulta Primera Vez', price: '$15.000', duration: '40 min' },
          { name: 'Peeling Químico', price: '$18.000', duration: '45 min' },
          { name: 'Botox', price: '$45.000', duration: '30 min' },
        ],
      },
      {
        slug: 'sonrisas-odontologia',
        name: 'Sonrisas Odontología',
        shortDesc: 'Odontología integral',
        location: 'Belgrano',
        rating: 4.8,
        reviews: 167,
        primaryColor: '#0277bd',
        secondaryColor: '#81d4fa',
        services: [
          { name: 'Limpieza Dental', price: '$10.000', duration: '45 min' },
          { name: 'Blanqueamiento', price: '$35.000', duration: '60 min' },
          { name: 'Carillas', price: '$45.000', duration: '60 min' },
        ],
      },
    ],
  },
  // ── 5. Fitness & Canchas ───────────────────────────────────────────
  // Sector en fuerte crecimiento (pádel boom). Alta recurrencia de reserva.
  {
    id: 'fitness',
    label: 'Fitness & Canchas',
    ctaText: 'Reservar turno',
    icon: Dumbbell,
    businesses: [
      {
        slug: 'fitzone-training',
        name: 'FitZone Training',
        shortDesc: 'Entrenamiento funcional & personal',
        location: 'Palermo',
        rating: 4.7,
        reviews: 189,
        primaryColor: '#e65100',
        secondaryColor: '#ffb74d',
        services: [
          { name: 'Sesión Personal 1h', price: '$8.000', duration: '60 min' },
          { name: 'Clase Funcional', price: '$4.000', duration: '60 min' },
          { name: 'Pilates Reformer', price: '$6.000', duration: '50 min' },
        ],
      },
      {
        slug: 'padel-futbol-sur',
        name: 'Pádel & Fútbol Sur',
        shortDesc: 'Complejo deportivo multicanchas',
        location: 'Zona Sur',
        rating: 4.6,
        reviews: 134,
        primaryColor: '#22C55E',
        secondaryColor: '#065F46',
        services: [
          { name: 'Cancha Pádel 1h', price: '$12.000', duration: '60 min' },
          { name: 'Fútbol 5 1h', price: '$15.000', duration: '60 min' },
          { name: 'Clase Grupal Pádel', price: '$6.000', duration: '90 min' },
        ],
      },
    ],
  },
  // ── 6. Profesionales ───────────────────────────────────────────────
  // Mercado MASIVO y sub-digitalizado: psicólogos, abogados, contadores, nutricionistas.
  // Cada profesional independiente necesita gestionar agenda. Millones de profesionales en LATAM.
  {
    id: 'profesionales',
    label: 'Profesionales',
    ctaText: 'Reservar turno',
    icon: Briefcase,
    businesses: [
      {
        slug: 'lic-gomez-psicologia',
        name: 'Lic. Gómez',
        shortDesc: 'Psicología clínica & terapia de pareja',
        location: 'Belgrano',
        rating: 4.9,
        reviews: 94,
        primaryColor: '#5b21b6',
        secondaryColor: '#a78bfa',
        services: [
          { name: 'Sesión Individual', price: '$12.000', duration: '50 min' },
          { name: 'Terapia de Pareja', price: '$18.000', duration: '75 min' },
          { name: 'Evaluación Inicial', price: '$15.000', duration: '60 min' },
        ],
      },
      {
        slug: 'estudio-contable-ruiz',
        name: 'Estudio Contable Ruiz',
        shortDesc: 'Contabilidad & asesoría fiscal',
        location: 'Microcentro',
        rating: 4.7,
        reviews: 68,
        primaryColor: '#0f766e',
        secondaryColor: '#5eead4',
        services: [
          { name: 'Consulta Impositiva', price: '$10.000', duration: '45 min' },
          { name: 'Declaración Jurada', price: '$25.000', duration: '60 min' },
          { name: 'Asesoría Monotributo', price: '$8.000', duration: '30 min' },
        ],
      },
    ],
  },
  // ── 7. Hospedaje & Alquileres ──────────────────────────────────────
  // Diferenciador clave: muestra el modo DIARIO de TurnoLink.
  // Cabañas, apart-hotels, alquileres temporales — mercado enorme en turismo argentino.
  {
    id: 'hospedaje',
    label: 'Hospedaje',
    ctaText: 'Reservar estadía',
    icon: BedDouble,
    businesses: [
      {
        slug: 'cabanas-del-lago',
        name: 'Cabañas del Lago',
        shortDesc: 'Cabañas con vista al lago',
        location: 'Villa La Angostura',
        rating: 4.9,
        reviews: 312,
        primaryColor: '#1e3a5f',
        secondaryColor: '#7dd3fc',
        services: [
          { name: 'Cabaña Doble', price: '$45.000', duration: '1 noche' },
          { name: 'Cabaña Familiar', price: '$65.000', duration: '1 noche' },
          { name: 'Suite Premium', price: '$85.000', duration: '1 noche' },
        ],
      },
      {
        slug: 'apart-hotel-centro',
        name: 'Urban Apart Hotel',
        shortDesc: 'Apart-hotel céntrico & moderno',
        location: 'Córdoba Capital',
        rating: 4.7,
        reviews: 187,
        primaryColor: '#b45309',
        secondaryColor: '#fbbf24',
        services: [
          { name: 'Studio', price: '$35.000', duration: '1 noche' },
          { name: 'Depto 1 Ambiente', price: '$48.000', duration: '1 noche' },
          { name: 'Depto 2 Ambientes', price: '$62.000', duration: '1 noche' },
        ],
      },
    ],
  },
  // ── 8. Mercado & Tiendas ───────────────────────────────────────────
  // Modo catálogo (WhatsApp) y e-commerce completo (carrito + checkout + Mercado Pago).
  // Dos modelos de negocio en una sola plataforma.
  {
    id: 'mercado-tiendas',
    label: 'Mercado & Tiendas',
    icon: ShoppingBag,
    ctaText: 'Ver catálogo',
    businesses: [
      {
        slug: 'moda-urbana-ba',
        name: 'Moda Urbana BA',
        shortDesc: 'Ropa urbana — Modo catálogo',
        location: 'Buenos Aires',
        rating: 4.9,
        reviews: 312,
        primaryColor: '#F59E0B',
        secondaryColor: '#BE185D',
        services: [
          { name: 'Remera Oversize', price: '$8.990', duration: 'Catálogo' },
          { name: 'Jean Cargo Wide Leg', price: '$29.990', duration: 'Catálogo' },
          { name: 'Buzo Oversize Hoodie', price: '$24.990', duration: 'Catálogo' },
        ],
      },
      {
        slug: 'techstore-ba',
        name: 'TechStore BA',
        shortDesc: 'Electrónica — E-commerce completo',
        location: 'Buenos Aires',
        rating: 4.7,
        reviews: 189,
        primaryColor: '#10B981',
        secondaryColor: '#14B8A6',
        services: [
          { name: 'Auriculares TWS Pro', price: '$34.990', duration: 'E-commerce' },
          { name: 'Teclado Mecánico 65%', price: '$29.990', duration: 'E-commerce' },
          { name: 'Power Bank 20000mAh', price: '$15.990', duration: 'E-commerce' },
        ],
      },
      {
        slug: 'iphone-buenos-aires',
        name: 'iPhone Buenos Aires',
        shortDesc: 'Apple iPhone — Modo catálogo',
        location: 'Buenos Aires',
        rating: 4.8,
        reviews: 247,
        primaryColor: '#000000',
        secondaryColor: '#1d1d1f',
        services: [
          { name: 'iPhone 17 Pro Max 256GB', price: '$2.616.300', duration: 'Catálogo' },
          { name: 'iPhone Air 256GB', price: '$1.675.800', duration: 'Catálogo' },
          { name: 'iPhone 13 128GB', price: '$957.600', duration: 'Catálogo' },
        ],
      },
    ],
  },
  // ── 9. Automotriz & Servicios ──────────────────────────────────────
  // Demuestra versatilidad de la plataforma más allá de belleza y salud.
  // Talleres, lavaderos, service — alta necesidad de agenda, bajo nivel de digitalización.
  {
    id: 'automotriz',
    label: 'Automotriz & Servicios',
    ctaText: 'Reservar turno',
    icon: Wrench,
    businesses: [
      {
        slug: 'taller-martinez-hnos',
        name: 'Taller Martínez Hnos.',
        shortDesc: 'Mecánica integral & service oficial',
        location: 'Avellaneda',
        rating: 4.6,
        reviews: 143,
        primaryColor: '#dc2626',
        secondaryColor: '#fca5a5',
        services: [
          { name: 'Service Completo', price: '$35.000', duration: '120 min' },
          { name: 'Cambio de Aceite', price: '$15.000', duration: '30 min' },
          { name: 'Diagnóstico General', price: '$8.000', duration: '45 min' },
        ],
      },
      {
        slug: 'wash-pro-lavadero',
        name: 'Black Diamond Detailing',
        shortDesc: 'Estudio premium de detailing automotriz',
        location: 'Vicente López',
        rating: 4.9,
        reviews: 312,
        primaryColor: '#0f172a',
        secondaryColor: '#c9a84c',
        services: [
          { name: 'Corrección Full Detail', price: '$120.000', duration: '480 min' },
          { name: 'Coating Cerámico 9H', price: '$85.000', duration: '300 min' },
          { name: 'PPF Protection Film', price: '$280.000', duration: '480 min' },
        ],
      },
    ],
  },
];

function PhoneCard({ business, ctaText = 'Reservar turno' }: { business: ShowcaseBusiness; ctaText?: string }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="lv2-phone-frame max-w-[320px] mx-auto">
        <div className="lv2-phone-screen">
          {/* Mini Hero */}
          <div
            className="relative px-5 pt-6 pb-5"
            style={{
              background: `linear-gradient(135deg, ${business.primaryColor}, ${business.secondaryColor})`,
            }}
          >
            <p className="text-white/70 text-[11px] font-medium tracking-wide uppercase mb-1">
              {business.shortDesc}
            </p>
            <h4 className="text-white text-lg font-semibold leading-tight">{business.name}</h4>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                <span className="text-white text-xs font-medium">{business.rating}</span>
              </div>
              <span className="text-white/40 text-xs">·</span>
              <span className="text-white/60 text-xs">{business.reviews} reseñas</span>
              <span className="text-white/40 text-xs">·</span>
              <span className="text-white/60 text-xs flex items-center gap-0.5">
                <MapPin size={10} /> {business.location}
              </span>
            </div>
          </div>

          {/* Mini Services */}
          <div className="bg-[#111]">
            {business.services.map((svc, i) => (
              <div key={i} className="lv2-mini-service">
                <div className="min-w-0">
                  <p className="text-white/90 text-[13px] font-medium truncate">{svc.name}</p>
                  <p className="text-white/40 text-[11px]">{svc.duration}</p>
                </div>
                <span className="text-white/70 text-[13px] font-semibold ml-3 flex-shrink-0">
                  {svc.price}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="px-4 py-4 bg-[#111]">
            <div
              className="w-full py-2.5 rounded-xl text-center text-white text-[13px] font-semibold"
              style={{ background: business.primaryColor }}
            >
              {ctaText}
            </div>
          </div>
        </div>
      </div>

      {/* Caption below frame */}
      <div className="text-center mt-4 max-w-[320px] mx-auto">
        <p className="text-white font-medium text-sm">{business.name}</p>
        <p className="text-white/40 text-xs mt-0.5">{business.shortDesc} · {business.location}</p>
        <a
          href={`/${business.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[#3F8697] text-xs font-medium mt-1.5 hover:underline"
        >
          Ver página demo <ArrowRight size={12} />
        </a>
      </div>
    </div>
  );
}

function ShowcaseSection() {
  const sectionRef = useScrollReveal();
  const pillsRef = useStaggerReveal('.lv2-showcase-pill', 60);
  const [activeIdx, setActiveIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const handleTabChange = useCallback((idx: number) => {
    if (idx === activeIdx) return;
    setActiveIdx(idx);
    setAnimKey((k) => k + 1);
  }, [activeIdx]);

  const active = SHOWCASE_DATA[activeIdx];

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <SectionTag text="Casos reales" />
          <SectionH2
            line1="Así se ven los negocios"
            line2="que ya usan TurnoLink."
          />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            Cada negocio tiene su propia página personalizada con su marca, sus servicios y sus productos.
          </p>
        </div>

        {/* Industry pills */}
        <div ref={pillsRef} className="lv2-showcase-pills-wrap mb-12">
          <div className="flex flex-wrap justify-center gap-2">
            {SHOWCASE_DATA.map((industry, idx) => {
              const Icon = industry.icon;
              return (
                <button
                  key={industry.id}
                  className={`lv2-showcase-pill ${activeIdx === idx ? 'active' : ''}`}
                  onClick={() => handleTabChange(idx)}
                >
                  <Icon size={15} />
                  {industry.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Phone cards */}
        <div key={animKey} className={`lv2-showcase-cards-enter flex flex-col sm:flex-row gap-8 sm:gap-10 justify-center items-start mx-auto ${active.businesses.length > 2 ? 'max-w-[1050px]' : 'max-w-[700px]'}`}>
          {active.businesses.map((biz, i) => (
            <PhoneCard key={biz.slug} business={biz} ctaText={active.ctaText} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <Link
            href="/register"
            className="lv2-glow-btn inline-flex items-center gap-2 bg-[#3F8697] text-white font-medium px-8 py-3.5 rounded-[10px] text-base"
          >
            Empezar gratis ahora
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════
   SOCIAL PROOF — Cambio 8: Tag "Resultados"
   ═════════════════════════════════════════ */
const TESTIMONIALS = [
  // — Servicios —
  {
    quote: 'Desde que usamos TurnoLink, las ausencias bajaron un 80%. El cobro de seña automático cambió todo.',
    name: 'Mariana López',
    role: 'Dueña',
    business: 'Estudio MR Pilates',
    image: 'https://randomuser.me/api/portraits/women/47.jpg',
  },
  // — Mercado —
  {
    quote: 'Armamos el catálogo en una hora. Los clientes nos escriben por WhatsApp directo desde la tienda. Las ventas crecieron un 40%.',
    name: 'Sofía Peralta',
    role: 'Dueña',
    business: 'Alma Deco — Decoración',
    image: 'https://randomuser.me/api/portraits/women/79.jpg',
  },
  // — Finanzas —
  {
    quote: 'El módulo de finanzas me mostró que gastaba más de lo que pensaba en insumos. Ajusté los precios y el margen subió un 25%.',
    name: 'Andrés Villalobos',
    role: 'Dueño',
    business: 'Barber Club Norte',
    image: 'https://randomuser.me/api/portraits/men/81.jpg',
  },
  // — Mercado —
  {
    quote: 'Vendíamos solo por Instagram y perdíamos mensajes. Con TurnoLink Mercado tenemos catálogo, stock y checkout con Mercado Pago. Otro nivel.',
    name: 'Camila Ríos',
    role: 'Fundadora',
    business: 'Nativa Indumentaria',
    image: 'https://randomuser.me/api/portraits/women/40.jpg',
  },
  // — Finanzas —
  {
    quote: 'Antes no sabía si el negocio daba ganancia o pérdida. Con los reportes de TurnoLink vi que un servicio me daba margen negativo. Lo ajusté y mejoró todo.',
    name: 'Gonzalo Méndez',
    role: 'Dueño',
    business: 'Centro de Estética Renueva',
    image: 'https://randomuser.me/api/portraits/men/86.jpg',
  },
  // — Servicios —
  {
    quote: 'Antes perdía 3 horas por día en WhatsApp coordinando turnos. Ahora mis clientes reservan solos, 24/7.',
    name: 'Lucas Fernández',
    role: 'Barbero',
    business: 'Barber Shop LF',
    image: 'https://randomuser.me/api/portraits/men/78.jpg',
  },
  // — Mercado —
  {
    quote: 'Tengo una panadería artesanal y quería vender online sin pagar Tiendanube. Con TurnoLink Mercado armé la tienda gratis y ya tengo pedidos por WhatsApp todos los días.',
    name: 'Florencia Aguirre',
    role: 'Dueña',
    business: 'Masa Madre BA',
    image: 'https://randomuser.me/api/portraits/women/63.jpg',
  },
  // — Finanzas —
  {
    quote: 'Configuramos 3 sucursales y el módulo de finanzas nos muestra la rentabilidad de cada una por separado. Cerramos una que no daba y duplicamos la que sí.',
    name: 'Carolina Ruiz',
    role: 'Gerente',
    business: 'Centro Dental Sonrisa',
    image: 'https://randomuser.me/api/portraits/women/57.jpg',
  },
  // — Servicios —
  {
    quote: 'Administramos 12 cabañas y antes era un caos de WhatsApp. Ahora el huésped reserva y paga la seña online. Check-in automático.',
    name: 'Valeria Torres',
    role: 'Dueña',
    business: 'Cabañas del Lago',
    image: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
  // — Servicios —
  {
    quote: 'Tenemos 4 canchas de pádel y 2 de fútbol. TurnoLink nos eliminó los solapamientos y el teléfono que no paraba de sonar.',
    name: 'Nicolás Romero',
    role: 'Socio',
    business: 'Pádel & Fútbol Norte',
    image: 'https://randomuser.me/api/portraits/men/76.jpg',
  },
];

function SocialProofSection() {
  const sectionRef = useScrollReveal();
  const statsRef = useStaggerReveal('.lv2-stat', 100);

  const stats = [
    { value: '+500', label: 'Negocios activos' },
    { value: '+25.000', label: 'Operaciones procesadas' },
    { value: 'Todo en uno', label: 'Plataforma integrada' },
    { value: '0%', label: 'Comisión sobre cobros' },
  ];

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 items-end mb-16">
          <div className="text-center lg:text-left">
            <SectionTag text="Resultados" />
            <SectionH2
              line1="Negocios que ya automatizaron"
              line2="su operación con TurnoLink."
            />
          </div>
          <div className="text-center lg:text-left">
            <p className="text-white/50 max-w-md mx-auto lg:mx-0 lg:ml-auto text-base leading-relaxed tracking-[-0.2px]">
              Escuchá de nuestros clientes cómo TurnoLink transformó la gestión de sus negocios.
            </p>
          </div>
        </div>

        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-16">
          {stats.map((s, i) => (
            <div
              key={i}
              className="lv2-stat lv2-bento-card p-6 text-center group"
            >
              <div className="relative z-10">
                <div className="text-3xl sm:text-4xl font-semibold tracking-[-2px] text-white mb-1 group-hover:text-[#3F8697] transition-colors duration-500">
                  {s.value}
                </div>
                <p className="text-xs text-white/35 tracking-tight font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden -mx-5 lg:-mx-10">
          <div className="lv2-testimonial-track flex gap-5 px-5 lg:px-10" style={{ width: 'max-content' }}>
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <div key={i} className="lv2-testimonial-card flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-white/50 text-[15px] leading-[26px] tracking-[-0.2px] flex-1 mb-5">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="border-t border-white/[0.06] pt-4 flex items-center gap-3">
                  {t.image && (
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      loading="lazy"
                    />
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
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════
   FAQ — Cambio 10: Nueva FAQ + respuestas actualizadas
   ═════════════════════════════════════════ */
const FAQS = LANDING_FAQS;

function FAQSection() {
  const sectionRef = useScrollReveal();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = useCallback(
    (i: number) => setOpenIdx((prev) => (prev === i ? null : i)),
    []
  );

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      id="faq"
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
              ¿Tenés dudas? Encontrá las respuestas a las consultas más comunes.
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
                    <p className="text-white/50 text-[15px] leading-[26px] tracking-[-0.2px]">{faq.a}</p>
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

/* CTASection imported from ./_components/cta-section */

/* Footer imported from ./_components/footer */

/* ═════════════════════════════════════════
   MAIN PAGE — Cambio 16: Nuevo orden de 12 secciones
   ═════════════════════════════════════════ */
export default function LandingV2Page() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#3F8697]/30 selection:text-white" style={{ overflowX: 'clip' }}>
      <Navbar />
      <HeroSection />
      <TrustStrip />
      <IndustryMarquee />
      <PlataformaSection />
      <PillarDeepDiveSection />
      <ProductShowcase />
      <FuncionalidadesSection />
      <IndustriasYPreciosSection />
      <ShowcaseSection />
      <SocialProofSection />
      <FAQSection />
      <CTASection />
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
