'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Loader2,
  Plus,
  Tag,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  Users,
  Calendar,
  Percent,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { adminApi } from '@/lib/admin-api';

interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discountPercent: number;
  planId: string;
  plan: {
    id: string;
    name: string;
    slug: string;
    priceMonthly: string;
    industryGroup?: { name: string } | null;
  };
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  redemptions: {
    id: string;
    tenantId: string;
    tenant: { id: string; name: string; slug: string };
    discountPercent: number;
    originalPrice: string;
    discountedPrice: string;
    redeemedAt: string;
  }[];
}

interface Plan {
  id: string;
  name: string;
  slug: string;
  priceMonthly: string;
  industryGroup?: { name: string } | null;
}

export default function CodigosPromoPage() {
  const [loading, setLoading] = useState(true);
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDiscount, setFormDiscount] = useState(100);
  const [formPlanId, setFormPlanId] = useState('');
  const [formMaxUses, setFormMaxUses] = useState(1);
  const [formExpiry, setFormExpiry] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [codesData, plansData] = await Promise.all([
        adminApi.getPromoCodes(),
        adminApi.getAdminPlans(),
      ]);
      setCodes(codesData);
      setPlans(plansData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'TL-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormCode(code);
  };

  const handleCreate = async () => {
    if (!formCode.trim() || !formPlanId) return;
    setSaving(true);
    try {
      await adminApi.createPromoCode({
        code: formCode.trim(),
        description: formDescription.trim() || undefined,
        discountPercent: formDiscount,
        planId: formPlanId,
        maxUses: formMaxUses,
        expiresAt: formExpiry || undefined,
      });
      setCreateOpen(false);
      resetForm();
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await adminApi.deactivatePromoCode(id);
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetForm = () => {
    setFormCode('');
    setFormDescription('');
    setFormDiscount(100);
    setFormPlanId('');
    setFormMaxUses(1);
    setFormExpiry('');
  };

  const activeCodes = codes.filter(c => c.isActive);
  const inactiveCodes = codes.filter(c => !c.isActive);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Códigos Promocionales</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Creá códigos de descuento para que los comerciantes activen planes.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setCreateOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Crear código
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Total códigos</p>
            <p className="text-2xl font-bold">{codes.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Activos</p>
            <p className="text-2xl font-bold text-emerald-600">{activeCodes.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Canjeados</p>
            <p className="text-2xl font-bold text-blue-600">
              {codes.reduce((acc, c) => acc + c.usedCount, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Inactivos</p>
            <p className="text-2xl font-bold text-muted-foreground">{inactiveCodes.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Codes list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Códigos</CardTitle>
          <CardDescription>Lista de todos los códigos promocionales creados.</CardDescription>
        </CardHeader>
        <CardContent>
          {codes.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Tag className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No hay códigos promocionales.</p>
              <p className="text-sm">Creá uno nuevo para empezar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {codes.map((promo) => (
                <div
                  key={promo.id}
                  className={`border rounded-xl p-4 transition-colors ${
                    promo.isActive ? 'bg-card' : 'bg-muted/30 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="text-lg font-bold font-mono tracking-wider">
                          {promo.code}
                        </code>
                        <button
                          onClick={() => copyCode(promo.code, promo.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="Copiar código"
                        >
                          {copiedId === promo.id ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        <Badge variant={promo.isActive ? 'default' : 'secondary'}>
                          {promo.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Percent className="h-3 w-3" />
                          {promo.discountPercent}%
                        </Badge>
                      </div>
                      {promo.description && (
                        <p className="text-sm text-muted-foreground mt-1">{promo.description}</p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                        <span>Plan: <strong>{promo.plan.name}</strong>{promo.plan.industryGroup ? ` (${promo.plan.industryGroup.name})` : ''}</span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {promo.usedCount}/{promo.maxUses} usos
                        </span>
                        {promo.expiresAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Expira: {new Date(promo.expiresAt).toLocaleDateString('es-AR')}
                          </span>
                        )}
                        <span>Creado: {new Date(promo.createdAt).toLocaleDateString('es-AR')}</span>
                      </div>

                      {/* Redemptions */}
                      {promo.redemptions.length > 0 && (
                        <div className="mt-3 border-t pt-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Canjes:</p>
                          {promo.redemptions.map((r) => (
                            <div key={r.id} className="text-xs text-muted-foreground flex items-center gap-2">
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                              <span className="font-medium">{r.tenant.name}</span>
                              <span>({r.tenant.slug})</span>
                              <span>— {new Date(r.redeemedAt).toLocaleDateString('es-AR')}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {promo.isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeactivate(promo.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear código promocional</DialogTitle>
            <DialogDescription>
              El código podrá ser usado por un comerciante para activar un plan con descuento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Código</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder="Ej: TURNO100"
                  className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm font-mono"
                />
                <Button variant="outline" size="sm" onClick={generateCode}>
                  Generar
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Descripción (opcional)</label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Ej: Testing fase 1 - peluquería"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Descuento (%)</label>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={formDiscount}
                  onChange={(e) => setFormDiscount(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-lg font-bold w-16 text-right">{formDiscount}%</span>
              </div>
              {formDiscount < 100 && (
                <p className="text-xs text-muted-foreground mt-1">
                  El comerciante deberá pagar el {100 - formDiscount}% restante via Mercado Pago.
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Plan asociado</label>
              <select
                value={formPlanId}
                onChange={(e) => setFormPlanId(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm mt-1"
              >
                <option value="">Seleccionar plan...</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} — ${Number(plan.priceMonthly).toLocaleString('es-AR')}/mes
                    {plan.industryGroup ? ` (${plan.industryGroup.name})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Máximo de usos</label>
                <input
                  type="number"
                  min={1}
                  value={formMaxUses}
                  onChange={(e) => setFormMaxUses(Number(e.target.value))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Expira (opcional)</label>
                <input
                  type="date"
                  value={formExpiry}
                  onChange={(e) => setFormExpiry(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm mt-1"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={saving || !formCode.trim() || !formPlanId}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Crear código
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
