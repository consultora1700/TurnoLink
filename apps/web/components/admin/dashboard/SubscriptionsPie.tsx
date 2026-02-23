'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SubscriptionDistribution } from '@/lib/admin-api';
import { PieChart as PieChartIcon } from 'lucide-react';

interface SubscriptionsPieProps {
  data: SubscriptionDistribution[];
}

const COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#22c55e', '#ef4444'];

export function SubscriptionsPie({ data }: SubscriptionsPieProps) {
  const totalSubscriptions = useMemo(() => {
    return data.reduce((sum, item) => sum + item.count, 0);
  }, [data]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-xl border bg-card p-3 shadow-xl">
          <p className="font-medium text-sm">{item.planName}</p>
          <p className="text-sm">
            {item.count} suscripciones ({item.percentage}%)
          </p>
          <p className="text-xs text-muted-foreground">
            MRR: {formatCurrency(item.revenue)}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    if (percent < 0.08) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
        style={{ fontSize: '11px' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Suscripciones
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Distribucion por plan</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[200px] sm:h-[280px]">
          <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
            <PieChartIcon className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground text-sm">Sin datos disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Suscripciones
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Distribucion por plan</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-xl sm:text-2xl font-bold tabular-nums">{totalSubscriptions}</p>
            <p className="text-xs text-muted-foreground">activas</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Mobile: Horizontal bar view */}
        <div className="sm:hidden space-y-3 py-2">
          {data.map((item, index) => (
            <div key={item.planName} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium">{item.planName}</span>
                </div>
                <span className="tabular-nums">{item.count} ({item.percentage}%)</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: COLORS[index % COLORS.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Pie chart */}
        <div className="hidden sm:block h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={85}
                innerRadius={35}
                fill="#8884d8"
                dataKey="count"
                nameKey="planName"
                animationDuration={800}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-xs text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
