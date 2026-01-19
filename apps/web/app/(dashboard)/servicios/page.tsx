'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Plus,
  Pencil,
  Trash2,
  Clock,
  DollarSign,
  Scissors,
  Sparkles,
  MoreVertical,
  Power,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createApiClient } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  isActive: boolean;
  image: string | null;
}

const colorVariants = [
  { gradient: 'from-violet-500 to-purple-500', bg: 'bg-violet-100 dark:bg-violet-900/40', text: 'text-violet-600 dark:text-violet-400' },
  { gradient: 'from-blue-500 to-indigo-500', bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-600 dark:text-blue-400' },
  { gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-600 dark:text-emerald-400' },
  { gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-600 dark:text-amber-400' },
  { gradient: 'from-pink-500 to-rose-500', bg: 'bg-pink-100 dark:bg-pink-900/40', text: 'text-pink-600 dark:text-pink-400' },
  { gradient: 'from-cyan-500 to-sky-500', bg: 'bg-cyan-100 dark:bg-cyan-900/40', text: 'text-cyan-600 dark:text-cyan-400' },
];

export default function ServiciosPage() {
  const { data: session } = useSession();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '30',
  });

  useEffect(() => {
    if (session?.accessToken) {
      loadServices();
    }
  }, [session]);

  const loadServices = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const data = await api.getServices();
      setServices((data || []) as Service[]);
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken) return;

    const api = createApiClient(session.accessToken as string);

    const serviceData = {
      name: formData.name,
      description: formData.description || undefined,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
    };

    if (editingService) {
      await api.updateService(editingService.id, serviceData);
    } else {
      await api.createService(serviceData);
    }

    setDialogOpen(false);
    setEditingService(null);
    setFormData({ name: '', description: '', price: '', duration: '30' });
    loadServices();
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      duration: service.duration.toString(),
    });
    setDialogOpen(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (!session?.accessToken) return;
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return;

    const api = createApiClient(session.accessToken as string);
    await api.deleteService(serviceId);
    loadServices();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingService(null);
    setFormData({ name: '', description: '', price: '', duration: '30' });
  };

  // Stats
  const activeServices = services.filter(s => s.isActive).length;
  const avgPrice = services.length > 0
    ? services.reduce((acc, s) => acc + s.price, 0) / services.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8 text-white">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Scissors className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Servicios</h1>
                <p className="text-white/80">
                  Gestiona los servicios que ofreces
                </p>
              </div>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-white text-emerald-600 hover:bg-white/90 shadow-lg"
                onClick={() => handleDialogClose()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Servicio
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del servicio</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ej: Corte de pelo"
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción (opcional)</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Ej: Corte clásico con máquina y tijera"
                    className="h-11"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="0"
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duración (min)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="5"
                      max="480"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      required
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDialogClose}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  >
                    {editingService ? 'Guardar Cambios' : 'Crear Servicio'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Stats */}
        <div className="relative grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
          <div className="text-center">
            <p className="text-3xl font-bold">{services.length}</p>
            <p className="text-white/70 text-sm">Total</p>
          </div>
          <div className="text-center border-x border-white/20">
            <p className="text-3xl font-bold">{activeServices}</p>
            <p className="text-white/70 text-sm">Activos</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{formatPrice(avgPrice)}</p>
            <p className="text-white/70 text-sm">Precio Promedio</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-emerald-100 dark:border-emerald-900" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-emerald-600 dark:border-t-emerald-400 animate-spin" />
          </div>
          <p className="text-muted-foreground">Cargando servicios...</p>
        </div>
      ) : services.length === 0 ? (
        <Card className="border-0 shadow-soft">
          <CardContent className="py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-4">
              <Scissors className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No tienes servicios</h3>
            <p className="text-muted-foreground mb-6">
              Crea tu primer servicio para empezar a recibir turnos
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear primer servicio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const colorVariant = colorVariants[index % colorVariants.length];
            return (
              <Card
                key={service.id}
                className={`group border-0 shadow-soft overflow-hidden transition-all hover:shadow-soft-lg hover:-translate-y-1 ${!service.isActive ? 'opacity-60' : ''}`}
              >
                <div className={`h-2 bg-gradient-to-r ${colorVariant.gradient}`} />
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${colorVariant.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {service.name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        {service.name}
                      </CardTitle>
                      {!service.isActive && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          <Power className="h-3 w-3 mr-1" />
                          Inactivo
                        </Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(service)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(service.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  {service.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${colorVariant.bg}`}>
                      <DollarSign className={`h-4 w-4 ${colorVariant.text}`} />
                      <span className={`font-semibold ${colorVariant.text}`}>
                        {formatPrice(service.price)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-neutral-800">
                      <Clock className="h-4 w-4 text-slate-600 dark:text-neutral-400" />
                      <span className="font-medium text-slate-600 dark:text-neutral-400">
                        {service.duration} min
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
