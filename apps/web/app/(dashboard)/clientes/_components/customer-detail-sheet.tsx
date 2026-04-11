'use client';

import { useState, useEffect } from 'react';
import {
  UserRound,
  Shield,
  HeartPulse,
  Stethoscope,
  Activity,
  Phone,
  FileText,
  Calendar,
  Mail,
  Save,
  Loader2,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createApiClient, type Customer, type Booking } from '@/lib/api';
import { toastSuccess, toastError } from '@/hooks';
import { formatShortDate } from '@/lib/utils';
import { useTenantConfig, useRubroTerms } from '@/contexts/tenant-config-context';

// ─── Field definitions ──────────────────────────────────────────

interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'textarea' | 'select';
  options?: string[];
  placeholder?: string;
}

interface FieldGroup {
  label: string;
  icon: React.ElementType;
  fields: FieldDef[];
}

const FICHA_PACIENTE_GROUPS: FieldGroup[] = [
  {
    label: 'Datos Personales',
    icon: UserRound,
    fields: [
      { key: 'fechaNacimiento', label: 'Fecha de nacimiento', type: 'date' },
      { key: 'genero', label: 'Género', type: 'select', options: ['Masculino', 'Femenino', 'Otro', 'Prefiero no decir'] },
      { key: 'documento', label: 'DNI / Documento', type: 'text' },
      { key: 'direccion', label: 'Dirección', type: 'text' },
    ],
  },
  {
    label: 'Cobertura Médica',
    icon: Shield,
    fields: [
      { key: 'obraSocial', label: 'Obra social / Prepaga', type: 'text' },
      { key: 'numeroAfiliado', label: 'N° de afiliado', type: 'text' },
    ],
  },
  {
    label: 'Historial Clínico',
    icon: HeartPulse,
    fields: [
      { key: 'grupoSanguineo', label: 'Grupo sanguíneo', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
      { key: 'alergias', label: 'Alergias', type: 'textarea', placeholder: 'Medicamentos, alimentos, materiales...' },
      { key: 'medicacionActual', label: 'Medicación actual', type: 'textarea', placeholder: 'Nombre y dosis...' },
      { key: 'enfermedadesCronicas', label: 'Enfermedades crónicas', type: 'textarea', placeholder: 'Diabetes, hipertensión...' },
      { key: 'cirugiasPrevias', label: 'Cirugías previas', type: 'textarea' },
      { key: 'antecedentesFamiliares', label: 'Antecedentes familiares', type: 'textarea', placeholder: 'Enfermedades relevantes en familia directa...' },
    ],
  },
  {
    label: 'Datos de Consulta',
    icon: Stethoscope,
    fields: [
      { key: 'motivoConsulta', label: 'Motivo de consulta', type: 'textarea' },
      { key: 'diagnostico', label: 'Diagnóstico', type: 'textarea' },
      { key: 'derivadoPor', label: 'Derivado por', type: 'text' },
      { key: 'tratamientoPrevio', label: 'Tratamiento previo', type: 'textarea' },
    ],
  },
  {
    label: 'Hábitos y Medidas',
    icon: Activity,
    fields: [
      { key: 'fumador', label: 'Fumador', type: 'select', options: ['No', 'Ex-fumador', 'Sí'] },
      { key: 'consumoAlcohol', label: 'Consumo de alcohol', type: 'select', options: ['No', 'Ocasional', 'Moderado', 'Frecuente'] },
      { key: 'actividadFisica', label: 'Actividad física', type: 'select', options: ['Sedentario', 'Leve', 'Moderada', 'Intensa'] },
      { key: 'peso', label: 'Peso (kg)', type: 'number' },
      { key: 'altura', label: 'Altura (cm)', type: 'number' },
      { key: 'embarazo', label: 'Embarazo', type: 'select', options: ['No', 'Sí', 'No aplica'] },
    ],
  },
  {
    label: 'Contacto de Emergencia',
    icon: Phone,
    fields: [
      { key: 'contactoEmergenciaNombre', label: 'Nombre', type: 'text' },
      { key: 'contactoEmergenciaTelefono', label: 'Teléfono', type: 'text' },
      { key: 'contactoEmergenciaRelacion', label: 'Relación', type: 'text', placeholder: 'Esposo/a, padre/madre, hijo/a...' },
    ],
  },
  {
    label: 'Notas del Profesional',
    icon: FileText,
    fields: [
      { key: 'notasProfesional', label: 'Notas privadas', type: 'textarea', placeholder: 'Solo vos podés ver estas notas...' },
    ],
  },
];

// ─── Component ──────────────────────────────────────────────────

interface CustomerDetailSheetProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  accessToken: string;
}

