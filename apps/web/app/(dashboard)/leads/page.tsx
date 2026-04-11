'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Target, Plus, Phone, Mail, Calendar, ChevronDown, ChevronUp,
  MessageCircle, User, DollarSign, X, Search, Filter, Pencil, Trash2,
  ArrowRight, Clock, AlertTriangle, CheckCircle2, XCircle, Building2,
  Eye, Home, TrendingUp,
} from 'lucide-react';

const STAGES = [
  { key: 'nuevo', label: 'Nuevo', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50 dark:bg-blue-950/30', icon: Plus },
  { key: 'contactado', label: 'Contactado', color: 'bg-amber-500', textColor: 'text-amber-700', bgLight: 'bg-amber-50 dark:bg-amber-950/30', icon: Phone },
  { key: 'visita', label: 'Visita', color: 'bg-purple-500', textColor: 'text-purple-700', bgLight: 'bg-purple-50 dark:bg-purple-950/30', icon: Eye },
  { key: 'oferta', label: 'Oferta', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50 dark:bg-orange-950/30', icon: DollarSign },
  { key: 'reserva', label: 'Reserva', color: 'bg-teal-500', textColor: 'text-teal-700', bgLight: 'bg-teal-50 dark:bg-teal-950/30', icon: Home },
  { key: 'escritura', label: 'Escritura', color: 'bg-indigo-500', textColor: 'text-indigo-700', bgLight: 'bg-indigo-50 dark:bg-indigo-950/30', icon: Building2 },
  { key: 'cerrado', label: 'Cerrado', color: 'bg-emerald-500', textColor: 'text-emerald-700', bgLight: 'bg-emerald-50 dark:bg-emerald-950/30', icon: CheckCircle2 },
  { key: 'perdido', label: 'Perdido', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50 dark:bg-red-950/30', icon: XCircle },
];

const SOURCES = [
  { key: 'manual', label: 'Manual' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'web', label: 'Web' },
  { key: 'referido', label: 'Referido' },
  { key: 'portal', label: 'Portal' },
];

const PRIORITIES = [
  { key: 'alta', label: 'Alta', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  { key: 'media', label: 'Media', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { key: 'baja', label: 'Baja', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
];

const INTEREST_TYPES = [
  { key: 'compra', label: 'Compra' },
  { key: 'alquiler', label: 'Alquiler' },
  { key: 'inversion', label: 'Inversión' },
];

function formatDate(d: string | null) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
}

function formatCurrency(n: number, currency = 'USD') {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
}

export default function LeadsPage() {
  const { api } = useApi();
  const [leads, setLeads] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStage, setFilterStage] = useState<string>('');
  const [filterSource, setFilterSource] = useState<string>('');
  const [searchQ, setSearchQ] = useState('');
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline');

  const emptyForm = {
    name: '', phone: '', email: '', dni: '', source: 'manual', sourceDetail: '',
    stage: 'nuevo', priority: 'media', interestType: '', interestDetail: '',
    budget: '', budgetCurrency: 'USD', assignedTo: '', nextFollowUpAt: '', notes: '',
  };
  const [form, setForm] = useState(emptyForm);

  const loadData = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    try {
      const [l, s] = await Promise.all([
        api.getLeads({ stage: filterStage || undefined, source: filterSource || undefined }),
        api.getLeadStats(),
      ]);
      setLeads(l);
      setStats(s);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [api, filterStage, filterSource]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    if (!api || !form.name.trim()) return;
    try {
      const data: any = { ...form };
      if (data.budget) data.budget = parseFloat(data.budget);
      else delete data.budget;
      if (!data.nextFollowUpAt) delete data.nextFollowUpAt;
      Object.keys(data).forEach(k => { if (data[k] === '') delete data[k]; });

      if (editingId) await api.updateLead(editingId, data);
      else await api.createLead(data);

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      loadData();
    } catch (e) { console.error(e); }
  };

  const handleEdit = (lead: any) => {
    setForm({
      name: lead.name || '', phone: lead.phone || '', email: lead.email || '',
      dni: lead.dni || '', source: lead.source || 'manual', sourceDetail: lead.sourceDetail || '',
      stage: lead.stage || 'nuevo', priority: lead.priority || 'media',
      interestType: lead.interestType || '', interestDetail: lead.interestDetail || '',
      budget: lead.budget ? String(lead.budget) : '', budgetCurrency: lead.budgetCurrency || 'USD',
      assignedTo: lead.assignedTo || '', nextFollowUpAt: lead.nextFollowUpAt ? lead.nextFollowUpAt.slice(0, 10) : '',
      notes: lead.notes || '',
    });
    setEditingId(lead.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!api || !confirm('¿Eliminar este lead?')) return;
    await api.deleteLead(id);
    loadData();
  };

  const moveStage = async (lead: any, newStage: string) => {
    if (!api) return;
    await api.updateLead(lead.id, { stage: newStage });
    loadData();
  };

  const filtered = leads.filter(l =>
    !searchQ || l.name.toLowerCase().includes(searchQ.toLowerCase()) ||
    l.phone?.includes(searchQ) || l.email?.toLowerCase().includes(searchQ.toLowerCase())
  );

  const stageIdx = (stage: string) => STAGES.findIndex(s => s.key === stage);

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-24 rounded-xl bg-muted" />
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">{[1,2,3,4].map(i => <div key={i} className="h-24 rounded-xl bg-muted" />)}</div>
      <div className="h-96 rounded-xl bg-muted" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 p-4 sm:p-6 text-white shadow-lg">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">CRM — Leads</h1>
              <p className="text-sm text-white/70">{stats?.total || 0} leads · {stats?.followUpsToday || 0} seguimientos hoy</p>
            </div>
          </div>
          <Button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }} className="bg-white/20 hover:bg-white/30 text-white border-0">
            <Plus className="h-4 w-4 mr-1" /> Nuevo lead
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        {STAGES.slice(0, 4).map(s => {
          const count = stats?.byStage?.[s.key] || 0;
          return (
            <Card key={s.key} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStage(filterStage === s.key ? '' : s.key)}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.bgLight}`}>
                  <s.icon className={`h-4 w-4 ${s.textColor}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters + search */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-lg border bg-background text-sm"
            placeholder="Buscar por nombre, teléfono o email..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
          />
        </div>
        <select className="px-3 py-2 rounded-lg border bg-background text-sm" value={filterStage} onChange={e => setFilterStage(e.target.value)}>
          <option value="">Todas las etapas</option>
          {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <select className="px-3 py-2 rounded-lg border bg-background text-sm" value={filterSource} onChange={e => setFilterSource(e.target.value)}>
          <option value="">Todos los orígenes</option>
          {SOURCES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <div className="flex rounded-lg border overflow-hidden">
          <button className={`px-3 py-2 text-xs font-medium ${viewMode === 'pipeline' ? 'bg-primary text-primary-foreground' : 'bg-background'}`} onClick={() => setViewMode('pipeline')}>Pipeline</button>
          <button className={`px-3 py-2 text-xs font-medium ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background'}`} onClick={() => setViewMode('list')}>Lista</button>
        </div>
      </div>

      {/* Pipeline view */}
      {viewMode === 'pipeline' ? (
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2">
          {STAGES.filter(s => s.key !== 'perdido').map(stage => {
            const stageLeads = filtered.filter(l => l.stage === stage.key);
            return (
              <div key={stage.key} className="min-w-[260px] max-w-[280px] flex-shrink-0">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                  <span className="text-sm font-semibold">{stage.label}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">{stageLeads.length}</Badge>
                </div>
                <div className="space-y-2">
                  {stageLeads.map(lead => (
                    <Card key={lead.id} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => handleEdit(lead)}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-1.5">
                          <p className="font-semibold text-sm leading-tight">{lead.name}</p>
                          <Badge className={PRIORITIES.find(p => p.key === lead.priority)?.color + ' text-[10px] px-1.5 py-0 leading-tight'}>
                            {lead.priority}
                          </Badge>
                        </div>
                        {lead.interestType && (
                          <p className="text-xs text-muted-foreground mb-1">
                            {INTEREST_TYPES.find(t => t.key === lead.interestType)?.label}
                            {lead.budget ? ` · ${formatCurrency(Number(lead.budget), lead.budgetCurrency)}` : ''}
                          </p>
                        )}
                        {lead.interestDetail && <p className="text-xs text-muted-foreground truncate mb-1.5">{lead.interestDetail}</p>}
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          {lead.phone && <span className="flex items-center gap-0.5"><Phone className="h-3 w-3" />{lead.phone.slice(-4)}</span>}
                          {lead.source && <span className="capitalize">{lead.source}</span>}
                        </div>
                        {lead.nextFollowUpAt && (
                          <div className={`flex items-center gap-1 mt-1.5 text-[11px] ${new Date(lead.nextFollowUpAt) < new Date() ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}>
                            <Clock className="h-3 w-3" /> Seguimiento: {formatDate(lead.nextFollowUpAt)}
                          </div>
                        )}
                        {/* Stage navigation */}
                        <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                          {stageIdx(lead.stage) > 0 && (
                            <button onClick={() => moveStage(lead, STAGES[stageIdx(lead.stage) - 1].key)} className="px-2 py-0.5 rounded text-[10px] bg-muted hover:bg-muted/80">
                              ← {STAGES[stageIdx(lead.stage) - 1].label}
                            </button>
                          )}
                          {stageIdx(lead.stage) < STAGES.length - 2 && (
                            <button onClick={() => moveStage(lead, STAGES[stageIdx(lead.stage) + 1].key)} className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary hover:bg-primary/20 ml-auto">
                              {STAGES[stageIdx(lead.stage) + 1].label} →
                            </button>
                          )}
                          <button onClick={() => moveStage(lead, 'perdido')} className="px-1.5 py-0.5 rounded text-[10px] text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 ml-auto">
                            <XCircle className="h-3 w-3" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="text-center text-xs text-muted-foreground py-8 border border-dashed rounded-lg">
                      Sin leads
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List view */
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium">Lead</th>
                    <th className="text-left px-4 py-3 font-medium">Contacto</th>
                    <th className="text-left px-4 py-3 font-medium">Interés</th>
                    <th className="text-left px-4 py-3 font-medium">Etapa</th>
                    <th className="text-left px-4 py-3 font-medium">Seguimiento</th>
                    <th className="text-right px-4 py-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(lead => {
                    const stage = STAGES.find(s => s.key === lead.stage);
                    return (
                      <tr key={lead.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium">{lead.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">{lead.source}{lead.sourceDetail ? ` · ${lead.sourceDetail}` : ''}</div>
                        </td>
                        <td className="px-4 py-3">
                          {lead.phone && <div className="text-xs flex items-center gap-1"><Phone className="h-3 w-3" />{lead.phone}</div>}
                          {lead.email && <div className="text-xs flex items-center gap-1 text-muted-foreground"><Mail className="h-3 w-3" />{lead.email}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs">{INTEREST_TYPES.find(t => t.key === lead.interestType)?.label || '-'}</div>
                          {lead.budget && <div className="text-xs font-medium">{formatCurrency(Number(lead.budget), lead.budgetCurrency)}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`${stage?.bgLight} ${stage?.textColor} text-xs`}>{stage?.label}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          {lead.nextFollowUpAt ? (
                            <span className={`text-xs ${new Date(lead.nextFollowUpAt) < new Date() ? 'text-red-500 font-semibold' : ''}`}>
                              {formatDate(lead.nextFollowUpAt)}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex gap-1 justify-end">
                            {lead.phone && (
                              <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600">
                                <MessageCircle className="h-3.5 w-3.5" />
                              </a>
                            )}
                            <button onClick={() => handleEdit(lead)} className="p-1.5 rounded-lg hover:bg-muted">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => handleDelete(lead.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No hay leads{filterStage || filterSource ? ' con estos filtros' : ''}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Perdidos section */}
      {filtered.filter(l => l.stage === 'perdido').length > 0 && viewMode === 'pipeline' && (
        <Card className="border-red-200 dark:border-red-900/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-semibold text-red-700 dark:text-red-400">Perdidos</span>
              <Badge variant="secondary" className="text-xs">{filtered.filter(l => l.stage === 'perdido').length}</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {filtered.filter(l => l.stage === 'perdido').map(lead => (
                <div key={lead.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/20 text-sm">
                  <span className="font-medium truncate flex-1">{lead.name}</span>
                  <button onClick={() => moveStage(lead, 'nuevo')} className="text-xs text-blue-600 hover:underline whitespace-nowrap">Reactivar</button>
                  <button onClick={() => handleDelete(lead.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold">{editingId ? 'Editar lead' : 'Nuevo lead'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Nombre *</label>
                <input className="w-full px-3 py-2 rounded-lg border bg-background text-sm" placeholder="Juan Pérez" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              {/* Contact */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Teléfono</label>
                  <input className="w-full px-3 py-2 rounded-lg border bg-background text-sm" placeholder="+54 11 1234 5678" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                  <input className="w-full px-3 py-2 rounded-lg border bg-background text-sm" placeholder="juan@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              {/* Source + priority */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Origen</label>
                  <select className="w-full px-3 py-2 rounded-lg border bg-background text-sm" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
                    {SOURCES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Prioridad</label>
                  <select className="w-full px-3 py-2 rounded-lg border bg-background text-sm" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    {PRIORITIES.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Etapa</label>
                  <select className="w-full px-3 py-2 rounded-lg border bg-background text-sm" value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}>
                    {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              {/* Interest */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipo de interés</label>
                  <select className="w-full px-3 py-2 rounded-lg border bg-background text-sm" value={form.interestType} onChange={e => setForm(f => ({ ...f, interestType: e.target.value }))}>
                    <option value="">Sin definir</option>
                    {INTEREST_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Presupuesto</label>
                  <div className="flex gap-1">
                    <select className="px-2 py-2 rounded-lg border bg-background text-sm w-20" value={form.budgetCurrency} onChange={e => setForm(f => ({ ...f, budgetCurrency: e.target.value }))}>
                      <option value="USD">USD</option>
                      <option value="ARS">ARS</option>
                    </select>
                    <input className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm" type="number" placeholder="120000" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Detalle de búsqueda</label>
                <input className="w-full px-3 py-2 rounded-lg border bg-background text-sm" placeholder="2 amb Palermo hasta USD 120k" value={form.interestDetail} onChange={e => setForm(f => ({ ...f, interestDetail: e.target.value }))} />
              </div>
              {/* Follow up */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Próximo seguimiento</label>
                  <input className="w-full px-3 py-2 rounded-lg border bg-background text-sm" type="date" value={form.nextFollowUpAt} onChange={e => setForm(f => ({ ...f, nextFollowUpAt: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Asignado a</label>
                  <input className="w-full px-3 py-2 rounded-lg border bg-background text-sm" placeholder="Nombre del agente" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} />
                </div>
              </div>
              {/* Notes */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Notas</label>
                <textarea className="w-full px-3 py-2 rounded-lg border bg-background text-sm resize-none" rows={3} placeholder="Observaciones..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleSave} disabled={!form.name.trim()}>
                {editingId ? 'Guardar cambios' : 'Crear lead'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
