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
import { formatDuration, parseBookingDate } from '@/lib/utils';
import type { Booking } from '@/lib/api';
import { useState } from 'react';

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

  if (!booking) return null;

  const config = statusConfig[booking.status] || statusConfig.PENDING;
  const StatusIcon = config.icon;

  const buildWhatsAppMessage = () => {
    const dateStr = format(parseBookingDate(booking.date), "EEEE d 'de' MMMM", { locale: es });
    let msg = `Hola ${booking.customer.name}! Tu turno de *${booking.service.name}* el *${dateStr}* a las *${booking.startTime} hs* está confirmado.`;
    if (tenantAddress) {
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
            <DialogTitle>Detalle del Turno</DialogTitle>
            <DialogDescription>Información y acciones del turno</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Status */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bg} ${config.text}`}>
              <StatusIcon className="h-4 w-4" />
              <span className="font-medium">{config.label}</span>
            </div>

            {/* Date & Time */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg">
              <div className="h-10 w-10 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="font-semibold capitalize">
                  {format(parseBookingDate(booking.date), "EEEE d 'de' MMMM", { locale: es })}
                </p>
                <p className="text-sm text-muted-foreground">{booking.startTime} - {booking.endTime}</p>
              </div>
            </div>

            {/* Customer */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg">
              <div className="h-10 w-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center">
                <User className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{booking.customer.name}</p>
                <p className="text-sm text-muted-foreground">{booking.customer.phone}</p>
              </div>
            </div>

            {/* Service */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg">
              <div className="h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                <Scissors className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{booking.service.name}</p>
                <p className="text-sm text-muted-foreground">{formatDuration(booking.service.duration)}</p>
              </div>
            </div>

            {/* Employee */}
            {booking.employee && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg">
                <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                  <UserCog className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{booking.employee.name}</p>
                  {booking.employee.specialty && (
                    <p className="text-sm text-muted-foreground">{booking.employee.specialty}</p>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {booking.notes && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-300">{booking.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              {booking.status === 'PENDING' && (
                <>
                  <Button
                    className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleConfirmAndWhatsApp}
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Confirmar y enviar WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar Turno
                  </Button>
                </>
              )}

              {booking.status === 'CONFIRMED' && (
                <>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => openWhatsApp(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Enviar WhatsApp
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-violet-500 hover:bg-violet-600"
                      onClick={() => onStatusChange(booking.id, 'COMPLETED')}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Completar
                    </Button>
                    <Button
                      variant="outline"
                      className="border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400"
                      onClick={() => onStatusChange(booking.id, 'NO_SHOW')}
                    >
                      No asistió
                    </Button>
                  </div>
                </>
              )}

              {/* Contact buttons */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => openWhatsApp(false)}>
                  <MessageSquare className="h-4 w-4 mr-2 text-green-600" />
                  Chat
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(`tel:${booking.customer.phone}`, '_blank')}
                >
                  <Phone className="h-4 w-4 mr-2 text-blue-600" />
                  Llamar
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar este turno?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás por cancelar el turno de <strong>{booking.customer.name}</strong> para{' '}
              <strong>{booking.service.name}</strong> a las <strong>{booking.startTime}</strong>.
              <br /><br />
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700 text-white">
              Sí, cancelar turno
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
