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
  Store,
  Users,
  ClipboardList,
  Zap,
  Shield,
  Heart,
  MessageCircle,
  X,
  Youtube,
  Sparkles,
  ShoppingCart,
  BookOpen,
  Truck,
  Navigation,
  RotateCcw,
} from 'lucide-react';
import { getAmenitiesCatalog } from '@/lib/amenities-catalog';
import { RestartTourButton } from '@/components/onboarding/onboarding-tour';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createApiClient } from '@/lib/api';
import { handleApiError } from '@/lib/notifications';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ui/image-upload';
import { BackgroundStylePreview, BACKGROUND_STYLE_OPTIONS, BackgroundStyle } from '@/components/ui/background-styles';
import { HeroStylePreview } from '@/components/booking/hero-style-preview';
import { CardStylePreview } from '@/components/booking/card-style-preview';
import { ProductCardStylePreview } from '@/components/storefront/product-card-style-preview';
import { HERO_STYLE_OPTIONS, CARD_STYLE_OPTIONS, HERO_STYLE_DEFAULT_COLORS, HERO_STYLE_COVER_DEFAULTS, HeroStyleName } from '@/lib/hero-styles';
import { ColorPickerSection } from '@/components/ui/color-picker';
import Link from 'next/link';
import { CategoryIcon } from '@/components/ui/category-icon';
import { RUBROS, RUBRO_MAP, TERMINOLOGY_OPTIONS, FICHA_MODULES, DEFAULT_ENABLED_FICHAS, getRubroUIConfig, getFichaModulesForRubro, type FichaModuleId } from '@/lib/tenant-config';
import { useTenantConfig, useRubroTerms } from '@/contexts/tenant-config-context';
import { isCatalogRubro as isCatalogRubroFn, isGastronomiaRubro } from '@/lib/rubro-attributes';
import { usePlanFeatures, SEO_FEATURES } from '@/lib/hooks/use-plan-features';
import { Search, Lock, Crown } from 'lucide-react';

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
  heroTextTone?: 'auto' | 'light' | 'dark';
  heroTrustTone?: 'auto' | 'light' | 'dark';
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
  publicPageLayout?: string;
  publicPageConfig?: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://turnolink.com.ar';

