import { create } from 'zustand';

interface GastroAlertsState {
  pendingOrders: number;
  billsRequested: number;
  waitingPayment: number;
  pendingBookings: number;
  setPendingOrders: (n: number) => void;
  setBillsRequested: (n: number) => void;
  setWaitingPayment: (n: number) => void;
  setPendingBookings: (n: number) => void;
  incrementPendingOrders: () => void;
  incrementBillsRequested: () => void;
  incrementPendingBookings: () => void;
}

export const useGastroAlerts = create<GastroAlertsState>((set) => ({
  pendingOrders: 0,
  billsRequested: 0,
  waitingPayment: 0,
  pendingBookings: 0,
  setPendingOrders: (n) => set({ pendingOrders: n }),
  setBillsRequested: (n) => set({ billsRequested: n }),
  setWaitingPayment: (n) => set({ waitingPayment: n }),
  setPendingBookings: (n) => set({ pendingBookings: n }),
  incrementPendingOrders: () => set((s) => ({ pendingOrders: s.pendingOrders + 1 })),
  incrementBillsRequested: () => set((s) => ({ billsRequested: s.billsRequested + 1 })),
  incrementPendingBookings: () => set((s) => ({ pendingBookings: s.pendingBookings + 1 })),
}));
