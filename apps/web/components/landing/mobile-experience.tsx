'use client';

import { useEffect, useRef, useState } from 'react';
import { BookingFlowStep } from './device-mockup';
import { cn } from '@/lib/utils';
import {
  Smartphone,
  CheckCircle2,
  Clock,
  Zap,
  Globe,
} from 'lucide-react';

interface MobileExperienceProps {
  className?: string;
}

export function MobileExperience({ className }: MobileExperienceProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
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

  // Auto-rotate active step
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setActiveStep(prev => (prev % 3) + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const benefits = [
    {
      icon: Clock,
      title: 'Reserva en 30 segundos',
      description: 'Proceso simple y rápido para tus clientes',
    },
    {
      icon: Globe,
      title: 'Sin descargar apps',
      description: 'Funciona directamente desde el navegador',
    },
    {
      icon: Zap,
      title: 'Confirmación instantánea',
      description: 'El cliente recibe confirmación al momento',
    },
  ];

  const steps = [
    { step: 1 as const, title: 'Elige tu servicio' },
    { step: 2 as const, title: 'Selecciona fecha y hora' },
    { step: 3 as const, title: 'Confirmación instantánea' },
  ];

  return (
    <section
      ref={sectionRef}
      className={cn('py-20 md:py-32 bg-muted/30 overflow-hidden', className)}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div
            className={cn(
              'order-2 lg:order-1 transition-all duration-1000',
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            )}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-100 dark:border-teal-800 mb-6">
              <Smartphone className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span className="text-sm font-medium text-teal-700 dark:text-teal-300">
                Mobile First
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
              Tus clientes reservan{' '}
              <span className="text-gradient">desde cualquier lugar</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8">
              Una experiencia de reserva optimizada para móviles que convierte visitantes
              en clientes con un flujo simple de 3 pasos.
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-xl bg-card border hover:border-teal-200 dark:hover:border-teal-400/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 flex-shrink-0">
                    <benefit.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{benefit.title}</h4>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a
              href="/bella-estetica"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-violet-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              <span>Ver Demo en Vivo</span>
              <CheckCircle2 className="h-4 w-4" />
            </a>
          </div>

          {/* Mobile mockups */}
          <div
            className={cn(
              'order-1 lg:order-2 transition-all duration-1000 delay-200',
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            )}
          >
            <div className="relative">
              {/* Background glow */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-teal-500/30 via-violet-500/30 to-blue-500/30 rounded-full blur-3xl opacity-50" />
              </div>

              {/* Step indicators */}
              <div className="flex justify-center gap-3 mb-6">
                {[1, 2, 3].map((step) => (
                  <button
                    key={step}
                    onClick={() => setActiveStep(step)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                      activeStep === step
                        ? 'bg-gradient-to-r from-teal-500 to-violet-500 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">
                      {step}
                    </span>
                    <span className="hidden sm:inline">{steps[step - 1].title}</span>
                  </button>
                ))}
              </div>

              {/* 3 iPhones */}
              <div className="relative flex items-center justify-center gap-4 md:gap-6 px-4">
                {steps.map(({ step, title }, i) => (
                  <div
                    key={step}
                    className={cn(
                      'transition-all duration-500 w-[140px] sm:w-[160px] md:w-[180px]',
                      activeStep === step
                        ? 'scale-110 z-20'
                        : 'scale-90 opacity-60 z-10'
                    )}
                    style={{
                      transform: `
                        scale(${activeStep === step ? 1.1 : 0.9})
                        translateY(${activeStep === step ? -10 : 0}px)
                      `,
                    }}
                  >
                    <BookingFlowStep
                      step={step}
                      title={title}
                      active={activeStep === step}
                    />
                  </div>
                ))}
              </div>

              {/* Navigation arrows for mobile */}
              <div className="flex justify-center gap-4 mt-6 lg:hidden">
                <button
                  onClick={() => setActiveStep(prev => prev === 1 ? 3 : prev - 1)}
                  className="w-10 h-10 rounded-full bg-card border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setActiveStep(prev => prev === 3 ? 1 : prev + 1)}
                  className="w-10 h-10 rounded-full bg-card border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Compact version showing a single phone with the booking flow
export function BookingFlowPreview({ className }: { className?: string }) {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev % 3) + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { step: 1 as const, title: 'Elige servicio' },
    { step: 2 as const, title: 'Fecha y hora' },
    { step: 3 as const, title: 'Confirmado' },
  ];

  return (
    <div className={cn('relative', className)}>
      {/* Progress bar */}
      <div className="flex gap-1 mb-4">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={cn(
              'h-1 rounded-full flex-1 transition-all duration-500',
              step <= currentStep
                ? 'bg-gradient-to-r from-teal-500 to-violet-500'
                : 'bg-muted'
            )}
          />
        ))}
      </div>

      {/* Phone */}
      <div className="max-w-[220px] mx-auto">
        <BookingFlowStep
          step={steps[currentStep - 1].step}
          title={steps[currentStep - 1].title}
          active
        />
      </div>
    </div>
  );
}
