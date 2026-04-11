'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Video,
  Link as LinkIcon,
  Unlink,
  Check,
  X,
  CheckCircle2,
  ExternalLink,
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
import { handleApiError } from '@/lib/notifications';
import { useTenantConfig, useRubroTerms } from '@/contexts/tenant-config-context';
import { bookingGender } from '@/lib/tenant-config';

interface VideoStatus {
  isConnected: boolean;
  provider: string | null;
  connectedAt: string | null;
  accountEmail: string | null;
}

const providerLabels: Record<string, string> = {
  zoom: 'Zoom',
  google_meet: 'Google Meet',
};

function VideollamadasPageContent() {
  const api = useDashboardApi();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const oauthHandled = useRef(false);
  const { clientLabelSingular, clientLabelPlural } = useTenantConfig();
  const terms = useRubroTerms();
  const gender = bookingGender(terms);

  const [loading, setLoading] = useState(true);
  const [videoStatus, setVideoStatus] = useState<VideoStatus | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);

  // Load status
  useEffect(() => {
    if (!api) return;
    let cancelled = false;

    const loadData = async () => {
      try {
        const status = await api.getVideoStatus();
        if (!cancelled) setVideoStatus(status);
      } catch (err) {
        if (!cancelled) {
          handleApiError(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, [api]);

  // Handle URL params from OAuth callback
  useEffect(() => {
    if (oauthHandled.current) return;

    const connected = searchParams.get('connected');
    const error = searchParams.get('error');

    if (!connected && !error) return;

    oauthHandled.current = true;

    if (connected === 'true') {
      toast({
        title: 'Videollamadas conectadas',
        description: 'Tu cuenta ha sido conectada exitosamente',
      });
      if (api) {
        api.getVideoStatus()
          .then(setVideoStatus)
          .catch((error) => handleApiError(error));
      }
    }

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error al conectar',
        description: decodeURIComponent(error),
      });
    }

    router.replace('/videollamadas', { scroll: false });
  }, [searchParams, api]);

  const handleConnect = async (provider: string) => {
    if (!api) return;
    setProcessing(true);
    try {
      const url = await api.getVideoOAuthUrl(provider);
      window.location.href = url;
    } catch (err) {
      handleApiError(err);
      setProcessing(false);
    }
  };

  const handleConfirmDisconnect = async () => {
    if (!api) return;
    setShowDisconnectDialog(false);
    setProcessing(true);
    try {
      await api.disconnectVideo();
      setVideoStatus((prev) => prev ? { ...prev, isConnected: false, provider: null } : null);
      toast({
        title: 'Desconectado',
        description: 'Videollamadas desconectadas exitosamente',
      });
    } catch (err) {
      handleApiError(err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-indigo-100 dark:border-indigo-900" />
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
        </div>
        <p className="text-muted-foreground">Cargando configuracion de videollamadas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 p-4 sm:p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-24 -right-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
              <Video className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold">Videollamadas</h1>
              <p className="text-white/80 text-sm sm:text-base truncate sm:whitespace-normal">
                Conecta Zoom o Google Meet para sesiones online
              </p>
            </div>
          </div>

          <Badge className={`text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 w-fit ${videoStatus?.isConnected ? 'bg-white text-indigo-700' : 'bg-white/20 text-white'}`}>
            {videoStatus?.isConnected ? (
              <>
                <CheckCircle2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{providerLabels[videoStatus.provider || ''] || 'Conectado'}</span>
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

      {/* Connected State */}
      {videoStatus?.isConnected && (
        <Card className="border-0 shadow-soft overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">{providerLabels[videoStatus.provider || ''] || 'Video'}</CardTitle>
                  <CardDescription>
                    Al crear {terms.bookingPlural.toLowerCase()} online se generará automáticamente un link de videollamada
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                Conectado
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-emerald-800 dark:text-emerald-300">Cuenta conectada</p>
                <div className="text-sm text-emerald-600 dark:text-emerald-400 space-y-0.5">
                  {videoStatus.accountEmail && (
                    <p>{videoStatus.accountEmail}</p>
                  )}
                  {videoStatus.connectedAt && (
                    <p>Conectada el {new Date(videoStatus.connectedAt).toLocaleDateString('es-AR')}</p>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="destructive"
              onClick={() => setShowDisconnectDialog(true)}
              disabled={processing}
              className="w-full"
            >
              <Unlink className="mr-2 h-4 w-4" />
              Desconectar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Not Connected - Provider Selection */}
      {!videoStatus?.isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Zoom Card */}
          <Card className="border-0 shadow-soft overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Zoom</CardTitle>
                  <CardDescription>
                    Crea reuniones de Zoom automaticamente
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700">
                <p className="text-sm text-muted-foreground mb-4">
                  Conecta tu cuenta de Zoom para generar links de videollamada automáticamente cuando tus {clientLabelPlural.toLowerCase()} {terms.bookingVerb}n {gender.articleUn} {terms.bookingSingular.toLowerCase()} online.
                </p>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleConnect('zoom')}
                  disabled={processing}
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Conectar Zoom
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Google Meet Card */}
          <Card className="border-0 shadow-soft overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Google Meet</CardTitle>
                  <CardDescription>
                    Crea reuniones de Google Meet automaticamente
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700">
                <p className="text-sm text-muted-foreground mb-4">
                  Conecta tu cuenta de Google para generar links de Google Meet automáticamente cuando tus {clientLabelPlural.toLowerCase()} {terms.bookingVerb}n {gender.articleUn} {terms.bookingSingular.toLowerCase()} online.
                </p>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handleConnect('google_meet')}
                  disabled={processing}
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Conectar Google Meet
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info Card */}
      <Card className="border-0 shadow-soft overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-slate-300 to-slate-400" />
        <CardHeader>
          <CardTitle className="text-lg">Como funciona</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>1. Conecta tu cuenta de Zoom o Google Meet desde esta pagina.</p>
            <p>2. Configura tus {terms.servicePlural.toLowerCase()} como &quot;Online&quot; o &quot;Ambos&quot; desde la sección de {terms.servicePlural}.</p>
            <p>3. Cuando un {clientLabelSingular.toLowerCase()} reserve {gender.articleUn} {terms.bookingSingular.toLowerCase()} online, se generará automáticamente un link de videollamada.</p>
            <p>4. El link se incluye en la confirmación y recordatorio que recibe el {clientLabelSingular.toLowerCase()}.</p>
          </div>
        </CardContent>
      </Card>

      {/* Disconnect Dialog */}
      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                <Unlink className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              Desconectar videollamadas
            </AlertDialogTitle>
            <AlertDialogDescription>
              No se generaran links de videollamada automaticamente hasta que vuelvas a conectar.
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
    </div>
  );
}

export default function VideollamadasPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-indigo-100 dark:border-indigo-900" />
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
        </div>
        <p className="text-muted-foreground">Cargando configuracion de videollamadas...</p>
      </div>
    }>
      <VideollamadasPageContent />
    </Suspense>
  );
}
