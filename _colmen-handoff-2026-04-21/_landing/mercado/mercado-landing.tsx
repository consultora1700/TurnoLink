'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Check,
  Shield,
  Zap,
  Globe,
  Star,
  ShoppingBag,
  CreditCard,
  Users,
  Building2,
  Bell,
  BarChart3,
  Share2,
  TrendingUp,
  Package,
  Tag,
  Smartphone,
  MessageCircle,
  Search,
  Eye,
  Boxes,
  AlertTriangle,
  ImageIcon,
  Truck,
  Percent,
  ShoppingCart,
  Palette,
  Paintbrush,
  Layout,
  Type,
  CircleDot,
  ToggleRight,
  type LucideIcon,
} from 'lucide-react';
import { useScrollReveal, useStaggerReveal, useImageReveal } from '../_components/hooks';
import { SectionTag, SectionH2, WordReveal, WHATSAPP_URL } from '../_components/ui';
import { Navbar } from '../_components/navbar';
import { Footer } from '../_components/footer';
import { CTASection } from '../_components/cta-section';

/* ═══════════════════════════════════════════════════════
   DATA CONSTANTS
   ═══════════════════════════════════════════════════════ */

const ACCENT = '#F59E0B'; // Amber — identidad visual Mercado

const PAIN_POINTS = [
  {
    emoji: '📱',
    title: 'Vendés por WhatsApp y perdés plata',
    desc: 'Cada "¿precio?" es un mensaje que contestás a mano. Mientras respondés uno, se van tres. No tenés catálogo, tenés un chat infinito que no escala.',
  },
  {
    emoji: '🔍',
    title: 'Dependés de plataformas que no son tuyas',
    desc: 'Instagram cambia el algoritmo y tus ventas caen. MercadoLibre te cobra comisión. No tenés tu propia tienda, tenés alquiler digital sin control.',
  },
  {
    emoji: '📦',
    title: 'Vendés sin saber qué tenés',
    desc: 'Stock en un cuaderno, precios en un Excel y fotos en el carrete. Vendés lo que no tenés, perdés lo que sí. Un negocio no se maneja así.',
  },
];

const BEFORE_ITEMS = [
  { time: '08:00', text: '27 mensajes sin leer: "¿precio?", "¿tenés en M?", "¿hacés envíos?"' },
  { time: '09:30', text: 'Reenviás la misma foto por sexta vez. Cada cliente es una conversación entera' },
  { time: '11:00', text: 'Tres formas de pago distintas. Una transferencia que nunca llega' },
  { time: '14:00', text: 'Vendiste lo que no tenías. El cliente se enoja. Perdiste la venta y la reputación' },
  { time: '18:00', text: '¿Cuánto vendiste hoy? No sabés. ¿Qué reponer? Tampoco' },
  { time: '22:00', text: 'Desde el sillón seguís contestando "¿precio?" mientras tu competencia vende en automático' },
];

const AFTER_ITEMS = [
  { time: '08:00', text: '4 consultas nuevas con producto, variante y datos del cliente. Sin tocar el celular' },
  { time: '09:30', text: 'Tu tienda muestra fotos, precios, stock y ofertas. Se responde sola' },
  { time: '11:00', text: 'Un cliente compró y pagó con Mercado Pago. La plata ya está en tu cuenta' },
  { time: '14:00', text: 'El stock se actualizó solo. Lo agotado se marca automáticamente' },
  { time: '18:00', text: 'Dashboard: $47.500 vendidos hoy, 3 productos a reponer, 12 clientes nuevos' },
  { time: '22:00', text: 'Tu tienda sigue abierta vendiendo. Vos dormís tranquilo' },
];

const HOW_IT_WORKS = [
  {
    num: '01',
    icon: Package,
    title: 'Cargá tus productos',
    desc: 'Fotos, precios, variantes, stock. Organizá por categorías. En 10 minutos tenés una tienda que vende sola.',
  },
  {
    num: '02',
    icon: Share2,
    title: 'Compartí un solo link',
    desc: 'Pegalo en tu bio de Instagram, estado de WhatsApp, Google y donde quieras. Un link = tu tienda entera.',
  },
  {
    num: '03',
    icon: MessageCircle,
    title: 'Elegí cómo vender',
    desc: 'Modo Catálogo: el cliente ve, elige y te escribe por WhatsApp. Modo Tienda: agrega al carrito, paga online y vos recibís la orden. Sin intermediarios.',
  },
];

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: ShoppingBag,
    title: 'Tu tienda, tu marca',
    desc: 'Productos con fotos profesionales, precios, variantes (talle, color, modelo), categorías y descripción. Una tienda real con tu dominio.',
  },
  {
    icon: MessageCircle,
    title: 'Modo Catálogo → WhatsApp',
    desc: 'Ideal para arrancar. Tu cliente ve el producto, toca "Consultar" y le llega un WhatsApp prellenado con nombre, precio y foto. Vos cerrás la venta.',
  },
  {
    icon: ShoppingCart,
    title: 'Modo Tienda → Carrito + Checkout',
    desc: 'Para escalar. Tu cliente agrega al carrito, elige variantes, aplica cupones y paga con Mercado Pago. Vos recibís la orden lista para despachar.',
  },
  {
    icon: CreditCard,
    title: 'Cobrás al instante, sin comisión',
    desc: 'Checkout con Mercado Pago integrado. Tarjeta, transferencia o QR. La plata va directo a tu cuenta. Sin intermediarios, sin comisiones de plataforma.',
  },
  {
    icon: Boxes,
    title: 'Stock que se gestiona solo',
    desc: 'Cada venta descuenta stock automáticamente. Por variante (talle S azul ≠ talle M rojo). Lo agotado se oculta. Sin errores, sin reclamos.',
  },
  {
    icon: Palette,
    title: 'Branding 100% personalizable',
    desc: 'Logo, colores, banner, tipografía, estilo de cards, hero y dark mode. Tu tienda se ve como tu marca, no como un template genérico.',
  },
  {
    icon: Tag,
    title: 'Promociones que generan urgencia',
    desc: 'Precio tachado, cupones por porcentaje o monto fijo, ofertas por tiempo limitado. Herramientas de conversión reales.',
  },
  {
    icon: Users,
    title: 'CRM de clientes integrado',
    desc: 'Cada consulta y compra queda registrada. Sabés quién compra, qué compra y cuándo. Datos para fidelizar y hacer remarketing.',
  },
  {
    icon: BarChart3,
    title: 'Métricas para tomar decisiones',
    desc: 'Productos más vendidos, ticket promedio, ingresos por período, clientes nuevos vs recurrentes. Dashboard con los números que importan.',
  },
  {
    icon: ImageIcon,
    title: 'Fotos que venden',
    desc: 'Hasta 10 fotos por producto en alta resolución. Carrusel, zoom y galería. En e-commerce la imagen ES el producto.',
  },
  {
    icon: Bell,
    title: 'Nunca perdés una venta',
    desc: 'Notificación instantánea por WhatsApp y email en cada consulta, compra o stock bajo. Respondés rápido, vendés más.',
  },
  {
    icon: Smartphone,
    title: '85% de tus clientes compran desde el celular',
    desc: 'Tu tienda es mobile-first. Carga rápida, navegación fluida y checkout optimizado para pantallas chicas. Donde está tu cliente, está tu tienda.',
  },
];

