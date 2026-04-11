'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  MapPin,
  CalendarCheck,
  CreditCard,
  Bell,
  Smartphone,
  Shield,
  Zap,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from './hooks';
import { SectionTag, SectionH2, WordReveal, WHATSAPP_URL } from './ui';
import { Navbar } from './navbar';
import { Footer } from './footer';
import { CTASection } from './cta-section';
import type { CityData } from '../_data/cities';

/* ─── Hero ─── */

function HeroSection({ city }: { city: CityData }) {
  return (
    <section className="relative min-h-[65vh] flex flex-col justify-center pt-28 lg:pt-32 pb-8 px-5 lg:px-10 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] opacity-20 pointer-events-none bg-cyan-500/20" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-15 pointer-events-none bg-blue-500/15" />

      <div className="max-w-[900px] mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm text-white/60 mb-8">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span>{city.name}, {city.province}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.03em] leading-[1.1] mb-4">
          <WordReveal text={city.headline} />
        </h1>
        <p className="text-xl sm:text-2xl text-white/40 font-medium tracking-[-0.02em]">
          {city.subtitle}
        </p>
        <p className="mt-6 text-white/50 max-w-2xl mx-auto text-[15px] leading-relaxed">
          {city.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-black font-semibold text-[15px] hover:bg-white/90 transition-all"
          >
            Empezar gratis <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={WHATSAPP_URL}
            target="_blank"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/15 text-white/70 font-medium text-[15px] hover:border-white/30 hover:text-white transition-all"
          >
            Hablar con ventas
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Pain Points ─── */

function PainPointsSection({ painPoints, cityName }: { painPoints: string[]; cityName: string }) {
  const sectionRef = useScrollReveal();

  return (
    <section ref={sectionRef} className="py-20 px-5 lg:px-10 lv2-section-enter">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-12">
          <SectionTag text="EL PROBLEMA" />
          <SectionH2 line1="¿Te suena" line2="familiar?" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {painPoints.map((point, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-white/15 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                <span className="text-red-400 text-lg font-bold">{i + 1}</span>
              </div>
              <p className="text-white/60 text-[14px] leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Industries ─── */

function IndustriesSection({ industries, cityName }: { industries: CityData['topIndustries']; cityName: string }) {
  const sectionRef = useScrollReveal();

  return (
    <section ref={sectionRef} className="py-20 px-5 lg:px-10 lv2-section-enter">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-12">
          <SectionTag text="INDUSTRIAS" />
          <SectionH2 line1={`Rubros populares`} line2={`en ${cityName}.`} />
          <p className="mt-4 text-white/40 max-w-2xl mx-auto text-[15px]">
            Más de 40 industrias usan TurnoLink. Estas son las más populares en tu ciudad.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {industries.map((ind, i) => (
            <Link
              key={i}
              href={ind.href}
              className="group p-6 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all"
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl">{ind.icon}</span>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-[15px] group-hover:text-cyan-300 transition-colors">
                    {ind.label}
                  </h3>
                  <p className="mt-1 text-white/40 text-[13px] leading-relaxed">{ind.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-cyan-400 transition-colors mt-1 flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Features ─── */

const FEATURES = [
  { icon: CalendarCheck, title: 'Reservas 24/7', desc: 'Tus clientes reservan solos a cualquier hora, desde cualquier dispositivo.' },
  { icon: CreditCard, title: 'Cobro de señas', desc: 'Mercado Pago integrado. Cobrá señas automáticas y eliminá los no-show.' },
  { icon: Bell, title: 'Recordatorios automáticos', desc: 'WhatsApp y email antes de cada turno. Menos olvidos, más facturación.' },
  { icon: Smartphone, title: 'Link personalizado', desc: 'turnolink.com/tu-negocio — Compartilo en Instagram, Google y WhatsApp.' },
  { icon: Shield, title: 'Gestión completa', desc: 'Clientes, profesionales, sucursales, finanzas y métricas en un solo lugar.' },
  { icon: Zap, title: 'En 5 minutos', desc: 'Creá tu cuenta, cargá servicios y empezá a recibir reservas. Sin complicaciones.' },
];

function FeaturesSection() {
  const sectionRef = useScrollReveal();

  return (
    <section ref={sectionRef} className="py-20 px-5 lg:px-10 lv2-section-enter">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-12">
          <SectionTag text="FUNCIONALIDADES" />
          <SectionH2 line1="Todo lo que necesitás" line2="para crecer." />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="p-6 rounded-2xl border border-white/8 bg-white/[0.02]">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-white font-semibold text-[15px] mb-2">{feat.title}</h3>
                <p className="text-white/40 text-[13px] leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Local Facts ─── */

function LocalFactsSection({ facts, cityName }: { facts: string[]; cityName: string }) {
  const sectionRef = useScrollReveal();

  return (
    <section ref={sectionRef} className="py-20 px-5 lg:px-10 lv2-section-enter">
      <div className="max-w-[800px] mx-auto">
        <div className="text-center mb-12">
          <SectionTag text={cityName.toUpperCase()} />
          <SectionH2 line1="¿Por qué" line2="ahora?" />
        </div>

        <div className="space-y-4">
          {facts.map((fact, i) => (
            <div key={i} className="flex items-start gap-4 p-5 rounded-xl border border-white/8 bg-white/[0.02]">
              <div className="w-6 h-6 rounded-full bg-cyan-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <p className="text-white/60 text-[14px] leading-relaxed">{fact}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ─── */

function FAQSection({ faqs }: { faqs: CityData['faqs'] }) {
  const sectionRef = useScrollReveal();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section ref={sectionRef} className="py-20 px-5 lg:px-10 lv2-section-enter">
      <div className="max-w-[800px] mx-auto">
        <div className="text-center mb-12">
          <SectionTag text="FAQ" />
          <SectionH2 line1="Preguntas" line2="frecuentes." />
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className={`rounded-2xl border transition-all ${isOpen ? 'border-white/15 bg-white/[0.04]' : 'border-white/8 bg-white/[0.02]'}`}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-white/80 font-medium text-[14px] pr-4">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-white/30 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 -mt-1">
                    <p className="text-white/50 text-[13px] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── City Cross-links ─── */

function OtherCitiesSection({ currentSlug, cities }: { currentSlug: string; cities: { slug: string; name: string }[] }) {
  const others = cities.filter((c) => c.slug !== currentSlug).slice(0, 8);
  if (others.length === 0) return null;

  return (
    <section className="py-16 px-5 lg:px-10">
      <div className="max-w-[1000px] mx-auto">
        <h3 className="text-center text-white/30 text-sm font-medium mb-6 uppercase tracking-widest">
          También disponible en
        </h3>
        <div className="flex flex-wrap justify-center gap-3">
          {others.map((c) => (
            <Link
              key={c.slug}
              href={`/turnos-online/${c.slug}`}
              className="px-4 py-2 rounded-full border border-white/10 text-white/50 text-[13px] hover:border-white/25 hover:text-white/70 transition-all"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Main Component ─── */

export function CityLandingPage({
  city,
  allCities,
}: {
  city: CityData;
  allCities: { slug: string; name: string }[];
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />
      <HeroSection city={city} />
      <PainPointsSection painPoints={city.painPoints} cityName={city.name} />
      <IndustriesSection industries={city.topIndustries} cityName={city.name} />
      <FeaturesSection />
      <LocalFactsSection facts={city.localFacts} cityName={city.name} />
      <FAQSection faqs={city.faqs} />
      <CTASection
        headline={`Empezá hoy en ${city.name}`}
        subtitle="sin complicaciones."
        description="Creá tu cuenta gratis, configurá tus servicios y empezá a recibir reservas con cobro automático."
      />
      <OtherCitiesSection currentSlug={city.slug} cities={allCities} />
      <Footer />
    </div>
  );
}
