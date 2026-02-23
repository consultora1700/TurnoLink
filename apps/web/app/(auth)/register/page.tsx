'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar, Loader2, Rocket, CheckCircle2, ArrowLeft, UserCog, Building2, Briefcase, Star, Users, Search, Send } from 'lucide-react';
import { authApi } from '@/lib/api';

type AccountIntent = 'business' | 'professional' | null;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intentParam = searchParams.get('intent');
  const rawCallback = searchParams.get('callbackUrl') || '/dashboard';
  const safeCallbackUrl = rawCallback.startsWith('/') ? rawCallback : '/dashboard';

  // If intent=talent or intent=business in URL, start with business form directly
  // intent=talent is kept for backward compat — maps to business
  const [intent, setIntent] = useState<AccountIntent>(
    intentParam === 'talent' || intentParam === 'business' ? 'business' : intentParam === 'professional' ? 'professional' : null
  );

  // Business form data
  const [businessForm, setBusinessForm] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    businessSlug: '',
  });

  // Professional form data
  const [professionalForm, setProfessionalForm] = useState({
    name: '',
    email: '',
    password: '',
    specialty: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBusinessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBusinessForm((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === 'businessName') {
        newData.businessSlug = slugify(value);
      }
      return newData;
    });
  };

  const handleProfessionalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfessionalForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.register({
        name: businessForm.name,
        email: businessForm.email,
        password: businessForm.password,
        businessName: businessForm.businessName || undefined,
        businessSlug: businessForm.businessSlug || undefined,
        accountType: 'BUSINESS',
      });

      const result = await signIn('credentials', {
        email: businessForm.email,
        password: businessForm.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push(safeCallbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleProfessionalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.register({
        name: professionalForm.name,
        email: professionalForm.email,
        password: professionalForm.password,
        accountType: 'PROFESSIONAL',
        specialty: professionalForm.specialty || undefined,
      });

      const result = await signIn('credentials', {
        email: professionalForm.email,
        password: professionalForm.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push('/mi-perfil');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  // Determine the right login link
  const loginHref = `/login${safeCallbackUrl !== '/dashboard' ? `?callbackUrl=${encodeURIComponent(safeCallbackUrl)}` : ''}`;

  // ─── Error banner ─────────────────────────────────────────
  const errorBanner = error ? (
    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm p-3 rounded-lg flex items-center gap-2">
      <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
        <span className="text-red-500 dark:text-red-400 text-xs">!</span>
      </div>
      {error}
    </div>
  ) : null;

  // ─── Intent Selection (Step 0) ────────────────────────────
  const renderIntentSelection = () => (
    <div className="w-full max-w-lg relative z-10 px-2">
      {/* Logo + Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center justify-center gap-2 mb-5">
          <img src="/claro2.png" alt="TurnoLink" className="h-24 w-auto dark:hidden" />
          <img src="/oscuro2.png" alt="TurnoLink" className="h-24 w-auto hidden dark:block" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Crea tu cuenta gratis
        </h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Elegí cómo querés usar TurnoLink
        </p>
      </div>

      {/* Option Cards */}
      <div className="space-y-4">
        {/* Business Option */}
        <button
          onClick={() => setIntent('business')}
          className="w-full text-left rounded-2xl border-2 border-slate-200 dark:border-neutral-700 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm shadow-lg hover:border-primary hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group overflow-hidden"
        >
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-teal-500/20 flex items-center justify-center shrink-0 group-hover:from-primary/30 group-hover:to-teal-500/30 transition-colors">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                  Soy un negocio
                </h3>
                <p className="text-sm text-muted-foreground">
                  Gestioná turnos y encontrá talento
                </p>
              </div>
              <ArrowLeft className="h-5 w-5 text-muted-foreground/40 rotate-180 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                <span>Gestión de turnos</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Search className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                <span>Explorar talento</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Users className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                <span>Clientes y equipo</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Send className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                <span>Enviar propuestas</span>
              </div>
            </div>
          </div>
        </button>

        {/* Professional Option */}
        <button
          onClick={() => setIntent('professional')}
          className="w-full text-left rounded-2xl border-2 border-slate-200 dark:border-neutral-700 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm shadow-lg hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group overflow-hidden"
        >
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center shrink-0 group-hover:from-emerald-500/30 group-hover:to-teal-500/30 transition-colors">
                <Briefcase className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Soy profesional
                </h3>
                <p className="text-sm text-muted-foreground">
                  Publicá tu perfil y recibí propuestas
                </p>
              </div>
              <ArrowLeft className="h-5 w-5 text-muted-foreground/40 rotate-180 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all shrink-0" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Star className="h-3.5 w-3.5 text-emerald-500/70 shrink-0" />
                <span>Perfil profesional</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5 text-emerald-500/70 shrink-0" />
                <span>Propuestas de trabajo</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/70 shrink-0" />
                <span>Mostrá tu experiencia</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Rocket className="h-3.5 w-3.5 text-emerald-500/70 shrink-0" />
                <span>100% gratis</span>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Login link */}
      <p className="text-sm text-muted-foreground text-center mt-6">
        ¿Ya tenés cuenta?{' '}
        <Link href={loginHref} className="text-primary font-semibold hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );

  // ─── Business Form ────────────────────────────────────────
  const renderBusinessForm = () => (
    <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 dark:bg-neutral-800/90 backdrop-blur-sm relative z-10">
      <CardHeader className="text-center pb-2">
        <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
          <img src="/claro2.png" alt="TurnoLink" className="h-28 w-auto dark:hidden" />
          <img src="/oscuro2.png" alt="TurnoLink" className="h-28 w-auto hidden dark:block" />
        </Link>
        <CardTitle className="text-2xl">Crea tu cuenta</CardTitle>
        <CardDescription>
          Registra tu negocio y comienza a recibir turnos online
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleBusinessSubmit}>
        <CardContent className="space-y-4">
          {errorBanner}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tu nombre</Label>
              <Input
                id="name"
                name="name"
                placeholder="Juan Pérez"
                value={businessForm.name}
                onChange={handleBusinessChange}
                required
                disabled={loading}
                className="h-11 bg-white dark:bg-neutral-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={businessForm.email}
                onChange={handleBusinessChange}
                required
                disabled={loading}
                className="h-11 bg-white dark:bg-neutral-700"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={businessForm.password}
              onChange={handleBusinessChange}
              minLength={8}
              required
              disabled={loading}
              className="h-11 bg-white dark:bg-neutral-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessName">Nombre de tu negocio <span className="text-muted-foreground font-normal">(opcional)</span></Label>
            <Input
              id="businessName"
              name="businessName"
              placeholder="Mi Barbería"
              value={businessForm.businessName}
              onChange={handleBusinessChange}
              disabled={loading}
              className="h-11 bg-white dark:bg-neutral-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessSlug">URL de tu página <span className="text-muted-foreground font-normal">(opcional)</span></Label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground bg-slate-100 dark:bg-neutral-700 px-3 py-2.5 rounded-l-lg border border-r-0">
                turnolink.app/
              </span>
              <Input
                id="businessSlug"
                name="businessSlug"
                placeholder="mi-barberia"
                value={businessForm.businessSlug}
                onChange={handleBusinessChange}
                pattern="^[a-z0-9-]*$"
                disabled={loading}
                className="h-11 bg-white flex-1 rounded-l-none"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Solo letras minúsculas, números y guiones. Se genera automáticamente si lo dejás vacío.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              <>
                <Rocket className="mr-2 h-4 w-4" />
                Crear Cuenta Gratis
              </>
            )}
          </Button>
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => { setIntent(null); setError(''); }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver
            </button>
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <Link href={loginHref} className="text-primary font-medium hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </CardFooter>
      </form>
    </Card>
  );

  // ─── Professional Form ───────────────────────────────────
  const renderProfessionalForm = () => (
    <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 dark:bg-neutral-800/90 backdrop-blur-sm relative z-10">
      <CardHeader className="text-center pb-2">
        <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
          <img src="/claro2.png" alt="TurnoLink" className="h-28 w-auto dark:hidden" />
          <img src="/oscuro2.png" alt="TurnoLink" className="h-28 w-auto hidden dark:block" />
        </Link>
        <CardTitle className="text-2xl">Perfil profesional</CardTitle>
        <CardDescription>
          Creá tu perfil y empezá a recibir propuestas de trabajo
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleProfessionalSubmit}>
        <CardContent className="space-y-4">
          {errorBanner}
          <div className="space-y-2">
            <Label htmlFor="pro-name">Tu nombre completo</Label>
            <Input
              id="pro-name"
              name="name"
              placeholder="Juan Pérez"
              value={professionalForm.name}
              onChange={handleProfessionalChange}
              required
              disabled={loading}
              className="h-11 bg-white dark:bg-neutral-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pro-email">Email</Label>
            <Input
              id="pro-email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              value={professionalForm.email}
              onChange={handleProfessionalChange}
              required
              disabled={loading}
              className="h-11 bg-white dark:bg-neutral-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pro-password">Contraseña</Label>
            <Input
              id="pro-password"
              name="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={professionalForm.password}
              onChange={handleProfessionalChange}
              minLength={8}
              required
              disabled={loading}
              className="h-11 bg-white dark:bg-neutral-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pro-specialty">Especialidad <span className="text-muted-foreground font-normal">(opcional)</span></Label>
            <Input
              id="pro-specialty"
              name="specialty"
              placeholder="Ej: Estilista, Masajista, Desarrollador..."
              value={professionalForm.specialty}
              onChange={handleProfessionalChange}
              disabled={loading}
              className="h-11 bg-white dark:bg-neutral-700"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-emerald-600 to-primary hover:from-emerald-600/90 hover:to-primary/90"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              <>
                <UserCog className="mr-2 h-4 w-4" />
                Crear Cuenta Gratis
              </>
            )}
          </Button>
          <div className="flex items-center justify-between w-full">
            {!intentParam && (
              <button
                type="button"
                onClick={() => { setIntent(null); setError(''); }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver
              </button>
            )}
            <p className={`text-sm text-muted-foreground ${intentParam ? 'w-full text-center' : ''}`}>
              ¿Ya tienes cuenta?{' '}
              <Link href={loginHref} className="text-primary font-medium hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </CardFooter>
      </form>
    </Card>
  );

  // ─── Right panel content based on intent ──────────────────
  const isProfessionalIntent = intent === 'professional';

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 px-4 py-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl" />

        {intent === null && renderIntentSelection()}
        {intent === 'business' && renderBusinessForm()}
        {intent === 'professional' && renderProfessionalForm()}
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-teal-500/20" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/30 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="flex items-center gap-3 mb-8">
            <img
              src="/oscuro2.png"
              alt="TurnoLink"
              className="h-28 w-auto"
            />
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4">
            {isProfessionalIntent ? 'Mostrá tu talento al mundo' : 'Comienza gratis hoy'}
          </h1>
          <p className="text-lg text-white/70 mb-10">
            {isProfessionalIntent
              ? 'Publicá tu perfil y recibí propuestas de negocios que buscan tu talento.'
              : 'Únete a miles de negocios que ya gestionan sus turnos con nosotros.'}
          </p>

          <div className="space-y-4">
            {isProfessionalIntent ? (
              <>
                <div className="flex items-center gap-3 text-white/80">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span>Perfil profesional visible</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span>Recibí propuestas de trabajo</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span>Mostrá tu experiencia y habilidades</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span>100% gratis</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 text-white/80">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span>Sin costo de inicio</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span>Configuración en minutos</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span>Soporte incluido</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span>Cancela cuando quieras</span>
                </div>
              </>
            )}
          </div>

          {/* Testimonial */}
          <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10">
            {isProfessionalIntent ? (
              <>
                <p className="text-white/80 italic mb-4">
                  "Publiqué mi perfil y en dos semanas ya tenía tres propuestas de salones que buscaban mi especialidad."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                    C
                  </div>
                  <div>
                    <p className="text-white font-medium">Carolina Ruiz</p>
                    <p className="text-white/60 text-sm">Estilista profesional</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-white/80 italic mb-4">
                  "Desde que uso TurnoLink, mis clientes pueden reservar 24/7 y la organización de mi negocio mejoró un 100%"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-semibold">
                    M
                  </div>
                  <div>
                    <p className="text-white font-medium">María González</p>
                    <p className="text-white/60 text-sm">Dueña de Estética Bella</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
