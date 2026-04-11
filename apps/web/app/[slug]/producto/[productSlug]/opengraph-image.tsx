import { publicApi } from '@/lib/api';

export const runtime = 'nodejs';
export const alt = 'Producto';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

export default async function OGImage({
  params,
}: {
  params: { slug: string; productSlug: string };
}) {
  try {
    const product = await publicApi.getProduct(params.slug, params.productSlug);
    const image =
      product.images?.find((img: any) => img.isPrimary)?.url ||
      product.images?.[0]?.url;

    if (image) {
      // Fetch the actual product photo and return it directly
      const res = await fetch(image);
      const buffer = await res.arrayBuffer();
      return new Response(Buffer.from(buffer), {
        headers: {
          'Content-Type': res.headers.get('content-type') || 'image/png',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
  } catch {
    // fall through to parent OG image
  }

  // Fallback: let Next.js use the parent [slug]/opengraph-image
  const { ImageResponse } = await import('next/og');
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          fontSize: 60,
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
