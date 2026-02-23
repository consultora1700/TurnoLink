'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { DeviceMockup } from './device-mockup';
import Image from 'next/image';
import {
  Sparkles,
  CalendarDays,
  Clock,
  UserCircle,
  CheckCircle,
  ChevronRight,
  Smartphone,
  Timer,
} from 'lucide-react';

interface JourneyStep {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  screen: string;
  accentColor: string;
  gradient: string;
}

const journeySteps: JourneyStep[] = [
  {
    id: 'portada',
    number: 1,
    title: 'Entran a tu página',
    description: 'Tu negocio con tu marca y estilo propio',
    icon: <Smartphone className="w-5 h-5" />,
    screen: '/mockups/flow-01-portada.webp?v=20260127',
    accentColor: 'rgb(168, 85, 247)', // purple-500
    gradient: 'from-purple-500 to-indigo-500',
  },
  {
    id: 'servicios',
    number: 2,
    title: 'Eligen servicio',
    description: 'Catálogo visual con precios y duración',
    icon: <Sparkles className="w-5 h-5" />,
    screen: '/mockups/flow-02-servicios.webp?v=20260127',
    accentColor: 'rgb(236, 72, 153)', // teal-500
    gradient: 'from-teal-500 to-teal-500',
  },
  {
    id: 'detalle',
    number: 3,
    title: 'Ven el detalle',
    description: 'Descripción completa y profesional asignado',
    icon: <CheckCircle className="w-5 h-5" />,
    screen: '/mockups/flow-03-detalle.webp?v=20260127',
    accentColor: 'rgb(20, 184, 166)', // teal-500
    gradient: 'from-teal-500 to-cyan-500',
  },
  {
    id: 'fecha',
    number: 4,
    title: 'Seleccionan fecha',
    description: 'Calendario intuitivo con días disponibles',
    icon: <CalendarDays className="w-5 h-5" />,
    screen: '/mockups/flow-04-calendario.webp?v=20260127',
    accentColor: 'rgb(139, 92, 246)', // violet-500
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    id: 'horario',
    number: 5,
    title: 'Eligen horario',
    description: 'Solo horarios libres en tiempo real',
    icon: <Clock className="w-5 h-5" />,
    screen: '/mockups/flow-05-horarios.webp?v=20260127',
    accentColor: 'rgb(59, 130, 246)', // blue-500
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'datos',
    number: 6,
    title: 'Completan datos',
    description: 'Solo nombre y teléfono, sin registro',
    icon: <UserCircle className="w-5 h-5" />,
    screen: '/mockups/flow-06-formulario.webp?v=20260127',
    accentColor: 'rgb(234, 179, 8)', // yellow-500
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    id: 'confirmado',
    number: 7,
    title: 'Turno confirmado',
    description: 'Reciben confirmación por WhatsApp',
    icon: <CheckCircle className="w-5 h-5" />,
    screen: '/mockups/flow-07-confirmacion.webp?v=20260127',
    accentColor: 'rgb(34, 197, 94)', // green-500
    gradient: 'from-green-500 to-emerald-500',
  },
];

