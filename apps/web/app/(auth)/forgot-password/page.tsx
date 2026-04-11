'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-950 to-neutral-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-5" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#3F8697]/15 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#3F8697]/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3F8697]/[0.04] rounded-full blur-3xl" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm px-4">
          {sent ? (
            /* Success state */
            <div className="text-center">
              <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Revisá tu email
              </h1>
              <p className="text-neutral-400 text-sm mb-6">
                Si existe una cuenta con <strong className="text-white">{email}</strong>, recibirás un enlace para restablecer tu contraseña.
              </p>

              <div className="bg-amber-900/20 border border-amber-800/40 text-amber-400 text-sm p-4 rounded-lg mb-6 text-left">
                <p className="font-medium mb-2">No olvides:</p>
                <ul className="list-disc list-inside space-y-1 text-amber-300/80 text-xs">
                  <li>Revisá tu carpeta de spam</li>
                  <li>El enlace expira en 1 hora</li>
                  <li>Solo podés usarlo una vez</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-11 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                  onClick={() => { setSent(false); setEmail(''); }}
                >
                  Enviar a otro email
                </Button>
                <Link href="/login" className="block">
                  <Button variant="ghost" className="w-full h-11 text-neutral-400 hover:text-white hover:bg-neutral-800">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al inicio de sesión
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Form state */
            <>
              <div className="text-center mb-6">
                <Link href="/" className="inline-block mb-5">
                  <img src="/oscuro2.png" alt="TurnoLink" className="h-14 sm:h-16 mx-auto" />
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  ¿Olvidaste tu contraseña?
                </h1>
                <p className="text-neutral-500 text-sm">
                  Ingresá tu email y te enviaremos un enlace para restablecerla
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
                    autoFocus
                    className="h-11 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-[#3F8697] focus:ring-[#3F8697]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-[#3F8697] to-[#4DA4B8] hover:from-[#346E7D] hover:to-[#3F8697] mt-2"
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

                <Link href="/login" className="block">
                  <Button variant="ghost" className="w-full h-11 text-neutral-400 hover:text-white hover:bg-neutral-800">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al inicio de sesión
                  </Button>
                </Link>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
