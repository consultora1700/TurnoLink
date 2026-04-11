import { create } from 'zustand';

interface GastroAlertsState {
  pendingOrders: number;
  billsRequested: number;
  waitingPayment: number;
  setPendingOrders: (n: number) => void;
  setBillsRequested: (n: number) => void;
  setWaitingPayment: (n: number) => void;
  incrementPendingOrders: () => void;
  incrementBillsRequested: () => void;
}

export const useGastroAlerts = create<GastroAlertsState>((set) => ({
  pendingOrders: 0,
  billsRequested: 0,
  waitingPayment: 0,
  setPendingOrders: (n) => set({ pendingOrders: n }),
  setBillsRequested: (n) => set({ billsRequested: n }),
  setWaitingPayment: (n) => set({ waitingPayment: n }),
  incrementPendingOrders: () => set((s) => ({ pendingOrders: s.pendingOrders + 1 })),
  incrementBillsRequested: () => set((s) => ({ billsRequested: s.billsRequested + 1 })),
}));
