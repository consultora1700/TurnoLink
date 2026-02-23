'use client';

import { useState } from 'react';
import { Smartphone, Bell, Download, CheckCircle2, ChevronDown, Share, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PWAInstallGuideProps {
  variant?: 'card' | 'full' | 'modal';
  onDismiss?: () => void;
}

const STEPS = [
  {
    icon: Download,
    title: 'Instalar la app',
    color: 'from-teal-500 to-teal-600',
    instructions: {
      android: [
        'Abrí turnolink.mubitt.com en Chrome',
        'Tocá el menú (tres puntos arriba a la derecha)',
        'Seleccioná "Instalar aplicación" o "Agregar a pantalla de inicio"',
        'Confirmá tocando "Instalar"',
      ],
      ios: [
        'Abrí turnolink.mubitt.com en Safari',
        'Tocá el botón de compartir (cuadrado con flecha)',
        'Buscá y tocá "Agregar a la pantalla de inicio"',
        'Confirmá tocando "Agregar"',
      ],
    },
  },
  {
    icon: Bell,
    title: 'Activar notificaciones',
    color: 'from-teal-500 to-teal-600',
    instructions: {
      android: [
        'Abrí la app instalada desde tu pantalla de inicio',
        'Iniciá sesión con tu cuenta',
        'Cuando aparezca el banner "Activar notificaciones", tocá "Activar"',
        'Permitir las notificaciones en el popup del sistema',
      ],
      ios: [
        'Abrí la app instalada desde tu pantalla de inicio',
        'Iniciá sesión con tu cuenta',
        'Cuando aparezca el banner "Activar notificaciones", tocá "Activar"',
        'Nota: Las notificaciones push en iOS funcionan a partir de iOS 16.4',
      ],
    },
  },
];

export function PWAInstallGuide({ variant = 'card', onDismiss }: PWAInstallGuideProps) {
  const [platform, setPlatform] = useState<'android' | 'ios'>('android');
  const [expandedStep, setExpandedStep] = useState<number>(0);

  const isCompact = variant === 'card';

  return (
    <div className={cn(
      variant === 'modal' && 'max-h-[70vh] overflow-y-auto',
    )}>
      {/* Header */}
      <div className={cn(
        'flex items-center gap-3 mb-4',
        isCompact && 'mb-3',
      )}>
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center flex-shrink-0">
          <Smartphone className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className={cn(
            'font-bold text-slate-900 dark:text-white',
            isCompact ? 'text-base' : 'text-lg',
          )}>
            Instalar TurnoLink en tu celular
          </h3>
          <p className="text-xs text-muted-foreground">
            Recibí notificaciones cuando un cliente reserve un turno
          </p>
        </div>
      </div>

      {/* Platform Toggle */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-neutral-800 rounded-lg mb-4">
        <button
          onClick={() => setPlatform('android')}
          className={cn(
            'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all',
            platform === 'android'
              ? 'bg-white dark:bg-neutral-700 shadow-sm text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-300',
          )}
        >
          Android
        </button>
        <button
          onClick={() => setPlatform('ios')}
          className={cn(
            'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all',
            platform === 'ios'
              ? 'bg-white dark:bg-neutral-700 shadow-sm text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-300',
          )}
        >
          iPhone / iPad
        </button>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map((step, index) => {
          const isExpanded = expandedStep === index;
          const StepIcon = step.icon;

          return (
            <div
              key={index}
              className={cn(
                'border rounded-xl overflow-hidden transition-all',
                isExpanded
                  ? 'border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-900/10'
                  : 'border-slate-200 dark:border-neutral-700',
              )}
            >
              <button
                onClick={() => setExpandedStep(isExpanded ? -1 : index)}
                className="w-full flex items-center gap-3 p-3 text-left"
              >
                <div className={cn(
                  'h-8 w-8 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0',
                  step.color,
                )}>
                  <StepIcon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">
                    Paso {index + 1}: {step.title}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform',
                    isExpanded && 'rotate-180',
                  )}
                />
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 animate-in slide-in-from-top-2 duration-200">
                  <div className="ml-11 space-y-2">
                    {step.instructions[platform].map((instruction, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                            {i + 1}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-neutral-300">
                          {instruction}
                        </p>
                      </div>
                    ))}

                    {/* Visual hint for step 1 */}
                    {index === 0 && (
                      <div className="mt-3 p-3 bg-white dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-700">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {platform === 'android' ? (
                            <>
                              <MoreVertical className="h-4 w-4" />
                              <span>Buscar esta opcion en el menu de Chrome</span>
                            </>
                          ) : (
                            <>
                              <Share className="h-4 w-4" />
                              <span>Buscar este icono en Safari</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Success note */}
      <div className="mt-4 flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-emerald-700 dark:text-emerald-300">
          Una vez instalada, vas a recibir una notificacion en tu celular cada vez que un cliente reserve un turno.
        </p>
      </div>

      {onDismiss && (
        <Button
          variant="ghost"
          className="w-full mt-3 text-sm"
          onClick={onDismiss}
        >
          Entendido, lo hago despues
        </Button>
      )}
    </div>
  );
}
