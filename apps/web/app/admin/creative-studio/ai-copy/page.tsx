'use client';

import { useState, useEffect } from 'react';
import {
  Sparkles,
  Loader2,
  Copy,
  Clock,
  RefreshCw,
  Send,
  Hash,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { creativeApi, AiCopyVariant, AiCopyResult } from '../_components/creative-api';
import { TenantSelector } from '../_components/tenant-selector';

const FORMATS = [
  { value: 'instagram_post', label: 'Post Instagram' },
  { value: 'instagram_story', label: 'Story Instagram' },
  { value: 'facebook_post', label: 'Post Facebook' },
  { value: 'bio', label: 'Bio / Sobre nosotros' },
  { value: 'service_description', label: 'Descripción de servicio' },
  { value: 'email_subject', label: 'Asunto de email' },
  { value: 'seo_meta', label: 'Meta SEO' },
  { value: 'banner_headline', label: 'Titular de banner' },
  { value: 'whatsapp_message', label: 'Mensaje WhatsApp' },
];

const TONES = [
  { value: 'profesional', label: 'Profesional' },
  { value: 'casual', label: 'Casual' },
  { value: 'amigable', label: 'Amigable' },
  { value: 'formal', label: 'Formal' },
  { value: 'divertido', label: 'Divertido' },
  { value: 'inspirador', label: 'Inspirador' },
];

export default function AiCopyPage() {
  const [tenantId, setTenantId] = useState('platform');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [services, setServices] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState('profesional');
  const [format, setFormat] = useState('instagram_post');
  const [additionalContext, setAdditionalContext] = useState('');
  const [variants, setVariants] = useState(3);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AiCopyVariant[]>([]);
  const [history, setHistory] = useState<AiCopyResult[]>([]);
  const [activeTab, setActiveTab] = useState('generate');

  useEffect(() => {
    const adminKey = localStorage.getItem('adminKey');
    if (adminKey) creativeApi.setAdminKey(adminKey);
  }, []);

  const handleGenerate = async () => {
    if (!tenantId || !businessName || !businessType) return;
    setLoading(true);
    setResults([]);
    try {
      const response = await creativeApi.generateCopy({
        tenantId,
        businessName,
        businessType,
        services: services ? services.split(',').map((s) => s.trim()) : undefined,
        targetAudience: targetAudience || undefined,
        tone,
        format,
        additionalContext: additionalContext || undefined,
        variants,
      });
      setResults(response.variants);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!tenantId) return;
    try {
      const hist = await creativeApi.getCopyHistory(tenantId);
      setHistory(hist);
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6" /> Copy con IA
        </h1>
        <p className="text-muted-foreground">Genera textos de marketing con Claude AI</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="generate">Generar</TabsTrigger>
          <TabsTrigger value="history" onClick={loadHistory}>Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurar generación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <TenantSelector value={tenantId} onChange={(id) => setTenantId(id)} />
                <div className="space-y-2">
                  <Label>Nombre del negocio</Label>
                  <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Mi Negocio" />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de negocio</Label>
                  <Input value={businessType} onChange={(e) => setBusinessType(e.target.value)} placeholder="Peluquería, Spa, etc." />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Servicios (separados por coma)</Label>
                  <Input value={services} onChange={(e) => setServices(e.target.value)} placeholder="Corte, Color, Peinado..." />
                </div>
                <div className="space-y-2">
                  <Label>Público objetivo</Label>
                  <Input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="Mujeres 25-45 años..." />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Formato</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMATS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tono</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TONES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Variantes</Label>
                  <Select value={String(variants)} onValueChange={(v) => setVariants(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={String(n)}>{n} variante{n > 1 ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Contexto adicional (opcional)</Label>
                <Textarea
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="Promoción especial, temporada, evento..."
                  rows={2}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading || !tenantId || !businessName || !businessType}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Generando...' : 'Generar Copy'}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Resultados ({results.length} variantes)</h2>
              {results.map((variant, i) => (
                <Card key={i}>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge>Variante {i + 1}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(
                          `${variant.title ? variant.title + '\n\n' : ''}${variant.body}${variant.hashtags?.length ? '\n\n' + variant.hashtags.map((h) => '#' + h).join(' ') : ''}${variant.cta ? '\n\n' + variant.cta : ''}`
                        )}
                      >
                        <Copy className="h-4 w-4 mr-1" /> Copiar
                      </Button>
                    </div>
                    {variant.title && (
                      <h3 className="font-bold text-lg">{variant.title}</h3>
                    )}
                    <p className="whitespace-pre-wrap">{variant.body}</p>
                    {variant.hashtags && variant.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {variant.hashtags.map((tag, j) => (
                          <Badge key={j} variant="secondary" className="text-xs">
                            <Hash className="h-3 w-3 mr-0.5" />{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {variant.cta && (
                      <div className="bg-primary/10 rounded-lg px-4 py-2">
                        <span className="text-sm font-medium text-primary">{variant.cta}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Historial de generaciones</CardTitle>
              <Button variant="outline" size="sm" onClick={loadHistory}>
                <RefreshCw className="h-4 w-4 mr-2" /> Cargar historial
              </Button>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Haz clic en Cargar historial para ver generaciones anteriores
                </p>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {new Date(item.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{item.context?.format || 'N/A'}</Badge>
                            <Badge variant="secondary">{item.context?.tone || 'N/A'}</Badge>
                          </div>
                        </div>
                        <p className="text-sm font-medium mb-2">
                          {item.context?.businessName} — {item.context?.businessType}
                        </p>
                        <div className="space-y-2">
                          {(item.result as AiCopyVariant[]).map((v: AiCopyVariant, j: number) => (
                            <div key={j} className="bg-muted rounded p-2 text-sm">
                              {v.title && <strong>{v.title}</strong>}
                              <p className="whitespace-pre-wrap">{v.body?.slice(0, 200)}{(v.body?.length || 0) > 200 ? '...' : ''}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
