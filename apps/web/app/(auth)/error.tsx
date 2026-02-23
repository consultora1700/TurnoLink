'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Auth error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="text-center max-w-sm">
        <div className="mx-auto mb-6 h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <AlertCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-bold mb-2">Error de autenticación</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Ocurrió un error. Por favor, intentá de nuevo.
        </p>
        <div className="flex gap-3 justify-center">
          <Button size="sm" onClick={reset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reintentar
          </Button>
          <Link href="/login">
            <Button size="sm" variant="outline">
              Volver al login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
