'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminTenant } from '@/lib/admin-api';
import { ArrowRight, Building2, Calendar, Users, CalendarCheck, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentTenantsTableProps {
  tenants: AdminTenant[];
}

const statusConfig = {
  ACTIVE: { label: 'Activo', variant: 'default' as const, color: 'bg-green-500' },
  INACTIVE: { label: 'Inactivo', variant: 'secondary' as const, color: 'bg-gray-500' },
  SUSPENDED: { label: 'Suspendido', variant: 'destructive' as const, color: 'bg-red-500' },
};

const subscriptionStatusConfig = {
  TRIALING: { label: 'Trial', variant: 'outline' as const, dotColor: 'bg-blue-500' },
  ACTIVE: { label: 'Activa', variant: 'default' as const, dotColor: 'bg-green-500' },
  PAST_DUE: { label: 'Vencida', variant: 'destructive' as const, dotColor: 'bg-red-500' },
  CANCELLED: { label: 'Cancelada', variant: 'secondary' as const, dotColor: 'bg-gray-500' },
  EXPIRED: { label: 'Expirada', variant: 'secondary' as const, dotColor: 'bg-gray-500' },
};

export function RecentTenantsTable({ tenants }: RecentTenantsTableProps) {
  const formatTimeAgo = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'ahora';
    if (diffMins < 60) return `hace ${diffMins}m`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    if (diffDays < 7) return `hace ${diffDays}d`;
    return date.toLocaleDateString('es-AR');
  };

  if (tenants.length === 0) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Ultimos Negocios Registrados</CardTitle>
          <CardDescription>Nuevos registros en la plataforma</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="font-medium text-muted-foreground">No hay negocios registrados aun</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Los nuevos negocios apareceran aqui
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Ultimos Negocios Registrados</CardTitle>
            <CardDescription>Nuevos registros en la plataforma</CardDescription>
          </div>
          <Link href="/admin/negocios" className="hidden sm:block">
            <Button variant="outline" size="sm" className="gap-1">
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {/* Mobile Card View */}
        <div className="sm:hidden space-y-3">
          {tenants.map((tenant, index) => {
            const statusConf = statusConfig[tenant.status as keyof typeof statusConfig] || statusConfig.ACTIVE;
            const subStatus = tenant.subscription?.status as keyof typeof subscriptionStatusConfig;
            const subConf = subStatus ? subscriptionStatusConfig[subStatus] : null;

            return (
              <Link
                key={tenant.id}
                href={`/admin/negocios/${tenant.id}`}
                className={cn(
                  'block p-4 rounded-xl border bg-card transition-all duration-300',
                  'hover:shadow-md hover:border-primary/20 active:scale-[0.98]',
                  'animate-in fade-in slide-in-from-bottom-2',
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium truncate">{tenant.name}</p>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                    <p className="text-sm text-muted-foreground">/{tenant.slug}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1.5">
                        <div className={cn('h-1.5 w-1.5 rounded-full', statusConf.color)} />
                        <span className="text-xs text-muted-foreground">{statusConf.label}</span>
                      </div>
                      {subConf && (
                        <Badge variant={subConf.variant} className="text-xs h-5">
                          {tenant.subscription?.plan?.name || 'Sin plan'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarCheck className="h-3 w-3" />
                        {tenant._count.bookings} turnos
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {tenant._count.customers} clientes
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatTimeAgo(tenant.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
          <Link href="/admin/negocios" className="block">
            <Button variant="ghost" className="w-full mt-2">
              Ver todos los negocios
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Negocio
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Plan
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Estado
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Registrado
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  Turnos
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant, index) => {
                const statusConf = statusConfig[tenant.status as keyof typeof statusConfig] || statusConfig.ACTIVE;
                const subStatus = tenant.subscription?.status as keyof typeof subscriptionStatusConfig;
                const subConf = subStatus ? subscriptionStatusConfig[subStatus] : null;

                return (
                  <tr
                    key={tenant.id}
                    className={cn(
                      'border-b last:border-0 hover:bg-muted/50 transition-all duration-200',
                      'animate-in fade-in slide-in-from-left-2'
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{tenant.name}</p>
                          <p className="text-sm text-muted-foreground">/{tenant.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-sm">
                          {tenant.subscription?.plan?.name || 'Sin plan'}
                        </span>
                        {subConf && (
                          <Badge variant={subConf.variant} className="text-xs w-fit">
                            {subConf.label}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${statusConf.color}`} />
                        <span className="text-sm">{statusConf.label}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatTimeAgo(tenant.createdAt)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium tabular-nums">{tenant._count.bookings}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link href={`/admin/negocios/${tenant.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          Ver detalle
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
