'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api';
import { usePlanFeatures } from '@/lib/hooks/use-plan-features';
import {
  Calendar,
  LayoutDashboard,
  Scissors,
  Users,
  Clock,
  Settings,
  ExternalLink,
  Shield,
  ChevronDown,
  ChevronRight,
  Menu,
  HelpCircle,
  Home,
  UserCog,
  CreditCard,
  Building2,
  Crown,
  Mail,
  Star,
  Search,
  Send,
  Inbox,
  CalendarCheck,
  BarChart3,
  Code2,
  Briefcase,
  Video,
  GraduationCap,
  ClipboardList,
  UserCircle,
  UsersRound,
  FileText,
  FileBadge,
  CalendarDays,
  ShoppingBag,
  Package,
  Tag,
  Palette,
  Stethoscope,
  Sparkles,
  Dumbbell,
  BookOpen,
  BedDouble,
  Gift,
  Trophy,
  Ticket,
  Wallet,
  UtensilsCrossed,
  Truck,
  QrCode,
  MessageCircle,
  KeyRound,
  Landmark,
  HardHat,
  Receipt,
  Target,
  Banknote,
  ShieldCheck,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useGastroAlerts } from '@/lib/gastro-alerts-store';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useTenantConfig, useRubroTerms } from '@/contexts/tenant-config-context';
import { isMercadoRubro, isCatalogRubro, isGastronomiaRubro } from '@/lib/rubro-attributes';

/** Ícono contextual para "Servicios" según rubro — evita tijera en un consultorio médico */
const SERVICE_ICON_BY_RUBRO: Record<string, LucideIcon> = {
  'estetica-belleza': Scissors, barberia: Scissors, 'masajes-spa': Scissors, 'tatuajes-piercing': Scissors,
  salud: Stethoscope, odontologia: Stethoscope, psicologia: Stethoscope, nutricion: Stethoscope, veterinaria: Stethoscope,
  fitness: Dumbbell, deportes: Dumbbell,
  educacion: BookOpen, consultoria: Briefcase,
  hospedaje: BedDouble, alquiler: BedDouble, espacios: Building2, inmobiliarias: Building2,
};

