'use client';

import { useEffect, useRef } from 'react';
import { PublicBookingPage } from './public-booking-page';

interface TurnoLinkEvent {
  type: string;
  version: number;
  payload: Record<string, unknown>;
}

function postTurnoLinkEvent(type: string, payload: Record<string, unknown> = {}) {
  const event: TurnoLinkEvent = { type, version: 1, payload };
  window.parent.postMessage(event, '*');
}

interface Props {
  tenant: unknown;
  slug: string;
}

export function EmbedBookingPage({ tenant, slug }: Props) {
  const observerRef = useRef<ResizeObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Signal ready
    postTurnoLinkEvent('turnolink:ready', { slug });

    // Observe resize to inform parent iframe
    const container = containerRef.current;
    if (!container) return;

    observerRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = Math.ceil(entry.contentRect.height);
        postTurnoLinkEvent('turnolink:resize', { height });
      }
    });

    observerRef.current.observe(container);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [slug]);

  return (
    <div ref={containerRef}>
      <PublicBookingPage tenant={tenant} slug={slug} isEmbed />
    </div>
  );
}

// Re-export for use by PublicBookingPage
export { postTurnoLinkEvent };
