'use client';

import { useState, useEffect } from 'react';
import {
  Loader2,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  DollarSign,
  AlertTriangle,
  Download,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { adminApi, GrowthStats, ChurnStats, RevenueStats } from '@/lib/admin-api';

const COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#22c55e', '#ef4444'];

export default function ReportesPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('12months');
  const [growth, setGrowth] = useState<GrowthStats | null>(null);
  const [churn, setChurn] = useState<ChurnStats | null>(null);
  const [revenue, setRevenue] = useState<RevenueStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [growthData, churnData, revenueData] = await Promise.all([
        adminApi.getGrowthStats(),
        adminApi.getChurnStats(),
        adminApi.getRevenueStats(period),
      ]);

      setGrowth(growthData);
      setChurn(churnData);
      setRevenue(revenueData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatMonth = (dateStr: string): string => {
    const parts = dateStr.split('-');
    if (parts.length === 2) {
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return months[parseInt(parts[1]) - 1] || dateStr;
    }
    return dateStr;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-card p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-primary">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={loadData}>Reintentar</Button>
      </div>
    );
  }

  // Prepare projection data (simple linear projection)
  const projectionData = revenue?.data.slice(-6).map((item, index) => ({
    ...item,
    date: formatMonth(item.date),
    projected: item.revenue * (1 + 0.05 * (index + 1)), // 5% growth projection
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Business Intelligence</h2>
          <p className="text-muted-foreground">Análisis de métricas y tendencias</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Últimos 30 días</SelectItem>
              <SelectItem value="90days">Últimos 90 días</SelectItem>
              <SelectItem value="12months">Últimos 12 meses</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Growth Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Crecimiento de Negocios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="text-2xl font-bold">{growth?.tenants.total || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Este mes</span>
              <span className="font-medium text-green-600">+{growth?.tenants.thisMonth || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Mes anterior</span>
              <span className="font-medium">{growth?.tenants.lastMonth || 0}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2">
                {(growth?.tenants.growthPercentage || 0) >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={(growth?.tenants.growthPercentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {growth?.tenants.growthPercentage || 0}% vs mes anterior
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Crecimiento de Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="text-2xl font-bold">{growth?.users.total || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Este mes</span>
              <span className="font-medium text-green-600">+{growth?.users.thisMonth || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Mes anterior</span>
              <span className="font-medium">{growth?.users.lastMonth || 0}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2">
                {(growth?.users.growthPercentage || 0) >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={(growth?.users.growthPercentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {growth?.users.growthPercentage || 0}% vs mes anterior
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Análisis de Churn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tasa de Churn</span>
              <span className="text-2xl font-bold text-amber-600">{churn?.churnRate || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Cancelados este mes</span>
              <span className="font-medium text-red-600">{churn?.cancelledThisMonth || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Cancelados mes ant.</span>
              <span className="font-medium">{churn?.cancelledLastMonth || 0}</span>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                {churn?.atRiskTenants.length || 0} negocios en riesgo
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Ingresos por Período</CardTitle>
            <CardDescription>Evolución de ingresos mensuales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue?.data.map(d => ({ ...d, date: formatMonth(d.date) })) || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs fill-muted-foreground" />
                  <YAxis
                    className="text-xs fill-muted-foreground"
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Churn Reasons */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Razones de Cancelación</CardTitle>
            <CardDescription>Distribución de motivos de churn</CardDescription>
          </CardHeader>
          <CardContent>
            {churn?.reasons && churn.reasons.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={churn.reasons}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="reason"
                      label={({ payload }: any) => `${payload?.percentage || 0}%`}
                    >
                      {churn.reasons.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any, props: any) => [
                        `${value} (${props.payload?.percentage || 0}%)`,
                        props.payload?.reason || '',
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Sin datos de cancelación</p>
              </div>
            )}
            {churn?.reasons && churn.reasons.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                {churn.reasons.slice(0, 4).map((reason, index) => (
                  <div key={reason.reason} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm truncate">{reason.reason}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Projection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Proyección de Ingresos
          </CardTitle>
          <CardDescription>Proyección basada en tendencia actual (5% crecimiento mensual)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs fill-muted-foreground" />
                <YAxis
                  className="text-xs fill-muted-foreground"
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value) || 0)}
                  labelFormatter={(label) => `Período: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Actual"
                />
                <Line
                  type="monotone"
                  dataKey="projected"
                  stroke="#22c55e"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                  name="Proyectado"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span className="text-sm">Ingresos actuales</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-sm">Proyección</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* At Risk Tenants */}
      {churn?.atRiskTenants && churn.atRiskTenants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Negocios en Riesgo de Churn
            </CardTitle>
            <CardDescription>
              Negocios sin actividad en los últimos 30 días
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Negocio</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado Suscripción</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Última Actividad</th>
                  </tr>
                </thead>
                <tbody>
                  {churn.atRiskTenants.map((tenant) => (
                    <tr key={tenant.id} className="border-b last:border-0">
                      <td className="py-3 px-4 font-medium">{tenant.name}</td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">{tenant.subscriptionStatus}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(tenant.lastActivity).toLocaleDateString('es-AR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
