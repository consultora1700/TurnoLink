'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { creativeApi, SceneInfo, TenantBranding } from './creative-api';

export interface SceneCustomizations {
  title: string;
  subtitle: string;
  cta: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

interface SceneCustomizerProps {
  scene: SceneInfo;
  tenantId: string;
  branding: TenantBranding | null;
  customizations: SceneCustomizations;
  onCustomizationsChange: (c: SceneCustomizations) => void;
}

export function SceneCustomizer({
  scene,
  tenantId,
  branding,
  customizations,
  onCustomizationsChange,
}: SceneCustomizerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const loadPreview = useCallback(async () => {
    setPreviewLoading(true);
    try {
      const result = await creativeApi.renderScene({
        sceneId: scene.id,
        tenantId,
        customizations,
        format: 'png',
        quality: 80,
      });
      if (mountedRef.current) {
        setPreviewUrl(result.outputUrl);
      }
    } catch (e) {
      console.error('Preview render error:', e);
    } finally {
      if (mountedRef.current) {
        setPreviewLoading(false);
      }
    }
  }, [scene.id, tenantId, customizations]);

  // Debounced preview update
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadPreview();
    }, 800);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [loadPreview]);

  const handleChange = (field: keyof SceneCustomizations, value: string) => {
    onCustomizationsChange({ ...customizations, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Preview (left 60%) */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Vista previa</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {scene.name} — {scene.width}×{scene.height}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={loadPreview}
                  disabled={previewLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${previewLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="relative bg-muted rounded-lg overflow-hidden"
              style={{
                aspectRatio: `${scene.width}/${scene.height}`,
                maxHeight: scene.format === 'story' ? '600px' : undefined,
              }}
            >
              {previewLoading && !previewUrl && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              )}
              {previewLoading && previewUrl && (
                <div className="absolute top-2 right-2 bg-background/80 rounded-full p-1.5">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form (right 40%) */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Texto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título / Nombre del negocio</Label>
              <Input
                id="title"
                value={customizations.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder={branding?.name || 'Tu negocio'}
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtítulo / Tagline</Label>
              <Input
                id="subtitle"
                value={customizations.subtitle}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                placeholder={branding?.tagline || 'Tu tagline'}
              />
            </div>
            <div>
              <Label htmlFor="cta">Botón CTA</Label>
              <Input
                id="cta"
                value={customizations.cta}
                onChange={(e) => handleChange('cta', e.target.value)}
                placeholder="Reservar ahora"
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={customizations.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Texto adicional..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Colores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { field: 'primaryColor' as const, label: 'Primario' },
              { field: 'secondaryColor' as const, label: 'Secundario' },
              { field: 'accentColor' as const, label: 'Acento' },
            ].map(({ field, label }) => (
              <div key={field} className="flex items-center gap-3">
                <input
                  type="color"
                  value={customizations[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="w-10 h-10 rounded-lg border cursor-pointer p-0.5"
                />
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                  <Input
                    value={customizations[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className="h-8 text-xs font-mono"
                    placeholder="#000000"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
