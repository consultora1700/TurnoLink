'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PWAInstallGuide } from './pwa-install-guide';
import { usePWAStatus } from '@/lib/hooks/use-pwa-status';

const TOUR_STORAGE_KEY = 'turnolink_tour_done';

export function PWAInstallCard() {
  const { isInstalled } = usePWAStatus();
  const [dismissed, setDismissed] = useState(true); // Start hidden to prevent flash

  useEffect(() => {
    // Don't show if PWA is already installed
    if (isInstalled) return;

    const hidden = localStorage.getItem('turnolink-pwa-card-dismissed');
    const tourDone = localStorage.getItem(TOUR_STORAGE_KEY);
    // Only show if not dismissed AND tour is already completed
    setDismissed(!!hidden || !tourDone);
  }, [isInstalled]);

  function handleDismiss() {
    localStorage.setItem('turnolink-pwa-card-dismissed', 'true');
    setDismissed(true);
  }

  if (dismissed || isInstalled) return null;

  return (
    <Card
      data-pwa-install-card
      className="border-2 border-teal-200 dark:border-teal-800 bg-gradient-to-br from-teal-50/50 to-cyan-50/50 dark:from-teal-900/10 dark:to-cyan-900/10 shadow-md relative overflow-hidden transition-all"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-200/20 dark:bg-teal-800/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-white/80 dark:bg-neutral-800/80 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
      <CardContent className="p-4 sm:p-6 relative">
        <PWAInstallGuide variant="card" onDismiss={handleDismiss} />
      </CardContent>
    </Card>
  );
}
