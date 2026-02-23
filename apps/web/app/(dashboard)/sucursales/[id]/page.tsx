'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Loader2,
  Scissors,
  Users,
  Clock,
  ImageIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/ui/image-upload';
import { createApiClient, Branch } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface BranchForm {
  name: string;
  slug: string;
  image: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  isMain: boolean;
  isActive: boolean;
}

export default function BranchEditPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const branchId = params.id as string;

  const [branch, setBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<BranchForm>({
    name: '',
    slug: '',
    image: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    isMain: false,
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Upload handler for images
  const handleImageUpload = async (file: File) => {
    if (!session?.accessToken) throw new Error('No autenticado');
    const api = createApiClient(session.accessToken as string);
    return api.uploadMedia(file, 'branches');
  };

  useEffect(() => {
    if (session?.accessToken && branchId) {
      loadBranch();
    }
  }, [session, branchId]);

  const loadBranch = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const data = await api.getBranch(branchId);
      setBranch(data);
      setFormData({
        name: data.name,
        slug: data.slug,
        image: data.image || '',
        address: data.address || '',
        city: data.city || '',
        phone: data.phone || '',
        email: data.email || '',
        isMain: data.isMain,
        isActive: data.isActive,
      });
    } catch {
      toast({ title: 'Error', description: 'No se pudo cargar la sucursal', variant: 'destructive' });
      router.push('/sucursales');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session?.accessToken || !formData.name.trim() || !formData.slug.trim()) return;

    setSaving(true);
    try {
      const api = createApiClient(session.accessToken as string);
      await api.updateBranch(branchId, {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        image: formData.image.trim() || undefined,
        address: formData.address.trim() || undefined,
        city: formData.city.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        isMain: formData.isMain,
        isActive: formData.isActive,
      });

      toast({ title: 'Sucursal actualizada', description: 'Los cambios se guardaron correctamente' });
      router.push('/sucursales');
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar la sucursal', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-teal-100 dark:border-teal-900" />
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-teal-600 dark:border-t-teal-400 animate-spin" />
        </div>
        <p className="text-muted-foreground">Cargando sucursal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 p-4 sm:p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-24 -right-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative">
          <Link href="/sucursales" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4" />
            Volver a Sucursales
          </Link>

          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Editar {branch?.name}</h1>
              <p className="text-white/80">
                Modifica los datos de la sucursal
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Link href={`/sucursales/${branchId}/servicios`}>
          <Card className="border-0 shadow-soft hover:shadow-soft-lg transition-all cursor-pointer group">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Scissors className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <p className="font-medium">Servicios</p>
              <p className="text-sm text-muted-foreground">{branch?._count?.branchServices || 0} asignados</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/sucursales/${branchId}/empleados`}>
          <Card className="border-0 shadow-soft hover:shadow-soft-lg transition-all cursor-pointer group">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="font-medium">Empleados</p>
              <p className="text-sm text-muted-foreground">{branch?._count?.branchEmployees || 0} asignados</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/sucursales/${branchId}/horarios`}>
          <Card className="border-0 shadow-soft hover:shadow-soft-lg transition-all cursor-pointer group">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="font-medium">Horarios</p>
              <p className="text-sm text-muted-foreground">Configurar</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Edit Form */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle>Informacion de la Sucursal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Branch Image */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Foto de la sucursal
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Esta imagen se mostrara en la pagina de reservas cuando el cliente seleccione una sucursal
            </p>
            <ImageUpload
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              onUpload={handleImageUpload}
              aspectRatio="video"
              placeholder="Sube una foto de tu sucursal"
              enableCamera={true}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="flex items-center justify-between py-3 px-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
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

          <div className="flex items-center justify-between py-3 px-4 bg-slate-50 dark:bg-neutral-800 rounded-lg">
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

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Link href="/sucursales">
              <Button variant="outline">Cancelar</Button>
            </Link>
            <Button onClick={handleSave} disabled={saving || !formData.name.trim() || !formData.slug.trim()}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
