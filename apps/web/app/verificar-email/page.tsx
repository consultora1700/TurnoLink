'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Mail,
  ArrowRight,
  RefreshCw,
  Clock,
  HelpCircle,
  Shield,
  Sparkles,
  Inbox,
  Search,
  MousePointer,
  AlertTriangle,
  Send,
  Home,
  ExternalLink,
  PartyPopper,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LandingThemeWrapper, LandingThemeToggle } from '@/components/landing/landing-theme-wrapper';
import { cn } from '@/lib/utils';

// Confetti component for success state
const Confetti = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number; color: string }>>([]);

  useEffect(() => {
    const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'];
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full animate-confetti"
          style={{
            left: `${particle.x}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired' | 'no-token'>('loading');
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [animateIn, setAnimateIn] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      setTimeout(() => setAnimateIn(true), 100);
      return;
    }

    verifyEmail();
  }, [token]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Progress animation for loading state
  useEffect(() => {
    if (status === 'loading') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [status]);

  const verifyEmail = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-turnolink.mubitt.com';
      const response = await fetch(`${apiUrl}/api/email-verification/verify?token=${token}`);
      const data = await response.json();

      setProgress(100);

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Tu email ha sido verificado correctamente');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        if (data.message?.toLowerCase().includes('expired') || data.message?.toLowerCase().includes('expirado')) {
          setStatus('expired');
          setMessage('El enlace de verificación ha expirado. Solicita uno nuevo.');
        } else {
          setStatus('error');
          setMessage(data.message || 'No se pudo verificar el email');
        }
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error de conexión. Por favor, intenta de nuevo.');
    }
    setTimeout(() => setAnimateIn(true), 100);
  };

  const handleResendEmail = async () => {
    if (cooldown > 0 || resending) return;

    setResending(true);
    setResendSuccess(false);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-turnolink.mubitt.com';
      const response = await fetch(`${apiUrl}/api/email-verification/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token }),
      });

      if (response.ok) {
        setResendSuccess(true);
        setCooldown(60);
      } else {
        const data = await response.json();
        setMessage(data.message || 'No se pudo reenviar el email');
      }
    } catch (error) {
      setMessage('Error al reenviar. Intenta iniciar sesión y solicitar verificación desde tu perfil.');
    } finally {
      setResending(false);
    }
  };

  return (
    <LandingThemeWrapper>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Confetti */}
        {showConfetti && <Confetti />}

        {/* Header */}
        <header className="border-b bg-background/80 backdrop-blur-lg">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2">
                <img
                  src="/claro2.png"
                  alt="TurnoLink"
                  className="h-10 sm:h-12 w-auto dark:hidden"
                />
                <img
                  src="/oscuro2.png"
                  alt="TurnoLink"
                  className="h-10 sm:h-12 w-auto hidden dark:block"
                />
              </Link>
              <div className="flex items-center gap-3">
                <LandingThemeToggle />
                <Link href="/" className="hidden sm:block">
                  <Button variant="ghost" size="sm">
                    <Home className="h-4 w-4 mr-2" />
                    Inicio
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md">
            {/* Security Badge */}
            <div className="flex justify-center mb-4">
              <Badge variant="outline" className="text-xs gap-1">
                <Shield className="h-3 w-3" />
                Conexión segura
              </Badge>
            </div>

            <Card className={cn(
              "border-0 shadow-2xl transition-all duration-500 overflow-hidden",
              animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              <CardContent className="p-6 sm:p-8">
                {/* Loading State */}
                {status === 'loading' && (
                  <div className="text-center space-y-6">
                    <div className="relative mx-auto h-20 w-20">
                      {/* Outer ring */}
                      <div className="absolute inset-0 rounded-full border-4 border-muted" />
                      {/* Progress ring */}
                      <svg className="absolute inset-0 h-20 w-20 -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeDasharray={`${progress * 2.26} 226`}
                          className="text-brand-500 transition-all duration-300"
                        />
                      </svg>
                      {/* Inner icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Mail className="h-8 w-8 text-brand-600 animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold mb-2">Verificando tu email...</h1>
                      <p className="text-muted-foreground text-sm">
                        Esto solo tomará un momento
                      </p>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-center gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-2 w-2 rounded-full bg-brand-500 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Success State */}
                {status === 'success' && (
                  <div className="text-center space-y-6">
                    <div className="relative">
                      <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                      </div>
                      <div className="absolute -top-1 -right-1">
                        <PartyPopper className="h-6 w-6 text-amber-500 animate-bounce" />
                      </div>
                    </div>
                    <div>
                      <Badge className="mb-3 bg-green-100 text-green-700 border-green-300">
                        <Sparkles className="h-3 w-3 mr-1" />
                        ¡Verificación exitosa!
                      </Badge>
                      <h1 className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
                        ¡Email verificado!
                      </h1>
                      <p className="text-muted-foreground text-sm">{message}</p>
                    </div>

                    {/* What's next */}
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                        ¿Qué sigue?
                      </p>
                      <ul className="text-sm text-green-700 dark:text-green-300 space-y-1 text-left">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                          Accede a tu dashboard
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                          Configura tu primera sucursal
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                          Comienza a recibir turnos
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <Link href="/dashboard" className="block">
                        <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 w-full">
                          Ir al Dashboard
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href="/login" className="block">
                        <Button variant="outline" className="w-full">
                          Iniciar sesión
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Expired State */}
                {status === 'expired' && (
                  <div className="text-center space-y-6">
                    <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
                      <Clock className="h-10 w-10 text-amber-600" />
                    </div>
                    <div>
                      <Badge className="mb-3 bg-amber-100 text-amber-700 border-amber-300">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Enlace expirado
                      </Badge>
                      <h1 className="text-xl sm:text-2xl font-bold text-amber-900 dark:text-amber-100 mb-2">
                        El enlace ha expirado
                      </h1>
                      <p className="text-muted-foreground text-sm">{message}</p>
                    </div>

                    {/* Info box */}
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        <strong>¿Por qué expiran los enlaces?</strong><br />
                        Por seguridad, los enlaces de verificación expiran después de 24 horas.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {resendSuccess ? (
                        <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-800 animate-in fade-in">
                          <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                          <p className="text-sm font-medium text-green-700 dark:text-green-300">
                            ¡Nuevo email enviado!
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Revisa tu bandeja de entrada
                          </p>
                        </div>
                      ) : (
                        <Button
                          onClick={handleResendEmail}
                          disabled={resending || cooldown > 0}
                          className="w-full bg-amber-500 hover:bg-amber-600"
                        >
                          {resending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Enviando...
                            </>
                          ) : cooldown > 0 ? (
                            <>
                              <Clock className="h-4 w-4 mr-2" />
                              Reenviar en {cooldown}s
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Enviar nuevo enlace
                            </>
                          )}
                        </Button>
                      )}
                      <Link href="/login" className="block">
                        <Button variant="outline" className="w-full">
                          Ir a iniciar sesión
                        </Button>
                      </Link>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      También puedes solicitar verificación desde tu perfil después de iniciar sesión.
                    </p>
                  </div>
                )}

                {/* Error State */}
                {status === 'error' && (
                  <div className="text-center space-y-6">
                    <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-red-100 to-teal-100 dark:from-red-900/30 dark:to-teal-900/30 flex items-center justify-center">
                      <XCircle className="h-10 w-10 text-red-600" />
                    </div>
                    <div>
                      <Badge className="mb-3 bg-red-100 text-red-700 border-red-300">
                        Error de verificación
                      </Badge>
                      <h1 className="text-xl sm:text-2xl font-bold text-red-900 dark:text-red-100 mb-2">
                        No pudimos verificar
                      </h1>
                      <p className="text-muted-foreground text-sm">{message}</p>
                    </div>

                    {/* Troubleshooting */}
                    <div className="p-4 bg-muted/50 rounded-xl border text-left">
                      <p className="text-sm font-medium mb-2">Posibles soluciones:</p>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="h-5 w-5 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0 text-xs font-medium text-brand-600">1</span>
                          Intenta hacer clic en el enlace del email nuevamente
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="h-5 w-5 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0 text-xs font-medium text-brand-600">2</span>
                          Copia y pega la URL completa en tu navegador
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="h-5 w-5 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0 text-xs font-medium text-brand-600">3</span>
                          Solicita un nuevo email de verificación
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <Button
                        onClick={() => verifyEmail()}
                        variant="outline"
                        className="w-full"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reintentar verificación
                      </Button>
                      <Link href="/login" className="block">
                        <Button className="w-full">Ir a iniciar sesión</Button>
                      </Link>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-sm">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      <Link href="/ayuda" className="text-brand-600 hover:underline">
                        ¿Necesitas ayuda?
                      </Link>
                    </div>
                  </div>
                )}

                {/* No Token State - Instructions */}
                {status === 'no-token' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-brand-100 to-purple-100 dark:from-brand-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4">
                        <Mail className="h-10 w-10 text-brand-600" />
                      </div>
                      <Badge className="mb-3 bg-brand-100 text-brand-700 border-brand-300">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Verificación pendiente
                      </Badge>
                      <h1 className="text-xl sm:text-2xl font-bold mb-2">Verifica tu email</h1>
                      <p className="text-muted-foreground text-sm">
                        Te enviamos un email con un enlace de verificación
                      </p>
                    </div>

                    {/* Steps */}
                    <div className="space-y-3">
                      {[
                        { icon: Inbox, step: 1, text: 'Abre tu bandeja de entrada', detail: 'Revisa el email que registraste' },
                        { icon: Search, step: 2, text: 'Busca el email de TurnoLink', detail: 'Asunto: "Verifica tu email"' },
                        { icon: MousePointer, step: 3, text: 'Haz clic en el enlace', detail: 'Botón "Verificar mi email"' },
                      ].map(({ icon: Icon, step, text, detail }) => (
                        <div key={step} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl border hover:border-brand-300 transition-colors">
                          <div className="h-10 w-10 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center flex-shrink-0">
                            {step}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{text}</p>
                            <p className="text-xs text-muted-foreground">{detail}</p>
                          </div>
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      ))}
                    </div>

                    {/* Warning for spam */}
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                            ¿No recibiste el email?
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                            Revisa tu carpeta de spam o correo no deseado. A veces los emails pueden terminar ahí.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Email providers */}
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-3">Acceso rápido a tu correo:</p>
                      <div className="flex justify-center gap-2 flex-wrap">
                        {[
                          { name: 'Gmail', url: 'https://mail.google.com', color: 'hover:bg-red-50 hover:text-red-600' },
                          { name: 'Outlook', url: 'https://outlook.live.com', color: 'hover:bg-blue-50 hover:text-blue-600' },
                          { name: 'Yahoo', url: 'https://mail.yahoo.com', color: 'hover:bg-purple-50 hover:text-purple-600' },
                        ].map((provider) => (
                          <a
                            key={provider.name}
                            href={provider.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1",
                              provider.color
                            )}
                          >
                            {provider.name}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <Link href="/login" className="flex-1">
                        <Button variant="outline" className="w-full">
                          Iniciar sesión
                        </Button>
                      </Link>
                      <Link href="/ayuda" className="flex-1">
                        <Button variant="ghost" className="w-full">
                          <HelpCircle className="h-4 w-4 mr-2" />
                          Ayuda
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trust indicators */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                256-bit SSL
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Datos protegidos
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Soporte 24/7
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t py-4 sm:py-6">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              © {new Date().getFullYear()} TurnoLink. Todos los derechos reservados.
            </p>
            <div className="flex justify-center gap-4 mt-2">
              <Link href="/ayuda" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Centro de ayuda
              </Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Privacidad
              </Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Términos
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </LandingThemeWrapper>
  );
}

export default function VerificarEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-brand-500" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
