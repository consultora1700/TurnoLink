'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar, Loader2, Link2, Sparkles, Shield, Clock, CheckCircle2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

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
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 dark:bg-neutral-800/90 backdrop-blur-sm">
      <CardHeader className="text-center pb-2">
        <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-pink-600 flex items-center justify-center">
            <Link2 className="h-6 w-6 text-white" />
          </div>
        </Link>
        <CardTitle className="text-2xl">Bienvenido de vuelta</CardTitle>
        <CardDescription>
          Ingresa a tu cuenta para gestionar tu negocio
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm p-3 rounded-lg flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
                <span className="text-red-500 dark:text-red-400 text-xs">!</span>
              </div>
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
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
              <Label htmlFor="password">Contraseña</Label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="h-11 bg-white dark:bg-neutral-700"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-primary to-pink-600 hover:from-primary/90 hover:to-pink-600/90"
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
          <p className="text-sm text-muted-foreground text-center">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Crear cuenta gratis
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

function LoginFallback() {
  return (
    <Card className="w-full max-w-md border-0 shadow-2xl">
      <CardHeader className="text-center">
        <div className="inline-flex items-center justify-center gap-2 mb-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-pink-600 flex items-center justify-center">
            <Link2 className="h-6 w-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl">Bienvenido de vuelta</CardTitle>
        <CardDescription>
          Ingresa a tu cuenta para gestionar tu negocio
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-pink-500/20" />
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-pink-500/30 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-pink-600 flex items-center justify-center">
              <Link2 className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">TurnoLink</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4">
            Gestiona tu negocio de forma simple
          </h1>
          <p className="text-lg text-white/70 mb-10">
            Sistema de turnos online para hacer crecer tu negocio.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white/80">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <span>Reservas online 24/7</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <span>Gestión de horarios flexible</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <span>Pagos seguros con Mercado Pago</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <span>Personalización completa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-pink-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 px-4 py-8 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/5 dark:bg-pink-500/10 rounded-full blur-3xl" />

        <Suspense fallback={<LoginFallback />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