function getServiceIcon(rubro: string): LucideIcon {
  return SERVICE_ICON_BY_RUBRO[rubro] || Scissors;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number | string;
  exact?: boolean;
  alertDot?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

const businessNavigationSections: NavSection[] = [
  {
    title: 'General',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Presupuestos', href: '/presupuestos', icon: FileBadge },
      { name: 'Reportes', href: '/reportes', icon: BarChart3 },
      { name: 'Finanzas', href: '/finanzas', icon: Wallet },
    ],
    defaultExpanded: true,
  },
  {
    title: 'Turnos',
    collapsible: true,
    defaultExpanded: true,
    items: [
      { name: 'Autogestión', href: '/autogestion', icon: CalendarCheck },
      { name: 'Turnos', href: '/turnos', icon: Calendar },
      { name: 'Servicios', href: '/servicios', icon: Scissors },
      { name: 'Empleados', href: '/empleados', icon: UserCog },
      { name: 'Especialidades', href: '/especialidades', icon: GraduationCap },
      { name: 'Formularios', href: '/formularios', icon: ClipboardList },
      { name: 'Sucursales', href: '/sucursales', icon: Building2 },
      { name: 'Clientes', href: '/clientes', icon: Users },
      { name: 'Horarios', href: '/horarios', icon: Clock },
    ],
  },
  {
    title: 'Catálogo',
    collapsible: true,
    defaultExpanded: true,
    items: [
      { name: 'Productos', href: '/catalogo', icon: ShoppingBag },
      { name: 'Categorías', href: '/categorias-productos', icon: Tag },
      { name: 'Pedidos', href: '/pedidos', icon: Package },
      { name: 'Mi Tienda', href: '/mi-tienda', icon: Palette },
    ],
  },
  {
    title: 'Salón',
    collapsible: true,
    defaultExpanded: true,
    items: [
      { name: 'Mesas', href: '/salon', icon: UtensilsCrossed },
      { name: 'Delivery / Llevar', href: '/pedidos-cocina', icon: Truck },
    ],
  },
  {
    title: 'Alquileres',
    collapsible: true,
    defaultExpanded: true,
    items: [
      { name: 'Panel', href: '/alquileres', icon: KeyRound, exact: true },
      { name: 'Contratos', href: '/alquileres/contratos', icon: FileText },
      { name: 'Propietarios', href: '/alquileres/propietarios', icon: Landmark },
      { name: 'Inquilinos', href: '/alquileres/inquilinos', icon: Users },
      { name: 'Gastos', href: '/alquileres/gastos', icon: Receipt },
      { name: 'Liquidaciones', href: '/alquileres/liquidaciones', icon: Wallet },
      { name: 'Garantías', href: '/alquileres/garantias', icon: ShieldCheck },
      { name: 'Ajustes', href: '/alquileres/ajustes', icon: TrendingUp },
    ],
  },
  {
    title: 'Comercial',
    collapsible: true,
    defaultExpanded: true,
    items: [
      { name: 'Leads', href: '/leads', icon: Target },
      { name: 'Señas', href: '/senas', icon: Banknote },
      { name: 'Documentos', href: '/documentos', icon: FileText },
    ],
  },
  {
    title: 'Desarrollos',
    collapsible: true,
    defaultExpanded: true,
    items: [
      { name: 'Proyectos', href: '/desarrollos', icon: HardHat },
    ],
  },
  {
    title: 'Fidelización',
    collapsible: false,
    items: [
      { name: 'Fidelización', href: '/fidelizacion', icon: Gift },
    ],
  },
  {
    title: 'Talento',
    collapsible: true,
    defaultExpanded: true,
    items: [
      { name: 'Explorar talento', href: '/talento', icon: Search, exact: true },
      { name: 'Mis propuestas', href: '/talento/propuestas', icon: Send },
      { name: 'Ofertas laborales', href: '/talento/ofertas', icon: Briefcase },
    ],
  },
  {
    title: 'Configuracion',
    collapsible: true,
    defaultExpanded: true,
    items: [
      { name: 'General', href: '/configuracion', icon: Settings },
      { name: 'Apariencia Web', href: '/configuracion/apariencia-inmobiliaria', icon: Building2 },
      { name: 'Pagos', href: '/pagos', icon: CreditCard },
      { name: 'Videollamadas', href: '/videollamadas', icon: Video },
      { name: 'Seguridad', href: '/seguridad', icon: Shield },
    ],
  },
  {
    title: 'Cuenta',
    collapsible: true,
    defaultExpanded: true,
    items: [
      { name: 'Mi Suscripción', href: '/mi-suscripcion', icon: Crown },
      { name: 'Verificar Email', href: '/verificar-cuenta', icon: Mail },
      { name: 'Reseñas', href: '/resenas', icon: Star },
      { name: 'Desarrolladores', href: '/integracion', icon: Code2 },
    ],
  },
];

const professionalNavigationSections: NavSection[] = [
  {
    title: 'General',
    items: [
      { name: 'Inicio', href: '/mi-perfil', icon: LayoutDashboard, exact: true },
      { name: 'Editar perfil', href: '/mi-perfil/editar', icon: UserCog },
    ],
    defaultExpanded: true,
  },
  {
    title: 'Oportunidades',
    collapsible: true,
    defaultExpanded: true,
    items: [
      { name: 'Ofertas laborales', href: '/mi-perfil/ofertas', icon: Briefcase },
      { name: 'Mis postulaciones', href: '/mi-perfil/postulaciones', icon: Send },
      { name: 'Propuestas recibidas', href: '/mi-perfil/propuestas', icon: Inbox },
    ],
  },
  {
    title: 'Cuenta',
    collapsible: true,
    items: [
      { name: 'Seguridad', href: '/seguridad', icon: Shield },
      { name: 'Verificar Email', href: '/verificar-cuenta', icon: Mail },
    ],
  },
];

