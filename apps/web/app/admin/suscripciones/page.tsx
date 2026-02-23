'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Loader2,
  CreditCard,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
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
import { adminApi, AdminSubscription, PaginatedResponse } from '@/lib/admin-api';

const statusConfig: Record<string, { label: string; icon: any; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  TRIALING: { label: 'Trial', icon: Clock, variant: 'outline' },
  ACTIVE: { label: 'Activa', icon: CheckCircle2, variant: 'default' },
  PAST_DUE: { label: 'Vencida', icon: AlertTriangle, variant: 'destructive' },
  CANCELLED: { label: 'Cancelada', icon: XCircle, variant: 'secondary' },
  EXPIRED: { label: 'Expirada', icon: XCircle, variant: 'secondary' },
};

export default function SuscripcionesPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PaginatedResponse<AdminSubscription> | null>(null);
  const [expiring, setExpiring] = useState<AdminSubscription[]>([]);
  const [trials, setTrials] = useState<AdminSubscription[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);

  // Extend trial dialog
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<AdminSubscription | null>(null);
  const [extendDays, setExtendDays] = useState(7);
  const [extendReason, setExtendReason] = useState('');
  const [extendLoading, setExtendLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: '10',
      };

      if (activeTab !== 'all' && activeTab !== 'expiring' && activeTab !== 'trials') {
        params.status = activeTab;
      }

      const [subsData, expiringData, trialsData] = await Promise.all([
        adminApi.getSubscriptions(params),
        adminApi.getExpiringSubscriptions(7),
        adminApi.getTrialSubscriptions(),
      ]);

      setData(subsData);
      setExpiring(expiringData);
      setTrials(trialsData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar suscripciones');
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleExtendTrial = async () => {
    if (!selectedSubscription) return;

    setExtendLoading(true);

    try {
      await adminApi.extendTrial(selectedSubscription.id, extendDays, extendReason);
      setExtendDialogOpen(false);
      setSelectedSubscription(null);
      setExtendDays(7);
      setExtendReason('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al extender trial');
    } finally {
      setExtendLoading(false);
    }
  };

  const openExtendDialog = (subscription: AdminSubscription) => {
    setSelectedSubscription(subscription);
    setExtendDialogOpen(true);
  };

  const renderSubscriptionTable = (subscriptions: AdminSubscription[]) => {
    if (subscriptions.length === 0) {
      return (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">No se encontraron suscripciones</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Negocio</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Vence</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Precio</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => {
              const statusConf = statusConfig[sub.status] || statusConfig.ACTIVE;
              const Icon = statusConf.icon;
              const endDate = sub.status === 'TRIALING' ? sub.trialEndAt : sub.currentPeriodEnd;

              return (
                <tr key={sub.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium">{sub.tenant.name}</p>
                      <p className="text-sm text-muted-foreground">/{sub.tenant.slug}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium">{sub.plan.name}</p>
                      <p className="text-xs text-muted-foreground">{sub.billingPeriod}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={statusConf.variant} className="gap-1">
                      <Icon className="h-3 w-3" />
                      {statusConf.label}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(endDate)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium">
                      {formatCurrency(sub.billingPeriod === 'YEARLY' && sub.plan.priceYearly
                        ? sub.plan.priceYearly
                        : sub.plan.priceMonthly)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      /{sub.billingPeriod === 'YEARLY' ? 'año' : 'mes'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {sub.status === 'TRIALING' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openExtendDialog(sub)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Extender
                        </Button>
                      )}
                      <Link href={`/admin/negocios/${sub.tenantId}`}>
                        <Button variant="ghost" size="sm">
                          Ver negocio
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('ACTIVE')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Activas</p>
                <p className="text-2xl font-bold">
                  {data?.data.filter(s => s.status === 'ACTIVE').length || 0}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-950 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('TRIALING')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En Trial</p>
                <p className="text-2xl font-bold">{trials.length}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('expiring')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Por Vencer</p>
                <p className="text-2xl font-bold">{expiring.length}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('CANCELLED')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Canceladas</p>
                <p className="text-2xl font-bold">
                  {data?.data.filter(s => s.status === 'CANCELLED').length || 0}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-950 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Suscripciones</CardTitle>
          <CardDescription>Gestiona todas las suscripciones de la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1); }}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="ACTIVE">Activas</TabsTrigger>
              <TabsTrigger value="TRIALING">Trials</TabsTrigger>
              <TabsTrigger value="expiring">Por Vencer</TabsTrigger>
              <TabsTrigger value="PAST_DUE">Vencidas</TabsTrigger>
              <TabsTrigger value="CANCELLED">Canceladas</TabsTrigger>
            </TabsList>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">{error}</div>
            ) : (
              <>
                <TabsContent value="all">
                  {data && renderSubscriptionTable(data.data)}
                </TabsContent>
                <TabsContent value="ACTIVE">
                  {data && renderSubscriptionTable(data.data.filter(s => s.status === 'ACTIVE'))}
                </TabsContent>
                <TabsContent value="TRIALING">
                  {renderSubscriptionTable(trials)}
                </TabsContent>
                <TabsContent value="expiring">
                  {renderSubscriptionTable(expiring)}
                </TabsContent>
                <TabsContent value="PAST_DUE">
                  {data && renderSubscriptionTable(data.data.filter(s => s.status === 'PAST_DUE'))}
                </TabsContent>
                <TabsContent value="CANCELLED">
                  {data && renderSubscriptionTable(data.data.filter(s => s.status === 'CANCELLED'))}
                </TabsContent>
              </>
            )}
          </Tabs>

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && activeTab === 'all' && (
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
        </CardContent>
      </Card>

      {/* Extend Trial Dialog */}
      <Dialog open={extendDialogOpen} onOpenChange={setExtendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extender Período de Prueba</DialogTitle>
            <DialogDescription>
              Extiende el trial de {selectedSubscription?.tenant.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Días a extender</label>
              <input
                type="number"
                min="1"
                max="30"
                value={extendDays}
                onChange={(e) => setExtendDays(parseInt(e.target.value) || 7)}
                className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Razón (opcional)</label>
              <textarea
                value={extendReason}
                onChange={(e) => setExtendReason(e.target.value)}
                placeholder="Ingresa la razón de la extensión..."
                className="w-full px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExtendTrial} disabled={extendLoading}>
              {extendLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Extender {extendDays} días
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
