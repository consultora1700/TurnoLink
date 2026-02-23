'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { createApiClient } from '@/lib/api';
import {
  Crown,
  Check,
  AlertCircle,
  Clock,
  Zap,
  Building2,
  Users,
  UserCheck,
  Scissors,
  Calendar,
  Loader2,
  ExternalLink,
  CreditCard,
  XCircle,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  History,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface Subscription {
  id: string;
  status: 'TRIALING' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE';
  billingPeriod: 'MONTHLY' | 'YEARLY' | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndAt: string | null;
  cancelledAt: string | null;
  plan: {
    name: string;
    slug: string;
    priceMonthly: string;
    priceYearly: string;
    maxBranches: number;
    maxEmployees: number;
    maxServices: number | null;
    maxBookingsMonth: number | null;
    maxCustomers: number | null;
    features: string[];
  };
}

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceMonthly: string;
  priceYearly: string;
  maxBranches: number;
  maxEmployees: number;
  maxServices: number;
  maxBookingsMonth: number | null;
  features: string[];
  isPopular: boolean;
}

interface PaymentRecord {
  id: string;
  amount: string;
  currency: string;
  status: string;
  periodStart: string;
  periodEnd: string;
  paidAt: string | null;
  createdAt: string;
}

const featureNames: Record<string, string> = {
  whatsapp: 'Notificaciones por WhatsApp',
  whatsapp_confirmation: 'Confirmación por WhatsApp',
  mercadopago: 'Cobros con Mercado Pago',
  calendar: 'Calendario de turnos',
  customers: 'Gestión de clientes',
  reports: 'Reportes avanzados',
  basic_reports: 'Reportes básicos',
  advanced_reports: 'Reportes avanzados',
  complete_reports: 'Reportes completos',
  priority_support: 'Soporte prioritario',
  whatsapp_support: 'Soporte por WhatsApp',
  email_reminder: 'Recordatorios por email',
  email_reminders: 'Recordatorios por email',
  sms: 'Notificaciones SMS',
  multi_branch: 'Múltiples sucursales',
  api_access: 'Acceso a API',
};

interface UsageData {
  branches: { current: number; limit: number | null };
  employees: { current: number; limit: number | null };
  services: { current: number; limit: number | null };
  bookings: { current: number; limit: number | null };
  customers: { current: number; limit: number | null };
}

