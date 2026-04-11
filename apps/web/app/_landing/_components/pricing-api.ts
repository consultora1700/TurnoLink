/**
 * Fetch pricing data from the API by industry group slug.
 * Returns data in the format expected by IndustryData.pricing.
 * Falls back to null if the API is unreachable (static fallback used).
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiPlan {
  name: string;
  slug: string;
  priceMonthly: string;
  priceYearly: string | null;
  trialDays: number;
  maxBranches: number | null;
  maxEmployees: number | null;
  maxServices: number | null;
  maxBookingsMonth: number | null;
  maxCustomers: number | null;
  maxPhotos: number | null;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  industryGroup: {
    slug: string;
    name: string;
    limitLabels: Record<string, string | null>;
  } | null;
}

interface PricingData {
  hasFree: boolean;
  tiers: {
    name: string;
    price: string;
    period: string;
    features: string[];
    popular?: boolean;
  }[];
  trialText?: string;
}

function formatPriceStr(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (num === 0) return '$0';
  return `$${num.toLocaleString('es-AR')}`;
}

function buildFeatureList(plan: ApiPlan, limitLabels: Record<string, string | null>): string[] {
  const features: string[] = [];

  // Bookings limit
  const bookingsLabel = limitLabels.maxBookingsMonth || 'reservas/mes';
  if (plan.maxBookingsMonth !== null) {
    features.push(`${plan.maxBookingsMonth} ${bookingsLabel}`);
  } else {
    features.push(`${bookingsLabel.charAt(0).toUpperCase() + bookingsLabel.slice(1)} ilimitadas`);
  }

  // Employees
  const empLabel = limitLabels.maxEmployees;
  if (empLabel !== null && empLabel !== undefined) {
    if (plan.maxEmployees !== null) {
      features.push(`${plan.maxEmployees === 1 ? '1' : `Hasta ${plan.maxEmployees}`} ${empLabel}`);
    } else {
      features.push(`${empLabel.charAt(0).toUpperCase() + empLabel.slice(1)} ilimitados`);
    }
  }

  // Branches
  const branchLabel = limitLabels.maxBranches || 'sucursales';
  if (plan.maxBranches !== null) {
    features.push(`${plan.maxBranches} ${plan.maxBranches === 1 ? branchLabel.replace(/es$/, '').replace(/s$/, '') : branchLabel}`);
  } else {
    features.push(`Múltiples ${branchLabel}`);
  }

  // Photos
  const photosLabel = limitLabels.maxPhotos || 'fotos';
  if (plan.maxPhotos !== null) {
    features.push(`${plan.maxPhotos.toLocaleString('es-AR')} ${photosLabel}`);
  } else {
    features.push(`${photosLabel.charAt(0).toUpperCase() + photosLabel.slice(1)} ilimitadas`);
  }

  // Add generic features based on plan features array
  const featureMap: Record<string, string> = {
    whatsapp_confirmation: 'Recordatorios por WhatsApp',
    email_reminder: 'Recordatorios por email',
    calendar: 'Calendario online',
    basic_reports: 'Reportes básicos',
    advanced_reports: 'Panel de métricas',
    complete_reports: 'Reportes avanzados',
    mercadopago: 'Cobro de señas con Mercado Pago',
    whatsapp_support: 'Soporte prioritario',
    priority_support: 'Soporte prioritario',
    multi_branch: 'Multi-sucursal',
    api_access: 'API e integraciones',
    ficha_paciente: 'Ficha de paciente/cliente',
    videollamada: 'Videollamadas integradas',
    employee_portal: 'Portal de empleados (hasta 3)',
    employee_portal_advanced: 'Portal de empleados ilimitado',
    finance_module: 'Control de finanzas',
    stock_management: 'Gestión de stock',
    whatsapp_catalog: 'Botón de WhatsApp por producto',
  };

  const hasAdvancedPortal = plan.features.includes('employee_portal_advanced');

  for (const feat of plan.features) {
    // Skip basic portal if advanced is present (avoid redundancy)
    if (feat === 'employee_portal' && hasAdvancedPortal) continue;

    if (featureMap[feat]) {
      // Avoid duplicates
      if (!features.includes(featureMap[feat])) {
        features.push(featureMap[feat]);
      }
    }
  }

  return features;
}

export async function fetchPricingByGroup(groupSlug: string): Promise<PricingData | null> {
  try {
    const res = await fetch(`${API_URL}/api/plans?industryGroup=${groupSlug}`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!res.ok) return null;

    const plans: ApiPlan[] = await res.json();
    if (!plans || plans.length === 0) return null;

    const limitLabels = plans[0]?.industryGroup?.limitLabels || {};

    const hasFree = plans.some(p => parseFloat(p.priceMonthly) === 0);

    const tiers = plans.map(plan => {
      const price = parseFloat(plan.priceMonthly);
      return {
        name: plan.name,
        price: formatPriceStr(price),
        period: price === 0 ? 'para siempre' : '/mes',
        features: buildFeatureList(plan, limitLabels),
        popular: plan.isPopular || undefined,
      };
    });

    return {
      hasFree,
      tiers,
      trialText: hasFree
        ? undefined
        : '14 días de prueba en todos los planes. Sin tarjeta de crédito.',
    };
  } catch (err) {
    console.error(`[pricing-api] Failed to fetch pricing for group "${groupSlug}":`, err);
    return null;
  }
}
