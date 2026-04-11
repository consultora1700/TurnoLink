'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type WizardStep = 'tenant' | 'scene' | 'customize' | 'export';

const STEPS: { key: WizardStep; label: string; number: number }[] = [
  { key: 'tenant', label: 'Negocio', number: 1 },
  { key: 'scene', label: 'Escena', number: 2 },
  { key: 'customize', label: 'Personalizar', number: 3 },
  { key: 'export', label: 'Descargar', number: 4 },
];

const STEP_ORDER: WizardStep[] = ['tenant', 'scene', 'customize', 'export'];

interface StepIndicatorProps {
  currentStep: WizardStep;
  onStepClick: (step: WizardStep) => void;
  completedSteps: Set<WizardStep>;
}

export function StepIndicator({ currentStep, onStepClick, completedSteps }: StepIndicatorProps) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto">
      {STEPS.map((step, index) => {
        const isCompleted = completedSteps.has(step.key);
        const isCurrent = step.key === currentStep;
        const isClickable = index <= currentIndex || isCompleted || (index > 0 && completedSteps.has(STEP_ORDER[index - 1]));

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => isClickable && onStepClick(step.key)}
              disabled={!isClickable}
              className={cn(
                'flex flex-col items-center gap-1.5 transition-all duration-200',
                isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200',
                  isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110',
                  isCompleted && !isCurrent && 'bg-primary text-primary-foreground',
                  !isCurrent && !isCompleted && 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted && !isCurrent ? <Check className="h-5 w-5" /> : step.number}
              </div>
              <span
                className={cn(
                  'text-xs font-medium hidden sm:block',
                  isCurrent ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </button>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2 transition-colors duration-200',
                  completedSteps.has(step.key) ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
