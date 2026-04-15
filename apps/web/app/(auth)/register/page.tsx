'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Calendar, Loader2, Rocket, CheckCircle2, ArrowLeft, ArrowRight, UserCog, Building2, Briefcase,
  Star, Users, Search, Send, Scissors, Sparkles, Stethoscope, SmilePlus, Brain, Apple,
  Dumbbell, PawPrint, Pen, GraduationCap, Trophy, BedDouble, Home, LayoutGrid,
  ChevronDown, Droplets, ShoppingBag, Eye, EyeOff,
  Shirt, Footprints, Smartphone, Laptop, Tv, Headphones, Car, UtensilsCrossed,
  Armchair, Gamepad2, Medal, BookOpen, Pipette, Gem, Wrench, Coffee, Package,
  Flame, Pizza, Beef, IceCream, Fish, Beer, Soup, Cake, Truck, Store,
  type LucideIcon,
} from 'lucide-react';
import { authApi } from '@/lib/api';
import { RUBROS } from '@/lib/tenant-config';
import { cn } from '@/lib/utils';

type AccountIntent = 'business' | 'professional' | null;
type OfferType = 'services' | 'products' | 'gastronomia' | null;
type Step = 'intent' | 'offer-type' | 'rubro' | 'sub-rubro' | 'form';

// ─── Icon mapping (each rubro gets a unique icon) ──────────────
const RUBRO_ICONS: Record<string, LucideIcon> = {
  'estetica-belleza': Sparkles,
  'barberia': Scissors,
  'masajes-spa': Droplets,
  'salud': Stethoscope,
  'odontologia': SmilePlus,
  'psicologia': Brain,
  'nutricion': Apple,
  'fitness': Dumbbell,
  'veterinaria': PawPrint,
  'tatuajes-piercing': Pen,
  'educacion': GraduationCap,
  'consultoria': Briefcase,
  'deportes': Trophy,
  'espacios': Building2,
  'hospedaje': BedDouble,
  'alquiler': Home,
  'gastronomia': UtensilsCrossed,
  'inmobiliarias': Building2,
  'mercado': ShoppingBag,
  'otro': LayoutGrid,
};

// ─── Subtexto para rubros que agrupan varias profesiones ────
const RUBRO_SUBTEXTS: Record<string, string> = {
  'consultoria': 'Abogados, contadores, notarios...',
  'gastronomia': 'Restaurantes, bares, cafeterías, delivery',
  'inmobiliarias': 'Venta, alquiler y tasación de propiedades',
  'alquiler': 'Cabañas, Airbnb, deptos por día',
};

// ─── Landing slug → rubro key mapping ───────────────────────────
// Landing pages pass industry slugs (e.g. 'hospedaje-por-horas') but RUBROS uses
// rubro keys (e.g. 'hospedaje'). Resolve here so badge + API receive the rubro key.
const LANDING_TO_RUBRO: Record<string, string> = {
  'belleza': 'estetica-belleza',
  'salud': 'salud',
  'deportes': 'deportes',
  'hospedaje-por-horas': 'hospedaje',
  'alquiler-temporario': 'alquiler',
  'espacios-flexibles': 'espacios',
  'profesionales': 'consultoria',
  'gastronomia': 'gastronomia',
  'mercado': 'mercado',
};

// ─── Progressive disclosure: top 9 rubros shown first ──────────
const FEATURED_RUBRO_KEYS = new Set([
  'estetica-belleza', 'barberia', 'salud', 'odontologia', 'psicologia',
  'fitness', 'masajes-spa', 'consultoria', 'educacion', 'inmobiliarias', 'mercado',
]);

// ─── Sub-rubros de Mercado (picker para tiendas) ──────────────
const MERCADO_SUB_RUBROS: { key: string; label: string; icon: LucideIcon; subtitle?: string }[] = [
  { key: 'mercado-indumentaria', label: 'Indumentaria', icon: Shirt, subtitle: 'Ropa y accesorios' },
  { key: 'mercado-calzado', label: 'Calzado', icon: Footprints, subtitle: 'Zapatillas, botas, sandalias' },
  { key: 'mercado-celulares', label: 'Celulares', icon: Smartphone, subtitle: 'Celulares y tablets' },
  { key: 'mercado-computacion', label: 'Computación', icon: Laptop, subtitle: 'Notebooks, PCs, monitores' },
  { key: 'mercado-electronica', label: 'Electrónica', icon: Tv, subtitle: 'TV, audio, electrodomésticos' },
  { key: 'mercado-accesorios-tech', label: 'Accesorios Tech', icon: Headphones, subtitle: 'Auriculares, cargadores, fundas' },
  { key: 'mercado-automotoras', label: 'Automotora', icon: Car, subtitle: 'Autos, motos, vehículos' },
  { key: 'mercado-alimentos', label: 'Alimentos', icon: UtensilsCrossed, subtitle: 'Alimentos y bebidas' },
  { key: 'mercado-muebles', label: 'Muebles', icon: Armchair, subtitle: 'Muebles y decoración' },
  { key: 'mercado-juguetes', label: 'Juguetería', icon: Gamepad2, subtitle: 'Juguetes y juegos' },
  { key: 'mercado-deportes', label: 'Deportes', icon: Medal, subtitle: 'Equipamiento deportivo' },
  { key: 'mercado-libreria', label: 'Librería', icon: BookOpen, subtitle: 'Papelería y útiles' },
  { key: 'mercado-cosmetica', label: 'Cosmética', icon: Pipette, subtitle: 'Perfumería y belleza' },
  { key: 'mercado-mascotas', label: 'Mascotas', icon: PawPrint, subtitle: 'Alimento y accesorios pet' },
  { key: 'mercado-joyeria', label: 'Joyería', icon: Gem, subtitle: 'Joyería y relojería' },
  { key: 'mercado-ferreteria', label: 'Ferretería', icon: Wrench, subtitle: 'Herramientas y construcción' },
  { key: 'mercado-bazar', label: 'Bazar', icon: Coffee, subtitle: 'Bazar y menaje' },
  { key: 'mercado-general', label: 'Tienda General', icon: Package, subtitle: 'Productos variados' },
];