function getEmployeeNavigationSections(employeeRole?: string | null): NavSection[] {
  const isManagerOrOwner = employeeRole === 'OWNER' || employeeRole === 'MANAGER';

  const sections: NavSection[] = [
    {
      title: 'Mi Portal',
      items: [
        { name: 'Mi Agenda', href: '/portal-empleado/agenda', icon: CalendarDays },
        { name: 'Mi Disponibilidad', href: '/portal-empleado/disponibilidad', icon: Clock },
        { name: 'Mi Perfil', href: '/portal-empleado/perfil', icon: UserCircle },
        { name: 'Mis Clientes', href: '/portal-empleado/clientes', icon: Users },
      ],
      defaultExpanded: true,
    },
  ];

  if (isManagerOrOwner) {
    sections.push({
      title: 'Gestión',
      collapsible: true,
      defaultExpanded: true,
      items: [
        { name: 'Mi Equipo', href: '/portal-empleado/equipo', icon: UsersRound },
        { name: 'Auditoría', href: '/portal-empleado/auditoria', icon: FileText },
      ],
    });
  }

  return sections;
}

function getNavigationSections(tenantType: string, clientLabel?: string, hiddenSections?: string[], labelOverrides?: Record<string, string>, userRole?: string, employeeRole?: string | null, iconOverrides?: Record<string, LucideIcon>): NavSection[] {
  if (userRole === 'EMPLOYEE') return getEmployeeNavigationSections(employeeRole);
  if (tenantType === 'PROFESSIONAL') return professionalNavigationSections;
  let sections = businessNavigationSections;
  // Apply dynamic label + icon overrides (Turnos, Servicios, Empleados, Clientes)
  const overrides: Record<string, string> = { ...labelOverrides };
  if (clientLabel && clientLabel !== 'Clientes') {
    overrides['/clientes'] = clientLabel;
  }
  const hasOverrides = Object.keys(overrides).length > 0 || (iconOverrides && Object.keys(iconOverrides).length > 0);
  if (hasOverrides) {
    sections = sections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        ...(overrides[item.href] ? { name: overrides[item.href] } : {}),
        ...(iconOverrides?.[item.href] ? { icon: iconOverrides[item.href] } : {}),
      })),
      // Also override section titles contextually
      title: section.title === 'Turnos' && overrides['/turnos']
        ? overrides['/turnos']
        : section.title === 'Catálogo' && overrides['/catalogo']
        ? overrides['/catalogo']
        : section.title,
    }));
  }
  // Filter out hidden sections
  if (hiddenSections && hiddenSections.length > 0) {
    sections = sections.map((section) => ({
      ...section,
      items: section.items.filter((item) => !hiddenSections.includes(item.href)),
    })).filter((section) => section.items.length > 0);
  }
  return sections;
}

