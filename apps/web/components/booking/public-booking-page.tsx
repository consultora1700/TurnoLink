'use client';

import { useState, useCallback, useEffect, useRef, useMemo, Fragment } from 'react';
import Image from 'next/image';
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
  Video,
  ClipboardList,
  Package,
  Layers,
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
import { useAvailability, useBooking, useDailyAvailability, useMonthlyAvailability } from '@/hooks';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { publicApi, EmployeePublic, BranchPublic, CreateDailyBookingData, IntakeFormField } from '@/lib/api';
import { PublicThemeWrapper, PublicThemeToggleFloating } from './public-theme-wrapper';
import { BackgroundStyles, BackgroundStyle } from '@/components/ui/background-styles';
import { LocationCarousel } from './location-carousel';
import { PublicHero } from './public-hero';
import { PublicServiceCard, PriceDisplay } from './public-service-card';
import { PublicReviewsSection } from './public-reviews-section';
import { HeroStyleName, HERO_STYLES } from '@/lib/hero-styles';
import { postTurnoLinkEvent } from './embed-booking-page';
import { getTerminology } from '@/lib/terminology';
import { RUBRO_TERMS } from '@/lib/tenant-config';
import { getSelectedAmenities, AMENITY_ICON_MAP } from '@/lib/amenities-catalog';
import { getRubroUIConfig } from '@/lib/tenant-config';
import { PublicSorteoCard } from './public-sorteo-card';

/**
 * Extract YouTube video ID from various URL formats.
 */
function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

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
  mode?: string;
  specialtyId?: string | null;
  assignmentMode?: string;
  specialty?: { id: string; name: string; slug: string } | null;
  intakeFormId?: string | null;
  // Per-service check-in/out times
  checkInTime?: string | null;
  checkOutTime?: string | null;
  // Rich content
  youtubeVideoUrl?: string | null;
  amenities?: string[];
  // Pack fields
  isPack?: boolean;
  packCheckIn?: string | null;
  packCheckOut?: string | null;
  packNights?: number | null;
  packOriginalPrice?: number | null;
  // Promo fields
  promoPrice?: number | null;
  promoLabel?: string | null;
}

interface SpecialtyInfo {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  _count?: { services?: number; employeeSpecialties?: number };
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
  publicPageLayout?: string;
  publicPageConfig?: Record<string, unknown>;
  specialties?: SpecialtyInfo[];
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
    heroTextTone?: 'auto' | 'light' | 'dark';
    heroTrustTone?: 'auto' | 'light' | 'dark';
    heroButtons?: ('location' | 'call' | 'whatsapp' | 'instagram')[];
    rubro?: string | null;
    youtubeVideoUrl?: string | null;
    amenities?: string[];
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
  videoJoinUrl?: string;
  videoProvider?: string;
  bookingMode?: string;
}

type Step = 'branch' | 'employee' | 'specialty' | 'services' | 'datetime' | 'details' | 'payment' | 'confirmation';

