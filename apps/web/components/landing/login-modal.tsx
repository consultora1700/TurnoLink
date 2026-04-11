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
      <DialogContent
        className="sm:max-w-md text-white [&>button]:bg-white/10 [&>button]:text-white/60 [&>button]:hover:text-white [&>button]:opacity-100"
        style={{ backgroundColor: '#0a0a0a', borderColor: 'rgba(255,255,255,0.08)' }}
        overlayClassName="backdrop-blur-md bg-black/70"
      >
        <DialogHeader className="text-center pb-2">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-2" onClick={() => onOpenChange(false)}>
            <img
              src="/logo-claro.png"
              alt="TurnoLink"
              className="h-20 w-auto"
            />
          </Link>
          <DialogTitle className="text-2xl text-white font-semibold">Bienvenido de vuelta</DialogTitle>
          <DialogDescription className="text-white/50">
            Ingresa a tu cuenta para gestionar tu negocio
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-red-400 text-xs">!</span>
              </div>
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-white/70">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="h-11 bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/30 focus:border-[#3F8697] focus:ring-[#3F8697]/20"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password" className="text-white/70">Contraseña</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-[#3F8697] hover:text-[#3F8697]/80 hover:underline"
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
              className="h-11 bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/30 focus:border-[#3F8697] focus:ring-[#3F8697]/20"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 lv2-glow-btn bg-[#3F8697] text-white rounded-[10px] border-0 hover:bg-[#3F8697]/90"
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

          <p className="text-sm text-white/40 text-center pt-2">
            ¿No tienes cuenta?{' '}
            <Link
              href="/register"
              className="text-[#3F8697] font-medium hover:underline"
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
