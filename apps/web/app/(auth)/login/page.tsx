'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Eye, EyeOff, LogIn } from 'lucide-react';

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        if (result.status === 401) {
          setError('Email o contraseña incorrectos');
        } else {
          setError('Error al iniciar sesión. Intenta de nuevo.');
        }
        return;
      }

      window.location.href = callbackUrl;
    } catch {
      setError('Error de conexión. Verifica tu internet e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const registerHref = `/register${callbackUrl !== '/dashboard' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`;

  return (
    <div className="w-full max-w-sm px-4">
      <div className="text-center mb-6">
        <Link href="/" className="inline-block mb-5">
          <img src="/oscuro2.png" alt="TurnoLink" className="h-14 sm:h-16 mx-auto" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
          Bienvenido de vuelta
        </h1>
        <p className="text-neutral-500 text-sm">
          Ingresá a tu cuenta para gestionar tu negocio
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-900/20 border border-red-800/40 text-red-400 text-sm p-3 rounded-lg flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-red-900/50 flex items-center justify-center flex-shrink-0">
              <span className="text-red-400 text-xs">!</span>
            </div>
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-neutral-300">Email</label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="h-11 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-[#3F8697] focus:ring-[#3F8697]"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-neutral-300">Contraseña</label>
            <Link href="/forgot-password" className="text-xs text-[#4DA4B8] hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="h-11 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-[#3F8697] focus:ring-[#3F8697] pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-gradient-to-r from-[#3F8697] to-[#4DA4B8] hover:from-[#346E7D] hover:to-[#3F8697] mt-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Ingresando...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Ingresar
            </>
          )}
        </Button>

        <p className="text-sm text-neutral-500 text-center pt-2">
          ¿No tenés cuenta?{' '}
          <Link href={registerHref} className="text-[#4DA4B8] font-medium hover:underline">
            Crear cuenta gratis
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-950 to-neutral-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-5" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#3F8697]/15 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#3F8697]/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3F8697]/[0.04] rounded-full blur-3xl" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <Suspense fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
