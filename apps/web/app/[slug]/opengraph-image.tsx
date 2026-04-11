import { ImageResponse } from 'next/og';
import { publicApi } from '@/lib/api';

export const runtime = 'nodejs';
export const alt = 'Reservar Turno';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage({ params }: { params: { slug: string } }) {
  try {
    const [tenant, branding] = await Promise.all([
      publicApi.getTenant(params.slug) as Promise<{ name: string; logo: string | null; coverImage: string | null; description?: string; settings?: any }>,
      publicApi.getBranding(params.slug).catch(() => null) as Promise<any>,
    ]);

    // If tenant has a cover image, use it directly as OG image
    const coverImage = tenant.coverImage;
    if (coverImage) {
      try {
        const res = await fetch(coverImage);
        const buffer = await res.arrayBuffer();
        return new Response(Buffer.from(buffer), {
          headers: {
            'Content-Type': res.headers.get('content-type') || 'image/png',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      } catch {
        // Fall through to generated image
      }
    }

    const primaryColor = branding?.primaryColor || tenant?.settings?.primaryColor || '#6366f1';
    const secondaryColor = branding?.secondaryColor || '#8b5cf6';
    const tenantName = tenant.name;
    const description = branding?.metaDescription || tenant.description || '';
    const logo = tenant.logo;

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            padding: '60px',
            position: 'relative',
          }}
        >
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex' }} />

          {/* Logo */}
          {logo ? (
            <img
              src={logo}
              width={120}
              height={120}
              style={{ width: 120, height: 120, borderRadius: 24, objectFit: 'cover', marginBottom: 32, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
            />
          ) : (
            <div style={{ width: 120, height: 120, borderRadius: 24, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, fontSize: 56, fontWeight: 800, color: 'white' }}>
              {tenantName.charAt(0)}
            </div>
          )}

          {/* Name */}
          <div style={{ fontSize: 52, fontWeight: 800, color: 'white', textAlign: 'center', lineHeight: 1.2, maxWidth: 900, display: 'flex' }}>
            {tenantName}
          </div>

          {/* Description */}
          {description && (
            <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 16, maxWidth: 700, lineHeight: 1.4, display: 'flex' }}>
              {description.length > 100 ? description.substring(0, 100) + '...' : description}
            </div>
          )}

          {/* Footer */}
          <div style={{ position: 'absolute', bottom: 30, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', display: 'flex' }}>
              turnolink.com.ar/{params.slug}
            </div>
          </div>
        </div>
      ),
      { ...size },
    );
  } catch {
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', fontSize: 60, fontWeight: 700, color: 'white' }}>
          TurnoLink
        </div>
      ),
      { ...size },
    );
  }
}
