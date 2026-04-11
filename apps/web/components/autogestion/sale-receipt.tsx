'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Download,
  X,
  Share2,
  Loader2,
  ShoppingBag,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import type { Order, Tenant } from '@/lib/api';
import { createApiClient } from '@/lib/api';

const PAYMENT_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia bancaria',
  mercadopago: 'Mercado Pago',
};

// ── Fetch image as base64 using Next.js image proxy (avoids CORS) ──
async function imageToBase64(url: string): Promise<string | null> {
  // Use Next.js image optimization as CORS proxy
  const proxyUrl = `/_next/image?url=${encodeURIComponent(url)}&w=256&q=80`;
  const urls = [proxyUrl, url]; // try proxy first, fallback to direct

  for (const u of urls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(u, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) continue;
      const blob = await res.blob();
      if (blob.size < 100) continue; // too small, probably error
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      continue;
    }
  }
  return null;
}

// ── Generate PDF with jsPDF (pure drawing, no DOM dependency) ──
async function buildPdf(order: Order, tenant: Tenant | null): Promise<Blob> {
  const { jsPDF } = await import('jspdf');

  const W = 100;
  const M = 7;
  const CW = W - M * 2;

  // Helper: hex to RGB (jsPDF needs numeric RGB, not hex strings)
  const hexRgb = (hex: string): [number, number, number] => {
    const h = hex.replace('#', '');
    return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
  };

  // Detect image format from base64 header
  const imgFormat = (b64: string): string => {
    if (b64.startsWith('data:image/png')) return 'PNG';
    if (b64.startsWith('data:image/webp')) return 'WEBP';
    return 'JPEG';
  };

  // Pre-calculate dynamic height
  const nItems = order.items?.length || 0;
  const hasSubtotals = (order.discount > 0 || order.shippingCost > 0);
  const subtotalH = hasSubtotals ? 16 : 0;
  const hasAddress = !!(tenant?.address || tenant?.city);
  const hasPhone = !!tenant?.phone;
  const headerH = 28 + (hasAddress ? 0 : -3) + (hasPhone ? 0 : -3);
  const hasInsta = !!tenant?.instagram;
  const totalH = 10 + headerH + 18 + 6 + (nItems * 14) + 5 + subtotalH + 16 + 5 + 18 + 5 + 14 + 5 + (hasInsta ? 4 : 0) + 22 + 8;
  const pageH = Math.max(totalH, 130);

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [W, pageH] });
  let y = 0;

  // ── Helpers ──
  const fill = (hex: string) => { const [r, g, b] = hexRgb(hex); pdf.setFillColor(r, g, b); };
  const stroke = (hex: string) => { const [r, g, b] = hexRgb(hex); pdf.setDrawColor(r, g, b); };
  const color = (hex: string) => { const [r, g, b] = hexRgb(hex); pdf.setTextColor(r, g, b); };

  const rRect = (rx: number, ry: number, rw: number, rh: number, rad: number, fillH: string, strokeH?: string) => {
    fill(fillH);
    if (strokeH) { stroke(strokeH); pdf.setLineWidth(0.25); }
    pdf.roundedRect(rx, ry, rw, rh, rad, rad, strokeH ? 'FD' : 'F');
  };

  const dash = (x1: number, dy: number, x2: number) => {
    stroke('#e5e5e5'); pdf.setLineWidth(0.15);
    let cx = x1;
    while (cx < x2) { const end = Math.min(cx + 1.5, x2); pdf.line(cx, dy, end, dy); cx = end + 1; }
  };

  const sectionLabel = (text: string, sy: number) => {
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(5.5); color('#a1a1a1');
    pdf.text(text, M, sy);
  };

  // ── Pre-fetch ALL images in parallel ──
  const imageUrls: (string | undefined)[] = [];
  if (tenant?.logo) imageUrls.push(tenant.logo);
  order.items?.forEach((item) => imageUrls.push(item.product?.images?.[0]?.url));

  const allB64 = await Promise.all(
    imageUrls.map((u) => u ? imageToBase64(u) : Promise.resolve(null))
  );

  let imgIdx = 0;
  const logoB64 = tenant?.logo ? allB64[imgIdx++] : null;
  const itemImages = order.items?.map(() => allB64[imgIdx++] ?? null) || [];

  // ═══════════════════════════════════════
  // OUTER CARD — subtle border & white bg
  // ═══════════════════════════════════════
  rRect(3, 3, W - 6, pageH - 6, 4, '#ffffff', '#e8e8e8');

  y = 7;

  // ═══════════════════════════════════════
  // HEADER — gradient teal band (matches HTML preview)
  // ═══════════════════════════════════════
  const hdrH = 26;
  // Main teal background
  rRect(M, y, CW, hdrH, 3, '#0d9488');

  // Logo with rounded frame (white/30 border like HTML)
  let lx = M + 5;
  if (logoB64) {
    try {
      // Semi-transparent white border (simulated with light teal)
      rRect(lx - 0.6, y + 4.9, 12.2, 12.2, 2.2, '#4db8b0');
      // The image
      pdf.addImage(logoB64, imgFormat(logoB64), lx, y + 5.5, 11, 11);
      lx += 14;
    } catch { lx = M + 5; }
  }

  // Business name
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(11); color('#ffffff');
  pdf.text(tenant?.name || 'Comercio', lx, y + 11);

  // Address + phone
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(6); color('#b2dfdb');
  let infoY = y + 15;
  if (hasAddress) {
    let addr = tenant?.address || '';
    if (tenant?.city) addr += `, ${tenant.city}`;
    pdf.text(addr.substring(0, 50), lx, infoY);
    infoY += 3.5;
  }
  if (hasPhone) {
    pdf.text(`Tel: ${tenant!.phone}`, lx, infoY);
  }

  y += hdrH + 5;

  // ═══════════════════════════════════════
  // ORDER INFO — centered
  // ═══════════════════════════════════════
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(5.5); color('#a1a1a1');
  pdf.text('COMPROBANTE DE VENTA', W / 2, y, { align: 'center' });
  y += 5;

  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(15); color('#1a1a1a');
  pdf.text(order.orderNumber || '', W / 2, y, { align: 'center' });
  y += 5;

  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7); color('#888888');
  pdf.text(format(new Date(order.createdAt), "d 'de' MMMM yyyy · HH:mm 'hs'", { locale: es }), W / 2, y, { align: 'center' });
  y += 5;

  dash(M, y, W - M);
  y += 5;

  // ═══════════════════════════════════════
  // PRODUCTS
  // ═══════════════════════════════════════
  sectionLabel(`PRODUCTOS (${nItems})`, y);
  y += 4.5;

  for (let i = 0; i < nItems; i++) {
    const item = order.items![i];
    const rowH = 12.5;

    // Alternating row bg with rounded corners
    if (i % 2 === 0) rRect(M + 0.5, y - 0.5, CW - 1, rowH, 2, '#fafafa');

    // Product image with border frame
    const imgX = M + 2;
    const imgY = y + 0.8;
    const imgS = 10;
    const ib64 = itemImages[i];
    // Border frame
    rRect(imgX - 0.5, imgY - 0.5, imgS + 1, imgS + 1, 2, '#f0f0f0', '#e5e5e5');
    if (ib64) {
      try { pdf.addImage(ib64, imgFormat(ib64), imgX, imgY, imgS, imgS); } catch { /* keep placeholder */ }
    }

    const tx = M + 15;
    // Product name
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8); color('#1a1a1a');
    const pName = (item.productName || '').length > 26 ? item.productName.substring(0, 26) + '...' : (item.productName || '');
    pdf.text(pName, tx, y + 4.5);

    // Variant + qty
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(6.5); color('#888888');
    const detail = item.variantName
      ? `${item.variantName} · ${item.quantity} x ${formatPrice(item.unitPrice)}`
      : `${item.quantity} x ${formatPrice(item.unitPrice)}`;
    pdf.text(detail, tx, y + 8.5);

    // Price right-aligned
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9); color('#1a1a1a');
    pdf.text(formatPrice(item.totalPrice), W - M - 2, y + 6, { align: 'right' });

    y += rowH + 1.5;
  }

  y += 1;
  dash(M, y, W - M);
  y += 4;

  // ═══════════════════════════════════════
  // SUBTOTALS (only if applicable)
  // ═══════════════════════════════════════
  if (hasSubtotals) {
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5);
    color('#888888');
    pdf.text('Subtotal', M + 1, y); pdf.text(formatPrice(order.subtotal), W - M - 1, y, { align: 'right' });
    y += 4.5;
    if (order.discount > 0) {
      color('#888888'); pdf.text('Descuento', M + 1, y);
      color('#16a34a'); pdf.text(`-${formatPrice(order.discount)}`, W - M - 1, y, { align: 'right' });
      y += 4.5;
    }
    if (order.shippingCost > 0) {
      color('#888888'); pdf.text('Envio', M + 1, y);
      pdf.text(formatPrice(order.shippingCost), W - M - 1, y, { align: 'right' });
      y += 4.5;
    }
    y += 1;
  }

  // ═══════════════════════════════════════
  // TOTAL — green gradient-style box
  // ═══════════════════════════════════════
  // Outer glow effect (slightly larger, lighter)
  rRect(M - 0.5, y - 0.5, CW + 1, 15, 3, '#f0fdf9');
  // Main box
  rRect(M, y, CW, 14, 2.5, '#ecfdf5', '#a7f3d0');
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9); color('#374151');
  pdf.text('Total', M + 5, y + 9);
  pdf.setFontSize(15); color('#065f46');
  pdf.text(formatPrice(order.total), W - M - 5, y + 9.5, { align: 'right' });
  y += 19;

  dash(M, y, W - M);
  y += 5;

  // ═══════════════════════════════════════
  // CUSTOMER — card style
  // ═══════════════════════════════════════
  sectionLabel('CLIENTE', y);
  y += 4;

  rRect(M, y, CW, 14, 2.5, '#f9fafb', '#f0f0f0');

  // Avatar circle with gradient-like effect
  const avX = M + 7;
  const avY = y + 7;
  const avR = 4.8;
  // Outer ring
  fill('#0891b2'); pdf.circle(avX, avY, avR + 0.5, 'F');
  // Inner circle
  fill('#0d9488'); pdf.circle(avX, avY, avR, 'F');
  // Letter
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9); color('#ffffff');
  pdf.text((order.customerName?.charAt(0) || '?').toUpperCase(), avX, avY + 1.5, { align: 'center' });

  // Name + phone
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8.5); color('#1a1a1a');
  pdf.text(order.customerName || '', M + 14, y + 5.5);
  if (order.customerPhone) {
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7); color('#666666');
    pdf.text(order.customerPhone, M + 14, y + 10);
  }
  y += 18;

  // ═══════════════════════════════════════
  // PAYMENT — card style
  // ═══════════════════════════════════════
  sectionLabel('METODO DE PAGO', y);
  y += 4;

  const pMethod = order.payments?.[0]?.paymentMethod || '';
  const pLabel = PAYMENT_LABELS[pMethod] || pMethod || 'No especificado';
  const paid = order.payments?.[0]?.status === 'APPROVED';

  rRect(M, y, CW, 12, 2.5, '#f9fafb', '#f0f0f0');
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8.5); color('#1a1a1a');
  pdf.text(pLabel, M + 5, y + 7.5);

  // Badge — rounded pill
  const bTxt = paid ? 'PAGADO' : 'PENDIENTE';
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(5.5);
  const bW = pdf.getTextWidth(bTxt) + 5;
  const bX = W - M - bW - 3;
  rRect(bX, y + 3.5, bW, 5.5, 2.5, paid ? '#d1fae5' : '#fef3c7', paid ? '#86efac' : '#fde68a');
  color(paid ? '#065f46' : '#92400e');
  pdf.text(bTxt, bX + bW / 2, y + 7, { align: 'center' });
  y += 16;

  // ═══════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════
  dash(M, y, W - M);
  y += 5;

  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10); color('#1a1a1a');
  pdf.text('Gracias por tu compra!', W / 2, y, { align: 'center' });
  y += 4.5;

  if (hasInsta) {
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7); color('#888888');
    pdf.text(`@${tenant!.instagram!.replace(/^@/, '')}`, W / 2, y, { align: 'center' });
    y += 4;
  }

  y += 2;
  // Thin separator line
  stroke('#e5e5e5'); pdf.setLineWidth(0.15);
  pdf.line(W / 2 - 15, y, W / 2 + 15, y);
  y += 3;

  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(5.5); color('#bbbbbb');
  pdf.text('Comprobante de venta — Documento no fiscal', W / 2, y, { align: 'center' });
  y += 3;
  pdf.text(`${tenant?.name || ''} · ${format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}`, W / 2, y, { align: 'center' });

  return pdf.output('blob');
}

