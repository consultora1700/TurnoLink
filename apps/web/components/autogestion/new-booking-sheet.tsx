'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Check, ChevronLeft, User, Scissors, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { CustomerSearch } from './customer-search';
import { ServiceSelector, type ServiceSelection } from './service-selector';
import { TimeSlotPicker } from './time-slot-picker';
import type { ApiClient, Service, Employee, CreateBookingData } from '@/lib/api';

interface CustomerData {
  name: string;
  phone: string;
  email?: string;
  isAnonymous?: boolean;
}

interface NewBookingSheetProps {
  open: boolean;
  onClose: () => void;
  api: ApiClient;
  services: Service[];
  employees: Employee[];
  initialDate: Date;
  initialTime?: string | null;
  quickMode?: boolean;
  onCreated: () => void;
}

const fullSteps = [
  { id: 1, label: 'Cliente', icon: User },
  { id: 2, label: 'Servicio', icon: Scissors },
  { id: 3, label: 'Horario', icon: Clock },
];

const quickSteps = [
  { id: 1, label: 'Cliente', icon: User },
  { id: 2, label: 'Servicio', icon: Scissors },
];

export function NewBookingSheet({
  open,
  onClose,
  api,
  services,
  employees,
  initialDate,
  initialTime,
  quickMode = false,
  onCreated,
}: NewBookingSheetProps) {
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [serviceSelection, setServiceSelection] = useState<ServiceSelection | null>(null);
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState<string | null>(initialTime || null);
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = quickMode ? quickSteps : fullSteps;
  const totalSteps = steps.length;

  // Reset state when sheet closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
      setTimeout(() => {
        setStep(1);
        setCustomer(null);
        setServiceSelection(null);
        setDate(initialDate);
        setTime(initialTime || null);
        setNotes('');
        setError(null);
      }, 300);
    }
  };

  const getNowTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const canCreate = quickMode
    ? !!customer && !!serviceSelection
    : !!customer && !!serviceSelection && !!time;

  const handleCreate = async () => {
    if (!canCreate) return;

    setCreating(true);
    setError(null);

    try {
      // In quickMode, time is "now" at the moment of creation
      const finalTime = quickMode ? getNowTime() : time!;
      const finalDate = quickMode ? format(new Date(), 'yyyy-MM-dd') : format(date, 'yyyy-MM-dd');

      const data: CreateBookingData = {
        serviceId: serviceSelection!.service.id,
        employeeId: serviceSelection!.employee?.id,
        date: finalDate,
        startTime: finalTime,
        customerName: customer!.name,
        customerPhone: customer!.phone,
        customerEmail: customer!.email || undefined,
      };

      // Build notes with variation info
      const allNotes: string[] = [];
      if (serviceSelection!.variationNotes) {
        allNotes.push(serviceSelection!.variationNotes);
      }
      if (notes.trim()) {
        allNotes.push(notes.trim());
      }
      if (allNotes.length > 0) {
        data.notes = allNotes.join(' | ');
      }

      await api.createBooking(data);
      onCreated();
      handleOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear el turno';
      setError(msg);
    } finally {
      setCreating(false);
    }
  };

  // In quickMode step 2, the last step has the create button
  const isLastStep = step === totalSteps;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-3 border-b shrink-0">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <SheetTitle className="text-lg flex items-center gap-2">
              {quickMode && <Zap className="h-5 w-5 text-teal-500" />}
              {quickMode ? 'Atender Ahora' : 'Nuevo Turno'}
            </SheetTitle>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {steps.map((s, i) => {
              const isCompleted = step > s.id;
              const isActive = step === s.id;
              const StepIcon = s.icon;

              return (
                <div key={s.id} className="flex items-center gap-2">
                  {i > 0 && (
                    <div className={cn(
                      'w-8 h-0.5 rounded-full',
                      isCompleted ? 'bg-teal-500' : 'bg-slate-200 dark:bg-neutral-700'
                    )} />
                  )}
                  <div className="flex flex-col items-center gap-1">
                    <div className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center transition-all',
                      isCompleted
                        ? 'bg-teal-500 text-white'
                        : isActive
                          ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-neutral-800 text-muted-foreground'
                    )}>
                      {isCompleted ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                    </div>
                    <span className={cn(
                      'text-[10px] font-medium',
                      isActive ? 'text-teal-600 dark:text-teal-400' : 'text-muted-foreground'
                    )}>
                      {s.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick mode banner */}
          {quickMode && (
            <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-teal-50 dark:bg-teal-900/30 rounded-lg text-sm">
              <Zap className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="text-teal-700 dark:text-teal-300">
                Hora: <strong>{getNowTime()}</strong> · Fecha: <strong>Hoy</strong>
              </span>
            </div>
          )}
        </SheetHeader>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto p-4">
          {step === 1 && (
            <CustomerSearch
              api={api}
              onSelect={(c) => {
                setCustomer(c);
                if (c) setStep(2);
              }}
              selected={customer}
            />
          )}

          {step === 2 && !quickMode && (
            <ServiceSelector
              services={services}
              employees={employees}
              onSelect={(sel) => {
                setServiceSelection(sel);
                if (sel) setStep(3);
              }}
              selected={serviceSelection}
            />
          )}

          {step === 2 && quickMode && (
            <div className="space-y-4">
              <ServiceSelector
                services={services}
                employees={employees}
                onSelect={setServiceSelection}
                selected={serviceSelection}
              />

              {serviceSelection && (
                <>
                  {/* Notes */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Notas (opcional)</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Agregar una nota al turno..."
                      rows={2}
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  )}

                  {/* Create button */}
                  <Button
                    className="w-full h-12 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-base font-semibold shadow-lg hover:opacity-90 transition-opacity"
                    disabled={!canCreate || creating}
                    onClick={handleCreate}
                  >
                    {creating ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creando...
                      </div>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Atender Ahora
                      </span>
                    )}
                  </Button>
                </>
              )}
            </div>
          )}

          {step === 3 && !quickMode && (
            <div className="space-y-4">
              <TimeSlotPicker
                api={api}
                date={date}
                serviceId={serviceSelection?.service.id}
                onDateChange={setDate}
                onTimeSelect={setTime}
                selectedTime={time}
              />

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Notas (opcional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Agregar una nota al turno..."
                  rows={2}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              {/* Create button */}
              <Button
                className="w-full h-12 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-base font-semibold shadow-lg hover:opacity-90 transition-opacity"
                disabled={!canCreate || creating}
                onClick={handleCreate}
              >
                {creating ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creando...
                  </div>
                ) : (
                  'Crear Turno'
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Bottom action for step 1 */}
        {step === 1 && customer && (
          <div className="border-t p-4 shrink-0">
            <Button
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
              onClick={() => setStep(2)}
            >
              Continuar
            </Button>
          </div>
        )}

        {/* Bottom action for step 2 in full mode only */}
        {step === 2 && !quickMode && serviceSelection && (
          <div className="border-t p-4 shrink-0">
            <Button
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
              onClick={() => setStep(3)}
            >
              Continuar
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
