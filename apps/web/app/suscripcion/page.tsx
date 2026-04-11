'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Check,
  X,
  Sparkles,
  Zap,
  Shield,
  ArrowRight,
  Crown,
  Building2,
  Users,
  Calendar,
  MessageSquare,
  CreditCard,
  Clock,
  Star,
  Loader2,
  Scissors,
  UserCheck,
  Gift,
  ChevronDown,
  Timer,
  Lock,
  CheckCircle2,
  BadgeCheck,
  Rocket,
  Heart,
  ArrowDown,
  Minus,
  CircleDot,
  ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { LandingThemeWrapper, LandingThemeToggle } from '@/components/landing/landing-theme-wrapper';

interface IndustryGroup {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  limitLabels: Record<string, string | null>;
  _count?: { plans: number };
}

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number | null;
  currency: string;
  trialDays: number;
  maxBranches: number | null;
  maxEmployees: number | null;
  maxServices: number | null;
  maxBookingsMonth: number | null;
  maxCustomers: number | null;
  maxPhotos: number | null;
  features: string;
  isPopular: boolean;
  isActive: boolean;
  industryGroup?: IndustryGroup | null;
}

interface Subscription {
  id: string;
  status: string;
  billingPeriod: string;
  trialEndAt: string | null;
  currentPeriodEnd: string | null;
  plan: Plan;
}

// Feature slug display names
const FEATURE_NAMES: Record<string, string> = {
  whatsapp_confirmation: 'Confirmacion WhatsApp',
  email_reminder: 'Recordatorios email',
  email_reminders: 'Recordatorios email',
  calendar: 'Calendario completo',
  basic_reports: 'Reportes basicos',
  advanced_reports: 'Reportes avanzados',
  full_reports: 'Reportes completos',
  complete_reports: 'Reportes completos',
  mercadopago: 'Cobros MercadoPago',
  whatsapp_support: 'Soporte WhatsApp',
  priority_support: 'Soporte prioritario 24/7',
  custom_api: 'API personalizada',
  api_access: 'API personalizada',
  ficha_paciente: 'Ficha de paciente',
  videollamada: 'Videollamadas',
  multi_branch: 'Multi-sucursal',
  online_payments: 'Cobros online',
  custom_branding: 'Branding personalizado',
  sms_reminders: 'Recordatorios SMS',
  multi_calendar: 'Multi-calendario',
  inventory: 'Gestion de inventario',
  waitlist: 'Lista de espera',
  recurring_bookings: 'Reservas recurrentes',
  finance_module: 'Modulo de finanzas',
  employee_portal: 'Portal de empleados',
  employee_portal_advanced: 'Portal de empleados avanzado',
  seo_custom: 'SEO personalizado',
  seo_rich_snippets: 'SEO Rich Snippets',
  loyalty: 'Programa de fidelizacion',
  intake_forms: 'Formularios de ingreso',
  whatsapp_catalog: 'Catalogo por WhatsApp',
  show_ads: 'Con publicidad',
  deposit_payments: 'Cobro de seña',
  stock_management: 'Gestion de stock',
  seo_product: 'SEO de productos',
  ecommerce_cart: 'Carrito de compras',
  coupons: 'Cupones de descuento',
  shipping: 'Gestion de envios',
};

// Industry group icons
const GROUP_ICONS: Record<string, React.ElementType> = {
  belleza: Scissors,
  salud: Heart,
  deportes: Zap,
  'hospedaje-por-horas': Building2,
  'alquiler-temporario': Calendar,
  'espacios-flexibles': Users,
};

