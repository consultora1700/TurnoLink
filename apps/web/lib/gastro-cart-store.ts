import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GastroCartOption {
  label: string;
  value: string;
}

export interface GastroCartItem {
  id: string; // unique key: productId + variantId + options hash
  productId: string;
  variantId?: string;
  variantName?: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  options: GastroCartOption[];
  itemNotes: string;
}

export type OrderType = 'DINE_IN' | 'TAKE_AWAY' | 'DELIVERY';

interface GastroCartState {
  items: GastroCartItem[];
  slug: string;
  orderType: OrderType | null;
  tableNumber: string;
  deliveryAddress: string;
  activeOrderNumber: string | null;
  activeOrderSlug: string | null;
  _hydrated: boolean;

  setOrderType: (type: OrderType) => void;
  setTableNumber: (num: string) => void;
  setDeliveryAddress: (addr: string) => void;
  setActiveOrder: (slug: string, orderNumber: string) => void;
  clearActiveOrder: () => void;
  addItem: (item: Omit<GastroCartItem, 'id' | 'quantity'>, slug: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItemNotes: (id: string, notes: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getCount: () => number;
}

function makeItemId(productId: string, variantId?: string, options?: GastroCartOption[]): string {
  const optKey = options?.map(o => `${o.label}:${o.value}`).sort().join('|') || '';
  return `${productId}:${variantId || ''}:${optKey}`;
}

export const useGastroCartStore = create<GastroCartState>()(
  persist(
    (set, get) => ({
      items: [],
      slug: '',
      orderType: null,
      tableNumber: '',
      deliveryAddress: '',
      activeOrderNumber: null,
      activeOrderSlug: null,
      _hydrated: false,

      setOrderType: (type) => set({ orderType: type }),
      setTableNumber: (num) => set({ tableNumber: num }),
      setDeliveryAddress: (addr) => set({ deliveryAddress: addr }),
      setActiveOrder: (slug, orderNumber) => set({ activeOrderSlug: slug, activeOrderNumber: orderNumber }),
      clearActiveOrder: () => set({ activeOrderSlug: null, activeOrderNumber: null }),

      addItem: (item, slug) => {
        const state = get();
        // If switching stores, clear cart
        if (state.slug && state.slug !== slug) {
          const id = makeItemId(item.productId, item.variantId, item.options);
          set({ items: [{ ...item, id, quantity: 1 }], slug, orderType: null, tableNumber: '', deliveryAddress: '' });
          return;
        }
        const id = makeItemId(item.productId, item.variantId, item.options);
        const existing = state.items.find((i) => i.id === id);
        if (existing) {
          set({
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity: Math.min(i.quantity + 1, 99) } : i
            ),
            slug,
          });
        } else {
          set({ items: [...state.items, { ...item, id, quantity: 1 }], slug });
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
              i.id === id ? { ...i, quantity: Math.min(quantity, 99) } : i
            ),
          });
        }
      },

      updateItemNotes: (id, notes) => {
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, itemNotes: notes } : i
          ),
        });
      },

      clearCart: () => set({ items: [], orderType: null, tableNumber: '', deliveryAddress: '' }),

      getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'turnolink-gastro-cart',
      // Do NOT persist orderType / table / address — the customer must pick mode
      // explicitly each session (gastro flow requires DELIVERY vs TAKE_AWAY vs DINE_IN
      // before checkout). Persisting these caused the catalog to skip the selector.
      partialize: (state) => ({
        items: state.items,
        slug: state.slug,
        activeOrderNumber: state.activeOrderNumber,
        activeOrderSlug: state.activeOrderSlug,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state._hydrated = true;
      },
    }
  )
);
