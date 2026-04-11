'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, CheckCircle2, Eye, EyeOff, KeyRound } from 'lucide-react';
import { authApi } from '@/lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [redirectCount, setRedirectCount] = useState(5);

  useEffect(() => {
    if (!success) return;
    if (redirectCount <= 0) {
      router.push('/login');
      return;
    }
    const timer = setTimeout(() => setRedirectCount(redirectCount - 1), 1000);
    return () => clearTimeout(timer);
  }, [success, redirectCount, router]);

  // No token = invalid link
  if (!token) {
    return (
      <div className="w-full max-w-sm px-4 text-center">
        <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-red-900/30 flex items-center justify-center">
          <span className="text-2xl">&#9888;</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Enlace inválido
        </h1>
        <p className="text-neutral-400 text-sm mb-6">
          Este enlace de recuperación no es válido o ya expiró.
        </p>
        <div className="space-y-3">
          <Link href="/forgot-password" className="block">
            <Button className="w-full h-11 bg-gradient-to-r from-[#3F8697] to-[#4DA4B8] hover:from-[#346E7D] hover:to-[#3F8697]">
              Solicitar nuevo enlace
            </Button>
          </Link>
          <Link href="/login" className="block">
            <Button variant="ghost" className="w-full h-11 text-neutral-400 hover:text-white hover:bg-neutral-800">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio de sesión
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordLongEnough = password.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('inválido') || message.includes('expirado') || message.includes('utilizado')) {
        setError(message);
      } else {
        setError('Ocurrió un error. El enlace puede haber expirado.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-sm px-4 text-center">
        <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-green-900/30 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Contraseña actualizada
        </h1>
        <p className="text-neutral-400 text-sm mb-6">
          Tu contraseña fue restablecida correctamente. Ya podés iniciar sesión con tu nueva contraseña.
        </p>
        <div className="space-y-3">
          <Link href="/login" className="block">
            <Button className="w-full h-11 bg-gradient-to-r from-[#3F8697] to-[#4DA4B8] hover:from-[#346E7D] hover:to-[#3F8697]">
              Iniciar sesión
            </Button>
          </Link>
          <p className="text-sm text-neutral-500">
            Redirigiendo en {redirectCount}s...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm px-4">
      <div className="text-center mb-6">
        <Link href="/" className="inline-block mb-5">
          <img src="/oscuro2.png" alt="TurnoLink" className="h-14 sm:h-16 mx-auto" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
          Nueva contraseña
        </h1>
        <p className="text-neutral-500 text-sm">
          Creá una contraseña segura para tu cuenta
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
          <label htmlFor="password" className="text-sm font-medium text-neutral-300">Nueva contraseña</label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoFocus
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

        <div className="space-y-2">
          <label htmlFor="confirm-password" className="text-sm font-medium text-neutral-300">Confirmar contraseña</label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repetir contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className="h-11 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-[#3F8697] focus:ring-[#3F8697] pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Password validation indicators */}
        <div className="space-y-2 pt-1">
          <div className={`flex items-center gap-2 text-xs transition-colors ${passwordLongEnough ? 'text-green-400' : 'text-neutral-500'}`}>
            <div className={`h-4 w-4 rounded-full flex items-center justify-center transition-colors ${passwordLongEnough ? 'bg-green-900/30' : 'bg-neutral-800'}`}>
              {passwordLongEnough ? <CheckCircle2 className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-neutral-600" />}
            </div>
            Mínimo 8 caracteres
          </div>
          <div className={`flex items-center gap-2 text-xs transition-colors ${passwordsMatch ? 'text-green-400' : 'text-neutral-500'}`}>
            <div className={`h-4 w-4 rounded-full flex items-center justify-center transition-colors ${passwordsMatch ? 'bg-green-900/30' : 'bg-neutral-800'}`}>
              {passwordsMatch ? <CheckCircle2 className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-neutral-600" />}
            </div>
            Las contraseñas coinciden
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-gradient-to-r from-[#3F8697] to-[#4DA4B8] hover:from-[#346E7D] hover:to-[#3F8697] mt-2"
          disabled={loading || !passwordLongEnough || !passwordsMatch}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Actualizando...
            </>
          ) : (
            <>
              <KeyRound className="mr-2 h-4 w-4" />
              Restablecer contraseña
            </>
          )}
        </Button>

        <Link href="/login" className="block">
          <Button variant="ghost" className="w-full h-11 text-neutral-400 hover:text-white hover:bg-neutral-800">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio de sesión
          </Button>
        </Link>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
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
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
