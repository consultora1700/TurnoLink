'use client';

import NextImage from 'next/image';
import { Package, ShieldCheck } from 'lucide-react';
import { CartItem } from '@/lib/cart-store';
import { formatPrice } from '@/lib/utils';

interface CheckoutSidebarProps {
  items: CartItem[];
  primaryColor?: string;
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
}

// ─── Desktop Sidebar ──────────────────────────────────────
export function CheckoutSidebar({
  items,
  primaryColor = '#14b8a6',
  onContinue,
  continueLabel = 'Continuar',
  continueDisabled = false,
}: CheckoutSidebarProps) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 shadow-lg shadow-black/[0.08] sticky top-24 overflow-hidden"
      style={{ animation: 'ckSideIn 0.4s ease-out' }}
    >
      <style>{`
        @keyframes ckSideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-gray-900">Tu compra</h3>
      </div>

      {/* Items */}
      <div className="max-h-[320px] overflow-y-auto divide-y divide-gray-100">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 px-4 py-3">
            <div className="relative shrink-0">
              <div className="w-16 h-16 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                {item.image ? (
                  <NextImage src={item.image} alt={item.name} width={64} height={64} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-5 w-5 text-gray-300" />
                  </div>
                )}
              </div>
              {item.quantity > 1 && (
                <span
                  className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center text-[10px] font-bold text-white rounded-full px-1"
                  style={{ backgroundColor: primaryColor }}
                >
                  {item.quantity}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{item.name}</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{formatPrice(item.price * item.quantity)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-gray-100 px-4 pt-3 pb-2 space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Envío</span>
          <span className="text-gray-400 text-xs">A calcular</span>
        </div>
        <div className="border-t border-gray-100 pt-2 mt-1 flex justify-between items-baseline">
          <span className="text-sm font-medium text-gray-900">Total</span>
          <span className="text-xl font-bold text-gray-900">{formatPrice(subtotal)}</span>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-3">
        <button
          type="button"
          onClick={onContinue}
          disabled={continueDisabled}
          className={`w-full h-12 rounded-lg text-base font-semibold text-white transition-all ${
            continueDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-90 active:scale-[0.98] shadow-md'
          }`}
          style={{ backgroundColor: primaryColor }}
        >
          {continueLabel}
        </button>
      </div>

      {/* Trust */}
      <div className="flex items-center justify-center gap-1.5 pb-4 text-xs text-gray-400">
        <ShieldCheck className="h-3.5 w-3.5" />
        Compra 100% segura
      </div>
    </div>
  );
}

// ─── Mobile Summary ────────────────────────────────────────
export function CheckoutMobileSummary({
  items,
  primaryColor = '#14b8a6',
}: {
  items: CartItem[];
  primaryColor?: string;
}) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  if (items.length === 0) return null;

  // Single product — horizontal card
  if (items.length === 1) {
    const item = items[0];
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-md p-3 mb-4">
        <div className="flex gap-3">
          <div className="w-24 h-24 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden shrink-0">
            {item.image ? (
              <NextImage src={item.image} alt={item.name} width={96} height={96} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-6 w-6 text-gray-300" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <p className="text-sm font-semibold text-gray-900 line-clamp-2">{item.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">Cantidad: {item.quantity}</p>
            <p className="text-base font-bold text-gray-900 mt-1">{formatPrice(item.price * item.quantity)}</p>
          </div>
        </div>
      </div>
    );
  }

  // Multiple products — horizontal scroll
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden mb-4">
      <div className="flex gap-3 overflow-x-auto p-3 pb-2 scrollbar-hide">
        {items.map((item) => (
          <div key={item.id} className="w-32 flex-shrink-0">
            <div className="relative">
              <div className="w-32 h-32 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                {item.image ? (
                  <NextImage src={item.image} alt={item.name} width={128} height={128} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-5 w-5 text-gray-300" />
                  </div>
                )}
              </div>
              {item.quantity > 1 && (
                <span
                  className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center text-[10px] font-bold text-white rounded-full px-1"
                  style={{ backgroundColor: primaryColor }}
                >
                  {item.quantity}
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-gray-900 line-clamp-2 mt-1.5 leading-snug">{item.name}</p>
            <p className="text-xs font-bold text-gray-900 mt-0.5">{formatPrice(item.price * item.quantity)}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 border-t border-gray-100">
        <span className="text-xs text-gray-500">{totalQty} producto{totalQty !== 1 ? 's' : ''}</span>
        <span className="text-sm font-bold text-gray-900">{formatPrice(subtotal)}</span>
      </div>
    </div>
  );
}
