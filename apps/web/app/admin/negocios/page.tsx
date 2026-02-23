'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Loader2,
  Search,
  Building2,
  Filter,
  Download,
  ArrowRight,
  Calendar,
  Users,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { adminApi, AdminTenant, SubscriptionPlan, PaginatedResponse } from '@/lib/admin-api';

const statusOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'ACTIVE', label: 'Activos' },
  { value: 'INACTIVE', label: 'Inactivos' },
  { value: 'SUSPENDED', label: 'Suspendidos' },
];

const subscriptionStatusOptions = [
  { value: '', label: 'Todas las suscripciones' },
  { value: 'TRIALING', label: 'En trial' },
  { value: 'ACTIVE', label: 'Activas' },
  { value: 'PAST_DUE', label: 'Vencidas' },
  { value: 'CANCELLED', label: 'Canceladas' },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Activo', color: 'bg-green-500' },
  INACTIVE: { label: 'Inactivo', color: 'bg-gray-500' },
  SUSPENDED: { label: 'Suspendido', color: 'bg-red-500' },
};

const subStatusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  TRIALING: { label: 'Trial', variant: 'outline' },
  ACTIVE: { label: 'Activa', variant: 'default' },
  PAST_DUE: { label: 'Vencida', variant: 'destructive' },
  CANCELLED: { label: 'Cancelada', variant: 'secondary' },
  EXPIRED: { label: 'Expirada', variant: 'secondary' },
};

export default function NegociosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PaginatedResponse<AdminTenant> | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [subscriptionStatus, setSubscriptionStatus] = useState(searchParams.get('subscriptionStatus') || '');
  const [planId, setPlanId] = useState(searchParams.get('planId') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: '10',
      };

      if (search) params.search = search;
      if (status) params.status = status;
      if (subscriptionStatus) params.subscriptionStatus = subscriptionStatus;
      if (planId) params.planId = planId;

      const [tenantsData, plansData] = await Promise.all([
        adminApi.getTenants(params),
        adminApi.getSubscriptionPlans(),
      ]);

      setData(tenantsData);
      setPlans(plansData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar negocios');
    } finally {
      setLoading(false);
    }
  }, [search, status, subscriptionStatus, planId, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    // Update URL params
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (subscriptionStatus) params.set('subscriptionStatus', subscriptionStatus);
    if (planId) params.set('planId', planId);
    if (page > 1) params.set('page', page.toString());

    const queryString = params.toString();
    router.replace(`/admin/negocios${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [search, status, subscriptionStatus, planId, page, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, slug o email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value || 'all'}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={subscriptionStatus} onValueChange={(v) => { setSubscriptionStatus(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Suscripción" />
              </SelectTrigger>
              <SelectContent>
                {subscriptionStatusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value || 'all'}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={planId} onValueChange={(v) => { setPlanId(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los planes</SelectItem>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>

            <Button type="button" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Negocios
              {data && (
                <span className="text-muted-foreground font-normal ml-2">
                  ({data.pagination.total} resultados)
                </span>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">{error}</div>
          ) : !data || data.data.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No se encontraron negocios</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Negocio</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Registrado</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Turnos</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Clientes</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((tenant) => {
                      const statusConf = statusConfig[tenant.status] || statusConfig.ACTIVE;
                      const subStatus = tenant.subscription?.status as keyof typeof subStatusConfig;
                      const subConf = subStatus ? subStatusConfig[subStatus] : null;

                      return (
                        <tr key={tenant.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
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
                              {formatDate(tenant.createdAt)}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{tenant._count.bookings}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{tenant._count.customers}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <Link href={`/admin/negocios/${tenant.id}`}>
                              <Button variant="ghost" size="sm">
                                Ver detalle
                                <ArrowRight className="h-4 w-4 ml-1" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {((page - 1) * 10) + 1}-{Math.min(page * 10, data.pagination.total)} de {data.pagination.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <span className="text-sm px-3">
                      Página {page} de {data.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === data.pagination.totalPages}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
