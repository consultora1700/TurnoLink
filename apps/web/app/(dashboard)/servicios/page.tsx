'use client';

import { useEffect, useState, useRef } from 'react';
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
  TrendingUp,
  Layers,
  Zap,
  X,
  ImagePlus,
  Moon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createApiClient, Tenant } from '@/lib/api';
import { formatPrice, formatDuration } from '@/lib/utils';
import { notifications, errorNotifications } from '@/lib/notifications';
import { ImageUpload } from '@/components/ui/image-upload';
import { ImageDisplayModePicker } from '@/components/services/image-display-mode-picker';
import { VariationsEditor, type VariationGroup } from '@/components/services/variations-editor';

interface Service {
  id: string;
  name: string;
  description: string | null;
  includes: string | null;
  price: number;
  duration: number;
  isActive: boolean;
  image: string | null;
  images?: string[];
  imageDisplayMode?: string;
  variations?: VariationGroup[];
}

const colorVariants = [
  { gradient: 'from-violet-500 to-purple-500', bg: 'bg-violet-100 dark:bg-violet-900/40', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800/50' },
  { gradient: 'from-blue-500 to-indigo-500', bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800/50' },
  { gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800/50' },
  { gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800/50' },
  { gradient: 'from-teal-500 to-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/40', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-800/50' },
  { gradient: 'from-cyan-500 to-sky-500', bg: 'bg-cyan-100 dark:bg-cyan-900/40', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800/50' },
];

export default function ServiciosPage() {
  const { data: session } = useSession();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    includes: '',
    price: '',
    duration: '30',
    image: '',
    images: [] as string[],
    imageDisplayMode: {} as Record<string, string>,
    variations: [] as VariationGroup[],
  });
  const formRef = useRef<HTMLFormElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [bookingMode, setBookingMode] = useState<string>('HOURLY');

  useEffect(() => {
    if (session?.accessToken) {
      loadServices();
      // Load tenant settings to detect booking mode
      const api = createApiClient(session.accessToken as string);
      api.getTenant().then((tenant) => {
        try {
          const settings = typeof tenant.settings === 'string' ? JSON.parse(tenant.settings) : tenant.settings;
          if (settings?.bookingMode) setBookingMode(settings.bookingMode);
        } catch {}
      }).catch(() => {});
    }
  }, [session]);

  const loadServices = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const data = await api.getServices();
      setServices(((data || []) as Service[]).map(s => ({
        ...s,
        images: Array.isArray(s.images) ? s.images : [],
      })));
    } catch (error) {
      setServices([]);
      errorNotifications.loadFailed();
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken || isSubmitting) return;

    setIsSubmitting(true);
    const api = createApiClient(session.accessToken as string);

    const serviceData = {
      name: formData.name,
      description: formData.description || undefined,
      includes: formData.includes || undefined,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
      image: formData.image || undefined,
      images: formData.images.length > 0 ? formData.images : [],
      imageDisplayMode: Object.keys(formData.imageDisplayMode).length > 0
        ? JSON.stringify(formData.imageDisplayMode)
        : 'cover',
      variations: formData.variations.length > 0
        ? JSON.stringify(formData.variations)
        : '[]',
    };

    try {
      if (editingService) {
        await api.updateService(editingService.id, serviceData);
        notifications.serviceUpdated();
      } else {
        await api.createService(serviceData);
        notifications.serviceCreated();
      }

      handleFormClose();
      loadServices();
    } catch (error) {
      errorNotifications.saveFailed();
      console.error('Error saving service:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputFocus = () => {
    // En mobile, hacer scroll al elemento activo cuando aparece el teclado
    setTimeout(() => {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && window.innerWidth < 640) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      includes: service.includes || '',
      price: service.price.toString(),
      duration: service.duration.toString(),
      image: service.image || '',
      images: Array.isArray(service.images) ? service.images : [],
      imageDisplayMode: parseImageDisplayMode(service.imageDisplayMode),
      variations: Array.isArray(service.variations) ? service.variations : [],
    });
    setFormOpen(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (!session?.accessToken) return;
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return;

    try {
      const api = createApiClient(session.accessToken as string);
      await api.deleteService(serviceId);
      notifications.serviceDeleted();
      loadServices();
    } catch (error) {
      errorNotifications.deleteFailed();
      console.error('Error deleting service:', error);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingService(null);
    setFormData({ name: '', description: '', includes: '', price: '', duration: '30', image: '', images: [], imageDisplayMode: {}, variations: [] });
  };

  const openNewForm = () => {
    handleFormClose();
    setTimeout(() => setFormOpen(true), 50);
  };

  const handleImageUpload = async (file: File) => {
    if (!session?.accessToken) {
      throw new Error('No hay sesión activa');
    }
    try {
      const api = createApiClient(session.accessToken as string);
      const result = await api.uploadMedia(file, 'services');
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Error al subir la imagen. Verifica tu conexión.');
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.accessToken) return;
    if (formData.images.length >= 5) return;

    setUploadingGallery(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const result = await api.uploadMedia(file, 'services');
      setFormData(prev => ({ ...prev, images: [...prev.images, result.url] }));
    } catch (error) {
      console.error('Gallery upload error:', error);
      errorNotifications.saveFailed();
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => {
      const newModes = { ...prev.imageDisplayMode };
      // Remove mode for deleted image and shift subsequent keys
      const galleryKey = String(index + 1); // +1 because 0 = main image
      delete newModes[galleryKey];
      // Shift keys after removed index
      const shifted: Record<string, string> = {};
      for (const [k, v] of Object.entries(newModes)) {
        const num = parseInt(k);
        if (!isNaN(num) && num > parseInt(galleryKey)) {
          shifted[String(num - 1)] = v;
        } else {
          shifted[k] = v;
        }
      }
      return { ...prev, images: prev.images.filter((_, i) => i !== index), imageDisplayMode: shifted };
    });
  };

  // Parse imageDisplayMode: supports old "cover"/"contain" string or new JSON object
  const parseImageDisplayMode = (raw?: string): Record<string, string> => {
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) return parsed;
    } catch {}
    // Old format: single string applies to none (all default to cover)
    if (raw === 'contain') return { 0: 'contain' };
    return {};
  };

  const getImageMode = (index: number): string => {
    return formData.imageDisplayMode[String(index)] || 'cover';
  };

  const setImageMode = (index: number, mode: string) => {
    setFormData(prev => ({
      ...prev,
      imageDisplayMode: { ...prev.imageDisplayMode, [String(index)]: mode },
    }));
  };

  // Stats
  const activeServices = services.filter(s => s.isActive).length;
  const avgPrice = services.length > 0
    ? services.reduce((acc, s) => acc + s.price, 0) / services.length
    : 0;

  // Formulario con estilos responsivos (CSS-only, sin JS detection)
  const FormContent = (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="space-y-4">
        {/* Imagen del servicio */}
        <div className="space-y-2">
          <Label>Imagen del servicio (opcional)</Label>
          <ImageUpload
            value={formData.image}
            onChange={(url) => setFormData({ ...formData, image: url })}
            onUpload={handleImageUpload}
            aspectRatio="video"
            placeholder="Subir imagen del servicio"
          />
          {/* Selector de modo para imagen principal */}
          {formData.image && (
            <ImageDisplayModePicker
              imageUrl={formData.image}
              mode={getImageMode(0)}
              onChange={(mode) => setImageMode(0, mode)}
            />
          )}
        </div>

        {/* Galería de imágenes adicionales */}
        <div className="space-y-2">
          <Label>Imágenes adicionales (opcional, máx. 5)</Label>
          <div className="grid grid-cols-3 gap-2">
            {formData.images.map((url, index) => (
              <div key={index} className="space-y-1">
                <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                  <img src={url} alt={`Galería ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                {/* Selector de modo por foto */}
                <ImageDisplayModePicker
                  imageUrl={url}
                  mode={getImageMode(index + 1)}
                  onChange={(mode) => setImageMode(index + 1, mode)}
                  compact
                />
              </div>
            ))}
            {formData.images.length < 5 && (
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploadingGallery}
                className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors"
              >
                {uploadingGallery ? (
                  <div className="h-5 w-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <ImagePlus className="h-5 w-5" />
                    <span className="text-[10px]">Agregar</span>
                  </>
                )}
              </button>
            )}
          </div>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleGalleryUpload}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nombre del servicio</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            onFocus={handleInputFocus}
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
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            onFocus={handleInputFocus}
            placeholder="Ej: Corte clásico con máquina y tijera"
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="includes">¿Qué incluye? (opcional)</Label>
          <textarea
            id="includes"
            value={formData.includes}
            onChange={(e) => setFormData({ ...formData, includes: e.target.value })}
            onFocus={handleInputFocus}
            placeholder="Ej: Lavado, secado, productos premium..."
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          />
          <p className="text-xs text-muted-foreground">Separa cada item con una coma o escribe en líneas separadas</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="price">{bookingMode === 'DAILY' ? 'Precio por noche ($)' : 'Precio ($)'}</Label>
            <Input
              id="price"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              onFocus={handleInputFocus}
              placeholder="0"
              required
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label>Duración</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="24"
                  value={Math.floor(parseInt(formData.duration || '0') / 60) || ''}
                  onChange={(e) => {
                    const hrs = parseInt(e.target.value) || 0;
                    const currentMins = parseInt(formData.duration || '0') % 60;
                    setFormData({ ...formData, duration: String(hrs * 60 + currentMins) });
                  }}
                  onFocus={handleInputFocus}
                  placeholder="0"
                  className="h-11 pr-8"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">hs</span>
              </div>
              <div className="relative flex-1">
                <Input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="59"
                  value={(parseInt(formData.duration || '0') % 60) || ''}
                  onChange={(e) => {
                    const mins = Math.min(59, parseInt(e.target.value) || 0);
                    const currentHrs = Math.floor(parseInt(formData.duration || '0') / 60);
                    setFormData({ ...formData, duration: String(currentHrs * 60 + mins) });
                  }}
                  onFocus={handleInputFocus}
                  placeholder="0"
                  className="h-11 pr-10"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Variaciones de precio/duración */}
        <VariationsEditor
          value={formData.variations}
          onChange={(variations) => setFormData(prev => ({ ...prev, variations }))}
        />
      </div>

      {/* Botones - responsive con CSS */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 pb-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleFormClose}
          disabled={isSubmitting}
          className="w-full sm:w-auto h-11 sm:h-10"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto h-11 sm:h-10 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
        >
          {isSubmitting ? 'Guardando...' : editingService ? 'Guardar' : 'Crear'}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-4 sm:space-y-6" data-tour="services-section">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-4 sm:p-6 text-white">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-24 -right-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative">
          {/* Title + Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                <Scissors className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Servicios</h1>
                <p className="text-white/80 text-xs sm:text-sm">
                  Gestiona los servicios que ofreces
                </p>
              </div>
            </div>

            <Button
              className="bg-white text-emerald-600 hover:bg-white/90 shadow-lg w-full sm:w-auto"
              onClick={openNewForm}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Servicio
            </Button>
          </div>

          {/* Stats */}
          <div className="relative grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20">
            <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-1 sm:gap-2">
                <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
                <p className="text-xl sm:text-2xl md:text-3xl font-bold">{services.length}</p>
              </div>
              <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Total</p>
            </div>
            <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-1 sm:gap-2">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
                <p className="text-xl sm:text-2xl md:text-3xl font-bold">{activeServices}</p>
              </div>
              <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Activos</p>
            </div>
            <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm min-w-0">
              <div className="flex items-center gap-1 sm:gap-2 w-full justify-center">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block flex-shrink-0" />
                <p className="text-lg sm:text-2xl md:text-3xl font-bold truncate">
                  {formatPrice(avgPrice).replace('$ ', '$')}
                </p>
              </div>
              <p className="text-white/70 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">Promedio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario - Dialog responsivo (evita errores de hidratación) */}
      <Dialog open={formOpen} onOpenChange={(open) => !open && handleFormClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
            </DialogTitle>
            <DialogDescription>
              {editingService
                ? 'Modifica los datos del servicio existente.'
                : 'Completa los datos para crear un nuevo servicio.'}
            </DialogDescription>
          </DialogHeader>
          {FormContent}
        </DialogContent>
      </Dialog>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 gap-4">
          <div className="relative">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border-4 border-emerald-100 dark:border-emerald-900" />
            <div className="absolute inset-0 h-14 w-14 sm:h-16 sm:w-16 rounded-full border-4 border-transparent border-t-emerald-600 dark:border-t-emerald-400 animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">Cargando servicios...</p>
        </div>
      ) : services.length === 0 ? (
        <Card className="border-0 shadow-soft">
          <CardContent className="py-12 sm:py-16 text-center px-4">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-4">
              <Scissors className="h-7 w-7 sm:h-8 sm:w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-base sm:text-lg mb-2">No tienes servicios</h3>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base">
              Crea tu primer servicio para empezar a recibir turnos
            </p>
            <Button
              onClick={openNewForm}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear primer servicio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const colorVariant = colorVariants[index % colorVariants.length];
            return (
              <Card
                key={service.id}
                className={`group relative border shadow-soft overflow-hidden transition-all duration-300 hover:shadow-soft-lg sm:hover:-translate-y-1 active:scale-[0.98] sm:active:scale-100 ${colorVariant.border} ${!service.isActive ? 'opacity-60' : ''}`}
              >
                {/* Color accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorVariant.gradient}`} />

                {/* Service Image or Avatar */}
                <div className="relative">
                  {service.image ? (
                    <div className="w-full h-32 sm:h-36 overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                  ) : (
                    <div className={`w-full h-24 sm:h-28 bg-gradient-to-br ${colorVariant.gradient} flex items-center justify-center`}>
                      <span className="text-white font-bold text-4xl sm:text-5xl opacity-30">
                        {service.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Actions menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 sm:h-9 sm:w-9 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => handleEdit(service)} className="gap-2">
                        <Pencil className="h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(service.id)}
                        className="gap-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Inactive badge */}
                  {!service.isActive && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-xs bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm">
                        <Power className="h-3 w-3 mr-1" />
                        Inactivo
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <CardContent className="p-3 sm:p-4 pt-3">
                  <h3 className="font-semibold text-base sm:text-lg mb-1 line-clamp-1">
                    {service.name}
                  </h3>

                  {service.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2 min-h-[2.5rem]">
                      {service.description}
                    </p>
                  )}

                  {/* Variations badge */}
                  {service.variations && service.variations.length > 0 && (
                    <div className="mb-2">
                      <Badge variant="secondary" className="text-[10px] sm:text-xs">
                        {service.variations.length} {service.variations.length === 1 ? 'variación' : 'variaciones'}
                      </Badge>
                    </div>
                  )}

                  {/* Price and Duration */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t">
                    <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg ${colorVariant.bg} flex-1 min-w-0`}>
                      <DollarSign className={`h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 ${colorVariant.text}`} />
                      <span className={`font-semibold text-sm sm:text-base truncate ${colorVariant.text}`}>
                        {formatPrice(service.price).replace('$ ', '')}{bookingMode === 'DAILY' ? '/noche' : ''}
                      </span>
                    </div>
                    {bookingMode === 'DAILY' ? (
                      <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex-shrink-0">
                        <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="font-medium text-sm sm:text-base text-indigo-600 dark:text-indigo-400">
                          Por día
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-neutral-800 flex-shrink-0">
                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600 dark:text-neutral-400" />
                        <span className="font-medium text-sm sm:text-base text-slate-600 dark:text-neutral-400">
                          {formatDuration(service.duration)}
                        </span>
                      </div>
                    )}
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
