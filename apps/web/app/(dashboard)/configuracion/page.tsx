'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Save,
  Copy,
  ExternalLink,
  Loader2,
  Settings,
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Instagram,
  CheckCircle2,
  AlertCircle,
  Link2,
  Sparkles,
  CreditCard,
  Percent,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { createApiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface TenantSettings {
  requireDeposit?: boolean;
  depositPercentage?: number;
  depositMode?: string;
}

interface Tenant {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  instagram: string | null;
  settings?: string | TenantSettings;
}

export default function ConfiguracionPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    instagram: '',
  });
  const [depositSettings, setDepositSettings] = useState({
    requireDeposit: false,
    depositPercentage: 30,
    depositMode: 'simulated' as 'simulated' | 'mercadopago',
  });

  useEffect(() => {
    if (session?.accessToken) {
      loadTenant();
    }
  }, [session]);

  const loadTenant = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    const api = createApiClient(session.accessToken as string);
    const data = await api.getTenant() as Tenant;
    setTenant(data);
    setFormData({
      name: data.name || '',
      description: data.description || '',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      city: data.city || '',
      instagram: data.instagram || '',
    });
    // Parse settings for deposit config
    if (data.settings) {
      const settings = typeof data.settings === 'string'
        ? JSON.parse(data.settings)
        : data.settings;
      setDepositSettings({
        requireDeposit: settings.requireDeposit ?? false,
        depositPercentage: settings.depositPercentage ?? 30,
        depositMode: settings.depositMode ?? 'simulated',
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!session?.accessToken) return;
    setSaving(true);

    try {
      const api = createApiClient(session.accessToken as string);
      await api.updateTenant({
        ...formData,
        settings: JSON.stringify(depositSettings),
      });

      toast({
        title: 'Configuración guardada',
        description: 'Los cambios se guardaron correctamente',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const publicUrl = tenant ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${tenant.slug}` : '';

  const copyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast({
      title: 'URL copiada',
      description: 'El link fue copiado al portapapeles',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const filledFields = Object.values(formData).filter(v => v).length;
  const totalFields = Object.keys(formData).length;
  const completionPercent = Math.round((filledFields / totalFields) * 100);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-slate-100" />
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-slate-600 animate-spin" />
        </div>
        <p className="text-muted-foreground">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 p-8 text-white">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Configuración</h1>
                <p className="text-white/70">
                  Administra la información de tu negocio
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-white text-slate-900 hover:bg-white/90 shadow-lg"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar Cambios
          </Button>
        </div>

        {/* Completion Progress */}
        <div className="relative mt-6 pt-6 border-t border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/70">Perfil completado</span>
            <span className="text-sm font-medium">{completionPercent}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <p className="text-xs text-white/50 mt-2">
            {filledFields} de {totalFields} campos completados
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Public URL */}
        <Card className="border-0 shadow-soft lg:col-span-3 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Link2 className="h-4 w-4 text-white" />
              </div>
              Tu Página Pública
            </CardTitle>
            <CardDescription>
              Comparte este link con tus clientes para que puedan reservar turnos y ver tu tienda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Input
                  value={publicUrl}
                  readOnly
                  className="font-mono text-sm h-11 pr-24 bg-slate-50"
                />
                <div className="absolute right-1 top-1 flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyUrl}
                    className="h-9 px-3"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Link href={`/${tenant?.slug}`} target="_blank">
                    <Button variant="ghost" size="sm" className="h-9 px-3">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <Link href={`/${tenant?.slug}`} target="_blank">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 h-11">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Ver mi Página
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Business Info */}
        <Card className="border-0 shadow-soft lg:col-span-2 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              Información del Negocio
            </CardTitle>
            <CardDescription>
              Datos básicos que se mostrarán en tu página
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Nombre del negocio
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="h-11"
                  placeholder="Mi Negocio"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+54 11 1234-5678"
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                Descripción
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe tu negocio en una línea..."
                className="h-11"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="contacto@tunegocio.com"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-muted-foreground" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) =>
                    setFormData({ ...formData, instagram: e.target.value })
                  }
                  placeholder="@tunegocio"
                  className="h-11"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="border-0 shadow-soft overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              Ubicación
            </CardTitle>
            <CardDescription>
              Dirección de tu negocio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Av. Corrientes 1234"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder="Buenos Aires"
                className="h-11"
              />
            </div>
          </CardContent>
        </Card>

        {/* Deposit/Seña Settings */}
        <Card className="border-0 shadow-soft lg:col-span-2 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              Seña / Depósito
            </CardTitle>
            <CardDescription>
              Configura si requieres un pago adelantado para confirmar los turnos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="requireDeposit" className="text-base">Requerir seña</Label>
                <p className="text-sm text-muted-foreground">
                  Los clientes deberán pagar un porcentaje del servicio para confirmar el turno
                </p>
              </div>
              <Switch
                id="requireDeposit"
                checked={depositSettings.requireDeposit}
                onCheckedChange={(checked) =>
                  setDepositSettings({ ...depositSettings, requireDeposit: checked })
                }
              />
            </div>

            {depositSettings.requireDeposit && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="depositPercentage" className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    Porcentaje de seña
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="depositPercentage"
                      type="number"
                      min="1"
                      max="100"
                      value={depositSettings.depositPercentage}
                      onChange={(e) =>
                        setDepositSettings({
                          ...depositSettings,
                          depositPercentage: Math.min(100, Math.max(1, parseInt(e.target.value) || 30)),
                        })
                      }
                      className="h-11 w-24"
                    />
                    <span className="text-muted-foreground">% del precio del servicio</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ejemplo: Si un servicio cuesta $10.000 y la seña es 30%, el cliente paga $3.000 al reservar
                  </p>
                </div>

                <div className="rounded-lg border bg-amber-50 border-amber-200 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Modo Demo Activo</p>
                      <p className="text-sm text-amber-700">
                        Actualmente los pagos están en modo simulado para demostración.
                        Los clientes podrán &quot;pagar&quot; sin usar dinero real.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="border-0 shadow-soft lg:col-span-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Consejos para tu perfil</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Usa un nombre de negocio claro y fácil de recordar</li>
                  <li>• Agrega una descripción atractiva que destaque tus servicios</li>
                  <li>• Incluye tu teléfono e Instagram para que tus clientes te contacten</li>
                  <li>• Mantén tu dirección actualizada para que te encuentren fácilmente</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
