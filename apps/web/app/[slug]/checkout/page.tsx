import { redirect } from 'next/navigation';
import { publicApi } from '@/lib/api';
import CheckoutForm from './checkout-form';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

export default async function CheckoutPage({ params }: Props) {
  const { slug } = params;

  let tenant;
  let branding;

  try {
    [tenant, branding] = await Promise.all([
      publicApi.getTenant(slug),
      publicApi.getBranding(slug).catch(() => null),
    ]);
  } catch {
    redirect(`/${slug}`);
  }

  // Guard: only mercado + ecommerce tenants can access checkout
  if (tenant.settings?.rubro !== 'mercado' || tenant.settings?.storeType !== 'ecommerce') {
    redirect(`/${slug}`);
  }

  // Compute background color server-side so the HTML arrives with the correct bg
  const bgColor = branding?.backgroundColor || '#FFFFFF';
  const isDark = (() => {
    const c = bgColor.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 140;
  })();
  const pageBg = isDark ? bgColor : '#f8f9fa';

  // Check if gradient is enabled — use gradient as background if so
  const gradientEnabled = branding?.gradientEnabled ?? false;
  const gradientFrom = branding?.gradientFrom || '#ffffff';
  const gradientTo = branding?.gradientTo || '#111827';

  let wrapperStyle: React.CSSProperties;
  if (gradientEnabled) {
    // Build gradient server-side for instant paint
    const parseHex = (hex: string) => {
      const hc = hex.replace('#', '');
      return [parseInt(hc.substring(0, 2), 16), parseInt(hc.substring(2, 4), 16), parseInt(hc.substring(4, 6), 16)];
    };
    const rgbToHex = (rv: number, gv: number, bv: number) =>
      '#' + Math.round(rv).toString(16).padStart(2, '0') + Math.round(gv).toString(16).padStart(2, '0') + Math.round(bv).toString(16).padStart(2, '0');
    const fc = parseHex(gradientFrom);
    const tc = parseHex(gradientTo);
    const mix = (a: number, b2: number, t: number) => a + (b2 - a) * t;
    const stops: Array<[number, number]> = [
      [0, 0], [15, 0], [20, 0.05], [26, 0.12], [33, 0.22],
      [40, 0.35], [48, 0.5], [55, 0.62], [62, 0.74], [70, 0.84],
      [78, 0.91], [85, 0.95], [92, 0.98], [100, 1],
    ];
    const css = stops.map((s) =>
      rgbToHex(mix(fc[0], tc[0], s[1]), mix(fc[1], tc[1], s[1]), mix(fc[2], tc[2], s[1])) + ' ' + s[0] + '%'
    ).join(', ');
    wrapperStyle = { background: 'linear-gradient(180deg, ' + css + ')', minHeight: '100vh' };
  } else {
    wrapperStyle = { backgroundColor: pageBg, minHeight: '100vh' };
  }

  return (
    <div style={wrapperStyle}>
      <CheckoutForm tenant={tenant} branding={branding} slug={slug} />
    </div>
  );
}
