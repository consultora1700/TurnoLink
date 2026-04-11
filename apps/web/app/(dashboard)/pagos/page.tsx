'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Link as LinkIcon,
  Unlink,
  Check,
  X,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDashboardApi } from '@/lib/hooks/use-dashboard-api';
import { useToast } from '@/hooks/use-toast';
import { useTwoFactorModal } from '@/components/ui/two-factor-modal';
import { useTenantConfig } from '@/contexts/tenant-config-context';
import { usePlanFeatures } from '@/lib/hooks/use-plan-features';
import { UpgradeWall } from '@/components/dashboard/upgrade-wall';

interface MercadoPagoStatus {
  isConnected: boolean;
  isSandbox: boolean;
  connectedAt: string | null;
  userId: string | null;
}

function PagosPageContent() {
  const { hasFeature, planTier, isLoaded } = usePlanFeatures();
  const canAccess = hasFeature('online_payments') || hasFeature('mercadopago');

  const api = useDashboardApi();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const oauthHandled = useRef(false);
  const twoFA = useTwoFactorModal();
  const { clientLabelPlural } = useTenantConfig();

  // State (must be before any conditional return)
  const [loading, setLoading] = useState(true);
  const [mpStatus, setMpStatus] = useState<MercadoPagoStatus | null>(null);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [processing, setProcessing] = useState(false);

  // ALL hooks MUST be before any conditional return (React rules of hooks)
  useEffect(() => {
    if (!isLoaded || !canAccess || !api) return;

    let cancelled = false;

    const loadData = async () => {
      try {
        const status = await api.getMercadoPagoStatus();
        if (cancelled) return;
        setMpStatus(status);
      } catch (err) {
        if (cancelled) return;
        console.error('Error loading data:', err);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo cargar la configuración de pagos',
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, [api, isLoaded, canAccess]);

  // Handle URL params (success/error from OAuth callback) - runs once
  useEffect(() => {
    if (oauthHandled.current) return;

    const mpConnected = searchParams.get('mp_connected');
    const mpError = searchParams.get('mp_error');

    if (!mpConnected && !mpError) return;

    oauthHandled.current = true;

    if (mpConnected === 'true') {
      toast({
        title: 'Mercado Pago conectado',
        description: 'Tu cuenta de Mercado Pago ha sido conectada exitosamente',
      });
      if (api) {
        api.getMercadoPagoStatus()
          .then(setMpStatus)
          .catch((err: any) => console.error('Failed to reload MP status:', err));
      }
    }

    if (mpError) {
      toast({
        variant: 'destructive',
        title: 'Error al conectar',
        description: decodeURIComponent(mpError),
      });
    }

    // Clean URL without triggering re-render
    window.history.replaceState(null, '', '/pagos');
  }, [searchParams, api]);

  // ── Loading state (avoid flash of UpgradeWall) ──
  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="h-32 rounded-xl bg-muted animate-pulse" />
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />)}
        </div>
      </div>
    );
  }

  // Block free plans
  if (planTier === 'free' || (!canAccess && planTier !== null)) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-4 sm:p-6 md:p-8 text-white">
          <div className="absolute inset-0 bg-grid opacity-10" />
          <div className="absolute -top-24 -right-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="relative flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
              <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold">Pagos</h1>
              <p className="text-white/80 text-sm sm:text-base">Configura Mercado Pago y depósitos</p>
            </div>
          </div>
        </div>
        <UpgradeWall
          title="Pagos con Mercado Pago"
          description="Conectá Mercado Pago para recibir pagos de señas y ventas directamente en tu cuenta. Disponible en planes superiores."
          planName="Comercio"
          previewLabels={['Conexión MP', 'Pagos recibidos', 'Facturación', 'Comisiones']}
        />
      </div>
    );
  }

  const handleConnectClick = () => {
    setShowConnectDialog(true);
  };

  const handleConfirmConnect = async () => {
    if (!api) return;
    setShowConnectDialog(false);
    try {
      let totpCode: string | null = null;
      // Only require TOTP when reconnecting (already connected)
      if (mpStatus?.isConnected) {
        totpCode = await twoFA.requestVerification();
      }
      setProcessing(true);
      const url = await api.getMercadoPagoOAuthUrl(totpCode, false);
      window.location.href = url;
    } catch (err: any) {
      if (err?.message === 'Verificación cancelada') return;
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err?.message || 'No se pudo conectar con Mercado Pago',
      });
      setProcessing(false);
    }
  };

  const handleDisconnectClick = () => {
    setShowDisconnectDialog(true);
  };

  const handleConfirmDisconnect = async () => {
    if (!api) return;
    setShowDisconnectDialog(false);
    try {
      setProcessing(true);
      await api.disconnectMercadoPago();
      setMpStatus((prev) => prev ? { ...prev, isConnected: false } : null);
      toast({
        title: 'Cuenta desconectada',
        description: 'Mercado Pago ha sido desconectado exitosamente',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err?.message || 'No se pudo desconectar',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-blue-100 dark:border-blue-900" />
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 animate-spin" />
        </div>
        <p className="text-muted-foreground">Cargando configuración de pagos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-4 sm:p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-24 -right-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
              <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold">Pagos</h1>
              <p className="text-white/80 text-sm sm:text-base truncate sm:whitespace-normal">
                Configura Mercado Pago y depósitos
              </p>
            </div>
          </div>

          <Badge className={`text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 w-fit ${mpStatus?.isConnected ? 'bg-white text-blue-700' : 'bg-white/20 text-white'}`}>
            {mpStatus?.isConnected ? (
              <>
                <CheckCircle2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">MP Conectado</span>
                <span className="sm:hidden">Conectado</span>
              </>
            ) : (
              <>
                <X className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Sin conectar
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Mercado Pago Connection Card */}
      <Card className="border-0 shadow-soft overflow-hidden">
        <div className={`h-1 bg-gradient-to-r ${mpStatus?.isConnected ? 'from-emerald-500 to-teal-500' : 'from-slate-300 to-slate-400'}`} />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-14 w-28 rounded-xl flex items-center justify-center overflow-hidden bg-white border border-slate-200 dark:border-neutral-700 p-2">
                <img
                  src="/mercadopago-logo.webp"
                  alt="Mercado Pago"
                  width={224}
                  height={58}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <CardTitle className="text-xl">Mercado Pago</CardTitle>
                <CardDescription>
                  Recibe pagos de señas directamente en tu cuenta
                </CardDescription>
              </div>
            </div>
            {mpStatus?.isConnected && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                Conectado
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {mpStatus?.isConnected ? (
            <>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-emerald-800 dark:text-emerald-300">Cuenta conectada</p>
                  {mpStatus.connectedAt && (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                      Conectada el {new Date(mpStatus.connectedAt).toLocaleDateString('es-AR')}
                    </p>
                  )}
                </div>
                {mpStatus.userId && (
                  <Badge variant="outline" className="text-emerald-700 border-emerald-300">
                    ID: {mpStatus.userId}
                  </Badge>
                )}
              </div>

              <Button
                variant="destructive"
                onClick={handleDisconnectClick}
                className="w-full"
              >
                <Unlink className="mr-2 h-4 w-4" />
                Desconectar Mercado Pago
              </Button>
            </>
          ) : (
            <>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800">
                <p className="text-sm text-muted-foreground">
                  Conecta tu cuenta de Mercado Pago para recibir pagos de señas automáticamente.
                  Los {clientLabelPlural.toLowerCase()} podrán pagar con tarjetas, efectivo, y más medios de pago.
                </p>
              </div>

              <Button
                onClick={handleConnectClick}
                className="w-full h-12 bg-gradient-to-r from-[#009EE3] to-[#00B1EA] hover:from-[#008ACE] hover:to-[#009DD5]"
              >
                <LinkIcon className="mr-2 h-5 w-5" />
                Conectar Mercado Pago
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* OAuth Security & Trust Section */}
      <Card className="border-0 shadow-soft overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Conexión segura con Mercado Pago</CardTitle>
              <CardDescription>
                Entendé cómo funciona y por qué es 100% seguro
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* How OAuth works */}
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/20 p-5">
            <h3 className="font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-2 mb-3">
              <Lock className="h-4 w-4" />
              ¿Cómo funciona la conexión?
            </h3>
            <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
              Usamos el sistema oficial de autorización de Mercado Pago llamado <strong>OAuth 2.0</strong>.
              Es el mismo método que usan apps como Uber, Rappi o MercadoLibre cuando te piden &quot;Conectar con Mercado Pago&quot;.
            </p>
            <div className="mt-4 grid gap-3">
              <div className="flex items-start gap-3 bg-white/60 dark:bg-white/5 rounded-lg p-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">Te redirigimos a Mercado Pago</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">Salís de TurnoLink y entrás directamente al sitio oficial de Mercado Pago (mercadopago.com.ar)</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/60 dark:bg-white/5 rounded-lg p-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">Vos autorizás desde Mercado Pago</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">Iniciás sesión en tu cuenta de MP y aceptás los permisos. Nosotros nunca vemos tu contraseña.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/60 dark:bg-white/5 rounded-lg p-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">Mercado Pago nos envía un token</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">Un código temporal que solo permite recibir pagos en tu nombre. No permite extraer dinero ni acceder a tu saldo.</p>
                </div>
              </div>
            </div>
          </div>

          {/* What we CAN and CANNOT do */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 mb-3 text-sm">
                <Eye className="h-4 w-4" />
                Qué puede hacer TurnoLink
              </h4>
              <ul className="space-y-2">
                {[
                  'Crear cobros cuando tus clientes reservan',
                  'Ver el estado de los pagos (aprobado, pendiente)',
                  'Emitir reembolsos si cancelás un turno',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-400">
                    <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-4">
              <h4 className="font-semibold text-red-800 dark:text-red-300 flex items-center gap-2 mb-3 text-sm">
                <EyeOff className="h-4 w-4" />
                Qué NO puede hacer TurnoLink
              </h4>
              <ul className="space-y-2">
                {[
                  'Retirar o transferir tu dinero',
                  'Ver tu saldo o datos bancarios',
                  'Acceder a tu contraseña de MP',
                  'Hacer cobros sin que vos lo configures',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-red-700 dark:text-red-400">
                    <X className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Revocable anytime */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
            <RefreshCw className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-300">Podés desconectar cuando quieras</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                Desde esta misma página o desde tu cuenta de Mercado Pago en{' '}
                <a
                  href="https://www.mercadopago.com.ar/settings/security"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium hover:text-amber-900 dark:hover:text-amber-200 inline-flex items-center gap-0.5"
                >
                  Configuración &gt; Seguridad <ExternalLink className="h-3 w-3" />
                </a>
                {' '}podés revocar el acceso en cualquier momento.
              </p>
            </div>
          </div>

          {/* Official MP links */}
          <div className="rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50/50 dark:bg-neutral-800/50 p-4">
            <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3 text-sm">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              Más información en Mercado Pago
            </h4>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                { label: 'Centro de ayuda de Mercado Pago', url: 'https://www.mercadopago.com.ar/ayuda' },
                { label: 'Seguridad en Mercado Pago', url: 'https://www.mercadopago.com.ar/seguridad' },
                { label: 'Aplicaciones autorizadas', url: 'https://www.mercadopago.com.ar/settings/security' },
                { label: 'Documentación para desarrolladores', url: 'https://www.mercadopago.com.ar/developers/es/docs/checkout-api/landing' },
              ].map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-700/50 group"
                >
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-[#009EE3] group-hover:text-[#007BB6]" />
                  <span className="underline-offset-2 group-hover:underline">{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connect Dialog — Security-focused UX */}
      <AlertDialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <AlertDialogContent className="max-w-md p-0 overflow-hidden gap-0">
          {/* Header with MP branding */}
          <div className="bg-gradient-to-br from-[#009EE3] to-[#00689D] px-6 pt-6 pb-5 text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 shadow-lg ring-1 ring-white/30">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
              <AlertDialogTitle className="text-white text-lg font-bold">
                Conexión segura
              </AlertDialogTitle>
              <AlertDialogDescription className="text-white/80 text-sm mt-1">
                Vas a ser redirigido al sitio oficial de Mercado Pago
              </AlertDialogDescription>
            </div>
          </div>

          {/* Security guarantees */}
          <div className="px-6 py-5 space-y-3">
            {[
              {
                icon: Lock,
                title: 'Tu contraseña es privada',
                desc: 'Nunca vemos ni almacenamos tus credenciales de Mercado Pago',
                color: '#10b981',
              },
              {
                icon: ShieldCheck,
                title: 'Solo recibir pagos',
                desc: 'El acceso autorizado no permite extraer dinero ni ver tu saldo',
                color: '#3b82f6',
              },
              {
                icon: RefreshCw,
                title: 'Revocable en cualquier momento',
                desc: 'Desconectá desde aquí o desde tu cuenta de Mercado Pago',
                color: '#8b5cf6',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-3">
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: `${item.color}12` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: item.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>
              );
            })}

            {/* URL verification tip */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 mt-1">
              <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                <strong>Verificá la URL</strong> antes de ingresar tus datos: debe decir{' '}
                <span className="font-mono font-semibold">auth.mercadopago.com</span> o{' '}
                <span className="font-mono font-semibold">mercadopago.com.ar</span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex flex-col sm:flex-row gap-2.5">
            <AlertDialogCancel className="w-full sm:w-auto mt-0 order-2 sm:order-1">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmConnect}
              className="w-full sm:flex-1 order-1 sm:order-2 h-11 bg-gradient-to-r from-[#009EE3] to-[#00B1EA] hover:from-[#008ACE] hover:to-[#009DD5] shadow-md hover:shadow-lg transition-all font-semibold"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Continuar a Mercado Pago
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Disconnect Dialog */}
      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                <Unlink className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              Desconectar Mercado Pago
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas desconectar tu cuenta de Mercado Pago?
              No podrás recibir pagos de señas hasta que vuelvas a conectar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto mt-0">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDisconnect}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Desconectar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 2FA Modal - solo para conectar/desconectar Mercado Pago */}
      <twoFA.TwoFactorModalComponent
        title="Verificación de seguridad"
        description="Ingresa tu código de autenticación para continuar con la operación de Mercado Pago"
      />
    </div>
  );
}

export default function PagosPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-blue-100 dark:border-blue-900" />
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 animate-spin" />
        </div>
        <p className="text-muted-foreground">Cargando configuración de pagos...</p>
      </div>
    }>
      <PagosPageContent />
    </Suspense>
  );
}
