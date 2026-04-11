'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Save, Eye, Upload, FileText, Building2, Loader2, ZoomIn, RotateCcw, ImageIcon } from 'lucide-react';
import { createApiClient } from '@/lib/api';
import { useTenantConfig } from '@/contexts/tenant-config-context';
import { ImageUpload } from '@/components/ui/image-upload';

interface InmobiliariaConfig {
  heroHeadline: string;
  searchPlaceholder: string;
  nombreCorredor: string;
  matricula: string;
  colegioProfesional: string;
  logoScale: number;
}

export default function AparienciaInmobiliariaPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { rubro } = useTenantConfig();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [coverImage, setCoverImage] = useState('');
  const [tenantLogo, setTenantLogo] = useState('');
  const [logoEdited, setLogoEdited] = useState(false);
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const loadedRef = useRef(false);
  const [config, setConfig] = useState<InmobiliariaConfig>({
    heroHeadline: 'Encontrá tu propiedad ideal',
    searchPlaceholder: 'Buscar por barrio, tipo...',
    nombreCorredor: '',
    matricula: '',
    colegioProfesional: '',
    logoScale: 100,
  });

  useEffect(() => {
    if (rubro && rubro !== 'inmobiliarias') {
      router.replace('/configuracion');
    }
  }, [rubro, router]);

  const api = useMemo(() => {
    return session?.accessToken ? createApiClient(session.accessToken) : null;
  }, [session?.accessToken]);

  // Load existing settings — only once
  useEffect(() => {
    if (!api || loadedRef.current) return;
    loadedRef.current = true;
    Promise.all([
      api.getTenant(),
      api.getBranding(),
    ]).then(([tenant, branding]) => {
      const s = JSON.parse(tenant.settings || '{}');
      setTenantLogo(tenant.logo || '');
      setTenantName(tenant.name || '');
      setTenantPhone(tenant.phone || '');
      setConfig({
        heroHeadline: s.heroHeadline || 'Encontrá tu propiedad ideal',
        searchPlaceholder: s.searchPlaceholder || 'Buscar por barrio, tipo...',
        nombreCorredor: s.nombreCorredor || '',
        matricula: s.matricula || '',
        colegioProfesional: s.colegioProfesional || '',
        logoScale: s.logoScale ?? 100,
      });
      setCoverImage((branding as any)?.coverUrl || '');
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [api]);

  const handleSave = useCallback(async () => {
    if (!api) return;
    setSaving(true);
    try {
      const tenant = await api.getTenant();
      const currentSettings = JSON.parse(tenant.settings || '{}');
      const updatedSettings = {
        ...currentSettings,
        heroHeadline: config.heroHeadline,
        searchPlaceholder: config.searchPlaceholder,
        nombreCorredor: config.nombreCorredor,
        matricula: config.matricula,
        colegioProfesional: config.colegioProfesional,
        logoScale: config.logoScale,
      };
      const tenantUpdate: any = { settings: JSON.stringify(updatedSettings) };
      if (logoEdited) tenantUpdate.logo = tenantLogo || null;
      await api.updateTenant(tenantUpdate);

      if (coverImage) {
        await api.updateBranding({ coverUrl: coverImage } as any);
      }
      setLogoEdited(false);

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Error saving:', err);
    } finally {
      setSaving(false);
    }
  }, [api, config, coverImage]);

  const handleCoverUpload = useCallback(async (file: File) => {
    if (!api) throw new Error('No API');
    return await (api as any).uploadMedia(file, 'covers');
  }, [api]);

  const handleLogoUpload = useCallback(async (file: File) => {
    if (!api) throw new Error('No API');
    return await (api as any).uploadMedia(file, 'logos');
  }, [api]);

  if (rubro && rubro !== 'inmobiliarias') return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const factor = config.logoScale / 100;
  const logoH = Math.round(40 * factor);

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Apariencia Inmobiliaria
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Personalizá tu sitio web inmobiliario
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saved ? '¡Guardado!' : 'Guardar cambios'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Logo */}
        <section className="bg-card rounded-2xl border p-6">
          <h2 className="text-base font-semibold flex items-center gap-2 mb-1">
            <ImageIcon className="h-4 w-4" />
            Logo del negocio
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Se muestra en el header de tu sitio y en el panel. Recomendado: imagen cuadrada, mínimo 200x200px.
          </p>
          <ImageUpload
            value={tenantLogo}
            onChange={(url) => { setTenantLogo(url); setLogoEdited(true); }}
            onUpload={handleLogoUpload}
            folder="logos"
            aspectRatio="square"
          />
        </section>

        {/* Hero Image */}
        <section className="bg-card rounded-2xl border p-6">
          <h2 className="text-base font-semibold flex items-center gap-2 mb-1">
            <Upload className="h-4 w-4" />
            Imagen del Hero
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Fondo principal de tu sitio. Usá una imagen de alta calidad (mín. 1920x800px).
          </p>
          <ImageUpload
            value={coverImage}
            onChange={setCoverImage}
            onUpload={handleCoverUpload}
            folder="covers"
            aspectRatio="banner"
          />
        </section>

        {/* Hero Content */}
        <section className="bg-card rounded-2xl border p-6">
          <h2 className="text-base font-semibold flex items-center gap-2 mb-4">
            <Eye className="h-4 w-4" />
            Contenido del Hero
          </h2>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Título principal</label>
            <input
              type="text"
              value={config.heroHeadline}
              onChange={(e) => setConfig(prev => ({ ...prev, heroHeadline: e.target.value }))}
              placeholder="Encontrá tu propiedad ideal"
              className="w-full px-3 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className="text-xs text-muted-foreground mt-1">Se muestra como título grande sobre la imagen del hero</p>
          </div>
        </section>

        {/* Logo Size — with live header preview */}
        <section className="bg-card rounded-2xl border p-6">
          <h2 className="text-base font-semibold flex items-center gap-2 mb-1">
            <ZoomIn className="h-4 w-4" />
            Tamaño del Logo en Header
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            Ajustá el tamaño del logo que se ve en la barra superior de tu sitio.
          </p>

          {/* Slider */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-muted-foreground font-medium">Chico</span>
              <div className="flex-1 relative">
                <input
                  type="range"
                  min="30"
                  max="300"
                  step="5"
                  value={config.logoScale}
                  onChange={(e) => setConfig(prev => ({ ...prev, logoScale: Number(e.target.value) }))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary"
                  style={{ background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((config.logoScale - 30) / 270) * 100}%, hsl(var(--muted)) ${((config.logoScale - 30) / 270) * 100}%, hsl(var(--muted)) 100%)` }}
                />
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">Grande</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold tabular-nums">{config.logoScale}%</span>
              {config.logoScale !== 100 && (
                <button
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, logoScale: 100 }))}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <RotateCcw className="h-3 w-3" />
                  Restablecer
                </button>
              )}
            </div>
          </div>

          {/* Live logo preview — circle */}
          <div className="mt-5">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Preview del logo</p>
            <div className="flex items-center justify-center">
              <div className="h-24 w-24 rounded-full border-2 border-border bg-white flex items-center justify-center overflow-hidden shadow-sm">
                {tenantLogo ? (
                  <Image
                    src={tenantLogo}
                    alt={tenantName}
                    width={Math.round(80 * factor)}
                    height={Math.round(80 * factor)}
                    className="object-contain p-2"
                    style={{
                      width: `${Math.max(40, Math.round(60 * factor))}px`,
                      height: `${Math.max(40, Math.round(60 * factor))}px`,
                    }}
                  />
                ) : (
                  <span className="font-bold text-gray-900 text-center text-xs px-1">
                    {tenantName || 'Tu Logo'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Legal Data */}
        <section className="bg-card rounded-2xl border p-6">
          <h2 className="text-base font-semibold flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4" />
            Datos Legales
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Obligatorios por ley. Se muestran en el footer de tu sitio.
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nombre del corredor matriculado</label>
              <input
                type="text"
                value={config.nombreCorredor}
                onChange={(e) => setConfig(prev => ({ ...prev, nombreCorredor: e.target.value }))}
                placeholder="Ej: Juan Pérez"
                className="w-full px-3 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Número de matrícula</label>
              <input
                type="text"
                value={config.matricula}
                onChange={(e) => setConfig(prev => ({ ...prev, matricula: e.target.value }))}
                placeholder="Ej: CUCICBA 7890"
                className="w-full px-3 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Colegio profesional</label>
              <input
                type="text"
                value={config.colegioProfesional}
                onChange={(e) => setConfig(prev => ({ ...prev, colegioProfesional: e.target.value }))}
                placeholder="Ej: CUCICBA, Colegio de Corredores de Buenos Aires"
                className="w-full px-3 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </section>

        {/* Preview link */}
        <div className="text-center py-4">
          <a
            href={`/${(session?.user as any)?.tenantSlug || ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Eye className="h-4 w-4" />
            Ver mi sitio
          </a>
        </div>
      </div>
    </div>
  );
}
