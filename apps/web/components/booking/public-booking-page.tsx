'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Check,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Star,
  Users,
  Timer,
  Mail,
  User,
  Shield,
  Zap,
  CreditCard,
  Loader2,
  X,
  CheckCheck,
  ChevronRight,
  Moon,
  CalendarDays,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorMessage } from '@/components/ui/error-message';
import { cn, formatPrice, formatDuration } from '@/lib/utils';
import { BookingCalendar } from './booking-calendar';
import { DailyBookingCalendar } from './daily-booking-calendar';
import { TimeSlots } from './time-slots';
import { BookingCustomerForm, CustomerFormData } from './booking-customer-form';
import { useAvailability, useBooking, useDailyAvailability } from '@/hooks';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { publicApi, EmployeePublic, BranchPublic, CreateDailyBookingData } from '@/lib/api';
import { PublicThemeWrapper, PublicThemeToggleFloating } from './public-theme-wrapper';
import { BackgroundStyles, BackgroundStyle } from '@/components/ui/background-styles';
import { LocationCarousel } from './location-carousel';
import { PublicHero } from './public-hero';
import { PublicServiceCard } from './public-service-card';
import { HeroStyleName, HERO_STYLES } from '@/lib/hero-styles';
import { postTurnoLinkEvent } from './embed-booking-page';

/**
 * Normalizes a phone number for WhatsApp.
 * Handles Argentine numbers without country code.
 */
function normalizePhoneForWhatsApp(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // If it starts with 0, remove it (local format)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // Argentine numbers: if 10 digits starting with area code (11, 15, etc), add country code
  // Format: 54 9 <area code> <number>
  if (cleaned.length === 10 && !cleaned.startsWith('54')) {
    // Check if it's a mobile number (starts with area code like 11, 351, etc)
    cleaned = '549' + cleaned;
  } else if (cleaned.length === 11 && cleaned.startsWith('15')) {
    // Old format with 15 prefix, convert to international
    cleaned = '549' + cleaned.substring(2);
  } else if (cleaned.length >= 12 && cleaned.startsWith('54') && !cleaned.startsWith('549')) {
    // Has country code but missing 9 for mobile
    cleaned = '549' + cleaned.substring(2);
  }

  return cleaned;
}

interface VariationOption {
  id: string;
  name: string;
  priceModifier: number;
  pricingType: 'absolute' | 'relative';
  durationModifier: number;
}

interface VariationGroup {
  id: string;
  label: string;
  type: 'single' | 'multi';
  required: boolean;
  options: VariationOption[];
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  duration: number;
  image: string | null;
  images?: string[];
  imageDisplayMode?: string;
  includes: string | null;
  variations?: VariationGroup[];
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
    themeMode?: 'light' | 'dark' | 'both';
    requireDeposit?: boolean;
    depositPercentage?: number;
    depositMode?: string;
    backgroundStyle?: BackgroundStyle;
    heroStyle?: HeroStyleName;
    cardStyle?: HeroStyleName;
    maxAdvanceBookingDays?: number;
    minAdvanceBookingHours?: number;
    smartTimeSlots?: boolean;
    bookingMode?: 'HOURLY' | 'DAILY';
    dailyCheckInTime?: string;
    dailyCheckOutTime?: string;
    dailyMinNights?: number;
    dailyMaxNights?: number;
    showProfilePhoto?: boolean;
    coverOverlayColor?: string;
    coverOverlayOpacity?: number;
    coverFadeEnabled?: boolean;
    coverFadeColor?: string;
  };
}

interface Props {
  tenant: unknown;
  slug: string;
  isEmbed?: boolean;
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

type Step = 'branch' | 'services' | 'datetime' | 'details' | 'payment' | 'confirmation';

export function PublicBookingPage({ tenant: tenantData, slug, isEmbed = false }: Props) {
  const tenant = tenantData as Tenant;
  const [branches, setBranches] = useState<BranchPublic[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<BranchPublic | null>(null);
  const [branchServices, setBranchServices] = useState<Service[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
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
  const [pendingBooking, setPendingBooking] = useState<BookingResponse | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [employees, setEmployees] = useState<EmployeePublic[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeePublic | null>(null);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [showServiceDetail, setShowServiceDetail] = useState(false);
  const [serviceForDetail, setServiceForDetail] = useState<Service | null>(null);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string[]>>({});
  const [bookingVariations, setBookingVariations] = useState<Record<string, string[]>>({});

  // Daily booking mode state
  const isDailyMode = tenant.settings.bookingMode === 'DAILY';
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);

  // Lock body scroll when service detail modal is open
  useEffect(() => {
    if (showServiceDetail) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showServiceDetail]);

  // Embed: notify parent of step changes
  useEffect(() => {
    if (isEmbed) {
      postTurnoLinkEvent('turnolink:step_changed', { step });
    }
  }, [isEmbed, step]);

  // Reputation stats
  const [reputationStats, setReputationStats] = useState<{
    averageRating: number;
    totalReviews: number;
    recentBookingsCount: number;
    recentBookingsText: string;
  } | null>(null);

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

  const {
    days: dailyAvailability,
    isLoading: loadingDailyAvailability,
    fetchAvailability: fetchDailyAvailability,
    reset: resetDailyAvailability,
  } = useDailyAvailability(slug);

  // Refs for smart auto-scroll
  const calendarSectionRef = useRef<HTMLDivElement>(null);
  const timeSlotsSectionRef = useRef<HTMLDivElement>(null);
  const formSectionRef = useRef<HTMLDivElement>(null);
  const customerFormRef = useRef<HTMLDivElement>(null);
  const paymentSectionRef = useRef<HTMLDivElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);

  // Smart scroll function - scrolls element into view with offset for sticky header
  const scrollToElement = useCallback((ref: React.RefObject<HTMLElement>, delay = 150) => {
    setTimeout(() => {
      if (ref.current) {
        // Use scrollIntoView which respects scroll-margin-top CSS
        ref.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, delay);
  }, []);

  // Handle MercadoPago redirect (payment=success/failure/pending in URL)
  const paymentHandled = useRef(false);
  useEffect(() => {
    if (paymentHandled.current) return;
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const bookingId = params.get('bookingId');

    if (!paymentStatus || !bookingId) return;
    paymentHandled.current = true;

    // Clean URL without reload
    window.history.replaceState({}, '', window.location.pathname);

    if (paymentStatus === 'success') {
      setPendingBooking({ id: bookingId, depositPaid: true });
      setStep('confirmation');
    } else if (paymentStatus === 'failure') {
      toast({
        title: 'Pago no completado',
        description: 'El pago no se pudo procesar. Puedes intentar nuevamente.',
        variant: 'destructive',
      });
    } else if (paymentStatus === 'pending') {
      setPendingBooking({ id: bookingId, depositPaid: false });
      setStep('confirmation');
      toast({
        title: 'Pago en proceso',
        description: 'Tu pago está siendo procesado. Te confirmaremos cuando se acredite.',
      });
    }
  }, []);

  // Load reputation stats on mount
  useEffect(() => {
    const loadReputationStats = async () => {
      try {
        const response = await fetch(`/api/public/reviews/${slug}/stats`);
        if (response.ok) {
          const data = await response.json();
          setReputationStats(data);
        }
      } catch {
        // Stats are optional, don't show error
      }
    };
    loadReputationStats();
  }, [slug]);

  // Load branches on mount
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const data = await publicApi.getBranches(slug);
        setBranches(data);

        // If only one branch, auto-select it and use tenant services
        if (data.length === 1) {
          setSelectedBranch(data[0]);
          setBranchServices(tenant.services);
          setStep('services');
        } else if (data.length > 1) {
          // Multiple branches - show branch selector first
          setStep('branch');
        } else {
          // No branches - use tenant services directly
          setBranchServices(tenant.services);
          setStep('services');
        }
      } catch {
        // No branches or error - use tenant services
        setBranches([]);
        setBranchServices(tenant.services);
        setStep('services');
      } finally {
        setLoadingBranches(false);
      }
    };
    loadBranches();
  }, [slug, tenant.services]);

