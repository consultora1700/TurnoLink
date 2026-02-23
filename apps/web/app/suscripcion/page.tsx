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
  BarChart3,
  Clock,
  Star,
  Loader2,
  AlertCircle,
  RefreshCw,
  Scissors,
  UserCheck,
  Headphones,
  Mail,
  Gift,
  ChevronDown,
  Timer,
  TrendingUp,
  Award,
  Lock,
  Percent,
  Phone,
  CheckCircle2,
  BadgeCheck,
  Rocket,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { createApiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { LandingThemeWrapper, LandingThemeToggle } from '@/components/landing/landing-theme-wrapper';

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number | null;
  currency: string;
  trialDays: number;
  maxBranches: number;
  maxEmployees: number;
  maxServices: number | null;
  maxBookingsMonth: number | null;
  maxCustomers: number | null;
  features: string;
  isPopular: boolean;
  isActive: boolean;
}

interface Subscription {
  id: string;
  status: string;
  billingPeriod: string;
  trialEndAt: string | null;
  currentPeriodEnd: string | null;
  plan: Plan;
}

// Feature configuration
const PLAN_FEATURES = {
  gratis: [
    { text: '30 turnos por mes', included: true },
    { text: '2 empleados', included: true },
    { text: '5 servicios', included: true },
    { text: '50 clientes', included: true },
    { text: 'Confirmacion WhatsApp', included: true },
    { text: 'Recordatorios email', included: true },
    { text: 'Calendario completo', included: true },
    { text: 'Reportes basicos', included: true },
    { text: 'Cobros MercadoPago', included: false },
    { text: 'Soporte prioritario', included: false },
  ],
  profesional: [
    { text: '150 turnos por mes', included: true },
    { text: '5 empleados', included: true },
    { text: '20 servicios', included: true },
    { text: '500 clientes', included: true },
    { text: 'Confirmacion WhatsApp', included: true },
    { text: 'Recordatorios email', included: true },
    { text: 'Calendario completo', included: true },
    { text: 'Reportes avanzados', included: true },
    { text: 'Cobros MercadoPago', included: true },
    { text: 'Soporte WhatsApp', included: true },
  ],
  negocio: [
    { text: 'Turnos ilimitados', included: true, highlight: true },
    { text: '15 empleados', included: true },
    { text: 'Servicios ilimitados', included: true, highlight: true },
    { text: 'Clientes ilimitados', included: true, highlight: true },
    { text: 'Confirmacion WhatsApp', included: true },
    { text: 'Recordatorios email', included: true },
    { text: '5 sucursales', included: true },
    { text: 'Reportes completos', included: true },
    { text: 'Cobros MercadoPago', included: true },
    { text: 'Soporte prioritario 24/7', included: true, highlight: true },
  ],
};

// Comparison table data
const COMPARISON_DATA = [
  { feature: 'Turnos por mes', gratis: '30', profesional: '150', negocio: 'Ilimitados', icon: Calendar },
  { feature: 'Sucursales', gratis: '1', profesional: '1', negocio: '5', icon: Building2 },
  { feature: 'Empleados', gratis: '2', profesional: '5', negocio: '15', icon: Users },
  { feature: 'Servicios', gratis: '5', profesional: '20', negocio: 'Ilimitados', icon: Scissors },
  { feature: 'Clientes', gratis: '50', profesional: '500', negocio: 'Ilimitados', icon: UserCheck },
  { feature: 'Confirmacion WhatsApp', gratis: true, profesional: true, negocio: true, icon: MessageSquare },
  { feature: 'Recordatorios email', gratis: true, profesional: true, negocio: true, icon: Mail },
  { feature: 'Reportes', gratis: 'Basicos', profesional: 'Avanzados', negocio: 'Completos', icon: BarChart3 },
  { feature: 'Cobros MercadoPago', gratis: false, profesional: true, negocio: true, icon: CreditCard },
  { feature: 'Soporte', gratis: 'Email', profesional: 'WhatsApp', negocio: 'Prioritario 24/7', icon: Headphones },
  { feature: 'API personalizada', gratis: false, profesional: false, negocio: true, icon: Zap },
];

