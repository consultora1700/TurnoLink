'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Save,
  Clock,
  Sun,
  Moon,
  Coffee,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { createApiClient, Branch, BranchSchedule } from '@/lib/api';
import { getDayName } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ScheduleForm {
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

const defaultSchedules: ScheduleForm[] = [
  { dayOfWeek: 0, startTime: '09:00', endTime: '18:00', isActive: true },
  { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isActive: true },
  { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isActive: true },
  { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isActive: true },
  { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isActive: true },
  { dayOfWeek: 5, startTime: '09:00', endTime: '14:00', isActive: true },
  { dayOfWeek: 6, startTime: '09:00', endTime: '14:00', isActive: false },
];

export default function BranchHorariosPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const branchId = params.id as string;

  const [branch, setBranch] = useState<Branch | null>(null);
  const [schedules, setSchedules] = useState<ScheduleForm[]>(defaultSchedules);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.accessToken && branchId) {
      loadData();
    }
  }, [session, branchId]);

  const loadData = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken as string);
      const [branchData, schedulesData] = await Promise.all([
        api.getBranch(branchId),
        api.getBranchSchedules(branchId),
      ]);

      setBranch(branchData);

      // Merge fetched schedules with defaults
      if (schedulesData && Array.isArray(schedulesData) && schedulesData.length > 0) {
        const scheduleMap = new Map<number, BranchSchedule>();
        schedulesData.forEach((s: BranchSchedule) => scheduleMap.set(s.dayOfWeek, s));

        const merged = defaultSchedules.map((def) => {
          const fetched = scheduleMap.get(def.dayOfWeek);
          if (fetched) {
            return {
              dayOfWeek: fetched.dayOfWeek,
              startTime: fetched.startTime,
              endTime: fetched.endTime,
              isActive: fetched.isActive,
            };
          }
          return def;
        });
        setSchedules(merged);
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo cargar los datos', variant: 'destructive' });
      router.push('/sucursales');
    } finally {
      setLoading(false);
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
      await api.updateBranchSchedules(
        branchId,
        schedules.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          isActive: s.isActive,
        }))
      );

      toast({
        title: 'Horarios guardados',
        description: 'Los horarios de la sucursal se actualizaron correctamente',
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

  const activeDays = schedules.filter(s => s.isActive).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-teal-100 dark:border-teal-900" />
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-teal-600 dark:border-t-teal-400 animate-spin" />
        </div>
        <p className="text-muted-foreground">Cargando horarios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-4 sm:p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-24 -right-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative">
          <Link href="/sucursales" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4" />
            Volver a Sucursales
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold">Horarios de {branch?.name}</h1>
                  <p className="text-white/80 text-sm sm:text-base">
                    Configura los horarios de esta sucursal
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-white text-orange-600 hover:bg-white/90 shadow-lg w-full sm:w-auto"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="relative grid grid-cols-2 gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20">
            <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-1 sm:gap-2">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
                <p className="text-xl sm:text-2xl md:text-3xl font-bold">{activeDays}</p>
              </div>
              <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Dias Activos</p>
            </div>
            <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-1 sm:gap-2">
                <Coffee className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 hidden sm:block" />
                <p className="text-xl sm:text-2xl md:text-3xl font-bold">{7 - activeDays}</p>
              </div>
              <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">Dias Libres</p>
            </div>
          </div>
        </div>
      </div>

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
              <h3 className="font-semibold mb-1">Horarios de Sucursal</h3>
              <p className="text-sm text-muted-foreground">
                Los horarios configurados aqui aplican solo a esta sucursal. Si no configuras horarios especificos,
                se usaran los horarios generales del negocio.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
