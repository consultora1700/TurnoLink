'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
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
  Timer,
  Clock,
  LayoutDashboard,
  Video,
  Laptop,
  Lock,
  Heart,
  Brain,
  MessageCircle,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from './hooks';
import { SectionTag, SectionH2, WordReveal, WHATSAPP_URL } from './ui';
import { Navbar } from './navbar';
import { Footer } from './footer';
import { CTASection } from './cta-section';

/* ─── Icon map (serializable string keys → components) ─── */

const ICON_MAP: Record<string, LucideIcon> = {
  CalendarCheck,
  CreditCard,
  Users,
  Building2,
  Globe,
  Star,
  Bell,
  Timer,
  Clock,
  LayoutDashboard,
  Shield,
  Zap,
  Video,
  Laptop,
  Lock,
  Heart,
  Brain,
  MessageCircle,
  Smartphone,
};

/* ─── Data types ─── */

export interface IndustryData {
  pill: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription?: string;
  painPoints: { title: string; desc: string }[];
  capabilities: { icon: string; title: string; desc: string }[];
  subIndustries: (string | { label: string; href: string })[];
  pricing: {
    hasFree: boolean;
    tiers: {
      name: string;
      price: string;
      period: string;
      features: string[];
      popular?: boolean;
    }[];
    trialText?: string;
  };
  testimonials: { quote: string; name: string; role: string; business: string; image?: string }[];
  faqs: { q: string; a: string }[];
  cta?: { headline?: string; subtitle?: string; description?: string };
  accent?: string;
  parentNicheUrl?: string;
  parentNicheLabel?: string;
  industrySlug?: string;
}

/* ─── Hero ─── */

function Breadcrumb({ parentUrl, parentLabel, current }: { parentUrl: string; parentLabel: string; current: string }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-white/40 mb-6 justify-center">
      <Link href="/" className="hover:text-white/60 transition-colors">Inicio</Link>
      <span>/</span>
      <Link href={parentUrl} className="hover:text-white/60 transition-colors">{parentLabel}</Link>
      <span>/</span>
      <span className="text-white/70">{current}</span>
    </nav>
  );
}

function HeroSection({ pill, title, subtitle, description, accent, parentNicheUrl, parentNicheLabel, industrySlug }: {
  pill: string; title: string; subtitle: string; description?: string; accent?: string;
  parentNicheUrl?: string; parentNicheLabel?: string; industrySlug?: string;
}) {
  const color = accent || '#3F8697';
  return (
    <section className="relative min-h-[70vh] flex flex-col justify-center pt-28 lg:pt-32 pb-8 px-5 lg:px-10 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] lv2-glow-orb pointer-events-none" style={{ backgroundColor: `${color}14` }} />
      <div
        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] lv2-glow-orb pointer-events-none"
        style={{ backgroundColor: `${color}0D`, animationDelay: '3s' }}
      />

      <div className="max-w-[1000px] mx-auto text-center relative z-10">
        {parentNicheUrl && parentNicheLabel && (
          <Breadcrumb parentUrl={parentNicheUrl} parentLabel={parentNicheLabel} current={pill.replace(/^[^\w]*\s*/, '')} />
        )}
        <div className="mb-8">
          <span className="lv2-pill inline-flex items-center px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm text-white/80">
            {pill}
          </span>
        </div>

        <h1 className="text-[7.5vw] sm:text-[56px] lg:text-[86px] font-normal leading-[1.05] lg:leading-[90px] tracking-[-2px] lg:tracking-[-3.8px] mb-6">
          <span className="text-white block">{title}</span>
          <span className="text-white/60 block mt-1">{subtitle}</span>
        </h1>

        <p className="text-base sm:text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed tracking-[-0.2px]">
          <WordReveal text={description || "Reservas 24/7, cobro de señas automático con Mercado Pago, gestión de clientes y empleados. Todo en una sola plataforma."} />
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={industrySlug ? `/register?industry=${industrySlug}` : '/register'}
            className="lv2-glow-btn text-white font-medium px-8 py-3.5 rounded-[10px] text-base flex items-center gap-2"
            style={{ backgroundColor: color }}
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

        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-white/40">
          <span className="flex items-center gap-1.5">
            <Zap size={14} style={{ color }} /> Configuraci&oacute;n en 5 min
          </span>
          <span className="flex items-center gap-1.5">
            <Shield size={14} style={{ color }} /> Sin tarjeta de cr&eacute;dito
          </span>
          <span className="flex items-center gap-1.5">
            <Globe size={14} style={{ color }} /> Soporte en espa&ntilde;ol
          </span>
        </div>
      </div>
    </section>
  );
}

