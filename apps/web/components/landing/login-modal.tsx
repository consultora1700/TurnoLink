'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email o contraseña incorrectos');
      } else {
        onOpenChange(false);
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setEmail('');
      setPassword('');
      setError('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md backdrop-blur-none bg-white dark:bg-neutral-900" overlayClassName="backdrop-blur-md bg-black/60">
        <DialogHeader className="text-center pb-2">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-2" onClick={() => onOpenChange(false)}>
            <img
              src="/claro2.png"
              alt="TurnoLink"
              className="h-20 w-auto dark:hidden"
            />
            <img
              src="/oscuro2.png"
              alt="TurnoLink"
              className="h-20 w-auto hidden dark:block"
            />
          </Link>
          <DialogTitle className="text-2xl">Bienvenido de vuelta</DialogTitle>
          <DialogDescription>
            Ingresa a tu cuenta para gestionar tu negocio
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm p-3 rounded-lg flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
                <span className="text-red-500 dark:text-red-400 text-xs">!</span>
              </div>
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="h-11 bg-white dark:bg-neutral-700"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Contraseña</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline"
                onClick={() => onOpenChange(false)}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="h-11 bg-white dark:bg-neutral-700"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ingresando...
              </>
            ) : (
              'Ingresar'
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center pt-2">
            ¿No tienes cuenta?{' '}
            <Link
              href="/register"
              className="text-primary font-medium hover:underline"
              onClick={() => onOpenChange(false)}
            >
              Crear cuenta gratis
            </Link>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
