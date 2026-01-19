'use client';

import { useState, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Instagram,
  Check,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Star,
  Users,
  AlertCircle,
  CalendarDays,
  Timer,
  Mail,
  User,
  MessageSquare,
  Shield,
  Zap,
  Heart,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorMessage, FieldError } from '@/components/ui/error-message';
import { formatPrice } from '@/lib/utils';
import { BookingCalendar } from './booking-calendar';
import { TimeSlots } from './time-slots';
import { useAvailability, useBooking } from '@/hooks';
import { createBookingSchema, validateForm, getFieldError } from '@/lib/validations';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { publicApi, EmployeePublic } from '@/lib/api';
import { PublicThemeWrapper, PublicThemeToggleFloating } from './public-theme-wrapper';
import { BackgroundStyles, BackgroundStyle } from '@/components/ui/background-styles';

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  duration: number;
  image: string | null;
}

interface Tenant {
  slug: string;
  name: string;
  description: string | null;
  logo: string | null;
  coverImage: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  instagram: string | null;
  services: Service[];
  settings: {
    showPrices: boolean;
    requirePhone: boolean;
    requireEmail: boolean;
    primaryColor: string;
    secondaryColor: string;
    accentColor?: string;
    enableDarkMode?: boolean;
    requireDeposit?: boolean;
    depositPercentage?: number;
    depositMode?: string;
    backgroundStyle?: BackgroundStyle;
  };
}

interface Props {
  tenant: unknown;
  slug: string;
}

interface BookingResponse {
  id: string;
  depositAmount?: number;
  depositPaid?: boolean;
  requiresPayment?: boolean;
  depositMode?: string;
  service?: Service;
  customer?: { name: string; phone: string; email?: string };
}

type Step = 'services' | 'datetime' | 'details' | 'payment' | 'confirmation';

