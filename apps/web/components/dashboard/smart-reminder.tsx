'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Bell, X, Smartphone, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { usePWAStatus, usePushStatus, useReminderCooldown } from '@/lib/hooks/use-pwa-status';
import { PWAInstallGuide } from './pwa-install-guide';
import { createApiClient } from '@/lib/api';

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
 * Smart reminder — single source of truth for install & push prompts.
 *
 * Flow:
 *   Returning user (not installed) → subtle banner → "Ver como" opens detailed guide dialog
 *   PWA installed (no push)        → subtle banner → "Activar" triggers permission
 *   All set                        → nothing
 */
export function SmartReminder() {
  const { data: session } = useSession();
  const { isInstalled, isLoading: pwaLoading } = usePWAStatus();
  const { isSubscribed, isLoading: pushLoading } = usePushStatus();
  const installCooldown = useReminderCooldown('turnolink-install-reminder-dismissed');
  const pushCooldown = useReminderCooldown('turnolink-push-reminder-dismissed');

  const [activatingPush, setActivatingPush] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  // Delay appearance
  useEffect(() => {
    if (pwaLoading || pushLoading) return;
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, [pwaLoading, pushLoading]);

  if (pwaLoading || pushLoading || !visible) return null;

  const reminderType = getSmartReminderType({
    isInstalled,
    isSubscribed,
    installCooldownActive: !installCooldown.shouldShow,
    pushCooldownActive: !pushCooldown.shouldShow,
  });

  if (!reminderType) return null;

  async function handleActivatePush() {
    if (!session?.accessToken || !VAPID_PUBLIC_KEY) return;
    try {
      setActivatingPush(true);
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        pushCooldown.dismiss();
        return;
      }
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as ArrayBuffer,
      });
      const json = subscription.toJSON();
      const api = createApiClient(session.accessToken as string);
      await api.post('/push/subscribe', {
        endpoint: json.endpoint,
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
      });
      localStorage.setItem('turnolink-push-subscribed', 'true');
      pushCooldown.dismiss();
    } catch {
      pushCooldown.dismiss();
    } finally {
      setActivatingPush(false);
    }
  }

  return (
    <>
      <div className="animate-in fade-in slide-in-from-top-2 duration-500 mb-4">
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-200/60 dark:border-teal-800/40">
          <div className="h-7 w-7 rounded-md bg-teal-100 dark:bg-teal-800/40 flex items-center justify-center flex-shrink-0">
            {reminderType === 'install'
              ? <Smartphone className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              : <Bell className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            }
          </div>
          <p className="text-sm text-teal-800 dark:text-teal-200 flex-1 min-w-0">
            {reminderType === 'install'
              ? 'Instala TurnoLink en tu celular'
              : 'Activa notificaciones para no perderte reservas'
            }
          </p>
          <div className="flex items-center gap-1 flex-shrink-0">
            {reminderType === 'install' ? (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2.5 text-xs font-medium text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-800/40"
                onClick={() => setGuideOpen(true)}
              >
                Ver como
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2.5 text-xs font-medium text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-800/40"
                onClick={handleActivatePush}
                disabled={activatingPush}
              >
                {activatingPush ? 'Activando...' : 'Activar'}
              </Button>
            )}
            <button
              onClick={reminderType === 'install' ? installCooldown.dismiss : pushCooldown.dismiss}
              className="h-7 w-7 flex items-center justify-center rounded-md text-teal-400 hover:text-teal-600 dark:hover:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-800/40 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Detailed install guide dialog — opens from "Ver como" */}
      <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Instalar TurnoLink</DialogTitle>
            <DialogDescription className="sr-only">
              Instrucciones para instalar la app
            </DialogDescription>
          </DialogHeader>
          <PWAInstallGuide variant="modal" onDismiss={() => setGuideOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Decision engine ──

function getSmartReminderType(ctx: {
  isInstalled: boolean;
  isSubscribed: boolean;
  installCooldownActive: boolean;
  pushCooldownActive: boolean;
}): 'install' | 'push' | null {
  const { isInstalled, isSubscribed, installCooldownActive, pushCooldownActive } = ctx;

  if (isInstalled && isSubscribed) return null;
  if (isInstalled && !isSubscribed && !pushCooldownActive) return 'push';

  if (!isInstalled && !installCooldownActive) return 'install';

  return null;
}
