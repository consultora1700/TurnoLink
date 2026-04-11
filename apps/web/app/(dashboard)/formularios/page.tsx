'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  Plus,
  Pencil,
  Trash2,
  ClipboardList,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  ToggleLeft,
  ToggleRight,
  Copy,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createApiClient, IntakeForm, IntakeFormField, IntakeSubmission } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useTenantConfig, useRubroTerms } from '@/contexts/tenant-config-context';
import { bookingGender } from '@/lib/tenant-config';

const FIELD_TYPES = [
  { value: 'text', label: 'Texto corto' },
  { value: 'textarea', label: 'Texto largo' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Teléfono' },
  { value: 'number', label: 'Número' },
  { value: 'date', label: 'Fecha' },
  { value: 'select', label: 'Selector' },
  { value: 'radio', label: 'Opción única' },
  { value: 'checkbox', label: 'Casilla de verificación' },
];

function generateFieldId(): string {
  return `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

const emptyField: IntakeFormField = {
  id: '',
  type: 'text',
  label: '',
  required: false,
  placeholder: '',
  options: [],
  helpText: '',
};

// ─── Rubro-specific placeholders ─────────────────────────────
const FORM_PLACEHOLDERS: Record<string, { formName: string; formDesc: string; fieldName: string }> = {
  'estetica-belleza':   { formName: 'Ej: Ficha de cliente', formDesc: 'Ej: Completá esta ficha antes de tu primer turno', fieldName: 'Ej: Tipo de piel' },
  'barberia':           { formName: 'Ej: Ficha de cliente', formDesc: 'Ej: Completá esta ficha antes de tu primer corte', fieldName: 'Ej: Estilo preferido' },
  'masajes-spa':        { formName: 'Ej: Ficha de ingreso', formDesc: 'Ej: Completá esta ficha antes de tu primera sesión', fieldName: 'Ej: Zona con molestia' },
  'salud':              { formName: 'Ej: Ficha de paciente', formDesc: 'Ej: Completá esta ficha antes de tu primera consulta', fieldName: 'Ej: Obra social' },
  'psicologia':         { formName: 'Ej: Ficha de admisión', formDesc: 'Ej: Completá esta ficha antes de tu primera sesión', fieldName: 'Ej: Motivo de consulta' },
  'odontologia':        { formName: 'Ej: Historia clínica', formDesc: 'Ej: Completá esta ficha antes de tu primera consulta', fieldName: 'Ej: Obra social' },
  'veterinaria':        { formName: 'Ej: Ficha de mascota', formDesc: 'Ej: Completá esta ficha con los datos de tu mascota', fieldName: 'Ej: Raza' },
  'nutricion':          { formName: 'Ej: Ficha nutricional', formDesc: 'Ej: Completá esta ficha antes de tu primera consulta', fieldName: 'Ej: Alergias alimentarias' },
  'abogados':           { formName: 'Ej: Ficha de caso', formDesc: 'Ej: Completá esta ficha antes de tu primera consulta legal', fieldName: 'Ej: Tipo de caso' },
  'contadores':         { formName: 'Ej: Ficha de cliente', formDesc: 'Ej: Completá esta ficha con los datos de tu empresa', fieldName: 'Ej: CUIT' },
  'fitness':            { formName: 'Ej: Ficha de ingreso', formDesc: 'Ej: Completá esta ficha antes de tu primera clase', fieldName: 'Ej: Lesión previa' },
  'deportes':           { formName: 'Ej: Ficha de jugador', formDesc: 'Ej: Completá esta ficha antes de tu primera reserva', fieldName: 'Ej: Nivel de juego' },
  'educacion':          { formName: 'Ej: Ficha de alumno', formDesc: 'Ej: Completá esta ficha antes de tu primera clase', fieldName: 'Ej: Nivel actual' },
  'coaching':           { formName: 'Ej: Ficha de coachee', formDesc: 'Ej: Completá esta ficha antes de tu primera sesión', fieldName: 'Ej: Objetivo principal' },
  'tatuajes-piercing':  { formName: 'Ej: Consentimiento informado', formDesc: 'Ej: Completá este formulario antes de tu cita', fieldName: 'Ej: Alergias a metales' },
  'hospedaje':          { formName: 'Ej: Ficha de huésped', formDesc: 'Ej: Completá esta ficha antes del check-in', fieldName: 'Ej: Cantidad de personas' },
  'alquiler':           { formName: 'Ej: Ficha de inquilino', formDesc: 'Ej: Completá esta ficha con tus datos', fieldName: 'Ej: Garantía' },
  'espacios':           { formName: 'Ej: Ficha de reserva', formDesc: 'Ej: Completá esta ficha antes de tu reserva', fieldName: 'Ej: Cantidad de asistentes' },
  'inmobiliarias':      { formName: 'Ej: Ficha de interesado', formDesc: 'Ej: Completá esta ficha para agendar una visita', fieldName: 'Ej: Presupuesto disponible' },
};

export default function FormulariosPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const { clientLabelPlural, rubro } = useTenantConfig();
  const terms = useRubroTerms();
  const gender = bookingGender(terms);
  const fph = FORM_PLACEHOLDERS[rubro] || { formName: 'Ej: Nombre del formulario', formDesc: 'Ej: Completá esta ficha antes de tu turno', fieldName: 'Ej: Nombre del campo' };
  const [forms, setForms] = useState<IntakeForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form editor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<IntakeForm | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFields, setFormFields] = useState<IntakeFormField[]>([]);
  const [formIsActive, setFormIsActive] = useState(true);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<IntakeForm | null>(null);

  // Submissions viewer
  const [viewingSubmissions, setViewingSubmissions] = useState<IntakeForm | null>(null);
  const [submissions, setSubmissions] = useState<IntakeSubmission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsMeta, setSubmissionsMeta] = useState({ total: 0, page: 1, totalPages: 1 });

  // Expanded field index in editor
  const [expandedField, setExpandedField] = useState<number | null>(null);

  const loadForms = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const data = await api.getIntakeForms();
      setForms(data || []);
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar los formularios', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, toast]);

  useEffect(() => { loadForms(); }, [loadForms]);

  const openNewForm = () => {
    setEditingForm(null);
    setFormName('');
    setFormDescription('');
    setFormFields([{ ...emptyField, id: generateFieldId() }]);
    setFormIsActive(true);
    setExpandedField(0);
    setEditorOpen(true);
  };

  const openEditForm = (form: IntakeForm) => {
    setEditingForm(form);
    setFormName(form.name);
    setFormDescription(form.description || '');
    setFormFields(form.fields.length > 0 ? form.fields : [{ ...emptyField, id: generateFieldId() }]);
    setFormIsActive(form.isActive);
    setExpandedField(null);
    setEditorOpen(true);
  };

  const handleSave = async () => {
    if (!session?.accessToken || saving) return;
    if (!formName.trim()) {
      toast({ title: 'Error', description: 'El nombre del formulario es obligatorio', variant: 'destructive' });
      return;
    }
    // Validate fields have labels
    const validFields = formFields.filter(f => f.label.trim());
    if (validFields.length === 0) {
      toast({ title: 'Error', description: 'Agrega al menos un campo con nombre', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const payload = {
        name: formName.trim(),
        description: formDescription.trim() || undefined,
        fields: validFields,
        isActive: formIsActive,
      };

      if (editingForm) {
        await api.updateIntakeForm(editingForm.id, payload);
        toast({ title: 'Formulario actualizado' });
      } else {
        await api.createIntakeForm(payload);
        toast({ title: 'Formulario creado' });
      }

      setEditorOpen(false);
      loadForms();
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar el formulario', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!session?.accessToken || !deleteTarget) return;
    try {
      const api = createApiClient(session.accessToken as string);
      await api.deleteIntakeForm(deleteTarget.id);
      toast({ title: 'Formulario eliminado' });
      setDeleteTarget(null);
      loadForms();
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
    }
  };

  const handleDuplicate = async (form: IntakeForm) => {
    if (!session?.accessToken) return;
    try {
      const api = createApiClient(session.accessToken as string);
      await api.createIntakeForm({
        name: `${form.name} (copia)`,
        description: form.description || undefined,
        fields: form.fields,
        isActive: false,
      });
      toast({ title: 'Formulario duplicado' });
      loadForms();
    } catch {
      toast({ title: 'Error', description: 'No se pudo duplicar', variant: 'destructive' });
    }
  };

  const loadSubmissions = async (form: IntakeForm, page = 1) => {
    if (!session?.accessToken) return;
    setSubmissionsLoading(true);
    setViewingSubmissions(form);
    try {
      const api = createApiClient(session.accessToken as string);
      const result = await api.getIntakeFormSubmissions(form.id, page);
      setSubmissions(result.data || []);
      setSubmissionsMeta({ total: result.meta.total, page: result.meta.page, totalPages: result.meta.totalPages });
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar las respuestas', variant: 'destructive' });
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // Field management
  const addField = () => {
    const newField = { ...emptyField, id: generateFieldId() };
    setFormFields(prev => [...prev, newField]);
    setExpandedField(formFields.length);
  };

  const removeField = (index: number) => {
    setFormFields(prev => prev.filter((_, i) => i !== index));
    setExpandedField(null);
  };

  const updateField = (index: number, updates: Partial<IntakeFormField>) => {
    setFormFields(prev => prev.map((f, i) => i === index ? { ...f, ...updates } : f));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formFields.length) return;
    setFormFields(prev => {
      const arr = [...prev];
      [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
      return arr;
    });
    setExpandedField(newIndex);
  };

  const needsOptions = (type: string) => ['select', 'radio'].includes(type);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 p-4 sm:p-6 text-white">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-24 -right-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Formularios de Admisión</h1>
                <p className="text-white/80 text-xs sm:text-sm">
                  Formularios que tus {clientLabelPlural.toLowerCase()} completan al {terms.bookingVerb}
                </p>
              </div>
            </div>

            <Button
              className="bg-white text-indigo-600 hover:bg-white/90 shadow-lg w-full sm:w-auto"
              onClick={openNewForm}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Formulario
            </Button>
          </div>

          {/* Stats */}
          <div className="relative grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20">
            <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">{forms.length}</p>
              <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Total</p>
            </div>
            <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">{forms.filter(f => f.isActive).length}</p>
              <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Activos</p>
            </div>
            <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">
                {forms.reduce((sum, f) => sum + (f._count?.submissions || 0), 0)}
              </p>
              <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Respuestas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 gap-4">
          <div className="relative">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border-4 border-indigo-100 dark:border-indigo-900" />
            <div className="absolute inset-0 h-14 w-14 sm:h-16 sm:w-16 rounded-full border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm">Cargando formularios...</p>
        </div>
      ) : forms.length === 0 ? (
        <Card className="border-0 shadow-soft">
          <CardContent className="py-12 sm:py-16 text-center px-4">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-semibold text-base sm:text-lg mb-2">No tienes formularios</h3>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base">
              Crea formularios de admisión para recopilar información de tus {clientLabelPlural.toLowerCase()} antes de {gender.article} {terms.bookingSingular.toLowerCase()}
            </p>
            <Button
              onClick={openNewForm}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear primer formulario
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <Card key={form.id} className="group relative border shadow-soft overflow-hidden transition-all duration-300 hover:shadow-soft-lg">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${form.isActive ? 'from-indigo-500 to-purple-500' : 'from-gray-300 to-gray-400'}`} />

              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base truncate">{form.name}</h3>
                    {form.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{form.description}</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => openEditForm(form)} className="gap-2">
                        <Pencil className="h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(form)} className="gap-2">
                        <Copy className="h-4 w-4" /> Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => loadSubmissions(form)} className="gap-2">
                        <Eye className="h-4 w-4" /> Ver respuestas
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteTarget(form)}
                        className="gap-2 text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={form.isActive ? 'default' : 'secondary'} className="text-xs">
                    {form.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {form.fields.length} {form.fields.length === 1 ? 'campo' : 'campos'}
                  </Badge>
                  {(form._count?.submissions ?? 0) > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <FileText className="h-3 w-3 mr-1" />
                      {form._count?.submissions} {form._count?.submissions === 1 ? 'respuesta' : 'respuestas'}
                    </Badge>
                  )}
                  {(form._count?.services ?? 0) > 0 && (
                    <Badge variant="outline" className="text-xs text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800">
                      {form._count?.services} {form._count?.services === 1 ? terms.serviceSingular.toLowerCase() : terms.servicePlural.toLowerCase()}
                    </Badge>
                  )}
                </div>

                {/* Preview first 3 field labels */}
                {form.fields.length > 0 && (
                  <div className="mt-3 pt-3 border-t space-y-1">
                    {form.fields.slice(0, 3).map((field) => (
                      <div key={field.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="w-16 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 flex-shrink-0">
                          {FIELD_TYPES.find(t => t.value === field.type)?.label || field.type}
                        </span>
                        <span className="truncate">{field.label}</span>
                        {field.required && <span className="text-red-400 flex-shrink-0">*</span>}
                      </div>
                    ))}
                    {form.fields.length > 3 && (
                      <p className="text-[10px] text-muted-foreground/50">
                        +{form.fields.length - 3} campos más
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Editor Dialog */}
      <Dialog open={editorOpen} onOpenChange={(open) => !open && setEditorOpen(false)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <ClipboardList className="h-4 w-4 text-white" />
              </div>
              {editingForm ? 'Editar Formulario' : 'Nuevo Formulario'}
            </DialogTitle>
            <DialogDescription>
              Configura los campos que verán tus {clientLabelPlural.toLowerCase()} al {terms.bookingVerb}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Form metadata */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="form-name">Nombre</Label>
                <Input
                  id="form-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={fph.formName}
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="form-desc">Descripción (opcional)</Label>
                <Input
                  id="form-desc"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder={fph.formDesc}
                  className="h-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
                <Label className="text-sm">Formulario activo</Label>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">Campos del formulario</Label>
                <Button type="button" variant="outline" size="sm" onClick={addField}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Campo
                </Button>
              </div>

              {/* Fields list */}
              <div className="space-y-2">
                {formFields.map((field, index) => {
                  const isExpanded = expandedField === index;
                  return (
                    <div
                      key={field.id}
                      className={`border rounded-lg transition-all ${isExpanded ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/20' : 'border-border'}`}
                    >
                      {/* Collapsed header */}
                      <button
                        type="button"
                        onClick={() => setExpandedField(isExpanded ? null : index)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left"
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                        <span className="flex-1 text-sm font-medium truncate">
                          {field.label || `Campo ${index + 1}`}
                        </span>
                        <Badge variant="outline" className="text-[10px] flex-shrink-0">
                          {FIELD_TYPES.find(t => t.value === field.type)?.label || field.type}
                        </Badge>
                        {field.required && <span className="text-red-500 text-xs flex-shrink-0">*</span>}
                        {isExpanded ? <ChevronUp className="h-4 w-4 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 flex-shrink-0" />}
                      </button>

                      {/* Expanded editor */}
                      {isExpanded && (
                        <div className="px-3 pb-3 space-y-3 border-t">
                          <div className="grid grid-cols-2 gap-2 pt-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Nombre del campo</Label>
                              <Input
                                value={field.label}
                                onChange={(e) => updateField(index, { label: e.target.value })}
                                placeholder={fph.fieldName}
                                className="h-9 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Tipo</Label>
                              <select
                                value={field.type}
                                onChange={(e) => updateField(index, { type: e.target.value, options: needsOptions(e.target.value) ? (field.options?.length ? field.options : ['']) : [] })}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                {FIELD_TYPES.map(t => (
                                  <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Placeholder (opcional)</Label>
                            <Input
                              value={field.placeholder || ''}
                              onChange={(e) => updateField(index, { placeholder: e.target.value })}
                              placeholder="Texto de ayuda dentro del campo"
                              className="h-9 text-sm"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Texto de ayuda (opcional)</Label>
                            <Input
                              value={field.helpText || ''}
                              onChange={(e) => updateField(index, { helpText: e.target.value })}
                              placeholder="Aparece debajo del campo"
                              className="h-9 text-sm"
                            />
                          </div>

                          {/* Options for select/radio */}
                          {needsOptions(field.type) && (
                            <div className="space-y-1.5">
                              <Label className="text-xs">Opciones</Label>
                              {(field.options || []).map((opt, optIndex) => (
                                <div key={optIndex} className="flex gap-1.5">
                                  <Input
                                    value={opt}
                                    onChange={(e) => {
                                      const newOpts = [...(field.options || [])];
                                      newOpts[optIndex] = e.target.value;
                                      updateField(index, { options: newOpts });
                                    }}
                                    placeholder={`Opción ${optIndex + 1}`}
                                    className="h-8 text-sm"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 flex-shrink-0"
                                    onClick={() => {
                                      const newOpts = (field.options || []).filter((_, i) => i !== optIndex);
                                      updateField(index, { options: newOpts });
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => updateField(index, { options: [...(field.options || []), ''] })}
                              >
                                <Plus className="h-3 w-3 mr-1" /> Opción
                              </Button>
                            </div>
                          )}

                          {/* Field controls */}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={field.required}
                                onCheckedChange={(checked) => updateField(index, { required: checked })}
                              />
                              <Label className="text-xs">Obligatorio</Label>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                disabled={index === 0}
                                onClick={() => moveField(index, 'up')}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                disabled={index === formFields.length - 1}
                                onClick={() => moveField(index, 'down')}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:text-red-600"
                                disabled={formFields.length <= 1}
                                onClick={() => removeField(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Save buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditorOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
              >
                {saving ? 'Guardando...' : editingForm ? 'Guardar' : 'Crear'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar formulario</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar &ldquo;{deleteTarget?.name}&rdquo;? Esta acción no se puede deshacer.
              {(deleteTarget?._count?.submissions ?? 0) > 0 && (
                <span className="block mt-2 text-red-500 font-medium">
                  Este formulario tiene {deleteTarget?._count?.submissions} respuestas que también se eliminarán.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submissions Viewer */}
      <Dialog open={!!viewingSubmissions} onOpenChange={(open) => !open && setViewingSubmissions(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Respuestas: {viewingSubmissions?.name}</DialogTitle>
            <DialogDescription>
              {submissionsMeta.total} {submissionsMeta.total === 1 ? 'respuesta' : 'respuestas'} recibidas
            </DialogDescription>
          </DialogHeader>

          {submissionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No hay respuestas todavía</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <Card key={sub.id} className="border">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {sub.customer?.name || 'Cliente'} {sub.customer?.phone ? `• ${sub.customer.phone}` : ''}
                      </span>
                      <span>{new Date(sub.createdAt).toLocaleDateString('es-AR')}</span>
                    </div>
                    <div className="space-y-1">
                      {viewingSubmissions?.fields.map((field) => {
                        const value = sub.data?.[field.id];
                        if (value === undefined || value === null || value === '') return null;
                        return (
                          <div key={field.id} className="flex gap-2 text-sm">
                            <span className="font-medium text-muted-foreground min-w-[100px] flex-shrink-0">
                              {field.label}:
                            </span>
                            <span>{String(value)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {submissionsMeta.totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={submissionsMeta.page <= 1}
                    onClick={() => viewingSubmissions && loadSubmissions(viewingSubmissions, submissionsMeta.page - 1)}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center text-sm text-muted-foreground">
                    {submissionsMeta.page} / {submissionsMeta.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={submissionsMeta.page >= submissionsMeta.totalPages}
                    onClick={() => viewingSubmissions && loadSubmissions(viewingSubmissions, submissionsMeta.page + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
