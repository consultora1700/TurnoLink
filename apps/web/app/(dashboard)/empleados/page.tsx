'use client';

import { useEffect, useState, useCallback } from 'react';
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
  Award,
  Eye,
  Clock,
  CalendarOff,
  X,
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
import { createApiClient, Employee, EmployeeSchedule, EmployeeBlockedDate } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ui/image-upload';
import { useTenantConfig, useRubroTerms } from '@/contexts/tenant-config-context';
import { bookingGender } from '@/lib/tenant-config';
import { handleApiError } from '@/lib/notifications';
import { isGastronomiaRubro } from '@/lib/rubro-attributes';

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
  credentials: string;
  seniority: string;
  isPubliclyVisible: boolean;
  isActive: boolean;
  isDelivery: boolean;
  deliveryVehicle: string;
  deliveryZone: string;
}

const emptyForm: EmployeeForm = {
  name: '',
  email: '',
  phone: '',
  image: '',
  specialty: '',
  bio: '',
  credentials: '',
  seniority: '',
  isPubliclyVisible: true,
  isActive: true,
  isDelivery: false,
  deliveryVehicle: '',
  deliveryZone: '',
};

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

interface ScheduleDay {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const DEFAULT_SCHEDULE: ScheduleDay[] = Array.from({ length: 7 }, (_, i) => ({
  dayOfWeek: i,
  startTime: '09:00',
  endTime: i < 5 ? '18:00' : '14:00',
  isActive: i < 6,
}));

export default function EmpleadosPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const { clientLabelPlural, rubro } = useTenantConfig();
  const terms = useRubroTerms();
  const gender = bookingGender(terms);
  const isGastro = isGastronomiaRubro(rubro);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'staff' | 'delivery'>('staff');

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeForm>(emptyForm);

