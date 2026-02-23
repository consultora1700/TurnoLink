'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Building2, Users, TrendingUp, CalendarCheck, RefreshCw } from 'lucide-react';
import {
  StatsCard,
  RevenueChart,
  SubscriptionsPie,
  AlertsWidget,
  RecentTenantsTable,
} from '@/components/admin/dashboard';
import {
  StatsCardSkeleton,
  ChartSkeleton,
  AlertCardSkeleton,
  TenantCardSkeleton,
} from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  adminApi,
  AdminOverviewStats,
  RevenueStats,
  SubscriptionDistribution,
  SecurityAlert,
  AdminTenant,
} from '@/lib/admin-api';
import { cn } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [revenue, setRevenue] = useState<RevenueStats | null>(null);
  const [distribution, setDistribution] = useState<SubscriptionDistribution[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [recentTenants, setRecentTenants] = useState<AdminTenant[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [statsData, revenueData, distData, alertsData, tenantsData] = await Promise.all([
        adminApi.getOverviewStats(),
        adminApi.getRevenueStats('12months'),
        adminApi.getSubscriptionDistribution(),
        adminApi.getRecentAlerts(5),
        adminApi.getRecentTenants(5),
      ]);

      setStats(statsData);
      setRevenue(revenueData);
      setDistribution(distData);
      setAlerts(alertsData);
      setRecentTenants(tenantsData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Loading skeleton state
  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        {/* Secondary Stats Skeleton */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <ChartSkeleton />
          </div>
          <ChartSkeleton />
        </div>

        {/* Alerts and Tenants Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Seguridad</CardTitle>
              <CardDescription>Estado del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <AlertCardSkeleton key={i} />
              ))}
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Ultimos Negocios</CardTitle>
              <CardDescription>Nuevos registros</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <TenantCardSkeleton key={i} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
        <div className="text-center space-y-4 px-4 max-w-md">
          <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <TrendingUp className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <p className="font-medium text-destructive">{error}</p>
            <p className="text-sm text-muted-foreground mt-1">
              No pudimos cargar los datos del dashboard
            </p>
          </div>
          <Button onClick={() => loadDashboardData()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Refresh indicator */}
      {refreshing && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">Actualizando...</span>
        </div>
      )}

      {/* Stats Cards - 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <StatsCard
          title="MRR (Ingresos Mensuales)"
          mobileTitle="MRR"
          value={stats?.mrr || 0}
          change={stats?.mrrGrowth}
          changeLabel="vs mes anterior"
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100 dark:bg-green-950"
          format="currency"
          delay={0}
        />
        <StatsCard
          title="Negocios Activos"
          mobileTitle="Negocios"
          value={stats?.totalTenants || 0}
          changeLabel={`+${stats?.newTenantsThisMonth || 0} este mes`}
          icon={Building2}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100 dark:bg-blue-950"
          delay={50}
        />
        <StatsCard
          title="Usuarios Totales"
          mobileTitle="Usuarios"
          value={stats?.totalUsers || 0}
          changeLabel={`+${stats?.newUsersThisMonth || 0} este mes`}
          icon={Users}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100 dark:bg-purple-950"
          delay={100}
        />
        <StatsCard
          title="Tasa de Conversion"
          mobileTitle="Conversion"
          value={stats?.conversionRate || 0}
          icon={TrendingUp}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100 dark:bg-amber-950"
          format="percentage"
          delay={150}
        />
      </div>

      {/* Secondary Stats - 2 columns */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <StatsCard
          title="Turnos Totales"
          mobileTitle="Total"
          value={stats?.totalBookings || 0}
          changeLabel={`+${stats?.bookingsThisMonth || 0} este mes`}
          icon={CalendarCheck}
          iconColor="text-cyan-600"
          iconBgColor="bg-cyan-100 dark:bg-cyan-950"
          delay={200}
        />
        <StatsCard
          title="Turnos Este Mes"
          mobileTitle="Este Mes"
          value={stats?.bookingsThisMonth || 0}
          icon={CalendarCheck}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-100 dark:bg-indigo-950"
          delay={250}
        />
      </div>

      {/* Charts Row - stack on mobile */}
      <div className={cn(
        'grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6',
        'animate-in fade-in slide-in-from-bottom-4 duration-500'
      )} style={{ animationDelay: '300ms' }}>
        {revenue && (
          <RevenueChart
            data={revenue.data}
            totalRevenue={revenue.totalRevenue}
            averagePayment={revenue.averagePayment}
          />
        )}
        <SubscriptionsPie data={distribution} />
      </div>

      {/* Alerts and Recent Tenants - stack on mobile */}
      <div className={cn(
        'grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6',
        'animate-in fade-in slide-in-from-bottom-4 duration-500'
      )} style={{ animationDelay: '400ms' }}>
        <div className="lg:col-span-1">
          <AlertsWidget alerts={alerts} />
        </div>
        <div className="lg:col-span-2">
          <RecentTenantsTable tenants={recentTenants} />
        </div>
      </div>
    </div>
  );
}
