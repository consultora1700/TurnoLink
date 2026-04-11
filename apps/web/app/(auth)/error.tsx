'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogIn, Loader2 } from 'lucide-react';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [redirecting, setRedirecting] = useState(true);

  useEffect(() => {
    // Auto-redirect: clear session and send to login cleanly
    const timer = setTimeout(() => {
      signOut({ callbackUrl: '/login', redirect: true }).catch(() => {
        // If signOut fails, just redirect manually
        setRedirecting(false);
        window.location.href = '/login';
      });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="text-center max-w-sm">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="text-center max-w-sm">
        <div className="mx-auto mb-6 h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <LogIn className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-bold mb-2">Sesión expirada</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Tu sesión se cerró. Iniciá sesión para continuar.
        </p>
        <Link href="/login">
          <Button size="sm" className="gap-2">
            <LogIn className="h-4 w-4" />
            Iniciar sesión
          </Button>
        </Link>
      </div>
    </div>
  );
}
