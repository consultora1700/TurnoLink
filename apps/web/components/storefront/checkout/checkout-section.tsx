'use client';

import { ReactNode } from 'react';
import { Check, ChevronRight, Edit2 } from 'lucide-react';

interface CheckoutSectionProps {
  title: string;
  icon: ReactNode;
  status: 'pending' | 'active' | 'completed';
  stepNumber: number;
  summary?: ReactNode;
  children: ReactNode;
  onEdit?: () => void;
  onContinue?: () => void;
  isValid?: boolean;
  continueLabel?: string;
}

export function CheckoutSection({
  title,
  icon,
  status,
  stepNumber,
  summary,
  children,
  onEdit,
  onContinue,
  isValid = false,
  continueLabel = 'Continuar',
}: CheckoutSectionProps) {
  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all duration-300 ${
        status === 'active'
          ? 'bg-white border-gray-200 shadow-lg shadow-black/[0.08]'
          : status === 'completed'
          ? 'bg-white border-gray-200 shadow-md shadow-black/[0.06]'
          : 'bg-white/95 border-gray-100 shadow-md shadow-black/[0.05] opacity-50 pointer-events-none'
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center gap-3 px-4 py-3.5 ${
          status === 'completed' ? 'cursor-pointer hover:bg-gray-50/80' : ''
        }`}
        onClick={status === 'completed' ? onEdit : undefined}
      >
        {/* Step circle */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold transition-colors ${
            status === 'completed' || status === 'active'
              ? 'text-white'
              : 'bg-gray-200 text-gray-400'
          }`}
          style={
            status === 'completed' || status === 'active'
              ? { backgroundColor: 'var(--checkout-primary, #14b8a6)' }
              : undefined
          }
        >
          {status === 'completed' ? <Check className="h-4 w-4" /> : stepNumber}
        </div>

        {/* Icon + title */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-gray-400 shrink-0">{icon}</span>
          <span className="font-semibold text-gray-900 text-sm sm:text-base">{title}</span>
        </div>

        {/* Right action */}
        {status === 'completed' && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--checkout-primary, #14b8a6)' }}
          >
            <Edit2 className="h-3 w-3" />
            Editar
          </button>
        )}
        {status === 'pending' && (
          <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
        )}
      </div>

      {/* Summary (completed & collapsed) */}
      {status === 'completed' && summary && (
        <div className="pl-[3.25rem] pr-4 pb-3 text-sm text-gray-500">
          {summary}
        </div>
      )}

      {/* Content (active only) */}
      <div
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          maxHeight: status === 'active' ? '2000px' : '0',
          opacity: status === 'active' ? 1 : 0,
        }}
      >
        <div className="px-4 pb-5 pt-2 border-t border-gray-100">
          {children}

          {/* Continue button */}
          {onContinue && (
            <div className="flex justify-end mt-5">
              <button
                type="button"
                onClick={onContinue}
                disabled={!isValid}
                className={`flex items-center gap-2 min-w-[140px] h-11 px-5 rounded-lg text-sm font-semibold text-white transition-all ${
                  isValid
                    ? 'hover:opacity-90 active:scale-[0.98] shadow-md'
                    : 'opacity-40 cursor-not-allowed'
                }`}
                style={{ backgroundColor: 'var(--checkout-primary, #14b8a6)' }}
              >
                {continueLabel}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