export function PublicBookingPage({ tenant: tenantData, slug, isEmbed = false }: Props) {
  const tenant = tenantData as Tenant;
  const logoScale = (tenant.settings as any)?.logoScale ?? 1;
  const logoOffsetX = (tenant.settings as any)?.logoOffsetX ?? 0;
  const logoOffsetY = (tenant.settings as any)?.logoOffsetY ?? 0;
  const [branches, setBranches] = useState<BranchPublic[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<BranchPublic | null>(null);
  const [branchServices, setBranchServices] = useState<Service[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  // Compute initial step from layout to avoid flash/flicker.
  // For employee_first/specialty_first the correct step is set immediately
  // so the page never renders 'services' first and then switches.
  const initialStep: Step = (() => {
    const layout = (tenantData as any).publicPageLayout || 'service_first';
    const specs = (tenantData as any).specialties;
    if (layout === 'specialty_first' && specs?.length > 0) return 'specialty';
    if (layout === 'employee_first') return 'employee';
    return 'services';
  })();
  const [step, setStep] = useState<Step>(initialStep);
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

  // Swipe-down-to-dismiss for service detail modal
  const serviceModalRef = useRef<HTMLDivElement>(null);
  const svcSwipeStartY = useRef(0);
  const [svcSwipeDragY, setSvcSwipeDragY] = useState(0);
  const [svcSwipeAnimating, setSvcSwipeAnimating] = useState(false);
  const svcSwipeDragging = useRef(false);
  const svcLastDragY = useRef(0);
  const svcSwipeBlocked = useRef(false);
  const svcClosing = useRef(false);
  const [svcEntryDone, setSvcEntryDone] = useState(false);

  // Remove entry animation class after it finishes so inline transform works
  useEffect(() => {
    if (showServiceDetail) {
      setSvcEntryDone(false);
      const t = setTimeout(() => setSvcEntryDone(true), 650);
      return () => clearTimeout(t);
    }
  }, [showServiceDetail]);

  // Animated close for service detail modal (used by backdrop tap, close btn, swipe, and CTA)
  const closeServiceDetail = useCallback(() => {
    if (svcClosing.current) return;
    svcClosing.current = true;
    setSvcSwipeAnimating(true);
    setSvcSwipeDragY(700);
    setTimeout(() => {
      setShowServiceDetail(false);
      setSvcSwipeDragY(0);
      setSvcSwipeAnimating(false);
      svcClosing.current = false;
    }, 280);
  }, []);

  // Service mode state (presencial/online)
  const [selectedBookingMode, setSelectedBookingMode] = useState<'presencial' | 'online' | null>(null);

  // Intake form state
  const [intakeFormFields, setIntakeFormFields] = useState<IntakeFormField[]>([]);
  const [intakeFormData, setIntakeFormData] = useState<Record<string, unknown>>({});
  const [loadingIntakeForm, setLoadingIntakeForm] = useState(false);
  const [activeIntakeFormId, setActiveIntakeFormId] = useState<string | null>(null);

  // Specialty-first layout
  const pageLayout = tenant.publicPageLayout || 'service_first';
  const hasSpecialties = (tenant.specialties?.length || 0) > 0;
  const isSpecialtyFirst = pageLayout === 'specialty_first' && hasSpecialties;
  const isEmployeeFirst = pageLayout === 'employee_first' && employees.length > 0;
  const [selectedSpecialty, setSelectedSpecialty] = useState<{ id: string; name: string; slug: string } | null>(null);
  const [employeeFilteredServiceIds, setEmployeeFilteredServiceIds] = useState<string[] | null>(null);

  // Dynamic terminology
  const terms = useMemo(() => getTerminology(tenant.publicPageConfig), [tenant.publicPageConfig]);
  const rubroTerms = tenant.settings.rubro ? RUBRO_TERMS[tenant.settings.rubro] : undefined;
  const depositLabel = rubroTerms?.depositLabel || 'Seña';

  // Daily booking mode state
  const isDailyMode = tenant.settings.bookingMode === 'DAILY';
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);

  // Helper: first step after branch for the current layout.
  // Uses pageLayout directly (not employee state) to avoid flash.
  const firstContentStep: Step = isSpecialtyFirst
    ? 'specialty'
    : pageLayout === 'employee_first'
      ? 'employee'
      : 'services';

  // Filter services by selected specialty or employee
  const filteredServices = useMemo(() => {
    const base = branchServices.length > 0 ? branchServices : tenant.services;
    if (isSpecialtyFirst && selectedSpecialty) {
      return base.filter((s: Service) => s.specialtyId === selectedSpecialty.id);
    }
    if (isEmployeeFirst && employeeFilteredServiceIds) {
      return base.filter((s: Service) => employeeFilteredServiceIds.includes(s.id));
    }
    return base;
  }, [branchServices, tenant.services, isSpecialtyFirst, selectedSpecialty, isEmployeeFirst, employeeFilteredServiceIds]);

  // Separate normal services and packs
  const normalServices = useMemo(() => filteredServices.filter(s => !s.isPack), [filteredServices]);
  const packServices = useMemo(() => filteredServices.filter(s => s.isPack), [filteredServices]);

  // Lock body scroll when service detail modal is open
  useEffect(() => {
    if (showServiceDetail) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showServiceDetail]);

  // Swipe-down-to-dismiss touch handlers for service detail modal
  useEffect(() => {
    const el = serviceModalRef.current;
    if (!el) return;
    const getScrollTop = () => {
      const scrollable = el.querySelector('[class*="overflow-y-auto"]');
      return scrollable ? scrollable.scrollTop : 0;
    };
    const onStart = (e: TouchEvent) => {
      svcSwipeStartY.current = e.touches[0].clientY;
      svcSwipeDragging.current = false;
      setSvcSwipeAnimating(false);
      svcSwipeBlocked.current = getScrollTop() > 5;
    };
    const onMove = (e: TouchEvent) => {
      if (svcSwipeBlocked.current) return;
      const dy = e.touches[0].clientY - svcSwipeStartY.current;
      if (dy > 12) {
        svcSwipeDragging.current = true;
        e.preventDefault();
        const val = Math.min(dy * 0.55, 300);
        svcLastDragY.current = val;
        setSvcSwipeDragY(val);
      } else if (dy < -5 && svcSwipeDragging.current) {
        svcSwipeDragging.current = false;
        svcLastDragY.current = 0;
        setSvcSwipeDragY(0);
      }
    };
    const onEnd = () => {
      if (svcSwipeDragging.current && svcLastDragY.current > 60) {
        closeServiceDetail();
      } else if (svcSwipeDragging.current) {
        setSvcSwipeAnimating(true);
        setSvcSwipeDragY(0);
        setTimeout(() => setSvcSwipeAnimating(false), 250);
      }
      svcSwipeDragging.current = false;
      svcSwipeBlocked.current = false;
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd, { passive: true });
    return () => { el.removeEventListener('touchstart', onStart); el.removeEventListener('touchmove', onMove); el.removeEventListener('touchend', onEnd); };
  }, [showServiceDetail, closeServiceDetail]);

  // Reset swipe state when modal closes
  useEffect(() => {
    if (!showServiceDetail) {
      setSvcSwipeDragY(0);
      setSvcSwipeAnimating(false);
    }
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

  const {
    availabilityMap,
    fetchMonth,
    reset: resetMonthlyAvailability,
  } = useMonthlyAvailability(slug);

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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.turnolink.com.ar'}/api/public/reviews/${slug}/stats`);
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
          setStep(firstContentStep);
        } else if (data.length > 1) {
          // Multiple branches - show branch selector first
          setStep('branch');
        } else {
          // No branches - use tenant services directly
          setBranchServices(tenant.services);
          setStep(firstContentStep);
        }
      } catch {
        // No branches or error - use tenant services
        setBranches([]);
        setBranchServices(tenant.services);
        setStep(firstContentStep);
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

  // Load active sorteos
  const [activeSorteos, setActiveSorteos] = useState<any[]>([]);
  useEffect(() => {
    publicApi.getSorteos(slug).then(setActiveSorteos).catch(() => {});
  }, [slug]);

  // Fallback: if employee_first but no employees exist, fall back to services
  useEffect(() => {
    if (
      !loadingEmployees &&
      pageLayout === 'employee_first' &&
      employees.length === 0 &&
      step === 'employee'
    ) {
      setStep('services');
    }
  }, [loadingEmployees, pageLayout, employees.length, step]);

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
          title: `${terms.booking} confirmada`,
          description: `Tu ${terms.appointment.toLowerCase()} ha sido registrado exitosamente.`,
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
        title: `Error al ${terms.bookAction.toLowerCase()}`,
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

    setStep(firstContentStep);
  }, [slug, tenant.services, firstContentStep]);

  // Handle specialty selection (specialty_first flow)
  const handleSpecialtySelect = useCallback((specialty: { id: string; name: string; slug: string }) => {
    setSelectedSpecialty(specialty);
    setSelectedService(null);
    setStep('services');
  }, []);

  // Handle employee selection (employee_first flow)
  const handleEmployeeFirstSelect = useCallback(async (employee: EmployeePublic) => {
    setSelectedEmployee(employee);
    try {
      const services = await publicApi.getEmployeeServices(slug, employee.id);
      setEmployeeFilteredServiceIds(services.map(s => s.id));
    } catch {
      // Fallback: show all services
      setEmployeeFilteredServiceIds(null);
    }
    setSelectedService(null);
    setStep('services');
  }, [slug]);

  // Helper: check if a service has a __mode__ variation (different prices for presencial/online)
  const hasModeVariation = useCallback((service: Service) => {
    return service.variations?.some(g => g.id === '__mode__') ?? false;
  }, []);

  const handleServiceSelect = useCallback((service: Service, variations?: Record<string, string[]>) => {
    const effectiveVariations = variations ?? bookingVariations;
    setSelectedService(service);
    setStep('datetime');
    // In employee_first flow, keep the pre-selected employee; otherwise load service-specific employees
    if (!isEmployeeFirst || !selectedEmployee) {
      setSelectedEmployee(null);
      (async () => {
        setLoadingEmployees(true);
        try {
          const data = await publicApi.getServiceEmployees(slug, service.id);
          setEmployees(data);
        } catch {
          // Fallback: keep existing employees
        } finally {
          setLoadingEmployees(false);
        }
      })();
    }
    // Auto-set booking mode based on service mode
    if (service.mode === 'online') {
      setSelectedBookingMode('online');
    } else if (service.mode === 'ambos') {
      // If __mode__ variation exists, extract booking mode from variations
      const modeVariation = service.variations?.find(g => g.id === '__mode__');
      if (modeVariation) {
        const modeSelection = effectiveVariations['__mode__'];
        if (modeSelection?.includes('__online__')) {
          setSelectedBookingMode('online');
        } else if (modeSelection?.includes('__presencial__')) {
          setSelectedBookingMode('presencial');
        } else {
          setSelectedBookingMode(null);
        }
      } else {
        setSelectedBookingMode(null); // Client must choose via simple selector
      }
    } else {
      setSelectedBookingMode('presencial');
    }
    if (isDailyMode) {
      resetDailyAvailability();
      setCheckInDate(null);
      setCheckOutDate(null);
    } else {
      resetAvailability();
      resetMonthlyAvailability();
      const now = new Date();
      fetchMonth(now.getFullYear(), now.getMonth() + 1, service.id, selectedBranch?.id);
    }
    // Load intake form if service has one
    if (service.intakeFormId) {
      setLoadingIntakeForm(true);
      setActiveIntakeFormId(service.intakeFormId);
      setIntakeFormData({});
      publicApi.getIntakeForm(slug, service.intakeFormId)
        .then(form => setIntakeFormFields(form.fields || []))
        .catch(() => { setIntakeFormFields([]); setActiveIntakeFormId(null); })
        .finally(() => setLoadingIntakeForm(false));
    } else {
      setIntakeFormFields([]);
      setIntakeFormData({});
      setActiveIntakeFormId(null);
    }
    // Scroll to calendar section after step change
    scrollToElement(calendarSectionRef, 200);
  }, [isDailyMode, resetAvailability, resetDailyAvailability, resetMonthlyAvailability, fetchMonth, selectedBranch?.id, scrollToElement, bookingVariations, slug, isEmployeeFirst, selectedEmployee]);

  // Pack selection: skip calendar, go straight to details
  const handlePackSelect = useCallback((pack: Service) => {
    setSelectedService(pack);
    if (pack.packCheckIn) setCheckInDate(new Date(pack.packCheckIn));
    if (pack.packCheckOut) setCheckOutDate(new Date(pack.packCheckOut));
    // Load intake form if pack has one
    if (pack.intakeFormId) {
      setLoadingIntakeForm(true);
      setActiveIntakeFormId(pack.intakeFormId);
      setIntakeFormData({});
      publicApi.getIntakeForm(slug, pack.intakeFormId)
        .then(form => setIntakeFormFields(form.fields || []))
        .catch(() => { setIntakeFormFields([]); setActiveIntakeFormId(null); })
        .finally(() => setLoadingIntakeForm(false));
    } else {
      setIntakeFormFields([]);
      setIntakeFormData({});
      setActiveIntakeFormId(null);
    }
    setStep('details');
    scrollToElement(formSectionRef, 200);
  }, [scrollToElement, slug]);

  // Daily mode: handle range selection (no auto-advance — user must click "Confirmar")
  const handleDailyRangeSelect = useCallback((checkIn: Date | null, checkOut: Date | null) => {
    setCheckInDate(checkIn);
    setCheckOutDate(checkOut);
  }, []);

  // Scroll to calendar when booking mode is selected (for 'ambos' services)
  useEffect(() => {
    if (selectedBookingMode && selectedService?.mode === 'ambos' && step === 'datetime') {
      scrollToElement(calendarSectionRef, 200);
    }
  }, [selectedBookingMode, selectedService?.mode, step, scrollToElement]);

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

  // Hourly mode: fetch monthly availability for calendar indicators
  const handleMonthChange = useCallback((year: number, month: number) => {
    if (!isDailyMode) {
      fetchMonth(year, month, selectedService?.id, selectedBranch?.id);
    }
  }, [fetchMonth, isDailyMode, selectedService?.id, selectedBranch?.id]);

  // Compute next available date from monthly availability map
  const nextAvailableDate = useMemo(() => {
    if (!selectedDate || !availabilityMap) return null;
    return Object.entries(availabilityMap)
      .filter(([date, avail]) => avail && new Date(date + 'T12:00:00') > selectedDate)
      .sort(([a], [b]) => a.localeCompare(b))[0]?.[0] || null;
  }, [selectedDate, availabilityMap]);

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

    // Pass employeeId when an employee is selected (employee_first flow)
    const empId = selectedEmployee?.id;

    // Use branch availability if branch is selected
    if (selectedBranch) {
      try {
        await publicApi.getBranchAvailability(
          slug,
          selectedBranch.slug,
          dateStr,
          selectedService?.id
        );
        await fetchAvailability(dateStr, selectedService?.id, empId);
      } catch {
        await fetchAvailability(dateStr, selectedService?.id, empId);
      }
    } else {
      await fetchAvailability(dateStr, selectedService?.id, empId);
    }
    // Scroll to time slots after loading
    scrollToElement(timeSlotsSectionRef, 300);
  }, [fetchAvailability, selectedService?.id, selectedBranch, selectedEmployee?.id, slug, scrollToElement]);

  // Jump to a suggested date
  const handleJumpToDate = useCallback((date: Date) => {
    handleDateSelect(date);
  }, [handleDateSelect]);

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

    // Validate required intake form fields
    if (intakeFormFields.length > 0) {
      const missingFields = intakeFormFields
        .filter(f => f.required)
        .filter(f => {
          const val = intakeFormData[f.id];
          return val === undefined || val === null || val === '' || val === false;
        });
      if (missingFields.length > 0) {
        toast({
          title: 'Campos requeridos',
          description: `Completá: ${missingFields.map(f => f.label).join(', ')}`,
          variant: 'destructive',
        });
        return;
      }
    }

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
        bookingMode: selectedBookingMode || undefined,
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
            title: `${terms.booking} confirmada`,
            description: `Tu ${terms.booking.toLowerCase()} ha sido registrada exitosamente.`,
          });
        }
      } catch (error: any) {
        toast({
          title: `Error al ${terms.bookAction.toLowerCase()}`,
          description: error.message || `No se pudo completar la ${terms.booking.toLowerCase()}.`,
          variant: 'destructive',
        });
      }
    } else {
      // Hourly booking mode (original)
      if (!selectedDate || !selectedTime) return;

      // Build variation summary for booking notes (exclude __mode__ since bookingMode handles it)
      let variationNotes = '';
      if (selectedService?.variations && Object.keys(bookingVariations).length > 0) {
        const parts: string[] = [];
        for (const group of selectedService.variations) {
          if (group.id === '__mode__') continue; // Mode is tracked via bookingMode field
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
        bookingMode: selectedBookingMode || undefined,
        intakeFormId: activeIntakeFormId || undefined,
        intakeFormData: activeIntakeFormId && Object.keys(intakeFormData).length > 0 ? intakeFormData : undefined,
      };

      await submitBooking(bookingData);
    }
  }, [selectedService, selectedDate, selectedTime, selectedEmployee, selectedBranch, submitBooking, bookingVariations, isDailyMode, checkInDate, checkOutDate, slug, selectedBookingMode, activeIntakeFormId, intakeFormData, intakeFormFields]);

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
          description: `Tu ${terms.booking.toLowerCase()} ha sido confirmada.`,
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
                    description: `Tu ${terms.booking.toLowerCase()} ha sido confirmada exitosamente.`,
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
    setSelectedBookingMode(null);
    setBookingVariations({});
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
                <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0">
                  <img
                    src={tenant.logo}
                    alt={tenant.name}
                    className="w-full h-full object-cover"
                    style={(() => {
                      const parts: string[] = [];
                      if (logoScale && logoScale !== 1) parts.push(`scale(${logoScale})`);
                      if (logoOffsetX || logoOffsetY) parts.push(`translate(${logoOffsetX || 0}%, ${logoOffsetY || 0}%)`);
                      return parts.length ? { transform: parts.join(' '), transformOrigin: 'center' } : undefined;
                    })()}
                  />
                </div>
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
            heroButtons={tenant.settings.heroButtons}
            coverSettings={{
              showProfilePhoto: tenant.settings.showProfilePhoto,
              coverOverlayColor: tenant.settings.coverOverlayColor,
              coverOverlayOpacity: tenant.settings.coverOverlayOpacity,
              coverFadeEnabled: tenant.settings.coverFadeEnabled,
              coverFadeColor: tenant.settings.coverFadeColor,
              heroTextTone: tenant.settings.heroTextTone,
              heroTrustTone: tenant.settings.heroTrustTone,
            }}
            logoScale={logoScale}
            logoOffsetX={logoOffsetX}
            logoOffsetY={logoOffsetY}
          />
        )}

      {/* Progress Steps */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-neutral-700 shadow-sm transition-colors">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            {(() => {
              let stepNum = 1;
              const indicators: React.ReactNode[] = [];

              if (branches.length > 1) {
                indicators.push(
                  <StepIndicator key="branch" number={stepNum} label={terms.branch} active={step === 'branch'} completed={!!selectedBranch} />,
                  <div key="branch-sep" className={cn('w-6 sm:w-12 h-0.5 sm:h-1 rounded-full transition-all', selectedBranch ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-neutral-700')} />,
                );
                stepNum++;
              }

              if (isEmployeeFirst) {
                indicators.push(
                  <StepIndicator key="employee" number={stepNum} label={terms.professional} active={step === 'employee'} completed={!!selectedEmployee} />,
                  <div key="employee-sep" className={cn('w-6 sm:w-12 h-0.5 sm:h-1 rounded-full transition-all', selectedEmployee ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-neutral-700')} />,
                );
                stepNum++;
              }

              if (isSpecialtyFirst) {
                indicators.push(
                  <StepIndicator key="specialty" number={stepNum} label="Area" active={step === 'specialty'} completed={!!selectedSpecialty} />,
                  <div key="specialty-sep" className={cn('w-6 sm:w-12 h-0.5 sm:h-1 rounded-full transition-all', selectedSpecialty ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-neutral-700')} />,
                );
                stepNum++;
              }

              indicators.push(
                <StepIndicator key="service" number={stepNum} label={terms.service} active={step === 'services'} completed={!!selectedService} />,
                <div key="service-sep" className={cn('w-6 sm:w-12 h-0.5 sm:h-1 rounded-full transition-all', selectedService ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-neutral-700')} />,
              );
              stepNum++;

              indicators.push(
                <StepIndicator key="datetime" number={stepNum} label={isDailyMode ? 'Fechas' : 'Fecha y Hora'} active={step === 'datetime'} completed={isDailyMode ? !!(checkInDate && checkOutDate) : !!selectedTime} />,
                <div key="datetime-sep" className={cn('w-6 sm:w-12 h-0.5 sm:h-1 rounded-full transition-all', (isDailyMode ? !!(checkInDate && checkOutDate) : !!selectedTime) ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-neutral-700')} />,
              );
              stepNum++;

              indicators.push(
                <StepIndicator key="confirm" number={stepNum} label="Confirmar" active={step === 'details' || step === 'confirmation'} completed={step === 'confirmation'} />,
              );

              return indicators;
            })()}
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
                {`Seleccioná tu ${terms.branch.toLowerCase()}`}
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
              {`Tocá una ${terms.branch.toLowerCase()} para continuar`}
            </p>
          </div>
        )}

        {/* Step: Select Specialty (specialty_first only) */}
        {!loadingBranches && step === 'specialty' && isSpecialtyFirst && (
          <div className="max-w-4xl mx-auto px-4 animate-fade-in">
            {selectedBranch && branches.length > 1 && (
              <Button
                variant="ghost"
                onClick={() => setStep('branch')}
                className="mb-4 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {`Cambiar ${terms.branch.toLowerCase()}`}
              </Button>
            )}

            <div className="text-center mb-8 md:mb-10">
              <div className="inline-flex items-center gap-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                Especialidades
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-slate-900 dark:text-white">
                {`¿Qué área necesitás?`}
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                {`Elegí el área que buscás y te mostramos las opciones disponibles`}
              </p>
            </div>

            <div className={cn(
              'grid gap-4 md:gap-5',
              (tenant.specialties?.length || 0) <= 2 ? 'sm:grid-cols-2 max-w-2xl mx-auto' :
              (tenant.specialties?.length || 0) <= 4 ? 'sm:grid-cols-2 lg:grid-cols-2 max-w-3xl mx-auto' :
              'sm:grid-cols-2 lg:grid-cols-3'
            )}>
              {tenant.specialties?.map((specialty, idx) => {
                const serviceCount = specialty._count?.services ?? tenant.services.filter((s: Service) => s.specialtyId === specialty.id).length;
                const professionalCount = specialty._count?.employeeSpecialties || 0;
                const colorPalette = [
                  { icon: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400', border: 'hover:border-violet-400 dark:hover:border-violet-500', accent: 'group-hover:bg-violet-500' },
                  { icon: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400', border: 'hover:border-blue-400 dark:hover:border-blue-500', accent: 'group-hover:bg-blue-500' },
                  { icon: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400', border: 'hover:border-emerald-400 dark:hover:border-emerald-500', accent: 'group-hover:bg-emerald-500' },
                  { icon: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400', border: 'hover:border-amber-400 dark:hover:border-amber-500', accent: 'group-hover:bg-amber-500' },
                  { icon: 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400', border: 'hover:border-teal-400 dark:hover:border-teal-500', accent: 'group-hover:bg-teal-500' },
                  { icon: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400', border: 'hover:border-rose-400 dark:hover:border-rose-500', accent: 'group-hover:bg-rose-500' },
                ];
                const color = colorPalette[idx % colorPalette.length];

                return (
                  <Card
                    key={specialty.id}
                    className={cn(
                      'group cursor-pointer border border-slate-200 dark:border-neutral-700 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden',
                      color.border,
                    )}
                    onClick={() => handleSpecialtySelect(specialty)}
                  >
                    <CardContent className="p-0">
                      <div className="p-5 md:p-6">
                        {/* Icon + Name row */}
                        <div className="flex items-start gap-4 mb-3">
                          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all', color.icon)}>
                            {specialty.icon ? (
                              <span className="text-xl">{specialty.icon}</span>
                            ) : (
                              <Layers className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                              {specialty.name}
                            </h3>
                          </div>
                        </div>

                        {/* Description */}
                        {specialty.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                            {specialty.description}
                          </p>
                        )}

                        {/* Stats + CTA */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-neutral-700/60">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <ClipboardList className="h-3.5 w-3.5" />
                              {serviceCount} {serviceCount === 1 ? terms.service.toLowerCase() : terms.services.toLowerCase()}
                            </span>
                            {professionalCount > 0 && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                {professionalCount}
                              </span>
                            )}
                          </div>
                          <div className={cn('w-8 h-8 rounded-full bg-slate-100 dark:bg-neutral-700 flex items-center justify-center transition-all', color.accent)}>
                            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6 md:mt-8">
              <Sparkles className="h-3 w-3 inline mr-1" />
              {`Tocá un área para ver ${terms.services.toLowerCase()}`}
            </p>
          </div>
        )}

        {/* Step: Select Employee (employee_first only) */}
        {!loadingBranches && step === 'employee' && pageLayout === 'employee_first' && (
          <div className="max-w-4xl mx-auto px-4 animate-fade-in">
            {selectedBranch && branches.length > 1 && (
              <Button
                variant="ghost"
                onClick={() => setStep('branch')}
                className="mb-4 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {`Cambiar ${terms.branch.toLowerCase()}`}
              </Button>
            )}

            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-slate-900 dark:text-white">
                {`Elegí tu ${terms.professional.toLowerCase()}`}
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {`Seleccioná el ${terms.professional.toLowerCase()} con quien querés atenderte`}
              </p>
            </div>

            {loadingEmployees ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                <p className="text-muted-foreground">Cargando...</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {employees.map((employee) => (
                  <Card
                    key={employee.id}
                    className="group cursor-pointer border border-slate-200 dark:border-neutral-700 hover:border-teal-400 dark:hover:border-teal-500 shadow-sm hover:shadow-md transition-all"
                    onClick={() => handleEmployeeFirstSelect(employee)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {employee.image ? (
                          <img
                            src={employee.image}
                            alt={employee.name}
                            className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-teal-500 flex items-center justify-center text-white font-semibold text-xl flex-shrink-0">
                            {employee.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-0.5 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                            {employee.name}
                          </h3>
                          {employee.credentials && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">{employee.credentials}</p>
                          )}
                          {employee.specialty && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{employee.specialty}</p>
                          )}
                          {employee.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{employee.bio}</p>
                          )}
                        </div>
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 dark:bg-neutral-700 flex items-center justify-center group-hover:bg-teal-500 transition-all">
                          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <p className="text-center text-xs text-muted-foreground mt-6 md:mt-8">
              <Sparkles className="h-3 w-3 inline mr-1" />
              {`Tocá un ${terms.professional.toLowerCase()} para ver sus ${terms.services.toLowerCase()}`}
            </p>
          </div>
        )}

        {/* Step: Select Service */}
        {!loadingBranches && step === 'services' && (
          <div className="max-w-5xl mx-auto px-4 animate-fade-in">
            {/* Back button for branch/specialty/employee change */}
            {isEmployeeFirst && selectedEmployee && (
              <Button
                variant="ghost"
                onClick={() => { setStep('employee'); setSelectedEmployee(null); setEmployeeFilteredServiceIds(null); }}
                className="mb-4 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {`Cambiar ${terms.professional.toLowerCase()}`}
              </Button>
            )}
            {isSpecialtyFirst && selectedSpecialty && (
              <Button
                variant="ghost"
                onClick={() => { setStep('specialty'); setSelectedSpecialty(null); }}
                className="mb-4 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Cambiar area
              </Button>
            )}
            {!isSpecialtyFirst && !isEmployeeFirst && selectedBranch && branches.length > 1 && (
              <Button
                variant="ghost"
                onClick={() => setStep('branch')}
                className="mb-4 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {`Cambiar ${terms.branch.toLowerCase()}`}
              </Button>
            )}

            {/* Selected employee pill (employee_first) */}
            {isEmployeeFirst && selectedEmployee && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 mr-2 rounded-full bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800">
                <User className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                <span className="text-sm font-medium text-violet-700 dark:text-violet-300">{selectedEmployee.name}</span>
              </div>
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
                {selectedSpecialty ? `${terms.services} de ${selectedSpecialty.name}` : isEmployeeFirst && selectedEmployee ? `${terms.services} de ${selectedEmployee.name}` : `Elegí tu ${terms.service.toLowerCase()}`}
              </h2>
              <p className="text-sm text-muted-foreground">{`Seleccioná el ${terms.service.toLowerCase()} que deseas reservar`}</p>
            </div>

            {/* Services Container with elegant frame */}
            <div className="relative md:p-4 lg:p-6">
              {/* Decorative background for desktop */}
              <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-neutral-800/50 dark:via-neutral-900/50 dark:to-neutral-800/50 rounded-3xl border border-slate-200/60 dark:border-neutral-700/60" />

              {/* Services Grid */}
              <div className="relative grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {normalServices.map((service, index) => (
                  <Fragment key={service.id}>
                    <PublicServiceCard
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
                    {/* Inject sorteo card after 3rd service */}
                    {index === 2 && activeSorteos.length > 0 && (
                      <PublicSorteoCard sorteo={activeSorteos[0]} tenantSlug={slug} instagramHandle={tenant.instagram} />
                    )}
                  </Fragment>
                ))}
                {/* If fewer than 3 services, show sorteo at end */}
                {normalServices.length < 3 && activeSorteos.length > 0 && (
                  <PublicSorteoCard sorteo={activeSorteos[0]} tenantSlug={slug} instagramHandle={tenant.instagram} />
                )}
              </div>
            </div>

            {/* Packs Section */}
            {packServices.length > 0 && (
              <div className="mt-8 md:mt-12">
                <div className="text-center mb-6">
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                    <Package className="h-5 w-5 text-amber-500" />
                    Packs y Promociones
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">Estadías con fechas fijas a precio especial</p>
                </div>
                <div className="relative md:p-4 lg:p-6">
                  <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/50 dark:from-amber-900/10 dark:via-neutral-900/50 dark:to-amber-900/10 rounded-3xl border border-amber-200/60 dark:border-amber-800/30" />
                  <div className="relative grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {packServices.map((pack, index) => {
                      const checkIn = pack.packCheckIn ? new Date(pack.packCheckIn) : null;
                      const checkOut = pack.packCheckOut ? new Date(pack.packCheckOut) : null;
                      return (
                        <div key={pack.id} className="group animate-slide-up" style={{ animationDelay: `${index * 0.08}s` }}>
                          <Card
                            className="overflow-hidden border border-amber-200 dark:border-amber-800/40 shadow-sm hover:shadow-lg hover:border-amber-400 dark:hover:border-amber-600 transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-neutral-800 rounded-2xl cursor-pointer"
                            onClick={() => {
                              setServiceForDetail(pack);
                              setSelectedVariations({});
                              setShowServiceDetail(true);
                            }}
                          >
                            {pack.image && (
                              <div className="relative h-36 overflow-hidden">
                                <Image src={pack.image} alt={pack.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                              </div>
                            )}
                            <CardContent className="p-4">
                              <Badge className="mb-2 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                                <Package className="h-3 w-3 mr-1" />
                                Pack
                              </Badge>
                              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1 line-clamp-2">{pack.name}</h4>
                              {checkIn && checkOut && (
                                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
                                  <CalendarDays className="h-3.5 w-3.5" />
                                  {format(checkIn, "d MMM", { locale: es })} → {format(checkOut, "d MMM", { locale: es })}
                                  {pack.packNights && <span className="text-xs">({pack.packNights} noches)</span>}
                                </p>
                              )}
                              {pack.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{pack.description}</p>}
                              {tenant.settings.showPrices && pack.price !== null && (
                                <div className="flex items-center gap-2 mb-3">
                                  {pack.packOriginalPrice && (
                                    <span className="text-sm line-through text-slate-400 dark:text-neutral-500">{formatPrice(pack.packOriginalPrice)}</span>
                                  )}
                                  <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{formatPrice(pack.price)}</span>
                                </div>
                              )}
                              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl">
                                {terms.bookAction} pack
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Helper text */}
            <p className="text-center text-xs text-muted-foreground mt-6 md:mt-8">
              <Sparkles className="h-3 w-3 inline mr-1" />
{`Tocá un ${terms.service.toLowerCase()} para continuar con la ${terms.booking.toLowerCase()}`}
            </p>
          </div>
        )}

        {/* Step 2: Select Date and Time */}
        {step === 'datetime' && selectedService && (
          <div className="max-w-5xl mx-auto animate-fade-in">
            <button
              onClick={() => { setStep('services'); setSelectedBookingMode(null); }}
              className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-white hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-300 dark:border-neutral-600 rounded-lg px-3 py-1.5 hover:border-slate-400 dark:hover:border-neutral-500 bg-white/80 dark:bg-neutral-800/80"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {`Cambiar ${terms.service.toLowerCase()}`}
            </button>

            {/* Selected Service Card - Mobile Optimized */}
            <Card className="mb-6 md:mb-8 overflow-hidden border-0 shadow-md bg-gradient-to-r from-slate-900 to-slate-800 dark:from-neutral-800 dark:to-neutral-900">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {/* Service Image or Initial */}
                  <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white/10">
                    {selectedService.image ? (
                      <Image src={selectedService.image} alt={selectedService.name} fill sizes="64px" className="object-cover" />
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
                              {selectedService.promoPrice != null ? (
                                <><span className="line-through opacity-70 mr-1">{formatPrice(selectedService.price)}</span>{formatPrice(selectedService.promoPrice)}/noche</>
                              ) : `${formatPrice(selectedService.price)}/noche`}
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
                              {selectedService.promoPrice != null ? (
                                <><span className="line-through opacity-70 mr-1">{formatPrice(selectedService.price)}</span>{formatPrice(selectedService.promoPrice)}</>
                              ) : formatPrice(selectedService.price)}
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mode Selector: Only show when service supports both modes AND no __mode__ variation (equal prices) */}
            {selectedService.mode === 'ambos' && !hasModeVariation(selectedService) && (
              <div className="mb-6 md:mb-8">
                <p className="text-sm font-medium text-slate-700 dark:text-neutral-300 mb-3 text-center">
                  ¿Cómo preferís tu sesión?
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                  <button
                    onClick={() => setSelectedBookingMode('presencial')}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                      selectedBookingMode === 'presencial'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-400'
                        : 'border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-slate-300 dark:hover:border-neutral-600'
                    )}
                  >
                    <div className={cn(
                      'h-10 w-10 rounded-lg flex items-center justify-center',
                      selectedBookingMode === 'presencial'
                        ? 'bg-indigo-100 dark:bg-indigo-900/50'
                        : 'bg-slate-100 dark:bg-neutral-700'
                    )}>
                      <MapPin className={cn(
                        'h-5 w-5',
                        selectedBookingMode === 'presencial'
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-500 dark:text-neutral-400'
                      )} />
                    </div>
                    <div className="text-center">
                      <p className={cn(
                        'font-medium text-sm',
                        selectedBookingMode === 'presencial'
                          ? 'text-indigo-700 dark:text-indigo-300'
                          : 'text-slate-700 dark:text-neutral-300'
                      )}>Presencial</p>
                      <p className="text-xs text-muted-foreground">Asistir al local</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedBookingMode('online')}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                      selectedBookingMode === 'online'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-400'
                        : 'border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-slate-300 dark:hover:border-neutral-600'
                    )}
                  >
                    <div className={cn(
                      'h-10 w-10 rounded-lg flex items-center justify-center',
                      selectedBookingMode === 'online'
                        ? 'bg-indigo-100 dark:bg-indigo-900/50'
                        : 'bg-slate-100 dark:bg-neutral-700'
                    )}>
                      <Video className={cn(
                        'h-5 w-5',
                        selectedBookingMode === 'online'
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-500 dark:text-neutral-400'
                      )} />
                    </div>
                    <div className="text-center">
                      <p className={cn(
                        'font-medium text-sm',
                        selectedBookingMode === 'online'
                          ? 'text-indigo-700 dark:text-indigo-300'
                          : 'text-slate-700 dark:text-neutral-300'
                      )}>Online</p>
                      <p className="text-xs text-muted-foreground">Videollamada</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Show calendar only when booking mode is selected (or service is not 'ambos', or mode was chosen via __mode__ variation) */}
            {(selectedService.mode !== 'ambos' || selectedBookingMode !== null || hasModeVariation(selectedService)) && (
            <>
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
                      checkInTime={selectedService?.checkInTime || tenant.settings.dailyCheckInTime || '14:00'}
                      checkOutTime={selectedService?.checkOutTime || tenant.settings.dailyCheckOutTime || '10:00'}
                    />
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Hourly Booking: Calendar + Time Slots */
              <div ref={calendarSectionRef} className="scroll-mt-24 grid md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
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
                      unavailableDates={availabilityMap}
                      onMonthChange={handleMonthChange}
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
                            nextAvailableDate={nextAvailableDate}
                            onJumpToDate={handleJumpToDate}
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
            </>
            )}
          </div>
        )}

        {/* Step 3: Customer Details */}
        {step === 'details' && selectedService && (selectedService.isPack ? (checkInDate && checkOutDate) : (isDailyMode ? (checkInDate && checkOutDate) : (selectedDate && selectedTime))) && (
          <div ref={formSectionRef} className="scroll-mt-24 max-w-xl mx-auto animate-fade-in">
            <button
              onClick={() => selectedService?.isPack ? setStep('services') : setStep('datetime')}
              className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-white hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-300 dark:border-neutral-600 rounded-lg px-3 py-1.5 hover:border-slate-400 dark:hover:border-neutral-500 bg-white/80 dark:bg-neutral-800/80"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {selectedService?.isPack ? `Cambiar ${terms.service.toLowerCase()}` : (isDailyMode ? 'Cambiar fechas' : 'Cambiar horario')}
            </button>

            {/* Booking Summary */}
            <Card className="mb-6 border border-slate-200 dark:border-neutral-700 shadow-sm bg-white dark:bg-neutral-800">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-5 flex items-center gap-2 text-slate-900 dark:text-white">
                  <CheckCircle2 className="h-5 w-5 text-slate-600 dark:text-neutral-400" />
                  {`Resumen de tu ${terms.booking.toLowerCase()}`}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                      {terms.service}
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
                          {format(checkInDate, "EEE d MMM", { locale: es })} ({selectedService?.checkInTime || tenant.settings.dailyCheckInTime || '14:00'} hs)
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                          Check-out
                        </span>
                        <span className="font-medium capitalize text-slate-900 dark:text-white">
                          {format(checkOutDate, "EEE d MMM", { locale: es })} ({selectedService?.checkOutTime || tenant.settings.dailyCheckOutTime || '10:00'} hs)
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
                        selectedService.isPack ? (
                          <>
                            {/* Pack pricing: original tachado + precio pack */}
                            {selectedService.packOriginalPrice && (
                              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                                <span className="text-muted-foreground flex items-center gap-2">
                                  <CreditCard className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                                  Precio sin descuento
                                </span>
                                <span className="font-medium text-slate-400 line-through">
                                  {formatPrice(selectedService.packOriginalPrice)}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center justify-between p-4 rounded-lg bg-amber-500 text-white">
                              <span className="font-semibold">Precio del pack</span>
                              <span className="text-xl font-bold">{formatPrice(selectedService.price)}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Normal daily pricing */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                              <span className="text-muted-foreground flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                                Precio por noche
                              </span>
                              <span className="font-medium text-slate-900 dark:text-white">
                                {selectedService.promoPrice != null ? (
                                  <PriceDisplay price={selectedService.price} promoPrice={selectedService.promoPrice} promoLabel={selectedService.promoLabel} />
                                ) : formatPrice(selectedService.price)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-neutral-900">
                              <span className="font-semibold">Total</span>
                              <span className="text-xl font-bold">
                                {(() => {
                                  const nights = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (24 * 3600000));
                                  const pricePerNight = selectedService.promoPrice ?? selectedService.price ?? 0;
                                  return formatPrice(pricePerNight * nights);
                                })()}
                              </span>
                            </div>
                          </>
                        )
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
                            {terms.professional}
                          </span>
                          <span className="font-medium text-slate-900 dark:text-white">{selectedEmployee.name}</span>
                        </div>
                      )}
                      {selectedBookingMode && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                          <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                            {selectedBookingMode === 'online' ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                            Modalidad
                          </span>
                          <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border-0">
                            {selectedBookingMode === 'online' ? 'Online' : 'Presencial'}
                          </Badge>
                        </div>
                      )}
                      {selectedService.price !== null && (() => {
                        const { price: effectivePrice } = getEffectivePriceAndDuration(selectedService, bookingVariations);
                        const basePrice = effectivePrice ?? selectedService.price ?? 0;
                        const finalPrice = selectedService.promoPrice ?? basePrice;
                        return (
                          <>
                            {selectedService.promoPrice != null && (
                              <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                                <span className="text-red-600 dark:text-red-400 flex items-center gap-2 text-sm font-medium">
                                  {selectedService.promoLabel || 'Oferta'}
                                </span>
                                <span className="text-sm line-through text-slate-400">{formatPrice(basePrice)}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-neutral-900">
                              <span className="font-semibold">Total a pagar</span>
                              <span className="text-xl font-bold">
                                {formatPrice(finalPrice)}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Employee Selection (Optional) — hidden when employee_first since already chosen */}
            {employees.length > 0 && !(isEmployeeFirst && selectedEmployee) && (
              <Card className="mb-6 border border-slate-200 dark:border-neutral-700 shadow-sm bg-white dark:bg-neutral-800">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-slate-900 dark:text-white">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-neutral-700 flex items-center justify-center">
                      <Users className="h-4 w-4 text-slate-600 dark:text-neutral-300" />
                    </div>
                    {`¿Querés elegir un ${terms.professional.toLowerCase()}?`}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {`Opcional. Si no seleccionás, cualquier ${terms.professional.toLowerCase()} disponible te atenderá.`}
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
                          <p className="font-medium text-slate-900 dark:text-white">{`Cualquier ${terms.professional.toLowerCase()}`}</p>
                          <p className="text-sm text-muted-foreground">El primero disponible</p>
                        </div>
                        {selectedEmployee === null && (
                          <div className="w-6 h-6 rounded-full bg-slate-800 dark:bg-white flex items-center justify-center">
                            <Check className="h-4 w-4 text-white dark:text-neutral-900" />
                          </div>
                        )}
                      </button>

                      {/* Individual employees */}
                      {employees.map((employee) => {
                        const emp = employee as EmployeePublic & { customPrice?: number | null; customDuration?: number | null };
                        return (
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
                            {employee.credentials && (
                              <p className="text-xs text-amber-600 dark:text-amber-400">{employee.credentials}</p>
                            )}
                            {employee.specialty && !employee.credentials && (
                              <p className="text-sm text-muted-foreground">{employee.specialty}</p>
                            )}
                            {emp.customPrice != null && tenant.settings.showPrices && (
                              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">{formatPrice(emp.customPrice)}</p>
                            )}
                          </div>
                          {selectedEmployee?.id === employee.id && (
                            <div className="w-6 h-6 rounded-full bg-slate-800 dark:bg-white flex items-center justify-center">
                              <Check className="h-4 w-4 text-white dark:text-neutral-900" />
                            </div>
                          )}
                        </button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Intake Form (if service has one) */}
            {intakeFormFields.length > 0 && (
              <Card className="mb-6 border border-slate-200 dark:border-neutral-700 shadow-sm bg-white dark:bg-neutral-800">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                    <ClipboardList className="h-5 w-5 text-slate-600 dark:text-neutral-400" />
                    Información adicional
                  </h3>
                  <div className="space-y-4">
                    {intakeFormFields.map((field) => (
                      <div key={field.id} className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-neutral-300">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea
                            value={String(intakeFormData[field.id] || '')}
                            onChange={(e) => setIntakeFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                            placeholder={field.placeholder || ''}
                            rows={3}
                            className="flex w-full rounded-lg border border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-neutral-500 resize-none"
                          />
                        ) : field.type === 'select' ? (
                          <select
                            value={String(intakeFormData[field.id] || '')}
                            onChange={(e) => setIntakeFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                            className="flex h-10 w-full rounded-lg border border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-neutral-500"
                          >
                            <option value="">{field.placeholder || 'Seleccionar...'}</option>
                            {(field.options || []).map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : field.type === 'radio' ? (
                          <div className="flex flex-wrap gap-2">
                            {(field.options || []).map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setIntakeFormData(prev => ({ ...prev, [field.id]: opt }))}
                                className={cn(
                                  'px-3 py-1.5 rounded-lg border text-sm transition-all',
                                  intakeFormData[field.id] === opt
                                    ? 'border-slate-800 dark:border-white bg-slate-800 dark:bg-white text-white dark:text-neutral-900'
                                    : 'border-slate-300 dark:border-neutral-600 hover:border-slate-400 dark:hover:border-neutral-500 text-slate-700 dark:text-neutral-300'
                                )}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        ) : field.type === 'checkbox' ? (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(intakeFormData[field.id])}
                              onChange={(e) => setIntakeFormData(prev => ({ ...prev, [field.id]: e.target.checked }))}
                              className="h-4 w-4 rounded border-slate-300 dark:border-neutral-600 text-slate-800 focus:ring-slate-400"
                            />
                            <span className="text-sm text-slate-600 dark:text-neutral-400">{field.placeholder || field.label}</span>
                          </label>
                        ) : (
                          <input
                            type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                            value={String(intakeFormData[field.id] || '')}
                            onChange={(e) => setIntakeFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                            placeholder={field.placeholder || ''}
                            className="flex h-10 w-full rounded-lg border border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-neutral-500"
                          />
                        )}
                        {field.helpText && (
                          <p className="text-xs text-muted-foreground">{field.helpText}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Customer Form with Real-time Validation */}
            <div ref={customerFormRef} className="scroll-mt-24">
              {(() => {
                const activeStyle = (tenant.settings.cardStyle as HeroStyleName) || (tenant.settings.heroStyle as HeroStyleName) || 'classic';
                const styleCfg = HERO_STYLES[activeStyle] || HERO_STYLES.classic;
                // Derive input radius from card radius (slightly smaller for visual hierarchy)
                const INPUT_RADIUS_MAP: Record<string, string> = {
                  'rounded-2xl': 'rounded-xl',
                  'rounded-xl': 'rounded-lg',
                  'rounded-lg': 'rounded-lg',
                  'rounded-md': 'rounded-md',
                  'rounded-sm': 'rounded-sm',
                };
                return (
                  <BookingCustomerForm
                    requireEmail={tenant.settings.requireEmail}
                    onSubmit={handleFormSubmit}
                    isSubmitting={isSubmitting}
                    externalError={bookingError}
                    onClearError={resetBooking}
                    styleProps={{
                      ctaBtnClasses: styleCfg.modalCtaBtnClasses,
                      cardRadius: styleCfg.cardRadius,
                      inputRadius: INPUT_RADIUS_MAP[styleCfg.cardRadius] || 'rounded-xl',
                      iconAccentClasses: `bg-[hsl(var(--tenant-primary-50))] dark:bg-[hsl(var(--tenant-primary-900)_/_0.3)]`,
                    }}
                  />
                );
              })()}
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
                  <span className="text-sm font-medium">{`Falta un paso para confirmar tu ${isDailyMode ? terms.booking.toLowerCase() : terms.appointment.toLowerCase()}`}</span>
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
                      <p className="text-sm text-emerald-700 dark:text-emerald-400">{depositLabel} ({tenant.settings.depositPercentage || 30}%)</p>
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
              ¡{terms.booking} Confirmada!
            </h2>
            <p className="text-muted-foreground text-base mb-4">
              {isDailyMode ? 'Tu estadía ha sido registrada exitosamente.' : `Tu ${terms.appointment.toLowerCase()} ha sido registrado exitosamente.`}
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

            {/* Video Call Link */}
            {((bookingResult as BookingResponse)?.videoJoinUrl || pendingBooking?.videoJoinUrl) && (
              <div className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Video className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-indigo-800 dark:text-indigo-300">Sesión online</p>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-0.5">
                      También recibirás el link por email y WhatsApp
                    </p>
                  </div>
                </div>
                <a
                  href={(bookingResult as BookingResponse)?.videoJoinUrl || pendingBooking?.videoJoinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Video className="h-4 w-4" />
                  Entrar a la sesión
                </a>
              </div>
            )}

            {/* Booking Details Card - only show if we have details (not from MP redirect) */}
            {selectedService && (
              <Card className="text-left mb-8 border border-slate-200 dark:border-neutral-700 shadow-sm bg-white dark:bg-neutral-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-200 dark:border-neutral-700">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-neutral-700 flex items-center justify-center text-slate-600 dark:text-neutral-300 font-semibold">
                      {selectedService.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{terms.booking} en</p>
                      <p className="font-semibold text-lg text-slate-900 dark:text-white">{tenant.name}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                        {terms.service}
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
                            {format(checkInDate, "EEE d MMM", { locale: es })} ({selectedService?.checkInTime || tenant.settings.dailyCheckInTime || '14:00'} hs)
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-neutral-700/50">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
                            Check-out
                          </span>
                          <span className="font-medium capitalize text-slate-900 dark:text-white">
                            {format(checkOutDate, "EEE d MMM", { locale: es })} ({selectedService?.checkOutTime || tenant.settings.dailyCheckOutTime || '10:00'} hs)
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
                              {terms.professional}
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
                      <p className="text-sm text-muted-foreground">{`Tu pago fue procesado y el ${terms.appointment.toLowerCase()} quedó confirmado`}</p>
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
                {isDailyMode ? `Hacer otra ${terms.booking.toLowerCase()}` : `${terms.bookAction} otro ${terms.appointment.toLowerCase()}`}
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Tenant-level YouTube + Amenities (for single-property pages) */}
      {!isEmbed && (tenant.settings.youtubeVideoUrl || (tenant.settings.amenities && tenant.settings.amenities.length > 0)) && (
        <section className="py-8 md:py-12 px-4 relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* YouTube Video */}
            {tenant.settings.youtubeVideoUrl && (() => {
              const videoId = extractYoutubeId(tenant.settings.youtubeVideoUrl);
              if (!videoId) return null;
              return (
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-4 text-center">Conocé el lugar</h2>
                  <div className="relative w-full rounded-2xl overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3&color=white`}
                      title="Video del negocio"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              );
            })()}

            {/* Amenities Showcase */}
            {tenant.settings.amenities && tenant.settings.amenities.length > 0 && tenant.settings.rubro && (() => {
              const amenities = getSelectedAmenities(tenant.settings.rubro, tenant.settings.amenities);
              if (amenities.length === 0) return null;
              const accentColor = tenant.settings.primaryColor || '#3F8697';
              return (
                <div className="rounded-2xl md:rounded-3xl overflow-hidden border border-slate-200/80 dark:border-neutral-700/60 shadow-md">
                  {/* Header bar */}
                  <div className="px-6 py-4 md:py-5 flex flex-col items-center gap-1.5 text-center" style={{ background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}08)` }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${accentColor}20` }}>
                      <Sparkles className="h-4.5 w-4.5" style={{ color: accentColor }} />
                    </div>
                    <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-tight">{getRubroUIConfig(tenant.settings.rubro || '').amenitiesLabel || 'Comodidades'}</h2>
                  </div>
                  {/* Amenities grid */}
                  <div className="px-4 md:px-6 py-5 md:py-6 bg-white/80 dark:bg-neutral-900/60 backdrop-blur-sm">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 md:gap-3">
                      {amenities.map(amenity => {
                        const IconComponent = AMENITY_ICON_MAP[amenity.icon];
                        return (
                          <div key={amenity.id} className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-neutral-800/70 border border-slate-100 dark:border-neutral-700/50 hover:border-slate-200 dark:hover:border-neutral-600 transition-colors group">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110" style={{ backgroundColor: `${accentColor}12` }}>
                              {IconComponent
                                ? <IconComponent className="h-4 w-4" style={{ color: accentColor }} />
                                : <Sparkles className="h-4 w-4" style={{ color: accentColor }} />}
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-neutral-200 leading-tight">{amenity.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
      )}

      {/* Reviews Section (hidden in embed) */}
      {!isEmbed && <PublicReviewsSection slug={slug} />}

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
            href="https://turnolink.com.ar/register"
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
              <a href="/register" className="inline-flex items-center gap-2 text-xs font-medium text-[#4DA4B8] hover:text-white transition-colors">
                Creá tu cuenta gratis en TurnoLink →
              </a>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Powered by</span>
                <a href="/register" className="hover:opacity-80 transition-opacity">
                  <img src="/oscuro2.png" alt="TurnoLink" className="h-7 w-auto" />
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
            onClick={closeServiceDetail}
          >
            {/* Backdrop — stays fixed, fades as modal drags down */}
            <div
              className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${svcEntryDone ? '' : 'animate-fade-in'}`}
              style={svcSwipeDragY > 0 ? { opacity: Math.max(1 - svcSwipeDragY / 300, 0), transition: svcSwipeAnimating ? 'opacity 0.3s ease-out' : 'none' } : undefined}
            />

            {/* Modal Content */}
            <div
              ref={serviceModalRef}
              className={`relative w-full md:max-w-lg bg-white dark:bg-neutral-900 rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden ${svcEntryDone ? '' : 'animate-slide-up'}`}
              style={svcSwipeDragY > 0 ? { transform: `translateY(${svcSwipeDragY}px)`, transition: svcSwipeAnimating ? 'transform 0.25s ease-out' : 'none' } : undefined}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle for mobile */}
              <div className="md:hidden flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-neutral-600" />
              </div>

              {/* Close button */}
              <button
                onClick={closeServiceDetail}
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

                {/* Service YouTube Video */}
                {serviceForDetail.youtubeVideoUrl && (() => {
                  const videoId = extractYoutubeId(serviceForDetail.youtubeVideoUrl);
                  if (!videoId) return null;
                  return (
                    <div className="mb-5">
                      <div className="relative w-full rounded-xl overflow-hidden shadow-sm" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          className="absolute inset-0 w-full h-full"
                          src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3&color=white`}
                          title="Video del servicio"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* Service Amenities */}
                {serviceForDetail.amenities && serviceForDetail.amenities.length > 0 && tenant.settings.rubro && (() => {
                  const amenities = getSelectedAmenities(tenant.settings.rubro, serviceForDetail.amenities);
                  if (amenities.length === 0) return null;
                  return (
                    <div className="mb-5">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
                          <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                        </div>
                        Comodidades
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {amenities.map(amenity => {
                          const IconComponent = AMENITY_ICON_MAP[amenity.icon];
                          return (
                            <div key={amenity.id} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-teal-50/50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-800/30">
                              {IconComponent
                                ? <IconComponent className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                                : <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />}
                              <span className="text-sm text-slate-700 dark:text-neutral-300">{amenity.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Variation Selector */}
                {(() => {
                  const validGroups = serviceForDetail.variations
                    ?.filter(g => g.label?.trim() && g.options?.some(o => o.name?.trim()))
                    .map(g => ({ ...g, options: g.options.filter(o => o.name?.trim()) })) || [];
                  return validGroups.length > 0 && (
                  <div className="mb-5 space-y-4">
                    {validGroups.map(group => (
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
                  );
                })()}

                {/* Quick info summary */}
                {(() => {
                  const effective = getEffectivePriceAndDuration(serviceForDetail, selectedVariations);
                  const priceColors = {
                    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                    icon: 'text-emerald-600 dark:text-emerald-400',
                    label: 'text-emerald-600 dark:text-emerald-500',
                    value: 'text-emerald-700 dark:text-emerald-400',
                  };

                  if (serviceForDetail.isPack) {
                    const packCheckIn = serviceForDetail.packCheckIn ? new Date(serviceForDetail.packCheckIn) : null;
                    const packCheckOut = serviceForDetail.packCheckOut ? new Date(serviceForDetail.packCheckOut) : null;
                    const nights = packCheckIn && packCheckOut ? Math.round((packCheckOut.getTime() - packCheckIn.getTime()) / (24 * 3600000)) : null;
                    return (
                      <div className="space-y-3 mb-6">
                        <div className="grid grid-cols-2 gap-3">
                          {packCheckIn && (
                            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-center">
                              <CalendarDays className="h-5 w-5 mx-auto mb-1 text-amber-600 dark:text-amber-400" />
                              <p className="text-xs text-amber-600 dark:text-amber-500">Check-in</p>
                              <p className="font-semibold text-slate-900 dark:text-white text-sm">{format(packCheckIn, "d 'de' MMM", { locale: es })}</p>
                            </div>
                          )}
                          {packCheckOut && (
                            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-center">
                              <CalendarDays className="h-5 w-5 mx-auto mb-1 text-amber-600 dark:text-amber-400" />
                              <p className="text-xs text-amber-600 dark:text-amber-500">Check-out</p>
                              <p className="font-semibold text-slate-900 dark:text-white text-sm">{format(packCheckOut, "d 'de' MMM", { locale: es })}</p>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {nights && (
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/50 text-center">
                              <Moon className="h-5 w-5 mx-auto mb-1 text-slate-500 dark:text-neutral-400" />
                              <p className="text-xs text-slate-500 dark:text-neutral-500">Estadía</p>
                              <p className="font-semibold text-slate-900 dark:text-white">{nights} {nights === 1 ? 'noche' : 'noches'}</p>
                            </div>
                          )}
                          {tenant.settings.showPrices && (
                            <div className={`p-3 rounded-xl ${priceColors.bg} text-center`}>
                              <CreditCard className={`h-5 w-5 mx-auto mb-1 ${priceColors.icon}`} />
                              <p className={`text-xs ${priceColors.label}`}>Precio pack</p>
                              <p className={`font-bold ${priceColors.value}`}>
                                {serviceForDetail.packOriginalPrice ? (
                                  <span className="flex flex-col items-center">
                                    <span className="text-xs line-through text-slate-400 dark:text-neutral-500">{formatPrice(serviceForDetail.packOriginalPrice)}</span>
                                    <span>{formatPrice(serviceForDetail.price!)}</span>
                                  </span>
                                ) : formatPrice(serviceForDetail.price!)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

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
                          <p className={`font-bold ${priceColors.value}`}>
                            {serviceForDetail.promoPrice != null ? (
                              <span className="flex flex-col items-center">
                                <span className="text-xs line-through text-slate-400 dark:text-neutral-500">{formatPrice(effective.price)}</span>
                                <span>{formatPrice(serviceForDetail.promoPrice)}</span>
                              </span>
                            ) : formatPrice(effective.price)}
                          </p>
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
                      if (serviceForDetail.isPack) {
                        handlePackSelect(serviceForDetail);
                      } else {
                        setBookingVariations(selectedVariations);
                        handleServiceSelect(serviceForDetail, selectedVariations);
                      }
                    }}
                    disabled={!allRequiredVariationsSelected(serviceForDetail, selectedVariations)}
                    className={`w-full h-12 ${(HERO_STYLES[(tenant.settings.cardStyle as HeroStyleName) || (tenant.settings.heroStyle as HeroStyleName) || 'classic'] || HERO_STYLES.classic).modalCtaBtnClasses} font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {`${terms.bookAction} este ${serviceForDetail.isPack ? 'pack' : terms.service.toLowerCase()}`}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>

                  {/* Close button - Secondary */}
                  <Button
                    variant="outline"
                    onClick={closeServiceDetail}
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
          {service.isPack ? (
            <Badge className={durationBadgeCls}>
              <Moon className="h-3.5 w-3.5 mr-1.5" />
              {service.packNights ? `${service.packNights} noches` : 'Pack'}
            </Badge>
          ) : (
            <Badge className={durationBadgeCls}>
              <Timer className="h-3.5 w-3.5 mr-1.5" />
              {formatDuration(service.duration)}
            </Badge>
          )}
          {service.price !== null && showPrices && (
            <Badge className={`${priceBadgeCls} border-0 shadow-md text-base font-bold px-4 py-1.5`}>
              {service.promoPrice != null ? <PriceDisplay price={service.price} promoPrice={service.promoPrice} promoLabel={service.promoLabel} /> : formatPrice(service.price)}
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
              <Image src={url} alt="" fill sizes="100vw" className="object-cover blur-xl scale-110 opacity-60" draggable={false} />
              <Image src={url} alt={`${service.name} ${i + 1}`} fill sizes="100vw" className="object-contain" draggable={false} />
            </div>
          ) : (
            <div key={i} className="relative w-full h-full flex-shrink-0">
              <Image src={url} alt={`${service.name} ${i + 1}`} fill sizes="100vw" className="object-cover" draggable={false} />
            </div>
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
        {service.isPack ? (
          <Badge className="bg-white/95 dark:bg-neutral-900/95 text-slate-700 dark:text-neutral-200 border-0 shadow-md backdrop-blur-sm font-medium px-3 py-1">
            <Moon className="h-3.5 w-3.5 mr-1.5" />
            {service.packNights ? `${service.packNights} noches` : 'Pack'}
          </Badge>
        ) : (
          <Badge className="bg-white/95 dark:bg-neutral-900/95 text-slate-700 dark:text-neutral-200 border-0 shadow-md backdrop-blur-sm font-medium px-3 py-1">
            <Timer className="h-3.5 w-3.5 mr-1.5" />
            {formatDuration(service.duration)}
          </Badge>
        )}
        {service.price !== null && showPrices && (
          <Badge className={`${priceBadgeCls} border-0 shadow-md text-base font-bold px-4 py-1.5`}>
            {service.promoPrice != null ? <PriceDisplay price={service.price} promoPrice={service.promoPrice} promoLabel={service.promoLabel} /> : formatPrice(service.price)}
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
