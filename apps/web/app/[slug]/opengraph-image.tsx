import { ImageResponse } from 'next/og';
import { publicApi } from '@/lib/api';

export const runtime = 'nodejs';
export const alt = 'Reservar Turno';
export const size = { width: 300, height: 300 };
export const contentType = 'image/png';

export default async function OGImage({ params }: { params: { slug: string } }) {
  try {
    const tenant = await publicApi.getTenant(params.slug) as {
      name: string;
      logo: string | null;
    };

    if (tenant.logo) {
      return new ImageResponse(
        (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
            }}
          >
            <img
              src={tenant.logo}
              width={300}
              height={300}
              style={{
                width: '300px',
                height: '300px',
                objectFit: 'cover',
                borderRadius: '40px',
              }}
            />
          </div>
        ),
        { ...size },
      );
    }

    // Fallback: initial letter on pink
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '40px',
            background: '#3F8697',
            fontSize: '140px',
            fontWeight: 700,
            color: 'white',
          }}
        >
          {tenant.name.charAt(0)}
        </div>
      ),
      { ...size },
    );
  } catch {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '40px',
            background: '#3F8697',
            fontSize: '60px',
            fontWeight: 700,
            color: 'white',
          }}
        >
          TL
        </div>
      ),
      { ...size },
    );
  }
}
