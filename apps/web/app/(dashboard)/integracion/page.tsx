'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  Code2,
  Copy,
  Check,
  Loader2,
  Monitor,
  Maximize2,
  MousePointerClick,
  Globe,
  X,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { createApiClient } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

type DisplayMode = 'inline' | 'modal' | 'floating-button';

interface EmbedSettings {
  embedEnabled: boolean;
  embedAllowedDomains: string[];
  embedDisplayMode: DisplayMode;
  embedButtonText: string;
  embedButtonColor: string;
}

const DEFAULT_SETTINGS: EmbedSettings = {
  embedEnabled: true,
  embedAllowedDomains: [],
  embedDisplayMode: 'inline',
  embedButtonText: 'Reservar turno',
  embedButtonColor: '#3F8697',
};

const MODES: { value: DisplayMode; label: string; description: string; icon: typeof Monitor }[] = [
  { value: 'inline', label: 'Inline', description: 'Se muestra directamente en la pagina', icon: Monitor },
  { value: 'modal', label: 'Modal', description: 'Se abre en un popup centrado', icon: Maximize2 },
  { value: 'floating-button', label: 'Boton flotante', description: 'Boton fijo en la esquina', icon: MousePointerClick },
];

export default function IntegracionPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState('');
  const [settings, setSettings] = useState<EmbedSettings>(DEFAULT_SETTINGS);
  const [copied, setCopied] = useState(false);
  const [newDomain, setNewDomain] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      if (!session?.accessToken) return;
      try {
        const api = createApiClient(session.accessToken as string);
        const tenant = await api.getTenant() as any;
        setSlug(tenant.slug || '');
        const parsed = typeof tenant.settings === 'string'
          ? JSON.parse(tenant.settings)
          : tenant.settings || {};
        setSettings({
          embedEnabled: parsed.embedEnabled ?? DEFAULT_SETTINGS.embedEnabled,
          embedAllowedDomains: parsed.embedAllowedDomains ?? DEFAULT_SETTINGS.embedAllowedDomains,
          embedDisplayMode: parsed.embedDisplayMode ?? DEFAULT_SETTINGS.embedDisplayMode,
          embedButtonText: parsed.embedButtonText ?? DEFAULT_SETTINGS.embedButtonText,
          embedButtonColor: parsed.embedButtonColor ?? DEFAULT_SETTINGS.embedButtonColor,
        });
      } catch {
        toast({ title: 'Error', description: 'No se pudieron cargar los ajustes.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [session?.accessToken]);

  const handleSave = useCallback(async () => {
    if (!session?.accessToken) return;
    setSaving(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const currentTenant = await api.getTenant() as any;
      const currentSettings = typeof currentTenant.settings === 'string'
        ? JSON.parse(currentTenant.settings)
        : currentTenant.settings || {};
      await api.updateTenant({
        settings: JSON.stringify({ ...currentSettings, ...settings }),
      });
      toast({ title: 'Guardado', description: 'Configuracion del widget actualizada.' });
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }, [session?.accessToken, settings]);

  const appUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://app.turnolink.com';

  const generateSnippet = () => {
    const attrs: string[] = [`data-slug="${slug}"`];
    if (settings.embedDisplayMode !== 'inline') {
      attrs.push(`data-mode="${settings.embedDisplayMode}"`);
    }
    if (settings.embedDisplayMode === 'floating-button') {
      if (settings.embedButtonText !== 'Reservar turno') {
        attrs.push(`data-button-text="${settings.embedButtonText}"`);
      }
      if (settings.embedButtonColor !== '#3F8697') {
        attrs.push(`data-button-color="${settings.embedButtonColor}"`);
      }
    }
    if (settings.embedDisplayMode === 'modal') {
      return `<script src="${appUrl}/embed.js" ${attrs.join(' ')}></script>\n<button onclick="TurnoLink.open()">Reservar</button>`;
    }
    return `<script src="${appUrl}/embed.js" ${attrs.join(' ')}></script>`;
  };

  const copySnippet = () => {
    navigator.clipboard.writeText(generateSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copiado', description: 'Snippet copiado al portapapeles.' });
  };

  const addDomain = () => {
    const d = newDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    if (d && !settings.embedAllowedDomains.includes(d)) {
      setSettings(s => ({ ...s, embedAllowedDomains: [...s.embedAllowedDomains, d] }));
      setNewDomain('');
    }
  };

  const removeDomain = (domain: string) => {
    setSettings(s => ({ ...s, embedAllowedDomains: s.embedAllowedDomains.filter(x => x !== domain) }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Widget web</h1>
        <p className="text-muted-foreground">
          Embebe tu sistema de reservas en cualquier sitio web con una linea de codigo.
        </p>
      </div>

      {/* Enable/Disable */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Widget embebible</CardTitle>
              <CardDescription>Permite que tus clientes reserven desde tu sitio web.</CardDescription>
            </div>
            <Switch
              checked={settings.embedEnabled}
              onCheckedChange={(v) => setSettings(s => ({ ...s, embedEnabled: v }))}
            />
          </div>
        </CardHeader>
      </Card>

      {settings.embedEnabled && (
        <>
          {/* Display Mode */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Modo de visualizacion</CardTitle>
              <CardDescription>Elegi como se muestra el widget en tu sitio.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {MODES.map((m) => {
                  const Icon = m.icon;
                  const selected = settings.embedDisplayMode === m.value;
                  return (
                    <button
                      key={m.value}
                      onClick={() => setSettings(s => ({ ...s, embedDisplayMode: m.value }))}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                        selected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-muted hover:border-muted-foreground/30'
                      }`}
                    >
                      <Icon className={`h-6 w-6 mb-2 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="font-medium text-sm">{m.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{m.description}</div>
                      {selected && (
                        <div className="absolute top-3 right-3">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Button Settings (for floating-button mode) */}
          {settings.embedDisplayMode === 'floating-button' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuracion del boton</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Texto del boton</Label>
                  <Input
                    value={settings.embedButtonText}
                    onChange={(e) => setSettings(s => ({ ...s, embedButtonText: e.target.value }))}
                    placeholder="Reservar turno"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color del boton</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.embedButtonColor}
                      onChange={(e) => setSettings(s => ({ ...s, embedButtonColor: e.target.value }))}
                      className="h-10 w-14 rounded border cursor-pointer"
                    />
                    <Input
                      value={settings.embedButtonColor}
                      onChange={(e) => setSettings(s => ({ ...s, embedButtonColor: e.target.value }))}
                      className="w-32 font-mono text-sm"
                    />
                  </div>
                </div>
                {/* Preview */}
                <div className="pt-2">
                  <Label className="text-xs text-muted-foreground">Vista previa</Label>
                  <div className="mt-2 p-6 rounded-xl bg-muted/50 flex justify-end">
                    <div
                      className="px-6 py-3 rounded-full text-white font-semibold text-sm shadow-lg"
                      style={{ backgroundColor: settings.embedButtonColor }}
                    >
                      {settings.embedButtonText}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Snippet Generator */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Code2 className="h-5 w-5" />
                Codigo para tu sitio web
              </CardTitle>
              <CardDescription>
                Copia este codigo y pegalo en el HTML de tu pagina web.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-slate-950 text-slate-100 rounded-xl p-4 text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all">
                  {generateSnippet()}
                </pre>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-3 right-3"
                  onClick={copySnippet}
                >
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copied ? 'Copiado' : 'Copiar'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Funciona en cualquier sitio web: HTML, WordPress, Wix, Shopify, Webflow, React, Vue, y mas.
              </p>
            </CardContent>
          </Card>

          {/* Allowed Domains */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Dominios permitidos
              </CardTitle>
              <CardDescription>
                Si esta vacio, el widget se puede embeber en cualquier sitio. Agrega dominios para restringirlo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="ejemplo.com"
                  onKeyDown={(e) => e.key === 'Enter' && addDomain()}
                />
                <Button variant="outline" size="icon" onClick={addDomain}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {settings.embedAllowedDomains.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {settings.embedAllowedDomains.map((d) => (
                    <Badge key={d} variant="secondary" className="gap-1 pr-1">
                      {d}
                      <button onClick={() => removeDomain(d)} className="ml-1 hover:bg-muted rounded-full p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sin restricciones — se puede embeber en cualquier dominio.</p>
              )}
            </CardContent>
          </Card>

          {/* Preview Link */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Vista previa del widget</p>
                  <p className="text-sm text-muted-foreground">Mira como se ve el widget embebido.</p>
                </div>
                <Button variant="outline" asChild>
                  <a href={`/embed/${slug}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir preview
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Guardar cambios
        </Button>
      </div>
    </div>
  );
}
