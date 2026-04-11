'use client';

import { useState, useEffect } from 'react';
import { Loader2, ImageOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { creativeApi, SceneInfo } from './creative-api';

interface SceneGalleryProps {
  tenantId: string;
  selected: string | null;
  onSelect: (scene: SceneInfo) => void;
}

const FORMAT_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  post: { label: 'Post', variant: 'default' },
  story: { label: 'Story', variant: 'secondary' },
  banner: { label: 'Banner', variant: 'outline' },
};

const CATEGORY_LABELS: Record<string, string> = {
  product: 'Producto',
  promo: 'Promocional',
};

export function SceneGallery({ tenantId, selected, onSelect }: SceneGalleryProps) {
  const [scenes, setScenes] = useState<SceneInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedPreviews, setFailedPreviews] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'product' | 'promo'>('all');

  useEffect(() => {
    setLoading(true);
    creativeApi
      .listMarketingScenes()
      .then(setScenes)
      .catch((e) => console.error('Failed to load scenes:', e))
      .finally(() => setLoading(false));
  }, []);

  const filteredScenes = filter === 'all' ? scenes : scenes.filter((s) => s.category === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Elegí una escena</h2>
        <p className="text-muted-foreground mt-1">
          Cada escena genera una imagen de marketing profesional con tu branding
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex justify-center gap-2">
        {[
          { key: 'all' as const, label: 'Todas' },
          { key: 'product' as const, label: 'Producto' },
          { key: 'promo' as const, label: 'Promocional' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              filter === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scene grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredScenes.map((scene) => {
          const previewUrl = creativeApi.getScenePreviewUrl(scene.id, tenantId, 300);
          const fmt = FORMAT_LABELS[scene.format] || { label: scene.format, variant: 'default' as const };
          const isSelected = selected === scene.id;

          return (
            <button
              key={scene.id}
              onClick={() => onSelect(scene)}
              className={cn(
                'group relative bg-card rounded-xl overflow-hidden border-2 transition-all duration-200 text-left',
                isSelected
                  ? 'border-primary ring-2 ring-primary/20 shadow-lg'
                  : 'border-transparent hover:border-muted-foreground/20 hover:shadow-md'
              )}
            >
              {/* Preview image */}
              <div
                className="relative bg-muted"
                style={{
                  aspectRatio: scene.format === 'banner' ? '1200/628' : scene.format === 'story' ? '9/16' : '1/1',
                  maxHeight: scene.format === 'story' ? '280px' : undefined,
                }}
              >
                {failedPreviews.has(scene.id) ? (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <ImageOff className="h-8 w-8" />
                  </div>
                ) : (
                  <img
                    src={previewUrl}
                    alt={scene.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={() => setFailedPreviews((prev) => new Set(prev).add(scene.id))}
                  />
                )}
                {/* Format badge */}
                <div className="absolute top-2 right-2">
                  <Badge variant={fmt.variant} className="text-xs">
                    {fmt.label}
                  </Badge>
                </div>
                {/* Category badge */}
                <div className="absolute top-2 left-2">
                  <Badge variant="outline" className="text-xs bg-background/80 backdrop-blur-sm">
                    {CATEGORY_LABELS[scene.category] || scene.category}
                  </Badge>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="font-semibold text-sm truncate">{scene.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {scene.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {scene.width} × {scene.height}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
