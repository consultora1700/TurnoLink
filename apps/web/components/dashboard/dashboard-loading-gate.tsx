'use client';

import { useTenantConfig } from '@/contexts/tenant-config-context';
import { usePlanFeatures } from '@/lib/hooks/use-plan-features';
import { Settings } from 'lucide-react';

export function DashboardLoadingGate({ children }: { children: React.ReactNode }) {
  const { isLoaded: configLoaded } = useTenantConfig();
  const { isLoaded: planLoaded } = usePlanFeatures();

  if (!configLoaded || !planLoaded) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-neutral-950 transition-opacity">
        <div className="flex flex-col items-center gap-5">
          {/* Gear animation placeholder — will be replaced with custom Lottie */}
          <div className="relative w-20 h-20">
            <Settings className="w-20 h-20 text-neutral-300 dark:text-neutral-700 animate-[spin_3s_linear_infinite]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Preparando tu espacio
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
              Configurando todo para vos...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
