'use client';

import { useState, useEffect, useMemo } from 'react';
import { CalendarDays, Users, Clock, ChevronLeft, ChevronRight, CheckCircle2, Loader2, AlertCircle, X, Check } from 'lucide-react';
import { publicApi } from '@/lib/api';
import type { ServicePublic, TimeSlot } from '@/lib/api';

interface Props {
  slug: string;
  services: ServicePublic[];
  primaryColor: string;
  whatsappNumber?: string;
  onClose: () => void;
}

const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12];

function getNextDays(count: number): Date[] {
  const days: Date[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatDateShort(d: Date): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${days[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()]}`;
}

function formatDateISO(d: Date): string {
  return d.toISOString().split('T')[0];
}

type Step = 'form' | 'submitting' | 'done' | 'error';

export function TableReservation({ slug, services, primaryColor, whatsappNumber, onClose }: Props) {
  const [partySize, setPartySize] = useState(2);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [errorMsg, setErrorMsg] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [dateOffset, setDateOffset] = useState(0);
  const allDates = useMemo(() => getNextDays(30), []);
  const visibleDates = allDates.slice(dateOffset, dateOffset + 7);

  const matchedService = useMemo(() => {
    if (!services.length) return null;
    return services[0];
  }, [services]);

  useEffect(() => {
    if (!matchedService) return;
    setLoadingSlots(true);
    setSelectedTime(null);
    publicApi.getAvailability(slug, formatDateISO(selectedDate), matchedService.id)
      .then(s => setSlots(s))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [slug, selectedDate, matchedService]);

  const availableSlots = slots.filter(s => s.available);
  const canSubmit = selectedTime && name.trim() && phone.trim();

  const handleSubmit = async () => {
    if (!canSubmit || !matchedService) return;
    setStep('submitting');
    try {
      await publicApi.createBooking(slug, {
        serviceId: matchedService.id,
        date: formatDateISO(selectedDate),
        startTime: selectedTime!,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim() || undefined,
        notes: `Mesa para ${partySize} personas${notes ? `. ${notes}` : ''}`,
        bookingMode: 'presencial',
      });
      setStep('done');
    } catch (err: any) {
      setErrorMsg(err?.message || 'No se pudo completar la reserva. Intentá de nuevo.');
      setStep('error');
    }
  };

  if (!services.length) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-3xl overflow-hidden p-8 text-center animate-in slide-in-from-bottom duration-300">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="w-8 h-8 text-slate-300 dark:text-neutral-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reservas próximamente</h3>
          <p className="text-sm text-slate-500 dark:text-neutral-400 mt-2 max-w-[260px] mx-auto">
            Aún no hay reservas online habilitadas. Contactalos por WhatsApp para reservar tu mesa.
          </p>
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola! Quiero reservar una mesa.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#1fb855] text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Reservar por WhatsApp
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg max-h-[92vh] bg-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Drag handle */}
        <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-slate-300 dark:bg-neutral-600 z-10" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reservar mesa</h3>
            <p className="text-xs text-slate-400 dark:text-neutral-500 mt-0.5">Elegí fecha, hora y cantidad de personas</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400 dark:text-neutral-500" />
          </button>
        </div>

        {step === 'form' && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-5">
              {/* Party size */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-neutral-500 mb-2.5">
                  <Users className="w-3.5 h-3.5" /> Comensales
                </label>
                <div className="flex flex-wrap gap-2">
                  {PARTY_SIZES.map(size => {
                    const isActive = partySize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setPartySize(size)}
                        className={`w-10 h-10 text-sm rounded-xl border-2 font-semibold transition-all duration-150 ${
                          isActive
                            ? 'border-[hsl(var(--tenant-primary-500))] bg-[hsl(var(--tenant-primary-500))] text-white shadow-md shadow-[hsl(var(--tenant-primary-500)_/_0.25)]'
                            : 'border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400 hover:border-slate-300 active:scale-95'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-neutral-500 mb-2.5">
                  <CalendarDays className="w-3.5 h-3.5" /> Fecha
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDateOffset(Math.max(0, dateOffset - 7))}
                    disabled={dateOffset === 0}
                    className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg disabled:opacity-20 transition-colors flex-shrink-0"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-500" />
                  </button>
                  <div className="flex-1 grid grid-cols-7 gap-1.5">
                    {visibleDates.map(d => {
                      const isSelected = formatDateISO(d) === formatDateISO(selectedDate);
                      const isToday = formatDateISO(d) === formatDateISO(new Date());
                      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                      return (
                        <button
                          key={formatDateISO(d)}
                          type="button"
                          onClick={() => setSelectedDate(d)}
                          className={`py-2.5 rounded-xl text-center transition-all duration-150 ${
                            isSelected
                              ? 'bg-[hsl(var(--tenant-primary-500))] text-white shadow-md shadow-[hsl(var(--tenant-primary-500)_/_0.25)] scale-[1.03]'
                              : 'hover:bg-slate-100 dark:hover:bg-neutral-800 active:scale-95'
                          }`}
                        >
                          <div className={`text-[10px] font-medium ${isSelected ? 'text-white/70' : 'text-slate-400 dark:text-neutral-500'}`}>
                            {isToday ? 'Hoy' : dayNames[d.getDay()]}
                          </div>
                          <div className={`text-sm font-bold mt-0.5 ${isSelected ? '' : 'text-slate-800 dark:text-white'}`}>
                            {d.getDate()}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => setDateOffset(Math.min(23, dateOffset + 7))}
                    disabled={dateOffset >= 23}
                    className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg disabled:opacity-20 transition-colors flex-shrink-0"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Time */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-neutral-500 mb-2.5">
                  <Clock className="w-3.5 h-3.5" /> Horario
                </label>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--tenant-primary-500))]" />
                    <span className="text-sm text-slate-500 ml-2">Cargando...</span>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="py-8 text-center">
                    <Clock className="w-8 h-8 text-slate-200 dark:text-neutral-700 mx-auto mb-2" />
                    <p className="text-sm text-slate-400 dark:text-neutral-500">
                      No hay horarios disponibles para esta fecha
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {availableSlots.map(s => {
                      const isActive = selectedTime === s.time;
                      return (
                        <button
                          key={s.time}
                          type="button"
                          onClick={() => setSelectedTime(s.time)}
                          className={`py-2.5 px-2 text-sm font-semibold rounded-xl border-2 transition-all duration-150 ${
                            isActive
                              ? 'border-[hsl(var(--tenant-primary-500))] bg-[hsl(var(--tenant-primary-500)_/_0.08)] text-[hsl(var(--tenant-primary-700))] dark:text-[hsl(var(--tenant-primary-300))] shadow-[0_1px_4px_hsl(var(--tenant-primary-500)_/_0.12)]'
                              : 'border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400 hover:border-slate-300 active:scale-95'
                          }`}
                        >
                          {s.time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Customer info — reveal after time selected */}
              <div className={`overflow-hidden transition-all duration-300 ${
                selectedTime ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-neutral-800">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-neutral-500">Tus datos</p>
                  <div>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Nombre *"
                      className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--tenant-primary-500))] focus:border-transparent placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="Teléfono *"
                      className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--tenant-primary-500))] focus:border-transparent placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Email (opcional)"
                      className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--tenant-primary-500))] focus:border-transparent placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Notas: cumpleaños, silla de bebé, terraza... (opcional)"
                      rows={2}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--tenant-primary-500))] focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-slate-100 dark:border-neutral-800 p-5">
              {/* Summary line */}
              {selectedTime && (
                <p className="text-xs text-slate-400 dark:text-neutral-500 text-center mb-3">
                  {partySize} {partySize === 1 ? 'persona' : 'personas'} · {formatDateShort(selectedDate)} · {selectedTime}hs
                </p>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`w-full h-[48px] rounded-xl font-semibold text-sm transition-all duration-200 ${
                  canSubmit
                    ? 'bg-[hsl(var(--tenant-primary-500))] hover:bg-[hsl(var(--tenant-primary-600))] text-white shadow-md shadow-[hsl(var(--tenant-primary-500)_/_0.25)] active:scale-[0.98]'
                    : 'bg-slate-200 dark:bg-neutral-700 text-slate-400 dark:text-neutral-500 cursor-not-allowed'
                }`}
              >
                Confirmar reserva
              </button>
            </div>
          </>
        )}

        {step === 'submitting' && (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-slate-100 dark:border-neutral-800" />
              <Loader2 className="absolute inset-0 w-16 h-16 text-[hsl(var(--tenant-primary-500))] animate-spin" strokeWidth={2.5} />
            </div>
            <p className="mt-5 text-sm font-medium text-slate-600 dark:text-neutral-400">Confirmando tu reserva...</p>
          </div>
        )}

        {step === 'done' && (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-5 ring-8 ring-amber-50/50 dark:ring-amber-900/10">
              <Clock className="w-10 h-10 text-amber-500" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">Solicitud recibida</h4>
            <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">El local confirmará tu reserva a la brevedad</p>

            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-100 dark:border-neutral-800 w-full max-w-[280px]">
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{partySize} {partySize === 1 ? 'persona' : 'personas'}</div>
              <div className="text-sm text-slate-500 dark:text-neutral-400 mt-1">{formatDateShort(selectedDate)}</div>
              <div className="text-lg font-bold text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))] mt-1">{selectedTime}hs</div>
            </div>

            <p className="text-xs text-slate-400 dark:text-neutral-500 mt-4 max-w-[260px]">
              Te enviaremos una confirmación cuando el local apruebe tu reserva. Si tenés algún cambio, contactanos por WhatsApp.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full max-w-[200px] h-[44px] bg-[hsl(var(--tenant-primary-500))] hover:bg-[hsl(var(--tenant-primary-600))] text-white font-semibold text-sm rounded-xl transition-all active:scale-[0.98]"
            >
              Listo
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-5 ring-8 ring-red-50/50 dark:ring-red-900/10">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">No se pudo reservar</h4>
            <p className="text-sm text-slate-500 dark:text-neutral-400 mt-2 max-w-[260px]">{errorMsg}</p>
            <button
              type="button"
              onClick={() => setStep('form')}
              className="mt-6 px-8 h-[44px] bg-[hsl(var(--tenant-primary-500))] hover:bg-[hsl(var(--tenant-primary-600))] text-white font-semibold text-sm rounded-xl transition-all active:scale-[0.98]"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
