'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Film,
  Loader2,
  RefreshCw,
  ExternalLink,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { creativeApi, Creative } from '../_components/creative-api';
import { TenantSelector } from '../_components/tenant-selector';

export default function AnimationsPage() {
  const [tenantId, setTenantId] = useState('platform');
  const [animType, setAnimType] = useState<'slideshow' | 'kenburns' | 'fade'>('slideshow');
  const [outputFormat, setOutputFormat] = useState('mp4');
  const [duration, setDuration] = useState(3);
  const [transition, setTransition] = useState(1);
  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1080);
  const [loading, setLoading] = useState(false);
  const [animations, setAnimations] = useState<Creative[]>([]);
  const [availableImages, setAvailableImages] = useState<Creative[]>([]);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);

  useEffect(() => {
    const adminKey = localStorage.getItem('adminKey');
    if (adminKey) creativeApi.setAdminKey(adminKey);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [anims, screenshots, mockups] = await Promise.all([
        creativeApi.listAnimations({ limit: '50' }),
        creativeApi.listScreenshots({ limit: '50' }),
        creativeApi.listMockups({ limit: '50' }),
      ]);
      setAnimations(anims.data);
      const completed = [...screenshots.data, ...mockups.data].filter((c) => c.status === 'completed');
      setAvailableImages(completed);
    } catch (e) {
      console.error('Failed to load data:', e);
    }
  };

  const pollJob = useCallback(async (creativeId: string) => {
    const check = async () => {
      try {
        const anims = await creativeApi.listAnimations({ limit: '50' });
        const item = anims.data.find((a) => a.id === creativeId);
        if (item && (item.status === 'completed' || item.status === 'failed')) {
          setAnimations(anims.data);
          return;
        }
        setTimeout(check, 3000);
      } catch {
        // ignore
      }
    };
    check();
  }, []);

  const toggleImage = (id: string) => {
    setSelectedImageIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!tenantId || selectedImageIds.length === 0) return;
    setLoading(true);
    try {
      const result = await creativeApi.createAnimation({
        tenantId,
        type: animType,
        imageIds: selectedImageIds,
        duration,
        transition,
        outputFormat,
        width,
        height,
      });
      pollJob(result.id);
      await loadData();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Film className="h-6 w-6" /> Animaciones
          </h1>
          <p className="text-muted-foreground">Crea slideshows, videos y GIFs</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" /> Actualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nueva Animación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <TenantSelector value={tenantId} onChange={(id) => setTenantId(id)} />
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={animType} onValueChange={(v) => setAnimType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slideshow">Slideshow</SelectItem>
                  <SelectItem value="fade">Fade transitions</SelectItem>
                  <SelectItem value="kenburns">Ken Burns (zoom)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Formato</Label>
              <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp4">MP4</SelectItem>
                  <SelectItem value="gif">GIF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Duración por imagen ({duration}s)</Label>
              <Slider value={[duration]} min={1} max={10} step={0.5} onValueChange={([v]) => setDuration(v)} />
            </div>
            <div className="space-y-2">
              <Label>Transición ({transition}s)</Label>
              <Slider value={[transition]} min={0} max={3} step={0.5} onValueChange={([v]) => setTransition(v)} />
            </div>
            <div className="space-y-2">
              <Label>Ancho</Label>
              <Input type="number" value={width} onChange={(e) => setWidth(parseInt(e.target.value) || 1080)} />
            </div>
            <div className="space-y-2">
              <Label>Alto</Label>
              <Input type="number" value={height} onChange={(e) => setHeight(parseInt(e.target.value) || 1080)} />
            </div>
          </div>

          {/* Image selection */}
          <div className="space-y-2">
            <Label>Seleccionar imágenes ({selectedImageIds.length} seleccionadas)</Label>
            {availableImages.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No hay imágenes disponibles. Crea screenshots o mockups primero.
              </p>
            ) : (
              <div className="grid gap-2 grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {availableImages.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => toggleImage(img.id)}
                    className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                      selectedImageIds.includes(img.id)
                        ? 'border-primary ring-2 ring-primary/30'
                        : 'border-transparent hover:border-muted-foreground/30'
                    }`}
                  >
                    {img.outputUrl ? (
                      <img src={img.outputUrl} alt={img.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        {img.name.slice(0, 10)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button onClick={handleCreate} disabled={loading || !tenantId || selectedImageIds.length === 0}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Film className="h-4 w-4 mr-2" />}
            Crear Animación
          </Button>
        </CardContent>
      </Card>

      {/* Animations list */}
      <Card>
        <CardHeader>
          <CardTitle>Animaciones ({animations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {animations.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay animaciones aún</p>
          ) : (
            <div className="space-y-3">
              {animations.map((anim) => (
                <div key={anim.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {anim.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : anim.status === 'processing' ? (
                      <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                    ) : anim.status === 'failed' ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                    <div>
                      <span className="font-medium">{anim.name}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-xs">{anim.format}</Badge>
                        {anim.width && anim.height && (
                          <span className="text-xs text-muted-foreground">{anim.width}x{anim.height}</span>
                        )}
                        {anim.fileSize && (
                          <span className="text-xs text-muted-foreground">{(anim.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {anim.status === 'completed' && anim.outputUrl && (
                    <div className="flex gap-1">
                      <a href={anim.outputUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-3 w-3 mr-1" /> Ver
                        </Button>
                      </a>
                    </div>
                  )}
                  {anim.errorMsg && (
                    <span className="text-xs text-red-500">{anim.errorMsg}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
