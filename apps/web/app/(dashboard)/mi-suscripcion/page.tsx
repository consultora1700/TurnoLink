'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import {
  Crown,
  Check,
  AlertCircle,
  Clock,
  Building2,
  Users,
  UserCheck,
  Scissors,
  Calendar,
  Loader2,
  CreditCard,
  XCircle,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  History,
  Sparkles,
  ChevronDown,
  ArrowRight,
  Shield,
  MessageSquare,
  Mail,
  RefreshCw,
  Star,
  Gift,
  Tag,
  ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { handleApiError } from '@/lib/notifications';
import { useRubroTerms } from '@/contexts/tenant-config-context';

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
    maxBranches: number | null;
    maxEmployees: number | null;
    maxServices: number | null;
    maxBookingsMonth: number | null;
    maxCustomers: number | null;
    maxPhotos: number | null;
    features: string[];
    industryGroup?: {
      slug: string;
      name: string;
      limitLabels: Record<string, string | null>;
    } | null;
  };
}

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceMonthly: string;
  priceYearly: string;
  maxBranches: number | null;
  maxEmployees: number | null;
  maxServices: number | null;
  maxBookingsMonth: number | null;
  maxCustomers: number | null;
  maxPhotos: number | null;
  features: string[];
  isPopular: boolean;
  industryGroup?: {
    slug: string;
    name: string;
    limitLabels: Record<string, string | null>;
  } | null;
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
  whatsapp: 'WhatsApp',
  whatsapp_confirmation: 'Confirmación por WhatsApp',
  mercadopago: 'Cobros con MercadoPago',
  calendar: 'Calendario de turnos',
  customers: 'Gestión de clientes',
  reports: 'Reportes avanzados',
  basic_reports: 'Reportes básicos',
  advanced_reports: 'Reportes avanzados',
  complete_reports: 'Reportes completos + exportación',
  priority_support: 'Soporte prioritario 24/7',
  whatsapp_support: 'Soporte por WhatsApp',
  email_reminder: 'Recordatorios por email',
  email_reminders: 'Recordatorios por email',
  sms: 'Notificaciones SMS',
  multi_branch: 'Multi-sucursal',
  api_access: 'Acceso API para integraciones',
  ficha_paciente: 'Ficha clínica del paciente',
  videollamada: 'Videollamadas (Zoom / Meet)',
  finance_module: 'Módulo de finanzas',
  employee_portal: 'Portal de empleados',
  employee_portal_advanced: 'Portal empleados avanzado',
  seo_custom: 'SEO personalizado',
  seo_rich_snippets: 'SEO Rich Snippets (Google)',
  stock_management: 'Control de stock',
  whatsapp_catalog: 'Catálogo por WhatsApp',
  online_payments: 'Pagos online',
  show_ads: 'Con publicidad',
  loyalty: 'Programa de fidelización',
  intake_forms: 'Formularios de ingreso',
  ecommerce_cart: 'Carrito de compras',
  coupons: 'Cupones de descuento',
  shipping: 'Gestión de envíos',
  seo_product: 'SEO para productos',
};

// Features que vienen en TODOS los planes — se muestran aparte como baseline
const BASE_FEATURES = new Set([
  'whatsapp_confirmation',
  'email_reminder',
  'calendar',
]);

// Features negativas que se muestran con estilo diferente
const NEGATIVE_FEATURES = new Set(['show_ads']);

// Obtener solo las features diferenciales de un plan (sin las base)
function getDifferentialFeatures(features: string[]): string[] {
  return features.filter(f => !BASE_FEATURES.has(f));
}

interface UsageData {
  branches: { current: number; limit: number | null };
  employees: { current: number; limit: number | null };
  services: { current: number; limit: number | null };
  bookings: { current: number; limit: number | null };
  customers: { current: number; limit: number | null };
}

const INDUSTRY_ICONS: Record<string, string> = {
  belleza: '💇',
  salud: '🏥',
  deportes: '⚽',
  hospedaje: '🏨',
  alquiler: '🔑',
  espacios: '🏢',
  profesionales: '👨‍⚕️',
};

const SUBSCRIPTION_FAQ = [
  {
    q: '¿Cómo cambio de plan?',
    a: 'Elegí el plan que quieras en la pestaña "Planes disponibles". Si es un plan de pago, se te redirigirá a Mercado Pago para autorizar el débito automático. El cambio se aplica inmediatamente.',
  },
  {
    q: '¿Qué pasa si no pago a tiempo?',
    a: 'Tu suscripción pasa a estado "Pago Pendiente". Seguís teniendo acceso a tus datos, pero las funciones premium se desactivan hasta que regularices el pago.',
  },
  {
    q: '¿Puedo cancelar en cualquier momento?',
    a: 'Sí. Tu plan sigue activo hasta el fin del período facturado. Después, pasás automáticamente al plan Gratis sin perder tus datos.',
  },
  {
    q: '¿Cómo funciona la prueba gratis?',
    a: 'Los planes de pago incluyen 14 días de prueba gratuita con todas las funciones. No necesitás tarjeta de crédito para empezar.',
  },
  {
    q: '¿Qué métodos de pago aceptan?',
    a: 'Tarjetas de crédito/débito y dinero en cuenta de Mercado Pago. Los pagos son recurrentes y se debitan automáticamente.',
  },
  {
    q: '¿Puedo cambiar de mensual a anual?',
    a: 'Sí. Al suscribirte o renovar elegís mensual o anual. El plan anual tiene descuento.',
  },
  {
    q: '¿Pierdo mis datos si bajo de plan?',
    a: 'No. Si bajás a un plan con límites menores, tus datos se conservan pero no podrás agregar nuevos hasta estar dentro del límite.',
  },
  {
    q: '¿Cómo contacto soporte?',
    a: 'Por WhatsApp o email a soporte@turnolink.com.ar. Respondemos de lunes a viernes de 9 a 18hs (Argentina).',
  },
];

