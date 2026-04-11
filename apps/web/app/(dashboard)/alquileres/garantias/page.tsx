'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck, Plus, X, Pencil, Trash2, Calendar, User, Phone,
  Mail, FileText, AlertTriangle, CheckCircle2, Clock, Building2,
  Upload, ExternalLink, XCircle,
} from 'lucide-react';

const GUARANTEE_TYPES = [
  { key: 'propietaria', label: 'Propietaria' },
  { key: 'caucion', label: 'Caución' },
  { key: 'bancaria', label: 'Bancaria' },
  { key: 'personal', label: 'Personal' },
  { key: 'seguro_caucion', label: 'Seguro de caución' },
];

const STATUSES = [
  { key: 'active', label: 'Activa', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { key: 'expired', label: 'Vencida', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  { key: 'released', label: 'Liberada', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  { key: 'claimed', label: 'Ejecutada', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
];

function formatDate(d: string | null) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCurrency(n: number, currency = 'ARS') {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
}

function daysUntil(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.ceil((d.getTime() - now.getTime()) / 86400000);
}

export default function GarantiasPage() {
  const { api } = useApi();
  const [guarantees, setGuarantees] = useState<any[]>([]);
  const [expiring, setExpiring] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');

  const emptyForm = {
    contractId: '', guaranteeType: 'propietaria', provider: '', policyNumber: '',
    guarantorName: '', guarantorDni: '', guarantorPhone: '', guarantorEmail: '', guarantorAddress: '',
    coverageAmount: '', currency: 'ARS', startDate: '', expirationDate: '',
    documentUrl: '', status: 'active', notes: '',
  };
  const [form, setForm] = useState(emptyForm);

  const loadData = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    try {
      const [g, e] = await Promise.all([
        api.getGuarantees(filterStatus || undefined),
        api.getExpiringGuarantees(60),
      ]);
      setGuarantees(g);
      setExpiring(e);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [api, filterStatus]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    if (!api || !form.contractId.trim() || !form.guaranteeType) return;
    try {
      const data: any = { ...form };
      if (data.coverageAmount) data.coverageAmount = parseFloat(data.coverageAmount);
      else delete data.coverageAmount;
      Object.keys(data).forEach(k => { if (data[k] === '') delete data[k]; });

      if (editingId) await api.updateGuarantee(editingId, data);
      else await api.createGuarantee(data);

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      loadData();
    } catch (e) { console.error(e); }
  };

  const handleEdit = (g: any) => {
    setForm({
      contractId: g.contractId || '', guaranteeType: g.guaranteeType || 'propietaria',
      provider: g.provider || '', policyNumber: g.policyNumber || '',
      guarantorName: g.guarantorName || '', guarantorDni: g.guarantorDni || '',
      guarantorPhone: g.guarantorPhone || '', guarantorEmail: g.guarantorEmail || '',
      guarantorAddress: g.guarantorAddress || '',
      coverageAmount: g.coverageAmount ? String(g.coverageAmount) : '', currency: g.currency || 'ARS',
      startDate: g.startDate ? g.startDate.slice(0, 10) : '',
      expirationDate: g.expirationDate ? g.expirationDate.slice(0, 10) : '',
      documentUrl: g.documentUrl || '', status: g.status || 'active', notes: g.notes || '',
    });
    setEditingId(g.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!api || !confirm('¿Eliminar esta garantía?')) return;
    await api.deleteGuarantee(id);
    loadData();
  };

  const activeCount = guarantees.filter(g => g.status === 'active').length;
  const expiringCount = expiring.length;

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-24 rounded-xl bg-muted" />
      <div className="h-64 rounded-xl bg-muted" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 p-4 sm:p-6 text-white shadow-lg">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Garantías</h1>
              <p className="text-sm text-white/70">{activeCount} activas · {expiringCount} por vencer (60 días)</p>
            </div>
          </div>
          <Button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }} className="bg-white/20 hover:bg-white/30 text-white border-0">
            <Plus className="h-4 w-4 mr-1" /> Nueva garantía
          </Button>
        </div>
      </div>

      {/* Expiring alert */}
      {expiringCount > 0 && (
        <Card className="border-amber-300 dark:border-amber-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Garantías próximas a vencer</span>
            </div>
            <div className="space-y-2">
              {expiring.map(g => {
                const days = g.expirationDate ? daysUntil(g.expirationDate) : 0;
                return (
                  <div key={g.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{g.guarantorName || g.provider || 'Sin nombre'}</span>
                      <span className="text-xs text-muted-foreground capitalize">{GUARANTEE_TYPES.find(t => t.key === g.guaranteeType)?.label}</span>
                    </div>
                    <Badge className={days <= 7 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}>
                      {days <= 0 ? 'Vencida' : `${days} días`}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        <select className="px-3 py-2 rounded-lg border bg-background text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      {/* Guarantees grid */}
      <div className="grid gap-3 md:grid-cols-2">
        {guarantees.map(g => {
          const st = STATUSES.find(s => s.key === g.status) || STATUSES[0];
          const type = GUARANTEE_TYPES.find(t => t.key === g.guaranteeType);
          const isExpiringSoon = g.expirationDate && g.status === 'active' && daysUntil(g.expirationDate) <= 30;
          return (
            <Card key={g.id} className={`hover:shadow-md transition-shadow ${isExpiringSoon ? 'border-amber-300 dark:border-amber-700' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-teal-600" />
                      <span className="font-semibold text-sm">{type?.label}</span>
                      <Badge className={st.color + ' text-xs'}>{st.label}</Badge>
                    </div>
                    {g.provider && <p className="text-xs text-muted-foreground mt-0.5">{g.provider}{g.policyNumber ? ` · Póliza: ${g.policyNumber}` : ''}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(g)} className="p-1.5 rounded-lg hover:bg-muted"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDelete(g.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>

                {/* Guarantor info */}
                {g.guarantorName && (
                  <div className="bg-muted/50 rounded-lg p-2.5 mb-2">
                    <p className="text-xs font-medium mb-1">Garante</p>
                    <p className="text-sm font-medium">{g.guarantorName}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                      {g.guarantorDni && <span>DNI: {g.guarantorDni}</span>}
                      {g.guarantorPhone && <span className="flex items-center gap-0.5"><Phone className="h-3 w-3" />{g.guarantorPhone}</span>}
                      {g.guarantorEmail && <span className="flex items-center gap-0.5"><Mail className="h-3 w-3" />{g.guarantorEmail}</span>}
                    </div>
                    {g.guarantorAddress && <p className="text-xs text-muted-foreground mt-0.5">{g.guarantorAddress}</p>}
                  </div>
                )}

                {/* Coverage & dates */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {g.coverageAmount && <span>Cobertura: <strong className="text-foreground">{formatCurrency(Number(g.coverageAmount), g.currency)}</strong></span>}
                  {g.startDate && <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" /> Desde: {formatDate(g.startDate)}</span>}
                  {g.expirationDate && (
                    <span className={`flex items-center gap-0.5 ${isExpiringSoon ? 'text-amber-600 font-semibold' : ''}`}>
                      <Calendar className="h-3 w-3" /> Vence: {formatDate(g.expirationDate)}
                    </span>
                  )}
                </div>

                {g.documentUrl && (
                  <a href={g.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:underline">
                    <FileText className="h-3 w-3" /> Ver documento
                  </a>
                )}

                {g.notes && <p className="text-xs text-muted-foreground mt-2 italic">{g.notes}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {guarantees.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <ShieldCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay garantías registradas</p>
          <Button variant="outline" className="mt-3" onClick={() => { setForm(emptyForm); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Registrar garantía
          </Button>
        </div>
      )}

      {/* Create/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold">{editingId ? 'Editar garantía' : 'Nueva garantía'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">ID Contrato *</label>
                  <input className="w-full px-3 py-2 rounded-lg border bg-background text-sm" placeholder="ID del contrato" value={form.contractId} onChange={e => setForm(f => ({ ...f, contractId: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipo *</label>
                  <select className="w-full px-3 py-2 rounded-lg border bg-background text-sm" value={form.guaranteeType} onChange={e => setForm(f => ({ ...f, guaranteeType: e.target.value }))}>
                    {GUARANTEE_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Proveedor/Compañía</label>
                  <input className="w-full px-3 py-2 rounded-lg border bg-background text-sm" placeholder="Porto Seguros, etc." value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">N° Póliza</label>
                  <input className="w-full px-3 py-2 rounded-lg border bg-background text-sm" value={form.policyNumber} onChange={e => setForm(f => ({ ...f, policyNumber: e.target.value }))} />
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-muted-foreground mb-3">Garante</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Nombre</label>
                    <input className="w-full px-3 py-2 rounded-lg border bg-background text-sm" value={form.guarantorName} onChange={e => setForm(f => ({ ...f, guarantorName: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">DNI</label>
                    <input className="w-full px-3 py-2 rounded-lg border bg-background text-sm" value={form.guarantorDni} onChange={e => setForm(f => ({ ...f, guarantorDni: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Teléfono</label>
                    <input className="w-full px-3 py-2 rounded-lg border bg-background text-sm" value={form.guarantorPhone} onChange={e => setForm(f => ({ ...f, guarantorPhone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                    <input className="w-full px-3 py-2 rounded-lg border bg-background text-sm" value={form.guarantorEmail} onChange={e => setForm(f => ({ ...f, guarantorEmail: e.target.value }))} />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Dirección</label>
                  <input className="w-full px-3 py-2 rounded-lg border bg-background text-sm" value={form.guarantorAddress} onChange={e => setForm(f => ({ ...f, guarantorAddress: e.target.value }))} />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Cobertura</label>
                    <div className="flex gap-1">
                      <select className="px-2 py-2 rounded-lg border bg-background text-sm w-20" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                        <option value="ARS">ARS</option>
                        <option value="USD">USD</option>
                      </select>
                      <input className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm" type="number" value={form.coverageAmount} onChange={e => setForm(f => ({ ...f, coverageAmount: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Estado</label>
                    <select className="w-full px-3 py-2 rounded-lg border bg-background text-sm" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                      {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Fecha inicio</label>
                    <input className="w-full px-3 py-2 rounded-lg border bg-background text-sm" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Vencimiento</label>
                    <input className="w-full px-3 py-2 rounded-lg border bg-background text-sm" type="date" value={form.expirationDate} onChange={e => setForm(f => ({ ...f, expirationDate: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Notas</label>
                <textarea className="w-full px-3 py-2 rounded-lg border bg-background text-sm resize-none" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleSave} disabled={!form.contractId.trim()}>
                {editingId ? 'Guardar' : 'Registrar garantía'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
