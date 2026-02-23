'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  CreditCard,
  Link as LinkIcon,
  Unlink,
  AlertCircle,
  Check,
  X,
  Percent,
  Settings,
  CheckCircle2,
  ExternalLink,
  Info,
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

interface MercadoPagoStatus {
  isConnected: boolean;
  isSandbox: boolean;
  connectedAt: string | null;
  userId: string | null;
}

interface DepositSettings {
  requireDeposit: boolean;
  depositPercentage: number;
  depositMode: 'mercadopago';
}

function PagosPageContent() {
  const api = useDashboardApi();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const oauthHandled = useRef(false);
  const twoFA = useTwoFactorModal();

  // State
  const [loading, setLoading] = useState(true);
  const [mpStatus, setMpStatus] = useState<MercadoPagoStatus | null>(null);
  const [depositSettings, setDepositSettings] = useState<DepositSettings>({
    requireDeposit: false,
    depositPercentage: 30,
    depositMode: 'mercadopago',
  });

  // Dialog states
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);

  // Processing states
  const [processing, setProcessing] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Load initial data
  useEffect(() => {
    if (!api) return;

    let cancelled = false;

    const loadData = async () => {
      try {
        const [status, tenant] = await Promise.all([
          api.getMercadoPagoStatus(),
          api.getTenant(),
        ]);

        if (cancelled) return;

        setMpStatus(status);

        // Parse tenant settings
        const settings = typeof tenant.settings === 'string'
          ? JSON.parse(tenant.settings)
          : tenant.settings || {};

        setDepositSettings({
          requireDeposit: settings.requireDeposit ?? false,
          depositPercentage: settings.depositPercentage ?? 30,
          depositMode: settings.depositMode ?? 'mercadopago',
        });
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
  }, [api]);

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
      // Reload status
      if (api) {
        api.getMercadoPagoStatus()
          .then(setMpStatus)
          .catch((err) => console.error('Failed to reload MP status:', err));
      }
    }

    if (mpError) {
      toast({
        variant: 'destructive',
        title: 'Error al conectar',
        description: decodeURIComponent(mpError),
      });
    }

    // Clean URL using Next.js router
    router.replace('/pagos', { scroll: false });
  }, [searchParams, api]);

  const handleConnectClick = () => {
    setShowConnectDialog(true);
  };

  const handleConfirmConnect = async () => {
    if (!api) return;
    setShowConnectDialog(false);
    try {
      const totpCode = await twoFA.requestVerification();
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
      const totpCode = await twoFA.requestVerification();
      setProcessing(true);
      await api.disconnectMercadoPago(totpCode);
      setMpStatus((prev) => prev ? { ...prev, isConnected: false } : null);
      toast({
        title: 'Cuenta desconectada',
        description: 'Mercado Pago ha sido desconectado exitosamente',
      });
    } catch (err: any) {
      if (err?.message === 'Verificación cancelada') return;
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err?.message || 'No se pudo desconectar',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveSettings = async (newSettings: Partial<DepositSettings>) => {
    if (!api) return;
    setSavingSettings(true);
    try {
      await api.updateDepositSettings(newSettings);
      setDepositSettings((prev) => ({ ...prev, ...newSettings }));
      toast({
        title: 'Configuración guardada',
        description: 'La configuración de depósitos ha sido actualizada',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err?.message || 'No se pudo guardar la configuración',
      });
    } finally {
      setSavingSettings(false);
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

      {/* Setup Guide - Show when MP not connected */}
      {!mpStatus?.isConnected && (
        <Card className="border-0 shadow-soft overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#009EE3] to-[#00B1EA]" />
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#009EE3] to-[#00B1EA] flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Conecta Mercado Pago para recibir pagos</CardTitle>
                <CardDescription>
                  Vincula tu cuenta para cobrar señas automaticamente cuando tus clientes reserven
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700">
              <p className="text-sm text-muted-foreground mb-4">
                Los clientes podran pagar con tarjetas, efectivo, y mas medios de pago. El dinero va directo a tu cuenta de Mercado Pago.
              </p>
              <Button
                className="bg-[#009EE3] hover:bg-[#008ACE]"
                onClick={handleConnectClick}
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                Conectar Mercado Pago
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mercado Pago Connection Card */}
      <Card className="border-0 shadow-soft overflow-hidden">
        <div className={`h-1 bg-gradient-to-r ${mpStatus?.isConnected ? 'from-emerald-500 to-teal-500' : 'from-slate-300 to-slate-400'}`} />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-14 w-28 rounded-xl flex items-center justify-center overflow-hidden bg-white border border-slate-200 dark:border-neutral-700 p-2">
                <img
                  src="/mercadopago-logo.png"
                  alt="Mercado Pago"
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
                  Los clientes podrán pagar con tarjetas, efectivo, y más medios de pago.
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

      {/* Deposit Settings Card */}
      <Card className="border-0 shadow-soft overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Configuración de Señas</CardTitle>
              <CardDescription>
                Configura los requisitos de depósito para las reservas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Require Deposit Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-neutral-800">
            <div className="space-y-0.5">
              <Label className="text-base">Requerir seña</Label>
              <p className="text-sm text-muted-foreground">
                Los clientes deberán pagar una seña al reservar
              </p>
            </div>
            <Switch
              checked={depositSettings.requireDeposit}
              onCheckedChange={(checked) => handleSaveSettings({ requireDeposit: checked })}
              disabled={savingSettings}
            />
          </div>

          {depositSettings.requireDeposit && (
            <>
              {/* Deposit Percentage */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Porcentaje de seña
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={depositSettings.depositPercentage}
                    onChange={(e) => {
                      const value = Math.min(100, Math.max(1, parseInt(e.target.value) || 1));
                      setDepositSettings((prev) => ({ ...prev, depositPercentage: value }));
                    }}
                    className="w-24"
    
                  />
                  <span className="text-muted-foreground">% del precio del servicio</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveSettings({ depositPercentage: depositSettings.depositPercentage })}
    
                  >
                    Guardar
                  </Button>
                </div>
              </div>

              {!mpStatus?.isConnected && (
                <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  Conecta Mercado Pago para poder cobrar señas a tus clientes
                </div>
              )}

              {/* Info box */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium">Ejemplo de cálculo</p>
                  <p className="mt-1">
                    Para un servicio de <strong>$10,000</strong> con seña del <strong>{depositSettings.depositPercentage}%</strong>,
                    el cliente pagará <strong>${((10000 * depositSettings.depositPercentage) / 100).toLocaleString('es-AR')}</strong> al reservar.
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Connect Dialog */}
      <AlertDialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#009EE3] to-[#00B1EA] flex items-center justify-center">
                <LinkIcon className="h-4 w-4 text-white" />
              </div>
              Conectar Mercado Pago
            </AlertDialogTitle>
            <AlertDialogDescription>
              Serás redirigido a Mercado Pago para autorizar la conexión con tu cuenta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground">
              Tu cuenta se conectara en modo produccion para recibir pagos reales de tus clientes.
            </p>
          </div>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto mt-0">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmConnect}
              className="w-full sm:w-auto bg-gradient-to-r from-[#009EE3] to-[#00B1EA]"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
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
