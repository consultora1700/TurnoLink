'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTenantConfig } from '@/contexts/tenant-config-context';
import { createApiClient } from '@/lib/api';

// Routes that are ALWAYS accessible regardless of subscription or hidden sections
const ALWAYS_ALLOWED = new Set([
  '/dashboard',
  '/mi-suscripcion',
  '/configuracion',
  '/verificar-cuenta',
  '/seguridad',
]);

// Routes that map to hidden section keys
// e.g. /catalogo/nuevo should be blocked if /catalogo is hidden
function getRouteSection(pathname: string): string {
  // Return the first segment: /catalogo/nuevo → /catalogo
  const segments = pathname.split('/').filter(Boolean);
  return segments.length > 0 ? `/${segments[0]}` : '/';
}

let cachedSubStatus: string | null = null;

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { hiddenSections, isLoaded: configLoaded } = useTenantConfig();
  const [subStatus, setSubStatus] = useState<string | null>(cachedSubStatus);
  const [subLoaded, setSubLoaded] = useState(!!cachedSubStatus);
  const [blocked, setBlocked] = useState(false);

  // Fetch subscription status once
  useEffect(() => {
    if (!session?.accessToken || cachedSubStatus) return;
    const api = createApiClient(session.accessToken as string);
    api.getSubscriptionStatus()
      .then((res) => {
        cachedSubStatus = res.status;
        setSubStatus(res.status);
      })
      .catch(() => {
        // If we can't fetch, assume OK (don't block on network errors)
        cachedSubStatus = 'ACTIVE';
        setSubStatus('ACTIVE');
      })
      .finally(() => setSubLoaded(true));
  }, [session?.accessToken]);

  // Evaluate access on every pathname change
  useEffect(() => {
    if (!configLoaded || !subLoaded || !pathname) return;

    const section = getRouteSection(pathname);

    // Always-allowed routes pass through
    if (ALWAYS_ALLOWED.has(section)) {
      setBlocked(false);
      return;
    }

    // Check subscription status — block if expired/past_due
    const isSubBlocked = subStatus === 'PAST_DUE' || subStatus === 'EXPIRED' || subStatus === 'TRIAL_EXPIRED';
    if (isSubBlocked) {
      router.replace('/mi-suscripcion');
      setBlocked(true);
      return;
    }

    // Check hidden sections — block if route is in hidden list
    if (hiddenSections.includes(section)) {
      router.replace('/dashboard');
      setBlocked(true);
      return;
    }

    setBlocked(false);
  }, [pathname, configLoaded, subLoaded, subStatus, hiddenSections, router]);

  // While loading, show children (avoid flash — layout already requires session)
  // If blocked, render nothing while redirect happens
  if (blocked) return null;

  return <>{children}</>;
}
