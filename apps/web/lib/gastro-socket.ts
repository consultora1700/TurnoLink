'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Socket.IO connection config optimized for PM2 cluster mode.
 *
 * KEY: `transports: ['websocket']` — skip HTTP long-polling entirely.
 * With PM2 cluster, multiple processes share port 3001 via round-robin.
 * Polling handshake fails because the SID is in-memory on one process
 * but the next request lands on another. WebSocket-only avoids this
 * because the upgrade is a single request that stays on one process.
 *
 * The Redis adapter handles cross-process room/event sync.
 */
const SOCKET_CONFIG = {
  path: '/socket.io',
  transports: ['websocket'] as ('websocket')[],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
  reconnectionAttempts: Infinity,
  timeout: 10000,
};

interface GastroEvent {
  tenantId: string;
  sessionId: string;
  tableNumber: number;
  [key: string]: any;
}

type EventHandler = (data: GastroEvent) => void;

interface UseGastroSocketOptions {
  tenantId: string | null;
  onSessionOpened?: EventHandler;
  onOrderPlaced?: EventHandler;
  onOrderDelivered?: EventHandler;
  onBillRequested?: EventHandler;
  onPaymentEnabled?: EventHandler;
  onPaymentRequested?: EventHandler;
  onPaid?: EventHandler;
  onClosed?: EventHandler;
  onStatusChanged?: EventHandler;
  onNewOrder?: EventHandler;
  // Kitchen events
  onComandaCreated?: EventHandler;
  onComandaReady?: EventHandler;
  onComandaPrinted?: EventHandler;
  onPrintFailed?: EventHandler;
  onAgentConnected?: EventHandler;
  onPrinterStatus?: EventHandler;
}

export function useGastroSocket({
  tenantId,
  onSessionOpened,
  onOrderPlaced,
  onOrderDelivered,
  onBillRequested,
  onPaymentEnabled,
  onPaymentRequested,
  onPaid,
  onClosed,
  onStatusChanged,
  onNewOrder,
  onComandaCreated,
  onComandaReady,
  onComandaPrinted,
  onPrintFailed,
  onAgentConnected,
  onPrinterStatus,
}: UseGastroSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!tenantId) return;

    const socket = io(`${API_URL}/gastro`, SOCKET_CONFIG);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[GastroSocket] Connected:', socket.id, '→ joining dashboard:', tenantId);
      setConnected(true);
      socket.emit('join-dashboard', { tenantId });
    });

    socket.on('connect_error', (err) => {
      console.error('[GastroSocket] Connection error:', err.message);
      setConnected(false);
    });

    socket.on('disconnect', (reason) => {
      console.log('[GastroSocket] Disconnected:', reason);
      setConnected(false);
    });

    // Register all event listeners
    const events: [string, EventHandler | undefined][] = [
      ['table:session-opened', onSessionOpened],
      ['table:order-placed', onOrderPlaced],
      ['table:order-delivered', onOrderDelivered],
      ['table:bill-requested', onBillRequested],
      ['table:payment-enabled', onPaymentEnabled],
      ['table:payment-requested', onPaymentRequested],
      ['table:paid', onPaid],
      ['table:closed', onClosed],
      ['table:status-changed', onStatusChanged],
      ['order:new', onNewOrder],
      // Kitchen events
      ['kitchen:comanda-created', onComandaCreated],
      ['kitchen:comanda-ready', onComandaReady],
      ['kitchen:comanda-printed', onComandaPrinted],
      ['kitchen:print-failed', onPrintFailed],
      ['kitchen:agent-connected', onAgentConnected],
      ['kitchen:printer-status', onPrinterStatus],
    ];

    for (const [event, handler] of events) {
      if (handler) socket.on(event, handler);
    }

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [tenantId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { connected, socket: socketRef.current };
}

// Hook for mesa (comensal) side — listens to own table session
export function useTableSocket({
  sessionId,
  onOrderPlaced,
  onOrderDelivered,
  onPaymentEnabled,
  onPaid,
  onClosed,
  onStatusChanged,
}: {
  sessionId: string | null;
  onOrderPlaced?: EventHandler;
  onOrderDelivered?: EventHandler;
  onPaymentEnabled?: EventHandler;
  onPaid?: EventHandler;
  onClosed?: EventHandler;
  onStatusChanged?: EventHandler;
}) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const socket = io(`${API_URL}/gastro`, SOCKET_CONFIG);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[TableSocket] Connected:', socket.id, '→ joining table:', sessionId);
      setConnected(true);
      socket.emit('join-table', { sessionId });
    });

    socket.on('connect_error', (err) => {
      console.error('[TableSocket] Connection error:', err.message);
      setConnected(false);
    });

    socket.on('disconnect', (reason) => {
      console.log('[TableSocket] Disconnected:', reason);
      setConnected(false);
    });

    const events: [string, EventHandler | undefined][] = [
      ['table:order-placed', onOrderPlaced],
      ['table:order-delivered', onOrderDelivered],
      ['table:payment-enabled', onPaymentEnabled],
      ['table:paid', onPaid],
      ['table:closed', onClosed],
      ['table:status-changed', onStatusChanged],
    ];

    for (const [event, handler] of events) {
      if (handler) socket.on(event, handler);
    }

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { connected, socket: socketRef.current };
}