export default function MiSuscripcionPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const terms = useRubroTerms();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [changingPlan, setChangingPlan] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [showPayments, setShowPayments] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'plan' | 'planes' | 'faq'>('plan');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [paymentPlan, setPaymentPlan] = useState<Plan | null>(null);
  const paymentPanelRef = useRef<HTMLDivElement>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoResult, setPromoResult] = useState<{
    valid: boolean;
    discountPercent: number;
    plan: { name: string; slug: string };
    originalPrice: number;
    discountAmount: number;
    finalPrice: number;
    requiresPayment: boolean;
  } | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.turnolink.com.ar';

  // Group plans by industry
  const industryGroups = useMemo(() => {
    const groups: Record<string, { name: string; slug: string; plans: Plan[] }> = {};
    plans.forEach((plan) => {
      const slug = plan.industryGroup?.slug || 'general';
      const name = plan.industryGroup?.name || 'General';
      if (!groups[slug]) groups[slug] = { name, slug, plans: [] };
      groups[slug].plans.push(plan);
    });
    return groups;
  }, [plans]);

  const hasMultipleGroups = Object.keys(industryGroups).length > 1;

  // Plans to display (filtered by group if needed)
  const visiblePlans = useMemo(() => {
    if (!hasMultipleGroups) return plans;
    if (selectedGroup) return industryGroups[selectedGroup]?.plans || [];
    // Default to user's industry group or first available
    const userGroup = subscription?.plan?.industryGroup?.slug;
    if (userGroup && industryGroups[userGroup]) return industryGroups[userGroup].plans;
    return Object.values(industryGroups)[0]?.plans || [];
  }, [plans, selectedGroup, hasMultipleGroups, industryGroups, subscription]);

  // Set default selected group based on user's subscription
  useEffect(() => {
    if (subscription?.plan?.industryGroup?.slug && hasMultipleGroups && !selectedGroup) {
      setSelectedGroup(subscription.plan.industryGroup.slug);
    }
  }, [subscription, hasMultipleGroups]);

  // Open the payment panel and scroll to it
  const openPaymentPanel = (plan: Plan, period?: 'MONTHLY' | 'YEARLY') => {
    if (period) setBillingPeriod(period);
    setPaymentPlan(plan);
    setTimeout(() => {
      paymentPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  useEffect(() => {
    const paymentStatus = searchParams.get('payment') || searchParams.get('subscription');
    if (paymentStatus === 'success') {
      toast({ title: '¡Pago exitoso!', description: 'Tu suscripción ha sido activada correctamente.' });
      window.history.replaceState({}, '', '/mi-suscripcion');
    } else if (paymentStatus === 'failure') {
      toast({ title: 'Pago fallido', description: 'No se pudo procesar el pago. Intenta de nuevo.', variant: 'destructive' });
      window.history.replaceState({}, '', '/mi-suscripcion');
    } else if (paymentStatus === 'pending') {
      toast({ title: 'Pago pendiente', description: 'Tu pago está siendo procesado.' });
      window.history.replaceState({}, '', '/mi-suscripcion');
    }
  }, [searchParams, toast]);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.accessToken) return;
      try {
        const subResponse = await fetch(`${baseUrl}/api/subscriptions`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });

        if (subResponse.ok) {
          const subData = await subResponse.json();
          setSubscription(subData);

          const groupSlug = subData?.plan?.industryGroup?.slug;
          const plansUrl = groupSlug
            ? `${baseUrl}/api/plans?industryGroup=${groupSlug}`
            : `${baseUrl}/api/plans`;
          const plansResponse = await fetch(plansUrl);
          if (plansResponse.ok) setPlans(await plansResponse.json());

          fetchUsageData();
          fetchPayments();
        } else {
          const plansResponse = await fetch(`${baseUrl}/api/plans`);
          if (plansResponse.ok) setPlans(await plansResponse.json());
          setActiveTab('planes');
        }
      } catch (error) {
        handleApiError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session?.accessToken]);

  const fetchUsageData = async () => {
    if (!session?.accessToken) return;
    try {
      const resources = ['branches', 'employees', 'services', 'bookings', 'customers'];
      const results = await Promise.all(
        resources.map(async (resource) => {
          const response = await fetch(`${baseUrl}/api/subscriptions/limits/${resource}`, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          });
          if (response.ok) return { [resource]: await response.json() };
          return { [resource]: { current: 0, limit: null } };
        })
      );
      setUsage(results.reduce((acc, curr) => ({ ...acc, ...curr }), {}) as UsageData);
    } catch (error) {
      handleApiError(error);
    }
  };

  const fetchPayments = async () => {
    if (!session?.accessToken) return;
    try {
      const response = await fetch(`${baseUrl}/api/subscriptions/payments`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      if (response.ok) setPayments(await response.json());
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleChangePlan = async (planSlug: string) => {
    if (!session?.accessToken) return;
    setChangingPlan(planSlug);
    try {
      const response = await fetch(`${baseUrl}/api/subscriptions/change-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` },
        body: JSON.stringify({ planSlug }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.action === 'needs_payment') {
          handlePayment(planSlug);
          return;
        }
        setSubscription(data.subscription);
        setActiveTab('plan');
        toast({ title: 'Plan actualizado', description: data.message });
        fetchUsageData();
      } else {
        const err = await response.json().catch(() => ({}));
        toast({ title: 'Error', description: err.message || 'No se pudo cambiar el plan.', variant: 'destructive' });
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setChangingPlan(null);
    }
  };

  const handlePayment = async (planSlug: string) => {
    if (!session?.accessToken) return;
    setProcessingPayment(true);
    setChangingPlan(planSlug);

    try {
      const response = await fetch(`${baseUrl}/api/subscriptions/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` },
        body: JSON.stringify({ planSlug, billingPeriod }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.initPoint) {
          // On mobile, try to open MercadoPago app first for better UX
          const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
          if (isMobile) {
            // Extract preapproval ID from initPoint URL to build app deep link
            const url = new URL(data.initPoint);
            const preapprovalId = url.searchParams.get('preapproval_id') || data.preapprovalId;
            if (preapprovalId) {
              // Try app scheme — falls back to web after timeout
              const appUrl = `mercadopago://subscriptions/checkout?preapproval_id=${preapprovalId}`;
              const webFallback = setTimeout(() => {
                window.location.href = data.initPoint;
              }, 1500);
              window.location.href = appUrl;
              // If app opens, clear the fallback
              window.addEventListener('blur', () => clearTimeout(webFallback), { once: true });
              return;
            }
          }
          window.location.href = data.initPoint;
        }
      } else {
        const error = await response.json();
        toast({ title: 'Error', description: error.message || 'No se pudo procesar el pago.', variant: 'destructive' });
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setProcessingPayment(false);
      setChangingPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!session?.accessToken) return;
    setCancelling(true);
    try {
      const response = await fetch(`${baseUrl}/api/subscriptions/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` },
      });

      if (response.ok) {
        setSubscription(await response.json());
        setShowCancelConfirm(false);
        toast({ title: 'Suscripción cancelada', description: 'Seguís usando el servicio hasta fin de período.' });
      } else {
        toast({ title: 'Error', description: 'No se pudo cancelar.', variant: 'destructive' });
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setCancelling(false);
    }
  };

  const handleValidatePromo = async () => {
    if (!session?.accessToken || !promoCode.trim()) return;
    setPromoLoading(true);
    setPromoResult(null);
    try {
      const response = await fetch(`${baseUrl}/api/subscriptions/promo-code/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` },
        body: JSON.stringify({ code: promoCode.trim() }),
      });
      if (response.ok) {
        setPromoResult(await response.json());
      } else {
        const error = await response.json();
        toast({ title: 'Código inválido', description: error.message || 'El código no es válido.', variant: 'destructive' });
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRedeemPromo = async () => {
    if (!session?.accessToken || !promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/subscriptions/promo-code/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` },
        body: JSON.stringify({ code: promoCode.trim() }),
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: '¡Código aplicado!', description: data.message });
        setPromoCode('');
        setPromoResult(null);
        // Reload subscription data
        const subResponse = await fetch(`${baseUrl}/api/subscriptions`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        if (subResponse.ok) setSubscription(await subResponse.json());

        if (data.requiresPayment) {
          // Redirect to payment for the remainder
          handlePayment(data.planSlug);
        }
      } else {
        toast({ title: 'Error', description: data.message || 'No se pudo aplicar el código.', variant: 'destructive' });
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setPromoLoading(false);
    }
  };

  const getFeatureName = (f: string) => featureNames[f] || f;

  const getDaysRemaining = (endDate: string) => Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000));

  const isCurrentPlan = (planSlug: string) => subscription?.plan.slug === planSlug;
  const isFree = (plan: { priceMonthly: string | number }) => Number(plan.priceMonthly) === 0;
  const isPaid = (plan: { priceMonthly: string | number }) => Number(plan.priceMonthly) > 0;

  const getPlanAction = (plan: Plan) => {
    if (isCurrentPlan(plan.slug)) return { label: 'Tu plan actual', disabled: true, style: 'current' as const };
    if (!subscription) {
      if (isFree(plan)) return { label: 'Comenzar gratis', disabled: false, style: 'free' as const };
      return { label: 'Probar 14 días gratis', disabled: false, style: 'upgrade' as const };
    }
    if (isFree(plan)) return { label: 'Cambiar a Gratis', disabled: false, style: 'free' as const };
    const currentPrice = Number(subscription.plan.priceMonthly);
    const targetPrice = Number(plan.priceMonthly);
    if (targetPrice > currentPrice) return { label: 'Mejorar plan', disabled: false, style: 'upgrade' as const };
    return { label: 'Cambiar plan', disabled: false, style: 'free' as const };
  };

  const usageItems = useMemo(() => {
    if (!subscription) return [];
    const ll = subscription.plan.industryGroup?.limitLabels || {};
    const getLabel = (field: string, fallback: string) => {
      const l = ll[field];
      return l === undefined ? fallback : l;
    };
    return [
      { key: 'bookings', icon: Calendar, label: getLabel('maxBookingsMonth', 'Turnos/Mes'), max: subscription.plan.maxBookingsMonth },
      { key: 'branches', icon: Building2, label: getLabel('maxBranches', 'Sucursales'), max: subscription.plan.maxBranches },
      { key: 'employees', icon: Users, label: getLabel('maxEmployees', 'Empleados'), max: subscription.plan.maxEmployees },
      { key: 'services', icon: Scissors, label: getLabel('maxServices', 'Servicios'), max: subscription.plan.maxServices },
      { key: 'customers', icon: UserCheck, label: getLabel('maxCustomers', 'Clientes'), max: subscription.plan.maxCustomers },
      { key: 'photos', icon: ImageIcon, label: getLabel('maxPhotos', 'Fotos'), max: subscription.plan.maxPhotos },
    ].filter(item => item.label !== null);
  }, [subscription]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-sm text-muted-foreground">Cargando tu suscripción...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mi Suscripción</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Administrá tu plan, facturación y pagos
          </p>
        </div>
        {subscription && (
          <StatusBadge status={subscription.status} />
        )}
      </div>

      {/* Navigation tabs */}
      <nav className="border-b">
        <div className="flex gap-0">
          {subscription && (
            <TabButton active={activeTab === 'plan'} onClick={() => setActiveTab('plan')}>
              Mi plan
            </TabButton>
          )}
          <TabButton active={activeTab === 'planes'} onClick={() => setActiveTab('planes')}>
            Planes disponibles
          </TabButton>
          <TabButton active={activeTab === 'faq'} onClick={() => setActiveTab('faq')}>
            Ayuda
          </TabButton>
        </div>
      </nav>

      {/* ============ TAB: MI PLAN ============ */}
      {activeTab === 'plan' && subscription && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Current plan hero card */}
          <div className="relative overflow-hidden bg-card rounded-2xl border">
            {/* Decorative gradient bar */}
            <div className={cn(
              'h-1.5 w-full',
              isFree(subscription.plan)
                ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                : 'bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500'
            )} />

            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg',
                    isFree(subscription.plan)
                      ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                      : 'bg-gradient-to-br from-brand-500 to-purple-600'
                  )}>
                    <Crown className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{subscription.plan.name}</h2>
                    </div>
                    {subscription.plan.industryGroup && (
                      <p className="text-sm text-muted-foreground">
                        {INDUSTRY_ICONS[subscription.plan.industryGroup.slug] || '📋'} {subscription.plan.industryGroup.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  {isPaid(subscription.plan) ? (
                    <>
                      <div className="text-3xl font-bold tracking-tight">
                        {subscription.billingPeriod === 'YEARLY' ? (
                          <>
                            ${Number(subscription.plan.priceYearly).toLocaleString()}
                            <span className="text-base font-normal text-muted-foreground">/año</span>
                          </>
                        ) : (
                          <>
                            ${Number(subscription.plan.priceMonthly).toLocaleString()}
                            <span className="text-base font-normal text-muted-foreground">/mes</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {subscription.billingPeriod === 'YEARLY'
                          ? `$${Math.round(Number(subscription.plan.priceYearly) / 12).toLocaleString()}/mes`
                          : Number(subscription.plan.priceYearly) > 0
                            ? `o $${Number(subscription.plan.priceYearly).toLocaleString()}/año`
                            : ''}
                      </p>
                    </>
                  ) : (
                    <div className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                      Gratis
                    </div>
                  )}
                </div>
              </div>

              {/* Status alerts */}
              {subscription.status === 'TRIALING' && subscription.trialEndAt && (
                <Alert variant="info" className="mt-5">
                  <Clock className="h-4 w-4" />
                  <span>
                    Tu prueba gratis termina en <strong>{getDaysRemaining(subscription.trialEndAt)} días</strong>.
                    {isPaid(subscription.plan) && ' Activá tu suscripción para continuar.'}
                  </span>
                </Alert>
              )}

              {subscription.status === 'ACTIVE' && isPaid(subscription.plan) && (
                <p className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Próximo cobro: {new Date(subscription.currentPeriodEnd).toLocaleDateString('es-AR')}
                </p>
              )}

              {subscription.status === 'PAST_DUE' && (
                <div className="mt-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                        Pago pendiente
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        Completá el pago para mantener tus funciones activas.
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        <BillingToggle value={billingPeriod} onChange={setBillingPeriod} compact />
                        <Button
                          size="sm"
                          onClick={() => handlePayment(subscription.plan.slug)}
                          disabled={processingPayment}
                          className="bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600 text-white"
                        >
                          {processingPayment ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
                          Pagar ${billingPeriod === 'MONTHLY' ? Number(subscription.plan.priceMonthly).toLocaleString() : Number(subscription.plan.priceYearly).toLocaleString()}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {subscription.status === 'CANCELLED' && (
                <Alert variant="danger" className="mt-5">
                  <AlertCircle className="h-4 w-4" />
                  <div>
                    <span>Suscripción cancelada. Tu acceso continúa hasta el {new Date(subscription.currentPeriodEnd).toLocaleDateString('es-AR')}.</span>
                    <Button size="sm" variant="outline" className="ml-3" onClick={() => setActiveTab('planes')}>
                      <RefreshCw className="h-3 w-3 mr-1" /> Reactivar
                    </Button>
                  </div>
                </Alert>
              )}
            </div>
          </div>

          {/* Promo code section */}
          <div className="bg-card rounded-2xl border p-6">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
              <Tag className="h-4 w-4 text-brand-500" />
              Código promocional
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              ¿Tenés un código promocional? Ingresalo para obtener un descuento en tu plan.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoResult(null); }}
                placeholder="Ej: TURNO100"
                className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                onKeyDown={(e) => e.key === 'Enter' && handleValidatePromo()}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleValidatePromo}
                disabled={promoLoading || !promoCode.trim()}
                className="shrink-0"
              >
                {promoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Validar'}
              </Button>
            </div>

            {promoResult && (
              <div className="mt-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-start gap-3">
                  <Gift className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                      ¡Código válido! — {promoResult.discountPercent}% de descuento
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                      Plan <strong>{promoResult.plan.name}</strong>: <span className="line-through">${promoResult.originalPrice.toLocaleString('es-AR')}</span>{' '}
                      {promoResult.finalPrice > 0 ? (
                        <span className="font-bold">${promoResult.finalPrice.toLocaleString('es-AR')}/mes</span>
                      ) : (
                        <span className="font-bold">¡Gratis!</span>
                      )}
                    </p>
                    {promoResult.requiresPayment && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                        Se te redirigirá a Mercado Pago para abonar el saldo restante.
                      </p>
                    )}
                    <Button
                      size="sm"
                      onClick={handleRedeemPromo}
                      disabled={promoLoading}
                      className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {promoLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                      Aplicar código
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Usage grid */}
          <div className="bg-card rounded-2xl border p-6">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-brand-500" />
              Uso de tu plan
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {usageItems.map(({ key, icon: Icon, label, max }) => {
                const current = usage?.[key as keyof UsageData]?.current ?? 0;
                const limit = max ?? null;
                const percentage = limit ? Math.min((current / limit) * 100, 100) : 0;
                const isNearLimit = limit !== null && percentage >= 80;
                const isAtLimit = limit !== null && current >= limit;

                return (
                  <div
                    key={key}
                    className={cn(
                      'relative p-3.5 rounded-xl border transition-all',
                      isAtLimit
                        ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
                        : isNearLimit
                        ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900'
                        : 'bg-muted/30 border-transparent hover:border-border'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={cn(
                        'h-8 w-8 rounded-lg flex items-center justify-center',
                        isAtLimit
                          ? 'bg-red-100 dark:bg-red-900/30'
                          : isNearLimit
                          ? 'bg-amber-100 dark:bg-amber-900/30'
                          : 'bg-muted'
                      )}>
                        <Icon className={cn(
                          'h-4 w-4',
                          isAtLimit ? 'text-red-600 dark:text-red-400'
                            : isNearLimit ? 'text-amber-600 dark:text-amber-400'
                            : 'text-muted-foreground'
                        )} />
                      </div>
                      {isAtLimit && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={cn(
                        'text-2xl font-bold tabular-nums',
                        isAtLimit ? 'text-red-600 dark:text-red-400' : ''
                      )}>
                        {current}
                      </span>
                      <span className="text-xs text-muted-foreground">/ {limit ?? '∞'}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{label}</p>
                    {limit !== null && (
                      <div className="h-1 bg-muted rounded-full overflow-hidden mt-2.5">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-brand-500'
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
          <div className="bg-card rounded-2xl border p-6">
            <h3 className="font-semibold text-sm mb-3">Incluido en tu plan</h3>
            <div className="flex flex-wrap gap-2">
              {(subscription.plan.features || []).map((feature, idx) => (
                <span
                  key={idx}
                  className={cn(
                    'inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border',
                    NEGATIVE_FEATURES.has(feature)
                      ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900'
                      : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                  )}
                >
                  {NEGATIVE_FEATURES.has(feature)
                    ? <AlertCircle className="h-3 w-3" />
                    : <Check className="h-3 w-3" />
                  }
                  {getFeatureName(feature)}
                </span>
              ))}
            </div>
          </div>

          {/* Payment CTA for trial */}
          {subscription.status === 'TRIALING' && isPaid(subscription.plan) && (
            <div className="bg-gradient-to-r from-brand-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h4 className="font-bold text-lg">Activá tu suscripción</h4>
                  <p className="text-white/80 text-sm mt-1">
                    Elegí tu forma de pago para continuar después de la prueba.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <BillingToggle value={billingPeriod} onChange={setBillingPeriod} light />
                  <Button
                    onClick={() => handlePayment(subscription.plan.slug)}
                    disabled={processingPayment}
                    className="bg-white text-brand-700 hover:bg-white/90 shadow-lg"
                  >
                    {processingPayment ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
                    Pagar con MercadoPago
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Upgrade CTA for free plans */}
          {isFree(subscription.plan) && (
            <div className="bg-gradient-to-r from-brand-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
              <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-6 w-6 text-white/80 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-lg">Desbloqueá todo el potencial</h4>
                    <p className="text-white/80 text-sm mt-1">
                      Turnos ilimitados, finanzas, cobros con MercadoPago, portal de empleados y más.
                    </p>
                    <p className="text-white/60 text-xs mt-1 flex items-center gap-1">
                      <Gift className="h-3 w-3" />
                      14 días gratis para probar — sin compromiso
                    </p>
                  </div>
                </div>
                <Button
                  className="bg-white text-brand-700 hover:bg-white/90 shadow-lg flex-shrink-0"
                  onClick={() => setActiveTab('planes')}
                >
                  Ver planes
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Payment History */}
          {payments.length > 0 && (
            <div className="bg-card rounded-2xl border">
              <button
                onClick={() => setShowPayments(!showPayments)}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full p-5"
              >
                <History className="h-4 w-4" />
                Historial de pagos ({payments.length})
                <ChevronDown className={cn('h-4 w-4 ml-auto transition-transform', showPayments && 'rotate-180')} />
              </button>

              {showPayments && (
                <div className="px-5 pb-5 space-y-2 border-t pt-3">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                          <Receipt className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">${Number(payment.amount).toLocaleString()} {payment.currency}</p>
                          <p className="text-xs text-muted-foreground">
                            {(payment.paidAt ? new Date(payment.paidAt) : new Date(payment.createdAt)).toLocaleDateString('es-AR')}
                          </p>
                        </div>
                      </div>
                      <PaymentStatusBadge status={payment.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cancel */}
          {subscription.status === 'ACTIVE' && isPaid(subscription.plan) && (
            <div className="pt-2">
              {!showCancelConfirm ? (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
                >
                  Cancelar suscripción
                </button>
              ) : (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-red-900 dark:text-red-100">¿Seguro que querés cancelar?</h4>
                      <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                        Tu plan sigue activo hasta el {new Date(subscription.currentPeriodEnd).toLocaleDateString('es-AR')}. Después pasás al plan Gratis.
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button variant="destructive" size="sm" onClick={handleCancelSubscription} disabled={cancelling}>
                          {cancelling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                          Sí, cancelar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setShowCancelConfirm(false)} disabled={cancelling}>
                          Mantener
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============ TAB: PLANES ============ */}
      {activeTab === 'planes' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Industry group selector (when multiple groups) */}
          {hasMultipleGroups && (
            <div>
              <p className="text-sm font-medium mb-2 text-muted-foreground">Seleccioná tu industria</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(industryGroups).map(([slug, group]) => (
                  <button
                    key={slug}
                    onClick={() => setSelectedGroup(slug)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
                      (selectedGroup || subscription?.plan?.industryGroup?.slug || Object.keys(industryGroups)[0]) === slug
                        ? 'bg-brand-50 dark:bg-brand-950/30 border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-300 shadow-sm'
                        : 'bg-card border-border text-muted-foreground hover:border-brand-200 dark:hover:border-brand-800 hover:text-foreground'
                    )}
                  >
                    <span className="text-base">{INDUSTRY_ICONS[slug] || '📋'}</span>
                    {group.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <h2 className="text-lg font-semibold">
              {hasMultipleGroups
                ? industryGroups[selectedGroup || subscription?.plan?.industryGroup?.slug || Object.keys(industryGroups)[0]]?.name || 'Planes'
                : 'Planes disponibles'}
            </h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Check className="h-3 w-3 text-emerald-500" />
              Todos los planes incluyen: confirmación WhatsApp, recordatorios y calendario
            </p>
          </div>

          {/* Plans grid */}
          <div className={cn(
            'grid gap-4',
            visiblePlans.length <= 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'
          )}>
            {visiblePlans.map((plan, planIndex) => {
              const isCurrent = isCurrentPlan(plan.slug);
              const action = getPlanAction(plan);
              const planIsFree = isFree(plan);
              const isChanging = changingPlan === plan.slug;
              const hasYearly = Number(plan.priceYearly) > 0;
              const monthlyFromYearly = hasYearly ? Math.round(Number(plan.priceYearly) / 12) : 0;
              const savingsPercent = hasYearly && Number(plan.priceMonthly) > 0
                ? Math.round((1 - monthlyFromYearly / Number(plan.priceMonthly)) * 100)
                : 0;
              const diffFeatures = getDifferentialFeatures(plan.features || []);
              // Label for tier progression
              const prevPlanName = planIndex > 0 ? visiblePlans[planIndex - 1].name : null;

              return (
                <div
                  key={plan.id}
                  className={cn(
                    'relative bg-card rounded-2xl border flex flex-col transition-all',
                    isCurrent && 'ring-2 ring-brand-500 border-brand-500 shadow-lg shadow-brand-500/10',
                    plan.isPopular && !isCurrent && 'border-purple-300 dark:border-purple-700 shadow-md shadow-purple-500/5',
                    !isCurrent && !plan.isPopular && 'hover:shadow-md hover:border-muted-foreground/20'
                  )}
                >
                  {/* Top accent */}
                  {plan.isPopular && !isCurrent && (
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold text-center py-1 rounded-t-2xl tracking-wide uppercase">
                      Más elegido
                    </div>
                  )}
                  {isCurrent && (
                    <div className="bg-gradient-to-r from-brand-500 to-purple-500 text-white text-[10px] font-bold text-center py-1 rounded-t-2xl tracking-wide uppercase">
                      Tu plan actual
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    {/* Header */}
                    <div className="mb-1">
                      <h3 className="font-bold text-lg">{plan.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{plan.description}</p>

                    {/* Price */}
                    <div className="mt-4 mb-5">
                      {planIsFree ? (
                        <div>
                          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">Gratis</div>
                          <p className="text-xs text-muted-foreground mt-1">Para siempre, sin tarjeta</p>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-3xl font-bold tracking-tight">
                              ${Number(plan.priceMonthly).toLocaleString()}
                            </span>
                            <span className="text-sm text-muted-foreground ml-0.5">/mes</span>
                          </div>
                          {hasYearly && savingsPercent > 0 && (
                            <p className="text-xs mt-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              o ${Number(plan.priceYearly).toLocaleString()}/año
                              <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                                Ahorrás {savingsPercent}%
                              </span>
                            </p>
                          )}
                          <p className="text-[11px] text-brand-600 dark:text-brand-400 font-medium mt-2 flex items-center gap-1">
                            <Gift className="h-3 w-3" />
                            14 días gratis para probar
                          </p>
                        </>
                      )}
                    </div>

                    {/* Action button */}
                    {isCurrent ? (
                      isPaid(plan) ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium py-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Plan activo
                            {subscription?.billingPeriod && (
                              <span className="text-muted-foreground font-normal">
                                — {subscription.billingPeriod === 'YEARLY' ? 'Anual' : 'Mensual'}
                              </span>
                            )}
                          </div>
                          {subscription?.billingPeriod === 'MONTHLY' && hasYearly && savingsPercent > 0 ? (
                            <Button
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                              size="sm"
                              disabled={!!changingPlan}
                              onClick={() => openPaymentPanel(plan, 'YEARLY')}
                            >
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Cambiar a anual — ahorrás {savingsPercent}%
                            </Button>
                          ) : subscription?.billingPeriod === 'YEARLY' ? (
                            <Button
                              className="w-full"
                              variant="outline"
                              size="sm"
                              disabled={!!changingPlan}
                              onClick={() => openPaymentPanel(plan, 'MONTHLY')}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Cambiar a mensual
                            </Button>
                          ) : null}
                        </div>
                      ) : (
                        <Button className="w-full opacity-60" variant="outline" disabled>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Tu plan actual
                        </Button>
                      )
                    ) : planIsFree ? (
                      <Button
                        className="w-full"
                        variant="outline"
                        disabled={isChanging || !!changingPlan}
                        onClick={() => handleChangePlan(plan.slug)}
                      >
                        {isChanging ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                        {action.label}
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600 text-white shadow-md h-11"
                        disabled={isChanging || !!changingPlan}
                        onClick={() => openPaymentPanel(plan)}
                      >
                        {isChanging ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                        Probar 14 días gratis
                      </Button>
                    )}

                    {/* Limits */}
                    <div className="space-y-2.5 mt-5 pt-4 border-t flex-1">
                      {prevPlanName && !planIsFree && (
                        <p className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wide mb-1">
                          Todo de {prevPlanName} +
                        </p>
                      )}

                      {[
                        { icon: Calendar, val: plan.maxBookingsMonth, label: `${terms.bookingPlural.toLowerCase()}/mes`, nullLabel: `${terms.bookingPlural} ilimitad${terms.bookingPlural.toLowerCase().endsWith('as') ? 'a' : 'o'}s` },
                        { icon: Building2, val: plan.maxBranches, label: plan.maxBranches === 1 ? 'sucursal' : 'sucursales', nullLabel: 'Sucursales ilimitadas' },
                        { icon: Users, val: plan.maxEmployees, label: plan.maxEmployees === 1 ? 'empleado' : 'empleados', nullLabel: 'Empleados ilimitados' },
                        { icon: Scissors, val: plan.maxServices, label: 'servicios', nullLabel: 'Servicios ilimitados' },
                      ].map(({ icon: LimitIcon, val, label, nullLabel }, i) => (
                        <div key={i} className="flex items-center gap-2.5 text-xs">
                          <div className="h-5 w-5 rounded-md bg-muted/60 flex items-center justify-center flex-shrink-0">
                            <LimitIcon className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <span className={cn(
                            val === null ? 'font-medium text-foreground' : 'text-muted-foreground'
                          )}>
                            {val === null ? nullLabel : `${val} ${label}`}
                          </span>
                        </div>
                      ))}

                      {diffFeatures.length > 0 && (
                        <div className="pt-2.5 mt-2.5 border-t space-y-2">
                          {diffFeatures.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              {NEGATIVE_FEATURES.has(f) ? (
                                <AlertCircle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                              ) : (
                                <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                              )}
                              <span className={cn(
                                NEGATIVE_FEATURES.has(f)
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-muted-foreground'
                              )}>
                                {getFeatureName(f)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment step — appears when user selects a paid plan */}
          {paymentPlan && (
            <div ref={paymentPanelRef} className="bg-card rounded-2xl border overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
              <div className="bg-gradient-to-r from-brand-500/10 via-purple-500/5 to-transparent dark:from-brand-500/20 dark:via-purple-500/10 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold">Suscribirse a {paymentPlan.name}</h3>
                      <p className="text-xs text-muted-foreground">Elegí tu forma de pago</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPaymentPlan(null)}
                    className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-5">
                <div className="grid sm:grid-cols-2 gap-3">
                  {/* Monthly option */}
                  <button
                    onClick={() => { setBillingPeriod('MONTHLY'); }}
                    className={cn(
                      'p-4 rounded-xl border-2 text-left transition-all',
                      billingPeriod === 'MONTHLY'
                        ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/15'
                        : 'border-border hover:border-muted-foreground/30'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn('text-sm font-semibold', billingPeriod === 'MONTHLY' && 'text-brand-600 dark:text-brand-400')}>Mensual</span>
                      <div className={cn(
                        'h-5 w-5 rounded-full border-2 flex items-center justify-center',
                        billingPeriod === 'MONTHLY' ? 'border-brand-500' : 'border-muted-foreground/30'
                      )}>
                        {billingPeriod === 'MONTHLY' && <div className="h-2.5 w-2.5 rounded-full bg-brand-500" />}
                      </div>
                    </div>
                    <div className="text-2xl font-bold">
                      ${Number(paymentPlan.priceMonthly).toLocaleString()}
                      <span className="text-sm font-normal text-muted-foreground">/mes</span>
                    </div>
                  </button>

                  {/* Annual option */}
                  {Number(paymentPlan.priceYearly) > 0 && (
                    <button
                      onClick={() => { setBillingPeriod('YEARLY'); }}
                      className={cn(
                        'p-4 rounded-xl border-2 text-left transition-all relative',
                        billingPeriod === 'YEARLY'
                          ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/15'
                          : 'border-border hover:border-muted-foreground/30'
                      )}
                    >
                      {(() => {
                        const savings = Math.round((1 - (Number(paymentPlan.priceYearly) / 12) / Number(paymentPlan.priceMonthly)) * 100);
                        return savings > 0 ? (
                          <span className="absolute -top-2.5 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                            Ahorrás {savings}%
                          </span>
                        ) : null;
                      })()}
                      <div className="flex items-center justify-between mb-2">
                        <span className={cn('text-sm font-semibold', billingPeriod === 'YEARLY' && 'text-brand-600 dark:text-brand-400')}>Anual</span>
                        <div className={cn(
                          'h-5 w-5 rounded-full border-2 flex items-center justify-center',
                          billingPeriod === 'YEARLY' ? 'border-brand-500' : 'border-muted-foreground/30'
                        )}>
                          {billingPeriod === 'YEARLY' && <div className="h-2.5 w-2.5 rounded-full bg-brand-500" />}
                        </div>
                      </div>
                      <div className="text-2xl font-bold">
                        ${Number(paymentPlan.priceYearly).toLocaleString()}
                        <span className="text-sm font-normal text-muted-foreground">/año</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        ${Math.round(Number(paymentPlan.priceYearly) / 12).toLocaleString()}/mes
                      </p>
                    </button>
                  )}
                </div>

                <Button
                  className="w-full mt-4 bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600 text-white shadow-md h-12"
                  disabled={processingPayment}
                  onClick={() => {
                    handleChangePlan(paymentPlan.slug);
                    setPaymentPlan(null);
                  }}
                >
                  {processingPayment ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <CreditCard className="h-5 w-5 mr-2" />
                  )}
                  Continuar con {billingPeriod === 'YEARLY' ? 'plan anual' : 'plan mensual'}
                </Button>

                <p className="text-[11px] text-muted-foreground text-center mt-3 flex items-center justify-center gap-1">
                  <Shield className="h-3 w-3" />
                  14 días de prueba gratis. Pago seguro con Mercado Pago. Cancelá cuando quieras.
                </p>
              </div>
            </div>
          )}

          {/* Trust signals */}
          {!paymentPlan && (
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 p-3.5 bg-muted/30 rounded-xl">
                <Gift className="h-5 w-5 text-brand-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold">14 días gratis</p>
                  <p className="text-[11px] text-muted-foreground">Sin tarjeta para empezar</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3.5 bg-muted/30 rounded-xl">
                <Shield className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold">Pago seguro</p>
                  <p className="text-[11px] text-muted-foreground">Con Mercado Pago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3.5 bg-muted/30 rounded-xl">
                <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold">Sin permanencia</p>
                  <p className="text-[11px] text-muted-foreground">Cancelá cuando quieras</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ TAB: FAQ ============ */}
      {activeTab === 'faq' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="space-y-2">
            {SUBSCRIPTION_FAQ.map((faq, index) => (
              <div
                key={index}
                className={cn(
                  'bg-card rounded-xl border overflow-hidden transition-all',
                  expandedFaq === index && 'ring-1 ring-brand-500/20 border-brand-200 dark:border-brand-800'
                )}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full p-4 text-left flex items-start justify-between gap-4 hover:bg-muted/30 transition-colors"
                >
                  <span className="font-medium text-sm">{faq.q}</span>
                  <ChevronDown className={cn(
                    'h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5 transition-transform',
                    expandedFaq === index && 'rotate-180 text-brand-500'
                  )} />
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed border-t pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="bg-card rounded-2xl border p-6">
            <h3 className="font-semibold text-sm mb-4">¿Necesitás más ayuda?</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <a
                href="https://wa.me/5491112345678"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl border hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all group"
              >
                <div className="h-11 w-11 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                  <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">WhatsApp</p>
                  <p className="text-xs text-muted-foreground">Respuesta inmediata</p>
                </div>
              </a>
              <a
                href="mailto:soporte@turnolink.com.ar"
                className="flex items-center gap-3 p-4 rounded-xl border hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-300 dark:hover:border-blue-800 transition-all group"
              >
                <div className="h-11 w-11 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Email</p>
                  <p className="text-xs text-muted-foreground">soporte@turnolink.com.ar</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ Sub-components ============ */

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: React.ElementType; label: string; className: string }> = {
    TRIALING: { icon: Clock, label: 'Prueba gratis', className: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
    ACTIVE: { icon: CheckCircle2, label: 'Activa', className: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    CANCELLED: { icon: XCircle, label: 'Cancelada', className: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' },
    EXPIRED: { icon: AlertCircle, label: 'Expirada', className: 'bg-gray-50 dark:bg-gray-950/30 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800' },
    PAST_DUE: { icon: AlertTriangle, label: 'Pago pendiente', className: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
  };
  const c = config[status] || config.EXPIRED;
  const Icon = c.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border', c.className)}>
      <Icon className="h-3.5 w-3.5" />
      {c.label}
    </span>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px',
        active
          ? 'border-brand-500 text-brand-600 dark:text-brand-400'
          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
      )}
    >
      {children}
    </button>
  );
}

function BillingToggle({ value, onChange, compact, light }: {
  value: 'MONTHLY' | 'YEARLY';
  onChange: (v: 'MONTHLY' | 'YEARLY') => void;
  compact?: boolean;
  light?: boolean;
}) {
  return (
    <div className={cn(
      'flex items-center gap-0.5 p-0.5 rounded-lg',
      light ? 'bg-white/20' : 'bg-muted/60 border'
    )}>
      <button
        onClick={() => onChange('MONTHLY')}
        className={cn(
          'rounded-md text-xs font-medium transition-all',
          compact ? 'px-2.5 py-1' : 'px-3 py-1.5',
          value === 'MONTHLY'
            ? light
              ? 'bg-white/30 text-white shadow-sm'
              : 'bg-background shadow-sm text-foreground'
            : light
              ? 'text-white/70 hover:text-white'
              : 'text-muted-foreground hover:text-foreground'
        )}
      >
        Mensual
      </button>
      <button
        onClick={() => onChange('YEARLY')}
        className={cn(
          'rounded-md text-xs font-medium transition-all',
          compact ? 'px-2.5 py-1' : 'px-3 py-1.5',
          value === 'YEARLY'
            ? light
              ? 'bg-white/30 text-white shadow-sm'
              : 'bg-background shadow-sm text-foreground'
            : light
              ? 'text-white/70 hover:text-white'
              : 'text-muted-foreground hover:text-foreground'
        )}
      >
        Anual
      </button>
    </div>
  );
}

function Alert({ variant, className, children }: { variant: 'info' | 'danger'; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn(
      'flex items-start gap-2.5 text-sm px-4 py-3 rounded-xl border',
      variant === 'info' && 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      variant === 'danger' && 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
      className,
    )}>
      {children}
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    APPROVED: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    PENDING: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    REJECTED: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
  };
  const labels: Record<string, string> = { APPROVED: 'Aprobado', PENDING: 'Pendiente', REJECTED: 'Rechazado' };
  return (
    <span className={cn('text-[10px] font-medium px-2 py-1 rounded-full border', styles[status] || styles.PENDING)}>
      {labels[status] || status}
    </span>
  );
}
