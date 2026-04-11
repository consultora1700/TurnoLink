'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Receipt, Plus, Pencil, Trash2, X, Loader2, Building2, Calendar, DollarSign, Info } from 'lucide-react';

const EXPENSE_TYPES = [
  { value: 'expensas', label: 'Expensas' },
  { value: 'abl', label: 'ABL' },
  { value: 'agua', label: 'Agua' },
  { value: 'gas', label: 'Gas' },
  { value: 'luz', label: 'Luz' },
  { value: 'reparaciones', label: 'Reparaciones' },
  { value: 'seguro', label: 'Seguro' },
  { value: 'impuestos', label: 'Impuestos' },
  { value: 'otros', label: 'Otros' },
];

const PAID_BY_OPTIONS = [
  { value: 'owner', label: 'Propietario' },
  { value: 'tenant', label: 'Inquilino' },
  { value: 'shared', label: 'Compartido' },
];

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const TYPE_COLORS: Record<string, string> = {
  expensas: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  abl: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
  agua: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400',
  gas: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  luz: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  reparaciones: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  seguro: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  impuestos: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  otros: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

const inputClasses = 'w-full mt-1 h-10 rounded-md border border-input bg-white dark:bg-neutral-800 dark:border-neutral-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors dark:text-neutral-100 dark:placeholder:text-neutral-500';

export default function GastosPage() {
  const { api } = useApi();
  const formRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [hideGuide, setHideGuide] = useState(true);
  useEffect(() => { setHideGuide(!!localStorage.getItem('hide-guide-gastos')); }, []);
  const [properties, setProperties] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterProperty, setFilterProperty] = useState('');
  const [form, setForm] = useState({ propertyId: '', expenseType: 'expensas', description: '', amount: '', date: new Date().toISOString().split('T')[0], paidBy: 'owner', sharedPercent: '', deductFromLiquidation: true, notes: '' });

  const loadData = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    try {
      const [e, p] = await Promise.all([
        api.getRentalExpenses({ propertyId: filterProperty || undefined }),
        api.getRentalProperties(),
      ]);
      setExpenses(e); setProperties(p);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [api, filterProperty]);

  useEffect(() => { loadData(); }, [loadData]);

  const resetForm = () => {
    setForm({ propertyId: '', expenseType: 'expensas', description: '', amount: '', date: new Date().toISOString().split('T')[0], paidBy: 'owner', sharedPercent: '', deductFromLiquidation: true, notes: '' });
    setEditingId(null); setShowForm(false);
  };

  const handleEdit = (e: any) => {
    setEditingId(e.id);
    setForm({ propertyId: e.propertyId || '', expenseType: e.expenseType, description: e.description || '', amount: String(Number(e.amount)), date: e.date ? new Date(e.date).toISOString().split('T')[0] : '', paidBy: e.paidBy || 'owner', sharedPercent: e.sharedPercent ? String(Number(e.sharedPercent)) : '', deductFromLiquidation: e.deductFromLiquidation, notes: e.notes || '' });
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  const handleSave = async () => {
    if (!api || !form.amount || !form.expenseType) return;
    setSaving(true);
    try {
      const data = { ...form, amount: Number(form.amount), sharedPercent: form.sharedPercent ? Number(form.sharedPercent) : undefined, propertyId: form.propertyId || undefined };
      if (editingId) await api.updateRentalExpense(editingId, data);
      else await api.createRentalExpense(data);
      resetForm(); loadData();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!api) return;
    try { await api.deleteRentalExpense(id); setDeletingId(null); loadData(); }
    catch (e: any) { alert(e.message || 'Error al eliminar'); setDeletingId(null); }
  };

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-white">Gastos de Inmuebles</h1>
          <p className="text-muted-foreground dark:text-neutral-400 text-sm mt-1">Expensas, servicios, reparaciones y más</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50">
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">Total gastos</p>
            <p className="text-lg font-bold text-red-700 dark:text-red-300">{formatCurrency(totalExpenses)}</p>
          </div>
          <Button size="sm" onClick={() => { resetForm(); setShowForm(true); setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); }}>
            <Plus className="h-4 w-4 mr-1.5" /> Nuevo gasto
          </Button>
        </div>
      </div>

      {/* Info Guide */}
      {hideGuide ? (
        <button onClick={() => { localStorage.removeItem('hide-guide-gastos'); setHideGuide(false); }} className="flex items-center gap-1.5 text-[11px] text-blue-500/70 dark:text-blue-400/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <Info className="h-3 w-3" /> Ver guía de uso
        </button>
      ) : (
        <div className="relative rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50/80 dark:bg-blue-950/20 p-4 sm:p-5 shadow-sm">
          <button onClick={() => { localStorage.setItem('hide-guide-gastos', '1'); setHideGuide(true); }} className="absolute top-3 right-3 p-1 rounded-full hover:bg-blue-200/50 dark:hover:bg-blue-800/30 transition-colors">
            <X className="h-3.5 w-3.5 text-blue-400" />
          </button>
          <div className="flex gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 h-fit shrink-0">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-1.5 text-xs text-blue-800/80 dark:text-blue-200/80">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Gastos de inmuebles</p>
              <p>Registrá gastos como <strong>expensas, ABL, luz, agua, gas, reparaciones, seguros</strong> e impuestos asociados a cada propiedad.</p>
              <p>Indicá quién paga: <strong>propietario, inquilino o compartido</strong>. Si marcás "Deducir de liquidación", el gasto se descuenta automáticamente al liquidar al propietario.</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button variant={!filterProperty ? 'default' : 'outline'} size="sm" className={filterProperty ? 'dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700' : ''} onClick={() => setFilterProperty('')}>Todas</Button>
        {properties.map(p => (
          <Button key={p.id} variant={filterProperty === p.id ? 'default' : 'outline'} size="sm" className={filterProperty !== p.id ? 'dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700' : ''} onClick={() => setFilterProperty(p.id)}>
            {p.name}
          </Button>
        ))}
      </div>

      {showForm && (
        <div ref={formRef} className="rounded-xl border dark:border-neutral-700 shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="px-5 py-3 border-b bg-slate-50/50 dark:bg-neutral-700/50 dark:border-neutral-700">
            <h3 className="text-base font-semibold dark:text-white">{editingId ? 'Editar gasto' : 'Nuevo gasto'}</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Propiedad</label>
                <select className={inputClasses} value={form.propertyId} onChange={e => setForm(f => ({ ...f, propertyId: e.target.value }))}>
                  <option value="">General (sin propiedad)</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Tipo *</label>
                <select className={inputClasses} value={form.expenseType} onChange={e => setForm(f => ({ ...f, expenseType: e.target.value }))}>
                  {EXPENSE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Monto *</label>
                <input type="number" className={inputClasses} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Fecha</label>
                <input type="date" className={inputClasses} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Descripción</label>
                <input className={inputClasses} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Pagado por</label>
                <select className={inputClasses} value={form.paidBy} onChange={e => setForm(f => ({ ...f, paidBy: e.target.value }))}>
                  {PAID_BY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 text-sm h-10 dark:text-neutral-200">
                  <input type="checkbox" checked={form.deductFromLiquidation} onChange={e => setForm(f => ({ ...f, deductFromLiquidation: e.target.checked }))} className="rounded accent-primary" />
                  Deducir de liquidación
                </label>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" size="sm" className="dark:hover:bg-neutral-700 dark:text-neutral-300" onClick={resetForm}>Cancelar</Button>
              <Button size="sm" disabled={saving || !form.amount} onClick={handleSave}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                {editingId ? 'Guardar' : 'Agregar gasto'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2 animate-pulse">{[1,2,3,4,5].map(i => <div key={i} className="h-16 rounded-xl bg-muted dark:bg-neutral-700" />)}</div>
      ) : expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-500/20 to-amber-500/20 dark:from-red-900/30 dark:to-amber-900/30 flex items-center justify-center mb-4">
            <Receipt className="h-8 w-8 text-red-500/50 dark:text-red-400/50" />
          </div>
          <p className="font-medium text-muted-foreground dark:text-neutral-400">No hay gastos registrados</p>
          <p className="text-sm text-muted-foreground/70 dark:text-neutral-500 mt-1">Registrá expensas, servicios y reparaciones</p>
        </div>
      ) : (
        <div className="divide-y dark:divide-neutral-700 rounded-xl border dark:border-neutral-700 overflow-hidden bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
          {expenses.map(e => (
            <div key={e.id} className="group flex items-center gap-3 p-3 hover:bg-slate-50/50 dark:hover:bg-neutral-700/50 transition-colors">
              <Badge className={`${TYPE_COLORS[e.expenseType] || TYPE_COLORS.otros} text-[10px] shrink-0`}>
                {EXPENSE_TYPES.find(t => t.value === e.expenseType)?.label || e.expenseType}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate dark:text-white">{e.description || EXPENSE_TYPES.find(t => t.value === e.expenseType)?.label}</p>
                <p className="text-xs text-muted-foreground dark:text-neutral-500">
                  {e.property?.name || 'General'} · {formatDate(e.date)}
                  {e.paidBy !== 'owner' && <span className="ml-1">· Pagado por {PAID_BY_OPTIONS.find(o => o.value === e.paidBy)?.label}</span>}
                </p>
              </div>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400 shrink-0">{formatCurrency(Number(e.amount))}</p>
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7 dark:hover:bg-neutral-700" onClick={() => handleEdit(e)}><Pencil className="h-3 w-3" /></Button>
                {deletingId === e.id ? (
                  <div className="flex gap-1">
                    <Button variant="destructive" size="icon" className="h-7 w-7 dark:bg-red-600 dark:hover:bg-red-700" onClick={() => handleDelete(e.id)}><Trash2 className="h-3 w-3" /></Button>
                    <Button variant="outline" size="icon" className="h-7 w-7 dark:border-neutral-600 dark:hover:bg-neutral-700" onClick={() => setDeletingId(null)}><X className="h-3 w-3" /></Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 dark:text-red-400 dark:hover:bg-neutral-700" onClick={() => setDeletingId(e.id)}><Trash2 className="h-3 w-3" /></Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
