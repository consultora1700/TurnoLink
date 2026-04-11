'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
  Scissors,
  Stethoscope,
  Scale,
  Dumbbell,
  Home,
  Brain,
  Calculator,
  Building2,
  Landmark,
  ShoppingBag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createApiClient } from '@/lib/api';
import { RUBRO_MAP, RUBRO_TERMS, type RubroTerms } from '@/lib/tenant-config';

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
  customContent?: boolean;
}

const INDUSTRIES = [
  { id: 'beauty', label: 'Belleza', icon: Scissors, layout: 'employee_first', gradient: 'from-pink-500 to-rose-500' },
  { id: 'health', label: 'Salud', icon: Stethoscope, layout: 'specialty_first', gradient: 'from-emerald-500 to-teal-500' },
  { id: 'psychology', label: 'Psicología', icon: Brain, layout: 'service_first', gradient: 'from-violet-500 to-purple-500' },
  { id: 'legal', label: 'Derecho', icon: Scale, layout: 'specialty_first', gradient: 'from-amber-500 to-orange-500' },
  { id: 'accounting', label: 'Contabilidad', icon: Calculator, layout: 'service_first', gradient: 'from-blue-500 to-indigo-500' },
  { id: 'fitness', label: 'Deporte', icon: Dumbbell, layout: 'service_first', gradient: 'from-lime-500 to-green-500' },
  { id: 'lodging', label: 'Alojamiento', icon: Home, layout: 'service_first', gradient: 'from-cyan-500 to-sky-500' },
  { id: 'marketplace', label: 'Mercado', icon: ShoppingBag, layout: 'service_first', gradient: 'from-amber-400 to-amber-600' },
  { id: 'realestate', label: 'Inmobiliaria', icon: Landmark, layout: 'service_first', gradient: 'from-stone-500 to-stone-600' },
  { id: 'generic', label: 'Otro', icon: Building2, layout: 'employee_first', gradient: 'from-slate-500 to-slate-600' },
];

