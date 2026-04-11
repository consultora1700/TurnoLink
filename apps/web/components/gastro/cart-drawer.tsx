'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag, X, Plus, Minus, Trash2, ChevronRight } from 'lucide-react';
import { useGastroCartStore, type GastroCartItem } from '@/lib/gastro-cart-store';

interface Props {
  slug: string;
  formatPrice: (price: number) => string;
  onCheckout: () => void;
}

function CartItemRow({ item, formatPrice, onUpdateQuantity, onRemove }: {
  item: GastroCartItem;
  formatPrice: (price: number) => string;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex items-start gap-3 py-3.5">
      {/* Image */}
      {item.image && (
        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-neutral-800 ring-1 ring-slate-200/60 dark:ring-neutral-700/60">
          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{item.name}</h4>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="p-1 -mr-1 text-slate-300 hover:text-red-500 dark:text-neutral-600 dark:hover:text-red-400 transition-colors flex-shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {item.options.length > 0 && (
          <p className="text-xs text-slate-500 dark:text-neutral-500 mt-0.5">
            {item.options.map(o => o.value).join(' · ')}
          </p>
        )}
        {item.itemNotes && (
          <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-0.5 italic">
            &quot;{item.itemNotes}&quot;
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          {/* Quantity stepper */}
          <div className="flex items-center bg-slate-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors"
            >
              <Minus className="w-3 h-3 text-slate-600 dark:text-neutral-400" />
            </button>
            <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-white tabular-nums">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors"
            >
              <Plus className="w-3 h-3 text-slate-600 dark:text-neutral-400" />
            </button>
          </div>

          {/* Price */}
          <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
            {formatPrice(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function GastroCartFloating({ slug, formatPrice, onCheckout }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const items = useGastroCartStore((s) => s.items);
  const getTotal = useGastroCartStore((s) => s.getTotal);
  const getCount = useGastroCartStore((s) => s.getCount);
  const updateQuantity = useGastroCartStore((s) => s.updateQuantity);
  const removeItem = useGastroCartStore((s) => s.removeItem);
  const clearCart = useGastroCartStore((s) => s.clearCart);

  const count = getCount();
  const total = getTotal();

  if (count === 0) return null;

  return (
    <>
      {/* Floating bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pointer-events-none">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto w-full max-w-lg mx-auto flex items-center justify-between px-5 py-3.5 bg-[hsl(var(--tenant-primary-500))] hover:bg-[hsl(var(--tenant-primary-600))] text-white rounded-2xl shadow-[0_4px_24px_hsl(var(--tenant-primary-500)_/_0.35)] transition-all duration-200 active:scale-[0.98] group"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-[hsl(var(--tenant-primary-600))] text-[11px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {count}
              </span>
            </div>
            <span className="text-sm font-semibold">Ver pedido</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold">{formatPrice(total)}</span>
            <ChevronRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </div>

      {/* Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          <div className="relative w-full max-w-lg max-h-[85vh] bg-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Drag handle */}
            <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-slate-300 dark:bg-neutral-600 z-10" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tu pedido</h3>
                <p className="text-xs text-slate-400 dark:text-neutral-500 mt-0.5">
                  {count} {count === 1 ? 'producto' : 'productos'}
                </p>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400 dark:text-neutral-500" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 divide-y divide-slate-100 dark:divide-neutral-800/60">
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  formatPrice={formatPrice}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500 dark:text-neutral-400">Total</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">{formatPrice(total)}</span>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => { clearCart(); setIsOpen(false); }}
                  className="px-4 h-[44px] text-sm font-medium border border-slate-200 dark:border-neutral-700 text-slate-500 dark:text-neutral-400 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors active:scale-[0.98]"
                >
                  Vaciar
                </button>
                <button
                  type="button"
                  onClick={() => { setIsOpen(false); onCheckout(); }}
                  className="flex-1 h-[44px] bg-[hsl(var(--tenant-primary-500))] hover:bg-[hsl(var(--tenant-primary-600))] text-white font-semibold text-sm rounded-xl shadow-md shadow-[hsl(var(--tenant-primary-500)_/_0.25)] transition-all duration-200 active:scale-[0.98]"
                >
                  Confirmar pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
