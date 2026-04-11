import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  image: string | null;
  quantity: number;
  stock: number;
  trackInventory: boolean;
}

interface CartState {
  items: CartItem[];
  slug: string; // store slug — cart is per-store
  _hydrated: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>, slug: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      slug: '',
      _hydrated: false,

      addItem: (item, slug) => {
        const state = get();
        // If switching stores, clear cart
        if (state.slug && state.slug !== slug) {
          set({ items: [{ ...item, quantity: 1 }], slug });
          return;
        }
        const existing = state.items.find((i) => i.id === item.id);
        if (existing) {
          const maxQty = item.trackInventory ? item.stock : 99;
          if (existing.quantity < maxQty) {
            set({
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
              slug,
            });
          }
        } else {
          set({ items: [...state.items, { ...item, quantity: 1 }], slug });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.id !== id) });
        } else {
          set({
            items: get().items.map((i) =>
              i.id === id ? { ...i, quantity: Math.min(quantity, i.trackInventory ? i.stock : 99) } : i
            ),
          });
        }
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'turnolink-cart',
      onRehydrateStorage: () => (state) => {
        if (state) state._hydrated = true;
      },
    }
  )
);
