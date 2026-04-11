import { notFound } from 'next/navigation';
import { FileText } from 'lucide-react';
import QuoteView from './quote-view';
import type { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://turnolink.com.ar';

export const dynamic = 'force-dynamic';

interface Props {
  params: { token: string };
}

async function fetchQuote(token: string) {
  try {
    const res = await fetch(`${API_URL}/api/public/quotes/${token}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const quote = await fetchQuote(params.token);
  if (!quote) {
    return { title: 'Presupuesto no encontrado' };
  }

  const tenant = quote.tenant;
  const tenantName = tenant?.name || 'Comercio';
  const title = quote.title
    ? `${quote.title} — ${tenantName}`
    : `Presupuesto ${quote.quoteNumber} — ${tenantName}`;

  const itemNames = quote.items?.slice(0, 3).map((i: any) => i.name).join(', ') || '';
  const description = `Presupuesto de ${tenantName}${itemNames ? `: ${itemNames}` : ''}`;

  const ogImage = tenant?.logo || `${SITE_URL}/og-image.jpg?v=2`;
  const url = `${SITE_URL}/presupuesto/${params.token}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: tenantName,
      images: [
        {
          url: ogImage,
          width: 400,
          height: 400,
          alt: tenantName,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function PublicQuotePage({ params }: Props) {
  const quote = await fetchQuote(params.token);

  if (!quote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-700 mb-2">Presupuesto no encontrado</h1>
          <p className="text-slate-500">Este link puede haber expirado o no ser valido.</p>
        </div>
      </div>
    );
  }

  return <QuoteView initialQuote={quote} token={params.token} />;
}