/* ─── Pain Points ─── */

function PainPointsSection({ items }: { items: { title: string; desc: string }[] }) {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 120);

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="El problema" />
          <SectionH2
            line1="Suena familiar,"
            line2="&iquest;no?"
          />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {items.map((item, i) => (
            <div
              key={i}
              className="lv2-card-stagger lv2-card p-7 hover:bg-[#0A0A0A] transition-colors duration-300"
            >
              <div className="text-2xl mb-4">
                {i === 0 ? '😤' : i === 1 ? '🚫' : '💸'}
              </div>
              <h3 className="text-white font-medium text-lg tracking-[-0.5px] mb-2">{item.title}</h3>
              <p className="text-white/50 text-[15px] leading-[26px] tracking-[-0.2px]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Capabilities ─── */

function CapabilitiesSection({ items, accent }: { items: { icon: string; title: string; desc: string }[]; accent?: string }) {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 100);
  const color = accent || '#3F8697';

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Capacidades" />
          <SectionH2
            line1="Todo lo que necesitás"
            line2="para operar en automático."
          />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((c, i) => {
            const Icon = ICON_MAP[c.icon] || Star;
            return (
              <div
                key={i}
                className="lv2-card-stagger lv2-card p-7 hover:bg-[#0A0A0A] transition-colors duration-300"
              >
                <div className="w-11 h-11 rounded-xl lv2-icon-glow flex items-center justify-center mb-5">
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 className="text-white font-medium text-lg tracking-[-0.5px] mb-2">{c.title}</h3>
                <p className="text-white/50 text-[15px] leading-[26px] tracking-[-0.2px]">{c.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Sub-industries strip ─── */

function SubIndustriesStrip({ items, accent }: { items: IndustryData['subIndustries']; accent?: string }) {
  const color = accent || '#3F8697';
  return (
    <div className="py-10 border-y border-white/[0.04]">
      <div className="max-w-[1200px] mx-auto px-5 lg:px-10">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {items.map((item, i) => {
            const isLink = typeof item === 'object' && item.href;
            const label = typeof item === 'string' ? item : item.label;
            if (isLink && typeof item === 'object') {
              return (
                <Link
                  key={i}
                  href={item.href}
                  className="text-sm text-white/50 bg-white/[0.05] px-4 py-2 rounded-full border border-white/[0.06] hover:border-white/20 hover:text-white/70 transition-all duration-200"
                  style={{ ['--tw-border-opacity' as string]: undefined }}
                >
                  {label}
                </Link>
              );
            }
            return (
              <span
                key={i}
                className="text-sm text-white/50 bg-white/[0.05] px-4 py-2 rounded-full border border-white/[0.06]"
              >
                {label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Pricing ─── */

function PricingSection({ pricing, accent, industrySlug }: { pricing: IndustryData['pricing']; accent?: string; industrySlug?: string }) {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 150);
  const color = accent || '#3F8697';

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} id="precios" className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Precios" />
          <SectionH2
            line1="Planes simples,"
            line2="sin letra chica."
          />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            {pricing.hasFree
              ? 'Empezá gratis y escalá cuando lo necesites. Sin compromiso, sin tarjeta de crédito.'
              : '14 días de prueba gratuita en todos los planes. Sin tarjeta de crédito.'}
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pricing.tiers.map((tier, i) => (
            <div
              key={i}
              className={`lv2-card-stagger lv2-card p-8 flex flex-col ${
                tier.popular ? 'lv2-pricing-popular' : ''
              }`}
            >
              {tier.popular && (
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-white px-3 py-1 rounded-md tracking-wide uppercase" style={{ backgroundColor: color }}>
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
                    <Check size={16} style={{ color }} className="mt-0.5 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href={industrySlug ? `/register?industry=${industrySlug}` : '/register'}
                className={`mt-8 w-full text-center py-3 rounded-[10px] text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  tier.popular
                    ? 'lv2-glow-btn text-white'
                    : 'bg-white/[0.06] text-white/80 hover:bg-white/[0.12] border border-white/[0.08]'
                }`}
                style={tier.popular ? { backgroundColor: color } : undefined}
              >
                {tier.price === '$0' ? 'Empezar gratis' : 'Probar 14 días gratis'}
                <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-white/25 text-sm mt-10 flex items-center justify-center gap-2">
          <Shield size={14} />
          {pricing.trialText || '14 días de prueba en todos los planes. Sin tarjeta de crédito.'}
        </p>
        <p className="text-center mt-4">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm transition-colors duration-300"
            style={{ color }}
          >
            &iquest;Necesit&aacute;s ayuda para elegir? Habl&aacute; con nuestro equipo &rarr;
          </a>
        </p>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */

function TestimonialsSection({ items }: { items: IndustryData['testimonials'] }) {
  const sectionRef = useScrollReveal();

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Resultados" />
          <SectionH2
            line1="Lo que dicen nuestros clientes"
            line2="de su industria."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {items.map((t, i) => (
            <div key={i} className="lv2-card p-7 flex flex-col">
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
                    {t.role} &middot; {t.business}
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

/* ─── FAQ ─── */

function IndustryFAQSection({ items }: { items: IndustryData['faqs'] }) {
  const sectionRef = useScrollReveal();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = useCallback(
    (i: number) => setOpenIdx((prev) => (prev === i ? null : i)),
    []
  );

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-10 lg:gap-16">
          <div className="text-center lg:text-left lg:sticky lg:top-[120px] lg:self-start">
            <SectionTag text="FAQ" />
            <h2 className="lv2-h2 mt-6 text-[32px] sm:text-[40px] lg:text-[54px] font-normal leading-[1.0] lg:leading-[50px] tracking-[-1.9px]">
              <span className="text-white block">Preguntas</span>
              <span className="text-white/60 block mt-1">frecuentes</span>
            </h2>
            <p className="mt-5 text-white/50 max-w-sm mx-auto lg:mx-0 text-[15px] leading-relaxed tracking-[-0.2px]">
              &iquest;Ten&eacute;s dudas? Encontr&aacute; las respuestas a las consultas m&aacute;s comunes.
            </p>
          </div>

          <div className="space-y-3">
            {items.map((faq, i) => {
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

/* ─── Main Template ─── */

export function IndustryPage({ data }: { data: IndustryData }) {
  const accent = data.accent;
  return (
    <div className="min-h-screen bg-black text-white selection:text-white" style={{ overflowX: 'clip', ['--accent' as string]: accent || '#3F8697' }}>
      <Navbar />
      <HeroSection pill={data.pill} title={data.heroTitle} subtitle={data.heroSubtitle} description={data.heroDescription} accent={accent} parentNicheUrl={data.parentNicheUrl} parentNicheLabel={data.parentNicheLabel} industrySlug={data.industrySlug} />
      <PainPointsSection items={data.painPoints} />
      <CapabilitiesSection items={data.capabilities} accent={accent} />
      <SubIndustriesStrip items={data.subIndustries} accent={accent} />
      <PricingSection pricing={data.pricing} accent={accent} industrySlug={data.industrySlug} />
      <TestimonialsSection items={data.testimonials} />
      <IndustryFAQSection items={data.faqs} />
      <CTASection accent={accent} {...(data.cta || {})} />
      <Footer />
    </div>
  );
}
