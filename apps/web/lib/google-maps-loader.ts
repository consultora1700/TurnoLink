// Singleton loader for Google Maps JS API (Places library)
// Uses NEXT_PUBLIC_GOOGLE_MAPS_API_KEY. If absent, returns null.

let loaderPromise: Promise<any> | null = null;

export function loadGoogleMaps(): Promise<any> {
  if (typeof window === 'undefined') return Promise.resolve(null);

  // Already loaded
  if ((window as any).google?.maps?.places) {
    return Promise.resolve((window as any).google);
  }

  if (loaderPromise) return loaderPromise;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn('[google-maps-loader] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY no configurado');
    return Promise.resolve(null);
  }

  loaderPromise = new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-google-maps-loader="true"]',
    );
    if (existing) {
      existing.addEventListener('load', () =>
        resolve((window as any).google || null),
      );
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey,
    )}&libraries=places&language=es&region=AR&loading=async`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMapsLoader = 'true';
    script.onload = () => resolve((window as any).google || null);
    script.onerror = () => {
      console.error('[google-maps-loader] Falló la carga del script');
      loaderPromise = null;
      resolve(null);
    };
    document.head.appendChild(script);
  });

  return loaderPromise;
}
