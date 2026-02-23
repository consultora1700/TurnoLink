'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { PWAInstallGuide } from './pwa-install-guide';
import { usePWAStatus } from '@/lib/hooks/use-pwa-status';

const TOUR_STORAGE_KEY = 'turnolink_tour_done';

export function PWAInstallModal() {
  const { isInstalled } = usePWAStatus();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Don't show if PWA is already installed
    if (isInstalled) return;

    const seen = localStorage.getItem('turnolink-pwa-modal-seen');
    if (seen) return;

    // Don't show until the onboarding tour is completed
    const tourDone = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!tourDone) {
      // Poll until tour is done (user might complete it during this session)
      const interval = setInterval(() => {
        if (localStorage.getItem(TOUR_STORAGE_KEY)) {
          clearInterval(interval);
          setTimeout(() => setOpen(true), 1500);
        }
      }, 2000);
      return () => clearInterval(interval);
    }

    // Tour already done from a previous session — show after brief delay
    const timer = setTimeout(() => setOpen(true), 2000);
    return () => clearTimeout(timer);
  }, [isInstalled]);

  function handleClose() {
    localStorage.setItem('turnolink-pwa-modal-seen', 'true');
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Instalar TurnoLink</DialogTitle>
          <DialogDescription className="sr-only">
            Instrucciones para instalar la app y activar notificaciones
          </DialogDescription>
        </DialogHeader>
        <PWAInstallGuide variant="modal" onDismiss={handleClose} />
      </DialogContent>
    </Dialog>
  );
}
