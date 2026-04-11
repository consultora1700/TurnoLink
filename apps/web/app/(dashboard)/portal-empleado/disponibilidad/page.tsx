'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Save,
  Loader2,
  Plus,
  Trash2,
  CalendarOff,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { handleApiError } from '@/lib/notifications';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

interface ScheduleDay {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface BlockedDate {
  id: string;
  date: string;
  reason: string | null;
}

export default function DisponibilidadPage() {
  const { data: session } = useSession();
  const [schedules, setSchedules] = useState<ScheduleDay[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newBlockDate, setNewBlockDate] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const fetchData = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken);
      const [schedData, blockedData] = await Promise.all([
        api.employeePortal.getAvailability(),
        api.employeePortal.getBlockedDates(),
      ]);

      // Build full 7-day schedule
      const fullSchedule = Array.from({ length: 7 }, (_, i) => {
        const existing = schedData.find((s) => s.dayOfWeek === i);
        return existing
          ? { dayOfWeek: i, startTime: existing.startTime, endTime: existing.endTime, isActive: existing.isActive }
          : { dayOfWeek: i, startTime: '09:00', endTime: '18:00', isActive: false };
      });

      setSchedules(fullSchedule);
      setBlockedDates(blockedData);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateDay = (dayOfWeek: number, field: keyof ScheduleDay, value: string | boolean) => {
    setSchedules(prev => prev.map(s =>
      s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s
    ));
    setHasChanges(true);
  };

  const saveSchedule = async () => {
    if (!session?.accessToken) return;
    setSaving(true);
    try {
      const api = createApiClient(session.accessToken);
      await api.employeePortal.updateAvailability(schedules);
      setHasChanges(false);
    } catch (error) {
      handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  const addBlockedDate = async () => {
    if (!session?.accessToken || !newBlockDate) return;
    try {
      const api = createApiClient(session.accessToken);
      await api.employeePortal.createBlockedDate({ date: newBlockDate, reason: newBlockReason || undefined });
      setNewBlockDate('');
      setNewBlockReason('');
      fetchData();
    } catch (error) {
      handleApiError(error);
    }
  };

  const removeBlockedDate = async (id: string) => {
    if (!session?.accessToken) return;
    try {
      const api = createApiClient(session.accessToken);
      await api.employeePortal.deleteBlockedDate(id);
      setBlockedDates(prev => prev.filter(bd => bd.id !== id));
    } catch (error) {
      handleApiError(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mi Disponibilidad</h1>
          <p className="text-muted-foreground text-sm mt-1">Configura tus horarios de atención</p>
        </div>
        {hasChanges && (
          <Button onClick={saveSchedule} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar cambios
          </Button>
        )}
      </div>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horarios Semanales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {schedules.map((day) => (
              <div
                key={day.dayOfWeek}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                  day.isActive ? 'bg-background' : 'bg-muted/30'
                )}
              >
                <Switch
                  checked={day.isActive}
                  onCheckedChange={(v) => updateDay(day.dayOfWeek, 'isActive', v)}
                />
                <span className={cn(
                  'w-20 text-sm font-medium',
                  !day.isActive && 'text-muted-foreground'
                )}>
                  <span className="hidden sm:inline">{DAYS[day.dayOfWeek]}</span>
                  <span className="sm:hidden">{DAYS_SHORT[day.dayOfWeek]}</span>
                </span>
                {day.isActive ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="time"
                      value={day.startTime}
                      onChange={(e) => updateDay(day.dayOfWeek, 'startTime', e.target.value)}
                      className="w-28 h-8 text-sm"
                    />
                    <span className="text-muted-foreground text-sm">a</span>
                    <Input
                      type="time"
                      value={day.endTime}
                      onChange={(e) => updateDay(day.dayOfWeek, 'endTime', e.target.value)}
                      className="w-28 h-8 text-sm"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground italic">No disponible</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Blocked Dates */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarOff className="h-4 w-4" />
            Fechas Bloqueadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Bloquea días específicos (vacaciones, feriados personales, etc.)
          </p>

          {/* Add new blocked date */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <Input
              type="date"
              value={newBlockDate}
              onChange={(e) => setNewBlockDate(e.target.value)}
              className="h-9 text-sm sm:w-44"
              min={new Date().toISOString().split('T')[0]}
            />
            <Input
              placeholder="Motivo (opcional)"
              value={newBlockReason}
              onChange={(e) => setNewBlockReason(e.target.value)}
              className="h-9 text-sm flex-1"
            />
            <Button size="sm" onClick={addBlockedDate} disabled={!newBlockDate} className="h-9">
              <Plus className="h-4 w-4 mr-1" />
              Bloquear
            </Button>
          </div>

          {/* Blocked dates list */}
          {blockedDates.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              <CalendarOff className="h-8 w-8 mx-auto mb-2 opacity-40" />
              No hay fechas bloqueadas
            </div>
          ) : (
            <div className="space-y-2">
              {blockedDates.map((bd) => (
                <div key={bd.id} className="flex items-center justify-between p-2.5 rounded-lg border bg-red-50/50 dark:bg-red-950/20">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium">
                        {new Date(bd.date).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      {bd.reason && (
                        <span className="text-xs text-muted-foreground ml-2">— {bd.reason}</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-100"
                    onClick={() => removeBlockedDate(bd.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
