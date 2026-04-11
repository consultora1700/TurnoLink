'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient, authApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  UserCircle,
  Save,
  Loader2,
  Mail,
  Phone,
  Shield,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { handleApiError } from '@/lib/notifications';

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Propietario',
  MANAGER: 'Gerente',
  STAFF: 'Staff',
  VIEWER: 'Solo lectura',
};

export default function PerfilPage() {
  const { data: session } = useSession();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Editable fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [credentials, setCredentials] = useState('');

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken);
      const data = await api.employeePortal.getProfile();
      setEmployee(data);
      setName(data.name || '');
      setPhone(data.phone || '');
      setBio(data.bio || '');
      setCredentials(data.credentials || '');
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const saveProfile = async () => {
    if (!session?.accessToken) return;
    setSaving(true);
    try {
      const api = createApiClient(session.accessToken);
      await api.employeePortal.updateProfile({ name, phone, bio, credentials });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (!session?.accessToken) return;
    setPasswordSaving(true);
    try {
      await authApi.changePassword(session.accessToken, currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error: any) {
      setPasswordError(error?.message || 'Error al cambiar la contraseña');
      handleApiError(error);
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground text-sm mt-1">Gestiona tu información personal</p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase">Email</p>
              <p className="text-xs font-medium truncate">{employee?.email || '-'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Rol</p>
              <Badge variant="secondary" className="text-[10px] h-5 mt-0.5">
                {ROLE_LABELS[employee?.employeeRole] || employee?.employeeRole}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Desde</p>
              <p className="text-xs font-medium">
                {employee?.createdAt
                  ? new Date(employee.createdAt).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })
                  : '-'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm">Nombre</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm">Teléfono</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+54 11 1234-5678" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio" className="text-sm">Bio / Descripción</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Contá brevemente sobre vos y tu experiencia..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">{bio.length}/500</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="credentials" className="text-sm flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5" />
              Credenciales / Matrícula
            </Label>
            <Input
              id="credentials"
              value={credentials}
              onChange={(e) => setCredentials(e.target.value)}
              placeholder="Ej: CPACF T° 98 F° 123"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button onClick={saveProfile} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar
            </Button>
            {saved && (
              <span className="text-sm text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Guardado
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Contraseña
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showPasswordForm ? (
            <Button variant="outline" size="sm" onClick={() => setShowPasswordForm(true)}>
              Cambiar contraseña
            </Button>
          ) : (
            <div className="space-y-3 max-w-sm">
              <div className="space-y-1.5">
                <Label className="text-sm">Contraseña actual</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Nueva contraseña</Label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Confirmar contraseña</Label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-sm text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Contraseña actualizada
                </p>
              )}
              <div className="flex gap-2">
                <Button size="sm" onClick={handlePasswordChange} disabled={passwordSaving || !currentPassword || !newPassword}>
                  {passwordSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                  Cambiar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordError('');
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Specialties & Services (read-only) */}
      {employee?.employeeSpecialties?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Especialidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {employee.employeeSpecialties.map((es: any) => (
                <Badge key={es.specialty?.id || es.id} variant="secondary">
                  {es.specialty?.name || 'Especialidad'}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {employee?.employeeServices?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Servicios Asignados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {employee.employeeServices.map((es: any) => (
                <div key={es.service?.id || es.id} className="flex items-center justify-between p-2 rounded-lg border">
                  <span className="text-sm font-medium">{es.service?.name || 'Servicio'}</span>
                  <span className="text-sm text-muted-foreground">
                    {es.customDuration || es.service?.duration} min · ${es.customPrice ?? es.service?.price}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
