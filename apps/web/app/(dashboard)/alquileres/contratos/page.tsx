'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText, Plus, ChevronRight, Building2, Users, Calendar,
  DollarSign, Loader2, Search, X, Pencil, AlertTriangle,
  CheckCircle2, Clock, ArrowLeft, Ban, Landmark, Shield, Info,
  Printer,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: 'Activo', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
  draft: { label: 'Borrador', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
  expired: { label: 'Vencido', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' },
  terminated: { label: 'Terminado', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
};

const STATUS_BORDER: Record<string, string> = {
  active: 'border-l-emerald-500',
  draft: 'border-l-slate-400',
  expired: 'border-l-red-500',
  terminated: 'border-l-amber-500',
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const inputClasses = 'w-full mt-1 h-10 rounded-md border border-input bg-white dark:bg-neutral-800 dark:border-neutral-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors placeholder:text-muted-foreground dark:placeholder:text-neutral-500 dark:text-neutral-100';

function ContratosSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2"><div className="h-8 w-48 bg-muted dark:bg-neutral-700 rounded-lg" /><div className="h-4 w-64 bg-muted dark:bg-neutral-700 rounded" /></div>
        <div className="h-9 w-36 bg-muted dark:bg-neutral-700 rounded-lg" />
      </div>
      <div className="flex gap-3"><div className="h-10 flex-1 bg-muted dark:bg-neutral-700 rounded-lg" /><div className="flex gap-2">{[1,2,3,4].map(i => <div key={i} className="h-9 w-20 bg-muted dark:bg-neutral-700 rounded-lg" />)}</div></div>
      {[1,2,3,4].map(i => <div key={i} className="h-[88px] rounded-xl bg-muted dark:bg-neutral-700" />)}
    </div>
  );
}

export default function ContratosPage() {
  const router = useRouter();
  const { api } = useApi();
  const formRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<any[]>([]);
  const [hideGuide, setHideGuide] = useState(true);
  useEffect(() => { setHideGuide(!!localStorage.getItem('hide-guide-contratos')); }, []);
  const [properties, setProperties] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    propertyId: '', rentalTenantId: '', startDate: '', endDate: '',
    monthlyRent: '', securityDeposit: '', adjustmentIndex: 'ICL',
    adjustmentFrequency: '12', commissionType: 'percentage', commissionValue: '5',
    guaranteeType: '', contractNumber: '', notes: '',
  });

  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [contractPayments, setContractPayments] = useState<any[]>([]);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [markForm, setMarkForm] = useState({ paidAmount: '', paymentMethod: 'transferencia' });

  // Document generation
  const [docTemplates, setDocTemplates] = useState<any[]>([]);
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [generatingDoc, setGeneratingDoc] = useState(false);

  const loadData = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    try {
      const [c, p, t] = await Promise.all([
        api.getRentalContracts({ status: filterStatus || undefined }),
        api.getRentalProperties(),
        api.getRentalTenants(),
      ]);
      setContracts(c);
      setProperties(p);
      setTenants(t);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [api, filterStatus]);

  useEffect(() => { loadData(); }, [loadData]);

  const resetForm = () => {
    setForm({ propertyId: '', rentalTenantId: '', startDate: '', endDate: '', monthlyRent: '', securityDeposit: '', adjustmentIndex: 'ICL', adjustmentFrequency: '12', commissionType: 'percentage', commissionValue: '5', guaranteeType: '', contractNumber: '', notes: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!api || !form.propertyId || !form.rentalTenantId || !form.startDate || !form.endDate || !form.monthlyRent) return;
    setSaving(true);
    try {
      const data = {
        ...form,
        monthlyRent: Number(form.monthlyRent),
        securityDeposit: form.securityDeposit ? Number(form.securityDeposit) : undefined,
        adjustmentFrequency: Number(form.adjustmentFrequency),
        commissionValue: Number(form.commissionValue),
        guaranteeType: form.guaranteeType || undefined,
        contractNumber: form.contractNumber || undefined,
        notes: form.notes || undefined,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      };
      if (editingId) {
        await api.updateRentalContract(editingId, data);
      } else {
        await api.createRentalContract(data);
      }
      resetForm();
      loadData();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const openDetail = async (id: string) => {
    if (!api) return;
    try {
      const [c, payments] = await Promise.all([
        api.getRentalContract(id),
        api.getRentalContractPayments(id),
      ]);
      setSelectedContract(c);
      setContractPayments(payments);
    } catch (e) { console.error(e); }
  };

  const handleMarkPayment = async (paymentId: string) => {
    if (!api || !markForm.paidAmount) return;
    setSaving(true);
    try {
      await api.markRentalPayment(paymentId, {
        paidAmount: Number(markForm.paidAmount),
        paymentMethod: markForm.paymentMethod,
      });
      setMarkingId(null);
      setMarkForm({ paidAmount: '', paymentMethod: 'transferencia' });
      if (selectedContract) openDetail(selectedContract.id);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const openDocModal = async () => {
    if (!api) return;
    try {
      const tpls = await api.getDocumentTemplates();
      setDocTemplates(tpls);
      setSelectedTemplateId(tpls.find((t: any) => t.isDefault && t.category === 'contrato')?.id || tpls[0]?.id || '');
      setShowDocModal(true);
    } catch (e) { console.error(e); }
  };

  const handleGenerateDoc = async () => {
    if (!api || !selectedTemplateId || !selectedContract) return;
    setGeneratingDoc(true);
    try {
      const result = await api.renderDocument(selectedTemplateId, { contractId: selectedContract.id });
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Documento</title>
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; padding: 40px; font-family: 'Times New Roman', Georgia, serif; color: #1a1a1a; background: #fff; }
  @media screen {
    body { max-width: 900px; margin: 0 auto; padding: 40px 60px; min-height: 100vh; box-shadow: 0 0 30px rgba(0,0,0,0.08); }
  }
  @media print {
    body { padding: 0; }
    @page { size: A4; margin: 2cm 2.5cm; }
  }
  table { border-collapse: collapse; }
  img { max-width: 100%; }
  h1, h2, h3 { page-break-after: avoid; }
  p { orphans: 3; widows: 3; }
</style></head><body>${result.html}</body></html>`);
        win.document.close();
      }
      setShowDocModal(false);
    } catch (e) { console.error(e); }
    finally { setGeneratingDoc(false); }
  };

  const handleTerminate = async (id: string) => {
    if (!api) return;
    if (!confirm('¿Terminás este contrato? Se eliminarán los períodos pendientes sin pagar.')) return;
    try {
      await api.terminateRentalContract(id);
      setSelectedContract(null);
      loadData();
    } catch (e) { console.error(e); }
  };

  const filtered = contracts.filter(c => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.property?.name?.toLowerCase().includes(s) || c.rentalTenant?.name?.toLowerCase().includes(s) || c.contractNumber?.toLowerCase().includes(s);
  });

  // ===================== DETAIL VIEW =====================
  if (selectedContract) {
    const c = selectedContract;
    const st = STATUS_MAP[c.status] || STATUS_MAP.draft;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 dark:hover:bg-neutral-700" onClick={() => setSelectedContract(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold dark:text-white">{c.property?.name}</h1>
            <p className="text-sm text-muted-foreground dark:text-neutral-400">Contrato {c.contractNumber || '#' + c.id.slice(0, 8)}</p>
          </div>
          <Badge className={st.color}>{st.label}</Badge>
        </div>

        {/* Contract Info Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-500/5 to-violet-600/5 dark:from-violet-900/20 dark:to-violet-900/10 dark:border dark:border-neutral-700 overflow-hidden relative">
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-violet-500/5 dark:bg-violet-500/10 rounded-full" />
            <CardContent className="p-4 relative">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                <p className="text-xs text-muted-foreground dark:text-neutral-400">Inquilino</p>
              </div>
              <p className="font-semibold dark:text-white">{c.rentalTenant?.name}</p>
              <p className="text-xs text-muted-foreground dark:text-neutral-500">{c.rentalTenant?.phone}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 dark:from-emerald-900/20 dark:to-emerald-900/10 dark:border dark:border-neutral-700 overflow-hidden relative">
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full" />
            <CardContent className="p-4 relative">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                <p className="text-xs text-muted-foreground dark:text-neutral-400">Alquiler Mensual</p>
              </div>
              <p className="font-semibold text-lg dark:text-white">{formatCurrency(Number(c.monthlyRent))}</p>
              <p className="text-xs text-muted-foreground dark:text-neutral-500">Ajuste: {c.adjustmentIndex || 'Sin ajuste'} cada {c.adjustmentFrequency}m</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500/5 to-blue-600/5 dark:from-blue-900/20 dark:to-blue-900/10 dark:border dark:border-neutral-700 overflow-hidden relative">
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-blue-500/5 dark:bg-blue-500/10 rounded-full" />
            <CardContent className="p-4 relative">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                <p className="text-xs text-muted-foreground dark:text-neutral-400">Vigencia</p>
              </div>
              <p className="font-semibold text-sm dark:text-white">{formatDate(c.startDate)} - {formatDate(c.endDate)}</p>
              <p className="text-xs text-muted-foreground dark:text-neutral-500">Comisión: {c.commissionValue}%</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-500/5 to-amber-600/5 dark:from-amber-900/20 dark:to-amber-900/10 dark:border dark:border-neutral-700 overflow-hidden relative">
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-amber-500/5 dark:bg-amber-500/10 rounded-full" />
            <CardContent className="p-4 relative">
              <div className="flex items-center gap-2 mb-2">
                <Landmark className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                <p className="text-xs text-muted-foreground dark:text-neutral-400">Propietario</p>
              </div>
              <p className="font-semibold dark:text-white">{c.property?.owner?.name}</p>
              <p className="text-xs text-muted-foreground dark:text-neutral-500">{c.property?.owner?.phone}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" className="dark:border-neutral-600 dark:hover:bg-neutral-700 dark:text-neutral-200" onClick={openDocModal}>
            <Printer className="h-4 w-4 mr-1.5" /> Generar documento
          </Button>
          {c.status === 'active' && (
            <Button variant="destructive" size="sm" className="dark:bg-red-600 dark:hover:bg-red-700" onClick={() => handleTerminate(c.id)}>
              <Ban className="h-4 w-4 mr-1.5" /> Terminar contrato
            </Button>
          )}
        </div>

        {/* Payments */}
        <Card className="border shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm dark:border-neutral-700 overflow-hidden">
          <CardHeader className="pb-3 border-b bg-slate-50/50 dark:bg-neutral-700/30 dark:border-neutral-700">
            <CardTitle className="text-lg dark:text-white">Pagos mensuales</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y dark:divide-neutral-700">
              {contractPayments.map((p: any) => {
                const isPaid = p.status === 'paid';
                const isPartial = p.status === 'partial';
                const isPending = p.status === 'pending';
                const isMarking = markingId === p.id;
                return (
                  <div key={p.id}>
                    <div className="flex items-center gap-3 p-3 sm:p-4 hover:bg-slate-50/50 dark:hover:bg-neutral-700/50 transition-colors">
                      <div className={`p-2 rounded-xl shrink-0 ${isPaid ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : isPartial ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-neutral-700 text-slate-500 dark:text-neutral-400'}`}>
                        {isPaid ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium dark:text-white">
                          {['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][p.periodMonth]} {p.periodYear}
                        </p>
                        {p.paymentMethod && <p className="text-xs text-muted-foreground dark:text-neutral-500 capitalize">{p.paymentMethod} - {p.paymentDate ? formatDate(p.paymentDate) : ''}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold dark:text-white">{formatCurrency(Number(p.expectedAmount))}</p>
                        {isPartial && <p className="text-xs text-amber-600 dark:text-amber-400">Pagó {formatCurrency(Number(p.paidAmount))} ({Number(p.coveragePercent).toFixed(0)}%)</p>}
                      </div>
                      {(isPending || isPartial) && (
                        <Button size="sm" variant="outline" className="shrink-0 dark:border-neutral-600 dark:hover:bg-neutral-700 dark:text-neutral-200" onClick={() => { setMarkingId(isMarking ? null : p.id); setMarkForm({ paidAmount: String(Number(p.expectedAmount) - Number(p.paidAmount)), paymentMethod: 'transferencia' }); }}>
                          {isMarking ? 'Cancelar' : 'Cobrar'}
                        </Button>
                      )}
                    </div>
                    {isMarking && (
                      <div className="p-3 sm:p-4 bg-slate-50/50 dark:bg-neutral-700/30 border-t dark:border-neutral-700 flex flex-col sm:flex-row gap-3 items-end animate-in fade-in">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Monto cobrado</label>
                            <input type="number" className={inputClasses} value={markForm.paidAmount} onChange={e => setMarkForm(f => ({ ...f, paidAmount: e.target.value }))} />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Medio de pago</label>
                            <select className={inputClasses} value={markForm.paymentMethod} onChange={e => setMarkForm(f => ({ ...f, paymentMethod: e.target.value }))}>
                              <option value="transferencia">Transferencia</option>
                              <option value="efectivo">Efectivo</option>
                              <option value="cheque">Cheque</option>
                              <option value="deposito">Depósito</option>
                            </select>
                          </div>
                        </div>
                        <Button size="sm" disabled={saving || !markForm.paidAmount} onClick={() => handleMarkPayment(p.id)}>
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                          Confirmar cobro
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Document generation modal */}
        {showDocModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDocModal(false)}>
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b dark:border-neutral-700">
                <div>
                  <h2 className="text-lg font-bold dark:text-white">Generar documento</h2>
                  <p className="text-xs text-muted-foreground dark:text-neutral-400">Los datos del contrato se completan automáticamente</p>
                </div>
                <button onClick={() => setShowDocModal(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700"><X className="h-5 w-5 dark:text-neutral-300" /></button>
              </div>
              <div className="p-5 space-y-4">
                {docTemplates.length === 0 ? (
                  <div className="text-center py-6">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground dark:text-neutral-400">No hay plantillas creadas</p>
                    <p className="text-xs text-muted-foreground/70 dark:text-neutral-500 mt-1">Andá a Documentos para crear tu primera plantilla</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400 mb-1 block">Elegí la plantilla</label>
                      <select
                        className={inputClasses}
                        value={selectedTemplateId}
                        onChange={e => setSelectedTemplateId(e.target.value)}
                      >
                        {docTemplates.map((t: any) => (
                          <option key={t.id} value={t.id}>
                            {t.name} {t.isDefault ? '(predeterminada)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 p-3">
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        Se van a completar: inquilino, propietario, propiedad, monto, fechas y más datos del contrato.
                      </p>
                    </div>
                  </>
                )}
              </div>
              {docTemplates.length > 0 && (
                <div className="flex gap-2 p-5 border-t dark:border-neutral-700">
                  <Button variant="outline" className="flex-1 dark:border-neutral-600 dark:hover:bg-neutral-700" onClick={() => setShowDocModal(false)}>Cancelar</Button>
                  <Button className="flex-1" onClick={handleGenerateDoc} disabled={generatingDoc || !selectedTemplateId}>
                    {generatingDoc ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Printer className="h-4 w-4 mr-1" />}
                    Generar e imprimir
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===================== LIST VIEW =====================
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-white">Contratos</h1>
          <p className="text-muted-foreground dark:text-neutral-400 text-sm mt-1">Gestión de contratos de alquiler</p>
        </div>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); }}>
          <Plus className="h-4 w-4 mr-1.5" /> Nuevo contrato
        </Button>
      </div>

      {/* Info Guide */}
      {hideGuide ? (
        <button onClick={() => { localStorage.removeItem('hide-guide-contratos'); setHideGuide(false); }} className="flex items-center gap-1.5 text-[11px] text-blue-500/70 dark:text-blue-400/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <Info className="h-3 w-3" /> Ver guía de uso
        </button>
      ) : (
        <div className="relative rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50/80 dark:bg-blue-950/20 p-4 sm:p-5 shadow-sm">
          <button onClick={() => { localStorage.setItem('hide-guide-contratos', '1'); setHideGuide(true); }} className="absolute top-3 right-3 p-1 rounded-full hover:bg-blue-200/50 dark:hover:bg-blue-800/30 transition-colors">
            <X className="h-3.5 w-3.5 text-blue-400" />
          </button>
          <div className="flex gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 h-fit shrink-0">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-1.5 text-xs text-blue-800/80 dark:text-blue-200/80">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Contratos de alquiler</p>
              <p>Vinculá una <strong>propiedad</strong> con un <strong>inquilino</strong>, definí monto, duración e índice de ajuste (ICL o IPC).</p>
              <p>Al crear el contrato se generan automáticamente los <strong>cobros mensuales</strong>. Hacé click en un contrato para ver sus pagos y marcarlos como cobrados.</p>
              <p>Podés <strong>terminar</strong> un contrato anticipadamente — los pagos futuros se cancelan.</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-neutral-500" />
          <input className="w-full pl-9 pr-3 h-10 text-sm border rounded-lg bg-white dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors" placeholder="Buscar por propiedad, inquilino..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', 'active', 'expired', 'terminated'].map(s => (
            <Button key={s} variant={filterStatus === s ? 'default' : 'outline'} size="sm" className={filterStatus !== s ? 'dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700' : ''} onClick={() => setFilterStatus(s)}>
              {s === '' ? 'Todos' : STATUS_MAP[s]?.label || s}
            </Button>
          ))}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div ref={formRef} className="rounded-xl border dark:border-neutral-700 shadow-sm bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="px-5 py-3 border-b bg-slate-50/50 dark:bg-neutral-700/50 dark:border-neutral-700">
            <h3 className="text-base font-semibold dark:text-white">{editingId ? 'Editar contrato' : 'Nuevo contrato'}</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Propiedad *</label>
                <select className={inputClasses} value={form.propertyId} onChange={e => setForm(f => ({ ...f, propertyId: e.target.value }))}>
                  <option value="">Seleccionar...</option>
                  {properties.map((p: any) => <option key={p.id} value={p.id}>{p.name} - {p.address}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Inquilino *</label>
                <select className={inputClasses} value={form.rentalTenantId} onChange={e => setForm(f => ({ ...f, rentalTenantId: e.target.value }))}>
                  <option value="">Seleccionar...</option>
                  {tenants.map((t: any) => <option key={t.id} value={t.id}>{t.name}{t.dni ? ` (DNI: ${t.dni})` : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">N° Contrato</label>
                <input className={inputClasses} value={form.contractNumber} onChange={e => setForm(f => ({ ...f, contractNumber: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Fecha inicio *</label>
                <input type="date" className={inputClasses} value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Fecha fin *</label>
                <input type="date" className={inputClasses} value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Alquiler mensual *</label>
                <input type="number" className={inputClasses} placeholder="350000" value={form.monthlyRent} onChange={e => setForm(f => ({ ...f, monthlyRent: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Depósito</label>
                <input type="number" className={inputClasses} value={form.securityDeposit} onChange={e => setForm(f => ({ ...f, securityDeposit: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Índice de ajuste</label>
                <select className={inputClasses} value={form.adjustmentIndex} onChange={e => setForm(f => ({ ...f, adjustmentIndex: e.target.value }))}>
                  <option value="ICL">ICL</option>
                  <option value="IPC">IPC</option>
                  <option value="custom">Personalizado</option>
                  <option value="none">Sin ajuste</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Frecuencia ajuste (meses)</label>
                <input type="number" className={inputClasses} value={form.adjustmentFrequency} onChange={e => setForm(f => ({ ...f, adjustmentFrequency: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Comisión (%)</label>
                <input type="number" className={inputClasses} value={form.commissionValue} onChange={e => setForm(f => ({ ...f, commissionValue: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Garantía</label>
                <select className={inputClasses} value={form.guaranteeType} onChange={e => setForm(f => ({ ...f, guaranteeType: e.target.value }))}>
                  <option value="">Sin garantía</option>
                  <option value="propietaria">Propietaria</option>
                  <option value="caucion">Caución</option>
                  <option value="bancaria">Bancaria</option>
                  <option value="seguro_caucion">Seguro de caución</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" size="sm" className="dark:hover:bg-neutral-700 dark:text-neutral-300" onClick={resetForm}>Cancelar</Button>
              <Button size="sm" disabled={saving || !form.propertyId || !form.rentalTenantId || !form.startDate || !form.endDate || !form.monthlyRent} onClick={handleSave}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                {editingId ? 'Guardar' : 'Crear contrato'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <ContratosSkeleton />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 dark:from-blue-900/30 dark:to-violet-900/30 flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-blue-500/50 dark:text-blue-400/50" />
          </div>
          <p className="font-medium text-muted-foreground dark:text-neutral-400">{search ? 'Sin resultados' : 'No hay contratos'}</p>
          <p className="text-sm text-muted-foreground/70 dark:text-neutral-500 mt-1">{search ? 'Probá con otro término de búsqueda' : 'Creá tu primer contrato de alquiler'}</p>
          {!search && (
            <Button size="sm" className="mt-4" onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Crear primer contrato
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => {
            const st = STATUS_MAP[c.status] || STATUS_MAP.draft;
            const borderColor = STATUS_BORDER[c.status] || 'border-l-slate-400';
            const daysLeft = Math.ceil((new Date(c.endDate).getTime() - Date.now()) / 86400000);
            const isExpiring = c.status === 'active' && daysLeft <= 60 && daysLeft > 0;
            return (
              <Card key={c.id} className={`border-0 border-l-4 ${borderColor} shadow-sm hover:shadow-md bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm dark:border-r dark:border-y dark:border-r-neutral-700 dark:border-y-neutral-700 transition-all cursor-pointer group hover:-translate-y-0.5 active:scale-[0.98]`} onClick={() => openDetail(c.id)}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-900/30 dark:to-blue-900/20 shrink-0">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold truncate dark:text-white">{c.property?.name || 'Propiedad'}</p>
                      <Badge className={`${st.color} text-[10px]`}>{st.label}</Badge>
                      {isExpiring && <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400"><AlertTriangle className="h-3 w-3 mr-0.5" /> Vence en {daysLeft}d</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground dark:text-neutral-400 truncate">
                      <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {c.rentalTenant?.name}</span>
                      <span className="mx-2">·</span>
                      <span>{formatDate(c.startDate)} - {formatDate(c.endDate)}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="font-semibold dark:text-white">{formatCurrency(Number(c.monthlyRent))}</p>
                    <p className="text-xs text-muted-foreground dark:text-neutral-500">/mes</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground dark:text-neutral-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
