'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Code2,
  Monitor,
  Maximize2,
  MousePointerClick,
  Smartphone,
  Palette,
  CreditCard,
  Zap,
  Scaling,
  Moon,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  User,
  CheckCircle,
  Shield,
  Globe,
  Sparkles,
  TrendingUp,
  Users,
  Timer,
  DollarSign,
  X,
  MessageSquare,
  Phone,
  AlertTriangle,
  XCircle,
  Stethoscope,
  Scissors,
  Dumbbell,
  Building,
  Star,
  Lock,
  FileCode,
  Webhook,
  Server,
  Headphones,
  BarChart3,
  Bell,
  Search,
  Languages,
} from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '../_components/hooks';
import { SectionTag, SectionH2, WordReveal, GlassLine } from '../_components/ui';
import { Navbar } from '../_components/navbar';
import { Footer } from '../_components/footer';
import { CTASection } from '../_components/cta-section';

/* ═══════════════════════════════════════════
   DATA CONSTANTS
   ═══════════════════════════════════════════ */

const FEATURES = [
  {
    icon: Monitor,
    title: '3 modos de display',
    description: 'Inline, modal o botón flotante. Elegí cómo se muestra en tu web.',
  },
  {
    icon: Smartphone,
    title: 'Responsive',
    description: 'Se adapta a cualquier pantalla: desktop, tablet y celular.',
  },
  {
    icon: Palette,
    title: 'Colores personalizables',
    description: 'El widget hereda los colores de tu marca automáticamente.',
  },
  {
    icon: CreditCard,
    title: 'MercadoPago integrado',
    description: 'Cobrá señas directo desde el widget. El pago llega a tu cuenta.',
  },
  {
    icon: Languages,
    title: 'Multi-idioma',
    description: 'Disponible en español e inglés. Tu cliente lo ve en su idioma.',
  },
  {
    icon: Code2,
    title: 'Sin dependencias',
    description: 'Vanilla JS puro. Funciona en cualquier stack sin conflictos.',
  },
  {
    icon: Lock,
    title: 'Dominio whitelist',
    description: 'Solo los dominios que autorices pueden mostrar tu widget.',
  },
  {
    icon: Bell,
    title: 'Recordatorios automáticos',
    description: 'WhatsApp + email para que tus clientes no se olviden del turno.',
  },
  {
    icon: Search,
    title: 'SEO friendly',
    description: 'Carga asíncrona. No afecta la velocidad ni el SEO de tu web.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Trackeá cuántas reservas se generan desde el widget.',
  },
];

const USE_CASES = [
  {
    icon: Stethoscope,
    industry: 'Salud',
    title: 'Clínica Dental Smile',
    result: 'Embebió el widget en su web y redujo llamadas telefónicas un 60%.',
  },
  {
    icon: Scissors,
    industry: 'Belleza',
    title: 'Peluquería Luxe',
    result: 'Dejó de perder turnos de fin de semana. Ahora se reservan solos.',
  },
  {
    icon: Dumbbell,
    industry: 'Deportes',
    title: 'Canchas del Sur',
    result: 'Duplicó reservas online en su primer mes con el widget.',
  },
  {
    icon: Building,
    industry: 'Hospedaje',
    title: 'Apart Hotel Vista',
    result: 'Integró check-in directo en su web. Menos trabajo manual.',
  },
];

const COMPARISON_DATA = {
  headers: ['Feature', 'TurnoLink', 'Calendly', 'WhatsApp Manual'],
  rows: [
    { feature: 'Precio desde', turnolink: 'Gratis', calendly: '$10 USD/mo', whatsapp: 'Gratis' },
    { feature: 'Tiempo de setup', turnolink: '5 minutos', calendly: '30+ minutos', whatsapp: 'N/A' },
    { feature: 'Cobro integrado (AR$)', turnolink: 'MercadoPago', calendly: 'Stripe (USD)', whatsapp: 'Manual' },
    { feature: 'Recordatorios WhatsApp', turnolink: 'Incluido', calendly: 'No', whatsapp: 'Manual' },
    { feature: 'Colores personalizables', turnolink: 'Ilimitado', calendly: 'Solo logo', whatsapp: 'N/A' },
    { feature: 'En español nativo', turnolink: 'Sí', calendly: 'Traducción parcial', whatsapp: 'Sí' },
    { feature: 'Soporte en tu zona horaria', turnolink: 'Argentina', calendly: 'EEUU', whatsapp: 'N/A' },
  ],
};

