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
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  0: { bg: 'bg-amber-100', gradient: 'from-amber-500 to-orange-500', text: 'text-amber-600' },
  1: { bg: 'bg-blue-100', gradient: 'from-blue-500 to-indigo-500', text: 'text-blue-600' },
  2: { bg: 'bg-violet-100', gradient: 'from-violet-500 to-purple-500', text: 'text-violet-600' },
  3: { bg: 'bg-emerald-100', gradient: 'from-emerald-500 to-teal-500', text: 'text-emerald-600' },
  4: { bg: 'bg-pink-100', gradient: 'from-pink-500 to-rose-500', text: 'text-pink-600' },
  5: { bg: 'bg-cyan-100', gradient: 'from-cyan-500 to-sky-500', text: 'text-cyan-600' },
  6: { bg: 'bg-slate-100', gradient: 'from-slate-500 to-slate-600', text: 'text-slate-600' },
};

export default function HorariosPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.accessToken) {
      loadSchedules();
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

  // Stats
  const activeDays = schedules.filter(s => s.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-8 text-white">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Horarios</h1>
                <p className="text-white/80">
                  Configura los horarios de atención
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-white text-orange-600 hover:bg-white/90 shadow-lg"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="relative grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/20">
          <div className="text-center">
            <p className="text-3xl font-bold">{activeDays}</p>
            <p className="text-white/70 text-sm">Días Activos</p>
          </div>
          <div className="text-center border-l border-white/20">
            <p className="text-3xl font-bold">{7 - activeDays}</p>
            <p className="text-white/70 text-sm">Días Libres</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-orange-100" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-orange-600 animate-spin" />
          </div>
          <p className="text-muted-foreground">Cargando horarios...</p>
        </div>
      ) : (
        <Card className="border-0 shadow-soft overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-orange-50/50">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              Horarios Semanales
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {schedules
              .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
              .map((schedule) => {
                const colors = dayColors[schedule.dayOfWeek];
                return (
                  <div
                    key={schedule.dayOfWeek}
                    className={`
                      flex items-center gap-4 p-4 rounded-xl border-2 transition-all
                      ${schedule.isActive
                        ? `${colors.bg} border-transparent`
                        : 'bg-slate-50 border-slate-200'}
                    `}
                  >
                    {/* Day Info */}
                    <div className="flex items-center gap-3 w-40">
                      <div className={`
                        h-10 w-10 rounded-lg flex items-center justify-center transition-all
                        ${schedule.isActive
                          ? `bg-gradient-to-br ${colors.gradient} text-white shadow-lg`
                          : 'bg-slate-200 text-slate-400'}
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

                    {/* Time Inputs */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4 text-amber-500" />
                        <Input
                          type="time"
                          value={schedule.startTime}
                          onChange={(e) =>
                            handleChange(schedule.dayOfWeek, 'startTime', e.target.value)
                          }
                          disabled={!schedule.isActive}
                          className={`w-32 h-10 ${!schedule.isActive ? 'opacity-50' : ''}`}
                        />
                      </div>
                      <span className="text-muted-foreground font-medium">a</span>
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4 text-indigo-500" />
                        <Input
                          type="time"
                          value={schedule.endTime}
                          onChange={(e) =>
                            handleChange(schedule.dayOfWeek, 'endTime', e.target.value)
                          }
                          disabled={!schedule.isActive}
                          className={`w-32 h-10 ${!schedule.isActive ? 'opacity-50' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Toggle */}
                    <div className="flex items-center gap-3">
                      {schedule.isActive ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-slate-400" />
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
                );
              })}
          </CardContent>
        </Card>
      )}

      {/* Tips Card */}
      <Card className="border-0 shadow-soft bg-gradient-to-r from-amber-50 to-orange-50">
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
    </div>
  );
}
