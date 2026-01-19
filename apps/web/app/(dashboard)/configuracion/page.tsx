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
  ImageIcon,
  Palette,
  Moon,
  Sun,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { createApiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ui/image-upload';
import { BackgroundStylePreview, BACKGROUND_STYLE_OPTIONS, BackgroundStyle } from '@/components/ui/background-styles';
import Link from 'next/link';

interface TenantSettings {
  requireDeposit?: boolean;
  depositPercentage?: number;
  depositMode?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  enableDarkMode?: boolean;
  backgroundStyle?: BackgroundStyle;
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
  logo: string | null;
  coverImage: string | null;
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
    logo: '',
    coverImage: '',
  });
  const [depositSettings, setDepositSettings] = useState({
    requireDeposit: false,
    depositPercentage: 30,
    depositMode: 'simulated' as 'simulated' | 'mercadopago',
  });
  const [themeSettings, setThemeSettings] = useState({
    primaryColor: '#D62971',
    secondaryColor: '#8B5CF6',
    accentColor: '#F59E0B',
    enableDarkMode: true,
    backgroundStyle: 'modern' as BackgroundStyle,
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
      logo: data.logo || '',
      coverImage: data.coverImage || '',
    });
    // Parse settings for deposit and theme config
    if (data.settings) {
      const settings = typeof data.settings === 'string'
        ? JSON.parse(data.settings)
        : data.settings;
      setDepositSettings({
        requireDeposit: settings.requireDeposit ?? false,
        depositPercentage: settings.depositPercentage ?? 30,
        depositMode: settings.depositMode ?? 'simulated',
      });
      setThemeSettings({
        primaryColor: settings.primaryColor ?? '#D62971',
        secondaryColor: settings.secondaryColor ?? '#8B5CF6',
        accentColor: settings.accentColor ?? '#F59E0B',
        enableDarkMode: settings.enableDarkMode ?? true,
        backgroundStyle: (settings.backgroundStyle as BackgroundStyle) ?? 'modern',
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
        settings: JSON.stringify({
          ...depositSettings,
          ...themeSettings,
        }),
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
          <div className="h-16 w-16 rounded-full border-4 border-slate-100 dark:border-neutral-700" />
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-slate-600 dark:border-t-neutral-400 animate-spin" />
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
                  className="font-mono text-sm h-11 pr-24 bg-slate-50 dark:bg-neutral-800"
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

        {/* Images Section */}
        <Card className="border-0 shadow-soft overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <ImageIcon className="h-4 w-4 text-white" />
              </div>
              Imágenes
            </CardTitle>
            <CardDescription>
              Logo y portada de tu página pública
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Logo del negocio</Label>
              <ImageUpload
                value={formData.logo}
                onChange={(url) => setFormData({ ...formData, logo: url })}
                onUpload={async (file) => {
                  if (!session?.accessToken) throw new Error('No autenticado');
                  const api = createApiClient(session.accessToken as string);
                  return api.uploadMedia(file, 'logos');
                }}
                aspectRatio="square"
                placeholder="Subir logo"
              />
              <p className="text-xs text-muted-foreground">
                Recomendado: imagen cuadrada, mínimo 200x200px
              </p>
            </div>

            <div className="space-y-2">
              <Label>Imagen de portada</Label>
              <ImageUpload
                value={formData.coverImage}
                onChange={(url) => setFormData({ ...formData, coverImage: url })}
                onUpload={async (file) => {
                  if (!session?.accessToken) throw new Error('No autenticado');
                  const api = createApiClient(session.accessToken as string);
                  return api.uploadMedia(file, 'covers');
                }}
                aspectRatio="banner"
                placeholder="Subir portada"
              />
              <p className="text-xs text-muted-foreground">
                Recomendado: imagen horizontal 3:1, mínimo 1200x400px
              </p>
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

                <div className="rounded-lg border bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Modo Demo Activo</p>
                      <p className="text-sm text-amber-700 dark:text-amber-400">
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

        {/* Theme Settings for Public Page */}
        <Card className="border-0 shadow-soft lg:col-span-3 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-pink-500 to-violet-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center">
                <Palette className="h-4 w-4 text-white" />
              </div>
              Personalización Visual
            </CardTitle>
            <CardDescription>
              Configura los colores y tema de tu página pública de reservas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-neutral-800 dark:to-neutral-900">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-white dark:bg-neutral-700 shadow-sm flex items-center justify-center">
                  {themeSettings.enableDarkMode ? (
                    <Moon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  ) : (
                    <Sun className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                  )}
                </div>
                <div>
                  <Label htmlFor="enableDarkMode" className="text-base font-medium">
                    Permitir modo oscuro
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Los visitantes podrán cambiar entre tema claro y oscuro
                  </p>
                </div>
              </div>
              <Switch
                id="enableDarkMode"
                checked={themeSettings.enableDarkMode}
                onCheckedChange={(checked) =>
                  setThemeSettings({ ...themeSettings, enableDarkMode: checked })
                }
              />
            </div>

            {/* Background Style Selector */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Estilo de fondo</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Elige el estilo visual del fondo de tu página pública
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {BACKGROUND_STYLE_OPTIONS.map((option) => (
                  <BackgroundStylePreview
                    key={option.value}
                    style={option.value}
                    selected={themeSettings.backgroundStyle === option.value}
                    onClick={() => setThemeSettings({ ...themeSettings, backgroundStyle: option.value })}
                    label={option.label}
                    description={option.description}
                  />
                ))}
              </div>
            </div>

            {/* Color Pickers */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* Primary Color */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Color principal</Label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={themeSettings.primaryColor}
                      onChange={(e) =>
                        setThemeSettings({ ...themeSettings, primaryColor: e.target.value })
                      }
                      className="w-12 h-12 rounded-lg cursor-pointer border-2 border-slate-200 overflow-hidden"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={themeSettings.primaryColor}
                      onChange={(e) =>
                        setThemeSettings({ ...themeSettings, primaryColor: e.target.value })
                      }
                      placeholder="#D62971"
                      className="h-10 font-mono text-sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Botones, acentos y elementos destacados
                </p>
              </div>

              {/* Secondary Color */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Color secundario</Label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={themeSettings.secondaryColor}
                      onChange={(e) =>
                        setThemeSettings({ ...themeSettings, secondaryColor: e.target.value })
                      }
                      className="w-12 h-12 rounded-lg cursor-pointer border-2 border-slate-200 overflow-hidden"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={themeSettings.secondaryColor}
                      onChange={(e) =>
                        setThemeSettings({ ...themeSettings, secondaryColor: e.target.value })
                      }
                      placeholder="#8B5CF6"
                      className="h-10 font-mono text-sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Fondos secundarios y badges
                </p>
              </div>

              {/* Accent Color */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Color de acento</Label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={themeSettings.accentColor}
                      onChange={(e) =>
                        setThemeSettings({ ...themeSettings, accentColor: e.target.value })
                      }
                      className="w-12 h-12 rounded-lg cursor-pointer border-2 border-slate-200 overflow-hidden"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={themeSettings.accentColor}
                      onChange={(e) =>
                        setThemeSettings({ ...themeSettings, accentColor: e.target.value })
                      }
                      placeholder="#F59E0B"
                      className="h-10 font-mono text-sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Detalles y elementos especiales
                </p>
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 rounded-xl border bg-slate-50 dark:bg-neutral-800">
              <p className="text-sm font-medium mb-3">Vista previa de colores</p>
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-lg shadow-sm"
                  style={{ backgroundColor: themeSettings.primaryColor }}
                />
                <div
                  className="h-10 w-10 rounded-lg shadow-sm"
                  style={{ backgroundColor: themeSettings.secondaryColor }}
                />
                <div
                  className="h-10 w-10 rounded-lg shadow-sm"
                  style={{ backgroundColor: themeSettings.accentColor }}
                />
                <span className="ml-3 text-sm text-muted-foreground">
                  Así se verán los colores en tu página pública
                </span>
              </div>
            </div>

            {/* Reset to defaults */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setThemeSettings({
                    primaryColor: '#D62971',
                    secondaryColor: '#8B5CF6',
                    accentColor: '#F59E0B',
                    enableDarkMode: true,
                    backgroundStyle: 'modern',
                  })
                }
              >
                Restaurar colores predeterminados
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="border-0 shadow-soft lg:col-span-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-100 dark:border-blue-800">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">Consejos para tu perfil</h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
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
