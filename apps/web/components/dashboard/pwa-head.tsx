'use client';

import { useEffect } from 'react';

/**
 * Injects PWA manifest and meta tags into <head> only for dashboard pages.
 * This prevents browsers from showing "Install App" prompts on public booking pages.
 */
export function PwaHead() {
  useEffect(() => {
    const tags: HTMLElement[] = [];

    const manifest = document.createElement('link');
    manifest.rel = 'manifest';
    manifest.href = '/manifest.json';
    document.head.appendChild(manifest);
    tags.push(manifest);

    const metaTags: Record<string, string> = {
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
      'apple-mobile-web-app-title': 'TurnoLink',
    };

    for (const [name, content] of Object.entries(metaTags)) {
      const meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
      tags.push(meta);
    }

    const appleTouchSizes = [
      { href: '/icons/apple-touch-icon-180x180.png', sizes: '180x180' },
      { href: '/icons/icon-192x192.png', sizes: '192x192' },
    ];

    for (const { href, sizes } of appleTouchSizes) {
      const link = document.createElement('link');
      link.rel = 'apple-touch-icon';
      link.sizes = sizes;
      link.href = href;
      document.head.appendChild(link);
      tags.push(link);
    }

    return () => {
      for (const tag of tags) {
        tag.remove();
      }
    };
  }, []);

  return null;
}
