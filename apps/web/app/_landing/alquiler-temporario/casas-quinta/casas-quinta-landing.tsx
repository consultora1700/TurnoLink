'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Check,
  Shield,
  Zap,
  Star,
  CalendarCheck,
  CreditCard,
  Users,
  Bell,
  BarChart3,
  Globe,
  TrendingUp,
  Timer,
  Home,
  TreePine,
  type LucideIcon,
} from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '../../_components/hooks';
import { SectionTag, SectionH2, WordReveal, WHATSAPP_URL } from '../../_components/ui';
import { Navbar } from '../../_components/navbar';
import { Footer } from '../../_components/footer';
import { CTASection } from '../../_components/cta-section';

/* ═══════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════ */

const ACCENT = '#D97706';
const S = '/screenshots/casas-quinta/desktop';

/* ═══════════════════════════════════════════════════════
   IMAGE SETS — Auto-cycling carousels per section
   ═══════════════════════════════════════════════════════ */

const HERO_IMAGES = [
  { src: `${S}/hero-portada.png`, alt: 'Quinta Ya — página de reservas con hero, propiedades con fotos y precios por noche' },
  { src: `${S}/servicios-grid.png`, alt: 'Grilla de 6 propiedades con fotos, precios y botón de reserva inmediata' },
  { src: `${S}/pagina-servicios.png`, alt: 'Vista superior de la página con hero de la quinta y catálogo de propiedades' },
];

const PROPIEDADES_IMAGES = [
  { src: `${S}/pagina-completa.png`, alt: 'Vista completa de la página pública con hero, servicios, mapa y footer' },
  { src: `${S}/servicio-detalle-modal.png`, alt: 'Detalle de Casa del Lago — foto, descripción, amenities incluidos y precio por noche' },
  { src: `${S}/servicio-glamping-detalle.png`, alt: 'Detalle de Glamping bajo las Estrellas — domo transparente con amenities y precio' },
];

const CALENDARIO_IMAGES = [
  { src: `${S}/calendario-fechas.png`, alt: 'Calendario de reservas por día con leyenda de entrada, salida, estadía y no disponible' },
  { src: `${S}/calendario-entrada-seleccionada.png`, alt: 'Fecha de check-in seleccionada con indicador verde y selector de salida activo' },
  { src: `${S}/calendario-rango-seleccionado.png`, alt: 'Rango de 2 noches seleccionado — entrada 14 mar, salida 16 mar con botón de confirmación' },
];

const CONFIRMACION_IMAGES = [
  { src: `${S}/formulario-confirmacion.png`, alt: 'Paso 3 — resumen con servicio, check-in/out, noches, precio y formulario de datos' },
  { src: `${S}/ubicacion-mapa.png`, alt: 'Sección de ubicación con mapa de Google Maps, dirección y botones de acción' },
];

/* ═══════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════ */

const PAIN_POINTS = [
  {
    emoji: '📱',
    title: 'WhatsApp infinito',
    desc: '"¿Está disponible el finde largo?" — te lo preguntan 30 personas por día. Mientras respondés uno por uno, se te escapan reservas reales de gente lista para pagar.',
  },
  {
    emoji: '👻',
    title: 'Reservas fantasma',
    desc: 'Reservan de palabra, prometen la seña "mañana sin falta" y el viernes a la noche cancelan. La quinta queda vacía y perdés el ingreso del fin de semana completo.',
  },
  {
    emoji: '📊',
    title: 'Gestión a ciegas',
    desc: 'No sabés cuánto facturaste por temporada, qué propiedad rinde más ni cuántas noches vendiste. Planillas sueltas, anotaciones en el celular, cero trazabilidad.',
  },
];

const BEFORE_ITEMS = [
  { time: 'Lunes', text: '"Hola, ¿cuánto sale el finde del 15?" — respondés la misma tabla de precios por 50va vez' },
  { time: 'Martes', text: '"Te paso la seña mañana sin falta" — spoiler: nunca la pasó' },
  { time: 'Miércoles', text: 'Dos familias creen que reservaron el mismo finde. Conflicto asegurado' },
  { time: 'Jueves', text: 'Publicaste en 3 grupos de Facebook. Te escriben 40 personas al mismo tiempo' },
  { time: 'Viernes', text: '"No vamos a poder ir, surgió algo". La quinta queda vacía todo el finde' },
  { time: 'Domingo', text: 'Cerrás el mes sin saber si ganaste o perdiste plata con cada propiedad' },
];

