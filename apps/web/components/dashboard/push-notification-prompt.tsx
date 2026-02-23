'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Bell, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createApiClient } from '@/lib/api';
import { usePWAStatus } from '@/lib/hooks/use-pwa-status';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * First-time push notification prompt (the bigger banner).
 * Only shows inside installed PWA — desktop browser users won't see this.
 * For returning users who dismissed this, SmartReminder handles subtle re-prompting.
 */
export function PushNotificationPrompt() {
  const { data: session } = useSession();
  const { isInstalled, isLoading: pwaLoading } = usePWAStatus();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (pwaLoading) return;
    if (!session?.accessToken) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    if (!VAPID_PUBLIC_KEY) return;

    // Only show the big prompt inside the installed PWA
    if (!isInstalled) return;

    // Already subscribed permanently — never show again
    const subscribed = localStorage.getItem('turnolink-push-subscribed');
    if (subscribed) return;

    // Dismissed this session only — will show again next time they open the app
    const dismissedThisSession = sessionStorage.getItem('turnolink-push-dismissed-session');
    if (dismissedThisSession) return;

    // Don't show if already granted
    if (Notification.permission === 'granted') {
      registerAndSubscribe();
      return;
    }

    if (Notification.permission === 'denied') return;

    // Show the prompt after a short delay
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, [session, pwaLoading, isInstalled]);

  async function registerAndSubscribe() {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      setError(false);
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const appServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appServerKey as unknown as ArrayBuffer,
      });

      const json = subscription.toJSON();
      const api = createApiClient(session.accessToken as string);
      await api.post('/push/subscribe', {
        endpoint: json.endpoint,
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
      });

      localStorage.setItem('turnolink-push-subscribed', 'true');
      setShow(false);
    } catch (err) {
      console.error('Failed to subscribe to push notifications:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleActivate() {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await registerAndSubscribe();
    } else {
      // User denied at browser level — dismiss for this session only
      handleDismiss();
    }
  }

  function handleDismiss() {
    // Only dismiss for this session — will show again next time they open the app
    sessionStorage.setItem('turnolink-push-dismissed-session', 'true');
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center flex-shrink-0">
            <Bell className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-slate-900 dark:text-white">
              No te pierdas ninguna reserva
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Te avisamos al instante cuando un cliente reserve. Activalo en 1 click.
            </p>
            {error && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>No se pudieron activar. Intentá de nuevo.</span>
              </div>
            )}
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8"
                onClick={handleActivate}
                disabled={loading}
              >
                {loading ? 'Activando...' : error ? 'Reintentar' : 'Activar notificaciones'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs h-8 text-muted-foreground"
                onClick={handleDismiss}
              >
                Ahora no
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