export function MobileJourneySection() {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Intersection observer - tracks when section enters/exits viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // User arrived at section - reset and start
            setActiveStep(0);
            setProgress(0);
            setIsInView(true);
            setIsPaused(false);
          } else {
            // User left section - pause
            setIsInView(false);
          }
        });
      },
      { threshold: 0.2 } // 20% visible is enough
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-progress through steps
  useEffect(() => {
    // Clear any existing interval
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }

    // Only run when in view and not paused
    if (!isInView || isPaused) return;

    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveStep((current) => (current + 1) % journeySteps.length);
          return 0;
        }
        return prev + 2.5; // Slightly faster with more steps
      });
    }, 70);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };
  }, [isInView, isPaused]);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    setProgress(0);
    setIsPaused(true);
    // Resume after 5 seconds
    setTimeout(() => setIsPaused(false), 5000);
  };

  const currentStep = journeySteps[activeStep];

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-28 overflow-hidden"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/50 to-background" />

      {/* Floating ambient shapes */}
      <div
        className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-20 transition-all duration-1000"
        style={{ background: currentStep.accentColor }}
      />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-10 transition-all duration-1000"
        style={{ background: currentStep.accentColor }}
      />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          {/* Badge with timer */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-teal-500/10 to-violet-500/10 border border-teal-500/20 mb-6">
            <Smartphone className="w-4 h-4 text-teal-500" />
            <span className="text-sm font-medium text-foreground">Experiencia mobile</span>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Timer className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">~30 seg</span>
            </div>
          </div>

          <h2 className="section-title text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Reservar es{' '}
            <span className="text-shimmer">así de fácil</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sin descargar apps. Sin crear cuentas. Tus clientes reservan desde cualquier celular.
          </p>
        </div>

        {/* Main content */}
        <div className="flex flex-col items-center max-w-7xl mx-auto">

          {/* Mobile: Cards horizontales scroll */}
          <div className="lg:hidden w-full mb-8">
            <div className="flex gap-2 overflow-x-auto pb-4 px-2 -mx-2 snap-x snap-mandatory scrollbar-hide">
              {journeySteps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  className={cn(
                    "flex-shrink-0 snap-center w-[140px] p-3 rounded-2xl",
                    "border transition-all duration-300",
                    "text-left",
                    index === activeStep
                      ? "bg-card border-transparent shadow-lg scale-105"
                      : "bg-card/50 border-border/50 opacity-70"
                  )}
                  style={{
                    boxShadow: index === activeStep
                      ? `0 8px 32px -8px ${step.accentColor}40`
                      : undefined
                  }}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-white mb-2",
                    "bg-gradient-to-br transition-all duration-300",
                    step.gradient,
                    index === activeStep && "scale-110"
                  )}>
                    {step.icon}
                  </div>
                  <p className="font-semibold text-sm">{step.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {step.description}
                  </p>

                  {/* Progress bar */}
                  {index === activeStep && (
                    <div className="mt-2 h-1 rounded-full bg-muted/50 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full bg-gradient-to-r", step.gradient)}
                        style={{ width: `${progress}%`, transition: 'width 80ms linear' }}
                      />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* iPhone mockup - Hero central */}
          <div className="flex justify-center items-center w-full mb-8 lg:mb-16">
            <div className="relative mx-auto">
              {/* Glow behind phone */}
              <div
                className="absolute inset-0 blur-3xl opacity-30 transition-all duration-700 scale-75"
                style={{ background: currentStep.accentColor }}
              />

              {/* Floating decorative elements */}
              <div
                className="absolute -top-6 -right-6 w-12 h-12 rounded-2xl opacity-20 animate-float-slow"
                style={{ background: `linear-gradient(135deg, ${currentStep.accentColor}, transparent)` }}
              />
              <div
                className="absolute -bottom-4 -left-4 w-8 h-8 rounded-xl opacity-30 animate-float-delayed"
                style={{ background: `linear-gradient(135deg, ${currentStep.accentColor}, transparent)` }}
              />

              {/* Phone */}
              <div className="relative animate-float-subtle">
                <DeviceMockup
                  device="iphone"
                  className="!w-[260px] sm:!w-[280px] md:!w-[300px] lg:!w-[340px]"
                >
                  <div className="relative w-full h-full">
                    {journeySteps.map((step, index) => (
                      <div
                        key={step.id}
                        className={cn(
                          "absolute inset-0 transition-all duration-500",
                          index === activeStep
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-95"
                        )}
                      >
                        <Image
                          src={step.screen}
                          alt={`Paso ${step.number}: ${step.title}`}
                          fill
                          className="object-cover object-top"
                          sizes="340px"
                          priority={index === 0}
                        />
                      </div>
                    ))}
                  </div>
                </DeviceMockup>

                {/* Step indicator floating badge - solo mobile */}
                <div
                  className={cn(
                    "lg:hidden absolute -bottom-3 left-1/2 -translate-x-1/2",
                    "px-4 py-2 rounded-full",
                    "bg-card/90 backdrop-blur-sm border shadow-lg",
                    "flex items-center gap-2",
                    "transition-all duration-300"
                  )}
                  style={{
                    boxShadow: `0 8px 32px -8px ${currentStep.accentColor}40`
                  }}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold",
                      "bg-gradient-to-br",
                      currentStep.gradient
                    )}
                  >
                    {currentStep.number}
                  </div>
                  <span className="text-sm font-medium">{currentStep.title}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: Steps en grid horizontal */}
          <div className="hidden lg:block w-full">
            {/* Progress bar global */}
            <div className="relative h-1 bg-muted/30 rounded-full mb-8 mx-auto max-w-5xl overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-500 via-violet-500 to-green-500 rounded-full transition-all duration-300"
                style={{
                  width: `${((activeStep + progress / 100) / journeySteps.length) * 100}%`
                }}
              />
              {/* Dots en la barra */}
              <div className="absolute inset-0 flex justify-between items-center px-0">
                {journeySteps.map((step, index) => {
                  const isActive = index === activeStep;
                  const isPast = index < activeStep;
                  return (
                    <button
                      key={step.id}
                      onClick={() => handleStepClick(index)}
                      className="relative -mt-[3px]"
                    >
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full transition-all duration-300",
                          isPast ? "bg-green-500" : isActive ? "bg-white ring-4 ring-violet-500/50 scale-125" : "bg-muted-foreground/30"
                        )}
                        style={{
                          background: isActive ? currentStep.accentColor : undefined,
                          boxShadow: isActive ? `0 0 12px ${currentStep.accentColor}` : undefined
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cards de pasos */}
            <div className="grid grid-cols-7 gap-3 max-w-6xl mx-auto">
              {journeySteps.map((step, index) => {
                const isActive = index === activeStep;
                const isPast = index < activeStep;

                return (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(index)}
                    className={cn(
                      "group relative p-4 rounded-2xl transition-all duration-300 text-center",
                      isActive
                        ? "bg-card shadow-2xl scale-105 z-10"
                        : isPast
                          ? "bg-card/60 hover:bg-card/80"
                          : "bg-card/40 hover:bg-card/60 opacity-60 hover:opacity-80"
                    )}
                    style={{
                      boxShadow: isActive
                        ? `0 20px 50px -15px ${step.accentColor}50`
                        : undefined
                    }}
                  >
                    {/* Número */}
                    <div
                      className={cn(
                        "w-10 h-10 mx-auto mb-3 rounded-xl flex items-center justify-center text-white font-bold",
                        "bg-gradient-to-br transition-all duration-300",
                        step.gradient,
                        isActive && "scale-110 shadow-lg"
                      )}
                      style={{
                        boxShadow: isActive
                          ? `0 8px 20px -6px ${step.accentColor}70`
                          : undefined
                      }}
                    >
                      {isPast ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        step.number
                      )}
                    </div>

                    {/* Título */}
                    <h4 className={cn(
                      "font-semibold text-sm mb-1 transition-colors duration-300 line-clamp-1",
                      isActive ? "text-foreground" : "text-foreground/70"
                    )}>
                      {step.title}
                    </h4>

                    {/* Descripción - solo visible en activo */}
                    <p className={cn(
                      "text-xs text-muted-foreground transition-all duration-300 line-clamp-2",
                      isActive ? "opacity-100 max-h-10" : "opacity-0 max-h-0 overflow-hidden"
                    )}>
                      {step.description}
                    </p>

                    {/* Progress en card activa */}
                    {isActive && (
                      <div className="mt-3 h-1 rounded-full bg-muted/50 overflow-hidden">
                        <div
                          className={cn("h-full rounded-full bg-gradient-to-r", step.gradient)}
                          style={{ width: `${progress}%`, transition: 'width 80ms linear' }}
                        />
                      </div>
                    )}

                    {/* Indicator activo */}
                    {isActive && (
                      <div
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full"
                        style={{ background: step.accentColor }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom CTA - Mobile only */}
        <div className="mt-12 text-center lg:hidden">
          <p className="text-sm text-muted-foreground mb-2">
            ¿Querés verlo en acción?
          </p>
          <a
            href="/bella-estetica"
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 rounded-full",
              "bg-gradient-to-r from-teal-500 to-violet-500",
              "text-white font-medium text-sm",
              "shadow-lg hover:shadow-xl transition-all duration-300",
              "hover:scale-105 active:scale-95"
            )}
          >
            Ver demo en vivo
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
