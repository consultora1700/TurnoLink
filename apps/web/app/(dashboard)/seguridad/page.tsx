'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Smartphone,
  Key,
  AlertTriangle,
  Check,
  X,
  Copy,
  Loader2,
  AlertCircle,
  Lock,
  ShieldCheck,
  ShieldAlert,
  QrCode,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

export default function SeguridadPage() {
  const api = useDashboardApi();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showBackupCodesDialog, setShowBackupCodesDialog] = useState(false);
  const [setupStep, setSetupStep] = useState<'qr' | 'verify' | 'backup'>('qr');
  const [verificationCode, setVerificationCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [pendingBackupCodes, setPendingBackupCodes] = useState<string[]>([]); // Códigos guardados del setup
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load2FAStatus = async () => {
      if (!api) return;
      try {
        const status = await api.get2FAStatus();
        setIs2FAEnabled(status.enabled);
      } catch (err) {
        console.error('Error loading 2FA status:', err);
      } finally {
        setLoading(false);
      }
    };
    load2FAStatus();
  }, [api]);

  const handleStartSetup = async () => {
    if (!api) return;
    setProcessing(true);
    setError(null);

    try {
      const response = await api.setup2FA();
      setQrCodeUrl(response.qrCode);
      setSecret(response.secret);
      setPendingBackupCodes(response.backupCodes || []); // Guardar los códigos del setup
      setShowSetupDialog(true);
      setSetupStep('qr');
    } catch (err) {
      setError('Error al iniciar configuración de 2FA');
      console.error('Error setting up 2FA:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleVerify = async () => {
    if (!api || verificationCode.length !== 6) return;
    setProcessing(true);
    setError(null);

    try {
      const response = await api.verify2FA(verificationCode);
      if (response.success) {
        // Usar los códigos guardados del setup (el verify no los devuelve)
        setBackupCodes(pendingBackupCodes);
        setSetupStep('backup');
      } else {
        setError('Código incorrecto. Intenta de nuevo.');
      }
    } catch (err) {
      setError('Error al verificar código');
      console.error('Error verifying 2FA:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleComplete = () => {
    setIs2FAEnabled(true);
    setShowSetupDialog(false);
    setSetupStep('qr');
    setVerificationCode('');
    setQrCodeUrl('');
    setSecret('');
  };

  const handleShowBackupCodes = async () => {
    if (!api) return;
    setProcessing(true);
    setError(null);

    try {
      const response = await api.getBackupCodes();
      setBackupCodes(response.codes || []);
      setShowBackupCodesDialog(true);
    } catch (err) {
      setError('Error al obtener códigos de respaldo');
      console.error('Error getting backup codes:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleDisable = async () => {
    if (!api || disableCode.length !== 6) return;
    setProcessing(true);
    setError(null);

    try {
      await api.disable2FA(disableCode);
      setIs2FAEnabled(false);
      setShowDisableDialog(false);
      setDisableCode('');
    } catch (err) {
      setError('Código incorrecto. Intenta de nuevo.');
      console.error('Error disabling 2FA:', err);
    } finally {
      setProcessing(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-emerald-100 dark:border-emerald-900" />
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-emerald-600 dark:border-t-emerald-400 animate-spin" />
        </div>
        <p className="text-muted-foreground">Cargando configuración de seguridad...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-4 sm:p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-24 -right-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold">Seguridad</h1>
              <p className="text-white/80 text-sm sm:text-base truncate sm:whitespace-normal">
                Protege tu cuenta con medidas adicionales
              </p>
            </div>
          </div>

          <Badge className={`text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 w-fit ${is2FAEnabled ? 'bg-white text-emerald-700' : 'bg-white/20 text-white'}`}>
            {is2FAEnabled ? (
              <>
                <ShieldCheck className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Cuenta Protegida</span>
                <span className="sm:hidden">Protegida</span>
              </>
            ) : (
              <>
                <ShieldAlert className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Sin 2FA
              </>
            )}
          </Badge>
        </div>

        {/* Security Score */}
        <div className="relative grid grid-cols-2 gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20">
          <div className="text-center">
            <div className={`text-3xl font-bold ${is2FAEnabled ? 'text-white' : 'text-amber-300'}`}>
              {is2FAEnabled ? '100%' : '50%'}
            </div>
            <p className="text-white/70 text-sm">Nivel de Seguridad</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">
              {is2FAEnabled ? (
                <CheckCircle2 className="h-8 w-8 mx-auto text-white" />
              ) : (
                <XCircle className="h-8 w-8 mx-auto text-amber-300" />
              )}
            </div>
            <p className="text-white/70 text-sm">2FA {is2FAEnabled ? 'Activo' : 'Inactivo'}</p>
          </div>
        </div>
      </div>

      {/* 2FA Card */}
      <Card className="border-0 shadow-soft overflow-hidden">
        <div className={`h-1 bg-gradient-to-r ${is2FAEnabled ? 'from-emerald-500 to-teal-500' : 'from-amber-500 to-orange-500'}`} />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${is2FAEnabled ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : 'bg-gradient-to-br from-amber-500 to-orange-500'}`}>
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Autenticación de Dos Factores</CardTitle>
                <CardDescription>
                  Protege tu cuenta con Google Authenticator
                </CardDescription>
              </div>
            </div>
            <Badge variant={is2FAEnabled ? 'default' : 'secondary'} className={is2FAEnabled ? 'bg-emerald-100 text-emerald-700' : ''}>
              {is2FAEnabled ? (
                <>
                  <Check className="mr-1 h-3 w-3" />
                  Activado
                </>
              ) : (
                <>
                  <X className="mr-1 h-3 w-3" />
                  Desactivado
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800">
            <p className="text-sm text-muted-foreground">
              La autenticación de dos factores (2FA) agrega una capa extra de seguridad a tu cuenta.
              Además de tu contraseña, necesitarás un código de tu aplicación de autenticación para iniciar sesión.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {is2FAEnabled ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-emerald-800 dark:text-emerald-300">Tu cuenta está protegida</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">La autenticación de dos factores está activa</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleShowBackupCodes}
                  disabled={processing}
                  className="flex-1"
                >
                  {processing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Key className="mr-2 h-4 w-4" />
                  )}
                  Ver Códigos de Respaldo
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowDisableDialog(true)}
                  className="flex-1"
                >
                  <X className="mr-2 h-4 w-4" />
                  Desactivar 2FA
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800">
                <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                  <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300">Tu cuenta no está protegida</p>
                  <p className="text-sm text-amber-600 dark:text-amber-400">Activa 2FA para mayor seguridad</p>
                </div>
              </div>
              <Button
                onClick={handleStartSetup}
                disabled={processing}
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                {processing ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Shield className="mr-2 h-5 w-5" />
                )}
                Activar Autenticación de Dos Factores
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className="border-0 shadow-soft overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
            Consejos de Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { text: 'Usa una contraseña única y fuerte para tu cuenta', done: true },
              { text: 'Activa la autenticación de dos factores (2FA)', done: is2FAEnabled },
              { text: 'Guarda tus códigos de respaldo en un lugar seguro', done: is2FAEnabled },
              { text: 'No compartas tus credenciales con nadie', done: true },
              { text: 'Revisa regularmente la actividad de tu cuenta', done: true },
              { text: 'Cierra sesión en dispositivos no reconocidos', done: true },
            ].map((tip, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-xl ${tip.done ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-slate-50 dark:bg-neutral-800'}`}
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${tip.done ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-slate-100 dark:bg-neutral-700'}`}>
                  {tip.done ? (
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <X className="h-4 w-4 text-slate-400" />
                  )}
                </div>
                <span className={`text-sm ${tip.done ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-600 dark:text-neutral-300'}`}>
                  {tip.text}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 2FA Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="sm:max-w-md">
          {setupStep === 'qr' && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <QrCode className="h-4 w-4 text-white" />
                  </div>
                  Configura Google Authenticator
                </DialogTitle>
                <DialogDescription>
                  Escanea el código QR con tu aplicación de autenticación
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center py-6">
                {qrCodeUrl ? (
                  <div className="p-4 bg-white rounded-2xl shadow-lg border mb-4">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code for 2FA"
                      className="w-48 h-48"
                    />
                  </div>
                ) : (
                  <div className="w-56 h-56 bg-slate-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mb-4">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                )}

                {secret && (
                  <div className="w-full mb-4">
                    <p className="text-sm text-muted-foreground text-center mb-2">
                      O ingresa este código manualmente:
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={secret}
                        readOnly
                        className="font-mono text-sm h-11 bg-slate-50 dark:bg-neutral-800"
                      />
                      <Button variant="outline" size="icon" onClick={copySecret} className="h-11 w-11">
                        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="text-sm text-muted-foreground text-center space-y-1 p-4 bg-slate-50 dark:bg-neutral-800 rounded-xl">
                  <p className="font-medium text-slate-700 dark:text-neutral-300">Pasos:</p>
                  <p>1. Abre Google Authenticator</p>
                  <p>2. Toca el botón + para agregar una cuenta</p>
                  <p>3. Selecciona "Escanear código QR"</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSetupDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setSetupStep('verify')} className="bg-gradient-to-r from-emerald-500 to-teal-500">
                  Continuar
                </Button>
              </DialogFooter>
            </>
          )}

          {setupStep === 'verify' && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <Lock className="h-4 w-4 text-white" />
                  </div>
                  Verifica el código
                </DialogTitle>
                <DialogDescription>
                  Ingresa el código de 6 dígitos de tu aplicación
                </DialogDescription>
              </DialogHeader>
              <div className="py-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Código de verificación</Label>
                    <Input
                      value={verificationCode}
                      onChange={(e) => {
                        const newCode = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setVerificationCode(newCode);
                        setError(null);
                        // Auto-submit cuando se completan los 6 dígitos
                        if (newCode.length === 6 && !processing) {
                          setTimeout(() => {
                            const verifyBtn = document.getElementById('verify-2fa-btn');
                            verifyBtn?.click();
                          }, 100);
                        }
                      }}
                      placeholder="000000"
                      className="text-center text-3xl tracking-[0.5em] h-14 font-mono"
                      maxLength={6}
                      autoFocus
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive text-center p-3 bg-red-50 dark:bg-red-900/30 rounded-xl">{error}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSetupStep('qr')}>
                  Volver
                </Button>
                <Button
                  id="verify-2fa-btn"
                  onClick={handleVerify}
                  disabled={verificationCode.length !== 6 || processing}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500"
                >
                  {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verificar
                </Button>
              </DialogFooter>
            </>
          )}

          {setupStep === 'backup' && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Key className="h-4 w-4 text-white" />
                  </div>
                  Códigos de Respaldo
                </DialogTitle>
                <DialogDescription>
                  Guarda estos códigos en un lugar seguro. Los necesitarás si pierdes acceso a tu dispositivo.
                </DialogDescription>
              </DialogHeader>
              <div className="py-6">
                <div className="bg-slate-100 dark:bg-neutral-800 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="text-center p-2 bg-white dark:bg-neutral-700 rounded-lg">
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={copyBackupCodes}>
                  {copied ? <Check className="mr-2 h-4 w-4 text-emerald-600" /> : <Copy className="mr-2 h-4 w-4" />}
                  {copied ? 'Copiados!' : 'Copiar Códigos'}
                </Button>
              </div>
              <DialogFooter>
                <Button onClick={handleComplete} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500">
                  <Check className="mr-2 h-4 w-4" />
                  He guardado mis códigos
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* View Backup Codes Dialog */}
      <Dialog open={showBackupCodesDialog} onOpenChange={setShowBackupCodesDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Key className="h-4 w-4 text-white" />
              </div>
              Códigos de Respaldo
            </DialogTitle>
            <DialogDescription>
              Usa estos códigos si no tienes acceso a tu aplicación de autenticación.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="bg-slate-100 dark:bg-neutral-800 rounded-xl p-4 mb-4">
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div key={index} className="text-center p-2 bg-white dark:bg-neutral-700 rounded-lg">
                    {code}
                  </div>
                ))}
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={copyBackupCodes}>
              {copied ? <Check className="mr-2 h-4 w-4 text-emerald-600" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? 'Copiados!' : 'Copiar Códigos'}
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowBackupCodesDialog(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              Desactivar 2FA
            </AlertDialogTitle>
            <AlertDialogDescription>
              Para desactivar la autenticación de dos factores, ingresa el código de tu aplicación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label>Código de verificación</Label>
              <Input
                value={disableCode}
                onChange={(e) => {
                  const newCode = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setDisableCode(newCode);
                  setError(null);
                  // Auto-submit cuando se completan los 6 dígitos
                  if (newCode.length === 6 && !processing) {
                    setTimeout(() => {
                      const disableBtn = document.getElementById('disable-2fa-btn');
                      disableBtn?.click();
                    }, 100);
                  }
                }}
                placeholder="000000"
                className="text-center text-3xl tracking-[0.5em] h-14 font-mono"
                maxLength={6}
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-destructive text-center mt-3 p-3 bg-red-50 dark:bg-red-900/30 rounded-xl">{error}</p>
            )}
          </div>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setDisableCode('')} className="w-full sm:w-auto mt-0">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              id="disable-2fa-btn"
              onClick={handleDisable}
              disabled={disableCode.length !== 6 || processing}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