export default function MiSuscripcionPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [startingTrial, setStartingTrial] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [showPayments, setShowPayments] = useState(false);
  const [upgradingTo, setUpgradingTo] = useState<string | null>(null);

  // Handle payment status from URL params
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      toast({
        title: '¡Pago exitoso!',
        description: 'Tu suscripción ha sido activada correctamente.',
      });
      // Remove query param
      window.history.replaceState({}, '', '/mi-suscripcion');
    } else if (paymentStatus === 'failure') {
      toast({
        title: 'Pago fallido',
        description: 'No se pudo procesar el pago. Intenta de nuevo.',
        variant: 'destructive',
      });
      window.history.replaceState({}, '', '/mi-suscripcion');
    } else if (paymentStatus === 'pending') {
      toast({
        title: 'Pago pendiente',
        description: 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.',
      });
      window.history.replaceState({}, '', '/mi-suscripcion');
    }
  }, [searchParams, toast]);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.accessToken) return;
      try {
        const api = createApiClient(session.accessToken as string);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-turnolink.mubitt.com';

        // Fetch subscription and plans in parallel
        const [subResponse, plansResponse] = await Promise.all([
          fetch(`${baseUrl}/api/subscriptions`, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }),
          fetch(`${baseUrl}/api/plans`),
        ]);

        if (subResponse.ok) {
          const subData = await subResponse.json();
          setSubscription(subData);

          // Fetch usage data if subscription exists
          fetchUsageData();
          fetchPayments();
        }

        if (plansResponse.ok) {
          const plansData = await plansResponse.json();
          setPlans(plansData);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.accessToken]);

  const fetchUsageData = async () => {
    if (!session?.accessToken) return;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-turnolink.mubitt.com';

    try {
      const resources = ['branches', 'employees', 'services', 'bookings', 'customers'];
      const results = await Promise.all(
        resources.map(async (resource) => {
          const response = await fetch(`${baseUrl}/api/subscriptions/limits/${resource}`, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          });
          if (response.ok) {
            return { [resource]: await response.json() };
          }
          return { [resource]: { current: 0, limit: null } };
        })
      );

      const usageData = results.reduce((acc, curr) => ({ ...acc, ...curr }), {}) as UsageData;
      setUsage(usageData);
    } catch (error) {
      console.error('Error fetching usage:', error);
    }
  };

  const fetchPayments = async () => {
    if (!session?.accessToken) return;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-turnolink.mubitt.com';

    try {
      const response = await fetch(`${baseUrl}/api/subscriptions/payments`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handleCancelSubscription = async () => {
    if (!session?.accessToken) return;

    setCancelling(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://api-turnolink.mubitt.com'}/api/subscriptions/cancel`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
        setShowCancelConfirm(false);
        toast({
          title: 'Suscripción cancelada',
          description: 'Tu suscripción ha sido cancelada. Podrás seguir usando el servicio hasta el fin del período actual.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo cancelar la suscripción',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error de conexión. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setCancelling(false);
    }
  };

  const startTrial = async (planSlug?: string) => {
    if (!session?.accessToken) return;
    setStartingTrial(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://api-turnolink.mubitt.com'}/api/subscriptions/trial`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ planSlug }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
        toast({
          title: '¡Prueba iniciada!',
          description: `Tienes 14 días para probar el plan ${data.plan.name}.`,
        });
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      toast({
        title: 'Error',
        description: 'No se pudo iniciar la prueba. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setStartingTrial(false);
    }
  };

  const handlePayment = async (planSlug: string) => {
    if (!session?.accessToken) return;
    setProcessingPayment(true);
    setUpgradingTo(planSlug);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://api-turnolink.mubitt.com'}/api/subscriptions/create-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ planSlug, billingPeriod }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.initPoint) {
          // Redirect to MercadoPago checkout
          window.location.href = data.initPoint;
        }
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.message || 'No se pudo procesar el pago. Intenta de nuevo.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Error',
        description: 'Error de conexión. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setProcessingPayment(false);
      setUpgradingTo(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'TRIALING':
        return <Badge className="bg-blue-500">Prueba Gratis</Badge>;
      case 'ACTIVE':
        return <Badge className="bg-green-500">Activa</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelada</Badge>;
      case 'EXPIRED':
        return <Badge variant="secondary">Expirada</Badge>;
      case 'PAST_DUE':
        return <Badge variant="destructive">Pago Pendiente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getFeatureName = (feature: string) => {
    return featureNames[feature] || feature;
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-500 text-xs">Aprobado</Badge>;
      case 'PENDING':
        return <Badge className="bg-amber-500 text-xs">Pendiente</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive" className="text-xs">Rechazado</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Mi Suscripción</h1>
        <p className="text-muted-foreground">
          Administra tu plan y facturación
        </p>
      </div>

      {/* Current Subscription */}
      {subscription ? (
        <div className="bg-card rounded-xl border p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{subscription.plan.name}</h2>
                  {getStatusBadge(subscription.status)}
                </div>
              </div>

              {subscription.status === 'TRIALING' && subscription.trialEndAt && (
                <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                  <Clock className="h-4 w-4" />
                  <span>
                    Tu prueba termina en {getDaysRemaining(subscription.trialEndAt)} días
                  </span>
                </div>
              )}

              {subscription.status === 'ACTIVE' && (
                <p className="text-sm text-muted-foreground">
                  Próximo cobro: {new Date(subscription.currentPeriodEnd).toLocaleDateString('es-AR')}
                </p>
              )}
            </div>

            {/* Payment Actions for Trial */}
            {subscription.status === 'TRIALING' && subscription.plan.slug !== 'gratis' && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
                  <button
                    onClick={() => setBillingPeriod('MONTHLY')}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                      billingPeriod === 'MONTHLY'
                        ? 'bg-background shadow-sm'
                        : 'text-muted-foreground'
                    )}
                  >
                    Mensual
                  </button>
                  <button
                    onClick={() => setBillingPeriod('YEARLY')}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                      billingPeriod === 'YEARLY'
                        ? 'bg-background shadow-sm'
                        : 'text-muted-foreground'
                    )}
                  >
                    Anual (-17%)
                  </button>
                </div>
                <div className="text-center mb-2">
                  <span className="text-2xl font-bold">
                    ${billingPeriod === 'MONTHLY'
                      ? Number(subscription.plan.priceMonthly).toLocaleString()
                      : Number(subscription.plan.priceYearly).toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">
                    /{billingPeriod === 'MONTHLY' ? 'mes' : 'año'}
                  </span>
                </div>
                <Button
                  onClick={() => handlePayment(subscription.plan.slug)}
                  disabled={processingPayment}
                  className="bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600"
                >
                  {processingPayment ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CreditCard className="h-4 w-4 mr-2" />
                  )}
                  Pagar con MercadoPago
                </Button>
              </div>
            )}
          </div>

          {/* Plan Limits with Usage */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Uso de tu plan
              </h3>
              {usage && (
                <span className="text-xs text-muted-foreground">
                  Actualizado en tiempo real
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { key: 'bookings', icon: Calendar, label: 'Turnos/Mes', max: subscription.plan.maxBookingsMonth },
                { key: 'branches', icon: Building2, label: 'Sucursales', max: subscription.plan.maxBranches },
                { key: 'employees', icon: Users, label: 'Empleados', max: subscription.plan.maxEmployees },
                { key: 'services', icon: Scissors, label: 'Servicios', max: subscription.plan.maxServices },
                { key: 'customers', icon: UserCheck, label: 'Clientes', max: subscription.plan.maxCustomers },
              ].map(({ key, icon: Icon, label, max }) => {
                const current = usage?.[key as keyof UsageData]?.current ?? 0;
                const limit = max ?? null;
                const percentage = limit ? Math.min((current / limit) * 100, 100) : 0;
                const isNearLimit = limit && percentage >= 80;
                const isAtLimit = limit && current >= limit;

                return (
                  <div key={key} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      {isAtLimit && (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={cn(
                        "text-2xl font-bold",
                        isAtLimit && "text-amber-600 dark:text-amber-400"
                      )}>
                        {current}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        / {limit ?? '∞'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{label}</p>
                    {limit && (
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            isAtLimit
                              ? "bg-red-500"
                              : isNearLimit
                              ? "bg-amber-500"
                              : "bg-brand-500"
                          )}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Features */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-3">Incluido en tu plan:</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {(subscription.plan.features || []).map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{getFeatureName(feature)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade Options for Free Plan */}
          {subscription.plan.slug === 'gratis' && (
            <div className="mt-6 pt-6 border-t">
              <div className="bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-950/30 dark:to-purple-950/30 rounded-xl p-4 border border-brand-200 dark:border-brand-800">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-brand-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold">¿Necesitas más?</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Actualiza a un plan de pago para desbloquear más funciones.
                    </p>
                    <Link href="/suscripcion">
                      <Button size="sm" className="mt-3">
                        Ver planes
                        <ExternalLink className="h-3 w-3 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment History */}
          {payments.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <button
                onClick={() => setShowPayments(!showPayments)}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <History className="h-4 w-4" />
                Historial de pagos ({payments.length})
                <span className={cn("transition-transform", showPayments && "rotate-180")}>▼</span>
              </button>

              {showPayments && (
                <div className="mt-4 space-y-2">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            ${Number(payment.amount).toLocaleString()} {payment.currency}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {payment.paidAt
                              ? new Date(payment.paidAt).toLocaleDateString('es-AR')
                              : new Date(payment.createdAt).toLocaleDateString('es-AR')}
                          </p>
                        </div>
                      </div>
                      {getPaymentStatusBadge(payment.status)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cancel Subscription */}
          {subscription.status === 'ACTIVE' && subscription.plan.slug !== 'gratis' && (
            <div className="mt-6 pt-6 border-t">
              {!showCancelConfirm ? (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="text-sm text-muted-foreground hover:text-red-500 transition-colors"
                >
                  Cancelar suscripción
                </button>
              ) : (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-900 dark:text-red-100">
                        ¿Seguro que quieres cancelar?
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        Tu suscripción seguirá activa hasta el {new Date(subscription.currentPeriodEnd).toLocaleDateString('es-AR')}.
                        Después de esa fecha, pasarás al plan Gratis.
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleCancelSubscription}
                          disabled={cancelling}
                        >
                          {cancelling ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          Sí, cancelar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCancelConfirm(false)}
                          disabled={cancelling}
                        >
                          Mantener suscripción
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cancelled Status Info */}
          {subscription.status === 'CANCELLED' && (
            <div className="mt-6 pt-6 border-t">
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                      Suscripción cancelada
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Tu acceso terminará el {new Date(subscription.currentPeriodEnd).toLocaleDateString('es-AR')}.
                    </p>
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={() => handlePayment(subscription.plan.slug)}
                      disabled={processingPayment}
                    >
                      Reactivar suscripción
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* No Subscription - Show Plans */
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-950/30 dark:to-purple-950/30 rounded-xl p-6 border border-brand-200 dark:border-brand-800">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center flex-shrink-0">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Comienza tu prueba gratis</h2>
                <p className="text-muted-foreground mt-1">
                  Prueba TurnoLink gratis por 14 días. Sin tarjeta de crédito.
                </p>
                <Button onClick={() => startTrial()} className="mt-4" disabled={startingTrial}>
                  {startingTrial ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Crown className="h-4 w-4 mr-2" />
                  )}
                  Iniciar Prueba Gratis
                </Button>
              </div>
            </div>
          </div>

          {/* Plans Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Planes Disponibles</h2>
              <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
                <button
                  onClick={() => setBillingPeriod('MONTHLY')}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                    billingPeriod === 'MONTHLY'
                      ? 'bg-background shadow-sm'
                      : 'text-muted-foreground'
                  )}
                >
                  Mensual
                </button>
                <button
                  onClick={() => setBillingPeriod('YEARLY')}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1',
                    billingPeriod === 'YEARLY'
                      ? 'bg-background shadow-sm'
                      : 'text-muted-foreground'
                  )}
                >
                  Anual
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    -17%
                  </Badge>
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    'bg-card rounded-xl border p-5 relative',
                    plan.isPopular && 'border-brand-500 ring-1 ring-brand-500'
                  )}
                >
                  {plan.isPopular && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-brand-500">
                      Popular
                    </Badge>
                  )}
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>

                  <div className="mt-4">
                    <span className="text-3xl font-bold">
                      ${billingPeriod === 'MONTHLY' ? Number(plan.priceMonthly).toLocaleString() : Number(plan.priceYearly).toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">
                      /{billingPeriod === 'MONTHLY' ? 'mes' : 'año'}
                    </span>
                  </div>

                  <Button
                    className="w-full mt-4"
                    variant={plan.isPopular ? 'default' : 'outline'}
                    onClick={() => startTrial(plan.slug)}
                    disabled={startingTrial}
                  >
                    {plan.slug === 'gratis' ? 'Comenzar Gratis' : 'Probar 14 días Gratis'}
                  </Button>

                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {plan.maxBranches} sucursal{plan.maxBranches > 1 ? 'es' : ''}
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {plan.maxEmployees} empleados
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Scissors className="h-4 w-4 text-muted-foreground" />
                      {plan.maxServices ?? '∞'} servicios
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Help Link */}
      <div className="bg-muted/50 rounded-xl p-6 text-center">
        <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground mb-3">
          ¿Tienes preguntas sobre tu suscripción?
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link href="/suscripcion">
            <Button variant="outline" size="sm">
              Ver todos los planes
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          </Link>
          <Link href="/ayuda">
            <Button variant="outline" size="sm">
              Centro de ayuda
              <HelpCircle className="h-3 w-3 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
