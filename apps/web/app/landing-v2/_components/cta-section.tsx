'use client';

import Link from 'next/link';
import { ArrowRight, Rocket, Shield, CreditCard } from 'lucide-react';
import { useScrollReveal } from './hooks';
import { SectionTag } from './ui';

export function CTASection({
  headline = 'Profesionalizá tu operación',
  subtitle = 'en 5 minutos.',
  description = 'Creá tu cuenta gratis, configurá tus servicios y empezá a recibir reservas con cobro automático.',
}: {
  headline?: string;
  subtitle?: string;
  description?: string;
}) {
  const sectionRef = useScrollReveal();

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10">
      <div className="max-w-[1000px] mx-auto">
        <div className="lv2-cta-card p-10 sm:p-[50px] text-center relative overflow-hidden">
          <div className="relative z-10">
            <SectionTag text="Empezá hoy" />
            <h2 className="lv2-h2 mt-6 text-[32px] sm:text-[40px] lg:text-[54px] font-normal leading-[1.0] lg:leading-[50px] tracking-[-1.9px]">
              <span className="text-white block">{headline}</span>
              <span className="text-white/60 block mt-1">{subtitle}</span>
            </h2>
            <p className="mt-5 text-white/50 text-base max-w-lg mx-auto tracking-[-0.2px] leading-relaxed">
              {description}
            </p>

            <div className="mt-10">
              <Link
                href="/register"
                className="lv2-glow-btn inline-flex items-center gap-2 bg-[#3F8697] text-white font-medium px-8 py-4 rounded-[10px] text-base"
              >
                Empezar gratis ahora
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-10 text-xs text-white/40">
              <span className="flex items-center gap-1.5">
                <Rocket size={12} className="text-[#3F8697]" /> 14 d&iacute;as de prueba gratuita
              </span>
              <span className="flex items-center gap-1.5">
                <Shield size={12} className="text-[#3F8697]" /> Sin compromiso
              </span>
              <span className="flex items-center gap-1.5">
                <CreditCard size={12} className="text-[#3F8697]" /> Cobros a tu cuenta de MP
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
