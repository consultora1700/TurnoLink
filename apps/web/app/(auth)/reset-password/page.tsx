'use client';

import { Suspense, useState, useEffect } from 'react';
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
import { ArrowLeft, Loader2, CheckCircle2, Eye, EyeOff, KeyRound, Shield, Lock } from 'lucide-react';
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

  // Redirect countdown after success
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
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 dark:bg-neutral-800/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <span className="text-2xl">&#9888;</span>
          </div>
          <CardTitle className="text-2xl">Enlace inválido</CardTitle>
          <CardDescription className="text-base mt-2">
            Este enlace de recuperación no es válido o ya expiró.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-3">
          <Link href="/forgot-password" className="w-full">
            <Button className="w-full h-11 bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90">
              Solicitar nuevo enlace
            </Button>
          </Link>
          <Link href="/login" className="w-full">
            <Button variant="ghost" className="w-full h-11">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio de sesión
            </Button>
          </Link>
        </CardFooter>
      </Card>
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
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 dark:bg-neutral-800/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Contraseña actualizada</CardTitle>
          <CardDescription className="text-base mt-2">
            Tu contraseña fue restablecida correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-3">
          <Link href="/login" className="w-full">
            <Button className="w-full h-11 bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90">
              Iniciar sesión
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground text-center">
            Redirigiendo en {redirectCount}s...
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 dark:bg-neutral-800/90 backdrop-blur-sm">
      <CardHeader className="text-center pb-2">
        <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
          <img
            src="/claro2.png"
            alt="TurnoLink"
            className="h-28 w-auto dark:hidden"
          />
          <img
            src="/oscuro2.png"
            alt="TurnoLink"
            className="h-28 w-auto hidden dark:block"
          />
        </Link>
        <CardTitle className="text-2xl">Nueva contraseña</CardTitle>
        <CardDescription>
          Crea una contraseña segura para tu cuenta
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
            <Label htmlFor="password">Nueva contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="h-11 bg-white dark:bg-neutral-700 pr-10"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar contraseña</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repetir contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="h-11 bg-white dark:bg-neutral-700 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Password validation indicators */}
          <div className="space-y-2 pt-1">
            <div className={`flex items-center gap-2 text-xs transition-colors ${passwordLongEnough ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
              <div className={`h-4 w-4 rounded-full flex items-center justify-center transition-colors ${passwordLongEnough ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted'}`}>
                {passwordLongEnough ? <CheckCircle2 className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />}
              </div>
              Mínimo 8 caracteres
            </div>
            <div className={`flex items-center gap-2 text-xs transition-colors ${passwordsMatch ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
              <div className={`h-4 w-4 rounded-full flex items-center justify-center transition-colors ${passwordsMatch ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted'}`}>
                {passwordsMatch ? <CheckCircle2 className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />}
              </div>
              Las contraseñas coinciden
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90"
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
          <Link href="/login" className="w-full">
            <Button variant="ghost" className="w-full h-11">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio de sesión
            </Button>
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}

function ResetPasswordFallback() {
  return (
    <Card className="w-full max-w-md border-0 shadow-2xl">
      <CardHeader className="text-center">
        <div className="inline-flex items-center justify-center gap-2 mb-4">
          <img
            src="/claro2.png"
            alt="TurnoLink"
            className="h-28 w-auto dark:hidden"
          />
          <img
            src="/oscuro2.png"
            alt="TurnoLink"
            className="h-28 w-auto hidden dark:block"
          />
        </div>
        <CardTitle className="text-2xl">Nueva contraseña</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-teal-500/20" />
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-teal-500/30 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="flex items-center gap-3 mb-8">
            <img
              src="/oscuro2.png"
              alt="TurnoLink"
              className="h-28 w-auto"
            />
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4">
            Crea tu nueva contraseña
          </h1>
          <p className="text-lg text-white/70 mb-10">
            Elige una contraseña segura para proteger tu cuenta.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white/80">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <span>Mínimo 8 caracteres</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <span>Tu contraseña se encripta de forma segura</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                <KeyRound className="h-5 w-5" />
              </div>
              <span>Usa una combinación única</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 px-4 py-8 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl" />

        <Suspense fallback={<ResetPasswordFallback />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
