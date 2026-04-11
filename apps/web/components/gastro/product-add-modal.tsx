'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Plus, Minus, MessageSquare, Check } from 'lucide-react';
import type { GastroCartOption } from '@/lib/gastro-cart-store';

interface ProductOption {
  label: string;
  choices: string[];
  required?: boolean;
}

interface Props {
  product: {
    id: string;
    name: string;
    description?: string;
    shortDescription?: string;
    price: number;
    images?: { url: string; alt?: string }[];
    attributes?: { key: string; label: string; value: string; type?: string }[];
  };
  options: ProductOption[];
  formatPrice: (price: number) => string;
  onAdd: (item: {
    productId: string;
    name: string;
    price: number;
    image: string | null;
    options: GastroCartOption[];
    itemNotes: string;
  }) => void;
  onClose: () => void;
}

export function ProductAddModal({ product, options, formatPrice, onAdd, onClose }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const imageUrl = product.images?.[0]?.url || null;

  const handleOptionChange = (label: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [label]: value }));
  };

  const missingRequired = options
    .filter(o => o.required)
    .some(o => !selectedOptions[o.label]);

  const handleAdd = () => {
    const opts: GastroCartOption[] = Object.entries(selectedOptions)
      .filter(([, v]) => v)
      .map(([label, value]) => ({ label, value }));

    for (let i = 0; i < quantity; i++) {
      onAdd({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: imageUrl,
        options: opts,
        itemNotes: notes.trim(),
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg max-h-[92vh] bg-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Drag handle (mobile) */}
        <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-slate-300 dark:bg-neutral-600 z-20" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full text-white transition-all"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        {/* Image with gradient overlay */}
        {imageUrl ? (
          <div className="relative w-full aspect-[16/9] flex-shrink-0">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 512px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        ) : (
          <div className="h-3 sm:h-0 flex-shrink-0" />
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 pt-4 pb-2">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{product.name}</h3>
              <span className="text-lg font-bold text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))] whitespace-nowrap shrink-0">
                {formatPrice(product.price)}
              </span>
            </div>

            {product.description && (
              <p className="text-[13px] text-slate-500 dark:text-neutral-400 mt-2 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          {/* Options */}
          {options.length > 0 && (
            <div className="px-5 py-3 space-y-4">
              {options.map((opt) => (
                <div key={opt.label}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-sm font-semibold text-slate-800 dark:text-neutral-200">
                      {opt.label}
                    </span>
                    {opt.required && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
                        Requerido
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {opt.choices.map((choice) => {
                      const isSelected = selectedOptions[opt.label] === choice;
                      return (
                        <button
                          key={choice}
                          type="button"
                          onClick={() => handleOptionChange(opt.label, isSelected ? '' : choice)}
                          className={`relative pl-3 pr-3.5 py-2 text-[13px] rounded-xl border-2 transition-all duration-150 ${
                            isSelected
                              ? 'border-[hsl(var(--tenant-primary-500))] bg-[hsl(var(--tenant-primary-500)_/_0.08)] text-[hsl(var(--tenant-primary-700))] dark:text-[hsl(var(--tenant-primary-300))] font-semibold shadow-[0_1px_4px_hsl(var(--tenant-primary-500)_/_0.12)]'
                              : 'border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400 hover:border-slate-300 dark:hover:border-neutral-600 active:scale-[0.97]'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Check className={`w-3.5 h-3.5 ${isSelected ? '' : 'hidden'}`} strokeWidth={2.5} />
                            <span>{choice}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          <div className="px-5 pb-4">
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className={`flex items-center gap-2 text-[13px] py-2 transition-colors ${
                showNotes
                  ? 'text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))] font-medium'
                  : 'text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              {showNotes ? 'Ocultar notas' : 'Agregar nota al plato'}
            </button>

            <div className={`overflow-hidden transition-all duration-200 ${
              showNotes ? 'max-h-24 opacity-100 mt-1' : 'max-h-0 opacity-0'
            }`}>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: sin cebolla, bien cocido..."
                rows={2}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--tenant-primary-500))] focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-slate-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-5 py-4 flex items-center gap-3">
          {/* Quantity stepper */}
          <div className="flex items-center bg-slate-100 dark:bg-neutral-800 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-10 h-10 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-30"
            >
              <Minus className="w-4 h-4 text-slate-700 dark:text-neutral-300" />
            </button>
            <span className="w-8 text-center text-sm font-bold text-slate-900 dark:text-white tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(Math.min(20, quantity + 1))}
              className="w-10 h-10 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors"
            >
              <Plus className="w-4 h-4 text-slate-700 dark:text-neutral-300" />
            </button>
          </div>

          {/* Add button */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={missingRequired}
            className={`flex-1 h-[44px] rounded-xl font-semibold text-sm transition-all duration-200 ${
              missingRequired
                ? 'bg-slate-200 dark:bg-neutral-700 text-slate-400 dark:text-neutral-500 cursor-not-allowed'
                : 'bg-[hsl(var(--tenant-primary-500))] hover:bg-[hsl(var(--tenant-primary-600))] text-white shadow-md shadow-[hsl(var(--tenant-primary-500)_/_0.25)] hover:shadow-lg hover:shadow-[hsl(var(--tenant-primary-500)_/_0.3)] active:scale-[0.98]'
            }`}
          >
            Agregar &middot; {formatPrice(product.price * quantity)}
          </button>
        </div>
      </div>
    </div>
  );
}
