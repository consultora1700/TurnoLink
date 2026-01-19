'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from '@/components/ui/language-selector';
import { LandingThemeWrapper, LandingThemeToggle } from '@/components/landing/landing-theme-wrapper';
import { useTranslation } from '@/lib/i18n';
import {
  Calendar,
  Clock,
  Users,
  Smartphone,
  Zap,
  CheckCircle2,
  ArrowRight,
  Star,
  Sparkles,
  BarChart3,
  MessageSquare,
  Globe,
  ChevronLeft,
  Shield,
  Palette,
  UserCog,
  Bell,
  Lock,
  Settings,
  Scissors,
  CalendarDays,
  ClipboardList,
  TrendingUp,
  Mail,
  Building2,
  Layers,
  Eye,
  Fingerprint,
  Languages,
  CalendarCheck,
  UserPlus,
  History,
  Ban,
  CreditCard,
  Wallet,
  BadgeDollarSign,
} from 'lucide-react';
import { FloatingParticles } from '@/components/landing/floating-particles';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <LandingThemeWrapper>
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-gradient-radial pointer-events-none" />
      <FloatingParticles />

      {/* Header */}
      <header className="relative z-50 border-b bg-background/80 backdrop-blur-lg sticky top-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-sm">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">TurnoLink</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t('landing.nav.features')}
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t('landing.nav.pricing')}
              </a>
              <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t('landing.nav.testimonials')}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <LandingThemeToggle showHint />
              <LanguageSelector variant="minimal" className="hidden sm:block" />
              <Link href="/login">
                <Button variant="ghost" className="hidden sm:inline-flex">
                  {t('landing.nav.login')}
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-primary hover:opacity-90 shadow-glow-sm">
                  {t('landing.nav.getStarted')}
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-100 mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4 text-brand-600" />
              <span className="text-sm font-medium text-brand-700">
                {t('landing.hero.badge')}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up">
              {t('landing.hero.title')}{' '}
              <span className="text-gradient">{t('landing.hero.titleHighlight')}</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up-delayed">
              {t('landing.hero.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up-delayed-2">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-primary hover:opacity-90 shadow-glow text-lg px-8 h-14">
                  {t('landing.hero.cta')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/bella-estetica">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 h-14 border-2 border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-800/50 hover:bg-slate-800 hover:text-white hover:border-slate-800 dark:hover:bg-neutral-700 dark:hover:border-neutral-500 transition-all">
                  {t('landing.hero.demo')}
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>{t('landing.hero.trust.noCard')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>{t('landing.hero.trust.setup')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>{t('landing.hero.trust.support')}</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Mockup - Improved UX */}
          <div className="mt-16 md:mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none h-32 bottom-0 top-auto" />
            <div className="relative mx-auto max-w-5xl">
              <div className="rounded-2xl border shadow-2xl overflow-hidden bg-white dark:bg-neutral-800">
                {/* Browser Header */}
                <div className="bg-slate-100 dark:bg-neutral-900 px-4 py-3 flex items-center gap-2 border-b">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-neutral-800 rounded-md text-xs text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      turnolink.app/bella-estetica
                    </div>
                  </div>
                </div>

                {/* App Preview Content */}
                <div className="bg-gradient-to-br from-pink-50 via-white to-violet-50 dark:from-neutral-800 dark:via-neutral-800 dark:to-neutral-900 p-4 md:p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* Left - Service Selection */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="bg-white dark:bg-neutral-800 rounded-xl p-5 shadow-lg border">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center">
                            <Sparkles className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">Bella Estética</h4>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <span>4.9</span>
                              <span className="mx-1">•</span>
                              <span>+500 clientes</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Servicios populares</p>

                          {/* Service Items */}
                          <div className="p-3 rounded-lg border-2 border-pink-200 dark:border-pink-700 bg-pink-50/50 dark:bg-pink-900/30">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm">Limpieza Facial</p>
                                <p className="text-xs text-muted-foreground">60 min</p>
                              </div>
                              <span className="font-bold text-pink-600 dark:text-pink-400">$8.500</span>
                            </div>
                          </div>

                          <div className="p-3 rounded-lg border hover:border-pink-200 dark:hover:border-pink-700 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm">Manicura + Pedicura</p>
                                <p className="text-xs text-muted-foreground">90 min</p>
                              </div>
                              <span className="font-semibold">$8.500</span>
                            </div>
                          </div>

                          <div className="p-3 rounded-lg border hover:border-pink-200 dark:hover:border-pink-700 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm">Masaje Relajante</p>
                                <p className="text-xs text-muted-foreground">60 min</p>
                              </div>
                              <span className="font-semibold">$9.000</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right - Calendar & Time */}
                    <div className="lg:col-span-3 space-y-4">
                      {/* Calendar */}
                      <div className="bg-white dark:bg-neutral-800 rounded-xl p-5 shadow-lg border">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold">Enero 2026</h3>
                          <div className="flex gap-1">
                            <button className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-700 flex items-center justify-center">
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-700 flex items-center justify-center rotate-180">
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs">
                          {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map((day, i) => (
                            <div key={i} className="text-muted-foreground font-medium py-2">{day}</div>
                          ))}
                          {/* Empty cells for alignment */}
                          {[0, 1, 2].map((i) => <div key={`empty-${i}`} className="py-2" />)}
                          {Array.from({ length: 31 }, (_, i) => (
                            <div
                              key={i}
                              className={`py-2 rounded-lg text-sm transition-all cursor-pointer ${
                                i === 16 ? 'bg-gradient-to-br from-pink-500 to-violet-500 text-white font-semibold shadow-md scale-110' :
                                i === 17 || i === 18 ? 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 font-medium' :
                                i < 16 ? 'text-slate-300 dark:text-neutral-600' : 'hover:bg-slate-100 dark:hover:bg-neutral-700'
                              }`}
                            >
                              {i + 1}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Time Slots */}
                      <div className="bg-white dark:bg-neutral-800 rounded-xl p-5 shadow-lg border">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Horarios disponibles - Viernes 17</p>
                        <div className="grid grid-cols-4 gap-2">
                          {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((time, i) => (
                            <button
                              key={i}
                              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                i === 2 ? 'bg-gradient-to-br from-pink-500 to-violet-500 text-white shadow-md' :
                                i === 0 || i === 4 ? 'bg-slate-100 dark:bg-neutral-700 text-slate-400 dark:text-neutral-500 cursor-not-allowed' :
                                'border hover:border-pink-300 dark:hover:border-pink-700 hover:bg-pink-50 dark:hover:bg-pink-900/30'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>

                        {/* CTA Button */}
                        <button className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                          <CheckCircle2 className="h-5 w-5" />
                          Confirmar Turno
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground mb-8">
            {t('landing.logos.title')}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
            {['Bella Estética', 'Spa Zen', 'Centro Bienestar', 'Studio Nails', 'Dr. González'].map((name, i) => (
              <div key={i} className="text-xl font-bold text-slate-400 dark:text-neutral-500">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Core Features */}
      <section id="features" className="py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-100 mb-6">
              <Zap className="h-4 w-4 text-brand-600" />
              <span className="text-sm font-medium text-brand-700">{t('landing.features.badge')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
              {t('landing.features.title')}{' '}
              <span className="text-gradient">{t('landing.features.titleHighlight')}</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('landing.features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <FeatureCard
              icon={<Calendar className="h-6 w-6" />}
              title={t('landing.features.calendar.title')}
              description={t('landing.features.calendar.description')}
              gradient="from-brand-500 to-brand-600"
            />
            <FeatureCard
              icon={<Clock className="h-6 w-6" />}
              title={t('landing.features.booking.title')}
              description={t('landing.features.booking.description')}
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={<MessageSquare className="h-6 w-6" />}
              title={t('landing.features.notifications.title')}
              description={t('landing.features.notifications.description')}
              gradient="from-green-500 to-emerald-500"
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title={t('landing.features.customers.title')}
              description={t('landing.features.customers.description')}
              gradient="from-orange-500 to-amber-500"
            />
            <FeatureCard
              icon={<Smartphone className="h-6 w-6" />}
              title={t('landing.features.responsive.title')}
              description={t('landing.features.responsive.description')}
              gradient="from-pink-500 to-rose-500"
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title={t('landing.features.reports.title')}
              description={t('landing.features.reports.description')}
              gradient="from-brand-600 to-brand-700"
            />
          </div>
        </div>
      </section>

      {/* For Your Business Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-800 mb-6">
              <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Panel de Administración</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Todo lo que necesitas para <span className="text-gradient">gestionar tu negocio</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Un dashboard completo con todas las herramientas para administrar turnos, clientes y empleados desde un solo lugar.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MiniFeatureCard
              icon={<Scissors className="h-5 w-5" />}
              title="Gestión de Servicios"
              description="Crea y organiza tus servicios con precios, duraciones y categorías personalizadas."
            />
            <MiniFeatureCard
              icon={<UserCog className="h-5 w-5" />}
              title="Equipo de Trabajo"
              description="Administra empleados, asigna especialidades y gestiona sus horarios individuales."
            />
            <MiniFeatureCard
              icon={<CalendarDays className="h-5 w-5" />}
              title="Horarios Flexibles"
              description="Configura horarios por día de la semana y bloquea fechas especiales fácilmente."
            />
            <MiniFeatureCard
              icon={<ClipboardList className="h-5 w-5" />}
              title="Estados de Turnos"
              description="Controla el ciclo completo: pendiente, confirmado, completado, cancelado o no-show."
            />
            <MiniFeatureCard
              icon={<Users className="h-5 w-5" />}
              title="CRM de Clientes"
              description="Historial completo de visitas, notas y datos de contacto de cada cliente."
            />
            <MiniFeatureCard
              icon={<TrendingUp className="h-5 w-5" />}
              title="Estadísticas en Vivo"
              description="Métricas del día, semana y mes con próximos turnos y clientes recientes."
            />
            <MiniFeatureCard
              icon={<Bell className="h-5 w-5" />}
              title="Notificaciones"
              description="Email y WhatsApp automáticos para confirmaciones y recordatorios."
            />
            <MiniFeatureCard
              icon={<Ban className="h-5 w-5" />}
              title="Días Bloqueados"
              description="Marca vacaciones, feriados o días sin servicio con un solo click."
            />
          </div>
        </div>
      </section>

      {/* Customization Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-800 mb-6">
                <Palette className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Personalización Total</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                Tu marca, <span className="text-gradient">tu estilo</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Personaliza cada aspecto de tu página pública para que refleje la identidad de tu negocio.
              </p>

              <div className="space-y-4">
                <CustomizationItem
                  icon={<Palette className="h-5 w-5" />}
                  title="Colores de Marca"
                  description="Elige colores primarios, secundarios y de acento que representen tu negocio."
                />
                <CustomizationItem
                  icon={<Layers className="h-5 w-5" />}
                  title="5 Estilos de Fondo"
                  description="Minimal, Modern, Elegant, Fresh o Vibrant - encuentra el look perfecto."
                />
                <CustomizationItem
                  icon={<Eye className="h-5 w-5" />}
                  title="Modo Oscuro"
                  description="Ofrece a tus clientes la opción de tema claro u oscuro automáticamente."
                />
                <CustomizationItem
                  icon={<Globe className="h-5 w-5" />}
                  title="Tu Propia URL"
                  description="Obtén una URL única como turnolink.app/tu-negocio para compartir."
                />
              </div>
            </div>

            {/* Visual Preview - Background Styles */}
            <div className="relative">
              <div className="bg-card rounded-3xl border shadow-lg p-6">
                <p className="text-sm font-semibold mb-2 text-center">Estilos de Fondo Disponibles</p>
                <p className="text-xs text-muted-foreground text-center mb-5">Cada estilo cambia el fondo de tu página pública</p>

                <div className="space-y-3">
                  {/* Minimal */}
                  <div className="group cursor-pointer flex items-center gap-4 p-3 rounded-xl border-2 border-slate-200 dark:border-transparent hover:border-brand-500 hover:bg-muted/30 transition-all">
                    <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 relative flex-shrink-0 border border-slate-300 dark:border-slate-700 shadow-sm">
                      <div className="absolute bottom-0 left-1/4 right-1/4 h-5 bg-slate-300 dark:bg-slate-700 blur-md rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">Minimal</p>
                      <p className="text-xs text-muted-foreground">Fondo limpio y sutil. Ideal para negocios profesionales y elegantes.</p>
                    </div>
                  </div>

                  {/* Modern */}
                  <div className="group cursor-pointer flex items-center gap-4 p-3 rounded-xl border-2 border-slate-200 dark:border-transparent hover:border-brand-500 hover:bg-muted/30 transition-all">
                    <div className="w-20 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 relative flex-shrink-0 border border-blue-200 dark:border-blue-800 shadow-sm">
                      <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-blue-400/50 dark:bg-blue-400/30 blur-md" />
                      <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-purple-400/50 dark:bg-purple-400/30 blur-md" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">Modern</p>
                      <p className="text-xs text-muted-foreground">Orbes suaves con degradados. Estilo tech moderno tipo Stripe.</p>
                    </div>
                  </div>

                  {/* Elegant */}
                  <div className="group cursor-pointer flex items-center gap-4 p-3 rounded-xl border-2 border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 transition-all ring-1 ring-brand-500/20">
                    <div className="w-20 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 dark:from-amber-950 dark:via-orange-950 dark:to-rose-950 relative flex-shrink-0 border border-amber-300 dark:border-amber-700 shadow-sm">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-300/60 dark:from-amber-200/40 via-transparent to-transparent" />
                      <div className="absolute inset-0 opacity-40 dark:opacity-30" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")'}} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-brand-700 dark:text-brand-300">Elegant <span className="text-[10px] bg-brand-500 text-white px-1.5 py-0.5 rounded ml-1">Popular</span></p>
                      <p className="text-xs text-muted-foreground">Degradado con textura sutil. Sofisticado y premium.</p>
                    </div>
                  </div>

                  {/* Fresh */}
                  <div className="group cursor-pointer flex items-center gap-4 p-3 rounded-xl border-2 border-slate-200 dark:border-transparent hover:border-brand-500 hover:bg-muted/30 transition-all">
                    <div className="w-20 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 relative flex-shrink-0 border border-green-200 dark:border-green-800 shadow-sm">
                      <svg className="absolute top-0 left-0 w-full h-6 text-green-400 dark:text-green-700" viewBox="0 0 100 20" preserveAspectRatio="none">
                        <path fill="currentColor" d="M0,10 Q25,0 50,10 T100,10 L100,0 L0,0 Z" />
                      </svg>
                      <svg className="absolute bottom-0 left-0 w-full h-6 text-teal-400 dark:text-teal-700" viewBox="0 0 100 20" preserveAspectRatio="none">
                        <path fill="currentColor" d="M0,10 Q25,20 50,10 T100,10 L100,20 L0,20 Z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">Fresh</p>
                      <p className="text-xs text-muted-foreground">Ondas suaves arriba y abajo. Natural y fresco.</p>
                    </div>
                  </div>

                  {/* Vibrant */}
                  <div className="group cursor-pointer flex items-center gap-4 p-3 rounded-xl border-2 border-slate-200 dark:border-transparent hover:border-brand-500 hover:bg-muted/30 transition-all">
                    <div className="w-20 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-pink-200 via-purple-200 to-violet-200 dark:from-pink-950 dark:via-purple-950 dark:to-violet-950 relative flex-shrink-0 border border-pink-300 dark:border-pink-800 shadow-sm">
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full border-2 border-pink-500 dark:border-pink-400/50" />
                      <div className="absolute bottom-1 left-1 w-3 h-3 rounded-full bg-violet-500 dark:bg-violet-400/40" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 border-purple-400 dark:border-purple-300/30" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">Vibrant</p>
                      <p className="text-xs text-muted-foreground">Formas geométricas coloridas. Divertido y llamativo.</p>
                    </div>
                  </div>
                </div>

                {/* Color & Theme Row */}
                <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t">
                  <div className="bg-muted/50 rounded-xl p-3">
                    <p className="text-[10px] font-medium text-muted-foreground mb-2">Colores de Marca</p>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-pink-500 ring-2 ring-white dark:ring-slate-800 shadow-sm" />
                      <div className="w-6 h-6 rounded-full bg-violet-500 ring-2 ring-white dark:ring-slate-800 shadow-sm" />
                      <div className="w-6 h-6 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-800 shadow-sm" />
                      <div className="w-6 h-6 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-800 shadow-sm" />
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3">
                    <p className="text-[10px] font-medium text-muted-foreground mb-2">Modo Claro / Oscuro</p>
                    <div className="flex gap-2">
                      <div className="flex-1 h-6 rounded-md bg-white border flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                      </div>
                      <div className="flex-1 h-6 rounded-md bg-slate-800 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-blue-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mercado Pago Integration Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Payment Visual */}
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 dark:from-sky-900 dark:via-blue-900 dark:to-cyan-900 rounded-3xl p-8">
                <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
                  {/* Mercado Pago Header con logo oficial */}
                  <div className="bg-[#00bcff] px-6 py-5">
                    <div className="flex items-center justify-center mb-4">
                      {/* Logo oficial Mercado Pago con fondo blanco para legibilidad */}
                      <div className="bg-white rounded-lg px-4 py-2">
                        <img
                          src="/mercadopago-logo.png"
                          alt="Mercado Pago"
                          className="h-8 object-contain"
                        />
                      </div>
                    </div>
                    <div className="text-center text-white">
                      <span className="text-xs bg-white/25 px-3 py-1 rounded-full font-semibold">Integración Oficial</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Payment Success Card */}
                    <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-green-700 dark:text-green-300">Seña recibida</p>
                          <p className="text-sm text-green-600 dark:text-green-400">$2.500 de María García</p>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">$45.000</p>
                        <p className="text-xs text-muted-foreground">Cobrado hoy</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold">12</p>
                        <p className="text-xs text-muted-foreground">Señas recibidas</p>
                      </div>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                      El dinero llega directo a tu cuenta de Mercado Pago
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-800 mb-6">
                <CreditCard className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <span className="text-sm font-medium text-sky-700 dark:text-sky-300">Cobros Online</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                Recibe pagos con <span className="text-[#009ee3]">Mercado Pago</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Integración oficial con Mercado Pago para recibir señas y pagos anticipados. El dinero va directo a tu cuenta.
              </p>

              <div className="space-y-4">
                <PaymentItem
                  icon={<Wallet className="h-5 w-5" />}
                  title="Señas Configurables"
                  description="Define el porcentaje de seña que quieras: 10%, 20%, 50% o el monto que prefieras."
                />
                <PaymentItem
                  icon={<CreditCard className="h-5 w-5" />}
                  title="Todos los Medios de Pago"
                  description="Tarjetas, transferencias, dinero en cuenta y cuotas sin interés."
                />
                <PaymentItem
                  icon={<BadgeDollarSign className="h-5 w-5" />}
                  title="Cobro Instantáneo"
                  description="El dinero llega a tu cuenta de Mercado Pago al instante."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Security Visual */}
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-3xl p-8">
                <div className="bg-card rounded-xl border shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Seguridad Activada</h4>
                      <p className="text-sm text-muted-foreground">Tu cuenta está protegida</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2">
                        <Fingerprint className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium">Autenticación 2FA</span>
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium">Contraseña Segura</span>
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Email Verificado</span>
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-950/50 border border-green-100 dark:border-green-800 mb-6">
                <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Seguridad Empresarial</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                Tu información <span className="text-gradient">100% protegida</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Implementamos las mejores prácticas de seguridad para proteger tu negocio y los datos de tus clientes.
              </p>

              <div className="space-y-4">
                <SecurityItem
                  icon={<Fingerprint className="h-5 w-5" />}
                  title="Autenticación de Dos Factores (2FA)"
                  description="Protege tu cuenta con códigos TOTP usando Google Authenticator o similar."
                />
                <SecurityItem
                  icon={<Lock className="h-5 w-5" />}
                  title="Cambio Seguro de Contraseña"
                  description="Actualiza tu contraseña fácilmente con verificación de la actual."
                />
                <SecurityItem
                  icon={<Shield className="h-5 w-5" />}
                  title="Datos Encriptados"
                  description="Toda la información sensible se almacena de forma segura y encriptada."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Customers Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 dark:bg-pink-950/50 border border-pink-100 dark:border-pink-800 mb-6">
              <CalendarCheck className="h-4 w-4 text-pink-600 dark:text-pink-400" />
              <span className="text-sm font-medium text-pink-700 dark:text-pink-300">Experiencia del Cliente</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Reservas <span className="text-gradient">fáciles y rápidas</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Tus clientes podrán agendar turnos en segundos, sin necesidad de llamar o enviar mensajes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            <CustomerFeatureCard
              icon={<Scissors className="h-6 w-6" />}
              title="Elegir Servicio"
              description="Catálogo visual con descripciones, precios y duración de cada servicio."
              step="1"
            />
            <CustomerFeatureCard
              icon={<UserCog className="h-6 w-6" />}
              title="Seleccionar Profesional"
              description="Opción de elegir su empleado favorito o dejar que el sistema asigne."
              step="2"
            />
            <CustomerFeatureCard
              icon={<CalendarDays className="h-6 w-6" />}
              title="Fecha y Hora"
              description="Calendario interactivo mostrando solo los horarios disponibles en tiempo real."
              step="3"
            />
            <CustomerFeatureCard
              icon={<UserPlus className="h-6 w-6" />}
              title="Datos de Contacto"
              description="Formulario simple con nombre, teléfono y email (configurable)."
              step="4"
            />
            <CustomerFeatureCard
              icon={<CheckCircle2 className="h-6 w-6" />}
              title="Confirmación Instantánea"
              description="Resumen del turno con todos los detalles y confirmación inmediata."
              step="5"
            />
            <CustomerFeatureCard
              icon={<Bell className="h-6 w-6" />}
              title="Recordatorios"
              description="Notificaciones automáticas por email o WhatsApp antes del turno."
              step="6"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
              {t('landing.howItWorks.title')} <span className="text-gradient">{t('landing.howItWorks.titleHighlight')}</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('landing.howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
            <StepCard
              number="01"
              title={t('landing.howItWorks.step1.title')}
              description={t('landing.howItWorks.step1.description')}
            />
            <StepCard
              number="02"
              title={t('landing.howItWorks.step2.title')}
              description={t('landing.howItWorks.step2.description')}
            />
            <StepCard
              number="03"
              title={t('landing.howItWorks.step3.title')}
              description={t('landing.howItWorks.step3.description')}
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
              {t('landing.testimonials.title')} <span className="text-gradient">{t('landing.testimonials.titleHighlight')}</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            <TestimonialCard
              quote={t('landing.testimonials.testimonial1.quote')}
              author={t('landing.testimonials.testimonial1.author')}
              role={t('landing.testimonials.testimonial1.role')}
              rating={5}
            />
            <TestimonialCard
              quote={t('landing.testimonials.testimonial2.quote')}
              author={t('landing.testimonials.testimonial2.author')}
              role={t('landing.testimonials.testimonial2.role')}
              rating={5}
            />
            <TestimonialCard
              quote={t('landing.testimonials.testimonial3.quote')}
              author={t('landing.testimonials.testimonial3.author')}
              role={t('landing.testimonials.testimonial3.role')}
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-100 mb-6">
              <Star className="h-4 w-4 text-brand-600" />
              <span className="text-sm font-medium text-brand-700">{t('landing.pricing.badge')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
              {t('landing.pricing.title')} <span className="text-gradient">{t('landing.pricing.titleHighlight')}</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('landing.pricing.subtitle')}
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="bg-card rounded-3xl border-2 border-brand-200 dark:border-brand-400/30 shadow-soft-lg overflow-hidden">
              <div className="bg-gradient-primary p-8 text-center text-white">
                <h3 className="text-2xl font-bold mb-2">{t('landing.pricing.planName')}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold">$8.900</span>
                  <span className="text-white/80">/mes</span>
                </div>
                <p className="mt-2 text-white/80">Facturación mensual</p>
              </div>
              <div className="p-8">
                <ul className="space-y-3 mb-6">
                  {[
                    { text: t('landing.pricing.features.unlimited'), icon: Calendar },
                    { text: t('landing.pricing.features.customers'), icon: Users },
                    { text: 'Gestión de servicios y categorías', icon: Scissors },
                    { text: 'Empleados ilimitados', icon: UserCog },
                    { text: t('landing.pricing.features.notifications'), icon: Bell },
                    { text: t('landing.pricing.features.calendar'), icon: CalendarDays },
                    { text: t('landing.pricing.features.customPage'), icon: Palette },
                    { text: '5 estilos de fondo + modo oscuro', icon: Layers },
                    { text: t('landing.pricing.features.schedule'), icon: Clock },
                    { text: 'Días bloqueados y vacaciones', icon: Ban },
                    { text: 'Integración con Mercado Pago', icon: CreditCard },
                    { text: t('landing.pricing.features.reports'), icon: BarChart3 },
                    { text: 'Autenticación 2FA (TOTP)', icon: Shield },
                    { text: 'Multi-idioma (ES/EN)', icon: Languages },
                    { text: t('landing.pricing.features.support'), icon: MessageSquare },
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <feature.icon className="h-4 w-4 text-brand-500 flex-shrink-0" />
                      <span className="text-sm">{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register" className="block">
                  <Button size="lg" className="w-full bg-gradient-primary hover:opacity-90 shadow-glow text-lg h-14">
                    {t('landing.pricing.cta')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  {t('landing.pricing.trial')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-3xl bg-gradient-primary p-12 md:p-16 text-center text-white overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

              <div className="relative">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                  {t('landing.cta.title')}
                </h2>
                <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10">
                  {t('landing.cta.subtitle')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/register">
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8 h-14 bg-white text-brand-700 hover:bg-white/90">
                      {t('landing.cta.button')}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/bella-estetica">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 h-14 border-2 border-white/60 bg-transparent text-white hover:bg-white hover:text-slate-800 hover:border-white transition-all">
                      {t('landing.cta.demo')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">TurnoLink</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('landing.footer.description')}
              </p>
              <div className="mt-4">
                <LanguageSelector variant="button" showFlag showName />
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('landing.footer.product')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">{t('landing.nav.features')}</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">{t('landing.nav.pricing')}</a></li>
                <li><Link href="/demo-barberia" className="hover:text-foreground transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('landing.footer.company')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">{t('landing.footer.about')}</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">{t('landing.footer.contact')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('landing.footer.legal')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">{t('landing.footer.privacy')}</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">{t('landing.footer.terms')}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {t('landing.footer.copyright', { year: new Date().getFullYear() })}
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </LandingThemeWrapper>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="group relative bg-card rounded-2xl border p-6 lg:p-8 hover:border-brand-200 dark:hover:border-brand-400/50 hover:shadow-soft-lg transition-all duration-300">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary text-white text-2xl font-bold mb-6 shadow-glow">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function TestimonialCard({
  quote,
  author,
  role,
  rating,
}: {
  quote: string;
  author: string;
  role: string;
  rating: number;
}) {
  return (
    <div className="bg-card rounded-2xl border p-6 lg:p-8">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-lg mb-6 leading-relaxed">&ldquo;{quote}&rdquo;</p>
      <div>
        <p className="font-semibold">{author}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </div>
  );
}

function MiniFeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card rounded-xl border p-5 hover:border-brand-200 dark:hover:border-brand-400/50 hover:shadow-md transition-all duration-300">
      <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4">
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function CustomizationItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function SecurityItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
      <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 flex-shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function CustomerFeatureCard({
  icon,
  title,
  description,
  step,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  step: string;
}) {
  return (
    <div className="relative bg-card rounded-2xl border p-6 hover:border-pink-200 dark:hover:border-pink-400/50 hover:shadow-lg transition-all duration-300">
      <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
        {step}
      </div>
      <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400 mb-4 mt-2">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function PaymentItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
      <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 flex-shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
