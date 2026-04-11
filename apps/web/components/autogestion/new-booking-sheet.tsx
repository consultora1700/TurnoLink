'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Check,
  ChevronLeft,
  User,
  Scissors,
  Clock,
  Zap,
  MapPin,
  Video,
  ShoppingBag,
  CreditCard,
  Banknote,
  Building2,
  Receipt,
} from 'lucide-react';
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
import { formatPrice } from '@/lib/utils';
import { CustomerSearch } from './customer-search';
import { ServiceSelector, type ServiceSelection } from './service-selector';
import { ProductSelector, type ProductSelection, type CartItem } from './product-selector';
import { TimeSlotPicker } from './time-slot-picker';
import type { ApiClient, Service, Product, Employee, CreateBookingData } from '@/lib/api';

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
  products?: Product[];
  isMercado?: boolean;
  employees: Employee[];
  initialDate: Date;
  initialTime?: string | null;
  quickMode?: boolean;
  onCreated: () => void;
}

const PAYMENT_METHODS = [
  { id: 'efectivo', label: 'Efectivo', icon: Banknote, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800' },
  { id: 'transferencia', label: 'Transferencia', icon: Building2, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' },
  { id: 'mercadopago', label: 'Mercado Pago', icon: CreditCard, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/30 border-sky-200 dark:border-sky-800' },
] as const;

function getSteps(isMercado: boolean, quickMode: boolean) {
  if (isMercado) {
    return [
      { id: 1, label: 'Productos', icon: ShoppingBag },
      { id: 2, label: 'Cliente', icon: User },
      { id: 3, label: 'Pago', icon: CreditCard },
    ];
  }

  const itemStep = { id: 2, label: 'Servicio', icon: Scissors };

  if (quickMode) {
    return [
      { id: 1, label: 'Cliente', icon: User },
      itemStep,
    ];
  }
  return [
    { id: 1, label: 'Cliente', icon: User },
    itemStep,
    { id: 3, label: 'Horario', icon: Clock },
  ];
}

export function NewBookingSheet({
  open,
  onClose,
  api,
  services,
  products = [],
  isMercado = false,
  employees,
  initialDate,
  initialTime,
  quickMode = false,
  onCreated,
}: NewBookingSheetProps) {
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [serviceSelection, setServiceSelection] = useState<ServiceSelection | null>(null);
  const [productSelection, setProductSelection] = useState<ProductSelection | null>(null);
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState<string | null>(initialTime || null);
  const [notes, setNotes] = useState('');
  const [bookingMode, setBookingMode] = useState<'presencial' | 'online' | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Multi-product cart (mercado mode)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>('efectivo');

  const steps = getSteps(isMercado, quickMode);
  const totalSteps = steps.length;
  const isQuickFlow = quickMode && !isMercado;

  // Cart total
  const cartTotal = cartItems.reduce((sum, i) => sum + i.totalPrice, 0);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  // Whether we have a valid item selected (service or product)
  const hasItemSelected = isMercado ? cartItems.length > 0 : !!serviceSelection;

  // Determine effective booking mode based on service (only for service bookings)
  const serviceMode = serviceSelection?.service?.mode;
  const effectiveBookingMode = serviceMode === 'online' ? 'online'
    : serviceMode === 'ambos' ? bookingMode
    : serviceMode === 'presencial' ? 'presencial'
    : null;
  const needsModeSelection = !isMercado && serviceMode === 'ambos' && !bookingMode;

  // Reset state when sheet closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
      setTimeout(() => {
        setStep(1);
        setCustomer(null);
        setServiceSelection(null);
        setProductSelection(null);
        setCartItems([]);
        setPaymentMethod('efectivo');
        setDate(initialDate);
        setTime(initialTime || null);
        setNotes('');
        setBookingMode(null);
        setError(null);
      }, 300);
    }
  };

  const getNowTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const canCreate = isMercado
    ? cartItems.length > 0 && !!customer && !!paymentMethod
    : isQuickFlow
      ? !!customer && hasItemSelected && !needsModeSelection
      : !!customer && hasItemSelected && !!time && !needsModeSelection;

  const handleCreate = async () => {
    if (!canCreate) return;

    setCreating(true);
    setError(null);

    try {
      if (isMercado) {
        // Create POS order with multiple products
        await api.createPosOrder({
          items: cartItems.map((item) => ({
            productId: item.product.id,
            variantId: item.variant?.id,
            quantity: item.quantity,
          })),
          customerName: customer!.name,
          customerPhone: customer!.phone,
          customerEmail: customer!.email || undefined,
          paymentMethod: paymentMethod as 'efectivo' | 'transferencia' | 'mercadopago',
          notes: notes.trim() || undefined,
        });
      } else {
        // Service booking (unchanged logic)
        const finalTime = isQuickFlow ? getNowTime() : time!;
        const finalDate = isQuickFlow ? format(new Date(), 'yyyy-MM-dd') : format(date, 'yyyy-MM-dd');

        const data: CreateBookingData = {
          date: finalDate,
          startTime: finalTime,
          customerName: customer!.name,
          customerPhone: customer!.phone,
          customerEmail: customer!.email || undefined,
        };

        if (serviceSelection) {
          data.serviceId = serviceSelection.service.id;
          data.employeeId = serviceSelection.employee?.id;
          data.bookingMode = effectiveBookingMode || undefined;
          const allNotes: string[] = [];
          if (serviceSelection.variationNotes) allNotes.push(serviceSelection.variationNotes);
          if (notes.trim()) allNotes.push(notes.trim());
          if (allNotes.length > 0) data.notes = allNotes.join(' | ');
        }

        await api.createBooking(data);
      }

      onCreated();
      handleOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear el registro';
      setError(msg);
    } finally {
      setCreating(false);
    }
  };

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
              {isMercado ? (
                <>
                  <ShoppingBag className="h-5 w-5 text-teal-500" />
                  {quickMode ? 'Venta Rápida' : 'Nueva Venta'}
                </>
              ) : (
                <>
                  {isQuickFlow && <Zap className="h-5 w-5 text-teal-500" />}
                  {quickMode ? 'Atender Ahora' : 'Nuevo Turno'}
                </>
              )}
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

          {/* Quick mode banner (non-mercado only) */}
          {isQuickFlow && (
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

          {/* ═══════ MERCADO FLOW ═══════ */}
          {isMercado && step === 1 && (
            <ProductSelector
              products={products}
              multiMode
              cartItems={cartItems}
              onCartChange={setCartItems}
              onSelect={() => {}}
              selected={null}
            />
          )}

          {isMercado && step === 2 && (
            <CustomerSearch
              api={api}
              onSelect={(c) => setCustomer(c)}
              selected={customer}
            />
          )}

          {isMercado && step === 3 && (
            <div className="space-y-4">
              {/* Order summary */}
              <div className="rounded-xl border border-slate-200 dark:border-neutral-700 overflow-hidden">
                <div className="px-3 py-2.5 bg-slate-50 dark:bg-neutral-800/50 border-b border-slate-200 dark:border-neutral-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Receipt className="h-3.5 w-3.5" />
                      Resumen de la venta
                    </span>
                    <span className="text-xs text-muted-foreground">{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
                  </div>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-neutral-800">
                  {cartItems.map((item) => (
                    <div key={`${item.product.id}-${item.variant?.id || 'base'}`} className="flex items-center justify-between px-3 py-2 text-sm">
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{item.product.name}</span>
                        {item.variant && (
                          <span className="text-xs text-muted-foreground ml-1">({item.variant.value || item.variant.name})</span>
                        )}
                        <span className="text-xs text-muted-foreground ml-1">x{item.quantity}</span>
                      </div>
                      <span className="font-semibold shrink-0 ml-2">{formatPrice(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>
                <div className="px-3 py-2.5 bg-teal-50 dark:bg-teal-900/20 border-t border-teal-200 dark:border-teal-800 flex items-center justify-between">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-lg font-bold text-teal-700 dark:text-teal-400">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              {/* Customer */}
              {customer && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0 text-sm">
                    <span className="font-medium">{customer.name}</span>
                    <span className="text-muted-foreground ml-2">{customer.phone}</span>
                  </div>
                </div>
              )}

              {/* Payment method */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Método de pago</Label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map((pm) => {
                    const isSelected = paymentMethod === pm.id;
                    const Icon = pm.icon;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-medium',
                          isSelected
                            ? `${pm.bg} border-current ${pm.color}`
                            : 'border-slate-200 dark:border-neutral-700 text-muted-foreground hover:border-slate-300 dark:hover:border-neutral-600'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{pm.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Notas (opcional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Agregar una nota a la venta..."
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
                    Registrando...
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Registrar Venta · {formatPrice(cartTotal)}
                  </span>
                )}
              </Button>
            </div>
          )}

          {/* ═══════ SERVICE FLOW (non-mercado) ═══════ */}
          {!isMercado && step === 1 && (
            <CustomerSearch
              api={api}
              onSelect={(c) => {
                setCustomer(c);
                if (c) setStep(2);
              }}
              selected={customer}
            />
          )}

          {!isMercado && step === 2 && !isQuickFlow && (
            <div className="space-y-4">
              <ServiceSelector
                services={services}
                employees={employees}
                onSelect={(sel) => {
                  setServiceSelection(sel);
                  setBookingMode(null);
                }}
                selected={serviceSelection}
              />
              {serviceSelection && serviceMode === 'ambos' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Modalidad</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setBookingMode('presencial')} className={cn('flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium', bookingMode === 'presencial' ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300' : 'border-slate-200 dark:border-neutral-700 text-muted-foreground hover:border-slate-300')}>
                      <MapPin className="h-4 w-4" /> Presencial
                    </button>
                    <button type="button" onClick={() => setBookingMode('online')} className={cn('flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium', bookingMode === 'online' ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300' : 'border-slate-200 dark:border-neutral-700 text-muted-foreground hover:border-slate-300')}>
                      <Video className="h-4 w-4" /> Online
                    </button>
                  </div>
                </div>
              )}
              {serviceSelection && serviceMode === 'online' && (
                <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-sm text-indigo-700 dark:text-indigo-300">
                  <Video className="h-4 w-4" /> Sesión online — se generará link de videollamada
                </div>
              )}
            </div>
          )}

          {!isMercado && step === 2 && isQuickFlow && (
            <div className="space-y-4">
              <ServiceSelector
                services={services}
                employees={employees}
                onSelect={(sel) => { setServiceSelection(sel); setBookingMode(null); }}
                selected={serviceSelection}
              />

              {serviceSelection && (
                <>
                  {serviceMode === 'ambos' && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Modalidad</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setBookingMode('presencial')} className={cn('flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium', bookingMode === 'presencial' ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300' : 'border-slate-200 dark:border-neutral-700 text-muted-foreground hover:border-slate-300')}>
                          <MapPin className="h-4 w-4" /> Presencial
                        </button>
                        <button type="button" onClick={() => setBookingMode('online')} className={cn('flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium', bookingMode === 'online' ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300' : 'border-slate-200 dark:border-neutral-700 text-muted-foreground hover:border-slate-300')}>
                          <Video className="h-4 w-4" /> Online
                        </button>
                      </div>
                    </div>
                  )}
                  {serviceMode === 'online' && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-sm text-indigo-700 dark:text-indigo-300">
                      <Video className="h-4 w-4" /> Sesión online — se generará link de videollamada
                    </div>
                  )}

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

                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  )}

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

          {!isMercado && step === 3 && !isQuickFlow && (
            <div className="space-y-4">
              <TimeSlotPicker
                api={api}
                date={date}
                serviceId={serviceSelection?.service.id}
                onDateChange={setDate}
                onTimeSelect={setTime}
                selectedTime={time}
              />

              <div className="space-y-2">
                <Label className="text-sm font-medium">Notas (opcional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Agregar una nota al turno..."
                  rows={2}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

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

        {/* ═══════ BOTTOM ACTIONS ═══════ */}

        {/* Mercado step 1: continue to customer (if cart has items) */}
        {isMercado && step === 1 && cartItems.length > 0 && (
          <div className="border-t p-4 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{cartCount} {cartCount === 1 ? 'producto' : 'productos'}</span>
              <span className="text-base font-bold">{formatPrice(cartTotal)}</span>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
              onClick={() => setStep(2)}
            >
              Continuar
            </Button>
          </div>
        )}

        {/* Mercado step 2: continue to payment (if customer selected) */}
        {isMercado && step === 2 && customer && (
          <div className="border-t p-4 shrink-0">
            <Button
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
              onClick={() => setStep(3)}
            >
              Continuar al pago
            </Button>
          </div>
        )}

        {/* Non-mercado step 1: continue (if customer selected) */}
        {!isMercado && step === 1 && customer && (
          <div className="border-t p-4 shrink-0">
            <Button
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
              onClick={() => setStep(2)}
            >
              Continuar
            </Button>
          </div>
        )}

        {/* Non-mercado step 2 full mode: continue to time */}
        {!isMercado && step === 2 && !isQuickFlow && serviceSelection && !needsModeSelection && (
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
