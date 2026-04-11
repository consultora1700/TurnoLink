'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Search, Minus, Plus, Package, Trash2, X, ShoppingBag } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import type { Product, ProductVariant } from '@/lib/api';

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ProductSelection {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  totalPrice: number;
}

// Keep backward compatibility — old code uses ProductSelection
// New POS uses CartItem[]

interface ProductSelectorProps {
  products: Product[];
  onSelect: (selection: ProductSelection | null) => void;
  selected: ProductSelection | null;
  // New multi-product mode
  multiMode?: boolean;
  cartItems?: CartItem[];
  onCartChange?: (items: CartItem[]) => void;
}

export function ProductSelector({
  products,
  onSelect,
  selected,
  multiMode = false,
  cartItems = [],
  onCartChange,
}: ProductSelectorProps) {
  const [search, setSearch] = useState('');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const activeProducts = useMemo(() => {
    let result = products.filter((p) => p.isActive);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.shortDescription?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, search]);

  const getProductImage = (product: Product): string | null => {
    const primary = product.images?.find((img) => img.isPrimary);
    return primary?.url || product.images?.[0]?.url || null;
  };

  // ─── Multi-product mode (new POS) ────────────────────────
  if (multiMode && onCartChange) {
    const cartTotal = cartItems.reduce((sum, i) => sum + i.totalPrice, 0);
    const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

    const addToCart = (product: Product, variant?: ProductVariant) => {
      const unitPrice = variant?.price != null ? Number(variant.price) : product.price;
      const existing = cartItems.findIndex(
        (i) => i.product.id === product.id && (i.variant?.id || null) === (variant?.id || null)
      );

      if (existing >= 0) {
        const updated = [...cartItems];
        const maxQty = product.trackInventory
          ? (variant ? variant.stock : product.stock)
          : 999;
        if (updated[existing].quantity < maxQty) {
          updated[existing] = {
            ...updated[existing],
            quantity: updated[existing].quantity + 1,
            totalPrice: unitPrice * (updated[existing].quantity + 1),
          };
          onCartChange(updated);
        }
      } else {
        onCartChange([
          ...cartItems,
          { product, variant, quantity: 1, unitPrice, totalPrice: unitPrice },
        ]);
      }
      setExpandedProductId(null);
      setSelectedVariantId(null);
    };

    const updateQty = (index: number, qty: number) => {
      if (qty <= 0) {
        onCartChange(cartItems.filter((_, i) => i !== index));
      } else {
        const item = cartItems[index];
        const maxQty = item.product.trackInventory
          ? (item.variant ? item.variant.stock : item.product.stock)
          : 999;
        const updated = [...cartItems];
        const finalQty = Math.min(qty, maxQty);
        updated[index] = {
          ...updated[index],
          quantity: finalQty,
          totalPrice: updated[index].unitPrice * finalQty,
        };
        onCartChange(updated);
      }
    };

    const removeItem = (index: number) => {
      onCartChange(cartItems.filter((_, i) => i !== index));
    };

    return (
      <div className="space-y-3">
        {/* Cart items */}
        {cartItems.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <ShoppingBag className="h-3.5 w-3.5 text-teal-600" />
                Carrito ({cartCount} {cartCount === 1 ? 'item' : 'items'})
              </Label>
              <span className="text-sm font-bold text-teal-700 dark:text-teal-400">
                {formatPrice(cartTotal)}
              </span>
            </div>

            <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-900/20 divide-y divide-teal-100 dark:divide-teal-800/50 overflow-hidden">
              {cartItems.map((item, idx) => {
                const img = getProductImage(item.product);
                return (
                  <div key={`${item.product.id}-${item.variant?.id || 'base'}`} className="flex items-center gap-2.5 p-2.5">
                    {/* Thumbnail */}
                    <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-white dark:bg-neutral-800 border border-teal-100 dark:border-teal-800 shrink-0">
                      {img ? (
                        <Image src={img} alt={item.product.name} fill sizes="40px" className="object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.product.name}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        {item.variant && (
                          <span className="text-teal-600 dark:text-teal-400">{item.variant.name}: {item.variant.value}</span>
                        )}
                        <span>{formatPrice(item.unitPrice)} c/u</span>
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => updateQty(idx, item.quantity - 1)}
                        className="h-7 w-7 rounded-md border border-slate-200 dark:border-neutral-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(idx, item.quantity + 1)}
                        className="h-7 w-7 rounded-md border border-slate-200 dark:border-neutral-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Price + remove */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs font-bold w-16 text-right">{formatPrice(item.totalPrice)}</span>
                      <button
                        onClick={() => removeItem(idx)}
                        className="h-6 w-6 rounded-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search + product list */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {cartItems.length > 0 ? 'Agregar más productos' : 'Elegir productos'}
          </Label>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full h-9 pl-8 pr-8 rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* Product grid */}
          <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
            {activeProducts.map((product) => {
              const activeVariants = product.variants?.filter((v) => v.isActive) || [];
              const hasVariants = activeVariants.length > 0;
              const isExpanded = expandedProductId === product.id;
              const imageUrl = getProductImage(product);
              const outOfStock = product.trackInventory && product.stock === 0;
              const inCart = cartItems.some((i) => i.product.id === product.id);

              return (
                <div key={product.id} className={cn(
                  'rounded-lg border overflow-hidden transition-all',
                  isExpanded ? 'border-teal-300 dark:border-teal-700 shadow-sm' : 'border-slate-200 dark:border-neutral-700',
                  inCart && !isExpanded && 'border-teal-200 dark:border-teal-800 bg-teal-50/30 dark:bg-teal-900/10'
                )}>
                  <button
                    onClick={() => {
                      if (outOfStock) return;
                      if (hasVariants) {
                        setExpandedProductId(isExpanded ? null : product.id);
                        setSelectedVariantId(null);
                      } else {
                        addToCart(product);
                      }
                    }}
                    disabled={outOfStock}
                    className={cn(
                      'w-full flex items-center gap-2.5 p-2.5 text-left transition-colors',
                      outOfStock ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-neutral-800/50',
                      isExpanded && 'bg-teal-50/50 dark:bg-teal-900/20'
                    )}
                  >
                    {imageUrl ? (
                      <div className="relative h-10 w-10 rounded-lg overflow-hidden shrink-0">
                        <Image src={imageUrl} alt={product.name} fill sizes="40px" className="object-cover" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span className="font-semibold text-foreground">{formatPrice(product.price)}</span>
                        {product.trackInventory && (
                          <span className={product.stock <= product.lowStockThreshold ? 'text-red-500' : ''}>
                            Stock: {product.stock}
                          </span>
                        )}
                      </div>
                    </div>
                    {outOfStock ? (
                      <span className="text-[10px] font-medium text-red-500 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full">Sin stock</span>
                    ) : hasVariants ? (
                      <span className="text-[10px] text-muted-foreground bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">{activeVariants.length} var.</span>
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Plus className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </button>

                  {/* Expanded: variant picker */}
                  {isExpanded && hasVariants && (
                    <div className="border-t border-teal-200 dark:border-teal-800 p-2.5 space-y-2 bg-white dark:bg-neutral-900/50">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Seleccionar variante</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {activeVariants.map((variant) => {
                          const varOutOfStock = product.trackInventory && variant.stock === 0;
                          return (
                            <button
                              key={variant.id}
                              onClick={() => {
                                if (!varOutOfStock) addToCart(product, variant);
                              }}
                              disabled={varOutOfStock}
                              className={cn(
                                'flex items-center justify-between gap-1 p-2 rounded-lg text-left text-xs transition-all border',
                                varOutOfStock
                                  ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-neutral-700'
                                  : 'border-slate-200 dark:border-neutral-700 hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 active:scale-[0.97]'
                              )}
                            >
                              <div className="min-w-0">
                                <p className="font-medium truncate">{variant.value || variant.name}</p>
                                <p className="text-muted-foreground">{formatPrice(variant.price != null ? Number(variant.price) : product.price)}</p>
                              </div>
                              {!varOutOfStock && (
                                <div className="h-5 w-5 rounded-full bg-teal-500 text-white flex items-center justify-center shrink-0">
                                  <Plus className="h-3 w-3" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {activeProducts.length === 0 && (
              <div className="text-center py-8">
                <div className="inline-flex h-12 w-12 rounded-full bg-slate-100 dark:bg-neutral-800 items-center justify-center mb-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {search ? 'No se encontraron productos' : 'No hay productos activos'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Single-product mode (backward compatible) ─────────────
  if (selected) {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium">Producto seleccionado</Label>
        <div className="p-3 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              {getProductImage(selected.product) && (
                <img
                  src={getProductImage(selected.product)!}
                  alt={selected.product.name}
                  className="h-8 w-8 rounded object-cover"
                />
              )}
              <p className="font-semibold text-sm">{selected.product.name}</p>
            </div>
            <button
              onClick={() => {
                onSelect(null);
                setExpandedProductId(null);
                setSelectedVariantId(null);
              }}
              className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
            >
              Cambiar
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{formatPrice(selected.totalPrice)}</span>
            {selected.quantity > 1 && <span>x{selected.quantity}</span>}
            {selected.variant && (
              <span className="text-violet-600 dark:text-violet-400">
                {selected.variant.name}: {selected.variant.value}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Single-product selection list (legacy)
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Elegir producto</Label>
      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
        {products.filter((p) => p.isActive).map((product) => {
          const activeVariants = product.variants?.filter((v) => v.isActive) || [];
          const hasVariants = activeVariants.length > 0;
          const isExpanded = expandedProductId === product.id;
          const imageUrl = getProductImage(product);

          return (
            <div key={product.id} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => {
                  if (hasVariants) {
                    setExpandedProductId(isExpanded ? null : product.id);
                    setSelectedVariantId(null);
                  } else {
                    onSelect({ product, quantity: 1, totalPrice: product.price });
                  }
                }}
                className={cn(
                  'w-full flex items-center gap-3 p-3 text-left transition-colors',
                  isExpanded ? 'bg-violet-50 dark:bg-violet-900/30' : 'hover:bg-muted'
                )}
              >
                {imageUrl ? (
                  <div className="relative h-10 w-10 rounded overflow-hidden shrink-0">
                    <Image src={imageUrl} alt={product.name} fill sizes="40px" className="object-cover" />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>{formatPrice(product.price)}</span>
                    {product.trackInventory && (
                      <span className={product.stock <= product.lowStockThreshold ? 'text-red-500' : ''}>
                        Stock: {product.stock}
                      </span>
                    )}
                  </div>
                </div>
                {hasVariants ? (
                  <span className="text-xs text-muted-foreground">{activeVariants.length} variantes</span>
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                )}
              </button>

              {isExpanded && hasVariants && (
                <div className="border-t p-3 space-y-3 bg-slate-50 dark:bg-neutral-800/50">
                  <div className="space-y-1">
                    {activeVariants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariantId(selectedVariantId === variant.id ? null : variant.id)}
                        className={cn(
                          'w-full flex items-center gap-2 p-2 rounded-md text-sm transition-colors text-left',
                          selectedVariantId === variant.id
                            ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300'
                            : 'hover:bg-muted'
                        )}
                      >
                        <div className={cn(
                          'h-4 w-4 rounded-full shrink-0 border-2 flex items-center justify-center',
                          selectedVariantId === variant.id ? 'border-violet-500 bg-violet-500' : 'border-muted-foreground/30'
                        )}>
                          {selectedVariantId === variant.id && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="flex-1">{variant.name}: {variant.value}</span>
                        {variant.price != null && <span className="text-xs text-muted-foreground">{formatPrice(variant.price)}</span>}
                      </button>
                    ))}
                  </div>
                  {selectedVariantId && (
                    <button
                      onClick={() => {
                        const variant = activeVariants.find((v) => v.id === selectedVariantId);
                        const unitPrice = variant?.price != null ? Number(variant.price) : product.price;
                        onSelect({ product, variant, quantity: 1, totalPrice: unitPrice });
                      }}
                      className="w-full px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:opacity-90 transition-all"
                    >
                      Seleccionar
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
