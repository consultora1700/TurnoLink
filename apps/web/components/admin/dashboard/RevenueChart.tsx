'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RevenueDataPoint } from '@/lib/admin-api';
import { TrendingUp } from 'lucide-react';

interface RevenueChartProps {
  data: RevenueDataPoint[];
  totalRevenue: number;
  averagePayment: number;
}

export function RevenueChart({ data, totalRevenue, averagePayment }: RevenueChartProps) {
  const formattedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      date: formatDate(item.date),
      shortDate: formatDateShort(item.date),
    }));
  }, [data]);

  function formatDate(dateStr: string): string {
    const parts = dateStr.split('-');
    if (parts.length === 2) {
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return months[parseInt(parts[1]) - 1] || dateStr;
    }
    return dateStr;
  }

  function formatDateShort(dateStr: string): string {
    const parts = dateStr.split('-');
    if (parts.length === 2) {
      const months = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
      return months[parseInt(parts[1]) - 1] || dateStr;
    }
    return dateStr;
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrencyCompact = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border bg-card p-3 shadow-xl">
          <p className="font-medium text-sm">{label}</p>
          <p className="text-sm text-primary font-semibold">
            {formatCurrency(payload[0].value)}
          </p>
          <p className="text-xs text-muted-foreground">
            {payload[0].payload.payments} pagos
          </p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Ingresos
          </CardTitle>
          <CardDescription>Ultimos 12 meses</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px] sm:h-[280px]">
          <p className="text-muted-foreground">Sin datos de ingresos</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Ingresos
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Ultimos 12 meses</CardDescription>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 sm:text-right">
            <div>
              <p className="text-lg sm:text-2xl font-bold tabular-nums">
                <span className="sm:hidden">{formatCurrencyCompact(totalRevenue)}</span>
                <span className="hidden sm:inline">{formatCurrency(totalRevenue)}</span>
              </p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="hidden sm:block">
              <p className="text-lg font-semibold tabular-nums text-muted-foreground">
                {formatCurrency(averagePayment)}
              </p>
              <p className="text-xs text-muted-foreground">Promedio/pago</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[180px] sm:h-[260px] -ml-4 sm:ml-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                className="text-[10px] sm:text-xs fill-muted-foreground"
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
                tickMargin={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                className="text-[10px] sm:text-xs fill-muted-foreground"
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                width={45}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
