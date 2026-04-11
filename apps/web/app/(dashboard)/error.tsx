'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw, Home, ChevronDown, ChevronUp } from 'lucide-react';

const HYDRATION_PATTERNS = [
  'removeChild',
  'insertBefore',
  'Hydration',
  'hydrating',
  'server-rendered',
  'Text content does not match',
  'did not match',
];

function isHydrationError(error: Error): boolean {
  const msg = error.message || '';
  return HYDRATION_PATTERNS.some((p) => msg.includes(p));
}

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error('Dashboard error:', error);

    // Auto-reload on hydration errors — transparent to the user
    if (isHydrationError(error)) {
      const reloadKey = 'turnolink-hydration-reload';
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();

      // Only auto-reload once per 30 seconds to avoid infinite loops
      if (!lastReload || now - Number(lastReload) > 30000) {
        sessionStorage.setItem(reloadKey, String(now));
        window.location.reload();
        return;
      }
    }
  }, [error]);

  return (
    <div className="flex items-center justify-center py-16 px-4">
      <Card className="border-0 shadow-soft max-w-md w-full overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-red-500 to-orange-500" />
        <CardContent className="pt-8 pb-8 text-center">
          <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Algo salió mal</h2>
          <p className="text-muted-foreground mb-4">
            Ocurrió un error inesperado. Podés reintentar o volver al inicio.
          </p>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mx-auto mb-4 transition-colors"
          >
            {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showDetails ? 'Ocultar detalles' : 'Ver detalles del error'}
          </button>

          {showDetails && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-left">
              <p className="text-xs font-mono text-red-700 dark:text-red-300 break-all">
                {error.message || 'Error desconocido'}
              </p>
              {error.digest && (
                <p className="text-[10px] font-mono text-red-500 dark:text-red-400 mt-1">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.location.reload()} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reintentar
            </Button>
            <Link href="/dashboard">
              <Button variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                Ir al inicio
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
