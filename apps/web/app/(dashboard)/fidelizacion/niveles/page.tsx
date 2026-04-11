'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Trophy, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

export default function NivelesFidelizacionPage() {
  const { data: session } = useSession();
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', minPoints: 0, color: '#CD7F32', icon: '', benefitDescription: '', pointsMultiplier: 1 });

  const loadTiers = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const api = createApiClient(session.accessToken as string);
      const data = await api.get('/loyalty/tiers');
      setTiers(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  }, [session?.accessToken]);

  useEffect(() => { loadTiers(); }, [loadTiers]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', minPoints: 0, color: '#CD7F32', icon: '', benefitDescription: '', pointsMultiplier: 1 });
    setDialogOpen(true);
  };

  const openEdit = (tier: any) => {
    setEditing(tier);
    setForm({ name: tier.name, minPoints: tier.minPoints, color: tier.color, icon: tier.icon || '', benefitDescription: tier.benefitDescription || '', pointsMultiplier: Number(tier.pointsMultiplier) || 1 });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!session?.accessToken) return;
    setSaving(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const data = { ...form, minPoints: Number(form.minPoints), pointsMultiplier: Number(form.pointsMultiplier) };
      if (editing) {
        await api.patch(`/loyalty/tiers/${editing.id}`, data);
      } else {
        await api.post('/loyalty/tiers', data);
      }
      toast({ title: editing ? 'Nivel actualizado' : 'Nivel creado' });
      setDialogOpen(false);
      loadTiers();
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!session?.accessToken || !confirm('Eliminar este nivel?')) return;
    try {
      const api = createApiClient(session.accessToken as string);
      await api.delete(`/loyalty/tiers/${id}`);
      toast({ title: 'Nivel eliminado' });
      loadTiers();
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Niveles</h1>
        <button onClick={openNew} className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Nuevo nivel
        </button>
      </div>

      {loading ? (
        <div className="h-32 animate-pulse bg-muted rounded-lg" />
      ) : tiers.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          <Trophy className="h-8 w-8 mx-auto mb-2" />
          <p>No hay niveles configurados. Crea tu primer nivel.</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {tiers.map(tier => (
            <Card key={tier.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-lg" style={{ backgroundColor: tier.color }}>
                    {tier.icon || tier.name[0]}
                  </div>
                  <div>
                    <p className="font-medium">{tier.name}</p>
                    <p className="text-sm text-muted-foreground">{tier.minPoints} pts minimo - x{Number(tier.pointsMultiplier)} puntos</p>
                    {tier.benefitDescription && <p className="text-xs text-muted-foreground">{tier.benefitDescription}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(tier)} className="p-2 rounded-md hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(tier.id)} className="p-2 rounded-md hover:bg-muted text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Editar nivel' : 'Nuevo nivel'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Bronce, Plata, Oro" />
            </div>
            <div className="space-y-2">
              <Label>Puntos minimos</Label>
              <Input type="number" min={0} value={form.minPoints} onChange={e => setForm(f => ({ ...f, minPoints: Number(e.target.value) }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="h-9 w-12 rounded border cursor-pointer" />
                  <Input value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="flex-1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Icono (emoji)</Label>
                <Input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="Ej: medalla" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Multiplicador de puntos</Label>
              <Input type="number" min={1} step={0.1} value={form.pointsMultiplier} onChange={e => setForm(f => ({ ...f, pointsMultiplier: Number(e.target.value) }))} />
              <p className="text-xs text-muted-foreground">1.5 = 50% mas puntos por turno</p>
            </div>
            <div className="space-y-2">
              <Label>Descripcion del beneficio</Label>
              <Input value={form.benefitDescription} onChange={e => setForm(f => ({ ...f, benefitDescription: e.target.value }))} placeholder="Acceso a descuentos exclusivos" />
            </div>
            <button onClick={handleSave} disabled={saving || !form.name} className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? 'Guardar cambios' : 'Crear nivel'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
