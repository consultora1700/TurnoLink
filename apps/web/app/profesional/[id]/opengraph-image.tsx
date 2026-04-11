import { ImageResponse } from 'next/og';
import { publicTalentApi } from '@/lib/api';

export const runtime = 'nodejs';
export const alt = 'Perfil Profesional';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default async function OGImage({ params }: { params: { id: string } }) {
  try {
    const profile = await publicTalentApi.getFullProfile(params.id);

    if (profile.image) {
      return new ImageResponse(
        (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #0d9488 0%, #134e4a 100%)',
              padding: '60px',
              gap: '48px',
            }}
          >
            <img
              src={profile.image}
              width={280}
              height={280}
              style={{
                width: '280px',
                height: '280px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '6px solid rgba(255,255,255,0.3)',
              }}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                color: 'white',
              }}
            >
              <div style={{ fontSize: '56px', fontWeight: 700, lineHeight: 1.1 }}>
                {profile.name}
              </div>
              {profile.specialty && (
                <div
                  style={{
                    fontSize: '32px',
                    marginTop: '12px',
                    opacity: 0.9,
                  }}
                >
                  {profile.specialty}
                </div>
              )}
              {profile.headline && (
                <div
                  style={{
                    fontSize: '24px',
                    marginTop: '16px',
                    opacity: 0.7,
                    lineHeight: 1.3,
                  }}
                >
                  {profile.headline.slice(0, 100)}
                </div>
              )}
              <div
                style={{
                  fontSize: '20px',
                  marginTop: '24px',
                  opacity: 0.6,
                }}
              >
                turnolink.com.ar
              </div>
            </div>
          </div>
        ),
        { ...size },
      );
    }

    // No photo: initials fallback
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0d9488 0%, #134e4a 100%)',
            padding: '60px',
            gap: '48px',
          }}
        >
          <div
            style={{
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '100px',
              fontWeight: 700,
              color: 'white',
              border: '6px solid rgba(255,255,255,0.3)',
            }}
          >
            {getInitials(profile.name)}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              color: 'white',
            }}
          >
            <div style={{ fontSize: '56px', fontWeight: 700, lineHeight: 1.1 }}>
              {profile.name}
            </div>
            {profile.specialty && (
              <div style={{ fontSize: '32px', marginTop: '12px', opacity: 0.9 }}>
                {profile.specialty}
              </div>
            )}
            <div style={{ fontSize: '20px', marginTop: '24px', opacity: 0.6 }}>
              turnolink.com.ar
            </div>
          </div>
        </div>
      ),
      { ...size },
    );
  } catch {
    // Generic fallback
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0d9488 0%, #134e4a 100%)',
            fontSize: '72px',
            fontWeight: 700,
            color: 'white',
          }}
        >
          TurnoLink
        </div>
      ),
      { ...size },
    );
  }
}
