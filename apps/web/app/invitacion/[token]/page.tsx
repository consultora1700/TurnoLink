'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { authApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Propietario',
  MANAGER: 'Gerente',
  STAFF: 'Staff',
  VIEWER: 'Solo lectura',
};

interface InvitationInfo {
  valid: boolean;
  expired: boolean;
  email: string;
  role: string;
  tenant: { id: string; name: string; slug: string; logo: string | null };
  employee: { id: string; name: string };
}

export default function InvitacionPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const validate = async () => {
      try {
        const data = await authApi.validateInvitation(token);
        setInvitation(data);
        setEmail(data.email);
        setName(data.employee.name);
      } catch (err: any) {
        setError(err?.message || 'Invitación no encontrada');
      } finally {
        setLoading(false);
      }
    };
    validate();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (password.length < 6) {
      setSubmitError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setSubmitError('Las contraseñas no coinciden');
      return;
    }

    setSubmitting(true);
    try {
      await authApi.acceptInvitation({ token, name, email, password });
      setSuccess(true);

      // Auto-login with the new credentials
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.push('/portal-empleado/agenda');
      } else {
        // Fallback: redirect to login
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'Error al aceptar la invitación');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || (invitation && !invitation.valid)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            {invitation?.expired ? (
              <>
                <Clock className="h-16 w-16 mx-auto mb-4 text-amber-500" />
                <h2 className="text-xl font-bold mb-2">Invitación expirada</h2>
                <p className="text-muted-foreground text-sm">
                  Esta invitación ha expirado. Pedile al negocio que te envíe una nueva.
                </p>
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
                <h2 className="text-xl font-bold mb-2">Invitación no válida</h2>
                <p className="text-muted-foreground text-sm">
                  {error || 'Esta invitación ya fue utilizada o no existe.'}
                </p>
              </>
            )}
            <Button className="mt-6" onClick={() => router.push('/login')}>
              Ir al login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-emerald-500" />
            <h2 className="text-xl font-bold mb-2">¡Bienvenido al equipo!</h2>
            <p className="text-muted-foreground text-sm">
              Tu cuenta fue creada exitosamente. Redirigiendo al portal...
            </p>
            <Loader2 className="h-5 w-5 animate-spin mx-auto mt-4 text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Logo */}
        <div className="text-center">
          <img
            src="/claro2.png"
            alt="TurnoLink"
            className="h-12 mx-auto dark:hidden"
          />
          <img
            src="/oscuro2.png"
            alt="TurnoLink"
            className="h-12 mx-auto hidden dark:block"
          />
        </div>

        {/* Invitation Info */}
        <Card className="border-primary/20">
          <CardContent className="p-6 text-center">
            {invitation!.tenant.logo && (
              <img
                src={invitation!.tenant.logo}
                alt={invitation!.tenant.name}
                className="h-14 w-14 rounded-full mx-auto mb-3 object-cover"
              />
            )}
            <h2 className="text-lg font-bold mb-1">
              {invitation!.tenant.name}
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Te invitó a unirte como
            </p>
            <Badge className="text-sm px-3 py-1">
              <Shield className="h-3.5 w-3.5 mr-1.5" />
              {ROLE_LABELS[invitation!.role] || invitation!.role}
            </Badge>
          </CardContent>
        </Card>

        {/* Registration Form */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-center">Crear tu cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Nombre</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Contraseña</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Confirmar contraseña</Label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {submitError && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" /> {submitError}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Aceptar invitación
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground">
          Al aceptar, accedés a gestionar tu negocio en TurnoLink
        </p>
      </div>
    </div>
  );
}
