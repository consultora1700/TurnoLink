'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api';
import type { Quote, QuoteStats, CreateQuoteData, Service } from '@/lib/api';
import { formatPrice, cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useTenantConfig, useRubroTerms } from '@/contexts/tenant-config-context';
import { handleApiError } from '@/lib/notifications';
import { usePlanFeatures } from '@/lib/hooks/use-plan-features';
import { UpgradeWall } from '@/components/dashboard/upgrade-wall';
import {
  Plus,
  Search,
  FileText,
  Send,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Copy,
  Share2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  TrendingUp,
  FileBadge,
  AlertTriangle,
  Filter,
  X,
  DollarSign,
} from 'lucide-react';

// ─── Normalize phone for WhatsApp (handles Argentine numbers) ──

function normalizePhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
  if (cleaned.length === 10 && !cleaned.startsWith('54')) {
    cleaned = '549' + cleaned;
  } else if (cleaned.length === 11 && cleaned.startsWith('15')) {
    cleaned = '549' + cleaned.substring(2);
  } else if (cleaned.length >= 12 && cleaned.startsWith('54') && !cleaned.startsWith('549')) {
    cleaned = '549' + cleaned.substring(2);
  }
  return cleaned;
}

// ─── Rubro-specific quote examples ──────────────────────

const QUOTE_EXAMPLES: Record<string, { titlePlaceholder: string; notesPlaceholder: string; itemExamples: string }> = {
  'estetica-belleza': {
    titlePlaceholder: 'Ej: Maquillaje + Peinado para casamiento',
    notesPlaceholder: 'Ej: Incluye prueba previa. Productos premium.',
    itemExamples: 'Maquillaje social, Peinado novia, Uñas esculpidas',
  },
  'barberia': {
    titlePlaceholder: 'Ej: Pack novio — corte + barba + cejas',
    notesPlaceholder: 'Ej: Incluye productos de styling.',
    itemExamples: 'Corte clasico, Perfilado de barba, Cejas',
  },
  'masajes-spa': {
    titlePlaceholder: 'Ej: Jornada spa completa — 3 sesiones',
    notesPlaceholder: 'Ej: Incluye acceso a sauna. Traer ropa comoda.',
    itemExamples: 'Masaje descontracturante, Piedras calientes, Facial',
  },
  'salud': {
    titlePlaceholder: 'Ej: Plan de tratamiento — 6 sesiones',
    notesPlaceholder: 'Ej: Consulta inicial incluida. Se puede financiar.',
    itemExamples: 'Consulta inicial, Sesion de tratamiento, Control',
  },
  'odontologia': {
    titlePlaceholder: 'Ej: Tratamiento de ortodoncia completo',
    notesPlaceholder: 'Ej: Incluye controles mensuales. Brackets esteticos.',
    itemExamples: 'Consulta + radiografia, Colocacion de brackets, Controles mensuales',
  },
  'psicologia': {
    titlePlaceholder: 'Ej: Pack 8 sesiones terapia individual',
    notesPlaceholder: 'Ej: Sesiones semanales de 50 min. Modalidad presencial o virtual.',
    itemExamples: 'Sesion individual, Evaluacion inicial, Informe',
  },
  'nutricion': {
    titlePlaceholder: 'Ej: Plan nutricional personalizado — 3 meses',
    notesPlaceholder: 'Ej: Incluye plan alimentario + seguimiento semanal.',
    itemExamples: 'Consulta inicial, Plan alimentario, Control mensual',
  },
  'fitness': {
    titlePlaceholder: 'Ej: Plan personal training — 12 sesiones',
    notesPlaceholder: 'Ej: 3 sesiones por semana. Incluye plan de entrenamiento.',
    itemExamples: 'Evaluacion fisica, Sesion de entrenamiento, Plan mensual',
  },
  'deportes': {
    titlePlaceholder: 'Ej: Alquiler cancha — torneo empresarial',
    notesPlaceholder: 'Ej: 8 equipos. Incluye pelotas y pecheras.',
    itemExamples: 'Alquiler cancha 2hs, Arbitraje, Iluminacion nocturna',
  },
  'hospedaje': {
    titlePlaceholder: 'Ej: Estadía 5 noches — familia',
    notesPlaceholder: 'Ej: Check-in desde las 15hs. Desayuno incluido.',
    itemExamples: 'Habitacion doble, Desayuno buffet, Transfer aeropuerto',
  },
  'alquiler': {
    titlePlaceholder: 'Ej: Alquiler temporario — 1 semana',
    notesPlaceholder: 'Ej: Incluye limpieza final. Mascotas permitidas.',
    itemExamples: 'Alquiler semanal, Limpieza final, Ropa de cama',
  },
  'educacion': {
    titlePlaceholder: 'Ej: Curso intensivo — 3 meses',
    notesPlaceholder: 'Ej: Material incluido. Certificado al finalizar.',
    itemExamples: 'Inscripcion, Clase grupal, Material didactico',
  },
  'consultoria': {
    titlePlaceholder: 'Ej: Honorarios asesoria legal — divorcio',
    notesPlaceholder: 'Ej: Incluye presentacion de escritos. No incluye tasas judiciales.',
    itemExamples: 'Consulta inicial, Honorarios profesionales, Gestion de tramite',
  },
  'veterinaria': {
    titlePlaceholder: 'Ej: Cirugia de esterilizacion — canino',
    notesPlaceholder: 'Ej: Incluye prequirurgico y medicacion post-operatoria.',
    itemExamples: 'Consulta, Cirugia, Medicacion, Control post-op',
  },
  'tatuajes-piercing': {
    titlePlaceholder: 'Ej: Tatuaje manga completa — 4 sesiones',
    notesPlaceholder: 'Ej: Incluye diseño personalizado. Sesiones de 3hs c/u.',
    itemExamples: 'Diseño personalizado, Sesion de tatuaje, Retoque',
  },
  'espacios': {
    titlePlaceholder: 'Ej: Alquiler salon — evento corporativo',
    notesPlaceholder: 'Ej: Capacidad 80 personas. Incluye mobiliario basico.',
    itemExamples: 'Alquiler salon 6hs, Equipamiento audio, Limpieza',
  },
  'mercado': {
    titlePlaceholder: 'Ej: Cotizacion mayorista — 50 unidades',
    notesPlaceholder: 'Ej: Precio especial por cantidad. Envio incluido a CABA.',
    itemExamples: 'Producto A, Producto B, Envio',
  },
  'inmobiliarias': {
    titlePlaceholder: 'Ej: Cotización alquiler — Depto 3 amb Palermo',
    notesPlaceholder: 'Ej: Disponible desde 01/05. Incluye cochera.',
    itemExamples: 'Alquiler mensual, Expensas, Comisión inmobiliaria',
  },
};

