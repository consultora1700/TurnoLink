'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Loader2,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  Users,
  Key,
  Activity,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  adminApi,
  SecurityAlert,
  AuditLog,
  SecurityMetrics,
  PaginatedResponse,
} from '@/lib/admin-api';

const severityConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
  CRITICAL: { icon: ShieldAlert, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-950' },
  HIGH: { icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-950' },
  MEDIUM: { icon: AlertTriangle, color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-950' },
  LOW: { icon: Info, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-950' },
};

const auditSeverityConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  INFO: { variant: 'secondary' },
  WARNING: { variant: 'destructive' },
  CRITICAL: { variant: 'destructive' },
};

export default function SeguridadPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [alerts, setAlerts] = useState<PaginatedResponse<SecurityAlert> | null>(null);
  const [logs, setLogs] = useState<PaginatedResponse<AuditLog> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('alerts');
  const [alertPage, setAlertPage] = useState(1);
  const [logPage, setLogPage] = useState(1);

  // Resolve alert dialog
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [resolveLoading, setResolveLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [metricsData, alertsData, logsData] = await Promise.all([
        adminApi.getSecurityMetrics(),
        adminApi.getSecurityAlerts({ page: alertPage.toString(), limit: '10', resolved: 'false' }),
        adminApi.getAuditLogs({ page: logPage.toString(), limit: '50' }),
      ]);

      setMetrics(metricsData);
      setAlerts(alertsData);
      setLogs(logsData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos de seguridad');
    } finally {
      setLoading(false);
    }
  }, [alertPage, logPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDateTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('es-AR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleResolveAlert = async () => {
    if (!selectedAlert) return;

    setResolveLoading(true);

    try {
      await adminApi.resolveSecurityAlert(selectedAlert.id, resolveNotes);
      setResolveDialogOpen(false);
      setSelectedAlert(null);
      setResolveNotes('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al resolver alerta');
    } finally {
      setResolveLoading(false);
    }
  };

  const openResolveDialog = (alert: SecurityAlert) => {
    setSelectedAlert(alert);
    setResolveDialogOpen(true);
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Logins (24h)</p>
                <p className="text-2xl font-bold">{metrics?.loginsLast24h || 0}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">2FA Activo</p>
                <p className="text-2xl font-bold">{metrics?.twoFactorPercentage || 0}%</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-950 flex items-center justify-center">
                <Key className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">IPs Únicas</p>
                <p className="text-2xl font-bold">{metrics?.uniqueIPs || 0}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Intentos Fallidos</p>
                <p className="text-2xl font-bold">{metrics?.failedLoginAttempts || 0}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-950 flex items-center justify-center">
                <ShieldAlert className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Centro de Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="alerts" className="gap-2">
                Alertas
                {alerts && alerts.pagination.total > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {alerts.pagination.total}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="logs">Audit Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="alerts">
              {!alerts || alerts.data.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="font-medium text-green-600">Todo en orden</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    No hay alertas pendientes
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.data.map((alert) => {
                    const config = severityConfig[alert.severity] || severityConfig.LOW;
                    const Icon = config.icon;

                    return (
                      <div
                        key={alert.id}
                        className={`flex items-start gap-4 p-4 rounded-xl ${config.bgColor}`}
                      >
                        <Icon className={`h-6 w-6 flex-shrink-0 mt-0.5 ${config.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={alert.severity === 'CRITICAL' ? 'destructive' : 'secondary'}>
                              {alert.severity}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(alert.createdAt)}
                            </span>
                          </div>
                          <p className="font-medium mt-1">{alert.title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {alert.description}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openResolveDialog(alert)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Resolver
                        </Button>
                      </div>
                    );
                  })}

                  {alerts.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Página {alertPage} de {alerts.pagination.totalPages}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAlertPage(alertPage - 1)}
                          disabled={alertPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAlertPage(alertPage + 1)}
                          disabled={alertPage === alerts.pagination.totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="logs">
              {!logs || logs.data.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay logs registrados</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Hora</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Acción</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Entidad</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">IP</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Severidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.data.map((log) => {
                          const sevConfig = auditSeverityConfig[log.severity] || auditSeverityConfig.INFO;

                          return (
                            <tr key={log.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                              <td className="py-3 px-4 text-sm font-mono">
                                {formatDateTime(log.timestamp)}
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant={sevConfig.variant}>{log.action}</Badge>
                              </td>
                              <td className="py-3 px-4 text-sm">
                                {log.entityType}
                                {log.entityId && (
                                  <span className="text-muted-foreground ml-1 font-mono text-xs">
                                    ({log.entityId.slice(0, 8)}...)
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 font-mono text-sm text-muted-foreground">
                                {log.ipAddress || '-'}
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant={sevConfig.variant}>{log.severity}</Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {logs.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Página {logPage} de {logs.pagination.totalPages}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLogPage(logPage - 1)}
                          disabled={logPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLogPage(logPage + 1)}
                          disabled={logPage === logs.pagination.totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Resolve Alert Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolver Alerta</DialogTitle>
            <DialogDescription>
              Marca esta alerta como resuelta
            </DialogDescription>
          </DialogHeader>
          {selectedAlert && (
            <div className="py-4">
              <div className="p-4 rounded-lg bg-muted mb-4">
                <p className="font-medium">{selectedAlert.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{selectedAlert.description}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notas (opcional)</label>
                <textarea
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="Agrega notas sobre cómo se resolvió..."
                  className="w-full px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleResolveAlert} disabled={resolveLoading}>
              {resolveLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Marcar como Resuelta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
