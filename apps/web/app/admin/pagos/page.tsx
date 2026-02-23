'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Loader2,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { adminApi, AdminPayment, PaymentStats, PaginatedResponse } from '@/lib/admin-api';

const statusConfig: Record<string, { label: string; icon: any; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'Pendiente', icon: Clock, variant: 'outline' },
  APPROVED: { label: 'Aprobado', icon: CheckCircle2, variant: 'default' },
  REJECTED: { label: 'Rechazado', icon: XCircle, variant: 'destructive' },
  REFUNDED: { label: 'Reembolsado', icon: DollarSign, variant: 'secondary' },
};

export default function PagosPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PaginatedResponse<AdminPayment> | null>(null);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [failedPayments, setFailedPayments] = useState<AdminPayment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: '20',
      };

      if (status) params.status = status;

      const [paymentsData, statsData, failedData] = await Promise.all([
        adminApi.getPayments(params),
        adminApi.getPaymentStats(),
        adminApi.getFailedPayments(),
      ]);

      setData(paymentsData);
      setStats(statsData);
      setFailedPayments(failedData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar pagos');
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Este Mes</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.totalThisMonth || 0)}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-950 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Exitosos</p>
                <p className="text-2xl font-bold">{stats?.successfulPayments || 0}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fallidos</p>
                <p className="text-2xl font-bold">{stats?.failedPayments || 0}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-950 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Promedio</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.averagePaymentAmount || 0)}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Failed Payments Alert */}
      {failedPayments.length > 0 && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertTriangle className="h-5 w-5" />
              Pagos Fallidos Recientes
            </CardTitle>
            <CardDescription className="text-red-600 dark:text-red-400">
              Estos pagos requieren atención
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {failedPayments.slice(0, 3).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-background">
                  <div>
                    <p className="font-medium">{payment.subscription.tenant.name}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(payment.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(payment.amount)}</p>
                    <Badge variant="destructive">Fallido</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historial de Pagos</CardTitle>
              <CardDescription>Todos los pagos de suscripciones</CardDescription>
            </div>
            <Select value={status} onValueChange={(v) => { setStatus(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="APPROVED">Aprobados</SelectItem>
                <SelectItem value="PENDING">Pendientes</SelectItem>
                <SelectItem value="REJECTED">Rechazados</SelectItem>
              </SelectContent>
            </Select>
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
              <DollarSign className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No se encontraron pagos</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fecha</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Negocio</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Monto</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">MP ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((payment) => {
                      const statusConf = statusConfig[payment.status] || statusConfig.PENDING;
                      const Icon = statusConf.icon;

                      return (
                        <tr key={payment.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                          <td className="py-4 px-4 text-sm">
                            {formatDate(payment.paidAt || payment.createdAt)}
                          </td>
                          <td className="py-4 px-4">
                            <Link href={`/admin/negocios/${payment.subscription.tenant.id}`} className="hover:underline">
                              {payment.subscription.tenant.name}
                            </Link>
                          </td>
                          <td className="py-4 px-4 text-sm">
                            {payment.subscription.plan.name}
                          </td>
                          <td className="py-4 px-4 font-medium">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={statusConf.variant} className="gap-1">
                              <Icon className="h-3 w-3" />
                              {statusConf.label}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 font-mono text-sm text-muted-foreground">
                            {payment.mpPaymentId || '-'}
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
                    Página {page} de {data.pagination.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === data.pagination.totalPages}
                    >
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
