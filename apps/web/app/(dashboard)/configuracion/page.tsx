'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
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
  CreditCard,
  Percent,
  ImageIcon,
  Palette,
  Moon,
  Sun,
  HelpCircle,
  Bell,
  Smartphone,
  User,
  Sliders,
  Clock,
  Calendar,
  Timer,
} from 'lucide-react';
import { RestartTourButton } from '@/components/onboarding/onboarding-tour';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createApiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ui/image-upload';
import { BackgroundStylePreview, BACKGROUND_STYLE_OPTIONS, BackgroundStyle } from '@/components/ui/background-styles';
import { HeroStylePreview } from '@/components/booking/hero-style-preview';
import { CardStylePreview } from '@/components/booking/card-style-preview';
import { HERO_STYLE_OPTIONS, CARD_STYLE_OPTIONS, HERO_STYLE_DEFAULT_COLORS, HERO_STYLE_COVER_DEFAULTS, HeroStyleName } from '@/lib/hero-styles';
import { ColorPickerSection } from '@/components/ui/color-picker';
import Link from 'next/link';

interface TenantSettings {
  requireDeposit?: boolean;
  depositPercentage?: number;
  depositMode?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  enableDarkMode?: boolean;
  themeMode?: 'light' | 'dark' | 'both';
  backgroundStyle?: BackgroundStyle;
  notifyOwnerByEmail?: boolean;
  notificationEmail?: string;
  pushNewBooking?: boolean;
  pushCancellation?: boolean;
  pushReminder?: boolean;
  bookingBuffer?: number;
  minAdvanceBookingHours?: number;
  maxAdvanceBookingDays?: number;
  smartTimeSlots?: boolean;
  showProfilePhoto?: boolean;
  coverOverlayColor?: string;
  coverOverlayOpacity?: number;
  coverFadeEnabled?: boolean;
  coverFadeColor?: string;
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
  return (
    <Suspense fallback={null}>
      <ConfiguracionContent />
    </Suspense>
  );
}

