'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NextImage from 'next/image';
import {
  ChevronLeft,
  Loader2,
  ShoppingBag,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  Package,
  Lock,
  Tag,
  X,
  Check,
  Truck,
  Store,
  CreditCard,
  Banknote,
  Building2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { publicApi, type TenantBranding, type TenantPublic } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { AddressAutocomplete, type SelectedAddress } from '@/components/ui/address-autocomplete';

interface CheckoutFormProps {
  tenant: TenantPublic;
  branding: TenantBranding | null;
  slug: string;
}

export default function CheckoutForm({ tenant, branding, slug }: CheckoutFormProps) {
  const router = useRouter();

  const items = useCartStore((s) => s.items);
  const storeSlug = useCartStore((s) => s.slug);
  const clearCart = useCartStore((s) => s.clearCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const hydrated = useCartStore((s) => s._hydrated);
  const [mounted, setMounted] = useState(false);

  // Form
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', telefono: '', dni: '',
    envioMetodo: '' as '' | 'retiro' | 'envio',
    envioDir: '', envioCiudad: '', envioCp: '',
    envioDepto: '',
    aclaraciones: '',
    pagoMetodo: '' as '' | 'mercadopago' | 'transferencia' | 'efectivo',
  });
  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<{ valid: boolean; discount: number; message?: string } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const updateField = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  // Colors from branding
  const primaryColor = branding?.primaryColor || tenant?.settings?.primaryColor || '#111827';
  const bgColor = branding?.backgroundColor || '#FFFFFF';

  // Luminance check
  const isDark = (hex: string): boolean => {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 140;
  };

  const darkMode = isDark(bgColor);
  const navBg = isDark(bgColor) ? bgColor : '#111827';

  // Shift a hex color lighter/darker
  const shiftColor = (hex: string, amount: number): string => {
    const c = hex.replace('#', '');
    const r = Math.min(255, Math.max(0, parseInt(c.substring(0, 2), 16) + amount));
    const g = Math.min(255, Math.max(0, parseInt(c.substring(2, 4), 16) + amount));
    const b = Math.min(255, Math.max(0, parseInt(c.substring(4, 6), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Adaptive page & card colors
  const pageColors = darkMode ? {
    pageBg: bgColor,
    cardBg: shiftColor(bgColor, 12),
    cardBorder: shiftColor(bgColor, 35),
    text: '#f1f5f9',
    muted: '#94a3b8',
    subtle: '#64748b',
    inputBg: shiftColor(bgColor, 18),
    inputBorder: shiftColor(bgColor, 40),
    divider: shiftColor(bgColor, 25),
  } : {
    pageBg: '#f8f9fa',
    cardBg: '#ffffff',
    cardBorder: '#e5e7eb',
    text: '#111827',
    muted: '#374151',
    subtle: '#9ca3af',
    inputBg: '#ffffff',
    inputBorder: '#e5e7eb',
    divider: '#f3f4f6',
  };

  // Gradient from branding
  const gradientEnabled = branding?.gradientEnabled ?? false;
  const gradientFrom = branding?.gradientFrom || '#ffffff';
  const gradientTo = branding?.gradientTo || '#111827';

  const buildSmoothGradient = (fromHex: string, toHex: string): string => {
    const parseHex = (hex: string) => {
      const hc = hex.replace('#', '');
      return [parseInt(hc.substring(0, 2), 16), parseInt(hc.substring(2, 4), 16), parseInt(hc.substring(4, 6), 16)];
    };
    const rgbToHex = (rv: number, gv: number, bv: number) =>
      '#' + Math.round(rv).toString(16).padStart(2, '0') + Math.round(gv).toString(16).padStart(2, '0') + Math.round(bv).toString(16).padStart(2, '0');
    const fc = parseHex(fromHex);
    const tc = parseHex(toHex);
    const mix = (a: number, b2: number, t: number) => a + (b2 - a) * t;
    const stops: Array<[number, number]> = [
      [0, 0], [15, 0], [20, 0.05], [26, 0.12], [33, 0.22],
      [40, 0.35], [48, 0.5], [55, 0.62], [62, 0.74], [70, 0.84],
      [78, 0.91], [85, 0.95], [92, 0.98], [100, 1],
    ];
    const css = stops.map(function(s) {
      return rgbToHex(mix(fc[0], tc[0], s[1]), mix(fc[1], tc[1], s[1]), mix(fc[2], tc[2], s[1])) + ' ' + s[0] + '%';
    }).join(', ');
    return 'linear-gradient(180deg, ' + css + ')';
  };

  const logoUrl = branding?.logoUrl || tenant?.logo;
  const storeName = branding?.welcomeTitle || tenant?.name || '';

  // Validation
  const isContactValid = form.nombre.trim().length >= 2 && form.apellido.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && form.telefono.trim().length >= 6;
  const isShippingValid =
    form.envioMetodo === 'retiro' ||
    (form.envioMetodo === 'envio' && selectedAddress !== null);
  const isPaymentValid = form.pagoMetodo !== '';
  const isFormValid = isContactValid && isShippingValid && isPaymentValid;

  // Totals
  const subtotal = (mounted && hydrated) ? items.reduce((s, i) => s + i.price * i.quantity, 0) : 0;
  const discount = couponResult?.valid ? couponResult.discount : 0;
  const total = Math.max(0, subtotal - discount);
  const itemCount = (mounted && hydrated) ? items.reduce((s, i) => s + i.quantity, 0) : 0;

  // Coupon validation
  const handleValidateCoupon = async () => {
    if (!couponCode.trim() || couponLoading) return;
    setCouponLoading(true);
    try {
      const result = await publicApi.validateCoupon(slug, couponCode.trim(), subtotal);
      setCouponResult(result);
    } catch {
      setCouponResult({ valid: false, discount: 0, message: 'Error al validar cupón' });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponResult(null);
  };

  // Submit
  const handleSubmitOrder = async () => {
    if (submitting || !isFormValid) return;
    setSubmitting(true);
    setError(null);

    try {
      const result = await publicApi.createOrder(slug, {
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
        customer: {
          name: `${form.nombre} ${form.apellido}`.trim(),
          email: form.email,
          phone: form.telefono,
          dni: form.dni || undefined,
        },
        shipping: {
          method: form.envioMetodo as 'retiro' | 'envio',
          address: (() => {
            const base = selectedAddress?.formattedAddress || form.envioDir || '';
            return form.envioDepto ? `${base} (${form.envioDepto})` : base || undefined;
          })(),
          formattedAddress: selectedAddress?.formattedAddress,
          city: selectedAddress?.city || form.envioCiudad || undefined,
          province: selectedAddress?.province,
          postalCode: selectedAddress?.postalCode || form.envioCp || undefined,
          lat: selectedAddress?.lat,
          lng: selectedAddress?.lng,
          placeId: selectedAddress?.placeId,
        },
        paymentMethod: form.pagoMetodo as 'mercadopago' | 'transferencia' | 'efectivo',
        couponCode: couponResult?.valid ? couponCode : undefined,
        notes: form.aclaraciones.trim() || undefined,
      });

      if (form.pagoMetodo === 'mercadopago' && result.initPoint) {
        clearCart();
        window.location.href = result.initPoint;
      } else {
        clearCart();
        router.push(`/${slug}/pedido/${encodeURIComponent(result.order.orderNumber)}`);
      }
    } catch (err: any) {
      setError(err.message || 'Error al crear el pedido');
      setSubmitting(false);
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // ─── Loading (wait for cart hydration) ──
  if (!mounted || !hydrated) {
    return null; // Server-rendered wrapper already shows correct bg
  }

  // ─── Empty cart (only after hydration to avoid flash) ──
  if (hydrated && (storeSlug !== slug || items.length === 0)) {
    return (
      <div className="min-h-screen flex flex-col">
        <nav className="h-14 flex items-center px-4" style={{ backgroundColor: navBg }}>
          <Link href={`/${slug}`} className="text-white/70 hover:text-white transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </nav>
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="h-20 w-20 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: darkMode ? shiftColor(bgColor, 18) : '#f3f4f6' }}>
            <ShoppingBag className="h-9 w-9" style={{ color: pageColors.subtle }} />
          </div>
          <h2 className="text-xl font-bold mb-1" style={{ color: pageColors.text }}>Carrito vacío</h2>
          <p className="text-sm mb-6" style={{ color: pageColors.muted }}>Agregá productos para continuar</p>
          <Link
            href={`/${slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            <ChevronLeft className="h-4 w-4" />
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  // ─── Checkout ────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={gradientEnabled
      ? { background: buildSmoothGradient(gradientFrom, gradientTo) }
      : { backgroundColor: pageColors.pageBg }
    }>
      <style>{`
        @keyframes ck-slideDown { from { opacity:0; max-height:0; } to { opacity:1; max-height:500px; } }
        @keyframes ck-fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .ck-input { width:100%; height:44px; padding:0 14px; border-radius:10px; border:1.5px solid ${pageColors.inputBorder}; font-size:14px; color:${pageColors.text}; background:${pageColors.inputBg}; outline:none; transition:border-color 0.2s, box-shadow 0.2s; }
        .ck-input:focus { border-color:${primaryColor}; box-shadow:0 0 0 3px ${primaryColor}20; }
        .ck-input::placeholder { color:${pageColors.subtle}; }
        .ck-label { display:block; font-size:12px; font-weight:600; color:${pageColors.muted}; margin-bottom:4px; letter-spacing:0.01em; }
      `}</style>

      {/* ─── Navbar ─────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 shadow-lg" style={{ backgroundColor: navBg }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center h-14 sm:h-16">
            <Link href={`/${slug}`} className="shrink-0 mr-3 text-white/60 hover:text-white transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            {logoUrl ? (
              <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 mr-2" style={{ border: '2px solid rgba(255,255,255,0.2)' }}>
                <NextImage src={logoUrl} alt={storeName} fill className="object-cover" sizes="32px" />
              </div>
            ) : null}
            <span className="text-white font-semibold text-sm truncate">{storeName}</span>
            <div className="flex-1" />
            <div className="flex items-center gap-1.5 text-white/50 text-xs">
              <Lock className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Compra segura</span>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Error ──────────────────────────────────────── */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 mt-4 w-full" style={{ animation: 'ck-fadeIn 0.3s ease-out' }}>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-3">
            <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
              <X className="h-3 w-3 text-red-500" />
            </div>
            <p className="text-sm text-red-700 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── Main Grid ──────────────────────────────────── */}
      <div className="flex-1 max-w-6xl mx-auto px-4 py-5 sm:py-8 w-full" ref={formRef}>
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">

          {/* ─── LEFT: Form ─────────────────────────────── */}
          <div className="lg:col-span-7 space-y-5">

            {/* Mobile: Order Summary Toggle */}
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setMobileCartOpen(!mobileCartOpen)}
                className="w-full flex items-center justify-between rounded-xl px-4 py-3 shadow-sm"
                style={{ backgroundColor: pageColors.cardBg, border: `1px solid ${pageColors.cardBorder}` }}
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" style={{ color: pageColors.subtle }} />
                  <span className="text-sm font-medium" style={{ color: pageColors.muted }}>
                    {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold" style={{ color: pageColors.text }}>{formatPrice(total)}</span>
                  {mobileCartOpen ? <ChevronUp className="h-4 w-4" style={{ color: pageColors.subtle }} /> : <ChevronDown className="h-4 w-4" style={{ color: pageColors.subtle }} />}
                </div>
              </button>
              {mobileCartOpen && (
                <div className="mt-2 rounded-xl shadow-sm overflow-hidden" style={{ animation: 'ck-slideDown 0.3s ease-out', backgroundColor: pageColors.cardBg, border: `1px solid ${pageColors.cardBorder}` }}>
                  <div className="max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3 p-3" style={{ borderBottom: `1px solid ${pageColors.divider}` }}>
                        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: darkMode ? shiftColor(bgColor, 18) : '#f9fafb', border: `1px solid ${pageColors.divider}` }}>
                          {item.image ? (
                            <NextImage src={item.image} alt={item.name} width={56} height={56} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package className="h-4 w-4" style={{ color: pageColors.subtle }} /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: pageColors.text }}>{item.name}</p>
                          <p className="text-xs" style={{ color: pageColors.subtle }}>x{item.quantity}</p>
                        </div>
                        <span className="text-sm font-semibold shrink-0" style={{ color: pageColors.text }}>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 1: Contacto */}
            <section className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: pageColors.cardBg, border: `1px solid ${pageColors.cardBorder}` }}>
              <div className="px-4 sm:px-5 py-3.5 flex items-center gap-2.5" style={{ borderBottom: `1px solid ${pageColors.divider}` }}>
                <div className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: isContactValid ? '#10b981' : primaryColor }}>
                  {isContactValid ? <Check className="h-3.5 w-3.5" /> : '1'}
                </div>
                <h2 className="text-sm font-semibold" style={{ color: pageColors.text }}>Contacto</h2>
              </div>
              <div className="p-4 sm:p-5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="ck-label">Nombre *</label>
                    <input className="ck-input" type="text" value={form.nombre} onChange={(e) => updateField('nombre', e.target.value)} placeholder="Juan" />
                  </div>
                  <div>
                    <label className="ck-label">Apellido *</label>
                    <input className="ck-input" type="text" value={form.apellido} onChange={(e) => updateField('apellido', e.target.value)} placeholder="Pérez" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="ck-label">Email *</label>
                    <input className="ck-input" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="juan@email.com" />
                  </div>
                  <div>
                    <label className="ck-label">Teléfono *</label>
                    <input className="ck-input" type="tel" value={form.telefono} onChange={(e) => updateField('telefono', e.target.value)} placeholder="+54 11 1234-5678" />
                  </div>
                </div>
                <div className="sm:w-1/2">
                  <label className="ck-label">DNI / CUIT <span className="text-gray-400 font-normal">(opcional)</span></label>
                  <input className="ck-input" type="text" value={form.dni} onChange={(e) => updateField('dni', e.target.value)} placeholder="12.345.678" />
                </div>
              </div>
            </section>

            {/* Section 2: Entrega */}
            <section className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: pageColors.cardBg, border: `1px solid ${pageColors.cardBorder}` }}>
              <div className="px-4 sm:px-5 py-3.5 flex items-center gap-2.5" style={{ borderBottom: `1px solid ${pageColors.divider}` }}>
                <div className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: isShippingValid ? '#10b981' : primaryColor }}>
                  {isShippingValid ? <Check className="h-3.5 w-3.5" /> : '2'}
                </div>
                <h2 className="text-sm font-semibold" style={{ color: pageColors.text }}>Entrega</h2>
              </div>
              <div className="p-4 sm:p-5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { value: 'retiro' as const, icon: Store, label: 'Retiro en local', desc: 'Pasás a buscar tu pedido', tag: 'Gratis' },
                    { value: 'envio' as const, icon: Truck, label: 'Envío a domicilio', desc: 'Recibí en tu dirección', tag: 'A coordinar' },
                  ].map((opt) => {
                    const selected = form.envioMetodo === opt.value;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateField('envioMetodo', opt.value)}
                        className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all ${
                          selected ? 'shadow-sm' : ''
                        }`}
                        style={selected
                          ? { borderColor: primaryColor, backgroundColor: `${primaryColor}08` }
                          : { borderColor: pageColors.cardBorder }
                        }
                      >
                        {selected && (
                          <div className="absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${selected ? 'text-white' : ''}`} style={selected ? { backgroundColor: primaryColor } : { backgroundColor: darkMode ? shiftColor(bgColor, 22) : '#f3f4f6', color: pageColors.subtle }}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: pageColors.text }}>{opt.label}</p>
                          <p className="text-xs mt-0.5" style={{ color: pageColors.subtle }}>{opt.desc}</p>
                        </div>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: darkMode ? shiftColor(bgColor, 22) : '#f3f4f6', color: pageColors.subtle }}>{opt.tag}</span>
                      </button>
                    );
                  })}
                </div>

                {form.envioMetodo === 'envio' && (
                  <div className="space-y-3 pt-1" style={{ animation: 'ck-slideDown 0.3s ease-out' }}>
                    <div>
                      <label className="ck-label">Dirección de entrega *</label>
                      <AddressAutocomplete
                        value={form.envioDir}
                        onChange={(v) => updateField('envioDir', v)}
                        onSelect={(addr) => {
                          setSelectedAddress(addr);
                          if (addr) {
                            if (addr.city) updateField('envioCiudad', addr.city);
                            if (addr.postalCode) updateField('envioCp', addr.postalCode);
                          }
                        }}
                        placeholder="Empezá a escribir: calle y altura..."
                        className="ck-input"
                      />
                      <p className="text-[11px] mt-1.5" style={{ color: pageColors.subtle }}>
                        Elegí tu dirección de la lista para que el repartidor llegue sin problemas.
                      </p>
                    </div>
                    {selectedAddress && (
                      <div className="text-xs px-3 py-2 rounded-lg border" style={{ borderColor: pageColors.cardBorder, backgroundColor: darkMode ? shiftColor(bgColor, 16) : '#f8fafc', color: pageColors.muted }}>
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5">📍</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate" style={{ color: pageColors.text }}>{selectedAddress.formattedAddress}</p>
                            {selectedAddress.city && (
                              <p className="text-[11px]" style={{ color: pageColors.subtle }}>
                                {[selectedAddress.city, selectedAddress.province].filter(Boolean).join(' · ')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Section 2.5: Aclaraciones */}
            <section className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: pageColors.cardBg, border: `1px solid ${pageColors.cardBorder}` }}>
              <div className="px-4 sm:px-5 py-3.5 flex items-center gap-2.5" style={{ borderBottom: `1px solid ${pageColors.divider}` }}>
                <div className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                  ✎
                </div>
                <h2 className="text-sm font-semibold" style={{ color: pageColors.text }}>Aclaraciones <span className="font-normal text-xs" style={{ color: pageColors.subtle }}>(opcional)</span></h2>
              </div>
              <div className="p-4 sm:p-5">
                <textarea
                  className="ck-input"
                  rows={4}
                  value={form.aclaraciones}
                  onChange={(e) => updateField('aclaraciones', e.target.value)}
                  placeholder={
                    form.envioMetodo === 'envio'
                      ? 'Ej: La milanesa sin queso, gaseosa bien fría. Departamento 3°B, timbre azul, no funciona el portero — llamar al llegar.'
                      : 'Ej: La milanesa sin queso, gaseosa bien fría, hamburguesa sin cebolla.'
                  }
                  style={{
                    backgroundColor: pageColors.inputBg,
                    color: pageColors.text,
                    border: `1px solid ${pageColors.inputBorder}`,
                    resize: 'vertical',
                    minHeight: 92,
                  }}
                />
                <p className="text-[11px] mt-2" style={{ color: pageColors.subtle }}>
                  {form.envioMetodo === 'envio'
                    ? 'Contanos cualquier detalle de tu pedido y de la entrega: piso, timbre, referencias, alergias, cómo te gusta la cocción, etc.'
                    : 'Contanos cualquier detalle del pedido: alergias, cómo te gusta la cocción, productos sin algún ingrediente, etc.'}
                </p>
              </div>
            </section>

            {/* Section 3: Pago */}
            <section className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: pageColors.cardBg, border: `1px solid ${pageColors.cardBorder}` }}>
              <div className="px-4 sm:px-5 py-3.5 flex items-center gap-2.5" style={{ borderBottom: `1px solid ${pageColors.divider}` }}>
                <div className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: isPaymentValid ? '#10b981' : primaryColor }}>
                  {isPaymentValid ? <Check className="h-3.5 w-3.5" /> : '3'}
                </div>
                <h2 className="text-sm font-semibold" style={{ color: pageColors.text }}>Pago</h2>
              </div>
              <div className="p-4 sm:p-5">
                <div className="space-y-2">
                  {[
                    { value: 'mercadopago' as const, icon: CreditCard, label: 'MercadoPago', desc: 'Tarjeta, débito o saldo MP', color: '#009ee3' },
                    { value: 'transferencia' as const, icon: Building2, label: 'Transferencia bancaria', desc: 'CBU/CVU — confirmación en 24hs', color: '#6366f1' },
                    { value: 'efectivo' as const, icon: Banknote, label: 'Efectivo', desc: 'Pagás al retirar o recibir', color: '#16a34a' },
                  ].map((opt) => {
                    const selected = form.pagoMetodo === opt.value;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateField('pagoMetodo', opt.value)}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                          selected ? 'shadow-sm' : ''
                        }`}
                        style={selected
                          ? { borderColor: primaryColor, backgroundColor: `${primaryColor}06` }
                          : { borderColor: pageColors.cardBorder }
                        }
                      >
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${selected ? 'text-white' : 'text-white'}`} style={{ backgroundColor: selected ? opt.color : `${opt.color}20`, color: selected ? '#fff' : opt.color }}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold" style={{ color: pageColors.text }}>{opt.label}</p>
                          <p className="text-xs" style={{ color: pageColors.subtle }}>{opt.desc}</p>
                        </div>
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0`} style={selected ? { borderColor: primaryColor, backgroundColor: primaryColor } : { borderColor: pageColors.subtle }}>
                          {selected && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Desktop: Submit Button */}
            <div className="hidden lg:block">
              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={!isFormValid || submitting}
                className={`w-full h-13 py-3.5 rounded-xl text-base font-semibold text-white transition-all ${
                  isFormValid && !submitting ? 'hover:opacity-90 active:scale-[0.99] shadow-lg' : 'opacity-40 cursor-not-allowed'
                }`}
                style={{ backgroundColor: primaryColor }}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Procesando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Lock className="h-4 w-4" />
                    Confirmar pedido — {formatPrice(total)}
                  </span>
                )}
              </button>
              <p className="text-center text-xs mt-2.5" style={{ color: pageColors.subtle }}>
                Al confirmar aceptás las condiciones de compra del comercio
              </p>
            </div>
          </div>

          {/* ─── RIGHT: Summary ─────────────────────────── */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="sticky top-[5.5rem]">
              <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: pageColors.cardBg, border: `1px solid ${pageColors.cardBorder}` }}>
                <div className="px-5 py-4" style={{ borderBottom: `1px solid ${pageColors.divider}` }}>
                  <h3 className="text-sm font-semibold" style={{ color: pageColors.text }}>Resumen del pedido</h3>
                </div>

                {/* Items with images */}
                <div className="max-h-[360px] overflow-y-auto">
                  <div>
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3 p-4" style={{ borderBottom: `1px solid ${pageColors.divider}` }}>
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: darkMode ? shiftColor(bgColor, 18) : '#f9fafb', border: `1px solid ${pageColors.divider}` }}>
                          {item.image ? (
                            <NextImage src={item.image} alt={item.name} width={64} height={64} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package className="h-5 w-5" style={{ color: pageColors.subtle }} /></div>
                          )}
                          {item.quantity > 1 && (
                            <span className="absolute -top-1.5 -right-1.5 h-5 min-w-[20px] flex items-center justify-center text-[10px] font-bold rounded-full px-1 text-white shadow-sm" style={{ backgroundColor: primaryColor }}>
                              {item.quantity}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2 leading-snug" style={{ color: pageColors.text }}>{item.name}</p>
                          {item.compareAtPrice && item.compareAtPrice > item.price && (
                            <span className="text-xs line-through" style={{ color: pageColors.subtle }}>{formatPrice(item.compareAtPrice)}</span>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold" style={{ color: pageColors.text }}>{formatPrice(item.price * item.quantity)}</p>
                          <div className="flex items-center gap-1 mt-1.5 justify-end">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="h-6 w-6 rounded-md flex items-center justify-center transition-colors" style={{ border: `1px solid ${pageColors.cardBorder}` }}>
                              <Minus className="h-3 w-3" style={{ color: pageColors.subtle }} />
                            </button>
                            <span className="text-xs font-medium w-6 text-center" style={{ color: pageColors.muted }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="h-6 w-6 rounded-md flex items-center justify-center transition-colors" style={{ border: `1px solid ${pageColors.cardBorder}` }}>
                              <Plus className="h-3 w-3" style={{ color: pageColors.subtle }} />
                            </button>
                            <button onClick={() => removeItem(item.id)} className="h-6 w-6 rounded-md flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors ml-0.5">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coupon */}
                <div className="px-4 py-3" style={{ borderTop: `1px solid ${pageColors.divider}` }}>
                  {couponResult?.valid ? (
                    <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">{couponCode.toUpperCase()}</span>
                        <span className="text-xs text-green-600">-{formatPrice(discount)}</span>
                      </div>
                      <button onClick={handleRemoveCoupon} className="text-green-400 hover:text-green-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: pageColors.subtle }} />
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); }}
                          placeholder="Código de descuento"
                          className="w-full h-10 pl-9 pr-3 rounded-lg text-sm focus:outline-none"
                          style={{ border: `1px solid ${pageColors.cardBorder}`, color: pageColors.text, backgroundColor: pageColors.inputBg }}
                          onKeyDown={(e) => e.key === 'Enter' && handleValidateCoupon()}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleValidateCoupon}
                        disabled={!couponCode.trim() || couponLoading}
                        className="h-10 px-4 rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        style={{ border: `1px solid ${pageColors.cardBorder}`, color: pageColors.muted }}
                      >
                        {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aplicar'}
                      </button>
                    </div>
                  )}
                  {couponResult && !couponResult.valid && (
                    <p className="text-xs text-red-500 mt-1.5">{couponResult.message}</p>
                  )}
                </div>

                {/* Totals */}
                <div className="px-4 py-3 space-y-2" style={{ borderTop: `1px solid ${pageColors.divider}` }}>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: pageColors.subtle }}>Subtotal</span>
                    <span style={{ color: pageColors.muted }}>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Descuento</span>
                      <span className="text-green-600 font-medium">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span style={{ color: pageColors.subtle }}>Envío</span>
                    <span className="text-xs" style={{ color: pageColors.subtle }}>{form.envioMetodo === 'retiro' ? 'Gratis' : form.envioMetodo === 'envio' ? 'A coordinar' : '—'}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-2" style={{ borderTop: `1px solid ${pageColors.divider}` }}>
                    <span className="text-sm font-semibold" style={{ color: pageColors.text }}>Total</span>
                    <span className="text-xl font-bold" style={{ color: pageColors.text }}>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Mobile Bottom Bar ──────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom" style={{ backgroundColor: pageColors.cardBg, borderTop: `1px solid ${pageColors.cardBorder}` }}>
        <div className="px-4 py-3 max-w-6xl mx-auto">
          <button
            type="button"
            onClick={handleSubmitOrder}
            disabled={!isFormValid || submitting}
            className={`w-full h-12 rounded-xl text-sm font-semibold text-white transition-all ${
              isFormValid && !submitting ? 'hover:opacity-90 active:scale-[0.99] shadow-lg' : 'opacity-40 cursor-not-allowed'
            }`}
            style={{ backgroundColor: primaryColor }}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Lock className="h-3.5 w-3.5" />
                Confirmar — {formatPrice(total)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Bottom spacer for mobile fixed bar */}
      <div className="lg:hidden h-20" />

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-[11px]" style={{ color: pageColors.subtle }}>
          Powered by{' '}
          <a href="https://turnolink.com.ar/mercado" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-500">
            TurnoLink Mercado
          </a>
        </p>
      </div>
    </div>
  );
}
