'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Save,
  Clock,
  Sun,
  Moon,
  Coffee,
  Calendar,
  CalendarDays,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { createApiClient } from '@/lib/api';
import { getDayName } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Schedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const dayIcons: Record<number, React.ReactNode> = {
  0: <Sun className="h-4 w-4" />,
  1: <Calendar className="h-4 w-4" />,
  2: <Calendar className="h-4 w-4" />,
  3: <Calendar className="h-4 w-4" />,
  4: <Calendar className="h-4 w-4" />,
  5: <Calendar className="h-4 w-4" />,
  6: <Coffee className="h-4 w-4" />,
};

const dayColors: Record<number, { bg: string; gradient: string; text: string }> = {
  0: { bg: 'bg-amber-100 dark:bg-amber-900/40', gradient: 'from-amber-500 to-orange-500', text: 'text-amber-600 dark:text-amber-400' },
  1: { bg: 'bg-blue-100 dark:bg-blue-900/40', gradient: 'from-blue-500 to-indigo-500', text: 'text-blue-600 dark:text-blue-400' },
  2: { bg: 'bg-violet-100 dark:bg-violet-900/40', gradient: 'from-violet-500 to-purple-500', text: 'text-violet-600 dark:text-violet-400' },
  3: { bg: 'bg-emerald-100 dark:bg-emerald-900/40', gradient: 'from-emerald-500 to-teal-500', text: 'text-emerald-600 dark:text-emerald-400' },
  4: { bg: 'bg-teal-100 dark:bg-teal-900/40', gradient: 'from-teal-500 to-teal-500', text: 'text-teal-600 dark:text-teal-400' },
  5: { bg: 'bg-cyan-100 dark:bg-cyan-900/40', gradient: 'from-cyan-500 to-sky-500', text: 'text-cyan-600 dark:text-cyan-400' },
  6: { bg: 'bg-slate-100 dark:bg-neutral-800', gradient: 'from-slate-500 to-slate-600', text: 'text-slate-600 dark:text-neutral-400' },
};

const CLOSED_DAY_LABELS = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
];