const PRICING_TIERS = [
  {
    name: 'Gratis',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Para empezar a recibir reservas online.',
    features: [
      'Widget iframe (1 servicio)',
      'Branding TurnoLink visible',
      '1 dominio autorizado',
      'Recordatorios básicos',
    ],
    excluded: [
      'Colores personalizables',
      'MercadoPago en widget',
      'Soporte prioritario',
    ],
    cta: 'Empezar Gratis',
    ctaHref: '/register',
    popular: false,
  },
  {
    name: 'Profesional',
    monthlyPrice: 8990,
    annualPrice: 7190,
    description: 'Para negocios que quieren su marca.',
    features: [
      'Widget iframe (ilimitado)',
      'Branding removible',
      '3 dominios autorizados',
      'Colores personalizables',
      'MercadoPago en widget',
    ],
    excluded: [
      'Webhooks',
      'API REST',
    ],
    cta: 'Probar 14 días',
    ctaHref: '/register?plan=professional',
    popular: false,
  },
  {
    name: 'Negocio',
    monthlyPrice: 14990,
    annualPrice: 11990,
    description: 'Para negocios en crecimiento.',
    features: [
      'Widget iframe (ilimitado)',
      'Branding removible',
      '10 dominios autorizados',
      'Colores personalizables',
      'MercadoPago en widget',
      'Webhooks',
      'Soporte por email',
    ],
    excluded: [
      'API REST',
    ],
    cta: 'Probar 14 días',
    ctaHref: '/register?plan=business',
    popular: true,
  },
  {
    name: 'Plataforma',
    monthlyPrice: 29990,
    annualPrice: 23990,
    description: 'Para agencias y plataformas.',
    features: [
      'Widget iframe (ilimitado)',
      'Sin marca TurnoLink',
      'Dominios ilimitados',
      'Colores personalizables',
      'MercadoPago en widget',
      'Webhooks',
      'API REST completa',
      'React Components',
      'SLA 99.9%',
      'Soporte dedicado',
    ],
    excluded: [],
    cta: 'Contactar Ventas',
    ctaHref: 'https://wa.me/5491100000000?text=Hola%2C%20quiero%20info%20sobre%20el%20plan%20Plataforma',
    popular: false,
  },
];

const TECH_SPECS = [
  { label: 'Runtime', value: 'Vanilla JS — 4KB gzipped, zero dependencies' },
  { label: 'Isolation', value: 'iframe sandboxed — no afecta tu CSS/JS' },
  { label: 'Security', value: 'CSP compatible, CORS configurado, dominio whitelist' },
  { label: 'Protocol', value: 'HTTPS/TLS obligatorio, certificados auto-renovados' },
  { label: 'API REST', value: 'Endpoints RESTful con JWT auth (tier Plataforma)' },
  { label: 'Components', value: 'React wrapper disponible (tier Plataforma)' },
  { label: 'Webhooks', value: 'POST en tiempo real: reserva creada, pago confirmado, cancelación' },
  { label: 'Rate Limiting', value: '100 req/min por IP, 1000 req/min por API key' },
  { label: 'Uptime', value: '99.9% SLA, infraestructura en AWS São Paulo' },
];

const TESTIMONIALS = [
  {
    quote: 'Instalé el widget en 5 minutos y esa noche ya tenía 3 reservas nuevas. No lo podía creer.',
    name: 'Laura M.',
    role: 'Dueña de centro de estética',
    avatar: 'LM',
    image: 'https://randomuser.me/api/portraits/women/23.jpg',
  },
  {
    quote: 'Como agencia, lo integramos en los sitios de nuestros clientes. Funciona perfecto y nos ahorra horas.',
    name: 'Martín R.',
    role: 'Director de agencia web',
    avatar: 'MR',
    image: 'https://randomuser.me/api/portraits/men/20.jpg',
  },
  {
    quote: 'Tenemos 4 sucursales con el widget embebido. Cada una con su estilo y colores. Impecable.',
    name: 'Carolina S.',
    role: 'Gerente de cadena de gimnasios',
    avatar: 'CS',
    image: 'https://randomuser.me/api/portraits/women/24.jpg',
  },
];

const FAQ_ITEMS = [
  {
    q: '¿Qué es el widget embebible de TurnoLink?',
    a: 'Es un componente que se inserta en tu sitio web con una sola línea de código. Permite a tus clientes reservar turnos, elegir servicios y pagar señas sin salir de tu página.',
  },
  {
    q: '¿Cómo lo instalo en mi web?',
    a: 'Copiás un snippet HTML desde tu panel de TurnoLink y lo pegás en tu sitio. No necesitás saber programar. Es literal copiar y pegar.',
  },
  {
    q: '¿Funciona en WordPress, Wix y Shopify?',
    a: 'Sí. Funciona en cualquier plataforma que soporte HTML: WordPress, Wix, Shopify, Webflow, Squarespace, React, Vue, Angular y más.',
  },
  {
    q: '¿Puedo personalizar los colores?',
    a: 'Sí. Desde tu panel configurás los colores de tu marca y el widget los hereda automáticamente. Disponible en planes Profesional y superiores.',
  },
  {
    q: '¿Se puede cobrar señas desde el widget?',
    a: 'Sí. Con MercadoPago integrado, tu cliente paga la seña directamente desde el widget. El dinero llega a tu cuenta de MercadoPago.',
  },
  {
    q: '¿Afecta la velocidad de mi web?',
    a: 'No. El widget carga de forma asíncrona, pesa solo 4KB y se ejecuta dentro de un iframe aislado. No impacta tu PageSpeed ni tu SEO.',
  },
  {
    q: '¿Cuántos dominios puedo conectar?',
    a: 'Depende de tu plan: 1 dominio en Gratis, 3 en Profesional, 10 en Negocio, ilimitados en Plataforma. Esto protege tu widget de uso no autorizado.',
  },
  {
    q: '¿Qué pasa si quiero quitar la marca TurnoLink?',
    a: 'En los planes Profesional y Negocio podés remover el branding. En el plan Plataforma, el widget no muestra ninguna referencia a TurnoLink.',
  },
  {
    q: '¿Tienen API REST para integraciones custom?',
    a: 'Sí. El plan Plataforma incluye acceso completo a la API REST con autenticación JWT, webhooks en tiempo real y React Components.',
  },
  {
    q: '¿Puedo probar gratis antes de pagar?',
    a: 'Sí. El plan Gratis es permanente, sin límite de tiempo. Los planes pagos incluyen 14 días de prueba gratuita sin compromiso.',
  },
];

