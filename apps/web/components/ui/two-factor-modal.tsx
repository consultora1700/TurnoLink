'use client';

import * as React from 'react';
import { Shield, Loader2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => Promise<void>;
  title?: string;
  description?: string;
  actionLabel?: string;
}

export function TwoFactorModal({
  isOpen,
  onClose,
  onVerify,
  title = 'Verificación de seguridad',
  description = 'Por favor ingresa tu código de autenticación de dos factores para continuar.',
  actionLabel = 'Verificar',
}: TwoFactorModalProps) {
  const [code, setCode] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setCode('');
      setError(null);
      // Small delay to ensure the modal is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length < 6) {
      setError('El código debe tener al menos 6 dígitos');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await onVerify(code);
      setCode('');
      // onClose is typically called by the parent after successful verification
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Código inválido. Por favor intenta de nuevo.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and limit to 8 characters (for backup codes)
    const value = e.target.value.replace(/\D/g, '').slice(0, 8);
    setCode(value);
    if (error) setError(null);

    // Auto-submit cuando se completan 6 dígitos (TOTP) u 8 dígitos (backup code)
    if ((value.length === 6 || value.length === 8) && !isLoading) {
      setTimeout(() => {
        const submitBtn = document.getElementById('2fa-modal-submit-btn');
        submitBtn?.click();
      }, 100);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="totp-code">Código de autenticación</Label>
            <Input
              ref={inputRef}
              id="totp-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              value={code}
              onChange={handleCodeChange}
              disabled={isLoading}
              className="text-center text-lg tracking-widest font-mono"
            />
            <p className="text-xs text-muted-foreground text-center">
              Ingresa el código de 6 dígitos de tu app de autenticación o un código de respaldo.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              id="2fa-modal-submit-btn"
              type="submit"
              disabled={isLoading || code.length < 6}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                actionLabel
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Hook for easier usage of the modal
export function useTwoFactorModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState<{
    resolve: (code: string) => void;
    reject: (error: Error) => void;
  } | null>(null);

  const requestVerification = React.useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      setPendingAction({ resolve, reject });
      setIsOpen(true);
    });
  }, []);

  const handleVerify = React.useCallback(async (code: string) => {
    if (pendingAction) {
      pendingAction.resolve(code);
      setIsOpen(false);
      setPendingAction(null);
    }
  }, [pendingAction]);

  const handleClose = React.useCallback(() => {
    if (pendingAction) {
      pendingAction.reject(new Error('Verificación cancelada'));
    }
    setIsOpen(false);
    setPendingAction(null);
  }, [pendingAction]);

  return {
    isOpen,
    requestVerification,
    handleVerify,
    handleClose,
    TwoFactorModalComponent: (props: Omit<TwoFactorModalProps, 'isOpen' | 'onClose' | 'onVerify'>) => (
      <TwoFactorModal
        isOpen={isOpen}
        onClose={handleClose}
        onVerify={handleVerify}
        {...props}
      />
    ),
  };
}
