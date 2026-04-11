'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import {
  ShoppingBag,
  User,
  Phone,
  Mail,
  CreditCard,
  Banknote,
  Building2,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  AlertCircle,
  MessageSquare,
  ChevronRight,
  CircleDot,
  ArrowRight,
  FileText,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/lib/api';
import { createApiClient } from '@/lib/api';

const STATUS_CONFIG: Record<string, {
  label: string;
  icon: typeof Clock;
  color: string;
  textColor: string;
  bgColor: string;
  ringColor: string;
  gradient: string;
}> = {
  PENDING: {
    label: 'Pendiente',
    icon: Clock,
    color: 'text-amber-600 dark:text-amber-400',
    textColor: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-100 dark:bg-amber-900/40',
    ringColor: 'ring-amber-200 dark:ring-amber-800',
    gradient: 'from-amber-500 to-orange-500',
  },
  CONFIRMED: {
    label: 'Confirmado',
    icon: CheckCircle2,
    color: 'text-blue-600 dark:text-blue-400',
    textColor: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-100 dark:bg-blue-900/40',
    ringColor: 'ring-blue-200 dark:ring-blue-800',
    gradient: 'from-blue-500 to-indigo-500',
  },
  SHIPPED: {
    label: 'Enviado',
    icon: Truck,
    color: 'text-indigo-600 dark:text-indigo-400',
    textColor: 'text-indigo-700 dark:text-indigo-300',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/40',
    ringColor: 'ring-indigo-200 dark:ring-indigo-800',
    gradient: 'from-indigo-500 to-purple-500',
  },
  DELIVERED: {
    label: 'Entregado',
    icon: Package,
    color: 'text-emerald-600 dark:text-emerald-400',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
    ringColor: 'ring-emerald-200 dark:ring-emerald-800',
    gradient: 'from-emerald-500 to-teal-500',
  },
  CANCELLED: {
    label: 'Cancelado',
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    textColor: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-100 dark:bg-red-900/40',
    ringColor: 'ring-red-200 dark:ring-red-800',
    gradient: 'from-red-500 to-rose-500',
  },
};

function normalizePhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
  if (cleaned.length === 10 && !cleaned.startsWith('54')) {
    cleaned = '549' + cleaned;
  } else if (cleaned.length === 11 && cleaned.startsWith('15')) {
    cleaned = '549' + cleaned.substring(2);
  } else if (cleaned.length >= 12 && cleaned.startsWith('54') && !cleaned.startsWith('549')) {
    cleaned = '549' + cleaned.substring(2);
  }
  return cleaned;
}

const PAYMENT_ICONS: Record<string, typeof CreditCard> = {
  efectivo: Banknote,
  transferencia: Building2,
  mercadopago: CreditCard,
};

const PAYMENT_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia bancaria',
  mercadopago: 'Mercado Pago',
};

const PAYMENT_DESCRIPTIONS: Record<string, string> = {
  efectivo: 'Pago en mano al momento de la entrega',
  transferencia: 'Transferencia o depósito bancario',
  mercadopago: 'Pago procesado por Mercado Pago',
};

interface OrderDetailSheetProps {
  orderId: string | null;
  open: boolean;
  onClose: () => void;
  accessToken: string;
  onStatusChange?: () => void;
  onShowReceipt?: (order: Order) => void;
}

