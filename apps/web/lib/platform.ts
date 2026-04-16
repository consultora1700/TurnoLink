// ─── Platform Configuration ──────────────────────────────────────────────────
// Feature flag system: NEXT_PUBLIC_PLATFORM env var determines which rubros,
// branding, and features are available on each deployment.
//
// turnolink.com.ar → turnos, agenda, reservas (belleza, salud, deportes, etc.)
// colmen.com.ar    → operación comercial (gastronomía, tiendas, inmobiliarias)

export type PlatformId = 'turnolink' | 'colmen';

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  tagline: string;
  /** Rubro keys allowed on this platform */
  allowedRubros: string[];
  /** Sub-rubro prefixes allowed (e.g. 'gastro-', 'mercado-') */
  allowedSubRubroPrefixes: string[];
  /** Offer types shown in registration */
  allowedOfferTypes: ('services' | 'products' | 'gastronomia')[];
}

const PLATFORMS: Record<PlatformId, PlatformConfig> = {
  turnolink: {
    id: 'turnolink',
    name: 'TurnoLink',
    tagline: 'Sistema de Turnos y Reservas',
    allowedRubros: [
      'estetica-belleza', 'barberia', 'masajes-spa', 'salud', 'odontologia',
      'psicologia', 'nutricion', 'fitness', 'veterinaria', 'tatuajes-piercing',
      'educacion', 'consultoria', 'deportes', 'espacios', 'hospedaje',
      'alquiler', 'otro',
    ],
    allowedSubRubroPrefixes: [],
    allowedOfferTypes: ['services'],
  },
  colmen: {
    id: 'colmen',
    name: 'Colmen',
    tagline: 'Gestión Comercial Inteligente',
    allowedRubros: [
      'gastronomia', 'mercado', 'inmobiliarias',
    ],
    allowedSubRubroPrefixes: ['gastro-', 'mercado-'],
    allowedOfferTypes: ['products', 'gastronomia'],
  },
};

/** Current platform based on NEXT_PUBLIC_PLATFORM env var */
export function getPlatformId(): PlatformId {
  const raw = process.env.NEXT_PUBLIC_PLATFORM;
  if (raw === 'colmen') return 'colmen';
  return 'turnolink'; // default
}

export function getPlatform(): PlatformConfig {
  return PLATFORMS[getPlatformId()];
}

/** Check if a rubro key is allowed on the current platform */
export function isRubroAllowed(rubroKey: string): boolean {
  const platform = getPlatform();
  // Direct rubro match
  if (platform.allowedRubros.includes(rubroKey)) return true;
  // Sub-rubro match (e.g. 'gastro-parrilla' matches prefix 'gastro-')
  if (platform.allowedSubRubroPrefixes.some(prefix => rubroKey.startsWith(prefix))) return true;
  return false;
}

/** Check if an offer type is allowed on the current platform */
export function isOfferTypeAllowed(offerType: 'services' | 'products' | 'gastronomia'): boolean {
  return getPlatform().allowedOfferTypes.includes(offerType);
}

/** Given a rubro, return which platform it belongs to */
export function getPlatformForRubro(rubro: string): PlatformId {
  for (const [id, config] of Object.entries(PLATFORMS) as [PlatformId, PlatformConfig][]) {
    if (config.allowedRubros.includes(rubro)) return id;
    if (config.allowedSubRubroPrefixes.some(prefix => rubro.startsWith(prefix))) return id;
  }
  return 'turnolink'; // default
}

/** Domain for each platform */
export const PLATFORM_DOMAINS: Record<PlatformId, string> = {
  turnolink: 'https://turnolink.com.ar',
  colmen: 'https://colmen.com.ar',
};

/** Platform branding */
export function getPlatformBrand() {
  const platform = getPlatform();
  return {
    name: platform.name,
    tagline: platform.tagline,
    // Logo paths — colmen uses its own logo, falls back to turnolink's
    logo: platform.id === 'colmen' ? '/colmen-logo.png' : '/oscuro2.png',
    logoAlt: platform.name,
    // Primary color
    primaryColor: platform.id === 'colmen' ? '#F59E0B' : '#3F8697',
  };
}