  // Schedule dialog states
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleEmployee, setScheduleEmployee] = useState<Employee | null>(null);
  const [inheritSchedule, setInheritSchedule] = useState(true);
  const [scheduleDays, setScheduleDays] = useState<ScheduleDay[]>(DEFAULT_SCHEDULE);
  const [blockedDates, setBlockedDates] = useState<EmployeeBlockedDate[]>([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

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
    } catch (error) {
      setEmployees([]);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingEmployee(null);
    setFormData({ ...emptyForm, isDelivery: activeTab === 'delivery' });
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
      credentials: employee.credentials || '',
      seniority: employee.seniority || '',
      isPubliclyVisible: employee.isPubliclyVisible ?? true,
      isActive: employee.isActive,
      isDelivery: employee.isDelivery ?? false,
      deliveryVehicle: employee.deliveryVehicle || '',
      deliveryZone: employee.deliveryZone || '',
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!session?.accessToken || !formData.name.trim()) return;

    // Phone is mandatory for delivery staff (needed to send WhatsApp)
    if (formData.isDelivery && !formData.phone.trim()) {
      toast({
        title: 'Teléfono obligatorio',
        description: 'Los repartidores necesitan un teléfono para recibir pedidos por WhatsApp',
        variant: 'destructive',
      });
      return;
    }

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
        credentials: formData.credentials.trim() || undefined,
        seniority: formData.seniority || undefined,
        isPubliclyVisible: formData.isPubliclyVisible,
        isActive: formData.isActive,
        isDelivery: formData.isDelivery,
        deliveryVehicle: formData.isDelivery ? (formData.deliveryVehicle || undefined) : undefined,
        deliveryZone: formData.isDelivery ? (formData.deliveryZone.trim() || undefined) : undefined,
      };

      if (editingEmployee) {
        await api.updateEmployee(editingEmployee.id, data);
        toast({ title: `${terms.employeeSingular} actualizado`, description: 'Los cambios se guardaron correctamente' });
      } else {
        await api.createEmployee(data);
        toast({ title: `${terms.employeeSingular} creado`, description: `${terms.employeeSingular} fue agregado correctamente` });
      }

      setDialogOpen(false);
      loadEmployees();
    } catch (error) {
      handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!session?.accessToken || !employeeToDelete) return;

    try {
      const api = createApiClient(session.accessToken as string);
      await api.deleteEmployee(employeeToDelete.id);
      toast({ title: `${terms.employeeSingular} eliminado`, description: `${terms.employeeSingular} fue eliminado correctamente` });
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
      loadEmployees();
    } catch (error) {
      handleApiError(error);
    }
  };

  // ===== SCHEDULE HANDLERS =====

  const openScheduleDialog = useCallback(async (employee: Employee) => {
    if (!session?.accessToken) return;
    setScheduleEmployee(employee);
    setScheduleDialogOpen(true);
    setLoadingSchedule(true);

    try {
      const api = createApiClient(session.accessToken as string);
      const [schedules, blocked] = await Promise.all([
        api.getEmployeeSchedules(employee.id),
        api.getEmployeeBlockedDates(employee.id),
      ]);

      if (schedules.length > 0) {
        setInheritSchedule(false);
        setScheduleDays(
          DEFAULT_SCHEDULE.map((d) => {
            const found = schedules.find((s: EmployeeSchedule) => s.dayOfWeek === d.dayOfWeek);
            return found
              ? { dayOfWeek: found.dayOfWeek, startTime: found.startTime, endTime: found.endTime, isActive: found.isActive }
              : d;
          }),
        );
      } else {
        setInheritSchedule(true);
        setScheduleDays(DEFAULT_SCHEDULE);
      }
      setBlockedDates(blocked);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoadingSchedule(false);
    }
  }, [session?.accessToken, toast]);

  const handleSaveSchedule = async () => {
    if (!session?.accessToken || !scheduleEmployee) return;
    setSavingSchedule(true);

    try {
      const api = createApiClient(session.accessToken as string);

      if (inheritSchedule) {
        await api.deleteEmployeeSchedules(scheduleEmployee.id);
      } else {
        await api.updateEmployeeSchedules(scheduleEmployee.id, scheduleDays);
      }

      toast({ title: 'Horario guardado', description: inheritSchedule ? 'Hereda el horario del negocio' : 'Horario personalizado guardado' });
      setScheduleDialogOpen(false);
    } catch (error) {
      handleApiError(error);
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleAddBlockedDate = async () => {
    if (!session?.accessToken || !scheduleEmployee || !newBlockedDate) return;

    try {
      const api = createApiClient(session.accessToken as string);
      const created = await api.createEmployeeBlockedDate(scheduleEmployee.id, newBlockedDate, newBlockedReason || undefined);
      setBlockedDates([...blockedDates, created]);
      setNewBlockedDate('');
      setNewBlockedReason('');
      toast({ title: 'Día bloqueado agregado' });
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDeleteBlockedDate = async (blockedDateId: string) => {
    if (!session?.accessToken || !scheduleEmployee) return;

    try {
      const api = createApiClient(session.accessToken as string);
      await api.deleteEmployeeBlockedDate(scheduleEmployee.id, blockedDateId);
      setBlockedDates(blockedDates.filter((b) => b.id !== blockedDateId));
      toast({ title: 'Día bloqueado eliminado' });
    } catch (error) {
      handleApiError(error);
    }
  };

  const updateScheduleDay = (dayOfWeek: number, field: string, value: string | boolean) => {
    setScheduleDays((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d)),
    );
  };

  // Filter employees by active tab
  const filteredEmployees = activeTab === 'delivery'
    ? employees.filter(e => e.isDelivery)
    : employees.filter(e => !e.isDelivery);
  const staffCount = employees.filter(e => !e.isDelivery).length;
  const deliveryCount = employees.filter(e => e.isDelivery).length;
  const activeCount = filteredEmployees.filter(e => e.isActive).length;

  return (
    <div className="space-y-6" data-tour="employees-section">
      {/* Header */}
      <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-white transition-all ${
        activeTab === 'delivery'
          ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500'
          : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600'
      }`}>
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-24 -right-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                {activeTab === 'delivery' ? <span className="text-2xl">🛵</span> : <Users className="h-5 w-5 sm:h-6 sm:w-6" />}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {activeTab === 'delivery' ? 'Repartidores' : terms.employeePlural}
                </h1>
                <p className="text-white/80 text-sm sm:text-base">
                  {activeTab === 'delivery' ? 'Gestioná tu equipo de delivery' : 'Gestiona tu equipo de trabajo'}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={openCreateDialog}
            className={`bg-white shadow-lg w-full sm:w-auto hover:bg-white/90 ${
              activeTab === 'delivery' ? 'text-orange-600' : 'text-indigo-600'
            }`}
          >
            <Plus className="mr-2 h-4 w-4" />
            {activeTab === 'delivery' ? 'Agregar repartidor' : `Agregar ${terms.employeeSingular}`}
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="relative grid grid-cols-2 gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20">
          <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">{filteredEmployees.length}</p>
            </div>
            <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">
              Total {activeTab === 'delivery' ? 'repartidores' : terms.employeePlural.toLowerCase()}
            </p>
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

      {/* Tabs: Equipo / Repartidores */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-neutral-900 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'staff'
              ? 'bg-white dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900'
          }`}
        >
          <Users className="h-4 w-4" />
          {terms.employeePlural}
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
            activeTab === 'staff' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
          }`}>{staffCount}</span>
        </button>
        <button
          onClick={() => setActiveTab('delivery')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'delivery'
              ? 'bg-white dark:bg-neutral-800 text-orange-600 dark:text-orange-400 shadow-sm'
              : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900'
          }`}
        >
          🛵 Repartidores
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
            activeTab === 'delivery' ? 'bg-orange-100 text-orange-700' : 'bg-slate-200 text-slate-600'
          }`}>{deliveryCount}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-indigo-100 dark:border-indigo-900" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
          </div>
          <p className="text-muted-foreground">Cargando {terms.employeePlural.toLowerCase()}...</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <Card className="border-0 shadow-soft">
          <CardContent className="py-16 text-center">
            <div className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              activeTab === 'delivery' ? 'bg-orange-100 dark:bg-orange-900/40' : 'bg-indigo-100 dark:bg-indigo-900/40'
            }`}>
              {activeTab === 'delivery' ? <span className="text-3xl">🛵</span> : <Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />}
            </div>
            <h3 className="font-semibold text-lg mb-2">
              {activeTab === 'delivery' ? 'Aún no tenés repartidores' : `No tienes ${terms.employeePlural.toLowerCase()} aún`}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              {activeTab === 'delivery'
                ? 'Cargá a los repartidores que te ayudan con los envíos. Vas a poder asignarles pedidos y mandárselos por WhatsApp con un solo toque.'
                : `Agrega ${terms.employeePlural.toLowerCase()} para que tus ${clientLabelPlural.toLowerCase()} puedan elegir quién los atienda`}
            </p>
            <Button onClick={openCreateDialog} className={activeTab === 'delivery' ? 'bg-orange-600 hover:bg-orange-700' : ''}>
              <Plus className="mr-2 h-4 w-4" />
              {activeTab === 'delivery' ? 'Agregar primer repartidor' : `Agregar Primer ${terms.employeeSingular}`}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee, index) => {
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
                        <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                          {employee.name}
                          {employee.isDelivery && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-[10px] font-semibold uppercase tracking-wide">
                              🛵 Delivery
                            </span>
                          )}
                        </CardTitle>
                        {employee.specialty && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {employee.specialty}
                          </p>
                        )}
                        {employee.isDelivery && employee.deliveryZone && (
                          <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1 mt-0.5">
                            📍 {employee.deliveryZone}
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

                  {employee.credentials && (
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                      <Award className="h-4 w-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                      <span className="text-sm text-amber-700 dark:text-amber-300 truncate">{employee.credentials}</span>
                    </div>
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
                    {!isGastro && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9"
                        onClick={() => openScheduleDialog(employee)}
                        title="Horarios"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    )}
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
              {formData.isDelivery ? <span className="text-xl">🛵</span> : <User className="h-5 w-5" />}
              {editingEmployee
                ? formData.isDelivery ? 'Editar repartidor' : `Editar ${terms.employeeSingular}`
                : formData.isDelivery ? 'Nuevo repartidor' : `Nuevo ${terms.employeeSingular}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto flex-1 pr-1 -mr-1">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={`Nombre del ${terms.employeeSingular.toLowerCase()}`}
              />
            </div>

            {!isGastro && !formData.isDelivery && (
              <div className="space-y-1.5">
                <Label htmlFor="specialty">Especialidad</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="Ej: Colorista, Masajista..."
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="bio">Descripción</Label>
              <Input
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder={isGastro ? 'Ej: Mozo con 3 años de experiencia...' : 'Breve descripción...'}
              />
            </div>

            {!isGastro && !formData.isDelivery && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="credentials" className="flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-muted-foreground" />
                    Credenciales
                  </Label>
                  <Input
                    id="credentials"
                    value={formData.credentials}
                    onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                    placeholder="Ej: Mat. CPACF T.123 F.456, MN 12345..."
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Matricula, colegio profesional, certificaciones
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="seniority">Nivel</Label>
                  <select
                    id="seniority"
                    value={formData.seniority}
                    onChange={(e) => setFormData({ ...formData, seniority: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Sin especificar</option>
                    <option value="junior">Junior</option>
                    <option value="semi_senior">Semi Senior</option>
                    <option value="senior">Senior</option>
                    <option value="partner">Socio / Director</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="flex items-center gap-1">
                Teléfono
                {formData.isDelivery && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+54 11 5555 1234"
              />
              {formData.isDelivery && (
                <p className="text-[11px] text-orange-600 dark:text-orange-400">
                  Obligatorio: lo usamos para enviarle los pedidos por WhatsApp
                </p>
              )}
            </div>

            {/* Email nudge banner — only when editing an employee without email */}
            {editingEmployee && !editingEmployee.email && !formData.email && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                <Sparkles className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-indigo-700 dark:text-indigo-300">
                  {isGastro
                    ? 'Agrega un email para notificaciones internas'
                    : `Agrega un email para que reciba su perfil profesional y recordatorios de ${terms.bookingPlural.toLowerCase()}`}
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
                {isGastro
                  ? 'Para notificaciones internas del salón'
                  : `Le enviaremos su perfil profesional y recordatorios de ${terms.bookingPlural.toLowerCase()}`}
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

            {!formData.isDelivery && (
              <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="isPubliclyVisible" className="text-sm font-medium flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    Visible en pagina publica
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {isGastro ? 'Aparece visible para el salón' : 'Aparece en la pagina de reservas'}
                  </p>
                </div>
                <Switch
                  id="isPubliclyVisible"
                  checked={formData.isPubliclyVisible}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPubliclyVisible: checked })}
                />
              </div>
            )}

            <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-neutral-800 rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="isActive" className="text-sm font-medium">Estado activo</Label>
                <p className="text-xs text-muted-foreground">
                  {isGastro ? 'Puede atender mesas' : `Puede recibir ${terms.bookingPlural.toLowerCase()}`}
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            {/* Delivery-specific fields (only when this is a delivery person) */}
            {formData.isDelivery && (
              <div className="rounded-lg border border-orange-200 dark:border-orange-900/50 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 p-3 space-y-3">
                <div className="flex items-center gap-2 text-orange-900 dark:text-orange-200">
                  <span className="text-base">🛵</span>
                  <p className="text-xs font-bold uppercase tracking-wide">Datos del repartidor</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="deliveryVehicle" className="text-xs font-medium">Vehículo</Label>
                  <select
                    id="deliveryVehicle"
                    value={formData.deliveryVehicle}
                    onChange={(e) => setFormData({ ...formData, deliveryVehicle: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Sin especificar</option>
                    <option value="moto">🛵 Moto</option>
                    <option value="bici">🚲 Bicicleta</option>
                    <option value="auto">🚗 Auto</option>
                    <option value="a_pie">🚶 A pie</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="deliveryZone" className="text-xs font-medium">Zona de reparto</Label>
                  <Input
                    id="deliveryZone"
                    value={formData.deliveryZone}
                    onChange={(e) => setFormData({ ...formData, deliveryZone: e.target.value })}
                    placeholder="Ej: Zona Norte CABA, Microcentro..."
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-shrink-0 pt-3 mt-2 border-t gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 sm:flex-none">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.name.trim() || (formData.isDelivery && !formData.phone.trim())} className="flex-1 sm:flex-none">
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
            <AlertDialogTitle>¿Eliminar {terms.employeeSingular.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. {employeeToDelete?.name} será eliminado permanentemente.
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

      {/* Employee Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] flex flex-col p-4 sm:p-6">
          <DialogHeader className="flex-shrink-0 pb-2">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Horario de {scheduleEmployee?.name}
            </DialogTitle>
          </DialogHeader>

          {loadingSchedule ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto flex-1 pr-1 -mr-1">
              {/* Toggle inherit */}
              <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Heredar horario del negocio</Label>
                  <p className="text-xs text-muted-foreground">
                    Usa el mismo horario configurado en /horarios
                  </p>
                </div>
                <Switch
                  checked={inheritSchedule}
                  onCheckedChange={setInheritSchedule}
                />
              </div>

              {/* Custom schedule editor */}
              {!inheritSchedule && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Horario personalizado</Label>
                  {scheduleDays.map((day) => (
                    <div key={day.dayOfWeek} className="flex items-center gap-2 py-1.5">
                      <div className="w-20 flex-shrink-0">
                        <span className="text-sm font-medium">{DAY_NAMES[day.dayOfWeek]}</span>
                      </div>
                      <Switch
                        checked={day.isActive}
                        onCheckedChange={(checked) => updateScheduleDay(day.dayOfWeek, 'isActive', checked)}
                      />
                      {day.isActive && (
                        <>
                          <Input
                            type="time"
                            value={day.startTime}
                            onChange={(e) => updateScheduleDay(day.dayOfWeek, 'startTime', e.target.value)}
                            className="w-[110px] h-8 text-sm"
                          />
                          <span className="text-muted-foreground text-sm">a</span>
                          <Input
                            type="time"
                            value={day.endTime}
                            onChange={(e) => updateScheduleDay(day.dayOfWeek, 'endTime', e.target.value)}
                            className="w-[110px] h-8 text-sm"
                          />
                        </>
                      )}
                      {!day.isActive && (
                        <span className="text-sm text-muted-foreground">Cerrado</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Blocked dates section */}
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <CalendarOff className="h-3.5 w-3.5" />
                  Días bloqueados
                </Label>
                <p className="text-xs text-muted-foreground">
                  Días en que este {terms.employeeSingular.toLowerCase()} no trabaja (vacaciones, licencias, etc.)
                </p>

                {/* Add blocked date */}
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={newBlockedDate}
                    onChange={(e) => setNewBlockedDate(e.target.value)}
                    className="flex-1 h-8 text-sm"
                  />
                  <Input
                    value={newBlockedReason}
                    onChange={(e) => setNewBlockedReason(e.target.value)}
                    placeholder="Motivo (opcional)"
                    className="flex-1 h-8 text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8"
                    onClick={handleAddBlockedDate}
                    disabled={!newBlockedDate}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* List blocked dates */}
                {blockedDates.length > 0 && (
                  <div className="space-y-1">
                    {blockedDates.map((bd) => (
                      <div key={bd.id} className="flex items-center justify-between py-1.5 px-2 bg-red-50 dark:bg-red-900/20 rounded text-sm">
                        <div className="flex items-center gap-2">
                          <CalendarOff className="h-3.5 w-3.5 text-red-500" />
                          <span>{new Date(bd.date).toLocaleDateString('es-AR')}</span>
                          {bd.reason && <span className="text-muted-foreground">— {bd.reason}</span>}
                        </div>
                        <button
                          onClick={() => handleDeleteBlockedDate(bd.id)}
                          className="text-red-500 hover:text-red-700 p-0.5"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex-shrink-0 pt-3 mt-2 border-t gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)} className="flex-1 sm:flex-none">
              Cancelar
            </Button>
            <Button onClick={handleSaveSchedule} disabled={savingSchedule || loadingSchedule} className="flex-1 sm:flex-none">
              {savingSchedule && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
