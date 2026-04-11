'use client';

import { useState, useEffect, useRef } from 'react';
import { Download, Loader2, Check, Image } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { creativeApi, SceneInfo } from './creative-api';
import { SceneCustomizations } from './scene-customizer';

interface SceneExportPanelProps {
  scene: SceneInfo;
  tenantId: string;
  customizations: SceneCustomizations;
}

interface ExportedFile {
  format: string;
  url: string;
  fileSize: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SceneExportPanel({ scene, tenantId, customizations }: SceneExportPanelProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  const [exported, setExported] = useState<ExportedFile[]>([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Load full-quality preview on mount
  useEffect(() => {
    setPreviewLoading(true);
    creativeApi
      .renderScene({
        sceneId: scene.id,
        tenantId,
        customizations,
        format: 'png',
        quality: 90,
      })
      .then((result) => {
        if (mountedRef.current) setPreviewUrl(result.outputUrl);
      })
      .catch((e) => console.error('Preview error:', e))
      .finally(() => {
        if (mountedRef.current) setPreviewLoading(false);
      });
  }, [scene.id, tenantId, customizations]);

  const handleExport = async (format: string, quality: number) => {
    setExporting(format);
    try {
      const result = await creativeApi.renderScene({
        sceneId: scene.id,
        tenantId,
        customizations,
        format,
        quality,
      });

      // Trigger download
      const a = document.createElement('a');
      a.href = result.outputUrl;
      a.download = `${scene.name.toLowerCase().replace(/\s+/g, '-')}-${tenantId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      if (mountedRef.current) {
        setExported((prev) => [
          ...prev.filter((e) => e.format !== format),
          { format, url: result.outputUrl, fileSize: result.fileSize },
        ]);
      }
    } catch (e) {
      console.error('Export error:', e);
    } finally {
      if (mountedRef.current) setExporting(null);
    }
  };

  const formats = [
    { format: 'png', label: 'PNG', quality: 100, description: 'Máxima calidad, sin pérdida' },
    { format: 'jpg', label: 'JPG', quality: 92, description: 'Menor tamaño, ideal para web' },
    { format: 'webp', label: 'WebP', quality: 92, description: 'Formato moderno, excelente compresión' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Preview */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Imagen final</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="relative bg-muted rounded-lg overflow-hidden"
              style={{
                aspectRatio: `${scene.width}/${scene.height}`,
                maxHeight: scene.format === 'story' ? '600px' : undefined,
              }}
            >
              {previewLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : previewUrl ? (
                <img src={previewUrl} alt="Final" className="w-full h-full object-contain" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <Image className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <span>{scene.name}</span>
              <span>{scene.width} × {scene.height} px</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export buttons */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Descargar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {formats.map((f, i) => {
              const isExported = exported.find((e) => e.format === f.format);
              const isExporting = exporting === f.format;

              return (
                <Button
                  key={f.format}
                  variant={i === 0 ? 'default' : 'outline'}
                  className="w-full justify-between h-auto py-3"
                  onClick={() => handleExport(f.format, f.quality)}
                  disabled={!!exporting || previewLoading}
                >
                  <div className="flex items-center gap-2">
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isExported ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <div className="text-left">
                      <div className="font-semibold">{f.label}</div>
                      <div className="text-xs font-normal opacity-70">{f.description}</div>
                    </div>
                  </div>
                  {isExported && (
                    <span className="text-xs opacity-60">{formatFileSize(isExported.fileSize)}</span>
                  )}
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {exported.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Archivos exportados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {exported.map((file) => (
                  <div
                    key={file.format}
                    className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted"
                  >
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="font-medium">{file.format.toUpperCase()}</span>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {formatFileSize(file.fileSize)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