const AFTER_ITEMS = [
  { time: 'Lunes', text: 'Tu página muestra fotos, precios y disponibilidad. El huésped se informa solo' },
  { time: 'Martes', text: 'Reserva confirmada con seña pagada al instante vía Mercado Pago' },
  { time: 'Miércoles', text: 'Calendario único por propiedad. Las fechas reservadas se bloquean automáticamente' },
  { time: 'Jueves', text: 'Un solo link para todas tus redes. El huésped elige fecha, paga y listo' },
  { time: 'Viernes', text: 'Si cancela, la seña ya está cobrada. Las fechas se liberan para otro' },
  { time: 'Domingo', text: 'Dashboard con ocupación por propiedad, noches vendidas y facturación real' },
];

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: CalendarCheck,
    title: 'Calendario por día',
    desc: 'Check-in y check-out configurables. Tu huésped ve las fechas libres y reserva al instante desde el celular.',
  },
  {
    icon: CreditCard,
    title: 'Seña automática',
    desc: 'Configurás el monto de seña. Al reservar, el huésped paga vía Mercado Pago y la reserva se confirma sola.',
  },
  {
    icon: Timer,
    title: 'Estadía mínima',
    desc: 'Fin de semana: 2 noches. Finde largo: 3. Vacaciones: 7. Vos ponés las reglas, el sistema las aplica.',
  },
  {
    icon: TrendingUp,
    title: 'Precios por temporada',
    desc: 'Alta, baja, fines de semana largos. Cada período con su tarifa por noche. El precio correcto se muestra solo.',
  },
  {
    icon: Globe,
    title: 'Página con fotos',
    desc: 'Link personalizado con fotos de tu quinta, descripción, amenities y disponibilidad. Compartilo donde quieras.',
  },
  {
    icon: BarChart3,
    title: 'Reportes de ocupación',
    desc: 'Noches vendidas, facturación por propiedad, temporada más rentable. Datos reales para tomar decisiones.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'Tenemos 4 quintas en zona norte y antes era un desastre de WhatsApp. Ahora cada propiedad tiene su calendario, el huésped paga la seña online y las cancelaciones bajaron a cero.',
    name: 'Marcelo Vignatti',
    role: 'Propietario',
    business: 'Quintas del Norte',
    metric: '0 cancelaciones',
    image: 'https://randomuser.me/api/portraits/men/17.jpg',
  },
  {
    quote:
      'Alquilamos la casa de campo los fines de semana. Con TurnoLink, los huéspedes ven las fotos, eligen fecha y pagan. Facturamos 40% más porque ya no se nos escapan reservas.',
    name: 'Carolina Bianchi',
    role: 'Dueña',
    business: 'Casa de Campo Los Aromos',
    metric: '+40% facturación',
    image: 'https://randomuser.me/api/portraits/women/20.jpg',
  },
  {
    quote:
      'Manejo 8 cabañas y un quincho para eventos. Antes tenía una planilla de Excel imposible. Ahora cada propiedad tiene su calendario y precios. Cero dobles reservas desde que lo uso.',
    name: 'Juan Pablo Sosa',
    role: 'Administrador',
    business: 'Complejo Las Toscas',
    metric: '0 solapamientos',
    image: 'https://randomuser.me/api/portraits/men/18.jpg',
  },
];

const PRICING_TIERS = [
  {
    name: 'Gratis',
    price: '$0',
    period: 'para siempre',
    popular: false,
    features: [
      'Hasta 5 propiedades',
      '30 reservas por mes',
      'Cobro de señas',
      'Calendario por día',
      'Página con fotos y precios',
      'Recordatorios automáticos',
    ],
  },
  {
    name: 'Profesional',
    price: '$14.999',
    period: '/mes',
    popular: true,
    features: [
      'Propiedades ilimitadas',
      'Reservas ilimitadas',
      'Cobro de señas con Mercado Pago',
      'Precios por temporada',
      'Dashboard completo',
      'Soporte prioritario',
    ],
  },
  {
    name: 'Business',
    price: '$29.999',
    period: '/mes',
    popular: false,
    features: [
      'Todo de Profesional',
      'Multi-propiedad',
      'Reportes gerenciales',
      'Soporte prioritario',
      'Dashboard gerencial',
      'API disponible',
    ],
  },
];

