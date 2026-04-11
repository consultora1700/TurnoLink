'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import {
  Save,
  Loader2,
  Palette,
  Type,
  Image as ImageIcon,
  Settings2,
  Eye,
  Globe,
  Store,
  Layout,
  LayoutGrid,
  Megaphone,
  UserCircle,
  Search,
  Filter,
  MessageCircle,
  Check,
  Sparkles,
  Sun,
  ImagePlus,
  Trash2,
  GripVertical,
  Link2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createApiClient, TenantBranding, Tenant } from '@/lib/api';
import { notifications, handleApiError } from '@/lib/notifications';
import { ImageUpload } from '@/components/ui/image-upload';
import { ColorPicker } from '@/components/ui/color-picker';
import {
  StoreHeroPreview,
  StoreCardPreview,
  STORE_HERO_STYLES,
  STORE_CARD_STYLES,
  PROFILE_PHOTO_STYLES,
  type StoreHeroStyle,
  type StoreCardStyle,
  type ProfilePhotoStyle,
} from '@/components/storefront/store-style-previews';
import { AnnouncementBarPreview } from '@/components/storefront/announcement-bar';

const FONT_OPTIONS = [
  'Inter',
  'Poppins',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Nunito',
  'Raleway',
  'Playfair Display',
  'DM Sans',
];

const BG_STYLES = [
  { value: 'minimal', label: 'Minimal', desc: 'Limpio y simple' },
  { value: 'modern', label: 'Moderno', desc: 'Formas geométricas' },
  { value: 'elegant', label: 'Elegante', desc: 'Sutil y sofisticado' },
  { value: 'fresh', label: 'Fresco', desc: 'Colores vivos' },
  { value: 'vibrant', label: 'Vibrante', desc: 'Llamativo y colorido' },
];