function SeoSection({ slug }: { slug?: string }) {
  const { data: session } = useSession();
  const { hasFeature } = usePlanFeatures();
  const { toast } = useToast();
  const canCustomize = hasFeature(SEO_FEATURES.SEO_CUSTOM);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!session?.accessToken) return;
    const api = createApiClient(session.accessToken as string);
    api.getBranding().then((b: any) => {
      setMetaTitle(b?.metaTitle || '');
      setMetaDescription(b?.metaDescription || '');
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, [session?.accessToken]);

  const handleSave = async () => {
    if (!session?.accessToken || !canCustomize) return;
    setSaving(true);
    try {
      const api = createApiClient(session.accessToken as string);
      await api.updateBranding({ metaTitle: metaTitle || null, metaDescription: metaDescription || null });
      toast({ title: 'SEO actualizado', description: 'Los cambios pueden tardar unos días en reflejarse en Google.' });
    } catch (err: any) {
      handleApiError(err, 'SEO');
    } finally {
      setSaving(false);
    }
  };

  const displayTitle = metaTitle || (slug ? `Tu Negocio - Reservar Turno` : 'Cargando...');
  const displayDesc = metaDescription || 'Reservá tu turno online. Agenda disponible 24/7.';
  const displayUrl = slug ? `turnolink.com.ar/${slug}` : 'turnolink.com.ar/tu-negocio';

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* SEO automático — siempre visible */}
      <Card className="border-0 shadow-soft overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
            SEO Automático
          </CardTitle>
          <CardDescription>Tu negocio ya aparece en Google con estos datos generados automáticamente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Activo en tu plan actual
            </div>
            <ul className="text-sm text-muted-foreground space-y-1.5 ml-6">
              <li>Tu página aparece en Google con título y descripción</li>
              <li>Indexada en el sitemap de TurnoLink</li>
              <li>Datos estructurados de negocio (nombre, dirección, teléfono)</li>
              <li>Imagen al compartir en WhatsApp y redes sociales</li>
            </ul>
          </div>

          {/* Google Preview */}
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Vista previa en Google</Label>
            <div className="mt-2 rounded-lg border bg-white dark:bg-neutral-900 p-4">
              <p className="text-blue-600 dark:text-blue-400 text-lg font-medium leading-tight truncate">{displayTitle}</p>
              <p className="text-green-700 dark:text-green-500 text-sm mt-0.5">{displayUrl}</p>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{displayDesc}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO personalizado — gateado por plan */}
      <Card className={`border-0 shadow-soft overflow-hidden ${!canCustomize ? 'opacity-75' : ''}`}>
        <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              {canCustomize ? <Search className="h-4 w-4 text-white" /> : <Lock className="h-4 w-4 text-white" />}
            </div>
            SEO Personalizado
            {!canCustomize && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                <Crown className="h-3 w-3" />
                Plan Pro
              </span>
            )}
          </CardTitle>
          <CardDescription>
            {canCustomize
              ? 'Personalizá cómo aparece tu negocio en los resultados de Google'
              : 'Mejorá a un plan Pro para personalizar tu título y descripción en Google'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {canCustomize ? (
            <>
              <div className="space-y-2">
                <Label>Título para buscadores</Label>
                <Input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Ej: Mi Peluquería — Turnos Online en Palermo"
                  maxLength={70}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">{metaTitle.length}/70 caracteres</p>
              </div>
              <div className="space-y-2">
                <Label>Descripción para buscadores</Label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Ej: Reservá tu turno de corte, color o tratamiento. Atendemos de lunes a sábado en Palermo, CABA."
                  maxLength={160}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <p className="text-xs text-muted-foreground">{metaDescription.length}/160 caracteres</p>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full h-11">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar SEO
              </Button>
            </>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-6 text-center space-y-3">
              <Crown className="h-10 w-10 text-amber-500 mx-auto" />
              <p className="font-semibold">Personalizá tu presencia en Google</p>
              <p className="text-sm text-muted-foreground">
                Con el plan Pro podés escribir tu propio título y descripción para que Google muestre exactamente lo que vos querés.
              </p>
              <Link href="/planes">
                <Button variant="outline" className="mt-2 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400">
                  <Crown className="mr-2 h-4 w-4" />
                  Ver planes
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
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
  const { hasFeature } = usePlanFeatures();
  const canEcommerce = hasFeature('online_payments') || hasFeature('mercadopago');
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
  const tenantConfig = useTenantConfig();
  const terms = useRubroTerms();
  const [businessConfig, setBusinessConfig] = useState({
    rubro: '',
    storeType: 'catalogo' as 'catalogo' | 'ecommerce',
    clientLabelSingular: 'Cliente',
    clientLabelPlural: 'Clientes',
    enabledFichas: ['datosPersonales', 'notasSeguimiento'] as FichaModuleId[],
    hiddenSections: [] as string[],
  });
  const [savedRubro, setSavedRubro] = useState('');
  const isCatalogRubro = isCatalogRubroFn(businessConfig.rubro);
  const isGastro = isGastronomiaRubro(businessConfig.rubro);
  const [publicPageSettings, setPublicPageSettings] = useState({
    layout: 'employee_first' as string,
    terminologyPreset: '' as string,
    customTerms: {} as Record<string, string>,
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
    heroTextTone: 'auto' as 'auto' | 'light' | 'dark',
    heroTrustTone: 'auto' as 'auto' | 'light' | 'dark',
    heroButtons: ['location', 'call', 'instagram'] as ('location' | 'call' | 'whatsapp' | 'instagram')[],
    mobileColumns: 2 as 1 | 2,
  });

  const [shippingSettings, setShippingSettings] = useState({
    pickup: { enabled: false, address: '', hours: '' },
    delivery: { enabled: false, info: '' },
    meetingPoint: { enabled: false, info: '' },
  });
  const [contentSettings, setContentSettings] = useState({
    youtubeVideoUrl: '',
    amenities: [] as string[],
    enableServiceContent: false,
  });
  const [logoScale, setLogoScale] = useState(1.0);
  const [logoOffsetX, setLogoOffsetX] = useState(0);
  const [logoOffsetY, setLogoOffsetY] = useState(0);

  useEffect(() => {
    if (session?.accessToken) {
      loadTenant();
    }
  }, [session]);

  const loadTenant = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
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
      setSavedRubro(settings.rubro ?? '');
      setBusinessConfig({
        rubro: settings.rubro ?? '',
        storeType: (settings.storeType as 'catalogo' | 'ecommerce') ?? 'catalogo',
        clientLabelSingular: settings.clientLabelSingular ?? 'Cliente',
        clientLabelPlural: settings.clientLabelPlural ?? 'Clientes',
        enabledFichas: Array.isArray(settings.enabledFichas) && settings.enabledFichas.length > 0
          ? settings.enabledFichas
          : ['datosPersonales', 'notasSeguimiento'],
        hiddenSections: Array.isArray(settings.hiddenSections) ? settings.hiddenSections : [],
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
        heroTextTone: (settings.heroTextTone as 'auto' | 'light' | 'dark') ?? 'auto',
        heroTrustTone: (settings.heroTrustTone as 'auto' | 'light' | 'dark') ?? 'auto',
        heroButtons: Array.isArray(settings.heroButtons)
          ? settings.heroButtons
          : settings.contactPreference === 'whatsapp' ? ['location', 'whatsapp', 'instagram']
          : settings.contactPreference === 'both' ? ['location', 'call', 'whatsapp', 'instagram']
          : ['location', 'call', 'instagram'],
        mobileColumns: (settings.mobileColumns as 1 | 2) ?? 2,
      });
      if (settings.shipping) {
        setShippingSettings({
          pickup: {
            enabled: settings.shipping.pickup?.enabled ?? false,
            address: settings.shipping.pickup?.address ?? '',
            hours: settings.shipping.pickup?.hours ?? '',
          },
          delivery: {
            enabled: settings.shipping.delivery?.enabled ?? false,
            info: settings.shipping.delivery?.info ?? '',
          },
          meetingPoint: {
            enabled: settings.shipping.meetingPoint?.enabled ?? false,
            info: settings.shipping.meetingPoint?.info ?? '',
          },
        });
      }
      setContentSettings({
        youtubeVideoUrl: settings.youtubeVideoUrl ?? '',
        amenities: Array.isArray(settings.amenities) ? settings.amenities : [],
        enableServiceContent: settings.enableServiceContent ?? false,
      });
    }
    // Load public page config
    const ppc = data.publicPageConfig
      ? (typeof data.publicPageConfig === 'string' ? JSON.parse(data.publicPageConfig) : data.publicPageConfig)
      : {};
    setPublicPageSettings({
      layout: data.publicPageLayout || 'service_first',
      terminologyPreset: typeof ppc.terminology === 'string' ? ppc.terminology : '',
      customTerms: typeof ppc.terminology === 'object' ? ppc.terminology : {},
    });
    // Load logoScale from branding
    try {
      const brandingData = await api.getBranding();
      setLogoScale((brandingData as any)?.logoScale ?? 1.0);
      setLogoOffsetX((brandingData as any)?.logoOffsetX ?? 0);
      setLogoOffsetY((brandingData as any)?.logoOffsetY ?? 0);
    } catch {}
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session?.accessToken) return;
    setSaving(true);

    try {
      const api = createApiClient(session.accessToken as string);
      const { slug, ...restFormData } = formData;
      // Build terminology config
      const terminology = publicPageSettings.terminologyPreset
        ? publicPageSettings.terminologyPreset
        : Object.keys(publicPageSettings.customTerms).length > 0
          ? publicPageSettings.customTerms
          : undefined;
      const updateData: Record<string, unknown> = {
        ...restFormData,
        publicPageLayout: publicPageSettings.layout,
        publicPageConfig: JSON.stringify({
          ...(terminology ? { terminology } : {}),
        }),
        settings: JSON.stringify({
          ...depositSettings,
          ...notificationSettings,
          ...pushSettings,
          ...themeSettings,
          ...bookingTimeSettings,
          ...businessConfig,
          ...contentSettings,
          shipping: shippingSettings,
        }),
      };
      // Only send slug if it changed
      if (tenant && slug !== tenant.slug) {
        updateData.slug = slug;
      }
      await api.updateTenant(updateData);

      // Sync branding colors + visual settings to TenantBranding table
      // (public pages read from TenantBranding, not Tenant.settings)
      await api.updateBranding({
        primaryColor: themeSettings.primaryColor,
        secondaryColor: themeSettings.secondaryColor,
        accentColor: themeSettings.accentColor,
        logoScale,
        logoOffsetX,
        logoOffsetY,
      }).catch(() => {});

      // Purge ISR cache for the public page so changes appear immediately
      const activeSlug = slug || tenant?.slug;
      // Purge ISR cache — call multiple times to hit all PM2 cluster instances
      if (activeSlug) {
        const revalidateOnce = () =>
          fetch('/api/revalidate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: `/${activeSlug}` }),
          }).catch(() => {});
        // Fire 4 calls with small delays to maximize chance of hitting both instances
        revalidateOnce();
        setTimeout(revalidateOnce, 200);
        setTimeout(revalidateOnce, 500);
        setTimeout(revalidateOnce, 1000);
      }

      // Update local tenant state with new slug
      if (tenant) {
        setTenant({ ...tenant, ...restFormData, slug });
      }
      // Reload tenant config context so sidebar/pages update
      tenantConfig.reload();

      toast({
        title: 'Configuración guardada',
        description: 'Los cambios se guardaron correctamente',
      });
    } catch (error) {
      handleApiError(error);
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
            {`Comparte este link con tus clientes para que puedan ${terms.bookingVerb} y ver tu tienda`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label className="text-sm font-medium">URL de tu página</Label>
            <div className="relative">
              <div className="flex items-center h-11 rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-500 transition-all">
                <span className="text-xs sm:text-sm text-muted-foreground pl-3 whitespace-nowrap select-none">
                  <span className="hidden sm:inline">turnolink.com.ar/</span>
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
        <TabsList className={`w-full grid ${isCatalogRubro ? 'grid-cols-4' : 'grid-cols-5'} h-12`}>
          <TabsTrigger value="perfil" className="gap-1.5 text-xs sm:text-sm data-[state=active]:shadow-md">
            <User className="h-4 w-4" />
            <span>Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="negocio" className="gap-1.5 text-xs sm:text-sm data-[state=active]:shadow-md">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Mi Negocio</span>
            <span className="sm:hidden">Negocio</span>
          </TabsTrigger>
          {!isCatalogRubro && (
            <TabsTrigger value="operacion" className="gap-1.5 text-xs sm:text-sm data-[state=active]:shadow-md">
              <Sliders className="h-4 w-4" />
              <span className="hidden sm:inline">{getRubroUIConfig(businessConfig.rubro).operationTabLabel}</span>
              <span className="sm:hidden">{getRubroUIConfig(businessConfig.rubro).operationTabLabel}</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="apariencia" className="gap-1.5 text-xs sm:text-sm data-[state=active]:shadow-md">
            <Palette className="h-4 w-4" />
            <span>Apariencia</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-1.5 text-xs sm:text-sm data-[state=active]:shadow-md">
            <Search className="h-4 w-4" />
            <span>SEO</span>
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
                    {!isCatalogRubro && (
                    <div className="space-y-2 pt-1">
                      <Label className="text-xs text-muted-foreground">Botones visibles en tu página</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {([
                          { value: 'location' as const, label: 'Ubicación', icon: MapPin, need: formData.city },
                          { value: 'call' as const, label: 'Llamar', icon: Phone, need: formData.phone },
                          { value: 'whatsapp' as const, label: 'WhatsApp', icon: MessageCircle, need: formData.phone },
                          { value: 'instagram' as const, label: 'Instagram', icon: Instagram, need: formData.instagram },
                        ] as const).map(({ value, label, icon: Icon, need }) => {
                          const active = themeSettings.heroButtons.includes(value);
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => {
                                const next = active
                                  ? themeSettings.heroButtons.filter((b: string) => b !== value)
                                  : [...themeSettings.heroButtons, value];
                                setThemeSettings({ ...themeSettings, heroButtons: next });
                              }}
                              disabled={!need}
                              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                                !need ? 'opacity-40 cursor-not-allowed border-border text-muted-foreground'
                                : active ? 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                                : 'border-border hover:bg-muted text-muted-foreground'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                              {label}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground">Completá los datos arriba para habilitar cada botón</p>
                    </div>
                    )}
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

                  {/* Logo Scale / Zoom */}
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Zoom de la imagen</span>
                      <span className="text-xs font-mono text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {Math.round(logoScale * 100)}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Ajustá el encuadre de tu logo dentro del marco
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground w-6 text-right">50%</span>
                      <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.05"
                        value={logoScale}
                        onChange={(e) => setLogoScale(parseFloat(e.target.value))}
                        className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-amber-500 bg-slate-200 dark:bg-slate-700"
                      />
                      <span className="text-[10px] text-muted-foreground w-8">300%</span>
                    </div>
                    {/* Position controls */}
                    <div className="mt-3 space-y-2">
                      <span className="text-sm font-medium">Posición</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-muted-foreground w-10 text-right">← Izq</span>
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          step="1"
                          value={logoOffsetX}
                          onChange={(e) => setLogoOffsetX(parseFloat(e.target.value))}
                          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-blue-500 bg-slate-200 dark:bg-slate-700"
                        />
                        <span className="text-[10px] text-muted-foreground w-10">Der →</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-muted-foreground w-10 text-right">↑ Arr</span>
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          step="1"
                          value={logoOffsetY}
                          onChange={(e) => setLogoOffsetY(parseFloat(e.target.value))}
                          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-blue-500 bg-slate-200 dark:bg-slate-700"
                        />
                        <span className="text-[10px] text-muted-foreground w-10">Abj ↓</span>
                      </div>
                      {(logoScale !== 1 || logoOffsetX !== 0 || logoOffsetY !== 0) && (
                        <button
                          type="button"
                          onClick={() => { setLogoOffsetX(0); setLogoOffsetY(0); setLogoScale(1); }}
                          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium mt-1"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Reiniciar imagen original
                        </button>
                      )}
                    </div>
                    {/* Live preview — zoom + position inside fixed frame */}
                    {formData.logo && (
                      <div className="mt-4 flex flex-col items-center gap-2">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600 shadow-sm bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                          <img
                            src={formData.logo}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain transition-transform duration-150"
                            style={{ transform: `scale(${logoScale}) translate(${logoOffsetX}%, ${logoOffsetY}%)`, transformOrigin: 'center' }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground">Así se ve tu logo en el panel</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Foto de portada</Label>
                  <ImageUpload
                    value={formData.coverImage}
                    onChange={(url) => setFormData({ ...formData, coverImage: url })}
                    onUpload={async (file) => {
                      if (!session?.accessToken) throw new Error('No autenticado');
                      const api = createApiClient(session.accessToken as string);
                      return api.uploadMedia(file, 'covers');
                    }}
                    aspectRatio="video"
                    placeholder="Subir foto de portada"
                  />
                  <p className="text-xs text-muted-foreground">
                    Recomendado: imagen horizontal 1200x400px. Se muestra como encabezado de tu página pública.
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

            {/* YouTube Video + Amenidades (per-tenant — para single property) */}
            <Card className="border-0 shadow-soft lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Youtube className="h-5 w-5 text-red-500" />
                  Contenido de la página
                </CardTitle>
                <CardDescription>Video y contenido adicional que se muestra en tu página pública</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="youtubeVideoUrl">Video de YouTube</Label>
                  <Input
                    id="youtubeVideoUrl"
                    type="url"
                    value={contentSettings.youtubeVideoUrl}
                    onChange={(e) => setContentSettings(prev => ({ ...prev, youtubeVideoUrl: e.target.value }))}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-muted-foreground">Pegá el link de YouTube con un tour o presentación. Se muestra en tu página pública.</p>
                </div>

                {/* Amenidades/Comodidades del negocio — label contextual por rubro */}
                {(() => {
                  const catalog = getAmenitiesCatalog(businessConfig.rubro);
                  const uiCfg = getRubroUIConfig(businessConfig.rubro);
                  if (catalog.length === 0 || !uiCfg.amenitiesLabel) return null;
                  return (
                    <div className="space-y-2">
                      <Label>{uiCfg.amenitiesLabel}</Label>
                      <p className="text-xs text-muted-foreground mb-2">{uiCfg.amenitiesDescription}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {catalog.map(amenity => {
                          const isSelected = contentSettings.amenities.includes(amenity.id);
                          return (
                            <button
                              key={amenity.id}
                              type="button"
                              onClick={() => {
                                setContentSettings(prev => ({
                                  ...prev,
                                  amenities: isSelected
                                    ? prev.amenities.filter(id => id !== amenity.id)
                                    : [...prev.amenities, amenity.id],
                                }));
                              }}
                              className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm transition-all text-left ${
                                isSelected
                                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                                  : 'border-border bg-background hover:bg-muted/50 text-muted-foreground'
                              }`}
                            >
                              {isSelected ? <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" /> : <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />}
                              <span className="truncate">{amenity.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Toggle: habilitar campos por servicio */}
                {!isCatalogRubro && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                  <div>
                    <p className="text-sm font-medium">Habilitar contenido por {terms.serviceSingular.toLowerCase()}</p>
                    <p className="text-xs text-muted-foreground">Permite agregar video y contenido adicional a cada {terms.serviceSingular.toLowerCase()}</p>
                  </div>
                  <Switch
                    checked={contentSettings.enableServiceContent ?? false}
                    onCheckedChange={(checked) => setContentSettings(prev => ({ ...prev, enableServiceContent: checked }))}
                  />
                </div>
                )}
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
        {/* TAB: MI NEGOCIO                                     */}
        {/* ─────────────────────────────────────────────────── */}
        <TabsContent value="negocio">
          <div className="space-y-6">

            {/* Seccion A: Rubro */}
            <Card className="border-0 shadow-soft overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                    <Store className="h-4 w-4 text-white" />
                  </div>
                  Rubro de tu negocio
                </CardTitle>
                <CardDescription>
                  {savedRubro
                    ? 'El rubro no puede cambiarse porque los planes y funcionalidades dependen de la industria seleccionada.'
                    : 'Selecciona el rubro principal de tu negocio. Esto ajustará automáticamente la terminología y fichas sugeridas.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {savedRubro && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 text-sm text-amber-700 dark:text-amber-300 mb-4">
                    <Lock className="h-4 w-4 flex-shrink-0" />
                    <span>Para cambiar de rubro contactá a soporte ya que implica un cambio de plan.</span>
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {RUBROS.map((rubro) => {
                    const isSelected = businessConfig.rubro === rubro.key;
                    const isLocked = !!savedRubro && !isSelected;
                    return (
                      <button
                        key={rubro.key}
                        disabled={isLocked}
                        onClick={() => {
                          if (isLocked) return;
                          const suggestion = RUBRO_MAP[rubro.key];
                          setBusinessConfig((prev) => ({
                            ...prev,
                            rubro: rubro.key,
                            clientLabelSingular: suggestion?.suggestedTerminology.singular ?? prev.clientLabelSingular,
                            clientLabelPlural: suggestion?.suggestedTerminology.plural ?? prev.clientLabelPlural,
                            enabledFichas: suggestion?.suggestedFichas ?? prev.enabledFichas,
                          }));
                          // Auto-sync public terminology preset from centralized config
                          const rubroUICfg = getRubroUIConfig(rubro.key);
                          setPublicPageSettings((prev) => ({
                            ...prev,
                            terminologyPreset: rubroUICfg.terminologyPreset,
                            customTerms: {},
                          }));
                        }}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium ${
                          isSelected
                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 shadow-md'
                            : isLocked
                              ? 'border-border/30 opacity-40 cursor-not-allowed text-muted-foreground'
                              : 'border-border/50 hover:border-border hover:bg-muted/50 text-muted-foreground'
                        }`}
                      >
                        <CategoryIcon categoryKey={rubro.key} size={36} />
                        {/* Fallback for rubros without custom icon */}
                        {!['estetica-belleza','barberia','masajes-spa','salud','odontologia','psicologia','nutricion','fitness','veterinaria','tatuajes-piercing','educacion','consultoria'].includes(rubro.key) && (
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-white text-lg font-bold ${isSelected ? 'bg-teal-500' : 'bg-muted-foreground/30'}`}>
                            {rubro.label.charAt(0)}
                          </div>
                        )}
                        <span className="text-center leading-tight">{rubro.label}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Seccion: Tipo de Tienda — solo rubro mercado (no gastro) */}
            {isCatalogRubro && !isGastro && (
            <Card className="border-0 shadow-soft overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 text-white" />
                  </div>
                  Tipo de Tienda
                </CardTitle>
                <CardDescription>
                  Elegí cómo funciona tu tienda online. Podés cambiarlo en cualquier momento.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {([
                    {
                      value: 'catalogo' as const,
                      label: 'Catálogo',
                      icon: BookOpen,
                      desc: 'Mostrá tus productos con precios. Los clientes consultan por WhatsApp o redes.',
                      features: ['Exhibición de productos', 'Precios visibles', 'Contacto directo', 'Sin carrito de compras'],
                    },
                    {
                      value: 'ecommerce' as const,
                      label: 'E-commerce',
                      icon: ShoppingCart,
                      desc: 'Tienda completa con carrito, checkout y pagos online.',
                      features: ['Carrito de compras', 'Checkout online', 'Medios de pago', 'Gestión de envíos'],
                    },
                  ] as const).map((option) => {
                    const isSelected = businessConfig.storeType === option.value;
                    const Icon = option.icon;
                    const isLocked = option.value === 'ecommerce' && !canEcommerce;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          if (isLocked) {
                            router.push('/mi-suscripcion');
                            return;
                          }
                          setBusinessConfig(prev => ({ ...prev, storeType: option.value }));
                        }}
                        className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                          isLocked
                            ? 'border-border opacity-70 cursor-pointer hover:border-amber-400 dark:hover:border-amber-600'
                            : isSelected
                              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 shadow-sm'
                              : 'border-border hover:border-emerald-300 dark:hover:border-emerald-700'
                        }`}
                      >
                        {isLocked && (
                          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                            <Crown className="h-3 w-3" />
                            PRO
                          </div>
                        )}
                        {isSelected && !isLocked && (
                          <div className="absolute top-3 right-3">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          </div>
                        )}
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${
                          isLocked
                            ? 'bg-muted text-muted-foreground'
                            : isSelected
                              ? 'bg-emerald-500 text-white'
                              : 'bg-muted text-muted-foreground'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="font-semibold text-sm mb-1">{option.label}</p>
                        <p className="text-xs text-muted-foreground mb-3">{option.desc}</p>
                        {isLocked && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-2 flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            Disponible desde el plan Comercio
                          </p>
                        )}
                        <ul className="space-y-1">
                          {option.features.map((f) => (
                            <li key={f} className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <div className={`h-1.5 w-1.5 rounded-full ${isSelected && !isLocked ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            )}

            {/* Seccion: Tipo de productos — solo para rubro 'mercado' genérico */}
            {businessConfig.rubro === 'mercado' && (
            <Card className="border-0 shadow-soft overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Sliders className="h-4 w-4 text-white" />
                  </div>
                  Tipo de productos
                </CardTitle>
                <CardDescription>
                  Elegí qué tipo de productos vendés para obtener filtros y fichas técnicas optimizadas. Podés cambiarlo en cualquier momento.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {([
                    { key: 'mercado-indumentaria', label: 'Indumentaria' },
                    { key: 'mercado-calzado', label: 'Calzado' },
                    { key: 'mercado-celulares', label: 'Celulares' },
                    { key: 'mercado-computacion', label: 'Computación' },
                    { key: 'mercado-electronica', label: 'Electrónica' },
                    { key: 'mercado-accesorios-tech', label: 'Accesorios Tech' },
                    { key: 'mercado-automotoras', label: 'Automotora' },
                    { key: 'mercado-alimentos', label: 'Alimentos' },
                    { key: 'mercado-muebles', label: 'Muebles' },
                    { key: 'mercado-juguetes', label: 'Juguetería' },
                    { key: 'mercado-deportes', label: 'Deportes' },
                    { key: 'mercado-libreria', label: 'Librería' },
                    { key: 'mercado-cosmetica', label: 'Cosmética' },
                    { key: 'mercado-mascotas', label: 'Mascotas' },
                    { key: 'mercado-joyeria', label: 'Joyería' },
                    { key: 'mercado-ferreteria', label: 'Ferretería' },
                    { key: 'mercado-bazar', label: 'Bazar' },
                  ]).map((sub) => (
                    <button
                      key={sub.key}
                      type="button"
                      onClick={() => setBusinessConfig(prev => ({ ...prev, rubro: sub.key }))}
                      className={`p-3 rounded-xl border-2 text-left text-sm font-medium transition-all ${
                        businessConfig.rubro === sub.key
                          ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                          : 'border-border hover:border-amber-300 dark:hover:border-amber-700 text-foreground'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Si tu tienda no encaja en ninguna categoría, dejalo sin seleccionar. Siempre podés elegir una más adelante.
                </p>
              </CardContent>
            </Card>
            )}

            {/* Seccion: Envíos (solo mercado, no gastro) */}
            {isCatalogRubro && !isGastro && (
            <Card className="border-0 shadow-soft overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Truck className="h-4 w-4 text-white" />
                  </div>
                  Opciones de entrega
                </CardTitle>
                <CardDescription>
                  Configurá cómo pueden recibir los productos tus clientes. Esta información se muestra al momento de la compra.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Retiro en el local */}
                <div className={`p-4 rounded-xl border-2 transition-all ${shippingSettings.pickup.enabled ? 'border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/20' : 'border-border/50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${shippingSettings.pickup.enabled ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Retiro en el local</p>
                        <p className="text-xs text-muted-foreground">El cliente retira en tu ubicación</p>
                      </div>
                    </div>
                    <Switch
                      checked={shippingSettings.pickup.enabled}
                      onCheckedChange={(checked) => setShippingSettings(prev => ({
                        ...prev,
                        pickup: { ...prev.pickup, enabled: checked },
                      }))}
                    />
                  </div>
                  {shippingSettings.pickup.enabled && (
                    <div className="space-y-3 pl-12">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Dirección de retiro</Label>
                        <Input
                          value={shippingSettings.pickup.address}
                          onChange={(e) => setShippingSettings(prev => ({
                            ...prev,
                            pickup: { ...prev.pickup, address: e.target.value },
                          }))}
                          placeholder="Ej: Av. Corrientes 1234, CABA"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Horarios de retiro</Label>
                        <Input
                          value={shippingSettings.pickup.hours}
                          onChange={(e) => setShippingSettings(prev => ({
                            ...prev,
                            pickup: { ...prev.pickup, hours: e.target.value },
                          }))}
                          placeholder="Ej: Lun a Vie 10-18hs, Sáb 10-14hs"
                          className="h-10"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Envío a coordinar */}
                <div className={`p-4 rounded-xl border-2 transition-all ${shippingSettings.delivery.enabled ? 'border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/20' : 'border-border/50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${shippingSettings.delivery.enabled ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                        <Truck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Envío</p>
                        <p className="text-xs text-muted-foreground">Envío a domicilio, a coordinar con el cliente</p>
                      </div>
                    </div>
                    <Switch
                      checked={shippingSettings.delivery.enabled}
                      onCheckedChange={(checked) => setShippingSettings(prev => ({
                        ...prev,
                        delivery: { ...prev.delivery, enabled: checked },
                      }))}
                    />
                  </div>
                  {shippingSettings.delivery.enabled && (
                    <div className="pl-12 space-y-1.5">
                      <Label className="text-xs">Información sobre envíos</Label>
                      <textarea
                        value={shippingSettings.delivery.info}
                        onChange={(e) => setShippingSettings(prev => ({
                          ...prev,
                          delivery: { ...prev.delivery, info: e.target.value },
                        }))}
                        placeholder="Ej: Envíos por Correo Argentino y Andreani. CABA y GBA: $3.500. Interior: $5.500. Consultar por WhatsApp."
                        rows={3}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      />
                      <p className="text-xs text-muted-foreground">Este texto lo verá el comprador al elegir envío</p>
                    </div>
                  )}
                </div>

                {/* Punto de encuentro */}
                <div className={`p-4 rounded-xl border-2 transition-all ${shippingSettings.meetingPoint.enabled ? 'border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/20' : 'border-border/50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${shippingSettings.meetingPoint.enabled ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                        <Navigation className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Punto de encuentro</p>
                        <p className="text-xs text-muted-foreground">Coordinás un lugar para entregar el producto</p>
                      </div>
                    </div>
                    <Switch
                      checked={shippingSettings.meetingPoint.enabled}
                      onCheckedChange={(checked) => setShippingSettings(prev => ({
                        ...prev,
                        meetingPoint: { ...prev.meetingPoint, enabled: checked },
                      }))}
                    />
                  </div>
                  {shippingSettings.meetingPoint.enabled && (
                    <div className="pl-12 space-y-1.5">
                      <Label className="text-xs">Información sobre puntos de encuentro</Label>
                      <textarea
                        value={shippingSettings.meetingPoint.info}
                        onChange={(e) => setShippingSettings(prev => ({
                          ...prev,
                          meetingPoint: { ...prev.meetingPoint, info: e.target.value },
                        }))}
                        placeholder="Ej: Nos encontramos en estaciones de subte línea B o D. Coordinar día y hora por WhatsApp."
                        rows={3}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      />
                      <p className="text-xs text-muted-foreground">Este texto lo verá el comprador al elegir punto de encuentro</p>
                    </div>
                  )}
                </div>

                {!shippingSettings.pickup.enabled && !shippingSettings.delivery.enabled && !shippingSettings.meetingPoint.enabled && (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
                    <p className="text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      Activá al menos una opción de entrega para que tus clientes puedan comprar.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            )}

            {/* Seccion B: Terminologia */}
            <Card className="border-0 shadow-soft overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  ¿Como llamas a tus usuarios?
                </CardTitle>
                <CardDescription>
                  Esta terminologia se usara en todo el sistema: sidebar, paginas, fichas, etc.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {TERMINOLOGY_OPTIONS.map((opt) => {
                    const isSelected = businessConfig.clientLabelPlural === opt.plural;
                    return (
                      <button
                        key={opt.plural}
                        onClick={() => setBusinessConfig((prev) => ({
                          ...prev,
                          clientLabelSingular: opt.singular,
                          clientLabelPlural: opt.plural,
                        }))}
                        className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 shadow-md'
                            : 'border-border/50 hover:border-border hover:bg-muted/50 text-muted-foreground'
                        }`}
                      >
                        <span className="text-lg font-bold">{opt.plural}</span>
                        <span className="text-xs opacity-70">Singular: {opt.singular}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Seccion C: Fichas habilitadas */}
            {!isCatalogRubro && (
            <Card className="border-0 shadow-soft overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <ClipboardList className="h-4 w-4 text-white" />
                  </div>
                  Fichas habilitadas
                </CardTitle>
                <CardDescription>
                  Elige que secciones mostrar en la ficha de cada {businessConfig.clientLabelSingular.toLowerCase()}.
                  Los modulos universales (Datos Personales y Notas de Seguimiento) no se pueden desactivar.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getFichaModulesForRubro(businessConfig.rubro).map((mod) => {
                    const isEnabled = businessConfig.enabledFichas.includes(mod.id);
                    return (
                      <div
                        key={mod.id}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                          isEnabled
                            ? 'border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20'
                            : 'border-border/50'
                        }`}
                      >
                        <div>
                          <p className="font-medium text-sm">{mod.label}</p>
                          {mod.universal && (
                            <p className="text-xs text-muted-foreground">Siempre activo</p>
                          )}
                        </div>
                        <Switch
                          checked={isEnabled}
                          disabled={mod.universal}
                          onCheckedChange={(checked) => {
                            setBusinessConfig((prev) => ({
                              ...prev,
                              enabledFichas: checked
                                ? [...prev.enabledFichas, mod.id]
                                : prev.enabledFichas.filter((f) => f !== mod.id),
                            }));
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            )}

            {/* Seccion D: Terminologia publica */}
            {!isCatalogRubro && (
            <Card className="border-0 shadow-soft overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-indigo-500 to-blue-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                    <Globe className="h-4 w-4 text-white" />
                  </div>
                  Terminología de tu página pública
                </CardTitle>
                <CardDescription>
                  Adapta el lenguaje que ven tus clientes al reservar. Se auto-configura al elegir un rubro.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label>Preset de industria</Label>
                <div className="grid gap-2 sm:grid-cols-4">
                  {[
                    { value: '', label: 'Genérico', desc: 'Servicio, Turno, Profesional' },
                    { value: 'beauty', label: 'Belleza', desc: 'Servicio, Turno, Estilista' },
                    { value: 'health', label: 'Salud', desc: 'Consulta, Turno, Profesional' },
                    { value: 'psychology', label: 'Psicología', desc: 'Sesión, Sesión, Psicólogo' },
                    { value: 'legal', label: 'Legal', desc: 'Consulta, Consulta, Abogado' },
                    { value: 'accounting', label: 'Contable', desc: 'Consulta, Consulta, Contador' },
                    { value: 'fitness', label: 'Fitness', desc: 'Clase, Reserva, Instructor' },
                    { value: 'lodging', label: 'Alojamiento', desc: 'Alojamiento, Reserva, —' },
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setPublicPageSettings(prev => ({
                        ...prev,
                        terminologyPreset: preset.value,
                        customTerms: {},
                      }))}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        publicPageSettings.terminologyPreset === preset.value
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600'
                      }`}
                    >
                      <p className="font-medium text-sm text-slate-900 dark:text-white">{preset.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{preset.desc}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
            )}

            {/* Seccion E: Secciones del menu */}
            <Card className="border-0 shadow-soft overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-slate-500 to-slate-600" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
                    <Sliders className="h-4 w-4 text-white" />
                  </div>
                  Secciones del Menú
                </CardTitle>
                <CardDescription>
                  Oculta secciones que no necesites en tu panel de administración
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { href: '/reportes', label: 'Reportes' },
                    { href: '/autogestion', label: 'Autogestión' },
                    { href: '/empleados', label: 'Empleados' },
                    { href: '/especialidades', label: 'Especialidades' },
                    { href: '/formularios', label: 'Formularios' },
                    { href: '/sucursales', label: 'Sucursales' },
                    { href: '/horarios', label: 'Horarios' },
                    { href: '/videollamadas', label: 'Videollamadas' },
                    { href: '/integracion', label: 'Desarrolladores' },
                  ].map((section) => {
                    const isHidden = businessConfig.hiddenSections.includes(section.href);
                    return (
                      <button
                        key={section.href}
                        type="button"
                        onClick={() => setBusinessConfig(prev => ({
                          ...prev,
                          hiddenSections: isHidden
                            ? prev.hiddenSections.filter(s => s !== section.href)
                            : [...prev.hiddenSections, section.href],
                        }))}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                          !isHidden
                            ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-muted-foreground line-through'
                        }`}
                      >
                        {!isHidden ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                        )}
                        {section.label}
                      </button>
                    );
                  })}
                </div>
                {/* Toggle grupal para Marketplace de Talento (3 rutas) */}
                {(() => {
                  const talentoHrefs = ['/talento', '/talento/propuestas', '/talento/ofertas'];
                  const talentoHidden = talentoHrefs.every(h => businessConfig.hiddenSections.includes(h));
                  return (
                    <button
                      type="button"
                      onClick={() => setBusinessConfig(prev => ({
                        ...prev,
                        hiddenSections: talentoHidden
                          ? prev.hiddenSections.filter(s => !talentoHrefs.includes(s))
                          : [...prev.hiddenSections.filter(s => !talentoHrefs.includes(s)), ...talentoHrefs],
                      }))}
                      className={`mt-2 flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all w-full ${
                        !talentoHidden
                          ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-muted-foreground line-through'
                      }`}
                    >
                      {!talentoHidden ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                      )}
                      Marketplace de Talento
                    </button>
                  );
                })()}
                <p className="text-xs text-muted-foreground mt-3">
                  Las secciones ocultas no aparecerán en el menú lateral. Siempre podrás volver a activarlas.
                </p>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border-0 shadow-soft bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-teal-900 dark:text-teal-200 mb-1">¿Como funciona?</h3>
                    <ul className="text-sm text-teal-700 dark:text-teal-300 space-y-1">
                      <li>• Al seleccionar un rubro, se configura automaticamente la terminologia interna, pública y fichas</li>
                      <li>• Podes cambiar todo manualmente en cualquier momento</li>
                      <li>• Recorda guardar los cambios para que se apliquen</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─────────────────────────────────────────────────── */}
        {/* TAB: RESERVAS                                      */}
        {/* ─────────────────────────────────────────────────── */}
        <TabsContent value="operacion">
          <div className="space-y-6">

            {/* Flujo de reservas */}
            <Card className="border-0 shadow-soft overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                    <Globe className="h-4 w-4 text-white" />
                  </div>
                  Flujo de reservas
                </CardTitle>
                <CardDescription>
                  {`Define cómo tus clientes navegan al ${terms.bookingVerb} en tu página pública`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { value: 'employee_first', label: 'Profesional primero', desc: 'El cliente elige profesional y después el servicio. Ideal para belleza y terapia.', icon: '👤' },
                    { value: 'specialty_first', label: 'Especialidad primero', desc: 'El cliente elige un área de práctica, después el servicio. Ideal para salud, legal, contable.', icon: '📋' },
                    { value: 'service_first', label: 'Servicio primero', desc: 'El cliente elige directamente el servicio. Ideal para negocios con pocos servicios.', icon: '⚡' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPublicPageSettings(prev => ({ ...prev, layout: opt.value }))}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        publicPageSettings.layout === opt.value
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                          : 'border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600'
                      }`}
                    >
                      <span className="text-2xl">{opt.icon}</span>
                      <p className="font-semibold text-sm mt-2 text-slate-900 dark:text-white">{opt.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Deposit/Seña Settings */}
            <Card className="border-0 shadow-soft overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-white" />
                  </div>
                  {terms.depositLabel}
                </CardTitle>
                <CardDescription>
                  {`Configura si requerís un pago adelantado para confirmar ${terms.bookingPlural.toLowerCase()}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5 min-w-0">
                    <Label htmlFor="requireDeposit" className="text-base">{`Requerir ${terms.depositLabel.toLowerCase()}`}</Label>
                    <p className="text-sm text-muted-foreground">
                      {`Los ${businessConfig.clientLabelPlural.toLowerCase()} deberán pagar un porcentaje ${terms.serviceSingular === 'Servicio' ? 'del servicio' : `de ${terms.serviceSingular.toLowerCase()}`} para confirmar`}
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
                        {`Porcentaje de ${terms.depositLabel.toLowerCase()}`}
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
                        {`Ejemplo: Si ${terms.serviceSingular === 'Servicio' ? 'un servicio' : `una ${terms.serviceSingular.toLowerCase()}`} cuesta $10.000 y ${terms.depositLabel.toLowerCase() === 'seña' ? 'la seña' : `el ${terms.depositLabel.toLowerCase()}`} es 30%, se paga $3.000 al ${terms.bookingVerb}`}
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
          </div>
        </TabsContent>

        {/* ─────────────────────────────────────────────────── */}
        {/* TAB: APARIENCIA                                    */}
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

                  {/* Separator */}
                  <div className="border-t border-dashed border-slate-200 dark:border-neutral-700" />

                  {/* Hero Text Tone */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Tono del texto del encabezado</Label>
                      <p className="text-xs text-muted-foreground">Elige si el texto sobre la portada debe ser claro (blanco) u oscuro (negro). Útil cuando la foto de portada no combina con el tono automático.</p>
                    </div>
                    <div className="flex gap-2">
                      {([
                        { value: 'auto' as const, label: 'Automático', desc: 'Según el estilo' },
                        { value: 'light' as const, label: 'Claro', desc: 'Texto blanco' },
                        { value: 'dark' as const, label: 'Oscuro', desc: 'Texto negro' },
                      ]).map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setThemeSettings({ ...themeSettings, heroTextTone: option.value })}
                          className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${
                            themeSettings.heroTextTone === option.value
                              ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30 ring-2 ring-teal-500/20'
                              : 'border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600'
                          }`}
                        >
                          {/* Preview "Aa" */}
                          <div className={`w-full h-10 rounded flex items-center justify-center text-lg font-bold ${
                            option.value === 'light'
                              ? 'bg-slate-800 text-white'
                              : option.value === 'dark'
                              ? 'bg-slate-100 text-slate-900'
                              : 'bg-gradient-to-r from-slate-700 to-slate-300 text-white'
                          }`}>
                            Aa
                          </div>
                          <span className={`text-xs font-medium ${themeSettings.heroTextTone === option.value ? 'text-teal-700 dark:text-teal-300' : 'text-slate-700 dark:text-neutral-300'}`}>{option.label}</span>
                          <span className="text-[10px] text-muted-foreground">{option.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hero Trust Badges Tone */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Tono de los badges de confianza</Label>
                      <p className="text-xs text-muted-foreground">Color del texto de la franja inferior del encabezado. Útil si el fundido los opaca.</p>
                    </div>
                    {/* Visual reference: mini hero mockup showing which part changes */}
                    <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-neutral-700">
                      <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 px-4 pt-4 pb-0">
                        {/* Fake title + desc (dimmed, not the focus) */}
                        <div className="w-24 h-2 rounded-full bg-white/30 mb-1.5" />
                        <div className="w-36 h-1.5 rounded-full bg-white/15 mb-3" />
                        {/* Trust badges row — THE PART WE'RE CHANGING */}
                        <div className={`flex items-center justify-center gap-3 border-t border-white/10 py-2.5 text-[10px] font-medium ${
                          themeSettings.heroTrustTone === 'dark'
                            ? 'text-slate-900'
                            : themeSettings.heroTrustTone === 'light'
                            ? 'text-white/85'
                            : 'text-white/60'
                        }`}>
                          <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-amber-400" />Inmediato</span>
                          <span className="text-white/20">|</span>
                          <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-emerald-400" />Seguro</span>
                          <span className="text-white/20">|</span>
                          <span className="flex items-center gap-1"><Heart className="h-3 w-3 text-pink-400" />Garantizado</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {([
                        { value: 'auto' as const, label: 'Automático', desc: 'Igual al título' },
                        { value: 'light' as const, label: 'Claro', desc: 'Texto blanco' },
                        { value: 'dark' as const, label: 'Oscuro', desc: 'Texto negro' },
                      ]).map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setThemeSettings({ ...themeSettings, heroTrustTone: option.value })}
                          className={`flex-1 flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 transition-all ${
                            themeSettings.heroTrustTone === option.value
                              ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30 ring-2 ring-teal-500/20'
                              : 'border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600'
                          }`}
                        >
                          <span className={`text-xs font-medium ${themeSettings.heroTrustTone === option.value ? 'text-teal-700 dark:text-teal-300' : 'text-slate-700 dark:text-neutral-300'}`}>{option.label}</span>
                          <span className="text-[10px] text-muted-foreground">{option.desc}</span>
                        </button>
                      ))}
                    </div>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                    <Label className="text-base font-medium">
                      {isCatalogRubro ? 'Estilo de tarjetas de productos' : 'Estilo de tarjetas de servicios'}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isCatalogRubro
                        ? 'Elige cómo se ven las tarjetas de tus productos en el catálogo. Cada estilo cambia la forma, botones y disposición de la tarjeta.'
                        : 'Elige cómo se ven las tarjetas de tus servicios. Cada estilo cambia la forma, botones y disposición de la tarjeta.'}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                        isCatalogRubro ? (
                          <ProductCardStylePreview
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
                      )
                    ))}
                  </div>
                </div>

                {/* Mobile Columns Selector */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Columnas en móvil</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Elegí cómo se muestran los productos en celulares y tablets
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { v: 1 as const, label: '1 columna', desc: 'Tarjetas grandes con más detalle', icon: '▮' },
                      { v: 2 as const, label: '2 columnas', desc: 'Grilla compacta, más productos visibles', icon: '▮▮' },
                    ]).map(({ v, label, desc, icon }) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setThemeSettings({ ...themeSettings, mobileColumns: v })}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          themeSettings.mobileColumns === v
                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                            : 'border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600'
                        }`}
                      >
                        <div className="text-2xl mb-2 tracking-[0.15em]">{icon}</div>
                        <span className="block font-semibold text-sm">{label}</span>
                        <span className="block text-xs text-muted-foreground mt-0.5">{desc}</span>
                      </button>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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

        {/* ─────────────────────────────────────────────────── */}
        {/* TAB 5: SEO                                         */}
        {/* ─────────────────────────────────────────────────── */}
        <TabsContent value="seo">
          <SeoSection slug={tenant?.slug} />
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
      <div className="h-16 sm:hidden" />

      {/* Mobile floating action bar — sits above the bottom nav (h-16) */}
      <div className="fixed bottom-16 left-0 right-0 p-3 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-neutral-700 sm:hidden z-30">
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-11 bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white/90 shadow-lg text-sm font-semibold"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar
          </Button>
          <Link href={`/${formData.slug || tenant?.slug}`} target="_blank" className="flex-1">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 text-sm font-semibold border-slate-300 dark:border-neutral-600"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Ver página
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
