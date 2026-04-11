'use client';

import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import NextImage from 'next/image';
import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import {
  CheckCircle,
  Clock,
  XCircle,
  Package,
  ChevronLeft,
  Loader2,
  CreditCard,
  Banknote,
  Building2,
  Truck,
  Store,
  ShoppingBag,
  MessageCircle,
  Copy,
  Check,
  Timer,
  ChefHat,
  CircleDot,
  AlertTriangle,
} from 'lucide-react';
import { publicApi, type TenantBranding, type TenantPublic } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { PublicThemeWrapper } from '@/components/booking/public-theme-wrapper';
import { useGastroCartStore } from '@/lib/gastro-cart-store';

// ─── Lottie Animation Paths ───────────────────────
const STATUS_LOTTIE: Record<string, Record<string, string>> = {
  delivery: {
    PENDING: '/lottie/order-confirmed.json',
    CONFIRMED: '/lottie/order-received.json',
    PROCESSING: '/lottie/cooking.json',
    READY: '/lottie/cooking.json',        // Same as cooking until we have a specific animation
    SHIPPED: '/lottie/delivery.json',
    ARRIVED: '/lottie/arrived.json',              // Delivery llegó
    DELIVERED: '/lottie/delivered.json',           // Persona comiendo
    CANCELLED: '/lottie/cancelled.json',
  },
  takeaway: {
    PENDING: '/lottie/order-confirmed.json',
    CONFIRMED: '/lottie/order-received.json',
    PROCESSING: '/lottie/cooking.json',
    DELIVERED: '/lottie/delivered-takeaway.json',  // Bolsita de comida
    CANCELLED: '/lottie/cancelled.json',
  },
};

// ─── Timeline Steps (by order type) ─────────────────
const DELIVERY_STEPS = [
  { key: 'PENDING', label: 'Enviado', icon: Package, color: '#F59E0B' },
  { key: 'CONFIRMED', label: 'Confirmado', icon: CheckCircle, color: '#3B82F6' },
  { key: 'PROCESSING', label: 'Preparando', icon: ChefHat, color: '#8B5CF6' },
  { key: 'READY', label: 'Listo', icon: Store, color: '#14B8A6' },
  { key: 'SHIPPED', label: 'En camino', icon: Truck, color: '#6366F1' },
  { key: 'ARRIVED', label: 'Llegó', icon: CircleDot, color: '#EC4899' },
  { key: 'DELIVERED', label: 'Entregado', icon: CheckCircle, color: '#10B981' },
];

const TAKEAWAY_STEPS = [
  { key: 'PENDING', label: 'Enviado', icon: Package, color: '#F59E0B' },
  { key: 'CONFIRMED', label: 'Confirmado', icon: CheckCircle, color: '#3B82F6' },
  { key: 'PROCESSING', label: 'Preparando', icon: ChefHat, color: '#8B5CF6' },
  { key: 'DELIVERED', label: 'Listo', icon: Store, color: '#10B981' },
];

const STATUS_META: Record<string, { title: string; subtitle: string }> = {
  PENDING: { title: 'Pedido enviado', subtitle: 'Tu pedido fue enviado al comercio. Te confirman en breve.' },
  CONFIRMED: { title: 'Pedido confirmado', subtitle: 'Tu pedido fue aceptado. Elegí cómo querés pagar.' },
  PROCESSING: { title: 'Cocinando tu pedido', subtitle: 'Están preparando tu comida en este momento' },
  READY: { title: 'Pedido listo', subtitle: 'Tu comida está lista. El delivery la retira en breve.' },
  SHIPPED: { title: 'En camino', subtitle: 'Tu pedido está en camino hacia vos' },
  ARRIVED: { title: 'El delivery llegó', subtitle: 'Tu pedido está en la puerta. ¡Salí a recibirlo!' },
  DELIVERED: { title: 'Buen provecho!', subtitle: 'Tu pedido fue entregado. ¡Disfrutalo!' },
  CANCELLED: { title: 'Pedido cancelado', subtitle: 'Este pedido fue cancelado' },
};

