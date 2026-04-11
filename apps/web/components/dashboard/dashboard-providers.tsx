'use client';

import { ReactNode } from 'react';
import { TenantConfigProvider, useTenantConfig } from '@/contexts/tenant-config-context';
import { isGastronomiaRubro } from '@/lib/rubro-attributes';
import { GastroAlertListener } from '@/components/gastro/gastro-alert-listener';

function GastroAlertGuard() {
  const { rubro } = useTenantConfig();
  if (!isGastronomiaRubro(rubro)) return null;
  return <GastroAlertListener />;
}

export function DashboardProviders({ children }: { children: ReactNode }) {
  return (
    <TenantConfigProvider>
      <GastroAlertGuard />
      {children}
    </TenantConfigProvider>
  );
}
