'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  GraduationCap,
  Layers,
  Users,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogFooter,
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
import { createApiClient, Specialty } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useTenantConfig, useRubroTerms } from '@/contexts/tenant-config-context';

const colorVariants = [
  { gradient: 'from-violet-500 to-purple-500', bg: 'bg-violet-100 dark:bg-violet-900/40', text: 'text-violet-600 dark:text-violet-400' },
  { gradient: 'from-blue-500 to-indigo-500', bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-600 dark:text-blue-400' },
  { gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-600 dark:text-emerald-400' },
  { gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-600 dark:text-amber-400' },
  { gradient: 'from-teal-500 to-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/40', text: 'text-teal-600 dark:text-teal-400' },
  { gradient: 'from-cyan-500 to-sky-500', bg: 'bg-cyan-100 dark:bg-cyan-900/40', text: 'text-cyan-600 dark:text-cyan-400' },
];

interface SpecialtyForm {
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
}

const emptyForm: SpecialtyForm = {
  name: '',
  slug: '',
  description: '',
  icon: '',
  isActive: true,
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ─── Rubro-specific placeholders ─────────────────────────────
const SPECIALTY_PLACEHOLDERS: Record<string, { name: string; slug: string; desc: string }> = {
  'estetica-belleza':   { name: 'Ej: Tratamientos faciales, Depilación láser', slug: 'tratamientos-faciales', desc: 'Ej: Tratamientos especializados para el cuidado de la piel' },
  'barberia':           { name: 'Ej: Cortes clásicos, Barbería premium', slug: 'cortes-clasicos', desc: 'Ej: Cortes y estilos con técnicas tradicionales' },
  'masajes-spa':        { name: 'Ej: Masajes descontracturantes, Spa relax', slug: 'masajes-descontracturantes', desc: 'Ej: Técnicas de relajación y alivio muscular' },
  'salud':              { name: 'Ej: Cardiología, Dermatología', slug: 'cardiologia', desc: 'Ej: Área de práctica médica especializada' },
  'psicologia':         { name: 'Ej: Terapia cognitiva, Psicología infantil', slug: 'terapia-cognitiva', desc: 'Ej: Enfoque terapéutico o área de atención' },
  'odontologia':        { name: 'Ej: Ortodoncia, Implantología', slug: 'ortodoncia', desc: 'Ej: Rama de la odontología especializada' },
  'veterinaria':        { name: 'Ej: Cirugía, Dermatología animal', slug: 'cirugia', desc: 'Ej: Área de atención veterinaria' },
  'nutricion':          { name: 'Ej: Nutrición deportiva, Alimentación saludable', slug: 'nutricion-deportiva', desc: 'Ej: Enfoque o área de la nutrición' },
  'abogados':           { name: 'Ej: Derecho Penal, Derecho Laboral', slug: 'derecho-penal', desc: 'Ej: Área de práctica legal' },
  'contadores':         { name: 'Ej: Impuestos, Auditoría', slug: 'impuestos', desc: 'Ej: Área de servicio contable' },
  'fitness':            { name: 'Ej: Funcional, CrossFit, Yoga', slug: 'funcional', desc: 'Ej: Disciplina o modalidad de entrenamiento' },
  'deportes':           { name: 'Ej: Fútbol, Tenis, Paddle', slug: 'futbol', desc: 'Ej: Deporte o actividad disponible' },
  'educacion':          { name: 'Ej: Inglés, Matemática, Programación', slug: 'ingles', desc: 'Ej: Materia o área de enseñanza' },
  'coaching':           { name: 'Ej: Coaching ejecutivo, Desarrollo personal', slug: 'coaching-ejecutivo', desc: 'Ej: Área o enfoque de coaching' },
  'tatuajes-piercing':  { name: 'Ej: Realismo, Old school, Piercings', slug: 'realismo', desc: 'Ej: Estilo o técnica de tatuaje' },
  'hospedaje':          { name: 'Ej: Suite premium, Habitación doble', slug: 'suite-premium', desc: 'Ej: Tipo de alojamiento' },
  'alquiler':           { name: 'Ej: Departamento, Casa, Oficina', slug: 'departamento', desc: 'Ej: Tipo de propiedad en alquiler' },
  'espacios':           { name: 'Ej: Sala de reuniones, Coworking', slug: 'sala-reuniones', desc: 'Ej: Tipo de espacio disponible' },
  'inmobiliarias':      { name: 'Ej: Departamentos, Casas, Locales', slug: 'departamentos', desc: 'Ej: Tipo de propiedad que gestionás' },
};

export default function EspecialidadesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const { clientLabelPlural, rubro } = useTenantConfig();
  const terms = useRubroTerms();
  const ph = SPECIALTY_PLACEHOLDERS[rubro] || { name: 'Ej: Nombre de la especialidad', slug: 'nombre-especialidad', desc: 'Ej: Breve descripción de la especialidad' };
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [specialtyToDelete, setSpecialtyToDelete] = useState<Specialty | null>(null);
  const [formData, setFormData] = useState<SpecialtyForm>(emptyForm);
  const [autoSlug, setAutoSlug] = useState(true);

  useEffect(() => {
    if (session?.accessToken) {
      loadSpecialties();
    }
  }, [session]);

  const loadSpecialties = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const data = await api.getSpecialties(true);
      setSpecialties(Array.isArray(data) ? data : []);
    } catch {
      setSpecialties([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingSpecialty(null);
    setFormData(emptyForm);
    setAutoSlug(true);
    setDialogOpen(true);
  };

  const openEditDialog = (specialty: Specialty) => {
    setEditingSpecialty(specialty);
    setFormData({
      name: specialty.name,
      slug: specialty.slug,
      description: specialty.description || '',
      icon: specialty.icon || '',
      isActive: specialty.isActive,
    });
    setAutoSlug(false);
    setDialogOpen(true);
  };

  const openDeleteDialog = (specialty: Specialty) => {
    setSpecialtyToDelete(specialty);
    setDeleteDialogOpen(true);
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      ...(autoSlug ? { slug: slugify(name) } : {}),
    }));
  };

  const handleSave = async () => {
    if (!session?.accessToken || !formData.name.trim() || !formData.slug.trim()) return;

    setSaving(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const data = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || undefined,
        icon: formData.icon.trim() || undefined,
        isActive: formData.isActive,
      };

      if (editingSpecialty) {
        await api.updateSpecialty(editingSpecialty.id, data);
        toast({ title: 'Especialidad actualizada', description: 'Los cambios se guardaron correctamente' });
      } else {
        await api.createSpecialty(data);
        toast({ title: 'Especialidad creada', description: 'La especialidad fue agregada correctamente' });
      }

      setDialogOpen(false);
      loadSpecialties();
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar la especialidad', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!session?.accessToken || !specialtyToDelete) return;

    try {
      const api = createApiClient(session.accessToken as string);
      await api.deleteSpecialty(specialtyToDelete.id);
      toast({ title: 'Especialidad eliminada', description: 'La especialidad fue eliminada correctamente' });
      setDeleteDialogOpen(false);
      setSpecialtyToDelete(null);
      loadSpecialties();
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar la especialidad', variant: 'destructive' });
    }
  };

  const activeCount = specialties.filter((s) => s.isActive).length;
  const totalServices = specialties.reduce((sum, s) => sum + (s._count?.services || 0), 0);
  const totalProfessionals = specialties.reduce((sum, s) => sum + (s._count?.employeeSpecialties || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 p-4 sm:p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-24 -right-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold">Especialidades</h1>
                <p className="text-white/80 text-sm sm:text-base">
                  Areas de practica y especialidades de tu equipo
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={openCreateDialog}
            className="bg-white text-indigo-600 hover:bg-white/90 shadow-lg w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Especialidad
          </Button>
        </div>

        <div className="relative grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20">
          <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">{activeCount}</p>
            </div>
            <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Especialidades</p>
          </div>
          <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">{totalServices}</p>
            </div>
            <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">{terms.servicePlural}</p>
          </div>
          <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">{totalProfessionals}</p>
            </div>
            <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">{terms.employeePlural}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-indigo-100 dark:border-indigo-900" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
          </div>
          <p className="text-muted-foreground">Cargando especialidades...</p>
        </div>
      ) : specialties.length === 0 ? (
        <Card className="border-0 shadow-soft">
          <CardContent className="py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No tienes especialidades aun</h3>
            <p className="text-muted-foreground mb-6">
              Crea especialidades para organizar {terms.servicePlural.toLowerCase()} y {terms.employeePlural.toLowerCase()} por area de practica
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Primera Especialidad
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {specialties.map((specialty, index) => {
            const colorVariant = colorVariants[index % colorVariants.length];
            return (
              <Card
                key={specialty.id}
                className={`group border-0 shadow-soft overflow-hidden transition-all hover:shadow-soft-lg hover:-translate-y-1 ${
                  !specialty.isActive ? 'opacity-60' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${colorVariant.gradient} flex items-center justify-center text-white shadow-lg`}>
                        <GraduationCap className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{specialty.name}</CardTitle>
                        <p className="text-xs text-muted-foreground font-mono">/{specialty.slug}</p>
                      </div>
                    </div>
                    <Badge
                      className={specialty.isActive
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-0'
                        : 'bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 border-0'
                      }
                    >
                      {specialty.isActive ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {specialty.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {specialty.description}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      <span>{specialty._count?.services || 0} {terms.servicePlural.toLowerCase()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span>{specialty._count?.employeeSpecialties || 0} {terms.employeePlural.toLowerCase()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9"
                      onClick={() => openEditDialog(specialty)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
                      onClick={() => openDeleteDialog(specialty)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] flex flex-col p-4 sm:p-6">
          <DialogHeader className="flex-shrink-0 pb-2">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5" />
              {editingSpecialty ? 'Editar Especialidad' : 'Nueva Especialidad'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto flex-1 pr-1 -mr-1">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={ph.name}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => {
                  setAutoSlug(false);
                  setFormData({ ...formData, slug: e.target.value });
                }}
                placeholder={ph.slug}
                className="font-mono text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Identificador en la URL. Solo letras minusculas, numeros y guiones.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Descripcion</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={ph.desc}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-neutral-800 rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="isActive" className="text-sm font-medium">Estado activa</Label>
                <p className="text-xs text-muted-foreground">
                  Visible para {clientLabelPlural.toLowerCase()} en la pagina publica
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 pt-3 mt-2 border-t gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 sm:flex-none">
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formData.name.trim() || !formData.slug.trim()}
              className="flex-1 sm:flex-none"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingSpecialty ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar especialidad?</AlertDialogTitle>
            <AlertDialogDescription>
              La especialidad &quot;{specialtyToDelete?.name}&quot; sera eliminada. Si tiene servicios asociados, se desactivara en lugar de eliminarse.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
