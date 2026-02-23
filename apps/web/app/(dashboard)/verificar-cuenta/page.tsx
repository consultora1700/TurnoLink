'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Shield,
  Clock,
  Bell,
  RefreshCw,
  ExternalLink,
  HelpCircle,
  Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface VerificationStatus {
  emailVerified: boolean;
}

export default function VerificarCuentaPage() {
  const { data: session } = useSession();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [sendCount, setSendCount] = useState(0);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!session?.accessToken) return;
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://api-turnolink.mubitt.com'}/api/email-verification/status`,
          {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (error) {
        console.error('Error fetching verification status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [session?.accessToken]);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const sendVerificationEmail = async () => {
    if (!session?.accessToken || cooldown > 0) return;
    setSending(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://api-turnolink.mubitt.com'}/api/email-verification/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (response.ok) {
        setSent(true);
        setSendCount(prev => prev + 1);
        // Progressive cooldown: 30s, 60s, 120s, etc.
        const newCooldown = Math.min(30 * Math.pow(2, sendCount), 300);
        setCooldown(newCooldown);
      } else {
        const data = await response.json();
        setError(data.message || 'Error al enviar el email');
      }
    } catch (error) {
      setError('Error al enviar el email de verificacion');
    } finally {
      setSending(false);
    }
  };

  const refreshStatus = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://api-turnolink.mubitt.com'}/api/email-verification/status`,
        {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        if (data.emailVerified && !status?.emailVerified) {
          setSent(false); // Reset sent state if now verified
        }
      }
    } catch (error) {
      console.error('Error refreshing status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Verificar Email</h1>
        <p className="text-muted-foreground">
          Verifica tu email para acceder a todas las funciones
        </p>
      </div>

      {/* Status Card */}
      <div className="bg-card rounded-xl border p-6">
        <div className="flex items-start gap-4">
          <div
            className={`h-14 w-14 rounded-xl flex items-center justify-center ${
              status?.emailVerified
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-amber-100 dark:bg-amber-900/30'
            }`}
          >
            {status?.emailVerified ? (
              <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" />
            ) : (
              <Mail className="h-7 w-7 text-amber-600 dark:text-amber-400" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">
                {status?.emailVerified ? 'Email Verificado' : 'Email No Verificado'}
              </h2>
              {status?.emailVerified ? (
                <Badge className="bg-green-500">Verificado</Badge>
              ) : (
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                  Pendiente
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              {session?.user?.email}
            </p>

            {!status?.emailVerified && (
              <div className="mt-4 space-y-4">
                {sent ? (
                  <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-green-900 dark:text-green-100">
                          Email enviado correctamente
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Revisa tu bandeja de entrada en <strong>{session?.user?.email}</strong>
                        </p>

                        {/* Steps after sending */}
                        <div className="mt-4 space-y-2">
                          {[
                            { icon: Inbox, text: 'Abre tu bandeja de entrada' },
                            { icon: Mail, text: 'Busca el email de TurnoLink' },
                            { icon: ExternalLink, text: 'Haz clic en "Verificar mi email"' },
                          ].map(({ icon: Icon, text }, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                              <Icon className="h-4 w-4" />
                              <span>{text}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={refreshStatus}
                            disabled={loading}
                            className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300"
                          >
                            {loading ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <RefreshCw className="h-4 w-4 mr-2" />
                            )}
                            Verificar estado
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={sendVerificationEmail}
                            disabled={sending || cooldown > 0}
                            className="text-green-700 hover:bg-green-100 dark:text-green-300"
                          >
                            {cooldown > 0 ? (
                              <>
                                <Clock className="h-4 w-4 mr-2" />
                                Reenviar en {cooldown}s
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Reenviar email
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={sendVerificationEmail}
                        disabled={sending || cooldown > 0}
                      >
                        {sending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : cooldown > 0 ? (
                          <Clock className="h-4 w-4 mr-2" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        {cooldown > 0
                          ? `Enviar en ${cooldown}s`
                          : 'Enviar Email de Verificacion'}
                      </Button>
                    </div>

                    {/* Cooldown progress */}
                    {cooldown > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Podras reenviar en {cooldown} segundos
                        <div className="h-1 bg-muted rounded-full mt-2 overflow-hidden">
                          <div
                            className="h-full bg-brand-500 transition-all duration-1000"
                            style={{
                              width: `${((30 * Math.pow(2, sendCount - 1) - cooldown) / (30 * Math.pow(2, sendCount - 1))) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          {error}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Benefits */}
      {!status?.emailVerified && (
        <div className="bg-muted/50 rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-brand-500" />
            Beneficios de verificar tu email:
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium">Mayor Seguridad</h4>
                <p className="text-sm text-muted-foreground">
                  Protege tu cuenta con recuperacion por email
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <Bell className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium">Notificaciones</h4>
                <p className="text-sm text-muted-foreground">
                  Recibe alertas de nuevos turnos y recordatorios
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
              <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-medium">Confianza</h4>
                <p className="text-sm text-muted-foreground">
                  Tus clientes veran que tu cuenta esta verificada
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
              <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="font-medium">Recordatorios</h4>
                <p className="text-sm text-muted-foreground">
                  Envio automatico de recordatorios a clientes
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Troubleshooting Tips */}
      {!status?.emailVerified && sent && (
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
          <h3 className="font-semibold mb-3 text-amber-900 dark:text-amber-100">
            ¿No recibes el email?
          </h3>
          <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              Revisa tu carpeta de spam o correo no deseado
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              Verifica que tu email este escrito correctamente: <strong>{session?.user?.email}</strong>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              Agrega noreply@turnolink.com a tus contactos
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">4.</span>
              Espera unos minutos, a veces los emails tardan en llegar
            </li>
          </ul>
        </div>
      )}

      {/* Already verified */}
      {status?.emailVerified && (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  Tu cuenta esta completamente verificada
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Tienes acceso a todas las funciones de TurnoLink
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    <Shield className="h-3 w-3 mr-1" />
                    Cuenta segura
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    <Bell className="h-3 w-3 mr-1" />
                    Notificaciones activas
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Perfil verificado
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Next steps after verification */}
          <div className="bg-muted/50 rounded-xl p-6">
            <h3 className="font-semibold mb-4">¿Que sigue?</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <Link
                href="/configuracion"
                className="flex items-center gap-3 p-3 bg-background rounded-lg border hover:border-brand-500 transition-colors"
              >
                <Shield className="h-5 w-5 text-brand-500" />
                <span className="text-sm font-medium">Completar tu perfil</span>
              </Link>
              <Link
                href="/seguridad"
                className="flex items-center gap-3 p-3 bg-background rounded-lg border hover:border-brand-500 transition-colors"
              >
                <Shield className="h-5 w-5 text-brand-500" />
                <span className="text-sm font-medium">Activar 2FA</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="text-center pt-4">
        <p className="text-sm text-muted-foreground">
          ¿Tienes problemas con la verificacion?{' '}
          <Link href="/ayuda" className="text-brand-600 hover:underline inline-flex items-center gap-1">
            Visita nuestro centro de ayuda
            <HelpCircle className="h-3 w-3" />
          </Link>
        </p>
      </div>
    </div>
  );
}
