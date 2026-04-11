'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Gift, Plus, Pencil, Trash2, Loader2, Star } from 'lucide-react';

const REWARD_TYPES = [
  { value: 'PERCENTAGE_DISCOUNT', label: '% Descuento' },
  { value: 'FIXED_DISCOUNT', label: '$ Descuento fijo' },
  { value: 'FREE_SERVICE', label: 'Servicio gratis' },
  { value: 'FREE_PRODUCT', label: 'Producto gratis' },
];

const rewardTypeLabel = (type: string) => REWARD_TYPES.find(t => t.value === type)?.label || type;

export default function RecompensasFidelizacionPage() {
  const { data: session } = useSession();
  const [rewards, setRewards] = useState<any[]>([]);
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    pointsCost: 100,
    rewardType: 'PERCENTAGE_DISCOUNT',
    discountValue: 10,
    maxRedemptions: '',
    isActive: true,
    minTierSlug: '',
  });

  const loadData = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const api = createApiClient(session.accessToken as string);
      const [rewardsData, tiersData] = await Promise.all([
        api.get('/loyalty/rewards'),
        api.get('/loyalty/tiers'),
      ]);
      setRewards(Array.isArray(rewardsData) ? rewardsData : []);
      setTiers(Array.isArray(tiersData) ? tiersData : []);
    } catch {}
    setLoading(false);
  }, [session?.accessToken]);

  useEffect(() => { loadData(); }, [loadData]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', description: '', pointsCost: 100, rewardType: 'PERCENTAGE_DISCOUNT', discountValue: 10, maxRedemptions: '', isActive: true, minTierSlug: '' });
    setDialogOpen(true);
  };

  const openEdit = (reward: any) => {
    setEditing(reward);
    setForm({
      name: reward.name,
      description: reward.description || '',
      pointsCost: reward.pointsCost,
      rewardType: reward.rewardType,
      discountValue: Number(reward.discountValue) || 0,
      maxRedemptions: reward.maxRedemptions ? String(reward.maxRedemptions) : '',
      isActive: reward.isActive,
      minTierSlug: reward.minTierSlug || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!session?.accessToken) return;
    setSaving(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const data: any = {
        name: form.name,
        description: form.description || null,
        pointsCost: Number(form.pointsCost),
        rewardType: form.rewardType,
        discountValue: Number(form.discountValue),
        maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : null,
        isActive: form.isActive,
        minTierSlug: form.minTierSlug || null,
      };
      if (editing) {
        await api.patch(`/loyalty/rewards/${editing.id}`, data);
      } else {
        await api.post('/loyalty/rewards', data);
      }
      toast({ title: editing ? 'Recompensa actualizada' : 'Recompensa creada' });
      setDialogOpen(false);
      loadData();
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!session?.accessToken || !confirm('Eliminar esta recompensa?')) return;
    try {
      const api = createApiClient(session.accessToken as string);
      await api.delete(`/loyalty/rewards/${id}`);
      toast({ title: 'Recompensa eliminada' });
      loadData();
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recompensas</h1>
        <button onClick={openNew} className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Nueva recompensa
        </button>
      </div>

      {loading ? (
        <div className="h-32 animate-pulse bg-muted rounded-lg" />
      ) : rewards.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          <Gift className="h-8 w-8 mx-auto mb-2" />
          <p>No hay recompensas configuradas. Crea tu primera recompensa.</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.map(reward => (
            <Card key={reward.id} className={!reward.isActive ? 'opacity-60' : ''}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{reward.name}</p>
                    {reward.description && <p className="text-sm text-muted-foreground mt-0.5">{reward.description}</p>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(reward)} className="p-1.5 rounded-md hover:bg-muted"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDelete(reward.id)} className="p-1.5 rounded-md hover:bg-muted text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Star className="h-3 w-3" /> {reward.pointsCost} pts
                  </Badge>
                  <Badge variant="outline">{rewardTypeLabel(reward.rewardType)}</Badge>
                  <Badge variant={reward.isActive ? 'default' : 'secondary'}>
                    {reward.isActive ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
                {reward.discountValue > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Valor: {reward.rewardType === 'PERCENTAGE_DISCOUNT' ? `${reward.discountValue}%` : `$${reward.discountValue}`}
                  </p>
                )}
                {reward.minTierSlug && (
                  <p className="text-xs text-muted-foreground">Nivel minimo: {reward.minTierSlug}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Editar recompensa' : 'Nueva recompensa'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: 10% de descuento" />
            </div>
            <div className="space-y-2">
              <Label>Descripcion (opcional)</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descripcion de la recompensa" />
            </div>
            <div className="space-y-2">
              <Label>Costo en puntos</Label>
              <Input type="number" min={1} value={form.pointsCost} onChange={e => setForm(f => ({ ...f, pointsCost: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Tipo de recompensa</Label>
              <Select value={form.rewardType} onValueChange={v => setForm(f => ({ ...f, rewardType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REWARD_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor del descuento</Label>
              <Input type="number" min={0} step={0.01} value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: Number(e.target.value) }))} />
              <p className="text-xs text-muted-foreground">
                {form.rewardType === 'PERCENTAGE_DISCOUNT' ? 'Porcentaje (ej: 10 = 10%)' : 'Monto en ARS'}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Max. canjes (opcional)</Label>
              <Input type="number" min={0} value={form.maxRedemptions} onChange={e => setForm(f => ({ ...f, maxRedemptions: e.target.value }))} placeholder="Sin limite" />
            </div>
            {tiers.length > 0 && (
              <div className="space-y-2">
                <Label>Nivel minimo (opcional)</Label>
                <Select value={form.minTierSlug} onValueChange={v => setForm(f => ({ ...f, minTierSlug: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sin restriccion" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin restriccion</SelectItem>
                    {tiers.map((t: any) => (
                      <SelectItem key={t.slug} value={t.slug}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center justify-between">
              <Label>Activa</Label>
              <button
                onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? 'bg-primary' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <button onClick={handleSave} disabled={saving || !form.name} className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? 'Guardar cambios' : 'Crear recompensa'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
