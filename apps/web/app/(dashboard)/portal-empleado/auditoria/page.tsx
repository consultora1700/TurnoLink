'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  User,
  Shield,
  Calendar,
  Eye,
  Edit,
  UserPlus,
  UserMinus,
  CalendarOff,
  LogIn,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { handleApiError } from '@/lib/notifications';

const ACTION_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  LOGIN: { label: 'Inicio de sesión', icon: LogIn, color: 'text-blue-600' },
  UPDATE_PROFILE: { label: 'Perfil actualizado', icon: Edit, color: 'text-emerald-600' },
  UPDATE_AVAILABILITY: { label: 'Horarios actualizados', icon: Clock, color: 'text-amber-600' },
  BLOCK_DATE: { label: 'Fecha bloqueada', icon: CalendarOff, color: 'text-red-600' },
  UNBLOCK_DATE: { label: 'Fecha desbloqueada', icon: Calendar, color: 'text-green-600' },
  VIEW_CLIENT: { label: 'Cliente consultado', icon: Eye, color: 'text-gray-600' },
  INVITE_EMPLOYEE: { label: 'Invitación enviada', icon: UserPlus, color: 'text-blue-600' },
  CHANGE_ROLE: { label: 'Rol cambiado', icon: Shield, color: 'text-purple-600' },
  REVOKE_ACCESS: { label: 'Acceso revocado', icon: UserMinus, color: 'text-red-600' },
};

export default function AuditoriaPage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<any[]>([]);
  const [meta, setMeta] = useState<{ total: number; page: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchLogs = useCallback(async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const api = createApiClient(session.accessToken);
      const params: Record<string, string | number> = { page, limit: 30 };
      if (actionFilter) params.action = actionFilter;
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;

      const result = await api.employeePortal.getAuditLog(params as any);
      setLogs(result.data);
      setMeta(result.meta);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, page, actionFilter, dateFrom, dateTo]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const exportCsv = () => {
    if (logs.length === 0) return;
    const headers = ['Fecha', 'Acción', 'Empleado', 'Usuario', 'Entidad', 'IP'];
    const rows = logs.map((log) => [
      new Date(log.createdAt).toLocaleString('es-AR'),
      ACTION_CONFIG[log.action]?.label || log.action,
      log.employee?.name || '-',
      log.user?.email || '-',
      `${log.entity}${log.entityId ? ` (${log.entityId.substring(0, 8)})` : ''}`,
      log.ipAddress || '-',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c: string) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Auditoría</h1>
          <p className="text-muted-foreground text-sm mt-1">Registro de actividades del equipo</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={logs.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              className="h-8 text-xs border rounded-md px-2 bg-background sm:w-48"
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            >
              <option value="">Todas las acciones</option>
              {Object.entries(ACTION_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="h-8 text-xs sm:w-36"
              placeholder="Desde"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="h-8 text-xs sm:w-36"
              placeholder="Hasta"
            />
            {(actionFilter || dateFrom || dateTo) && (
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => {
                setActionFilter('');
                setDateFrom('');
                setDateTo('');
                setPage(1);
              }}>
                Limpiar filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Log Entries */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <h3 className="font-semibold text-lg mb-1">Sin registros</h3>
            <p className="text-muted-foreground text-sm">No hay actividad registrada para este período</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const actionCfg = ACTION_CONFIG[log.action] || { label: log.action, icon: FileText, color: 'text-gray-600' };
            const IconComp = actionCfg.icon;

            return (
              <Card key={log.id}>
                <CardContent className="p-3 flex items-start gap-3">
                  <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted', actionCfg.color)}>
                    <IconComp className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{actionCfg.label}</span>
                      {log.employee && (
                        <Badge variant="secondary" className="text-[10px] h-5">
                          {log.employee.name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(log.createdAt).toLocaleString('es-AR', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                      {log.user?.email && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" /> {log.user.email}
                        </span>
                      )}
                    </div>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1 bg-muted/50 rounded px-2 py-1 font-mono">
                        {JSON.stringify(log.metadata)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {meta.page} de {meta.totalPages} · {meta.total} registros
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
