'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Users,
  Phone,
  Mail,
  Briefcase,
  User,
  ImageIcon,
  Sparkles,
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
import { createApiClient, Employee } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ui/image-upload';

const colorVariants = [
  { gradient: 'from-violet-500 to-purple-500', bg: 'bg-violet-100 dark:bg-violet-900/40', text: 'text-violet-600 dark:text-violet-400' },
  { gradient: 'from-blue-500 to-indigo-500', bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-600 dark:text-blue-400' },
  { gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-600 dark:text-emerald-400' },
  { gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-600 dark:text-amber-400' },
  { gradient: 'from-teal-500 to-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/40', text: 'text-teal-600 dark:text-teal-400' },
  { gradient: 'from-cyan-500 to-sky-500', bg: 'bg-cyan-100 dark:bg-cyan-900/40', text: 'text-cyan-600 dark:text-cyan-400' },
];

interface EmployeeForm {
  name: string;
  email: string;
  phone: string;
  image: string;
  specialty: string;
  bio: string;
  isActive: boolean;
}

const emptyForm: EmployeeForm = {
  name: '',
  email: '',
  phone: '',
  image: '',
  specialty: '',
  bio: '',
  isActive: true,
};

export default function EmpleadosPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeForm>(emptyForm);

  useEffect(() => {
    if (session?.accessToken) {
      loadEmployees();
    }
  }, [session]);

  const loadEmployees = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const data = await api.getEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingEmployee(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email || '',
      phone: employee.phone || '',
      image: employee.image || '',
      specialty: employee.specialty || '',
      bio: employee.bio || '',
      isActive: employee.isActive,
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!session?.accessToken || !formData.name.trim()) return;

    setSaving(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const data = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        image: formData.image.trim() || undefined,
        specialty: formData.specialty.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        isActive: formData.isActive,
      };

      if (editingEmployee) {
        await api.updateEmployee(editingEmployee.id, data);
        toast({ title: 'Empleado actualizado', description: 'Los cambios se guardaron correctamente' });
      } else {
        await api.createEmployee(data);
        toast({ title: 'Empleado creado', description: 'El empleado fue agregado correctamente' });
      }

      setDialogOpen(false);
      loadEmployees();
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar el empleado', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!session?.accessToken || !employeeToDelete) return;

    try {
      const api = createApiClient(session.accessToken as string);
      await api.deleteEmployee(employeeToDelete.id);
      toast({ title: 'Empleado eliminado', description: 'El empleado fue eliminado correctamente' });
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
      loadEmployees();
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar el empleado', variant: 'destructive' });
    }
  };

  const activeCount = employees.filter(e => e.isActive).length;

  return (
    <div className="space-y-6" data-tour="employees-section">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 p-4 sm:p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-24 -right-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold">Empleados</h1>
                <p className="text-white/80 text-sm sm:text-base">
                  Gestiona tu equipo de trabajo
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={openCreateDialog}
            className="bg-white text-indigo-600 hover:bg-white/90 shadow-lg w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Empleado
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="relative grid grid-cols-2 gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20">
          <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">{employees.length}</p>
            </div>
            <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Total Empleados</p>
          </div>
          <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">{activeCount}</p>
            </div>
            <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Activos</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-indigo-100 dark:border-indigo-900" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
          </div>
          <p className="text-muted-foreground">Cargando empleados...</p>
        </div>
      ) : employees.length === 0 ? (
        <Card className="border-0 shadow-soft">
          <CardContent className="py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No tienes empleados aún</h3>
            <p className="text-muted-foreground mb-6">
              Agrega empleados para que tus clientes puedan elegir quién los atienda
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Primer Empleado
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {employees.map((employee, index) => {
            const colorVariant = colorVariants[index % colorVariants.length];
            return (
              <Card
                key={employee.id}
                className={`group border-0 shadow-soft overflow-hidden transition-all hover:shadow-soft-lg hover:-translate-y-1 ${
                  !employee.isActive ? 'opacity-60' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {employee.image ? (
                        <img
                          src={employee.image}
                          alt={employee.name}
                          className="h-14 w-14 rounded-xl object-cover shadow-lg"
                        />
                      ) : (
                        <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${colorVariant.gradient} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                          {employee.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {employee.name}
                        </CardTitle>
                        {employee.specialty && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {employee.specialty}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge
                      className={employee.isActive
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-0'
                        : 'bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 border-0'
                      }
                    >
                      {employee.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {employee.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {employee.bio}
                    </p>
                  )}

                  {employee.phone && (
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-neutral-800">
                      <Phone className="h-4 w-4 text-slate-400 dark:text-neutral-500" />
                      <span className="text-sm">{employee.phone}</span>
                    </div>
                  )}

                  {employee.email && (
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-neutral-800">
                      <Mail className="h-4 w-4 text-slate-400 dark:text-neutral-500" />
                      <span className="text-sm truncate">{employee.email}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9"
                      onClick={() => openEditDialog(employee)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
                      onClick={() => openDeleteDialog(employee)}
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
              <User className="h-5 w-5" />
              {editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto flex-1 pr-1 -mr-1">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre del empleado"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="specialty">Especialidad</Label>
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="Ej: Colorista, Masajista..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">Descripción</Label>
              <Input
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Breve descripción..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+54 11..."
              />
            </div>

            {/* Email nudge banner — only when editing an employee without email */}
            {editingEmployee && !editingEmployee.email && !formData.email && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                <Sparkles className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-indigo-700 dark:text-indigo-300">
                  Agrega un email para que reciba su perfil profesional y recordatorios de turnos
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@ejemplo.com"
              />
              <p className="text-[11px] text-muted-foreground">
                Le enviaremos su perfil profesional y recordatorios de turnos
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Foto de perfil</Label>
              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                onUpload={async (file) => {
                  if (!session?.accessToken) throw new Error('No autenticado');
                  const api = createApiClient(session.accessToken as string);
                  return api.uploadMedia(file, 'empleados');
                }}
                aspectRatio="square"
                placeholder="Subir foto"
              />
            </div>

            <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-neutral-800 rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="isActive" className="text-sm font-medium">Estado activo</Label>
                <p className="text-xs text-muted-foreground">
                  Visible para clientes
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
            <Button onClick={handleSave} disabled={saving || !formData.name.trim()} className="flex-1 sm:flex-none">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingEmployee ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar empleado?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El empleado &quot;{employeeToDelete?.name}&quot; será eliminado permanentemente.
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