function ConfiguracionContent() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialTab = searchParams.get('tab') || 'perfil';
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    slug: '',
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
  const [notificationSettings, setNotificationSettings] = useState({
    notifyOwnerByEmail: true,
    notificationEmail: '',
  });
  const [pushSettings, setPushSettings] = useState({
    pushNewBooking: true,
    pushCancellation: true,
    pushReminder: true,
  });
  const [bookingTimeSettings, setBookingTimeSettings] = useState({
    bookingBuffer: 0,
    minAdvanceBookingHours: 1,
    maxAdvanceBookingDays: 30,
    smartTimeSlots: true,
  });
  const [themeSettings, setThemeSettings] = useState({
    primaryColor: '#3F8697',
    secondaryColor: '#8B5CF6',
    accentColor: '#F59E0B',
    enableDarkMode: true,
    themeMode: 'both' as 'light' | 'dark' | 'both',
    backgroundStyle: 'modern' as BackgroundStyle,
    heroStyle: 'classic' as HeroStyleName,
    cardStyle: '' as HeroStyleName | '',
    showProfilePhoto: true,
    coverOverlayColor: '#000000',
    coverOverlayOpacity: 60,
    coverFadeEnabled: false,
    coverFadeColor: '#000000',
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
      slug: data.slug || '',
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
      setNotificationSettings({
        notifyOwnerByEmail: settings.notifyOwnerByEmail ?? true,
        notificationEmail: settings.notificationEmail ?? '',
      });
      setPushSettings({
        pushNewBooking: settings.pushNewBooking ?? true,
        pushCancellation: settings.pushCancellation ?? true,
        pushReminder: settings.pushReminder ?? true,
      });
      setBookingTimeSettings({
        bookingBuffer: settings.bookingBuffer ?? 0,
        minAdvanceBookingHours: settings.minAdvanceBookingHours ?? 1,
        maxAdvanceBookingDays: settings.maxAdvanceBookingDays ?? 30,
        smartTimeSlots: settings.smartTimeSlots ?? true,
      });
      setThemeSettings({
        primaryColor: settings.primaryColor ?? '#3F8697',
        secondaryColor: settings.secondaryColor ?? '#8B5CF6',
        accentColor: settings.accentColor ?? '#F59E0B',
        enableDarkMode: settings.enableDarkMode ?? true,
        themeMode: (settings.themeMode as 'light' | 'dark' | 'both') ?? (settings.enableDarkMode === false ? 'light' : 'both'),
        backgroundStyle: (settings.backgroundStyle as BackgroundStyle) ?? 'modern',
        heroStyle: (settings.heroStyle as HeroStyleName) ?? 'classic',
        cardStyle: (settings.cardStyle as HeroStyleName | '') ?? '',
        showProfilePhoto: settings.showProfilePhoto ?? true,
        coverOverlayColor: settings.coverOverlayColor ?? '#000000',
        coverOverlayOpacity: settings.coverOverlayOpacity ?? 60,
        coverFadeEnabled: settings.coverFadeEnabled ?? false,
        coverFadeColor: settings.coverFadeColor ?? '#000000',
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!session?.accessToken) return;
    setSaving(true);

    try {
      const api = createApiClient(session.accessToken as string);
      const { slug, ...restFormData } = formData;
      const updateData: Record<string, unknown> = {
        ...restFormData,
        settings: JSON.stringify({
          ...depositSettings,
          ...notificationSettings,
          ...pushSettings,
          ...themeSettings,
          ...bookingTimeSettings,
        }),
      };
      // Only send slug if it changed
      if (tenant && slug !== tenant.slug) {
        updateData.slug = slug;
      }
      await api.updateTenant(updateData);

      // Update local tenant state with new slug
      if (tenant) {
        setTenant({ ...tenant, ...restFormData, slug });
      }

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

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const publicUrl = formData.slug ? `${baseUrl}/${formData.slug}` : '';

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
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 p-4 sm:p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-24 -right-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/5 rounded-full blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center flex-shrink-0">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold">Configuración</h1>
                <p className="text-white/70 text-sm sm:text-base truncate">
                  Administra la información de tu negocio
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-white text-slate-900 hover:bg-white/90 shadow-lg w-full sm:w-auto hidden sm:flex"
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

      {/* Public URL — always visible */}
      <Card data-tour="public-url" className="border-0 shadow-soft overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
        <CardHeader className="pb-3">
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
          <div className="space-y-3">
            <Label className="text-sm font-medium">URL de tu página</Label>
            <div className="relative">
              <div className="flex items-center h-11 rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-500 transition-all">
                <span className="text-xs sm:text-sm text-muted-foreground pl-3 whitespace-nowrap select-none">
                  <span className="hidden sm:inline">turnolink.mubitt.com/</span>
                  <span className="sm:hidden">turnolink.../</span>
                </span>
                <input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  className="flex-1 h-full bg-transparent text-sm font-semibold outline-none pr-3 min-w-0"
                  placeholder="mi-negocio"
                  spellCheck={false}
                />
              </div>
            </div>
            {formData.slug && tenant && formData.slug !== tenant.slug && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Al cambiar la URL, los links anteriores dejarán de funcionar.</span>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyUrl}
                className="h-9"
              >
                {copied ? (
                  <><CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-600" /> Copiado</>
                ) : (
                  <><Copy className="h-4 w-4 mr-1.5" /> Copiar URL</>
                )}
              </Button>
              <Link href={`/${formData.slug || tenant?.slug}`} target="_blank">
                <Button variant="outline" size="sm" className="h-9">
                  <ExternalLink className="h-4 w-4 mr-1.5" />
                  Ver mi Página
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="w-full grid grid-cols-3 h-12">
          <TabsTrigger value="perfil" className="gap-1.5 text-xs sm:text-sm data-[state=active]:shadow-md">
            <User className="h-4 w-4" />
            <span>Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="operacion" className="gap-1.5 text-xs sm:text-sm data-[state=active]:shadow-md">
            <Sliders className="h-4 w-4" />
            <span className="hidden sm:inline">Reservas y Avisos</span>
            <span className="sm:hidden">Ajustes</span>
          </TabsTrigger>
          <TabsTrigger value="apariencia" className="gap-1.5 text-xs sm:text-sm data-[state=active]:shadow-md">
            <Palette className="h-4 w-4" />
            <span>Apariencia</span>
          </TabsTrigger>
        </TabsList>

        {/* ─────────────────────────────────────────────────── */}
        {/* TAB 1: PERFIL                                      */}
        {/* ─────────────────────────────────────────────────── */}
        <TabsContent value="perfil">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Business Info */}
            <Card data-tour="business-info" className="border-0 shadow-soft lg:col-span-2 overflow-hidden">
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
                      WhatsApp / Teléfono
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+54 9 11 1234-5678"
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Incluye código de país para WhatsApp. Ej: +54 9 11 para Argentina
                    </p>
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
              <div className="h-1 bg-gradient-to-r from-purple-500 to-teal-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center">
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
            <Card className="border-0 shadow-soft lg:col-span-2 overflow-hidden">
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
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
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
        </TabsContent>

        {/* ─────────────────────────────────────────────────── */}
        {/* TAB 2: RESERVAS Y AVISOS                           */}
        {/* ─────────────────────────────────────────────────── */}
        <TabsContent value="operacion">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Deposit/Seña Settings */}
            <Card className="border-0 shadow-soft overflow-hidden">
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
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5 min-w-0">
                    <Label htmlFor="requireDeposit" className="text-base">Requerir seña</Label>
                    <p className="text-sm text-muted-foreground">
                      Los clientes deberán pagar un porcentaje del servicio para confirmar el turno
                    </p>
                  </div>
                  <Switch
                    id="requireDeposit"
                    className="flex-shrink-0"
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

            {/* Email Notifications */}
            <Card className="border-0 shadow-soft overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-sky-500 to-cyan-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  Notificaciones por Email
                </CardTitle>
                <CardDescription>
                  Recibe avisos por correo electrónico
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5 min-w-0">
                    <Label htmlFor="notifyOwnerByEmail" className="text-base">Email por nueva reserva</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir un email cada vez que un cliente reserve un turno
                    </p>
                  </div>
                  <Switch
                    id="notifyOwnerByEmail"
                    className="flex-shrink-0"
                    checked={notificationSettings.notifyOwnerByEmail}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, notifyOwnerByEmail: checked })
                    }
                  />
                </div>

                {notificationSettings.notifyOwnerByEmail && (
                  <div className="space-y-2">
                    <Label htmlFor="notificationEmail" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email para notificaciones
                    </Label>
                    <Input
                      id="notificationEmail"
                      type="email"
                      value={notificationSettings.notificationEmail}
                      onChange={(e) =>
                        setNotificationSettings({ ...notificationSettings, notificationEmail: e.target.value })
                      }
                      placeholder={formData.email || 'tu@email.com'}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Si lo dejás vacío, se usará el email del negocio ({formData.email || 'no configurado'}) o el de tu cuenta
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Push Notifications */}
            <Card className="border-0 shadow-soft lg:col-span-2 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                    <Smartphone className="h-4 w-4 text-white" />
                  </div>
                  Notificaciones Push
                </CardTitle>
                <CardDescription>
                  Elige qué eventos te notifican en tu celular
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/50">
                    <div className="space-y-0.5 min-w-0 mr-3">
                      <Label htmlFor="pushNewBooking" className="text-sm font-semibold">Nuevas reservas</Label>
                      <p className="text-xs text-muted-foreground">
                        Cuando un cliente reserva
                      </p>
                    </div>
                    <Switch
                      id="pushNewBooking"
                      className="flex-shrink-0"
                      checked={pushSettings.pushNewBooking}
                      onCheckedChange={(checked) =>
                        setPushSettings({ ...pushSettings, pushNewBooking: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-100 dark:border-red-800/50">
                    <div className="space-y-0.5 min-w-0 mr-3">
                      <Label htmlFor="pushCancellation" className="text-sm font-semibold">Cancelaciones</Label>
                      <p className="text-xs text-muted-foreground">
                        Cuando un cliente cancela
                      </p>
                    </div>
                    <Switch
                      id="pushCancellation"
                      className="flex-shrink-0"
                      checked={pushSettings.pushCancellation}
                      onCheckedChange={(checked) =>
                        setPushSettings({ ...pushSettings, pushCancellation: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-100 dark:border-amber-800/50">
                    <div className="space-y-0.5 min-w-0 mr-3">
                      <Label htmlFor="pushReminder" className="text-sm font-semibold">Recordatorios</Label>
                      <p className="text-xs text-muted-foreground">
                        Antes de cada turno del día
                      </p>
                    </div>
                    <Switch
                      id="pushReminder"
                      className="flex-shrink-0"
                      checked={pushSettings.pushReminder}
                      onCheckedChange={(checked) =>
                        setPushSettings({ ...pushSettings, pushReminder: checked })
                      }
                    />
                  </div>
                </div>

                <div className="rounded-lg border bg-slate-50 dark:bg-neutral-800/50 border-slate-200 dark:border-neutral-700 p-3 mt-4">
                  <p className="text-xs text-muted-foreground">
                    Las push se activan desde el panel principal. Si no las activaste, estos ajustes no tendrán efecto.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Booking Time Settings */}
            <Card className="border-0 shadow-soft lg:col-span-2 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                    <Timer className="h-4 w-4 text-white" />
                  </div>
                  Tiempos de Reserva
                </CardTitle>
                <CardDescription>
                  Configura los tiempos entre turnos y las restricciones de reserva
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2 p-3 sm:p-4 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border border-teal-100 dark:border-teal-800/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Timer className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      <Label htmlFor="bookingBuffer" className="text-sm font-semibold">Tiempo entre turnos</Label>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Minutos de descanso entre un turno y el siguiente
                    </p>
                    <select
                      id="bookingBuffer"
                      value={bookingTimeSettings.bookingBuffer}
                      onChange={(e) =>
                        setBookingTimeSettings({ ...bookingTimeSettings, bookingBuffer: Number(e.target.value) })
                      }
                      className="w-full h-10 px-3 rounded-lg border bg-background text-sm"
                    >
                      <option value={0}>Sin tiempo entre turnos</option>
                      <option value={5}>5 minutos</option>
                      <option value={10}>10 minutos</option>
                      <option value={15}>15 minutos</option>
                      <option value={20}>20 minutos</option>
                      <option value={30}>30 minutos</option>
                    </select>
                  </div>

                  <div className="space-y-2 p-3 sm:p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <Label htmlFor="minAdvance" className="text-sm font-semibold">Anticipación mínima</Label>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Horas de anticipación para reservar desde la página pública
                    </p>
                    <select
                      id="minAdvance"
                      value={bookingTimeSettings.minAdvanceBookingHours}
                      onChange={(e) =>
                        setBookingTimeSettings({ ...bookingTimeSettings, minAdvanceBookingHours: Number(e.target.value) })
                      }
                      className="w-full h-10 px-3 rounded-lg border bg-background text-sm"
                    >
                      <option value={0}>Sin mínimo</option>
                      <option value={1}>1 hora</option>
                      <option value={2}>2 horas</option>
                      <option value={3}>3 horas</option>
                      <option value={6}>6 horas</option>
                      <option value={12}>12 horas</option>
                      <option value={24}>24 horas</option>
                    </select>
                  </div>

                  <div className="space-y-2 p-3 sm:p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-100 dark:border-violet-800/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                      <Label htmlFor="maxAdvance" className="text-sm font-semibold">Máximo a futuro</Label>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Cuántos días a futuro pueden reservar los clientes
                    </p>
                    <select
                      id="maxAdvance"
                      value={bookingTimeSettings.maxAdvanceBookingDays}
                      onChange={(e) =>
                        setBookingTimeSettings({ ...bookingTimeSettings, maxAdvanceBookingDays: Number(e.target.value) })
                      }
                      className="w-full h-10 px-3 rounded-lg border bg-background text-sm"
                    >
                      <option value={7}>7 días</option>
                      <option value={14}>14 días</option>
                      <option value={30}>30 días</option>
                      <option value={60}>60 días</option>
                      <option value={90}>90 días</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Smart Time Slots */}
            <Card className="border-0 shadow-soft lg:col-span-2 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-indigo-500 to-blue-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  Vista de Horarios
                </CardTitle>
                <CardDescription>
                  Configura cómo se muestran los horarios disponibles en tu página pública
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-4 p-3 sm:p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-100 dark:border-indigo-800/50">
                  <div className="space-y-0.5 min-w-0">
                    <Label htmlFor="smartTimeSlots" className="text-base">Horarios agrupados por franja</Label>
                    <p className="text-sm text-muted-foreground">
                      Agrupa automáticamente los horarios en Mañana, Tarde y Noche cuando hay más de 12 turnos disponibles
                    </p>
                  </div>
                  <Switch
                    id="smartTimeSlots"
                    className="flex-shrink-0"
                    checked={bookingTimeSettings.smartTimeSlots}
                    onCheckedChange={(checked) =>
                      setBookingTimeSettings({ ...bookingTimeSettings, smartTimeSlots: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─────────────────────────────────────────────────── */}
        {/* TAB 3: APARIENCIA                                  */}
        {/* ─────────────────────────────────────────────────── */}
        <TabsContent value="apariencia">
          <div className="grid gap-6">
            {/* Dark Mode Toggle */}
            <Card className="border-0 shadow-soft overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-teal-500 to-violet-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-500 to-violet-500 flex items-center justify-center">
                    <Palette className="h-4 w-4 text-white" />
                  </div>
                  Personalización Visual
                </CardTitle>
                <CardDescription>
                  Configura los colores y tema de tu página pública de reservas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme Mode Selector */}
                <div className="space-y-3 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-neutral-800 dark:to-neutral-900">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="hidden sm:flex h-10 w-10 rounded-lg bg-white dark:bg-neutral-700 shadow-sm items-center justify-center flex-shrink-0">
                      {themeSettings.themeMode === 'dark' ? (
                        <Moon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      ) : themeSettings.themeMode === 'light' ? (
                        <Sun className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                      ) : (
                        <Sliders className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <Label className="text-base font-medium">Modo de tema</Label>
                      <p className="text-sm text-muted-foreground">
                        Elige cómo se muestra el tema en tu página pública
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: 'light' as const, label: 'Solo claro', icon: Sun, desc: 'Siempre tema claro' },
                      { value: 'dark' as const, label: 'Solo oscuro', icon: Moon, desc: 'Siempre tema oscuro' },
                      { value: 'both' as const, label: 'Ambos', icon: Sliders, desc: 'El visitante elige' },
                    ]).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          const enableDark = option.value !== 'light';
                          setThemeSettings({ ...themeSettings, themeMode: option.value, enableDarkMode: enableDark });
                        }}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                          themeSettings.themeMode === option.value
                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30 shadow-sm'
                            : 'border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-slate-300 dark:hover:border-neutral-600'
                        }`}
                      >
                        <option.icon className={`h-5 w-5 ${
                          themeSettings.themeMode === option.value
                            ? 'text-teal-600 dark:text-teal-400'
                            : 'text-slate-400 dark:text-neutral-500'
                        }`} />
                        <span className={`text-xs font-medium ${
                          themeSettings.themeMode === option.value
                            ? 'text-teal-700 dark:text-teal-300'
                            : 'text-slate-600 dark:text-neutral-400'
                        }`}>{option.label}</span>
                        <span className="text-[10px] text-muted-foreground leading-tight text-center">{option.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Cover & Profile Photo Settings ── */}
                <div className="space-y-5 p-4 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50/50 dark:bg-neutral-800/50">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <ImageIcon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      <Label className="text-base font-medium">Portada y Foto de Perfil</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Configura cómo se muestra tu encabezado</p>
                  </div>

                  {/* Toggle: Show profile photo */}
                  <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700">
                    <div className="min-w-0">
                      <Label htmlFor="showProfilePhoto" className="text-sm font-medium">
                        Mostrar foto de perfil en el encabezado
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Si está desactivado, solo se mostrará la foto de portada sin el logo
                      </p>
                    </div>
                    <Switch
                      id="showProfilePhoto"
                      className="flex-shrink-0"
                      checked={themeSettings.showProfilePhoto}
                      onCheckedChange={(checked) =>
                        setThemeSettings({ ...themeSettings, showProfilePhoto: checked })
                      }
                    />
                  </div>

                  {/* Separator */}
                  <div className="border-t border-dashed border-slate-200 dark:border-neutral-700" />

                  {/* Cover overlay settings */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Capa sobre foto de portada</Label>
                      <p className="text-xs text-muted-foreground">Oscurece la imagen para mejorar legibilidad del texto</p>
                    </div>

                    {/* Color picker with presets */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Color</Label>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                          { color: '#000000', label: 'Negro' },
                          { color: '#1a1a2e', label: 'Noche' },
                          { color: '#1e293b', label: 'Pizarra' },
                          { color: '#1e3a5f', label: 'Marino' },
                          { color: '#14532d', label: 'Bosque' },
                          { color: '#3f3f46', label: 'Zinc' },
                          { color: '#FFFFFF', label: 'Blanco' },
                          { color: '#f5f0e8', label: 'Crema' },
                          { color: themeSettings.primaryColor, label: 'Tu marca' },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            title={preset.label}
                            onClick={() => setThemeSettings({ ...themeSettings, coverOverlayColor: preset.color })}
                            className={`group relative w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${themeSettings.coverOverlayColor.toLowerCase() === preset.color.toLowerCase() ? 'border-teal-500 ring-2 ring-teal-500/30 scale-110' : 'border-slate-300 dark:border-neutral-600 hover:border-slate-400'}`}
                            style={{ backgroundColor: preset.color }}
                          >
                            <span className="sr-only">{preset.label}</span>
                          </button>
                        ))}
                        <div className="relative">
                          <input
                            type="color"
                            value={themeSettings.coverOverlayColor}
                            onChange={(e) => setThemeSettings({ ...themeSettings, coverOverlayColor: e.target.value })}
                            className="w-8 h-8 rounded-lg border-2 border-dashed border-slate-300 dark:border-neutral-600 cursor-pointer bg-transparent"
                            title="Color personalizado"
                          />
                        </div>
                        <Input
                          value={themeSettings.coverOverlayColor}
                          onChange={(e) => setThemeSettings({ ...themeSettings, coverOverlayColor: e.target.value })}
                          className="w-[5.5rem] h-8 text-xs font-mono ml-1"
                          maxLength={7}
                        />
                      </div>
                    </div>

                    {/* Opacity slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Opacidad</Label>
                        <span className="text-xs font-medium tabular-nums">{themeSettings.coverOverlayOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={themeSettings.coverOverlayOpacity}
                        onChange={(e) => setThemeSettings({ ...themeSettings, coverOverlayOpacity: Number(e.target.value) })}
                        className="w-full h-2 bg-slate-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
                      />
                    </div>

                    {/* Live preview */}
                    <div className="relative h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-neutral-700">
                      {formData.coverImage ? (
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${formData.coverImage})` }} />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-300 to-slate-400 dark:from-neutral-600 dark:to-neutral-700" />
                      )}
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundColor: themeSettings.coverOverlayColor,
                          opacity: themeSettings.coverOverlayOpacity / 100,
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-xs font-medium drop-shadow">Vista previa del overlay</span>
                      </div>
                      {themeSettings.coverFadeEnabled && (
                        <div
                          className="absolute inset-x-0 bottom-0 h-8"
                          style={{
                            background: `linear-gradient(to bottom, transparent, ${themeSettings.coverFadeColor})`,
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Separator */}
                  <div className="border-t border-dashed border-slate-200 dark:border-neutral-700" />

                  {/* Fade effect */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <Label htmlFor="coverFadeEnabled" className="text-sm font-medium">
                          Efecto de fundido inferior
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Agrega un degradado suave en la parte inferior de la portada
                        </p>
                      </div>
                      <Switch
                        id="coverFadeEnabled"
                        className="flex-shrink-0"
                        checked={themeSettings.coverFadeEnabled}
                        onCheckedChange={(checked) =>
                          setThemeSettings({ ...themeSettings, coverFadeEnabled: checked })
                        }
                      />
                    </div>

                    {themeSettings.coverFadeEnabled && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Color del fundido</Label>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {[
                            { color: '#000000', label: 'Negro' },
                            { color: '#1a1a2e', label: 'Noche' },
                            { color: '#1e293b', label: 'Pizarra' },
                            { color: '#1e3a5f', label: 'Marino' },
                            { color: '#14532d', label: 'Bosque' },
                            { color: '#FFFFFF', label: 'Blanco' },
                            { color: '#f5f0e8', label: 'Crema' },
                            { color: themeSettings.primaryColor, label: 'Tu marca' },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              title={preset.label}
                              onClick={() => setThemeSettings({ ...themeSettings, coverFadeColor: preset.color })}
                              className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${themeSettings.coverFadeColor.toLowerCase() === preset.color.toLowerCase() ? 'border-teal-500 ring-2 ring-teal-500/30 scale-110' : 'border-slate-300 dark:border-neutral-600 hover:border-slate-400'}`}
                              style={{ backgroundColor: preset.color }}
                            >
                              <span className="sr-only">{preset.label}</span>
                            </button>
                          ))}
                          <div className="relative">
                            <input
                              type="color"
                              value={themeSettings.coverFadeColor}
                              onChange={(e) => setThemeSettings({ ...themeSettings, coverFadeColor: e.target.value })}
                              className="w-8 h-8 rounded-lg border-2 border-dashed border-slate-300 dark:border-neutral-600 cursor-pointer bg-transparent"
                              title="Color personalizado"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hero Style Selector */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Estilo del encabezado (Hero)</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Define la apariencia visual del encabezado de tu página. Cada estilo cambia el fondo, la disposición, las formas y la tipografía.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {HERO_STYLE_OPTIONS.map((option) => (
                      <HeroStylePreview
                        key={option.value}
                        style={option.value}
                        selected={themeSettings.heroStyle === option.value}
                        onClick={() => {
                          const colors = HERO_STYLE_DEFAULT_COLORS[option.value];
                          const cover = HERO_STYLE_COVER_DEFAULTS[option.value];
                          setThemeSettings({
                            ...themeSettings,
                            heroStyle: option.value,
                            primaryColor: colors.primary,
                            secondaryColor: colors.secondary,
                            accentColor: colors.accent,
                            coverOverlayColor: cover.coverOverlayColor,
                            coverOverlayOpacity: cover.coverOverlayOpacity,
                            coverFadeEnabled: cover.coverFadeEnabled,
                            coverFadeColor: cover.coverFadeColor,
                          });
                        }}
                        label={option.label}
                        description={option.description}
                      />
                    ))}
                  </div>
                </div>

                {/* Card Style Selector */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Estilo de tarjetas de servicios</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Elige cómo se ven las tarjetas de tus servicios. Cada estilo cambia la forma, botones y disposición de la tarjeta.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {CARD_STYLE_OPTIONS.map((option) => (
                      option.value === '' ? (
                        <button
                          key="same"
                          type="button"
                          onClick={() => setThemeSettings({ ...themeSettings, cardStyle: '' })}
                          className={`relative w-full rounded-xl overflow-hidden border-2 transition-all text-left ${
                            themeSettings.cardStyle === ''
                              ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-md'
                              : 'border-neutral-200 dark:border-neutral-700 hover:border-primary/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:shadow-sm'
                          }`}
                        >
                          <div className="h-[140px] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-800 dark:to-neutral-700">
                            <div className="text-center space-y-2">
                              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mx-auto">
                                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                              </div>
                              <div>
                                <span className="text-[11px] font-medium text-slate-600 dark:text-neutral-300 block">Sincronizado</span>
                                <span className="text-[9px] text-slate-400 dark:text-neutral-500">con el encabezado</span>
                              </div>
                            </div>
                            {themeSettings.cardStyle === '' && (
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                              </div>
                            )}
                          </div>
                          <div className="p-3 space-y-2">
                            <div className="space-y-0.5">
                              <span className={`font-medium text-sm block ${themeSettings.cardStyle === '' ? 'text-primary' : 'text-neutral-900 dark:text-neutral-100'}`}>{option.label}</span>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">{option.description}</p>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium leading-tight bg-primary/10 text-primary">Auto</span>
                            </div>
                          </div>
                        </button>
                      ) : (
                        <CardStylePreview
                          key={option.value}
                          style={option.value}
                          selected={themeSettings.cardStyle === option.value}
                          onClick={() => {
                            setThemeSettings({
                              ...themeSettings,
                              cardStyle: option.value,
                            });
                          }}
                          label={option.label}
                          description={option.description}
                        />
                      )
                    ))}
                  </div>
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

                {/* Color Pickers with Preview */}
                <ColorPickerSection
                  primaryColor={themeSettings.primaryColor}
                  secondaryColor={themeSettings.secondaryColor}
                  accentColor={themeSettings.accentColor}
                  onPrimaryChange={(color) => setThemeSettings({ ...themeSettings, primaryColor: color })}
                  onSecondaryChange={(color) => setThemeSettings({ ...themeSettings, secondaryColor: color })}
                  onAccentChange={(color) => setThemeSettings({ ...themeSettings, accentColor: color })}
                  onReset={() => setThemeSettings({
                    ...themeSettings,
                    primaryColor: '#3F8697',
                    secondaryColor: '#8B5CF6',
                    accentColor: '#F59E0B',
                  })}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Help & Tour — always visible */}
      <Card className="border-0 shadow-soft overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <HelpCircle className="h-4 w-4 text-white" />
            </div>
            Ayuda
          </CardTitle>
          <CardDescription>
            ¿Necesitas ayuda para usar TurnoLink?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
            <div>
              <p className="font-medium text-violet-900 dark:text-violet-200">Tour de bienvenida</p>
              <p className="text-sm text-violet-700 dark:text-violet-400">
                Vuelve a ver el tour paso a paso para aprender a usar la plataforma
              </p>
            </div>
            <RestartTourButton />
          </div>
        </CardContent>
      </Card>

      {/* Spacer for mobile floating buttons */}
      <div className="h-20 sm:hidden" />

      {/* Mobile floating action bar */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-neutral-700 sm:hidden z-50 safe-area-bottom">
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-12 bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white/90 shadow-lg text-base font-semibold"
          >
            {saving ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Save className="mr-2 h-5 w-5" />
            )}
            Guardar
          </Button>
          <Link href={`/${formData.slug || tenant?.slug}`} target="_blank" className="flex-1">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base font-semibold border-slate-300 dark:border-neutral-600"
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              Ver página
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
