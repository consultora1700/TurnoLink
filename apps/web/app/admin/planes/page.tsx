'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Loader2,
  ListChecks,
  Pencil,
  Plus,
  Trash2,
  Check,
  X,
  Building2,
  DollarSign,
  Star,
  Eye,
  EyeOff,
  Save,
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
import { adminApi, AdminIndustryGroup, AdminPlan } from '@/lib/admin-api';

function formatPrice(price: string | number | null): string {
  if (!price || price === '0') return 'Gratis';
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return `$${num.toLocaleString('es-AR')}`;
}

function formatLimit(value: number | null): string {
  if (value === null) return 'Ilimitado';
  return value.toLocaleString('es-AR');
}

export default function PlanesPage() {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<AdminIndustryGroup[]>([]);
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Edit group dialog
  const [editGroupOpen, setEditGroupOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AdminIndustryGroup | null>(null);
  const [groupForm, setGroupForm] = useState({
    name: '', description: '', limitLabels: {} as Record<string, string | null>,
  });
  const [savingGroup, setSavingGroup] = useState(false);

  // Edit plan dialog
  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AdminPlan | null>(null);
  const [planForm, setPlanForm] = useState({
    name: '', description: '',
    priceMonthly: 0, priceYearly: 0, trialDays: 14,
    maxBranches: null as number | null,
    maxEmployees: null as number | null,
    maxServices: null as number | null,
    maxBookingsMonth: null as number | null,
    maxCustomers: null as number | null,
    features: [] as string[],
    isPopular: false, isActive: true,
    industryGroupId: null as string | null,
  });
  const [savingPlan, setSavingPlan] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [g, p] = await Promise.all([
        adminApi.getIndustryGroups(),
        adminApi.getAdminPlans(),
      ]);
      setGroups(g);
      setPlans(p);
    } catch (err: any) {
      setError(err.message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ============ GROUP HANDLERS ============

  const openEditGroup = (group: AdminIndustryGroup) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name,
      description: group.description || '',
      limitLabels: { ...group.limitLabels },
    });
    setEditGroupOpen(true);
  };

  const saveGroup = async () => {
    if (!editingGroup) return;
    setSavingGroup(true);
    try {
      await adminApi.updateIndustryGroup(editingGroup.id, {
        name: groupForm.name,
        description: groupForm.description || undefined,
        limitLabels: groupForm.limitLabels,
      });
      setEditGroupOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingGroup(false);
    }
  };

  // ============ PLAN HANDLERS ============

  const openEditPlan = (plan: AdminPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      description: plan.description || '',
      priceMonthly: parseFloat(plan.priceMonthly),
      priceYearly: parseFloat(plan.priceYearly || '0'),
      trialDays: plan.trialDays,
      maxBranches: plan.maxBranches,
      maxEmployees: plan.maxEmployees,
      maxServices: plan.maxServices,
      maxBookingsMonth: plan.maxBookingsMonth,
      maxCustomers: plan.maxCustomers,
      features: plan.features || [],
      isPopular: plan.isPopular,
      isActive: plan.isActive,
      industryGroupId: plan.industryGroupId,
    });
    setEditPlanOpen(true);
  };

  const savePlan = async () => {
    if (!editingPlan) return;
    setSavingPlan(true);
    try {
      await adminApi.updatePlan(editingPlan.id, {
        name: planForm.name,
        description: planForm.description || undefined,
        priceMonthly: planForm.priceMonthly,
        priceYearly: planForm.priceYearly,
        trialDays: planForm.trialDays,
        maxBranches: planForm.maxBranches,
        maxEmployees: planForm.maxEmployees,
        maxServices: planForm.maxServices,
        maxBookingsMonth: planForm.maxBookingsMonth,
        maxCustomers: planForm.maxCustomers,
        features: planForm.features,
        isPopular: planForm.isPopular,
        isActive: planForm.isActive,
      });
      setEditPlanOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingPlan(false);
    }
  };

  const togglePlanActive = async (plan: AdminPlan) => {
    try {
      await adminApi.updatePlan(plan.id, { isActive: !plan.isActive });
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const togglePlanPopular = async (plan: AdminPlan) => {
    try {
      await adminApi.updatePlan(plan.id, { isPopular: !plan.isPopular });
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ============ HELPERS ============

  const plansByGroup = (groupId: string) =>
    plans.filter(p => p.industryGroupId === groupId).sort((a, b) => a.order - b.order);

  const orphanPlans = plans.filter(p => !p.industryGroupId);

  const limitFields = [
    { key: 'maxBranches', defaultLabel: 'Sucursales' },
    { key: 'maxEmployees', defaultLabel: 'Empleados' },
    { key: 'maxServices', defaultLabel: 'Servicios' },
    { key: 'maxBookingsMonth', defaultLabel: 'Reservas/mes' },
    { key: 'maxCustomers', defaultLabel: 'Clientes' },
    { key: 'maxPhotos', defaultLabel: 'Fotos' },
  ];

  const getLimitLabel = (group: AdminIndustryGroup | null, key: string, defaultLabel: string): string | null => {
    if (!group?.limitLabels) return defaultLabel;
    const label = group.limitLabels[key];
    if (label === null) return null; // hidden
    return label || defaultLabel;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ListChecks className="h-6 w-6" />
          Planes por Industria
        </h1>
        <p className="text-muted-foreground mt-1">
          {groups.length} grupos de industria, {plans.filter(p => p.isActive).length} planes activos
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
          <button className="ml-2 underline" onClick={() => setError(null)}>Cerrar</button>
        </div>
      )}

      {/* Groups Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Grupos de Industria
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map(group => (
            <Card key={group.id} className={!group.isActive ? 'opacity-50' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{group.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {group.description}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditGroup(group)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                  <span>{(group.industries || []).length} sub-nichos</span>
                  <span>{plansByGroup(group.id).length} planes</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Labels:</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(group.limitLabels || {}).map(([key, val]) => (
                      <Badge key={key} variant={val === null ? 'secondary' : 'outline'} className="text-xs">
                        {key.replace('max', '').replace(/([A-Z])/g, ' $1').trim()}:
                        {val === null ? ' oculto' : ` ${val}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Plans Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Planes de Suscripción
        </h2>

        {groups.map(group => {
          const groupPlans = plansByGroup(group.id);
          if (groupPlans.length === 0) return null;

          return (
            <div key={group.id} className="mb-8">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {group.name}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4 font-medium">Plan</th>
                      <th className="pb-2 pr-4 font-medium">Precio/mes</th>
                      <th className="pb-2 pr-4 font-medium">Precio/año</th>
                      {limitFields.map(f => {
                        const label = getLimitLabel(group, f.key, f.defaultLabel);
                        if (label === null) return null;
                        return <th key={f.key} className="pb-2 pr-4 font-medium">{label}</th>;
                      })}
                      <th className="pb-2 pr-4 font-medium text-center">Popular</th>
                      <th className="pb-2 pr-4 font-medium text-center">Activo</th>
                      <th className="pb-2 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupPlans.map(plan => (
                      <tr key={plan.id} className={`border-b last:border-0 ${!plan.isActive ? 'opacity-50' : ''}`}>
                        <td className="py-3 pr-4">
                          <span className="font-medium">{plan.name}</span>
                          {plan.trialDays > 0 && (
                            <span className="text-xs text-muted-foreground ml-1">({plan.trialDays}d trial)</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 font-mono">{formatPrice(plan.priceMonthly)}</td>
                        <td className="py-3 pr-4 font-mono">{formatPrice(plan.priceYearly)}</td>
                        {limitFields.map(f => {
                          const label = getLimitLabel(group, f.key, f.defaultLabel);
                          if (label === null) return null;
                          return (
                            <td key={f.key} className="py-3 pr-4 text-center">
                              {formatLimit((plan as any)[f.key])}
                            </td>
                          );
                        })}
                        <td className="py-3 pr-4 text-center">
                          <button onClick={() => togglePlanPopular(plan)}>
                            <Star className={`h-4 w-4 ${plan.isPopular ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                          </button>
                        </td>
                        <td className="py-3 pr-4 text-center">
                          <button onClick={() => togglePlanActive(plan)}>
                            {plan.isActive ? (
                              <Eye className="h-4 w-4 text-green-500" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 text-right">
                          <Button variant="ghost" size="sm" onClick={() => openEditPlan(plan)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {/* Orphan plans (old generic plans) */}
        {orphanPlans.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Planes Genéricos (sin grupo)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Plan</th>
                    <th className="pb-2 pr-4 font-medium">Precio/mes</th>
                    <th className="pb-2 pr-4 font-medium">Activo</th>
                    <th className="pb-2 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {orphanPlans.map(plan => (
                    <tr key={plan.id} className={`border-b last:border-0 ${!plan.isActive ? 'opacity-50' : ''}`}>
                      <td className="py-3 pr-4 font-medium">{plan.name}</td>
                      <td className="py-3 pr-4 font-mono">{formatPrice(plan.priceMonthly)}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                          {plan.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEditPlan(plan)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit Group Dialog */}
      <Dialog open={editGroupOpen} onOpenChange={setEditGroupOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Grupo: {editingGroup?.name}</DialogTitle>
            <DialogDescription>
              Modificá el nombre, descripción y labels de límites.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nombre</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={groupForm.name}
                onChange={e => setGroupForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Descripción</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={groupForm.description}
                onChange={e => setGroupForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Labels de Límites</label>
              <div className="space-y-2">
                {limitFields.map(f => {
                  const val = groupForm.limitLabels[f.key];
                  const isHidden = val === null;
                  return (
                    <div key={f.key} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-28 flex-shrink-0">{f.defaultLabel}</span>
                      <input
                        className="flex-1 border rounded px-2 py-1 text-sm disabled:opacity-50"
                        value={isHidden ? '' : (val || '')}
                        placeholder={f.defaultLabel}
                        disabled={isHidden}
                        onChange={e => setGroupForm(f2 => ({
                          ...f2,
                          limitLabels: { ...f2.limitLabels, [f.key]: e.target.value || f.defaultLabel },
                        }))}
                      />
                      <button
                        className={`text-xs px-2 py-1 rounded ${isHidden ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}
                        onClick={() => setGroupForm(f2 => ({
                          ...f2,
                          limitLabels: { ...f2.limitLabels, [f.key]: isHidden ? f.defaultLabel : null },
                        }))}
                      >
                        {isHidden ? 'Oculto' : 'Ocultar'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditGroupOpen(false)}>Cancelar</Button>
            <Button onClick={saveGroup} disabled={savingGroup}>
              {savingGroup ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={editPlanOpen} onOpenChange={setEditPlanOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Plan: {editingPlan?.name}</DialogTitle>
            <DialogDescription>
              {editingPlan?.industryGroup?.name || 'Sin grupo'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nombre</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={planForm.name}
                  onChange={e => setPlanForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Trial (días)</label>
                <input
                  type="number"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={planForm.trialDays}
                  onChange={e => setPlanForm(f => ({ ...f, trialDays: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Descripción</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={planForm.description}
                onChange={e => setPlanForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Precio Mensual (ARS)</label>
                <input
                  type="number"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={planForm.priceMonthly}
                  onChange={e => setPlanForm(f => ({ ...f, priceMonthly: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Precio Anual (ARS)</label>
                <input
                  type="number"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={planForm.priceYearly}
                  onChange={e => setPlanForm(f => ({ ...f, priceYearly: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Límites</label>
              <div className="grid grid-cols-2 gap-3">
                {limitFields.map(f => {
                  const label = editingPlan?.industryGroup
                    ? getLimitLabel(editingPlan.industryGroup, f.key, f.defaultLabel)
                    : f.defaultLabel;
                  if (label === null) return null;
                  const value = (planForm as any)[f.key];
                  return (
                    <div key={f.key}>
                      <label className="text-xs text-muted-foreground block mb-1 capitalize">{label}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          className="flex-1 border rounded px-2 py-1.5 text-sm disabled:opacity-50"
                          value={value ?? ''}
                          placeholder="Ilimitado"
                          disabled={value === null}
                          onChange={e => setPlanForm(pf => ({
                            ...pf,
                            [f.key]: e.target.value === '' ? null : parseInt(e.target.value),
                          }))}
                        />
                        <button
                          className={`text-xs px-2 py-1.5 rounded whitespace-nowrap ${value === null ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
                          onClick={() => setPlanForm(pf => ({
                            ...pf,
                            [f.key]: value === null ? 1 : null,
                          }))}
                        >
                          {value === null ? '∞' : 'Ilim.'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={planForm.isPopular}
                  onChange={e => setPlanForm(f => ({ ...f, isPopular: e.target.checked }))}
                />
                <Star className="h-4 w-4" /> Popular
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={planForm.isActive}
                  onChange={e => setPlanForm(f => ({ ...f, isActive: e.target.checked }))}
                />
                <Eye className="h-4 w-4" /> Activo
              </label>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Features (separadas por coma)</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={planForm.features.join(', ')}
                onChange={e => setPlanForm(f => ({
                  ...f,
                  features: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPlanOpen(false)}>Cancelar</Button>
            <Button onClick={savePlan} disabled={savingPlan}>
              {savingPlan ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