function getTourSteps(terms?: RubroTerms, clientLabel?: string): TourStep[] {
  const svcPlural = terms?.servicePlural || 'Servicios';
  const empPlural = terms?.employeePlural || 'Equipo';
  const bookPlural = terms?.bookingPlural.toLowerCase() || 'reservas';
  const clients = clientLabel?.toLowerCase() || 'clientes';

  return [
    {
      id: 'welcome',
      title: '¡Bienvenido a TurnoLink!',
      description: `Te guiaremos para configurar tu negocio y empezar a recibir ${bookPlural} online.`,
      icon: <Sparkles className="h-6 w-6" />,
      actionLabel: 'Comenzar',
      gradient: 'from-primary to-teal-500',
    },
    {
      id: 'industry',
      title: '¿A qué te dedicás?',
      description: 'Elegí tu rubro y te pre-configuramos todo: terminología, layout y sugerencias.',
      icon: <Briefcase className="h-6 w-6" />,
      gradient: 'from-indigo-500 to-purple-500',
      customContent: true,
    },
    {
      id: 'services',
      title: `Crea tus ${svcPlural}`,
      description: `Agrega ${svcPlural.toLowerCase()} que ofreces con su precio y duración.`,
      target: '[data-tour="services-section"]',
      route: '/servicios',
      icon: <Briefcase className="h-6 w-6" />,
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'employees',
      title: `Agrega tus ${empPlural}`,
      description: `Registra a ${empPlural.toLowerCase()} que atienden en tu negocio.`,
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
      title: `Tu Link de ${terms?.bookingPlural || 'Reservas'}`,
      description: `Este es tu link público. ¡Compartilo con tus ${clients}!`,
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
}

const TOUR_RUBRO_MAP: Record<string, string> = {
  'beauty': 'estetica-belleza',
  'health': 'salud',
  'psychology': 'psicologia',
  'legal': 'consultoria',
  'accounting': 'consultoria',
  'fitness': 'fitness',
  'lodging': 'hospedaje',
  'marketplace': 'mercado',
  'realestate': 'inmobiliarias',
  'generic': 'otro',
};

// Items ocultos por defecto según rubro (mirror de auth.service.ts — keep in sync)
const TALENTO_HREFS = ['/talento', '/talento/propuestas', '/talento/ofertas'];
const ADVANCED_HREFS = ['/integracion'];
const CATALOGO_HREFS = ['/catalogo', '/categorias-productos', '/pedidos', '/mi-tienda'];

const RUBRO_HIDDEN_SECTIONS_MAP: Record<string, string[]> = {
  'estetica-belleza': ['/especialidades', '/sucursales', '/videollamadas', ...TALENTO_HREFS, ...ADVANCED_HREFS, ...CATALOGO_HREFS],
  'barberia':         ['/especialidades', '/sucursales', '/videollamadas', ...TALENTO_HREFS, ...ADVANCED_HREFS, ...CATALOGO_HREFS],
  'masajes-spa':      ['/especialidades', '/sucursales', '/videollamadas', ...TALENTO_HREFS, ...ADVANCED_HREFS, ...CATALOGO_HREFS],
  'tatuajes-piercing':['/especialidades', '/formularios', '/sucursales', '/videollamadas', ...TALENTO_HREFS, ...ADVANCED_HREFS, ...CATALOGO_HREFS],
  'salud':            ['/sucursales', ...TALENTO_HREFS, ...ADVANCED_HREFS, ...CATALOGO_HREFS],
  'odontologia':      ['/especialidades', '/sucursales', '/videollamadas', ...TALENTO_HREFS, ...ADVANCED_HREFS, ...CATALOGO_HREFS],
  'psicologia':       ['/especialidades', '/empleados', '/sucursales', ...TALENTO_HREFS, ...ADVANCED_HREFS, ...CATALOGO_HREFS],
  'nutricion':        ['/especialidades', '/empleados', '/sucursales', ...TALENTO_HREFS, ...ADVANCED_HREFS, ...CATALOGO_HREFS],
  'veterinaria':      ['/especialidades', '/sucursales', '/videollamadas', ...TALENTO_HREFS, ...ADVANCED_HREFS, ...CATALOGO_HREFS],
  'fitness':          ['/especialidades', '/formularios', '/sucursales', '/videollamadas', ...TALENTO_HREFS, ...ADVANCED_HREFS, ...CATALOGO_HREFS],
  'deportes':         ['/empleados', '/especialidades', '/formularios', '/sucursales', '/videollamadas', ...TALENTO_HREFS, ...ADVANCED_HREFS, ...CATALOGO_HREFS],
  'hospedaje':        ['/empleados', '/especialidades', '/formularios', '/sucursales', '/videollamadas', ...TALENTO_HREFS, ...ADVANCED_HREFS, ...CATALOGO_HREFS],
  'alquiler':         ['/empleados', '/especialidades', '/formularios', '/sucursales', '/videollamadas', ...TALENTO_HREFS, ...ADVANCED_HREFS, ...CATALOGO_HREFS],
  'espacios':         ['/empleados', '/especialidades', '/formularios', '/sucursales', '/videollamadas', ...TALENTO_HREFS, ...ADVANCED_HREFS, ...CATALOGO_HREFS],
  'educacion':        ['/especialidades', '/sucursales', ...TALENTO_HREFS, ...ADVANCED_HREFS, ...CATALOGO_HREFS],
  'consultoria':      ['/sucursales', ...TALENTO_HREFS, ...ADVANCED_HREFS, ...CATALOGO_HREFS],
  'inmobiliarias':    ['/autogestion', '/turnos', '/servicios', '/empleados', '/especialidades', '/formularios', '/horarios', '/videollamadas', '/sucursales', ...TALENTO_HREFS, ...ADVANCED_HREFS],
  'mercado':          ['/autogestion', '/turnos', '/servicios', '/empleados', '/especialidades', '/formularios', '/horarios', '/videollamadas', '/sucursales', ...TALENTO_HREFS, ...ADVANCED_HREFS],
  'otro':             [...TALENTO_HREFS, ...ADVANCED_HREFS],
};

const STORAGE_KEY = 'turnolink_tour_done';

interface OnboardingTourProps {
  forceShow?: boolean;
  onComplete?: () => void;
}

export function OnboardingTour({ forceShow = false, onComplete }: OnboardingTourProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [show, setShow] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [savingIndustry, setSavingIndustry] = useState(false);

  // Compute terms based on selected industry for dynamic step text
  const rubroKey = selectedIndustry ? TOUR_RUBRO_MAP[selectedIndustry] : undefined;
  const tourTerms = rubroKey ? RUBRO_TERMS[rubroKey] : undefined;
  const tourClientLabel = rubroKey ? RUBRO_MAP[rubroKey]?.suggestedTerminology?.plural : undefined;
  const tourSteps = getTourSteps(tourTerms, tourClientLabel);

  const step = tourSteps[stepIndex];
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

  const saveIndustryConfig = async () => {
    if (!selectedIndustry || !session?.accessToken) return;
    setSavingIndustry(true);
    try {
      const industry = INDUSTRIES.find(i => i.id === selectedIndustry);
      if (!industry) return;

      const api = createApiClient(session.accessToken as string);
      const configPayload: Record<string, unknown> = {};

      // Set layout based on industry
      configPayload.publicPageLayout = industry.layout;

      // Set rubro + terminology + fichas inside settings (not top-level)
      const rubroKey = TOUR_RUBRO_MAP[selectedIndustry];
      if (rubroKey) {
        const rubroConfig = RUBRO_MAP[rubroKey];
        const settingsUpdate: Record<string, unknown> = { rubro: rubroKey };
        if (rubroConfig) {
          settingsUpdate.clientLabelSingular = rubroConfig.suggestedTerminology.singular;
          settingsUpdate.clientLabelPlural = rubroConfig.suggestedTerminology.plural;
          settingsUpdate.enabledFichas = rubroConfig.suggestedFichas;
        }
        // hospedaje/alquiler → DAILY booking mode
        if (rubroKey === 'hospedaje' || rubroKey === 'alquiler') {
          settingsUpdate.bookingMode = 'DAILY';
        }
        // Auto-configurar secciones ocultas según rubro
        settingsUpdate.hiddenSections = RUBRO_HIDDEN_SECTIONS_MAP[rubroKey] || [];
        configPayload.settings = JSON.stringify(settingsUpdate);
      }

      // Set terminology preset (skip for generic)
      if (selectedIndustry !== 'generic') {
        configPayload.publicPageConfig = JSON.stringify({ terminology: selectedIndustry });
      }

      await api.updateTenant(configPayload);
    } catch {
      // Non-critical — continue the tour even if this fails
    } finally {
      setSavingIndustry(false);
    }
  };

  const next = async () => {
    // If on industry step, save config before advancing
    if (step.id === 'industry' && selectedIndustry) {
      await saveIndustryConfig();
    }
    if (stepIndex < tourSteps.length - 1) {
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
          step.customContent ? "max-w-[420px] w-[calc(100%-32px)]" : "max-w-[360px] w-[calc(100%-32px)]",
          "border border-neutral-200 dark:border-neutral-700"
        )}
        style={getTooltipStyle()}
      >
        {/* Header con gradiente */}
        <div className={cn("h-1.5 bg-gradient-to-r", gradient)} />

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pt-4 pb-2">
          {tourSteps.map((_, i) => (
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
                Paso {stepIndex + 1} de {tourSteps.length}
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
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {step.description}
          </p>

          {/* Custom content: Industry selector */}
          {step.id === 'industry' && (
            <div className="grid grid-cols-4 gap-2 mb-4">
              {INDUSTRIES.map((ind) => {
                const Icon = ind.icon;
                const isSelected = selectedIndustry === ind.id;
                return (
                  <button
                    key={ind.id}
                    onClick={() => setSelectedIndustry(ind.id)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all text-center',
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 scale-105 shadow-md'
                        : 'border-transparent bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    )}
                  >
                    <div className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center',
                      isSelected ? `bg-gradient-to-br ${ind.gradient} text-white` : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'
                    )}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <span className={cn(
                      'text-[11px] font-medium leading-tight',
                      isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-muted-foreground'
                    )}>
                      {ind.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-2">
            {stepIndex > 0 && (
              <Button
                variant="outline"
                onClick={prev}
                className="flex-1 h-11 font-medium"
                disabled={savingIndustry}
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Anterior
              </Button>
            )}

            <Button
              onClick={step.isLast ? close : next}
              disabled={step.id === 'industry' && !selectedIndustry || savingIndustry}
              className={cn(
                "flex-1 h-11 font-medium text-white shadow-lg",
                "bg-gradient-to-r hover:opacity-90",
                gradient
              )}
            >
              {savingIndustry ? (
                'Configurando...'
              ) : step.isLast ? (
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
