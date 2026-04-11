'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Banknote, Plus, X, Pencil, Trash2, DollarSign, Calendar, User,
  Clock, CheckCircle2, AlertTriangle, XCircle, ArrowRight, FileText,
} from 'lucide-react';

const STATUSES = [
  { key: 'pending', label: 'Pendiente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  { key: 'paid', label: 'Pagada', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
  { key: 'expired', label: 'Vencida', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertTriangle },
  { key: 'refunded', label: 'Devuelta', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', icon: XCircle },
  { key: 'converted', label: 'Boleto', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: FileText },
];

function formatDate(d: string | null) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCurrency(n: number, currency = 'USD') {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
}

export default function SenasPage() {
  const { api } = useApi();
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');

  const emptyForm = {
    productId: '', buyerName: '', buyerDni: '', buyerPhone: '', buyerEmail: '',
    amount: '', currency: 'USD', paidAt: '', paymentMethod: '', expiresAt: '',
    propertyPrice: '', notes: '', status: 'pending',
  };
  const [form, setForm] = useState(emptyForm);

  const loadData = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    try {
      const d = await api.getDeposits(filterStatus || undefined);
      setDeposits(d);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [api, filterStatus]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    if (!api || !form.buyerName.trim() || !form.amount) return;
    try {
      const data: any = { ...form };
      data.amount = parseFloat(data.amount);
      if (data.propertyPrice) data.propertyPrice = parseFloat(data.propertyPrice);
      else delete data.propertyPrice;
      Object.keys(data).forEach(k => { if (data[k] === '') delete data[k]; });

      if (editingId) await api.updateDeposit(editingId, data);
      else await api.createDeposit(data);

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      loadData();
    } catch (e) { console.error(e); }
  };

  const handleEdit = (dep: any) => {
    setForm({
      productId: dep.productId || '', buyerName: dep.buyerName || '',
      buyerDni: dep.buyerDni || '', buyerPhone: dep.buyerPhone || '',
      buyerEmail: dep.buyerEmail || '',
      amount: dep.amount ? String(dep.amount) : '', currency: dep.currency || 'USD',
      paidAt: dep.paidAt ? dep.paidAt.slice(0, 10) : '',
      paymentMethod: dep.paymentMethod || '',
      expiresAt: dep.expiresAt ? dep.expiresAt.slice(0, 10) : '',
      propertyPrice: dep.propertyPrice ? String(dep.propertyPrice) : '',
      notes: dep.notes || '', status: dep.status || 'pending',
    });
    setEditingId(dep.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!api || !confirm('¿Eliminar esta seña?')) return;
    await api.deleteDeposit(id);
    loadData();
  };

  const totalPending = deposits.filter(d => d.status === 'pending').reduce((s, d) => s + Number(d.amount), 0);
  const totalPaid = deposits.filter(d => d.status === 'paid').reduce((s, d) => s + Number(d.amount), 0);
  const totalConverted = deposits.filter(d => d.status === 'converted').length;

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-24 rounded-xl bg-muted" />
      <div className="grid gap-4 grid-cols-3"><div className="h-20 rounded-xl bg-muted" /><div className="h-20 rounded-xl bg-muted" /><div className="h-20 rounded-xl bg-muted" /></div>
      <div className="h-64 rounded-xl bg-muted" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 p-4 sm:p-6 text-white shadow-lg">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
              <Banknote className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Señas / Reservas</h1>
              <p className="text-sm text-white/70">{deposits.length} señas registradas</p>
            </div>
          </div>
          <Button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }} className="bg-white/20 hover:bg-white/30 text-white border-0">
            <Plus className="h-4 w-4 mr-1" /> Nueva seña
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-lg font-bold">{formatCurrency(totalPending)}</p>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-bold">{formatCurrency(totalPaid)}</p>
              <p className="text-xs text-muted-foreground">Cobradas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-bold">{totalConverted}</p>
              <p className="text-xs text-muted-foreground">A boleto</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <select className="px-3 py-2 rounded-lg border bg-background text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      {/* Deposits list */}
      <div className="grid gap-3">
        {deposits.map(dep => {
          const st = STATUSES.find(s => s.key === dep.status) || STATUSES[0];
          const isExpiring = dep.expiresAt && dep.status === 'pending' && new Date(dep.expiresAt) < new Date(Date.now() + 3 * 86400000);
          return (
            <Card key={dep.id} className={`hover:shadow-md transition-shadow ${isExpiring ? 'border-amber-300 dark:border-amber-700' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{dep.buyerName}</p>
                      <Badge className={st.color + ' text-xs'}>{st.label}</Badge>
                      {isExpiring && <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs">Pronto a vencer</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> Seña: <strong className="text-foreground">{formatCurrency(Number(dep.amount), dep.currency)}</strong></span>
                      {dep.propertyPrice && <span>Precio: {formatCurrency(Number(dep.propertyPrice), dep.currency)}</span>}
                      {dep.paymentMethod && <span className="capitalize">{dep.paymentMethod}</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1.5">
                      {dep.buyerPhone && <span>{dep.buyerPhone}</span>}
                      {dep.buyerDni && <span>DNI: {dep.buyerDni}</span>}
                      {dep.expiresAt && <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" /> Vence: {formatDate(dep.expiresAt)}</span>}
                      {dep.paidAt && <span>Pagada: {formatDate(dep.paidAt)}</span>}
                    </div>
                    {dep.notes && <p className="text-xs text-muted-foreground mt-1.5 italic">{dep.notes}</p>}
                  </div>
                  <div className="flex gap-1 ml-3">
                    <button onClick={() => handleEdit(dep)} className="p-1.5 rounded-lg hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(dep.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {deposits.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Banknote className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay señas registradas</p>
            <Button variant="outline" className="mt-3" onClick={() => { setForm(emptyForm); setShowForm(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Registrar primera seña
            </Button>
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold">{editingId ? 'Editar seña' : 'Nueva seña'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Comprador *</label>
                <input className="w-full px-3 py-2 rounded-lg border bg-background text-sm" placeholder="Nombre completo" value={form.buyerName} onChange={e => setForm(f => ({ ...f, buyerName: e.target.value }))} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">DNI</label>
                  <input className="w-full px-3 py-2 rounded-lg border bg-background text-sm" placeholder="12345678" value={form.buyerDni} onChange={e => setForm(f => ({ ...f, buyerDni: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Teléfono</label>
                  <input className="w-full px-3 py-2 rounded-lg border bg-background text-sm" value={form.buyerPhone} onChange={e => setForm(f => ({ ...f, buyerPhone: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                  <input className="w-full px-3 py-2 rounded-lg border bg-background text-sm" value={form.buyerEmail} onChange={e => setForm(f => ({ ...f, buyerEmail: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Monto de seña *</label>
                  <div className="flex gap-1">
                    <select className="px-2 py-2 rounded-lg border bg-background text-sm w-20" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                      <option value="USD">USD</option>
                      <option value="ARS">ARS</option>
                    </select>
                    <input className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm" type="number" placeholder="5000" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Precio total propiedad</label>
                  <input className="w-full px-3 py-2 rounded-lg border bg-background text-sm" type="number" placeholder="120000" value={form.propertyPrice} onChange={e => setForm(f => ({ ...f, propertyPrice: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Método de pago</label>
                  <select className="w-full px-3 py-2 rounded-lg border bg-background text-sm" value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}>
                    <option value="">-</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Fecha de pago</label>
                  <input className="w-full px-3 py-2 rounded-lg border bg-background text-sm" type="date" value={form.paidAt} onChange={e => setForm(f => ({ ...f, paidAt: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Vence</label>
                  <input className="w-full px-3 py-2 rounded-lg border bg-background text-sm" type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Estado</label>
                <select className="w-full px-3 py-2 rounded-lg border bg-background text-sm" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Notas</label>
                <textarea className="w-full px-3 py-2 rounded-lg border bg-background text-sm resize-none" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleSave} disabled={!form.buyerName.trim() || !form.amount}>
                {editingId ? 'Guardar' : 'Registrar seña'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