// FAQ - accurate for the current system
const FAQ_DATA = [
  {
    category: 'Planes y precios',
    questions: [
      {
        q: '¿Puedo cambiar de plan en cualquier momento?',
        a: 'Si, podes cambiar de plan cuando quieras. Si subis de plan, el cambio es inmediato y se prorratea el precio. Si bajas, el cambio aplica al siguiente periodo de facturacion.',
      },
      {
        q: '¿Hay contratos o permanencia minima?',
        a: 'No, todos nuestros planes son sin contrato. Podes cancelar en cualquier momento sin penalizacion ni costos ocultos.',
      },
      {
        q: '¿Que metodos de pago aceptan?',
        a: 'Aceptamos todas las tarjetas de credito y debito (Visa, Mastercard, American Express) a traves de Mercado Pago. Tambien podes pagar con dinero en cuenta de Mercado Pago.',
      },
      {
        q: '¿Los precios incluyen IVA?',
        a: 'Si, todos los precios mostrados son finales e incluyen IVA. No hay costos adicionales ni sorpresas.',
      },
      {
        q: '¿Los planes varian segun la industria?',
        a: 'Si, cada tipo de negocio tiene planes adaptados a sus necesidades. Por ejemplo, los consultorios de salud incluyen ficha de paciente y videollamadas, mientras que los deportes se enfocan en reservas de espacios. Selecciona tu tipo de negocio arriba para ver los planes que aplican.',
      },
    ],
  },
  {
    category: 'Prueba gratuita',
    questions: [
      {
        q: '¿Que incluye la prueba gratuita de 14 dias?',
        a: 'La prueba incluye acceso completo a todas las funcionalidades del plan que elijas. No se requiere tarjeta de credito y no se cobra nada durante el periodo de prueba.',
      },
      {
        q: '¿Que pasa cuando termina la prueba?',
        a: 'Te avisamos 3 dias antes de que termine. Si no activas un plan de pago, tu cuenta pasa automaticamente al plan Gratis con funciones limitadas (no perdes tus datos).',
      },
      {
        q: '¿El plan Gratis es realmente gratis para siempre?',
        a: 'Si, las industrias que tienen plan Gratis lo ofrecen de forma permanente, sin limite de tiempo. Ideal para negocios que estan empezando o para probar la plataforma sin compromiso.',
      },
    ],
  },
  {
    category: 'Funcionalidades',
    questions: [
      {
        q: '¿Como funcionan los cobros con Mercado Pago?',
        a: 'Conectas tu cuenta de Mercado Pago en la configuracion y listo. Podes cobrar senas del porcentaje que quieras cuando el cliente reserva. El dinero va directo a tu cuenta.',
      },
      {
        q: '¿Los recordatorios de WhatsApp tienen costo extra?',
        a: 'No, los recordatorios automaticos por WhatsApp estan incluidos en todos los planes sin costo adicional.',
      },
      {
        q: '¿Puedo personalizar mi pagina de reservas?',
        a: 'Si, podes personalizar colores, logo, descripcion, fotos y mucho mas. Tu pagina tendra tu propia URL personalizada para compartir con tus clientes.',
      },
    ],
  },
  {
    category: 'Soporte y garantia',
    questions: [
      {
        q: '¿Como funciona la garantia de 30 dias?',
        a: 'Si no estas satisfecho durante los primeros 30 dias despues de tu primer pago, te devolvemos el 100% de tu dinero. Sin preguntas, sin complicaciones.',
      },
      {
        q: '¿Que tipo de soporte ofrecen segun el plan?',
        a: 'El nivel de soporte depende de tu plan: los planes basicos incluyen soporte por email, los planes intermedios agregan soporte por WhatsApp con respuesta rapida, y los planes premium ofrecen soporte prioritario 24/7. Podes ver el detalle exacto en la comparacion de cada plan.',
      },
    ],
  },
];

