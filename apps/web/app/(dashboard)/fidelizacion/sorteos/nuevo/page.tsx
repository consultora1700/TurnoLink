'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createApiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { PrizeEditor } from '@/components/loyalty/prize-editor';
import { PrizeWheel } from '@/components/loyalty/prize-wheel';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';

export default function NuevoSorteoPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', image: '', drawDate: '', allowPublicRegistration: true,
  });
  const [prizes, setPrizes] = useState<Array<{ name: string; color: string; weight: number }>>([
    { name: 'Premio 1', color: '#ef4444', weight: 1 },
    { name: 'Premio 2', color: '#3b82f6', weight: 1 },
  ]);

  const handleSave = async () => {
    if (!session?.accessToken || !form.title) return;
    setSaving(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const result = await api.post<any>('/loyalty/sorteos', {
        title: form.title, description: form.description || null,
        image: form.image || null, prizes: JSON.stringify(prizes),
        drawDate: form.drawDate || null, allowPublicRegistration: form.allowPublicRegistration,
      });
      toast({ title: 'Sorteo creado' });
      router.push(`/fidelizacion/sorteos/${result.id}`);
    } catch {
      toast({ title: 'Error al crear sorteo', variant: 'destructive' });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <Link href="/fidelizacion" className="p-2 rounded-md hover:bg-muted"><ArrowLeft className="h-4 w-4" /></Link>
        <h1 className="text-xl sm:text-2xl font-bold">Nuevo sorteo</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Datos del sorteo</CardTitle>
              <CardDescription>Completa la informacion del sorteo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Titulo *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ej: Sorteo de Navidad" /></div>
              <div className="space-y-2"><Label>Descripcion</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Imagen URL</Label><Input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." /></div>
              <div className="space-y-2"><Label>Fecha del sorteo</Label><Input type="datetime-local" value={form.drawDate} onChange={e => setForm(f => ({ ...f, drawDate: e.target.value }))} /></div>
              <div className="flex items-center justify-between">
                <Label>Registro publico</Label>
                <button onClick={() => setForm(f => ({ ...f, allowPublicRegistration: !f.allowPublicRegistration }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.allowPublicRegistration ? 'bg-primary' : 'bg-gray-200 dark:bg-neutral-700'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.allowPublicRegistration ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-sm">Premios</CardTitle></CardHeader>
            <CardContent><PrizeEditor prizes={prizes} onChange={setPrizes} /></CardContent>
          </Card>

          <button onClick={handleSave} disabled={saving || !form.title || prizes.length === 0}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Crear sorteo
          </button>
        </div>

        <div>
          <Card className="border-0 shadow-sm overflow-hidden sticky top-6">
            <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
            <CardHeader><CardTitle className="text-sm">Vista previa</CardTitle></CardHeader>
            <CardContent>
              <PrizeWheel prizes={prizes} showForceBar={false} disabled />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
