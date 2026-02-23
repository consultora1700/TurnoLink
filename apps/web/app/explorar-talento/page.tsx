'use client';

import { useEffect, useState, useCallback, useRef, useMemo, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  publicTalentApi,
  PublicTalentProfile,
  PublicTalentProfileDetail,
  PaginatedResponse,
} from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Search,
  Users,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Clock,
  ArrowRight,
  LogIn,
  UserPlus,
  Sparkles,
  Shield,
  Zap,
  Eye,
  Lock,
  TrendingUp,
  X,
  Filter,
} from 'lucide-react';
import { LandingThemeWrapper, LandingThemeToggle } from '@/components/landing/landing-theme-wrapper';
import { CATEGORIES, CATEGORY_MAP } from '@/lib/category-config';
import { CategoryChip, CategoryIcon } from '@/components/ui/category-icon';

const CALLBACK_URL = '/talento';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const availabilityLabel = (val: string | null) => {
  switch (val) {
    case 'full-time': return 'Jornada completa';
    case 'part-time': return 'Medio turno';
    case 'freelance': return 'Independiente';
    default: return val;
  }
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

// ─── Skeleton Card ───────────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <Card className="glass-card h-full">
      <CardContent className="p-4 sm:p-5 flex flex-col h-full animate-pulse">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="h-14 w-14 rounded-full bg-muted shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
        <div className="mt-3 sm:mt-4 space-y-2.5">
          <div className="h-6 bg-muted rounded w-20" />
          <div className="flex gap-1.5">
            <div className="h-6 bg-muted rounded w-16" />
            <div className="h-6 bg-muted rounded w-14" />
            <div className="h-6 bg-muted rounded w-18" />
          </div>
          <div className="flex gap-3">
            <div className="h-3 bg-muted rounded w-16" />
            <div className="h-3 bg-muted rounded w-20" />
          </div>
        </div>
        <div className="mt-auto pt-3 sm:pt-4">
          <div className="border-t pt-2.5 sm:pt-3">
            <div className="h-9 bg-muted rounded w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Inner component that uses useSearchParams ───────────────────────────────
function ExplorarTalentoInner() {
  const { data: session, status: sessionStatus } = useSession();
  const isLoggedIn = sessionStatus === 'authenticated';
  const searchParams = useSearchParams();
  const router = useRouter();

  // Data
  const [result, setResult] = useState<PaginatedResponse<PublicTalentProfile> | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters — initialize from URL
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [availability, setAvailability] = useState(searchParams.get('availability') || 'all');
  const [openToWork, setOpenToWork] = useState(searchParams.get('openToWork') === '1');
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // Detail dialog
  const [selectedProfile, setSelectedProfile] = useState<PublicTalentProfileDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Refs
  const filterBarRef = useRef<HTMLDivElement>(null);
  const ctaFooterRef = useRef<HTMLElement>(null);
  const [showStickyCta, setShowStickyCta] = useState(false);

  // ─── URL sync ────────────────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (specialty) params.set('specialty', specialty);
    if (availability !== 'all') params.set('availability', availability);
    if (openToWork) params.set('openToWork', '1');
    if (page > 1) params.set('page', String(page));
    const qs = params.toString();
    router.replace(`/explorar-talento${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [search, specialty, availability, openToWork, page, router]);

  // ─── Fetch profiles ──────────────────────────────────────────────────────
  const loadProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 18 };
      if (search) params.search = search;
      if (specialty) params.category = specialty;
      if (availability !== 'all') params.availability = availability;
      if (openToWork) params.openToWork = true;
      const data = await publicTalentApi.browse(params);
      setResult(data);
    } catch {
      // Silent fail for public page
    } finally {
      setLoading(false);
    }
  }, [page, search, specialty, availability, openToWork]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  // ─── Debounce search ─────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ─── Scroll to top on page change ────────────────────────────────────────
  const prevPage = useRef(page);
  useEffect(() => {
    if (prevPage.current !== page && filterBarRef.current) {
      filterBarRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    prevPage.current = page;
  }, [page]);

  // ─── Sticky mobile CTA visibility ────────────────────────────────────────
  useEffect(() => {
    if (isLoggedIn) return;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const ctaEl = ctaFooterRef.current;
      if (ctaEl) {
        const ctaTop = ctaEl.getBoundingClientRect().top;
        setShowStickyCta(scrollY > 500 && ctaTop > window.innerHeight);
      } else {
        setShowStickyCta(scrollY > 500);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoggedIn]);

  // ─── Filter handlers ─────────────────────────────────────────────────────
  const handleAvailabilityChange = useCallback((val: string) => {
    setAvailability(val);
    setPage(1);
  }, []);

  const handleOpenToWorkChange = useCallback((val: boolean) => {
    setOpenToWork(val);
    setPage(1);
  }, []);

  const handleSpecialtyClick = useCallback((val: string) => {
    setSpecialty((prev) => (prev === val ? '' : val));
    setPage(1);
  }, []);

  const clearSpecialty = useCallback(() => {
    setSpecialty('');
    setSearchInput('');
    setSearch('');
    setPage(1);
  }, []);

  const handleBentoClick = useCallback((categoryKey: string) => {
    const cat = CATEGORY_MAP[categoryKey];
    if (!cat) return;
    // Use category filter directly (matches the category field in the DB)
    setSpecialty(categoryKey);
    setSearchInput('');
    setSearch('');
    setPage(1);
    setTimeout(() => {
      filterBarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  const openProfileDetail = async (profile: PublicTalentProfile) => {
    setSelectedProfile(profile as any);
    setDetailOpen(true);
    setLoadingDetail(true);
    try {
      const full = await publicTalentApi.getProfile(profile.id);
      setSelectedProfile(full);
    } catch {
      // Already have basic data
    } finally {
      setLoadingDetail(false);
    }
  };

  const profiles = result?.data || [];
  const meta = result?.meta;

  // Memoized specialty chips
  const specialtyChips = useMemo(
    () =>
      CATEGORIES.map((cat) => (
        <CategoryChip
          key={cat.key}
          categoryKey={cat.key}
          compact
          selected={specialty === cat.key}
          onClick={() => handleSpecialtyClick(cat.key)}
        />
      )),
    [specialty, handleSpecialtyClick]
  );

  return (
    <LandingThemeWrapper>
      <div className="min-h-screen bg-background">
        {/* ─── Header ──────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b bg-gradient-radial">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center">
                <img src="/claro2.png" alt="TurnoLink" className="h-12 w-auto dark:hidden" />
                <img src="/oscuro2.png" alt="TurnoLink" className="h-12 w-auto hidden dark:block" />
              </Link>
              <div className="flex items-center gap-2">
                <LandingThemeToggle />
                {isLoggedIn ? (
                  <Link href={session?.user?.tenantType === 'PROFESSIONAL' ? '/mi-perfil' : '/dashboard'}>
                    <Button size="sm" variant="outline">
                      {session?.user?.tenantType === 'PROFESSIONAL' ? 'Mi perfil' : 'Ir al dashboard'}
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href={`/login?callbackUrl=${encodeURIComponent(CALLBACK_URL)}`}>
                      <Button size="sm" variant="ghost" className="hidden sm:inline-flex">
                        <LogIn className="mr-1.5 h-4 w-4" />
                        Iniciar sesion
                      </Button>
                    </Link>
                    <Link href={`/register?callbackUrl=${encodeURIComponent(CALLBACK_URL)}`}>
                      <Button size="sm" className="btn-brand btn-shine h-9 px-4">
                        <UserPlus className="mr-1.5 h-4 w-4" />
                        <span className="hidden sm:inline">Registrarse</span>
                        <span className="sm:hidden">Registro</span>
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </header>

        {/* ─── Hero ────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden text-white">
          {/* Gradient background */}
          <div className="absolute inset-0 hero-explore-gradient" />

          <div className="relative">
            {/* Text content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-7 sm:pt-14 lg:pt-18 pb-4 sm:pb-8">
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 bg-white/15 backdrop-blur-sm border border-white/20">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium">Talento verificado &middot; Contacto directo</span>
                </div>
                <h1 className="hero-title text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                  Encontra al <span className="text-shimmer">profesional ideal</span> para tu negocio
                </h1>
                <p className="hero-subtitle text-base sm:text-lg text-white/80 max-w-2xl mx-auto mb-6">
                  Explora perfiles verificados, filtra por especialidad y conecta directamente. Sin intermediarios, sin costo.
                </p>

                {/* Search */}
                <div className="hero-cta max-w-xl mx-auto">
                  <div className="relative glass rounded-xl">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, especialidad..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="w-full h-12 sm:h-14 pl-12 pr-4 rounded-xl bg-white/90 dark:bg-neutral-900/90 text-foreground placeholder:text-muted-foreground text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                </div>

                {/* Trust line */}
                <p className="hero-trust mt-4 text-sm text-white/90">
                  {meta ? `${meta.total}+ perfiles` : '...'} &middot; Verificados &middot; 100% gratis
                </p>
              </div>
            </div>

            {/* ── Category Marquee Ticker ───────────────────────────────── */}
            <div className="hero-trust overflow-hidden py-4 sm:py-5">
              {/* Fade edges */}
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, var(--brand-700), transparent)' }} />
                <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, var(--brand-700), transparent)' }} />
                <div className="flex animate-marquee w-max">
                  {[...CATEGORIES, ...CATEGORIES].map((cat, i) => (
                    <button
                      key={`${cat.key}-${i}`}
                      type="button"
                      onClick={() => {
                        handleSpecialtyClick(cat.key);
                        filterBarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className={`shrink-0 mx-1.5 sm:mx-2 inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                        specialty === cat.key
                          ? 'bg-white text-teal-800 shadow-lg'
                          : 'bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-sm'
                      }`}
                    >
                      <CategoryIcon categoryKey={cat.key} size={24} />
                      {cat.shortLabel}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {specialty && (
              <div className="pb-3 flex justify-center">
                <button
                  onClick={clearSpecialty}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium bg-white/15 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
                >
                  <X className="h-3 w-3" />
                  Limpiar filtro
                </button>
              </div>
            )}

            {/* ── Bento Image Grid ─────────────────────────────────────── */}
            <div className="hero-trust container mx-auto px-4 sm:px-6 lg:px-8 pb-5 sm:pb-12">
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-3 max-w-4xl mx-auto auto-rows-[80px] sm:auto-rows-[100px] lg:auto-rows-[120px]">
                {/* Belleza — tall left */}
                <button type="button" onClick={() => { handleBentoClick('estetica-belleza'); }} className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden group cursor-pointer">
                  <img src="/hero/belleza.jpg" alt="Estética y Belleza" className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-2 left-2.5 text-[11px] sm:text-xs font-medium text-white/90">Belleza</span>
                </button>
                {/* Barbería */}
                <button type="button" onClick={() => { handleBentoClick('barberia'); }} className="col-span-2 row-span-1 relative rounded-2xl overflow-hidden group cursor-pointer">
                  <img src="/hero/barberia.jpg" alt="Barbería" className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-2 left-2.5 text-[11px] sm:text-xs font-medium text-white/90">Barbería</span>
                </button>
                {/* Spa — tall */}
                <button type="button" onClick={() => { handleBentoClick('masajes-spa'); }} className="hidden sm:block col-span-2 row-span-2 relative rounded-2xl overflow-hidden group cursor-pointer">
                  <img src="/hero/spa.jpg" alt="Masajes y Spa" className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-2 left-2.5 text-xs font-medium text-white/90">Spa</span>
                </button>
                {/* Fitness */}
                <button type="button" onClick={() => { handleBentoClick('fitness'); }} className="hidden sm:block col-span-2 row-span-1 relative rounded-2xl overflow-hidden group cursor-pointer">
                  <img src="/hero/fitness.jpg" alt="Fitness" className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-2 left-2.5 text-xs font-medium text-white/90">Fitness</span>
                </button>
                {/* Nutrición */}
                <button type="button" onClick={() => { handleBentoClick('nutricion'); }} className="col-span-2 row-span-1 relative rounded-2xl overflow-hidden group cursor-pointer">
                  <img src="/hero/nutricion.jpg" alt="Nutrición" className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-2 left-2.5 text-[11px] sm:text-xs font-medium text-white/90">Nutrición</span>
                </button>
                {/* Odontología — tall */}
                <button type="button" onClick={() => { handleBentoClick('odontologia'); }} className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden group cursor-pointer">
                  <img src="/hero/odontologia.jpg" alt="Odontología" className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-2 left-2.5 text-[11px] sm:text-xs font-medium text-white/90">Odontología</span>
                </button>
                {/* Salud */}
                <button type="button" onClick={() => { handleBentoClick('salud'); }} className="col-span-2 row-span-1 relative rounded-2xl overflow-hidden group cursor-pointer">
                  <img src="/hero/salud.jpg" alt="Salud" className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-2 left-2.5 text-[11px] sm:text-xs font-medium text-white/90">Salud</span>
                </button>
                {/* Fitness (mobile only) */}
                <button type="button" onClick={() => { handleBentoClick('fitness'); }} className="sm:hidden col-span-2 row-span-1 relative rounded-2xl overflow-hidden group cursor-pointer">
                  <img src="/hero/fitness.jpg" alt="Fitness" className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-2 left-2.5 text-[11px] font-medium text-white/90">Fitness</span>
                </button>
                {/* Veterinaria (desktop only) */}
                <button type="button" onClick={() => { handleBentoClick('veterinaria'); }} className="hidden sm:block col-span-2 row-span-1 relative rounded-2xl overflow-hidden group cursor-pointer">
                  <img src="/hero/veterinaria.jpg" alt="Veterinaria" className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-2 left-2.5 text-xs font-medium text-white/90">Veterinaria</span>
                </button>
                {/* Spa (mobile) */}
                <button type="button" onClick={() => { handleBentoClick('masajes-spa'); }} className="sm:hidden col-span-2 row-span-1 relative rounded-2xl overflow-hidden group cursor-pointer">
                  <img src="/hero/spa.jpg" alt="Spa" className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-2 left-2.5 text-[11px] font-medium text-white/90">Spa</span>
                </button>
                {/* Educación */}
                <button type="button" onClick={() => { handleBentoClick('educacion'); }} className="col-span-2 row-span-1 relative rounded-2xl overflow-hidden group cursor-pointer">
                  <img src="/talent/educacion.webp" alt="Educación" className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-2 left-2.5 text-[11px] sm:text-xs font-medium text-white/90">Educación</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Specialty Chips Bar ─────────────────────────────────────── */}
        <div className="bg-background border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide pb-1">
              <button
                onClick={clearSpecialty}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  !specialty
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                Todos
              </button>
              {specialtyChips}
            </div>
          </div>
        </div>

        {/* ─── Main Content ────────────────────────────────────────────── */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Filter Bar */}
          <div ref={filterBarRef} className="glass-card rounded-2xl p-4 mb-6 scroll-mt-20">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-3 items-center">
                <Select value={availability} onValueChange={handleAvailabilityChange}>
                  <SelectTrigger className="w-full sm:w-[180px] h-10">
                    <SelectValue placeholder="Disponibilidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="full-time">Jornada completa</SelectItem>
                    <SelectItem value="part-time">Medio turno</SelectItem>
                    <SelectItem value="freelance">Independiente</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    id="openToWork"
                    checked={openToWork}
                    onCheckedChange={handleOpenToWorkChange}
                  />
                  <Label htmlFor="openToWork" className="whitespace-nowrap text-xs sm:text-sm cursor-pointer">
                    Disponibles
                    <span className="hidden sm:inline"> para trabajar</span>
                  </Label>
                </div>
                {/* Active specialty chip */}
                {specialty && CATEGORY_MAP[specialty] && (
                  <Badge
                    variant="secondary"
                    className="h-7 px-2 text-xs cursor-pointer hover:bg-destructive/10 transition-colors inline-flex items-center gap-1.5"
                    onClick={clearSpecialty}
                  >
                    <CategoryIcon categoryKey={specialty} size={22} />
                    {CATEGORY_MAP[specialty].shortLabel}
                    <X className="ml-0.5 h-3 w-3" />
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {meta && (
                  search ? (
                    <span>{meta.total} resultados para &quot;{search}&quot;</span>
                  ) : (
                    <span>Mostrando {profiles.length} de {meta.total}</span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* ─── Content: Skeleton / Empty / Grid ───────────────────────── */}
          {loading ? (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProfileSkeleton key={i} />
              ))}
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-20">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No se encontraron perfiles</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                {specialty || search
                  ? 'Proba con otros filtros o una busqueda diferente'
                  : 'Vuelve mas tarde cuando haya perfiles disponibles'}
              </p>
              {(specialty || search || availability !== 'all' || openToWork) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setSearchInput('');
                    setSearch('');
                    setSpecialty('');
                    setAvailability('all');
                    setOpenToWork(false);
                    setPage(1);
                  }}
                >
                  <X className="mr-1.5 h-4 w-4" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Grid */}
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {profiles.map((profile, index) => (
                  <Card
                    key={profile.id}
                    className="group cursor-pointer hover-lift glass-card active:scale-[0.98] h-full"
                    onClick={() => openProfileDetail(profile)}
                  >
                    <CardContent className="p-4 sm:p-5 flex flex-col h-full">
                      <div className="flex items-start gap-3 sm:gap-4">
                        {profile.image ? (
                          <img
                            src={profile.image}
                            alt={profile.name}
                            className="h-14 w-14 rounded-full object-cover shrink-0 ring-2 ring-transparent group-hover:ring-teal-400 transition-all"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-sm font-bold text-white shrink-0 ring-2 ring-transparent group-hover:ring-teal-400 transition-all">
                            {getInitials(profile.name)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base truncate">{profile.name}</h3>
                          {profile.headline && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {profile.headline}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 sm:mt-4 space-y-2.5">
                        {profile.specialty && (
                          <Badge variant="secondary" className="text-[11px] h-6 px-2.5 bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/30">
                            {profile.specialty}
                          </Badge>
                        )}

                        {profile.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {profile.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-[11px] h-6 px-2.5">
                                {skill}
                              </Badge>
                            ))}
                            {profile.skills.length > 3 && (
                              <Badge variant="outline" className="text-[11px] h-6 px-2.5 text-muted-foreground">
                                +{profile.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                          {profile.yearsExperience != null && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {profile.yearsExperience} anos
                            </span>
                          )}
                          {profile.availability && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {availabilityLabel(profile.availability)}
                            </span>
                          )}
                        </div>

                        {profile.openToWork && (
                          <Badge className="text-[11px] h-6 px-2.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30">
                            <span className="relative mr-1.5 flex h-2 w-2">
                              <span className="pulse-glow absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                            </span>
                            Disponible
                          </Badge>
                        )}
                      </div>

                      <div className="mt-auto pt-3 sm:pt-4">
                        <div className="border-t pt-2.5 sm:pt-3">
                          <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary/5 h-9">
                            Ver perfil
                            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 sm:gap-4 py-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="h-10 px-3 sm:px-4"
                  >
                    <ChevronLeft className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Anterior</span>
                  </Button>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {meta.page} / {meta.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= meta.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="h-10 px-3 sm:px-4"
                  >
                    <span className="hidden sm:inline">Siguiente</span>
                    <ChevronRight className="h-4 w-4 sm:ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </main>

        {/* ─── Profile Detail Dialog ───────────────────────────────────── */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto p-4 sm:p-6">
            {selectedProfile && (
              <>
                <DialogHeader>
                  <div className="flex items-start gap-3 sm:gap-4">
                    {selectedProfile.image ? (
                      <img
                        src={selectedProfile.image}
                        alt={selectedProfile.name}
                        className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover shrink-0 ring-2 ring-teal-200"
                      />
                    ) : (
                      <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-lg sm:text-xl font-bold text-white shrink-0 ring-2 ring-teal-200">
                        {getInitials(selectedProfile.name)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <DialogTitle className="text-lg sm:text-xl truncate">{selectedProfile.name}</DialogTitle>
                      {selectedProfile.headline && (
                        <p className="text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2">{selectedProfile.headline}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {selectedProfile.specialty && (
                          <Badge variant="secondary" className="text-[11px] h-6 px-2.5 bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300">{selectedProfile.specialty}</Badge>
                        )}
                        {selectedProfile.openToWork && (
                          <Badge className="text-[11px] h-6 px-2.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30">
                            <UserCheck className="mr-1 h-3 w-3" />
                            Disponible
                          </Badge>
                        )}
                        {selectedProfile.availability && (
                          <Badge variant="outline" className="text-[11px] h-6 px-2.5">
                            <Clock className="mr-1 h-3 w-3" />
                            {availabilityLabel(selectedProfile.availability)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                {loadingDetail ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-pulse space-y-4 w-full">
                      <div className="h-4 bg-muted rounded w-full" />
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 sm:mt-4">
                    <Tabs defaultValue="resumen" className="w-full">
                      <TabsList className="w-full grid grid-cols-3 mb-4">
                        <TabsTrigger value="resumen">Resumen</TabsTrigger>
                        <TabsTrigger value="habilidades">Especialidades</TabsTrigger>
                        <TabsTrigger value="experiencia">Experiencia</TabsTrigger>
                      </TabsList>

                      {/* Tab: Resumen */}
                      <TabsContent value="resumen" className="space-y-4">
                        {selectedProfile.bio && (
                          <div>
                            <h4 className="font-semibold mb-1.5 text-sm">Acerca de</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                              {selectedProfile.bio}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          {selectedProfile.specialty && (
                            <div className="glass-card rounded-xl p-3">
                              <p className="text-xs text-muted-foreground mb-0.5">Especialidad</p>
                              <p className="text-sm font-medium">{selectedProfile.specialty}</p>
                            </div>
                          )}
                          {selectedProfile.availability && (
                            <div className="glass-card rounded-xl p-3">
                              <p className="text-xs text-muted-foreground mb-0.5">Disponibilidad</p>
                              <p className="text-sm font-medium">{availabilityLabel(selectedProfile.availability)}</p>
                            </div>
                          )}
                          {selectedProfile.yearsExperience != null && (
                            <div className="glass-card rounded-xl p-3">
                              <p className="text-xs text-muted-foreground mb-0.5">Experiencia</p>
                              <p className="text-sm font-medium">{selectedProfile.yearsExperience} anos</p>
                            </div>
                          )}
                          {selectedProfile.openToWork && (
                            <div className="glass-card rounded-xl p-3">
                              <p className="text-xs text-muted-foreground mb-0.5">Estado</p>
                              <p className="text-sm font-medium text-green-600 dark:text-green-400">Disponible</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      {/* Tab: Especialidades */}
                      <TabsContent value="habilidades" className="space-y-4">
                        {selectedProfile.skills.length > 0 ? (
                          <div>
                            <h4 className="font-semibold mb-2 text-sm">Especialidades</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedProfile.skills.map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs h-7 px-3">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">No hay especialidades registradas</p>
                        )}

                        {selectedProfile.yearsExperience != null && (
                          <div className="flex items-center gap-3 glass-card rounded-xl p-4">
                            <Briefcase className="h-5 w-5 text-muted-foreground shrink-0" />
                            <div>
                              <p className="text-sm font-medium">{selectedProfile.yearsExperience} anos de experiencia</p>
                              <p className="text-xs text-muted-foreground">En su area de especialidad</p>
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      {/* Tab: Experiencia */}
                      <TabsContent value="experiencia">
                        {'experiences' in selectedProfile && selectedProfile.experiences?.length > 0 ? (
                          <div className={!isLoggedIn ? 'relative' : ''}>
                            <div className="space-y-3 sm:space-y-4">
                              {selectedProfile.experiences.map((exp) => (
                                <div
                                  key={exp.id}
                                  className="relative pl-5 sm:pl-6 border-l-2 border-muted pb-3 sm:pb-4 last:pb-0"
                                >
                                  <div className="absolute left-[-5px] top-1 h-2 w-2 rounded-full bg-primary" />
                                  <div className="font-medium text-sm sm:text-base">{exp.role}</div>
                                  <div className="text-sm text-muted-foreground">{exp.businessName}</div>
                                  <div className="text-xs text-muted-foreground mt-0.5 sm:mt-1">
                                    {new Date(exp.startDate).toLocaleDateString('es-AR', {
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                    {' — '}
                                    {exp.isCurrent
                                      ? 'Actual'
                                      : exp.endDate
                                      ? new Date(exp.endDate).toLocaleDateString('es-AR', {
                                          month: 'short',
                                          year: 'numeric',
                                        })
                                      : ''}
                                  </div>
                                </div>
                              ))}
                            </div>
                            {/* Blur overlay for non-logged-in */}
                            {!isLoggedIn && (
                              <div className="absolute inset-0 backdrop-blur-sm bg-background/60 flex flex-col items-center justify-center rounded-lg">
                                <Lock className="h-5 w-5 text-muted-foreground mb-2" />
                                <p className="text-sm font-medium mb-3">Registrate para ver la experiencia completa</p>
                                <Link href={`/register?callbackUrl=${encodeURIComponent(CALLBACK_URL)}`}>
                                  <Button size="sm" className="btn-brand btn-shine">
                                    <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                                    Crear cuenta gratis
                                  </Button>
                                </Link>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            {!isLoggedIn ? (
                              <span className="flex flex-col items-center gap-2">
                                <Lock className="h-5 w-5" />
                                Registrate para ver la experiencia
                              </span>
                            ) : (
                              'No hay experiencias registradas'
                            )}
                          </p>
                        )}
                      </TabsContent>
                    </Tabs>

                    {/* CTA Section */}
                    <div className="border-t pt-4 sm:pt-5 mt-4 space-y-3">
                      {isLoggedIn ? (
                        <Link href="/talento" className="block">
                          <Button className="w-full h-11 btn-brand btn-shine">
                            Ver perfil completo en Talento
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      ) : (
                        <>
                          <div className="text-center mb-3">
                            <p className="text-sm text-muted-foreground">
                              Registrate para ver el perfil completo y enviar propuestas
                            </p>
                          </div>
                          <Link href={`/register?callbackUrl=${encodeURIComponent(CALLBACK_URL)}`} className="block">
                            <Button className="w-full h-11 btn-brand btn-shine">
                              <UserPlus className="mr-2 h-4 w-4" />
                              Crear cuenta gratis
                            </Button>
                          </Link>
                          <Link href={`/login?callbackUrl=${encodeURIComponent(CALLBACK_URL)}`} className="block">
                            <Button variant="outline" className="w-full h-11">
                              <LogIn className="mr-2 h-4 w-4" />
                              Ya tengo cuenta
                            </Button>
                          </Link>
                          <p className="text-center text-xs text-muted-foreground">
                            Gratis &middot; Sin tarjeta de credito &middot; Registrate en 30 segundos
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ─── Social Proof Section (only !isLoggedIn) ─────────────────── */}
        {!isLoggedIn && (
          <section className="py-10 sm:py-14 bg-gradient-soft">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="section-title text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10">
                Empresas ya conectan con talento en TurnoLink
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto text-center">
                <div className="animate-counter glass-card rounded-2xl p-6">
                  <div className="text-3xl sm:text-4xl font-bold text-gradient">
                    {meta?.total ?? '—'}+
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Profesionales activos</p>
                </div>
                <div className="animate-counter glass-card rounded-2xl p-6">
                  <div className="text-3xl sm:text-4xl font-bold text-gradient">25+</div>
                  <p className="text-sm text-muted-foreground mt-1">Especialidades</p>
                </div>
                <div className="animate-counter glass-card rounded-2xl p-6">
                  <div className="text-3xl sm:text-4xl font-bold text-gradient">
                    <TrendingUp className="inline h-8 w-8" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Contacto directo sin comisiones</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─── Value Props (only !isLoggedIn) ──────────────────────────── */}
        {!isLoggedIn && (
          <section className="py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="section-title text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10">
                ¿Por que TurnoLink?
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 max-w-5xl mx-auto">
                {[
                  {
                    icon: Shield,
                    title: 'Perfiles verificados',
                    desc: 'Cada profesional verifica su identidad y experiencia',
                  },
                  {
                    icon: Zap,
                    title: 'Conexion directa',
                    desc: 'Contacta sin intermediarios ni comisiones ocultas',
                  },
                  {
                    icon: Eye,
                    title: 'Transparencia total',
                    desc: 'Revisa experiencia, habilidades y disponibilidad antes de contactar',
                  },
                  {
                    icon: Lock,
                    title: 'Datos protegidos',
                    desc: 'Tu informacion y la del profesional estan seguras',
                  },
                ].map((item, i) => (
                  <div
                    key={item.title}
                    className={`glass-card hover-lift rounded-2xl p-5 sm:p-6 text-center animate-on-scroll`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-primary text-white mb-4">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold mb-2 text-sm sm:text-base">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── CTA Footer ─────────────────────────────────────────────── */}
        <section ref={ctaFooterRef} className="cta-section-animate relative overflow-hidden bg-gradient-primary text-white py-12 sm:py-16">
          <div className="absolute inset-0 bg-dots opacity-15" />
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              El talento que tu negocio necesita esta aca
            </h2>
            <p className="text-white/80 max-w-xl mx-auto mb-8">
              Registrate en 30 segundos y empeza a conectar con profesionales verificados. Sin costo, sin compromiso.
            </p>
            {isLoggedIn ? (
              <Link href="/talento">
                <Button size="lg" className="bg-white text-teal-700 hover:bg-white/90 h-12 px-8 btn-shine">
                  Explorar talento completo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href={`/register?callbackUrl=${encodeURIComponent(CALLBACK_URL)}`}>
                  <Button size="lg" className="bg-white text-teal-700 hover:bg-white/90 h-12 px-8 btn-shine">
                    Crear cuenta gratis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <p className="mt-4 text-sm text-white/70">
                  Gratis &middot; Sin tarjeta &middot; Cancela cuando quieras
                </p>
              </>
            )}
          </div>
        </section>

        {/* ─── Footer ──────────────────────────────────────────────────── */}
        <footer className="border-t bg-muted/30 animate-on-scroll">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src="/claro2.png" alt="TurnoLink" className="h-8 w-auto dark:hidden" />
                <img src="/oscuro2.png" alt="TurnoLink" className="h-8 w-auto hidden dark:block" />
              </div>
              <nav className="flex items-center gap-4 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
                <Link href="/explorar-talento" className="hover:text-foreground transition-colors">Explorar Talento</Link>
                <Link href="/suscripcion" className="hover:text-foreground transition-colors">Suscripcion</Link>
                <Link href="/#faq" className="hover:text-foreground transition-colors">Ayuda</Link>
                <a href="#" className="hover:text-foreground transition-colors">Privacidad</a>
                <a href="#" className="hover:text-foreground transition-colors">Terminos</a>
              </nav>
              <p className="text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} TurnoLink
              </p>
            </div>
          </div>
        </footer>

        {/* ─── Sticky Mobile CTA (only !isLoggedIn on mobile) ──────────── */}
        {!isLoggedIn && (
          <div
            className={`fixed bottom-0 left-0 right-0 z-40 sm:hidden transition-transform duration-300 ${
              showStickyCta ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            <div className="glass border-t bg-background/95 backdrop-blur-lg px-4 py-3 flex items-center justify-between gap-3">
              <p className="text-sm font-medium truncate">Registrate gratis</p>
              <Link href={`/register?callbackUrl=${encodeURIComponent(CALLBACK_URL)}`}>
                <Button size="sm" className="btn-brand btn-shine shrink-0 h-9 px-4">
                  <UserPlus className="mr-1.5 h-4 w-4" />
                  Registrarse
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </LandingThemeWrapper>
  );
}

// ─── Default export wrapped in Suspense (for useSearchParams) ────────────────
export default function ExplorarTalentoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-12 w-48 bg-muted rounded mx-auto mb-4" />
          <div className="h-4 w-32 bg-muted rounded mx-auto" />
        </div>
      </div>
    }>
      <ExplorarTalentoInner />
    </Suspense>
  );
}
