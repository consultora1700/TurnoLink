'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  Save,
  User,
  Heart,
  Shield,
  Activity,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Plus,
  Stethoscope,
  Brain,
  ClipboardList,
  NotebookPen,
  Eye,
  Trash2,
  Pencil,
  MoreHorizontal,
  ImagePlus,
  X,
  ArrowRightLeft,
  Send,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createApiClient, type Booking, type Customer } from '@/lib/api';
import { toastSuccess, toastError } from '@/hooks';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { useTenantConfig } from '@/contexts/tenant-config-context';
import { getSessionNoteLabels } from '@/lib/rubro-labels';
import { FICHA_MODULE_MAP, type FichaModuleId } from '@/lib/tenant-config';
import { FICHA_MODULE_FIELDS, type FieldGroup, type FieldDefinition } from '@/lib/ficha-modules';

// ============================================================================
// Types
// ============================================================================

interface SessionNote {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: string;
  objectives: string;
  homework: string;
  images?: string[];
  createdAt: string;
}

interface Referral {
  id: string;
  date: string;
  toEmployeeName: string;
  reason: string;
  notes: string;
  status: 'pendiente' | 'aceptada' | 'completada' | 'cancelada';
  createdAt: string;
}

// ============================================================================
// Status helpers
// ============================================================================

const statusMap: Record<string, { color: string; bg: string; dot: string; label: string }> = {
  PENDING:   { color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-950/30',     dot: 'bg-amber-500',   label: 'Pendiente' },
  CONFIRMED: { color: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-50 dark:bg-blue-950/30',       dot: 'bg-blue-500',    label: 'Confirmado' },
  COMPLETED: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', dot: 'bg-emerald-500', label: 'Completado' },
  CANCELLED: { color: 'text-red-600 dark:text-red-400',       bg: 'bg-red-50 dark:bg-red-950/30',         dot: 'bg-red-500',     label: 'Cancelado' },
  NO_SHOW:   { color: 'text-slate-500 dark:text-slate-400',   bg: 'bg-slate-50 dark:bg-slate-950/30',     dot: 'bg-slate-400',   label: 'No asistio' },
};

function normalizePhone(phone: string): string {
  let c = phone.replace(/\D/g, '');
  if (c.startsWith('0')) c = c.substring(1);
  if (c.length === 10 && !c.startsWith('54')) c = '549' + c;
  else if (c.length === 11 && c.startsWith('15')) c = '549' + c.substring(2);
  else if (c.length >= 12 && c.startsWith('54') && !c.startsWith('549')) c = '549' + c.substring(2);
  return c;
}

function safeDate(d: string): Date {
  if (d.includes('T')) return new Date(d);
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day);
}

// ============================================================================
// Collapsible Section
// ============================================================================

function Section({ icon: Icon, title, iconBg, children, defaultOpen = true }: {
  icon: React.ElementType; title: string; iconBg: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 p-4 sm:p-5 hover:bg-muted/30 transition-colors">
        <div className={`h-9 w-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className="h-[18px] w-[18px] text-white" />
        </div>
        <h3 className="font-semibold text-[15px] flex-1 text-left">{title}</h3>
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </button>
      <div className={`transition-all duration-200 ${open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-4 sm:px-5 pb-5 pt-1">{children}</div>
      </div>
    </div>
  );
}

// ============================================================================
// Form helpers
// ============================================================================

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[13px] font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <Field label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors">
        <option value="">Seleccionar...</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  );
}

// ============================================================================
// Session Note Form
// ============================================================================

function NoteForm({ note, onSave, onCancel, accessToken, snLabels }: {
  note?: SessionNote; onSave: (n: Omit<SessionNote, 'id' | 'createdAt'>) => void; onCancel: () => void; accessToken: string; snLabels: import('@/lib/rubro-labels').SessionNoteLabels;
}) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [mood, setMood] = useState(note?.mood || '');
  const [objectives, setObjectives] = useState(note?.objectives || '');
  const [homework, setHomework] = useState(note?.homework || '');
  const [date, setDate] = useState(note?.date || format(new Date(), 'yyyy-MM-dd'));
  const [images, setImages] = useState<string[]>(note?.images || []);
  const [uploadingImage, setUploadingImage] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || images.length >= 5) return;
    setUploadingImage(true);
    try {
      const result = await createApiClient(accessToken).uploadMedia(file, 'notes');
      setImages((prev) => [...prev, result.url]);
    } catch {
      toastError('Error al subir imagen');
    } finally {
      setUploadingImage(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 p-5 rounded-2xl border-2 border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20">
      <div className="flex items-center gap-2 mb-1">
        <NotebookPen className="h-5 w-5 text-teal-600" />
        <h4 className="font-semibold text-lg">{note ? `Editar ${snLabels.noteTitle}` : `Nueva ${snLabels.noteTitle}`}</h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={snLabels.dateLabel}>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 rounded-xl" />
        </Field>
        <Field label="Titulo / Tema principal">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={snLabels.titlePlaceholder} className="h-11 rounded-xl" />
        </Field>
      </div>
      <Field label={snLabels.observationsLabel}>
        <Input value={mood} onChange={(e) => setMood(e.target.value)} placeholder={snLabels.observationsPlaceholder} className="h-11 rounded-xl" />
      </Field>
      <Field label={snLabels.notesLabel}>
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={snLabels.notesPlaceholder} className="min-h-[140px] rounded-xl resize-y text-sm leading-relaxed" />
      </Field>
      <Field label={snLabels.progressLabel}>
        <Textarea value={objectives} onChange={(e) => setObjectives(e.target.value)} placeholder={snLabels.progressPlaceholder} className="min-h-[80px] rounded-xl resize-y text-sm" />
      </Field>
      <Field label={snLabels.tasksLabel}>
        <Textarea value={homework} onChange={(e) => setHomework(e.target.value)} placeholder={snLabels.tasksPlaceholder} className="min-h-[80px] rounded-xl resize-y text-sm" />
      </Field>

      {/* Image attachments */}
      <div className="space-y-2">
        <label className="text-[13px] font-medium text-muted-foreground">Imagenes adjuntas (opcional, max. 5)</label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-border/50 bg-muted/30">
              <Image src={url} alt={`Adjunto ${i + 1}`} fill sizes="(max-width: 640px) 33vw, 25vw" className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {uploadingImage && (
            <div className="aspect-square rounded-xl border-2 border-dashed border-teal-300 dark:border-teal-700 flex items-center justify-center bg-teal-50/30 dark:bg-teal-950/20">
              <div className="h-6 w-6 border-2 border-teal-300 border-t-teal-600 rounded-full animate-spin" />
            </div>
          )}
          {images.length < 5 && !uploadingImage && (
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-teal-400 dark:hover:border-teal-600 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              <ImagePlus className="h-6 w-6" />
              <span className="text-[10px] font-medium">Agregar</span>
            </button>
          )}
        </div>
        <input ref={galleryInputRef} type="file" accept="image/*" hidden onChange={handleImageUpload} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button onClick={() => onSave({ date, title, content, mood, objectives, homework, images })} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-11 px-6">
          <Save className="h-4 w-4 mr-2" /> Guardar nota
        </Button>
        <Button variant="outline" onClick={onCancel} className="rounded-xl h-11">Cancelar</Button>
      </div>
    </div>
  );
}