const FAQS = [
  {
    q: '¿Puedo mostrar fotos de mi quinta en la página de reservas?',
    a: 'Sí. Cargás fotos de cada propiedad, descripción, amenities incluidos y ubicación. Tu huésped ve todo lo que necesita antes de reservar.',
  },
  {
    q: '¿Cómo funciona el cobro de seña?',
    a: 'Configurás un monto fijo o porcentaje del total. Al reservar, el huésped paga vía Mercado Pago y la reserva se confirma automáticamente. La plata va directo a tu cuenta.',
  },
  {
    q: '¿Puedo poner precios distintos según la temporada?',
    a: 'Sí. Temporada alta, baja, fines de semana largos — cada período con su tarifa por noche. El calendario muestra el precio correcto automáticamente.',
  },
  {
    q: '¿Puedo configurar una estadía mínima?',
    a: 'Sí. Por ejemplo: 2 noches en finde normal, 3 en finde largo, 7 en vacaciones de invierno. El sistema solo permite reservas que cumplan tu regla.',
  },
  {
    q: '¿Sirve si tengo más de una quinta o propiedad?',
    a: 'Sí. Cada propiedad tiene su calendario, fotos, precios y configuración independiente. Todo gestionado desde una sola cuenta.',
  },
  {
    q: '¿Qué pasa si un huésped cancela?',
    a: 'Las fechas se liberan automáticamente para que otro huésped pueda reservar. La política de seña (retener o devolver) la definís vos desde la configuración.',
  },
  {
    q: '¿Los huéspedes necesitan descargar una app?',
    a: 'No. Tu página de reservas funciona desde cualquier navegador, celular o computadora. Sin descargas, sin registros, sin fricciones.',
  },
];

/* ═══════════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════════ */

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          obs.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return { count, ref };
}

/* ═══════════════════════════════════════════════════════
   AUTO-CYCLE IMAGE — Crossfade carousel with dot indicators
   ═══════════════════════════════════════════════════════ */

