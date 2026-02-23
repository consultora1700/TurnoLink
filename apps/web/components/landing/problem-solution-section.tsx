'use client';

import { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

const problems = [
  'Clientes que no pueden reservar porque estás ocupado atendiendo',
  'Mensajes de WhatsApp acumulados sin responder',
  'Turnos olvidados y clientes que no aparecen',
  'Agenda en papel o Excel difícil de manejar',
];

const solutions = [
  'Página de reservas propia que funciona 24/7',
  'Recordatorios automáticos por WhatsApp y email',
  'Cobro de señas con Mercado Pago integrado',
  'Dashboard con calendario, clientes y estadísticas',
];

export function ProblemSolutionSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          setIsVisible(true);
          hasAnimated.current = true;

          // Animate items one by one
          problems.forEach((_, index) => {
            setTimeout(() => {
              setActiveIndex(index);
            }, 600 + index * 200);
          });
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 bg-muted/30 overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            De <span className="text-red-500">problema</span> a{' '}
            <span className="text-green-500">solución</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start max-w-6xl mx-auto">
          {/* Problem Column */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            {/* Problem Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-teal-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                  <X className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 animate-ping" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
                  El problema
                </span>
                <h3 className="text-xl font-bold">
                  ¿Cansado de perder turnos?
                </h3>
              </div>
            </div>

            {/* Problem Items */}
            <div className="space-y-4">
              {problems.map((problem, index) => (
                <div
                  key={index}
                  className={`group relative transition-all duration-500 ${
                    activeIndex >= index
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 -translate-x-8'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {/* Card */}
                  <div className="relative p-4 rounded-xl bg-red-50/80 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 hover:border-red-200 dark:hover:border-red-800 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10">
                    <div className="flex items-start gap-3">
                      {/* Animated X icon */}
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center transition-all duration-500 ${
                          activeIndex >= index ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
                        }`}
                        style={{ transitionDelay: `${index * 100 + 200}ms` }}
                      >
                        <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <span className="text-sm text-red-900 dark:text-red-100 pt-1">
                        {problem}
                      </span>
                    </div>

                    {/* Strike-through line animation */}
                    <div
                      className={`absolute left-4 right-4 top-1/2 h-0.5 bg-gradient-to-r from-red-400 to-transparent origin-left transition-transform duration-700 ${
                        activeIndex > index ? 'scale-x-100' : 'scale-x-0'
                      }`}
                      style={{ transitionDelay: `${(index + 1) * 200}ms` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solution Column */}
          <div
            className={`transition-all duration-700 delay-400 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            {/* Solution Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">
                  La solución
                </span>
                <h3 className="text-xl font-bold">
                  TurnoLink trabaja por vos
                </h3>
              </div>
            </div>

            {/* Solution Items */}
            <div className="space-y-4">
              {solutions.map((solution, index) => (
                <div
                  key={index}
                  className={`group relative transition-all duration-500 ${
                    activeIndex >= index
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 translate-x-8'
                  }`}
                  style={{ transitionDelay: `${index * 100 + 100}ms` }}
                >
                  {/* Card */}
                  <div className="relative p-4 rounded-xl bg-green-50/80 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 hover:border-green-200 dark:hover:border-green-800 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 group-hover:scale-[1.02]">
                    <div className="flex items-start gap-3">
                      {/* Animated Check icon */}
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center transition-all duration-500 ${
                          activeIndex >= index ? 'scale-100' : 'scale-0'
                        }`}
                        style={{ transitionDelay: `${index * 100 + 300}ms` }}
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm text-green-900 dark:text-green-100 pt-1">
                        {solution}
                      </span>
                    </div>

                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-400/0 via-green-400/10 to-green-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </div>
              ))}
            </div>

            {/* Success indicator */}
            <div
              className={`mt-6 flex items-center gap-2 text-green-600 dark:text-green-400 transition-all duration-500 ${
                activeIndex >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '1200ms' }}
            >
              <div className="flex -space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 border-2 border-white dark:border-gray-900 flex items-center justify-center"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </div>
                ))}
              </div>
              <span className="text-sm font-medium">
                +500 negocios ya lo usan
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