export default function SuscripcionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [industryGroups, setIndustryGroups] = useState<IndustryGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  // Payment modal state
  const [paymentPlan, setPaymentPlan] = useState<Plan | null>(null);
  const [paymentBilling, setPaymentBilling] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    loadIndustryGroups();
    if (session?.accessToken) {
      loadSubscription();
    } else {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (selectedGroup) loadPlans(selectedGroup);
  }, [selectedGroup]);

  const loadIndustryGroups = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.turnolink.com.ar';
      const response = await fetch(`${baseUrl}/api/industry-groups`);
      if (response.ok) {
        const data = await response.json();
        setIndustryGroups(data);
        if (!selectedGroup) {
          if (subscription?.plan?.industryGroup) {
            setSelectedGroup((subscription.plan as any).industryGroup.slug);
          } else if (data.length > 0) {
            setSelectedGroup(data[0].slug);
          }
        }
      }
    } catch (error) {
      console.error('Error loading industry groups:', error);
    }
  };

  const loadPlans = async (groupSlug: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.turnolink.com.ar';
      const response = await fetch(`${baseUrl}/api/plans?industryGroup=${groupSlug}`);
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscription = async () => {
    if (!session?.accessToken) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.turnolink.com.ar';
      const response = await fetch(`${baseUrl}/api/subscriptions`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch {
      // No subscription
    }
  };

  const handleSelectPlan = async (planSlug: string) => {
    if (!session?.accessToken) {
      router.push(`/register?plan=${planSlug}`);
      return;
    }

    setSubscribing(planSlug);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.turnolink.com.ar';

      const response = await fetch(`${baseUrl}/api/subscriptions/change-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ planSlug }),
      });

      if (response.ok) {
        const data = await response.json();
        const { action, message } = data;

        if (action === 'needs_payment') {
          // Plan requires payment → open payment modal
          const targetPlan = plans.find(p => p.slug === planSlug);
          if (targetPlan) {
            setPaymentPlan(targetPlan);
            setPaymentBilling(billingPeriod);
            setSubscription(data.subscription);
          }
        } else if (action === 'already_on_plan') {
          toast({
            title: 'Sin cambios',
            description: message || 'Ya estas en este plan.',
          });
        } else {
          // created_free, created_trial, switched_free, started_trial
          toast({
            title: 'Plan actualizado',
            description: message,
          });
          router.push('/dashboard');
        }
      } else {
        const err = await response.json().catch(() => ({}));
        toast({
          title: 'Error',
          description: err.message || 'No se pudo cambiar el plan. Intenta de nuevo.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Error de conexion. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setSubscribing(null);
    }
  };

  const handlePayment = async () => {
    if (!session?.accessToken || !paymentPlan) return;
    setProcessingPayment(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.turnolink.com.ar';
      const response = await fetch(`${baseUrl}/api/subscriptions/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          planSlug: paymentPlan.slug,
          billingPeriod: paymentBilling,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.initPoint) {
          window.location.href = data.initPoint;
        }
      } else {
        const err = await response.json().catch(() => ({}));
        toast({
          title: 'Error',
          description: err.message || 'No se pudo iniciar el pago. Intenta de nuevo.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Error de conexion. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratis';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTrialDaysRemaining = () => {
    if (!subscription?.trialEndAt) return 0;
    const endDate = new Date(subscription.trialEndAt);
    const now = new Date();
    return Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  };

  // Get limit labels from selected group
  const selectedGroupData = industryGroups.find(g => g.slug === selectedGroup);
  const limitLabels: Record<string, string | null> = (() => {
    const raw = selectedGroupData?.limitLabels;
    if (!raw) return {};
    if (typeof raw === 'string') {
      try { return JSON.parse(raw); } catch { return {}; }
    }
    return raw;
  })();

  // Parse feature slugs from a plan
  const parseFeatures = (plan: Plan): string[] => {
    try {
      return Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features || '[]');
    } catch { return []; }
  };

  // Build limit items for a plan card
  const buildLimitItems = (plan: Plan) => {
    const ll = limitLabels;
    const items: { icon: React.ElementType; text: string; highlight: boolean }[] = [];

    const add = (val: number | null, labelKey: string, fallback: string, icon: React.ElementType) => {
      if (ll[labelKey] === null) return; // hidden by group config
      const label = ll[labelKey] !== undefined ? (ll[labelKey] || fallback) : fallback;
      if (val === null || val === -1) {
        items.push({ icon, text: `${label} ilimitados`, highlight: true });
      } else {
        items.push({ icon, text: `${val} ${label}`, highlight: false });
      }
    };

    add(plan.maxBookingsMonth, 'maxBookingsMonth', 'turnos/mes', Calendar);
    add(plan.maxBranches, 'maxBranches', 'sucursales', Building2);
    add(plan.maxEmployees, 'maxEmployees', 'empleados', Users);
    add(plan.maxServices, 'maxServices', 'servicios', Scissors);
    add(plan.maxCustomers, 'maxCustomers', 'clientes', UserCheck);
    add(plan.maxPhotos, 'maxPhotos', 'fotos', ImageIcon);

    return items;
  };

  // Build comparison rows from API plans
  type ComparisonRow = { label: string; values: (string | boolean)[] };

  const buildComparisonRows = (plansList: Plan[]): ComparisonRow[] => {
    const ll = limitLabels;
    const rows: ComparisonRow[] = [];

    // Quantitative limit rows
    const limitFields: { key: keyof Plan; labelKey: string; fallback: string }[] = [
      { key: 'maxBookingsMonth', labelKey: 'maxBookingsMonth', fallback: 'Turnos/mes' },
      { key: 'maxBranches', labelKey: 'maxBranches', fallback: 'Sucursales' },
      { key: 'maxEmployees', labelKey: 'maxEmployees', fallback: 'Empleados' },
      { key: 'maxServices', labelKey: 'maxServices', fallback: 'Servicios' },
      { key: 'maxCustomers', labelKey: 'maxCustomers', fallback: 'Clientes' },
      { key: 'maxPhotos', labelKey: 'maxPhotos', fallback: 'Fotos' },
    ];

    for (const field of limitFields) {
      if (ll[field.labelKey] === null) continue;
      const displayLabel = ll[field.labelKey] !== undefined
        ? (ll[field.labelKey] || field.fallback)
        : field.fallback;
      const label = displayLabel.charAt(0).toUpperCase() + displayLabel.slice(1);
      const values = plansList.map(p => {
        const val = p[field.key] as number | null;
        if (val === null || val === -1) return 'Ilimitados';
        return String(val);
      });
      rows.push({ label, values });
    }

    // Collect feature slugs per plan
    const allSlugs: string[] = [];
    const planFeatureSlugs = plansList.map(p => {
      const slugs = parseFeatures(p);
      slugs.forEach(s => { if (!allSlugs.includes(s)) allSlugs.push(s); });
      return slugs;
    });

    // Group report features into single row
    const reportSlugs = ['basic_reports', 'advanced_reports', 'full_reports', 'complete_reports'];
    const reportNames: Record<string, string> = {
      basic_reports: 'Basicos', advanced_reports: 'Avanzados',
      full_reports: 'Completos', complete_reports: 'Completos',
    };
    if (allSlugs.some(s => reportSlugs.includes(s))) {
      rows.push({
        label: 'Reportes',
        values: planFeatureSlugs.map(slugs => {
          const found = slugs.find(s => reportSlugs.includes(s));
          return found ? reportNames[found] || 'Si' : false;
        }),
      });
    }

    // Group support features into single row
    const supportSlugs = ['whatsapp_support', 'priority_support'];
    const supportNames: Record<string, string> = {
      whatsapp_support: 'WhatsApp', priority_support: 'Prioritario 24/7',
    };
    if (allSlugs.some(s => supportSlugs.includes(s))) {
      rows.push({
        label: 'Soporte',
        values: planFeatureSlugs.map(slugs => {
          const found = [...supportSlugs].reverse().find(s => slugs.includes(s));
          return found ? supportNames[found] || 'Si' : 'Email';
        }),
      });
    }

    // Remaining individual features
    const skipSlugs = [...reportSlugs, ...supportSlugs];
    for (const slug of allSlugs) {
      if (skipSlugs.includes(slug)) continue;
      rows.push({
        label: FEATURE_NAMES[slug] || slug,
        values: planFeatureSlugs.map(slugs => slugs.includes(slug)),
      });
    }

    return rows;
  };

  const comparisonRows = buildComparisonRows(plans);
  const isCurrentPlan = (planSlug: string) => subscription?.plan?.slug === planSlug;

  // Calculate yearly equivalent monthly price
  const getDisplayPrice = (plan: Plan) => {
    if (Number(plan.priceMonthly) === 0) return 0;
    if (billingPeriod === 'YEARLY' && plan.priceYearly) {
      return Math.round(Number(plan.priceYearly) / 12);
    }
    return Number(plan.priceMonthly);
  };

  const getYearlySavings = (plan: Plan) => {
    if (Number(plan.priceMonthly) === 0 || !plan.priceYearly) return 0;
    return Number(plan.priceMonthly) * 12 - Number(plan.priceYearly);
  };

  return (
    <LandingThemeWrapper>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2">
                <img src="/claro2.png" alt="TurnoLink" className="h-12 w-auto dark:hidden" />
                <img src="/oscuro2.png" alt="TurnoLink" className="h-12 w-auto hidden dark:block" />
              </Link>
              <div className="flex items-center gap-3">
                <LandingThemeToggle />
                {session ? (
                  <Link href="/dashboard">
                    <Button variant="outline">Ir al Dashboard</Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="hidden sm:block">
                      <Button variant="ghost">Iniciar Sesion</Button>
                    </Link>
                    <Link href="/register">
                      <Button className="bg-gradient-primary">Registrarse</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </header>

        {/* Current Subscription Banner */}
        {subscription && (
          <div className="bg-gradient-to-r from-brand-500 to-brand-600 text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                    {subscription.status === 'TRIALING' ? <Clock className="h-5 w-5" /> : <Crown className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {subscription.status === 'TRIALING' ? 'Periodo de prueba' : 'Suscripcion activa'}
                    </p>
                    <p className="text-sm text-white/80">
                      Plan {subscription.plan.name}
                      {subscription.status === 'TRIALING' && ` · ${getTrialDaysRemaining()} dias restantes`}
                    </p>
                  </div>
                </div>
                <Link href="/mi-suscripcion">
                  <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                    Gestionar suscripcion
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section className="pt-16 pb-8 md:pt-24 md:pb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-50/50 to-transparent dark:from-brand-950/20 pointer-events-none" />
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-brand-200/20 dark:bg-brand-800/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-40 right-1/4 w-64 h-64 bg-purple-200/20 dark:bg-purple-800/10 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-3xl mx-auto text-center">
              {/* Launch badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border border-amber-200 dark:border-amber-700 mb-8">
                <Gift className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                  Precios de lanzamiento · Oferta por tiempo limitado
                </span>
                <Timer className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Planes pensados{' '}
                <span className="text-gradient bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
                  para tu negocio
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Empieza gratis y escala cuando lo necesites. Sin contratos, sin sorpresas, sin comisiones por reserva.
              </p>

              {/* Trust signals */}
              <div className="flex flex-wrap justify-center gap-3 mb-10">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">30 dias de garantia</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <Lock className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Pago seguro con MercadoPago</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Activo en 5 minutos</span>
                </div>
              </div>

              {/* Industry Group Selector */}
              {industryGroups.length > 0 && (
                <div className="mb-8">
                  <p className="text-sm font-medium text-muted-foreground mb-4">
                    Selecciona tu tipo de negocio
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {industryGroups.map((group) => {
                      const GroupIcon = GROUP_ICONS[group.slug] || CircleDot;
                      return (
                        <button
                          key={group.slug}
                          onClick={() => setSelectedGroup(group.slug)}
                          className={cn(
                            'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all border',
                            selectedGroup === group.slug
                              ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/25'
                              : 'bg-background border-border text-muted-foreground hover:border-brand-300 hover:text-foreground'
                          )}
                        >
                          <GroupIcon className="h-4 w-4" />
                          {group.name}
                        </button>
                      );
                    })}
                  </div>
                  {selectedGroupData?.description && (
                    <p className="text-xs text-muted-foreground mt-3">
                      {selectedGroupData.description}
                    </p>
                  )}
                </div>
              )}

              {/* Billing Toggle */}
              <div className="inline-flex items-center gap-1 p-1.5 bg-muted rounded-full">
                <button
                  onClick={() => setBillingPeriod('MONTHLY')}
                  className={cn(
                    'px-6 py-2.5 rounded-full text-sm font-medium transition-all',
                    billingPeriod === 'MONTHLY'
                      ? 'bg-background shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Mensual
                </button>
                <button
                  onClick={() => setBillingPeriod('YEARLY')}
                  className={cn(
                    'px-6 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                    billingPeriod === 'YEARLY'
                      ? 'bg-background shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Anual
                  <span className="px-2 py-0.5 rounded-full bg-green-500 text-white text-xs font-bold">
                    Ahorra
                  </span>
                </button>
              </div>
              {billingPeriod === 'YEARLY' && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium">
                  Ahorras hasta 2 meses pagando anual
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Plans Grid */}
        <section className="pb-12 md:pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card rounded-2xl border p-8 animate-pulse">
                    <div className="h-14 w-14 rounded-2xl bg-muted mx-auto mb-4" />
                    <div className="h-6 w-32 bg-muted rounded mx-auto mb-2" />
                    <div className="h-4 w-48 bg-muted rounded mx-auto mb-6" />
                    <div className="h-12 w-40 bg-muted rounded mx-auto mb-6" />
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((j) => (
                        <div key={j} className="h-4 bg-muted rounded" />
                      ))}
                    </div>
                    <div className="h-12 bg-muted rounded-xl mt-6" />
                  </div>
                ))}
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-16">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Selecciona tu tipo de negocio</h3>
                <p className="text-muted-foreground">
                  Elegí una industria para ver los planes disponibles con precios adaptados.
                </p>
              </div>
            ) : (
              <div className={cn(
                "grid gap-6 lg:gap-8 max-w-6xl mx-auto",
                plans.length <= 2 ? "md:grid-cols-2 max-w-4xl" : "md:grid-cols-3"
              )}>
                {plans.map((plan) => {
                  const isFree = Number(plan.priceMonthly) === 0;
                  const displayPrice = getDisplayPrice(plan);
                  const yearlySavings = getYearlySavings(plan);
                  const limits = buildLimitItems(plan);
                  const featureSlugs = parseFeatures(plan);

                  return (
                    <div
                      key={plan.slug}
                      className={cn(
                        'relative bg-card rounded-2xl border-2 transition-all duration-300 hover:shadow-xl group',
                        plan.isPopular
                          ? 'border-brand-500 shadow-lg shadow-brand-500/15 md:scale-[1.03] z-10'
                          : 'border-border hover:border-brand-200'
                      )}
                    >
                      {plan.isPopular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <Badge className="bg-gradient-to-r from-brand-500 to-purple-500 text-white px-4 py-1.5 text-sm shadow-lg border-0">
                            <Star className="h-3.5 w-3.5 mr-1.5 fill-current" />
                            Mas elegido
                          </Badge>
                        </div>
                      )}

                      <div className="p-6 lg:p-8">
                        {/* Plan icon + name */}
                        <div className="text-center mb-6">
                          <div className={cn(
                            'mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-4',
                            isFree
                              ? 'bg-gray-100 dark:bg-gray-800'
                              : plan.isPopular
                                ? 'bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/25'
                                : 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/25'
                          )}>
                            {isFree ? (
                              <Gift className="h-7 w-7 text-gray-600 dark:text-gray-300" />
                            ) : plan.isPopular ? (
                              <Zap className="h-7 w-7 text-white" />
                            ) : (
                              <Crown className="h-7 w-7 text-white" />
                            )}
                          </div>
                          <h3 className="text-xl font-bold">{plan.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                        </div>

                        {/* Price */}
                        <div className="text-center mb-6">
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-4xl font-bold">
                              {isFree ? '$0' : formatPrice(displayPrice)}
                            </span>
                            <span className="text-muted-foreground">/mes</span>
                          </div>
                          {!isFree && billingPeriod === 'YEARLY' && yearlySavings > 0 && (
                            <p className="text-sm mt-1.5">
                              <span className="line-through text-muted-foreground">{formatPrice(Number(plan.priceMonthly))}</span>
                              <span className="text-green-600 dark:text-green-400 ml-2 font-medium">
                                Ahorras {formatPrice(yearlySavings)}/ano
                              </span>
                            </p>
                          )}
                          {!isFree && billingPeriod === 'YEARLY' && plan.priceYearly && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatPrice(Number(plan.priceYearly))} facturado anualmente
                            </p>
                          )}
                          {plan.trialDays > 0 && (
                            <p className="text-sm text-brand-600 dark:text-brand-400 mt-2 font-medium">
                              {plan.trialDays} dias de prueba gratis
                            </p>
                          )}
                        </div>

                        {/* CTA Button */}
                        <Button
                          onClick={() => !isCurrentPlan(plan.slug) && handleSelectPlan(plan.slug)}
                          disabled={subscribing === plan.slug || isCurrentPlan(plan.slug)}
                          className={cn(
                            'w-full h-12 text-base font-semibold transition-all mb-6',
                            isCurrentPlan(plan.slug)
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-700 cursor-default'
                              : plan.isPopular
                                ? 'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 shadow-lg shadow-brand-500/25 hover:shadow-xl'
                                : ''
                          )}
                          variant={isCurrentPlan(plan.slug) ? 'outline' : plan.isPopular ? 'default' : 'outline'}
                          size="lg"
                        >
                          {subscribing === plan.slug ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : isCurrentPlan(plan.slug) ? (
                            <>
                              <BadgeCheck className="mr-2 h-5 w-5" />
                              Plan actual
                            </>
                          ) : (
                            <>
                              {subscription
                                ? (isFree ? 'Cambiar a Gratis' : `Cambiar a ${plan.name}`)
                                : (isFree ? 'Empezar gratis' : 'Comenzar prueba gratis')
                              }
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                          )}
                        </Button>

                        {/* Divider */}
                        <div className="border-t mb-6" />

                        {/* Limits */}
                        <div className="space-y-3 mb-5">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Limites</p>
                          {limits.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <item.icon className={cn(
                                "h-4 w-4 flex-shrink-0",
                                item.highlight ? "text-brand-500" : "text-muted-foreground"
                              )} />
                              <span className={cn(
                                "text-sm",
                                item.highlight && "font-semibold text-brand-600 dark:text-brand-400"
                              )}>
                                {item.text}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Features */}
                        <div className="space-y-3">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Funcionalidades</p>
                          {featureSlugs.filter(s => s !== 'show_ads').map((slug, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm">{FEATURE_NAMES[slug] || slug}</span>
                            </div>
                          ))}
                        </div>

                        {!isFree && (
                          <p className="text-center text-xs text-muted-foreground mt-6">
                            Sin tarjeta de credito · Cancela cuando quieras
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Comparison Toggle */}
            {plans.length > 0 && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 hover:underline font-medium text-sm"
                >
                  {showComparison ? 'Ocultar comparacion detallada' : 'Comparar planes en detalle'}
                  <ChevronDown className={cn("h-4 w-4 transition-transform", showComparison && "rotate-180")} />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Comparison Table */}
        {showComparison && plans.length > 0 && (
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-center mb-8">Comparacion detallada</h2>

                {/* Desktop Table */}
                <div className="hidden md:block bg-card rounded-2xl border overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-4 font-semibold w-1/4">Caracteristica</th>
                        {plans.map((p) => (
                          <th key={p.slug} className={cn(
                            "text-center p-4 font-semibold",
                            p.isPopular && "bg-brand-50 dark:bg-brand-950/30"
                          )}>
                            <div className="flex items-center justify-center gap-2">
                              {p.name}
                              {p.isPopular && <Badge className="bg-brand-500 text-white text-xs border-0">Popular</Badge>}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Price row */}
                      <tr className="border-b bg-muted/30">
                        <td className="p-4 font-semibold">Precio mensual</td>
                        {plans.map((p) => (
                          <td key={p.slug} className={cn(
                            "text-center p-4 font-semibold",
                            p.isPopular && "bg-brand-50/50 dark:bg-brand-950/20"
                          )}>
                            {Number(p.priceMonthly) === 0 ? 'Gratis' : formatPrice(getDisplayPrice(p))}
                          </td>
                        ))}
                      </tr>
                      {comparisonRows.map((row, index) => (
                        <tr key={row.label} className={index % 2 === 0 ? '' : 'bg-muted/20'}>
                          <td className="p-4">
                            <span className="text-sm font-medium">{row.label}</span>
                          </td>
                          {row.values.map((val, i) => (
                            <td key={plans[i]?.slug || i} className={cn(
                              "text-center p-4",
                              plans[i]?.isPopular && "bg-brand-50/50 dark:bg-brand-950/20"
                            )}>
                              {typeof val === 'boolean' ? (
                                val ? (
                                  <Check className="h-5 w-5 text-green-500 mx-auto" />
                                ) : (
                                  <Minus className="h-4 w-4 text-gray-300 dark:text-gray-600 mx-auto" />
                                )
                              ) : (
                                <span className={cn(
                                  "text-sm font-medium",
                                  val === 'Ilimitados' && "text-brand-600 dark:text-brand-400 font-semibold"
                                )}>{val}</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {comparisonRows.map((row) => (
                    <div key={row.label} className="bg-card rounded-xl border p-4">
                      <p className="font-medium mb-3 text-sm">{row.label}</p>
                      <div className={cn(
                        "grid gap-2 text-sm",
                        plans.length <= 2 ? "grid-cols-2" : "grid-cols-3"
                      )}>
                        {row.values.map((val, i) => (
                          <div key={plans[i]?.slug || i} className={cn(
                            "text-center p-2.5 rounded-lg",
                            plans[i]?.isPopular ? "bg-brand-50 dark:bg-brand-950/30" : "bg-muted/50"
                          )}>
                            <p className="text-xs text-muted-foreground mb-1">{plans[i]?.name}</p>
                            {typeof val === 'boolean' ? (
                              val ? (
                                <Check className="h-4 w-4 text-green-500 mx-auto" />
                              ) : (
                                <Minus className="h-4 w-4 text-gray-300 mx-auto" />
                              )
                            ) : (
                              <span className={cn(
                                "text-sm font-medium",
                                val === 'Ilimitados' && "text-brand-600 dark:text-brand-400 font-semibold"
                              )}>{val}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Social Proof Stats */}
        <section className="py-16 border-t">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {[
                  { value: '+500', label: 'Negocios activos', icon: Building2 },
                  { value: '+12.000', label: 'Turnos por mes', icon: Calendar },
                  { value: '99.9%', label: 'Uptime garantizado', icon: Shield },
                  { value: '<2min', label: 'Soporte promedio', icon: MessageSquare },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <stat.icon className="h-6 w-6 text-brand-500 mx-auto mb-2" />
                    <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Guarantee Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 rounded-2xl p-8 md:p-10 border border-green-200 dark:border-green-800">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25">
                      <Shield className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-2">
                      Garantia de satisfaccion de 30 dias
                    </h3>
                    <p className="text-green-700 dark:text-green-300 mb-4">
                      Si durante los primeros 30 dias no estas satisfecho, te devolvemos todo tu dinero. Sin preguntas, sin complicaciones.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                      {['Reembolso completo', 'Sin preguntas', 'Proceso simple'].map(item => (
                        <div key={item} className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-sm font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <Badge className="mb-4 border-brand-200 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300 dark:border-brand-800">
                  Preguntas frecuentes
                </Badge>
                <h2 className="text-3xl font-bold">Todo lo que necesitas saber</h2>
              </div>

              <div className="space-y-6">
                {FAQ_DATA.map((category) => (
                  <div key={category.category}>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-3">
                      {category.category}
                    </h3>
                    <div className="space-y-2">
                      {category.questions.map((faq, idx) => {
                        const faqId = `${category.category}-${idx}`;
                        const isOpen = openFaq === faqId;
                        return (
                          <div key={idx} className="bg-card rounded-xl border overflow-hidden">
                            <button
                              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                              onClick={() => setOpenFaq(isOpen ? null : faqId)}
                            >
                              <span className="font-medium pr-4 text-sm">{faq.q}</span>
                              <ChevronDown className={cn(
                                "h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform",
                                isOpen && "rotate-180"
                              )} />
                            </button>
                            {isOpen && (
                              <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                                {faq.a}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <p className="text-muted-foreground text-sm mb-3">¿Tenes mas preguntas?</p>
                <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Escribinos por WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-gradient-to-r from-brand-600 via-brand-500 to-purple-600">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center text-white">
              <Rocket className="h-10 w-10 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Empieza a recibir reservas hoy mismo
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Configuracion en minutos, resultados inmediatos. Sin tarjeta de credito para empezar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="text-brand-700 bg-white hover:bg-white/90 h-14 px-8 text-lg">
                    Comenzar gratis ahora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/bella-estetica">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 h-14 px-8 text-lg">
                    Ver demo en vivo
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-white/50 mt-4">
                14 dias gratis · Sin tarjeta de credito · Cancela cuando quieras
              </p>
            </div>
          </div>
        </section>

        {/* Payment Modal Overlay */}
        {paymentPlan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !processingPayment && setPaymentPlan(null)}
            />

            {/* Modal */}
            <div className="relative bg-card rounded-2xl border-2 border-brand-500 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-200">
              {/* Header gradient */}
              <div className="bg-gradient-to-r from-brand-500 to-purple-500 px-6 py-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">Activar plan</p>
                    <h3 className="text-xl font-bold">{paymentPlan.name}</h3>
                  </div>
                  <button
                    onClick={() => !processingPayment && setPaymentPlan(null)}
                    className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Plan description */}
                <p className="text-sm text-muted-foreground">{paymentPlan.description}</p>

                {/* Billing toggle */}
                <div>
                  <p className="text-sm font-medium mb-2">Periodo de facturacion</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaymentBilling('MONTHLY')}
                      className={cn(
                        'flex-1 p-3 rounded-xl border-2 text-center transition-all',
                        paymentBilling === 'MONTHLY'
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30'
                          : 'border-border hover:border-brand-300'
                      )}
                    >
                      <p className="font-bold text-lg">
                        {formatPrice(Number(paymentPlan.priceMonthly))}
                      </p>
                      <p className="text-xs text-muted-foreground">por mes</p>
                    </button>
                    {paymentPlan.priceYearly && Number(paymentPlan.priceYearly) > 0 && (
                      <button
                        onClick={() => setPaymentBilling('YEARLY')}
                        className={cn(
                          'flex-1 p-3 rounded-xl border-2 text-center transition-all relative',
                          paymentBilling === 'YEARLY'
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30'
                            : 'border-border hover:border-brand-300'
                        )}
                      >
                        <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] border-0">
                          Ahorra
                        </Badge>
                        <p className="font-bold text-lg">
                          {formatPrice(Math.round(Number(paymentPlan.priceYearly) / 12))}
                        </p>
                        <p className="text-xs text-muted-foreground">por mes (anual)</p>
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-0.5">
                          {formatPrice(Number(paymentPlan.priceYearly))}/ano
                        </p>
                      </button>
                    )}
                  </div>
                </div>

                {/* Total */}
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total a pagar</span>
                    <span className="text-xl font-bold">
                      {paymentBilling === 'YEARLY' && paymentPlan.priceYearly
                        ? formatPrice(Number(paymentPlan.priceYearly))
                        : formatPrice(Number(paymentPlan.priceMonthly))
                      }
                      <span className="text-sm font-normal text-muted-foreground">
                        /{paymentBilling === 'YEARLY' ? 'ano' : 'mes'}
                      </span>
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Debito automatico · Cancela cuando quieras
                  </p>
                </div>

                {/* Pay button */}
                <Button
                  onClick={handlePayment}
                  disabled={processingPayment}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
                  size="lg"
                >
                  {processingPayment ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <CreditCard className="h-5 w-5 mr-2" />
                  )}
                  {processingPayment ? 'Redirigiendo...' : 'Pagar con MercadoPago'}
                </Button>

                {/* Trust signals */}
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Pago seguro
                  </div>
                  <div className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    SSL encriptado
                  </div>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  Seras redirigido a MercadoPago para completar el pago de forma segura.
                  Garantia de devolucion de 30 dias.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="border-t py-8 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img src="/claro2.png" alt="TurnoLink" className="h-8 w-auto dark:hidden" />
                <img src="/oscuro2.png" alt="TurnoLink" className="h-8 w-auto hidden dark:block" />
                <span className="text-sm text-muted-foreground">
                  &copy; {new Date().getFullYear()} TurnoLink
                </span>
              </div>
              <div className="flex items-center gap-6">
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Inicio</Link>
                <Link href="/suscripcion" className="text-sm text-muted-foreground hover:text-foreground">Precios</Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacidad</Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Terminos</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </LandingThemeWrapper>
  );
}
