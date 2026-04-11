'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar,
  User,
  Scissors,
  MessageSquare,
  Phone,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  UserCog,
  Video,
  Moon,
  ShoppingBag,
  Package,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatDuration, formatPrice, parseBookingDate } from '@/lib/utils';
import type { Booking } from '@/lib/api';
import { useMemo, useState } from 'react';

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

const statusConfig: Record<string, { bg: string; text: string; icon: React.ElementType; label: string }> = {
  PENDING: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', icon: AlertCircle, label: 'Pendiente' },
  CONFIRMED: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: CheckCircle2, label: 'Confirmado' },
  COMPLETED: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', icon: CheckCircle2, label: 'Completado' },
  CANCELLED: { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: XCircle, label: 'Cancelado' },
  NO_SHOW: { bg: 'bg-slate-50 dark:bg-neutral-800', text: 'text-slate-700 dark:text-neutral-300', icon: XCircle, label: 'No asistió' },
};

interface BookingDetailDialogProps {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (bookingId: string, status: Booking['status']) => Promise<void>;
  tenantAddress?: string;
  tenantCity?: string;
}

export function BookingDetailDialog({
  booking,
  open,
  onClose,
  onStatusChange,
  tenantAddress,
  tenantCity,
}: BookingDetailDialogProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const sessionTiming = useMemo(() => {
    if (!booking || booking.bookingMode !== 'online') return null;
    const now = new Date();
    const bookingDate = parseBookingDate(booking.date);
    const [sh, sm] = booking.startTime.split(':').map(Number);
    const [eh, em] = booking.endTime.split(':').map(Number);
    const start = new Date(bookingDate); start.setHours(sh, sm, 0, 0);
    const end = new Date(bookingDate); end.setHours(eh, em, 0, 0);

    if (now >= start && now <= end) return 'in_progress' as const;
    if (now < start) {
      const diffMs = start.getTime() - now.getTime();
      const diffMin = Math.round(diffMs / 60000);
      if (diffMin < 60) return { status: 'upcoming' as const, label: `Comienza en ${diffMin} min` };
      const diffH = Math.floor(diffMin / 60);
      if (diffH < 24) return { status: 'upcoming' as const, label: `Comienza en ${diffH}h ${diffMin % 60}min` };
      const diffD = Math.floor(diffH / 24);
      return { status: 'upcoming' as const, label: `Comienza en ${diffD} ${diffD === 1 ? 'día' : 'días'}` };
    }
    return 'past' as const;
  }, [booking?.date, booking?.startTime, booking?.endTime, booking?.bookingMode]);

  if (!booking) return null;

  const config = statusConfig[booking.status] || statusConfig.PENDING;
  const StatusIcon = config.icon;
  const isDaily = !!booking.checkOutDate;
  const isProductSale = !!booking.product && !booking.service;

  const buildWhatsAppMessage = () => {
    if (isDaily) {
      const checkIn = format(parseBookingDate(booking.date), "EEEE d 'de' MMMM", { locale: es });
      const checkOut = format(parseBookingDate(booking.checkOutDate!), "EEEE d 'de' MMMM", { locale: es });
      let msg = `Hola ${booking.customer.name}! Tu reserva de *${(booking.service?.name ?? booking.product?.name ?? 'Sin detalle')}* está confirmada. Check-in: *${checkIn}* / Check-out: *${checkOut}* (${booking.totalNights} ${booking.totalNights === 1 ? 'noche' : 'noches'}).`;
      if (tenantAddress) {
        msg += ` Te esperamos en ${tenantAddress}${tenantCity ? `, ${tenantCity}` : ''}.`;
      }
      msg += ' Gracias!';
      return msg;
    }

    const dateStr = format(parseBookingDate(booking.date), "EEEE d 'de' MMMM", { locale: es });
    let msg = `Hola ${booking.customer.name}! Tu turno de *${(booking.service?.name ?? booking.product?.name ?? 'Sin detalle')}* el *${dateStr}* a las *${booking.startTime} hs* está confirmado.`;
    if (booking.bookingMode === 'online') {
      msg += ` La sesión será de manera *online*. Recibirás el link de acceso antes del turno.`;
    } else if (tenantAddress) {
      msg += ` Te esperamos en ${tenantAddress}${tenantCity ? `, ${tenantCity}` : ''}.`;
    }
    msg += ' Gracias!';
    return msg;
  };

  const openWhatsApp = (withMessage = true) => {
    const phone = normalizePhoneForWhatsApp(booking.customer.phone);
    const url = withMessage
      ? `https://wa.me/${phone}?text=${encodeURIComponent(buildWhatsAppMessage())}`
      : `https://wa.me/${phone}`;
    window.open(url, '_blank');
  };

  const handleConfirmAndWhatsApp = async () => {
    await onStatusChange(booking.id, 'CONFIRMED');
    openWhatsApp(true);
  };

  const handleCancel = async () => {
    await onStatusChange(booking.id, 'CANCELLED');
    setShowCancelDialog(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isProductSale ? 'Detalle de Venta' : 'Detalle del Turno'}</DialogTitle>
            <DialogDescription>{isProductSale ? 'Información de la venta registrada' : 'Información y acciones del turno'}</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {/* Status */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bg} ${config.text}`}>
              <StatusIcon className="h-4 w-4" />
              <span className="font-medium">{config.label}</span>
            </div>

            {/* Info Cards */}
            <div className="space-y-2">
              {/* Date & Time */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                  {isProductSale ? (
                    <ShoppingBag className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  ) : isDaily ? (
                    <Moon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  )}
                </div>
                <div className="min-w-0">
                  {isProductSale ? (
                    <>
                      <p className="font-semibold capitalize">
                        {format(parseBookingDate(booking.date), "EEEE d 'de' MMMM", { locale: es })}
                      </p>
                      <p className="text-sm text-muted-foreground">{booking.startTime} hs</p>
                    </>
                  ) : isDaily ? (
                    <>
                      <p className="font-semibold">
                        {format(parseBookingDate(booking.date), "EEE d MMM", { locale: es })} → {format(parseBookingDate(booking.checkOutDate!), "EEE d MMM", { locale: es })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.totalNights} {booking.totalNights === 1 ? 'noche' : 'noches'}
                        {booking.totalPrice != null && ` · Total: ${formatPrice(Number(booking.totalPrice))}`}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold capitalize">
                        {format(parseBookingDate(booking.date), "EEEE d 'de' MMMM", { locale: es })}
                      </p>
                      <p className="text-sm text-muted-foreground">{booking.startTime} - {booking.endTime}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Customer */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
                  <User className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{booking.customer.name}</p>
                  <p className="text-sm text-muted-foreground">{booking.customer.phone}</p>
                </div>
              </div>

              {/* Service / Product */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                  {isProductSale ? (
                    <Package className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  ) : (
                    <Scissors className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{(booking.service?.name ?? booking.product?.name ?? 'Sin detalle')}</p>
                  <p className="text-sm text-muted-foreground">
                    {isProductSale
                      ? `${formatPrice(Number(booking.product!.price))} c/u${(booking.quantity ?? 1) > 1 ? ` × ${booking.quantity}` : ''}`
                      : isDaily
                        ? ((booking.service?.price ?? 0) != null ? `${formatPrice(Number(booking.service?.price ?? 0))}/noche` : '')
                        : formatDuration(booking.service?.duration ?? 15)
                    }
                  </p>
                </div>
              </div>

              {/* Sale Total (product sales only) */}
              {isProductSale && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                      {formatPrice(Number(booking.totalPrice ?? 0))}
                    </p>
                    <p className="text-sm text-muted-foreground">Total de la venta</p>
                  </div>
                </div>
              )}

              {/* Employee */}
              {booking.employee && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                    <UserCog className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{booking.employee.name}</p>
                    {booking.employee.specialty && (
                      <p className="text-sm text-muted-foreground">{booking.employee.specialty}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            {booking.notes && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-300">{booking.notes}</p>
              </div>
            )}

            {/* Video Session Link */}
            {booking.videoJoinUrl && (
              <div className={`p-3 rounded-lg border ${
                sessionTiming === 'in_progress'
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700'
                  : sessionTiming === 'past'
                    ? 'bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700'
                    : 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Video className={`h-4 w-4 ${
                    sessionTiming === 'in_progress'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : sessionTiming === 'past'
                        ? 'text-slate-500 dark:text-neutral-400'
                        : 'text-indigo-600 dark:text-indigo-400'
                  }`} />
                  {sessionTiming === 'in_progress' ? (
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Sesión en curso</span>
                  ) : sessionTiming === 'past' ? (
                    <span className="text-sm text-slate-500 dark:text-neutral-400">Sesión finalizada</span>
                  ) : (
                    <span className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
                      Sesión online
                      {sessionTiming && typeof sessionTiming === 'object' && (
                        <span className="font-normal text-indigo-600 dark:text-indigo-400"> · {sessionTiming.label}</span>
                      )}
                    </span>
                  )}
                </div>
                <Button
                  className={`w-full ${
                    sessionTiming === 'in_progress'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : sessionTiming === 'past'
                        ? 'bg-slate-400 hover:bg-slate-500 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                  onClick={() => window.open(booking.videoJoinUrl!, '_blank')}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Entrar a la sesión
                </Button>
              </div>
            )}
            {booking.bookingMode === 'online' && !booking.videoJoinUrl && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm text-indigo-700 dark:text-indigo-300">Turno online (link pendiente)</span>
                </div>
              </div>
            )}

            {/* Separator */}
            <div className="border-t border-slate-200 dark:border-neutral-700" />

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {/* PENDING actions */}
              {booking.status === 'PENDING' && (
                <>
                  {isProductSale ? (
                    <>
                      <Button
                        className="w-full h-10 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => onStatusChange(booking.id, 'CONFIRMED')}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Confirmar Venta
                      </Button>
                      <Button
                        className="w-full h-10 bg-violet-500 hover:bg-violet-600 text-white"
                        onClick={() => onStatusChange(booking.id, 'COMPLETED')}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Completar Venta
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        className="w-full h-10 bg-green-600 hover:bg-green-700 text-white"
                        onClick={handleConfirmAndWhatsApp}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Confirmar + WhatsApp
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 h-10" onClick={() => openWhatsApp(false)}>
                          <MessageSquare className="h-4 w-4 mr-2 text-green-600" />
                          Chat
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 h-10"
                          onClick={() => window.open(`tel:${booking.customer.phone}`, '_blank')}
                        >
                          <Phone className="h-4 w-4 mr-2 text-blue-600" />
                          Llamar
                        </Button>
                      </div>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full h-10 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    {isProductSale ? 'Anular venta' : 'Cancelar turno'}
                  </Button>
                </>
              )}

              {/* CONFIRMED actions */}
              {booking.status === 'CONFIRMED' && (
                <>
                  <div className="flex gap-2">
                    <Button
                      className={`${isProductSale ? 'flex-1' : ''} flex-1 h-10 bg-violet-500 hover:bg-violet-600 text-white`}
                      onClick={() => onStatusChange(booking.id, 'COMPLETED')}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Completar
                    </Button>
                    {!isProductSale && (
                      <Button
                        variant="outline"
                        className="flex-1 h-10 border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-800"
                        onClick={() => onStatusChange(booking.id, 'NO_SHOW')}
                      >
                        No asistió
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full h-10 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
                    onClick={() => openWhatsApp(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Enviar WhatsApp
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 h-10" onClick={() => openWhatsApp(false)}>
                      <MessageSquare className="h-4 w-4 mr-2 text-green-600" />
                      Chat
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-10"
                      onClick={() => window.open(`tel:${booking.customer.phone}`, '_blank')}
                    >
                      <Phone className="h-4 w-4 mr-2 text-blue-600" />
                      Llamar
                    </Button>
                  </div>
                </>
              )}

              {/* Terminal states: only contact */}
              {(booking.status === 'COMPLETED' || booking.status === 'CANCELLED' || booking.status === 'NO_SHOW') && (
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 h-10" onClick={() => openWhatsApp(false)}>
                    <MessageSquare className="h-4 w-4 mr-2 text-green-600" />
                    Chat
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-10"
                    onClick={() => window.open(`tel:${booking.customer.phone}`, '_blank')}
                  >
                    <Phone className="h-4 w-4 mr-2 text-blue-600" />
                    Llamar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isProductSale ? '¿Anular esta venta?' : '¿Cancelar este turno?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {isProductSale ? (
                <>
                  Estás por anular la venta de <strong>{booking.product?.name}</strong> a <strong>{booking.customer.name}</strong> por <strong>{formatPrice(Number(booking.totalPrice ?? 0))}</strong>.
                  <br /><br />
                  Esta acción no se puede deshacer.
                </>
              ) : (
                <>
                  Estás por cancelar el turno de <strong>{booking.customer.name}</strong> para{' '}
                  <strong>{(booking.service?.name ?? booking.product?.name ?? 'Sin detalle')}</strong> a las <strong>{booking.startTime}</strong>.
                  <br /><br />
                  Esta acción no se puede deshacer.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700 text-white">
              {isProductSale ? 'Sí, anular venta' : 'Sí, cancelar turno'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
