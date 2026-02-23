'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Building2,
  Phone,
  Mail,
  MapPin,
  Scissors,
  Users,
  Clock,
  Star,
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
import { createApiClient, Branch } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface BranchForm {
  name: string;
  slug: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  isMain: boolean;
  isActive: boolean;
}

const emptyForm: BranchForm = {
  name: '',
  slug: '',
  address: '',
  city: '',
  phone: '',
  email: '',
  isMain: false,
  isActive: true,
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function SucursalesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<BranchForm>(emptyForm);

  useEffect(() => {
    if (session?.accessToken) {
      loadBranches();
    }
  }, [session]);

  const loadBranches = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const data = await api.getBranches();
      setBranches(Array.isArray(data) ? data : []);
    } catch {
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingBranch(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      slug: branch.slug,
      address: branch.address || '',
      city: branch.city || '',
      phone: branch.phone || '',
      email: branch.email || '',
      isMain: branch.isMain,
      isActive: branch.isActive,
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (branch: Branch) => {
    setBranchToDelete(branch);
    setDeleteDialogOpen(true);
  };

  const handleNameChange = (name: string) => {
    const newFormData = { ...formData, name };
    // Auto-generate slug for new branches
    if (!editingBranch) {
      newFormData.slug = generateSlug(name);
    }
    setFormData(newFormData);
  };

  const handleSave = async () => {
    if (!session?.accessToken || !formData.name.trim() || !formData.slug.trim()) return;

    setSaving(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const data = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        address: formData.address.trim() || undefined,
        city: formData.city.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        isMain: formData.isMain,
        isActive: formData.isActive,
      };

      if (editingBranch) {
        await api.updateBranch(editingBranch.id, data);
        toast({ title: 'Sucursal actualizada', description: 'Los cambios se guardaron correctamente' });
      } else {
        await api.createBranch(data);
        toast({ title: 'Sucursal creada', description: 'La sucursal fue agregada correctamente' });
      }

      setDialogOpen(false);
      loadBranches();
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar la sucursal', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!session?.accessToken || !branchToDelete) return;

    try {
      const api = createApiClient(session.accessToken as string);
      await api.deleteBranch(branchToDelete.id);
      toast({ title: 'Sucursal eliminada', description: 'La sucursal fue eliminada correctamente' });
      setDeleteDialogOpen(false);
      setBranchToDelete(null);
      loadBranches();
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar la sucursal', variant: 'destructive' });
    }
  };

  const activeCount = branches.filter(b => b.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 p-4 sm:p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-24 -right-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold">Sucursales</h1>
                <p className="text-white/80 text-sm sm:text-base">
                  Gestiona las ubicaciones de tu negocio
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={openCreateDialog}
            className="bg-white text-teal-600 hover:bg-white/90 shadow-lg w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Sucursal
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="relative grid grid-cols-2 gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20">
          <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">{branches.length}</p>
            </div>
            <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Total Sucursales</p>
          </div>
          <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">{activeCount}</p>
            </div>
            <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Activas</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-teal-100 dark:border-teal-900" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-teal-600 dark:border-t-teal-400 animate-spin" />
          </div>
          <p className="text-muted-foreground">Cargando sucursales...</p>
        </div>
      ) : branches.length === 0 ? (
        <Card className="border-0 shadow-soft">
          <CardContent className="py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No tienes sucursales aun</h3>
            <p className="text-muted-foreground mb-6">
              Agrega sucursales si tu negocio tiene multiples ubicaciones
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Primera Sucursal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (
            <Card
              key={branch.id}
              className={`group border-0 shadow-soft overflow-hidden transition-all hover:shadow-soft-lg hover:-translate-y-1 ${
                !branch.isActive ? 'opacity-60' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {branch.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {branch.name}
                        {branch.isMain && (
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        /{branch.slug}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={branch.isActive
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-0'
                      : 'bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 border-0'
                    }
                  >
                    {branch.isActive ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {branch.address && (
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-neutral-800">
                    <MapPin className="h-4 w-4 text-slate-400 dark:text-neutral-500 flex-shrink-0" />
                    <span className="text-sm truncate">{branch.address}{branch.city ? `, ${branch.city}` : ''}</span>
                  </div>
                )}

                {branch.phone && (
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-neutral-800">
                    <Phone className="h-4 w-4 text-slate-400 dark:text-neutral-500" />
                    <span className="text-sm">{branch.phone}</span>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-teal-50 dark:bg-teal-900/20">
                    <Scissors className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    <span className="text-sm font-medium">{branch._count?.branchServices || 0} servicios</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium">{branch._count?.branchEmployees || 0} empleados</span>
                  </div>
                </div>

                {/* Management Links */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <Link href={`/sucursales/${branch.id}/servicios`}>
                    <Button variant="outline" size="sm" className="w-full h-9">
                      <Scissors className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/sucursales/${branch.id}/empleados`}>
                    <Button variant="outline" size="sm" className="w-full h-9">
                      <Users className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/sucursales/${branch.id}/horarios`}>
                    <Button variant="outline" size="sm" className="w-full h-9">
                      <Clock className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9"
                    onClick={() => openEditDialog(branch)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
                    onClick={() => openDeleteDialog(branch)}
                    disabled={branch.isMain}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] flex flex-col p-4 sm:p-6">
          <DialogHeader className="flex-shrink-0 pb-2">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" />
              {editingBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto flex-1 pr-1 -mr-1">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej: Sucursal Centro"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="sucursal-centro"
              />
              <p className="text-xs text-muted-foreground">
                Identificador unico para la URL de la sucursal
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">Direccion</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Ej: Av. Principal 123"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Ej: Buenos Aires"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+54 11..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sucursal@ejemplo.com"
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-2 px-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="isMain" className="text-sm font-medium">Sucursal principal</Label>
                <p className="text-xs text-muted-foreground">
                  Se mostrara primero en la lista
                </p>
              </div>
              <Switch
                id="isMain"
                checked={formData.isMain}
                onCheckedChange={(checked) => setFormData({ ...formData, isMain: checked })}
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
            <Button onClick={handleSave} disabled={saving || !formData.name.trim() || !formData.slug.trim()} className="flex-1 sm:flex-none">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingBranch ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar sucursal?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. La sucursal &quot;{branchToDelete?.name}&quot; sera eliminada permanentemente junto con sus asignaciones de servicios y empleados.
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
