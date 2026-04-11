'use client';

interface CheckoutProgressProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export function CheckoutProgress({
  currentStep,
  totalSteps,
  labels = ['Datos', 'Envío', 'Pago'],
}: CheckoutProgressProps) {
  const pct = Math.min((currentStep / totalSteps) * 100, 100);

  return (
    <div className="space-y-2">
      {/* Progress bar */}
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, backgroundColor: 'var(--checkout-primary, #14b8a6)' }}
        />
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Paso {Math.min(currentStep + 1, totalSteps)} de {totalSteps}
        </span>
        <div className="flex items-center gap-1 text-xs">
          {labels.map((label, idx) => (
            <span key={label} className="flex items-center gap-1">
              {idx > 0 && <span className="text-gray-300 mx-0.5">&rarr;</span>}
              <span
                className={`transition-colors ${
                  idx < currentStep
                    ? 'font-medium'
                    : idx === currentStep
                    ? 'font-semibold text-gray-900'
                    : 'text-gray-400'
                }`}
                style={idx < currentStep ? { color: 'var(--checkout-primary, #14b8a6)' } : undefined}
              >
                {idx < currentStep && <span className="mr-0.5">&#10003;</span>}
                {label}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
