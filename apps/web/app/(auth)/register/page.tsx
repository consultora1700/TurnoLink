'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Calendar, Loader2, Link2, Sparkles, Shield, CheckCircle2, Rocket } from 'lucide-react';
import { authApi } from '@/lib/api';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    businessSlug: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      // Auto-generate slug from business name
      if (name === 'businessName') {
        newData.businessSlug = slugify(value);
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.register(formData);

      // Auto login after register
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-pink-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 px-4 py-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/5 dark:bg-pink-500/10 rounded-full blur-3xl" />

        <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 dark:bg-neutral-800/90 backdrop-blur-sm relative z-10">
          <CardHeader className="text-center pb-2">
            <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-pink-600 flex items-center justify-center">
                <Link2 className="h-6 w-6 text-white" />
              </div>
            </Link>
            <CardTitle className="text-2xl">Crea tu cuenta</CardTitle>
            <CardDescription>
              Registra tu negocio y comienza a recibir turnos online
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm p-3 rounded-lg flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-500 dark:text-red-400 text-xs">!</span>
                  </div>
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tu nombre</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Juan Pérez"
                    value={formData.name}
                    onChange={handleChange}
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
                    value={formData.email}
                    onChange={handleChange}
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
                  value={formData.password}
                  onChange={handleChange}
                  minLength={8}
                  required
                  disabled={loading}
                  className="h-11 bg-white dark:bg-neutral-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessName">Nombre de tu negocio</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  placeholder="Mi Barbería"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="h-11 bg-white dark:bg-neutral-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessSlug">URL de tu página</Label>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground bg-slate-100 dark:bg-neutral-700 px-3 py-2.5 rounded-l-lg border border-r-0">
                    turnolink.app/
                  </span>
                  <Input
                    id="businessSlug"
                    name="businessSlug"
                    placeholder="mi-barberia"
                    value={formData.businessSlug}
                    onChange={handleChange}
                    pattern="^[a-z0-9-]+$"
                    required
                    disabled={loading}
                    className="h-11 bg-white flex-1 rounded-l-none"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Solo letras minúsculas, números y guiones
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-primary to-pink-600 hover:from-primary/90 hover:to-pink-600/90"
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
              <p className="text-sm text-muted-foreground text-center">
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Iniciar sesión
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-pink-500/20" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/30 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-pink-600 flex items-center justify-center">
              <Link2 className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">TurnoLink</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4">
            Comienza gratis hoy
          </h1>
          <p className="text-lg text-white/70 mb-10">
            Únete a miles de negocios que ya gestionan sus turnos con nosotros.
          </p>

          <div className="space-y-4">
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
          </div>

          {/* Testimonial */}
          <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10">
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
          </div>
        </div>
      </div>
    </div>
  );
}