// FAQ Data organized by category
const FAQ_DATA = [
  {
    category: 'Planes y precios',
    questions: [
      {
        q: '¿Puedo cambiar de plan en cualquier momento?',
        a: 'Si, puedes cambiar de plan cuando quieras. Si subes de plan, el cambio es inmediato y se prorratea el precio. Si bajas, el cambio aplica al siguiente periodo de facturacion.',
      },
      {
        q: '¿Hay contratos o permanencia minima?',
        a: 'No, todos nuestros planes son sin contrato. Puedes cancelar en cualquier momento sin penalizacion ni costos ocultos.',
      },
      {
        q: '¿Que metodos de pago aceptan?',
        a: 'Aceptamos todas las tarjetas de credito y debito (Visa, Mastercard, American Express) a traves de Mercado Pago. Tambien podes pagar con dinero en cuenta de Mercado Pago.',
      },
      {
        q: '¿Los precios incluyen IVA?',
        a: 'Si, todos los precios mostrados son finales e incluyen IVA. No hay costos adicionales ni sorpresas.',
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
        a: 'Te avisamos 3 dias antes de que termine. Si no activas un plan de pago, tu cuenta pasa automaticamente al plan Gratis (no pierdes tus datos).',
      },
      {
        q: '¿El plan Gratis es realmente gratis para siempre?',
        a: 'Si, el plan Gratis es 100% gratis, sin limite de tiempo. Ideal para negocios pequenos o para probar la plataforma sin compromiso.',
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
        a: 'Si, podes personalizar colores, logo, descripcion, fotos y mucho mas. Tu pagina tendra tu propia URL personalizada (tunegocio.turnolink.com).',
      },
      {
        q: '¿Que pasa si supero el limite de turnos del plan?',
        a: 'Te avisamos cuando estes cerca del limite. Si lo superas, no podras recibir nuevas reservas hasta el proximo mes, pero las existentes se mantienen.',
      },
    ],
  },
  {
    category: 'Soporte y garantia',
    questions: [
      {
        q: '¿Como funciona la garantia de 30 dias?',
        a: 'Si no estas satisfecho durante los primeros 30 dias, te devolvemos el 100% de tu dinero. Sin preguntas, sin complicaciones. Solo contactanos.',
      },
      {
        q: '¿Que tipo de soporte ofrecen?',
        a: 'Plan Gratis: soporte por email (respuesta en 24-48hs). Plan Profesional: soporte por WhatsApp (respuesta en menos de 4hs). Plan Negocio: soporte prioritario 24/7 con linea directa.',
      },
    ],
  },
];

