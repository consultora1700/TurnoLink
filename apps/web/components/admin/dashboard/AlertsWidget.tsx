'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SecurityAlert } from '@/lib/admin-api';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertsWidgetProps {
  alerts: SecurityAlert[];
}

const severityConfig = {
  CRITICAL: {
    icon: ShieldAlert,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-950',
    borderColor: 'border-red-200 dark:border-red-900',
    badgeVariant: 'destructive' as const,
  },
  HIGH: {
    icon: AlertTriangle,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-950',
    borderColor: 'border-orange-200 dark:border-orange-900',
    badgeVariant: 'default' as const,
  },
  MEDIUM: {
    icon: AlertCircle,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-950',
    borderColor: 'border-amber-200 dark:border-amber-900',
    badgeVariant: 'secondary' as const,
  },
  LOW: {
    icon: Info,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
    borderColor: 'border-blue-200 dark:border-blue-900',
    badgeVariant: 'outline' as const,
  },
};

const typeLabels: Record<string, string> = {
  MULTIPLE_FAILED_LOGINS: 'Intentos de login fallidos',
  SUSPICIOUS_ACTIVITY: 'Actividad sospechosa',
  PAYMENT_FAILURE: 'Pago fallido',
  SUBSCRIPTION_EXPIRED: 'Suscripcion vencida',
  HIGH_CHURN: 'Alta tasa de cancelacion',
  UNUSUAL_TRAFFIC: 'Trafico inusual',
  ADMIN_LOGIN_FAILED: 'Login admin fallido',
  SECURITY_CONFIG_CHANGE: 'Cambio de configuracion',
};

export function AlertsWidget({ alerts }: AlertsWidgetProps) {
  const formatTimeAgo = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Seguridad
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Estado del sistema</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-green-100 dark:bg-green-950 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
          </div>
          <p className="font-semibold text-green-600 dark:text-green-400">
            Todo en orden
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            No hay alertas pendientes
          </p>
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
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Seguridad
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {alerts.length} alerta{alerts.length !== 1 ? 's' : ''} pendiente{alerts.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <Badge variant="destructive" className="text-xs h-6 px-2 animate-pulse">
            {alerts.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3">
        {alerts.slice(0, 5).map((alert, index) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;

          return (
            <div
              key={alert.id}
              className={cn(
                'flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl border transition-all duration-300',
                config.bgColor,
                config.borderColor,
                'animate-in fade-in slide-in-from-right-2'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5', config.color)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <Badge variant={config.badgeVariant} className="text-[10px] sm:text-xs h-4 sm:h-5 px-1.5">
                    {alert.severity}
                  </Badge>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    {formatTimeAgo(alert.createdAt)}
                  </span>
                </div>
                <p className="font-medium text-xs sm:text-sm mt-1 line-clamp-1">
                  {alert.title}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {typeLabels[alert.type] || alert.type}
                </p>
              </div>
            </div>
          );
        })}

        <Link href="/admin/seguridad" className="block">
          <Button variant="ghost" className="w-full mt-1 h-9 sm:h-10 text-xs sm:text-sm" size="sm">
            Ver todas las alertas
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