/* ═══════════════════════════════════════════
   INTERACTIVE BROWSER MOCKUP (preserved)
   ═══════════════════════════════════════════ */
function BrowserMockup({ mode, className = '' }: { mode: 'inline' | 'modal' | 'fab'; className?: string }) {
  const [bookingStep, setBookingStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBookingStep((s) => (s + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const steps = ['Servicios', 'Fecha y hora', 'Datos', 'Confirmado'];

  return (
    <div className={`lv2-mockup-wrapper ${className}`}>
      <div className="lv2-mockup-frame">
        {/* Browser chrome */}
        <div className="bg-[#1a1a1a] px-4 py-2.5 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex-1 mx-3">
            <div className="bg-white/[0.06] rounded-md px-3 py-1 text-[10px] text-white/30 font-mono text-center">
              www.tunegocio.com
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="bg-[#111] p-4 min-h-[220px] relative">
          {/* Fake site content */}
          <div className="space-y-2 mb-4">
            <div className="h-3 w-28 rounded bg-white/[0.08]" />
            <div className="h-2 w-44 rounded bg-white/[0.04]" />
            <div className="h-2 w-36 rounded bg-white/[0.04]" />
          </div>

          {mode === 'inline' && (
            <div className="rounded-lg border border-[#3F8697]/30 bg-[#3F8697]/[0.04] p-3 transition-all duration-500">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-[#3F8697]/30" />
                <div className="h-2.5 w-20 rounded bg-white/[0.12]" />
              </div>
              <div className="flex items-center gap-1 mb-3">
                {steps.map((s, i) => (
                  <div key={s} className="flex items-center gap-1">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[6px] font-bold transition-all duration-500 ${
                      i < bookingStep ? 'bg-emerald-500 text-white' : i === bookingStep ? 'bg-[#3F8697] text-white ring-2 ring-[#3F8697]/30' : 'bg-white/[0.08] text-white/30'
                    }`}>
                      {i < bookingStep ? <Check size={7} /> : i + 1}
                    </div>
                    {i < 3 && <div className={`w-3 h-[1px] transition-colors duration-500 ${i < bookingStep ? 'bg-emerald-500' : 'bg-white/10'}`} />}
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                {bookingStep === 0 && (
                  <>
                    <div className="flex items-center gap-2 p-1.5 rounded bg-white/[0.04] border border-white/[0.06]">
                      <div className="w-3 h-3 rounded bg-[#3F8697]/30" />
                      <div className="h-1.5 w-16 rounded bg-white/[0.1]" />
                      <div className="ml-auto h-1.5 w-8 rounded bg-[#3F8697]/30" />
                    </div>
                    <div className="flex items-center gap-2 p-1.5 rounded bg-[#3F8697]/[0.08] border border-[#3F8697]/20">
                      <div className="w-3 h-3 rounded bg-[#3F8697]/50" />
                      <div className="h-1.5 w-20 rounded bg-white/[0.15]" />
                      <div className="ml-auto h-1.5 w-8 rounded bg-[#3F8697]/40" />
                    </div>
                    <div className="flex items-center gap-2 p-1.5 rounded bg-white/[0.04] border border-white/[0.06]">
                      <div className="w-3 h-3 rounded bg-[#3F8697]/30" />
                      <div className="h-1.5 w-14 rounded bg-white/[0.1]" />
                      <div className="ml-auto h-1.5 w-8 rounded bg-[#3F8697]/30" />
                    </div>
                  </>
                )}
                {bookingStep === 1 && (
                  <div className="flex gap-2">
                    <div className="grid grid-cols-5 gap-[2px] flex-1">
                      {Array.from({ length: 15 }).map((_, i) => (
                        <div key={i} className={`h-3 rounded-sm text-center text-[5px] leading-[12px] ${
                          i === 7 ? 'bg-[#3F8697] text-white' : 'bg-white/[0.04] text-white/20'
                        }`}>{i + 10}</div>
                      ))}
                    </div>
                    <div className="space-y-[2px] w-12">
                      {['09:00', '10:30', '14:00'].map((t) => (
                        <div key={t} className={`h-3 rounded-sm text-[5px] text-center leading-[12px] ${
                          t === '10:30' ? 'bg-[#3F8697] text-white' : 'bg-white/[0.04] text-white/20'
                        }`}>{t}</div>
                      ))}
                    </div>
                  </div>
                )}
                {bookingStep === 2 && (
                  <>
                    <div className="h-4 w-full rounded bg-white/[0.06] border border-white/[0.08]" />
                    <div className="h-4 w-full rounded bg-white/[0.06] border border-white/[0.08]" />
                    <div className="h-4 w-2/3 rounded bg-white/[0.06] border border-white/[0.08]" />
                  </>
                )}
                {bookingStep === 3 && (
                  <div className="flex flex-col items-center py-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center mb-1">
                      <Check size={10} className="text-emerald-400" />
                    </div>
                    <div className="h-1.5 w-16 rounded bg-emerald-500/30 mb-1" />
                    <div className="h-1 w-24 rounded bg-white/[0.06]" />
                  </div>
                )}
              </div>
              <div className="mt-2 pt-2 border-t border-white/[0.04] flex justify-center">
                <div className="h-1 w-16 rounded bg-white/[0.06]" />
              </div>
            </div>
          )}

          {mode === 'modal' && (
            <>
              <div className="h-2 w-32 rounded bg-white/[0.04] mb-2" />
              <div className="h-2 w-24 rounded bg-white/[0.03]" />
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center rounded-b-[18px]">
                <div className="w-[75%] bg-[#1a1a1a] border border-white/[0.08] rounded-xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(63,134,151,0.08)]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-[#3F8697]/30" />
                      <div className="h-2 w-16 rounded bg-white/[0.12]" />
                    </div>
                    <div className="w-4 h-4 rounded-full bg-white/[0.06]" />
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className={`w-3 h-3 rounded-full text-[5px] flex items-center justify-center font-bold ${
                        i < bookingStep ? 'bg-emerald-500 text-white' : i === bookingStep % 3 ? 'bg-[#3F8697] text-white' : 'bg-white/[0.08] text-white/30'
                      }`}>{i < bookingStep ? <Check size={6} /> : i + 1}</div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 rounded bg-white/[0.04] border border-white/[0.06]" />
                    <div className="h-3 rounded bg-[#3F8697]/[0.08] border border-[#3F8697]/20" />
                    <div className="h-3 rounded bg-white/[0.04] border border-white/[0.06]" />
                  </div>
                  <div className="mt-2 h-5 rounded-md bg-[#3F8697] flex items-center justify-center">
                    <div className="h-1 w-10 rounded bg-white/40" />
                  </div>
                </div>
              </div>
            </>
          )}

          {mode === 'fab' && (
            <>
              <div className="h-2 w-32 rounded bg-white/[0.04] mb-2" />
              <div className="h-2 w-44 rounded bg-white/[0.03] mb-2" />
              <div className="h-2 w-36 rounded bg-white/[0.03] mb-2" />
              <div className="h-2 w-28 rounded bg-white/[0.03] mb-2" />
              <div className="h-2 w-40 rounded bg-white/[0.03]" />
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#3F8697] shadow-[0_8px_30px_rgba(63,134,151,0.35)] animate-[lv2-badge-float_3s_ease-in-out_infinite]">
                <Calendar size={10} className="text-white" />
                <span className="text-[9px] text-white font-semibold tracking-tight">Reservar turno</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SECTION 1 — HERO (improved)
   ═══════════════════════════════════════════ */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-28 lg:pt-32 pb-8 px-5 lg:px-10 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[#3F8697]/[0.08] blur-[140px] lv2-glow-orb pointer-events-none" />
      <div
        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[#3F8697]/[0.05] blur-[100px] lv2-glow-orb pointer-events-none"
        style={{ animationDelay: '3s' }}
      />

      <div className="max-w-[1200px] mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div>
            <div className="mb-6">
              <span className="lv2-pill inline-flex items-center px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm text-white/80">
                Widget de Reservas Embebible
              </span>
            </div>

            <h1 className="text-[36px] sm:text-[44px] lg:text-[54px] font-normal leading-[1.05] tracking-[-2px]">
              <WordReveal text="Agrega reservas online" />
              <br />
              <WordReveal text="a tu web en 5 minutos." muted />
            </h1>

            <p className="mt-6 text-white/45 text-base lg:text-lg max-w-[480px] tracking-[-0.2px] leading-relaxed">
              Convertí visitantes en clientes 24/7 sin que salgan de tu página. Widget nativo, cobro integrado, cero fricción.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3 mt-8">
              <Link
                href="/register"
                className="lv2-glow-btn inline-flex items-center gap-2 bg-[#3F8697] text-white font-medium px-7 py-3.5 rounded-[10px] text-sm"
              >
                Probar Gratis
                <ArrowRight size={16} />
              </Link>
              <a
                href="#demo"
                className="lv2-glass inline-flex items-center gap-2 text-white/80 font-medium px-7 py-3.5 rounded-[10px] text-sm"
              >
                Ver Demo en Vivo
                <ChevronDown size={16} />
              </a>
            </div>

            {/* Trust strip */}
            <div className="flex flex-wrap items-center gap-5 mt-10 text-xs text-white/35">
              <span className="flex items-center gap-1.5">
                <Users size={12} className="text-[#3F8697]" /> Usado por +500 negocios
              </span>
              <span className="flex items-center gap-1.5">
                <Shield size={12} className="text-[#3F8697]" /> No rompe tu sitio
              </span>
              <span className="flex items-center gap-1.5">
                <Zap size={12} className="text-[#3F8697]" /> Se actualiza solo
              </span>
            </div>
          </div>

          {/* Right: Interactive mockup */}
          <div className="relative lv2-hero-img">
            <BrowserMockup mode="inline" />

            {/* Floating badge: booking count */}
            <div className="hidden lg:flex lv2-badge-float absolute -left-6 top-1/4 bg-[#0D0D0D] rounded-2xl p-3 items-center gap-2.5 border border-white/[0.06] shadow-[rgba(63,134,151,0.25)_0px_8px_30px]">
              <div className="w-8 h-8 rounded-xl lv2-icon-glow flex items-center justify-center">
                <Calendar size={14} className="text-[#3F8697]" />
              </div>
              <div>
                <span className="text-white text-xs font-semibold block leading-tight">Reserva creada</span>
                <span className="text-white/40 text-[10px]">Hace 2 min</span>
              </div>
            </div>

            {/* Floating badge: payment */}
            <div
              className="hidden lg:flex lv2-badge-float absolute -right-4 bottom-1/4 bg-[#0D0D0D] rounded-2xl p-3 items-center gap-2.5 border border-white/[0.06] shadow-[rgba(63,134,151,0.2)_0px_8px_30px]"
              style={{ animationDelay: '1.5s' }}
            >
              <div className="w-8 h-8 rounded-xl lv2-icon-glow flex items-center justify-center">
                <CreditCard size={14} className="text-[#3F8697]" />
              </div>
              <div>
                <span className="text-white text-xs font-semibold block leading-tight">Pago confirmado</span>
                <span className="text-white/40 text-[10px]">MercadoPago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SECTION 2 — SOCIAL PROOF STRIP
   ═══════════════════════════════════════════ */
function SocialProofStrip() {
  const sectionRef = useScrollReveal();

  const stats = [
    { value: '+500', label: 'negocios activos', icon: Users },
    { value: '+40%', label: 'más conversión', icon: TrendingUp },
    { value: '5 min', label: 'tiempo de setup', icon: Timer },
    { value: '99.9%', label: 'uptime garantizado', icon: Server },
  ];

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="lv2-section py-[60px] lg:py-[80px] px-5 lg:px-10">
      <div className="max-w-[1000px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <Icon size={20} className="text-[#3F8697] mx-auto mb-3" />
                <div className="text-[32px] lg:text-[40px] font-normal tracking-[-2px] leading-none bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  {s.value}
                </div>
                <div className="text-white/35 text-sm mt-1">{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SECTION 3 — PROBLEM → SOLUTION
   ═══════════════════════════════════════════ */
function ProblemSolutionSection() {
  const sectionRef = useScrollReveal();

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-14">
          <SectionTag text="El problema" />
          <SectionH2 line1="¿Perdés clientes porque tu web" line2="no tiene reservas?" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Problem */}
          <div className="lv2-card p-8 border-l-2 border-l-red-500/40">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <h3 className="text-white font-medium text-lg">Sin reservas online</h3>
            </div>
            <ul className="space-y-4">
              {[
                { icon: XCircle, text: 'Los visitantes se van porque no pueden reservar al instante' },
                { icon: Phone, text: 'WhatsApp no escala — respondés cuando podés, perdés cuando no' },
                { icon: Clock, text: 'Formularios largos que nadie completa' },
                { icon: X, text: 'Sin confirmación inmediata, el cliente duda y no vuelve' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.text} className="flex items-start gap-3">
                    <Icon size={16} className="text-red-400/60 mt-0.5 shrink-0" />
                    <span className="text-white/50 text-sm leading-relaxed">{item.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Solution */}
          <div className="lv2-card p-8 border-l-2 border-l-emerald-500/40">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle size={20} className="text-emerald-400" />
              </div>
              <h3 className="text-white font-medium text-lg">Con TurnoLink embebido</h3>
            </div>
            <ul className="space-y-4">
              {[
                { icon: CheckCircle, text: 'Widget nativo en tu web — tus clientes reservan sin salir' },
                { icon: CheckCircle, text: 'Confirmación instantánea por WhatsApp y email' },
                { icon: CheckCircle, text: 'Cobro de seña integrado con MercadoPago' },
                { icon: CheckCircle, text: 'Cero fricción — 3 clicks y listo' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.text} className="flex items-start gap-3">
                    <Icon size={16} className="text-emerald-400/60 mt-0.5 shrink-0" />
                    <span className="text-white/50 text-sm leading-relaxed">{item.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SECTION 4 — ROI / BENEFITS WITH NUMBERS
   ═══════════════════════════════════════════ */
function ROISection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.roi-card', 120);

  const benefits = [
    {
      icon: TrendingUp,
      stat: '+40%',
      title: 'más reservas',
      description: 'Comparado con formularios tradicionales o solo WhatsApp.',
    },
    {
      icon: Timer,
      stat: '5 min',
      title: 'para integrar',
      description: 'Copiá, pegá y tu web ya tiene reservas online.',
    },
    {
      icon: DollarSign,
      stat: '$0',
      title: 'en desarrollo',
      description: 'No necesitás contratar un developer ni una agencia.',
    },
    {
      icon: Clock,
      stat: '24/7',
      title: 'automático',
      description: 'Recibí reservas mientras dormís. El widget no descansa.',
    },
  ];

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-14">
          <SectionTag text="Resultados reales" />
          <SectionH2 line1="Números que hablan" line2="por sí solos." />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="roi-card lv2-card p-8 text-center hover:bg-[#0A0A0A] transition-colors duration-300"
              >
                <div className="w-14 h-14 rounded-2xl lv2-icon-glow flex items-center justify-center mx-auto mb-5">
                  <Icon size={24} className="text-[#3F8697]" />
                </div>
                <div className="text-[36px] font-normal tracking-[-2px] leading-none bg-gradient-to-r from-[#3F8697] to-[#5BB5C5] bg-clip-text text-transparent">
                  {b.stat}
                </div>
                <h3 className="text-white font-medium text-base mt-2">{b.title}</h3>
                <p className="text-white/40 text-sm mt-2 leading-relaxed">{b.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SECTION 5 — HOW IT WORKS (improved)
   ═══════════════════════════════════════════ */
function HowItWorksSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 150);

  const steps = [
    {
      number: '01',
      title: 'Elegí tu estilo y copiá una línea',
      description: 'Desde tu panel de TurnoLink elegís el modo (inline, modal o flotante) y copiás el snippet HTML.',
      icon: Code2,
    },
    {
      number: '02',
      title: 'Pegalo en cualquier página',
      description: 'HTML, WordPress, Wix, Shopify, Webflow, React. Si soporta HTML, soporta TurnoLink.',
      icon: Monitor,
    },
    {
      number: '03',
      title: 'Tus clientes reservan sin salir',
      description: 'Eligen servicio, horario y pagan la seña. Todo dentro de tu web. Vos recibís la reserva como siempre.',
      icon: CheckCircle,
    },
  ];

  return (
    <section
      id="como-funciona"
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Cómo funciona" />
          <SectionH2 line1="Tres pasos." line2="Cero complicaciones." />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.number}
                className="lv2-card-stagger lv2-card p-8 border-l-2 border-l-[#3F8697] hover:bg-[#0A0A0A] transition-colors duration-300"
              >
                <div className="w-11 h-11 rounded-xl lv2-icon-glow flex items-center justify-center mb-5">
                  <Icon size={20} className="text-[#3F8697]" />
                </div>
                <span className="text-[#3F8697] text-xs font-mono font-bold tracking-wider">{s.number}</span>
                <h3 className="text-white font-medium text-lg tracking-tight mt-2">{s.title}</h3>
                <p className="text-white/40 text-sm mt-2 leading-relaxed">{s.description}</p>
              </div>
            );
          })}
        </div>

        {/* Code snippet */}
        <div className="mt-10 max-w-[600px] mx-auto">
          <div className="lv2-card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
              <span className="text-xs text-white/40 font-mono">tu-pagina.html</span>
            </div>
            <div className="p-5">
              <pre className="text-[13px] font-mono text-white/70 leading-relaxed overflow-x-auto whitespace-pre">{`<script src="https://app.turnolink.com/embed.js"
  data-slug="tu-negocio">
</script>`}</pre>
            </div>
          </div>
          <p className="text-center text-white/25 text-xs mt-3">Eso es todo. En serio.</p>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SECTION 6 — INTERACTIVE DEMO (preserved)
   ═══════════════════════════════════════════ */
function DemoSection() {
  const sectionRef = useScrollReveal();
  const [activeMode, setActiveMode] = useState<'inline' | 'modal' | 'fab'>('inline');
  const [copied, setCopied] = useState(false);

  const modes = [
    { key: 'inline' as const, label: 'Inline', icon: Monitor, desc: 'Se integra directo en tu contenido' },
    { key: 'modal' as const, label: 'Modal', icon: Maximize2, desc: 'Popup elegante sobre tu sitio' },
    { key: 'fab' as const, label: 'Botón flotante', icon: MousePointerClick, desc: 'Siempre visible en la esquina' },
  ];

  const snippets: Record<string, string> = {
    inline: '<script src="https://app.turnolink.com/embed.js"\n  data-slug="tu-negocio">\n</script>',
    modal: '<script src="https://app.turnolink.com/embed.js"\n  data-slug="tu-negocio"\n  data-mode="modal">\n</script>\n\n<button onclick="TurnoLink.open()">\n  Reservar turno\n</button>',
    fab: '<script src="https://app.turnolink.com/embed.js"\n  data-slug="tu-negocio"\n  data-mode="floating-button"\n  data-button-text="Reservar turno"\n  data-button-color="#3F8697">\n</script>',
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeMode]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="demo"
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[140px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-14">
          <SectionTag text="Demo interactiva" />
          <SectionH2 line1="Mirá cómo se ve" line2="en un sitio real." />
          <p className="mt-4 text-white/40 text-base max-w-lg mx-auto">
            Seleccioná un modo y mirá en vivo cómo funciona el widget embebido en una web.
          </p>
        </div>

        {/* Mode selector pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {modes.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.key}
                onClick={() => setActiveMode(m.key)}
                className={`lv2-showcase-pill ${activeMode === m.key ? 'active' : ''}`}
              >
                <Icon size={14} className="mr-2" />
                {m.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Live mockup */}
          <div>
            <div className="transition-all duration-500">
              <BrowserMockup mode={activeMode} />
            </div>
            <p className="text-center text-white/30 text-xs mt-4">
              {activeMode === 'inline' && 'El widget se integra directamente en el contenido de tu página. Ideal para landing pages.'}
              {activeMode === 'modal' && 'Un popup elegante que aparece al hacer click en un botón. Ideal para sitios con mucho contenido.'}
              {activeMode === 'fab' && 'Un botón flotante siempre visible. Ideal para que el cliente reserve desde cualquier sección.'}
            </p>
          </div>

          {/* Right: Code + info */}
          <div className="space-y-5">
            <div className="lv2-card p-0 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
                <span className="text-xs text-white/40 font-mono">index.html</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-[11px] text-white/50 hover:text-white hover:bg-white/[0.08] transition-all duration-300"
                >
                  {copied ? <Check size={10} /> : <Copy size={10} />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <div className="p-5">
                <pre className="text-[13px] font-mono text-white/70 leading-relaxed overflow-x-auto whitespace-pre">
                  {snippets[activeMode]}
                </pre>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <Smartphone size={16} className="text-[#3F8697] mb-2" />
                <span className="text-white/70 text-xs font-medium block">Responsive</span>
                <span className="text-white/30 text-[11px]">Se adapta a cualquier pantalla</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <Palette size={16} className="text-[#3F8697] mb-2" />
                <span className="text-white/70 text-xs font-medium block">Tu marca</span>
                <span className="text-white/30 text-[11px]">Hereda tus colores y logo</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <CreditCard size={16} className="text-[#3F8697] mb-2" />
                <span className="text-white/70 text-xs font-medium block">Cobro integrado</span>
                <span className="text-white/30 text-[11px]">Seña con MercadoPago</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <Scaling size={16} className="text-[#3F8697] mb-2" />
                <span className="text-white/70 text-xs font-medium block">Auto-resize</span>
                <span className="text-white/30 text-[11px]">Se ajusta al contenido</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SECTION 7 — FEATURES GRID (expanded to 10)
   ═══════════════════════════════════════════ */
function FeaturesSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.feature-card', 80);

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Características" />
          <SectionH2 line1="Todo lo que necesitás," line2="nada que no." />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="feature-card lv2-card p-6 hover:bg-[#0A0A0A] transition-colors duration-300"
              >
                <div className="w-10 h-10 rounded-xl lv2-icon-glow flex items-center justify-center mb-4">
                  <Icon size={18} className="text-[#3F8697]" />
                </div>
                <h3 className="text-white font-medium text-sm tracking-tight">{f.title}</h3>
                <p className="text-white/40 text-xs mt-1.5 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SECTION 8 — USE CASES BY INDUSTRY
   ═══════════════════════════════════════════ */
function UseCasesSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.usecase-card', 120);

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-14">
          <SectionTag text="Casos de uso" />
          <SectionH2 line1="Negocios que ya" line2="convirtieron más." />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {USE_CASES.map((uc) => {
            const Icon = uc.icon;
            return (
              <div
                key={uc.title}
                className="usecase-card lv2-card p-7 hover:bg-[#0A0A0A] transition-colors duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl lv2-icon-glow flex items-center justify-center">
                    <Icon size={20} className="text-[#3F8697]" />
                  </div>
                  <span className="text-[#3F8697] text-xs font-medium uppercase tracking-wider">{uc.industry}</span>
                </div>
                <h3 className="text-white font-medium text-sm tracking-tight">{uc.title}</h3>
                <p className="text-white/40 text-sm mt-2 leading-relaxed">{uc.result}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SECTION 9 — COMPARISON TABLE
   ═══════════════════════════════════════════ */
function ComparisonSection() {
  const sectionRef = useScrollReveal();

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10">
      <div className="max-w-[900px] mx-auto">
        <div className="text-center mb-14">
          <SectionTag text="Comparativa" />
          <SectionH2 line1="TurnoLink vs." line2="las alternativas." />
        </div>

        <div className="lv2-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left p-4 text-white/40 font-medium text-xs uppercase tracking-wider">Feature</th>
                  <th className="text-center p-4 text-[#3F8697] font-semibold text-xs uppercase tracking-wider">TurnoLink</th>
                  <th className="text-center p-4 text-white/40 font-medium text-xs uppercase tracking-wider">Calendly</th>
                  <th className="text-center p-4 text-white/40 font-medium text-xs uppercase tracking-wider">WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_DATA.rows.map((row, i) => (
                  <tr key={row.feature} className={i < COMPARISON_DATA.rows.length - 1 ? 'border-b border-white/[0.04]' : ''}>
                    <td className="p-4 text-white/60 text-sm">{row.feature}</td>
                    <td className="p-4 text-center">
                      <span className="text-emerald-400 font-medium text-sm">{row.turnolink}</span>
                    </td>
                    <td className="p-4 text-center text-white/40 text-sm">{row.calendly}</td>
                    <td className="p-4 text-center text-white/40 text-sm">{row.whatsapp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-white/25 text-xs mt-4">
          Datos actualizados a marzo 2026. Precios en planes equivalentes.
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SECTION 10 — PRICING
   ═══════════════════════════════════════════ */
function PricingSection() {
  const sectionRef = useScrollReveal();
  const [annual, setAnnual] = useState(false);

  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratis';
    return `$${price.toLocaleString('es-AR')}`;
  };

  return (
    <section id="precios" ref={sectionRef as React.RefObject<HTMLElement>} className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-10">
          <SectionTag text="Precios" />
          <SectionH2 line1="Planes simples." line2="Sin sorpresas." />
          <p className="mt-4 text-white/40 text-base max-w-lg mx-auto">
            El widget embebible está incluido en todos los planes. Elegí el que mejor se ajuste a tu negocio.
          </p>
        </div>

        {/* Annual toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={`text-sm ${!annual ? 'text-white' : 'text-white/40'}`}>Mensual</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${annual ? 'bg-[#3F8697]' : 'bg-white/10'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${annual ? 'translate-x-[26px]' : 'translate-x-0.5'}`} />
          </button>
          <span className={`text-sm ${annual ? 'text-white' : 'text-white/40'}`}>
            Anual <span className="text-emerald-400 text-xs font-medium">-20%</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`lv2-card p-7 flex flex-col relative ${tier.popular ? 'lv2-pricing-popular' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-[#3F8697] text-white text-[10px] font-semibold uppercase tracking-wider">
                    Popular
                  </span>
                </div>
              )}

              <h3 className="text-white font-medium text-lg">{tier.name}</h3>
              <p className="text-white/40 text-xs mt-1">{tier.description}</p>

              <div className="mt-5 mb-6">
                <span className="text-[32px] font-normal tracking-[-1.5px] text-white leading-none">
                  {formatPrice(annual ? tier.annualPrice : tier.monthlyPrice)}
                </span>
                {tier.monthlyPrice > 0 && (
                  <span className="text-white/30 text-xs ml-1">/mes</span>
                )}
              </div>

              <ul className="space-y-2.5 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-white/60 text-xs leading-relaxed">{f}</span>
                  </li>
                ))}
                {tier.excluded.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <X size={14} className="text-white/15 mt-0.5 shrink-0" />
                    <span className="text-white/25 text-xs leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {tier.ctaHref.startsWith('http') ? (
                  <a
                    href={tier.ctaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-[10px] text-sm font-medium transition-all duration-300 ${
                      tier.popular
                        ? 'lv2-glow-btn bg-[#3F8697] text-white'
                        : 'bg-white/[0.04] border border-white/[0.08] text-white/70 hover:bg-white/[0.08] hover:text-white'
                    }`}
                  >
                    {tier.cta}
                    <ArrowRight size={14} />
                  </a>
                ) : (
                  <Link
                    href={tier.ctaHref}
                    className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-[10px] text-sm font-medium transition-all duration-300 ${
                      tier.popular
                        ? 'lv2-glow-btn bg-[#3F8697] text-white'
                        : 'bg-white/[0.04] border border-white/[0.08] text-white/70 hover:bg-white/[0.08] hover:text-white'
                    }`}
                  >
                    {tier.cta}
                    <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SECTION 11 — TECH SPECS (for developers)
   ═══════════════════════════════════════════ */
function TechSpecsSection() {
  const sectionRef = useScrollReveal();
  const [expanded, setExpanded] = useState(false);

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10">
      <div className="max-w-[800px] mx-auto">
        <div className="text-center mb-14">
          <SectionTag text="Para developers" />
          <SectionH2 line1="Specs técnicas." line2="Lo que importa." />
        </div>

        <div className="lv2-card p-0 overflow-hidden">
          {/* Toggle button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/[0.02] transition-colors duration-300"
          >
            <div className="flex items-center gap-3">
              <FileCode size={18} className="text-[#3F8697]" />
              <span className="text-white font-medium text-sm">Especificaciones técnicas del embed.js</span>
            </div>
            <ChevronDown size={16} className={`text-white/40 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
          </button>

          {/* Expandable content */}
          <div className={`overflow-hidden transition-all duration-500 ${expanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="border-t border-white/[0.06] px-6 py-5 space-y-3">
              {TECH_SPECS.map((spec) => (
                <div key={spec.label} className="flex items-start gap-3 py-2">
                  <span className="text-[#3F8697] font-mono text-xs font-medium w-24 shrink-0 mt-0.5">{spec.label}</span>
                  <span className="text-white/50 text-sm leading-relaxed">{spec.value}</span>
                </div>
              ))}

              <GlassLine />

              {/* Code example */}
              <div className="mt-4">
                <span className="text-white/30 text-xs font-mono mb-2 block">Ejemplo de integración avanzada:</span>
                <pre className="text-[12px] font-mono text-white/60 leading-relaxed bg-white/[0.02] rounded-lg p-4 overflow-x-auto whitespace-pre">{`<script src="https://app.turnolink.com/embed.js"
  data-slug="tu-negocio"
  data-mode="modal"
  data-theme="auto"
  data-locale="es"
  data-on-booking="onBookingCreated">
</script>

<script>
  function onBookingCreated(booking) {
    // { id, service, date, customer }
    analytics.track('booking_created', booking);
  }
</script>`}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Compatibility strip */}
        <div className="text-center mt-10">
          <span className="text-white/30 text-xs font-medium uppercase tracking-wider">Compatible con</span>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
            {['HTML', 'WordPress', 'Wix', 'Shopify', 'Webflow', 'React', 'Vue', 'Angular', 'Squarespace'].map((p) => (
              <div
                key={p}
                className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05] text-sm text-white/50 font-medium tracking-tight hover:bg-white/[0.06] hover:text-white/70 transition-all duration-300"
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SECTION 12 — TESTIMONIALS
   ═══════════════════════════════════════════ */
function TestimonialsSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.testimonial-card', 150);

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-14">
          <SectionTag text="Testimonios" />
          <SectionH2 line1="Lo que dicen" line2="nuestros usuarios." />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="testimonial-card lv2-card p-7 hover:bg-[#0A0A0A] transition-colors duration-300"
            >
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-white/60 text-sm leading-relaxed italic mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-auto">
                {t.image ? (
                  <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" loading="lazy" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#3F8697]/20 flex items-center justify-center text-[#3F8697] text-xs font-bold">
                    {t.avatar}
                  </div>
                )}
                <div>
                  <span className="text-white text-sm font-medium block">{t.name}</span>
                  <span className="text-white/35 text-xs">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SECTION 13 — FAQ (expanded to 10)
   ═══════════════════════════════════════════ */
function FAQSection() {
  const sectionRef = useScrollReveal();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10">
      <div className="max-w-[700px] mx-auto">
        <div className="text-center mb-14">
          <SectionTag text="Preguntas frecuentes" />
          <SectionH2 line1="Todo lo que" line2="necesitás saber." />
        </div>

        <div className="space-y-2">
          {FAQ_ITEMS.map((faq, i) => (
            <div
              key={i}
              className={`lv2-faq-item ${openIdx === i ? 'open' : ''}`}
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
            >
              <div className="flex items-center justify-between">
                <span className="text-white text-sm font-medium pr-6">{faq.q}</span>
                <div className="lv2-faq-icon" />
              </div>
              <div
                className={`overflow-hidden transition-all duration-400 ${
                  openIdx === i ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-white/40 text-sm leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
export default function IntegrarPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#3F8697]/30 selection:text-white" style={{ overflowX: 'clip' }}>
      <Navbar />
      <HeroSection />
      <SocialProofStrip />
      <ProblemSolutionSection />
      <ROISection />
      <GlassLine />
      <HowItWorksSection />
      <DemoSection />
      <FeaturesSection />
      <UseCasesSection />
      <GlassLine />
      <ComparisonSection />
      <PricingSection />
      <TechSpecsSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection
        headline="Integrá reservas en tu web"
        subtitle="en 5 minutos."
        description="Creá tu cuenta gratis, copiá una línea de código y empezá a recibir reservas desde tu propio sitio."
      />
      <Footer />
    </div>
  );
}
