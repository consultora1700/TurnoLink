'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Calendar,
  Users,
  CalendarCheck,
  Briefcase,
  MapPin,
  Shield,
  Ban,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { adminApi, TenantDetails, AuditLog, PaginatedResponse } from '@/lib/admin-api';

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  ACTIVE: { label: 'Activo', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-950' },
  INACTIVE: { label: 'Inactivo', color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-950' },
  SUSPENDED: { label: 'Suspendido', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-950' },
};

const subStatusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  TRIALING: { label: 'Trial', variant: 'outline' },
  ACTIVE: { label: 'Activa', variant: 'default' },
  PAST_DUE: { label: 'Vencida', variant: 'destructive' },
  CANCELLED: { label: 'Cancelada', variant: 'secondary' },
  EXPIRED: { label: 'Expirada', variant: 'secondary' },
};

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<TenantDetails | null>(null);
  const [activity, setActivity] = useState<PaginatedResponse<AuditLog> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  useEffect(() => {
    loadData();
  }, [tenantId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [tenantData, activityData] = await Promise.all([
        adminApi.getTenantById(tenantId),
        adminApi.getTenantActivity(tenantId, 1, 20),
      ]);

      setTenant(tenantData);
      setActivity(activityData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar negocio');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setActionLoading(true);

    try {
      await adminApi.updateTenantStatus(tenantId, newStatus, suspendReason);
      await loadData();
      setSuspendDialogOpen(false);
      setSuspendReason('');
    } catch (err: any) {
      alert(err.message || 'Error al actualizar estado');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error || 'Negocio no encontrado'}</p>
        <Button onClick={() => router.push('/admin/negocios')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a negocios
        </Button>
      </div>
    );
  }

  const statusConf = statusConfig[tenant.status] || statusConfig.ACTIVE;
  const subConf = tenant.subscription?.status
    ? subStatusConfig[tenant.subscription.status as keyof typeof subStatusConfig]
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/negocios')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{tenant.name}</h1>
              <p className="text-muted-foreground">/{tenant.slug}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`https://turnolink.mubitt.com/${tenant.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver página pública
            </Button>
          </a>
          {tenant.status === 'ACTIVE' ? (
            <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Ban className="h-4 w-4 mr-2" />
                  Suspender
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Suspender Negocio</DialogTitle>
                  <DialogDescription>
                    Esta acción suspenderá el acceso del negocio a la plataforma.
                    Los clientes no podrán reservar turnos.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Razón de suspensión (opcional)
                    </label>
                    <textarea
                      value={suspendReason}
                      onChange={(e) => setSuspendReason(e.target.value)}
                      placeholder="Ingresa la razón de la suspensión..."
                      className="w-full px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleStatusChange('SUSPENDED')}
                    disabled={actionLoading}
                  >
                    {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Confirmar Suspensión
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Button onClick={() => handleStatusChange('ACTIVE')} disabled={actionLoading}>
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Reactivar
            </Button>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${statusConf.bgColor}`}>
        <Shield className={`h-5 w-5 ${statusConf.color}`} />
        <span className={`font-medium ${statusConf.color}`}>{statusConf.label}</span>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Subscription Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Suscripción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium">{tenant.subscription?.plan || 'Sin plan'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Estado</span>
              {subConf ? (
                <Badge variant={subConf.variant}>{subConf.label}</Badge>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>
            {tenant.subscription?.trialEndAt && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Trial vence</span>
                <span className="text-sm">{formatDate(tenant.subscription.trialEndAt)}</span>
              </div>
            )}
            {tenant.subscription?.currentPeriodEnd && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Período vence</span>
                <span className="text-sm">{formatDate(tenant.subscription.currentPeriodEnd)}</span>
              </div>
            )}
            <Link href={`/admin/suscripciones?tenantId=${tenant.id}`}>
              <Button variant="outline" className="w-full mt-2" size="sm">
                Ver suscripción completa
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tenant.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${tenant.email}`} className="text-sm hover:underline">
                  {tenant.email}
                </a>
              </div>
            )}
            {tenant.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{tenant.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Registrado el {formatDate(tenant.createdAt)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estadísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Turnos</span>
              </div>
              <span className="font-bold text-lg">{tenant.stats.totalBookings}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Clientes</span>
              </div>
              <span className="font-bold text-lg">{tenant.stats.totalCustomers}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Empleados</span>
              </div>
              <span className="font-bold text-lg">{tenant.stats.totalEmployees}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Sucursales</span>
              </div>
              <span className="font-bold text-lg">{tenant.stats.totalBranches}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actividad Reciente</CardTitle>
          <CardDescription>Últimas acciones del negocio</CardDescription>
        </CardHeader>
        <CardContent>
          {activity && activity.data.length > 0 ? (
            <div className="space-y-4">
              {activity.data.map((log) => (
                <div key={log.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={log.severity === 'WARNING' ? 'destructive' : 'secondary'} className="text-xs">
                        {log.action}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {log.entityType}
                      </span>
                    </div>
                    <p className="text-sm mt-1 text-muted-foreground">
                      {formatDateTime(log.timestamp)}
                      {log.ipAddress && ` • IP: ${log.ipAddress}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No hay actividad registrada
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