export default function MiTiendaPage() {
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [branding, setBranding] = useState<TenantBranding | null>(null);
  const [activeSection, setActiveSection] = useState('identidad');

  // Form state
  const [form, setForm] = useState({
    // Identity & Colors
    primaryColor: '#F59E0B',
    secondaryColor: '#8B5CF6',
    accentColor: '#F59E0B',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    fontFamily: 'Inter',
    headingFontFamily: 'Inter',
    // Images
    logoUrl: '',
    coverImageUrl: '',
    bannerImageUrl: '',
    faviconUrl: '',
    // Texts
    welcomeTitle: '',
    welcomeSubtitle: '',
    footerText: '',
    // SEO
    metaTitle: '',
    metaDescription: '',
    // Store Config
    showPrices: true,
    showStock: true,
    enableWishlist: false,
    enableReviews: false,
    storeEnabled: true,
    backgroundStyle: 'modern',
    // Store Visual Customization
    storeHeroStyle: 'classic' as StoreHeroStyle,
    storeCardStyle: 'standard' as StoreCardStyle,
    profilePhotoStyle: 'round' as ProfilePhotoStyle,
    announcementEnabled: false,
    announcementText: '',
    announcementBgColor: '#000000',
    announcementTextColor: '#FFFFFF',
    announcementSpeed: 'normal' as 'slow' | 'normal' | 'fast',
    showCategoryFilter: true,
    showSearchBar: true,
    showWhatsappButton: true,
    // Advanced customization
    buttonStyle: 'pill',
    buttonText: 'Consultar',
    cardBorderRadius: 'lg',
    imageAspectRatio: 'square',
    heroHeight: 'medium',
    heroOverlay: 'gradient',
    mobileColumns: 2,
    priceStyle: 'default',
    categoryStyle: 'pills',
    // Logo Scale
    logoScale: 1.0,
    logoOffsetX: 0,
    logoOffsetY: 0,
    // Logo Glow
    logoGlowEnabled: false,
    logoGlowColor: '#6366f1',
    logoGlowIntensity: 'medium' as 'subtle' | 'medium' | 'strong',
    // Background Effects
    backgroundEffect: 'none',
    backgroundEffectColor: '#6366f1',
    backgroundEffectOpacity: 0.15,
    // Page Gradient
    gradientEnabled: false,
    gradientFrom: '#ffffff',
    gradientTo: '#111827',
    gradientStyle: 'fade' as 'fade' | 'immersive',
    // Carousel
    carouselImages: [] as Array<{ url: string; linkUrl?: string; order: number }>,
  });

  const getApi = () => {
    if (!session?.accessToken) throw new Error('No session');
    return createApiClient(session.accessToken as string);
  };

  // ─── Load ─────────────────────────────────────────────────
  useEffect(() => {
    if (!session?.accessToken) return;

    const api = createApiClient(session.accessToken as string);

    const load = async () => {
      try {
        const [brandingRes, tenantRes] = await Promise.all([
          api.getBranding(),
          api.getTenant(),
        ]);
        setBranding(brandingRes);
        setTenant(tenantRes);

        setForm({
          primaryColor: brandingRes.primaryColor || '#F59E0B',
          secondaryColor: brandingRes.secondaryColor || '#8B5CF6',
          accentColor: brandingRes.accentColor || '#F59E0B',
          backgroundColor: brandingRes.backgroundColor || '#FFFFFF',
          textColor: brandingRes.textColor || '#1F2937',
          fontFamily: brandingRes.fontFamily || 'Inter',
          headingFontFamily: brandingRes.headingFontFamily || 'Inter',
          logoUrl: brandingRes.logoUrl || '',
          coverImageUrl: brandingRes.coverImageUrl || '',
          bannerImageUrl: brandingRes.bannerImageUrl || '',
          faviconUrl: brandingRes.faviconUrl || '',
          welcomeTitle: brandingRes.welcomeTitle || '',
          welcomeSubtitle: brandingRes.welcomeSubtitle || '',
          footerText: brandingRes.footerText || '',
          metaTitle: brandingRes.metaTitle || '',
          metaDescription: brandingRes.metaDescription || '',
          showPrices: brandingRes.showPrices ?? true,
          showStock: brandingRes.showStock ?? true,
          enableWishlist: brandingRes.enableWishlist ?? false,
          enableReviews: brandingRes.enableReviews ?? false,
          storeEnabled: brandingRes.storeEnabled ?? true,
          backgroundStyle: brandingRes.backgroundStyle || 'modern',
          storeHeroStyle: (brandingRes.storeHeroStyle as StoreHeroStyle) || 'classic',
          storeCardStyle: (brandingRes.storeCardStyle as StoreCardStyle) || 'standard',
          profilePhotoStyle: (brandingRes.profilePhotoStyle as ProfilePhotoStyle) || 'round',
          announcementEnabled: brandingRes.announcementEnabled ?? false,
          announcementText: brandingRes.announcementText || '',
          announcementBgColor: brandingRes.announcementBgColor || '#000000',
          announcementTextColor: brandingRes.announcementTextColor || '#FFFFFF',
          announcementSpeed: (brandingRes.announcementSpeed as 'slow' | 'normal' | 'fast') || 'normal',
          showCategoryFilter: brandingRes.showCategoryFilter ?? true,
          showSearchBar: brandingRes.showSearchBar ?? true,
          showWhatsappButton: brandingRes.showWhatsappButton ?? true,
          buttonStyle: brandingRes.buttonStyle || 'pill',
          buttonText: brandingRes.buttonText || 'Consultar',
          cardBorderRadius: brandingRes.cardBorderRadius || 'lg',
          imageAspectRatio: brandingRes.imageAspectRatio || 'square',
          heroHeight: brandingRes.heroHeight || 'medium',
          heroOverlay: brandingRes.heroOverlay || 'gradient',
          mobileColumns: brandingRes.mobileColumns ?? 2,
          priceStyle: brandingRes.priceStyle || 'default',
          categoryStyle: brandingRes.categoryStyle || 'pills',
          logoScale: brandingRes.logoScale ?? 1.0,
          logoOffsetX: brandingRes.logoOffsetX ?? 0,
          logoOffsetY: brandingRes.logoOffsetY ?? 0,
          logoGlowEnabled: brandingRes.logoGlowEnabled ?? false,
          logoGlowColor: brandingRes.logoGlowColor || '#6366f1',
          logoGlowIntensity: (brandingRes.logoGlowIntensity as 'subtle' | 'medium' | 'strong') || 'medium',
          backgroundEffect: brandingRes.backgroundEffect || 'none',
          backgroundEffectColor: brandingRes.backgroundEffectColor || '#6366f1',
          backgroundEffectOpacity: brandingRes.backgroundEffectOpacity ?? 0.15,
          gradientEnabled: brandingRes.gradientEnabled ?? false,
          gradientFrom: brandingRes.gradientFrom || '#ffffff',
          gradientTo: brandingRes.gradientTo || '#111827',
          gradientStyle: (brandingRes as any).gradientStyle || 'fade',
          carouselImages: (brandingRes.carouselImages as Array<{ url: string; linkUrl?: string; order: number }>) || [],
        });
      } catch (error) {
        handleApiError(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [session?.accessToken]);

  // ─── Save ─────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const api = getApi();
      const updated = await api.updateBranding({
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
        accentColor: form.accentColor,
        backgroundColor: form.backgroundColor,
        textColor: form.textColor,
        fontFamily: form.fontFamily,
        headingFontFamily: form.headingFontFamily,
        logoUrl: form.logoUrl || null,
        coverImageUrl: form.coverImageUrl || null,
        bannerImageUrl: form.bannerImageUrl || null,
        faviconUrl: form.faviconUrl || null,
        welcomeTitle: form.welcomeTitle || null,
        welcomeSubtitle: form.welcomeSubtitle || null,
        footerText: form.footerText || null,
        metaTitle: form.metaTitle || null,
        metaDescription: form.metaDescription || null,
        showPrices: form.showPrices,
        showStock: form.showStock,
        enableWishlist: form.enableWishlist,
        enableReviews: form.enableReviews,
        storeEnabled: form.storeEnabled,
        backgroundStyle: form.backgroundStyle,
        storeHeroStyle: form.storeHeroStyle,
        storeCardStyle: form.storeCardStyle,
        profilePhotoStyle: form.profilePhotoStyle,
        announcementEnabled: form.announcementEnabled,
        announcementText: form.announcementText || null,
        announcementBgColor: form.announcementBgColor,
        announcementTextColor: form.announcementTextColor,
        announcementSpeed: form.announcementSpeed,
        showCategoryFilter: form.showCategoryFilter,
        showSearchBar: form.showSearchBar,
        showWhatsappButton: form.showWhatsappButton,
        buttonStyle: form.buttonStyle,
        buttonText: form.buttonText,
        cardBorderRadius: form.cardBorderRadius,
        imageAspectRatio: form.imageAspectRatio,
        heroHeight: form.heroHeight,
        heroOverlay: form.heroOverlay,
        mobileColumns: form.mobileColumns,
        priceStyle: form.priceStyle,
        categoryStyle: form.categoryStyle,
        logoScale: form.logoScale,
        logoOffsetX: form.logoOffsetX,
        logoOffsetY: form.logoOffsetY,
        logoGlowEnabled: form.logoGlowEnabled,
        logoGlowColor: form.logoGlowColor,
        logoGlowIntensity: form.logoGlowIntensity,
        backgroundEffect: form.backgroundEffect,
        backgroundEffectColor: form.backgroundEffectColor,
        backgroundEffectOpacity: form.backgroundEffectOpacity,
        gradientEnabled: form.gradientEnabled,
        gradientFrom: form.gradientFrom,
        gradientTo: form.gradientTo,
        gradientStyle: form.gradientStyle,
        carouselImages: form.carouselImages,
      } as Partial<TenantBranding>);
      setBranding(updated);
      notifications.settingsSaved();

      // Purge ISR cache for immediate refresh on public page
      const activeSlug = tenant?.slug;
      if (activeSlug) {
        const revalidateOnce = () =>
          fetch('/api/revalidate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: `/${activeSlug}` }),
          }).catch(() => {});
        revalidateOnce();
        setTimeout(revalidateOnce, 200);
        setTimeout(revalidateOnce, 500);
        setTimeout(revalidateOnce, 1000);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadMedia = async (file: File) => {
    const api = getApi();
    return await api.uploadMedia(file, 'branding');
  };

  const updateForm = (key: string, value: string | boolean | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Toggle helper
  const Toggle = ({ checked, onChange, label, description, icon: Icon }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
    description?: string;
    icon?: React.ElementType;
  }) => (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2.5">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground shrink-0" />}
        <div>
          <p className="text-sm font-medium">{label}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
          checked ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const SECTIONS = [
    { id: 'identidad', label: 'Identidad', icon: Palette },
    { id: 'estilos', label: 'Estilos', icon: Layout },
    { id: 'contenido', label: 'Contenido', icon: Type },
    { id: 'funciones', label: 'Funciones', icon: Settings2 },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">Mi Tienda</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Personalizá el aspecto y configuración de tu tienda online
          </p>
        </div>
        <div className="hidden sm:flex gap-2 shrink-0">
          {tenant?.slug && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => window.open(`/${tenant.slug}`, '_blank')}
            >
              <Eye className="h-4 w-4" />
              Ver tienda
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 bg-amber-500 hover:bg-amber-600 text-white"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>

      {/* ─── Section Navigation ─────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* IDENTIDAD — Colores, tipografía, imágenes         */}
      {/* ═══════════════════════════════════════════════════ */}
      {activeSection === 'identidad' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Colors */}
            <Card className="border-0 shadow-soft overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Palette className="h-3.5 w-3.5 text-white" />
                  </div>
                  Colores de marca
                </CardTitle>
                <CardDescription>Define la paleta de colores de tu tienda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ColorPicker
                    label="Color primario"
                    description="Botones y elementos principales"
                    value={form.primaryColor}
                    onChange={(v) => updateForm('primaryColor', v)}
                    presetType="primary"
                  />
                  <ColorPicker
                    label="Color secundario"
                    description="Acentos y detalles"
                    value={form.secondaryColor}
                    onChange={(v) => updateForm('secondaryColor', v)}
                    presetType="secondary"
                  />
                  <ColorPicker
                    label="Color de acento"
                    description="Badges y destacados"
                    value={form.accentColor}
                    onChange={(v) => updateForm('accentColor', v)}
                    presetType="accent"
                  />
                  <ColorPicker
                    label="Color de fondo"
                    description="Fondo de la tienda"
                    value={form.backgroundColor}
                    onChange={(v) => updateForm('backgroundColor', v)}
                    presetType="primary"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Typography */}
            <Card className="border-0 shadow-soft overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                    <Type className="h-3.5 w-3.5 text-white" />
                  </div>
                  Tipografía
                </CardTitle>
                <CardDescription>Elegí las fuentes que representan tu marca</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Fuente del cuerpo</Label>
                    <select
                      value={form.fontFamily}
                      onChange={(e) => updateForm('fontFamily', e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {FONT_OPTIONS.map((font) => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Fuente de títulos</Label>
                    <select
                      value={form.headingFontFamily}
                      onChange={(e) => updateForm('headingFontFamily', e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {FONT_OPTIONS.map((font) => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4 p-4 rounded-xl border bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-lg font-bold" style={{ fontFamily: form.headingFontFamily }}>
                    Así se ven los títulos
                  </p>
                  <p className="text-sm mt-1" style={{ fontFamily: form.fontFamily }}>
                    Y así se ve el texto del cuerpo. Los clientes verán tu tienda con estas fuentes.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card className="border-0 shadow-soft overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <ImageIcon className="h-3.5 w-3.5 text-white" />
                  </div>
                  Imágenes
                </CardTitle>
                <CardDescription>Logo, banner y portada de tu tienda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label className="mb-2 block">Logo</Label>
                    <ImageUpload
                      value={form.logoUrl}
                      onChange={(url) => updateForm('logoUrl', url)}
                      onUpload={handleUploadMedia}
                      aspectRatio="square"
                      placeholder="Logo de tu tienda"
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Favicon</Label>
                    <ImageUpload
                      value={form.faviconUrl}
                      onChange={(url) => updateForm('faviconUrl', url)}
                      onUpload={handleUploadMedia}
                      aspectRatio="square"
                      placeholder="Icono de pestaña"
                    />
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Banner principal</Label>
                  <ImageUpload
                    value={form.bannerImageUrl}
                    onChange={(url) => updateForm('bannerImageUrl', url)}
                    onUpload={handleUploadMedia}
                    aspectRatio="banner"
                    placeholder="Banner principal de tu tienda (3:1)"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Imagen de portada</Label>
                  <ImageUpload
                    value={form.coverImageUrl}
                    onChange={(url) => updateForm('coverImageUrl', url)}
                    onUpload={handleUploadMedia}
                    aspectRatio="video"
                    placeholder="Imagen de fondo o portada (16:9)"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar — Live Preview */}
          <div className="space-y-6">
            <Card className="border-0 shadow-soft sticky top-4">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4 text-amber-500" />
                  Vista previa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl overflow-hidden border shadow-sm" style={{ backgroundColor: form.backgroundColor }}>
                  {/* Announcement bar preview */}
                  {form.announcementEnabled && form.announcementText && (
                    <AnnouncementBarPreview
                      text={form.announcementText}
                      bgColor={form.announcementBgColor}
                      textColor={form.announcementTextColor}
                    />
                  )}

                  {/* Mini banner */}
                  {form.bannerImageUrl ? (
                    <div className="h-14 bg-slate-200 relative">
                      <Image src={form.bannerImageUrl} alt="Banner" fill sizes="400px" className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                  ) : (
                    <div className="h-14" style={{ background: `linear-gradient(135deg, ${form.primaryColor}, ${form.secondaryColor})` }} />
                  )}

                  <div className="p-3">
                    {/* Logo + title */}
                    <div className="flex items-center gap-2 mb-3 -mt-5">
                      {form.profilePhotoStyle !== 'none' && (
                        form.logoUrl ? (
                          <div className={`relative h-9 w-9 overflow-hidden border-2 border-white shadow-sm ${
                            form.profilePhotoStyle === 'round' ? 'rounded-full' : 'rounded-lg'
                          }`}>
                            <Image src={form.logoUrl} alt="Logo" fill sizes="36px" className="object-cover" />
                          </div>
                        ) : (
                          <div
                            className={`h-9 w-9 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm ${
                              form.profilePhotoStyle === 'round' ? 'rounded-full' : 'rounded-lg'
                            }`}
                            style={{ backgroundColor: form.primaryColor }}
                          >
                            {(tenant?.name || 'T')[0]}
                          </div>
                        )
                      )}
                      <div className="min-w-0">
                        <p
                          className="font-bold text-xs truncate"
                          style={{ fontFamily: form.headingFontFamily, color: form.textColor }}
                        >
                          {form.welcomeTitle || tenant?.name || 'Mi Tienda'}
                        </p>
                        {form.welcomeSubtitle && (
                          <p className="text-[9px] text-slate-500 truncate">{form.welcomeSubtitle}</p>
                        )}
                      </div>
                    </div>

                    {/* Search bar preview */}
                    {form.showSearchBar && (
                      <div className="flex items-center gap-1 mb-2 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700">
                        <Search className="h-2.5 w-2.5 text-slate-400" />
                        <div className="h-1 w-10 rounded-full bg-slate-300" />
                      </div>
                    )}

                    {/* Category pills preview */}
                    {form.showCategoryFilter && (
                      <div className="flex gap-1 mb-2">
                        <div className="h-3.5 px-2 rounded-full text-white flex items-center" style={{ backgroundColor: form.primaryColor }}>
                          <div className="h-0.5 w-4 rounded-full bg-white/80" />
                        </div>
                        <div className="h-3.5 px-2 rounded-full bg-slate-100 dark:bg-slate-700">
                          <div className="h-0.5 w-4 rounded-full bg-slate-300 mt-1.5" />
                        </div>
                      </div>
                    )}

                    {/* Mini product cards */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {[1, 2].map((i) => (
                        <div key={i} className={`overflow-hidden bg-white dark:bg-slate-800 ${
                          form.storeCardStyle === 'rounded' ? 'rounded-2xl shadow-sm' :
                          form.storeCardStyle === 'minimal' ? '' :
                          form.storeCardStyle === 'editorial' ? 'rounded-lg relative' :
                          'rounded-lg border'
                        }`}>
                          <div className={`bg-slate-100 dark:bg-slate-700 ${
                            form.storeCardStyle === 'editorial' ? 'aspect-[3/4]' :
                            form.storeCardStyle === 'detailed' ? 'aspect-video' :
                            'aspect-square'
                          }`}>
                            {form.storeCardStyle === 'editorial' && (
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                                <div className="h-1 w-8 rounded-full bg-white/90" />
                                <div className="h-0.5 w-5 rounded-full bg-white/60 mt-0.5" />
                              </div>
                            )}
                          </div>
                          {form.storeCardStyle !== 'editorial' && (
                            <div className="p-1.5 space-y-0.5">
                              <p className="text-[9px] truncate" style={{ fontFamily: form.fontFamily, color: form.textColor }}>
                                Producto {i}
                              </p>
                              {form.showPrices && (
                                <p className="text-[9px] font-bold" style={{ color: form.primaryColor }}>
                                  $1.990
                                </p>
                              )}
                              {form.storeCardStyle === 'rounded' && (
                                <div className="h-3 rounded-full mt-0.5" style={{ backgroundColor: `${form.primaryColor}15` }}>
                                  <div className="h-[3px] w-4 mx-auto pt-[3px] rounded-full" style={{ backgroundColor: form.primaryColor }} />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* WhatsApp button preview */}
                    {form.showWhatsappButton && (
                      <div className="mt-2 flex items-center justify-center gap-1 text-[9px] font-medium py-1 rounded-lg text-white bg-green-500">
                        <MessageCircle className="h-2.5 w-2.5" />
                        Consultar
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* ESTILOS — Hero, cards, foto de perfil, marquee     */}
      {/* ═══════════════════════════════════════════════════ */}
      {activeSection === 'estilos' && (
        <div className="space-y-6">
          {/* Hero Style */}
          <Card className="border-0 shadow-soft overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                  <Layout className="h-3.5 w-3.5 text-white" />
                </div>
                Estilo del encabezado
              </CardTitle>
              <CardDescription>Elegí cómo se ve la parte superior de tu tienda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {STORE_HERO_STYLES.map((style) => (
                  <StoreHeroPreview
                    key={style.value}
                    style={style.value}
                    selected={form.storeHeroStyle === style.value}
                    onClick={() => updateForm('storeHeroStyle', style.value)}
                    primaryColor={form.primaryColor}
                    secondaryColor={form.secondaryColor}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Carousel Images — only shown when ecommerce hero */}
          {form.storeHeroStyle === 'ecommerce' && (
            <Card className="border-0 shadow-soft overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-orange-500 to-red-500" />
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <ImagePlus className="h-3.5 w-3.5 text-white" />
                  </div>
                  Banners del carrusel
                </CardTitle>
                <CardDescription>
                  Subí las imágenes que rotan en el hero de tu tienda. Recomendado: 1920x600 (desktop) o 1080x566 (mobile).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing carousel images */}
                {form.carouselImages.length > 0 && (
                  <div className="space-y-2">
                    {form.carouselImages
                      .sort((a, b) => a.order - b.order)
                      .map((img, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                          <GripVertical className="h-4 w-4 text-slate-400 shrink-0" />
                          <div className="relative h-14 w-24 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                            <Image src={img.url} alt={`Banner ${idx + 1}`} fill sizes="96px" className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
                              Banner {idx + 1}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Link2 className="h-3 w-3 text-slate-400 shrink-0" />
                              <input
                                type="text"
                                placeholder="URL de destino (opcional)"
                                value={img.linkUrl || ''}
                                onChange={(e) => {
                                  const updated = [...form.carouselImages];
                                  updated[idx] = { ...updated[idx], linkUrl: e.target.value };
                                  setForm(prev => ({ ...prev, carouselImages: updated }));
                                }}
                                className="flex-1 h-6 text-[11px] px-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = form.carouselImages.filter((_, i) => i !== idx);
                              // Reorder
                              const reordered = updated.map((item, i) => ({ ...item, order: i }));
                              setForm(prev => ({ ...prev, carouselImages: reordered }));
                            }}
                            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                  </div>
                )}

                {/* Upload new banner */}
                <ImageUpload
                  value=""
                  onChange={() => {}}
                  onUpload={async (file) => {
                    const { url } = await handleUploadMedia(file);
                    const newImg = { url, linkUrl: '', order: form.carouselImages.length };
                    setForm(prev => ({
                      ...prev,
                      carouselImages: [...prev.carouselImages, newImg],
                    }));
                    return { url };
                  }}
                  aspectRatio="banner"
                  placeholder={`Agregar banner ${form.carouselImages.length > 0 ? `(${form.carouselImages.length} cargados)` : ''}`}
                />

                {form.carouselImages.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Sin banners de carrusel. Se usará la imagen de banner principal como fallback.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Card Style */}
          <Card className="border-0 shadow-soft overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <LayoutGrid className="h-3.5 w-3.5 text-white" />
                </div>
                Estilo de tarjetas de producto
              </CardTitle>
              <CardDescription>Define cómo se muestran los productos en la grilla</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {STORE_CARD_STYLES.map((style) => (
                  <StoreCardPreview
                    key={style.value}
                    style={style.value}
                    selected={form.storeCardStyle === style.value}
                    onClick={() => updateForm('storeCardStyle', style.value)}
                    primaryColor={form.primaryColor}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Profile Photo Style */}
          <Card className="border-0 shadow-soft overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-pink-500 to-rose-500" />
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <UserCircle className="h-3.5 w-3.5 text-white" />
                </div>
                Foto de perfil
              </CardTitle>
              <CardDescription>Forma y visibilidad del logo en el encabezado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {PROFILE_PHOTO_STYLES.map((style) => {
                  const isSelected = form.profilePhotoStyle === style.value;
                  return (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() => updateForm('profilePhotoStyle', style.value)}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-amber-500 flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                      {/* Preview shape */}
                      {style.value === 'none' ? (
                        <div className="h-10 w-10 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">–</span>
                        </div>
                      ) : (
                        <div
                          className={`h-10 w-10 flex items-center justify-center text-white text-sm font-bold ${
                            style.value === 'round' ? 'rounded-full' : 'rounded-xl'
                          }`}
                          style={{ backgroundColor: form.primaryColor }}
                        >
                          {(tenant?.name || 'T')[0]}
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-xs font-semibold">{style.label}</p>
                        <p className="text-[10px] text-muted-foreground">{style.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Logo Scale / Zoom */}
              {form.profilePhotoStyle !== 'none' && (
                <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium">Zoom de la imagen</label>
                    <span className="text-xs font-mono text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {Math.round(form.logoScale * 100)}%
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
                      max="2"
                      step="0.05"
                      value={form.logoScale}
                      onChange={(e) => updateForm('logoScale', parseFloat(e.target.value))}
                      className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-amber-500 bg-slate-200 dark:bg-slate-700"
                    />
                    <span className="text-[10px] text-muted-foreground w-8">200%</span>
                  </div>
                  {/* Position controls — only when zoomed in */}
                  {form.logoScale > 1 && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-muted-foreground w-10 text-right">← Izq</span>
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          step="1"
                          value={form.logoOffsetX}
                          onChange={(e) => updateForm('logoOffsetX', parseFloat(e.target.value))}
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
                          value={form.logoOffsetY}
                          onChange={(e) => updateForm('logoOffsetY', parseFloat(e.target.value))}
                          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-blue-500 bg-slate-200 dark:bg-slate-700"
                        />
                        <span className="text-[10px] text-muted-foreground w-10">Abj ↓</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => { updateForm('logoOffsetX', 0); updateForm('logoOffsetY', 0); }}
                        className="text-[10px] text-blue-500 hover:underline"
                      >
                        Centrar
                      </button>
                    </div>
                  )}
                  {/* Live preview — zoom + position inside fixed frame */}
                  <div className="mt-4 flex items-center justify-center">
                    <div className={`w-16 h-16 overflow-hidden border-2 border-slate-200 dark:border-slate-600 shadow-sm ${
                      form.profilePhotoStyle === 'round' ? 'rounded-full' : 'rounded-xl'
                    }`}>
                      {form.logoUrl ? (
                        <img
                          src={form.logoUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          style={(form.logoScale !== 1 || form.logoOffsetX !== 0 || form.logoOffsetY !== 0)
                            ? { transform: `scale(${form.logoScale}) translate(${form.logoOffsetX}%, ${form.logoOffsetY}%)`, transformOrigin: 'center' }
                            : undefined}
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: form.primaryColor, fontSize: 16 }}
                        >
                          {(tenant?.name || 'T')[0]}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Background Style */}
          <Card className="border-0 shadow-soft overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-slate-500 to-slate-600" />
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
                  <Store className="h-3.5 w-3.5 text-white" />
                </div>
                Estilo de fondo
              </CardTitle>
              <CardDescription>Decoración visual del fondo de la tienda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {BG_STYLES.map((style) => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => updateForm('backgroundStyle', style.value)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      form.backgroundStyle === style.value
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <p className="text-xs font-semibold">{style.label}</p>
                    <p className="text-[10px] text-muted-foreground">{style.desc}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Announcement Bar */}
          <Card className="border-0 shadow-soft overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-500 to-yellow-500" />
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                  <Megaphone className="h-3.5 w-3.5 text-white" />
                </div>
                Barra de anuncios
              </CardTitle>
              <CardDescription>
                Texto que se desplaza en la parte superior de tu tienda. Ideal para promociones, envío gratis, etc.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Toggle
                checked={form.announcementEnabled}
                onChange={(v) => updateForm('announcementEnabled', v)}
                label="Activar barra de anuncios"
                description="Muestra un texto animado en la parte superior"
              />

              {form.announcementEnabled && (
                <div className="space-y-4 pt-2">
                  {!form.announcementText?.trim() && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400">
                      <Megaphone className="h-4 w-4 shrink-0" />
                      <p className="text-xs">La barra está activada pero no tiene texto. Escribí un mensaje para que aparezca en tu tienda.</p>
                    </div>
                  )}
                  <div>
                    <Label>Texto del anuncio</Label>
                    <Input
                      value={form.announcementText}
                      onChange={(e) => updateForm('announcementText', e.target.value)}
                      placeholder="Ej: ENVÍO GRATIS en compras mayores a $15.000"
                      maxLength={200}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Color de fondo</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="color"
                          value={form.announcementBgColor}
                          onChange={(e) => updateForm('announcementBgColor', e.target.value)}
                          className="h-8 w-8 rounded cursor-pointer border-0"
                        />
                        <Input
                          value={form.announcementBgColor}
                          onChange={(e) => updateForm('announcementBgColor', e.target.value)}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Color del texto</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="color"
                          value={form.announcementTextColor}
                          onChange={(e) => updateForm('announcementTextColor', e.target.value)}
                          className="h-8 w-8 rounded cursor-pointer border-0"
                        />
                        <Input
                          value={form.announcementTextColor}
                          onChange={(e) => updateForm('announcementTextColor', e.target.value)}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Velocidad</Label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {(['slow', 'normal', 'fast'] as const).map((speed) => (
                        <button
                          key={speed}
                          type="button"
                          onClick={() => updateForm('announcementSpeed', speed)}
                          className={`py-2 rounded-lg border text-xs font-medium transition-all ${
                            form.announcementSpeed === speed
                              ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                              : 'border-slate-200 dark:border-slate-700 text-muted-foreground hover:border-slate-300'
                          }`}
                        >
                          {speed === 'slow' ? 'Lenta' : speed === 'normal' ? 'Normal' : 'Rápida'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  {form.announcementText && (
                    <div>
                      <Label className="text-xs mb-1 block">Vista previa</Label>
                      <AnnouncementBarPreview
                        text={form.announcementText}
                        bgColor={form.announcementBgColor}
                        textColor={form.announcementTextColor}
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Advanced Customization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings2 className="h-5 w-5 text-amber-500" />
                Personalización avanzada
              </CardTitle>
              <CardDescription>Controles finos para mobile y desktop</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Hero Height */}
              <div>
                <Label className="text-xs mb-2 block">Altura del hero</Label>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    { v: 'compact', l: 'Compacto' },
                    { v: 'medium', l: 'Medio' },
                    { v: 'tall', l: 'Alto' },
                    { v: 'full', l: 'Pantalla' },
                  ] as const).map(({ v, l }) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => updateForm('heroHeight', v)}
                      className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                        form.heroHeight === v
                          ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hero Overlay */}
              <div>
                <Label className="text-xs mb-2 block">Overlay del hero</Label>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    { v: 'gradient', l: 'Gradiente' },
                    { v: 'solid', l: 'Sólido' },
                    { v: 'blur', l: 'Blur' },
                    { v: 'none', l: 'Sin' },
                  ] as const).map(({ v, l }) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => updateForm('heroOverlay', v)}
                      className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                        form.heroOverlay === v
                          ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Button Style */}
              <div>
                <Label className="text-xs mb-2 block">Estilo de botones</Label>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    { v: 'pill', l: 'Pill' },
                    { v: 'rounded', l: 'Redondeado' },
                    { v: 'square', l: 'Cuadrado' },
                    { v: 'ghost', l: 'Ghost' },
                  ] as const).map(({ v, l }) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => updateForm('buttonStyle', v)}
                      className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                        form.buttonStyle === v
                          ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Button Text */}
              <div>
                <Label className="text-xs mb-1.5 block">Texto del botón CTA</Label>
                <Input
                  value={form.buttonText}
                  onChange={(e) => updateForm('buttonText', e.target.value)}
                  placeholder="Consultar"
                  maxLength={30}
                  className="h-9"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Ej: Consultar, Comprar, Ver más, Lo quiero</p>
              </div>

              {/* Card Border Radius */}
              <div>
                <Label className="text-xs mb-2 block">Redondeo de tarjetas</Label>
                <div className="grid grid-cols-5 gap-2">
                  {([
                    { v: 'sm', l: 'Sutil' },
                    { v: 'md', l: 'Medio' },
                    { v: 'lg', l: 'Grande' },
                    { v: 'xl', l: 'XL' },
                    { v: '2xl', l: '2XL' },
                  ] as const).map(({ v, l }) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => updateForm('cardBorderRadius', v)}
                      className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                        form.cardBorderRadius === v
                          ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Aspect Ratio */}
              <div>
                <Label className="text-xs mb-2 block">Proporción de imagen</Label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { v: 'square', l: 'Cuadrada', icon: '1:1' },
                    { v: 'portrait', l: 'Vertical', icon: '3:4' },
                    { v: 'landscape', l: 'Horizontal', icon: '16:9' },
                  ] as const).map(({ v, l, icon }) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => updateForm('imageAspectRatio', v)}
                      className={`py-2.5 text-xs font-medium rounded-lg border transition-all flex flex-col items-center gap-1 ${
                        form.imageAspectRatio === v
                          ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-[10px] font-mono opacity-60">{icon}</span>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Columns */}
              <div>
                <Label className="text-xs mb-2 block">Columnas en mobile</Label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { v: 1, l: '1 columna', desc: 'Tarjetas grandes' },
                    { v: 2, l: '2 columnas', desc: 'Más productos visibles' },
                  ] as const).map(({ v, l, desc }) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => updateForm('mobileColumns', v)}
                      className={`py-2.5 text-xs font-medium rounded-lg border transition-all text-left px-3 ${
                        form.mobileColumns === v
                          ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="block font-semibold">{l}</span>
                      <span className="text-[10px] opacity-60">{desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Style */}
              <div>
                <Label className="text-xs mb-2 block">Estilo de precios</Label>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    { v: 'default', l: 'Normal' },
                    { v: 'badge', l: 'Badge' },
                    { v: 'highlight', l: 'Destacado' },
                    { v: 'minimal', l: 'Minimal' },
                  ] as const).map(({ v, l }) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => updateForm('priceStyle', v)}
                      className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                        form.priceStyle === v
                          ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Style */}
              <div>
                <Label className="text-xs mb-2 block">Estilo de categorías</Label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { v: 'pills', l: 'Pills' },
                    { v: 'underline', l: 'Subrayado' },
                    { v: 'cards', l: 'Cards' },
                  ] as const).map(({ v, l }) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => updateForm('categoryStyle', v)}
                      className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                        form.categoryStyle === v
                          ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logo Glow */}
          <Card className="border-0 shadow-soft overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <Sun className="h-3.5 w-3.5 text-white" />
                </div>
                Luz del logo
              </CardTitle>
              <CardDescription>Agregá un resplandor detrás del logo para que destaque</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Toggle
                checked={form.logoGlowEnabled}
                onChange={(v) => updateForm('logoGlowEnabled', v)}
                label="Activar luz del logo"
                description="Muestra un brillo detrás del logo en el encabezado"
              />

              {form.logoGlowEnabled && (
                <div className="space-y-4 pt-2">
                  <div>
                    <Label className="text-xs">Color de la luz</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={form.logoGlowColor}
                        onChange={(e) => updateForm('logoGlowColor', e.target.value)}
                        className="h-8 w-8 rounded cursor-pointer border-0"
                      />
                      <Input
                        value={form.logoGlowColor}
                        onChange={(e) => updateForm('logoGlowColor', e.target.value)}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs mb-2 block">Intensidad</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { v: 'subtle', l: 'Sutil' },
                        { v: 'medium', l: 'Media' },
                        { v: 'strong', l: 'Fuerte' },
                      ] as const).map(({ v, l }) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => updateForm('logoGlowIntensity', v)}
                          className={`py-2 rounded-lg border text-xs font-medium transition-all ${
                            form.logoGlowIntensity === v
                              ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                              : 'border-slate-200 dark:border-slate-700 text-muted-foreground hover:border-slate-300'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div>
                    <Label className="text-xs mb-2 block">Vista previa</Label>
                    <div className="flex items-center justify-center py-6 rounded-xl bg-slate-100 dark:bg-slate-800/50">
                      <div className="relative">
                        <div
                          className={`absolute rounded-full ${
                            form.logoGlowIntensity === 'subtle' ? '-inset-2 blur-md opacity-30' :
                            form.logoGlowIntensity === 'strong' ? '-inset-5 blur-2xl opacity-70' :
                            '-inset-3 blur-xl opacity-50'
                          }`}
                          style={{ backgroundColor: form.logoGlowColor }}
                        />
                        <div
                          className="relative h-14 w-14 rounded-full flex items-center justify-center text-white text-xl font-bold"
                          style={{ backgroundColor: form.primaryColor }}
                        >
                          {(tenant?.name || 'T')[0]}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Background Effects */}
          <Card className="border-0 shadow-soft overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                Efectos de fondo
              </CardTitle>
              <CardDescription>Efectos visuales animados en el fondo de tu tienda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs mb-2 block">Tipo de efecto</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {([
                    { v: 'none', l: 'Ninguno', icon: '—' },
                    { v: 'particles', l: 'Partículas', icon: '✦' },
                    { v: 'dots', l: 'Pulso', icon: '•' },
                    { v: 'grid', l: 'Neón Grid', icon: '▦' },
                    { v: 'waves', l: 'Oleaje', icon: '〰' },
                    { v: 'gradient-mesh', l: 'Lava', icon: '◎' },
                    { v: 'bokeh', l: 'Bokeh', icon: '○' },
                    { v: 'aurora', l: 'Aurora', icon: '◇' },
                  ] as const).map(({ v, l, icon }) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => updateForm('backgroundEffect', v)}
                      className={`py-2.5 rounded-lg border text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                        form.backgroundEffect === v
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                          : 'border-slate-200 dark:border-slate-700 text-muted-foreground hover:border-slate-300'
                      }`}
                    >
                      <span className="text-base">{icon}</span>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {form.backgroundEffect !== 'none' && (
                <div className="space-y-4 pt-2">
                  <div>
                    <Label className="text-xs">Color del efecto</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={form.backgroundEffectColor}
                        onChange={(e) => updateForm('backgroundEffectColor', e.target.value)}
                        className="h-8 w-8 rounded cursor-pointer border-0"
                      />
                      <Input
                        value={form.backgroundEffectColor}
                        onChange={(e) => updateForm('backgroundEffectColor', e.target.value)}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs mb-2 block">
                      Opacidad: {Math.round(form.backgroundEffectOpacity * 100)}%
                    </Label>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={Math.round(form.backgroundEffectOpacity * 100)}
                      onChange={(e) => updateForm('backgroundEffectOpacity', parseInt(e.target.value) / 100)}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>5%</span>
                      <span>50%</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Degradado de página ────────────────────────── */}
          <Card className="border-0 shadow-soft overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-slate-400 to-slate-800" />
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4 text-slate-500" />
                Degradado de página
              </CardTitle>
              <CardDescription>
                Fundido degradado que recorre toda la tienda de arriba a abajo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Activar degradado</p>
                  <p className="text-xs text-muted-foreground">Funde el fondo de la tienda entre dos colores</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.gradientEnabled}
                  onClick={() => updateForm('gradientEnabled', !form.gradientEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.gradientEnabled ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.gradientEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {form.gradientEnabled && (
                <div className="space-y-4 pt-2">
                  {/* Estilo de degradado */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Estilo de degradado</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => updateForm('gradientStyle', 'fade')}
                        className={`rounded-xl border-2 p-3 transition-all ${form.gradientStyle === 'fade' ? 'border-amber-500 ring-2 ring-amber-200' : 'border-border hover:border-amber-300'}`}
                      >
                        <div className="h-12 rounded-lg mb-2" style={{ background: `linear-gradient(180deg, ${form.gradientFrom} 0%, ${form.gradientFrom} 15%, ${form.gradientTo} 100%)` }} />
                        <p className="text-xs font-semibold">Degradado</p>
                        <p className="text-[10px] text-muted-foreground">Claro → Oscuro</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateForm('gradientStyle', 'immersive')}
                        className={`rounded-xl border-2 p-3 transition-all ${form.gradientStyle === 'immersive' ? 'border-amber-500 ring-2 ring-amber-200' : 'border-border hover:border-amber-300'}`}
                      >
                        <div className="h-12 rounded-lg mb-2" style={{ background: `linear-gradient(180deg, ${form.gradientTo} 0%, ${form.gradientFrom} 35%, ${form.gradientFrom} 50%, ${form.gradientTo} 100%)` }} />
                        <p className="text-xs font-semibold">Envolvente</p>
                        <p className="text-[10px] text-muted-foreground">Oscuro → Claro → Oscuro</p>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Color inicio (arriba)</label>
                      <div className="flex items-center gap-2 rounded-lg border p-2">
                        <input
                          type="color"
                          value={form.gradientFrom}
                          onChange={(e) => updateForm('gradientFrom', e.target.value)}
                          className="h-8 w-8 rounded cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={form.gradientFrom}
                          onChange={(e) => updateForm('gradientFrom', e.target.value)}
                          className="flex-1 text-xs font-mono bg-transparent outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Color fin (abajo)</label>
                      <div className="flex items-center gap-2 rounded-lg border p-2">
                        <input
                          type="color"
                          value={form.gradientTo}
                          onChange={(e) => updateForm('gradientTo', e.target.value)}
                          className="h-8 w-8 rounded cursor-pointer border-0"
                        />
                        <input
                          type="text"
                          value={form.gradientTo}
                          onChange={(e) => updateForm('gradientTo', e.target.value)}
                          className="flex-1 text-xs font-mono bg-transparent outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Vista previa</p>
                    <div
                      className="h-24 rounded-xl border overflow-hidden"
                      style={{
                        background: form.gradientStyle === 'immersive'
                          ? `linear-gradient(180deg, ${form.gradientTo} 0%, ${form.gradientFrom} 35%, ${form.gradientFrom} 50%, ${form.gradientTo} 100%)`
                          : `linear-gradient(180deg, ${form.gradientFrom} 0%, ${form.gradientTo} 100%)`,
                      }}
                    >
                      <div className="h-full flex items-end p-3">
                        <div className="flex gap-1">
                          {[0.3, 0.5, 0.7].map((op, i) => (
                            <div key={i} className="h-6 w-10 rounded" style={{ backgroundColor: `rgba(255,255,255,${op})` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Presets */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Presets</p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { from: '#ffffff', to: '#111827', label: 'Clásico' },
                        { from: '#0f172a', to: '#1e293b', label: 'Oscuro' },
                        { from: '#ffffff', to: '#7c3aed', label: 'Violeta' },
                        { from: '#ecfdf5', to: '#064e3b', label: 'Bosque' },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setForm(prev => ({ ...prev, gradientFrom: preset.from, gradientTo: preset.to }));
                          }}
                          className="rounded-lg overflow-hidden border hover:ring-2 ring-amber-400 transition-all"
                        >
                          <div className="h-8" style={{ background: `linear-gradient(180deg, ${preset.from}, ${preset.to})` }} />
                          <p className="text-[10px] py-1 text-center font-medium">{preset.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* CONTENIDO — Textos, SEO                            */}
      {/* ═══════════════════════════════════════════════════ */}
      {activeSection === 'contenido' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Texts */}
          <Card className="border-0 shadow-soft overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-teal-500 to-cyan-500" />
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                  <Type className="h-3.5 w-3.5 text-white" />
                </div>
                Textos de la tienda
              </CardTitle>
              <CardDescription>Texto que verán tus clientes al visitar tu tienda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Título de bienvenida</Label>
                <Input
                  value={form.welcomeTitle}
                  onChange={(e) => updateForm('welcomeTitle', e.target.value)}
                  placeholder="Ej: Bienvenidos a nuestra tienda"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground mt-1">Se muestra grande en el encabezado</p>
              </div>
              <div>
                <Label>Subtítulo</Label>
                <Input
                  value={form.welcomeSubtitle}
                  onChange={(e) => updateForm('welcomeSubtitle', e.target.value)}
                  placeholder="Ej: Los mejores productos al mejor precio"
                  maxLength={500}
                />
              </div>
              <div>
                <Label>Texto del footer</Label>
                <Input
                  value={form.footerText}
                  onChange={(e) => updateForm('footerText', e.target.value)}
                  placeholder="Ej: © 2026 Mi Tienda. Todos los derechos reservados."
                  maxLength={500}
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card className="border-0 shadow-soft overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Globe className="h-3.5 w-3.5 text-white" />
                </div>
                SEO
              </CardTitle>
              <CardDescription>Optimizá cómo aparece tu tienda en Google</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Título para buscadores</Label>
                <Input
                  value={form.metaTitle}
                  onChange={(e) => updateForm('metaTitle', e.target.value)}
                  placeholder="Ej: Mi Tienda — Ropa y Accesorios"
                  maxLength={200}
                />
              </div>
              <div>
                <Label>Descripción para buscadores</Label>
                <textarea
                  value={form.metaDescription}
                  onChange={(e) => updateForm('metaDescription', e.target.value)}
                  placeholder="Ej: La mejor ropa y accesorios en Buenos Aires"
                  rows={2}
                  maxLength={500}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                />
              </div>

              {/* Google preview */}
              <div className="p-4 rounded-xl border bg-white dark:bg-slate-900">
                <p className="text-[10px] text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Vista previa en Google</p>
                <p className="text-blue-600 text-sm font-medium truncate">
                  {form.metaTitle || tenant?.name || 'Mi Tienda'}
                </p>
                <p className="text-emerald-700 text-xs">
                  turnolink.com.ar/{tenant?.slug || 'mi-tienda'}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                  {form.metaDescription || form.welcomeSubtitle || 'Descripción de tu tienda...'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* FUNCIONES — Toggles, visibilidad, features         */}
      {/* ═══════════════════════════════════════════════════ */}
      {activeSection === 'funciones' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Store Config */}
          <Card className="border-0 shadow-soft overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-orange-500 to-red-500" />
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Settings2 className="h-3.5 w-3.5 text-white" />
                </div>
                Configuración general
              </CardTitle>
              <CardDescription>Activa o desactiva funcionalidades de tu tienda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0.5">
              <Toggle
                checked={form.storeEnabled}
                onChange={(v) => updateForm('storeEnabled', v)}
                label="Tienda habilitada"
                description="Mostrar tienda en página pública"
                icon={Store}
              />
              <Toggle
                checked={form.showPrices}
                onChange={(v) => updateForm('showPrices', v)}
                label="Mostrar precios"
                description="Los clientes ven los precios de los productos"
                icon={Store}
              />
              <Toggle
                checked={form.showStock}
                onChange={(v) => updateForm('showStock', v)}
                label="Mostrar stock"
                description="Indicador de disponibilidad visible"
                icon={Store}
              />
              <Toggle
                checked={form.enableWishlist}
                onChange={(v) => updateForm('enableWishlist', v)}
                label="Wishlist"
                description="Los clientes pueden guardar favoritos"
                icon={Store}
              />
              <Toggle
                checked={form.enableReviews}
                onChange={(v) => updateForm('enableReviews', v)}
                label="Reseñas"
                description="Opiniones de compradores"
                icon={Store}
              />
            </CardContent>
          </Card>

          {/* Layout Features */}
          <Card className="border-0 shadow-soft overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <Layout className="h-3.5 w-3.5 text-white" />
                </div>
                Elementos visibles
              </CardTitle>
              <CardDescription>Elegí qué elementos mostrar en tu tienda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0.5">
              <Toggle
                checked={form.showSearchBar}
                onChange={(v) => updateForm('showSearchBar', v)}
                label="Barra de búsqueda"
                description="Los clientes pueden buscar productos"
                icon={Search}
              />
              <Toggle
                checked={form.showCategoryFilter}
                onChange={(v) => updateForm('showCategoryFilter', v)}
                label="Filtro por categorías"
                description="Pills de categorías para filtrar"
                icon={Filter}
              />
              <Toggle
                checked={form.showWhatsappButton}
                onChange={(v) => updateForm('showWhatsappButton', v)}
                label="Botón de WhatsApp"
                description="Consultar por producto vía WhatsApp"
                icon={MessageCircle}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Spacer for mobile floating buttons */}
      <div className="h-16 sm:hidden" />

      {/* Mobile floating action bar — sits above the bottom nav */}
      <div className="fixed bottom-16 left-0 right-0 p-3 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-neutral-700 sm:hidden z-30">
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-11 gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
          {tenant?.slug && (
            <Button
              variant="outline"
              className="flex-1 h-11 gap-2 text-sm font-semibold"
              onClick={() => window.open(`/${tenant.slug}`, '_blank')}
            >
              <Eye className="h-4 w-4" />
              Ver tienda
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
