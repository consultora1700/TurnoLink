'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Users, Plus, Pencil, Trash2, X, Loader2, Search, Phone, Mail, Briefcase, Building2, Info } from 'lucide-react';

export default function InquilinosPage() {
  const { api } = useApi();
  const formRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<any[]>([]);
  const [hideGuide, setHideGuide] = useState(true);
  useEffect(() => { setHideGuide(!!localStorage.getItem('hide-guide-inquilinos')); }, []);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', dni: '', phone: '', email: '', employer: '', monthlyIncome: '', emergencyContact: '', emergencyPhone: '', notes: '' });

  const loadData = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    try { setTenants(await api.getRentalTenants()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [api]);

  useEffect(() => { loadData(); }, [loadData]);

  const resetForm = () => {
    setForm({ name: '', dni: '', phone: '', email: '', employer: '', monthlyIncome: '', emergencyContact: '', emergencyPhone: '', notes: '' });
    setEditingId(null); setShowForm(false);
  };

  const handleEdit = (t: any) => {
    setEditingId(t.id);
    setForm({ name: t.name || '', dni: t.dni || '', phone: t.phone || '', email: t.email || '', employer: t.employer || '', monthlyIncome: t.monthlyIncome ? String(Number(t.monthlyIncome)) : '', emergencyContact: t.emergencyContact || '', emergencyPhone: t.emergencyPhone || '', notes: t.notes || '' });
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  const handleSave = async () => {
    if (!api || !form.name) return;
    setSaving(true);
    try {
      const data = { ...form, monthlyIncome: form.monthlyIncome ? Number(form.monthlyIncome) : undefined };
      if (editingId) await api.updateRentalTenant(editingId, data);
      else await api.createRentalTenant(data);
      resetForm(); loadData();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!api) return;
    try { await api.deleteRentalTenant(id); setDeletingId(null); loadData(); }
    catch (e: any) { alert(e.message || 'Error al eliminar'); setDeletingId(null); }
  };

  const filtered = tenants.filter(t => {
    if (!search) return true;
    const s = search.toLowerCase();
    return t.name?.toLowerCase().includes(s) || t.dni?.includes(s) || t.phone?.includes(s);
  });

  const COLORS = ['from-blue-500 to-blue-600', 'from-emerald-500 to-emerald-600', 'from-violet-500 to-violet-600', 'from-amber-500 to-amber-600', 'from-rose-500 to-rose-600', 'from-cyan-500 to-cyan-600'];

  const inputClass = 'w-full mt-1 h-10 rounded-md border border-input bg-white dark:bg-neutral-800 dark:border-neutral-600 px-3 py-2 text-sm text-foreground dark:text-neutral-100 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 dark:focus:ring-offset-neutral-900 transition-colors';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground dark:text-neutral-50">
            Inquilinos
          </h1>
          <p className="text-muted-foreground dark:text-neutral-400 text-sm mt-1">
            Gestiona tus inquilinos y su informacion de contacto
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => { resetForm(); setShowForm(true); setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); }}
          className="shadow-sm"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Nuevo inquilino
        </Button>
      </div>

      {/* Info Guide */}
      {hideGuide ? (
        <button onClick={() => { localStorage.removeItem('hide-guide-inquilinos'); setHideGuide(false); }} className="flex items-center gap-1.5 text-[11px] text-blue-500/70 dark:text-blue-400/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <Info className="h-3 w-3" /> Ver guía de uso
        </button>
      ) : (
        <div className="relative rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50/80 dark:bg-blue-950/20 p-4 sm:p-5 shadow-sm">
          <button onClick={() => { localStorage.setItem('hide-guide-inquilinos', '1'); setHideGuide(true); }} className="absolute top-3 right-3 p-1 rounded-full hover:bg-blue-200/50 dark:hover:bg-blue-800/30 transition-colors">
            <X className="h-3.5 w-3.5 text-blue-400" />
          </button>
          <div className="flex gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 h-fit shrink-0">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-1.5 text-xs text-blue-800/80 dark:text-blue-200/80">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Inquilinos</p>
              <p>Registrá a las personas que alquilan. Cargá <strong>DNI, empleador e ingreso mensual</strong> para tener su perfil completo.</p>
              <p>Se vinculan a una propiedad al crear un <strong>Contrato</strong> en la sección Contratos.</p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-neutral-400" />
        <input
          className="w-full pl-9 pr-3 h-10 text-sm border rounded-lg bg-white dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100 border-input placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 dark:focus:ring-offset-neutral-900 transition-colors"
          placeholder="Buscar por nombre, DNI o telefono..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Form */}
      {showForm && (
        <div
          ref={formRef}
          className="rounded-xl border border-border dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm shadow-sm animate-in fade-in slide-in-from-top-2 overflow-hidden"
        >
          <div className="bg-slate-50/50 dark:bg-neutral-700/50 border-b border-border dark:border-neutral-700 px-5 py-3.5">
            <h3 className="text-base font-semibold text-foreground dark:text-neutral-100">
              {editingId ? 'Editar inquilino' : 'Nuevo inquilino'}
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Nombre completo *</label>
                <input className={inputClass} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">DNI</label>
                <input className={inputClass} value={form.dni} onChange={e => setForm(f => ({ ...f, dni: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Telefono</label>
                <input className={inputClass} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Email</label>
                <input type="email" className={inputClass} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Empleador</label>
                <input className={inputClass} value={form.employer} onChange={e => setForm(f => ({ ...f, employer: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Ingreso mensual</label>
                <input type="number" className={inputClass} value={form.monthlyIncome} onChange={e => setForm(f => ({ ...f, monthlyIncome: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Contacto emergencia</label>
                <input className={inputClass} value={form.emergencyContact} onChange={e => setForm(f => ({ ...f, emergencyContact: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Tel. emergencia</label>
                <input className={inputClass} value={form.emergencyPhone} onChange={e => setForm(f => ({ ...f, emergencyPhone: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Notas</label>
                <input className={inputClass} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" size="sm" onClick={resetForm} className="dark:text-neutral-300 dark:hover:bg-neutral-700">
                Cancelar
              </Button>
              <Button size="sm" disabled={saving || !form.name} onClick={handleSave} className="shadow-sm">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                {editingId ? 'Guardar' : 'Crear inquilino'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        /* Skeleton loading grid */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className="rounded-xl border border-border dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm overflow-hidden"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted dark:bg-neutral-700 animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-28 bg-muted dark:bg-neutral-700 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-muted dark:bg-neutral-700 rounded animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2 pt-1">
                  <div className="h-3 w-36 bg-muted dark:bg-neutral-700 rounded animate-pulse" />
                  <div className="h-3 w-44 bg-muted dark:bg-neutral-700 rounded animate-pulse" />
                </div>
              </div>
              <div className="bg-slate-50/50 dark:bg-neutral-700/30 border-t border-border dark:border-neutral-700 px-4 py-2.5">
                <div className="h-3 w-32 bg-muted dark:bg-neutral-700 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        /* Premium empty state */
        <div className="rounded-xl border border-border dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 dark:from-blue-500/30 dark:to-violet-500/30 flex items-center justify-center">
              <Users className="h-8 w-8 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-base font-semibold text-foreground dark:text-neutral-100">
              {search ? 'Sin resultados' : 'No hay inquilinos'}
            </h3>
            <p className="text-sm text-muted-foreground dark:text-neutral-400 mt-1 max-w-sm mx-auto">
              {search
                ? `No se encontraron inquilinos que coincidan con "${search}"`
                : 'Agrega tu primer inquilino para empezar a gestionar tus alquileres'
              }
            </p>
          </div>
        </div>
      ) : (
        /* Tenant cards grid */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, idx) => (
            <div
              key={t.id}
              className="group rounded-xl border border-border dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${COLORS[idx % COLORS.length]} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground dark:text-neutral-100">{t.name}</p>
                      {t.dni && <p className="text-xs text-muted-foreground dark:text-neutral-400">DNI: {t.dni}</p>}
                    </div>
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
                      onClick={() => handleEdit(t)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    {deletingId === t.id ? (
                      <div className="flex gap-1">
                        <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDelete(t.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 dark:border-neutral-600 dark:hover:bg-neutral-700 dark:text-neutral-300"
                          onClick={() => setDeletingId(null)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 dark:text-red-400 dark:hover:bg-neutral-700"
                        onClick={() => setDeletingId(t.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-3 space-y-1.5">
                  {t.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-neutral-400">
                      <Phone className="h-3.5 w-3.5 shrink-0" /> {t.phone}
                    </div>
                  )}
                  {t.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-neutral-400">
                      <Mail className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{t.email}</span>
                    </div>
                  )}
                  {t.employer && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-neutral-400">
                      <Briefcase className="h-3.5 w-3.5 shrink-0" /> {t.employer}
                    </div>
                  )}
                </div>
              </div>
              {t.contracts?.length > 0 && (
                <div className="bg-slate-50/50 dark:bg-neutral-700/30 border-t border-border dark:border-neutral-700 px-4 py-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground dark:text-neutral-400">
                    <Building2 className="h-3 w-3 shrink-0" />
                    <span className="truncate">{t.contracts.map((c: any) => c.property?.name).join(', ')}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
