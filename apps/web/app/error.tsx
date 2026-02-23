'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
          <Button onClick={reset}>Reintentar</Button>
          <Link href="/">
            <Button variant="outline">Ir al inicio</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