function NavSectionComponent({
  section,
  pathname,
  expandedSections,
  toggleSection,
  onNavigate,
}: {
  section: NavSection;
  pathname: string;
  expandedSections: Record<string, boolean>;
  toggleSection: (title: string) => void;
  onNavigate?: () => void;
}) {
  const isExpanded = expandedSections[section.title] ?? section.defaultExpanded ?? true;
  const isItemActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/');
  const hasActiveItem = section.items.some(isItemActive);

  return (
    <div>
      {section.collapsible ? (
        <button
          onClick={() => toggleSection(section.title)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-md transition-colors',
            hasActiveItem && !isExpanded
              ? 'text-primary bg-primary/5'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
        >
          <span>{section.title}</span>
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>
      ) : (
        <h3 className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          {section.title}
        </h3>
      )}

      <div
        className={cn(
          'space-y-px overflow-hidden transition-all duration-200',
          isExpanded ? 'max-h-96 opacity-100 mt-0.5' : 'max-h-0 opacity-0'
        )}
      >
        {section.items.map((item) => {
          const isActive = isItemActive(item);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'group flex items-center px-3 py-1.5 text-[13px] font-medium rounded-lg transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className={cn(
                'mr-3 h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110',
                isActive && 'text-primary-foreground'
              )} />
              <span className="flex-1">{item.name}</span>
              {item.alertDot && (
                <span className="ml-auto h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
              )}
              {item.badge && (
                <Badge
                  variant={isActive ? 'secondary' : 'default'}
                  className={cn(
                    'ml-2 h-5 min-w-[20px] flex items-center justify-center text-xs',
                    isActive && 'bg-primary-foreground/20 text-primary-foreground'
                  )}
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  tenantSlug,
  tenantType,
  clientLabel,
  hiddenSections,
  labelOverrides,
  iconOverrides,
  badgeOverrides,
  userRole,
  employeeRole,
  subscriptionBlocked,
  onNavigate,
}: {
  pathname: string;
  tenantSlug: string | null;
  tenantType: string;
  clientLabel?: string;
  hiddenSections?: string[];
  labelOverrides?: Record<string, string>;
  iconOverrides?: Record<string, LucideIcon>;
  badgeOverrides?: Record<string, number>;
  userRole?: string;
  employeeRole?: string | null;
  subscriptionBlocked?: boolean;
  onNavigate?: () => void;
}) {
  const { planTier, isLoaded: planLoaded } = usePlanFeatures();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  let navigationSections = getNavigationSections(tenantType, clientLabel, hiddenSections, labelOverrides, userRole, employeeRole, iconOverrides);

  // Apply badge overrides (gastro alerts etc.)
  if (badgeOverrides && Object.keys(badgeOverrides).length > 0) {
    navigationSections = navigationSections.map((section) => ({
      ...section,
      items: section.items.map((item) =>
        badgeOverrides[item.href]
          ? { ...item, badge: badgeOverrides[item.href], alertDot: true }
          : item,
      ),
    }));
  }

  // Add red alert dot to "Mi Suscripción" when subscription is blocked
  if (subscriptionBlocked) {
    navigationSections = navigationSections.map((section) => ({
      ...section,
      items: section.items.map((item) =>
        item.href === '/mi-suscripcion' ? { ...item, alertDot: true } : item,
      ),
    }));
  }
  const isEmployee = userRole === 'EMPLOYEE';
  const isProfessional = tenantType === 'PROFESSIONAL';
  const logoHref = isEmployee ? '/portal-empleado/agenda' : isProfessional ? '/mi-perfil' : '/dashboard';

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !(prev[title] ?? navigationSections.find(s => s.title === title)?.defaultExpanded ?? true),
    }));
  };

  const handleLinkClick = () => {
    // Close mobile menu when navigating
    onNavigate?.();
  };

  // Scroll state for fade indicators
  const navRef = useRef<HTMLElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    const threshold = 4;
    setCanScrollUp(el.scrollTop > threshold);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - threshold);
  }, []);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    // Also watch resize for layout changes
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState]);

  // Re-check scroll state when sections expand/collapse
  useEffect(() => {
    // Small delay to let the collapse animation finish
    const timer = setTimeout(updateScrollState, 250);
    return () => clearTimeout(timer);
  }, [expandedSections, updateScrollState]);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-[4.5rem] px-4 border-b border-border/50 shrink-0">
        <Link
          href={logoHref}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          onClick={handleLinkClick}
        >
          <img
            src="/claro2.png"
            alt="TurnoLink"
            className="h-14 w-auto dark:hidden"
          />
          <img
            src="/oscuro2.png"
            alt="TurnoLink"
            className="h-14 w-auto hidden dark:block"
          />
        </Link>
      </div>

      {/* Navigation with scroll */}
      <div className="relative flex-1 min-h-0">
        {/* Top fade indicator */}
        <div
          className={cn(
            'absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none transition-opacity duration-200',
            canScrollUp ? 'opacity-100' : 'opacity-0'
          )}
        />

        <nav
          ref={navRef}
          className="h-full px-3 py-3 space-y-3 overflow-y-auto scroll-smooth overscroll-contain sidebar-scroll"
        >
          {navigationSections.map((section) => (
            <NavSectionComponent
              key={section.title}
              section={section}
              pathname={pathname}
              expandedSections={expandedSections}
              toggleSection={toggleSection}
              onNavigate={handleLinkClick}
            />
          ))}
        </nav>

        {/* Bottom fade indicator */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none transition-opacity duration-200',
            canScrollDown ? 'opacity-100' : 'opacity-0'
          )}
        />
      </div>

      {/* Upgrade Banner - Free plan only */}
      {planLoaded && planTier === 'free' && (
        <div className="px-3 pb-2 shrink-0">
          <Link
            href="/mi-suscripcion"
            onClick={handleLinkClick}
            className="block p-3 rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 dark:from-violet-500/20 dark:to-fuchsia-500/20 border border-violet-200/50 dark:border-violet-800/30 hover:border-violet-300 dark:hover:border-violet-700 transition-all group"
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-violet-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">Mejorá tu plan</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Desbloqueá cobros online, stock, emails, reportes y más.
            </p>
          </Link>
        </div>
      )}

      {/* Bottom Section */}
      <div className="border-t px-3 py-2 space-y-px shrink-0">
        {!isProfessional && tenantSlug && (
          <Link
            href={`/${tenantSlug}`}
            target="_blank"
            className="flex items-center px-3 py-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors group"
            onClick={handleLinkClick}
          >
            <ExternalLink className="mr-3 h-4 w-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
            Ver mi página
          </Link>
        )}
        <Link
          href="/ayuda"
          className="flex items-center px-3 py-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors group"
          onClick={handleLinkClick}
        >
          <HelpCircle className="mr-3 h-4 w-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
          Ayuda
        </Link>
      </div>
    </div>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const { data: session } = useSession();
  const tenantType = session?.user?.tenantType || 'BUSINESS';
  const userRole = session?.user?.role;
  const employeeRole = session?.user?.employeeRole;
  const isEmployee = userRole === 'EMPLOYEE';
  const isProfessional = tenantType === 'PROFESSIONAL';
  const { clientLabelPlural, hiddenSections, rubro, storeType } = useTenantConfig();
  const terms = useRubroTerms();

  // Dynamic hidden sections based on rubro + storeType
  const isMercado = isCatalogRubro(rubro);
  const isEcommerce = storeType === 'ecommerce';
  const isGastro = isGastronomiaRubro(rubro);

  // Build dynamic label overrides for sidebar items
  const labelOverrides: Record<string, string> = {};
  if (terms.bookingPlural !== 'Turnos') labelOverrides['/turnos'] = terms.bookingPlural;
  if (terms.servicePlural !== 'Servicios') labelOverrides['/servicios'] = terms.servicePlural;
  if (terms.employeePlural !== 'Empleados') labelOverrides['/empleados'] = terms.employeePlural;
  if (isGastro) {
    labelOverrides['/catalogo'] = 'Carta';
    labelOverrides['/categorias-productos'] = 'Categorías';
    labelOverrides['/turnos'] = 'Reservas';
    labelOverrides['/empleados'] = 'Mozos / Staff';
  } else if (isMercadoRubro(rubro)) {
    labelOverrides['/autogestion'] = 'Punto de Venta';
    labelOverrides['/turnos'] = 'Ventas';  // Rename section title for mercado
  } else if (rubro === 'inmobiliarias') {
    labelOverrides['/catalogo'] = 'Propiedades';
    labelOverrides['/configuracion/apariencia-inmobiliaria'] = 'Apariencia Web';
  }

  // Build dynamic icon overrides per rubro
  const iconOverrides: Record<string, LucideIcon> = {};
  const svcIcon = getServiceIcon(rubro);
  if (svcIcon !== Scissors) iconOverrides['/servicios'] = svcIcon;

  // Sections only for full ecommerce mode (branding page)
  const ECOMMERCE_ONLY = ['/mi-tienda'];
  // Sections for any mercado tenant (catalogo + ecommerce)
  const MERCADO_SECTIONS = ['/catalogo', '/categorias-productos', '/pedidos'];
  // All mercado sections
  const ALL_MERCADO = [...MERCADO_SECTIONS, ...ECOMMERCE_ONLY];

  let effectiveHiddenSections: string[];
  if (isMercado && isEcommerce) {
    // Ecommerce: show everything (catalogo, categorias, pedidos, mi-tienda, reportes). Hide /servicios (uses /catalogo)
    effectiveHiddenSections = [...hiddenSections.filter((s) => ![...ALL_MERCADO, '/reportes'].includes(s)), '/servicios'];
  } else if (isMercado) {
    // Catalogo: show products, categories, orders, reportes. Hide Mi Tienda, /servicios, and service-only items
    const catalogHidden = [
      ...ECOMMERCE_ONLY,
      '/servicios',
      '/turnos',          // mercado doesn't have bookings/turnos
      '/horarios',        // mercado doesn't need schedule management
      '/especialidades',  // mercado doesn't have specialties
      '/formularios',     // mercado doesn't need intake forms
    ];
    // Rubros that don't use orders/pedidos (inmobiliarias sells via WhatsApp, not cart)
    const RUBROS_SIN_PEDIDOS = ['inmobiliarias'];
    if (RUBROS_SIN_PEDIDOS.includes(rubro)) catalogHidden.push('/pedidos');
    effectiveHiddenSections = Array.from(new Set([
      ...hiddenSections.filter((s) => !MERCADO_SECTIONS.includes(s) && s !== '/reportes'),
      ...catalogHidden,
    ]));
  } else {
    // Not mercado: hide all catalog/ecommerce sections
    effectiveHiddenSections = Array.from(new Set([...hiddenSections, ...ALL_MERCADO, ...ECOMMERCE_ONLY]));
  }

  // Gastro-specific: hide irrelevant sections, keep what makes sense
  if (isGastro) {
    const GASTRO_HIDDEN = [
      '/presupuestos',     // restaurantes no hacen presupuestos
      '/videollamadas',    // no aplica
      '/formularios',      // no aplica
      '/especialidades',   // no aplica
      '/pedidos',          // pedidos de salón van por otro sistema (TableSessionOrder)
      '/mi-tienda',        // no es ecommerce
      '/servicios',        // no aplica, la carta es el catálogo
      '/integracion',      // desarrolladores no aplica a gastro
      '/autogestion',      // autogestión es para turnos/ventas, el salón ya tiene su dashboard
      '/talento',          // ofertas laborales no aplica a gastro
      '/talento/propuestas',
      '/talento/ofertas',
    ];
    effectiveHiddenSections = Array.from(new Set([...effectiveHiddenSections, ...GASTRO_HIDDEN]));
    // Remove items that isCatalogRubro might have hidden but gastro needs
    effectiveHiddenSections = effectiveHiddenSections.filter(s =>
      s !== '/turnos' && s !== '/horarios' && s !== '/catalogo' && s !== '/categorias-productos'
    );
  }

  // Hide Salón section (Mesas + Delivery/Llevar) for non-gastronomia rubros
  if (rubro !== 'gastronomia') {
    effectiveHiddenSections = Array.from(new Set([...effectiveHiddenSections, '/salon', '/pedidos-cocina']));
  }

  // Hide Alquileres + Desarrollos for non-inmobiliarias rubros
  if (rubro !== 'inmobiliarias') {
    const INMOBILIARIA_SECTIONS = ['/alquileres', '/alquileres/contratos', '/alquileres/propietarios', '/alquileres/inquilinos', '/alquileres/gastos', '/alquileres/liquidaciones', '/alquileres/garantias', '/alquileres/ajustes', '/desarrollos', '/leads', '/senas', '/documentos', '/configuracion/apariencia-inmobiliaria'];
    effectiveHiddenSections = Array.from(new Set([...effectiveHiddenSections, ...INMOBILIARIA_SECTIONS]));
  }

  // Hide Fidelización section for alquiler rubro
  const FIDELIZACION_SECTIONS = ['/fidelizacion', '/fidelizacion/clientes', '/fidelizacion/niveles', '/fidelizacion/recompensas', '/fidelizacion/canjes', '/fidelizacion/cupones', '/fidelizacion/sorteos', '/fidelizacion/configuracion'];
  if (rubro === 'alquiler' || rubro === 'hospedaje') {
    effectiveHiddenSections = Array.from(new Set([...effectiveHiddenSections, ...FIDELIZACION_SECTIONS]));
  }

  const [subscriptionBlocked, setSubscriptionBlocked] = useState(false);

  // Fetch tenant slug and subscription status
  useEffect(() => {
    const fetchTenantData = async () => {
      if (!session?.accessToken) return;
      try {
        const api = createApiClient(session.accessToken as string);
        const [tenant, subStatus] = await Promise.allSettled([
          api.getTenant(),
          api.getSubscriptionStatus(),
        ]);
        if (tenant.status === 'fulfilled') {
          setTenantSlug(tenant.value.slug);
        }
        if (subStatus.status === 'fulfilled') {
          const status = subStatus.value.status;
          setSubscriptionBlocked(
            status === 'PAST_DUE' || status === 'EXPIRED' || status === 'TRIAL_EXPIRED',
          );
        }
      } catch {
        // Silently fail
      }
    };
    fetchTenantData();
  }, [session?.accessToken]);

  // Gastro alert badges
  const gastroAlerts = useGastroAlerts();
  const badgeOverrides: Record<string, number> = {};
  if (isGastro) {
    const salonAlerts = gastroAlerts.billsRequested + gastroAlerts.waitingPayment;
    if (salonAlerts > 0) badgeOverrides['/salon'] = salonAlerts;
    if (gastroAlerts.pendingOrders > 0) badgeOverrides['/pedidos-cocina'] = gastroAlerts.pendingOrders;
  }

  // Close mobile menu and scroll to top when pathname changes
  useEffect(() => {
    setMobileOpen(false);
    // Scroll to top when navigating to a new page
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  // Handle closing mobile menu
  const handleMobileNavigate = () => {
    setMobileOpen(false);
  };

  // Mobile bottom nav items based on tenant type and role
  const mobileNavItems = isEmployee
    ? [
        { name: 'Agenda', href: '/portal-empleado/agenda', icon: CalendarDays },
        { name: 'Horarios', href: '/portal-empleado/disponibilidad', icon: Clock },
        { name: 'Perfil', href: '/portal-empleado/perfil', icon: UserCircle },
        { name: 'Clientes', href: '/portal-empleado/clientes', icon: Users },
        { name: 'Menu', href: '#menu', icon: Menu, isMenu: true },
      ]
    : isProfessional
    ? [
        { name: 'Inicio', href: '/mi-perfil', icon: Home, exact: true },
        { name: 'Ofertas', href: '/mi-perfil/ofertas', icon: Briefcase },
        { name: 'Postulaciones', href: '/mi-perfil/postulaciones', icon: Send },
        { name: 'Propuestas', href: '/mi-perfil/propuestas', icon: Inbox },
        { name: 'Menu', href: '#menu', icon: Menu, isMenu: true },
      ]
    : isEcommerce
    ? [
        { name: 'Inicio', href: '/dashboard', icon: Home },
        { name: 'Productos', href: '/catalogo', icon: ShoppingBag },
        { name: 'Pedidos', href: '/pedidos', icon: Package },
        { name: 'Mi Tienda', href: '/mi-tienda', icon: Palette },
        { name: 'Menu', href: '#menu', icon: Menu, isMenu: true },
      ]
    : isGastro
    ? [
        { name: 'Inicio', href: '/dashboard', icon: Home },
        { name: 'Salón', href: '/salon', icon: UtensilsCrossed },
        { name: 'Pedidos', href: '/pedidos-cocina', icon: Truck },
        { name: 'Carta', href: '/catalogo', icon: ShoppingBag },
        { name: 'Menu', href: '#menu', icon: Menu, isMenu: true },
      ]
    : isMercado
    ? [
        { name: 'Inicio', href: '/dashboard', icon: Home },
        ...(rubro === 'inmobiliarias'
          ? [{ name: 'Alquileres', href: '/alquileres', icon: KeyRound }]
          : [{ name: 'Ventas', href: '/autogestion', icon: CalendarCheck }]
        ),
        { name: rubro === 'inmobiliarias' ? 'Propiedades' : 'Productos', href: '/catalogo', icon: ShoppingBag },
        { name: clientLabelPlural || 'Clientes', href: '/clientes', icon: Users },
        { name: 'Menu', href: '#menu', icon: Menu, isMenu: true },
      ]
    : [
        { name: 'Inicio', href: '/dashboard', icon: Home },
        { name: terms.bookingPlural, href: '/turnos', icon: Calendar },
        { name: terms.servicePlural, href: '/servicios', icon: getServiceIcon(rubro) },
        { name: clientLabelPlural || 'Clientes', href: '/clientes', icon: Users },
        { name: 'Menu', href: '#menu', icon: Menu, isMenu: true },
      ];

  const mobileGridCols = 'grid-cols-5';

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        data-tour="sidebar"
        className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex md:w-64 md:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col"
      >
        <div className="flex flex-col flex-1 overflow-hidden bg-background border-r">
          <SidebarContent pathname={pathname} tenantSlug={tenantSlug} tenantType={tenantType} clientLabel={clientLabelPlural} hiddenSections={effectiveHiddenSections} labelOverrides={labelOverrides} iconOverrides={iconOverrides} badgeOverrides={badgeOverrides} userRole={userRole} employeeRole={employeeRole} subscriptionBlocked={subscriptionBlocked} />
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav
        data-tour="mobile-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-40 safe-area-bottom"
      >
        <div className={`grid ${mobileGridCols} h-16`}>
          {mobileNavItems.map((item) => {
            if (item.isMenu) {
              return (
                <Sheet key={item.name} open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild>
                    <button
                      data-tour="mobile-menu-button"
                      className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground"
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="text-[10px] font-medium">{item.name}</span>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-72 overflow-hidden">
                    <SidebarContent
                      pathname={pathname}
                      tenantSlug={tenantSlug}
                      tenantType={tenantType}
                      clientLabel={clientLabelPlural}
                      hiddenSections={effectiveHiddenSections}
                      labelOverrides={labelOverrides}
                      iconOverrides={iconOverrides}
                      badgeOverrides={badgeOverrides}
                      userRole={userRole}
                      employeeRole={employeeRole}
                      subscriptionBlocked={subscriptionBlocked}
                      onNavigate={handleMobileNavigate}
                    />
                  </SheetContent>
                </Sheet>
              );
            }

            const isActive = item.exact
              ? pathname === item.href
              : (pathname === item.href || pathname.startsWith(item.href + '/'));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <div className={cn(
                  'p-1.5 rounded-lg transition-colors relative',
                  isActive && 'bg-primary/10'
                )}>
                  <item.icon className="h-5 w-5" />
                  {badgeOverrides[item.href] && badgeOverrides[item.href] > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-1 animate-pulse">
                      {badgeOverrides[item.href]}
                    </span>
                  )}
                </div>
                <span className={cn(
                  'text-[10px] font-medium',
                  isActive && 'text-primary'
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

    </>
  );
}
