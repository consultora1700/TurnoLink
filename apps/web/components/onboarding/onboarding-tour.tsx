'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Briefcase,
  Users,
  Clock,
  ExternalLink,
  PartyPopper,
  RotateCcw,
  Settings,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  route?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  isLast?: boolean;
  gradient?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: '¡Bienvenido a TurnoLink!',
    description: 'Te guiaremos para configurar tu negocio y empezar a recibir reservas online.',
    icon: <Sparkles className="h-6 w-6" />,
    actionLabel: 'Comenzar',
    gradient: 'from-primary to-teal-500',
  },
  {
    id: 'services',
    title: 'Crea tus Servicios',
    description: 'Agrega los servicios que ofreces con su precio y duración.',
    target: '[data-tour="services-section"]',
    route: '/servicios',
    icon: <Briefcase className="h-6 w-6" />,
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'employees',
    title: 'Agrega tu Equipo',
    description: 'Registra a las personas que atienden en tu negocio.',
    target: '[data-tour="employees-section"]',
    route: '/empleados',
    icon: <Users className="h-6 w-6" />,
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    id: 'schedules',
    title: 'Define tus Horarios',
    description: 'Configura los días y horarios en que atiendes.',
    target: '[data-tour="schedules-section"]',
    route: '/horarios',
    icon: <Clock className="h-6 w-6" />,
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    id: 'public-url',
    title: 'Tu Link de Reservas',
    description: 'Este es tu link público. ¡Compartilo con tus clientes!',
    target: '[data-tour="public-url"]',
    route: '/configuracion',
    icon: <ExternalLink className="h-6 w-6" />,
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'business-info',
    title: 'Configura tu Negocio',
    description: 'Completa tu información: nombre, teléfono y dirección.',
    target: '[data-tour="business-info"]',
    route: '/configuracion',
    icon: <Settings className="h-6 w-6" />,
    gradient: 'from-slate-500 to-slate-600',
  },
  {
    id: 'complete',
    title: '¡Todo Listo!',
    description: 'Ya conoces lo básico de TurnoLink. ¡Éxitos con tu negocio!',
    icon: <PartyPopper className="h-6 w-6" />,
    actionLabel: 'Finalizar',
    isLast: true,
    gradient: 'from-green-500 to-emerald-500',
  },
];

const STORAGE_KEY = 'turnolink_tour_done';

interface OnboardingTourProps {
  forceShow?: boolean;
  onComplete?: () => void;
}

