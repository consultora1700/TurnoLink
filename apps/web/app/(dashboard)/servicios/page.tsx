'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
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
  Users,
  MapPin,
  Video,
  RefreshCw,
  Copy,
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
import { createApiClient, Tenant, Specialty, IntakeForm } from '@/lib/api';
import { formatPrice, formatDuration } from '@/lib/utils';
import { notifications, errorNotifications, handleApiError } from '@/lib/notifications';
import { getAmenitiesCatalog } from '@/lib/amenities-catalog';
import { getRubroUIConfig } from '@/lib/tenant-config';
import { toast } from '@/hooks/use-toast';
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
  capacity?: number;
  mode?: string;
  isActive: boolean;
  image: string | null;
  images?: string[];
  imageDisplayMode?: string;
  variations?: VariationGroup[];
  specialtyId?: string | null;
  assignmentMode?: string;
  visibleOnPublicPage?: boolean;
  specialty?: { id: string; name: string; slug: string } | null;
  intakeFormId?: string | null;
  intakeForm?: { id: string; name: string } | null;
}

interface SpecialtyOption {
  id: string;
  name: string;
  slug: string;
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
    capacity: '1',
    mode: 'presencial',
    image: '',
    images: [] as string[],
    imageDisplayMode: {} as Record<string, string>,
    variations: [] as VariationGroup[],
    specialtyId: '',
    assignmentMode: 'client_chooses',
    visibleOnPublicPage: true,
    intakeFormId: '',
    // Check-in/out times (daily mode)
    checkInTime: '',
    checkOutTime: '',
    // Rich content per service
    youtubeVideoUrl: '',
    serviceAmenities: [] as string[],
    // Pack fields
    isPack: false,
    packCheckIn: '',
    packCheckOut: '',
    packNights: '',
    packOriginalPrice: '',
    packTotalPrice: '',
    // Promo fields
    promoActive: false,
    promoPrice: '',
    promoStartDate: '',
    promoEndDate: '',
    promoMaxBookings: '',
    promoLabel: '',
  });
  const formRef = useRef<HTMLFormElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [bookingMode, setBookingMode] = useState<string>('HOURLY');
  const [rubro, setRubro] = useState<string>('');
  const [enableServiceContent, setEnableServiceContent] = useState(false);
  const [specialties, setSpecialties] = useState<SpecialtyOption[]>([]);
  const [intakeForms, setIntakeForms] = useState<{ id: string; name: string }[]>([]);

  const RUBROS_SIN_ONLINE = ['estetica-belleza', 'barberia', 'masajes-spa', 'tatuajes-piercing', 'hospedaje', 'alquiler', 'espacios', 'veterinaria', 'odontologia', 'deportes', 'inmobiliarias'];
  const supportsOnlineMode = !rubro || !RUBROS_SIN_ONLINE.includes(rubro);
  const RUBROS_SIN_PROFESIONAL = ['hospedaje', 'alquiler', 'espacios', 'deportes', 'inmobiliarias'];
  const supportsProfessionalAssignment = !rubro || !RUBROS_SIN_PROFESIONAL.includes(rubro);
  const isDaily = bookingMode === 'DAILY';

  // ─── Rubro-specific placeholders & labels ───────────────────
  const RUBRO_PLACEHOLDERS: Record<string, { name: string; desc: string; includes: string }> = {
    'estetica-belleza': { name: 'Ej: Limpieza facial profunda', desc: 'Ej: Tratamiento completo con productos premium', includes: 'Ej: Limpieza, exfoliación, hidratación, mascarilla' },
    'barberia':         { name: 'Ej: Corte de pelo', desc: 'Ej: Corte clásico con máquina y tijera', includes: 'Ej: Lavado, corte, peinado' },
    'masajes-spa':      { name: 'Ej: Masaje descontracturante', desc: 'Ej: Sesión de 60 minutos con aceites esenciales', includes: 'Ej: Camilla, aromaterapia, música relajante' },
    'salud':            { name: 'Ej: Consulta médica general', desc: 'Ej: Evaluación clínica completa', includes: 'Ej: Examen físico, indicaciones, receta' },
    'odontologia':      { name: 'Ej: Limpieza dental', desc: 'Ej: Limpieza con ultrasonido y pulido', includes: 'Ej: Revisión, limpieza, flúor' },
    'psicologia':       { name: 'Ej: Sesión de terapia individual', desc: 'Ej: Sesión de 50 minutos, modalidad cognitivo-conductual', includes: 'Ej: Evaluación, seguimiento, técnicas de manejo' },
    'nutricion':        { name: 'Ej: Consulta nutricional', desc: 'Ej: Evaluación y plan alimentario personalizado', includes: 'Ej: Medición corporal, plan alimentario, seguimiento' },
    'fitness':          { name: 'Ej: Clase de funcional', desc: 'Ej: Entrenamiento grupal de 45 minutos', includes: 'Ej: Calentamiento, circuito, elongación' },
    'veterinaria':      { name: 'Ej: Consulta veterinaria', desc: 'Ej: Control general de salud', includes: 'Ej: Revisión, vacunación, desparasitación' },
    'tatuajes-piercing': { name: 'Ej: Tatuaje pequeño', desc: 'Ej: Diseño de hasta 10 cm en zona a elección', includes: 'Ej: Diseño personalizado, tinta premium, cuidados post' },
    'educacion':        { name: 'Ej: Clase particular de matemáticas', desc: 'Ej: Clase de 1 hora, nivel secundario', includes: 'Ej: Material de estudio, ejercitación, consultas' },
    'consultoria':      { name: 'Ej: Consulta legal inicial', desc: 'Ej: Asesoramiento de 30 minutos', includes: 'Ej: Análisis del caso, orientación, presupuesto' },
    'deportes':         { name: 'Ej: Cancha de fútbol 5', desc: 'Ej: Alquiler por 1 hora con iluminación', includes: 'Ej: Cancha, iluminación, vestuarios' },
    'espacios':         { name: 'Ej: Sala de reuniones', desc: 'Ej: Sala para 8 personas con proyector', includes: 'Ej: Proyector, Wi-Fi, café' },
    'hospedaje':        { name: 'Ej: Habitación doble estándar', desc: 'Ej: Habitación con cama matrimonial y baño privado', includes: 'Ej: Ropa de cama, toallas, Wi-Fi, desayuno' },
    'alquiler':         { name: 'Ej: Cabaña para 4 personas', desc: 'Ej: Cabaña con vista al lago, 2 dormitorios', includes: 'Ej: Cocina equipada, parrilla, pileta, estacionamiento' },
  };

  const ph = RUBRO_PLACEHOLDERS[rubro] || { name: 'Ej: Nombre del servicio', desc: 'Ej: Descripción breve del servicio', includes: 'Ej: Lo que incluye el servicio' };

  // Capacity labels per rubro
  const CAPACITY_BY_RUBRO: Record<string, { label: string; suffix: string; hint: string }> = {
    'hospedaje':        { label: 'Habitaciones disponibles', suffix: 'habitaciones', hint: 'Cuántas habitaciones de este tipo tenés disponibles para reservar en la misma fecha' },
    'alquiler':         { label: 'Propiedades disponibles', suffix: 'propiedades', hint: 'Cuántas propiedades de este tipo tenés disponibles para reservar en la misma fecha' },
    'espacios':         { label: 'Salas disponibles', suffix: 'salas', hint: 'Cuántas salas de este tipo se pueden reservar en simultáneo' },
    'deportes':         { label: 'Canchas disponibles', suffix: 'canchas', hint: 'Cuántas canchas de este tipo se pueden reservar en el mismo horario' },
    'barberia':         { label: 'Turnos simultáneos', suffix: 'turnos', hint: 'Cuántos clientes se pueden atender a la vez (ej: 3 barberos = 3 turnos)' },
    'estetica-belleza': { label: 'Turnos simultáneos', suffix: 'turnos', hint: 'Cuántos clientes se pueden atender a la vez (ej: 3 profesionales = 3 turnos)' },
    'masajes-spa':      { label: 'Turnos simultáneos', suffix: 'turnos', hint: 'Cuántos clientes se pueden atender a la vez (ej: 2 camillas = 2 turnos)' },
    'fitness':          { label: 'Cupos por clase', suffix: 'cupos', hint: 'Cuántos alumnos pueden anotarse en esta clase por horario' },
    'educacion':        { label: 'Cupos por clase', suffix: 'cupos', hint: 'Cuántos alumnos pueden inscribirse en esta clase por horario' },
    'salud':            { label: 'Consultorios disponibles', suffix: 'consultorios', hint: 'Cuántas consultas de esta especialidad se atienden en simultáneo' },
    'odontologia':      { label: 'Sillones disponibles', suffix: 'sillones', hint: 'Cuántos pacientes se atienden a la vez (ej: 2 sillones = 2 turnos)' },
    'veterinaria':      { label: 'Turnos simultáneos', suffix: 'turnos', hint: 'Cuántos pacientes se atienden a la vez en este servicio' },
  };
  const capacityCfg = CAPACITY_BY_RUBRO[rubro] || (isDaily
    ? { label: 'Disponibilidad', suffix: 'disponibles', hint: 'Cuántas unidades de este servicio se pueden reservar en la misma fecha' }
    : { label: 'Turnos simultáneos', suffix: 'turnos', hint: 'Cuántas reservas puede recibir este servicio en un mismo horario' });
  const capacityLabel = capacityCfg.label;
  const capacitySuffix = capacityCfg.suffix;
  const capacityHint = capacityCfg.hint;

  useEffect(() => {
    if (session?.accessToken) {
      loadServices();
      // Load tenant settings to detect booking mode and rubro
      const api = createApiClient(session.accessToken as string);
      api.getTenant().then((tenant) => {
        try {
          const settings = typeof tenant.settings === 'string' ? JSON.parse(tenant.settings) : tenant.settings;
          if (settings?.bookingMode) setBookingMode(settings.bookingMode);
          if (settings?.rubro) setRubro(settings.rubro);
          if (settings?.enableServiceContent) setEnableServiceContent(true);
        } catch {}
      }).catch((error) => handleApiError(error));
      api.getSpecialties().then((data) => {
        setSpecialties((data || []).map(s => ({ id: s.id, name: s.name, slug: s.slug })));
      }).catch((error) => handleApiError(error));
      api.getIntakeForms().then((data) => {
        setIntakeForms((data || []).filter(f => f.isActive).map(f => ({ id: f.id, name: f.name })));
      }).catch((error) => handleApiError(error));
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
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken || isSubmitting) return;

    setIsSubmitting(true);
    const api = createApiClient(session.accessToken as string);

    // Sanitize variations: remove empty labels and options (preserve __mode__ as-is)
    const cleanVariations = formData.variations
      .map(g => {
        if (g.id === '__mode__') return g;
        return { ...g, label: g.label.trim(), options: g.options.filter(o => o.name.trim() !== '') };
      })
      .filter(g => g.id === '__mode__' || (g.label !== '' && g.options.length > 0));

    const serviceData = {
      name: formData.name,
      description: formData.description || undefined,
      includes: formData.includes || undefined,
      // For packs: price = pack total price; for normal: price = per-night/per-session
      price: formData.isPack && formData.packTotalPrice
        ? parseFloat(formData.packTotalPrice)
        : parseFloat(formData.price),
      duration: parseInt(formData.duration),
      capacity: parseInt(formData.capacity) || 1,
      mode: formData.mode,
      image: formData.image || undefined,
      images: formData.images.length > 0 ? formData.images : [],
      imageDisplayMode: Object.keys(formData.imageDisplayMode).length > 0
        ? JSON.stringify(formData.imageDisplayMode)
        : 'cover',
      variations: cleanVariations.length > 0
        ? JSON.stringify(cleanVariations)
        : '[]',
      specialtyId: formData.specialtyId || undefined,
      assignmentMode: formData.assignmentMode,
      visibleOnPublicPage: formData.visibleOnPublicPage,
      intakeFormId: formData.intakeFormId || undefined,
      // Per-service check-in/out times
      checkInTime: formData.checkInTime || null,
      checkOutTime: formData.checkOutTime || null,
      // Rich content
      youtubeVideoUrl: formData.youtubeVideoUrl || null,
      amenities: formData.serviceAmenities.length > 0 ? JSON.stringify(formData.serviceAmenities) : '[]',
      // Pack fields — send explicit values so backend can clear them
      ...(formData.isPack ? {
        isPack: true,
        packCheckIn: formData.packCheckIn || undefined,
        packCheckOut: formData.packCheckOut || undefined,
        packNights: formData.packNights ? parseInt(formData.packNights) : undefined,
        // Auto-calc: noches × precio por noche = precio sin descuento
        packOriginalPrice: formData.packNights && formData.price
          ? parseFloat(formData.price) * parseInt(formData.packNights)
          : undefined,
      } : editingService ? {
        isPack: false,
        packCheckIn: null as any,
        packCheckOut: null as any,
        packNights: null as any,
        packOriginalPrice: null as any,
      } : {}),
      // Promo fields — send explicit null to clear when deactivated
      ...(formData.promoActive && formData.promoPrice !== '' ? {
        promoPrice: parseFloat(formData.promoPrice),
        promoStartDate: formData.promoStartDate || null as any,
        promoEndDate: formData.promoEndDate || null as any,
        promoMaxBookings: formData.promoMaxBookings ? parseInt(formData.promoMaxBookings) : null as any,
        promoLabel: formData.promoLabel || null as any,
      } : editingService ? {
        promoPrice: null as any,
        promoStartDate: null as any,
        promoEndDate: null as any,
        promoMaxBookings: null as any,
        promoLabel: null as any,
      } : {}),
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
      // Small delay to let dialog animation complete before reloading
      setTimeout(() => loadServices(), 150);
    } catch (error) {
      handleApiError(error);
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
    const variations = Array.isArray(service.variations) ? service.variations : [];
    setFormData({
      name: service.name,
      description: service.description || '',
      includes: service.includes || '',
      price: service.price.toString(),
      duration: service.duration.toString(),
      capacity: (service.capacity || 1).toString(),
      mode: service.mode || 'presencial',
      image: service.image || '',
      images: Array.isArray(service.images) ? service.images : [],
      imageDisplayMode: parseImageDisplayMode(service.imageDisplayMode),
      variations: variations,
      specialtyId: service.specialtyId || '',
      assignmentMode: service.assignmentMode || 'client_chooses',
      visibleOnPublicPage: service.visibleOnPublicPage ?? true,
      intakeFormId: service.intakeFormId || '',
      // Check-in/out times
      checkInTime: (service as any).checkInTime || '',
      checkOutTime: (service as any).checkOutTime || '',
      // Rich content
      youtubeVideoUrl: (service as any).youtubeVideoUrl || '',
      serviceAmenities: Array.isArray((service as any).amenities) ? (service as any).amenities : [],
      // Pack fields — when editing a pack, price=packTotal so we need to recover pricePerNight
      isPack: (service as any).isPack || false,
      packCheckIn: (service as any).packCheckIn ? (service as any).packCheckIn.split('T')[0] : '',
      packCheckOut: (service as any).packCheckOut ? (service as any).packCheckOut.split('T')[0] : '',
      packNights: (service as any).packNights?.toString() || '',
      packOriginalPrice: (service as any).packOriginalPrice?.toString() || '',
      packTotalPrice: (service as any).isPack ? service.price?.toString() || '' : '',
      // If editing a pack, restore price to per-night (packOriginalPrice / packNights)
      ...((service as any).isPack && (service as any).packOriginalPrice && (service as any).packNights
        ? { price: (Number((service as any).packOriginalPrice) / Number((service as any).packNights)).toString() }
        : {}),
      // Promo fields
      promoActive: !!(service as any).promoPrice,
      promoPrice: (service as any).promoPrice?.toString() || '',
      promoStartDate: (service as any).promoStartDate ? (service as any).promoStartDate.split('T')[0] : '',
      promoEndDate: (service as any).promoEndDate ? (service as any).promoEndDate.split('T')[0] : '',
      promoMaxBookings: (service as any).promoMaxBookings?.toString() || '',
      promoLabel: (service as any).promoLabel || '',
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
      handleApiError(error);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingService(null);
    setFormData({ name: '', description: '', includes: '', price: '', duration: '30', capacity: '1', mode: 'presencial', image: '', images: [], imageDisplayMode: {}, variations: [], specialtyId: '', assignmentMode: 'client_chooses', visibleOnPublicPage: true, intakeFormId: '', checkInTime: '', checkOutTime: '', youtubeVideoUrl: '', serviceAmenities: [], isPack: false, packCheckIn: '', packCheckOut: '', packNights: '', packOriginalPrice: '', packTotalPrice: '', promoActive: false, promoPrice: '', promoStartDate: '', promoEndDate: '', promoMaxBookings: '', promoLabel: '' });
  };

  const openNewForm = () => {
    handleFormClose();
    setTimeout(() => setFormOpen(true), 50);
  };

  const handleDuplicate = (service: any) => {
    handleFormClose();
    let parsedImages: string[] = [];
    try { parsedImages = service.images ? (typeof service.images === 'string' ? JSON.parse(service.images) : service.images) : []; } catch { parsedImages = []; }
    let parsedVariations: VariationGroup[] = [];
    try { parsedVariations = service.variations ? (typeof service.variations === 'string' ? JSON.parse(service.variations) : service.variations) : []; } catch { parsedVariations = []; }
    let parsedImageDisplayMode: Record<string, string> = {};
    try { parsedImageDisplayMode = service.imageDisplayMode ? (typeof service.imageDisplayMode === 'string' ? JSON.parse(service.imageDisplayMode) : service.imageDisplayMode) : {}; } catch { parsedImageDisplayMode = {}; }
    setTimeout(() => {
      setEditingService(null); // nuevo, no edición
      setFormData({
        name: bookingMode === 'DAILY' ? `Pack ${service.name}` : `${service.name} (Copia)`,
        description: service.description || '',
        includes: service.includes || '',
        price: service.price?.toString() || '',
        duration: service.duration?.toString() || '30',
        capacity: service.capacity?.toString() || '1',
        mode: service.mode || 'presencial',
        image: service.image || '',
        images: parsedImages,
        imageDisplayMode: parsedImageDisplayMode,
        variations: parsedVariations,
        specialtyId: service.specialtyId || '',
        assignmentMode: service.assignmentMode || 'client_chooses',
        visibleOnPublicPage: service.visibleOnPublicPage ?? true,
        intakeFormId: service.intakeFormId || '',
        checkInTime: service.checkInTime || '',
        checkOutTime: service.checkOutTime || '',
        youtubeVideoUrl: service.youtubeVideoUrl || '',
        serviceAmenities: Array.isArray(service.amenities) ? service.amenities : [],
        isPack: bookingMode === 'DAILY' ? true : (service.isPack || false),
        packCheckIn: '',
        packCheckOut: '',
        packNights: '',
        packOriginalPrice: '',
        packTotalPrice: '',
        promoActive: false,
        promoPrice: '',
        promoStartDate: '',
        promoEndDate: '',
        promoMaxBookings: '',
        promoLabel: '',
      });
      setFormOpen(true);
      toast({
        title: bookingMode === 'DAILY' ? 'Pack creado desde servicio' : 'Servicio duplicado',
        description: bookingMode === 'DAILY'
          ? 'Elegí las fechas y el precio del pack. El descuento se calcula solo.'
          : 'Modificá el nombre y los datos que necesites.',
      });
    }, 50);
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
      handleApiError(error);
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
      handleApiError(error);
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
                  <Image src={url} alt={`Galería ${index + 1}`} fill sizes="(max-width: 768px) 33vw, 200px" className="object-cover" />
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
            placeholder={ph.name}
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
            placeholder={ph.desc}
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
            placeholder={ph.includes}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          />
          <p className="text-xs text-muted-foreground">Separa cada item con una coma o escribe en líneas separadas</p>
        </div>

        {/* Rich content per service (YouTube + Amenidades) — solo si está habilitado */}
        {enableServiceContent && (() => {
          const catalog = getAmenitiesCatalog(rubro);
          return (
            <div className="space-y-3 p-3 rounded-lg border border-violet-200 dark:border-violet-800/50 bg-violet-50/30 dark:bg-violet-950/10">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-violet-500" />
                <Label className="text-sm font-medium text-violet-700 dark:text-violet-400">Contenido adicional</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="svcYoutube" className="text-xs">Video de YouTube</Label>
                <Input
                  id="svcYoutube"
                  type="url"
                  value={formData.youtubeVideoUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeVideoUrl: e.target.value })}
                  onFocus={handleInputFocus}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="h-10"
                />
              </div>
              {catalog.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs">{getRubroUIConfig(rubro).amenitiesLabel || 'Comodidades'}</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {catalog.map(amenity => {
                      const isSelected = formData.serviceAmenities.includes(amenity.id);
                      return (
                        <button
                          key={amenity.id}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              serviceAmenities: isSelected
                                ? prev.serviceAmenities.filter(id => id !== amenity.id)
                                : [...prev.serviceAmenities, amenity.id],
                            }));
                          }}
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md border text-xs transition-all ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                              : 'border-border bg-background text-muted-foreground hover:bg-muted/50'
                          }`}
                        >
                          <span>{isSelected ? '✓' : '○'}</span>
                          <span className="truncate">{amenity.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        <div className={`grid grid-cols-1 ${isDaily ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-3`}>
          <div className="space-y-2">
            <Label htmlFor="price">{formData.isPack ? 'Precio por noche (referencia)' : isDaily ? 'Precio por noche ($)' : 'Precio ($)'}</Label>
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
              readOnly={formData.isPack}
              className={`h-11 ${formData.isPack ? 'bg-muted/50 opacity-70' : ''}`}
            />
          </div>
          {/* Duración: no aplica en modo DAILY (noches, no horas) */}
          {!isDaily && (
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
          )}
          <div className="space-y-2">
            <Label htmlFor="capacity">{capacityLabel}</Label>
            <div className="relative">
              <Input
                id="capacity"
                type="number"
                inputMode="numeric"
                min="1"
                max="100"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                onFocus={handleInputFocus}
                placeholder="1"
                className="h-11 pr-20"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none flex items-center gap-1">
                <Users className="h-3 w-3" />
                {capacitySuffix}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">{capacityHint}</p>
          </div>
        </div>

        {/* Horarios de ingreso/egreso (solo modo DAILY) */}
        {bookingMode === 'DAILY' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="checkInTime" className="text-xs">Horario de ingreso</Label>
              <Input
                id="checkInTime"
                type="time"
                value={formData.checkInTime}
                onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                onFocus={handleInputFocus}
                placeholder="14:00"
                className="h-11"
              />
              <p className="text-[10px] text-muted-foreground">Vacío = usa el global de Horarios</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="checkOutTime" className="text-xs">Horario de egreso</Label>
              <Input
                id="checkOutTime"
                type="time"
                value={formData.checkOutTime}
                onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                onFocus={handleInputFocus}
                placeholder="10:00"
                className="h-11"
              />
              <p className="text-[10px] text-muted-foreground">Vacío = usa el global de Horarios</p>
            </div>
          </div>
        )}

        {/* Modalidad del servicio — solo si hay más de 1 opción */}
        {supportsOnlineMode && (
        <div className="space-y-2">
          <Label>Modalidad</Label>
          <div className="grid gap-2 grid-cols-3">
            {[
              { value: 'presencial', label: 'Presencial', icon: MapPin },
              { value: 'online', label: 'Online', icon: Video },
              { value: 'ambos', label: 'Ambos', icon: RefreshCw },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData({ ...formData, mode: value })}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  formData.mode === value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-400'
                    : 'border-border hover:bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground leading-tight">
            {formData.mode === 'online'
              ? 'Se generara un link de videollamada automaticamente al reservar'
              : formData.mode === 'ambos'
              ? 'El cliente podra elegir entre presencial u online al reservar'
              : 'El cliente asiste al local para este servicio'}
          </p>
        </div>
        )}

        {/* Especialidad */}
        {specialties.length > 0 && (
          <div className="space-y-1.5">
            <Label htmlFor="specialtyId">Especialidad</Label>
            <select
              id="specialtyId"
              value={formData.specialtyId}
              onChange={(e) => setFormData({ ...formData, specialtyId: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Sin especialidad</option>
              {specialties.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <p className="text-[10px] text-muted-foreground">
              Agrupa este servicio bajo un area de practica
            </p>
          </div>
        )}

        {/* Modo de asignacion */}
        {supportsProfessionalAssignment && (
        <div className="space-y-2">
          <Label>Asignacion de profesional</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { value: 'client_chooses', label: 'Cliente elige', desc: 'El cliente elige quien lo atiende' },
              { value: 'auto_assign', label: 'Auto-asignar', desc: 'Se asigna automaticamente segun disponibilidad' },
              { value: 'round_robin', label: 'Rotativo', desc: 'Se reparten equitativamente entre profesionales' },
            ].map(({ value, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData({ ...formData, assignmentMode: value })}
                className={`flex flex-col items-start px-3 py-2.5 rounded-lg border text-sm transition-all ${
                  formData.assignmentMode === value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-400'
                    : 'border-border hover:bg-muted text-muted-foreground'
                }`}
              >
                <span className="font-medium">{label}</span>
                <span className="text-[10px] mt-0.5 opacity-70">{desc}</span>
              </button>
            ))}
          </div>
        </div>
        )}

        {/* Formulario de admisión */}
        {intakeForms.length > 0 && (
          <div className="space-y-1.5">
            <Label htmlFor="intakeFormId">Formulario de admisión</Label>
            <select
              id="intakeFormId"
              value={formData.intakeFormId}
              onChange={(e) => setFormData({ ...formData, intakeFormId: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Sin formulario</option>
              {intakeForms.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            <p className="text-[10px] text-muted-foreground">
              El cliente completará este formulario al reservar este servicio
            </p>
          </div>
        )}

        {/* Pack de días (solo en modo DAILY) */}
        {bookingMode === 'DAILY' && (
          <div className={`space-y-3 p-3 rounded-lg border transition-colors ${formData.isPack ? 'border-amber-300 dark:border-amber-700/60 bg-amber-50/60 dark:bg-amber-950/20' : 'border-border bg-muted/30'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">{formData.isPack ? '📦' : '📅'}</span>
                <Label className="text-sm font-medium">{formData.isPack ? 'Pack activo' : '¿Crear pack de fechas fijas?'}</Label>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isPack: !prev.isPack, ...(!prev.isPack ? {} : { packCheckIn: '', packCheckOut: '', packNights: '', packOriginalPrice: '', packTotalPrice: '' }) }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isPack ? 'bg-amber-500 dark:bg-amber-600' : 'bg-gray-300 dark:bg-neutral-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isPack ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            {formData.isPack && (
              <div className="space-y-3">
                {/* Fechas */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="packCheckIn" className="text-xs">Check-in</Label>
                    <Input
                      id="packCheckIn"
                      type="date"
                      value={formData.packCheckIn}
                      onChange={(e) => {
                        const newCheckIn = e.target.value;
                        setFormData(prev => {
                          const updated = { ...prev, packCheckIn: newCheckIn };
                          if (newCheckIn && prev.packCheckOut) {
                            const nights = Math.round((new Date(prev.packCheckOut).getTime() - new Date(newCheckIn).getTime()) / (24 * 3600000));
                            if (nights > 0) updated.packNights = nights.toString();
                          }
                          return updated;
                        });
                      }}
                      onFocus={handleInputFocus}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="packCheckOut" className="text-xs">Check-out</Label>
                    <Input
                      id="packCheckOut"
                      type="date"
                      value={formData.packCheckOut}
                      onChange={(e) => {
                        const newCheckOut = e.target.value;
                        setFormData(prev => {
                          const updated = { ...prev, packCheckOut: newCheckOut };
                          if (prev.packCheckIn && newCheckOut) {
                            const nights = Math.round((new Date(newCheckOut).getTime() - new Date(prev.packCheckIn).getTime()) / (24 * 3600000));
                            if (nights > 0) updated.packNights = nights.toString();
                          }
                          return updated;
                        });
                      }}
                      onFocus={handleInputFocus}
                    />
                  </div>
                </div>

                {/* Auto-cálculo: noches × precio por noche */}
                {formData.packNights && formData.price && (
                  <div className="rounded-lg bg-slate-100 dark:bg-neutral-800 p-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{formData.packNights} noches × {formatPrice(parseFloat(formData.price))}</span>
                      <span className="font-medium text-slate-700 dark:text-neutral-300">{formatPrice(parseInt(formData.packNights) * parseFloat(formData.price))}</span>
                    </div>
                  </div>
                )}

                {/* Precio del pack */}
                <div className="space-y-1">
                  <Label htmlFor="packTotalPrice" className="text-xs font-semibold">Precio del pack ($)</Label>
                  <Input
                    id="packTotalPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.packTotalPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, packTotalPrice: e.target.value }))}
                    onFocus={handleInputFocus}
                    placeholder={formData.packNights && formData.price
                      ? `Ej: ${formatPrice(parseInt(formData.packNights) * parseFloat(formData.price) * 0.8)} (20% OFF)`
                      : 'Lo que paga tu cliente'}
                  />
                </div>

                {/* Preview con descuento auto-calculado */}
                {formData.packTotalPrice && formData.packNights && formData.price && (() => {
                  const totalSinDto = parseInt(formData.packNights) * parseFloat(formData.price);
                  const packPrice = parseFloat(formData.packTotalPrice);
                  const discount = totalSinDto > 0 ? Math.round((1 - packPrice / totalSinDto) * 100) : 0;
                  return (
                    <div className="rounded-md border border-dashed border-amber-300 dark:border-amber-700 p-2.5 bg-white dark:bg-neutral-900/50">
                      <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wider">Asi lo ve tu cliente</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">Pack {formData.packNights} noches</span>
                        {discount > 0 && (
                          <span className="text-sm line-through text-slate-400 dark:text-neutral-500">{formatPrice(totalSinDto)}</span>
                        )}
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(packPrice)}</span>
                      </div>
                      {discount > 0 && (
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                          {discount}% OFF — Tu cliente ahorra {formatPrice(totalSinDto - packPrice)}
                        </p>
                      )}
                      {packPrice >= totalSinDto && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          Sin descuento — el precio es igual o mayor a {formData.packNights} noches sueltas
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Oferta / Promoción */}
        <div className={`space-y-3 p-3 rounded-lg border transition-colors ${formData.promoActive ? 'border-amber-300 dark:border-amber-700/60 bg-amber-50/60 dark:bg-amber-950/20' : 'border-border bg-muted/30'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">{formData.promoActive ? '🔥' : '🏷️'}</span>
              <Label className="text-sm font-medium">{formData.promoActive ? 'Oferta activa' : 'Activar oferta'}</Label>
            </div>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, promoActive: !prev.promoActive, promoPrice: !prev.promoActive ? prev.price || '' : '', ...(prev.promoActive ? { promoStartDate: '', promoEndDate: '', promoMaxBookings: '', promoLabel: '' } : {}) }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.promoActive ? 'bg-amber-500 dark:bg-amber-600' : 'bg-gray-300 dark:bg-neutral-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.promoActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          {formData.promoActive && (
            <div className="space-y-3">
              {/* Precio + descuento calculado */}
              <div className="space-y-1">
                <Label htmlFor="promoPrice" className="text-xs">Precio con descuento ($)</Label>
                <Input
                  id="promoPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.promoPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, promoPrice: e.target.value }))}
                  onFocus={handleInputFocus}
                  placeholder="Ej: 5000"
                />
                {formData.price && formData.promoPrice && parseFloat(formData.promoPrice) < parseFloat(formData.price) && (
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {Math.round((1 - parseFloat(formData.promoPrice) / parseFloat(formData.price)) * 100)}% OFF — Tu cliente ahorra {formatPrice(parseFloat(formData.price) - parseFloat(formData.promoPrice))}
                  </p>
                )}
                {formData.price && formData.promoPrice && parseFloat(formData.promoPrice) >= parseFloat(formData.price) && (
                  <p className="text-xs text-red-500 dark:text-red-400">
                    El precio promocional debe ser menor al original ({formatPrice(parseFloat(formData.price))})
                  </p>
                )}
              </div>

              {/* Etiqueta con presets */}
              <div className="space-y-1.5">
                <Label htmlFor="promoLabel" className="text-xs">Etiqueta promocional</Label>
                <div className="flex flex-wrap gap-1.5">
                  {['Oferta', 'Promo', 'Hot Sale', '2x1', 'Última chance', 'Solo hoy', 'Lanzamiento'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, promoLabel: prev.promoLabel === tag ? '' : tag }))}
                      className={`text-[11px] px-2 py-0.5 rounded-full border transition-all ${
                        formData.promoLabel === tag
                          ? 'bg-amber-500 text-white border-amber-500 dark:bg-amber-600 dark:border-amber-600'
                          : 'border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <Input
                  id="promoLabel"
                  type="text"
                  maxLength={30}
                  value={formData.promoLabel}
                  onChange={(e) => setFormData(prev => ({ ...prev, promoLabel: e.target.value }))}
                  onFocus={handleInputFocus}
                  placeholder="O escribí tu propia etiqueta..."
                  className="text-sm"
                />
              </div>

              {/* Fechas + límite */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="promoStartDate" className="text-xs">Válida desde</Label>
                  <Input
                    id="promoStartDate"
                    type="date"
                    value={formData.promoStartDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, promoStartDate: e.target.value }))}
                    onFocus={handleInputFocus}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="promoEndDate" className="text-xs">Válida hasta</Label>
                  <Input
                    id="promoEndDate"
                    type="date"
                    value={formData.promoEndDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, promoEndDate: e.target.value }))}
                    onFocus={handleInputFocus}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="promoMaxBookings" className="text-xs">Máx. reservas con esta promo (opcional)</Label>
                <Input
                  id="promoMaxBookings"
                  type="number"
                  min="1"
                  value={formData.promoMaxBookings}
                  onChange={(e) => setFormData(prev => ({ ...prev, promoMaxBookings: e.target.value }))}
                  onFocus={handleInputFocus}
                  placeholder="Sin límite"
                />
              </div>

              {/* Preview */}
              {formData.promoPrice && formData.price && parseFloat(formData.promoPrice) < parseFloat(formData.price) && (
                <div className="rounded-md border border-dashed border-amber-300 dark:border-amber-700 p-2.5 bg-white dark:bg-neutral-900/50">
                  <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wider">Así lo ve tu cliente</p>
                  <div className="flex items-center gap-2">
                    {formData.promoLabel && (
                      <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
                        {formData.promoLabel}
                      </span>
                    )}
                    <span className="text-sm line-through text-slate-400 dark:text-neutral-500">{formatPrice(parseFloat(formData.price))}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(parseFloat(formData.promoPrice))}</span>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-muted-foreground">
                Dejá las fechas vacías para que la oferta no tenga vencimiento.
              </p>
            </div>
          )}
        </div>

        {/* Variaciones de precio/duración */}
        <VariationsEditor
          value={formData.variations}
          serviceMode={formData.mode}
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
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem onClick={() => handleEdit(service)} className="gap-2">
                        <Pencil className="h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(service)} className="gap-2">
                        <Copy className="h-4 w-4 flex-shrink-0" />
                        <div>
                          <span>{bookingMode === 'DAILY' ? 'Crear pack' : 'Duplicar'}</span>
                          <span className="block text-[10px] text-muted-foreground font-normal">{bookingMode === 'DAILY' ? 'Estadía con fechas fijas y precio cerrado' : 'Crea una copia de este servicio'}</span>
                        </div>
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
                  {service.variations && service.variations.filter(g => g.id !== '__mode__').length > 0 && (
                    <div className="mb-2">
                      <Badge variant="secondary" className="text-[10px] sm:text-xs">
                        {service.variations.filter(g => g.id !== '__mode__').length} {service.variations.filter(g => g.id !== '__mode__').length === 1 ? 'variación' : 'variaciones'}
                      </Badge>
                    </div>
                  )}

                  {/* Price and Duration */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t">
                    <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg ${(service as any).isPack ? 'bg-amber-50 dark:bg-amber-900/30' : colorVariant.bg} flex-1 min-w-0`}>
                      <DollarSign className={`h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 ${(service as any).isPack ? 'text-amber-600 dark:text-amber-400' : colorVariant.text}`} />
                      <span className={`font-semibold text-sm sm:text-base truncate ${(service as any).isPack ? 'text-amber-600 dark:text-amber-400' : colorVariant.text}`}>
                        {formatPrice(service.price).replace('$ ', '')}{(service as any).isPack ? '' : bookingMode === 'DAILY' ? '/noche' : ''}
                      </span>
                    </div>
                    {(service as any).isPack ? (
                      <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex-shrink-0">
                        <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600 dark:text-amber-400" />
                        <span className="font-medium text-sm sm:text-base text-amber-600 dark:text-amber-400">
                          Pack {(service as any).packNights ? `${(service as any).packNights} noches` : ''}
                        </span>
                      </div>
                    ) : bookingMode === 'DAILY' ? (
                      <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex-shrink-0">
                        <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="font-medium text-sm sm:text-base text-indigo-600 dark:text-indigo-400">
                          Por noche
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
