'use client';

import { useEffect, useRef, useState } from 'react';
import { DeviceMockup, DashboardUI, CalendarUI } from './device-mockup';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Users,
  BarChart3,
  Settings,
  Bell,
  Palette,
} from 'lucide-react';

interface ProductShowcaseProps {
  className?: string;
}

export function ProductShowcase({ className }: ProductShowcaseProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'calendar'>('dashboard');
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-rotate views
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveView(prev => prev === 'dashboard' ? 'calendar' : 'dashboard');
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Calendar,
      title: 'Calendario Inteligente',
      description: 'Vista diaria, semanal y mensual con drag & drop',
    },
    {
      icon: Users,
      title: 'Gestión de Clientes',
      description: 'CRM completo con historial de visitas',
    },
    {
      icon: BarChart3,
      title: 'Reportes en Tiempo Real',
      description: 'Metricas de rendimiento y facturación',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className={cn('py-20 md:py-32 overflow-hidden', className)}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-100 mb-6">
            <Settings className="h-4 w-4 text-brand-600" />
            <span className="text-sm font-medium text-brand-700">Panel de Control</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Diseñado para hacer{' '}
            <span className="text-gradient">crecer tu negocio</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Un dashboard completo e intuitivo con todas las herramientas que necesitas
            para gestionar tu agenda de forma profesional.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 bg-muted rounded-xl">
            <button
              onClick={() => setActiveView('dashboard')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeView === 'dashboard'
                  ? 'bg-white dark:bg-neutral-800 shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveView('calendar')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeView === 'calendar'
                  ? 'bg-white dark:bg-neutral-800 shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Calendario
            </button>
          </div>
        </div>

        {/* MacBook Showcase */}
        <div
          className={cn(
            'relative transition-all duration-1000',
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-16'
          )}
        >
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-br from-teal-500/20 via-violet-500/20 to-blue-500/20 rounded-full blur-3xl opacity-60" />
          </div>

          {/* Device */}
          <div className="relative z-10 max-w-5xl mx-auto">
            <DeviceMockup device="macbook" animate={false}>
              <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-800 dark:to-neutral-900 p-4 lg:p-6 transition-all duration-500">
                {activeView === 'dashboard' ? (
                  <DashboardUI />
                ) : (
                  <CalendarUI />
                )}
              </div>
            </DeviceMockup>
          </div>
        </div>

        {/* Features below */}
        <div
          className={cn(
            'grid md:grid-cols-3 gap-6 mt-12 md:mt-16 transition-all duration-1000 delay-300',
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          )}
        >
          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative bg-card rounded-2xl border p-6 hover:border-brand-200 dark:hover:border-brand-400/50 hover:shadow-soft-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Additional showcase component showing multiple features
export function FeatureShowcase({ className }: { className?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Palette,
      title: 'Personalización Total',
      description: 'Adapta cada detalle a tu marca con colores, logos y estilos únicos.',
      gradient: 'from-purple-500 to-teal-500',
    },
    {
      icon: Bell,
      title: 'Notificaciones Inteligentes',
      description: 'Recordatorios automáticos por email y WhatsApp para reducir no-shows.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: BarChart3,
      title: 'Analytics Avanzado',
      description: 'Reportes detallados de ingresos, ocupación y rendimiento del equipo.',
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <section ref={sectionRef} className={cn('py-20 md:py-32 bg-muted/30', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div
            className={cn(
              'transition-all duration-1000',
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            )}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-100 mb-6">
              <BarChart3 className="h-4 w-4 text-brand-600" />
              <span className="text-sm font-medium text-brand-700">Funcionalidades Premium</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
              Herramientas profesionales{' '}
              <span className="text-gradient">para tu éxito</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Cada función está diseñada para ahorrarte tiempo y ayudarte a brindar
              una experiencia excepcional a tus clientes.
            </p>

            <div className="space-y-4">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-xl bg-card border hover:border-brand-200 dark:hover:border-brand-400/50 transition-colors"
                >
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0',
                    `bg-gradient-to-br ${feature.gradient}`
                  )}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mockup */}
          <div
            className={cn(
              'transition-all duration-1000 delay-200',
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            )}
          >
            <div className="relative">
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-violet-500/20 to-blue-500/20 rounded-3xl blur-2xl" />

              {/* Device */}
              <div className="relative">
                <DeviceMockup device="ipad" animate>
                  <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-800 dark:to-neutral-900 p-6">
                    <CalendarUI />
                  </div>
                </DeviceMockup>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
