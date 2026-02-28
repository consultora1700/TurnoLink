'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Search,
  Send,
  UserCheck,
  Users,
  Briefcase,
  Star,
  Shield,
  Zap,
  CheckCircle,
  Sparkles,
  Eye,
  MessageSquare,
  HeartHandshake,
  Scissors,
  HeartPulse,
  Dumbbell,
  Stethoscope,
  Palette,
  Brain,
  Apple,
  PawPrint,
  Flame,
  BookOpen,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
} from 'lucide-react';
import { publicTalentApi, PublicTalentProfile } from '@/lib/api';
import { useScrollReveal, useStaggerReveal } from '../_components/hooks';
import { SectionTag, SectionH2, WordReveal, WHATSAPP_URL } from '../_components/ui';
import { Navbar } from '../_components/navbar';
import { Footer } from '../_components/footer';
import { CTASection } from '../_components/cta-section';

/* ═══════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════ */
function HeroSection({ profileCount }: { profileCount: number }) {
  return (
    <section className="relative min-h-[80vh] flex flex-col justify-center pt-28 lg:pt-32 pb-8 px-5 lg:px-10 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[#3F8697]/[0.08] blur-[140px] lv2-glow-orb pointer-events-none" />
      <div
        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[#3F8697]/[0.05] blur-[100px] lv2-glow-orb pointer-events-none"
        style={{ animationDelay: '3s' }}
      />

      <div className="max-w-[1000px] mx-auto text-center relative z-10">
        <div className="mb-8">
          <span className="lv2-pill inline-flex items-center px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm text-white/80">
            Marketplace de talento profesional
          </span>
        </div>

        <h1 className="text-[7.5vw] sm:text-[56px] lg:text-[86px] font-normal leading-[1.05] lg:leading-[90px] tracking-[-2px] lg:tracking-[-3.8px] mb-6">
          <span className="text-white block">Encontr&aacute; al profesional</span>
          <span className="text-white/60 block mt-1">ideal para tu negocio.</span>
        </h1>

        <p className="text-base sm:text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed tracking-[-0.2px]">
          <WordReveal text="Explorá perfiles verificados en 12 categorías. Enviá propuestas directas. Contratá talento listo para trabajar, sin intermediarios." />
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="lv2-glow-btn bg-[#3F8697] text-white font-medium px-8 py-3.5 rounded-[10px] text-base flex items-center gap-2"
          >
            Buscar profesionales
            <Search size={18} />
          </Link>
          <Link
            href="/register"
            className="lv2-glass text-white/80 font-medium px-8 py-3.5 rounded-[10px] text-base flex items-center gap-2"
          >
            Registrarme como profesional
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-white/40">
          <span className="flex items-center gap-1.5">
            <Users size={14} className="text-[#3F8697]" />
            {profileCount > 0 ? `${profileCount}+ profesionales activos` : 'Profesionales activos'}
          </span>
          <span className="flex items-center gap-1.5">
            <Shield size={14} className="text-[#3F8697]" /> Perfiles verificados
          </span>
          <span className="flex items-center gap-1.5">
            <Zap size={14} className="text-[#3F8697]" /> Contacto directo
          </span>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   TRUST STRIP
   ═══════════════════════════════════════════ */
function TrustStrip({ profileCount }: { profileCount: number }) {
  const stats = [
    { value: profileCount > 0 ? `+${profileCount}` : '+200', label: 'profesionales' },
    { value: '12', label: 'categorías' },
    { value: '100%', label: 'contacto directo' },
    { value: '$0', label: 'para publicar perfil' },
  ];

  return (
    <div className="py-10 border-y border-white/[0.04]">
      <div className="max-w-[1200px] mx-auto px-5 lg:px-10 flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-2.5 text-sm text-white/40">
            <span className="text-white font-medium text-base tracking-tight">{s.value}</span>
            <span className="tracking-tight">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CATEGORIES CAROUSEL — Slide-in animation
   ═══════════════════════════════════════════ */
const TALENT_CATEGORIES = [
  { icon: Scissors, title: 'Estética y Belleza', desc: 'Estilistas, maquilladores, uñas, depilación', accent: '#22d3ee', key: 'estetica-belleza' },
  { icon: Flame, title: 'Barbería', desc: 'Barberos, corte masculino, barba', accent: '#fb923c', key: 'barberia' },
  { icon: Sparkles, title: 'Masajes y Spa', desc: 'Masajistas, terapeutas corporales, bienestar', accent: '#38bdf8', key: 'masajes-spa' },
  { icon: HeartPulse, title: 'Salud', desc: 'Médicos, enfermeros, kinesiólogos', accent: '#2dd4bf', key: 'salud' },
  { icon: Stethoscope, title: 'Odontología', desc: 'Dentistas, ortodoncistas, implantes', accent: '#60a5fa', key: 'odontologia' },
  { icon: Brain, title: 'Psicología y Terapia', desc: 'Psicólogos, terapeutas, coaching', accent: '#a78bfa', key: 'psicologia' },
  { icon: Apple, title: 'Nutrición', desc: 'Nutricionistas, dietistas, planes', accent: '#4ade80', key: 'nutricion' },
  { icon: Dumbbell, title: 'Fitness y Deporte', desc: 'Personal trainers, yoga, pilates', accent: '#f87171', key: 'fitness' },
  { icon: PawPrint, title: 'Veterinaria', desc: 'Veterinarios, cuidado animal', accent: '#fbbf24', key: 'veterinaria' },
  { icon: Palette, title: 'Tatuajes y Piercing', desc: 'Tatuadores, piercers, arte corporal', accent: '#fb7185', key: 'tatuajes-piercing' },
  { icon: BookOpen, title: 'Educación y Clases', desc: 'Profesores, tutores, idiomas, música', accent: '#818cf8', key: 'educacion' },
  { icon: Calculator, title: 'Consultoría', desc: 'Consultores, abogados, contadores', accent: '#94a3b8', key: 'consultoria' },
];

function useCategoryCarouselReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const items = container.querySelectorAll('.lv2-cat-carousel-item');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px 0px -40px' }
    );
    items.forEach((item) => obs.observe(item));
    return () => obs.disconnect();
  }, []);
  return containerRef;
}

function CategoriesCarousel() {
  const sectionRef = useScrollReveal();
  const carouselRef = useCategoryCarouselReveal();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      id="categorias"
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div className="text-center lg:text-left">
            <SectionTag text="Categorías" />
            <SectionH2
              line1="12 categorías profesionales."
              line2="Deslizá para explorar."
            />
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <button onClick={() => scroll('left')} className="lv2-carousel-nav" aria-label="Anterior">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => scroll('right')} className="lv2-carousel-nav" aria-label="Siguiente">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="lv2-cat-carousel-wrap" ref={carouselRef}>
          <div ref={scrollRef} className="lv2-cat-carousel px-1">
            {TALENT_CATEGORIES.map((cat, i) => (
              <Link
                key={i}
                href="/register"
                className="lv2-cat-carousel-item lv2-card group block"
                style={{ borderLeftWidth: '3px', borderLeftColor: cat.accent }}
              >
                <div className="p-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      background: `${cat.accent}15`,
                      boxShadow: `0 0 25px ${cat.accent}20`,
                    }}
                  >
                    <cat.icon size={22} style={{ color: cat.accent }} />
                  </div>
                  <h3 className="text-white font-medium text-[16px] tracking-[-0.5px] mb-1.5">{cat.title}</h3>
                  <p className="text-white/40 text-[13px] leading-[20px] tracking-[-0.2px] mb-4">{cat.desc}</p>
                  <span
                    className="text-sm font-medium flex items-center gap-1.5 transition-colors duration-300 group-hover:text-white"
                    style={{ color: cat.accent }}
                  >
                    Ver profesionales
                    <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <p className="text-center lg:hidden text-white/30 text-sm mt-2 flex items-center justify-center gap-1.5">
          <ChevronLeft size={14} />
          Deslizá para ver más
          <ChevronRight size={14} />
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   FEATURED PROFILES — Real data from API
   ═══════════════════════════════════════════ */
const availabilityLabel = (val: string | null) => {
  switch (val) {
    case 'full-time': return 'Jornada completa';
    case 'part-time': return 'Medio turno';
    case 'freelance': return 'Independiente';
    default: return val;
  }
};

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

function useProfileReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const items = container.querySelectorAll('.lv2-profile-reveal');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.1 }
    );
    items.forEach((item) => obs.observe(item));
    return () => obs.disconnect();
  }, []);
  return containerRef;
}