// ═══════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════

interface SaleReceiptProps {
  order: Order;
  open: boolean;
  onClose: () => void;
  accessToken: string;
}

export function SaleReceipt({ order, open, onClose, accessToken }: SaleReceiptProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [generating, setGenerating] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const api = createApiClient(accessToken);
    api.getTenant().then(setTenant).catch(() => {});
  }, [open, accessToken]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const itemCount = order.items?.length || 0;
  const paymentMethod = order.payments?.[0]?.paymentMethod || '';
  const paymentLabel = PAYMENT_LABELS[paymentMethod] || paymentMethod || 'No especificado';
  const isPaid = order.payments?.[0]?.status === 'APPROVED';
  const fileName = `Comprobante-${order.orderNumber}.pdf`;

  // ── Generate and download PDF ──
  const handleDownload = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const blob = await buildPdf(order, tenant);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) {
      console.error('PDF generation error:', e);
      setError('Error al generar el PDF. Intenta de nuevo.');
    } finally {
      setGenerating(false);
    }
  }, [order, tenant, fileName]);

  // ── Generate PDF and share via native share (WhatsApp etc) ──
  const handleShare = useCallback(async () => {
    setSharing(true);
    setError(null);
    try {
      const blob = await buildPdf(order, tenant);
      const file = new File([blob], fileName, { type: 'application/pdf' });

      // Check if native file sharing is supported
      if (typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Comprobante ${order.orderNumber}`,
        });
      } else {
        // Fallback: download the PDF
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }
    } catch (e: unknown) {
      // AbortError = user cancelled the share dialog, not an error
      if (e instanceof Error && e.name === 'AbortError') return;
      console.error('Share error:', e);
      setError('No se pudo compartir. Usa "Descargar PDF" y compartilo manualmente.');
    } finally {
      setSharing(false);
    }
  }, [order, tenant, fileName]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-[420px] max-h-[90vh] flex flex-col overflow-hidden">
        {/* ─── Toolbar ─── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-neutral-800 shrink-0">
          <h3 className="text-sm font-semibold text-foreground">Comprobante de Venta</h3>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* ─── Preview ─── */}
        <div className="overflow-y-auto flex-1">
          <div className="px-6 py-5 bg-white text-slate-900" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            {/* Business header */}
            <div className="rounded-xl overflow-hidden mb-5" style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)', padding: '16px 14px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -15, right: -15, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              <div className="flex items-center gap-3 relative">
                {tenant?.logo && (
                  <div className="relative h-11 w-11 rounded-lg overflow-hidden border-2 border-white/30 shrink-0">
                    <Image src={tenant.logo} alt={tenant.name} fill sizes="44px" className="object-cover" />
                  </div>
                )}
                <div>
                  <p className="text-white font-extrabold text-base tracking-tight">{tenant?.name || 'Comercio'}</p>
                  {tenant?.address && <p className="text-[10px] text-white/70 mt-0.5">{tenant.address}{tenant.city ? `, ${tenant.city}` : ''}</p>}
                  {tenant?.phone && <p className="text-[10px] text-white/70">Tel: {tenant.phone}</p>}
                </div>
              </div>
            </div>

            {/* Order info */}
            <div className="text-center mb-4">
              <p className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: '#a1a1a1' }}>Comprobante de Venta</p>
              <p className="text-xl font-black tracking-tight mt-1" style={{ color: '#1a1a1a' }}>{order.orderNumber}</p>
              <p className="text-[11px] mt-1" style={{ color: '#888' }}>
                {format(new Date(order.createdAt), "d 'de' MMMM yyyy · HH:mm 'hs'", { locale: es })}
              </p>
            </div>

            <hr style={{ border: 'none', borderTop: '2px dashed #e5e5e5', margin: '14px 0' }} />

            {/* Products */}
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider mb-2.5" style={{ color: '#a1a1a1' }}>Productos ({itemCount})</p>
              <div className="space-y-1">
                {order.items?.map((item, i) => {
                  const imageUrl = item.product?.images?.[0]?.url;
                  return (
                    <div key={item.id || i} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2" style={{ background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                      {imageUrl ? (
                        <div style={{ width: 38, height: 38, borderRadius: 8, border: '1px solid #e5e5e5', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                          <Image src={imageUrl} alt={item.productName} fill sizes="38px" className="object-cover" />
                        </div>
                      ) : (
                        <div style={{ width: 38, height: 38, borderRadius: 8, background: '#f0f0f0', border: '1px solid #e5e5e5', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ShoppingBag className="h-4 w-4" style={{ color: '#ccc' }} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate" style={{ color: '#1a1a1a' }}>{item.productName}</p>
                        {item.variantName && <p className="text-[10px]" style={{ color: '#888' }}>{item.variantName}</p>}
                        <p className="text-[10px]" style={{ color: '#888' }}>{item.quantity} x {formatPrice(item.unitPrice)}</p>
                      </div>
                      <p className="text-sm font-extrabold shrink-0" style={{ color: '#1a1a1a' }}>{formatPrice(item.totalPrice)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px dashed #e5e5e5', margin: '14px 0' }} />

            {/* Subtotals */}
            {(order.discount > 0 || order.shippingCost > 0) && (
              <div className="space-y-1 mb-3">
                <div className="flex justify-between"><span className="text-[11px]" style={{ color: '#888' }}>Subtotal</span><span className="text-[11px]" style={{ color: '#888' }}>{formatPrice(order.subtotal)}</span></div>
                {order.discount > 0 && <div className="flex justify-between"><span className="text-[11px]" style={{ color: '#888' }}>Descuento</span><span className="text-[11px] font-semibold" style={{ color: '#16a34a' }}>-{formatPrice(order.discount)}</span></div>}
                {order.shippingCost > 0 && <div className="flex justify-between"><span className="text-[11px]" style={{ color: '#888' }}>Envio</span><span className="text-[11px]" style={{ color: '#888' }}>{formatPrice(order.shippingCost)}</span></div>}
              </div>
            )}

            {/* Total */}
            <div className="rounded-xl" style={{ background: 'linear-gradient(135deg, #ecfdf5, #f0fdfa)', padding: '12px 14px', border: '1px solid #a7f3d0' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold" style={{ color: '#374151' }}>Total</span>
                <span className="text-2xl font-black tracking-tight" style={{ color: '#065f46' }}>{formatPrice(order.total)}</span>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px dashed #e5e5e5', margin: '14px 0' }} />

            {/* Customer */}
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider mb-2" style={{ color: '#a1a1a1' }}>Cliente</p>
              <div className="flex items-center gap-2.5 rounded-lg" style={{ padding: '8px 10px', background: '#f9fafb', border: '1px solid #f0f0f0' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #14b8a6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                  {order.customerName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: '#1a1a1a' }}>{order.customerName}</p>
                  {order.customerPhone && <p className="text-[11px]" style={{ color: '#666' }}>{order.customerPhone}</p>}
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px dashed #e5e5e5', margin: '14px 0' }} />

            {/* Payment */}
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider mb-2" style={{ color: '#a1a1a1' }}>Metodo de Pago</p>
              <div className="flex items-center justify-between rounded-lg" style={{ padding: '8px 10px', background: '#f9fafb', border: '1px solid #f0f0f0' }}>
                <p className="text-xs font-bold" style={{ color: '#1a1a1a' }}>{paymentLabel}</p>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full" style={isPaid ? { background: '#d1fae5', color: '#065f46' } : { background: '#fef3c7', color: '#92400e' }}>
                  {isPaid ? 'Pagado' : 'Pendiente'}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-5 pt-3" style={{ borderTop: '2px dashed #e5e5e5' }}>
              <p className="text-[13px] font-bold" style={{ color: '#1a1a1a' }}>Gracias por tu compra!</p>
              {tenant?.instagram && <p className="text-[11px] mt-1" style={{ color: '#888' }}>@{tenant.instagram.replace(/^@/, '')}</p>}
              <p className="text-[9px] mt-3 leading-relaxed" style={{ color: '#bbb' }}>
                Comprobante de venta — Documento no fiscal<br />
                {tenant?.name} · {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Error banner ─── */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-100 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {/* ─── Bottom actions ─── */}
        <div className="px-4 py-3 border-t border-slate-100 dark:border-neutral-800 shrink-0 space-y-2">
          <Button
            className="w-full h-11 font-semibold bg-green-600 hover:bg-green-700 text-white"
            onClick={handleShare}
            disabled={sharing || generating}
          >
            {sharing ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Share2 className="h-4 w-4 mr-1.5" />}
            {sharing ? 'Generando PDF...' : 'Enviar por WhatsApp'}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 h-10 font-semibold" onClick={handleDownload} disabled={generating || sharing}>
              {generating ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Download className="h-4 w-4 mr-1.5" />}
              {generating ? 'Generando...' : 'Descargar PDF'}
            </Button>
            <Button variant="outline" className="h-10 px-4 font-semibold" onClick={onClose}>Cerrar</Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
