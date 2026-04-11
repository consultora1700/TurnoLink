'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface Props {
  adSlot: string;
  className?: string;
}

/**
 * AdSense banner for free-tier tenants.
 * Renders an in-feed ad unit that blends with the product grid.
 * Includes a subtle "remove ads" upgrade CTA.
 */
export function AdSenseBanner({ adSlot, className = '' }: Props) {
  const adRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded or blocked
    }
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-neutral-700/50 overflow-hidden">
        {/* Ad container */}
        <div ref={adRef} className="min-h-[100px] flex items-center justify-center">
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || ''}
            data-ad-slot={adSlot}
            data-ad-format="fluid"
            data-ad-layout-key="+1w+s0-j-r+3m"
            data-full-width-responsive="true"
          />
        </div>
        {/* Subtle upgrade CTA */}
        <div className="px-3 py-1.5 bg-slate-50/80 dark:bg-neutral-900/50 border-t border-slate-200/50 dark:border-neutral-700/50 flex items-center justify-center">
          <span className="text-[10px] text-muted-foreground">
            Publicidad &middot;{' '}
            <Link
              href="/suscripcion"
              className="text-primary hover:underline font-medium"
            >
              Mejora tu plan para quitar anuncios
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Placeholder banner used when AdSense is not yet configured.
 * Shows the same visual space with upgrade messaging.
 */
export function AdPlaceholderBanner({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl border border-dashed border-slate-300 dark:border-neutral-600 p-6 flex flex-col items-center justify-center text-center min-h-[120px]">
        <p className="text-xs text-muted-foreground mb-1">Espacio publicitario</p>
        <p className="text-[10px] text-muted-foreground/60">
          <Link
            href="/suscripcion"
            className="text-primary hover:underline font-medium"
          >
            Mejora tu plan para quitar anuncios
          </Link>
        </p>
      </div>
    </div>
  );
}
