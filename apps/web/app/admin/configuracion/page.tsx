'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Shield,
  AlertTriangle,
  RefreshCw,
  Key,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface PlatformStatus {
  isConnected: boolean;
  userId?: string;
  connectedAt?: string;
  isSandbox?: boolean;
}

function AdminConfiguracionContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<PlatformStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');

  // Check for OAuth callback result
  useEffect(() => {
    if (searchParams.get('mp_connected') === 'true') {
      setError('');
      fetchStatus();
    } else if (searchParams.get('mp_error') === 'true') {
      setError('Error al conectar MercadoPago. Intenta de nuevo.');
    }
  }, [searchParams]);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://api-turnolink.mubitt.com'}/api/platform/status`
      );
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!adminKey) {
      setError('Ingresa la clave de administrador');
      return;
    }

    setConnecting(true);
    setError('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://api-turnolink.mubitt.com'}/api/platform/oauth/url?admin_key=${adminKey}`
      );

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      } else {
        setError('Clave de administrador incorrecta');
      }
    } catch (error) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!adminKey) {
      setError('Ingresa la clave de administrador');
      return;
    }

    setConnecting(true);
    setError('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://api-turnolink.mubitt.com'}/api/platform/disconnect?admin_key=${adminKey}`,
        { method: 'POST' }
      );

      if (response.ok) {
        setStatus({ isConnected: false });
        setError('');
      } else {
        setError('Error al desconectar');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Configuración de Plataforma</h1>
          <p className="text-muted-foreground">
            Administra los pagos de suscripciones de TurnoLink
          </p>
        </div>

        {/* Warning */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-100">
                Página de administrador
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Esta página es solo para el dueño de la plataforma. Necesitas la clave de administrador para realizar cambios.
              </p>
            </div>
          </div>
        </div>

        {/* MercadoPago Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>MercadoPago</CardTitle>
                <CardDescription>Recibe pagos de suscripciones</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <span className="font-medium">Estado</span>
              {status?.isConnected ? (
                <Badge className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Conectado
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="h-3 w-3 mr-1" />
                  No conectado
                </Badge>
              )}
            </div>

            {status?.isConnected && (
              <>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">User ID</span>
                  <span className="font-mono text-sm">{status.userId || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Conectado</span>
                  <span className="text-sm">
                    {status.connectedAt
                      ? new Date(status.connectedAt).toLocaleString('es-AR')
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Modo</span>
                  <Badge variant={status.isSandbox ? 'secondary' : 'default'}>
                    {status.isSandbox ? 'Sandbox (Pruebas)' : 'Producción'}
                  </Badge>
                </div>
              </>
            )}

            {/* Admin Key Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Key className="h-4 w-4" />
                Clave de administrador
              </label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Ingresa tu clave de admin"
                className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {!status?.isConnected ? (
                <Button
                  onClick={handleConnect}
                  disabled={connecting || !adminKey}
                  className="flex-1"
                >
                  {connecting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ExternalLink className="h-4 w-4 mr-2" />
                  )}
                  Conectar MercadoPago
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={fetchStatus}
                    disabled={connecting}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualizar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDisconnect}
                    disabled={connecting || !adminKey}
                  >
                    {connecting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Desconectar
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cómo funciona</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-brand-600">1</span>
                <span>Conecta tu cuenta de MercadoPago usando el botón de arriba.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-brand-600">2</span>
                <span>Autoriza a TurnoLink para crear cobros en tu nombre.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-brand-600">3</span>
                <span>Cuando un usuario pague su suscripción, el dinero llegará a tu cuenta de MercadoPago.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-brand-600">4</span>
                <span>Los webhooks actualizan automáticamente el estado de las suscripciones.</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Security Note */}
        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl text-sm text-muted-foreground">
          <Shield className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p>
            Las credenciales de MercadoPago se almacenan encriptadas con AES-256-GCM.
            Solo tú tienes acceso a realizar cambios con tu clave de administrador.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminConfiguracionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <AdminConfiguracionContent />
    </Suspense>
  );
}
