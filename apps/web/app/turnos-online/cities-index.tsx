'use client';

import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { Navbar } from '../_landing/_components/navbar';
import { Footer } from '../_landing/_components/footer';
import { CTASection } from '../_landing/_components/cta-section';
import { SectionTag, SectionH2, WordReveal } from '../_landing/_components/ui';
import { useScrollReveal } from '../_landing/_components/hooks';

interface CityInfo {
  slug: string;
  name: string;
  province: string;
  description: string;
}

function HeroSection() {
  return (
    <section className="relative min-h-[50vh] flex flex-col justify-center pt-28 lg:pt-32 pb-8 px-5 lg:px-10 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] opacity-20 pointer-events-none bg-cyan-500/20" />

      <div className="max-w-[800px] mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm text-white/60 mb-8">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span>12 ciudades principales</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.03em] leading-[1.1] mb-4">
          <WordReveal text="Turnos online en toda Argentina" />
        </h1>
        <p className="mt-4 text-white/50 max-w-2xl mx-auto text-[15px] leading-relaxed">
          Encontrá TurnoLink en tu ciudad. Sistema de reservas 24/7 con cobro automático para más de 40 industrias.
        </p>
      </div>
    </section>
  );
}

function CitiesGrid({ cities }: { cities: CityInfo[] }) {
  const sectionRef = useScrollReveal();

  return (
    <section ref={sectionRef} className="py-20 px-5 lg:px-10 lv2-section-enter">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cities.map((city) => (
            <Link
              key={city.slug}
              href={`/turnos-online/${city.slug}`}
              className="group p-6 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-white font-semibold text-lg group-hover:text-cyan-300 transition-colors">
                    {city.name}
                  </h2>
                  <span className="text-white/30 text-[13px]">{city.province}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-cyan-400 transition-colors mt-1" />
              </div>
              <p className="text-white/40 text-[13px] leading-relaxed line-clamp-2">{city.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CitiesIndexPage({ cities }: { cities: CityInfo[] }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />
      <HeroSection />
      <CitiesGrid cities={cities} />
      <CTASection
        headline="Tu ciudad, tu negocio"
        subtitle="automatizado."
        description="Creá tu cuenta gratis, configurá tus servicios y empezá a recibir reservas en minutos."
      />
      <Footer />
    </div>
  );
}
