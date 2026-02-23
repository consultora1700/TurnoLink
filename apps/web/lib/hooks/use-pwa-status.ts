'use client';

import { useState, useEffect } from 'react';

interface PWAStatus {
  /** True if the app is running as an installed PWA (standalone mode) */
  isInstalled: boolean;
  /** True if we're still detecting (first render) */
  isLoading: boolean;
}

/**
 * Detects whether the user is running the app as an installed PWA.
 * Works on Android (Chrome), iOS (Safari), and desktop.
 */
export function usePWAStatus(): PWAStatus {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Method 1: CSS media query (Android Chrome, desktop browsers)
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    // Method 2: iOS Safari proprietary property
    const iosStandalone = (navigator as any).standalone === true;

    setIsInstalled(standaloneQuery.matches || iosStandalone);
    setIsLoading(false);

    // Listen for changes (e.g., user installs the PWA during this session)
    const handler = (e: MediaQueryListEvent) => setIsInstalled(e.matches);
    standaloneQuery.addEventListener('change', handler);
    return () => standaloneQuery.removeEventListener('change', handler);
  }, []);

  return { isInstalled, isLoading };
}

/**
 * Check if push notifications are active (permission granted + subscribed).
 */
export function usePushStatus(): { isSubscribed: boolean; isLoading: boolean } {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function check() {
      try {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
          setIsLoading(false);
          return;
        }

        if (Notification.permission !== 'granted') {
          setIsLoading(false);
          return;
        }

        const registration = await navigator.serviceWorker.getRegistration('/sw.js');
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        }
      } catch {
        // Silently fail
      } finally {
        setIsLoading(false);
      }
    }

    check();
  }, []);

  return { isSubscribed, isLoading };
}

/**
 * Session-based dismissal for subtle reminders.
 * Dismiss with X → hidden for this session. Comes back next time user opens the app.
 */
export function useReminderCooldown(key: string): {
  shouldShow: boolean;
  dismiss: () => void;
} {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(key);
    setShouldShow(!dismissed);
  }, [key]);

  function dismiss() {
    sessionStorage.setItem(key, 'true');
    setShouldShow(false);
  }

  return { shouldShow, dismiss };
}