export function OnboardingTour({ forceShow = false, onComplete }: OnboardingTourProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [mounted, setMounted] = useState(false);

  const step = TOUR_STEPS[stepIndex];
  const isCenter = !step.target;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mostrar tour
  useEffect(() => {
    if (!mounted) return;

    if (forceShow) {
      localStorage.removeItem(STORAGE_KEY);
      setStepIndex(0);
      setShow(true);
      return;
    }

    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      setTimeout(() => setShow(true), 600);
    }
  }, [forceShow, mounted]);

  // Bloquear scroll del body
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [show]);

  // Navegar a ruta si es necesario
  useEffect(() => {
    if (!show || isNavigating) return;

    if (step?.route && pathname !== step.route) {
      setIsNavigating(true);
      setTargetRect(null);
      router.push(step.route);
      setTimeout(() => setIsNavigating(false), 800);
    }
  }, [show, stepIndex, pathname, step, router, isNavigating]);

  // Encontrar elemento target
  const findTarget = useCallback(() => {
    if (!step?.target) {
      setTargetRect(null);
      return;
    }

    const el = document.querySelector(step.target);
    if (el) {
      // Scroll into view first
      el.scrollIntoView({ behavior: 'instant', block: 'center' });

      // Small delay to let scroll settle
      setTimeout(() => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setTargetRect(rect);
        } else {
          setTargetRect(null);
        }
      }, 100);
    } else {
      setTargetRect(null);
    }
  }, [step]);

  useEffect(() => {
    if (!show || isNavigating) return;
    const timer = setTimeout(findTarget, 400);
    return () => clearTimeout(timer);
  }, [show, stepIndex, isNavigating, findTarget, pathname]);

  const next = () => {
    if (stepIndex < TOUR_STEPS.length - 1) {
      setTargetRect(null);
      setStepIndex(s => s + 1);
    }
  };

  const prev = () => {
    if (stepIndex > 0) {
      setTargetRect(null);
      setStepIndex(s => s - 1);
    }
  };

  const close = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShow(false);
    onComplete?.();
  };

  if (!show || !mounted) return null;

  const gradient = step.gradient || 'from-primary to-teal-500';

  // Calcular posición del tooltip
  const getTooltipStyle = (): React.CSSProperties => {
    // Modal centrado para pasos sin target
    if (isCenter || !targetRect) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const tooltipHeight = 240;
    const margin = 20;
    const bottomSafe = 100; // Espacio para nav móvil

    // Verificar si hay espacio abajo del elemento
    const spaceBelow = window.innerHeight - targetRect.bottom - bottomSafe;
    const spaceAbove = targetRect.top;

    if (spaceBelow >= tooltipHeight + margin) {
      // Mostrar abajo
      return {
        position: 'fixed',
        top: targetRect.bottom + margin,
        left: 16,
        right: 16,
      };
    } else if (spaceAbove >= tooltipHeight + margin) {
      // Mostrar arriba
      return {
        position: 'fixed',
        top: targetRect.top - tooltipHeight - margin,
        left: 16,
        right: 16,
      };
    } else {
      // Si no hay espacio, centrar verticalmente
      return {
        position: 'fixed',
        top: '50%',
        left: 16,
        right: 16,
        transform: 'translateY(-50%)',
      };
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay semi-transparente SIN blur */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={close}
      />

      {/* Spotlight - hueco transparente sobre el elemento */}
      {targetRect && !isCenter && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            borderRadius: 12,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
            border: '3px solid #ec4899',
          }}
        />
      )}

      {/* Tooltip Card - posición fija, sin animaciones */}
      <div
        className={cn(
          "bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden",
          "max-w-[360px] w-[calc(100%-32px)]",
          "border border-neutral-200 dark:border-neutral-700"
        )}
        style={getTooltipStyle()}
      >
        {/* Header con gradiente */}
        <div className={cn("h-1.5 bg-gradient-to-r", gradient)} />

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pt-4 pb-2">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full",
                i === stepIndex
                  ? cn("w-6 bg-gradient-to-r", gradient)
                  : i < stepIndex
                    ? "w-1.5 bg-green-500"
                    : "w-1.5 bg-neutral-300 dark:bg-neutral-600"
              )}
            />
          ))}
        </div>

        {/* Contenido */}
        <div className="px-5 pb-5">
          {/* Icono y título */}
          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg flex-shrink-0",
              gradient
            )}>
              {step.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium">
                Paso {stepIndex + 1} de {TOUR_STEPS.length}
              </p>
              <h3 className="font-bold text-lg text-foreground leading-tight">
                {step.title}
              </h3>
            </div>
            <button
              onClick={close}
              className="p-2 -mr-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Descripción */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            {step.description}
          </p>

          {/* Botones */}
          <div className="flex gap-2">
            {stepIndex > 0 && (
              <Button
                variant="outline"
                onClick={prev}
                className="flex-1 h-11 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Anterior
              </Button>
            )}

            <Button
              onClick={step.isLast ? close : next}
              className={cn(
                "flex-1 h-11 font-medium text-white shadow-lg",
                "bg-gradient-to-r hover:opacity-90",
                gradient
              )}
            >
              {step.isLast ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  {step.actionLabel || 'Finalizar'}
                </>
              ) : (
                <>
                  {step.actionLabel || 'Siguiente'}
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function RestartTourButton({ className }: { className?: string }) {
  const restart = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = '/dashboard';
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={restart}
      className={cn("gap-2", className)}
    >
      <RotateCcw className="h-4 w-4" />
      Repetir tour
    </Button>
  );
}
