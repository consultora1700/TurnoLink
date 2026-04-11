'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NextImage from 'next/image';
import { Loader2, CheckCircle, XCircle, Clock, ChevronLeft, Lock, ShoppingBag } from 'lucide-react';
import { publicApi, type TenantBranding, type TenantPublic } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function CheckoutResultadoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;

  const status = searchParams.get('status') || searchParams.get('collection_status');
  const externalReference = searchParams.get('external_reference');
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<TenantPublic | null>(null);
  const [branding, setBranding] = useState<TenantBranding | null>(null);

  // Fetch tenant + branding
  useEffect(() => {
    if (!slug) return;
    publicApi.getTenant(slug).then(setTenant).catch(() => {});
    publicApi.getBranding(slug).then(setBranding).catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (!externalReference) {
      setLoading(false);
      return;
    }

    // Extract orderId from external reference (format: order_{orderId}_{timestamp})
    const parts = externalReference.split('_');
    if (parts.length >= 2 && parts[0] === 'order') {
      const orderId = parts[1];

      // Short delay to let webhook process, then redirect to order page
      const timer = setTimeout(() => {
        fetch(`${API_URL}/api/public/tenants/${slug}/orders/${encodeURIComponent(orderId)}`)
          .then((r) => r.ok ? r.json() : null)
          .then((data) => {
            if (data?.order?.orderNumber) {
              router.replace(`/${slug}/pedido/${encodeURIComponent(data.order.orderNumber)}`);
            } else {
              setLoading(false);
            }
          })
          .catch(() => setLoading(false));
      }, 2000);

      return () => clearTimeout(timer);
    }

    setLoading(false);
  }, [externalReference, slug, router]);

  // Colors
  const primaryColor = branding?.primaryColor || tenant?.settings?.primaryColor || '#111827';
  const logoBg = branding?.backgroundColor || '#111827';
  const isDark = (hex: string): boolean => {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 140;
  };
  const navBg = isDark(logoBg) ? logoBg : '#111827';
  const logoUrl = branding?.logoUrl || tenant?.logo;
  const storeName = branding?.welcomeTitle || tenant?.name || '';

  // ─── Loading ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f9fa' }}>
        <nav className="h-14 flex items-center px-4" style={{ backgroundColor: navBg }}>
          <Link href={`/${slug}`} className="text-white/70 hover:text-white transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 text-white/50 text-xs">
            <Lock className="h-3.5 w-3.5" />
          </div>
        </nav>
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin mb-4" style={{ color: primaryColor }} />
          <p className="text-sm text-gray-600 font-medium">Procesando tu pago...</p>
          <p className="text-xs text-gray-400 mt-1">Esto puede tomar unos segundos</p>
        </div>
      </div>
    );
  }

  // Fallback states
  const isApproved = status === 'approved';
  const isPending = status === 'pending' || status === 'in_process';

  const stateConfig = isApproved
    ? { icon: CheckCircle, color: '#10B981', bg: '#D1FAE5', title: 'Pago aprobado', desc: 'Tu pago fue procesado correctamente.' }
    : isPending
    ? { icon: Clock, color: '#F59E0B', bg: '#FEF3C7', title: 'Pago pendiente', desc: 'Tu pago está siendo procesado. Te avisaremos cuando se confirme.' }
    : { icon: XCircle, color: '#EF4444', bg: '#FEE2E2', title: 'Pago rechazado', desc: 'No pudimos procesar tu pago. Intentá con otro medio de pago.' };

  const StateIcon = stateConfig.icon;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f9fa' }}>
      {/* ─── Navbar ─────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 shadow-lg" style={{ backgroundColor: navBg }}>
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center h-14 sm:h-16">
            <Link href={`/${slug}`} className="shrink-0 mr-3 text-white/60 hover:text-white transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            {logoUrl ? (
              <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 mr-2" style={{ border: '2px solid rgba(255,255,255,0.2)' }}>
                <NextImage src={logoUrl} alt={storeName} fill className="object-cover" sizes="32px" />
              </div>
            ) : null}
            <span className="text-white font-semibold text-sm truncate">{storeName}</span>
            <div className="flex-1" />
            <div className="flex items-center gap-1.5 text-white/50 text-xs">
              <Lock className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Compra segura</span>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Content ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-8 text-center">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ backgroundColor: stateConfig.bg }}
              >
                <StateIcon className="h-10 w-10" style={{ color: stateConfig.color }} />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">{stateConfig.title}</h1>
              <p className="text-sm text-gray-500 leading-relaxed">{stateConfig.desc}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <Link
              href={`/${slug}`}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              <ShoppingBag className="h-4 w-4" />
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-[11px] text-gray-400">
          Powered by{' '}
          <a href="https://turnolink.com.ar/mercado" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-500">
            TurnoLink Mercado
          </a>
        </p>
      </div>
    </div>
  );
}