function FeaturedProfilesSection({ profiles, loading }: { profiles: PublicTalentProfile[]; loading: boolean }) {
  const sectionRef = useScrollReveal();
  const gridRef = useProfileReveal();

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      id="perfiles"
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end mb-16">
          <div className="text-center lg:text-left">
            <SectionTag text="Perfiles destacados" />
            <SectionH2
              line1="Profesionales reales,"
              line2="listos para trabajar."
            />
          </div>
          <div className="text-center lg:text-right">
            <p className="text-white/50 max-w-md mx-auto lg:mx-0 lg:ml-auto text-base leading-relaxed tracking-[-0.2px]">
              Estos son algunos de los profesionales que ya publicaron su perfil. Registrate para ver todos y enviar propuestas.
            </p>
            <Link
              href="/register"
              className="lv2-glow-btn inline-flex items-center gap-2 bg-[#3F8697] text-white font-medium px-6 py-3 rounded-[10px] text-sm mt-6"
            >
              Ver todos los perfiles
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="lv2-profile-card animate-pulse">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-white/[0.06]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/[0.06] rounded w-3/4" />
                    <div className="h-3 bg-white/[0.06] rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="h-6 bg-white/[0.06] rounded-full w-16" />
                    <div className="h-6 bg-white/[0.06] rounded-full w-20" />
                    <div className="h-6 bg-white/[0.06] rounded-full w-14" />
                  </div>
                  <div className="h-3 bg-white/[0.06] rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : profiles.length > 0 ? (
          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {profiles.map((profile, index) => (
              <Link
                key={profile.id}
                href="/register"
                className="lv2-profile-reveal lv2-profile-card group block"
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                {/* Header row: avatar + name */}
                <div className="flex items-center gap-4 mb-5">
                  {profile.image ? (
                    <img
                      src={profile.image}
                      alt={profile.name}
                      className="lv2-avatar-ring w-14 h-14 rounded-full object-cover ring-2 ring-white/10"
                    />
                  ) : (
                    <div className="lv2-avatar-ring flex w-14 h-14 items-center justify-center rounded-full bg-gradient-to-br from-[#3F8697] to-[#2dd4bf] text-sm font-bold text-white ring-2 ring-white/10">
                      {getInitials(profile.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-[16px] tracking-[-0.3px] truncate group-hover:text-[#3F8697] transition-colors">
                      {profile.name}
                    </h3>
                    {profile.headline && (
                      <p className="text-white/40 text-sm truncate">{profile.headline}</p>
                    )}
                  </div>
                  {profile.openToWork && (
                    <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" title="Disponible" />
                  )}
                </div>

                {/* Skills */}
                {profile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {profile.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="lv2-skill-pill">{skill}</span>
                    ))}
                    {profile.skills.length > 3 && (
                      <span className="text-xs text-white/30 self-center">+{profile.skills.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-white/35">
                  {profile.specialty && (
                    <span className="flex items-center gap-1">
                      <Star size={11} className="text-[#3F8697]" />
                      {profile.specialty}
                    </span>
                  )}
                  {profile.yearsExperience != null && profile.yearsExperience > 0 && (
                    <span className="flex items-center gap-1">
                      <Briefcase size={11} />
                      {profile.yearsExperience} años
                    </span>
                  )}
                  {profile.availability && (
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {availabilityLabel(profile.availability)}
                    </span>
                  )}
                </div>

                {/* Bio preview */}
                {profile.bio && (
                  <p className="mt-3 text-white/30 text-[13px] leading-[20px] line-clamp-2">
                    {profile.bio}
                  </p>
                )}

                {/* CTA */}
                <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-sm text-[#3F8697] font-medium flex items-center gap-1.5 group-hover:text-white transition-colors">
                    Ver perfil completo
                    <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  {profile.openToWork && (
                    <span className="text-[11px] text-green-400/80 flex items-center gap-1">
                      <UserCheck size={12} />
                      Disponible
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="lv2-card p-12 text-center">
            <Users size={40} className="mx-auto text-white/20 mb-4" />
            <p className="text-white/50 text-base">Los perfiles se están cargando. Registrate para explorar el marketplace completo.</p>
            <Link
              href="/register"
              className="lv2-glow-btn inline-flex items-center gap-2 bg-[#3F8697] text-white font-medium px-6 py-3 rounded-[10px] text-sm mt-6"
            >
              Crear cuenta gratis
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {profiles.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              href="/register"
              className="lv2-glass inline-flex items-center gap-2 text-white/80 font-medium px-8 py-3.5 rounded-[10px] text-base"
            >
              Registrate para ver los {profiles.length < 18 ? '' : `${profiles.length}+ `}perfiles restantes
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   HOW IT WORKS — 3 steps
   ═══════════════════════════════════════════ */
const STEPS = [
  {
    icon: Eye,
    stage: 'Paso 1',
    title: 'Explorá perfiles',
    desc: 'Navegá por categoría, filtrá por disponibilidad, experiencia y habilidades. Cada perfil tiene bio, certificaciones y portfolio.',
    tags: ['Filtros avanzados', 'Perfiles completos', '12 categorías'],
  },
  {
    icon: Send,
    stage: 'Paso 2',
    title: 'Enviá tu propuesta',
    desc: 'Encontraste al profesional ideal? Enviá una propuesta directa con el rol, tu mensaje y la disponibilidad que buscás.',
    tags: ['Contacto directo', 'Sin intermediarios', 'Respuesta rápida'],
  },
  {
    icon: HeartHandshake,
    stage: 'Paso 3',
    title: 'Contratá y gestioná',
    desc: 'Cuando el profesional acepta, obtenés sus datos de contacto. Integralo a tu negocio y gestioná todo desde TurnoLink.',
    tags: ['Datos de contacto', 'Gestión integrada', '100% TurnoLink'],
  },
];

function HowItWorksSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 150);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      id="como-funciona"
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Cómo funciona" />
          <SectionH2
            line1="Del perfil a la contratación"
            line2="en tres pasos."
          />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            Encontr&aacute; al profesional perfecto para tu negocio sin fricciones, sin intermediarios, sin complicaciones.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="lv2-card-stagger lv2-card p-8 border-l-2 border-l-[#3F8697] hover:bg-[#0A0A0A] transition-colors duration-300"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-xl lv2-icon-glow flex items-center justify-center">
                  <step.icon size={22} className="text-[#3F8697]" />
                </div>
                <span className="lv2-stage-label inline-flex items-center text-sm text-white/70">
                  {step.stage}
                </span>
              </div>
              <h3 className="text-white font-medium text-xl tracking-[-0.5px] mb-3">{step.title}</h3>
              <p className="text-white/50 text-[15px] leading-[26px] tracking-[-0.2px] mb-5">{step.desc}</p>
              <div className="flex flex-wrap gap-2">
                {step.tags.map((tag, j) => (
                  <span
                    key={j}
                    className="flex items-center gap-1.5 text-xs text-white/50 bg-white/[0.05] px-3 py-1.5 rounded-full border border-white/[0.06]"
                  >
                    <CheckCircle size={12} className="text-[#3F8697]" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/register"
            className="lv2-glow-btn inline-flex items-center gap-2 bg-[#3F8697] text-white font-medium px-6 py-3 rounded-[10px] text-sm"
          >
            Empezar a buscar talento
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   FOR PROFESSIONALS
   ═══════════════════════════════════════════ */
const PROFESSIONAL_BENEFITS = [
  {
    icon: UserCheck,
    title: 'Perfil profesional completo',
    desc: 'Bio, habilidades, certificaciones, experiencia y portfolio. Todo en una página optimizada para que te encuentren.',
  },
  {
    icon: MessageSquare,
    title: 'Recibí propuestas directas',
    desc: 'Los negocios te contactan directamente. Sin intermediarios, sin comisiones. Vos decidís qué aceptar.',
  },
  {
    icon: Briefcase,
    title: 'Elegí tu disponibilidad',
    desc: 'Jornada completa, medio turno o freelance. Configurá tu disponibilidad y recibí propuestas que se ajusten.',
  },
  {
    icon: Star,
    title: '100% gratis para profesionales',
    desc: 'Publicar tu perfil, recibir propuestas y conectar con negocios. Todo sin costo. Siempre.',
  },
];

function ForProfessionalsSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 120);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      id="profesionales"
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end mb-16">
          <div className="text-center lg:text-left">
            <SectionTag text="Para profesionales" />
            <SectionH2
              line1="Sos profesional?"
              line2="Que te encuentren."
            />
          </div>
          <div className="text-center lg:text-right">
            <p className="text-white/50 max-w-md mx-auto lg:mx-0 lg:ml-auto text-base leading-relaxed tracking-[-0.2px]">
              Cre&aacute; tu perfil gratis, mostr&aacute; tu experiencia y recib&iacute; propuestas de negocios que buscan tu talento.
            </p>
            <Link
              href="/register"
              className="lv2-glow-btn inline-flex items-center gap-2 bg-[#3F8697] text-white font-medium px-6 py-3 rounded-[10px] text-sm mt-6"
            >
              Crear mi perfil gratis
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {PROFESSIONAL_BENEFITS.map((b, i) => (
            <div
              key={i}
              className="lv2-card-stagger lv2-card p-7 hover:bg-[#0A0A0A] transition-colors duration-300"
            >
              <div className="w-11 h-11 rounded-xl lv2-icon-glow flex items-center justify-center mb-5">
                <b.icon size={22} className="text-[#3F8697]" />
              </div>
              <h3 className="text-white font-medium text-lg tracking-[-0.5px] mb-2">{b.title}</h3>
              <p className="text-white/50 text-[15px] leading-[26px] tracking-[-0.2px]">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SOCIAL PROOF
   ═══════════════════════════════════════════ */
const TALENT_TESTIMONIALS = [
  {
    quote: 'Encontré una maquilladora increíble para mi salón en menos de una semana. Le envié la propuesta y al día siguiente ya estaba trabajando.',
    name: 'Valentina M.',
    role: 'Dueña',
    business: 'Salón Valentina Beauty',
  },
  {
    quote: 'Como barbero independiente, recibo propuestas de negocios todas las semanas. Ya no necesito buscar trabajo, el trabajo me encuentra.',
    name: 'Martín R.',
    role: 'Barbero',
    business: 'Profesional independiente',
  },
  {
    quote: 'Necesitábamos un kinesiólogo para nuestro centro. En TurnoLink encontramos 5 perfiles excelentes y contratamos al ideal.',
    name: 'Dra. Laura S.',
    role: 'Directora',
    business: 'Centro Médico Integral',
  },
];

function SocialProofSection({ profileCount }: { profileCount: number }) {
  const sectionRef = useScrollReveal();
  const statsRef = useStaggerReveal('.lv2-stat', 100);

  const stats = [
    { value: profileCount > 0 ? `+${profileCount}` : '+200', label: 'Profesionales activos' },
    { value: '12', label: 'Categorías disponibles' },
    { value: '48h', label: 'Tiempo promedio de respuesta' },
    { value: '$0', label: 'Costo para profesionales' },
  ];

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Resultados" />
          <SectionH2
            line1="Negocios y profesionales"
            line2="conectando cada día."
          />
        </div>

        <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {stats.map((s, i) => (
            <div
              key={i}
              className="lv2-stat lv2-card rounded-[20px] p-6 text-center group hover:bg-[#0A0A0A] transition-colors duration-300"
            >
              <div className="text-2xl sm:text-3xl font-normal tracking-[-2px] text-white mb-1 group-hover:text-[#3F8697] transition-colors duration-300">
                {s.value}
              </div>
              <p className="text-sm text-white/40 tracking-tight">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TALENT_TESTIMONIALS.map((t, i) => (
            <div key={i} className="lv2-card p-7 flex flex-col">
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-white/50 text-[15px] leading-[26px] tracking-[-0.2px] flex-1 mb-5">
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

/* ═══════════════════════════════════════════
   FAQ
   ═══════════════════════════════════════════ */
const FAQS = [
  {
    q: '¿Necesito una cuenta para ver los perfiles?',
    a: 'Para explorar categorías y ver la página de talento no necesitás cuenta. Para acceder a los perfiles completos y enviar propuestas, necesitás registrarte gratis como buscador de talento.',
  },
  {
    q: '¿Cuánto cuesta usar el marketplace de talento?',
    a: 'Para los profesionales es 100% gratis: publicar perfil, recibir y responder propuestas. Para negocios, el acceso al marketplace está incluido en todos los planes de TurnoLink, incluyendo el plan gratuito.',
  },
  {
    q: '¿Cómo funciona el proceso de propuestas?',
    a: 'Como negocio, navegás los perfiles, encontrás al profesional ideal y le enviás una propuesta con el rol, un mensaje personalizado y la disponibilidad que buscás. El profesional recibe la propuesta y puede aceptar, rechazar o responder con un mensaje.',
  },
  {
    q: '¿Qué pasa cuando un profesional acepta mi propuesta?',
    a: 'Cuando acepta, obtenés acceso a sus datos de contacto (email y teléfono) para coordinar directamente. No hay comisiones ni intermediarios. El profesional también puede incluir un mensaje con su respuesta.',
  },
  {
    q: '¿Como profesional, puedo elegir qué propuestas aceptar?',
    a: 'Sí, tenés control total. Recibís la propuesta con todos los detalles del negocio, el rol ofrecido y la disponibilidad. Podés aceptar, rechazar o dejar que expire. Cada propuesta incluye el mensaje personalizado del negocio.',
  },
  {
    q: '¿Puedo configurar mi disponibilidad?',
    a: 'Sí. Podés indicar si buscás jornada completa, medio turno o trabajo freelance. También podés activar o desactivar la opción "Abierto a propuestas" en cualquier momento.',
  },
];

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
              Todo lo que necesit&aacute;s saber sobre el marketplace de talento de TurnoLink.
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

/* ═══════════════════════════════════════════
   MAIN PAGE — Fetches real profiles
   ═══════════════════════════════════════════ */
export default function TalentoLandingPage() {
  const [profiles, setProfiles] = useState<PublicTalentProfile[]>([]);
  const [profileCount, setProfileCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await publicTalentApi.browse({ limit: 12, openToWork: true });
        setProfiles(data.data);
        setProfileCount(data.meta.total);
      } catch {
        // Fallback: try without filter
        try {
          const data = await publicTalentApi.browse({ limit: 12 });
          setProfiles(data.data);
          setProfileCount(data.meta.total);
        } catch {
          // Silent fail
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#3F8697]/30 selection:text-white" style={{ overflowX: 'clip' }}>
      <Navbar />
      <HeroSection profileCount={profileCount} />
      <TrustStrip profileCount={profileCount} />
      <CategoriesCarousel />
      <FeaturedProfilesSection profiles={profiles} loading={loading} />
      <HowItWorksSection />
      <ForProfessionalsSection />
      <SocialProofSection profileCount={profileCount} />
      <FAQSection />
      <CTASection
        headline="Encontr&aacute; tu pr&oacute;ximo profesional"
        subtitle="o que te encuentren a vos."
        description="Registrate gratis como negocio para buscar talento, o como profesional para recibir propuestas. En 5 minutos est&aacute;s conectado."
      />
      <Footer />
    </div>
  );
}