const SUB_INDUSTRIES = [
  { name: 'Ropa y accesorios', slug: 'ropa-y-accesorios' },
  { name: 'Inmobiliarias', slug: 'inmobiliarias' },
  { name: 'Alimentos y bebidas', slug: 'alimentos-y-bebidas' },
  { name: 'Cosméticos', slug: 'cosmeticos' },
  { name: 'Artesanías', slug: 'artesanias' },
  { name: 'Joyería y bijouterie', slug: 'joyeria' },
  { name: 'Electrónica', slug: 'electronica' },
  { name: 'Decoración y hogar', slug: 'decoracion' },
  { name: 'Productos naturales', slug: 'productos-naturales' },
  { name: 'Juguetería', slug: 'jugueteria' },
  { name: 'Librería y papelería', slug: 'libreria' },
  { name: 'Indumentaria deportiva', slug: 'indumentaria-deportiva' },
];

const TESTIMONIALS = [
  {
    quote:
      'Vendía solo por Instagram y contestaba "¿precio?" 40 veces al día. Armé el catálogo en una tarde y las consultas por WhatsApp se triplicaron. Ahora vendo mientras duermo, literal.',
    name: 'Camila Rodríguez',
    role: 'Fundadora',
    business: 'Alma Indumentaria',
    metric: '3x consultas',
    image: 'https://randomuser.me/api/portraits/women/10.jpg',
  },
  {
    quote:
      '120 propiedades publicadas. Antes mandaba PDFs que nadie abría. Ahora el cliente filtra, ve fotos y nos contacta ya decidido. El cierre subió 45% porque llegan calientes, no fríos.',
    name: 'Martín Herrera',
    role: 'Director comercial',
    business: 'Herrera Propiedades',
    metric: '+45% cierres',
    image: 'https://randomuser.me/api/portraits/men/10.jpg',
  },
  {
    quote:
      'Hago tortas por encargo. Antes mandaba fotos una por una y perdía pedidos. Ahora mis clientas entran al catálogo, eligen, y me escriben con el pedido armado. Me ahorro 5 horas por semana.',
    name: 'Lucía Fernández',
    role: 'Emprendedora',
    business: 'Dulce Lucía — Pastelería',
    metric: '5hs/semana ahorradas',
    image: 'https://randomuser.me/api/portraits/women/11.jpg',
  },
  {
    quote:
      'Empecé con Vitrina gratis para la bijouterie. A las dos semanas activé Mercado Pago y las ventas online explotaron. El stock se descuenta solo. Es otro mundo.',
    name: 'Valentina Suárez',
    role: 'Dueña',
    business: 'Violeta Accesorios',
    metric: '+60% ventas online',
    image: 'https://randomuser.me/api/portraits/women/12.jpg',
  },
];

const PRICING_TIERS = [
  {
    name: 'Vitrina',
    price: 'Gratis',
    period: '',
    popular: false,
    features: [
      'Catálogo con consulta WhatsApp',
      '15 productos publicados',
      '30 consultas por mes',
      '1 vendedor',
      '50 clientes',
      'Branding: logo, colores, banner',
      'Link personalizado',
      'Categorías y variantes',
      'Reportes básicos',
    ],
  },
  {
    name: 'Comercio',
    price: '$9.990',
    period: '/mes',
    popular: true,
    features: [
      'Catálogo + cobro por producto',
      '50 productos publicados',
      'Ventas ilimitadas',
      'Hasta 3 vendedores',
      '500 clientes',
      'Mercado Pago / Transferencia / Efectivo',
      'Gestión de stock + alertas',
      'Reportes avanzados + finanzas',
      'SEO personalizado',
      'Portal de empleados',
      'Soporte por WhatsApp',
    ],
  },
  {
    name: 'Tienda Pro',
    price: '$19.990',
    period: '/mes',
    popular: false,
    features: [
      'Todo de Comercio',
      'E-commerce completo con carrito',
      'Productos ilimitados',
      'Vendedores ilimitados',
      'Clientes ilimitados',
      'Cupones y descuentos',
      'Opciones de envío',
      'Multi-sucursal',
      'Reportes completos + CSV',
      'API e integraciones',
      'Soporte prioritario 24/7',
    ],
  },
];

// FAQs moved to ./mercado-faqs.ts for server component compatibility
import { MERCADO_FAQS } from './mercado-faqs';
export { MERCADO_FAQS };

/* Product catalog visual data */
const CATALOG_PRODUCTS = [
  { name: 'Remera Oversize Algodón', price: '$18.500', stock: 24, img: '👕', category: 'Ropa' },
  { name: 'Collar Piedra Natural', price: '$12.900', stock: 8, img: '📿', category: 'Accesorios' },
  { name: 'Vela Aromática Soja', price: '$8.500', stock: 0, img: '🕯️', category: 'Deco' },
  { name: 'Bolso Cuero Artesanal', price: '$45.000', stock: 3, img: '👜', category: 'Accesorios' },
  { name: 'Mermelada Casera Frutos Rojos', price: '$4.200', stock: 15, img: '🫙', category: 'Alimentos' },
  { name: 'Sérum Facial Vitamina C', price: '$22.000', stock: 12, img: '✨', category: 'Cosmética' },
];