  // Load employees on mount (or when branch changes)
  useEffect(() => {
    const loadEmployees = async () => {
      setLoadingEmployees(true);
      try {
        if (selectedBranch) {
          // Load employees for the selected branch
          const data = await publicApi.getBranchEmployees(slug, selectedBranch.slug);
          setEmployees(data);
        } else {
          // Load all employees
          const data = await publicApi.getEmployees(slug);
          setEmployees(data);
        }
      } catch {
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }
    };
    loadEmployees();
  }, [slug, selectedBranch]);

  useEffect(() => {
    if (isSuccess && bookingResult) {
      const result = bookingResult as BookingResponse;
      if (isEmbed) {
        postTurnoLinkEvent('turnolink:booking_created', {
          bookingId: result.id,
          service: result.service?.name || '',
        });
      }
      if (result.requiresPayment && !result.depositPaid) {
        // Booking created but needs payment
        setPendingBooking(result);
        setStep('payment');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Booking confirmed (no deposit required or already paid)
        setStep('confirmation');
        if (isEmbed) {
          postTurnoLinkEvent('turnolink:booking_confirmed', { bookingId: result.id });
        }
        toast({
          title: 'Reserva confirmada',
          description: 'Tu turno ha sido registrado exitosamente.',
        });
      }
    }
  }, [isSuccess, bookingResult, isEmbed]);

  useEffect(() => {
    if (bookingError && isEmbed) {
      postTurnoLinkEvent('turnolink:error', { message: bookingError });
    }
    if (bookingError) {
      toast({
        title: 'Error al reservar',
        description: bookingError,
        variant: 'destructive',
      });
    }
  }, [bookingError]);

  const handleBranchSelect = useCallback(async (branch: BranchPublic) => {
    setSelectedBranch(branch);
    setSelectedService(null);
    setSelectedEmployee(null);

    // Load services for this branch
    try {
      const services = await publicApi.getBranchServices(slug, branch.slug);
      // Ensure price is a number (API returns Decimal as string)
      const parsedServices = services.map(s => ({
        ...s,
        price: typeof s.price === 'string' ? parseFloat(s.price) : s.price,
      })) as Service[];
      setBranchServices(parsedServices);
    } catch {
      // Fallback to tenant services
      setBranchServices(tenant.services);
    }

    setStep('services');
  }, [slug, tenant.services]);

  const handleServiceSelect = useCallback((service: Service) => {
    setSelectedService(service);
    setStep('datetime');
    if (isDailyMode) {
      resetDailyAvailability();
      setCheckInDate(null);
      setCheckOutDate(null);
    } else {
      resetAvailability();
    }
    // Scroll to calendar section after step change
    scrollToElement(calendarSectionRef, 200);
  }, [isDailyMode, resetAvailability, resetDailyAvailability, scrollToElement]);

  // Daily mode: handle range selection (no auto-advance — user must click "Confirmar")
  const handleDailyRangeSelect = useCallback((checkIn: Date | null, checkOut: Date | null) => {
    setCheckInDate(checkIn);
    setCheckOutDate(checkOut);
  }, []);

  // Daily mode: user confirmed their date selection
  const handleDailyConfirm = useCallback(() => {
    if (checkInDate && checkOutDate) {
      setStep('details');
      scrollToElement(formSectionRef, 200);
    }
  }, [checkInDate, checkOutDate, scrollToElement]);

  // Daily mode: fetch availability when month changes
  const handleDailyMonthChange = useCallback((startDate: string, endDate: string) => {
    fetchDailyAvailability(startDate, endDate, selectedBranch?.id);
  }, [fetchDailyAvailability, selectedBranch?.id]);

  // Variation helpers
  const handleVariationSelect = useCallback((groupId: string, optionId: string, type: 'single' | 'multi') => {
    setSelectedVariations(prev => {
      if (type === 'single') {
        return { ...prev, [groupId]: [optionId] };
      } else {
        const current = prev[groupId] || [];
        if (current.includes(optionId)) {
          return { ...prev, [groupId]: current.filter(id => id !== optionId) };
        } else {
          return { ...prev, [groupId]: [...current, optionId] };
        }
      }
    });
  }, []);

  const getEffectivePriceAndDuration = useCallback((
    service: Service,
    selections: Record<string, string[]>
  ) => {
    let price = service.price;
    let duration = service.duration;

    if (!service.variations || service.variations.length === 0) {
      return { price, duration };
    }

    for (const group of service.variations) {
      const selectedIds = selections[group.id] || [];
      for (const option of group.options) {
        if (selectedIds.includes(option.id)) {
          if (option.priceModifier !== 0) {
            if (option.pricingType === 'absolute') {
              price = option.priceModifier;
            } else {
              price = (price || 0) + option.priceModifier;
            }
          }
          if (option.durationModifier !== 0) {
            duration = duration + option.durationModifier;
          }
        }
      }
    }

    return { price, duration };
  }, []);

  const allRequiredVariationsSelected = useCallback((
    service: Service,
    selections: Record<string, string[]>
  ) => {
    if (!service.variations) return true;
    return service.variations
      .filter(g => g.required)
      .every(g => (selections[g.id] || []).length > 0);
  }, []);

  const handleDateSelect = useCallback(async (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    const dateStr = format(date, 'yyyy-MM-dd');

    // Use branch availability if branch is selected
    if (selectedBranch) {
      try {
        const slots = await publicApi.getBranchAvailability(
          slug,
          selectedBranch.slug,
          dateStr,
          selectedService?.id
        );
        // Use the hook's internal state update (we need to modify useAvailability hook or use local state)
        // For now, fetch through the hook which will need to be updated
        await fetchAvailability(dateStr, selectedService?.id);
      } catch {
        await fetchAvailability(dateStr, selectedService?.id);
      }
    } else {
      await fetchAvailability(dateStr, selectedService?.id);
    }
    // Scroll to time slots after loading
    scrollToElement(timeSlotsSectionRef, 300);
  }, [fetchAvailability, selectedService?.id, selectedBranch, slug, scrollToElement]);

