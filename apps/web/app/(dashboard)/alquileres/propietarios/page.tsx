'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Landmark, Plus, Pencil, Trash2, X, Loader2, Search, Building2,
  Phone, Mail, CreditCard, ChevronRight, ArrowLeft, Info,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PropietariosPage() {
  const router = useRouter();
  const { api } = useApi();
  const formRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [owners, setOwners] = useState<any[]>([]);
  const [hideGuide, setHideGuide] = useState(true);
  useEffect(() => { setHideGuide(!!localStorage.getItem('hide-guide-propietarios')); }, []);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', cuitCuil: '', cbu: '', bankName: '', alias: '', address: '', notes: '' });

  const loadData = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    try { setOwners(await api.getPropertyOwners()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [api]);

  useEffect(() => { loadData(); }, [loadData]);

  const resetForm = () => {
    setForm({ name: '', phone: '', email: '', cuitCuil: '', cbu: '', bankName: '', alias: '', address: '', notes: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (o: any) => {
    setEditingId(o.id);
    setForm({ name: o.name || '', phone: o.phone || '', email: o.email || '', cuitCuil: o.cuitCuil || '', cbu: o.cbu || '', bankName: o.bankName || '', alias: o.alias || '', address: o.address || '', notes: o.notes || '' });
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  const handleSave = async () => {
    if (!api || !form.name) return;
    setSaving(true);
    try {
      if (editingId) await api.updatePropertyOwner(editingId, form);
      else await api.createPropertyOwner(form);
      resetForm();
      loadData();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!api) return;
    try { await api.deletePropertyOwner(id); setDeletingId(null); loadData(); }
    catch (e: any) { alert(e.message || 'Error al eliminar'); setDeletingId(null); }
  };

  const filtered = owners.filter(o => {
    if (!search) return true;
    const s = search.toLowerCase();
    return o.name?.toLowerCase().includes(s) || o.phone?.includes(s) || o.email?.toLowerCase().includes(s);
  });

  const COLORS = ['from-violet-500 to-violet-600', 'from-blue-500 to-blue-600', 'from-emerald-500 to-emerald-600', 'from-amber-500 to-amber-600', 'from-rose-500 to-rose-600', 'from-cyan-500 to-cyan-600'];

  const inputClasses = 'w-full mt-1 h-10 rounded-md border border-input bg-white dark:bg-neutral-800 dark:border-neutral-600 px-3 py-2 text-sm text-foreground dark:text-neutral-100 placeholder:text-muted-foreground dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 dark:focus:ring-offset-neutral-900 transition-colors';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground dark:text-neutral-50">
            Propietarios
          </h1>
          <p className="text-muted-foreground dark:text-neutral-400 text-sm mt-1">
            Gestion de propietarios de inmuebles
          </p>
        </div>
        <Button
          size="sm"
          className="shadow-sm"
          onClick={() => { resetForm(); setShowForm(true); setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); }}
        >
          <Plus className="h-4 w-4 mr-1.5" /> Nuevo propietario
        </Button>
      </div>

      {/* Info Guide */}
      {hideGuide ? (
        <button onClick={() => { localStorage.removeItem('hide-guide-propietarios'); setHideGuide(false); }} className="flex items-center gap-1.5 text-[11px] text-blue-500/70 dark:text-blue-400/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <Info className="h-3 w-3" /> Ver guía de uso
        </button>
      ) : (
        <div className="relative rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50/80 dark:bg-blue-950/20 p-4 sm:p-5 shadow-sm">
          <button onClick={() => { localStorage.setItem('hide-guide-propietarios', '1'); setHideGuide(true); }} className="absolute top-3 right-3 p-1 rounded-full hover:bg-blue-200/50 dark:hover:bg-blue-800/30 transition-colors">
            <X className="h-3.5 w-3.5 text-blue-400" />
          </button>
          <div className="flex gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 h-fit shrink-0">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-1.5 text-xs text-blue-800/80 dark:text-blue-200/80">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Propietarios</p>
              <p>Registrá a los dueños de los inmuebles. Completá sus datos bancarios (<strong>CBU, banco, alias</strong>) para poder generar liquidaciones a fin de mes.</p>
              <p>Cada propietario se vincula con sus propiedades desde <strong>Catálogo &gt; Propiedades</strong>.</p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-neutral-500" />
        <input
          className="w-full pl-9 pr-3 h-10 text-sm border border-input rounded-lg bg-white dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100 placeholder:text-muted-foreground dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 dark:focus:ring-offset-neutral-900 transition-colors"
          placeholder="Buscar propietario..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Form */}
      {showForm && (
        <div
          ref={formRef}
          className="rounded-xl border border-border dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2"
        >
          <div className="bg-slate-50/50 dark:bg-neutral-700/50 border-b border-border dark:border-neutral-700 px-5 py-3.5">
            <h3 className="text-base font-semibold text-foreground dark:text-neutral-100">
              {editingId ? 'Editar propietario' : 'Nuevo propietario'}
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Nombre *</label>
                <input className={inputClasses} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Telefono</label>
                <input className={inputClasses} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Email</label>
                <input type="email" className={inputClasses} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">CUIT/CUIL</label>
                <input className={inputClasses} placeholder="20-12345678-9" value={form.cuitCuil} onChange={e => setForm(f => ({ ...f, cuitCuil: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">CBU</label>
                <input className={inputClasses} value={form.cbu} onChange={e => setForm(f => ({ ...f, cbu: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Alias bancario</label>
                <input className={inputClasses} value={form.alias} onChange={e => setForm(f => ({ ...f, alias: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Banco</label>
                <input className={inputClasses} value={form.bankName} onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Direccion</label>
                <input className={inputClasses} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground dark:text-neutral-400">Notas</label>
                <input className={inputClasses} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
                onClick={resetForm}
              >
                Cancelar
              </Button>
              <Button size="sm" disabled={saving || !form.name} onClick={handleSave} className="shadow-sm">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                {editingId ? 'Guardar' : 'Crear propietario'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        /* Skeleton loading grid */
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className="rounded-xl border border-border dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm overflow-hidden"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-muted dark:bg-neutral-700 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-28 bg-muted dark:bg-neutral-700 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-muted dark:bg-neutral-700 rounded animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2 pt-1">
                  <div className="h-3 w-32 bg-muted dark:bg-neutral-700 rounded animate-pulse" />
                  <div className="h-3 w-40 bg-muted dark:bg-neutral-700 rounded animate-pulse" />
                </div>
              </div>
              <div className="px-4 py-2.5 bg-slate-50/50 dark:bg-neutral-700/30 border-t border-border dark:border-neutral-700">
                <div className="h-3 w-24 bg-muted dark:bg-neutral-700 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        /* Premium empty state */
        <div className="rounded-xl border border-border dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
          <div className="py-16 px-6 text-center flex flex-col items-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 dark:from-violet-500/30 dark:to-blue-500/30 flex items-center justify-center mb-4 shadow-sm">
              <Landmark className="h-8 w-8 text-violet-500 dark:text-violet-400" />
            </div>
            <h3 className="text-base font-semibold text-foreground dark:text-neutral-100 mb-1">
              {search ? 'Sin resultados' : 'No hay propietarios'}
            </h3>
            <p className="text-sm text-muted-foreground dark:text-neutral-400 max-w-xs mb-5">
              {search
                ? `No se encontraron propietarios para "${search}"`
                : 'Agrega tu primer propietario para comenzar a gestionar los inmuebles'
              }
            </p>
            {!search && (
              <Button
                size="sm"
                className="shadow-sm"
                onClick={() => { resetForm(); setShowForm(true); setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100); }}
              >
                <Plus className="h-4 w-4 mr-1.5" /> Nuevo propietario
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o, idx) => (
            <div
              key={o.id}
              className="group rounded-xl border border-border dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${COLORS[idx % COLORS.length]} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                      {o.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground dark:text-neutral-100">{o.name}</p>
                      {o.cuitCuil && <p className="text-xs text-muted-foreground dark:text-neutral-400">{o.cuitCuil}</p>}
                    </div>
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
                      onClick={(e) => { e.stopPropagation(); handleEdit(o); }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    {deletingId === o.id ? (
                      <div className="flex gap-1">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-7 w-7 dark:bg-red-600 dark:hover:bg-red-700 dark:text-white"
                          onClick={(e) => { e.stopPropagation(); handleDelete(o.id); }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
                          onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 dark:text-red-400 dark:hover:bg-neutral-700 dark:hover:text-red-300"
                        onClick={(e) => { e.stopPropagation(); setDeletingId(o.id); }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-3 space-y-1.5">
                  {o.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-neutral-400">
                      <Phone className="h-3.5 w-3.5 shrink-0" /> {o.phone}
                    </div>
                  )}
                  {o.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-neutral-400">
                      <Mail className="h-3.5 w-3.5 shrink-0" /> {o.email}
                    </div>
                  )}
                  {o.cbu && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-neutral-400">
                      <CreditCard className="h-3.5 w-3.5 shrink-0" /> CBU: ...{o.cbu.slice(-6)}
                    </div>
                  )}
                </div>
              </div>
              {o.properties?.length > 0 && (
                <div className="px-4 py-2.5 bg-slate-50/50 dark:bg-neutral-700/30 border-t border-border dark:border-neutral-700">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground dark:text-neutral-400">
                    <Building2 className="h-3 w-3" />
                    {o.properties.length} propiedad{o.properties.length > 1 ? 'es' : ''}
                    {o.properties.filter((p: any) => p.status === 'rented').length > 0 && (
                      <Badge variant="secondary" className="text-[10px] ml-1 dark:bg-neutral-600 dark:text-neutral-200">{o.properties.filter((p: any) => p.status === 'rented').length} alquilada{o.properties.filter((p: any) => p.status === 'rented').length > 1 ? 's' : ''}</Badge>
                    )}
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