// ─── Sub-rubros de Gastronomía (picker para locales gastro) ──
const GASTRO_SUB_RUBROS: { key: string; label: string; icon: LucideIcon; subtitle?: string }[] = [
  { key: 'gastro-parrilla', label: 'Parrilla', icon: Flame, subtitle: 'Parrilla y restaurante' },
  { key: 'gastro-pizzeria', label: 'Pizzería', icon: Pizza, subtitle: 'Pizzas y empanadas' },
  { key: 'gastro-hamburgueseria', label: 'Hamburguesería', icon: Beef, subtitle: 'Burgers y smash' },
  { key: 'gastro-cafe', label: 'Café', icon: Coffee, subtitle: 'Café de especialidad' },
  { key: 'gastro-heladeria', label: 'Heladería', icon: IceCream, subtitle: 'Helados artesanales' },
  { key: 'gastro-sushi', label: 'Sushi', icon: Fish, subtitle: 'Cocina japonesa y asiática' },
  { key: 'gastro-cerveceria', label: 'Cervecería', icon: Beer, subtitle: 'Brewpub y picadas' },
  { key: 'gastro-bodegon', label: 'Bodegón', icon: Soup, subtitle: 'Cocina casera y criolla' },
  { key: 'gastro-pasteleria', label: 'Pastelería', icon: Cake, subtitle: 'Bakery y repostería' },
  { key: 'gastro-food-truck', label: 'Food Truck', icon: Truck, subtitle: 'Street food y eventos' },
  { key: 'gastro-otro', label: 'Otro Gastro', icon: Store, subtitle: 'Otro tipo de local' },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const intentParam = searchParams.get('intent');
  const industryParam = searchParams.get('industry');
  const rawCallback = searchParams.get('callbackUrl') || '/dashboard';
  const safeCallbackUrl = rawCallback.startsWith('/') ? rawCallback : '/dashboard';

  // Resolve landing slugs to rubro keys (e.g. 'hospedaje-por-horas' → 'hospedaje')
  const resolvedIndustry = industryParam ? (LANDING_TO_RUBRO[industryParam] || industryParam) : null;

  const getInitialIntent = (): AccountIntent => {
    if (intentParam === 'professional') return 'professional';
    // Everyone else is business (professional is disabled)
    return 'business';
  };

  const getInitialOfferType = (): OfferType => {
    if (resolvedIndustry === 'mercado') return 'products';
    if (resolvedIndustry) return 'services';
    return null;
  };

  const getInitialStep = (): Step => {
    if (intentParam === 'professional') return 'form';
    // Mercado landing → go to sub-rubro picker
    if (resolvedIndustry === 'mercado') return 'sub-rubro';
    // With other industry param, skip directly to form
    if (resolvedIndustry) return 'form';
    // Default: go straight to offer-type selection (skip intent)
    return 'offer-type';
  };

  const [intent, setIntent] = useState<AccountIntent>(getInitialIntent());
  const [offerType, setOfferType] = useState<OfferType>(getInitialOfferType());
  const [step, setStep] = useState<Step>(getInitialStep());
  const [selectedRubro, setSelectedRubro] = useState<string | null>(resolvedIndustry);
  const [showAllRubros, setShowAllRubros] = useState(false);
  const [subRubroSearch, setSubRubroSearch] = useState('');

  const [businessForm, setBusinessForm] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    businessSlug: '',
  });

  const [professionalForm, setProfessionalForm] = useState({
    name: '',
    email: '',
    password: '',
    specialty: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Derived: selected rubro info for badge/context
  const subRubroData = selectedRubro ? MERCADO_SUB_RUBROS.find(r => r.key === selectedRubro) : null;
  const selectedRubroData = subRubroData
    ? { key: subRubroData.key, label: subRubroData.label }
    : selectedRubro ? RUBROS.find(r => r.key === selectedRubro) : null;
  const SelectedRubroIcon = subRubroData
    ? subRubroData.icon
    : selectedRubro ? RUBRO_ICONS[selectedRubro] || LayoutGrid : null;

  const handleBusinessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBusinessForm((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === 'businessName') {
        newData.businessSlug = slugify(value);
      }
      return newData;
    });
  };

  const handleProfessionalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfessionalForm((prev) => ({ ...prev, [name]: value }));
  };

  const validatePassword = (pw: string): string | null => {
    if (pw.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    if (!/[a-z]/.test(pw)) return 'La contraseña debe incluir al menos una letra minúscula';
    if (!/[A-Z]/.test(pw)) return 'La contraseña debe incluir al menos una letra mayúscula';
    if (!/\d/.test(pw)) return 'La contraseña debe incluir al menos un número';
    return null;
  };

  const translateApiError = (msg: string): string => {
    if (/password must be longer/i.test(msg) || /at least 8/i.test(msg)) return 'La contraseña debe tener al menos 8 caracteres';
    if (/must contain.*uppercase/i.test(msg) || /mayúscula/i.test(msg)) return 'La contraseña debe incluir al menos una mayúscula, una minúscula y un número';
    if (/already exists/i.test(msg) || /already registered/i.test(msg) || /ya existe/i.test(msg) || /ya registrad/i.test(msg)) return 'Ya existe una cuenta con ese email. ¿Querés iniciar sesión?';
    if (/email.*invalid/i.test(msg) || /must be.*email/i.test(msg)) return 'El email ingresado no es válido';
    if (/too many/i.test(msg) || /rate limit/i.test(msg)) return 'Demasiados intentos. Esperá un momento e intentá de nuevo.';
    if (/network|fetch|abort|timeout/i.test(msg)) return 'Error de conexión. Verificá tu internet e intentá de nuevo.';
    return msg;
  };

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Frontend validation
    const pwError = validatePassword(businessForm.password);
    if (pwError) {
      setError(pwError);
      return;
    }

    setLoading(true);

    try {
      await authApi.register({
        name: businessForm.name,
        email: businessForm.email,
        password: businessForm.password,
        businessName: businessForm.businessName || undefined,
        businessSlug: businessForm.businessSlug || undefined,
        accountType: 'BUSINESS',
        industry: selectedRubro || industryParam || undefined,
      });

      // Redirect: products → catálogo, services → dashboard
      const redirectUrl = offerType === 'products' && safeCallbackUrl === '/dashboard'
        ? '/catalogo'
        : safeCallbackUrl;

      const result = await signIn('credentials', {
        email: businessForm.email,
        password: businessForm.password,
        redirect: false,
        callbackUrl: redirectUrl,
      });

      if (result?.ok) {
        window.location.href = redirectUrl;
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Error al crear la cuenta';
      setError(translateApiError(raw));
    } finally {
      setLoading(false);
    }
  };

  const handleProfessionalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.register({
        name: professionalForm.name,
        email: professionalForm.email,
        password: professionalForm.password,
        accountType: 'PROFESSIONAL',
        specialty: professionalForm.specialty || undefined,
      });

      const result = await signIn('credentials', {
        email: professionalForm.email,
        password: professionalForm.password,
        redirect: false,
        callbackUrl: '/mi-perfil',
      });

      if (result?.ok) {
        window.location.href = '/mi-perfil';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  // Navigation helpers
  const selectIntent = (i: AccountIntent) => {
    setIntent(i);
    setError('');
    if (i === 'business') {
      if (industryParam) {
        setStep('form');
      } else {
        setStep('offer-type');
      }
    } else {
      setStep('form');
    }
  };

  const selectOfferType = (type: OfferType) => {
    setOfferType(type);
    setError('');
    if (type === 'gastronomia') {
      setSelectedRubro(null);
      setStep('sub-rubro');
    } else if (type === 'products') {
      setSelectedRubro(null);
      setStep('sub-rubro');
    } else {
      setSelectedRubro(null);
      setStep('rubro');
    }
  };

  const goBackFromOfferType = () => {
    // No back from offer-type — it's the first step now
    return;
  };

  const goBackFromRubro = () => {
    setOfferType(null);
    setSelectedRubro(null);
    setStep('offer-type');
    setError('');
  };

  const goBackFromForm = () => {
    setError('');
    if (industryParam) return; // came from landing with industry, nowhere to go back
    if (offerType === 'products' || offerType === 'gastronomia') {
      setStep('sub-rubro');
    } else if (offerType === 'services') {
      setStep('rubro');
    } else {
      setStep('offer-type');
    }
  };

  const goBackFromSubRubro = () => {
    setSelectedRubro(null);
    setOfferType(null);
    setStep('offer-type');
    setError('');
  };

  const loginHref = `/login${safeCallbackUrl !== '/dashboard' ? `?callbackUrl=${encodeURIComponent(safeCallbackUrl)}` : ''}`;

  const errorBanner = error ? (
    <div className="bg-red-900/20 border border-red-800/40 text-red-400 text-sm p-3 rounded-lg flex items-center gap-2">
      <div className="h-5 w-5 rounded-full bg-red-900/50 flex items-center justify-center flex-shrink-0">
        <span className="text-red-400 text-xs">!</span>
      </div>
      {error}
    </div>
  ) : null;

  // ─── Intent Selection (full-screen dark immersive) ─────────
  const renderIntentSelection = () => (
    <div className="w-full max-w-xl px-4">
      <div className="text-center mb-10 sm:mb-12">
        <Link href="/" className="inline-block mb-6 sm:mb-8">
          <img src="/oscuro2.png" alt="TurnoLink" className="h-16 sm:h-20 mx-auto" />
        </Link>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
          Tu negocio,{' '}
          <span className="bg-gradient-to-r from-[#3F8697] to-[#6FBBCB] bg-clip-text text-transparent">
            en línea
          </span>
        </h1>
        <p className="text-neutral-400 text-base sm:text-lg max-w-md mx-auto">
          Creá tu cuenta gratis y configurá todo en minutos
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {/* Business card */}
        <button
          onClick={() => selectIntent('business')}
          className="w-full text-left rounded-2xl border border-white/[0.06] bg-neutral-900/80 hover:bg-neutral-800/80 hover:border-[#3F8697]/30 transition-all duration-300 group"
        >
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#3F8697] to-[#4DA4B8] flex items-center justify-center shrink-0 shadow-lg shadow-[#3F8697]/20">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-white group-hover:text-[#4DA4B8] transition-colors">
                    Soy un negocio
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-[#3F8697]/20 text-[#4DA4B8] text-[10px] font-semibold uppercase tracking-wide">
                    Popular
                  </span>
                </div>
                <p className="text-sm text-neutral-400">
                  Gestioná turnos para tu equipo y clientes
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-neutral-600 group-hover:text-[#4DA4B8] group-hover:translate-x-1 transition-all shrink-0" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500">
                <Calendar className="h-3.5 w-3.5 text-[#3F8697]/60 shrink-0" />
                <span>Agenda online 24/7</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500">
                <Users className="h-3.5 w-3.5 text-[#3F8697]/60 shrink-0" />
                <span>Gestión de equipo</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500">
                <Search className="h-3.5 w-3.5 text-[#3F8697]/60 shrink-0" />
                <span>Link de reservas</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500">
                <Send className="h-3.5 w-3.5 text-[#3F8697]/60 shrink-0" />
                <span>Cobros automáticos</span>
              </div>
            </div>
          </div>
        </button>

        {/* Professional card — disabled/coming soon */}
        <div
          className="w-full text-left rounded-2xl border border-white/[0.04] bg-neutral-900/50 opacity-50 cursor-not-allowed relative"
        >
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-400 text-[10px] font-semibold uppercase tracking-wide">
              Próximamente
            </span>
          </div>
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-neutral-700 to-neutral-600 flex items-center justify-center shrink-0">
                <Briefcase className="h-7 w-7 text-neutral-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-neutral-400">
                  Soy profesional
                </h3>
                <p className="text-sm text-neutral-500">
                  Publicá tu perfil y recibí propuestas
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-600">
                <Star className="h-3.5 w-3.5 text-neutral-600 shrink-0" />
                <span>Perfil profesional</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-600">
                <Briefcase className="h-3.5 w-3.5 text-neutral-600 shrink-0" />
                <span>Recibí propuestas</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-600">
                <CheckCircle2 className="h-3.5 w-3.5 text-neutral-600 shrink-0" />
                <span>Mostrá tu experiencia</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-600">
                <Rocket className="h-3.5 w-3.5 text-neutral-600 shrink-0" />
                <span>100% gratis siempre</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust signals */}
      <div className="flex items-center justify-center gap-5 sm:gap-6 mb-6">
        <span className="flex items-center gap-1.5 text-xs text-neutral-500">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/60 shrink-0" />
          Sin tarjeta de crédito
        </span>
        <span className="flex items-center gap-1.5 text-xs text-neutral-500">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/60 shrink-0" />
          Cancela cuando quieras
        </span>
      </div>

      <p className="text-sm text-neutral-500 text-center">
        ¿Ya tenés cuenta?{' '}
        <Link href={loginHref} className="text-[#4DA4B8] font-semibold hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );

  // ─── Offer Type Selection (Servicios vs Productos) ─────────
  const renderOfferTypeSelection = () => (
    <div className="w-full max-w-md px-4">
      <div className="text-center mb-6">
        <Link href="/" className="inline-block mb-5">
          <img src="/oscuro2.png" alt="TurnoLink" className="h-12 sm:h-14 mx-auto" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
          ¿Qué ofrece tu negocio?
        </h1>
        <p className="text-neutral-500 text-sm">
          Configuramos todo automáticamente
        </p>
      </div>

      <div className="space-y-3 mb-5 overflow-hidden">
        {/* Servicios — entra desde la derecha */}
        <button
          onClick={() => selectOfferType('services')}
          className="w-full rounded-xl border border-white/[0.06] bg-neutral-900/80 hover:bg-neutral-800/80 hover:border-[#3F8697]/40 transition-all duration-200 group animate-[slideFromRight_0.6s_cubic-bezier(0.16,1,0.3,1)_0.15s_both]"
        >
          <div className="flex items-center gap-4 p-4">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#3F8697] to-[#4DA4B8] flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <h3 className="font-semibold text-[15px] text-white group-hover:text-[#4DA4B8] transition-colors">
                Servicios, agenda y reservas
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Tus clientes reservan solos · Equipo, horarios y cobro automático
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-neutral-600 group-hover:text-[#4DA4B8] group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </button>

        {/* Gastronomía — entra desde abajo */}
        <button
          onClick={() => selectOfferType('gastronomia')}
          className="w-full rounded-xl border border-white/[0.06] bg-neutral-900/80 hover:bg-neutral-800/80 hover:border-orange-500/40 transition-all duration-200 group animate-[slideFromLeft_0.6s_cubic-bezier(0.16,1,0.3,1)_0.25s_both]"
        >
          <div className="flex items-center gap-4 p-4">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shrink-0">
              <UtensilsCrossed className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <h3 className="font-semibold text-[15px] text-white group-hover:text-orange-400 transition-colors">
                Gastronomía
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Carta digital · Reserva de mesas · Control de caja · WhatsApp
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-neutral-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </button>

        {/* Productos — entra desde la izquierda */}
        <button
          onClick={() => selectOfferType('products')}
          className="w-full rounded-xl border border-white/[0.06] bg-neutral-900/80 hover:bg-neutral-800/80 hover:border-amber-500/40 transition-all duration-200 group animate-[slideFromLeft_0.6s_cubic-bezier(0.16,1,0.3,1)_0.35s_both]"
        >
          <div className="flex items-center gap-4 p-4">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <h3 className="font-semibold text-[15px] text-white group-hover:text-amber-400 transition-colors">
                Tienda online y catálogo
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Catálogo con fotos · WhatsApp · Carrito · Checkout Mercado Pago
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-neutral-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </button>
      </div>

      {/* Trust */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <span className="text-[11px] text-neutral-600">Gratis para empezar</span>
        <span className="text-neutral-700">·</span>
        <span className="text-[11px] text-neutral-600">Sin tarjeta</span>
        <span className="text-neutral-700">·</span>
        <span className="text-[11px] text-neutral-600">2 minutos</span>
      </div>

      <p className="text-sm text-neutral-500 text-center">
        ¿Ya tenés cuenta?{' '}
        <Link href={loginHref} className="text-[#4DA4B8] font-medium hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );

  // ─── Rubro Selection (full-screen dark immersive) ──────────
  const renderRubroSelection = () => {
    const mainRubros = RUBROS.filter(r => r.key !== 'otro' && r.key !== 'mercado' && r.key !== 'gastronomia');
    const featuredRubros = mainRubros.filter(r => FEATURED_RUBRO_KEYS.has(r.key));
    const extraRubros = mainRubros.filter(r => !FEATURED_RUBRO_KEYS.has(r.key));
    const displayRubros = showAllRubros ? mainRubros : featuredRubros;

    return (
      <div className="w-full max-w-xl px-4">
        <div className="text-center mb-2">
          <Link href="/" className="inline-block mb-3">
            <img src="/oscuro2.png" alt="TurnoLink" className="h-14 sm:h-16 mx-auto" />
          </Link>
        </div>

        {/* Step indicator — 3 steps for services */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-[#3F8697] text-white">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-medium text-neutral-300 hidden sm:inline">Tipo</span>
          </div>
          <div className="h-0.5 w-8 rounded-full bg-[#3F8697]" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-[#3F8697] text-white ring-4 ring-[#3F8697]/20">
              2
            </div>
            <span className="text-sm font-medium text-neutral-300 hidden sm:inline">Rubro</span>
          </div>
          <div className="h-0.5 w-8 rounded-full bg-neutral-700" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-neutral-800 text-neutral-500">
              3
            </div>
            <span className="text-sm font-medium text-neutral-500 hidden sm:inline">Datos</span>
          </div>
        </div>

        <div className="text-center mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            ¿A qué se dedica tu negocio?
          </h1>
          <p className="text-neutral-400 mt-1.5 text-sm">
            Te pre-configuramos todo según tu rubro
          </p>
        </div>

        {/* Rubro Grid — glass cards on dark */}
        <div className="grid grid-cols-3 gap-2.5 mb-3">
          {displayRubros.map((rubro) => {
            const Icon = RUBRO_ICONS[rubro.key] || LayoutGrid;
            const isSelected = selectedRubro === rubro.key;
            return (
              <button
                key={rubro.key}
                onClick={() => setSelectedRubro(rubro.key)}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center',
                  isSelected
                    ? 'border-[#3F8697]/60 bg-[#3F8697]/10 shadow-md shadow-[#3F8697]/10'
                    : 'border-white/[0.06] bg-neutral-900/80 hover:bg-neutral-800/80 hover:border-neutral-700'
                )}
              >
                <div className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                  isSelected
                    ? 'bg-[#3F8697] text-white'
                    : 'bg-neutral-800 text-neutral-400'
                )}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span className={cn(
                  'text-xs font-medium leading-tight',
                  isSelected ? 'text-[#4DA4B8]' : 'text-neutral-300'
                )}>
                  {rubro.label}
                </span>
                {RUBRO_SUBTEXTS[rubro.key] && (
                  <span className="text-[10px] leading-tight text-neutral-500 -mt-0.5">
                    {RUBRO_SUBTEXTS[rubro.key]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* "Ver más" toggle */}
        {!showAllRubros && extraRubros.length > 0 && (
          <button
            onClick={() => setShowAllRubros(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 mb-3 text-sm font-medium text-[#4DA4B8] hover:text-white rounded-lg border border-[#3F8697]/30 bg-[#3F8697]/10 hover:bg-[#3F8697]/20 transition-all duration-200"
          >
            <ChevronDown className="h-4 w-4 animate-bounce" />
            Ver más rubros ({extraRubros.length})
          </button>
        )}

        {/* "Otro" button */}
        <button
          onClick={() => setSelectedRubro('otro')}
          className={cn(
            'w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all text-center mb-5',
            selectedRubro === 'otro'
              ? 'border-[#3F8697]/60 bg-[#3F8697]/10'
              : 'border-dashed border-neutral-700 bg-neutral-900/50 hover:border-neutral-600 hover:bg-neutral-800/50'
          )}
        >
          <LayoutGrid className={cn(
            'h-4 w-4',
            selectedRubro === 'otro' ? 'text-[#4DA4B8]' : 'text-neutral-500'
          )} />
          <span className={cn(
            'text-sm font-medium',
            selectedRubro === 'otro' ? 'text-[#4DA4B8]' : 'text-neutral-500'
          )}>
            Otro / No estoy seguro
          </span>
        </button>

        {/* Action buttons */}
        <div className="flex gap-3">
          {!intentParam && (
            <button
              onClick={goBackFromRubro}
              className="h-11 px-4 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors flex items-center gap-1.5 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>
          )}
          <Button
            onClick={() => setStep('form')}
            disabled={!selectedRubro}
            className="flex-1 h-11 bg-gradient-to-r from-[#3F8697] to-[#4DA4B8] hover:from-[#346E7D] hover:to-[#3F8697] disabled:opacity-30"
          >
            Continuar
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>

        <p className="text-sm text-neutral-500 text-center mt-5">
          ¿Ya tenés cuenta?{' '}
          <Link href={loginHref} className="text-[#4DA4B8] font-semibold hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    );
  };

  // ─── Sub-Rubro Selection (for products/mercado) ──────────
  const renderSubRubroSelection = () => {
    const isGastro = offerType === 'gastronomia';
    const sourceList = isGastro ? GASTRO_SUB_RUBROS : MERCADO_SUB_RUBROS;
    const filteredSubRubros = subRubroSearch
      ? sourceList.filter(r =>
          r.label.toLowerCase().includes(subRubroSearch.toLowerCase()) ||
          (r.subtitle || '').toLowerCase().includes(subRubroSearch.toLowerCase()))
      : sourceList;

    return (
      <div className="w-full max-w-xl px-4">
        <div className="text-center mb-2">
          <Link href="/" className="inline-block mb-3">
            <img src="/oscuro2.png" alt="TurnoLink" className="h-14 sm:h-16 mx-auto" />
          </Link>
        </div>

        {/* Step indicator — 3 steps for products */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-[#3F8697] text-white">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-medium text-neutral-300 hidden sm:inline">Tipo</span>
          </div>
          <div className="h-0.5 w-8 rounded-full bg-[#3F8697]" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-[#3F8697] text-white ring-4 ring-[#3F8697]/20">
              2
            </div>
            <span className="text-sm font-medium text-neutral-300 hidden sm:inline">{isGastro ? 'Local' : 'Tienda'}</span>
          </div>
          <div className="h-0.5 w-8 rounded-full bg-neutral-700" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-neutral-800 text-neutral-500">
              3
            </div>
            <span className="text-sm font-medium text-neutral-500 hidden sm:inline">Datos</span>
          </div>
        </div>

        <div className="text-center mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {isGastro ? '¿Qué tipo de local gastronómico?' : '¿Qué vendés?'}
          </h1>
          <p className="text-neutral-400 mt-1.5 text-sm">
            {isGastro
              ? 'Configuramos el menú, platos de ejemplo y ficha técnica según tu tipo de local'
              : 'Te configuramos filtros y ficha técnica según tu tipo de tienda'}
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input
            placeholder={isGastro ? 'Buscar tipo de local...' : 'Buscar tipo de tienda...'}
            value={subRubroSearch}
            onChange={(e) => setSubRubroSearch(e.target.value)}
            className="h-10 pl-9 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-[#3F8697] focus:ring-[#3F8697]"
          />
        </div>

        {/* Sub-rubro Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-5 max-h-[50vh] overflow-y-auto pr-1">
          {filteredSubRubros.map((sub) => {
            const Icon = sub.icon;
            const isSelected = selectedRubro === sub.key;
            return (
              <button
                key={sub.key}
                onClick={() => setSelectedRubro(sub.key)}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center',
                  isSelected
                    ? 'border-amber-500/60 bg-amber-500/10 shadow-md shadow-amber-500/10'
                    : 'border-white/[0.06] bg-neutral-900/80 hover:bg-neutral-800/80 hover:border-neutral-700'
                )}
              >
                <div className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                  isSelected
                    ? 'bg-amber-500 text-white'
                    : 'bg-neutral-800 text-neutral-400'
                )}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span className={cn(
                  'text-xs font-medium leading-tight',
                  isSelected ? 'text-amber-400' : 'text-neutral-300'
                )}>
                  {sub.label}
                </span>
                {sub.subtitle && (
                  <span className="text-[10px] leading-tight text-neutral-500 -mt-0.5">
                    {sub.subtitle}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {filteredSubRubros.length === 0 && (
          <p className="text-sm text-neutral-500 text-center mb-5">
            {isGastro
              ? 'No encontramos ese tipo de local. Elegí "Otro Gastro".'
              : 'No encontramos ese tipo de tienda. Elegí "Tienda General".'}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={goBackFromSubRubro}
            className="h-11 px-4 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors flex items-center gap-1.5 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          <Button
            onClick={() => setStep('form')}
            disabled={!selectedRubro}
            className="flex-1 h-11 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-30"
          >
            Continuar
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>

        <p className="text-sm text-neutral-500 text-center mt-5">
          ¿Ya tenés cuenta?{' '}
          <Link href={loginHref} className="text-[#4DA4B8] font-semibold hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    );
  };

  // ─── Business Form (dark immersive) ────────────────────────
  const renderBusinessForm = () => (
    <div className="w-full max-w-md px-4">
      <div className="text-center mb-2">
        <Link href="/" className="inline-block mb-3">
          <img src="/oscuro2.png" alt="TurnoLink" className="h-14 sm:h-16 mx-auto" />
        </Link>
      </div>

      {/* Step indicator (only when multi-step was shown) */}
      {!industryParam && (
        <div className="flex items-center justify-center gap-2 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-[#3F8697] text-white">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-medium text-neutral-300">Tipo</span>
          </div>
          <div className="h-0.5 w-10 rounded-full bg-[#3F8697]" />
          {(offerType === 'services' || offerType === 'products') && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-[#3F8697] text-white">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-medium text-neutral-300">
                  {offerType === 'products' ? 'Tienda' : 'Rubro'}
                </span>
              </div>
              <div className="h-0.5 w-10 rounded-full bg-[#3F8697]" />
            </>
          )}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-[#3F8697] text-white ring-4 ring-[#3F8697]/20">
              3
            </div>
            <span className="text-sm font-medium text-neutral-300">Datos</span>
          </div>
        </div>
      )}

      <div className="text-center mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Creá tu cuenta</h1>
        <p className="text-neutral-400 mt-1.5 text-sm">
          {offerType === 'products'
            ? 'Registrá tu catálogo y empezá a vender'
            : 'Registrá tu negocio y empezá a recibir reservas'}
        </p>
      </div>

      {/* Selected rubro badge */}
      {selectedRubroData && SelectedRubroIcon && (
        <div className="flex items-center justify-center mb-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#3F8697]/15 text-[#4DA4B8] text-xs font-medium">
            <SelectedRubroIcon className="h-3.5 w-3.5" />
            {selectedRubroData.label}
            {!industryParam && (
              <button
                type="button"
                onClick={() => setStep(offerType === 'products' ? 'sub-rubro' : 'rubro')}
                className="ml-1 text-[#4DA4B8]/60 hover:text-[#4DA4B8] underline"
              >
                Cambiar
              </button>
            )}
          </span>
        </div>
      )}

      <form onSubmit={handleBusinessSubmit} className="space-y-4">
        {errorBanner}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-neutral-300">Tu nombre</label>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              placeholder="Juan Pérez"
              value={businessForm.name}
              onChange={handleBusinessChange}
              required
              disabled={loading}
              className="h-11 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-[#3F8697] focus:ring-[#3F8697]"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-neutral-300">Email</label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              value={businessForm.email}
              onChange={handleBusinessChange}
              required
              disabled={loading}
              className="h-11 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-[#3F8697] focus:ring-[#3F8697]"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-neutral-300">Contraseña</label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              value={businessForm.password}
              onChange={handleBusinessChange}
              minLength={8}
              required
              disabled={loading}
              className="h-11 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-[#3F8697] focus:ring-[#3F8697] pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {/* Password requirements — visible while typing */}
          {businessForm.password.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
              {[
                { ok: businessForm.password.length >= 8, label: '8+ caracteres' },
                { ok: /[A-Z]/.test(businessForm.password), label: 'Mayúscula' },
                { ok: /[a-z]/.test(businessForm.password), label: 'Minúscula' },
                { ok: /\d/.test(businessForm.password), label: 'Número' },
              ].map(({ ok, label }) => (
                <span key={label} className={`flex items-center gap-1 text-[11px] transition-colors ${ok ? 'text-green-400' : 'text-neutral-500'}`}>
                  <CheckCircle2 className={`h-3 w-3 ${ok ? 'text-green-400' : 'text-neutral-600'}`} />
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="businessName" className="text-sm font-medium text-neutral-300">
            Nombre de tu negocio <span className="text-neutral-500 font-normal">(opcional)</span>
          </label>
          <Input
            id="businessName"
            name="businessName"
            autoComplete="organization"
            placeholder="Mi Barbería"
            value={businessForm.businessName}
            onChange={handleBusinessChange}
            disabled={loading}
            className="h-11 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-[#3F8697] focus:ring-[#3F8697]"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="businessSlug" className="text-sm font-medium text-neutral-300">
            URL de tu página <span className="text-neutral-500 font-normal">(opcional)</span>
          </label>
          <div className="flex items-center">
            <span className="text-sm text-neutral-500 bg-neutral-800 px-3 py-2.5 rounded-l-lg border border-r-0 border-neutral-700">
              turnolink.app/
            </span>
            <Input
              id="businessSlug"
              name="businessSlug"
              autoComplete="off"
              placeholder="mi-barberia"
              value={businessForm.businessSlug}
              onChange={handleBusinessChange}
              pattern="^[a-z0-9-]*$"
              disabled={loading}
              className="h-11 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 flex-1 rounded-l-none focus:border-[#3F8697] focus:ring-[#3F8697]"
            />
          </div>
          <p className="text-xs text-neutral-500">
            Solo letras minúsculas, números y guiones. Se genera automáticamente si lo dejás vacío.
          </p>
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-gradient-to-r from-[#3F8697] to-[#4DA4B8] hover:from-[#346E7D] hover:to-[#3F8697] mt-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-4 w-4" />
              Crear Cuenta Gratis
            </>
          )}
        </Button>

        <div className="flex items-center justify-between w-full pt-2">
          <button
            type="button"
            onClick={goBackFromForm}
            className="text-sm text-neutral-500 hover:text-white transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver
          </button>
          <p className="text-sm text-neutral-500">
            ¿Ya tenés cuenta?{' '}
            <Link href={loginHref} className="text-[#4DA4B8] font-medium hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </form>
    </div>
  );

  // ─── Professional Form (dark immersive) ────────────────────
  const renderProfessionalForm = () => (
    <div className="w-full max-w-md px-4">
      <div className="text-center mb-2">
        <Link href="/" className="inline-block mb-3">
          <img src="/oscuro2.png" alt="TurnoLink" className="h-14 sm:h-16 mx-auto" />
        </Link>
      </div>

      <div className="text-center mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Perfil profesional</h1>
        <p className="text-neutral-400 mt-1.5 text-sm">
          Creá tu perfil y empezá a recibir propuestas de trabajo
        </p>
      </div>

      <form onSubmit={handleProfessionalSubmit} className="space-y-4">
        {errorBanner}
        <div className="space-y-2">
          <label htmlFor="pro-name" className="text-sm font-medium text-neutral-300">Tu nombre completo</label>
          <Input
            id="pro-name"
            name="name"
            autoComplete="name"
            placeholder="Juan Pérez"
            value={professionalForm.name}
            onChange={handleProfessionalChange}
            required
            disabled={loading}
            className="h-11 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="pro-email" className="text-sm font-medium text-neutral-300">Email</label>
          <Input
            id="pro-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            value={professionalForm.email}
            onChange={handleProfessionalChange}
            required
            disabled={loading}
            className="h-11 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="pro-password" className="text-sm font-medium text-neutral-300">Contraseña</label>
          <div className="relative">
            <Input
              id="pro-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              value={professionalForm.password}
              onChange={handleProfessionalChange}
              minLength={8}
              required
              disabled={loading}
              className="h-11 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-emerald-500 focus:ring-emerald-500 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="pro-specialty" className="text-sm font-medium text-neutral-300">
            Especialidad <span className="text-neutral-500 font-normal">(opcional)</span>
          </label>
          <Input
            id="pro-specialty"
            name="specialty"
            autoComplete="organization-title"
            placeholder="Ej: Estilista, Masajista, Desarrollador..."
            value={professionalForm.specialty}
            onChange={handleProfessionalChange}
            disabled={loading}
            className="h-11 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 mt-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            <>
              <UserCog className="mr-2 h-4 w-4" />
              Crear Cuenta Gratis
            </>
          )}
        </Button>

        <div className="flex items-center justify-between w-full pt-2">
          {!intentParam && (
            <button
              type="button"
              onClick={() => { setIntent(null); setStep('intent'); setError(''); }}
              className="text-sm text-neutral-500 hover:text-white transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver
            </button>
          )}
          <p className={`text-sm text-neutral-500 ${intentParam ? 'w-full text-center' : ''}`}>
            ¿Ya tenés cuenta?{' '}
            <Link href={loginHref} className="text-[#4DA4B8] font-medium hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </form>
    </div>
  );

  // ─── All steps: full-screen dark immersive ─────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-950 to-neutral-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-5" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#3F8697]/15 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#3F8697]/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3F8697]/[0.04] rounded-full blur-3xl" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {step === 'intent' && renderIntentSelection()}
        {step === 'offer-type' && renderOfferTypeSelection()}
        {step === 'rubro' && renderRubroSelection()}
        {step === 'sub-rubro' && renderSubRubroSelection()}
        {step === 'form' && intent === 'business' && renderBusinessForm()}
        {step === 'form' && intent === 'professional' && renderProfessionalForm()}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