// ============================================================================
// Dynamic Ficha Form
// ============================================================================

function FichaFormRenderer({ fieldGroups, data, onChange }: {
  fieldGroups: FieldGroup[];
  data: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  const iconMap: Record<string, React.ElementType> = {
    'bg-violet-500': User,
    'bg-amber-500': AlertTriangle,
    'bg-blue-500': Shield,
    'bg-red-500': Heart,
    'bg-red-400': Heart,
    'bg-teal-500': Brain,
    'bg-orange-500': Activity,
    'bg-indigo-500': FileText,
    'bg-pink-500': Heart,
    'bg-purple-500': Stethoscope,
    'bg-emerald-500': Activity,
  };

  return (
    <div className="space-y-4">
      {fieldGroups.map((group) => {
        const Icon = iconMap[group.iconBg] || FileText;
        return (
          <Section
            key={group.title}
            icon={Icon}
            title={group.title}
            iconBg={group.iconBg}
            defaultOpen={group.defaultOpen !== false}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.fields.map((field) => {
                const colClass = field.colSpan === 3 ? 'sm:col-span-2 lg:col-span-3' : '';
                if (field.type === 'select' && field.options) {
                  return (
                    <div key={field.key} className={colClass}>
                      <SelectField
                        label={field.label}
                        value={data[field.key] || ''}
                        onChange={(v) => onChange(field.key, v)}
                        options={field.options}
                      />
                    </div>
                  );
                }
                if (field.type === 'textarea') {
                  return (
                    <div key={field.key} className={colClass}>
                      <Field label={field.label}>
                        <Textarea
                          value={data[field.key] || ''}
                          onChange={(e) => onChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="min-h-[80px] rounded-xl resize-y text-sm"
                        />
                      </Field>
                    </div>
                  );
                }
                return (
                  <div key={field.key} className={colClass}>
                    <Field label={field.label}>
                      <Input
                        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                        value={data[field.key] || ''}
                        onChange={(e) => onChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="h-11 rounded-xl"
                      />
                    </Field>
                  </div>
                );
              })}
            </div>
          </Section>
        );
      })}
    </div>
  );
}

// ============================================================================
// Timeline
// ============================================================================

function Timeline({ bookings, notes, onAdd, onView, snLabels }: {
  bookings: Booking[]; notes: SessionNote[]; onAdd: () => void; onView: (n: SessionNote) => void; snLabels: import('@/lib/rubro-labels').SessionNoteLabels;
}) {
  const sorted = [...bookings].sort((a, b) => {
    const diff = safeDate(b.date).getTime() - safeDate(a.date).getTime();
    return diff !== 0 ? diff : b.startTime.localeCompare(a.startTime);
  });

  const noteMap: Record<string, SessionNote> = {};
  notes.forEach((n) => { noteMap[n.date] = n; });

  if (sorted.length === 0) {
    return (
      <div className="text-center py-16">
        <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground">No hay sesiones registradas</p>
      </div>
    );
  }

  // Group by month
  const groups: Record<string, Booking[]> = {};
  sorted.forEach((b) => {
    const key = format(safeDate(b.date), 'MMMM yyyy', { locale: es });
    if (!groups[key]) groups[key] = [];
    groups[key].push(b);
  });

  return (
    <div className="space-y-8">
      <Button onClick={onAdd} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-11">
        <Plus className="h-4 w-4 mr-2" /> Agregar {snLabels.noteTitle}
      </Button>

      {Object.entries(groups).map(([month, items]) => (
        <div key={month}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 px-4 rounded-full bg-muted flex items-center">
              <span className="text-sm font-semibold capitalize">{month}</span>
            </div>
            <div className="flex-1 h-px bg-border" />
            <Badge variant="secondary" className="text-xs">{items.length} sesiones</Badge>
          </div>

          <div className="relative pl-8">
            {/* Vertical line */}
            <div className="absolute left-[13px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-teal-400 via-teal-300/50 to-border rounded-full" />

            <div className="space-y-2">
              {items.map((b) => {
                const st = statusMap[b.status] || statusMap.PENDING;
                const d = safeDate(b.date);
                const dateKey = format(d, 'yyyy-MM-dd');
                const note = noteMap[dateKey];

                return (
                  <div key={b.id} className="relative group">
                    {/* Dot */}
                    <div className={`absolute -left-8 top-[18px] w-[11px] h-[11px] rounded-full border-[2.5px] border-background ${st.dot} z-10 ring-2 ring-background`} />

                    <div className={`rounded-xl border p-4 transition-all hover:shadow-sm ${note ? 'border-teal-200/60 dark:border-teal-800/40 bg-teal-50/20 dark:bg-teal-950/10' : 'border-border/50 bg-card'}`}>
                      <div className="flex items-start gap-3">
                        {/* Date */}
                        <div className="flex flex-col items-center min-w-[52px] flex-shrink-0">
                          <span className="text-lg font-bold leading-none">{format(d, 'dd/MM')}</span>
                          <span className="text-[10px] text-muted-foreground capitalize mt-0.5">{format(d, 'EEE', { locale: es })}</span>
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm">{b.service?.name || 'Sesion'}</p>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${st.bg} ${st.color}`}>{st.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {b.startTime} - {b.endTime}
                            {b.employee && <> &middot; {b.employee.name}</>}
                          </p>

                          {note && (
                            <button onClick={() => onView(note)} className="mt-2 w-full text-left p-2.5 rounded-lg bg-white/70 dark:bg-neutral-800/60 border border-teal-200/50 dark:border-teal-800/30 hover:bg-white dark:hover:bg-neutral-800 transition-colors group/n">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <NotebookPen className="h-3 w-3 text-teal-600" />
                                <span className="text-xs font-medium text-teal-700 dark:text-teal-400">{note.title || (snLabels.noteTitle.charAt(0).toUpperCase() + snLabels.noteTitle.slice(1))}</span>
                                <Eye className="h-3 w-3 text-muted-foreground ml-auto opacity-0 group-hover/n:opacity-100 transition-opacity" />
                              </div>
                              {note.mood && <p className="text-xs text-muted-foreground line-clamp-1">{note.mood}</p>}
                              {note.content && <p className="text-xs text-muted-foreground/60 line-clamp-2 mt-0.5">{note.content}</p>}
                              {note.images && note.images.length > 0 && (
                                <p className="flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 mt-1 font-medium">
                                  <ImagePlus className="h-3 w-3" /> {note.images.length} {note.images.length === 1 ? 'imagen' : 'imagenes'}
                                </p>
                              )}
                            </button>
                          )}

                          {b.notes && !note && (
                            <p className="text-xs text-muted-foreground mt-1.5 italic bg-muted/40 rounded-lg p-2">{b.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function PatientFilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const { clientLabelSingular, clientLabelPlural, enabledFichas, rubro } = useTenantConfig();
  const snLabels = getSessionNoteLabels(rubro);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>('timeline');

  // Ficha data - one record per module extraInfo key
  const [fichaDataMap, setFichaDataMap] = useState<Record<string, Record<string, string>>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  // Legacy compat: keep fichaData pointing to current active ficha section
  const fichaData = fichaDataMap['fichaPaciente'] || {};

  // Session notes
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SessionNote | null>(null);
  const [viewing, setViewing] = useState<SessionNote | null>(null);
  const savedScrollRef = useRef<number | null>(null);
  const notePanelRef = useRef<HTMLDivElement>(null);

  // Referrals (derivaciones)
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [showReferralForm, setShowReferralForm] = useState(false);
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);

  const scrollToPanel = useCallback(() => {
    // Wait for render, then scroll to the note/form panel
    requestAnimationFrame(() => {
      setTimeout(() => {
        notePanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    });
  }, []);

  const openNote = useCallback((note: SessionNote) => {
    savedScrollRef.current = window.scrollY;
    setViewing(note);
    setShowForm(false);
    setEditing(null);
    scrollToPanel();
  }, [scrollToPanel]);

  const openForm = useCallback((editNote?: SessionNote | null) => {
    savedScrollRef.current = window.scrollY;
    if (editNote) {
      setEditing(editNote);
    } else {
      setShowForm(true);
    }
    setViewing(null);
    scrollToPanel();
  }, [scrollToPanel]);

  const closeNoteOrForm = useCallback(() => {
    setViewing(null);
    setShowForm(false);
    setEditing(null);
    const pos = savedScrollRef.current;
    if (pos != null) {
      requestAnimationFrame(() => window.scrollTo({ top: pos, behavior: 'smooth' }));
      savedScrollRef.current = null;
    }
  }, []);

  // Load customer + bookings
  useEffect(() => {
    if (!session?.accessToken || !id) return;
    (async () => {
      setLoading(true);
      try {
        const api = createApiClient(session.accessToken as string);
        const [cust, hist] = await Promise.all([
          api.getCustomer(id),
          api.getCustomerHistory(id),
        ]);
        setCustomer(cust);
        setBookings(Array.isArray(hist) ? hist : []);
        // Load all ficha sections from extraInfo
        const extraInfo = (cust as any).extraInfo || {};
        const dataMap: Record<string, Record<string, string>> = {};
        // Load each enabled module's data from its extraInfo key
        for (const modId of enabledFichas) {
          const mod = FICHA_MODULE_MAP[modId];
          if (mod && mod.extraInfoKey !== 'sessionNotes') {
            dataMap[mod.extraInfoKey] = (extraInfo[mod.extraInfoKey] ?? {}) as Record<string, string>;
          }
        }
        // Also always load fichaPaciente for backward compat
        if (!dataMap['fichaPaciente'] && extraInfo.fichaPaciente) {
          dataMap['fichaPaciente'] = extraInfo.fichaPaciente as Record<string, string>;
        }
        // Also load datosPersonales (might be stored in fichaPaciente for old tenants)
        if (!dataMap['datosPersonales']) {
          dataMap['datosPersonales'] = (extraInfo.datosPersonales ?? extraInfo.fichaPaciente ?? {}) as Record<string, string>;
        }
        setFichaDataMap(dataMap);
        // Load session notes from extraInfo (supports both {items:[...]} and [...] format)
        const rawNotes = extraInfo.sessionNotes;
        const savedNotes = Array.isArray(rawNotes) ? rawNotes : (rawNotes?.items ?? []);
        setNotes(Array.isArray(savedNotes) ? savedNotes : []);
        // Load referrals
        const rawReferrals = extraInfo.referrals;
        const savedReferrals = Array.isArray(rawReferrals) ? rawReferrals : (rawReferrals?.items ?? []);
        setReferrals(Array.isArray(savedReferrals) ? savedReferrals : []);
        // Load employees for referral target selector
        if (enabledFichas.includes('derivaciones')) {
          try {
            const empList = await api.getEmployees();
            setEmployees(empList.map((e: any) => ({ id: e.id, name: e.name })));
          } catch { /* */ }
        }
      } catch { /* */ }
      finally { setLoading(false); }
    })();
  }, [session, id]);

  const updateFichaField = (extraInfoKey: string, fieldKey: string, val: string) => {
    setFichaDataMap((prev) => ({
      ...prev,
      [extraInfoKey]: { ...(prev[extraInfoKey] || {}), [fieldKey]: val },
    }));
    setSaved(false);
  };

  // Legacy helper for backward compat with existing ficha references
  const updateFicha = (key: string, val: string) => {
    updateFichaField('fichaPaciente', key, val);
  };

  const saveFichaModule = async (extraInfoKey: string) => {
    if (!id || !session?.accessToken) return;
    setSaving(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const data = fichaDataMap[extraInfoKey] || {};
      const clean: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(data)) {
        if (v !== '' && v != null) clean[k] = v;
      }
      await (api as any).updateCustomerExtraInfo(id, extraInfoKey, clean);
      toastSuccess('Ficha guardada correctamente');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      toastError('Error al guardar la ficha');
    } finally {
      setSaving(false);
    }
  };

  const saveFicha = () => saveFichaModule('fichaPaciente');

  const saveNote = async (data: Omit<SessionNote, 'id' | 'createdAt'>) => {
    if (!id || !session?.accessToken) return;
    let updated: SessionNote[];
    if (editing) {
      updated = notes.map((n) => n.id === editing.id ? { ...n, ...data } : n);
    } else {
      updated = [{ ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...notes];
    }
    setNotes(updated);
    setShowForm(false);
    setEditing(null);
    // Restore scroll position after saving
    const pos = savedScrollRef.current;
    if (pos != null) {
      requestAnimationFrame(() => window.scrollTo({ top: pos, behavior: 'smooth' }));
      savedScrollRef.current = null;
    }
    // Persist to API (wrap in {items:[...]} since API requires object)
    try {
      const api = createApiClient(session.accessToken as string);
      await (api as any).updateCustomerExtraInfo(id, 'sessionNotes', { items: updated });
      toastSuccess('Nota guardada');
    } catch {
      toastError('Error al guardar nota');
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!id || !session?.accessToken) return;
    const updated = notes.filter((n) => n.id !== noteId);
    setNotes(updated);
    setViewing(null);
    try {
      const api = createApiClient(session.accessToken as string);
      await (api as any).updateCustomerExtraInfo(id, 'sessionNotes', { items: updated });
      toastSuccess('Nota eliminada');
    } catch { /* */ }
  };

  // Referral CRUD
  const saveReferral = async (data: Omit<Referral, 'id' | 'createdAt'>) => {
    if (!id || !session?.accessToken) return;
    const newRef: Referral = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    const updated = [newRef, ...referrals];
    setReferrals(updated);
    setShowReferralForm(false);
    try {
      const api = createApiClient(session.accessToken as string);
      await (api as any).updateCustomerExtraInfo(id, 'referrals', { items: updated });
      toastSuccess('Derivacion registrada');
    } catch {
      toastError('Error al guardar derivacion');
    }
  };

  const updateReferralStatus = async (refId: string, status: Referral['status']) => {
    if (!id || !session?.accessToken) return;
    const updated = referrals.map((r) => r.id === refId ? { ...r, status } : r);
    setReferrals(updated);
    try {
      const api = createApiClient(session.accessToken as string);
      await (api as any).updateCustomerExtraInfo(id, 'referrals', { items: updated });
      toastSuccess('Estado actualizado');
    } catch {
      toastError('Error al actualizar');
    }
  };

  const deleteReferral = async (refId: string) => {
    if (!id || !session?.accessToken) return;
    const updated = referrals.filter((r) => r.id !== refId);
    setReferrals(updated);
    try {
      const api = createApiClient(session.accessToken as string);
      await (api as any).updateCustomerExtraInfo(id, 'referrals', { items: updated });
      toastSuccess('Derivacion eliminada');
    } catch { /* */ }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-teal-100 dark:border-teal-900" />
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-teal-600 dark:border-t-teal-400 animate-spin" />
        </div>
        <p className="text-muted-foreground">Cargando ficha...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-32">
        <User className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground mb-4">{clientLabelSingular} no encontrado</p>
        <Button variant="outline" onClick={() => router.push('/clientes')} className="rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
      </div>
    );
  }

  const completed = bookings.filter((b) => b.status === 'COMPLETED');
  const lastB = completed[0];
  const nextB = bookings.find((b) => b.status === 'PENDING' || b.status === 'CONFIRMED');
  const initials = customer.name.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-8">
      {/* ── Hero Section ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-600 text-white">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-24 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />

        {/* Navigation */}
        <div className="relative px-5 sm:px-8 pt-5 sm:pt-6">
          <button onClick={() => router.push('/clientes')} className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm font-medium transition-colors group">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> Volver a {clientLabelPlural.toLowerCase()}
          </button>
        </div>

        {/* Profile Identity */}
        <div className="relative px-5 sm:px-8 pt-6 sm:pt-7">
          <div className="flex items-start gap-5 sm:gap-6">
            {/* Avatar */}
            <div className="h-[72px] w-[72px] sm:h-20 sm:w-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl sm:text-3xl font-bold flex-shrink-0 shadow-lg ring-2 ring-white/15">
              {initials}
            </div>

            <div className="flex-1 min-w-0 pt-1">
              {/* Name */}
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">{customer.name}</h1>

              {/* Contact info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-white/70 text-sm">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {customer.phone}
                </span>
                {customer.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> {customer.email}
                  </span>
                )}
              </div>

              {/* Diagnosis badge */}
              {fichaData.diagnostico && (
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-xs font-medium">
                    <Stethoscope className="h-3 w-3" /> {fichaData.diagnostico}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="relative flex gap-3 px-5 sm:px-8 pt-6 pb-6 sm:pb-7">
          <button
            onClick={() => window.open(`https://wa.me/${normalizePhone(customer.phone)}`, '_blank')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageSquare className="h-4 w-4" /> WhatsApp
          </button>
          <button
            onClick={() => window.open(`tel:${customer.phone}`, '_blank')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Phone className="h-4 w-4" /> Llamar
          </button>
        </div>

        {/* Stats Section */}
        <div className="relative border-t border-white/15 bg-black/5">
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {/* Total Sessions */}
            <div className="flex items-center gap-3 px-5 sm:px-6 py-4 sm:py-5 border-r border-b sm:border-b-0 border-white/10">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-white/70" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">{customer.totalBookings || bookings.length}</p>
                <p className="text-[11px] text-white/50 mt-1">Sesiones totales</p>
              </div>
            </div>
            {/* Completed */}
            <div className="flex items-center gap-3 px-5 sm:px-6 py-4 sm:py-5 sm:border-r border-b sm:border-b-0 border-white/10">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">{completed.length}</p>
                <p className="text-[11px] text-white/50 mt-1">Completadas</p>
              </div>
            </div>
            {/* Last Session */}
            <div className="flex items-center gap-3 px-5 sm:px-6 py-4 sm:py-5 border-r border-white/10">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-amber-300" />
              </div>
              <div>
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Última sesión</p>
                {lastB ? (
                  <p className="text-sm font-semibold mt-0.5">{format(safeDate(lastB.date), "d 'de' MMM", { locale: es })}</p>
                ) : (
                  <p className="text-sm text-white/40 mt-0.5">Sin sesiones</p>
                )}
              </div>
            </div>
            {/* Next Session */}
            <div className="flex items-center gap-3 px-5 sm:px-6 py-4 sm:py-5">
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Próxima sesión</p>
                {nextB ? (
                  <p className="text-sm font-semibold mt-0.5">{format(safeDate(nextB.date), "d 'de' MMM", { locale: es })} {nextB.startTime}hs</p>
                ) : (
                  <p className="text-sm text-white/40 mt-0.5">Sin agendar</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Dynamic Tabs ── */}
      {(() => {
        // Build tabs from enabled fichas
        const fichaTabs: { key: string; icon: React.ElementType; label: string; moduleId: FichaModuleId }[] = [];
        // Timeline is always first if notasSeguimiento is enabled
        const hasTimeline = enabledFichas.includes('notasSeguimiento');

        // Add ficha module tabs (exclude notasSeguimiento and derivaciones which have custom UI)
        for (const modId of enabledFichas) {
          if (modId === 'notasSeguimiento' || modId === 'derivaciones') continue;
          const mod = FICHA_MODULE_MAP[modId];
          if (!mod) continue;
          const fieldGroups = FICHA_MODULE_FIELDS[modId];
          if (!fieldGroups || fieldGroups.length === 0) continue;
          const iconForMod: Record<string, React.ElementType> = {
            datosPersonales: User,
            fichaClinica: ClipboardList,
            fichaBelleza: Heart,
            fichaFitness: Activity,
          };
          fichaTabs.push({
            key: modId,
            icon: iconForMod[modId] || FileText,
            label: mod.label,
            moduleId: modId,
          });
        }

        const hasDerivaciones = enabledFichas.includes('derivaciones');

        const allTabs = [
          ...(hasTimeline ? [{ key: 'timeline', icon: Activity, label: 'Timeline' }] : []),
          ...fichaTabs,
          ...(hasDerivaciones ? [{ key: 'derivaciones', icon: ArrowRightLeft, label: 'Derivaciones' }] : []),
        ];

        return (
          <>
            <div className="flex gap-1 p-1 rounded-xl bg-muted/50 overflow-x-auto">
              {allTabs.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap min-w-0 ${tab === t.key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                  <t.icon className="h-4 w-4 flex-shrink-0" /> <span className="truncate">{t.label}</span>
                </button>
              ))}
            </div>

            {/* ══════ TAB: TIMELINE ══════ */}
            {tab === 'timeline' && hasTimeline && (
              <div className="space-y-5">
                {(showForm || editing) && (
                  <div ref={notePanelRef} className="scroll-mt-24">
                    <NoteForm note={editing || undefined} onSave={saveNote} onCancel={closeNoteOrForm} accessToken={session?.accessToken as string} snLabels={snLabels} />
                  </div>
                )}

                {viewing && (
                  <div ref={notePanelRef} className="scroll-mt-24 rounded-2xl border-2 border-teal-200 dark:border-teal-800 bg-card overflow-hidden">
                    <div className="p-5 bg-teal-50/50 dark:bg-teal-950/20 border-b border-teal-200/50 dark:border-teal-800/30">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <NotebookPen className="h-5 w-5 text-teal-600" />
                          <h4 className="font-semibold text-lg">{viewing.title || (snLabels.noteTitle.charAt(0).toUpperCase() + snLabels.noteTitle.slice(1))}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline" className="rounded-xl h-8">
                                <MoreHorizontal className="h-3.5 w-3.5 mr-1" /> Acciones
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={() => { setEditing(viewing); setViewing(null); }}>
                                <Pencil className="h-3.5 w-3.5 mr-2" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => deleteNote(viewing.id)}>
                                <Trash2 className="h-3.5 w-3.5 mr-2" /> Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button size="sm" variant="ghost" className="rounded-xl h-8" onClick={closeNoteOrForm}>Cerrar</Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{format(safeDate(viewing.date), "EEEE d 'de' MMMM yyyy", { locale: es })}</p>
                    </div>
                    <div className="p-5 space-y-4">
                      {viewing.mood && <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{snLabels.observationsLabel}</p><p className="text-sm">{viewing.mood}</p></div>}
                      {viewing.content && <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{snLabels.notesLabel}</p><p className="text-sm whitespace-pre-wrap leading-relaxed">{viewing.content}</p></div>}
                      {viewing.objectives && <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{snLabels.progressLabel}</p><p className="text-sm whitespace-pre-wrap">{viewing.objectives}</p></div>}
                      {viewing.homework && <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{snLabels.tasksLabel}</p><p className="text-sm whitespace-pre-wrap">{viewing.homework}</p></div>}
                      {viewing.images && viewing.images.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Imagenes adjuntas</p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {viewing.images.map((url, i) => (
                              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="relative aspect-square rounded-xl overflow-hidden border border-border/50 hover:ring-2 hover:ring-teal-400 transition-all">
                                <Image src={url} alt={`Adjunto ${i + 1}`} fill sizes="(max-width: 640px) 33vw, 25vw" className="object-cover" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Timeline bookings={bookings} notes={notes} onAdd={() => openForm()} onView={openNote} snLabels={snLabels} />
              </div>
            )}

            {/* ══════ DYNAMIC FICHA TABS ══════ */}
            {fichaTabs.map((fichaTab) => {
              if (tab !== fichaTab.key) return null;
              const mod = FICHA_MODULE_MAP[fichaTab.moduleId];
              const fieldGroups = FICHA_MODULE_FIELDS[fichaTab.moduleId];
              if (!mod || !fieldGroups) return null;
              const extraInfoKey = mod.extraInfoKey;
              const moduleData = fichaDataMap[extraInfoKey] || {};

              return (
                <div key={fichaTab.key} className="space-y-4">
                  {/* Sticky save bar */}
                  <div className="flex items-center justify-between sticky top-0 z-20 py-3 -mt-3 bg-background/80 backdrop-blur-sm border-b border-border/30">
                    <p className="text-sm text-muted-foreground hidden sm:block">
                      Complete los datos de {mod.label.toLowerCase()}
                    </p>
                    <Button onClick={() => saveFichaModule(extraInfoKey)} disabled={saving}
                      className={`rounded-xl h-10 px-5 ml-auto ${saved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-teal-600 hover:bg-teal-700'} text-white`}>
                      {saving ? <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Guardando...</>
                       : saved ? <><CheckCircle2 className="h-4 w-4 mr-2" /> Guardado</>
                       : <><Save className="h-4 w-4 mr-2" /> Guardar ficha</>}
                    </Button>
                  </div>

                  <FichaFormRenderer
                    fieldGroups={fieldGroups}
                    data={moduleData}
                    onChange={(fieldKey, value) => updateFichaField(extraInfoKey, fieldKey, value)}
                  />

                  <div className="flex justify-end pb-4">
                    <Button onClick={() => saveFichaModule(extraInfoKey)} disabled={saving}
                      className={`rounded-xl h-12 px-8 text-base ${saved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-teal-600 hover:bg-teal-700'} text-white`}>
                      {saving ? <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Guardando...</>
                       : saved ? <><CheckCircle2 className="h-4 w-4 mr-2" /> Guardado correctamente</>
                       : <><Save className="h-4 w-4 mr-2" /> Guardar ficha</>}
                    </Button>
                  </div>
                </div>
              );
            })}

            {/* ══════ TAB: DERIVACIONES ══════ */}
            {tab === 'derivaciones' && hasDerivaciones && (
              <div className="space-y-5">
                {/* New referral form */}
                {showReferralForm && (
                  <div className="p-5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Send className="h-5 w-5 text-indigo-600" />
                      <h4 className="font-semibold text-lg">Nueva derivacion</h4>
                    </div>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      saveReferral({
                        date: fd.get('date') as string || format(new Date(), 'yyyy-MM-dd'),
                        toEmployeeName: fd.get('toEmployeeName') as string || '',
                        reason: fd.get('reason') as string || '',
                        notes: fd.get('notes') as string || '',
                        status: 'pendiente',
                      });
                    }} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Fecha">
                          <Input type="date" name="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} className="h-11 rounded-xl" />
                        </Field>
                        <Field label="Derivar a (profesional)">
                          {employees.length > 0 ? (
                            <select name="toEmployeeName" className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors" required>
                              <option value="">Seleccionar profesional...</option>
                              {employees.map((emp) => (
                                <option key={emp.id} value={emp.name}>{emp.name}</option>
                              ))}
                            </select>
                          ) : (
                            <Input name="toEmployeeName" placeholder="Nombre del profesional" className="h-11 rounded-xl" required />
                          )}
                        </Field>
                      </div>
                      <Field label="Motivo de derivacion">
                        <Input name="reason" placeholder={snLabels.referralPlaceholder} className="h-11 rounded-xl" required />
                      </Field>
                      <Field label="Notas adicionales">
                        <Textarea name="notes" placeholder="Detalles relevantes para el profesional receptor..." className="min-h-[80px] rounded-xl resize-y text-sm" />
                      </Field>
                      <div className="flex gap-3 pt-2">
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-6">
                          <Send className="h-4 w-4 mr-2" /> Registrar derivacion
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowReferralForm(false)} className="rounded-xl h-11">Cancelar</Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Action bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs">{referrals.length} {referrals.length === 1 ? 'derivacion' : 'derivaciones'}</Badge>
                  </div>
                  {!showReferralForm && (
                    <Button onClick={() => setShowReferralForm(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10">
                      <Plus className="h-4 w-4 mr-2" /> Nueva derivacion
                    </Button>
                  )}
                </div>

                {/* Referrals list */}
                {referrals.length === 0 ? (
                  <div className="text-center py-16">
                    <ArrowRightLeft className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No hay derivaciones registradas</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">Las derivaciones permiten registrar interconsultas y referencias entre profesionales</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {referrals.map((ref) => {
                      const statusColors: Record<string, { bg: string; text: string; label: string }> = {
                        pendiente: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', label: 'Pendiente' },
                        aceptada: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400', label: 'Aceptada' },
                        completada: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', label: 'Completada' },
                        cancelada: { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-600 dark:text-red-400', label: 'Cancelada' },
                      };
                      const st = statusColors[ref.status] || statusColors.pendiente;

                      return (
                        <div key={ref.id} className="rounded-xl border border-border/50 bg-card p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <ArrowRightLeft className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-semibold text-sm">Derivar a {ref.toEmployeeName}</p>
                                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>{st.label}</span>
                                </div>
                                <p className="text-sm text-foreground/80 mt-1">{ref.reason}</p>
                                {ref.notes && <p className="text-xs text-muted-foreground mt-1.5 bg-muted/40 rounded-lg p-2">{ref.notes}</p>}
                                <p className="text-xs text-muted-foreground mt-2">
                                  {format(safeDate(ref.date), "d 'de' MMMM yyyy", { locale: es })}
                                </p>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost" className="rounded-xl h-8 w-8 p-0 flex-shrink-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                {ref.status === 'pendiente' && (
                                  <DropdownMenuItem onClick={() => updateReferralStatus(ref.id, 'aceptada')}>
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-blue-500" /> Marcar aceptada
                                  </DropdownMenuItem>
                                )}
                                {(ref.status === 'pendiente' || ref.status === 'aceptada') && (
                                  <DropdownMenuItem onClick={() => updateReferralStatus(ref.id, 'completada')}>
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-emerald-500" /> Marcar completada
                                  </DropdownMenuItem>
                                )}
                                {ref.status !== 'cancelada' && ref.status !== 'completada' && (
                                  <DropdownMenuItem onClick={() => updateReferralStatus(ref.id, 'cancelada')}>
                                    <XCircle className="h-3.5 w-3.5 mr-2 text-red-500" /> Cancelar
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => deleteReferral(ref.id)}>
                                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
}