export default function HorariosPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Daily settings state
  const [bookingMode, setBookingMode] = useState<'HOURLY' | 'DAILY'>('HOURLY');
  const [dailyCheckInTime, setDailyCheckInTime] = useState('14:00');
  const [dailyCheckOutTime, setDailyCheckOutTime] = useState('10:00');
  const [dailyMinNights, setDailyMinNights] = useState(1);
  const [dailyMaxNights, setDailyMaxNights] = useState(30);
  const [dailyClosedDays, setDailyClosedDays] = useState<number[]>([]);
  const [savingDaily, setSavingDaily] = useState(false);

  useEffect(() => {
    if (session?.accessToken) {
      loadSchedules();
      loadDailySettings();
    }
  }, [session]);

  const loadSchedules = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const data = await api.getSchedules();
      setSchedules((data || []) as Schedule[]);
    } catch {
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDailySettings = async () => {
    if (!session?.accessToken) return;
    try {
      const api = createApiClient(session.accessToken as string);
      const tenant = await api.getTenant();
      const settings = typeof tenant.settings === 'string'
        ? JSON.parse(tenant.settings)
        : tenant.settings;
      if (settings.bookingMode) setBookingMode(settings.bookingMode);
      if (settings.dailyCheckInTime) setDailyCheckInTime(settings.dailyCheckInTime);
      if (settings.dailyCheckOutTime) setDailyCheckOutTime(settings.dailyCheckOutTime);
      if (settings.dailyMinNights != null) setDailyMinNights(Number(settings.dailyMinNights));
      if (settings.dailyMaxNights != null) setDailyMaxNights(Number(settings.dailyMaxNights));
      if (Array.isArray(settings.dailyClosedDays)) setDailyClosedDays(settings.dailyClosedDays);
    } catch {
      // Use defaults
    }
  };

  const handleChange = (
    dayOfWeek: number,
    field: 'startTime' | 'endTime' | 'isActive',
    value: string | boolean
  ) => {
    setSchedules((prev) =>
      prev.map((s) =>
        s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s
      )
    );
  };

  const handleSave = async () => {
    if (!session?.accessToken) return;
    setSaving(true);

    try {
      const api = createApiClient(session.accessToken as string);
      await api.updateSchedules(
        schedules.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          isActive: s.isActive,
        }))
      );

      toast({
        title: 'Horarios guardados',
        description: 'Los horarios se actualizaron correctamente',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los horarios',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDaily = async () => {
    if (!session?.accessToken) return;
    setSavingDaily(true);

    try {
      const api = createApiClient(session.accessToken as string);
      await api.updateTenant({
        settings: JSON.stringify({
          bookingMode,
          dailyCheckInTime,
          dailyCheckOutTime,
          dailyMinNights,
          dailyMaxNights,
          dailyClosedDays,
        }),
      });

      toast({
        title: 'Configuración guardada',
        description: 'La configuración de reservas por día se actualizó correctamente',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración',
        variant: 'destructive',
      });
    } finally {
      setSavingDaily(false);
    }
  };

  const toggleClosedDay = (day: number) => {
    setDailyClosedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const is24h = schedules.length > 0 &&
    schedules.every(s => s.isActive && s.startTime === '00:00' && s.endTime === '23:59');

  const handle24hToggle = (enabled: boolean) => {
    if (enabled) {
      setSchedules(prev => prev.map(s => ({
        ...s,
        isActive: true,
        startTime: '00:00',
        endTime: '23:59',
      })));
    } else {
      setSchedules(prev => prev.map(s => ({
        ...s,
        startTime: '09:00',
        endTime: '18:00',
      })));
    }
  };

  // Stats
  const activeDays = schedules.filter(s => s.isActive).length;

  return (
    <div className="space-y-6" data-tour="schedules-section">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-4 sm:p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-24 -right-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold">Horarios</h1>
                <p className="text-white/80 text-sm sm:text-base">
                  Configura los horarios de atención
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="relative grid grid-cols-2 gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20">
          <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">{activeDays}</p>
            </div>
            <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Días Activos</p>
          </div>
          <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <Coffee className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">{7 - activeDays}</p>
            </div>
            <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Días Libres</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-orange-100 dark:border-orange-900" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-orange-600 dark:border-t-orange-400 animate-spin" />
          </div>
          <p className="text-muted-foreground">Cargando horarios...</p>
        </div>
      ) : (
        <Tabs defaultValue={bookingMode === 'DAILY' ? 'daily' : 'hourly'} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="hourly" className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              Por Turnos
            </TabsTrigger>
            <TabsTrigger value="daily" className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4" />
              Por Días
            </TabsTrigger>
          </TabsList>

          {/* ===== HOURLY TAB ===== */}
          <TabsContent value="hourly" className="space-y-6">
            {/* Save button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>

            {/* 24 Hours Toggle */}
            <Card className="border-0 shadow-soft overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Abierto 24 horas</p>
                      <p className="text-xs text-muted-foreground">
                        Todos los días, las 24 horas
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={is24h}
                    onCheckedChange={handle24hToggle}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-indigo-500 data-[state=checked]:to-violet-500"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-soft overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-orange-50/50 dark:from-neutral-800 dark:to-orange-900/20">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  Horarios Semanales
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 space-y-3">
                {schedules
                  .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                  .map((schedule) => {
                    const colors = dayColors[schedule.dayOfWeek];
                    return (
                      <div
                        key={schedule.dayOfWeek}
                        className={`
                          p-3 sm:p-4 rounded-xl border-2 transition-all
                          ${schedule.isActive
                            ? `${colors.bg} border-transparent`
                            : 'bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700'}
                        `}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                          <div className="flex items-center justify-between sm:justify-start sm:w-44 sm:flex-shrink-0">
                            <div className="flex items-center gap-3">
                              <div className={`
                                h-10 w-10 rounded-lg flex items-center justify-center transition-all flex-shrink-0
                                ${schedule.isActive
                                  ? `bg-gradient-to-br ${colors.gradient} text-white shadow-lg`
                                  : 'bg-slate-200 dark:bg-neutral-700 text-slate-400 dark:text-neutral-500'}
                              `}>
                                {dayIcons[schedule.dayOfWeek]}
                              </div>
                              <div>
                                <p className={`font-semibold ${schedule.isActive ? '' : 'text-muted-foreground'}`}>
                                  {getDayName(schedule.dayOfWeek)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {schedule.isActive ? 'Abierto' : 'Cerrado'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:hidden">
                              {schedule.isActive ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                              ) : (
                                <XCircle className="h-5 w-5 text-slate-400 dark:text-neutral-500" />
                              )}
                              <Switch
                                checked={schedule.isActive}
                                onCheckedChange={(checked) =>
                                  handleChange(schedule.dayOfWeek, 'isActive', checked)
                                }
                                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-teal-500"
                              />
                            </div>
                          </div>
                          <div className={`flex items-center gap-2 sm:gap-3 flex-1 ${!schedule.isActive ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div className="flex items-center gap-2 flex-1 sm:flex-none">
                              <Sun className="h-4 w-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                              <Input
                                type="time"
                                value={schedule.startTime}
                                onChange={(e) =>
                                  handleChange(schedule.dayOfWeek, 'startTime', e.target.value)
                                }
                                disabled={!schedule.isActive}
                                className="h-10 w-full sm:w-28 md:w-32"
                              />
                            </div>
                            <span className="text-muted-foreground font-medium text-sm">a</span>
                            <div className="flex items-center gap-2 flex-1 sm:flex-none">
                              <Moon className="h-4 w-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                              <Input
                                type="time"
                                value={schedule.endTime}
                                onChange={(e) =>
                                  handleChange(schedule.dayOfWeek, 'endTime', e.target.value)
                                }
                                disabled={!schedule.isActive}
                                className="h-10 w-full sm:w-28 md:w-32"
                              />
                            </div>
                          </div>
                          <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                            {schedule.isActive ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                            ) : (
                              <XCircle className="h-5 w-5 text-slate-400 dark:text-neutral-500" />
                            )}
                            <Switch
                              checked={schedule.isActive}
                              onCheckedChange={(checked) =>
                                handleChange(schedule.dayOfWeek, 'isActive', checked)
                              }
                              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-teal-500"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="border-0 shadow-soft bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white flex-shrink-0">
                    <Sun className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Consejo</h3>
                    <p className="text-sm text-muted-foreground">
                      Recuerda que los clientes solo podrán reservar turnos dentro de los horarios que configures aquí.
                      Asegúrate de mantener tus horarios actualizados para evitar confusiones.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== DAILY TAB ===== */}
          <TabsContent value="daily" className="space-y-6">
            {/* Activate daily mode */}
            <Card className="border-0 shadow-soft overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Activar reservas por día</p>
                      <p className="text-xs text-muted-foreground">
                        Ideal para quintas, cabañas y alojamientos temporarios
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={bookingMode === 'DAILY'}
                    onCheckedChange={(checked) => setBookingMode(checked ? 'DAILY' : 'HOURLY')}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-teal-500 data-[state=checked]:to-cyan-500"
                  />
                </div>
              </CardContent>
            </Card>

            {bookingMode === 'DAILY' && (
              <Card className="border-0 shadow-soft overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-teal-50/50 dark:from-neutral-800 dark:to-teal-900/20">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-teal-500" />
                    Configuración de Estadías
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-6">
                  {/* Check-in / Check-out times */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="checkin-time">Hora de check-in</Label>
                      <Input
                        id="checkin-time"
                        type="time"
                        value={dailyCheckInTime}
                        onChange={(e) => setDailyCheckInTime(e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkout-time">Hora de check-out</Label>
                      <Input
                        id="checkout-time"
                        type="time"
                        value={dailyCheckOutTime}
                        onChange={(e) => setDailyCheckOutTime(e.target.value)}
                        className="h-10"
                      />
                    </div>
                  </div>

                  {/* Min / Max nights */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min-nights">Noches mínimas</Label>
                      <Input
                        id="min-nights"
                        type="number"
                        min={1}
                        max={30}
                        value={dailyMinNights}
                        onChange={(e) => setDailyMinNights(Math.max(1, parseInt(e.target.value) || 1))}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-nights">Noches máximas</Label>
                      <Input
                        id="max-nights"
                        type="number"
                        min={1}
                        max={365}
                        value={dailyMaxNights}
                        onChange={(e) => setDailyMaxNights(Math.max(1, parseInt(e.target.value) || 30))}
                        className="h-10"
                      />
                    </div>
                  </div>

                  {/* Closed days */}
                  <div className="space-y-3">
                    <Label>Días sin check-in</Label>
                    <p className="text-xs text-muted-foreground -mt-1">
                      Selecciona los días en los que no se permite hacer check-in
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {CLOSED_DAY_LABELS.map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => toggleClosedDay(value)}
                          className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-all border-2
                            ${dailyClosedDays.includes(value)
                              ? 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
                              : 'bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400 hover:border-slate-300 dark:hover:border-neutral-600'}
                          `}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Save button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSaveDaily}
                disabled={savingDaily}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg"
              >
                <Save className="h-4 w-4 mr-2" />
                {savingDaily ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>

            {/* Tips Card */}
            <Card className="border-0 shadow-soft bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white flex-shrink-0">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Modo por Días</h3>
                    <p className="text-sm text-muted-foreground">
                      En este modo, tus clientes reservan por rango de fechas (check-in → check-out) con precio por noche.
                      El precio de cada servicio se interpreta como precio por noche.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
