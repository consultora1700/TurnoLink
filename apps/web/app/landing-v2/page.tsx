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
  Pen,
  PawPrint,
  MapPin,
  type LucideIcon,
} from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from './_components/hooks';
import { WordReveal, SectionTag, SectionH2, GlassLine, WHATSAPP_URL } from './_components/ui';
import { Navbar } from './_components/navbar';
import { Footer } from './_components/footer';
import { CTASection } from './_components/cta-section';

/* Navbar imported from ./_components/navbar */

/* ═════════════════════════════════════════
   HERO — Cambio 1: De descripción a autoridad
   ═════════════════════════════════════════ */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-28 lg:pt-32 pb-8 px-5 lg:px-10 overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[#3F8697]/[0.08] blur-[140px] lv2-glow-orb pointer-events-none" />
      <div
        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[#3F8697]/[0.05] blur-[100px] lv2-glow-orb pointer-events-none"
        style={{ animationDelay: '3s' }}
      />

      <div className="max-w-[1000px] mx-auto text-center relative z-10">
        {/* Tag — nuevo */}
        <div className="mb-8">
          <span className="lv2-pill inline-flex items-center px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm text-white/80">
            La plataforma de gestión para negocios de servicios
          </span>
        </div>

        {/* H1 — nuevo: autoridad */}
        <h1 className="text-[7.5vw] sm:text-[56px] lg:text-[86px] font-normal leading-[1.05] lg:leading-[90px] tracking-[-2px] lg:tracking-[-3.8px] mb-6">
          <span className="text-white block whitespace-nowrap">Tu operación completa,</span>
          <span className="text-white/60 block mt-1 whitespace-nowrap">en una sola plataforma.</span>
        </h1>

        {/* Subtitle — nuevo: 6 capacidades concretas */}
        <p className="text-base sm:text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed tracking-[-0.2px]">
          <WordReveal text="Reservas, cobros, clientes, empleados, sucursales y métricas. Todo integrado, todo automático. Tres modos de reserva para más de 40 industrias." />
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

      {/* Hero product mockup — mantener */}
      <div className="max-w-[1000px] mx-auto mt-16 w-full lv2-hero-img relative">
        <div className="lv2-mockup-wrapper">
          <div className="lv2-mockup-frame relative">
            <div className="bg-[#0D0D0D] px-4 py-3 flex items-center gap-2 border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              </div>
              <div className="flex-1 mx-8">
                <div className="bg-white/[0.05] rounded-md h-6 max-w-xs mx-auto flex items-center justify-center">
                  <span className="text-[11px] text-white/30 tracking-tight">app.turnolink.com/dashboard</span>
                </div>
              </div>
            </div>
            <Image
              src="/mockups/dashboard-dark.webp"
              alt="TurnoLink Dashboard — Panel de control de reservas"
              width={1200}
              height={700}
              className="w-full h-auto"
              priority
            />
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
            <CalendarCheck size={20} className="text-[#3F8697]" />
          </div>
          <div>
            <p className="text-white text-sm font-medium tracking-tight">3 modos de reserva</p>
            <p className="text-white/40 text-xs">Hora &middot; Bloque &middot; D&iacute;a</p>
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
    { value: '+500', label: 'negocios activos' },
    { value: '+25.000', label: 'reservas' },
    { value: '0%', label: 'comisión' },
    { value: 'Soporte', label: 'en español' },
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

/* ═════════════════════════════════════════
   PLATAFORMA — Cambio 3: Reemplaza Problema + Solución
   8 capability cards
   ═════════════════════════════════════════ */
const CAPABILITIES = [
  {
    icon: CalendarCheck,
    title: 'Tres modos de reserva',
    desc: 'Por hora, bloque o día. Adaptá el sistema a cómo funciona tu negocio.',
  },
  {
    icon: CreditCard,
    title: 'Cobros con Mercado Pago',
    desc: 'Señas automáticas. 0% de comisión. El dinero va directo a tu cuenta.',
  },
  {
    icon: Building2,
    title: 'Multi-sucursal',
    desc: 'Cada sede con su configuración, horarios y equipo independiente.',
  },
  {
    icon: Users,
    title: 'Gestión de empleados',
    desc: 'Agendas individuales por persona. Servicios y horarios asignados.',
  },
  {
    icon: Star,
    title: 'CRM de clientes',
    desc: 'Historial completo: reservas, pagos, asistencia. Base de datos integrada.',
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard profesional',
    desc: 'Métricas en tiempo real. Facturación, ocupación, reportes.',
  },
  {
    icon: Globe,
    title: 'Tu página de reservas',
    desc: 'Link personalizado con tu marca. Responsive. Abierta 24/7.',
  },
  {
    icon: Bell,
    title: 'Notificaciones automáticas',
    desc: 'Push, WhatsApp y email. Recordatorios que reducen ausencias.',
  },
];

function PlataformaSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 100);

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} id="plataforma" className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Plataforma" />
          <SectionH2
            line1="Todo lo que necesitás"
            line2="para operar en automático."
          />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            TurnoLink no es solo un sistema de turnos. Es la plataforma completa que gestiona tu negocio.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CAPABILITIES.map((c, i) => (
            <div
              key={i}
              className="lv2-card-stagger lv2-card p-7 hover:bg-[#0A0A0A] transition-colors duration-300"
            >
              <div className="w-11 h-11 rounded-xl lv2-icon-glow flex items-center justify-center mb-5">
                <c.icon size={22} className="text-[#3F8697]" />
              </div>
              <h3 className="text-white font-medium text-lg tracking-[-0.5px] mb-2">{c.title}</h3>
              <p className="text-white/50 text-[15px] leading-[26px] tracking-[-0.2px]">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════
   MODOS DE RESERVA — Cambio 4: Limpio, sin verticales
   ═════════════════════════════════════════ */
const MODOS_RESERVA = [
  {
    icon: Clock,
    title: 'Reservas por hora',
    desc: 'Para negocios que venden tiempo en bloques fijos. Turnos de 15, 30 o 60 minutos con agenda por empleado.',
    tags: ['Consultorios', 'Barberías', 'Spas', 'Estudios'],
  },
  {
    icon: Timer,
    title: 'Reservas por bloque',
    desc: 'Para espacios que se alquilan por horas flexibles. Bloques de 1 a 12 horas, con disponibilidad 24/7.',
    tags: ['Canchas', 'Coworking', 'Salas', 'Albergues'],
  },
  {
    icon: CalendarCheck,
    title: 'Reservas por día',
    desc: 'Para alojamientos con check-in y check-out. Calendario por noches con disponibilidad en tiempo real.',
    tags: ['Hoteles', 'Cabañas', 'Dptos', 'Salones'],
  },
];

function ModosReservaSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 150);

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} id="reservas" className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Reservas" />
          <SectionH2
            line1="Tres formas de gestionar reservas."
            line2="Un solo sistema."
          />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            Configurá TurnoLink según cómo opera tu negocio. No importa si vendés turnos de 30 minutos, bloques de horas o estadías por día.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {MODOS_RESERVA.map((m, i) => (
            <div
              key={i}
              className="lv2-card-stagger lv2-card p-8 border-l-2 border-l-[#3F8697] hover:bg-[#0A0A0A] transition-colors duration-300"
            >
              <div className="w-11 h-11 rounded-xl lv2-icon-glow flex items-center justify-center mb-5">
                <m.icon size={22} className="text-[#3F8697]" />
              </div>
              <h3 className="text-white font-medium text-lg tracking-[-0.5px] mb-2">{m.title}</h3>
              <p className="text-white/50 text-[15px] leading-[26px] tracking-[-0.2px] mb-5">{m.desc}</p>
              <div className="flex flex-wrap gap-2">
                {m.tags.map((tag, j) => (
                  <span
                    key={j}
                    className="text-xs text-white/50 bg-white/[0.05] px-3 py-1.5 rounded-full border border-white/[0.06]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
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
      '/mockups/flow-06-formulario.webp',
      '/mockups/flow-07-confirmacion.webp',
      '/mockups/booking-services-dark.webp',
      '/mockups/clientes-dark.webp',
    ],
  },
  {
    id: 'barber-club', label: 'The Barber Club',
    heroImg: '/mockups/set1/turnos.webp',
    images: [
      '/mockups/set1/portada.webp',
      '/mockups/set1/calendario.webp',
      '/mockups/set1/formulario.webp',
      '/mockups/set1/confirmacion.webp',
      '/mockups/set1/servicios.webp',
      '/mockups/set1/clientes.webp',
    ],
  },
  {
    id: 'nails-and-co', label: 'Nails & Co',
    heroImg: '/mockups/set2/turnos.webp',
    images: [
      '/mockups/set2/portada.webp',
      '/mockups/set2/calendario.webp',
      '/mockups/set2/formulario.webp',
      '/mockups/set2/confirmacion.webp',
      '/mockups/set2/servicios.webp',
      '/mockups/set2/clientes.webp',
    ],
  },
  {
    id: 'ink-master', label: 'Ink Master Studio',
    heroImg: '/mockups/set3/turnos.webp',
    images: [
      '/mockups/set3/portada.webp',
      '/mockups/set3/calendario.webp',
      '/mockups/set3/formulario.webp',
      '/mockups/set3/confirmacion.webp',
      '/mockups/set3/servicios.webp',
      '/mockups/set3/clientes.webp',
    ],
  },
];

const CARD_META = [
  { title: 'Página de reservas pública', subtitle: 'Link personalizado', desc: 'Tu link donde tus clientes ven servicios, eligen horarios y reservan.', badge: null },
  { title: 'Calendario inteligente', subtitle: 'Tiempo real', desc: 'Disponibilidad en tiempo real sin solapamientos. Se actualiza automáticamente.', badge: 'PRO' as const },
  { title: 'Formulario + datos del cliente', subtitle: 'Captura de datos', desc: 'Toda la información que necesitás antes de confirmar la reserva.', badge: null },
  { title: 'Confirmación + cobro instantáneo', subtitle: 'Pago automático', desc: 'Pago de seña vía Mercado Pago. Confirmación automática al cliente.', badge: 'PRO' as const },
  { title: 'Responsive en todos los dispositivos', subtitle: 'Mobile-first', desc: 'Tus clientes reservan desde celular, tablet o computadora sin fricciones.', badge: null },
  { title: 'Base de clientes integrada', subtitle: 'CRM incluido', desc: 'Historial completo de cada cliente: reservas, pagos, asistencia.', badge: null },
];

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end mb-16">
          <div className="text-center lg:text-left">
            <SectionTag text="Producto" />
            <SectionH2
              line1="Así se ve tu negocio"
              line2="operando con TurnoLink."
            />
          </div>
          <div className="text-center lg:text-right">
            <p className="text-white/50 max-w-md mx-auto lg:mx-0 lg:ml-auto text-base leading-relaxed tracking-[-0.2px]">
              Desde la portada de reservas hasta la confirmación de pago, todo conectado.
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
          {CARD_META.map((f, i) => (
            <div
              key={i}
              role="button"
              tabIndex={0}
              onClick={handleCycle}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCycle(); } }}
              className="lv2-card-stagger lv2-feature-card lv2-showcase-card group block"
            >
              <div className="rounded-[16px]">
                {/* Image naipe stack */}
                <div className="aspect-[16/10] relative">
                  {/* Back face (peeking behind) */}
                  <div
                    ref={el => { facesRef.current[i * 2] = el; }}
                    className={`absolute inset-0 lv2-naipe-face ${swapping ? 'lv2-naipe-front' : 'lv2-naipe-back'}`}
                  >
                    <Image
                      src={SHOWCASE_SETS[bottomIdx].images[i]}
                      alt={f.title}
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                  {/* Front face */}
                  <div
                    ref={el => { facesRef.current[i * 2 + 1] = el; }}
                    className={`absolute inset-0 lv2-naipe-face ${swapping ? 'lv2-naipe-back' : 'lv2-naipe-front'}`}
                  >
                    <Image
                      src={SHOWCASE_SETS[topIdx].images[i]}
                      alt={f.title}
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                </div>
                {/* Card text */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg lv2-icon-glow flex items-center justify-center flex-shrink-0">
                      <Smartphone size={16} className="text-[#3F8697]" />
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <h3 className="text-white font-medium text-[16px] tracking-[-0.5px] truncate">{f.title}</h3>
                      {f.badge && (
                        <span className="text-[10px] font-bold text-white bg-[#3F8697] px-2 py-0.5 rounded-md tracking-wide uppercase flex-shrink-0">
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
          ))}
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
const FUNCIONALIDADES = [
  {
    icon: Globe,
    stage: 'Paso 1',
    title: 'Tu cliente entra a tu página de reservas',
    desc: 'Un link personalizado donde tus clientes ven tus servicios, precios y disponibilidad en tiempo real. Sin descargas, funciona en cualquier dispositivo.',
    tags: ['Link personalizado', 'Responsive', 'Sin descargas'],
    img: '/mockups/flow-01-portada.webp',
  },
  {
    icon: CalendarCheck,
    stage: 'Paso 2',
    title: 'Elige día, hora y servicio',
    desc: 'Calendario inteligente que muestra solo los horarios disponibles. Sin solapamientos, sin llamadas, sin WhatsApp. Tu cliente reserva en 30 segundos.',
    tags: ['Disponibilidad real', 'Sin solapamientos', 'Multi-servicio'],
    img: '/mockups/flow-04-calendario.webp',
  },
  {
    icon: CreditCard,
    stage: 'Paso 3',
    title: 'Paga la seña automáticamente',
    desc: 'Mercado Pago integrado con un click. Tu cliente paga la seña y la reserva se confirma al instante. El dinero va directo a tu cuenta, sin intermediarios.',
    tags: ['Mercado Pago', 'Cobro instantáneo', '0% comisión'],
    img: '/mockups/flow-07-confirmacion.webp',
  },
  {
    icon: LayoutDashboard,
    stage: 'Paso 4',
    title: 'Vos controlás todo desde el dashboard',
    desc: 'Panel profesional con métricas, clientes, empleados, turnos del día y reportes. Todo lo que necesitás para gestionar tu negocio en un solo lugar.',
    tags: ['Métricas', 'Reportes', 'Multi-sucursal'],
    img: '/mockups/dashboard-dark.webp',
  },
];

function FuncionalidadesSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

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
  }, []);

  return (
    <section
      ref={sectionRef}
      id="funcionalidades"
      className="py-[100px] lg:py-[120px] px-5 lg:px-10 transition-opacity duration-[900ms]"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="lv2-sticky-row">
          <div className="lv2-sticky-cards-col">
            <div className="mb-8 text-center lg:text-left">
              <SectionTag text="Cómo funciona" />
              <SectionH2
                line1="Así funciona TurnoLink,"
                line2="de principio a fin."
              />
              <p className="mt-5 text-white/50 max-w-lg mx-auto lg:mx-0 text-base leading-relaxed tracking-[-0.2px]">
                En 4 pasos tu negocio recibe reservas y cobra señas automáticamente, 24/7.
              </p>
            </div>

            {FUNCIONALIDADES.map((f, i) => (
              <div
                key={i}
                ref={(el) => { cardRefs.current[i] = el; }}
                className={`lv2-func-card ${activeIdx === i ? 'active' : ''}`}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl lv2-icon-glow flex items-center justify-center">
                    <f.icon size={22} className="text-[#3F8697]" />
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
                      <Check size={12} className="text-[#3F8697]" />
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="lg:hidden mt-6">
                  <div className="lv2-mockup-wrapper">
                    <div className="lv2-img-zoom">
                      <Image
                        src={f.img}
                        alt={f.title}
                        width={800}
                        height={500}
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-4">
              <Link
                href="/register"
                className="lv2-glow-btn inline-flex items-center gap-2 bg-[#3F8697] text-white font-medium px-6 py-3 rounded-[10px] text-sm"
              >
                Empezar gratis
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="lv2-sticky-img-col hidden lg:block">
            <div className="lv2-sticky-img-wrap">
              {FUNCIONALIDADES.map((f, i) => (
                <Image
                  key={i}
                  src={f.img}
                  alt={f.title}
                  width={600}
                  height={600}
                  className={activeIdx === i ? 'active-img' : ''}
                />
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
    price: '12.990',
    slug: 'belleza',
  },
  {
    icon: HeartPulse,
    title: 'Salud & Profesionales',
    desc: 'Consultorios, psicólogos, odontólogos, abogados, contadores',
    price: '16.990',
    slug: 'salud',
  },
  {
    icon: Trophy,
    title: 'Deportes & Recreación',
    desc: 'Canchas de fútbol, pádel, tenis, gimnasios, academias',
    price: '19.990',
    slug: 'deportes',
  },
  {
    icon: BedDouble,
    title: 'Hospedaje por horas',
    desc: 'Hoteles, albergues transitorios, boxes privados',
    price: '29.990',
    slug: 'hospedaje-por-horas',
  },
  {
    icon: Home,
    title: 'Alquiler temporario',
    desc: 'Cabañas, departamentos, quinchos, salones de eventos',
    price: '24.990',
    slug: 'alquiler-temporario',
  },
  {
    icon: Briefcase,
    title: 'Espacios flexibles',
    desc: 'Coworking, oficinas por hora, salas de reuniones, estudios',
    price: '18.990',
    slug: 'espacios-flexibles',
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

        {/* 6 vertical cards */}
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {INDUSTRIAS.map((ind, i) => (
            <div
              key={i}
              className="lv2-card-stagger lv2-card p-7 hover:bg-[#0A0A0A] transition-colors duration-300 flex flex-col"
            >
              <div className="w-11 h-11 rounded-xl lv2-icon-glow flex items-center justify-center mb-5">
                <ind.icon size={22} className="text-[#3F8697]" />
              </div>
              <h3 className="text-white font-medium text-lg tracking-[-0.5px] mb-1">{ind.title}</h3>
              <p className="text-white/50 text-[14px] leading-[22px] tracking-[-0.2px] mb-5 flex-1">{ind.desc}</p>
              <div className="flex items-baseline gap-1.5 mb-4">
                <span className="text-white/30 text-sm">Desde</span>
                <span className="text-white text-xl font-normal tracking-[-1px]">${ind.price}</span>
                <span className="text-white/30 text-sm">/mes</span>
              </div>
              <Link
                href={`/landing-v2/${ind.slug}`}
                className="text-sm text-[#3F8697] hover:text-[#4a9db0] transition-colors duration-300 flex items-center gap-1.5 font-medium"
              >
                Ver planes
                <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>

        {/* Banner Plan Gratis */}
        <div className="mt-8 lv2-card rounded-[20px] p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl lv2-icon-glow flex items-center justify-center">
                  <Zap size={20} className="text-[#3F8697]" />
                </div>
                <div>
                  <h3 className="text-white font-medium text-xl tracking-[-0.5px]">Plan Gratis — para siempre</h3>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-white/50">
                <span className="flex items-center gap-1.5">
                  <Check size={14} className="text-[#3F8697]" />
                  $0
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={14} className="text-[#3F8697]" />
                  30 reservas/mes
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={14} className="text-[#3F8697]" />
                  2 empleados
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={14} className="text-[#3F8697]" />
                  1 sucursal
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={14} className="text-[#3F8697]" />
                  Ideal para probar
                </span>
              </div>
            </div>
            <div>
              <Link
                href="/register"
                className="lv2-glow-btn inline-flex items-center gap-2 bg-[#3F8697] text-white font-medium px-6 py-3 rounded-[10px] text-sm"
              >
                Empezar gratis
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
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
  businesses: [ShowcaseBusiness, ShowcaseBusiness];
}

const SHOWCASE_DATA: ShowcaseIndustry[] = [
  {
    id: 'peluquerias',
    label: 'Peluquerías',
    icon: Scissors,
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
        slug: 'demo-estetica',
        name: 'Bella Estética',
        shortDesc: 'Centro de belleza integral',
        location: 'Belgrano',
        rating: 4.9,
        reviews: 98,
        primaryColor: '#ec4899',
        secondaryColor: '#f472b6',
        services: [
          { name: 'Limpieza Facial', price: '$10.500', duration: '60 min' },
          { name: 'Depilación Piernas', price: '$8.500', duration: '45 min' },
          { name: 'Manos Semipermanente', price: '$9.500', duration: '60 min' },
        ],
      },
    ],
  },
  {
    id: 'barberias',
    label: 'Barberías',
    icon: Scissors,
    businesses: [
      {
        slug: 'the-barber-club',
        name: 'The Barber Club',
        shortDesc: 'Barbería clásica masculina',
        location: 'San Isidro',
        rating: 4.7,
        reviews: 203,
        primaryColor: '#212121',
        secondaryColor: '#d4a574',
        services: [
          { name: 'Corte Clásico', price: '$5.000', duration: '30 min' },
          { name: 'Corte + Barba', price: '$7.000', duration: '45 min' },
          { name: 'Combo Premium', price: '$12.000', duration: '75 min' },
        ],
      },
      {
        slug: 'barber-club',
        name: 'Barber Club',
        shortDesc: 'Barbería moderna & grooming',
        location: 'Recoleta',
        rating: 4.6,
        reviews: 156,
        primaryColor: '#1a1a2e',
        secondaryColor: '#e94560',
        services: [
          { name: 'Corte Fade', price: '$5.500', duration: '40 min' },
          { name: 'Barba Sculpting', price: '$4.000', duration: '25 min' },
          { name: 'Black Mask', price: '$3.500', duration: '20 min' },
        ],
      },
    ],
  },
  {
    id: 'estetica',
    label: 'Estética & Uñas',
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
  {
    id: 'spa',
    label: 'Spa & Masajes',
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
  {
    id: 'salud',
    label: 'Salud',
    icon: HeartPulse,
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
  {
    id: 'fitness',
    label: 'Fitness & Deportes',
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
  {
    id: 'tatuajes',
    label: 'Tatuajes & Piercing',
    icon: Pen,
    businesses: [
      {
        slug: 'ink-master-studio',
        name: 'Ink Master Studio',
        shortDesc: 'Tatuajes & micropigmentación',
        location: 'San Telmo',
        rating: 4.8,
        reviews: 276,
        primaryColor: '#b71c1c',
        secondaryColor: '#ef5350',
        services: [
          { name: 'Tatuaje Pequeño', price: '$15.000', duration: '60 min' },
          { name: 'Tatuaje Mediano', price: '$30.000', duration: '120 min' },
          { name: 'Piercing Oreja', price: '$8.000', duration: '20 min' },
        ],
      },
      {
        slug: 'fine-line-studio',
        name: 'Fine Line Studio',
        shortDesc: 'Fine line & micro realismo',
        location: 'Villa Crespo',
        rating: 4.9,
        reviews: 142,
        primaryColor: '#1A1A1A',
        secondaryColor: '#6B7280',
        services: [
          { name: 'Fine Line Pequeño', price: '$20.000', duration: '60 min' },
          { name: 'Botanical Fine Line', price: '$30.000', duration: '90 min' },
          { name: 'Piercing Helix', price: '$12.000', duration: '20 min' },
        ],
      },
    ],
  },
  {
    id: 'veterinaria',
    label: 'Veterinaria',
    icon: PawPrint,
    businesses: [
      {
        slug: 'happy-paws',
        name: 'Happy Paws',
        shortDesc: 'Peluquería canina & spa',
        location: 'Belgrano',
        rating: 4.7,
        reviews: 198,
        primaryColor: '#2e7d32',
        secondaryColor: '#a5d6a7',
        services: [
          { name: 'Baño Completo S', price: '$5.000', duration: '45 min' },
          { name: 'Corte Breed', price: '$10.000', duration: '90 min' },
          { name: 'Spa Canino Premium', price: '$15.000', duration: '90 min' },
        ],
      },
      {
        slug: 'vetcare-centro',
        name: 'VetCare Centro',
        shortDesc: 'Centro veterinario integral',
        location: 'Caballito',
        rating: 4.9,
        reviews: 215,
        primaryColor: '#0D9488',
        secondaryColor: '#0284C7',
        services: [
          { name: 'Consulta General', price: '$8.000', duration: '30 min' },
          { name: 'Vacuna Antirrábica', price: '$5.000', duration: '15 min' },
          { name: 'Ecografía Abdominal', price: '$10.000', duration: '30 min' },
        ],
      },
    ],
  },
];

function PhoneCard({ business }: { business: ShowcaseBusiness }) {
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
              Reservar turno
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
            Cada negocio tiene su propia página pública de reservas, personalizada con su marca y servicios.
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
                  className={`lv2-showcase-pill lv2-card-stagger ${activeIdx === idx ? 'active' : ''}`}
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
        <div key={animKey} className="lv2-showcase-cards-enter flex flex-col sm:flex-row gap-8 sm:gap-10 justify-center items-start max-w-[700px] mx-auto">
          <PhoneCard business={active.businesses[0]} />
          <PhoneCard business={active.businesses[1]} />
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
  {
    quote: 'Desde que usamos TurnoLink, las ausencias bajaron un 80%. El cobro de seña automático cambió todo.',
    name: 'Mariana López',
    role: 'Dueña',
    business: 'Estudio MR Pilates',
  },
  {
    quote: 'Antes perdía 3 horas por día en WhatsApp coordinando turnos. Ahora mis clientes reservan solos, 24/7.',
    name: 'Lucas Fernández',
    role: 'Barbero',
    business: 'Barber Shop LF',
  },
  {
    quote: 'Configuramos 3 sucursales en una tarde. Cada una con sus horarios y empleados. Increíble la flexibilidad.',
    name: 'Carolina Ruiz',
    role: 'Gerente',
    business: 'Centro Dental Sonrisa',
  },
  {
    quote: 'El dashboard me da el control total. Sé exactamente cuánto facturó, quién reservó y qué horarios están libres.',
    name: 'Diego Martínez',
    role: 'Dueño',
    business: 'Complejo Deportivo DM',
  },
  {
    quote: 'Administramos 12 cabañas y antes era un caos de WhatsApp. Con TurnoLink el huésped reserva y paga la seña online. Check-in y check-out automático.',
    name: 'Valeria Torres',
    role: 'Dueña',
    business: 'Cabañas del Lago',
  },
  {
    quote: 'Tenemos 4 canchas de pádel y 2 de fútbol. TurnoLink nos eliminó los solapamientos y el teléfono que no paraba de sonar.',
    name: 'Nicolás Romero',
    role: 'Socio',
    business: 'Pádel & Fútbol Norte',
  },
];

function SocialProofSection() {
  const sectionRef = useScrollReveal();
  const statsRef = useStaggerReveal('.lv2-stat', 100);

  const stats = [
    { value: '+500', label: 'Negocios activos' },
    { value: '+25.000', label: 'Reservas procesadas' },
    { value: '24/7', label: 'Reservas automáticas' },
    { value: '0%', label: 'Comisión sobre cobros' },
  ];

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end mb-16">
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
                <div className="border-t border-white/[0.06] pt-4">
                  <p className="text-white font-medium text-sm tracking-tight">{t.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {t.role} · {t.business}
                  </p>
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
const FAQS = [
  {
    q: '¿Qué diferencia tiene TurnoLink de un simple sistema de turnos?',
    a: 'TurnoLink no es solo un turnero. Es una plataforma completa que incluye 3 modos de reserva, cobro automático de señas con Mercado Pago, CRM de clientes, gestión de empleados, multi-sucursal, dashboard con métricas y página de reservas personalizable. Todo integrado en un solo sistema.',
  },
  {
    q: '¿Necesito tarjeta de crédito para empezar?',
    a: 'No. Tenemos un plan Gratis permanente que no requiere tarjeta. Los planes profesionales tienen 14 días de prueba sin compromiso y los precios varían según tu industria.',
  },
  {
    q: '¿Cómo funciona el cobro de señas?',
    a: 'Conectás tu cuenta de Mercado Pago con un click. Configurás el porcentaje de seña (ej: 30%). Cuando un cliente reserva, paga automáticamente y la reserva se confirma al instante. El dinero va directo a tu cuenta.',
  },
  {
    q: '¿Sirve para mi tipo de negocio?',
    a: 'Si tu negocio gestiona disponibilidad — ya sea por hora, bloque o día — TurnoLink se configura para tu modelo. Trabajamos con más de 40 rubros: belleza, salud, deportes, hospedaje, alquiler temporario y espacios de trabajo. Cada vertical tiene planes adaptados.',
  },
  {
    q: '¿Puedo tener varias sucursales?',
    a: 'Sí. Cada sucursal tiene sus propios horarios, servicios, empleados y disponibilidad. Todo gestionado desde una sola cuenta.',
  },
  {
    q: '¿Mis clientes necesitan descargar una app?',
    a: 'No. La página de reservas funciona desde cualquier navegador, en cualquier dispositivo. Sin descargas, sin fricciones.',
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
      <PlataformaSection />
      <ModosReservaSection />
      <ProductShowcase />
      <FuncionalidadesSection />
      <IndustriasYPreciosSection />
      <ShowcaseSection />
      <SocialProofSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