const STOCK_TIMELINE = [
  { day: 'Lun', sold: 8, stock: 42 },
  { day: 'Mar', sold: 5, stock: 37 },
  { day: 'Mié', sold: 12, stock: 25 },
  { day: 'Jue', sold: 3, stock: 22 },
  { day: 'Vie', sold: 15, stock: 7 },
  { day: 'Sáb', sold: 4, stock: 3 },
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
   HERO
   ═══════════════════════════════════════════════════════ */

function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center pt-28 lg:pt-32 pb-12 px-5 lg:px-10 overflow-hidden">
      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[#F59E0B]/[0.07] blur-[140px] lv2-glow-orb pointer-events-none" />
      <div
        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[#D97706]/[0.04] blur-[120px] lv2-glow-orb pointer-events-none"
        style={{ animationDelay: '3s' }}
      />

      <div className="max-w-[900px] mx-auto w-full relative z-10 text-center">
        <div className="mb-8">
          <span className="lv2-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm text-white/80">
            <ShoppingBag size={14} className="text-[#F59E0B]" />
            {'E-commerce & Catálogos Online'}
          </span>
        </div>

        <h1 className="text-[9vw] sm:text-[48px] lg:text-[60px] xl:text-[72px] font-normal leading-[1.05] tracking-[-2px] lg:tracking-[-3px] mb-6">
          <span className="text-white block">{'Tu tienda online lista'}</span>
          <span className="text-white/60 block mt-1">{'en minutos, no en meses.'}</span>
        </h1>

        <p className="text-base sm:text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed tracking-[-0.2px]">
          <WordReveal text="Subí tus productos, personalizá tu tienda y empezá a vender hoy. Modo Catálogo para vender por WhatsApp. Modo Tienda con carrito, stock y cobro automático con Mercado Pago. Sin código, sin comisiones, sin intermediarios." />
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link
            href="/register?industry=mercado"
            className="lv2-glow-btn bg-[#F59E0B] text-black font-medium px-8 py-3.5 rounded-[10px] text-base flex items-center gap-2"
          >
            {'Crear mi tienda gratis'}
            <ArrowRight size={18} />
          </Link>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="lv2-glass text-white/80 font-medium px-8 py-3.5 rounded-[10px] text-base flex items-center gap-2"
          >
            {'Ver tienda demo'}
            <ArrowRight size={16} />
          </a>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-white/40 mb-14">
          <span className="flex items-center gap-1.5">
            <Zap size={14} className="text-[#F59E0B]" /> {'Online en 10 minutos'}
          </span>
          <span className="flex items-center gap-1.5">
            <Shield size={14} className="text-[#F59E0B]" /> {'0% comisión por venta'}
          </span>
          <span className="flex items-center gap-1.5">
            <CreditCard size={14} className="text-[#F59E0B]" /> {'Cobro directo a tu Mercado Pago'}
          </span>
        </div>

        {/* Product mockup — dashboard screenshot */}
        <div className="relative max-w-4xl mx-auto">
          <div className="lv2-mockup-wrapper relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-[#F59E0B]/10">
            <Image
              src="/mockups/dashboard-dark.webp"
              alt="Dashboard de gestión de catálogo y ventas"
              width={900}
              height={560}
              className="w-full h-auto"
              priority
            />
          </div>
          {/* Floating metric badge */}
          <div className="absolute -bottom-5 left-4 lg:-left-5 bg-black/90 backdrop-blur-xl border border-white/[0.1] rounded-xl px-5 py-3.5 flex items-center gap-3 shadow-xl">
            <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center">
              <TrendingUp size={18} className="text-green-400" />
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-medium">{'+60% consultas'}</p>
              <p className="text-white/40 text-xs">{'Vs. vender solo por redes'}</p>
            </div>
          </div>
          {/* Stock badge */}
          <div className="absolute -top-3 right-4 lg:-right-3 bg-black/90 backdrop-blur-xl border border-white/[0.1] rounded-xl px-5 py-3.5 flex items-center gap-3 shadow-xl">
            <div className="w-9 h-9 rounded-full bg-[#F59E0B]/20 flex items-center justify-center">
              <Package size={18} className="text-[#F59E0B]" />
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-medium">{'Stock en tiempo real'}</p>
              <p className="text-white/40 text-xs">{'Actualización automática'}</p>
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
  const c1 = useCountUp(60, 2000);
  const c2 = useCountUp(300, 2500);
  const c3 = useCountUp(15, 2000);
  const c4 = useCountUp(85, 2000);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-14 border-y border-white/[0.04] bg-white/[0.01]"
    >
      <div className="max-w-[1200px] mx-auto px-5 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-4">
          <div ref={c1.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              +{c1.count}<span className="text-[#F59E0B]">{'%'}</span>
            </p>
            <p className="text-sm text-white/40 mt-2">{'Ventas vs WhatsApp solo'}</p>
          </div>
          <div ref={c2.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              +{c2.count}
            </p>
            <p className="text-sm text-white/40 mt-2">{'Negocios activos'}</p>
          </div>
          <div ref={c3.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              +{c3.count}K
            </p>
            <p className="text-sm text-white/40 mt-2">{'Productos publicados'}</p>
          </div>
          <div ref={c4.ref} className="text-center">
            <p className="text-3xl lg:text-[44px] font-normal text-white tracking-[-2px]">
              {c4.count}<span className="text-[#F59E0B]">{'%'}</span>
            </p>
            <p className="text-sm text-white/40 mt-2">{'Navegan desde el celular'}</p>
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
          <SectionH2 line1="¿Te suena familiar?" line2="No estás solo/a." />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PAIN_POINTS.map((item, i) => (
            <div
              key={i}
              className="lv2-card-stagger lv2-card p-8 hover:bg-[#0A0A0A] transition-colors duration-300 text-center"
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
          <SectionH2 line1="Tu día vendiendo," line2="antes y después." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ANTES */}
          <div className="lv2-card p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.03] to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-3 h-3 rounded-full bg-red-500/60 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                <h3 className="text-white/80 font-medium text-lg tracking-[-0.5px]">{'Sin TurnoLink'}</h3>
              </div>
              <div className="space-y-5">
                {BEFORE_ITEMS.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="text-xs text-red-400/50 font-mono mt-0.5 w-12 flex-shrink-0 tabular-nums">
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
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-3 h-3 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                <h3 className="text-white/80 font-medium text-lg tracking-[-0.5px]">{'Con TurnoLink'}</h3>
              </div>
              <div className="space-y-5">
                {AFTER_ITEMS.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="text-xs text-[#10B981]/70 font-mono mt-0.5 w-12 flex-shrink-0 tabular-nums">
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
   HOW IT WORKS
   ═══════════════════════════════════════════════════════ */

function HowItWorksSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 200);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Cómo funciona" />
          <SectionH2 line1="Empezá en 3 pasos." line2="Sin complicaciones." />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="lv2-card-stagger lv2-card p-8 relative overflow-hidden"
              >
                <span className="absolute top-4 right-6 text-[#F59E0B]/[0.08] text-7xl font-bold leading-none pointer-events-none select-none">
                  {step.num}
                </span>
                <div className="relative z-10 text-center">
                  <div className="w-12 h-12 rounded-xl lv2-icon-glow flex items-center justify-center mb-6 mx-auto" style={{ background: 'rgba(245,158,11,0.08)', boxShadow: '0 0 20px rgba(245,158,11,0.1)' }}>
                    <Icon size={24} className="text-[#F59E0B]" />
                  </div>
                  <h3 className="text-white font-medium text-lg tracking-[-0.5px] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-white/50 text-[15px] leading-[26px] tracking-[-0.2px]">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mockup row */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <Image
              src="/mockups/booking-services-dark.webp"
              alt="Catálogo de productos con fotos y precios"
              width={400}
              height={260}
              className="w-full h-auto"
            />
            <div className="p-3 bg-white/[0.02]">
              <p className="text-white/50 text-xs text-center">{'Paso 1 — Subí tus productos'}</p>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <Image
              src="/mockups/flow-01-portada.webp"
              alt="Página pública del catálogo"
              width={400}
              height={260}
              className="w-full h-auto"
            />
            <div className="p-3 bg-white/[0.02]">
              <p className="text-white/50 text-xs text-center">{'Paso 2 — Tu catálogo online listo'}</p>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-white/[0.06]">
            <Image
              src="/mockups/dashboard-dark.webp"
              alt="Dashboard con ventas y métricas"
              width={400}
              height={260}
              className="w-full h-auto"
            />
            <div className="p-3 bg-white/[0.02]">
              <p className="text-white/50 text-xs text-center">{'Paso 3 — Controlá ventas y stock'}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   DOS FORMAS DE VENDER — Modo Catálogo vs Modo Tienda
   ═══════════════════════════════════════════════════════ */

function TwoModesSection() {
  const sectionRef = useScrollReveal();

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Dos formas de vender" />
          <SectionH2 line1="Vos elegís cómo" line2="llegan tus ventas." />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            {'Arrancá con consultas por WhatsApp. Cuando estés listo, activá el carrito con Mercado Pago. Cambiá de modo en cualquier momento con un solo click.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Modo Catálogo */}
          <div className="lv2-card p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#25D366]/[0.03] to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(37,211,102,0.1)', boxShadow: '0 0 24px rgba(37,211,102,0.12)' }}>
                  <MessageCircle size={24} className="text-[#25D366]" />
                </div>
                <div>
                  <h3 className="text-white font-medium text-xl tracking-[-0.5px]">{'Modo Catálogo'}</h3>
                  <p className="text-[#25D366]/70 text-sm">{'Consultas por WhatsApp'}</p>
                </div>
              </div>

              <p className="text-white/50 text-[15px] leading-[26px] mb-6">
                {'Tu cliente navega tu catálogo, ve fotos, precios y stock. Cuando le interesa un producto, toca '}
                <span className="text-[#25D366] font-medium">{'"Consultar por WhatsApp"'}</span>
                {' y te llega un mensaje prellenado con el producto seleccionado. Vos cerrás la venta como quieras: transferencia, efectivo o link de pago.'}
              </p>

              <div className="space-y-3 mb-6">
                {[
                  'Ideal para quienes ya venden por WhatsApp',
                  'Sin comisiones — la venta se cierra entre vos y tu cliente',
                  'Tu cliente elige, vos contestás cuando podés',
                  'Mensaje automático con nombre del producto y precio',
                  'Perfecto para productos personalizados o a medida',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <Check size={16} className="text-[#25D366] mt-0.5 flex-shrink-0" />
                    <span className="text-white/60 text-sm">{item}</span>
                  </div>
                ))}
              </div>

              {/* Visual: simulated WhatsApp message */}
              <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3 text-center">{'Así le llega tu consulta'}</p>
                <div className="bg-[#25D366]/[0.06] border border-[#25D366]/[0.12] rounded-xl px-4 py-3">
                  <p className="text-white/70 text-[13px] leading-relaxed">
                    {'Hola! Me interesa el '}
                    <span className="font-medium text-white">{'Bolso Cuero Artesanal'}</span>
                    {' ($45.000). ¿Tenés disponible? Vi que quedan 3 unidades en tu catálogo.'}
                  </p>
                  <p className="text-white/30 text-[10px] mt-2">{'turnolink.com.ar/mi-tienda — Mensaje automático'}</p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <span className="inline-flex items-center px-4 py-2 rounded-lg bg-[#25D366]/[0.08] border border-[#25D366]/[0.15] text-sm text-[#25D366] font-medium">
                  {'Disponible en todos los planes'}
                </span>
              </div>
            </div>
          </div>

          {/* Modo Tienda */}
          <div className="lv2-card p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#F59E0B]/[0.03] to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)', boxShadow: '0 0 24px rgba(245,158,11,0.12)' }}>
                  <ShoppingCart size={24} className="text-[#F59E0B]" />
                </div>
                <div>
                  <h3 className="text-white font-medium text-xl tracking-[-0.5px]">{'Modo Tienda'}</h3>
                  <p className="text-[#F59E0B]/70 text-sm">{'Carrito + Mercado Pago'}</p>
                </div>
              </div>

              <p className="text-white/50 text-[15px] leading-[26px] mb-6">
                {'Tu cliente agrega productos al carrito, selecciona cantidades y variantes, y paga directo con '}
                <span className="text-[#F59E0B] font-medium">{'Mercado Pago'}</span>
                {'. Vos recibís la orden confirmada con el pago acreditado. El stock se descuenta solo. Email de confirmación automático para ambos.'}
              </p>

              <div className="space-y-3 mb-6">
                {[
                  'Carrito de compras con múltiples productos',
                  'Checkout con Mercado Pago (tarjetas, débito, transferencia)',
                  'Stock se descuenta automáticamente al confirmar pago',
                  'Email de confirmación al comprador y al vendedor',
                  'Historial de órdenes y estado de cada venta',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <Check size={16} className="text-[#F59E0B] mt-0.5 flex-shrink-0" />
                    <span className="text-white/60 text-sm">{item}</span>
                  </div>
                ))}
              </div>

              {/* Visual: simulated cart */}
              <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3 text-center">{'Así se ve el carrito'}</p>
                <div className="space-y-2">
                  {[
                    { name: 'Remera Oversize — Talle M', qty: 2, price: '$37.000' },
                    { name: 'Collar Piedra Natural', qty: 1, price: '$12.900' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-white/[0.02] rounded-lg border border-white/[0.04]">
                      <div className="flex items-center gap-3">
                        <span className="text-white/60 text-[13px]">{item.name}</span>
                        <span className="text-white/30 text-[11px]">{'x'}{item.qty}</span>
                      </div>
                      <span className="text-white/80 text-[13px] font-medium">{item.price}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-3 pt-3 border-t border-white/[0.06]">
                    <span className="text-white/50 text-sm font-medium">{'Total'}</span>
                    <span className="text-[#F59E0B] text-lg font-medium">{'$49.900'}</span>
                  </div>
                  <div className="pt-2">
                    <div className="w-full py-2.5 rounded-lg bg-[#009EE3] text-white text-center text-sm font-medium flex items-center justify-center gap-2">
                      <CreditCard size={16} />
                      {'Pagar con Mercado Pago'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <span className="inline-flex items-center px-4 py-2 rounded-lg bg-[#F59E0B]/[0.08] border border-[#F59E0B]/[0.15] text-sm text-[#F59E0B] font-medium">
                  {'Desde plan Comercio'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle callout */}
        <div className="mt-8 lv2-card p-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
          <div className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0">
            <ToggleRight size={22} className="text-[#F59E0B]" />
          </div>
          <div>
            <p className="text-white font-medium text-base tracking-[-0.3px]">
              {'Cambiá de modo cuando quieras'}
            </p>
            <p className="text-white/45 text-sm mt-1">
              {'Arrancá con Modo Catálogo y pasá a Modo Tienda con un click. Sin perder productos, clientes ni configuración. También podés tener ambos activos al mismo tiempo: algunos productos con WhatsApp, otros con carrito.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   FEATURES (12 cards)
   ═══════════════════════════════════════════════════════ */

function FeaturesSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 80);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Funcionalidades" />
          <SectionH2 line1="Todo lo que necesitás" line2="para vender más." />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            {'No es solo un catálogo. Es una plataforma de gestión integral que digitaliza tu negocio, automatiza tu stock y potencia tus ventas.'}
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="lv2-card-stagger lv2-card p-7 hover:bg-[#0A0A0A] transition-colors duration-300 text-center"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 mx-auto" style={{ background: 'rgba(245,158,11,0.08)', boxShadow: '0 0 20px rgba(245,158,11,0.1)' }}>
                  <Icon size={22} className="text-[#F59E0B]" />
                </div>
                <h3 className="text-white font-medium text-[15px] tracking-[-0.3px] mb-2">
                  {feat.title}
                </h3>
                <p className="text-white/45 text-[13px] leading-[22px] tracking-[-0.1px]">
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
   CATALOG PREVIEW — Visual product cards
   ═══════════════════════════════════════════════════════ */

function CatalogPreviewSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 100);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Así se ve tu catálogo" />
          <SectionH2 line1="Profesional, limpio" line2="y listo para vender." />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            {'Cada producto con su foto, precio, stock y botón de acción — WhatsApp o carrito, según tu modo. Tu cliente elige sin preguntarte.'}
          </p>
        </div>

        {/* Simulated catalog */}
        <div className="max-w-4xl mx-auto">
          {/* Browser chrome */}
          <div className="bg-[#0D0D0D] px-4 py-3 flex items-center gap-2 border border-white/[0.06] border-b-0 rounded-t-xl">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex-1 mx-8">
              <div className="bg-white/[0.05] rounded-md h-6 max-w-xs mx-auto flex items-center justify-center">
                <span className="text-[11px] text-white/30 tracking-tight">
                  turnolink.com.ar/mi-tienda
                </span>
              </div>
            </div>
          </div>

          {/* Product grid */}
          <div ref={cardsRef} className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-6 bg-[#080808] border border-white/[0.06] border-t-0 rounded-b-xl">
            {CATALOG_PRODUCTS.map((product, i) => (
              <div
                key={i}
                className="lv2-card-stagger rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden hover:border-[#F59E0B]/20 transition-all duration-300"
              >
                {/* Image placeholder */}
                <div className="aspect-square bg-gradient-to-br from-white/[0.04] to-white/[0.01] flex items-center justify-center relative">
                  <span className="text-4xl sm:text-5xl">{product.img}</span>
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-[10px] sm:text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded">
                        {'Agotado'}
                      </span>
                    </div>
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <div className="absolute top-2 right-2">
                      <span className="text-[9px] sm:text-[10px] font-medium text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/20 px-1.5 py-0.5 rounded">
                        {'Quedan '}{product.stock}
                      </span>
                    </div>
                  )}
                </div>
                {/* Product info */}
                <div className="p-3 sm:p-4">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{product.category}</p>
                  <h4 className="text-white/80 text-xs sm:text-sm font-medium truncate mb-1.5">{product.name}</h4>
                  <p className="text-[#F59E0B] font-medium text-sm sm:text-base">{product.price}</p>
                  {/* Alternate between WhatsApp and Cart buttons to show both modes */}
                  {i % 2 === 0 ? (
                    <button className="mt-3 w-full text-[10px] sm:text-xs py-1.5 sm:py-2 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] font-medium hover:bg-[#25D366]/20 transition-colors flex items-center justify-center gap-1">
                      <MessageCircle size={12} />
                      {'Consultar'}
                    </button>
                  ) : (
                    <button className="mt-3 w-full text-[10px] sm:text-xs py-1.5 sm:py-2 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] font-medium hover:bg-[#F59E0B]/20 transition-colors flex items-center justify-center gap-1">
                      <ShoppingCart size={12} />
                      {'Agregar al carrito'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   STOCK MANAGEMENT VISUAL
   ═══════════════════════════════════════════════════════ */

function StockManagementSection() {
  const sectionRef = useScrollReveal();

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Control total" />
          <SectionH2 line1="Stock y ventas" line2="en tiempo real." />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            {'Sabé qué tenés, qué vendiste y qué tenés que reponer. Sin planillas, sin contar a mano.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock Timeline */}
          <div className="lv2-card p-6 sm:p-8 relative overflow-hidden">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.08)', boxShadow: '0 0 20px rgba(245,158,11,0.1)' }}>
                <BarChart3 size={20} className="text-[#F59E0B]" />
              </div>
              <div>
                <h3 className="text-white font-medium text-lg tracking-[-0.5px]">{'Movimiento de stock'}</h3>
                <p className="text-white/40 text-xs">{'Visualizá ventas y stock disponible por día'}</p>
              </div>
            </div>

            {/* Mini bar chart */}
            <div className="space-y-3">
              {STOCK_TIMELINE.map((day) => (
                <div key={day.day} className="flex items-center gap-3">
                  <span className="w-8 text-[11px] text-white/40 font-mono flex-shrink-0">{day.day}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-5 rounded-[3px] bg-white/[0.03] overflow-hidden relative">
                      <div
                        className="h-full rounded-[3px] bg-gradient-to-r from-[#F59E0B]/40 to-[#F59E0B]"
                        style={{ width: `${(day.sold / 15) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-[#F59E0B] font-mono w-6 text-right">{day.sold}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] font-mono w-8 text-right ${day.stock <= 5 ? 'text-red-400' : 'text-white/40'}`}>
                      {day.stock}
                    </span>
                    {day.stock <= 5 && (
                      <AlertTriangle size={10} className="text-red-400" />
                    )}
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-end gap-4 mt-3 text-[10px] text-white/30">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-[#F59E0B]/60" /> {'Vendidos'}
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-white/40 font-mono">{'N'}</span> {'Stock'}
                </span>
                <span className="flex items-center gap-1">
                  <AlertTriangle size={8} className="text-red-400" /> {'Stock bajo'}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
              <p className="text-white/40 text-[13px] leading-relaxed">
                <span className="text-[#F59E0B] font-medium">{'Alerta:'}</span>
                {' El viernes vendiste 15 unidades y el sábado te quedaron solo 3. Reponé antes del próximo viernes.'}
              </p>
            </div>
          </div>

          {/* Right column: WhatsApp + Promos */}
          <div className="space-y-6">
            {/* WhatsApp Integration */}
            <div className="lv2-card p-6 sm:p-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(37,211,102,0.08)', boxShadow: '0 0 20px rgba(37,211,102,0.1)' }}>
                  <MessageCircle size={20} className="text-[#25D366]" />
                </div>
                <div>
                  <h3 className="text-white font-medium text-lg tracking-[-0.5px]">{'WhatsApp integrado'}</h3>
                  <p className="text-white/40 text-xs">{'Tu cliente te escribe con el producto ya seleccionado'}</p>
                </div>
              </div>

              {/* Simulated WhatsApp messages */}
              <div className="space-y-2.5">
                {[
                  { from: 'cliente', text: 'Hola, me interesa el Bolso Cuero Artesanal ($45.000). ¿Tenés disponible?' },
                  { from: 'vos', text: '¡Hola! Sí, me quedan 3 unidades. ¿Lo querés en marrón o negro?' },
                  { from: 'cliente', text: 'Marrón. ¿Hacés envíos al interior?' },
                ].map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.from === 'vos' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-2.5 rounded-xl text-[13px] leading-relaxed ${
                        msg.from === 'vos'
                          ? 'bg-[#25D366]/10 border border-[#25D366]/15 text-white/70'
                          : 'bg-white/[0.04] border border-white/[0.06] text-white/60'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-white/35 text-[13px] text-center">
                {'El mensaje se genera automático con el nombre del producto, precio y stock. Vos solo cerrás la venta.'}
              </p>
            </div>

            {/* Promotion example */}
            <div className="lv2-card p-6 sm:p-8">
              <div className="flex items-center justify-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.08)', boxShadow: '0 0 20px rgba(245,158,11,0.1)' }}>
                  <Percent size={20} className="text-[#F59E0B]" />
                </div>
                <div>
                  <h3 className="text-white font-medium text-lg tracking-[-0.5px]">{'Promociones inteligentes'}</h3>
                  <p className="text-white/40 text-xs">{'Precio tachado + urgencia = más ventas'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { title: 'Liquidación Verano', original: '$18.500', promo: '$12.500', badge: 'Quedan 8' },
                  { title: 'Lanzamiento', original: '$22.000', promo: '$16.990', badge: 'Solo 20 uds' },
                ].map((p, i) => (
                  <div key={i} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-4 text-center">
                    <h4 className="text-white/80 text-xs font-medium mb-1">{p.title}</h4>
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#F59E0B]/[0.12] border border-[#F59E0B]/[0.2] text-[10px] text-[#F59E0B] font-medium mb-2">
                      {p.badge}
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-white/30 line-through text-xs">{p.original}</span>
                      <span className="text-[#10B981] font-medium text-sm">{p.promo}</span>
                    </div>
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
   BRANDED PAGE
   ═══════════════════════════════════════════════════════ */

function BrandedPageSection() {
  const sectionRef = useScrollReveal();
  const imgRef = useImageReveal();
  const cardsRef = useStaggerReveal('.lv2-brand-card', 100);

  const brandingFeatures = [
    { icon: Palette, title: 'Colores de tu marca', desc: 'Elegí tus colores primario y secundario. Toda la tienda se adapta: botones, links, badges y acentos. Identidad visual consistente.' },
    { icon: ImageIcon, title: 'Logo y banner', desc: 'Subí tu logo y un banner principal. Se muestran en la portada de tu tienda y en los emails que reciben tus clientes.' },
    { icon: Type, title: 'Textos personalizados', desc: 'Nombre de tu negocio, descripción, slogan, redes sociales, horarios de atención y datos de contacto. Todo editable.' },
    { icon: Globe, title: 'Link personalizado', desc: 'turnolink.com.ar/tu-negocio — un link profesional, fácil de recordar y compartir en redes, tarjetas y donde quieras.' },
    { icon: Layout, title: 'Diseño de catálogo', desc: 'Elegí cómo se ven tus productos: grilla de 2 o 3 columnas, vista lista, con o sin precio visible. Adaptado a tu estilo.' },
    { icon: Star, title: 'Reseñas y confianza', desc: 'Tus clientes dejan opiniones verificadas. Las reseñas reales generan la confianza que convierte visitantes en compradores.' },
  ];

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Tu marca, tu tienda" />
          <SectionH2 line1="Branding profesional" line2="que vende por vos." />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            {'No es un listado genérico. Es tu propia tienda online con tu identidad visual: logo, colores, banner y estilo. Los negocios con branding propio reciben '}
            <span className="text-white font-medium">{'3x más consultas'}</span>
            {' que los que solo venden por redes sociales.'}
          </p>
        </div>

        {/* Branding feature cards */}
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {brandingFeatures.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="lv2-brand-card lv2-card p-6 text-center hover:bg-[#0A0A0A] transition-colors duration-300">
                <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center mx-auto mb-4">
                  <Icon size={18} className="text-[#F59E0B]" />
                </div>
                <p className="text-white font-medium text-sm mb-2">{feat.title}</p>
                <p className="text-white/40 text-[13px] leading-[22px]">{feat.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Visual: simulated branded storefront */}
        <div className="max-w-3xl mx-auto">
          <div className="lv2-card p-6 sm:p-8">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-5 text-center">{'Vista previa de tu tienda'}</p>

            {/* Simulated storefront header */}
            <div className="rounded-xl overflow-hidden border border-white/[0.08]">
              {/* Banner */}
              <div className="h-28 sm:h-36 bg-gradient-to-r from-[#F59E0B]/20 via-[#D97706]/15 to-[#F59E0B]/20 relative flex items-end justify-center">
                <div className="absolute inset-0 bg-[url('/mockups/flow-01-portada.webp')] bg-cover bg-center opacity-20" />
                {/* Logo */}
                <div className="w-16 h-16 rounded-xl bg-[#F59E0B] flex items-center justify-center text-black text-2xl font-bold shadow-lg translate-y-8 relative z-10 border-4 border-black">
                  {'M'}
                </div>
              </div>

              {/* Store info */}
              <div className="pt-12 pb-6 px-6 text-center bg-black/40">
                <h4 className="text-white font-medium text-lg tracking-tight">{'Mi Tienda Store'}</h4>
                <p className="text-white/40 text-sm mt-1">{'Ropa, accesorios y más — Buenos Aires, Argentina'}</p>
                <div className="flex items-center justify-center gap-4 mt-3">
                  <span className="text-[11px] text-white/30 flex items-center gap-1">
                    <Star size={10} className="text-yellow-400 fill-yellow-400" /> {'4.8 (127 reseñas)'}
                  </span>
                  <span className="text-[11px] text-white/30">{'156 productos'}</span>
                  <span className="text-[11px] text-white/30">{'Envíos a todo el país'}</span>
                </div>

                {/* Color swatches showing customization */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <span className="text-[10px] text-white/20">{'Tu paleta:'}</span>
                  <div className="w-5 h-5 rounded-full bg-[#F59E0B] border-2 border-white/10" title="Color primario" />
                  <div className="w-5 h-5 rounded-full bg-[#0A0A0A] border-2 border-white/10" title="Fondo" />
                  <div className="w-5 h-5 rounded-full bg-[#25D366] border-2 border-white/10" title="WhatsApp" />
                </div>
              </div>

              {/* Category tabs */}
              <div className="flex items-center gap-3 px-6 py-3 border-t border-white/[0.06] overflow-x-auto">
                {['Todo', 'Ropa', 'Accesorios', 'Deco', 'Ofertas'].map((cat, i) => (
                  <span
                    key={i}
                    className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap ${
                      i === 0
                        ? 'bg-[#F59E0B]/10 text-[#F59E0B] font-medium border border-[#F59E0B]/20'
                        : 'text-white/40 hover:text-white/60 bg-white/[0.03]'
                    }`}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            <p className="mt-5 text-white/35 text-[13px] text-center leading-relaxed">
              {'Logo, colores, banner, categorías, reseñas — todo personalizable. Tu tienda se ve como vos querés, no como un template genérico.'}
            </p>
          </div>
        </div>

        {/* SEO callout */}
        <div className="mt-8 lv2-card p-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
          <div className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0">
            <Search size={22} className="text-[#F59E0B]" />
          </div>
          <div>
            <p className="text-white font-medium text-base tracking-[-0.3px]">
              {'SEO optimizado para Google'}
            </p>
            <p className="text-white/45 text-sm mt-1">
              {'Tu catálogo y cada producto tienen su propia URL indexable. Clientes te encuentran buscando lo que vendés. Meta tags, Open Graph y structured data incluidos.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SUB-INDUSTRIES
   ═══════════════════════════════════════════════════════ */

function SubIndustriesSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 60);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Rubros" />
          <SectionH2 line1="Para todo tipo" line2="de productos y negocios." />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            {'Vendés ropa, alimentos, propiedades o artesanías — TurnoLink Mercado se adapta a tu forma de vender.'}
          </p>
        </div>

        <div ref={cardsRef} className="flex flex-wrap justify-center gap-3">
          {SUB_INDUSTRIES.map((item, i) => (
            <span
              key={i}
              className="lv2-card-stagger px-5 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-[#F59E0B]/20 transition-all duration-300 group cursor-default"
            >
              <span className="text-white/70 text-sm font-medium tracking-[-0.2px] group-hover:text-white transition-colors">
                {item.name}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   ROI SECTION
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
          <SectionH2 line1="¿Cuánto perdés" line2="vendiendo solo por WhatsApp?" />
          <p className="mt-5 text-white/50 max-w-xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            {'Hacé la cuenta. Cada consulta que no contestás a tiempo es una venta que se va a la competencia.'}
          </p>
        </div>

        <div className="lv2-card p-6 sm:p-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            {/* Sin TurnoLink */}
            <div className="text-center p-6 sm:p-7 rounded-xl bg-red-500/[0.04] border border-red-500/[0.08]">
              <p className="text-sm text-red-400/70 font-medium mb-5 tracking-tight">{'Solo WhatsApp'}</p>
              <div className="space-y-2 text-white/45 text-sm">
                <p>{'~10 consultas perdidas por semana'}</p>
                <p>{'Venta promedio: $15.000'}</p>
              </div>
              <div className="mt-5 pt-5 border-t border-red-500/[0.08]">
                <p className="text-3xl text-red-400/80 font-normal tracking-[-1.5px]">
                  {'-$600.000'}
                </p>
                <p className="text-xs text-red-400/40 mt-1">{'en ventas perdidas por mes'}</p>
              </div>
            </div>

            {/* Con TurnoLink */}
            <div className="text-center p-6 sm:p-7 rounded-xl bg-[#10B981]/[0.06] border border-[#10B981]/[0.15]">
              <p className="text-sm text-[#10B981] font-medium mb-5 tracking-tight">{'Con TurnoLink Mercado'}</p>
              <div className="space-y-2 text-white/45 text-sm">
                <p>{'Catálogo abierto 24/7'}</p>
                <p>{'Consultas con producto ya elegido'}</p>
              </div>
              <div className="mt-5 pt-5 border-t border-[#10B981]/[0.12]">
                <p className="text-3xl text-[#10B981] font-normal tracking-[-1.5px]">
                  {'+$450.000'}
                </p>
                <p className="text-xs text-[#10B981]/50 mt-1">{'en ventas recuperadas por mes'}</p>
              </div>
            </div>
          </div>

          {/* ROI Summary */}
          <div className="text-center border-t border-white/[0.06] pt-8">
            <p className="text-white/50 text-sm mb-2">{'Retorno de inversión'}</p>
            <p className="text-4xl sm:text-5xl text-white font-normal tracking-[-2px]">
              {'75x'}<span className="text-lg text-white/30 ml-2">{'tu inversión'}</span>
            </p>
            <p className="text-white/40 text-sm mt-4">
              {'Plan Vitrina: gratis — Plan Comercio: $9.990/mes — '}
              <span className="text-[#10B981] font-medium">{'se paga con 1 sola venta'}</span>
            </p>
          </div>

          {/* Additional metrics */}
          <div className="mt-8 pt-6 border-t border-white/[0.06]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg text-white font-normal tracking-[-0.5px]">{'+60%'}</p>
                <p className="text-white/30 text-xs mt-1">{'Ventas vs redes sociales'}</p>
              </div>
              <div>
                <p className="text-lg text-white font-normal tracking-[-0.5px]">{'5hs'}</p>
                <p className="text-white/30 text-xs mt-1">{'Ahorradas por semana'}</p>
              </div>
              <div>
                <p className="text-lg text-white font-normal tracking-[-0.5px]">{'24/7'}</p>
                <p className="text-white/30 text-xs mt-1">{'Tu catálogo siempre abierto'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   USE CASES (Inmobiliaria + Ropa + Alimentos)
   ═══════════════════════════════════════════════════════ */

function UseCasesSection() {
  const sectionRef = useScrollReveal();
  const cardsRef = useStaggerReveal('.lv2-card-stagger', 150);

  const cases = [
    {
      emoji: '🏠',
      title: 'Inmobiliarias',
      desc: 'Publicá propiedades con fotos, precio, ubicación y características. Tu cliente navega, filtra y te contacta por la que le interesa. Sin mandar PDFs ni responder "¿tenés algo en Palermo?".',
      metric: '120+ propiedades publicadas',
    },
    {
      emoji: '👗',
      title: 'Ropa y accesorios',
      desc: 'Catálogo con talles, colores y stock en tiempo real. Tu clienta elige, ve si hay stock y te escribe directo por WhatsApp. Sin reenviar fotos ni anotar pedidos en el cuaderno.',
      metric: 'Stock automático por variante',
    },
    {
      emoji: '🧁',
      title: 'Alimentos artesanales',
      desc: 'Mostrá tu carta con fotos que dan hambre. Tortas, viandas, conservas — tu cliente elige y hace el pedido. Ideal para delivery propio o retiro en local.',
      metric: 'Pedidos organizados sin caos',
    },
  ];

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="lv2-section py-[100px] lg:py-[120px] px-5 lg:px-10"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="Casos de uso" />
          <SectionH2 line1="Funciona para" line2="todo tipo de negocio." />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cases.map((c, i) => (
            <div key={i} className="lv2-card-stagger lv2-card p-8 text-center">
              <div className="text-4xl mb-5">{c.emoji}</div>
              <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#F59E0B]/[0.1] border border-[#F59E0B]/[0.15] text-xs text-[#F59E0B] font-medium mb-4">
                {c.metric}
              </span>
              <h3 className="text-white font-medium text-lg tracking-[-0.5px] mb-3">{c.title}</h3>
              <p className="text-white/50 text-[15px] leading-[26px] tracking-[-0.2px]">{c.desc}</p>
            </div>
          ))}
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
          <SectionH2 line1="Lo que dicen quienes" line2="ya lo usan." />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="lv2-card-stagger lv2-card p-7 flex flex-col text-center">
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#F59E0B]/[0.1] border border-[#F59E0B]/[0.15] text-xs text-[#F59E0B] font-medium">
                  {t.metric}
                </span>
              </div>

              <div className="flex gap-0.5 justify-center mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={13} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              <p className="text-white/50 text-[14px] leading-[24px] tracking-[-0.2px] flex-1 mb-5">
                {'"'}{t.quote}{'"'}
              </p>

              <div className="border-t border-white/[0.06] pt-4 flex items-center gap-3">
                {t.image && (
                  <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" loading="lazy" />
                )}
                <div>
                  <p className="text-white font-medium text-sm tracking-tight">{t.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {t.role} {' · '} {t.business}
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
          <SectionH2 line1="Planes simples," line2="sin letra chica." />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-base leading-relaxed tracking-[-0.2px]">
            {'14 días de prueba gratis en todos los planes. Sin tarjeta de crédito. Cancelá cuando quieras.'}
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`lv2-card-stagger lv2-card p-8 flex flex-col text-center ${
                tier.popular ? 'ring-1 ring-[#F59E0B]/30 bg-[#F59E0B]/[0.02]' : ''
              }`}
            >
              {tier.popular && (
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-black bg-[#F59E0B] px-3 py-1 rounded-md tracking-wide uppercase">
                    {'Más elegido'}
                  </span>
                </div>
              )}
              <h3 className="text-white font-medium text-xl tracking-[-0.5px] mb-2">{tier.name}</h3>
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-white text-3xl font-normal tracking-[-2px]">{tier.price}</span>
                <span className="text-white/30 text-sm">{tier.period}</span>
              </div>
              <div className="lv2-glass-line w-full my-5" />
              <ul className="space-y-3 flex-1 text-left">
                {tier.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-white/60">
                    <Check size={16} className="text-[#F59E0B] mt-0.5 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/register?industry=mercado"
                className={`mt-8 w-full text-center py-3 rounded-[10px] text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  tier.popular
                    ? 'lv2-glow-btn bg-[#F59E0B] text-black'
                    : 'bg-white/[0.06] text-white/80 hover:bg-white/[0.12] border border-white/[0.08]'
                }`}
              >
                {'Probar 14 días gratis'}
                <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-white/25 text-sm mt-10 flex items-center justify-center gap-2">
          <Shield size={14} />
          {'14 días de prueba en todos los planes. Sin tarjeta de crédito. Cancelá cuando quieras.'}
        </p>
        <p className="text-center mt-4">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#F59E0B] hover:text-[#D97706] transition-colors duration-300"
          >
            {'¿Necesitás ayuda para elegir? Hablá con nuestro equipo →'}
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
      <div className="max-w-[900px] mx-auto">
        <div className="text-center mb-16">
          <SectionTag text="FAQ" />
          <SectionH2 line1="Preguntas" line2="frecuentes." />
          <p className="mt-5 text-white/50 max-w-2xl mx-auto text-[15px] leading-relaxed tracking-[-0.2px]">
            {'Respuestas a las dudas más comunes de emprendedores y negocios que venden productos.'}
          </p>
        </div>

        <div className="space-y-3">
          {MERCADO_FAQS.map((faq, i) => {
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

export function MercadoLanding({ dynamicPricing }: { dynamicPricing?: PricingTier[] } = {}) {
  const pricingTiers = dynamicPricing || PRICING_TIERS;
  return (
    <div
      className="min-h-screen bg-black text-white selection:bg-[#F59E0B]/30 selection:text-white"
      style={{ overflowX: 'clip' }}
    >
      <Navbar />
      <HeroSection />
      <MetricsStrip />
      <PainPointsSection />
      <BeforeAfterSection />
      <HowItWorksSection />
      <TwoModesSection />
      <FeaturesSection />
      <CatalogPreviewSection />
      <StockManagementSection />
      <BrandedPageSection />
      <UseCasesSection />
      <SubIndustriesSection />
      <ROISection />
      <TestimonialsSection />
      <PricingSection tiers={pricingTiers} />
      <FAQSection />
      <CTASection
        headline="Tu negocio merece su propia tienda online"
        subtitle="empezá en 10 minutos."
        description="Creá tu tienda con tu marca, subí tus productos y elegí cómo vender: consultas por WhatsApp o carrito con Mercado Pago. Stock, métricas y branding profesional."
      />
      <Footer />
    </div>
  );
}