export function CustomerDetailSheet({
  customer,
  open,
  onOpenChange,
  onSave,
  accessToken,
}: CustomerDetailSheetProps) {
  const { clientLabelSingular } = useTenantConfig();
  const terms = useRubroTerms();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<Booking[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load ficha data + history when customer changes
  useEffect(() => {
    if (customer && open) {
      const ficha = (customer.extraInfo?.fichaPaciente ?? {}) as Record<string, string>;
      setFormData(ficha);
      loadHistory();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer?.id, open]);

  const loadHistory = async () => {
    if (!customer || !accessToken) return;
    setLoadingHistory(true);
    try {
      const api = createApiClient(accessToken);
      const data = await api.getCustomerHistory(customer.id);
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!customer || !accessToken) return;
    setSaving(true);
    try {
      const api = createApiClient(accessToken);
      // Filter out empty strings
      const cleanData: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(formData)) {
        if (v !== '' && v !== undefined && v !== null) {
          cleanData[k] = v;
        }
      }
      await api.updateCustomerExtraInfo(customer.id, 'fichaPaciente', cleanData);
      toastSuccess('Ficha guardada correctamente');
      onSave();
    } catch {
      toastError('Error al guardar la ficha');
    } finally {
      setSaving(false);
    }
  };

  if (!customer) return null;

  const initials = customer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[540px] p-0 overflow-y-auto"
      >
        {/* Header */}
        <SheetHeader className="p-6 pb-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-xl font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-white text-xl">{customer.name}</SheetTitle>
              <SheetDescription className="text-white/80 text-sm">
                {customer.phone}
                {customer.email && ` · ${customer.email}`}
              </SheetDescription>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Badge className="bg-white/20 text-white border-0 hover:bg-white/30">
              <Calendar className="h-3 w-3 mr-1" />
              {customer.totalBookings || 0} {terms.bookingPlural.toLowerCase()}
            </Badge>
            {customer.lastVisit && (
              <Badge className="bg-white/20 text-white border-0 hover:bg-white/30">
                Último: {formatShortDate(customer.lastVisit)}
              </Badge>
            )}
          </div>
        </SheetHeader>

        {/* Tabs */}
        <Tabs defaultValue="general" className="p-4">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="ficha">Ficha de {clientLabelSingular.toLowerCase()}</TabsTrigger>
          </TabsList>

          {/* Tab: General */}
          <TabsContent value="general" className="space-y-4 mt-4">
            {/* Contact info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-neutral-800">
                <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <p className="text-sm font-medium">{customer.phone}</p>
                </div>
              </div>

              {customer.email && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-neutral-800">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{customer.email}</p>
                  </div>
                </div>
              )}

              {customer.notes && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800">
                  <p className="text-xs text-muted-foreground mb-1">Notas</p>
                  <p className="text-sm">{customer.notes}</p>
                </div>
              )}
            </div>

            {/* Booking history */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Historial de {terms.bookingPlural.toLowerCase()}</h3>
              {loadingHistory ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Sin {terms.bookingPlural.toLowerCase()} registrad{terms.bookingPlural.toLowerCase().endsWith('as') ? 'a' : 'o'}s
                </p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {history.slice(0, 20).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-neutral-800"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {booking.service?.name || 'Turno'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatShortDate(booking.date)} · {booking.startTime}
                        </p>
                      </div>
                      <Badge
                        variant={
                          booking.status === 'COMPLETED'
                            ? 'default'
                            : booking.status === 'CANCELLED'
                              ? 'destructive'
                              : 'secondary'
                        }
                        className="text-xs"
                      >
                        {booking.status === 'COMPLETED'
                          ? 'Completado'
                          : booking.status === 'CANCELLED'
                            ? 'Cancelado'
                            : booking.status === 'CONFIRMED'
                              ? 'Confirmado'
                              : booking.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab: Ficha */}
          <TabsContent value="ficha" className="space-y-6 mt-4">
            {FICHA_PACIENTE_GROUPS.map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.label}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    <h3 className="text-sm font-semibold">{group.label}</h3>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {group.fields.map((field) => (
                      <div
                        key={field.key}
                        className={
                          field.type === 'textarea' ? 'sm:col-span-2' : ''
                        }
                      >
                        <Label
                          htmlFor={field.key}
                          className="text-xs text-muted-foreground"
                        >
                          {field.label}
                        </Label>
                        {field.type === 'select' ? (
                          <Select
                            value={formData[field.key] || ''}
                            onValueChange={(v) => handleFieldChange(field.key, v)}
                          >
                            <SelectTrigger id={field.key} className="mt-1">
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options?.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : field.type === 'textarea' ? (
                          <Textarea
                            id={field.key}
                            value={formData[field.key] || ''}
                            onChange={(e) =>
                              handleFieldChange(field.key, e.target.value)
                            }
                            placeholder={field.placeholder}
                            className="mt-1 min-h-[60px]"
                            rows={2}
                          />
                        ) : (
                          <Input
                            id={field.key}
                            type={field.type}
                            value={formData[field.key] || ''}
                            onChange={(e) =>
                              handleFieldChange(field.key, e.target.value)
                            }
                            placeholder={field.placeholder}
                            className="mt-1"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Save button */}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Guardar ficha
            </Button>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
