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
  Calendar,
  Clock,
  User,
  CheckCircle,
  Shield,
  Globe,
  Sparkles,
} from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '../_components/hooks';
import { SectionTag, SectionH2, WordReveal, GlassLine } from '../_components/ui';
import { Navbar } from '../_components/navbar';
import { Footer } from '../_components/footer';
import { CTASection } from '../_components/cta-section';

/* ═══════════════════════════════════════════
   INTERACTIVE BROWSER MOCKUP
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
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
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
              {/* Mini widget */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-[#3F8697]/30" />
                <div className="h-2.5 w-20 rounded bg-white/[0.12]" />
              </div>
              {/* Steps indicator */}
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
              {/* Dynamic content */}
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
              {/* Powered by */}
              <div className="mt-2 pt-2 border-t border-white/[0.04] flex justify-center">
                <div className="h-1 w-16 rounded bg-white/[0.06]" />
              </div>
            </div>
          )}

          {mode === 'modal' && (
            <>
              <div className="h-2 w-32 rounded bg-white/[0.04] mb-2" />
              <div className="h-2 w-24 rounded bg-white/[0.03]" />
              {/* Modal overlay */}
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
              {/* FAB */}
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
   HERO
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
                Widget embebible
              </span>
            </div>

            <h1 className="text-[36px] sm:text-[44px] lg:text-[54px] font-normal leading-[1.05] tracking-[-2px]">
              <WordReveal text="Reservas en tu web," />
              <br />
              <WordReveal text="con tu marca." muted />
            </h1>

            <p className="mt-6 text-white/45 text-base lg:text-lg max-w-[440px] tracking-[-0.2px] leading-relaxed">
              Tus clientes reservan y pagan sin salir de tu sitio. Vos solo peg&aacute;s una l&iacute;nea de c&oacute;digo.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3 mt-8">
              <Link
                href="/register"
                className="lv2-glow-btn inline-flex items-center gap-2 bg-[#3F8697] text-white font-medium px-7 py-3.5 rounded-[10px] text-sm"
              >
                Empezar gratis
                <ArrowRight size={16} />
              </Link>
              <a
                href="#demo"
                className="lv2-glass inline-flex items-center gap-2 text-white/80 font-medium px-7 py-3.5 rounded-[10px] text-sm"
              >
                Ver demo
                <ChevronDown size={16} />
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-5 mt-10 text-xs text-white/35">
              <span className="flex items-center gap-1.5">
                <Code2 size={12} className="text-[#3F8697]" /> 1 l&iacute;nea de c&oacute;digo
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
   HOW IT WORKS (3 steps with left-border)
   ═══════════════════════════════════════════ */
function HowItWorksSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 150);

  const steps = [
    {
      number: '01',
      title: 'Copiá el código',
      description: 'Desde tu panel de TurnoLink, copiás un snippet HTML. Literal: copiar, pegar, listo.',
      icon: Code2,
    },
    {
      number: '02',
      title: 'Elegí cómo mostrarlo',
      description: 'Integrado en la página, como popup, o como botón flotante. Cambiarlo es cambiar un atributo.',
      icon: Monitor,
    },
    {
      number: '03',
      title: 'Tus clientes reservan',
      description: 'Eligen servicio, horario, pagan la seña. Todo sin salir de tu web. Vos recibís la reserva como siempre.',
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
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   INTERACTIVE DEMO — 3 modes with live mockups
   ═══════════════════════════════════════════ */
function DemoSection() {
  const sectionRef = useScrollReveal();
  const [activeMode, setActiveMode] = useState<'inline' | 'modal' | 'fab'>('inline');
  const [copied, setCopied] = useState(false);

  const modes = [
    { key: 'inline' as const, label: 'Inline', icon: Monitor, desc: 'Integrado en tu página' },
    { key: 'modal' as const, label: 'Modal', icon: Maximize2, desc: 'Popup sobre tu sitio' },
    { key: 'fab' as const, label: 'Botón flotante', icon: MousePointerClick, desc: 'FAB en la esquina' },
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
            Seleccioná un modo y veí en vivo cómo funciona el widget embebido.
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
              {activeMode === 'inline' && 'El widget se integra directamente en el contenido de tu página.'}
              {activeMode === 'modal' && 'Un popup elegante que aparece sobre tu sitio sin interrumpir.'}
              {activeMode === 'fab' && 'Un botón flotante que tus clientes ven siempre, en cualquier página.'}
            </p>
          </div>

          {/* Right: Code + info */}
          <div className="space-y-5">
            {/* Code block */}
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

            {/* Benefit cards */}
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
   FEATURES — Full lv2-card system
   ═══════════════════════════════════════════ */
function FeaturesSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 100);

  const features = [
    {
      icon: Globe,
      title: 'Funciona en todas partes',
      description: 'HTML, WordPress, Wix, Shopify, Webflow, React, Vue. Si soporta HTML, soporta TurnoLink.',
    },
    {
      icon: Palette,
      title: 'Tu identidad visual',
      description: 'El widget hereda automáticamente los colores, logo y nombre que configures en tu panel.',
    },
    {
      icon: CreditCard,
      title: 'Cobro de seña',
      description: 'MercadoPago integrado. Tu cliente paga sin salir de tu sitio, vos recibís en tu cuenta.',
    },
    {
      icon: Zap,
      title: 'Eventos en tiempo real',
      description: 'Recibí notificaciones cuando alguien reserva, paga o cambia de paso. Ideal para analytics.',
    },
    {
      icon: Moon,
      title: 'Modo oscuro',
      description: 'Si tu sitio es oscuro, el widget también. Se adapta automáticamente.',
    },
    {
      icon: Sparkles,
      title: 'Siempre actualizado',
      description: 'Cada mejora que hacemos a TurnoLink se refleja automáticamente en tu widget. Sin hacer nada.',
    },
  ];

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Características" />
          <SectionH2 line1="Pensado para que" line2="no tengas que pensar." />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="lv2-card-stagger lv2-card p-7 hover:bg-[#0A0A0A] transition-colors duration-300"
              >
                <div className="w-11 h-11 rounded-xl lv2-icon-glow flex items-center justify-center mb-5">
                  <Icon size={20} className="text-[#3F8697]" />
                </div>
                <h3 className="text-white font-medium text-sm tracking-tight">{f.title}</h3>
                <p className="text-white/40 text-sm mt-2 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SOCIAL PROOF — Platforms + Trust
   ═══════════════════════════════════════════ */
function TrustSection() {
  const sectionRef = useScrollReveal();

  const stats = [
    { value: '1', label: 'línea de código' },
    { value: '3', label: 'modos de display' },
    { value: '0', label: 'dependencias' },
    { value: '∞', label: 'actualizaciones' },
  ];

  const platforms = ['HTML', 'WordPress', 'Wix', 'Shopify', 'Webflow', 'React', 'Vue', 'Angular', 'Squarespace'];

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="lv2-section py-[80px] lg:py-[100px] px-5 lg:px-10">
      <div className="max-w-[1000px] mx-auto">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-[40px] lg:text-[48px] font-normal text-white tracking-[-2px] leading-none">{s.value}</div>
              <div className="text-white/35 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <GlassLine />

        {/* Compatibility */}
        <div className="text-center mt-14">
          <span className="text-white/30 text-xs font-medium uppercase tracking-wider">Compatible con</span>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {platforms.map((p) => (
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
   FAQ — Using lv2-faq-item system
   ═══════════════════════════════════════════ */
function FAQSection() {
  const sectionRef = useScrollReveal();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const faqs = [
    {
      q: '¿Necesito saber programar?',
      a: 'No. Copiás una línea de HTML y la pegás en tu sitio. Si usás WordPress, Wix o Shopify, solo va en el editor de HTML de cualquier página.',
    },
    {
      q: '¿Puede romper mi sitio?',
      a: 'No. El widget carga dentro de un iframe, completamente aislado. No afecta tus estilos, scripts ni funcionalidad existente.',
    },
    {
      q: '¿Tiene costo extra?',
      a: 'No. El widget embebible está incluido en todos los planes, sin cargos adicionales.',
    },
    {
      q: '¿Cómo funciona el pago?',
      a: 'Cuando tu cliente elige un servicio con seña, se abre MercadoPago en una pestaña nueva. Al confirmar, el widget detecta el pago automáticamente y muestra la confirmación.',
    },
    {
      q: '¿Puedo personalizar los colores y el logo?',
      a: 'Sí. El widget hereda tu configuración de TurnoLink: colores, logo, nombre del negocio, servicios. Todo se sincroniza automáticamente.',
    },
    {
      q: '¿Tengo que actualizarlo manualmente?',
      a: 'Nunca. El widget siempre carga la última versión. Cada mejora que hagamos llega automáticamente a tu sitio.',
    },
  ];

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10">
      <div className="max-w-[700px] mx-auto">
        <div className="text-center mb-14">
          <SectionTag text="Preguntas frecuentes" />
          <SectionH2 line1="Todo lo que" line2="necesitás saber." />
        </div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
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
      <HowItWorksSection />
      <DemoSection />
      <FeaturesSection />
      <TrustSection />
      <FAQSection />
      <CTASection
        headline="Integr&aacute; reservas en tu web"
        subtitle="en 5 minutos."
        description="Cre&aacute; tu cuenta gratis, copi&aacute; una l&iacute;nea de c&oacute;digo y empez&aacute; a recibir reservas desde tu propio sitio."
      />
      <Footer />
    </div>
  );
}