  const handleTimeSelect = useCallback((time: string) => {
    setSelectedTime(time);
    setStep('details');
    // Scroll to form section after step change
    scrollToElement(formSectionRef, 200);
  }, [scrollToElement]);

  const handleEmployeeSelect = useCallback((employee: EmployeePublic | null) => {
    setSelectedEmployee(employee);
    // Scroll to customer form after selecting employee with longer delay for mobile
    scrollToElement(customerFormRef, 300);
  }, [scrollToElement]);

  const handleFormSubmit = useCallback(async (formData: CustomerFormData) => {
    if (!selectedService) return;

    // Store customer data for confirmation screen
    setCustomerData({
      name: formData.name,
      phone: formData.phone,
      email: formData.email || '',
      notes: formData.notes || '',
    });

    if (isDailyMode) {
      // Daily booking mode
      if (!checkInDate || !checkOutDate) return;

      const dailyData: CreateDailyBookingData = {
        serviceId: selectedService.id,
        branchId: selectedBranch?.id,
        checkInDate: format(checkInDate, 'yyyy-MM-dd'),
        checkOutDate: format(checkOutDate, 'yyyy-MM-dd'),
        customerName: formData.name.trim(),
        customerPhone: formData.phone.trim(),
        customerEmail: formData.email?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
      };

      try {
        const result = await publicApi.createDailyBooking(slug, dailyData);
        const bookingResponse = result as BookingResponse & { requiresPayment?: boolean; depositMode?: string; totalPrice?: number };

        if (bookingResponse.requiresPayment && !bookingResponse.depositPaid) {
          setPendingBooking({
            ...bookingResponse,
            depositAmount: bookingResponse.depositAmount ? Number(bookingResponse.depositAmount) : undefined,
          });
          setStep('payment');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setPendingBooking(bookingResponse);
          setStep('confirmation');
          toast({
            title: 'Reserva confirmada',
            description: 'Tu estadía ha sido registrada exitosamente.',
          });
        }
      } catch (error: any) {
        toast({
          title: 'Error al reservar',
          description: error.message || 'No se pudo completar la reserva.',
          variant: 'destructive',
        });
      }
    } else {
      // Hourly booking mode (original)
      if (!selectedDate || !selectedTime) return;

      // Build variation summary for booking notes
      let variationNotes = '';
      if (selectedService?.variations && Object.keys(bookingVariations).length > 0) {
        const parts: string[] = [];
        for (const group of selectedService.variations) {
          const selectedIds = bookingVariations[group.id] || [];
          if (selectedIds.length > 0) {
            const selectedOptions = group.options
              .filter(o => selectedIds.includes(o.id))
              .map(o => o.name);
            if (selectedOptions.length > 0) {
              parts.push(`${group.label}: ${selectedOptions.join(', ')}`);
            }
          }
        }
        if (parts.length > 0) {
          variationNotes = `[${parts.join(' | ')}]`;
        }
      }

      const noteParts = [variationNotes, formData.notes?.trim()].filter(Boolean);

      const bookingData = {
        serviceId: selectedService.id,
        branchId: selectedBranch?.id,
        employeeId: selectedEmployee?.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedTime,
        customerName: formData.name.trim(),
        customerPhone: formData.phone.trim(),
        customerEmail: formData.email?.trim() || undefined,
        notes: noteParts.length > 0 ? noteParts.join(' - ') : undefined,
      };

      await submitBooking(bookingData);
    }
  }, [selectedService, selectedDate, selectedTime, selectedEmployee, selectedBranch, submitBooking, bookingVariations, isDailyMode, checkInDate, checkOutDate, slug]);

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

