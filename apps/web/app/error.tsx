'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const HYDRATION_PATTERNS = [
  'removeChild',
  'insertBefore',
  'Hydration',
  'hydrating',
  'server-rendered',
  'Text content does not match',
  'did not match',
];

// ChunkLoadError happens when a user navigates with a stale HTML (referencing
// chunks from a previous build) after a redeploy. The browser tries to fetch
// a chunk that no longer exists. Reloading pulls the fresh HTML and fixes it.
const CHUNK_LOAD_PATTERNS = [
  'ChunkLoadError',
  'Loading chunk',
  'Loading CSS chunk',
  'failed to fetch dynamically imported module',
];

function isHydrationError(error: Error): boolean {
  const msg = error.message || '';
  return HYDRATION_PATTERNS.some((p) => msg.includes(p));
}

function isChunkLoadError(error: Error): boolean {
  const msg = error.message || '';
  const name = error.name || '';
  return CHUNK_LOAD_PATTERNS.some((p) => msg.includes(p) || name.includes(p));
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error('App error:', error);

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

    // Auto-reload on chunk load errors (stale HTML after a redeploy).
    // Same debounce pattern to prevent infinite reload loops if the chunk is
    // actually missing (e.g., CDN glitch).
    if (isChunkLoadError(error)) {
      const reloadKey = 'turnolink-chunk-reload';
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();

      if (!lastReload || now - Number(lastReload) > 30000) {
        sessionStorage.setItem(reloadKey, String(now));
        window.location.reload();
        return;
      }
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <span className="text-2xl font-bold text-red-600 dark:text-red-400">!</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Algo salió mal</h2>
        <p className="text-muted-foreground mb-4">
          Ocurrió un error inesperado. Por favor, intentá de nuevo.
        </p>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-muted-foreground hover:text-foreground mb-4 underline"
        >
          {showDetails ? 'Ocultar detalles' : 'Ver detalles del error'}
        </button>
        {showDetails && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-left">
            <p className="text-xs font-mono text-red-700 dark:text-red-300 break-all">
              {error.message || 'Error desconocido'}
            </p>
            {error.digest && (
              <p className="text-[10px] font-mono text-red-500 mt-1">Digest: {error.digest}</p>
            )}
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
          <Link href="/">
            <Button variant="outline">Ir al inicio</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