const DEFAULT_QUOTE_EXAMPLE = {
  titlePlaceholder: 'Ej: Presupuesto de servicios',
  notesPlaceholder: 'Ej: Notas adicionales para el cliente.',
  itemExamples: 'Servicio, Producto, Item personalizado',
};

// ─── Status config ──────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string; icon: React.ElementType }> = {
  DRAFT: { label: 'Borrador', badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', icon: FileText },
  SENT: { label: 'Enviado', badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: Send },
  VIEWED: { label: 'Visto', badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: Eye },
  ACCEPTED: { label: 'Aceptado', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
  REJECTED: { label: 'Rechazado', badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  EXPIRED: { label: 'Expirado', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.badgeClass)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

// ─── Quote Form ─────────────────────────────────────────

interface QuoteFormProps {
  onSave: (data: CreateQuoteData) => Promise<void>;
  onCancel: () => void;
  initial?: Quote | null;
  services: Service[];
  products: any[];
  saving: boolean;
  rubroExamples: typeof DEFAULT_QUOTE_EXAMPLE;
  terms: ReturnType<typeof useRubroTerms>;
}

function QuoteForm({ onSave, onCancel, initial, services, products, saving, rubroExamples, terms }: QuoteFormProps) {
  const [customerName, setCustomerName] = useState(initial?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(initial?.customerPhone || '');
  const [customerEmail, setCustomerEmail] = useState(initial?.customerEmail || '');
  const [title, setTitle] = useState(initial?.title || '');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [formTerms, setFormTerms] = useState(initial?.terms || '');
  const [discount, setDiscount] = useState(initial?.discount || 0);
  const [validDays, setValidDays] = useState(initial?.validDays || 15);
  const [items, setItems] = useState<CreateQuoteData['items']>(
    initial?.items?.map((i) => ({
      type: i.type as 'SERVICE' | 'PRODUCT' | 'CUSTOM',
      serviceId: i.serviceId,
      productId: i.productId,
      name: i.name,
      description: i.description,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })) || [{ type: 'CUSTOM', name: '', quantity: 1, unitPrice: 0 }]
  );

  const subtotal = items.reduce((sum, i) => sum + (i.quantity || 0) * (Number(i.unitPrice) || 0), 0);
  const total = Math.max(subtotal - discount, 0);

  const addItem = (type: 'SERVICE' | 'PRODUCT' | 'CUSTOM') => {
    setItems([...items, { type, name: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    if (field === 'serviceId' && value) {
      const svc = services.find((s) => s.id === value);
      if (svc) {
        updated[index].name = svc.name;
        updated[index].unitPrice = Number(svc.price);
        updated[index].description = svc.duration ? `${svc.duration} min` : undefined;
      }
    }
    if (field === 'productId' && value) {
      const prod = products.find((p: any) => p.id === value);
      if (prod) {
        updated[index].name = prod.name;
        updated[index].unitPrice = Number(prod.price);
      }
    }
    setItems(updated);
  };

  const handleSubmit = () => {
    if (!customerName.trim() || items.length === 0 || items.some((i) => !i.name.trim())) return;
    onSave({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      customerEmail: customerEmail.trim() || undefined,
      title: title.trim() || undefined,
      notes: notes.trim() || undefined,
      terms: formTerms.trim() || undefined,
      discount: Number(discount) || undefined,
      validDays,
      items: items.map((i) => ({ ...i, quantity: Number(i.quantity) || 1, unitPrice: Number(i.unitPrice) || 0 })),
    });
  };

  return (
    <div className="space-y-4">
      {/* Customer */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Cliente</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input placeholder="Nombre *" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            <Input placeholder="Telefono (para WhatsApp)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            <Input placeholder="Email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Detail */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Detalle</h3>
          <Input
            placeholder={rubroExamples.titlePlaceholder}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-3"
          />
          <textarea
            placeholder={rubroExamples.notesPlaceholder}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px] resize-y ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Items</h3>
            <div className="flex gap-2">
              {services.length > 0 && (
                <Button size="sm" variant="outline" onClick={() => addItem('SERVICE')} className="text-xs h-7">
                  + {terms.serviceSingular}
                </Button>
              )}
              {products.length > 0 && (
                <Button size="sm" variant="outline" onClick={() => addItem('PRODUCT')} className="text-xs h-7">
                  + Producto
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => addItem('CUSTOM')} className="text-xs h-7">
                + Personalizado
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-transparent hover:border-border transition-colors">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2">
                  {item.type === 'SERVICE' && services.length > 0 && (
                    <select
                      className="col-span-12 sm:col-span-4 h-10 rounded-md border border-input bg-background px-3 text-sm"
                      value={item.serviceId || ''}
                      onChange={(e) => updateItem(i, 'serviceId', e.target.value)}
                    >
                      <option value="">Seleccionar {terms.serviceSingular.toLowerCase()}...</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} — {formatPrice(Number(s.price))}</option>
                      ))}
                    </select>
                  )}
                  {item.type === 'PRODUCT' && products.length > 0 && (
                    <select
                      className="col-span-12 sm:col-span-4 h-10 rounded-md border border-input bg-background px-3 text-sm"
                      value={item.productId || ''}
                      onChange={(e) => updateItem(i, 'productId', e.target.value)}
                    >
                      <option value="">Seleccionar producto...</option>
                      {products.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name} — {formatPrice(Number(p.price))}</option>
                      ))}
                    </select>
                  )}
                  <Input placeholder="Nombre *" value={item.name} onChange={(e) => updateItem(i, 'name', e.target.value)} className={cn('col-span-12', item.type === 'CUSTOM' ? 'sm:col-span-4' : 'sm:col-span-3')} />
                  <Input placeholder="Descripcion" value={item.description || ''} onChange={(e) => updateItem(i, 'description', e.target.value)} className="col-span-12 sm:col-span-3" />
                  <Input type="number" min={1} placeholder="Cant" value={item.quantity || ''} onChange={(e) => updateItem(i, 'quantity', e.target.value === '' ? '' : parseInt(e.target.value) || 0)} className="col-span-4 sm:col-span-1" />
                  <Input type="number" min={0} step={0.01} placeholder="Precio" value={item.unitPrice === 0 || item.unitPrice ? item.unitPrice : ''} onChange={(e) => updateItem(i, 'unitPrice', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)} className="col-span-4 sm:col-span-1" />
                  <div className="col-span-4 sm:col-span-1 flex items-center justify-end text-sm font-semibold tabular-nums">
                    {formatPrice((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0))}
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500 shrink-0" onClick={() => removeItem(i)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {items.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Agrega items al presupuesto: {rubroExamples.itemExamples}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Totals + Config */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 sm:p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Condiciones</h3>
            <div className="flex items-center gap-2 mb-3">
              <label className="text-sm text-muted-foreground whitespace-nowrap">Validez:</label>
              <Input type="number" min={1} max={365} value={validDays} onChange={(e) => setValidDays(parseInt(e.target.value) || 15)} className="w-20" />
              <span className="text-sm text-muted-foreground">dias</span>
            </div>
            <textarea
              placeholder="Terminos y condiciones (opcional)"
              value={formTerms}
              onChange={(e) => setFormTerms(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px] resize-y ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Totales</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Descuento</span>
                <Input type="number" min={0} value={discount === 0 || discount ? discount : ''} onChange={(e) => setDiscount(e.target.value === '' ? '' as any : parseFloat(e.target.value) || 0)} className="w-28 h-7 text-right tabular-nums" />
              </div>
              <hr className="border-border" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-emerald-600 tabular-nums">{formatPrice(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel} disabled={saving}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={saving || !customerName.trim() || items.length === 0}>
          {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <FileBadge className="h-4 w-4 mr-1.5" />}
          {initial ? 'Guardar cambios' : 'Crear presupuesto'}
        </Button>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────

export default function PresupuestosPage() {
  const { data: session } = useSession();
  const { rubro } = useTenantConfig();
  const terms = useRubroTerms();
  const { hasFeature, planTier, isLoaded } = usePlanFeatures();
  const canAccess = hasFeature('quotes') || hasFeature('advanced_reports') || hasFeature('complete_reports') || hasFeature('finance_module');
  const rubroExamples = QUOTE_EXAMPLES[rubro] || DEFAULT_QUOTE_EXAMPLE;

  // State (must be before any conditional return — React hooks rules)
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [stats, setStats] = useState<QuoteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<'list' | 'create' | 'edit' | 'detail'>('list');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [copyMsg, setCopyMsg] = useState('');

  // ─── API helper (stable ref) ────────────────────────────
  const getApi = useCallback(() => {
    if (!session?.accessToken) throw new Error('No session');
    return createApiClient(session.accessToken as string);
  }, [session?.accessToken]);

  // ─── Load data ──────────────────────────────────────────
  const loadQuotes = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const api = createApiClient(session.accessToken as string);
      const res = await api.getQuotes(statusFilter || undefined, page);
      setQuotes(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch (error) {
      handleApiError(error);
    }
  }, [session?.accessToken, statusFilter, page]);

  const loadStats = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const api = createApiClient(session.accessToken as string);
      const res = await api.getQuoteStats();
      setStats(res);
    } catch { /* non-critical */ }
  }, [session?.accessToken]);

  useEffect(() => {
    if (!session?.accessToken) return;
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadQuotes(), loadStats()]);
      setLoading(false);
    };
    loadAll();
  }, [session?.accessToken, loadQuotes, loadStats]);

  useEffect(() => { setPage(1); }, [statusFilter]);

  // ─── Load form data ─────────────────────────────────────
  const loadFormData = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const api = createApiClient(session.accessToken as string);
      const [svcRes, prodRes] = await Promise.all([
        api.getServices().catch(() => []),
        api.getProducts().catch(() => ({ data: [] })),
      ]);
      setServices(Array.isArray(svcRes) ? svcRes : []);
      setProducts(Array.isArray(prodRes) ? prodRes : (prodRes as any).data || []);
    } catch { /* ignore */ }
  }, [session?.accessToken]);

  // ── Loading state (avoid flash of UpgradeWall) ──
  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="h-32 rounded-xl bg-muted animate-pulse" />
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />)}
        </div>
      </div>
    );
  }

  // ── Access gate (after all hooks) ──
  if (planTier === 'free' || (!canAccess && planTier !== null)) {
    return (
      <UpgradeWall
        title="Presupuestos"
        description="Creá y enviá presupuestos profesionales a tus clientes. Disponible en planes superiores."
        planName="Profesional"
        previewLabels={['Enviados', 'Aprobados', 'Monto total', 'Tasa de conversión']}
      />
    );
  }

  // ─── Handlers ───────────────────────────────────────────
  const handleCreate = async (data: CreateQuoteData) => {
    setSaving(true);
    try {
      await getApi().createQuote(data);
      setMode('list');
      loadQuotes();
      loadStats();
    } catch (e) {
      handleApiError(e);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data: CreateQuoteData) => {
    if (!selectedQuote) return;
    setSaving(true);
    try {
      await getApi().updateQuote(selectedQuote.id, data);
      setMode('list');
      setSelectedQuote(null);
      loadQuotes();
    } catch (e) {
      handleApiError(e);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await getApi().updateQuoteStatus(id, status);
      loadQuotes();
      loadStats();
      if (selectedQuote?.id === id) {
        const updated = await getApi().getQuote(id);
        setSelectedQuote(updated);
      }
    } catch (e) {
      handleApiError(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este presupuesto?')) return;
    try {
      await getApi().deleteQuote(id);
      if (mode === 'detail') setMode('list');
      loadQuotes();
      loadStats();
    } catch (e) {
      handleApiError(e);
    }
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/presupuesto/${token}`;
    navigator.clipboard.writeText(url);
    setCopyMsg('Link copiado!');
    setTimeout(() => setCopyMsg(''), 2000);
  };

  const shareWhatsApp = (quote: Quote) => {
    const phone = quote.customerPhone ? normalizePhoneForWhatsApp(quote.customerPhone) : '';
    if (!phone) {
      alert('Este presupuesto no tiene telefono de contacto. Edita el presupuesto y agrega el numero.');
      return;
    }
    const url = `${window.location.origin}/presupuesto/${quote.publicToken}`;
    const text = `Hola ${quote.customerName}! Te envio el presupuesto${quote.title ? ` de ${quote.title}` : ''} por ${formatPrice(quote.total)}.\n\nMiralo aca: ${url}`;
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
    if (quote.status === 'DRAFT') handleStatusChange(quote.id, 'SENT');
  };

  const openCreate = () => { loadFormData(); setSelectedQuote(null); setMode('create'); };
  const openEdit = (q: Quote) => { loadFormData(); setSelectedQuote(q); setMode('edit'); };
  const openDetail = async (q: Quote) => {
    try {
      const full = await getApi().getQuote(q.id);
      setSelectedQuote(full);
      setMode('detail');
    } catch (e) { handleApiError(e); }
  };

  // Filter by search (client-side)
  const filtered = search.trim()
    ? quotes.filter((q) => {
        const s = search.toLowerCase();
        return q.customerName.toLowerCase().includes(s) || q.quoteNumber.toLowerCase().includes(s) || q.title?.toLowerCase().includes(s);
      })
    : quotes;

  // ─── Loading state ────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  // ─── Detail View ──────────────────────────────────────
  if (mode === 'detail' && selectedQuote) {
    const q = selectedQuote;
    const isExpired = q.validUntil && new Date(q.validUntil) < new Date() && !['ACCEPTED', 'REJECTED', 'EXPIRED'].includes(q.status);

    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        {/* Back + title */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => { setMode('list'); setSelectedQuote(null); }}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Volver
          </Button>
        </div>

        {/* Quote card */}
        <Card className="overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 p-5 text-white relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm text-white/70 uppercase tracking-wider font-medium">Presupuesto</p>
                <p className="text-2xl font-bold mt-1">{q.title || q.quoteNumber}</p>
                <p className="text-sm text-white/70 mt-1 font-mono">{q.quoteNumber}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={q.status} />
                {isExpired && <Badge className="bg-amber-100 text-amber-800 text-xs">Vencido</Badge>}
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/70 mt-3">
              <span>{format(new Date(q.createdAt), "d 'de' MMMM yyyy", { locale: es })}</span>
              {q.validUntil && <span>Valido hasta {format(new Date(q.validUntil), "d 'de' MMMM yyyy", { locale: es })}</span>}
            </div>
          </div>

          <CardContent className="p-5 space-y-5">
            {/* Customer */}
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Cliente</p>
              <p className="font-semibold">{q.customerName}</p>
              {q.customerPhone && <p className="text-sm text-muted-foreground">{q.customerPhone}</p>}
              {q.customerEmail && <p className="text-sm text-muted-foreground">{q.customerEmail}</p>}
            </div>

            {q.notes && <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm text-blue-800 dark:text-blue-300">{q.notes}</div>}

            {/* Items */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Items ({q.items?.length || 0})</p>
              <div className="space-y-1">
                {q.items?.map((item, i) => (
                  <div key={item.id} className={cn('flex items-center justify-between p-3 rounded-lg', i % 2 === 0 ? 'bg-muted/40' : '')}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                          {item.type === 'SERVICE' ? terms.serviceSingular : item.type === 'PRODUCT' ? 'Producto' : 'Custom'}
                        </Badge>
                        <span className="font-medium text-sm truncate">{item.name}</span>
                      </div>
                      {item.description && <p className="text-xs text-muted-foreground mt-0.5 ml-0.5">{item.description}</p>}
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-xs text-muted-foreground tabular-nums">{item.quantity} x {formatPrice(item.unitPrice)}</p>
                      <p className="font-semibold tabular-nums">{formatPrice(item.totalPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-4">
              <div className="max-w-xs ml-auto space-y-1">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">{formatPrice(q.subtotal)}</span></div>
                {q.discount > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Descuento</span><span className="text-emerald-600 tabular-nums">-{formatPrice(q.discount)}</span></div>}
                <hr className="border-border" />
                <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-emerald-600 tabular-nums">{formatPrice(q.total)}</span></div>
              </div>
            </div>

            {q.terms && (
              <div className="p-3 rounded-lg bg-muted/40">
                <p className="text-xs font-semibold text-muted-foreground mb-1">TERMINOS Y CONDICIONES</p>
                <p className="text-xs text-muted-foreground whitespace-pre-line">{q.terms}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {q.status === 'DRAFT' && (
            <>
              <Button size="sm" variant="outline" className="w-full" onClick={() => openEdit(q)}><FileText className="h-4 w-4 mr-1.5" /> Editar</Button>
              <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => shareWhatsApp(q)}><Share2 className="h-4 w-4 mr-1.5" /> WhatsApp</Button>
              <Button size="sm" variant="outline" className="w-full" onClick={() => handleStatusChange(q.id, 'SENT')}><Send className="h-4 w-4 mr-1.5" /> Marcar enviado</Button>
              <Button size="sm" variant="outline" className="w-full text-red-500 hover:text-red-600" onClick={() => handleDelete(q.id)}><Trash2 className="h-4 w-4 mr-1.5" /> Eliminar</Button>
            </>
          )}
          {['SENT', 'VIEWED'].includes(q.status) && (
            <>
              <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => shareWhatsApp(q)}><Share2 className="h-4 w-4 mr-1.5" /> WhatsApp</Button>
              <Button size="sm" variant="outline" className="w-full" onClick={() => copyLink(q.publicToken)}><Copy className="h-4 w-4 mr-1.5" /> {copyMsg || 'Copiar link'}</Button>
              <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleStatusChange(q.id, 'ACCEPTED')}><CheckCircle2 className="h-4 w-4 mr-1.5" /> Aceptado</Button>
              <Button size="sm" variant="outline" className="w-full text-red-500" onClick={() => handleStatusChange(q.id, 'REJECTED')}><XCircle className="h-4 w-4 mr-1.5" /> Rechazado</Button>
            </>
          )}
        </div>

        {/* Internal notes */}
        {q.internalNotes && (
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">NOTAS INTERNAS</p>
              <p className="text-sm text-amber-800 dark:text-amber-300">{q.internalNotes}</p>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Historial</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><div className="w-2 h-2 rounded-full bg-slate-400" /> Creado el {format(new Date(q.createdAt), "d MMM yyyy HH:mm", { locale: es })}</div>
              {q.sentAt && <div className="flex items-center gap-2 text-blue-600"><div className="w-2 h-2 rounded-full bg-blue-500" /> Enviado el {format(new Date(q.sentAt), "d MMM yyyy HH:mm", { locale: es })}</div>}
              {q.viewedAt && <div className="flex items-center gap-2 text-purple-600"><div className="w-2 h-2 rounded-full bg-purple-500" /> Visto el {format(new Date(q.viewedAt), "d MMM yyyy HH:mm", { locale: es })}</div>}
              {q.respondedAt && (
                <div className={cn('flex items-center gap-2', q.status === 'ACCEPTED' ? 'text-emerald-600' : 'text-red-600')}>
                  <div className={cn('w-2 h-2 rounded-full', q.status === 'ACCEPTED' ? 'bg-emerald-500' : 'bg-red-500')} />
                  {q.status === 'ACCEPTED' ? 'Aceptado' : 'Rechazado'} el {format(new Date(q.respondedAt), "d MMM yyyy HH:mm", { locale: es })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Create / Edit Form ───────────────────────────────
  if (mode === 'create' || mode === 'edit') {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setMode('list')}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Volver
          </Button>
          <h1 className="text-xl font-bold">{mode === 'create' ? 'Nuevo presupuesto' : `Editar ${selectedQuote?.quoteNumber}`}</h1>
        </div>
        <QuoteForm
          onSave={mode === 'create' ? handleCreate : handleUpdate}
          onCancel={() => setMode('list')}
          initial={mode === 'edit' ? selectedQuote : null}
          services={services}
          products={products}
          saving={saving}
          rubroExamples={rubroExamples}
          terms={terms}
        />
      </div>
    );
  }

  // ─── List View ────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header — gradient banner */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 p-4 sm:p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-24 -right-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                <FileBadge className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold">Presupuestos</h1>
                <p className="text-white/80 text-sm sm:text-base">
                  Crea y envia presupuestos profesionales a tus clientes
                </p>
              </div>
            </div>
            <Button size="sm" className="bg-white text-teal-600 hover:bg-white/90 shadow-lg h-9 sm:h-10" onClick={openCreate}>
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Nuevo presupuesto</span>
            </Button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20">
              <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-1 sm:gap-2">
                  <FileBadge className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">{stats.total}</p>
                </div>
                <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Total</p>
              </div>
              <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Send className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">{stats.draft + stats.sent}</p>
                </div>
                <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Pendientes</p>
              </div>
              <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-1 sm:gap-2">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">{stats.accepted}</p>
                </div>
                <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">
                  Aceptados{stats.acceptanceRate > 0 && ` (${stats.acceptanceRate}%)`}
                </p>
              </div>
              <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-1 sm:gap-2">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
                  <p className="text-lg sm:text-2xl md:text-3xl font-bold truncate">{formatPrice(stats.totalAcceptedValue)}</p>
                </div>
                <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Facturado</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, numero o titulo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Todos</option>
              <option value="DRAFT">Borrador</option>
              <option value="SENT">Enviado</option>
              <option value="VIEWED">Visto</option>
              <option value="ACCEPTED">Aceptado</option>
              <option value="REJECTED">Rechazado</option>
              <option value="EXPIRED">Expirado</option>
            </select>
          </div>

          {(search || statusFilter) && (
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              <span>{filtered.length} de {total} presupuestos</span>
              <button onClick={() => { setSearch(''); setStatusFilter(''); }} className="text-teal-600 hover:text-teal-700 underline ml-2">
                Limpiar filtros
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* List */}
      {quotes.length === 0 && !statusFilter ? (
        <EmptyState
          icon={FileBadge}
          title="No tenes presupuestos todavia"
          description={`Crea tu primer presupuesto para enviarselo a un cliente. ${rubroExamples.titlePlaceholder.replace('Ej: ', 'Ejemplo: ')}`}
          action={{ label: 'Crear presupuesto', onClick: openCreate }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Sin resultados"
          description="No se encontraron presupuestos con los filtros aplicados."
          action={{ label: 'Limpiar filtros', onClick: () => { setSearch(''); setStatusFilter(''); } }}
        />
      ) : (
        <div className="grid gap-3">
          {filtered.map((q) => (
            <Card
              key={q.id}
              className="hover:border-teal-300 dark:hover:border-teal-500/40 transition-colors cursor-pointer group"
              onClick={() => openDetail(q)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-semibold text-teal-600">{q.quoteNumber}</span>
                      <StatusBadge status={q.status} />
                      {q.validUntil && new Date(q.validUntil) < new Date() && !['ACCEPTED', 'REJECTED', 'EXPIRED'].includes(q.status) && (
                        <Badge variant="outline" className="text-amber-600 border-amber-200 text-[10px]">Vencido</Badge>
                      )}
                    </div>
                    <p className="font-medium mt-1 truncate">{q.title || q.customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {q.customerName}
                      {q.customerPhone && ` · ${q.customerPhone}`}
                      {' · '}
                      {format(new Date(q.createdAt), "d MMM yyyy", { locale: es })}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold tabular-nums">{formatPrice(q.total)}</p>
                    <p className="text-xs text-muted-foreground">{q.items?.length || 0} items</p>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    {q.status === 'DRAFT' && (
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(q)} title="Editar">
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}
                    {q.customerPhone && (
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-600" onClick={() => shareWhatsApp(q)} title="WhatsApp">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => copyLink(q.publicToken)} title="Copiar link">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Pagina {page} de {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Copy toast */}
      {copyMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-2 rounded-lg text-sm font-medium shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2">
          {copyMsg}
        </div>
      )}
    </div>
  );
}
