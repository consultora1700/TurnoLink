'use client';

import { useState } from 'react';
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
import { ArrowLeft, Loader2, Mail, CheckCircle2, KeyRound, Shield, Clock } from 'lucide-react';
import { authApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      setError('Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

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
            Recupera el acceso a tu cuenta
          </h1>
          <p className="text-lg text-white/70 mb-10">
            Te enviaremos un enlace seguro para restablecer tu contraseña.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white/80">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Mail className="h-5 w-5" />
              </div>
              <span>Enlace enviado a tu email</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <span>Proceso 100% seguro</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <span>El enlace expira en 1 hora</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                <KeyRound className="h-5 w-5" />
              </div>
              <span>Crea una contraseña nueva y segura</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 px-4 py-8 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl" />

        {sent ? (
          /* Success state */
          <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 dark:bg-neutral-800/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Revisa tu email</CardTitle>
              <CardDescription className="text-base mt-2">
                Si existe una cuenta con <strong className="text-foreground">{email}</strong>, recibirás un enlace para restablecer tu contraseña.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm p-4 rounded-lg space-y-2">
                <p className="font-medium">No olvides:</p>
                <ul className="list-disc list-inside space-y-1 text-amber-700 dark:text-amber-300">
                  <li>Revisa tu carpeta de spam</li>
                  <li>El enlace expira en 1 hora</li>
                  <li>Solo puedes usarlo una vez</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full h-11"
                onClick={() => { setSent(false); setEmail(''); }}
              >
                Enviar a otro email
              </Button>
              <Link href="/login" className="w-full">
                <Button variant="ghost" className="w-full h-11">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al inicio de sesión
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ) : (
          /* Form state */
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
              <CardTitle className="text-2xl">¿Olvidaste tu contraseña?</CardTitle>
              <CardDescription>
                Ingresa tu email y te enviaremos un enlace para restablecerla
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
                    autoFocus
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar enlace de recuperación
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
        )}
      </div>
    </div>
  );
}
