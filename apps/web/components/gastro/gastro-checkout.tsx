'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ShoppingBag, User, CheckCircle2, Loader2, AlertCircle, MapPin, ArrowRight, Truck, Wallet, CreditCard, Pencil, WifiOff } from 'lucide-react';
import { useGastroCartStore, type OrderType } from '@/lib/gastro-cart-store';
import { OrderModeSelector } from './order-mode-selector';
import { publicApi } from '@/lib/api';
import { AddressAutocomplete, type SelectedAddress } from '@/components/ui/address-autocomplete';

interface Props {
  slug: string;
  tenantName: string;
  whatsappNumber: string;
  hasMercadoPago: boolean;
  formatPrice: (price: number) => string;
  onClose: () => void;
  onComplete: (orderNumber: string) => void;
}

type Step = 'review' | 'customer' | 'payment' | 'processing' | 'done' | 'error';

const STEP_LABELS: Record<string, string> = {
  review: 'Pedido',
  customer: 'Datos',
  payment: 'Pago',
};
const STEP_ORDER: Step[] = ['review', 'customer', 'payment'];

function StepIndicator({ current }: { current: Step }) {
  const idx = STEP_ORDER.indexOf(current);
  if (idx < 0) return null;

  return (
    <div className="flex items-center justify-center gap-1 px-4 pt-3 pb-1">
      {STEP_ORDER.map((s, i) => {
        const isActive = i === idx;
        const isDone = i < idx;
        return (
          <div key={s} className="flex items-center gap-1">
            {i > 0 && (
              <div className={`w-8 h-0.5 rounded-full transition-colors ${isDone ? 'bg-[hsl(var(--tenant-primary-500))]' : 'bg-slate-200 dark:bg-neutral-700'}`} />
            )}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
              isActive
                ? 'bg-[hsl(var(--tenant-primary-500)_/_0.1)] text-[hsl(var(--tenant-primary-700))] dark:text-[hsl(var(--tenant-primary-300))]'
                : isDone
                  ? 'text-[hsl(var(--tenant-primary-500))]'
                  : 'text-slate-400 dark:text-neutral-500'
            }`}>
              <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                isActive
                  ? 'bg-[hsl(var(--tenant-primary-500))] text-white'
                  : isDone
                    ? 'bg-[hsl(var(--tenant-primary-500))] text-white'
                    : 'bg-slate-200 dark:bg-neutral-700 text-slate-500 dark:text-neutral-400'
              }`}>
                {isDone ? '✓' : i + 1}
              </span>
              <span className="hidden sm:inline">{STEP_LABELS[s]}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function GastroCheckout({ slug, tenantName, whatsappNumber, hasMercadoPago, formatPrice, onClose, onComplete }: Props) {
  const items = useGastroCartStore((s) => s.items);
  const getTotal = useGastroCartStore((s) => s.getTotal);
  const orderType = useGastroCartStore((s) => s.orderType);
  const tableNumber = useGastroCartStore((s) => s.tableNumber);
  const deliveryAddress = useGastroCartStore((s) => s.deliveryAddress);
  const clearCart = useGastroCartStore((s) => s.clearCart);
  const setOrderType = useGastroCartStore((s) => s.setOrderType);
  const setTableNumber = useGastroCartStore((s) => s.setTableNumber);

  const [step, setStep] = useState<Step>('review');
  const [editingMode, setEditingMode] = useState(false);
  // Nuevo flujo gastro: el cliente NO elige pago al enviar.
  // El pago se elige después que el comercio acepte (en página de tracking).
  const paymentMethod: null = null;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState(deliveryAddress);
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
  const [notes, setNotes] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState('');
  const [errorDetail, setErrorDetail] = useState('');
  const [errorKind, setErrorKind] = useState<'network' | 'validation' | 'stock' | 'server' | 'unknown'>('unknown');
  const [showDetail, setShowDetail] = useState(false);

  const total = getTotal();
  const orderTypeLabel = orderType === 'DINE_IN' ? 'En el local' :
    orderType === 'TAKE_AWAY' ? 'Para llevar' : 'Delivery';

  const isCustomerValid = name.length >= 2 && phone.length >= 6;
  const isDeliveryValid = orderType !== 'DELIVERY' || selectedAddress !== null || address.length >= 5;

  const [submitting, setSubmitting] = useState(false);

  // Si el usuario vuelve desde Mercado Pago con el botón atrás del navegador,
  // la página se restaura desde bfcache con el estado congelado (spinner pegado).
  // Reseteamos submitting/step para que pueda reintentar.
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        setSubmitting(false);
        setError('');
        if (step === 'processing') setStep('payment');
      }
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, [step]);
  const handleSubmit = async () => {
    setStep('processing');
    setError('');
    try {
      const result = await publicApi.createOrder(slug, {
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          options: item.options.length > 0 ? JSON.stringify(item.options) : undefined,
          itemNotes: item.itemNotes || undefined,
        })),
        customer: { name, email: email || undefined, phone },
        shipping: orderType === 'DELIVERY'
          ? {
              method: 'envio' as const,
              address,
              formattedAddress: selectedAddress?.formattedAddress,
              lat: selectedAddress?.lat,
              lng: selectedAddress?.lng,
              province: selectedAddress?.province,
              placeId: selectedAddress?.placeId,
            }
          : { method: 'retiro' as const },
        // Sin paymentMethod: el backend marca el pedido como awaitingPayment.
        // El cliente elegirá efectivo/MP en la página de tracking, después
        // de que el comercio acepte el pedido.
        orderType: orderType || undefined,
        tableNumber: orderType === 'DINE_IN' ? tableNumber : undefined,
        notes: notes || undefined,
      });

      setOrderNumber(result.order.orderNumber);
      // Save active order so user can return to tracking page
      useGastroCartStore.getState().setActiveOrder(slug, result.order.orderNumber);
      setStep('done');
      clearCart();
    } catch (err: any) {
      const raw = err?.message || '';
      const lower = raw.toLowerCase();
      let kind: typeof errorKind = 'unknown';
      let friendly = 'No pudimos enviar tu pedido. Por favor probá de nuevo en unos segundos.';

      if (!navigator.onLine || lower.includes('failed to fetch') || lower.includes('network')) {
        kind = 'network';
        friendly = 'No hay conexión a internet. Revisá tu wifi o datos móviles e intentá de nuevo.';
      } else if (lower.includes('stock')) {
        kind = 'stock';
        friendly = 'Uno de los productos de tu pedido se quedó sin stock. Volvé al carrito y revisá las cantidades.';
      } else if (lower.includes('cupón') || lower.includes('cupon') || lower.includes('coupon')) {
        kind = 'validation';
        friendly = 'Hay un problema con el cupón de descuento. Probá quitarlo o usar otro.';
      } else if (lower.includes('validación') || lower.includes('validation') || lower.includes('400')) {
        kind = 'validation';
        friendly = 'Algunos datos del pedido están incompletos. Revisá tus datos y volvé a enviar.';
      } else if (lower.includes('500') || lower.includes('server')) {
        kind = 'server';
        friendly = 'El comercio tuvo un problema técnico recibiendo tu pedido. Probá de nuevo en un momento.';
      } else if (raw) {
        friendly = raw;
      }

      setErrorKind(kind);
      setError(friendly);
      setErrorDetail(raw);
      setShowDetail(false);
      setStep('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={step !== 'processing' ? onClose : undefined} />

      <div className="relative w-full max-w-lg max-h-[92vh] bg-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Drag handle */}
        <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-slate-300 dark:bg-neutral-600 z-10" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-0 flex-shrink-0">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {step === 'processing' ? 'Enviando pedido...' :
             step === 'done' ? 'Pedido enviado!' :
             step === 'error' ? 'Error' : 'Confirmar pedido'}
          </h3>
          {step !== 'processing' && (
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-400 dark:text-neutral-500" />
            </button>
          )}
        </div>

        {/* Step indicator */}
        {STEP_ORDER.includes(step) && <StepIndicator current={step} />}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Step 1: Review */}
          {step === 'review' && (
            <div className="space-y-4">
              {/* Order mode — full selector if missing or editing, pill otherwise */}
              {!orderType || editingMode ? (
                <div className="py-2">
                  <OrderModeSelector
                    orderType={orderType}
                    onSelectType={(t) => { setOrderType(t); setEditingMode(false); }}
                    primaryColor=""
                    showReservation={false}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingMode(true)}
                  title="Cambiar modo"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[hsl(var(--tenant-primary-500)_/_0.06)] dark:bg-[hsl(var(--tenant-primary-500)_/_0.12)] border border-[hsl(var(--tenant-primary-500)_/_0.15)] hover:bg-[hsl(var(--tenant-primary-500)_/_0.12)] transition-colors cursor-pointer"
                >
                  {orderType === 'DELIVERY' ? <Truck className="w-4 h-4 text-[hsl(var(--tenant-primary-500))]" /> : <ShoppingBag className="w-4 h-4 text-[hsl(var(--tenant-primary-500))]" />}
                  <span className="text-sm font-semibold text-[hsl(var(--tenant-primary-700))] dark:text-[hsl(var(--tenant-primary-300))]">
                    {orderTypeLabel}
                  </span>
                  <Pencil className="w-3 h-3 text-slate-400 dark:text-neutral-500 ml-1" />
                  <span className="text-[10px] text-slate-400 dark:text-neutral-500">cambiar</span>
                </button>
              )}

              {/* Items */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-800/50">
                    {item.image && (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-neutral-700">
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        <span className="text-slate-400 dark:text-neutral-500">{item.quantity}x</span> {item.name}
                      </p>
                      {item.options.length > 0 && (
                        <p className="text-xs text-slate-500 dark:text-neutral-500 truncate">{item.options.map(o => o.value).join(' · ')}</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-neutral-700">
                <span className="text-sm font-medium text-slate-500 dark:text-neutral-400">Total</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">{formatPrice(total)}</span>
              </div>

            </div>
          )}

          {/* Step 2: Customer */}
          {step === 'customer' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400">Nombre *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  autoFocus
                  className="mt-1.5 w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--tenant-primary-500))] focus:border-transparent placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400">Teléfono *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="11 1234-5678"
                  className="mt-1.5 w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--tenant-primary-500))] focus:border-transparent placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-neutral-500">Email <span className="normal-case">(opcional)</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="mt-1.5 w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--tenant-primary-500))] focus:border-transparent placeholder:text-slate-400"
                />
              </div>

              {orderType === 'DELIVERY' && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Dirección de entrega *
                  </label>
                  <div className="mt-1.5">
                    <AddressAutocomplete
                      value={address}
                      onChange={setAddress}
                      onSelect={setSelectedAddress}
                      placeholder="Empezá a escribir tu dirección..."
                      className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--tenant-primary-500))] focus:border-transparent placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-neutral-500">Notas <span className="normal-case">(opcional)</span></label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Indicaciones especiales..."
                  rows={2}
                  className="mt-1.5 w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--tenant-primary-500))] focus:border-transparent resize-none placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          {/* Processing */}
          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-slate-100 dark:border-neutral-800" />
                <Loader2 className="absolute inset-0 w-16 h-16 text-[hsl(var(--tenant-primary-500))] animate-spin" strokeWidth={2.5} />
              </div>
              <p className="mt-5 text-sm font-medium text-slate-600 dark:text-neutral-400">Enviando tu pedido...</p>
              <p className="text-xs text-slate-400 dark:text-neutral-500 mt-1">Esto toma unos segundos</p>
            </div>
          )}

          {/* Done */}
          {step === 'done' && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4 ring-8 ring-emerald-50/50 dark:ring-emerald-900/10">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">Pedido enviado</h4>
              <div className="mt-3 px-4 py-2 rounded-lg bg-slate-100 dark:bg-neutral-800">
                <p className="text-2xl font-bold text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))] tracking-wider">{orderNumber}</p>
              </div>

              <div className="mt-4 w-full max-w-[340px] rounded-xl border border-[hsl(var(--tenant-primary-500)_/_0.25)] bg-[hsl(var(--tenant-primary-500)_/_0.06)] px-4 py-3 flex items-start gap-2.5">
                <Wallet className="w-4 h-4 text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))] shrink-0 mt-0.5" />
                <p className="text-[13px] text-slate-700 dark:text-neutral-300 leading-relaxed text-left">
                  Vas a poder elegir el <span className="font-semibold text-slate-900 dark:text-white">método de pago</span> cuando el comercio confirme tu pedido.
                </p>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-3 max-w-[300px]">
                Dejá esta pantalla abierta o tocá el botón para ver el seguimiento en vivo.
              </p>

              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola! Acabo de hacer el pedido ${orderNumber}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#1fb855] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                >
                  Consultar por WhatsApp
                </a>
              )}
            </div>
          )}

          {/* Error */}
          {step === 'error' && (
            <div className="flex flex-col items-center justify-center py-6 px-2 text-center">
              <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-5 ring-8 ring-red-50/50 dark:ring-red-900/10">
                {errorKind === 'network' ? (
                  <WifiOff className="w-10 h-10 text-red-500" />
                ) : (
                  <AlertCircle className="w-10 h-10 text-red-500" />
                )}
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                {errorKind === 'network' ? 'Sin conexión'
                  : errorKind === 'stock' ? 'Sin stock'
                  : errorKind === 'validation' ? 'Revisá los datos'
                  : errorKind === 'server' ? 'Problema técnico'
                  : 'No pudimos enviar tu pedido'}
              </h4>
              <p className="text-sm text-slate-600 dark:text-neutral-300 mt-2 max-w-[320px] leading-relaxed">
                {error}
              </p>

              {errorDetail && errorDetail !== error && (
                <button
                  type="button"
                  onClick={() => setShowDetail((v) => !v)}
                  className="mt-4 text-[11px] text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 underline underline-offset-2"
                >
                  {showDetail ? 'Ocultar detalle técnico' : 'Ver detalle técnico'}
                </button>
              )}

              {showDetail && errorDetail && (
                <div className="mt-2 max-w-full w-full">
                  <pre className="text-[10px] text-left text-slate-500 dark:text-neutral-400 bg-slate-50 dark:bg-neutral-800 border border-slate-100 dark:border-neutral-700 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-words">
{errorDetail}
                  </pre>
                </div>
              )}

              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola! Estoy intentando hacer un pedido en ${tenantName} pero me sale un error: "${error}". ¿Pueden ayudarme?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#1fb855] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                >
                  Avisar al comercio por WhatsApp
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'processing' && (
          <div className="flex-shrink-0 border-t border-slate-100 dark:border-neutral-800 p-5 flex gap-2.5">
            {step === 'review' && (
              <>
                <button onClick={onClose} className="px-4 h-[44px] text-sm font-medium border border-slate-200 dark:border-neutral-700 text-slate-500 dark:text-neutral-400 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors">
                  Volver
                </button>
                <button
                  onClick={() => setStep('customer')}
                  disabled={!orderType}
                  className={`flex-1 h-[44px] font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                    orderType
                      ? 'bg-[hsl(var(--tenant-primary-500))] hover:bg-[hsl(var(--tenant-primary-600))] text-white shadow-md shadow-[hsl(var(--tenant-primary-500)_/_0.25)] active:scale-[0.98]'
                      : 'bg-slate-200 dark:bg-neutral-700 text-slate-400 dark:text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  {!orderType ? 'Seleccioná un modo' : 'Continuar'} {orderType && <ArrowRight className="w-4 h-4" />}
                </button>
              </>
            )}

            {step === 'customer' && (
              <div className="flex flex-col gap-2 w-full">
                <p className="text-[11px] text-center text-slate-500 dark:text-neutral-400 px-2">
                  Vas a poder elegir cómo pagar (efectivo o Mercado Pago) cuando el comercio confirme tu pedido.
                </p>
                <div className="flex gap-2.5">
                  <button onClick={() => setStep('review')} className="px-4 h-[44px] text-sm font-medium border border-slate-200 dark:border-neutral-700 text-slate-500 dark:text-neutral-400 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors">
                    Atrás
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!isCustomerValid || !isDeliveryValid}
                    className={`flex-1 h-[44px] font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                      isCustomerValid && isDeliveryValid
                        ? 'bg-[hsl(var(--tenant-primary-500))] hover:bg-[hsl(var(--tenant-primary-600))] text-white shadow-md shadow-[hsl(var(--tenant-primary-500)_/_0.25)] active:scale-[0.98]'
                        : 'bg-slate-200 dark:bg-neutral-700 text-slate-400 dark:text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    Enviar pedido al comercio <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 'error' && (
              <>
                <button onClick={onClose} className="px-4 h-[44px] text-sm font-medium border border-slate-200 dark:border-neutral-700 text-slate-500 dark:text-neutral-400 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors">
                  Cerrar
                </button>
                <button
                  onClick={errorKind === 'stock' ? onClose : handleSubmit}
                  className="flex-1 h-[44px] bg-[hsl(var(--tenant-primary-500))] hover:bg-[hsl(var(--tenant-primary-600))] text-white font-semibold text-sm rounded-xl shadow-md shadow-[hsl(var(--tenant-primary-500)_/_0.25)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {errorKind === 'stock' ? 'Volver al carrito' : (<><Loader2 className="w-4 h-4 hidden" /> Reintentar envío</>)}
                </button>
              </>
            )}

            {step === 'done' && (
              <button
                onClick={() => { onComplete(orderNumber); onClose(); }}
                className="w-full h-[44px] bg-[hsl(var(--tenant-primary-500))] hover:bg-[hsl(var(--tenant-primary-600))] text-white font-semibold text-sm rounded-xl shadow-md shadow-[hsl(var(--tenant-primary-500)_/_0.35)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 animate-pulse-cta relative overflow-hidden group"
              >
                <span>Ver seguimiento</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 animate-nudge" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