export function OrderDetailSheet({ orderId, open, onClose, accessToken, onStatusChange, onShowReceipt }: OrderDetailSheetProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!orderId || !open) return;
    setLoading(true);
    const api = createApiClient(accessToken);
    api.getOrder(orderId)
      .then((data: Order) => setOrder(data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId, open, accessToken]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;
    setUpdatingStatus(true);
    try {
      const api = createApiClient(accessToken);
      const updated = await api.updateOrderStatus(order.id, newStatus);
      setOrder(updated);
      onStatusChange?.();
    } catch {
      // silently fail
    } finally {
      setUpdatingStatus(false);
    }
  };

  const sc = order ? (STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING) : STATUS_CONFIG.PENDING;
  const StatusIcon = sc.icon;
  const paymentMethod = order?.payments?.[0]?.paymentMethod || '';
  const PaymentIcon = PAYMENT_ICONS[paymentMethod] || CreditCard;
  const paymentLabel = PAYMENT_LABELS[paymentMethod] || paymentMethod || 'No especificado';
  const paymentDescription = PAYMENT_DESCRIPTIONS[paymentMethod] || '';
  const isPOS = order?.notes?.startsWith('[POS]');
  const isPaid = order?.payments?.[0]?.status === 'APPROVED';
  const itemCount = order?.items?.length || order?._count?.items || 0;

  // Next valid statuses
  const getNextStatuses = (status: string): { status: string; label: string; icon: typeof Clock; variant: 'primary' | 'danger' }[] => {
    switch (status) {
      case 'PENDING': return [
        { status: 'CONFIRMED', label: 'Confirmar Pedido', icon: CheckCircle2, variant: 'primary' },
        { status: 'CANCELLED', label: 'Cancelar', icon: XCircle, variant: 'danger' },
      ];
      case 'CONFIRMED': return [
        { status: 'DELIVERED', label: 'Marcar como Entregado', icon: Package, variant: 'primary' },
        { status: 'SHIPPED', label: 'Marcar como Enviado', icon: Truck, variant: 'primary' },
        { status: 'CANCELLED', label: 'Cancelar', icon: XCircle, variant: 'danger' },
      ];
      case 'SHIPPED': return [
        { status: 'DELIVERED', label: 'Marcar como Entregado', icon: Package, variant: 'primary' },
      ];
      default: return [];
    }
  };

  const nextStatuses = order ? getNextStatuses(order.status) : [];

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 overflow-y-auto">
        <SheetHeader className="sr-only">
          <SheetTitle>Detalle de venta</SheetTitle>
          <SheetDescription>Información completa de la venta</SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-teal-100 dark:border-teal-900" />
              <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-t-teal-600 animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground">Cargando detalle...</p>
          </div>
        ) : !order ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-neutral-800 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground">No se pudo cargar la orden</p>
          </div>
        ) : (
          <div className="flex flex-col min-h-full">

            {/* ═══════ COMPACT HEADER ═══════ */}
            <div className={`relative overflow-hidden bg-gradient-to-br ${sc.gradient} px-5 pt-11 pb-4`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />

              <div className="relative">
                {/* Top row: order number + total */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white tracking-tight">{order.orderNumber}</h2>
                      {isPOS && (
                        <span className="text-[10px] font-bold text-white/90 bg-white/20 px-1.5 py-0.5 rounded-full">POS</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-semibold text-white">
                        <StatusIcon className="h-3 w-3" />
                        {sc.label}
                      </div>
                      <span className="text-white/50 text-[11px]">
                        {format(new Date(order.createdAt), "d MMM · HH:mm 'hs'", { locale: es })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-extrabold text-white tracking-tight">{formatPrice(order.total)}</p>
                    <p className={`text-[10px] font-semibold mt-0.5 ${isPaid ? 'text-white/80' : 'text-white/50'}`}>
                      {isPaid ? 'Pagado' : 'Pago pendiente'}
                    </p>
                  </div>
                </div>
                {(order.discount > 0 || order.shippingCost > 0) && (
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-white/40">
                    <span>Sub: {formatPrice(order.subtotal)}</span>
                    {order.discount > 0 && <span>Dto: -{formatPrice(order.discount)}</span>}
                    {order.shippingCost > 0 && <span>Envío: +{formatPrice(order.shippingCost)}</span>}
                  </div>
                )}
              </div>
            </div>

            {/* ═══════ BODY ═══════ */}
            <div className="flex-1 bg-background">

              {/* ─── Productos ─── */}
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Productos</h3>
                  <span className="text-xs text-muted-foreground bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <div className="space-y-2">
                  {order.items?.map((item, i) => {
                    const imageUrl = item.product?.images?.[0]?.url;
                    return (
                      <div key={item.id || i} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/80 dark:bg-neutral-800/40 border border-slate-100 dark:border-neutral-800">
                        {/* Product image or fallback */}
                        <div className="h-14 w-14 rounded-xl overflow-hidden bg-white dark:bg-neutral-700 border border-slate-200 dark:border-neutral-600 shrink-0 shadow-sm">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={item.productName}
                              width={56}
                              height={56}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-700 dark:to-neutral-800">
                              <ShoppingBag className="h-5 w-5 text-slate-300 dark:text-neutral-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate text-foreground">{item.productName}</p>
                          {item.variantName && (
                            <p className="text-xs text-muted-foreground mt-0.5">{item.variantName}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.quantity > 1 ? `${item.quantity} × ${formatPrice(item.unitPrice)}` : formatPrice(item.unitPrice)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-foreground">{formatPrice(item.totalPrice)}</p>
                          {item.quantity > 1 && (
                            <span className="text-[10px] text-muted-foreground bg-slate-200/60 dark:bg-neutral-700 px-1.5 py-0.5 rounded font-medium">
                              ×{item.quantity}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {(!order.items || order.items.length === 0) && (
                    <div className="text-center py-6">
                      <Package className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Sin detalle de productos</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="mx-5 border-t border-dashed border-slate-200 dark:border-neutral-800" />

              {/* ─── Cliente ─── */}
              <div className="px-5 py-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Cliente</h3>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-neutral-800/40 border border-slate-100 dark:border-neutral-800">
                  {/* Avatar */}
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-sm font-bold text-white uppercase">
                      {order.customerName?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{order.customerName}</p>
                    {order.customerPhone && (
                      <p className="text-xs text-muted-foreground mt-0.5">{order.customerPhone}</p>
                    )}
                  </div>
                  {/* WhatsApp CTA */}
                  {order.customerPhone && (
                    <a
                      href={`https://wa.me/${normalizePhoneForWhatsApp(order.customerPhone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 w-9 rounded-full bg-green-500 hover:bg-green-600 transition-colors flex items-center justify-center shrink-0 shadow-sm"
                    >
                      <Phone className="h-4 w-4 text-white" />
                    </a>
                  )}
                </div>
                {order.customerEmail && !order.customerEmail.includes('@turnolink.local') && (
                  <div className="flex items-center gap-2 mt-2 px-3 text-xs text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{order.customerEmail}</span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="mx-5 border-t border-dashed border-slate-200 dark:border-neutral-800" />

              {/* ─── Método de Pago ─── */}
              <div className="px-5 py-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Método de pago</h3>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-neutral-800/40 border border-slate-100 dark:border-neutral-800">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${isPaid ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                    <PaymentIcon className={`h-5 w-5 ${isPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{paymentLabel}</p>
                    <p className="text-xs text-muted-foreground">{paymentDescription}</p>
                  </div>
                  <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                    isPaid
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                  }`}>
                    {isPaid ? 'Pagado' : 'Pendiente'}
                  </div>
                </div>
              </div>

              {/* ─── Notas ─── */}
              {order.notes && order.notes !== '[POS] Venta presencial' && (
                <>
                  <div className="mx-5 border-t border-dashed border-slate-200 dark:border-neutral-800" />
                  <div className="px-5 py-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Notas</h3>
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                      <MessageSquare className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">{order.notes.replace(/^\[POS\]\s*/, '')}</p>
                    </div>
                  </div>
                </>
              )}

              {/* ─── Timeline / Historial ─── */}
              {order.statusHistory && order.statusHistory.length > 0 && (
                <>
                  <div className="mx-5 border-t border-dashed border-slate-200 dark:border-neutral-800" />
                  <div className="px-5 py-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Historial</h3>
                    <div className="relative">
                      {order.statusHistory.map((entry, i) => {
                        const entryConfig = STATUS_CONFIG[entry.status] || STATUS_CONFIG.PENDING;
                        const isLast = i === order.statusHistory!.length - 1;
                        const isFirst = i === 0;
                        return (
                          <div key={entry.id || i} className="flex items-start gap-3 relative">
                            {/* Timeline connector */}
                            {!isLast && (
                              <div className="absolute left-[11px] top-7 bottom-0 w-px bg-slate-200 dark:bg-neutral-700" />
                            )}
                            {/* Dot */}
                            <div className={`relative z-10 mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                              isFirst ? entryConfig.bgColor : 'bg-slate-100 dark:bg-neutral-800'
                            }`}>
                              <CircleDot className={`h-3 w-3 ${isFirst ? entryConfig.color : 'text-slate-400 dark:text-neutral-500'}`} />
                            </div>
                            <div className={`pb-4 ${isFirst ? '' : 'opacity-60'}`}>
                              <div className="flex items-center gap-2">
                                <p className={`text-sm font-medium ${isFirst ? 'text-foreground' : 'text-muted-foreground'}`}>{entryConfig.label}</p>
                                <span className="text-[11px] text-muted-foreground">
                                  {format(new Date(entry.createdAt), "HH:mm 'hs'", { locale: es })}
                                </span>
                              </div>
                              {entry.note && (
                                <p className="text-xs text-muted-foreground mt-0.5">{entry.note}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* ─── Comprobante + Actions ─── */}
              <div className="mx-5 border-t border-dashed border-slate-200 dark:border-neutral-800" />
              <div className="px-5 py-5 pb-8">
                <div className="space-y-2">
                  {/* Comprobante button — always visible */}
                  {/* WhatsApp share — native <a>, works on any device */}
                  <Button
                    size="lg"
                    className="w-full justify-center gap-2 h-12 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => { onClose(); setTimeout(() => onShowReceipt?.(order), 150); }}
                  >
                    <FileText className="h-4.5 w-4.5" />
                    Ver / Enviar Comprobante
                  </Button>

                  {/* Status change actions */}
                  {nextStatuses.map((ns) => {
                    const NsIcon = ns.icon;
                    return (
                      <Button
                        key={ns.status}
                        size="lg"
                        variant={ns.variant === 'danger' ? 'outline' : 'default'}
                        className={`w-full justify-center gap-2 h-12 text-sm font-semibold ${
                          ns.variant === 'danger'
                            ? 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30'
                            : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-md shadow-teal-600/20'
                        }`}
                        disabled={updatingStatus}
                        onClick={() => handleStatusUpdate(ns.status)}
                      >
                        <NsIcon className="h-4.5 w-4.5" />
                        {ns.label}
                        {ns.variant !== 'danger' && <ArrowRight className="h-4 w-4 ml-1" />}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>

    </Sheet>
  );
}