const PAYMENT_METHODS: Record<string, { label: string; icon: typeof CreditCard }> = {
  mercadopago: { label: 'MercadoPago', icon: CreditCard },
  transferencia: { label: 'Transferencia', icon: Building2 },
  efectivo: { label: 'Efectivo', icon: Banknote },
};

// ─── Helper: elapsed time human-readable ─────────
function elapsedText(dateStr: string): string {
  const mins = Math.round((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours < 24) return remMins > 0 ? `Hace ${hours}h ${remMins}m` : `Hace ${hours}h`;
  return `Hace ${Math.floor(hours / 24)}d`;
}

// ─── Polling intervals by status ─────────────────
const POLL_MS: Record<string, number> = {
  PENDING: 12000,
  CONFIRMED: 15000,
  PROCESSING: 15000,
  READY: 12000,
  SHIPPED: 15000,
  ARRIVED: 10000,   // poll faster — delivery is at the door
  DELIVERED: 0,     // stop polling
  CANCELLED: 0,     // stop polling
};

// ─── Preload all Lottie JSONs once at module level ──
const lottieCache: Record<string, object | null> = {};
const lottiePending: Record<string, Promise<object | null> | undefined> = {};

function preloadLottie(path: string): Promise<object | null> {
  if (lottieCache[path] !== undefined) return Promise.resolve(lottieCache[path]);
  if (lottiePending[path]) return lottiePending[path];
  lottiePending[path] = fetch(path)
    .then(r => r.json())
    .then(data => { lottieCache[path] = data; return data; })
    .catch(() => { lottieCache[path] = null; return null; });
  return lottiePending[path];
}

// Preload all animations immediately on module load
if (typeof window !== 'undefined') {
  Object.values(STATUS_LOTTIE).forEach(group => Object.values(group).forEach(preloadLottie));
}

const LottieHero = memo(function LottieHero({ status, loop, mode }: { status: string; loop: boolean; mode: 'delivery' | 'takeaway' }) {
  const lottieSet = STATUS_LOTTIE[mode] || STATUS_LOTTIE.delivery;
  const path = lottieSet[status] || lottieSet.PENDING;
  const [animData, setAnimData] = useState<object | null>(lottieCache[path] || null);

  useEffect(() => {
    if (lottieCache[path]) {
      setAnimData(lottieCache[path]);
      return;
    }
    preloadLottie(path).then(data => setAnimData(data));
  }, [path]);

  if (!animData) return <div className="w-24 h-24" />;

  return (
    <Lottie
      animationData={animData}
      loop
      autoplay
      style={{ width: 96, height: 96 }}
    />
  );
});

export default function OrderTrackingPage() {
  const params = useParams();
  const slug = params.slug as string;
  const orderNumber = decodeURIComponent(params.orderNumber as string);

  const [order, setOrder] = useState<any>(null);
  const [prevStatus, setPrevStatus] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [tenant, setTenant] = useState<TenantPublic | null>(null);
  const [branding, setBranding] = useState<TenantBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [statusChanged, setStatusChanged] = useState(false);
  const [hasMercadoPago, setHasMercadoPago] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const orderRef = useRef<any>(null);

  // Keep ref in sync so polling callback doesn't depend on order state
  orderRef.current = order;

  // ─── Fetch order data ─────────────────────────────
  const fetchOrder = useCallback(async (isInitial = false) => {
    if (!slug || !orderNumber) return;
    try {
      const data = await publicApi.getOrder(slug, orderNumber);
      const prev = orderRef.current;

      // Skip re-render if nothing changed (polling returns same data)
      if (!isInitial && prev && JSON.stringify(prev) === JSON.stringify(data.order)) {
        return;
      }

      // Detect status change → flash animation + vibrate + sound
      if (!isInitial && prev && data.order.status !== prev.status) {
        setPrevStatus(prev.status);
        setStatusChanged(true);
        setTimeout(() => setStatusChanged(false), 2000);
        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(200);
        // Bell sound
        try { new Audio('/sounds/status-change.mp3').play(); } catch {}
      }

      setOrder(data.order);
      setBusinessName(data.businessName);
      setExpired(false);
      setError(null);

      // Clear active order tracking when completed
      if (data.order.status === 'DELIVERED' || data.order.status === 'CANCELLED') {
        const store = useGastroCartStore.getState();
        if (store.activeOrderNumber === orderNumber) {
          store.clearActiveOrder();
        }
      }
    } catch (err: any) {
      if (err.status === 410 || err.message?.includes('expirado')) {
        setExpired(true);
      } else if (isInitial) {
        setError(err.message || 'Pedido no encontrado');
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [slug, orderNumber]);

  // Initial load + tenant info
  useEffect(() => {
    fetchOrder(true);
    publicApi.getTenant(slug).then(setTenant).catch(() => {});
    publicApi.getBranding(slug).then(setBranding).catch(() => {});
    publicApi.getPaymentMethods(slug).then((m) => setHasMercadoPago(m.mercadopago)).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, orderNumber]);

  // ─── Smart polling ─────────────────────────────────
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    const interval = POLL_MS[order?.status] || 0;
    if (interval > 0) {
      pollRef.current = setInterval(() => fetchOrder(false), interval);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.status, slug, orderNumber]);

  // ─── Derived values ─────────────────────────────────
  const primaryColor = branding?.primaryColor || tenant?.settings?.primaryColor || '#111827';
  const logoBg = branding?.backgroundColor || '#111827';
  const isDark = (hex: string): boolean => {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 140;
  };
  const navBg = isDark(logoBg) ? logoBg : '#111827';
  const logoUrl = tenant?.logo || branding?.logoUrl || null;
  const storeName = branding?.welcomeTitle || tenant?.name || businessName || '';
  const whatsappNumber = tenant?.phone?.replace(/\D/g, '') || '';

  const handlePayment = async (method: 'efectivo' | 'mercadopago') => {
    setPaymentLoading(true);
    setPaymentError(null);
    try {
      const result = await publicApi.payOrder(slug, orderNumber, method);
      if (result.initPoint) {
        window.location.href = result.initPoint;
        return;
      }
      // Efectivo — refresh to update payment info
      await fetchOrder(false);
    } catch (err: any) {
      setPaymentError(err.message || 'Error al procesar el pago');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCopy = () => {
    if (!order?.orderNumber) return;
    navigator.clipboard.writeText(order.orderNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ─── Loading ───────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-gray-100" />
          <Loader2 className="absolute inset-0 w-16 h-16 text-gray-400 animate-spin" strokeWidth={2} />
        </div>
        <p className="text-sm text-gray-400 mt-4">Cargando tu pedido...</p>
      </div>
    );
  }

  // ─── Expired ───────────────────────────────────────
  if (expired) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <nav className="sticky top-0 z-50 h-14 flex items-center px-4 shadow-sm" style={{ backgroundColor: navBg }}>
          <Link href={`/${slug}`} className="text-white/60 hover:text-white transition-colors mr-3">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          {logoUrl && (
            <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 mr-2 ring-2 ring-white/20 bg-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt={storeName} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
          <span className="text-white font-semibold text-sm truncate">{storeName}</span>
        </nav>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
            <Timer className="w-9 h-9 text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Seguimiento expirado</h2>
          <p className="text-sm text-gray-500 max-w-xs mb-8">
            Este pedido ya fue completado y el seguimiento en vivo ha finalizado.
          </p>
          <Link
            href={`/${slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 shadow-lg"
            style={{ backgroundColor: primaryColor }}
          >
            <ShoppingBag className="h-4 w-4" />
            Volver al menú
          </Link>
        </div>
      </div>
    );
  }

  // ─── Error ─────────────────────────────────────────
  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <nav className="sticky top-0 z-50 h-14 flex items-center px-4 shadow-sm" style={{ backgroundColor: navBg }}>
          <Link href={`/${slug}`} className="text-white/60 hover:text-white transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </nav>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-5">
            <AlertTriangle className="w-9 h-9 text-red-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Pedido no encontrado</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">{error || 'No pudimos encontrar este pedido'}</p>
          <Link
            href={`/${slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            <ChevronLeft className="h-4 w-4" />
            Volver
          </Link>
        </div>
      </div>
    );
  }

  // ─── Order Data ─────────────────────────────────────
  const isCancelled = order.status === 'CANCELLED';
  const isDelivered = order.status === 'DELIVERED';
  const isActive = !isCancelled && !isDelivered;
  const payment = order.payments?.[0];
  const paymentConfig = payment ? PAYMENT_METHODS[payment.paymentMethod] : null;
  const PaymentIcon = paymentConfig?.icon || CreditCard;
  const isDelivery = order.shippingMethod === 'envio' || order.orderType === 'DELIVERY';
  const isTakeaway = order.orderType === 'TAKE_AWAY';

  // Dynamic timeline steps based on order type
  const timelineSteps = isDelivery ? DELIVERY_STEPS : TAKEAWAY_STEPS;
  const currentIdx = timelineSteps.findIndex(s => s.key === order.status);
  const statusMeta = STATUS_META[order.status] || STATUS_META.PENDING;

  // For takeaway: SHIPPED maps to DELIVERED (skip "en camino")
  const effectiveStatus = isTakeaway && order.status === 'SHIPPED' ? 'DELIVERED' : order.status;

  // Parse shipping address — may be JSON string or plain text
  const displayAddress = (() => {
    if (!order.shippingAddress) return null;
    try {
      const parsed = JSON.parse(order.shippingAddress);
      return parsed.address || parsed.direccion || null;
    } catch {
      return order.shippingAddress;
    }
  })();

  // Last status change time
  const lastChange = order.statusHistory?.[0]?.createdAt || order.updatedAt;

  // Theme data
  const settings = tenant?.settings as any;
  const themePrimary = branding?.primaryColor || settings?.primaryColor || '#111827';

  return (
    <PublicThemeWrapper
      tenantSlug={slug}
      colors={{
        primaryColor: themePrimary,
        secondaryColor: branding?.secondaryColor || settings?.secondaryColor,
        accentColor: branding?.accentColor || settings?.accentColor,
      }}
      enableDarkMode={settings?.enableDarkMode ?? true}
      themeMode={settings?.themeMode}
    >
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-neutral-950">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }
        @keyframes pulse-ring { 0% { transform:scale(1); opacity:0.6; } 100% { transform:scale(1.8); opacity:0; } }
        @keyframes shimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
        @keyframes status-flash { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        .fade-up { animation: fadeUp 0.5s ease-out both; }
        .fade-up-1 { animation: fadeUp 0.5s ease-out 0.1s both; }
        .fade-up-2 { animation: fadeUp 0.5s ease-out 0.2s both; }
        .fade-up-3 { animation: fadeUp 0.5s ease-out 0.3s both; }
        .scale-in { animation: scaleIn 0.4s ease-out both; }
        .pulse-ring::after { content:''; position:absolute; inset:-4px; border-radius:9999px; border:2px solid currentColor; animation:pulse-ring 2s ease-out infinite; }
        .status-flash { animation: status-flash 0.6s ease-in-out 3; }
        .shimmer-bar { background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%); background-size: 200% 100%; animation: shimmer 2s infinite; }
      `}</style>

      {/* ─── Navbar ─────────────────────────────────── */}
      <nav className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: navBg }}>
        <div className="max-w-lg mx-auto px-4">
          <div className="flex items-center h-14">
            <Link href={`/${slug}`} className="shrink-0 mr-3 text-white/50 hover:text-white transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            {logoUrl && (
              <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 mr-2.5 ring-2 ring-white/20">
                <NextImage src={logoUrl} alt={storeName} fill className="object-cover" sizes="28px" />
              </div>
            )}
            <span className="text-white font-semibold text-sm truncate flex-1">{storeName}</span>
            {isActive && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-medium">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
                En vivo
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Content ─────────────────────────────────── */}
      <div className="flex-1 max-w-lg mx-auto px-4 py-5 w-full space-y-4">

        {/* ─── Status Hero Card ────────────────────── */}
        <div className={`bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden fade-up ${statusChanged ? 'status-flash' : ''}`}>
          {/* Gradient accent bar */}
          <div className="h-1 transition-all duration-700" style={{ background: `linear-gradient(90deg, ${timelineSteps[currentIdx]?.color || '#6B7280'}, ${timelineSteps[Math.min((currentIdx || 0) + 1, timelineSteps.length - 1)]?.color || '#6B7280'})` }} />

          <div className="px-5 pt-5 pb-5 text-center">
            {/* Lottie animation */}
            <div className="relative w-24 h-24 mx-auto mb-4 scale-in">
              <LottieHero status={order.status} loop={isActive} mode={isTakeaway ? 'takeaway' : 'delivery'} />
            </div>

            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{statusMeta.title}</h1>
            <p className="text-sm text-gray-500 dark:text-neutral-400 leading-relaxed max-w-[280px] mx-auto">{statusMeta.subtitle}</p>

            {/* Order number + time */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors text-sm"
              >
                <span className="font-mono font-semibold text-gray-700 dark:text-neutral-200">{order.orderNumber}</span>
                {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-gray-400 dark:text-neutral-500" />}
              </button>
              <span className="text-xs text-gray-400 dark:text-neutral-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {elapsedText(lastChange)}
              </span>
            </div>
          </div>

          {/* ─── Timeline: Coverflow 3D ─────────────── */}
          {!isCancelled && (
            <div className="px-4 pt-3 pb-5">
              {/* 3D stage: show prev, current, next as layered cards */}
              <div className="relative h-[112px] flex items-center justify-center" style={{ perspective: '900px' }}>
                <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
                  {timelineSteps.map((step, i) => {
                    const offset = i - currentIdx; // -∞..+∞
                    const abs = Math.abs(offset);
                    // Render only center + immediate neighbors to keep it clean
                    if (abs > 1) return null;

                    const StepIcon = step.icon;
                    const isCurrent = offset === 0;
                    const isPrev = offset === -1;
                    const isCompleted = offset < 0;

                    // 3D transforms: center large, sides rotated + scaled + translated
                    const translateX = isCurrent ? 0 : isPrev ? -82 : 82;
                    const rotateY = isCurrent ? 0 : isPrev ? 28 : -28;
                    const scale = isCurrent ? 1 : 0.72;
                    const z = isCurrent ? 10 : 1;
                    const opacity = isCurrent ? 1 : 0.55;

                    return (
                      <div
                        key={step.key}
                        className="absolute top-1/2 left-1/2 transition-all duration-500 ease-out"
                        style={{
                          transform: `translate(-50%, -50%) translateX(${translateX}px) rotateY(${rotateY}deg) scale(${scale})`,
                          zIndex: z,
                          opacity,
                          transformStyle: 'preserve-3d',
                        }}
                      >
                        <div
                          className="flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-neutral-900 border transition-colors"
                          style={{
                            width: 116,
                            borderColor: isCurrent ? `${step.color}60` : (isCompleted ? `${step.color}25` : '#e5e7eb'),
                            boxShadow: isCurrent
                              ? `0 12px 32px -8px ${step.color}50, 0 0 0 2px ${step.color}30`
                              : '0 4px 12px -4px rgba(0,0,0,0.1)',
                          }}
                        >
                          <div
                            className="relative w-11 h-11 rounded-full flex items-center justify-center"
                            style={{
                              background: `linear-gradient(135deg, ${step.color}22, ${step.color}0a)`,
                            }}
                          >
                            {isCurrent && isActive && (
                              <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: step.color }} />
                            )}
                            <StepIcon className="h-5 w-5" strokeWidth={2.5} style={{ color: step.color }} />
                          </div>
                          <span
                            className="text-[11px] font-semibold text-center leading-tight whitespace-nowrap"
                            style={{ color: isCurrent ? step.color : '#6b7280' }}
                          >
                            {step.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mini progress dots: ve todos los pasos */}
              <div className="flex items-center justify-center gap-1.5 mt-1">
                {timelineSteps.map((step, i) => {
                  const isDone = i < currentIdx;
                  const isCurrent = i === currentIdx;
                  return (
                    <div
                      key={step.key}
                      className="rounded-full transition-all duration-500"
                      style={{
                        width: isCurrent ? 22 : 6,
                        height: 6,
                        backgroundColor: isDone || isCurrent ? step.color : '#e5e7eb',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Cancelled state */}
          {isCancelled && (
            <div className="px-5 pb-5">
              <div className="flex items-center gap-3 p-3.5 bg-red-50 dark:bg-red-950/30 rounded-xl">
                <XCircle className="h-5 w-5 text-red-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">Pedido cancelado</p>
                  <p className="text-xs text-red-500 dark:text-red-400/70 mt-0.5">
                    {order.statusHistory?.[0]?.note || 'Contactá al comercio para más información'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── Delivery/Pickup Info ────────────────── */}
        {(isDelivery || isTakeaway) && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden fade-up-1">
            <div className="p-4 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${primaryColor}10` }}>
                {isDelivery ? (
                  <Truck className="h-5 w-5" style={{ color: primaryColor }} />
                ) : (
                  <Store className="h-5 w-5" style={{ color: primaryColor }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {isDelivery ? 'Delivery' : 'Retiro en local'}
                </p>
                {displayAddress && (
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5 truncate">{displayAddress}</p>
                )}
                {isTakeaway && order.status !== 'DELIVERED' && (
                  <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5">Te avisamos cuando esté listo para retirar</p>
                )}
              </div>
              {order.status === 'SHIPPED' && isDelivery && (
                <div className="shrink-0 px-2.5 py-1 bg-indigo-50 rounded-lg">
                  <span className="text-xs font-semibold text-indigo-600">En camino</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Payment Selector (after business confirms) ──── */}
        {!isCancelled && !isDelivered && order.awaitingPayment && order.status !== 'PENDING' && (
          <div
            className="bg-white dark:bg-neutral-900 rounded-2xl border-2 shadow-sm overflow-hidden fade-up-2 animate-payment-ring"
            style={{ borderColor: primaryColor }}
          >
            <div className="px-4 py-3.5 border-b border-gray-50 dark:border-neutral-800 flex items-start gap-2">
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="h-4 w-4" style={{ color: primaryColor }} />
                  Elegí cómo pagar
                </h2>
                <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">El comercio confirmó tu pedido. <span className="font-semibold" style={{ color: primaryColor }}>Seleccioná un método para avanzar.</span></p>
              </div>
              <span
                className="shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full text-white animate-pulse"
                style={{ backgroundColor: primaryColor }}
              >
                Acción requerida
              </span>
            </div>
            <div className="p-4 space-y-2.5">
              {/* Efectivo */}
              <button
                onClick={() => handlePayment('efectivo')}
                disabled={paymentLoading}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-800/50 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}10` }}>
                  <Banknote className="w-5 h-5" style={{ color: primaryColor }} />
                </div>
                <div className="text-left flex-1">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white block">Efectivo</span>
                  <span className="text-xs text-gray-400 dark:text-neutral-500">Pagás al recibir o retirar</span>
                </div>
                <CheckCircle className="w-4 h-4 text-gray-300 dark:text-neutral-600" />
              </button>

              {/* MercadoPago */}
              {hasMercadoPago && (
                <button
                  onClick={() => handlePayment('mercadopago')}
                  disabled={paymentLoading}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-800/50 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}10` }}>
                    {paymentLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: primaryColor }} />
                    ) : (
                      <CreditCard className="w-5 h-5" style={{ color: primaryColor }} />
                    )}
                  </div>
                  <div className="text-left flex-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white block">Mercado Pago</span>
                    <span className="text-xs text-gray-400 dark:text-neutral-500">Tarjeta o saldo MP</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{formatPrice(order.total)}</span>
                </button>
              )}

              {paymentError && (
                <p className="text-xs text-red-500 text-center mt-1">{paymentError}</p>
              )}
            </div>
          </div>
        )}

        {/* ─── Payment Method Confirmed (after user chose, before payment approved) ──── */}
        {!isCancelled && !isDelivered && !order.awaitingPayment && order.paymentMethod && (!payment || payment.status === 'PENDING') && order.status !== 'PENDING' && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border-2 border-emerald-100 dark:border-emerald-900/40 shadow-sm overflow-hidden fade-up-2">
            <div className="p-4 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20">
                {order.paymentMethod === 'efectivo' ? (
                  <Banknote className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Método de pago seleccionado</p>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                  {order.paymentMethod === 'efectivo' ? 'Efectivo' : order.paymentMethod === 'mercadopago' ? 'Mercado Pago' : 'Transferencia'}
                </p>
                <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                  {order.paymentMethod === 'efectivo'
                    ? (isDelivery ? 'Pagás al recibir tu pedido' : 'Pagás al retirar tu pedido')
                    : 'Esperando confirmación del pago'}
                </p>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums shrink-0">{formatPrice(order.total)}</span>
            </div>
          </div>
        )}

        {/* ─── Delivery Pickup Word ──── */}
        {isDelivery && !isCancelled && !isDelivered && order.status !== 'PENDING' && order.pickupWord && (
          <div className="rounded-2xl overflow-hidden fade-up-3 shadow-sm" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}>
            <div className="p-5 text-white text-center">
              <div className="flex items-center justify-center gap-2 mb-3 opacity-90">
                <Truck className="h-4 w-4" />
                <p className="text-[11px] font-semibold uppercase tracking-wider">Palabra clave de entrega</p>
              </div>
              <p className="text-4xl font-black tracking-[0.15em] leading-none">{order.pickupWord}</p>
              <p className="text-[12px] opacity-85 mt-3 leading-snug max-w-[280px] mx-auto">
                Decile esta palabra al repartidor cuando llegue. Él la va a seleccionar en su pantalla para confirmar la entrega.
              </p>
            </div>
          </div>
        )}

        {/* ─── Products ───────────────────────────── */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden fade-up-2">
          <div className="px-4 py-3 border-b border-gray-50 dark:border-neutral-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Tu pedido</h2>
            <span className="text-xs text-gray-400">{order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'producto' : 'productos'}</span>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-neutral-800">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex gap-3.5 p-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 flex items-center justify-center">
                  {item.productImage ? (
                    <NextImage src={item.productImage} alt={item.productName} width={64} height={64} className="object-cover w-full h-full" />
                  ) : (
                    <Package className="h-5 w-5 text-gray-200 dark:text-neutral-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug line-clamp-2">{item.productName}</p>
                  {item.variantName && (
                    <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5">{item.variantName}</p>
                  )}
                  {item.options && (() => {
                    try {
                      const opts = typeof item.options === 'string' ? JSON.parse(item.options) : item.options;
                      if (Array.isArray(opts) && opts.length > 0) {
                        return <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-0.5">{opts.map((o: any) => o.value).join(' · ')}</p>;
                      }
                    } catch { /* ignore */ }
                    return null;
                  })()}
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-gray-400 dark:text-neutral-500 bg-gray-50 dark:bg-neutral-800 px-2 py-0.5 rounded-md font-medium">x{item.quantity}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">{formatPrice(item.totalPrice)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="px-4 py-3.5 border-t border-gray-100 dark:border-neutral-800 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 dark:text-neutral-500">Subtotal</span>
              <span className="text-gray-600 dark:text-neutral-300 tabular-nums">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-emerald-600 dark:text-emerald-400">Descuento{order.couponCode && ` (${order.couponCode})`}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium tabular-nums">-{formatPrice(order.discount)}</span>
              </div>
            )}
            {order.shippingCost > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 dark:text-neutral-500">Envío</span>
                <span className="text-gray-600 dark:text-neutral-300 tabular-nums">{formatPrice(order.shippingCost)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2 border-t border-gray-100 dark:border-neutral-800">
              <span className="text-sm font-semibold text-gray-700 dark:text-neutral-300">Total</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* ─── Payment Status (only for approved/rejected) ──── */}
        {payment && payment.status !== 'PENDING' && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden fade-up-3">
            <div className="p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}10` }}>
                <PaymentIcon className="h-5 w-5" style={{ color: primaryColor }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{paymentConfig?.label || payment.paymentMethod}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {payment.status === 'APPROVED' ? 'Pago confirmado' :
                   payment.status === 'REJECTED' ? 'Pago rechazado' :
                   'Pago procesado'}
                </p>
              </div>
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{
                  color: payment.status === 'APPROVED' ? '#059669' : '#DC2626',
                  backgroundColor: payment.status === 'APPROVED' ? '#D1FAE5' : '#FEE2E2',
                }}
              >
                {payment.status === 'APPROVED' ? 'Aprobado' : 'Rechazado'}
              </span>
            </div>
          </div>
        )}

        {/* ─── Status History ─────────────────────── */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden fade-up-3">
            <div className="px-4 py-3 border-b border-gray-50 dark:border-neutral-800">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Historial</h2>
            </div>
            <div className="px-4 py-3 space-y-3">
              {order.statusHistory.slice(0, 6).map((h: any, i: number) => {
                const meta = STATUS_META[h.status];
                return (
                  <div key={h.id || i} className="flex items-start gap-3">
                    <div className="relative mt-0.5">
                      <CircleDot className={`h-4 w-4 ${i === 0 ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-neutral-600'}`} />
                      {i < Math.min(order.statusHistory.length, 6) - 1 && (
                        <div className="absolute top-5 left-[7px] w-0.5 h-4 bg-gray-100 dark:bg-neutral-800" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${i === 0 ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-500 dark:text-neutral-400'}`}>
                        {meta?.title || h.status}
                      </p>
                      {h.note && <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5">{h.note}</p>}
                    </div>
                    <span className="text-[11px] text-gray-400 dark:text-neutral-500 shrink-0 tabular-nums">
                      {new Date(h.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Actions ────────────────────────────── */}
        <div className="space-y-2.5 fade-up-3 pb-4">
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola! Hice el pedido ${order.orderNumber} y quería consultarte sobre el estado.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-gray-200 dark:border-neutral-700 text-sm font-semibold text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800 active:scale-[0.98] transition-all"
            >
              <MessageCircle className="h-4 w-4" />
              Consultar por WhatsApp
            </a>
          )}
          <Link
            href={`/${slug}`}
            className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] shadow-lg"
            style={{ backgroundColor: primaryColor }}
          >
            <ShoppingBag className="h-4 w-4" />
            Seguir comprando
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-[11px] text-gray-300 dark:text-neutral-700">
          Powered by{' '}
          <a href="https://turnolink.com.ar/mercado" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400 dark:hover:text-neutral-500 transition-colors">
            TurnoLink
          </a>
        </p>
      </div>
    </div>
    </PublicThemeWrapper>
  );
}
