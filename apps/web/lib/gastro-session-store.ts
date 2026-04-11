import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SessionOrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  options?: Record<string, any>;
  notes?: string;
}

export interface SessionOrder {
  id: string;
  orderNumber: number;
  items: SessionOrderItem[];
  subtotal: number;
  status: string;
  createdAt: string;
}

export type SessionStatus =
  | 'OCCUPIED'
  | 'ORDERING'
  | 'BILL_REQUESTED'
  | 'PAYMENT_ENABLED'
  | 'WAITING_PAYMENT'
  | 'PAID'
  | 'CLOSED';

interface GastroSessionState {
  sessionId: string | null;
  tenantId: string | null;
  tableNumber: number | null;
  status: SessionStatus | null;
  orders: SessionOrder[];
  _hydrated: boolean;

  // Cart for current (unsent) order
  currentItems: SessionOrderItem[];

  setSession: (sessionId: string, tenantId: string, tableNumber: number, status: SessionStatus) => void;
  setStatus: (status: SessionStatus) => void;
  setOrders: (orders: SessionOrder[]) => void;
  addCurrentItem: (item: Omit<SessionOrderItem, 'quantity'>) => void;
  removeCurrentItem: (productId: string) => void;
  updateCurrentItemQuantity: (productId: string, quantity: number) => void;
  clearCurrentItems: () => void;
  addSentOrder: (order: SessionOrder) => void;
  getCurrentTotal: () => number;
  getCurrentCount: () => number;
  getSessionTotal: () => number;
  reset: () => void;
}

export const useGastroSessionStore = create<GastroSessionState>()(
  persist(
    (set, get) => ({
      sessionId: null,
      tenantId: null,
      tableNumber: null,
      status: null,
      orders: [],
      currentItems: [],
      _hydrated: false,

      setSession: (sessionId, tenantId, tableNumber, status) =>
        set({ sessionId, tenantId, tableNumber, status }),

      setStatus: (status) => set({ status }),

      setOrders: (orders) => set({ orders }),

      addCurrentItem: (item) => {
        const state = get();
        const existing = state.currentItems.find((i) => i.productId === item.productId);
        if (existing) {
          set({
            currentItems: state.currentItems.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: Math.min(i.quantity + 1, 99) }
                : i,
            ),
          });
        } else {
          set({
            currentItems: [...state.currentItems, { ...item, quantity: 1 }],
          });
        }
      },

      removeCurrentItem: (productId) => {
        set({ currentItems: get().currentItems.filter((i) => i.productId !== productId) });
      },

      updateCurrentItemQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          set({ currentItems: get().currentItems.filter((i) => i.productId !== productId) });
        } else {
          set({
            currentItems: get().currentItems.map((i) =>
              i.productId === productId ? { ...i, quantity: Math.min(quantity, 99) } : i,
            ),
          });
        }
      },

      clearCurrentItems: () => set({ currentItems: [] }),

      addSentOrder: (order) => set({ orders: [...get().orders, order] }),

      getCurrentTotal: () =>
        get().currentItems.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getCurrentCount: () =>
        get().currentItems.reduce((sum, i) => sum + i.quantity, 0),

      getSessionTotal: () =>
        get().orders.reduce((sum, o) => sum + o.subtotal, 0),

      reset: () =>
        set({
          sessionId: null,
          tenantId: null,
          tableNumber: null,
          status: null,
          orders: [],
          currentItems: [],
        }),
    }),
    {
      name: 'turnolink-gastro-session',
      onRehydrateStorage: () => (state) => {
        if (state) state._hydrated = true;
      },
    },
  ),
);