  const handleMercadoPagoPayment = useCallback(async () => {
    if (!pendingBooking) return;

    setProcessingPayment(true);
    try {
      const currentUrl = window.location.href.split('?')[0];
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/public/bookings/${slug}/create-preference/${pendingBooking.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            successUrl: `${currentUrl}?payment=success&bookingId=${pendingBooking.id}`,
            failureUrl: `${currentUrl}?payment=failure&bookingId=${pendingBooking.id}`,
            pendingUrl: `${currentUrl}?payment=pending&bookingId=${pendingBooking.id}`,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear el pago');
      }

      const result = await response.json();

      if (result.initPoint) {
        if (isEmbed) {
          // In embed mode: open MP in new tab + poll for payment status
          postTurnoLinkEvent('turnolink:payment_started', { bookingId: pendingBooking.id });
          window.open(result.initPoint, '_blank');
          // Poll for payment completion
          const pollInterval = setInterval(async () => {
            try {
              const statusRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/public/bookings/${slug}/booking/${pendingBooking.id}`
              );
              if (statusRes.ok) {
                const booking = await statusRes.json();
                if (booking.depositPaid) {
                  clearInterval(pollInterval);
                  setProcessingPayment(false);
                  postTurnoLinkEvent('turnolink:payment_completed', { bookingId: pendingBooking.id });
                  postTurnoLinkEvent('turnolink:booking_confirmed', { bookingId: pendingBooking.id });
                  setStep('confirmation');
                  toast({
                    title: 'Pago confirmado',
                    description: 'Tu reserva ha sido confirmada exitosamente.',
                  });
                }
              }
            } catch {
              // Silently continue polling
            }
          }, 3000);
          // Stop polling after 10 minutes
          setTimeout(() => {
            clearInterval(pollInterval);
            setProcessingPayment(false);
          }, 600000);
        } else {
          // Normal mode: redirect to Mercado Pago
          window.location.href = result.initPoint;
        }
      } else {
        throw new Error('No se pudo obtener el enlace de pago');
      }
    } catch (error: any) {
      if (isEmbed) {
        postTurnoLinkEvent('turnolink:error', { message: error.message || 'Error al procesar el pago' });
      }
      toast({
        title: 'Error',
        description: error.message || 'No se pudo procesar el pago. Intenta de nuevo.',
        variant: 'destructive',
      });
      setProcessingPayment(false);
    }
  }, [pendingBooking, slug, isEmbed]);

  const handleReset = useCallback(() => {
    // Reset to appropriate starting step based on branches
    if (branches.length > 1) {
      setStep('branch');
      setSelectedBranch(null);
      setBranchServices([]);
    } else {
      setStep('services');
    }
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedEmployee(null);
    setCustomerData({ name: '', phone: '', email: '', notes: '' });
    setPendingBooking(null);
    resetAvailability();
    resetBooking();
    // Daily mode reset
    setCheckInDate(null);
    setCheckOutDate(null);
    resetDailyAvailability();
  }, [resetAvailability, resetBooking, resetDailyAvailability, branches.length]);

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
      themeMode={tenant.settings.themeMode}
    >
      <div className="min-h-screen transition-colors duration-300 relative overflow-x-hidden">
        {/* Background Style - fixed behind all content */}
        <BackgroundStyles style={tenant.settings.backgroundStyle || 'modern'} className="z-0" />

        {/* Theme Toggle - Top Right (hidden in embed, hidden if single-mode theme) */}
        {!isEmbed && (tenant.settings.themeMode === 'both' || (!tenant.settings.themeMode && tenant.settings.enableDarkMode !== false)) && (
          <PublicThemeToggleFloating
            tenantSlug={slug}
            className="fixed top-4 right-4 bottom-auto h-10 w-10"
          />
        )}

        {/* Hero Header */}
        {isEmbed ? (
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-6 pb-4">
            <div className="container mx-auto flex items-center gap-3">
              {tenant.logo && (
                <img
                  src={tenant.logo}
                  alt={tenant.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">{tenant.name}</h1>
                {tenant.description && (
                  <p className="text-sm text-slate-500 dark:text-neutral-400 line-clamp-1">{tenant.description}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <PublicHero
            tenant={tenant}
            reputationStats={reputationStats}
            heroStyle={(tenant.settings.heroStyle as HeroStyleName) || 'classic'}
            coverSettings={{
              showProfilePhoto: tenant.settings.showProfilePhoto,
              coverOverlayColor: tenant.settings.coverOverlayColor,
              coverOverlayOpacity: tenant.settings.coverOverlayOpacity,
              coverFadeEnabled: tenant.settings.coverFadeEnabled,
              coverFadeColor: tenant.settings.coverFadeColor,
            }}
          />
        )}

      {/* Progress Steps */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-neutral-700 shadow-sm transition-colors">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            {branches.length > 1 && (
              <>
                <StepIndicator
                  number={1}
                  label="Sucursal"
                  active={step === 'branch'}
                  completed={!!selectedBranch}
                />
                <div className={cn('w-6 sm:w-12 h-0.5 sm:h-1 rounded-full transition-all', selectedBranch ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-neutral-700')} />
              </>
            )}
            <StepIndicator
              number={branches.length > 1 ? 2 : 1}
              label="Servicio"
              active={step === 'services'}
              completed={!!selectedService}
            />
            <div className={cn('w-6 sm:w-12 h-0.5 sm:h-1 rounded-full transition-all', selectedService ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-neutral-700')} />
            <StepIndicator
              number={branches.length > 1 ? 3 : 2}
              label={isDailyMode ? 'Fechas' : 'Fecha y Hora'}
              active={step === 'datetime'}
              completed={isDailyMode ? !!(checkInDate && checkOutDate) : !!selectedTime}
            />
            <div className={cn('w-6 sm:w-12 h-0.5 sm:h-1 rounded-full transition-all', (isDailyMode ? !!(checkInDate && checkOutDate) : !!selectedTime) ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-neutral-700')} />
            <StepIndicator
              number={branches.length > 1 ? 4 : 3}
              label="Confirmar"
              active={step === 'details' || step === 'confirmation'}
              completed={step === 'confirmation'}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">
        {/* Loading State */}
        {loadingBranches && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="text-center py-12">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              <p className="text-muted-foreground">Cargando...</p>
            </div>
          </div>
        )}

        {/* Step 0: Select Branch (only shown if multiple branches) */}
        {!loadingBranches && step === 'branch' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            {/* Section Header */}
            <div className="text-center mb-8 md:mb-12">
              <Badge className="mb-4 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-700">
                <MapPin className="h-3.5 w-3.5 mr-1.5" />
                Paso 1 de {branches.length > 1 ? 4 : 3}
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-slate-900 dark:text-white">
                Selecciona una sucursal
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">Elige la ubicacion mas conveniente para vos</p>
            </div>

            {/* Branches Grid */}
            <div className="grid gap-4 md:gap-6 sm:grid-cols-2">
              {branches.map((branch, index) => (
                <div
                  key={branch.id}
                  onClick={() => handleBranchSelect(branch)}
                  className="group cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <Card className="overflow-hidden border border-slate-200/80 dark:border-neutral-700/80 shadow-sm hover:shadow-xl hover:border-teal-400 dark:hover:border-teal-500/50 transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-neutral-800 rounded-2xl">
                    {/* Branch Image */}
                    {branch.image ? (
                      <div className="relative h-40 sm:h-48 overflow-hidden">
                        <img
                          src={branch.image}
                          alt={branch.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        {branch.isMain && (
                          <Badge className="absolute top-3 left-3 bg-amber-500 text-white border-0 text-xs shadow-lg">
                            Sede Principal
                          </Badge>
                        )}
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-lg font-bold text-white drop-shadow-lg">
                            {branch.name}
                          </h3>
                        </div>
                      </div>
                    ) : null}

                    <CardContent className={branch.image ? "p-4" : "p-5"}>
                      <div className="flex items-start gap-4">
                        {/* Branch Icon - Solo si no hay imagen */}
                        {!branch.image && (
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                            <MapPin className="h-7 w-7" />
                          </div>
                        )}

                        {/* Branch Info */}
                        <div className="flex-1 min-w-0">
                          {!branch.image && (
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                {branch.name}
                              </h3>
                              {branch.isMain && (
                                <Badge className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border-0 text-xs">
                                  Principal
                                </Badge>
                              )}
                            </div>
                          )}
                          {branch.address && (
                            <p className={`text-sm text-muted-foreground ${branch.image ? '' : 'mb-2'}`}>
                              <MapPin className="h-3.5 w-3.5 inline mr-1" />
                              {branch.address}{branch.city ? `, ${branch.city}` : ''}
                            </p>
                          )}
                          {branch.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-neutral-400 mt-1">
                              <Phone className="h-3.5 w-3.5" />
                              <span>{branch.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Arrow */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 dark:bg-neutral-700 flex items-center justify-center group-hover:bg-teal-500 transition-all">
                          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Helper text */}
            <p className="text-center text-xs text-muted-foreground mt-6 md:mt-8">
              <Sparkles className="h-3 w-3 inline mr-1" />
              Toca una sucursal para continuar con la reserva
            </p>
          </div>
        )}

        {/* Step 1: Select Service */}
        {!loadingBranches && step === 'services' && (
          <div className="max-w-5xl mx-auto px-4 animate-fade-in">
            {/* Back button for branch change */}
            {selectedBranch && branches.length > 1 && (
              <Button
                variant="ghost"
                onClick={() => setStep('branch')}
                className="mb-4 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Cambiar sucursal
              </Button>
            )}

            {/* Selected Branch - Compact pill */}
            {selectedBranch && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800">
                <MapPin className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <span className="text-sm font-medium text-teal-700 dark:text-teal-300">{selectedBranch.name}</span>
              </div>
            )}

            {/* Section Header */}
            <div className="text-center mb-6 md:mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-slate-900 dark:text-white">
                Elegi tu servicio
              </h2>
              <p className="text-sm text-muted-foreground">Selecciona el servicio que deseas reservar</p>
            </div>

            {/* Services Container with elegant frame */}
            <div className="relative">
              {/* Decorative background for desktop */}
              <div className="hidden md:block absolute -inset-4 lg:-inset-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-neutral-800/50 dark:via-neutral-900/50 dark:to-neutral-800/50 rounded-3xl border border-slate-200/60 dark:border-neutral-700/60" />

              {/* Services Grid */}
              <div className="relative grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 md:p-4 lg:p-6">
                {(branchServices.length > 0 ? branchServices : tenant.services).map((service, index) => (
                  <PublicServiceCard
                    key={service.id}
                    service={service}
                    cardStyle={(tenant.settings.cardStyle as HeroStyleName) || (tenant.settings.heroStyle as HeroStyleName) || 'classic'}
                    showPrices={tenant.settings.showPrices}
                    index={index}
                    onSelect={(s) => {
                      const svc = s as Service;
                      if (svc.variations && svc.variations.length > 0) {
                        setServiceForDetail(svc);
                        setSelectedVariations({});
                        setShowServiceDetail(true);
                      } else {
                        handleServiceSelect(svc);
                      }
                    }}
                    onShowDetail={(s) => {
                      setServiceForDetail(s as Service);
                      setSelectedVariations({});
                      setShowServiceDetail(true);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Helper text */}
            <p className="text-center text-xs text-muted-foreground mt-6 md:mt-8">
              <Sparkles className="h-3 w-3 inline mr-1" />
              Toca un servicio para continuar con la reserva
            </p>
          </div>
        )}

        {/* Step 2: Select Date and Time */}
        {step === 'datetime' && selectedService && (
          <div className="max-w-5xl mx-auto animate-fade-in">
            <button
              onClick={() => setStep('services')}
              className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-white hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-300 dark:border-neutral-600 rounded-lg px-3 py-1.5 hover:border-slate-400 dark:hover:border-neutral-500 bg-white/80 dark:bg-neutral-800/80"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Cambiar servicio
            </button>

            {/* Selected Service Card - Mobile Optimized */}
            <Card className="mb-6 md:mb-8 overflow-hidden border-0 shadow-md bg-gradient-to-r from-slate-900 to-slate-800 dark:from-neutral-800 dark:to-neutral-900">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {/* Service Image or Initial */}
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white/10">
                    {selectedService.image ? (
                      <img src={selectedService.image} alt={selectedService.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/80 font-bold text-xl">
                        {selectedService.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  {/* Service Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/60 mb-0.5">Tu selección</p>
                    <p className="font-semibold text-white text-base md:text-lg truncate">{selectedService.name}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {isDailyMode ? (
                        <>
                          <Badge className="bg-white/20 text-white border-0 text-xs font-medium">
                            <Moon className="h-3 w-3 mr-1" />
                            Por noche
                          </Badge>
                          {selectedService.price !== null && (
                            <Badge className="bg-emerald-500/90 text-white border-0 text-xs font-bold">
                              {formatPrice(selectedService.price)}/noche
                            </Badge>
                          )}
                        </>
                      ) : (
                        <>
                          <Badge className="bg-white/20 text-white border-0 text-xs font-medium">
                            <Timer className="h-3 w-3 mr-1" />
                            {formatDuration(selectedService.duration)}
                          </Badge>
                          {selectedService.price !== null && (
                            <Badge className="bg-emerald-500/90 text-white border-0 text-xs font-bold">
                              {formatPrice(selectedService.price)}
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isDailyMode ? (
              /* Daily Booking Calendar */
              <div ref={calendarSectionRef} className="scroll-mt-24 max-w-xl mx-auto">
                <Card className="border border-slate-200 dark:border-neutral-700 shadow-sm bg-white dark:bg-neutral-800 overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-neutral-700 flex items-center justify-center">
                        <CalendarDays className="h-4 w-4 text-slate-600 dark:text-neutral-300" />
                      </div>
                      Selecciona tus fechas
                    </h3>
                    <DailyBookingCalendar
                      checkInDate={checkInDate}
                      checkOutDate={checkOutDate}
                      onSelectRange={handleDailyRangeSelect}
                      onConfirm={handleDailyConfirm}
                      availability={dailyAvailability}
                      loadingAvailability={loadingDailyAvailability}
                      onMonthChange={handleDailyMonthChange}
                      maxAdvanceDays={tenant.settings.maxAdvanceBookingDays ?? 90}
                      minNights={tenant.settings.dailyMinNights ?? 1}
                      maxNights={tenant.settings.dailyMaxNights ?? 30}
                      checkInTime={tenant.settings.dailyCheckInTime ?? '14:00'}
                      checkOutTime={tenant.settings.dailyCheckOutTime ?? '10:00'}
                    />
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Hourly Booking: Calendar + Time Slots */
              <div ref={calendarSectionRef} className="scroll-mt-24 grid lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Calendar */}
                <Card className="border border-slate-200 dark:border-neutral-700 shadow-sm bg-white dark:bg-neutral-800 overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-neutral-700 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-slate-600 dark:text-neutral-300" />
                      </div>
                      Elegí una fecha
                    </h3>
                    <BookingCalendar
                      selectedDate={selectedDate}
                      onSelect={handleDateSelect}
                      maxAdvanceDays={tenant.settings.maxAdvanceBookingDays ?? 30}
                    />
                  </CardContent>
                </Card>

                {/* Time Slots */}
                <Card ref={timeSlotsSectionRef} className="scroll-mt-24 border border-slate-200 dark:border-neutral-700 shadow-sm bg-white dark:bg-neutral-800 overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
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
                            groupByPeriod={tenant.settings.smartTimeSlots !== false}
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
            )}
          </div>
        )}

        {/* Step 3: Customer Details */}
        {step === 'details' && selectedService && (isDailyMode ? (checkInDate && checkOutDate) : (selectedDate && selectedTime)) && (
          <div ref={formSectionRef} className="scroll-mt-24 max-w-xl mx-auto animate-fade-in">
            <button
              onClick={() => setStep('datetime')}
              className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-white hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-300 dark:border-neutral-600 rounded-lg px-3 py-1.5 hover:border-slate-400 dark:hover:border-neutral-500 bg-white/80 dark:bg-neutral-800/80"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {isDailyMode ? 'Cambiar fechas' : 'Cambiar horario'}
            </button>

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

                  {isDailyMode && checkInDate && checkOutDate ? (
                    <>
                      {/* Daily mode summary */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                          Check-in
                        </span>
                        <span className="font-medium capitalize text-slate-900 dark:text-white">
                          {format(checkInDate, "EEE d MMM", { locale: es })} ({tenant.settings.dailyCheckInTime ?? '14:00'} hs)
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                          Check-out
                        </span>
                        <span className="font-medium capitalize text-slate-900 dark:text-white">
                          {format(checkOutDate, "EEE d MMM", { locale: es })} ({tenant.settings.dailyCheckOutTime ?? '10:00'} hs)
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Moon className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                          Noches
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {(() => {
                            const nights = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (24 * 3600000));
                            return `${nights} ${nights === 1 ? 'noche' : 'noches'}`;
                          })()}
                        </span>
                      </div>
                      {selectedService.price !== null && (
                        <>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                            <span className="text-muted-foreground flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                              Precio por noche
                            </span>
                            <span className="font-medium text-slate-900 dark:text-white">
                              {formatPrice(selectedService.price)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-neutral-900">
                            <span className="font-semibold">Total</span>
                            <span className="text-xl font-bold">
                              {(() => {
                                const nights = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (24 * 3600000));
                                return formatPrice((selectedService.price || 0) * nights);
                              })()}
                            </span>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Hourly mode summary */}
                      {selectedDate && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                            Fecha
                          </span>
                          <span className="font-medium capitalize text-slate-900 dark:text-white">
                            {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                          </span>
                        </div>
                      )}
                      {selectedTime && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                            Hora
                          </span>
                          <span className="font-medium text-slate-900 dark:text-white">{selectedTime} hs</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Timer className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                          Duración
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white">{formatDuration(selectedService.duration)}</span>
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
                    </>
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
                        onClick={() => handleEmployeeSelect(null)}
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
                          onClick={() => handleEmployeeSelect(employee)}
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
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-teal-500 flex items-center justify-center text-white font-semibold text-lg">
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

            {/* Customer Form with Real-time Validation */}
            <div ref={customerFormRef} className="scroll-mt-24">
              <BookingCustomerForm
                requireEmail={tenant.settings.requireEmail}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                externalError={bookingError}
                onClearError={resetBooking}
              />
            </div>
          </div>
        )}

        {/* Step 4: Payment (when deposit required) */}
        {step === 'payment' && pendingBooking && selectedService && (isDailyMode ? (checkInDate && checkOutDate) : (selectedDate && selectedTime)) && (
          <div ref={paymentSectionRef} className="scroll-mt-24 max-w-lg mx-auto animate-fade-in">
            {/* Compact header */}
            <Card className="mb-5 border-0 shadow-md bg-white dark:bg-neutral-800 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3">
                <div className="flex items-center gap-2 text-white">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Falta un paso para confirmar tu {isDailyMode ? 'reserva' : 'turno'}</span>
                </div>
              </div>
              <CardContent className="p-5">
                {/* Mini summary - single row */}
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-neutral-400 mb-4 flex-wrap">
                  <span className="font-medium text-slate-900 dark:text-white">{selectedService.name}</span>
                  <span>-</span>
                  {isDailyMode && checkInDate && checkOutDate ? (
                    <>
                      <span className="capitalize">{format(checkInDate, "d MMM", { locale: es })}</span>
                      <span>→</span>
                      <span className="capitalize">{format(checkOutDate, "d MMM", { locale: es })}</span>
                    </>
                  ) : selectedDate && selectedTime ? (
                    <>
                      <span className="capitalize">{format(selectedDate, "d MMM", { locale: es })}</span>
                      <span>-</span>
                      <span>{selectedTime} hs</span>
                    </>
                  ) : null}
                </div>

                {/* Amount to pay */}
                {selectedService.price !== null && (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    <div>
                      <p className="text-sm text-emerald-700 dark:text-emerald-400">Seña ({tenant.settings.depositPercentage || 30}%)</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Resto en el local: {formatPrice((selectedService.price || 0) - (pendingBooking.depositAmount || 0))}
                      </p>
                    </div>
                    <span className="font-bold text-2xl text-emerald-700 dark:text-emerald-400">
                      {formatPrice(pendingBooking.depositAmount || 0)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment button - prominent */}
            {pendingBooking.depositMode === 'mercadopago' ? (
              <Button
                onClick={handleMercadoPagoPayment}
                disabled={processingPayment}
                className="w-full h-14 text-lg bg-[#009EE3] hover:bg-[#008ACE] text-white rounded-xl shadow-lg"
              >
                {processingPayment ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Redirigiendo...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <img src="/mercadopago-small.png" alt="" className="h-5 w-auto" />
                    Pagar con Mercado Pago
                  </span>
                )}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSimulatePayment}
                  disabled={processingPayment}
                  className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg"
                >
                  {processingPayment ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Procesando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Pagar {formatPrice(pendingBooking.depositAmount || 0)}
                    </span>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Pago de prueba - no se cobra dinero real
                </p>
              </>
            )}

            <button
              onClick={handleReset}
              disabled={processingPayment}
              className="w-full mt-4 text-sm text-muted-foreground hover:text-slate-700 dark:hover:text-neutral-300 transition-colors"
            >
              Cancelar
            </button>
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
              {isDailyMode ? 'Tu estadía ha sido registrada exitosamente.' : 'Tu turno ha sido registrado exitosamente.'}
            </p>

            {/* Email Confirmation Banner */}
            <div className="flex items-center justify-center gap-2 mb-8 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Mail className="h-4 w-4 text-white" />
              </div>
              <span className="text-blue-700 dark:text-blue-400 font-medium">
                Te enviaremos un email con la confirmación y los detalles
              </span>
            </div>

            {/* Booking Details Card - only show if we have details (not from MP redirect) */}
            {selectedService && (
              <Card className="text-left mb-8 border border-slate-200 dark:border-neutral-700 shadow-sm bg-white dark:bg-neutral-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-200 dark:border-neutral-700">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-neutral-700 flex items-center justify-center text-slate-600 dark:text-neutral-300 font-semibold">
                      {selectedService.name.charAt(0)}
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
                      <span className="font-medium text-slate-900 dark:text-white">{selectedService.name}</span>
                    </div>
                    {isDailyMode && checkInDate && checkOutDate ? (
                      <>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                            Check-in
                          </span>
                          <span className="font-medium capitalize text-slate-900 dark:text-white">
                            {format(checkInDate, "EEE d MMM", { locale: es })} ({tenant.settings.dailyCheckInTime ?? '14:00'} hs)
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                            Check-out
                          </span>
                          <span className="font-medium capitalize text-slate-900 dark:text-white">
                            {format(checkOutDate, "EEE d MMM", { locale: es })} ({tenant.settings.dailyCheckOutTime ?? '10:00'} hs)
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Moon className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                            Noches
                          </span>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (24 * 3600000))}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        {selectedDate && (
                          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                            <span className="text-muted-foreground flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                              Fecha
                            </span>
                            <span className="font-medium capitalize text-slate-900 dark:text-white">
                              {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                            </span>
                          </div>
                        )}
                        {selectedTime && (
                          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                            <span className="text-muted-foreground flex items-center gap-2">
                              <Clock className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                              Hora
                            </span>
                            <span className="font-medium text-slate-900 dark:text-white">{selectedTime} hs</span>
                          </div>
                        )}
                        {selectedEmployee && (
                          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                            <span className="text-muted-foreground flex items-center gap-2">
                              <User className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                              Profesional
                            </span>
                            <span className="font-medium text-slate-900 dark:text-white">{selectedEmployee.name}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Simple confirmation for MercadoPago redirect (no booking details available) */}
            {!selectedService && (
              <Card className="text-left mb-8 border border-slate-200 dark:border-neutral-700 shadow-sm bg-white dark:bg-neutral-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <Check className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-slate-900 dark:text-white">{tenant.name}</p>
                      <p className="text-sm text-muted-foreground">Tu pago fue procesado y el turno quedó confirmado</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Secondary Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                className="h-10 px-6 border-slate-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
                onClick={handleReset}
              >
                {isDailyMode ? 'Hacer otra reserva' : 'Reservar otro turno'}
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Location Section with Carousel (hidden in embed) */}
      {!isEmbed && (
        <LocationCarousel
          locations={
            branches.length > 0
              ? branches.map(b => ({
                  id: b.id,
                  name: b.name,
                  image: b.image,
                  address: b.address,
                  city: b.city,
                  phone: b.phone,
                  isMain: b.isMain,
                }))
              : tenant.address || tenant.city
                ? [{
                    id: 'tenant',
                    name: tenant.name,
                    image: null,
                    address: tenant.address,
                    city: tenant.city,
                    phone: tenant.phone,
                    isMain: true,
                  }]
                : []
          }
          tenantName={tenant.name}
        />
      )}

      {/* Footer */}
      {isEmbed ? (
        <footer className="py-3 text-center relative z-10">
          <a
            href="https://app.turnolink.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 transition-colors"
          >
            Powered by
            <img src="/oscuro2.png" alt="TurnoLink" className="h-5 w-auto dark:hidden" />
            <img src="/logo-claro.png" alt="TurnoLink" className="h-5 w-auto hidden dark:inline" />
          </a>
        </footer>
      ) : (
        <footer className="bg-slate-900 text-white mt-auto relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 sm:gap-6 text-slate-400 text-xs">
                <span className="inline-flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" />Rápida</span>
                <span className="inline-flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" />Segura</span>
                <span className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5" />Premium</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Reservas por</span>
                <a href="/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                  <img src="/oscuro2.png" alt="TurnoLink" className="h-8 w-auto" />
                </a>
                <span className="hidden sm:inline">· © {new Date().getFullYear()}</span>
              </div>
            </div>
          </div>
        </footer>
      )}

        {/* Service Detail Modal */}
        {showServiceDetail && serviceForDetail && (
          <div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
            onClick={() => setShowServiceDetail(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

            {/* Modal Content */}
            <div
              className="relative w-full md:max-w-lg bg-white dark:bg-neutral-900 rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle for mobile */}
              <div className="md:hidden flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-neutral-600" />
              </div>

              {/* Close button */}
              <button
                onClick={() => setShowServiceDetail(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-neutral-800/90 shadow-md flex items-center justify-center hover:bg-white dark:hover:bg-neutral-700 transition-colors"
              >
                <X className="h-4 w-4 text-slate-600 dark:text-neutral-300" />
              </button>

              {/* Service Image / Gallery Carousel */}
              <ServiceImageCarousel
                service={serviceForDetail}
                heroStyle={(tenant.settings.cardStyle as HeroStyleName) || (tenant.settings.heroStyle as HeroStyleName) || 'classic'}
                showPrices={tenant.settings.showPrices}
              />

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-15rem)] md:max-h-[calc(85vh-17rem)]">
                {/* Service Name */}
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  {serviceForDetail.name}
                </h2>

                {/* Description */}
                {serviceForDetail.description && (
                  <div className="mb-5">
                    <p className="text-slate-600 dark:text-neutral-400 leading-relaxed">
                      {serviceForDetail.description}
                    </p>
                  </div>
                )}

                {/* What's Included */}
                {serviceForDetail.includes && (
                  <div className="mb-5">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                        <CheckCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      Qué incluye
                    </h3>
                    <div className="space-y-2">
                      {serviceForDetail.includes.split(/[,\n]/).map((item, index) => {
                        const trimmed = item.trim();
                        if (!trimmed) return null;
                        return (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/50"
                          >
                            <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="text-sm text-slate-700 dark:text-neutral-300">{trimmed}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Variation Selector */}
                {serviceForDetail.variations && serviceForDetail.variations.length > 0 && (
                  <div className="mb-5 space-y-4">
                    {serviceForDetail.variations.map(group => (
                      <div key={group.id}>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2.5 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                            <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          </div>
                          {group.label}
                          {group.required && <span className="text-[10px] text-red-400 font-normal">requerido</span>}
                        </h3>
                        <div className="space-y-1.5">
                          {group.options.map(option => {
                            const isSelected = (selectedVariations[group.id] || []).includes(option.id);
                            const displayPrice = option.pricingType === 'absolute'
                              ? option.priceModifier
                              : (serviceForDetail.price || 0) + option.priceModifier;

                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => handleVariationSelect(group.id, option.id, group.type)}
                                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                                  isSelected
                                    ? 'bg-blue-50 dark:bg-blue-900/20 ring-1.5 ring-blue-500 dark:ring-blue-400'
                                    : 'bg-slate-50 dark:bg-neutral-800/50 hover:bg-slate-100 dark:hover:bg-neutral-800'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-[18px] h-[18px] ${group.type === 'single' ? 'rounded-full' : 'rounded'} border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                    isSelected
                                      ? 'border-blue-500 bg-blue-500'
                                      : 'border-slate-300 dark:border-neutral-600'
                                  }`}>
                                    {isSelected && <Check className="h-3 w-3 text-white" />}
                                  </div>
                                  <span className={`text-sm font-medium ${
                                    isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-neutral-400'
                                  }`}>
                                    {option.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                  {option.durationModifier !== 0 && (
                                    <span className="text-xs text-slate-400 dark:text-neutral-500">
                                      {formatDuration(serviceForDetail.duration + option.durationModifier)}
                                    </span>
                                  )}
                                  {option.priceModifier !== 0 && tenant.settings.showPrices && (
                                    <span className={`text-sm font-semibold ${
                                      isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-neutral-400'
                                    }`}>
                                      {option.pricingType === 'absolute'
                                        ? formatPrice(option.priceModifier)
                                        : `+${formatPrice(option.priceModifier)}`
                                      }
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick info summary */}
                {(() => {
                  const effective = getEffectivePriceAndDuration(serviceForDetail, selectedVariations);
                  const hs = (tenant.settings.heroStyle as HeroStyleName) || 'classic';
                  const priceColors = {
                    bg: 'bg-[hsl(var(--tenant-primary-50))] dark:bg-[hsl(var(--tenant-primary-900)_/_0.2)]',
                    icon: 'text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-400))]',
                    label: 'text-[hsl(var(--tenant-primary-600))] dark:text-[hsl(var(--tenant-primary-500))]',
                    value: 'text-[hsl(var(--tenant-primary-700))] dark:text-[hsl(var(--tenant-primary-400))]',
                  };
                  return (
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/50 text-center">
                        <Timer className="h-5 w-5 mx-auto mb-1 text-slate-500 dark:text-neutral-400" />
                        <p className="text-xs text-slate-500 dark:text-neutral-500">Duración</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{formatDuration(effective.duration)}</p>
                      </div>
                      {effective.price !== null && tenant.settings.showPrices && (
                        <div className={`p-3 rounded-xl ${priceColors.bg} text-center`}>
                          <CreditCard className={`h-5 w-5 mx-auto mb-1 ${priceColors.icon}`} />
                          <p className={`text-xs ${priceColors.label}`}>Precio</p>
                          <p className={`font-bold ${priceColors.value}`}>{formatPrice(effective.price)}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Action buttons */}
                <div className="space-y-3">
                  {/* Reserve button - Primary CTA */}
                  <Button
                    onClick={() => {
                      setShowServiceDetail(false);
                      setBookingVariations(selectedVariations);
                      handleServiceSelect(serviceForDetail);
                    }}
                    disabled={!allRequiredVariationsSelected(serviceForDetail, selectedVariations)}
                    className={`w-full h-12 ${(HERO_STYLES[(tenant.settings.cardStyle as HeroStyleName) || (tenant.settings.heroStyle as HeroStyleName) || 'classic'] || HERO_STYLES.classic).modalCtaBtnClasses} font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Reservar este servicio
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>

                  {/* Close button - Secondary */}
                  <Button
                    variant="outline"
                    onClick={() => setShowServiceDetail(false)}
                    className="w-full h-11 border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-300 font-medium rounded-xl"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicThemeWrapper>
  );
}

function ServiceImageCarousel({
  service,
  heroStyle,
  showPrices,
}: {
  service: Service;
  heroStyle: HeroStyleName;
  showPrices: boolean;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build array of all images: main image first, then gallery
  const allImages: string[] = [];
  if (service.image) allImages.push(service.image);
  if (service.images && service.images.length > 0) {
    for (const img of service.images) {
      if (img && !allImages.includes(img)) allImages.push(img);
    }
  }

  const hasMultiple = allImages.length > 1;

  // Parse per-image display modes
  const imageModes: Record<string, string> = {};
  if (service.imageDisplayMode) {
    try {
      const parsed = JSON.parse(service.imageDisplayMode);
      if (typeof parsed === 'object' && parsed !== null) Object.assign(imageModes, parsed);
    } catch {
      // Old format: single string
      if (service.imageDisplayMode === 'contain') {
        for (let i = 0; i < allImages.length; i++) imageModes[String(i)] = 'contain';
      }
    }
  }
  const getModeForIndex = (i: number) => imageModes[String(i)] || 'cover';

  const goTo = (index: number) => {
    if (index < 0) setCurrentIndex(allImages.length - 1);
    else if (index >= allImages.length) setCurrentIndex(0);
    else setCurrentIndex(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !hasMultiple) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    // Only swipe if horizontal movement > vertical and > 40px threshold
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) goTo(currentIndex + 1);
      else goTo(currentIndex - 1);
    }
    touchStartRef.current = null;
  };

  // Style-aware badge colors — now unified via CSS vars
  const priceBadgeCls = 'bg-[hsl(var(--tenant-primary-500))] text-[var(--tenant-primary-contrast)]' + (heroStyle === 'bold' ? ' font-black' : '');
  const durationBadgeCls = (() => {
    switch (heroStyle) {
      case 'bold': case 'energetic': return 'bg-black/70 text-white border-0 shadow-md backdrop-blur-sm font-medium px-3 py-1';
      default: return 'bg-white/95 dark:bg-neutral-900/95 text-slate-700 dark:text-neutral-200 border-0 shadow-md backdrop-blur-sm font-medium px-3 py-1';
    }
  })();

  // No images at all — show fallback
  if (allImages.length === 0) {
    return (
      <div className="relative h-56 md:h-64 overflow-hidden">
        <div className={`w-full h-full ${(HERO_STYLES[heroStyle] || HERO_STYLES.classic).modalFallbackGradient} flex items-center justify-center`}>
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-2">
              <span className="text-5xl font-bold text-white">{service.name.charAt(0)}</span>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <Badge className={durationBadgeCls}>
            <Timer className="h-3.5 w-3.5 mr-1.5" />
            {formatDuration(service.duration)}
          </Badge>
          {service.price !== null && showPrices && (
            <Badge className={`${priceBadgeCls} border-0 shadow-md text-base font-bold px-4 py-1.5`}>
              {formatPrice(service.price)}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-56 md:h-64 overflow-hidden group"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Images strip */}
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {allImages.map((url, i) =>
          getModeForIndex(i) === 'contain' ? (
            <div key={i} className="relative w-full h-full flex-shrink-0">
              <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-60" draggable={false} />
              <img src={url} alt={`${service.name} ${i + 1}`} className="relative w-full h-full object-contain" draggable={false} />
            </div>
          ) : (
            <img key={i} src={url} alt={`${service.name} ${i + 1}`} className="w-full h-full object-cover flex-shrink-0" draggable={false} />
          )
        )}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

      {/* Desktop arrows */}
      {hasMultiple && (
        <>
          <button
            onClick={() => goTo(currentIndex - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 dark:bg-neutral-800/80 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-neutral-700"
          >
            <ChevronLeft className="h-4 w-4 text-slate-700 dark:text-neutral-200" />
          </button>
          <button
            onClick={() => goTo(currentIndex + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 dark:bg-neutral-800/80 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-neutral-700"
          >
            <ChevronRight className="h-4 w-4 text-slate-700 dark:text-neutral-200" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {hasMultiple && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1.5">
          {allImages.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex
                  ? 'bg-white w-4'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* Duration & Price badges */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <Badge className="bg-white/95 dark:bg-neutral-900/95 text-slate-700 dark:text-neutral-200 border-0 shadow-md backdrop-blur-sm font-medium px-3 py-1">
          <Timer className="h-3.5 w-3.5 mr-1.5" />
          {formatDuration(service.duration)}
        </Badge>
        {service.price !== null && showPrices && (
          <Badge className={`${priceBadgeCls} border-0 shadow-md text-base font-bold px-4 py-1.5`}>
            {formatPrice(service.price)}
          </Badge>
        )}
      </div>
    </div>
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
    <div className="flex items-center gap-1.5 sm:gap-2">
      <div
        className={cn(
          'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300',
          completed
            ? 'bg-emerald-500 text-white shadow-sm'
            : active
            ? 'bg-slate-900 dark:bg-white text-white dark:text-neutral-900 shadow-md ring-2 ring-slate-900/10 dark:ring-white/20'
            : 'bg-slate-200 dark:bg-neutral-700 text-slate-400 dark:text-neutral-500'
        )}
      >
        {completed ? <Check className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} /> : number}
      </div>
      <span
        className={cn(
          'hidden sm:inline text-sm font-medium transition-colors',
          completed
            ? 'text-emerald-600 dark:text-emerald-400'
            : active
            ? 'text-slate-900 dark:text-white'
            : 'text-slate-400 dark:text-neutral-500'
        )}
      >
        {label}
      </span>
    </div>
  );
}