export function PublicBookingPage({ tenant: tenantData, slug }: Props) {
  const tenant = tenantData as Tenant;
  const [step, setStep] = useState<Step>('services');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [pendingBooking, setPendingBooking] = useState<BookingResponse | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [employees, setEmployees] = useState<EmployeePublic[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeePublic | null>(null);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  const {
    slots: availableSlots,
    isLoading: loadingSlots,
    error: slotsError,
    fetchAvailability,
    reset: resetAvailability,
  } = useAvailability(slug);

  const {
    booking: bookingResult,
    isSubmitting,
    isSuccess,
    error: bookingError,
    submit: submitBooking,
    reset: resetBooking,
  } = useBooking(slug);

  // Load employees on mount
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await publicApi.getEmployees(slug);
        setEmployees(data);
      } catch {
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }
    };
    loadEmployees();
  }, [slug]);

  useEffect(() => {
    if (isSuccess && bookingResult) {
      const result = bookingResult as BookingResponse;
      if (result.requiresPayment && !result.depositPaid) {
        // Booking created but needs payment
        setPendingBooking(result);
        setStep('payment');
        toast({
          title: 'Reserva creada',
          description: 'Completa el pago de la seña para confirmar tu turno.',
        });
      } else {
        // Booking confirmed (no deposit required or already paid)
        setStep('confirmation');
        toast({
          title: 'Reserva confirmada',
          description: 'Tu turno ha sido registrado exitosamente.',
        });
      }
    }
  }, [isSuccess, bookingResult]);

  useEffect(() => {
    if (bookingError) {
      toast({
        title: 'Error al reservar',
        description: bookingError,
        variant: 'destructive',
      });
    }
  }, [bookingError]);

  const handleServiceSelect = useCallback((service: Service) => {
    setSelectedService(service);
    setStep('datetime');
    resetAvailability();
  }, [resetAvailability]);

  const handleDateSelect = useCallback(async (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    const dateStr = format(date, 'yyyy-MM-dd');
    await fetchAvailability(dateStr, selectedService?.id);
  }, [fetchAvailability, selectedService?.id]);

  const handleTimeSelect = useCallback((time: string) => {
    setSelectedTime(time);
    setStep('details');
    setFormErrors({});
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime) return;

    const bookingData = {
      serviceId: selectedService.id,
      employeeId: selectedEmployee?.id,
      date: format(selectedDate, 'yyyy-MM-dd'),
      startTime: selectedTime,
      customerName: customerData.name.trim(),
      customerPhone: customerData.phone.trim(),
      customerEmail: customerData.email.trim() || undefined,
      notes: customerData.notes.trim() || undefined,
    };

    const validation = validateForm(createBookingSchema, bookingData);
    if (!validation.success) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});
    await submitBooking(bookingData);
  }, [selectedService, selectedDate, selectedTime, selectedEmployee, customerData, submitBooking]);

  const handleSimulatePayment = useCallback(async () => {
    if (!pendingBooking) return;

    setProcessingPayment(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/public/bookings/${slug}/simulate-payment/${pendingBooking.id}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error('Error al procesar el pago');
      }

      const result = await response.json();

      if (result.success) {
        setStep('confirmation');
        toast({
          title: '¡Pago exitoso!',
          description: 'Tu reserva ha sido confirmada.',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo procesar el pago. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setProcessingPayment(false);
    }
  }, [pendingBooking, slug]);

  const handleReset = useCallback(() => {
    setStep('services');
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedEmployee(null);
    setCustomerData({ name: '', phone: '', email: '', notes: '' });
    setFormErrors({});
    setPendingBooking(null);
    resetAvailability();
    resetBooking();
  }, [resetAvailability, resetBooking]);

  const loading = loadingSlots || isSubmitting;

  const themeColors = {
    primaryColor: tenant.settings.primaryColor,
    secondaryColor: tenant.settings.secondaryColor,
    accentColor: tenant.settings.accentColor,
  };

  return (
    <PublicThemeWrapper
      tenantSlug={slug}
      colors={themeColors}
      enableDarkMode={tenant.settings.enableDarkMode !== false}
    >
      <div className="min-h-screen transition-colors duration-300 relative">
        {/* Background Style - fixed behind all content */}
        <BackgroundStyles style={tenant.settings.backgroundStyle || 'modern'} className="z-0" />

        {/* Theme Toggle - Top Right */}
        {tenant.settings.enableDarkMode !== false && (
          <PublicThemeToggleFloating
            tenantSlug={slug}
            className="fixed top-4 right-4 bottom-auto h-10 w-10"
          />
        )}

        {/* Hero Header */}
        <header className="relative overflow-hidden z-10">
        {/* Cover Image or Gradient Background */}
        {tenant.coverImage ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${tenant.coverImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-fuchsia-600 to-violet-600" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
          </>
        )}

        {/* Decorative Elements */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-pink-300/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-violet-300/30 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {/* Mobile Layout */}
          <div className="md:hidden">
            {/* Row 1: Logo + Name + Badge */}
            <div className="flex items-center gap-4 mb-4">
              {tenant.logo ? (
                <img
                  src={tenant.logo}
                  alt={tenant.name}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-white/20 shadow-xl"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center border-2 border-white/20 shadow-xl">
                  <span className="text-2xl font-bold text-white">{tenant.name.charAt(0)}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-white mb-1">{tenant.name}</h1>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-sm text-white/80">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium">4.9</span>
                  </div>
                  <span className="text-white/40">•</span>
                  <span className="text-sm text-white/70">500+ clientes</span>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs shrink-0">
                <Sparkles className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>

            {/* Row 2: Description */}
            {tenant.description && (
              <p className="text-white/80 text-sm mb-4">{tenant.description}</p>
            )}

            {/* Row 3: Contact Info */}
            <div className="flex flex-wrap items-center gap-2">
              {tenant.city && (
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur rounded-full px-3 py-1.5 text-white/80 text-sm">
                  <MapPin className="h-4 w-4 text-violet-300" />
                  {tenant.city}
                </span>
              )}
              {tenant.phone && (
                <a href={`tel:${tenant.phone}`} className="flex items-center gap-1.5 bg-white/10 backdrop-blur rounded-full px-3 py-1.5 text-white/80 text-sm hover:bg-white/20">
                  <Phone className="h-4 w-4 text-emerald-300" />
                  Llamar
                </a>
              )}
              {tenant.instagram && (
                <a href={`https://instagram.com/${tenant.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-white/10 backdrop-blur rounded-full px-3 py-1.5 text-white/80 text-sm hover:bg-white/20">
                  <Instagram className="h-4 w-4 text-pink-300" />
                  Instagram
                </a>
              )}
            </div>

            {/* Row 4: Trust Badges */}
            <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-white/70 text-xs">
                <Zap className="h-4 w-4 text-violet-300" />
                <span>Inmediato</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/70 text-xs">
                <Shield className="h-4 w-4 text-emerald-300" />
                <span>Seguro</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/70 text-xs">
                <Heart className="h-4 w-4 text-pink-300" />
                <span>Garantizado</span>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block py-4 lg:py-6">
            <div className="flex items-start gap-8">
              {/* Logo */}
              {tenant.logo ? (
                <img
                  src={tenant.logo}
                  alt={tenant.name}
                  className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl object-cover border-2 border-white/20 shadow-2xl"
                />
              ) : (
                <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center border-2 border-white/20 shadow-2xl">
                  <span className="text-4xl lg:text-5xl font-bold text-white">{tenant.name.charAt(0)}</span>
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4 mb-3">
                  <h1 className="text-3xl lg:text-4xl font-bold text-white">{tenant.name}</h1>
                  <Badge className="bg-white/10 text-white border-white/20 text-sm px-3 py-1">
                    <Sparkles className="h-4 w-4 mr-1.5" />
                    Online 24/7
                  </Badge>
                </div>
                {tenant.description && (
                  <p className="text-white/80 text-base lg:text-lg max-w-2xl mb-4">{tenant.description}</p>
                )}
                {/* Contact Row */}
                <div className="flex flex-wrap items-center gap-3">
                  {tenant.city && (
                    <span className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-white/80">
                      <MapPin className="h-5 w-5 text-violet-300" />
                      {tenant.address ? `${tenant.address}, ${tenant.city}` : tenant.city}
                    </span>
                  )}
                  {tenant.phone && (
                    <a href={`tel:${tenant.phone}`} className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-white/80 hover:bg-white/20 transition-colors">
                      <Phone className="h-5 w-5 text-emerald-300" />
                      {tenant.phone}
                    </a>
                  )}
                  {tenant.instagram && (
                    <a href={`https://instagram.com/${tenant.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-white/80 hover:bg-white/20 transition-colors">
                      <Instagram className="h-5 w-5 text-pink-300" />
                      {tenant.instagram}
                    </a>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="hidden lg:flex items-center gap-6 bg-white/10 backdrop-blur rounded-2xl px-6 py-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                    <span className="text-3xl font-bold text-white">4.9</span>
                  </div>
                  <span className="text-sm text-white/60">Rating</span>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Users className="h-6 w-6 text-violet-300" />
                    <span className="text-3xl font-bold text-white">500+</span>
                  </div>
                  <span className="text-sm text-white/60">Clientes</span>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-8 mt-6 pt-5 border-t border-white/10">
              <div className="flex items-center gap-3 text-white/70">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-violet-300" />
                </div>
                <span className="text-base">Confirmación Inmediata</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-emerald-300" />
                </div>
                <span className="text-base">100% Seguro</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-pink-300" />
                </div>
                <span className="text-base">+500 Clientes Felices</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-neutral-700 shadow-sm transition-colors">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center gap-2">
            <StepIndicator
              number={1}
              label="Servicio"
              active={step === 'services'}
              completed={!!selectedService}
            />
            <div className={`w-12 h-1 rounded-full transition-all ${selectedService ? 'bg-slate-800 dark:bg-neutral-200' : 'bg-slate-200 dark:bg-neutral-700'}`} />
            <StepIndicator
              number={2}
              label="Fecha y Hora"
              active={step === 'datetime'}
              completed={!!selectedTime}
            />
            <div className={`w-12 h-1 rounded-full transition-all ${selectedTime ? 'bg-slate-800 dark:bg-neutral-200' : 'bg-slate-200 dark:bg-neutral-700'}`} />
            <StepIndicator
              number={3}
              label="Confirmar"
              active={step === 'details' || step === 'confirmation'}
              completed={step === 'confirmation'}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">
        {/* Step 1: Select Service */}
        {step === 'services' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="text-center mb-10">
              <Badge variant="secondary" className="mb-4">
                <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                Paso 1 de 3
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-slate-900 dark:text-white">
                Elegí tu servicio
              </h2>
              <p className="text-muted-foreground">Selecciona el servicio que deseas reservar</p>
            </div>

            <div className="grid gap-4 md:gap-6">
              {tenant.services.map((service, index) => (
                <Card
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className="group cursor-pointer overflow-hidden border border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 animate-slide-up bg-white dark:bg-neutral-800"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-neutral-700 flex items-center justify-center text-slate-600 dark:text-neutral-300 text-xl font-semibold">
                          {service.image ? (
                            <img src={service.image} alt={service.name} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            service.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-neutral-200 transition-colors">
                            {service.name}
                          </h3>
                          {service.description && (
                            <p className="text-muted-foreground text-sm mt-0.5 line-clamp-1">
                              {service.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs font-normal">
                              <Timer className="h-3 w-3 mr-1" />
                              {service.duration} min
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        {service.price !== null && (
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {formatPrice(service.price)}
                          </div>
                        )}
                        <Button
                          size="sm"
                          className="mt-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white"
                        >
                          Reservar
                          <ArrowRight className="h-4 w-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

          </div>
        )}

        {/* Step 2: Select Date and Time */}
        {step === 'datetime' && selectedService && (
          <div className="max-w-5xl mx-auto animate-fade-in">
            <Button
              variant="ghost"
              onClick={() => setStep('services')}
              className="mb-6 -ml-2 hover:bg-slate-100"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Cambiar servicio
            </Button>

            {/* Selected Service Card */}
            <Card className="mb-8 overflow-hidden border border-slate-200 dark:border-neutral-700 shadow-sm bg-white dark:bg-neutral-800">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-neutral-700 flex items-center justify-center text-slate-600 dark:text-neutral-300 font-semibold">
                    {selectedService.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-500 dark:text-neutral-400">Servicio seleccionado</p>
                    <p className="font-semibold text-lg text-slate-900 dark:text-white">{selectedService.name}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">
                      <Timer className="h-3 w-3 mr-1" />
                      {selectedService.duration} min
                    </Badge>
                    {selectedService.price !== null && (
                      <div className="text-xl font-bold text-slate-900 dark:text-white">
                        {formatPrice(selectedService.price)}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Calendar */}
              <Card className="border border-slate-200 dark:border-neutral-700 shadow-sm bg-white dark:bg-neutral-800">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-neutral-700 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-slate-600 dark:text-neutral-300" />
                    </div>
                    Elegí una fecha
                  </h3>
                  <BookingCalendar
                    selectedDate={selectedDate}
                    onSelect={handleDateSelect}
                  />
                </CardContent>
              </Card>

              {/* Time Slots */}
              <Card className="border border-slate-200 dark:border-neutral-700 shadow-sm bg-white dark:bg-neutral-800">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-neutral-700 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-slate-600 dark:text-neutral-300" />
                    </div>
                    Elegí un horario
                  </h3>
                  {selectedDate ? (
                    <>
                      <p className="text-sm text-muted-foreground mb-4 capitalize">
                        {format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}
                      </p>
                      {slotsError ? (
                        <ErrorMessage
                          message={slotsError}
                          onRetry={() => handleDateSelect(selectedDate)}
                        />
                      ) : (
                        <TimeSlots
                          slots={availableSlots}
                          selectedTime={selectedTime}
                          onSelect={handleTimeSelect}
                          loading={loadingSlots}
                        />
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-neutral-700 flex items-center justify-center mb-4">
                        <Calendar className="h-8 w-8 text-slate-400 dark:text-neutral-500" />
                      </div>
                      <p className="text-muted-foreground">
                        Selecciona una fecha para ver los horarios disponibles
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 3: Customer Details */}
        {step === 'details' && selectedService && selectedDate && selectedTime && (
          <div className="max-w-xl mx-auto animate-fade-in">
            <Button
              variant="ghost"
              onClick={() => setStep('datetime')}
              className="mb-6 -ml-2 hover:bg-slate-100"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Cambiar horario
            </Button>

            {/* Booking Summary */}
            <Card className="mb-6 border border-slate-200 dark:border-neutral-700 shadow-sm bg-white dark:bg-neutral-800">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-5 flex items-center gap-2 text-slate-900 dark:text-white">
                  <CheckCircle2 className="h-5 w-5 text-slate-600 dark:text-neutral-400" />
                  Resumen de tu reserva
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                      Servicio
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">{selectedService.name}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                      Fecha
                    </span>
                    <span className="font-medium capitalize text-slate-900 dark:text-white">
                      {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                      Hora
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">{selectedTime} hs</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Timer className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                      Duración
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">{selectedService.duration} minutos</span>
                  </div>
                  {selectedEmployee && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                        Profesional
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white">{selectedEmployee.name}</span>
                    </div>
                  )}
                  {selectedService.price !== null && (
                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-neutral-900">
                      <span className="font-semibold">Total a pagar</span>
                      <span className="text-xl font-bold">
                        {formatPrice(selectedService.price)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Employee Selection (Optional) */}
            {employees.length > 0 && (
              <Card className="mb-6 border border-slate-200 dark:border-neutral-700 shadow-sm bg-white dark:bg-neutral-800">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-slate-900 dark:text-white">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-neutral-700 flex items-center justify-center">
                      <Users className="h-4 w-4 text-slate-600 dark:text-neutral-300" />
                    </div>
                    ¿Querés elegir un profesional?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Opcional. Si no seleccionás, cualquier profesional disponible te atenderá.
                  </p>

                  {loadingEmployees ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Option: Any professional */}
                      <button
                        type="button"
                        onClick={() => setSelectedEmployee(null)}
                        className={`w-full flex items-center gap-4 p-3 rounded-xl border-2 transition-all ${
                          selectedEmployee === null
                            ? 'border-slate-800 dark:border-white bg-slate-50 dark:bg-neutral-700'
                            : 'border-slate-200 dark:border-neutral-600 hover:border-slate-300 dark:hover:border-neutral-500 hover:bg-slate-50 dark:hover:bg-neutral-700/50'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white">
                          <Users className="h-6 w-6" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-slate-900 dark:text-white">Cualquier profesional</p>
                          <p className="text-sm text-muted-foreground">El primero disponible</p>
                        </div>
                        {selectedEmployee === null && (
                          <div className="w-6 h-6 rounded-full bg-slate-800 dark:bg-white flex items-center justify-center">
                            <Check className="h-4 w-4 text-white dark:text-neutral-900" />
                          </div>
                        )}
                      </button>

                      {/* Individual employees */}
                      {employees.map((employee) => (
                        <button
                          key={employee.id}
                          type="button"
                          onClick={() => setSelectedEmployee(employee)}
                          className={`w-full flex items-center gap-4 p-3 rounded-xl border-2 transition-all ${
                            selectedEmployee?.id === employee.id
                              ? 'border-slate-800 dark:border-white bg-slate-50 dark:bg-neutral-700'
                              : 'border-slate-200 dark:border-neutral-600 hover:border-slate-300 dark:hover:border-neutral-500 hover:bg-slate-50 dark:hover:bg-neutral-700/50'
                          }`}
                        >
                          {employee.image ? (
                            <img
                              src={employee.image}
                              alt={employee.name}
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-semibold text-lg">
                              {employee.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 text-left">
                            <p className="font-medium text-slate-900 dark:text-white">{employee.name}</p>
                            {employee.specialty && (
                              <p className="text-sm text-muted-foreground">{employee.specialty}</p>
                            )}
                          </div>
                          {selectedEmployee?.id === employee.id && (
                            <div className="w-6 h-6 rounded-full bg-slate-800 dark:bg-white flex items-center justify-center">
                              <Check className="h-4 w-4 text-white dark:text-neutral-900" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Customer Form */}
            <Card className="border border-slate-200 dark:border-neutral-700 shadow-sm bg-white dark:bg-neutral-800">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                  <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-neutral-700 flex items-center justify-center">
                    <User className="h-4 w-4 text-slate-600 dark:text-neutral-300" />
                  </div>
                  Completá tus datos
                </h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Nombre completo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={customerData.name}
                      onChange={(e) =>
                        setCustomerData({ ...customerData, name: e.target.value })
                      }
                      placeholder="Tu nombre"
                      required
                      disabled={loading}
                      className={`h-12 rounded-xl ${formErrors.customerName ? 'border-red-300' : ''}`}
                    />
                    <FieldError error={formErrors.customerName} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      WhatsApp / Teléfono <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerData.phone}
                      onChange={(e) =>
                        setCustomerData({ ...customerData, phone: e.target.value })
                      }
                      placeholder="+54 11 1234-5678"
                      required
                      disabled={loading}
                      className={`h-12 rounded-xl ${formErrors.customerPhone ? 'border-red-300' : ''}`}
                    />
                    <FieldError error={formErrors.customerPhone} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email {tenant.settings.requireEmail ? <span className="text-red-500">*</span> : '(opcional)'}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerData.email}
                      onChange={(e) =>
                        setCustomerData({ ...customerData, email: e.target.value })
                      }
                      placeholder="tu@email.com"
                      required={tenant.settings.requireEmail}
                      disabled={loading}
                      className={`h-12 rounded-xl ${formErrors.customerEmail ? 'border-red-300' : ''}`}
                    />
                    <FieldError error={formErrors.customerEmail} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      Notas adicionales (opcional)
                    </Label>
                    <Input
                      id="notes"
                      value={customerData.notes}
                      onChange={(e) =>
                        setCustomerData({ ...customerData, notes: e.target.value })
                      }
                      placeholder="Alguna indicación especial..."
                      disabled={loading}
                      className="h-12 rounded-xl"
                    />
                  </div>

                  {bookingError && (
                    <ErrorMessage
                      message={bookingError}
                      variant="inline"
                      onDismiss={() => resetBooking()}
                    />
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 text-base bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white rounded-lg"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Reservando...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Confirmar Reserva
                        <ArrowRight className="h-5 w-5" />
                      </span>
                    )}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Al confirmar, aceptas los términos y condiciones del negocio
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Payment (when deposit required) */}
        {step === 'payment' && pendingBooking && selectedService && selectedDate && selectedTime && (
          <div className="max-w-lg mx-auto animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Pago de Seña</h2>
              <p className="text-muted-foreground">
                Para confirmar tu turno, debes abonar una seña del {tenant.settings.depositPercentage || 30}% del servicio
              </p>
            </div>

            {/* Booking Summary */}
            <Card className="mb-6 border border-slate-200 dark:border-neutral-700 shadow-sm bg-white dark:bg-neutral-800">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                  <CheckCircle2 className="h-5 w-5 text-slate-600 dark:text-neutral-400" />
                  Resumen de tu reserva
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                    <span className="text-muted-foreground">Servicio</span>
                    <span className="font-medium text-slate-900 dark:text-white">{selectedService.name}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                    <span className="text-muted-foreground">Fecha</span>
                    <span className="font-medium capitalize text-slate-900 dark:text-white">
                      {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                    <span className="text-muted-foreground">Hora</span>
                    <span className="font-medium text-slate-900 dark:text-white">{selectedTime} hs</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card className="mb-6 border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {selectedService.price !== null && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Precio del servicio</span>
                        <span className="font-medium text-slate-900 dark:text-white">{formatPrice(selectedService.price)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Seña ({tenant.settings.depositPercentage || 30}%)</span>
                        <span className="font-medium text-slate-900 dark:text-white">{formatPrice(pendingBooking.depositAmount || 0)}</span>
                      </div>
                      <div className="border-t border-green-200 dark:border-green-800 pt-4">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-lg text-slate-900 dark:text-white">A pagar ahora</span>
                          <span className="font-bold text-2xl text-green-700 dark:text-green-400">
                            {formatPrice(pendingBooking.depositAmount || 0)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Restante a pagar en el local: {formatPrice((selectedService.price || 0) - (pendingBooking.depositAmount || 0))}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Demo Notice */}
            <div className="rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Pago de prueba</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Este es un pago simulado para que pruebes el sistema. No se cobrará dinero real.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <Button
              onClick={handleSimulatePayment}
              disabled={processingPayment}
              className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              {processingPayment ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Procesando pago...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Pagar Seña - {formatPrice(pendingBooking.depositAmount || 0)}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={handleReset}
              className="w-full mt-3"
              disabled={processingPayment}
            >
              Cancelar reserva
            </Button>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 'confirmation' && (bookingResult || pendingBooking) && (
          <div className="max-w-lg mx-auto text-center animate-scale-in">
            {/* Success Animation */}
            <div className="relative mb-8">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-slate-900 dark:text-white">
              ¡Reserva Confirmada!
            </h2>
            <p className="text-muted-foreground text-base mb-4">
              Tu turno ha sido registrado exitosamente.
            </p>

            {/* WhatsApp Notification Simulation */}
            <div className="flex items-center justify-center gap-2 mb-8 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <span className="text-green-700 dark:text-green-400 font-medium">
                Confirmación enviada a tu WhatsApp
              </span>
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>

            {/* Simulated WhatsApp Message Preview */}
            <Card className="text-left mb-6 border-0 shadow-lg bg-[#e5ddd5] overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#d1c9be]">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800">{tenant.name}</p>
                    <p className="text-xs text-slate-500">WhatsApp Business</p>
                  </div>
                </div>

                {/* Message Bubble */}
                <div className="bg-white rounded-lg p-4 shadow-sm max-w-[90%] relative">
                  <div className="absolute -left-2 top-0 w-0 h-0 border-t-8 border-t-white border-l-8 border-l-transparent"></div>
                  <div className="text-sm text-slate-800 whitespace-pre-line">
                    <p className="font-semibold text-green-600 mb-2">✅ Turno confirmado</p>
                    <p className="mb-3">Hola {customerData.name}!</p>
                    <p className="mb-3">Tu turno en <span className="font-semibold">{tenant.name}</span> ha sido confirmado.</p>
                    <div className="space-y-1 mb-3">
                      <p>📅 <span className="font-medium">Fecha:</span> {selectedDate && format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}</p>
                      <p>🕐 <span className="font-medium">Hora:</span> {selectedTime} hs</p>
                      <p>💇 <span className="font-medium">Servicio:</span> {selectedService?.name}</p>
                      {selectedEmployee && <p>👤 <span className="font-medium">Profesional:</span> {selectedEmployee.name}</p>}
                      {tenant.address && <p>📍 <span className="font-medium">Dirección:</span> {tenant.address}{tenant.city && `, ${tenant.city}`}</p>}
                      {tenant.phone && <p>📞 <span className="font-medium">Teléfono:</span> {tenant.phone}</p>}
                    </div>
                    <p className="mb-2">¡Te esperamos!</p>
                    <p className="text-xs text-slate-400 italic">Este mensaje es automático.</p>
                  </div>
                  <div className="text-right mt-2">
                    <span className="text-xs text-slate-400">
                      {format(new Date(), 'HH:mm')} ✓✓
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Details Card */}
            <Card className="text-left mb-8 border border-slate-200 dark:border-neutral-700 shadow-sm bg-white dark:bg-neutral-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-200 dark:border-neutral-700">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-neutral-700 flex items-center justify-center text-slate-600 dark:text-neutral-300 font-semibold">
                    {selectedService?.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reserva en</p>
                    <p className="font-semibold text-lg text-slate-900 dark:text-white">{tenant.name}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                      Servicio
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">{selectedService?.name}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                      Fecha
                    </span>
                    <span className="font-medium capitalize text-slate-900 dark:text-white">
                      {selectedDate &&
                        format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                      Hora
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">{selectedTime} hs</span>
                  </div>
                  {selectedEmployee && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                        Profesional
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white">{selectedEmployee.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                className="h-10 px-6 border-slate-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
                onClick={handleReset}
              >
                Reservar otro turno
              </Button>
              {tenant.phone && (
                <Button
                  asChild
                  className="h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <a
                    href={`https://wa.me/${tenant.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Contactar por WhatsApp
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white mt-auto relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
                <Zap className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <h4 className="font-semibold">Reserva Rápida</h4>
                <p className="text-sm text-slate-400">Confirmación instantánea</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
                <Shield className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <h4 className="font-semibold">100% Seguro</h4>
                <p className="text-sm text-slate-400">Datos protegidos</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
                <Star className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <h4 className="font-semibold">Servicio Premium</h4>
                <p className="text-sm text-slate-400">Calidad garantizada</p>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>Reservas online por Turnero</p>
            <p>© {new Date().getFullYear()} Todos los derechos reservados</p>
          </div>
        </div>
      </footer>

      </div>
    </PublicThemeWrapper>
  );
}

function StepIndicator({
  number,
  label,
  active,
  completed,
}: {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
          completed
            ? 'bg-slate-900 dark:bg-white text-white dark:text-neutral-900 shadow-md'
            : active
            ? 'bg-slate-800 dark:bg-neutral-200 text-white dark:text-neutral-800 shadow-lg scale-110'
            : 'bg-slate-200 dark:bg-neutral-700 text-slate-500 dark:text-neutral-400'
        }`}
      >
        {completed ? <Check className="h-5 w-5" /> : number}
      </div>
      <span
        className={`hidden sm:inline font-medium transition-colors ${
          active || completed ? 'text-slate-900 dark:text-white' : 'text-muted-foreground'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