// Testimonials
const TESTIMONIALS = [
  {
    name: 'Maria Gonzalez',
    business: 'Estetica Bella',
    image: null,
    rating: 5,
    text: 'Desde que uso TurnoLink, mis clientas pueden reservar a cualquier hora. Las cancelaciones bajaron un 70% gracias a las senas.',
    plan: 'Profesional',
  },
  {
    name: 'Carlos Rodriguez',
    business: 'Barberia Los Capos',
    image: null,
    rating: 5,
    text: 'Antes perdia horas atendiendo el telefono. Ahora todo es automatico y puedo enfocarme en cortar pelo. Lo mejor: es muy facil de usar.',
    plan: 'Profesional',
  },
  {
    name: 'Dra. Laura Martinez',
    business: 'Consultorio Odontologico',
    image: null,
    rating: 5,
    text: 'Mis pacientes valoran poder reservar online. Los recordatorios automaticos redujeron las ausencias drasticamente.',
    plan: 'Negocio',
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
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    loadPlans();
    if (session?.accessToken) {
      loadSubscription();
    } else {
      setLoading(false);
    }
  }, [session]);

  const loadPlans = async () => {
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-turnolink.mubitt.com';
      const response = await fetch(`${baseUrl}/api/plans`);
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
      const api = createApiClient(session.accessToken as string);
      const data = await api.get<Subscription>('/subscriptions');
      setSubscription(data);
    } catch (error) {
      // No subscription yet
    }
  };

  const handleSelectPlan = async (planSlug: string, isFree: boolean) => {
    if (!session?.accessToken) {
      router.push(`/register?plan=${planSlug}`);
      return;
    }

    setSubscribing(planSlug);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-turnolink.mubitt.com';
      const endpoint = isFree ? '/api/subscriptions/free' : '/api/subscriptions/trial';

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ planSlug }),
      });

      if (response.ok) {
        toast({
          title: isFree ? 'Plan activado' : 'Prueba gratuita activada',
          description: isFree
            ? 'Ya puedes empezar a usar TurnoLink'
            : 'Tienes 14 dias para probar todas las funcionalidades',
        });
        router.push('/dashboard');
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo activar el plan. Intenta de nuevo.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error de conexion. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setSubscribing(null);
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

  const getYearlyPrice = (monthly: number) => {
    return Math.round(monthly * 12 * 0.83); // 17% discount
  };

  const getTrialDaysRemaining = () => {
    if (!subscription?.trialEndAt) return 0;
    const endDate = new Date(subscription.trialEndAt);
    const now = new Date();
    return Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  };

  // Static plans for display
  const displayPlans = [
    { slug: 'gratis', name: 'Gratis', price: 0, description: 'Para empezar sin riesgo', popular: false, trial: false },
    { slug: 'profesional', name: 'Profesional', price: 8990, description: 'Para profesionales independientes', popular: true, trial: true },
    { slug: 'negocio', name: 'Negocio', price: 14990, description: 'Para negocios en crecimiento', popular: false, trial: true },
  ];

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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                      {subscription.status === 'TRIALING' && ` • ${getTrialDaysRemaining()} dias restantes`}
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
        <section className="py-12 md:py-20 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-50/50 to-transparent dark:from-brand-950/20 pointer-events-none" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-3xl mx-auto text-center">
              {/* Launch badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border border-amber-200 dark:border-amber-700 mb-6 animate-pulse">
                <Gift className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                  Precios de lanzamiento • Oferta por tiempo limitado
                </span>
                <Timer className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                El plan perfecto{' '}
                <span className="text-gradient">para tu negocio</span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Empieza gratis y escala cuando lo necesites. Sin contratos, sin sorpresas, sin comisiones por reserva.
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap justify-center gap-4 mb-10">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">30 dias de garantia</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <Lock className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Pago 100% seguro</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Activo en 5 minutos</span>
                </div>
              </div>

              {/* Billing Toggle */}
              <div className="inline-flex items-center gap-1 p-1.5 bg-muted rounded-full">
                <button
                  onClick={() => setBillingPeriod('MONTHLY')}
                  className={cn(
                    'px-5 py-2.5 rounded-full text-sm font-medium transition-all',
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
                    'px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                    billingPeriod === 'YEARLY'
                      ? 'bg-background shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Anual
                  <span className="px-2 py-0.5 rounded-full bg-green-500 text-white text-xs font-bold">
                    -17%
                  </span>
                </button>
              </div>
              {billingPeriod === 'YEARLY' && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2 animate-fade-in">
                  Ahorras 2 meses pagando anual
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Plans Grid */}
        <section className="pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card rounded-2xl border p-6 animate-pulse">
                    <div className="h-14 w-14 rounded-2xl bg-muted mx-auto mb-4" />
                    <div className="h-6 w-32 bg-muted rounded mx-auto mb-2" />
                    <div className="h-4 w-48 bg-muted rounded mx-auto mb-6" />
                    <div className="h-12 w-32 bg-muted rounded mx-auto mb-6" />
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((j) => (
                        <div key={j} className="h-4 bg-muted rounded" />
                      ))}
                    </div>
                    <div className="h-12 bg-muted rounded-lg mt-6" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
                {displayPlans.map((plan) => {
                  const features = PLAN_FEATURES[plan.slug as keyof typeof PLAN_FEATURES] || [];
                  const price = billingPeriod === 'YEARLY' && plan.price > 0
                    ? Math.round(getYearlyPrice(plan.price) / 12)
                    : plan.price;
                  const isFree = plan.price === 0;

                  return (
                    <div
                      key={plan.slug}
                      className={cn(
                        'relative bg-card rounded-2xl border-2 transition-all duration-300 hover:shadow-xl',
                        plan.popular
                          ? 'border-brand-500 shadow-lg shadow-brand-500/20 md:scale-105 z-10'
                          : 'border-border hover:border-brand-200'
                      )}
                    >
                      {plan.popular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <Badge className="bg-gradient-primary text-white px-4 py-1.5 text-sm shadow-lg">
                            <Star className="h-3.5 w-3.5 mr-1.5 fill-current" />
                            Mas elegido
                          </Badge>
                        </div>
                      )}

                      <div className="p-6 lg:p-8">
                        {/* Plan Header */}
                        <div className="text-center mb-6">
                          <div className={cn(
                            'mx-auto h-16 w-16 rounded-2xl flex items-center justify-center mb-4 transition-transform hover:scale-110',
                            isFree ? 'bg-gray-100 dark:bg-gray-800' :
                            plan.popular ? 'bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/30' :
                            'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/30'
                          )}>
                            {isFree ? (
                              <Gift className="h-8 w-8 text-gray-600 dark:text-gray-300" />
                            ) : plan.popular ? (
                              <Zap className="h-8 w-8 text-white" />
                            ) : (
                              <Crown className="h-8 w-8 text-white" />
                            )}
                          </div>
                          <h3 className="text-2xl font-bold">{plan.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                        </div>

                        {/* Price */}
                        <div className="text-center mb-6">
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-5xl font-bold">
                              {isFree ? '$0' : formatPrice(price)}
                            </span>
                            <span className="text-muted-foreground text-lg">/mes</span>
                          </div>
                          {!isFree && billingPeriod === 'YEARLY' && (
                            <p className="text-sm text-muted-foreground mt-1">
                              <span className="line-through">{formatPrice(plan.price)}</span>
                              <span className="text-green-600 dark:text-green-400 ml-2">Ahorras {formatPrice(plan.price * 12 - getYearlyPrice(plan.price))}/año</span>
                            </p>
                          )}
                          {plan.trial && (
                            <p className="text-sm text-brand-600 dark:text-brand-400 mt-2 font-medium">
                              14 dias de prueba gratis
                            </p>
                          )}
                        </div>

                        {/* Features */}
                        <ul className="space-y-3 mb-8">
                          {features.map((feature, idx) => {
                            const isHighlight = 'highlight' in feature && feature.highlight;
                            return (
                              <li key={idx} className="flex items-start gap-3">
                                {feature.included ? (
                                  <CheckCircle2 className={cn(
                                    "h-5 w-5 flex-shrink-0 mt-0.5",
                                    isHighlight ? "text-brand-500" : "text-green-500"
                                  )} />
                                ) : (
                                  <X className="h-5 w-5 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5" />
                                )}
                                <span className={cn(
                                  "text-sm",
                                  !feature.included && "text-muted-foreground",
                                  isHighlight && "font-semibold text-brand-600 dark:text-brand-400"
                                )}>
                                  {feature.text}
                                </span>
                              </li>
                            );
                          })}
                        </ul>

                        {/* CTA */}
                        <Button
                          onClick={() => handleSelectPlan(plan.slug, isFree)}
                          disabled={subscribing === plan.slug}
                          className={cn(
                            'w-full h-12 text-base font-semibold transition-all',
                            plan.popular
                              ? 'bg-gradient-primary hover:opacity-90 shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40'
                              : ''
                          )}
                          variant={plan.popular ? 'default' : 'outline'}
                          size="lg"
                        >
                          {subscribing === plan.slug ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <>
                              {isFree ? 'Empezar gratis' : 'Comenzar prueba gratis'}
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                          )}
                        </Button>

                        {!isFree && (
                          <p className="text-center text-xs text-muted-foreground mt-3">
                            Sin tarjeta de credito • Cancela cuando quieras
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* View comparison link */}
            <div className="text-center mt-10">
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 hover:underline font-medium"
              >
                {showComparison ? 'Ocultar comparacion detallada' : 'Ver comparacion detallada de planes'}
                <ChevronDown className={cn("h-4 w-4 transition-transform", showComparison && "rotate-180")} />
              </button>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        {showComparison && (
          <section className="py-12 bg-muted/30 animate-fade-in">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-center mb-8">Comparacion detallada de planes</h2>

                {/* Desktop Table */}
                <div className="hidden md:block bg-card rounded-2xl border overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-4 font-semibold w-1/4">Caracteristica</th>
                        <th className="text-center p-4 font-semibold">Gratis</th>
                        <th className="text-center p-4 font-semibold bg-brand-50 dark:bg-brand-950/30">
                          <div className="flex items-center justify-center gap-2">
                            Profesional
                            <Badge className="bg-brand-500 text-white text-xs">Popular</Badge>
                          </div>
                        </th>
                        <th className="text-center p-4 font-semibold">Negocio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARISON_DATA.map((row, index) => (
                        <tr key={row.feature} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <row.icon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{row.feature}</span>
                            </div>
                          </td>
                          <td className="text-center p-4">
                            {typeof row.gratis === 'boolean' ? (
                              row.gratis ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-gray-300 mx-auto" />
                            ) : (
                              <span className="text-sm">{row.gratis}</span>
                            )}
                          </td>
                          <td className="text-center p-4 bg-brand-50/50 dark:bg-brand-950/20">
                            {typeof row.profesional === 'boolean' ? (
                              row.profesional ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-gray-300 mx-auto" />
                            ) : (
                              <span className="text-sm font-medium">{row.profesional}</span>
                            )}
                          </td>
                          <td className="text-center p-4">
                            {typeof row.negocio === 'boolean' ? (
                              row.negocio ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-gray-300 mx-auto" />
                            ) : (
                              <span className={cn(
                                "text-sm",
                                row.negocio === 'Ilimitados' && "font-semibold text-brand-600 dark:text-brand-400"
                              )}>{row.negocio}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-2 bg-muted/50 font-semibold">
                        <td className="p-4">Precio mensual</td>
                        <td className="text-center p-4">Gratis</td>
                        <td className="text-center p-4 bg-brand-50/50 dark:bg-brand-950/20">{formatPrice(8990)}</td>
                        <td className="text-center p-4">{formatPrice(14990)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {COMPARISON_DATA.map((row) => (
                    <div key={row.feature} className="bg-card rounded-xl border p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <row.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{row.feature}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center p-2 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Gratis</p>
                          {typeof row.gratis === 'boolean' ? (
                            row.gratis ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-gray-300 mx-auto" />
                          ) : (
                            <p className="font-medium">{row.gratis}</p>
                          )}
                        </div>
                        <div className="text-center p-2 rounded-lg bg-brand-50 dark:bg-brand-950/30">
                          <p className="text-xs text-muted-foreground mb-1">Pro</p>
                          {typeof row.profesional === 'boolean' ? (
                            row.profesional ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-gray-300 mx-auto" />
                          ) : (
                            <p className="font-medium">{row.profesional}</p>
                          )}
                        </div>
                        <div className="text-center p-2 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Negocio</p>
                          {typeof row.negocio === 'boolean' ? (
                            row.negocio ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-gray-300 mx-auto" />
                          ) : (
                            <p className="font-medium">{row.negocio}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Testimonials */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <Badge className="mb-4 bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-300 dark:border-teal-800">
                <Heart className="h-3 w-3 mr-1" />
                +500 negocios confian en TurnoLink
              </Badge>
              <h2 className="text-3xl font-bold">Lo que dicen nuestros clientes</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {TESTIMONIALS.map((testimonial, idx) => (
                <div key={idx} className="bg-card rounded-2xl border p-6 hover:shadow-lg transition-shadow">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.business}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">{testimonial.plan}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Guarantee Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 rounded-3xl p-8 md:p-12 border border-green-200 dark:border-green-800">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-xl shadow-green-500/30">
                      <Shield className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-3">
                      Garantia de satisfaccion de 30 dias
                    </h3>
                    <p className="text-green-700 dark:text-green-300 text-lg mb-4">
                      Si durante los primeros 30 dias no estas 100% satisfecho con TurnoLink, te devolvemos todo tu dinero. Sin preguntas, sin complicaciones, sin letra chica.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-sm font-medium">Reembolso completo</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-sm font-medium">Sin preguntas</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-sm font-medium">Proceso simple</span>
                      </div>
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
              <div className="text-center mb-12">
                <Badge className="mb-4">Preguntas frecuentes</Badge>
                <h2 className="text-3xl font-bold">Todo lo que necesitas saber</h2>
              </div>

              <div className="space-y-6">
                {FAQ_DATA.map((category) => (
                  <div key={category.category}>
                    <h3 className="text-lg font-semibold mb-4 text-brand-600 dark:text-brand-400">
                      {category.category}
                    </h3>
                    <div className="space-y-3">
                      {category.questions.map((faq, idx) => {
                        const faqId = `${category.category}-${idx}`;
                        const isOpen = openFaq === faqId;
                        return (
                          <div key={idx} className="bg-card rounded-xl border overflow-hidden">
                            <button
                              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                              onClick={() => setOpenFaq(isOpen ? null : faqId)}
                            >
                              <span className="font-medium pr-4">{faq.q}</span>
                              <ChevronDown className={cn(
                                "h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform",
                                isOpen && "rotate-180"
                              )} />
                            </button>
                            {isOpen && (
                              <div className="px-5 pb-4 text-muted-foreground animate-fade-in">
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

              <div className="mt-10 text-center">
                <p className="text-muted-foreground mb-4">¿Tenes mas preguntas?</p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link href="/ayuda">
                    <Button variant="outline">
                      <Headphones className="h-4 w-4 mr-2" />
                      Centro de ayuda
                    </Button>
                  </Link>
                  <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-gradient-to-r from-brand-600 to-brand-700">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center text-white">
              <Rocket className="h-12 w-12 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Empieza a recibir reservas hoy mismo
              </h2>
              <p className="text-lg text-white/80 mb-8">
                Unete a mas de 500 negocios que ya automatizaron su agenda con TurnoLink.
                Configuracion en minutos, resultados inmediatos.
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
              <p className="text-sm text-white/60 mt-4">
                14 dias gratis • Sin tarjeta de credito • Cancela cuando quieras
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-8 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img src="/claro2.png" alt="TurnoLink" className="h-8 w-auto dark:hidden" />
                <img src="/oscuro2.png" alt="TurnoLink" className="h-8 w-auto hidden dark:block" />
                <span className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} TurnoLink
                </span>
              </div>
              <div className="flex items-center gap-6">
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Inicio</Link>
                <Link href="/ayuda" className="text-sm text-muted-foreground hover:text-foreground">Ayuda</Link>
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
