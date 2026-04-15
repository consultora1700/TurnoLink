'use client';

import { useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api';
import { useGastroSocket } from '@/lib/gastro-socket';
import { useGastroAlerts } from '@/lib/gastro-alerts-store';

/**
 * Invisible component that listens to WebSocket events and keeps
 * gastro alert counts in sync. Rendered once in the dashboard layout.
 */
export function GastroAlertListener() {
  const { data: session } = useSession();
  const tenantId = (session?.user as any)?.tenantId || null;
  const {
    setPendingOrders,
    setBillsRequested,
    setWaitingPayment,
    setPendingBookings,
    incrementPendingOrders,
    incrementBillsRequested,
    incrementPendingBookings,
  } = useGastroAlerts();

  // Load initial counts
  const loadCounts = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const api = createApiClient(session.accessToken as string);
      // Load pending delivery/takeaway orders
      const pending = await api.getOrders('PENDING', 1, 1);
      setPendingOrders(pending.total || 0);

      // Load gastro table alerts
      const gastro = await api.getGastroTables();
      const bills = gastro.tables.filter((t: any) => t.status === 'BILL_REQUESTED').length;
      const waiting = gastro.tables.filter((t: any) => t.status === 'WAITING_PAYMENT').length;
      setBillsRequested(bills);
      setWaitingPayment(waiting);

      // Load pending reservation requests
      const pendingBookings = await api.getBookings({ status: 'PENDING', limit: 1 });
      setPendingBookings(pendingBookings.meta?.total || 0);
    } catch {
      // Non-critical
    }
  }, [session?.accessToken, setPendingOrders, setBillsRequested, setWaitingPayment, setPendingBookings]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  // WebSocket listeners
  useGastroSocket({
    tenantId,
    onNewOrder: useCallback(() => {
      incrementPendingOrders();
    }, [incrementPendingOrders]),
    onBillRequested: useCallback(() => {
      incrementBillsRequested();
    }, [incrementBillsRequested]),
    onSessionOpened: useCallback(() => loadCounts(), [loadCounts]),
    onPaid: useCallback(() => loadCounts(), [loadCounts]),
    onClosed: useCallback(() => loadCounts(), [loadCounts]),
    onPaymentEnabled: useCallback(() => loadCounts(), [loadCounts]),
    onStatusChanged: useCallback(() => loadCounts(), [loadCounts]),
    // Booking reservation events
    onBookingNewRequest: useCallback(() => {
      incrementPendingBookings();
    }, [incrementPendingBookings]),
    onBookingConfirmed: useCallback(() => loadCounts(), [loadCounts]),
  });

  // Refresh every 60s as fallback
  useEffect(() => {
    const interval = setInterval(loadCounts, 60000);
    return () => clearInterval(interval);
  }, [loadCounts]);

  return null; // Invisible component
}
