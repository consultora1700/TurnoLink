'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  Loader2,
  Phone,
  MapPin,
  Package,
  CheckCircle2,
  Truck,
  Home,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Sparkles,
  Receipt,
  StickyNote,
  Navigation,
} from 'lucide-react';
import { publicApi, type DeliveryOrderPublic } from '@/lib/api';

// ─── Status display ─────────────────────────────────────────
const STATUS_META: Record<string, {
  label: string;
  description: string;
  gradient: string;
  ring: string;
  text: string;
  dot: string;
}> = {
  READY: {
    label: 'Listo para retirar',
    description: 'El pedido está esperándote en el local',
    gradient: 'from-teal-500 to-emerald-500',
    ring: 'ring-teal-200',
    text: 'text-teal-700',
    dot: 'bg-teal-500',
  },
  SHIPPED: {
    label: 'En camino',
    description: 'Entregando al cliente',
    gradient: 'from-indigo-500 to-blue-500',
    ring: 'ring-indigo-200',
    text: 'text-indigo-700',
    dot: 'bg-indigo-500',
  },
  ARRIVED: {
    label: 'En la puerta',
    description: 'Esperando que el cliente reciba',
    gradient: 'from-pink-500 to-rose-500',
    ring: 'ring-pink-200',
    text: 'text-pink-700',
    dot: 'bg-pink-500',
  },
  DELIVERED: {
    label: 'Entregado',
    description: 'Pedido completado con éxito',
    gradient: 'from-emerald-500 to-green-600',
    ring: 'ring-emerald-200',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  CANCELLED: {
    label: 'Cancelado',
    description: 'El comercio canceló este pedido',
    gradient: 'from-red-500 to-rose-600',
    ring: 'ring-red-200',
    text: 'text-red-700',
    dot: 'bg-red-500',
  },
};

const ACTION_META: Record<string, { label: string; icon: typeof Truck; confirm?: string; subtle: string }> = {
  SHIPPED: {
    label: 'Retiré el pedido',
    icon: Package,
    subtle: 'Confirmá cuando tengas el pedido en mano',
  },
  ARRIVED: {
    label: 'Llegué al domicilio',
    icon: MapPin,
    subtle: 'Marcalo cuando estés en la puerta del cliente',
  },
  DELIVERED: {
    label: 'Entregué el pedido',
    icon: CheckCircle2,
    confirm: '¿Confirmás que entregaste el pedido al cliente? Esta acción no se puede deshacer.',
    subtle: 'Solo después de que el cliente lo recibió',
  },
};

const TIMELINE = ['READY', 'SHIPPED', 'ARRIVED', 'DELIVERED'] as const;

function parseAddress(raw: string | null): {
  full: string;
  primary: string;
  secondary: string | null;
  lat?: number;
  lng?: number;
} {
  if (!raw) return { full: '', primary: '', secondary: null };

  // Si no es JSON, usar el string tal cual
  const trimmed = raw.trim();
  if (!trimmed.startsWith('{')) {
    return { full: trimmed, primary: trimmed, secondary: null };
  }

  try {
    const obj = JSON.parse(trimmed);

    // Formato simple: { method, address, lat, lng } o { address }
    if (obj.address && typeof obj.address === 'string') {
      const addr = obj.address.trim();
      const city = obj.city || obj.localidad || null;
      const province = obj.province || null;
      const apt = obj.apartment || obj.depto || null;
      const secondary =
        [apt && `Depto ${apt}`, city, province].filter(Boolean).join(' · ') || null;
      return {
        full: [addr, apt && `Depto ${apt}`, city].filter(Boolean).join(', '),
        primary: addr,
        secondary,
        lat: typeof obj.lat === 'number' ? obj.lat : undefined,
        lng: typeof obj.lng === 'number' ? obj.lng : undefined,
      };
    }

    // Formato detallado: { street, number, apartment, city }
    const street = [obj.street, obj.number].filter(Boolean).join(' ').trim();
    const apt = obj.apartment ? `Depto ${obj.apartment}` : null;
    const city = obj.city || null;
    const secondary = [apt, city].filter(Boolean).join(' · ') || null;
    if (street) {
      return {
        full: [street, apt, city].filter(Boolean).join(', '),
        primary: street,
        secondary,
      };
    }

    // Fallback: si tiene cualquier string adentro, usarlo
    const anyString = Object.values(obj).find(
      (v) => typeof v === 'string' && v.trim().length > 0,
    ) as string | undefined;
    if (anyString) {
      return { full: anyString, primary: anyString, secondary: null };
    }

    return { full: '', primary: '', secondary: null };
  } catch {
    return { full: trimmed, primary: trimmed, secondary: null };
  }
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buen día';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

// ─── Page ───────────────────────────────────────────────────
export default function DeliveryPage() {
  const params = useParams();
  const token = params.token as string;
  const [order, setOrder] = useState<DeliveryOrderPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justAdvanced, setJustAdvanced] = useState(false);
  const previousStatus = useRef<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordError, setWordError] = useState<string | null>(null);
  const [wordCooldownUntil, setWordCooldownUntil] = useState<number>(0);
  const [, setCooldownTick] = useState(0);
  const [mapsOpenedBeforePickup, setMapsOpenedBeforePickup] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const data = await publicApi.getDeliveryByToken(token);
      setOrder(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'No pudimos cargar el pedido');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 30000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  // Trigger flash effect when status changes
  useEffect(() => {
    if (order?.status && previousStatus.current && previousStatus.current !== order.status) {
      setJustAdvanced(true);
      const t = setTimeout(() => setJustAdvanced(false), 1500);
      return () => clearTimeout(t);
    }
    previousStatus.current = order?.status || null;
  }, [order?.status]);

  const handleAdvance = async () => {
    if (!order?.nextStatus) return;
    // If the next status is DELIVERED and pickup word is required, do NOT advance plainly.
    // That flow is handled by the word-selection UI below.
    if (order.nextStatus === 'DELIVERED' && order.requiresPickupWord) return;
    const meta = ACTION_META[order.nextStatus];
    if (meta?.confirm && !window.confirm(meta.confirm)) return;

    setAdvancing(true);
    try {
      await publicApi.advanceDelivery(token);
      await fetchOrder();
    } catch (e: any) {
      alert(e?.message || 'Error al actualizar el estado');
    } finally {
      setAdvancing(false);
    }
  };

  const handleConfirmWord = async (word: string) => {
    setAdvancing(true);
    setWordError(null);
    try {
      await publicApi.confirmDeliveryWord(token, word);
      setSelectedWord(null);
      await fetchOrder();
    } catch (e: any) {
      const msg = e?.message || 'No pudimos confirmar la entrega';
      setWordError(msg);
      setSelectedWord(null);
      // If server blocked, kick off a 30s local cooldown too
      if (/intentos|esperá|probá/i.test(msg)) {
        setWordCooldownUntil(Date.now() + 30_000);
      }
    } finally {
      setAdvancing(false);
    }
  };

  // Cooldown ticker (re-render every sec while blocked)
  useEffect(() => {
    if (wordCooldownUntil <= Date.now()) return;
    const int = setInterval(() => setCooldownTick((t) => t + 1), 1000);
    return () => clearInterval(int);
  }, [wordCooldownUntil]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-slate-200" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-slate-900 animate-spin" />
          </div>
          <p className="text-sm text-slate-500">Cargando pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-6 text-center">
        <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center mb-5">
          <AlertTriangle className="w-10 h-10 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Link inválido</h1>
        <p className="text-slate-600 max-w-sm">{error || 'Este link no existe o ya expiró. Pedile al comercio que te envíe uno nuevo.'}</p>
      </div>
    );
  }

  if ((order as any).archived) {
    const wasCancelled = order.status === 'CANCELLED';
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-6 text-center">
        <div className={`h-24 w-24 rounded-full flex items-center justify-center mb-6 shadow-lg ${wasCancelled ? 'bg-slate-200' : 'bg-emerald-100'}`}>
          {wasCancelled ? (
            <XCircle className="w-12 h-12 text-slate-500" />
          ) : (
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {wasCancelled ? 'Pedido cancelado' : '¡Pedido entregado!'}
        </h1>
        <p className="text-slate-600 max-w-sm leading-relaxed">
          {wasCancelled
            ? 'Este pedido fue cancelado. Ya no hay nada por hacer acá.'
            : 'Gracias por tu trabajo. Este pedido ya fue entregado y el link se cerró.'}
        </p>
        {order.tenant?.name && (
          <p className="text-xs text-slate-400 mt-6">— {order.tenant.name} —</p>
        )}
      </div>
    );
  }

  const statusMeta = STATUS_META[order.status] || STATUS_META.READY;
  const address = parseAddress(order.shippingAddress);
  // Preferimos coordenadas exactas si están disponibles (autocomplete de Google Places)
  const mapsUrl =
    address.lat != null && address.lng != null
      ? `https://www.google.com/maps/dir/?api=1&destination=${address.lat},${address.lng}${address.full ? `&destination_place_id=${encodeURIComponent('')}` : ''}`
      : address.full
        ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address.full)}`
        : null;
  const action = order.nextStatus ? ACTION_META[order.nextStatus] : null;
  const ActionIcon = action?.icon;
  const isFinal = order.status === 'DELIVERED' || order.status === 'CANCELLED';
  const currentStepIndex = TIMELINE.indexOf(order.status as any);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
      {/* ─── Sticky Header ───────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-md mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {order.tenant.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={order.tenant.logo} alt={order.tenant.name} className="h-9 w-9 rounded-lg object-cover" />
            ) : (
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center text-white font-bold text-sm">
                {order.tenant.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider leading-none">TurnoLink Delivery</p>
              <p className="text-sm font-bold text-slate-900 truncate">{order.tenant.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider leading-none">Pedido</p>
            <p className="text-base font-bold text-slate-900 leading-tight">{order.orderNumber}</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-5 pt-6 pb-32 space-y-5">
        {/* ─── Greeting + status hero ───────────────── */}
        <section className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${statusMeta.gradient} p-6 text-white shadow-xl shadow-slate-900/10 transition-all ${justAdvanced ? 'scale-[1.02] ring-4 ring-white/40' : ''}`}>
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/10 rounded-full blur-2xl" />

          <div className="relative">
            {order.deliveryEmployeeName && (
              <p className="text-white/90 text-sm font-medium mb-1 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                {getGreeting()}, {order.deliveryEmployeeName.split(' ')[0]}
              </p>
            )}
            <h1 className="text-2xl font-bold mb-1">{statusMeta.label}</h1>
            <p className="text-white/80 text-sm">{statusMeta.description}</p>

            {/* Timeline pills */}
            {!isFinal && (
              <div className="mt-5 flex items-center gap-1.5">
                {TIMELINE.slice(0, 3).map((step, i) => {
                  const reached = i <= currentStepIndex;
                  return (
                    <div
                      key={step}
                      className={`flex-1 h-1.5 rounded-full transition-all ${reached ? 'bg-white' : 'bg-white/25'}`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ─── Cliente card ─────────────────────────── */}
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
            <Home className="h-3.5 w-3.5 text-slate-400" />
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Destino</h2>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <p className="text-lg font-bold text-slate-900">{order.customerName}</p>
              {address.primary && (
                <div className="mt-1 text-sm text-slate-600">
                  <p>{address.primary}</p>
                  {address.secondary && <p className="text-slate-500 text-xs mt-0.5">{address.secondary}</p>}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {order.customerPhone ? (
                <a
                  href={`tel:${order.customerPhone}`}
                  className="flex items-center justify-center gap-2 px-3 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-semibold text-sm active:bg-emerald-100 active:scale-95 transition-all border border-emerald-100"
                >
                  <Phone className="w-4 h-4" />
                  Llamar
                </a>
              ) : (
                <div className="flex items-center justify-center gap-2 px-3 py-3 bg-slate-50 text-slate-400 rounded-xl font-medium text-sm border border-slate-100">
                  <Phone className="w-4 h-4" />
                  Sin teléfono
                </div>
              )}
              {mapsUrl ? (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (order.status === 'READY') {
                      e.preventDefault();
                      setMapsOpenedBeforePickup(true);
                      return;
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-3 py-3 bg-blue-50 text-blue-700 rounded-xl font-semibold text-sm active:bg-blue-100 active:scale-95 transition-all border border-blue-100"
                >
                  <Navigation className="w-4 h-4" />
                  Cómo llegar
                </a>
              ) : (
                <div className="flex items-center justify-center gap-2 px-3 py-3 bg-slate-50 text-slate-400 rounded-xl font-medium text-sm border border-slate-100">
                  <Navigation className="w-4 h-4" />
                  Sin dirección
                </div>
              )}
            </div>

            {order.notes && (
              <div className="flex gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <StickyNote className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <p className="font-semibold text-xs uppercase tracking-wide mb-0.5">Nota del cliente</p>
                  <p>{order.notes}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ─── Items + total ────────────────────────── */}
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
            <Receipt className="h-3.5 w-3.5 text-slate-400" />
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pedido ({order.items.length} items)</h2>
          </div>

          <ul className="divide-y divide-slate-100">
            {order.items.map((item, i) => (
              <li key={i} className="px-5 py-3 flex items-start gap-3">
                <span className="flex-shrink-0 inline-flex items-center justify-center h-7 min-w-[1.75rem] px-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm">
                  {item.quantity}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 leading-snug">
                    {item.productName}
                    {item.variantName && <span className="text-slate-500 font-normal"> · {item.variantName}</span>}
                  </p>
                  {item.itemNotes && (
                    <p className="text-xs text-slate-500 italic mt-0.5 leading-snug">"{item.itemNotes}"</p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total a cobrar</span>
            <span className="text-xl font-bold text-slate-900">${order.total.toLocaleString('es-AR')}</span>
          </div>
        </section>

        {/* ─── Final state messages ─────────────────── */}
        {order.status === 'DELIVERED' && (
          <section className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6 text-center">
            <div className="inline-flex h-16 w-16 rounded-full bg-emerald-500 items-center justify-center mb-3 shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <p className="text-lg font-bold text-emerald-900">¡Pedido entregado!</p>
            <p className="text-sm text-emerald-700 mt-1">Buen trabajo. Ya podés cerrar esta página.</p>
          </section>
        )}

        {/* ─── Pickup word confirmation ──────────────── */}
        {order.requiresPickupWord && order.pickupWordOptions && order.pickupWordOptions.length > 0 && !isFinal && (
          <section className="bg-white rounded-2xl border-2 border-slate-900 shadow-xl shadow-slate-900/10 overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">Confirmar entrega</p>
              </div>
              <h3 className="text-lg font-bold leading-tight">Preguntale al cliente su palabra clave</h3>
              <p className="text-[13px] text-white/70 mt-1 leading-snug">
                El cliente la tiene en su pantalla. Tocá la palabra que te diga.
              </p>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-2 gap-2.5">
                {order.pickupWordOptions.map((w) => {
                  const remainingMs = wordCooldownUntil - Date.now();
                  const blocked = remainingMs > 0;
                  return (
                    <button
                      key={w}
                      type="button"
                      disabled={advancing || blocked}
                      onClick={() => setSelectedWord(w)}
                      className="h-14 rounded-xl border-2 border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 active:scale-[0.97] transition-all text-base font-bold text-slate-900 tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {w}
                    </button>
                  );
                })}
              </div>

              {wordError && wordCooldownUntil <= Date.now() && (
                <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 leading-snug">{wordError}</p>
                </div>
              )}

              {wordCooldownUntil > Date.now() && (
                <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-800 font-medium">
                    Demasiados intentos. Probá en {Math.ceil((wordCooldownUntil - Date.now()) / 1000)}s
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ─── Confirmation modal ─────────────────────── */}
        {selectedWord && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
              <div className="p-6 text-center">
                <div className="inline-flex h-14 w-14 rounded-full bg-slate-900 items-center justify-center mb-4">
                  <CheckCircle2 className="h-7 w-7 text-white" />
                </div>
                <p className="text-sm text-slate-500 mb-1">Confirmás que el cliente te dijo:</p>
                <p className="text-3xl font-black text-slate-900 tracking-wider mb-5">{selectedWord}</p>
                <p className="text-xs text-slate-400 mb-6">Esta acción cierra el pedido y no se puede deshacer.</p>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedWord(null)}
                    disabled={advancing}
                    className="flex-1 h-12 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm active:scale-[0.97] transition-all disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirmWord(selectedWord)}
                    disabled={advancing}
                    className="flex-1 h-12 rounded-xl bg-slate-900 text-white font-semibold text-sm active:scale-[0.97] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {advancing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {order.status === 'CANCELLED' && (
          <section className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <div className="inline-flex h-16 w-16 rounded-full bg-red-500 items-center justify-center mb-3">
              <XCircle className="h-8 w-8 text-white" />
            </div>
            <p className="text-lg font-bold text-red-900">Pedido cancelado</p>
            <p className="text-sm text-red-700 mt-1">El comercio canceló este pedido.</p>
          </section>
        )}
      </main>

      {/* ─── Sticky action button at bottom ─────────── */}
      {action && ActionIcon && !isFinal && !order.requiresPickupWord && (() => {
        const needsPickupReminder = order.status === 'READY' && mapsOpenedBeforePickup;
        return (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-white via-white to-white/0 pt-6 pb-5 px-5">
          <div className="max-w-md mx-auto space-y-2.5">
            {needsPickupReminder && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-50 border-2 border-amber-300 shadow-lg shadow-amber-500/10 animate-pulse-cta">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-900 font-medium leading-snug">
                  <span className="font-bold">¡Pará!</span> Antes de salir, <span className="underline">confirmá que tenés el pedido en mano</span> tocando el botón de abajo.
                </p>
              </div>
            )}
            <button
              onClick={handleAdvance}
              disabled={advancing}
              className={`group w-full text-white py-4 rounded-2xl font-semibold text-base flex items-center justify-between gap-3 active:scale-[0.98] transition-all disabled:opacity-50 shadow-2xl ${
                needsPickupReminder
                  ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/50 ring-4 ring-amber-300/60 animate-pulse-cta'
                  : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/30'
              }`}
            >
              <div className="flex items-center gap-3 pl-2">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                  {advancing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ActionIcon className="w-5 h-5" />
                  )}
                </div>
                <div className="text-left">
                  <p className="font-bold leading-tight">{action.label}</p>
                  <p className="text-[11px] text-white/60 font-normal leading-tight mt-0.5">{action.subtle}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/60 mr-2 group-active:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