function AutoCycleImage({
  images,
  width = 1440,
  height = 900,
  interval = 3000,
  priority = false,
}: {
  images: { src: string; alt: string }[];
  width?: number;
  height?: number;
  interval?: number;
  priority?: boolean;
}) {
  const [current, setCurrent] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [isVisible, images.length, interval]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative w-full" style={{ aspectRatio: `${width} / ${height}` }}>
        {images.map((img, i) => (
          <Image
            key={img.src}
            src={img.src}
            alt={img.alt}
            width={width}
            height={height}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
              i === current ? 'opacity-100' : 'opacity-0'
            }`}
            priority={priority && i === 0}
          />
        ))}
      </div>
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 backdrop-blur-md rounded-full px-3 py-1.5">
          {images.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-500 ease-out ${
                i === current
                  ? 'w-5 h-1.5 bg-white/90'
                  : 'w-1.5 h-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════ */

function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center pt-28 lg:pt-32 pb-12 px-5 lg:px-10 overflow-hidden">
      <div
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] lv2-glow-orb pointer-events-none"
        style={{ backgroundColor: `${ACCENT}11` }}
      />
      <div
        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] lv2-glow-orb pointer-events-none"
        style={{ backgroundColor: `${ACCENT}08`, animationDelay: '3s' }}
      />

      <div className="max-w-[1200px] mx-auto w-full relative z-10">
        {/* Centered copy */}
        <div className="text-center">
          <div className="mb-8 flex justify-center">
            <span className="lv2-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm text-white/80">
              <TreePine size={14} style={{ color: ACCENT }} />
              Casas Quinta
            </span>
          </div>

          <h1 className="text-[9vw] sm:text-[48px] lg:text-[56px] xl:text-[64px] font-normal leading-[1.05] tracking-[-2px] lg:tracking-[-3px] mb-6">
            <span className="text-white block">Tu quinta reservada,</span>
            <span className="text-white block">la seña cobrada.</span>
            <span className="text-white/50 block mt-1">Vos disfrutás</span>
            <span className="text-white/50 block">del campo.</span>
          </h1>

          <p className="text-base sm:text-lg text-white/50 max-w-2xl mx-auto mb-8 leading-relaxed tracking-[-0.2px]">
            <WordReveal text="Calendario por día con disponibilidad en tiempo real, cobro de seña automático con Mercado Pago y precios por temporada. Tu quinta gestionada 24/7 sin responder WhatsApp." />
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href="/register?industry=alquiler-temporario"
              className="lv2-glow-btn text-white font-medium px-8 py-3.5 rounded-[10px] text-base flex items-center gap-2"
              style={{ backgroundColor: ACCENT }}
            >
              Probar 14 días gratis
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

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-white/40">
            <span className="flex items-center gap-1.5">
              <Zap size={14} style={{ color: ACCENT }} /> Configuración en 10 min
            </span>
            <span className="flex items-center gap-1.5">
              <Shield size={14} style={{ color: ACCENT }} /> 14 días gratis
            </span>
            <span className="flex items-center gap-1.5">
              <Home size={14} style={{ color: ACCENT }} /> +100 quintas activas
            </span>
          </div>
        </div>

        {/* Product screenshot — centered below */}
        <div className="mt-14 relative max-w-5xl mx-auto">
          <div className="lv2-mockup-wrapper relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl" style={{ boxShadow: `0 25px 50px -12px ${ACCENT}15` }}>
            <AutoCycleImage images={HERO_IMAGES} priority />
          </div>
          {/* Floating badge: cancelaciones */}
          <div className="absolute -bottom-5 -left-5 bg-black/90 backdrop-blur-xl border border-white/[0.1] rounded-xl px-5 py-3.5 flex items-center gap-3 shadow-xl">
            <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center">
              <TrendingUp size={18} className="text-green-400" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">-90% cancelaciones</p>
              <p className="text-white/40 text-xs">Con cobro de seña</p>
            </div>
          </div>
          {/* Floating badge: 24/7 */}
          <div className="absolute -top-3 -right-3 bg-black/90 backdrop-blur-xl border border-white/[0.1] rounded-xl px-5 py-3.5 flex items-center gap-3 shadow-xl">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: `${ACCENT}20` }}>
              <CalendarCheck size={18} style={{ color: ACCENT }} />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Reservas 24/7</p>
              <p className="text-white/40 text-xs">Desde el celular, sin llamar</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   METRICS STRIP
   ═══════════════════════════════════════════════════════ */

function MetricsStrip() {
  const sectionRef = useScrollReveal();
  const c1 = useCountUp(90, 2000);
  const c2 = useCountUp(100, 2500);
  const c3 = useCountUp(40, 2000);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-14 border-y border-white/[0.04] bg-white/[0.01]"
    >
      <div className="max-w-[1200px] mx-auto px-5 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-4">
          <div ref={c1.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              -{c1.count}<span style={{ color: ACCENT }}>%</span>
            </p>
            <p className="text-sm text-white/40 mt-2">Cancelaciones</p>
          </div>
          <div ref={c2.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              +{c2.count}
            </p>
            <p className="text-sm text-white/40 mt-2">Quintas activas</p>
          </div>
          <div ref={c3.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              +{c3.count}<span style={{ color: ACCENT }}>%</span>
            </p>
            <p className="text-sm text-white/40 mt-2">Más facturación</p>
          </div>
          <div className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal tracking-[-2px]" style={{ color: ACCENT }}>$0</p>
            <p className="text-sm text-white/40 mt-2">Comisión sobre cobros</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   PAIN POINTS
   ═══════════════════════════════════════════════════════ */

function PainPointsSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 120);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="El problema" />
          <SectionH2 line1="¿Te suena familiar?" line2="No sos el único/a." />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PAIN_POINTS.map((item, i) => (
            <div
              key={i}
              className="lv2-card-stagger lv2-card p-8 hover:bg-[#0A0A0A] transition-colors duration-300"
            >
              <div className="text-3xl mb-5">{item.emoji}</div>
              <h3 className="text-white font-medium text-lg tracking-[-0.5px] mb-3">{item.title}</h3>
              <p className="text-white/50 text-[15px] leading-[26px] tracking-[-0.2px]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   BEFORE / AFTER
   ═══════════════════════════════════════════════════════ */

function BeforeAfterSection() {
  const sectionRef = useScrollReveal();

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Transformación" />
          <SectionH2 line1="Tu semana gestionando" line2="la quinta, antes y después." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ANTES */}
          <div className="lv2-card p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.03] to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-3 h-3 rounded-full bg-red-500/60 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                <h3 className="text-white/80 font-medium text-lg tracking-[-0.5px]">Sin TurnoLink</h3>
              </div>
              <div className="space-y-5">
                {BEFORE_ITEMS.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="text-xs text-red-400/50 font-mono mt-0.5 w-20 flex-shrink-0 tabular-nums">
                      {item.time}
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/30 mt-2 flex-shrink-0" />
                    <p className="text-white/40 text-sm leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DESPUÉS */}
          <div className="lv2-card p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/[0.05] to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-3 h-3 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                <h3 className="text-white/80 font-medium text-lg tracking-[-0.5px]">Con TurnoLink</h3>
              </div>
              <div className="space-y-5">
                {AFTER_ITEMS.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="text-xs text-[#10B981]/70 font-mono mt-0.5 w-20 flex-shrink-0 tabular-nums">
                      {item.time}
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]/60 mt-2 flex-shrink-0" />
                    <p className="text-white/60 text-sm leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SHOWCASE 1: PROPIEDADES CON FOTOS
   ═══════════════════════════════════════════════════════ */

function ShowcasePropiedadesSection() {
  const sectionRef = useScrollReveal();

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-center">
          {/* Copy */}
          <div>
            <SectionTag text="Tus propiedades" />
            <h2 className="lv2-h2 mt-6 text-[32px] sm:text-[40px] lg:text-[48px] font-normal leading-[1.05] tracking-[-1.9px]">
              <span className="text-white block">Tu quinta con fotos,</span>
              <span className="text-white/60 block mt-1">precios y amenities.</span>
            </h2>
            <p className="mt-5 text-white/50 text-base leading-relaxed tracking-[-0.2px] max-w-lg">
              Cada propiedad con su página propia: fotos del lugar, descripción, qué incluye (pileta, parrilla, estacionamiento), precio por noche y disponibilidad en tiempo real. El huésped decide sin preguntarte nada.
            </p>

            <div className="mt-8 space-y-4">
              {[
                'Fotos y descripción de cada propiedad',
                'Amenities incluidos (pileta, parrilla, WiFi, etc.)',
                'Precios por noche visibles en el calendario',
                'Link personalizado para compartir en redes',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check size={18} className="mt-0.5 flex-shrink-0" style={{ color: ACCENT }} />
                  <p className="text-white/60 text-[15px] leading-relaxed">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link
                href="/register?industry=alquiler-temporario"
                className="lv2-glow-btn text-white font-medium px-7 py-3 rounded-[10px] text-sm inline-flex items-center gap-2"
                style={{ backgroundColor: ACCENT }}
              >
                Crear mi página de reservas
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Screenshot */}
          <div className="lv2-mockup-wrapper rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl" style={{ boxShadow: `0 25px 50px -12px ${ACCENT}10` }}>
            <AutoCycleImage images={PROPIEDADES_IMAGES} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SHOWCASE 2: CALENDARIO POR DÍA
   ═══════════════════════════════════════════════════════ */

function ShowcaseCalendarioSection() {
  const sectionRef = useScrollReveal();

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-center">
          {/* Screenshot */}
          <div className="lv2-mockup-wrapper rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl order-2 lg:order-1" style={{ boxShadow: `0 25px 50px -12px ${ACCENT}10` }}>
            <AutoCycleImage images={CALENDARIO_IMAGES} />
          </div>

          {/* Copy */}
          <div className="order-1 lg:order-2">
            <SectionTag text="Calendario por día" />
            <h2 className="lv2-h2 mt-6 text-[32px] sm:text-[40px] lg:text-[48px] font-normal leading-[1.05] tracking-[-1.9px]">
              <span className="text-white block">Check-in, check-out</span>
              <span className="text-white/60 block mt-1">y seña en un click.</span>
            </h2>
            <p className="mt-5 text-white/50 text-base leading-relaxed tracking-[-0.2px] max-w-lg">
              El huésped elige fecha de entrada y salida en un calendario visual. Ve las noches, el precio total y confirma con seña. Sin mensajes, sin idas y vueltas, sin planillas.
            </p>

            <div className="mt-8 space-y-4">
              {[
                'Selección de entrada y salida en calendario visual',
                'Cálculo automático de noches y precio total',
                'Fechas reservadas bloqueadas en tiempo real',
                'Check-in y check-out configurables por propiedad',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check size={18} className="mt-0.5 flex-shrink-0" style={{ color: ACCENT }} />
                  <p className="text-white/60 text-[15px] leading-relaxed">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link
                href="/register?industry=alquiler-temporario"
                className="lv2-glow-btn text-white font-medium px-7 py-3 rounded-[10px] text-sm inline-flex items-center gap-2"
                style={{ backgroundColor: ACCENT }}
              >
                Probar calendario por día
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SHOWCASE 3: CONFIRMACIÓN INSTANTÁNEA
   ═══════════════════════════════════════════════════════ */

function ShowcaseConfirmacionSection() {
  const sectionRef = useScrollReveal();

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-14">
          <SectionTag text="Confirmación" />
          <SectionH2 line1="Reserva confirmada," line2="seña cobrada. Automático." />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            El huésped ve el resumen completo: propiedad, fechas, noches y total. Completa sus datos, paga la seña y la reserva se confirma al instante. Vos no tocás nada.
          </p>
        </div>

        <div className="lv2-mockup-wrapper rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl" style={{ boxShadow: `0 25px 50px -12px ${ACCENT}10` }}>
          <AutoCycleImage images={CONFIRMACION_IMAGES} />
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   FEATURES
   ═══════════════════════════════════════════════════════ */

function FeaturesSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 100);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Funcionalidades" />
          <SectionH2 line1="Todo lo que necesitás" line2="para gestionar tu quinta." />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="lv2-card-stagger lv2-card p-8 hover:bg-[#0A0A0A] transition-colors duration-300"
              >
                <div className="w-12 h-12 rounded-xl lv2-icon-glow flex items-center justify-center mb-6">
                  <Icon size={24} style={{ color: ACCENT }} />
                </div>
                <h3 className="text-white font-medium text-lg tracking-[-0.5px] mb-3">
                  {feat.title}
                </h3>
                <p className="text-white/50 text-[15px] leading-[26px] tracking-[-0.2px]">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   ROI
   ═══════════════════════════════════════════════════════ */

function ROISection() {
  const sectionRef = useScrollReveal();

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[900px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Números" />
          <SectionH2 line1="¿Cuánto perdés en" line2="fines de semana vacíos?" />
          <p className="mt-5 text-white/50 max-w-xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            Cada finde sin reservar es plata que no entra. Con seña automática al reservar, las cancelaciones de último momento desaparecen.
          </p>
        </div>

        <div className="lv2-card p-8 sm:p-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            {/* Sin TurnoLink */}
            <div className="text-center p-7 rounded-xl bg-red-500/[0.04] border border-red-500/[0.08]">
              <p className="text-sm text-red-400/70 font-medium mb-5 tracking-tight">Sin cobro de seña</p>
              <div className="space-y-2 text-white/45 text-sm">
                <p>~3 cancelaciones por mes</p>
                <p>Noche promedio: $40.000</p>
                <p>Estadía promedio: 2 noches</p>
              </div>
              <div className="mt-5 pt-5 border-t border-red-500/[0.08]">
                <p className="text-3xl text-red-400/80 font-normal tracking-[-1.5px]">-$240.000</p>
                <p className="text-xs text-red-400/40 mt-1">perdidos por mes</p>
              </div>
            </div>

            {/* Con TurnoLink */}
            <div className="text-center p-7 rounded-xl bg-[#10B981]/[0.06] border border-[#10B981]/[0.15]">
              <p className="text-sm text-[#10B981] font-medium mb-5 tracking-tight">Con TurnoLink</p>
              <div className="space-y-2 text-white/45 text-sm">
                <p>~0 cancelaciones (-90%)</p>
                <p>Noche promedio: $40.000</p>
                <p>Estadía promedio: 2 noches</p>
              </div>
              <div className="mt-5 pt-5 border-t border-[#10B981]/[0.12]">
                <p className="text-3xl text-[#10B981] font-normal tracking-[-1.5px]">-$0</p>
                <p className="text-xs text-[#10B981]/50 mt-1">perdidos por mes</p>
              </div>
            </div>
          </div>

          {/* ROI Summary */}
          <div className="text-center border-t border-white/[0.06] pt-8">
            <p className="text-white/50 text-sm mb-2">Recuperás</p>
            <p className="text-4xl sm:text-5xl text-white font-normal tracking-[-2px]">
              $240.000<span className="text-lg text-white/30 ml-1">/mes</span>
            </p>
            <p className="text-white/40 text-sm mt-4">
              Plan Profesional: $14.999/mes —{' '}
              <span className="font-medium" style={{ color: ACCENT }}>ROI de 9.6x tu inversión</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   TESTIMONIALS
   ═══════════════════════════════════════════════════════ */

function TestimonialsSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 150);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Resultados" />
          <SectionH2 line1="Lo que dicen quienes" line2="ya gestionan con TurnoLink." />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="lv2-card-stagger lv2-card p-8 flex flex-col">
              <div className="mb-5">
                <span
                  className="inline-flex items-center px-3 py-1 rounded-md border text-xs font-medium"
                  style={{
                    backgroundColor: `${ACCENT}15`,
                    borderColor: `${ACCENT}25`,
                    color: ACCENT,
                  }}
                >
                  {t.metric}
                </span>
              </div>

              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              <p className="text-white/50 text-[15px] leading-[26px] tracking-[-0.2px] flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="border-t border-white/[0.06] pt-4 flex items-center gap-3">
                {t.image && (
                  <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" loading="lazy" />
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
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   PRICING
   ═══════════════════════════════════════════════════════ */

function PricingSection({ tiers }: { tiers: PricingTier[] }) {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 150);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      id="precios"
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Precios" />
          <SectionH2 line1="Planes para propietarios" line2="sin letra chica." />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            14 días de prueba gratuita en todos los planes. Sin tarjeta de crédito. Sin compromiso.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`lv2-card-stagger lv2-card p-8 flex flex-col ${
                tier.popular ? 'lv2-pricing-popular' : ''
              }`}
            >
              {tier.popular && (
                <div className="mb-4">
                  <span
                    className="text-[10px] font-bold text-white px-3 py-1 rounded-md tracking-wide uppercase"
                    style={{ backgroundColor: ACCENT }}
                  >
                    Más elegido
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
                    <Check size={16} className="mt-0.5 flex-shrink-0" style={{ color: ACCENT }} />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/register?industry=alquiler-temporario"
                className={`mt-8 w-full text-center py-3 rounded-[10px] text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  tier.popular
                    ? 'lv2-glow-btn text-white'
                    : 'bg-white/[0.06] text-white/80 hover:bg-white/[0.12] border border-white/[0.08]'
                }`}
                style={tier.popular ? { backgroundColor: ACCENT } : undefined}
              >
                Probar 14 días gratis
                <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-white/25 text-sm mt-10 flex items-center justify-center gap-2">
          <Shield size={14} />
          14 días de prueba en todos los planes. Sin tarjeta de crédito.
        </p>
        <p className="text-center mt-4">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:opacity-80 transition-opacity duration-300"
            style={{ color: ACCENT }}
          >
            ¿Necesitás ayuda para elegir? Hablá con nuestro equipo →
          </a>
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   FAQ
   ═══════════════════════════════════════════════════════ */

function FAQSection() {
  const sectionRef = useScrollReveal();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = useCallback((i: number) => setOpenIdx((prev) => (prev === i ? null : i)), []);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
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
              Respuestas a las dudas más comunes de propietarios de quintas, casas de campo y espacios rurales.
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
                    <p className="text-white/50 text-[15px] leading-[26px] tracking-[-0.2px]">
                      {faq.a}
                    </p>
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

/* ═══════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════ */

interface PricingTier {
  name: string;
  price: string;
  period: string;
  popular?: boolean;
  features: string[];
}

export function CasasQuintaLanding({ dynamicPricing }: { dynamicPricing?: PricingTier[] } = {}) {
  const pricingTiers = dynamicPricing || PRICING_TIERS;
  return (
    <div
      className="min-h-screen bg-black text-white selection:bg-[#D97706]/30 selection:text-white"
      style={{ overflowX: 'clip' }}
    >
      <Navbar />
      <HeroSection />
      <MetricsStrip />
      <PainPointsSection />
      <BeforeAfterSection />
      <ShowcasePropiedadesSection />
      <ShowcaseCalendarioSection />
      <ShowcaseConfirmacionSection />
      <FeaturesSection />
      <ROISection />
      <TestimonialsSection />
      <PricingSection tiers={pricingTiers} />
      <FAQSection />
      <CTASection
        headline="Tu quinta merece un sistema profesional"
        subtitle="empezá en 10 minutos."
        description="Probá TurnoLink 14 días gratis. Cargá tus propiedades, configurá precios por temporada y empezá a recibir reservas con cobro automático de seña."
        accent={ACCENT}
      />
      <Footer />
    </div>
  );
}
